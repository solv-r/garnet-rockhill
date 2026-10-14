import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../../src/app/api/enquiries/route";
import { serviceDb } from "../../src/lib/supabase";

let n = 0;
const post = (body: Record<string, unknown>, ip = `10.0.0.${++n}`) => POST(new NextRequest("http://x/api/enquiries", { method: "POST", headers: { "x-forwarded-for": ip, "content-type": "application/json" }, body: JSON.stringify(body) }));
const valid = (o: Record<string, unknown> = {}) => ({ source_site: "homes", kind: "viewing", name: "Ada Obi", phone: "+2348030000000", message: "Hello <b>x</b>", privacy_ack: true, idempotency_key: crypto.randomUUID(), ...o });
const realFetch = globalThis.fetch;
beforeAll(() => { delete process.env.RESEND_API_KEY; });
afterAll(() => { globalThis.fetch = realFetch; });

describe("enquiry API (saves first, reports honestly)", () => {
  it("saves a valid enquiry and records that email was NOT sent when unconfigured", async () => {
    const body = valid(); const res = await post(body); const j = await res.json();
    expect(res.status).toBe(200); expect(j.ok).toBe(true); expect(j.reference).toMatch(/^ENQ-/);
    const { data } = await serviceDb().from("enquiries").select("*").eq("idempotency_key", body.idempotency_key).single();
    expect(data!.name).toBe("Ada Obi"); expect(data!.team_notified_at).toBeNull(); expect(data!.team_notify_error).toBe("Email not configured"); expect(data!.status).toBe("new");
  });
  it("double submit with the same key stores one row and returns the same reference", async () => {
    const body = valid(); const a = await (await post(body)).json(); const b = await (await post(body)).json();
    expect(b.reference).toBe(a.reference); const { count } = await serviceDb().from("enquiries").select("id", { count: "exact", head: true }).eq("idempotency_key", body.idempotency_key); expect(count).toBe(1);
  });
  it("links a real published property reference and ignores unknown/draft ones", async () => {
    const { data: p } = await serviceDb().from("properties").select("id, reference").eq("slug", "h1").single();
    const ok = valid({ property_ref: p!.reference }); await post(ok);
    expect((await serviceDb().from("enquiries").select("property_id").eq("idempotency_key", ok.idempotency_key).single()).data!.property_id).toBe(p!.id);
    const { data: d } = await serviceDb().from("properties").select("reference").eq("slug", "d1").single();
    const bad = valid({ property_ref: d!.reference }); await post(bad);
    expect((await serviceDb().from("enquiries").select("property_id").eq("idempotency_key", bad.idempotency_key).single()).data!.property_id).toBeNull();
  });
  it("rejects invalid input without saving", async () => {
    for (const bad of [valid({ name: "A" }), valid({ phone: undefined, email: undefined }), valid({ privacy_ack: false }), valid({ email: "nope", phone: undefined }), valid({ kind: "hack" })]) {
      const res = await post(bad); expect(res.status).toBe(400);
      expect((await serviceDb().from("enquiries").select("id", { count: "exact", head: true }).eq("idempotency_key", bad.idempotency_key)).count).toBe(0);
    }
  });
  it("honeypot: pretends success but stores nothing", async () => {
    const bot = valid({ website: "http://spam" }); const res = await post(bot); expect((await res.json()).ok).toBe(true);
    expect((await serviceDb().from("enquiries").select("id", { count: "exact", head: true }).eq("idempotency_key", bot.idempotency_key)).count).toBe(0);
  });
  it("rate limits one IP", async () => { let last = 200; for (let i = 0; i < 7; i++) last = (await post(valid(), "9.9.9.9")).status; expect(last).toBe(429); });
  it("Formspree placeholder id is ignored (no network call)", async () => {
    process.env.FORMSPREE_FORM_ID_HOMES = "YOUR_FORMSPREE_ID"; let hit = false;
    globalThis.fetch = (async (u: any, i?: any) => { if (String(u).includes("formspree.io")) { hit = true; return new Response("{}"); } return realFetch(u, i); }) as typeof fetch;
    const b = valid(); await post(b); expect(hit).toBe(false);
    expect((await serviceDb().from("enquiries").select("team_notify_error").eq("idempotency_key", b.idempotency_key).single()).data!.team_notify_error).toBe("Email not configured");
    delete process.env.FORMSPREE_FORM_ID_HOMES;
  });
  it("records Formspree success and failure honestly, and posts the right payload", async () => {
    process.env.FORMSPREE_FORM_ID_HOMES = "realid1"; let body: any = null, url = "";
    globalThis.fetch = (async (u: any, i?: any) => { if (String(u).includes("formspree.io")) { url = String(u); body = JSON.parse(i.body); return new Response("{}", { status: 200 }); } return realFetch(u, i); }) as typeof fetch;
    const ok = valid({ email: "ada@example.com", phone: undefined }); await post(ok);
    expect(url).toBe("https://formspree.io/f/realid1"); expect(body.name).toBe("Ada Obi"); expect(body.email).toBe("ada@example.com"); expect(body.reference).toMatch(/^ENQ-/); expect(body.website).toBe("homes");
    globalThis.fetch = (async (u: any, i?: any) => String(u).includes("formspree.io") ? new Response("{}", { status: 403 }) : realFetch(u, i)) as typeof fetch;
    const fail = valid(); const res = await post(fail); expect((await res.json()).ok).toBe(true); // still saved
    const q = (k: string) => serviceDb().from("enquiries").select("team_notified_at, team_notify_error, customer_notify_error").eq("idempotency_key", k).single();
    expect((await q(ok.idempotency_key)).data!.team_notified_at).not.toBeNull();
    const f = (await q(fail.idempotency_key)).data!; expect(f.team_notified_at).toBeNull(); expect(f.team_notify_error).toBe("Formspree 403");
    delete process.env.FORMSPREE_FORM_ID_HOMES;
  });
  it("falls back to Resend if Formspree fails, and sends a customer acknowledgement only when it works", async () => {
    process.env.FORMSPREE_FORM_ID_HOMES = "realid1"; process.env.RESEND_API_KEY = "k"; process.env.NOTIFY_FROM = "a@b.c"; process.env.NOTIFY_TO = "t@b.c"; const sent: any[] = [];
    globalThis.fetch = (async (u: any, i?: any) => { if (String(u).includes("formspree.io")) return new Response("{}", { status: 500 }); if (String(u).includes("api.resend.com")) { sent.push(JSON.parse(i.body)); return new Response("{}", { status: 200 }); } return realFetch(u, i); }) as typeof fetch;
    const b = valid({ email: "cust@example.com", kind: "viewing" }); await post(b);
    expect(sent.length).toBe(2); expect(sent[0].to).toEqual(["t@b.c"]); expect(sent[1].to).toEqual(["cust@example.com"]); expect(sent[1].html).toContain("not a confirmed appointment");
    const r = (await serviceDb().from("enquiries").select("team_notified_at, customer_notified_at").eq("idempotency_key", b.idempotency_key).single()).data!; expect(r.team_notified_at).not.toBeNull(); expect(r.customer_notified_at).not.toBeNull();
    delete process.env.FORMSPREE_FORM_ID_HOMES; delete process.env.RESEND_API_KEY;
  });
  it("accepts feedback submissions", async () => { const b = valid({ kind: "feedback", email: "f@example.com", phone: undefined }); const res = await post(b); expect(res.status).toBe(200); });
});
