import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicDb, serviceDb } from "@/lib/supabase";
import { getStaff } from "@/lib/auth";
import { publicUrl } from "@/lib/media";
import { urls } from "@/lib/config";
export const dynamic = "force-dynamic";
async function load(slug: string, preview: boolean) {
  if (preview && (await getStaff())) return (await serviceDb().from("articles").select("*").eq("slug", slug).maybeSingle()).data as any; // eslint-disable-line
  return (await publicDb().from("articles").select("*").eq("slug", slug).eq("publish", "published").maybeSingle()).data as any; // eslint-disable-line
}
export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }): Promise<Metadata> {
  const slug = (await params).slug, a = await load(slug, !!(await searchParams).preview); if (!a) return { robots: { index: false } };
  const { data: seo } = await publicDb().from("seo_meta").select("*").eq("site", "corporate").eq("path", `/news/${slug}`).maybeSingle();
  const title = seo?.title ?? a.title, description = seo?.description ?? a.excerpt ?? undefined;
  return { title: `${title} | Garnet Rockhill Limited`, description, alternates: { canonical: seo?.canonical_url ?? `${urls.corporate}/news/${slug}` }, robots: a.publish !== "published" || seo?.noindex ? { index: false } : undefined,
    openGraph: { title: seo?.og_title ?? title, description, images: a.cover_path ? [publicUrl("site-media", a.cover_path)] : undefined } };
}
export default async function Article({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const a = await load((await params).slug, !!(await searchParams).preview); if (!a) notFound();
  const { data: related } = await publicDb().from("articles").select("slug, title").eq("publish", "published").neq("slug", a.slug).limit(3);
  return (<main className="section"><div className="container" style={{ maxWidth: 760 }}>
    {a.publish !== "published" && <p role="status" style={{ background: "var(--surface-alt)", padding: ".5rem" }}>Draft preview, not public.</p>}
    <p><a href="/news">← News</a></p><h1>{a.title}</h1>
    <p style={{ color: "var(--muted)" }}>{a.category} {a.published_at && new Date(a.published_at).toLocaleDateString("en-NG", { dateStyle: "long" })}</p>
    {a.cover_path && <img src={publicUrl("site-media", a.cover_path)} alt="" style={{ width: "100%" }} />}
    {(a.body ?? "").split(/\n{2,}/).map((para: string, i: number) => <p key={i} style={{ whiteSpace: "pre-line" }}>{para}</p>)}
    {related && related.length > 0 && <><h2>Related articles</h2><ul>{related.map((r) => <li key={r.slug}><a href={`/news/${r.slug}`}>{r.title}</a></li>)}</ul></>}</div></main>);
}
