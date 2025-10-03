// lib/supabase/server.ts
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Works in App Router server contexts (Server Components, Route Handlers). */
export async function createServer(readWrite = false): Promise<SupabaseClient> {
  // Next 14 (sync) vs Next 15 (async) cookies() compatibility:
  const storeOrPromise = (nextCookies as unknown as () => any)();
  const cookieStore =
    storeOrPromise && typeof storeOrPromise.then === "function"
      ? await storeOrPromise
      : storeOrPromise;

  const hasSet = typeof cookieStore?.set === "function";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore?.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (readWrite && hasSet) cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          if (readWrite && hasSet) cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );
}
