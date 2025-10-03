// app/api/ingest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { createService } from "@/lib/supabase/admin";
import { crawlSeed } from "@/lib/crawl";
import { chunkText } from "@/lib/chunk";
import { embeddings } from "@/lib/embeddings";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { agentId, url } = await req.json();
    if (!agentId || !url) return NextResponse.json({ error: "agentId and url required" }, { status: 400 });

    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { data: agent } = await supabase.from("agents").select("id").eq("id", agentId).single();
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const pages = await crawlSeed(url, 8);

    const admin = createService();
    const { data: doc, error: dErr } = await admin
      .from("documents").insert({ agent_id: agentId, source_url: url }).select().single();
    if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });

    for (const p of pages) {
      const parts = await chunkText(p.content);
      const vecs = await embeddings.embedDocuments(parts);
      const rows = parts.map((text, i) => ({ document_id: doc.id, text, embedding: vecs[i] as number[] }));
      const { error } = await admin.from("chunks").insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, documentId: doc.id, pages: pages.length });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error occurred';
    return NextResponse.json({ error }, { status: 500 });
  }
}
