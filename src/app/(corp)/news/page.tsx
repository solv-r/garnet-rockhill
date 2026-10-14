import { publicDb } from "@/lib/supabase";
import { publicUrl, thumb } from "@/lib/media";
import { PH } from "@/lib/placeholders";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("corporate", "/news", { title: "News & Insights | Garnet Rockhill Limited", description: "News and insights from Garnet Rockhill Limited." }); }
export default async function News({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const sp = await searchParams;
  let q = publicDb().from("articles").select("slug, title, excerpt, category, published_at, cover_path").eq("publish", "published").order("published_at", { ascending: false }).limit(30);
  if (sp.category) q = q.eq("category", sp.category);
  const { data } = await q;
  return (<main className="section"><div className="container"><h1>News &amp; insights</h1>
    {(data ?? []).length === 0 ? <div className="empty">No articles have been published yet.</div> :
      <div className="grid">{(data ?? []).map((a) => <a key={a.slug} className="card" href={`/news/${a.slug}`}><div className="media"><img src={a.cover_path ? publicUrl("site-media", thumb(a.cover_path)) : PH.news} alt="" loading="lazy" /></div>
        <div className="body"><span className="badge">{a.category ?? "News"}</span><h2 style={{ fontSize: "1.15rem", margin: ".4rem 0" }}>{a.title}</h2><p className="muted">{a.published_at && new Date(a.published_at).toLocaleDateString("en-NG", { dateStyle: "long" })}</p><p>{a.excerpt}</p></div></a>)}</div>}
  </div></main>);
}
