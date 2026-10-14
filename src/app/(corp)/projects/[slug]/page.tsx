import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicDb } from "@/lib/supabase";
import { publicUrl } from "@/lib/media";
import { urls } from "@/lib/config";
export const dynamic = "force-dynamic";
const load = async (slug: string) => (await publicDb().from("projects").select("*, project_images(storage_path, alt_text, caption, sort_order)").eq("slug", slug).eq("publish", "published").eq("verified", true).maybeSingle()).data as any; // eslint-disable-line
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug, p = await load(slug); if (!p) return { robots: { index: false } };
  const { data: seo } = await publicDb().from("seo_meta").select("*").eq("site", "corporate").eq("path", `/projects/${slug}`).maybeSingle();
  return { title: seo?.title ?? `${p.title} | Garnet Rockhill Limited`, description: seo?.description ?? p.description?.slice(0, 155), alternates: { canonical: seo?.canonical_url ?? `${urls.corporate}/projects/${slug}` }, robots: seo?.noindex ? { index: false } : undefined };
}
export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug); if (!p) notFound();
  const imgs = [...(p.project_images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order); // eslint-disable-line
  return (<main className="section"><div className="container" style={{ maxWidth: 960 }}><p><a href="/projects">← Projects</a></p><h1>{p.title}</h1>
    <p>{[p.category, p.location_text, p.status, p.completion_period].filter(Boolean).join(" · ")}</p>
    <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>
    <div style={{ display: "grid", gap: ".5rem", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>{imgs.map((im: any, i: number) => <figure key={i} style={{ margin: 0 }}><img src={publicUrl("site-media", im.storage_path)} alt={im.alt_text ?? p.title} loading="lazy" style={{ width: "100%" }} />{im.caption && <figcaption>{im.caption}</figcaption>}</figure>)}</div></div></main>); // eslint-disable-line
}
