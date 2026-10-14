import { serviceDb } from "./supabase";
export type Payload = { reference: string; source_site: string; kind: string; name: string; email?: string | null; phone?: string | null; message?: string | null; property_ref?: string | null; preferred_viewing?: string | null };
type Result = { ok: true } | { ok: false; error: string };
const esc = (s = "") => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

/** Formspree form id for the brand. Values starting with YOUR_ are placeholders and are treated as "not configured". */
export function formspreeId(site: string) {
  const id = (site === "homes" ? process.env.FORMSPREE_FORM_ID_HOMES : process.env.FORMSPREE_FORM_ID_CORPORATE) || process.env.FORMSPREE_FORM_ID || "";
  return id && !id.startsWith("YOUR_") ? id : "";
}
async function viaFormspree(id: string, p: Payload): Promise<Result> {
  try {
    const r = await fetch(`https://formspree.io/f/${encodeURIComponent(id)}`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: `[${p.source_site}] ${p.kind} enquiry ${p.reference}`, reference: p.reference, website: p.source_site, kind: p.kind, name: p.name,
        ...(p.email ? { email: p.email } : {}), phone: p.phone ?? "", property: p.property_ref ?? "", preferred_viewing: p.preferred_viewing ?? "", message: p.message ?? "" }),
    });
    return r.ok ? { ok: true } : { ok: false, error: `Formspree ${r.status}` };
  } catch (e) { return { ok: false, error: String(e).slice(0, 160) }; }
}
async function resend(to: string, subject: string, html: string, replyTo?: string | null): Promise<Result> {
  const key = process.env.RESEND_API_KEY, from = process.env.NOTIFY_FROM;
  if (!key || !from) return { ok: false, error: "Email not configured" };
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], reply_to: replyTo || undefined, subject, html }) });
    return r.ok ? { ok: true } : { ok: false, error: `Resend ${r.status}` };
  } catch (e) { return { ok: false, error: String(e).slice(0, 160) }; }
}
/** Team notification: Formspree if a real form id is set, otherwise (or if it fails) Resend, otherwise "not configured". */
export async function notifyTeam(p: Payload): Promise<Result> {
  const id = formspreeId(p.source_site); let last: Result = { ok: false, error: "Email not configured" };
  if (id) { last = await viaFormspree(id, p); if (last.ok) return last; }
  const to = process.env.NOTIFY_TO;
  if (to && process.env.RESEND_API_KEY) {
    const r = await resend(to, `[${p.source_site}] ${p.kind} enquiry ${p.reference}`, `<p><b>${esc(p.name)}</b><br>${esc(p.email ?? "")} ${esc(p.phone ?? "")}</p><p>Property: ${esc(p.property_ref ?? "")}</p><p>${esc(p.message ?? "")}</p>`, p.email);
    if (r.ok) return r; if (!id) last = r; else last = { ok: false, error: `${(last as { error: string }).error}; ${r.error}` };
  }
  return last;
}
/** Customer acknowledgement. Needs Resend (Formspree auto-replies are not used). Never promises availability or an appointment. */
export async function acknowledgeCustomer(p: Payload, brand: string): Promise<Result> {
  if (!p.email) return { ok: false, error: "No customer email" };
  return resend(p.email, `We received your ${p.kind === "viewing" ? "viewing request" : "enquiry"} (${p.reference})`,
    `<p>Dear ${esc(p.name)},</p><p>Thank you for contacting ${esc(brand)}. We have received your ${p.kind === "viewing" ? "viewing request" : "enquiry"} (reference ${esc(p.reference)}). A member of our team will review it and contact you.</p><p>${p.kind === "viewing" ? "Please note that a viewing request is not a confirmed appointment until we confirm it with you." : ""}</p><p>${esc(brand)}</p>`);
}
/** Runs both notifications for a saved enquiry and records the real outcome on the row. */
export async function notifyAndRecord(id: string, p: Payload, brand: string) {
  const db = serviceDb(); const patch: Record<string, unknown> = {};
  const t = await notifyTeam(p); Object.assign(patch, t.ok ? { team_notified_at: new Date().toISOString(), team_notify_error: null } : { team_notify_error: t.error });
  if (p.email) { const c = await acknowledgeCustomer(p, brand); Object.assign(patch, c.ok ? { customer_notified_at: new Date().toISOString(), customer_notify_error: null } : { customer_notify_error: c.error }); }
  await db.from("enquiries").update(patch).eq("id", id);
  return t;
}

/** Re-sends ONLY the team notification for an already-saved enquiry (used by the admin "Retry email" button). */
export async function retryTeamAndRecord(id: string, p: Payload) {
  const t = await notifyTeam(p);
  await serviceDb().from("enquiries").update(t.ok ? { team_notified_at: new Date().toISOString(), team_notify_error: null } : { team_notify_error: t.error }).eq("id", id);
  return t;
}
