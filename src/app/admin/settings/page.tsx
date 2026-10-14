import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { getContact, SETTING_KEYS, type Site } from "@/lib/config";
export const dynamic = "force-dynamic";
const FIELDS: [string, string, string][] = [["phone", "Phone number", "+234 903 666 6987"], ["email", "Email address", ""], ["whatsapp", "WhatsApp number (digits only, with country code)", "2349036666987"], ["address", "Business address", ""], ["whatsapp_message", "Default WhatsApp message", ""]];
async function save(fd: FormData) {
  "use server"; await requireRole(["content_editor"]);
  const site = String(fd.get("site")) as Site; if (site !== "corporate" && site !== "homes") throw new Error("Bad site");
  const v: Record<string, string> = Object.fromEntries(SETTING_KEYS.map((k) => [k, String(fd.get(k) ?? "").trim()]));
  const bad = (m: string) => redirect(`/admin/settings?err=${encodeURIComponent(m)}&site=${site}`);
  if (v.phone && !/^\+?[0-9 ()-]{7,20}$/.test(v.phone)) bad("Enter a valid phone number");
  if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) bad("Enter a valid email address");
  if (v.whatsapp && !/^[0-9]{10,15}$/.test(v.whatsapp.replace(/\D/g, ""))) bad("WhatsApp number must be 10 to 15 digits");
  const db = serviceDb();
  for (const k of SETTING_KEYS) {
    if (v[k]) await db.from("site_settings").upsert({ site, key: k, value: k === "whatsapp" ? v[k].replace(/\D/g, "") : v[k].slice(0, 400) }, { onConflict: "site,key" });
    else await db.from("site_settings").delete().eq("site", site).eq("key", k); // blank = use the default
  }
  revalidatePath("/", "layout"); redirect(`/admin/settings?ok=1&site=${site}`);
}
export default async function Settings({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; site?: string }> }) {
  await requireRole(["content_editor"]); const sp = await searchParams;
  const sites: [Site, string][] = [["corporate", "Garnet Rockhill (corporate site)"], ["homes", "Rockhill Homes"]];
  const data = await Promise.all(sites.map(async ([s]) => [s, await getContact(s)] as const));
  return (<main style={{ maxWidth: 760 }}><h1>Contact settings</h1>
    <p className="muted">These details appear in the header, footer, contact pages and WhatsApp links. Each brand has its own. Clear a box to go back to the default.</p>
    {sp.ok && <p role="status" className="alert ok">Saved. The website now shows the new details.</p>}{sp.err && <p role="alert" className="alert error">{sp.err}</p>}
    {data.map(([s, c]) => <form key={s} action={save} className="panel" style={{ display: "grid", gap: ".75rem", marginBottom: "1.25rem" }}><input type="hidden" name="site" value={s} />
      <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{sites.find((x) => x[0] === s)![1]}</h2>
      {FIELDS.map(([k, label]) => <label key={k}>{label}{k === "address" || k === "whatsapp_message" ? <textarea name={k} rows={2} defaultValue={(c as Record<string, string>)[k]} /> : <input name={k} defaultValue={(c as Record<string, string>)[k]} />}</label>)}
      <button style={{ justifySelf: "start" }}>Save {s === "homes" ? "Rockhill Homes" : "corporate"} details</button></form>)}
    <p className="muted">Form delivery (Formspree / email) is configured in the hosting settings, not here. See docs/DEPLOYMENT.md.</p>
  </main>);
}
