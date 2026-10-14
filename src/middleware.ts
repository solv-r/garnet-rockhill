import { NextRequest, NextResponse } from "next/server";

const jwtExp = (t?: string) => { try { return JSON.parse(atob((t ?? "").split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).exp as number; } catch { return 0; } };

/** Keeps staff signed in: if the access token is missing/near expiry and a refresh token exists, exchange it and set fresh cookies. Never blocks the request on failure. */
async function refreshSession(req: NextRequest): Promise<NextResponse | null> {
  const rt = req.cookies.get("rh_rt")?.value; if (!rt) return null;
  const exp = jwtExp(req.cookies.get("rh_at")?.value); if (exp - Date.now() / 1000 > 120) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!base || !key) return null;
  try {
    const r = await fetch(`${base}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: rt }) });
    if (!r.ok) { const res = NextResponse.next(); res.cookies.delete("rh_rt"); return res; }
    const t = (await r.json()) as { access_token: string; refresh_token: string; expires_in: number };
    req.cookies.set("rh_at", t.access_token); req.cookies.set("rh_rt", t.refresh_token);
    const res = NextResponse.next({ request: req }); const o = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
    res.cookies.set("rh_at", t.access_token, { ...o, maxAge: t.expires_in }); res.cookies.set("rh_rt", t.refresh_token, { ...o, maxAge: 60 * 60 * 24 * 14 });
    return res;
  } catch { return null; }
}

// One deployment, two brands: homes.* hosts are rewritten to /homes/*.
export async function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) return (await refreshSession(req)) ?? NextResponse.next();
  const isHomes = host.startsWith("homes.");
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return NextResponse.next();
  if (isHomes && !pathname.startsWith("/homes")) {
    const url = req.nextUrl.clone(); url.pathname = "/homes" + (pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(url);
  }
  if (!isHomes && pathname.startsWith("/homes")) return new NextResponse("Not found", { status: 404 });
  return NextResponse.next();
}
export const config = { matcher: ["/((?!.*\\..*).*)"] };
