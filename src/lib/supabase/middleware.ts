import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/supabase";

/**
 * Kunderejsen er ClicknContents, ikke klinikkens, og den må ikke afsløre sin
 * egen eksistens. Derfor sendes den IKKE til login som resten af /admin:
 * siden svarer selv 404 til alle, der ikke har rollen, hvad enten de er
 * logget ind eller ej. Se src/app/admin/kunderejse/page.tsx.
 */
const SKJULT_PRAEFIKS = "/admin/kunderejse";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, never 500 the whole site. Let public routes
  // through and fail closed on protected /admin routes by sending to login.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      request.nextUrl.pathname !== "/admin/login" &&
      !request.nextUrl.pathname.startsWith(SKJULT_PRAEFIKS)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // refreshing the auth token
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Treat auth errors as "not logged in" rather than crashing middleware.
    user = null;
  }

  // Admin route protection
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith(SKJULT_PRAEFIKS)
  ) {
    // If not logged in and not on the login page, redirect to login
    if (!user && request.nextUrl.pathname !== "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    // If logged in and on the login page, redirect to dashboard
    if (user && request.nextUrl.pathname === "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
