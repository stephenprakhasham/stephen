import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard admin surfaces. Public storefront stays untouched.
  const guardsAdmin =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!guardsAdmin) return NextResponse.next();

  if (isPublicAdminPath(pathname)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, block admin entirely rather than fail open.
  if (!url || !anonKey) {
    const dest = req.nextUrl.clone();
    dest.pathname = "/admin/login";
    dest.searchParams.set("error", "not_configured");
    return NextResponse.redirect(dest);
  }

  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value } of cookiesToSet) {
          req.cookies.set(name, value);
        }
        response = NextResponse.next({ request: req });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }
    const dest = req.nextUrl.clone();
    dest.pathname = "/admin/login";
    dest.searchParams.set("next", pathname);
    return NextResponse.redirect(dest);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};