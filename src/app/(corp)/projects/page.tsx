import { publicDb } from "@/lib/supabase";
import { publicUrl, thumb } from "@/lib/media";
import { PH } from "@/lib/placeholders";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("corporate", "/projects", { title: "Projects | Garnet Rockhill Limited", description: "Verified projects delivered and in progress by Garnet Rockhill Limited." }); }
export default async function Projects() {
  const { data } = await publicDb().from("projects").select("slug, title, category, location_text, status, project_images(storage_path, alt_text, sort_order)").eq("publish", "published").eq("verified", true).order("created_at", { ascending: false });
  return (<main className="section"><div className="container"><h1>Projects</h1>
    {(data ?? []).length === 0 ? <div className="empty">Our project portfolio is being prepared with verified projects. Please <a href="/contact">contact us</a> to discuss your requirements.</div> :
      <ol className="idx" aria-label="Projects">{(data ?? []).map((p: any, i: number) => ( // eslint-disable-line
        <li key={p.slug}><a className="idx-row" href={`/projects/${p.slug}`}>
          <span className="idx-n">{String(i + 1).padStart(2, "0")}</span>
          <span><span className="idx-title">{p.title}</span><span className="idx-meta">{[p.category, p.location_text, p.status].filter(Boolean).join(" · ")}</span></span>
          <span className="idx-go" aria-hidden="true">→</span>
          <img className="idx-thumb" src={p.project_images?.[0] ? publicUrl("site-media", thumb(p.project_images[0].storage_path)) : PH.project} alt={p.project_images?.[0]?.alt_text ?? ""} loading="lazy" /></a></li>))}</ol>}
  </div></main>);
}
