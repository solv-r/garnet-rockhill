import { revalidatePath } from "next/cache";
import { requireRole, can } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { retryTeamAndRecord } from "@/lib/notify";
export const dynamic = "force-dynamic";
const STATUSES = ["new", "contacted", "follow_up", "viewing_arranged", "converted", "closed"];
async function update(formData: FormData) {
  "use server";
  await requireRole(["lead_handler"]);
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status)) throw new Error("Bad status");
  await serviceDb().from("enquiries").update({ status, staff_notes: String(formData.get("staff_notes") ?? "").slice(0, 4000) || null }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/enquiries");
}
async function retry(fd: FormData) {
  "use server"; await requireRole(["lead_handler"]);
  const db = serviceDb(); const { data: e } = await db.from("enquiries").select("*, property:properties(reference)").eq("id", String(fd.get("id"))).maybeSingle(); if (!e) return;
  await retryTeamAndRecord(e.id, { reference: e.reference, source_site: e.source_site, kind: e.kind, name: e.name, email: e.email, phone: e.phone, message: e.message, property_ref: e.property?.reference ?? null, preferred_viewing: e.preferred_viewing });
  revalidatePath("/admin/enquiries");
}
export default async function Enquiries({ searchParams }: { searchParams: Promise<{ status?: string; site?: string; q?: string }> }) {
  const staff = await requireRole(["lead_handler", "property_manager"]);
  const sp = await searchParams;
  let q = serviceDb().from("enquiries").select("*, property:properties(reference, title)").order("created_at", { ascending: false }).limit(100);
  if (sp.status && STATUSES.includes(sp.status)) q = q.eq("status", sp.status);
  if (sp.site === "homes" || sp.site === "corporate") q = q.eq("source_site", sp.site);
  if (sp.q) { const s = sp.q.replace(/[%,()]/g, ""); q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,reference.ilike.%${s}%`); }
  const { data } = await q;
  const canEdit = can(staff, ["lead_handler"]);
  return (<>
    <h1>Enquiries</h1>
    <form style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
      <input name="q" placeholder="Name, email, phone or ref" defaultValue={sp.q} aria-label="Search enquiries" />
      <select name="status" defaultValue={sp.status ?? ""} aria-label="Status"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      <select name="site" defaultValue={sp.site ?? ""} aria-label="Source"><option value="">Both sites</option><option value="homes">Rockhill Homes</option><option value="corporate">Corporate</option></select>
      <button>Filter</button></form>
    {(data ?? []).length === 0 && <p>No enquiries match.</p>}
    {(data ?? []).map((e: any) => ( // eslint-disable-line
      <article key={e.id} className="panel" style={{ marginTop: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{e.reference} · {e.name} · {e.source_site} · {e.kind}</h2>
        <p>{e.email} {e.phone} {e.property && <>· Property: {e.property.reference} {e.property.title}</>}</p>
        <p style={{ whiteSpace: "pre-line" }}>{e.message}</p>
        <p style={{ color: "var(--muted)" }}>{new Date(e.created_at).toLocaleString("en-NG")}{e.preferred_viewing && ` · wants viewing ${new Date(e.preferred_viewing).toLocaleString("en-NG")}`}
          {" · Team notification: "}{e.team_notified_at ? "sent" : `not sent${e.team_notify_error ? ` (${e.team_notify_error})` : ""}`}{e.email && <>{" · Customer acknowledgement: "}{e.customer_notified_at ? "sent" : `not sent${e.customer_notify_error ? ` (${e.customer_notify_error})` : ""}`}</>}</p>
        {canEdit && !e.team_notified_at && <form action={retry}><input type="hidden" name="id" value={e.id} /><button className="btn outline">Retry team notification</button></form>}
        {canEdit ? <form action={update} style={{ display: "grid", gap: ".5rem" }}><input type="hidden" name="id" value={e.id} />
          <select name="status" defaultValue={e.status} aria-label="Lead status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <textarea name="staff_notes" rows={2} defaultValue={e.staff_notes ?? ""} aria-label="Internal notes" /><button>Update</button></form>
          : <p>Status: {e.status}</p>}
      </article>))}
  </>);
}
