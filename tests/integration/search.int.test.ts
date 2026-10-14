// Runs the REAL app code against a PostgREST + Postgres instance. Needs NEXT_PUBLIC_SUPABASE_URL / ANON key pointing at a test DB loaded with supabase/tests/integration_data.sql.
import { describe, it, expect } from "vitest";
import { searchProperties } from "../../src/lib/search";
import { loadProperty } from "../../src/lib/property";
import { GET as pins } from "../../src/app/api/map-pins/route";

const slugs = async (p: Record<string, string>) => (await searchProperties(p)).items.map((i) => (i as any).slug as string);
describe("database-backed search", () => {
  it("default shows only published available/upcoming (no draft, no sold)", async () => {
    const s = await slugs({}); expect(s).not.toContain("d1"); expect(s).not.toContain("s1"); expect(s).toContain("u1"); expect(s).toContain("h1");
  });
  it("sold only appears when requested, and is labelled by status", async () => { const r = await searchProperties({ status: "sold" }); expect(r.items.map((i: any) => i.slug)).toEqual(["s1"]); expect((r.items[0] as any).status).toBe("sold"); });
  it("transaction filter", async () => { const s = await slugs({ tx: "rent" }); expect(s).toContain("r1"); expect(s).not.toContain("h1"); });
  it("category filter", async () => expect(await slugs({ category: "land" })).toEqual(["l1"]));
  it("price range", async () => { const s = await slugs({ tx: "sale", minPrice: "30000000", maxPrice: "100000000" }); expect(s).toEqual(["h1"]); });
  it("bedrooms and bathrooms", async () => { expect(await slugs({ beds: "5" })).toEqual(["h2"]); expect(await slugs({ beds: "4", baths: "4" })).toEqual(["h2"]); });
  it("land size", async () => expect(await slugs({ minPlot: "500" })).toEqual(["l1"]));
  it("location includes child areas; other city excluded", async () => { const s = await slugs({ location: "abuja" }); expect(s.sort()).toEqual(["h1", "h2", "u1"]); expect(await slugs({ location: "nowhere" })).toEqual([]); });
  it("features: ALL selected must match", async () => { expect(await slugs({ features: "security" })).toEqual(expect.arrayContaining(["h1", "h2"])); expect(await slugs({ features: "security,gym" })).toEqual(["h1"]); expect(await slugs({ features: "nonexistent" })).toEqual([]); });
  it("combined filters", async () => expect(await slugs({ location: "abuja", tx: "sale", beds: "4", maxPrice: "60000000" })).toEqual(["h1"]));
  it("sorting by price", async () => {
    const asc = (await searchProperties({ tx: "sale", sort: "price_asc" })).items.map((i: any) => Number(i.price)); expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = (await searchProperties({ tx: "sale", sort: "price_desc" })).items.map((i: any) => Number(i.price)); expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });
  it("paginates without loading everything", async () => {
    const p1 = await searchProperties({ page: "1" }), p2 = await searchProperties({ page: "2" });
    expect(p1.items.length).toBe(12); expect(p1.total).toBeGreaterThan(12); expect(p1.pages).toBeGreaterThan(1); expect(p2.items.length).toBeGreaterThan(0);
    expect(new Set([...p1.items, ...p2.items].map((i: any) => i.id)).size).toBe(p1.items.length + p2.items.length);
  });
  it("garbage input does not crash or leak", async () => { const r = await searchProperties({ minPrice: "abc", beds: "-1", page: "999999" }); expect(r.error).toBeUndefined(); expect(r.page).toBe(1); expect(r.items.length).toBeGreaterThan(0); });
});
describe("property detail and privacy", () => {
  it("loads published property with joins, ordered images, features, parent location", async () => {
    const p = await loadProperty("h1"); expect(p.reference).toMatch(/^RH-/); expect(p.images.length).toBe(2); expect(p.location.parent.name).toBe("Abuja"); expect(p.property_features.length).toBe(2); expect(p.category.slug).toBe("house");
  });
  it("draft and unknown slugs return nothing", async () => { expect(await loadProperty("d1")).toBeNull(); expect(await loadProperty("nope")).toBeNull(); });
  it("exact coordinates / address never appear in public payloads", async () => {
    const p = await loadProperty("h1"); const blob = JSON.stringify(p) + JSON.stringify((await searchProperties({})).items);
    expect(blob).not.toContain("Secret Close"); expect(blob).not.toContain("9.0911"); expect(blob).not.toContain("exact_");
    const res = await pins(); const body = JSON.stringify(await res.json()); expect(body).not.toContain("9.0911"); expect(body).not.toContain("Secret");
  });
  it("map pins: one per area, only available/upcoming published", async () => {
    const { pins: list } = await (await pins()).json(); const total = list.reduce((n: number, x: any) => n + x.items.length, 0);
    expect(list.map((x: any) => x.area).sort()).toEqual(["Lekki", "Maitama"]); expect(JSON.stringify(list)).not.toContain("Sold F"); expect(JSON.stringify(list)).not.toContain("Draft G"); expect(total).toBe(18);
  });
});
