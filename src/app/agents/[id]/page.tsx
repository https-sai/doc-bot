// app/agents/[id]/page.tsx
import { createServer } from "@/lib/supabase/server";
import { ChatPanel } from "@/components/chat-panel";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AgentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: agent } = await supabase
    .from("agents")
    .select("id, name")
    .eq("id", params.id)
    .single();
  if (!agent) return <div className="p-6">Not found</div>;

  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("agent_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{agent.name}</h1>
      <form action={ingest} className="flex gap-2">
        <input
          name="url"
          placeholder="Paste docs URL to index"
          className="border px-3 py-2 rounded w-full"
        />
        <input type="hidden" name="agentId" value={agent.id} />
        <button className="px-4 py-2 rounded bg-black text-white">
          Ingest
        </button>
      </form>
      <ChatPanel agentId={agent.id} initialMessages={messages || []} />
    </main>
  );
}

async function ingest(formData: FormData) {
  "use server";

  const url = String(formData.get("url") || "").trim();
  const agentId = String(formData.get("agentId") || "");
  if (!url) return;

  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  await fetch(`${base}/api/ingest`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ agentId, url }),
    cache: "no-store",
  });

  revalidatePath(`/agents/${agentId}`);
}
