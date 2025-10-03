// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { embeddings } from "@/lib/embeddings";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { agentId, message } = await req.json();
  if (!agentId || !message) {
    return NextResponse.json({ error: "agentId & message required" }, { status: 400 });
  }

  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // RAG: embed + retrieve context (unchanged)
  const qvec = (await embeddings.embedDocuments([message]))[0];
  const { data: hits, error } = await supabase.rpc("match_chunks", {
    query_embedding: qvec as any,
    in_agent_id: agentId,
    match_count: 8,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const context = (hits || []).map((h: any) => `• ${h.text}`).join("\n\n");

  // Stream with v3
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful documentation assistant. Use the provided CONTEXT to answer. If unsure, say you don't know.",
    prompt: `CONTEXT:\n${context}\n\nQUESTION: ${message}`,
  });

  return result.toTextStreamResponse(); // ⬅️ replaces StreamingTextResponse
}
