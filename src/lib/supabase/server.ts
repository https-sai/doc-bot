// lib/supabase/server.ts
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Works in App Router server contexts (Server Components, Route Handlers). */
export async function createServer(readWrite = false): Promise<SupabaseClient> {
  // Next 14 (sync) vs Next 15 (async) cookies() compatibility:
  const storeOrPromise = (nextCookies as unknown as () => unknown)();
  const cookieStore =
    storeOrPromise && typeof (storeOrPromise as { then?: unknown }).then === "function"
      ? await (storeOrPromise as Promise<unknown>)
      : storeOrPromise;

  const hasSet = typeof (cookieStore as { set?: unknown })?.set === "function";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return (cookieStore as { get?: (name: string) => { value?: string } })?.get?.(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (readWrite && hasSet) (cookieStore as { set: (options: { name: string; value: string } & CookieOptions) => void }).set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          if (readWrite && hasSet) (cookieStore as { set: (options: { name: string; value: string } & CookieOptions) => void }).set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );
}
