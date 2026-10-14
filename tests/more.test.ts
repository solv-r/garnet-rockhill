import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { NextRequest } from "next/server";
import { processImage } from "../src/lib/images";
import { middleware } from "../src/middleware";
import { rateLimited } from "../src/lib/enquiry";

const mkFile = (buf: Buffer, name = "x.jpg", type = "image/jpeg") => new File([new Uint8Array(buf)], name, { type });
describe("image processing", () => {
  it("re-encodes a real JPEG to WebP and strips metadata", async () => {
    const jpg = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#888" } }).jpeg().withExif({ IFD0: { Copyright: "x" } }).toBuffer();
    const out = await processImage(mkFile(jpg));
    const meta = await sharp(out).metadata();
    expect(meta.format).toBe("webp"); expect(meta.width).toBeLessThanOrEqual(2000); expect(meta.exif).toBeUndefined();
  });
  it("rejects a text file renamed to .jpg", async () => { await expect(processImage(mkFile(Buffer.from("<script>alert(1)</script>")))).rejects.toThrow(/JPEG, PNG or WebP/); });
  it("rejects oversize files", async () => { await expect(processImage(mkFile(Buffer.alloc(7 * 1024 * 1024)))).rejects.toThrow(/6 MB/); });
});
describe("host routing", () => {
  const run = async (host: string, path: string, cookie = "") => middleware(new NextRequest(`http://${host}${path}`, { headers: { host, ...(cookie ? { cookie } : {}) } }));
  it("rewrites homes host to /homes", async () => { expect((await run("homes.garnetrockhill.com", "/properties")).headers.get("x-middleware-rewrite")).toContain("/homes/properties"); });
  it("serves corporate on the main host unchanged", async () => { expect((await run("garnetrockhill.com", "/about")).headers.get("x-middleware-rewrite")).toBeNull(); });
  it("hides /homes on the corporate host", async () => { expect((await run("garnetrockhill.com", "/homes")).status).toBe(404); });
  it("leaves admin and api alone", async () => { expect((await run("homes.garnetrockhill.com", "/admin")).headers.get("x-middleware-rewrite")).toBeNull(); });
  it("refreshes an expired admin session and sets new cookies", async () => {
    const realFetch = globalThis.fetch; process.env.NEXT_PUBLIC_SUPABASE_URL = "http://sb.test"; process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    globalThis.fetch = (async () => new Response(JSON.stringify({ access_token: "NEWAT", refresh_token: "NEWRT", expires_in: 3600 }), { status: 200 })) as typeof fetch;
    try { const res = await run("garnetrockhill.com", "/admin/properties", "rh_rt=oldrt"); const set = res.headers.get("set-cookie") ?? ""; expect(set).toContain("rh_at=NEWAT"); expect(set).toContain("rh_rt=NEWRT"); expect(set.toLowerCase()).toContain("httponly"); }
    finally { globalThis.fetch = realFetch; }
  });
  it("does not call the auth server when the token is still fresh", async () => {
    const realFetch = globalThis.fetch; let called = false; globalThis.fetch = (async () => { called = true; return new Response("{}"); }) as typeof fetch;
    const exp = Math.floor(Date.now() / 1000) + 3000; const tok = `x.${btoa(JSON.stringify({ exp }))}.y`;
    try { await run("garnetrockhill.com", "/admin", `rh_at=${tok}; rh_rt=r`); expect(called).toBe(false); } finally { globalThis.fetch = realFetch; }
  });
  it("clears a rejected refresh token instead of looping", async () => {
    const realFetch = globalThis.fetch; globalThis.fetch = (async () => new Response("{}", { status: 400 })) as typeof fetch;
    try { const res = await run("garnetrockhill.com", "/admin", "rh_rt=bad"); expect(res.headers.get("set-cookie") ?? "").toContain("rh_rt=;"); } finally { globalThis.fetch = realFetch; }
  });
});
describe("rate limit", () => { it("blocks after limit", () => { let blocked = false; for (let i = 0; i < 7; i++) blocked = rateLimited("1.2.3.4-test"); expect(blocked).toBe(true); }); });

import { defaultsFor, BLOCKS } from "../src/lib/siteContent";
import { formspreeId } from "../src/lib/notify";
import { PH } from "../src/lib/placeholders";
import { thumb } from "../src/lib/media";
describe("content registry and helpers", () => {
  it("every editable block has defaults for all its fields", () => { for (const b of BLOCKS) { const d = defaultsFor(b.site, b.page); for (const f of b.fields) expect(d[f.key]).toBeDefined(); } });
  it("placeholder paths and thumbnail naming", () => { expect(PH.property("land")).toBe("/placeholders/property-land.svg"); expect(PH.property(undefined)).toBe("/placeholders/property-house.svg"); expect(thumb("a/b.webp")).toBe("a/b-sm.webp"); });
  it("placeholder Formspree ids count as not configured", () => {
    process.env.FORMSPREE_FORM_ID_HOMES = "YOUR_FORMSPREE_ID"; delete process.env.FORMSPREE_FORM_ID; expect(formspreeId("homes")).toBe("");
    process.env.FORMSPREE_FORM_ID_HOMES = "abc123"; expect(formspreeId("homes")).toBe("abc123"); expect(formspreeId("corporate")).toBe(""); delete process.env.FORMSPREE_FORM_ID_HOMES;
  });
});
