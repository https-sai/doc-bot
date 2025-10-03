// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

/**
 * Handles magic-link + OAuth redirects.
 * Exchanges the `code` for a session and sets auth cookies server-side.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    // IMPORTANT: allow cookie writes here
    const supabase = await createServer(true);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/?auth_error=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }
  }

  // Where to send users after login
  return NextResponse.redirect(new URL("/agents", request.url));
}
