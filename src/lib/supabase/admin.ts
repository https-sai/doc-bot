// lib/supabase/admin.ts
// Do not import this from client code.
import type { SupabaseClient } from "@supabase/supabase-js";

// lazy require to avoid bundling in client
export function createService(): SupabaseClient {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
