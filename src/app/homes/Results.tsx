import { searchProperties, type SearchParams } from "@/lib/search";
import { publicDb } from "@/lib/supabase";
import { PropertyCard } from "./PropertyCard";
type Raw = Record<string, string | string[] | undefined>;
const KEYS = ["location", "tx", "category", "minPrice", "maxPrice", "beds", "baths", "minPlot", "features", "status", "sort", "page"] as const;
export async function Results({ sp: raw, base, heading, preset = {} }: { sp: Raw; base: string; heading: string; preset?: Partial<SearchParams> }) {
  const sp: Record<string, string> = {};
  for (const k of KEYS) { const v = raw[k]; const s = Array.isArray(v) ? v.join(",") : v; if (s) sp[k] = s; }
  Object.assign(sp, preset);
  const db = publicDb();
  const [{ items, total, page, pages, error }, { data: locs }, { data: cats }, { data: feats }] = await Promise.all([searchProperties(sp as SearchParams),
    db.from("locations").select("name, slug, kind").in("kind", ["city", "area"]).order("name"), db.from("property_categories").select("slug, name").order("sort_order"), db.from("features").select("slug, name").order("name")]);
  const chosen = new Set((sp.features ?? "").split(",").filter(Boolean));
  const link = (n: number) => `${base}?` + new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([k]) => !(k in preset))), page: String(n) }).toString();
  return (
    <main className="section"><div className="container results-layout">
      <div className="filters-col"><input type="checkbox" id="filters-toggle" className="ft-toggle" aria-label="Show or hide filters" /><label htmlFor="filters-toggle" className="btn outline ft-btn">Filters &amp; sort</label>
      <form method="get" action={base} aria-label="Filter properties" className="filters">
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Filters</h2>
        <label>Location<select name="location" defaultValue={sp.location ?? ""}><option value="">Anywhere</option>{(locs ?? []).map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}</select></label>
        {!preset.tx && <label>For<select name="tx" defaultValue={sp.tx ?? ""}><option value="">Any</option><option value="sale">Sale</option><option value="rent">Rent</option><option value="lease">Lease</option><option value="off_plan_enquiry">Off-plan (enquire)</option></select></label>}
        {!preset.category && <label>Property type<select name="category" defaultValue={sp.category ?? ""}><option value="">Any</option>{(cats ?? []).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>}
        <label>Availability<select name="status" defaultValue={sp.status ?? ""}><option value="">Available and upcoming</option><option value="available">Available now</option><option value="upcoming">Upcoming only</option><option value="sold,rented,leased">Sold / let</option></select></label>
        <label>Min price (₦)<input name="minPrice" inputMode="numeric" defaultValue={sp.minPrice} /></label>
        <label>Max price (₦)<input name="maxPrice" inputMode="numeric" defaultValue={sp.maxPrice} /></label>
        <label>Min bedrooms<input name="beds" inputMode="numeric" defaultValue={sp.beds} /></label>
        <label>Min bathrooms<input name="baths" inputMode="numeric" defaultValue={sp.baths} /></label>
        <label>Min land size (sqm)<input name="minPlot" inputMode="numeric" defaultValue={sp.minPlot} /></label>
        {(feats ?? []).length > 0 && <fieldset><legend>Features</legend>{(feats ?? []).map((f) => <label key={f.slug} className="check"><input type="checkbox" name="features" value={f.slug} defaultChecked={chosen.has(f.slug)} /> {f.name}</label>)}</fieldset>}
        <label>Sort by<select name="sort" defaultValue={sp.sort ?? "newest"}><option value="newest">Newest first</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></label>
        <button type="submit">Apply filters</button><a href={base} style={{ textAlign: "center" }}>Clear filters</a>
      </form></div>
      <section aria-live="polite"><div className="results-head"><h1 style={{ fontSize: "1.8rem", margin: 0 }} dangerouslySetInnerHTML={{ __html: heading }} /><span className="muted">{total} {total === 1 ? "property" : "properties"} found</span></div>
        {(() => { const chips: string[] = []; const name = (list: { slug: string; name: string }[] | null, v?: string) => list?.find((x) => x.slug === v)?.name ?? v;
          if (sp.location && !preset.location) chips.push(`Location: ${name(locs, sp.location)}`); if (sp.tx && !preset.tx) chips.push(`For: ${sp.tx.replace("_", " ")}`); if (sp.category && !preset.category) chips.push(`Type: ${name(cats, sp.category)}`);
          if (sp.beds) chips.push(`${sp.beds}+ bedrooms`); if (sp.maxPrice) chips.push(`Up to ₦${Number(sp.maxPrice).toLocaleString("en-NG")}`); if (sp.minPrice) chips.push(`From ₦${Number(sp.minPrice).toLocaleString("en-NG")}`); chosen.forEach((f) => chips.push(name(feats, f) ?? f));
          return chips.length ? <div className="chips" aria-label="Active filters">{chips.map((c) => <span className="chip" key={c}>{c}</span>)}</div> : null; })()}
        {error && <p role="alert" className="alert error">Sorry, listings could not be loaded right now. Please try again shortly.</p>}
        {!error && items.length === 0 && <div className="empty">No properties match these filters. Try widening your search, or <a href="/contact">tell us what you are looking for</a>.</div>}
        <div className="grid">{items.map((p) => <PropertyCard key={p.id as string} p={p as never} />)}</div>
        {pages > 1 && <nav aria-label="Pagination" style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>{page > 1 && <a className="btn outline" href={link(page - 1)}>Previous</a>}<span>Page {page} of {pages}</span>{page < pages && <a className="btn outline" href={link(page + 1)}>Next</a>}</nav>}
      </section>
    </div></main>
  );
}
