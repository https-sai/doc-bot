"use client";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();

  async function signInMagic() {
    const email = prompt("Your email:");
    if (!email) return;
    await supabase.auth.signInWithOtp({
      email,
      options: {
        // Send the magic link back to our callback route
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    alert("Check your email for the magic link!");
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Docs Copilot</h1>
      <button onClick={signInMagic} className="button">
        Sign in via magic link
      </button>
    </main>
  );
}
