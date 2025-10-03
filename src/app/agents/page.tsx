// app/agents/page.tsx
import Link from "next/link";
import { createServer } from "@/lib/supabase/server";
import { createService } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function AgentsPage() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Agents</h1>
      <form action={createAgent} className="flex gap-2">
        <input
          name="name"
          placeholder="e.g. TailwindCSS"
          className="border px-3 py-2 rounded w-full"
        />
        <button className="button">Create</button>
      </form>
      <ul className="space-y-2">
        {agents?.map((a) => (
          <li
            key={a.id}
            className="border rounded p-3 flex items-center justify-between"
          >
            <div className="font-medium">{a.name}</div>
            <Link className="underline" href={`/agents/${a.id}`}>
              Open
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

async function createAgent(formData: FormData) {
  "use server";
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  const admin = createService();
  await admin.from("agents").insert({ name, user_id: user.id });
}
