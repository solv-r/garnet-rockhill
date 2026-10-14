import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ days?: string; denied?: string }> }) {
  await requireRole(["property_manager", "content_editor", "lead_handler"]);
  const sp = await searchParams; const days = [7, 30, 90, 365].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const db = serviceDb(); const since = new Date(Date.now() - days * 864e5).toISOString();
  const cnt = async (table: string, f: (q: any) => any) => (await f(db.from(table).select("id", { count: "exact", head: true }))).count ?? 0; // eslint-disable-line
  const [published, drafts, available, closed, upcoming, eAll, eHomes, eCorp, articles, articlesPub, projects, projectsPub, newLeads] = await Promise.all([
    cnt("properties", (q) => q.eq("publish", "published")), cnt("properties", (q) => q.eq("publish", "draft")), cnt("properties", (q) => q.eq("publish", "published").eq("status", "available")),
    cnt("properties", (q) => q.in("status", ["sold", "rented", "leased"])), cnt("properties", (q) => q.eq("publish", "published").eq("status", "upcoming")),
    cnt("enquiries", (q) => q.gte("created_at", since)), cnt("enquiries", (q) => q.gte("created_at", since).eq("source_site", "homes")), cnt("enquiries", (q) => q.gte("created_at", since).eq("source_site", "corporate")),
    cnt("articles", (q) => q), cnt("articles", (q) => q.eq("publish", "published")), cnt("projects", (q) => q), cnt("projects", (q) => q.eq("publish", "published")), cnt("enquiries", (q) => q.eq("status", "new")),
  ]);
  const { data: byProp } = await db.from("enquiries").select("property:properties(reference, title)").gte("created_at", since).not("property_id", "is", null).limit(1000);
  const tally = new Map<string, { title: string; n: number }>();
  for (const r of (byProp ?? []) as any[]) { if (!r.property) continue; const k = r.property.reference; const t = tally.get(k) ?? { title: r.property.title, n: 0 }; t.n++; tally.set(k, t); } // eslint-disable-line
  const top = [...tally.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 10);
  const stat = (k: string, v: number) => <div key={k} className="panel"><div className="muted">{k}</div><strong style={{ fontSize: "2rem" }}>{v}</strong></div>;
  return (<>
    <h1>Dashboard</h1>
    {sp.denied && <p role="alert" className="alert error">You do not have permission to open that page or perform that action. Ask a super admin if you need access.</p>}
    <form style={{ display: "flex", gap: ".5rem", alignItems: "end", margin: "0 0 1rem" }}><label style={{ maxWidth: 220 }}>Enquiry period<select name="days" defaultValue={String(days)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option></select></label><button>Apply</button></form>
    <p className="muted">All figures are counted live from the database.</p>
    <h2>Properties</h2><div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>{[stat("Published", published), stat("Drafts", drafts), stat("Available", available), stat("Sold / rented / leased", closed), stat("Upcoming developments", upcoming)]}</div>
    <h2>Enquiries (last {days} days)</h2><div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>{[stat("All enquiries", eAll), stat("Rockhill Homes", eHomes), stat("Corporate site", eCorp), stat("New, awaiting contact (all time)", newLeads)]}</div>
    <h2>Enquiries by property</h2>
    {top.length === 0 ? <p className="muted">No property enquiries in this period.</p> : <div className="panel"><table><thead><tr><th>Reference</th><th>Property</th><th>Enquiries</th></tr></thead><tbody>{top.map(([ref, t]) => <tr key={ref}><td>{ref}</td><td>{t.title}</td><td>{t.n}</td></tr>)}</tbody></table></div>}
    <h2>Content</h2><div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>{[stat("Articles", articles), stat("Published articles", articlesPub), stat("Projects", projects), stat("Published projects", projectsPub)]}</div>
  </>);
}
