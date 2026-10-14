import { publicDb } from "./supabase";

export type SearchParams = {
  location?: string; tx?: string; category?: string; minPrice?: string; maxPrice?: string;
  beds?: string; baths?: string; minPlot?: string; features?: string; status?: string; sort?: string; page?: string;
};
export const PAGE_SIZE = 12;
const num = (v?: string) => (v && Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : undefined);

async function locationIds(slug: string) {
  const db = publicDb();
  const { data: root } = await db.from("locations").select("id").eq("slug", slug).maybeSingle();
  if (!root) return [];
  const ids = [root.id];
  for (let i = 0; i < 2; i++) { // state > city > area
    const { data } = await db.from("locations").select("id").in("parent_id", ids);
    for (const r of data ?? []) if (!ids.includes(r.id)) ids.push(r.id);
  }
  return ids;
}
async function idsWithAllFeatures(slugs: string[]) {
  const db = publicDb();
  const { data: feats } = await db.from("features").select("id, slug").in("slug", slugs);
  if (!feats || feats.length !== slugs.length) return [];
  let acc: string[] | null = null;
  for (const f of feats) {
    const { data } = await db.from("property_features").select("property_id").eq("feature_id", f.id);
    const ids = (data ?? []).map((r) => r.property_id as string);
    acc = acc === null ? ids : acc.filter((x) => ids.includes(x));
  }
  return acc ?? [];
}

export async function searchProperties(p: SearchParams) {
  const db = publicDb();
  const page = Math.max(1, Math.floor(num(p.page) ?? 1));
  // Only genuinely available / upcoming / reserved by default. Sold, rented etc. appear only if asked for, and are labelled.
  const allowed = ["available", "upcoming", "reserved", "sold", "rented", "leased"];
  const statuses = (p.status ? p.status.split(",") : ["available", "upcoming"]).filter((s) => allowed.includes(s));
  let q = db.from("properties").select(
    "id, reference, slug, title, transaction, status, price, price_period, currency, bedrooms, bathrooms, plot_size_sqm, is_featured, listed_at," +
    "location:locations(name, slug), category:property_categories(slug, name), cover:property_images!fk_cover(storage_path, alt_text)",
    { count: "exact" },
  ).eq("publish", "published").in("status", statuses.length ? statuses : ["available", "upcoming"]);

  if (p.tx) q = q.eq("transaction", p.tx);
  if (p.category) { const { data } = await db.from("property_categories").select("id").eq("slug", p.category).maybeSingle(); q = q.eq("category_id", data?.id ?? "00000000-0000-0000-0000-000000000000"); }
  if (p.location) q = q.in("location_id", (await locationIds(p.location)).concat("00000000-0000-0000-0000-000000000000"));
  if (num(p.minPrice) !== undefined) q = q.gte("price", num(p.minPrice)!);
  if (num(p.maxPrice) !== undefined) q = q.lte("price", num(p.maxPrice)!);
  if (num(p.beds) !== undefined) q = q.gte("bedrooms", num(p.beds)!);
  if (num(p.baths) !== undefined) q = q.gte("bathrooms", num(p.baths)!);
  if (num(p.minPlot) !== undefined) q = q.gte("plot_size_sqm", num(p.minPlot)!);
  if (p.features) { const ids = await idsWithAllFeatures(p.features.split(",").filter(Boolean)); q = q.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]); }

  if (p.sort === "price_asc") q = q.order("price", { ascending: true, nullsFirst: false });
  else if (p.sort === "price_desc") q = q.order("price", { ascending: false, nullsFirst: false });
  else q = q.order("listed_at", { ascending: false, nullsFirst: false });

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await q.range(from, from + PAGE_SIZE - 1);
  // A page number past the last page makes PostgREST answer 416; fall back to page 1 instead of showing an error.
  if (error?.code === "PGRST103" && page > 1) return searchProperties({ ...p, page: "1" });
  return { items: (data ?? []) as unknown as Array<{ id: string } & Record<string, unknown>>, total: count ?? 0, page, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)), error: error?.message };
}

const CARD_SELECT = "id, reference, slug, title, transaction, status, price, price_period, currency, bedrooms, bathrooms, plot_size_sqm, is_featured, listed_at, location:locations(name, slug), category:property_categories(slug, name), cover:property_images!fk_cover(storage_path, alt_text)";
/** Featured listings first (admin ticks "Featured on homepage"), topped up with the newest listings. */
export async function getFeatured(limit = 6) {
  const db = publicDb(); const base = () => db.from("properties").select(CARD_SELECT).eq("publish", "published").in("status", ["available", "upcoming"]);
  const { data: feat } = await base().eq("is_featured", true).order("listed_at", { ascending: false }).limit(limit);
  let items = (feat ?? []) as unknown as Array<{ id: string } & Record<string, unknown>>;
  if (items.length < limit) { const { data: more } = await base().eq("is_featured", false).order("listed_at", { ascending: false }).limit(limit - items.length); items = items.concat((more ?? []) as unknown as typeof items); }
  return items;
}
/** Counts of available/upcoming published listings per category and per city (areas roll up into their city). */
export async function getCounts() {
  const db = publicDb();
  const [{ data: props }, { data: locs }, { data: cats }] = await Promise.all([
    db.from("properties").select("category_id, location_id").eq("publish", "published").in("status", ["available", "upcoming"]).limit(2000),
    db.from("locations").select("id, name, slug, kind, parent_id").order("name"), db.from("property_categories").select("id, name, slug").order("sort_order")]);
  const byCat = new Map<string, number>(), byLoc = new Map<string, number>();
  for (const p of props ?? []) { byCat.set(p.category_id, (byCat.get(p.category_id) ?? 0) + 1); byLoc.set(p.location_id, (byLoc.get(p.location_id) ?? 0) + 1); }
  const L = new Map((locs ?? []).map((l) => [l.id, l]));
  const cityOf = (id: string): string | null => { let l = L.get(id); while (l) { if (l.kind === "city") return l.id; l = l.parent_id ? L.get(l.parent_id) : undefined; } return null; };
  const byCity = new Map<string, number>(); for (const [id, n] of byLoc) { const c = cityOf(id); if (c) byCity.set(c, (byCity.get(c) ?? 0) + n); }
  return {
    categories: (cats ?? []).map((c) => ({ ...c, count: byCat.get(c.id) ?? 0 })),
    cities: (locs ?? []).filter((l) => l.kind === "city").map((l) => ({ ...l, count: byCity.get(l.id) ?? 0 })),
    total: (props ?? []).length };
}
