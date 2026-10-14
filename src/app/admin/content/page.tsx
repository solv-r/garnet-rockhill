import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default async function Hub() {
  await requireRole(["content_editor"]);
  const db = serviceDb();
  const [{ data: pr }, { data: ar }] = await Promise.all([db.from("projects").select("id, title, status, publish, verified").order("created_at", { ascending: false }), db.from("articles").select("id, title, publish, published_at").order("created_at", { ascending: false })]);
  return (<main style={{ maxWidth: 800 }}><h1>Projects and news</h1>
    <h2>Projects <a href="/admin/content/projects/new" style={{ fontSize: "1rem" }}>+ New</a></h2>
    {(pr ?? []).length === 0 && <p>No projects yet. Only verified projects can be published.</p>}
    <ul>{(pr ?? []).map((p) => <li key={p.id}><a href={`/admin/content/projects/${p.id}`}>{p.title}</a> · {p.publish}{!p.verified && " · not verified"}</li>)}</ul>
    <h2>News articles <a href="/admin/content/articles/new" style={{ fontSize: "1rem" }}>+ New</a></h2>
    {(ar ?? []).length === 0 && <p>No articles yet.</p>}
    <ul>{(ar ?? []).map((a) => <li key={a.id}><a href={`/admin/content/articles/${a.id}`}>{a.title}</a> · {a.publish}</li>)}</ul>
  </main>);
}
