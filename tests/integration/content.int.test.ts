import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getContent } from "../../src/lib/siteContent";
import { getContact } from "../../src/lib/config";
import { buildMetadata } from "../../src/lib/seo";
import { serviceDb } from "../../src/lib/supabase";

beforeAll(async () => { const db = serviceDb(); await db.from("site_settings").delete().in("key", ["phone", "email", "whatsapp", "address", "whatsapp_message"]); await db.from("pages").delete().in("site", ["corporate", "homes"]); await db.from("seo_meta").delete().eq("path", "/about"); });
afterAll(async () => { const db = serviceDb(); await db.from("pages").delete().eq("key", "home").in("site", ["corporate", "homes"]); await db.from("site_settings").delete().in("key", ["phone", "whatsapp"]); await db.from("seo_meta").delete().eq("path", "/about"); });
describe("editable content, contact settings and SEO (database-backed)", () => {
  it("defaults are used when nothing is saved", async () => { const t = await getContent("corporate", "home"); expect(t.hero_title).toContain("Delivered with care"); });
  it("a saved DRAFT is not public; publishing makes it live; blank values fall back to defaults", async () => {
    const db = serviceDb();
    await db.from("pages").upsert({ site: "corporate", key: "home", content: {}, draft: { hero_title: "DRAFT TITLE" }, publish: "draft" }, { onConflict: "site,key" });
    expect((await getContent("corporate", "home")).hero_title).toContain("Delivered with care");
    await db.from("pages").upsert({ site: "corporate", key: "home", content: { hero_title: "Live title", hero_text: "" }, draft: null, publish: "published" }, { onConflict: "site,key" });
    const t = await getContent("corporate", "home"); expect(t.hero_title).toBe("Live title"); expect(t.hero_text).toContain("Garnet Rockhill Limited delivers");
  });
  it("content is per brand", async () => { expect((await getContent("homes", "home")).hero_title).not.toBe("Live title"); });
  it("contact details: env default, then per-brand database override", async () => {
    const before = await getContact("homes"); expect(before.whatsapp).toBe("2349036666987");
    await serviceDb().from("site_settings").upsert([{ site: "homes", key: "phone", value: "+2348000000001" }, { site: "homes", key: "whatsapp", value: "2348000000001" }], { onConflict: "site,key" });
    const homes = await getContact("homes"), corp = await getContact("corporate");
    expect(homes.phone).toBe("+2348000000001"); expect(homes.whatsapp).toBe("2348000000001"); expect(corp.phone).toBe("+2349036666987");
  });
  it("SEO overrides apply and noindex works", async () => {
    expect((await buildMetadata("corporate", "/about", { title: "Default", description: "d" })).title).toBe("Default");
    await serviceDb().from("seo_meta").upsert({ site: "corporate", path: "/about", title: "Custom about", description: "Custom", noindex: true }, { onConflict: "site,path" });
    const m = await buildMetadata("corporate", "/about", { title: "Default" }); expect(m.title).toBe("Custom about"); expect(m.robots).toEqual({ index: false, follow: false });
  });
  it("public (anon) users cannot read draft text", async () => {
    // pages RLS only exposes published rows, and the draft column of a published row is cleared on publish
    const { publicDb } = await import("../../src/lib/supabase");
    await serviceDb().from("pages").upsert({ site: "homes", key: "home", content: {}, draft: { hero_title: "SECRET DRAFT" }, publish: "draft" }, { onConflict: "site,key" });
    const { data } = await publicDb().from("pages").select("*").eq("site", "homes").eq("key", "home"); expect(data ?? []).toEqual([]);
  });
});
