import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
export const dynamic = "force-dynamic";
const ROLES = ["super_admin", "property_manager", "content_editor", "lead_handler"];
async function invite(fd: FormData) {
  "use server"; const me = await requireRole([]); if (me.role !== "super_admin") redirect("/admin?denied=1");
  const email = String(fd.get("email") ?? "").trim(), name = String(fd.get("name") ?? "").trim(), role = String(fd.get("role")), pw = String(fd.get("password") ?? "");
  if (!email || !name || !ROLES.includes(role) || pw.length < 12) return;
  const db = serviceDb();
  const { data, error } = await db.auth.admin.createUser({ email, password: pw, email_confirm: true });
  if (error || !data.user) return;
  await db.from("staff_profiles").insert({ id: data.user.id, full_name: name, role });
  revalidatePath("/admin/staff");
}
async function change(fd: FormData) {
  "use server"; const me = await requireRole([]); if (me.role !== "super_admin") redirect("/admin?denied=1");
  const id = String(fd.get("id")), role = String(fd.get("role")), active = fd.get("active") === "on";
  if (!ROLES.includes(role) || (id === me.id && (!active || role !== "super_admin"))) return; // cannot lock yourself out
  await serviceDb().from("staff_profiles").update({ role, is_active: active }).eq("id", id);
  revalidatePath("/admin/staff");
}
export default async function Staff() {
  const me = await requireRole([]); if (me.role !== "super_admin") redirect("/admin?denied=1");
  const { data } = await serviceDb().from("staff_profiles").select("id, full_name, role, is_active").order("full_name");
  return (<main style={{ maxWidth: 800 }}><h1>Staff and roles</h1>
    <form action={invite} style={{ display: "grid", gap: ".5rem", maxWidth: 420 }}><h2>Add staff member</h2>
      <label>Full name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label>
      <label>Temporary password (12+ characters)<input name="password" type="password" minLength={12} required autoComplete="new-password" /></label>
      <label>Role<select name="role"><option value="lead_handler">Lead handler</option><option value="property_manager">Property manager</option><option value="content_editor">Content editor</option><option value="super_admin">Super admin</option></select></label><button>Create account</button></form>
    <h2>Current staff</h2>
    {(data ?? []).map((s) => <form key={s.id} action={change} style={{ display: "flex", gap: ".5rem", alignItems: "center", margin: ".5rem 0" }}><input type="hidden" name="id" value={s.id} />
      <span style={{ minWidth: 180 }}>{s.full_name}{s.id === me.id && " (you)"}</span>
      <select name="role" defaultValue={s.role} aria-label={`Role for ${s.full_name}`}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
      <label><input type="checkbox" name="active" defaultChecked={s.is_active} /> Active</label><button>Update</button></form>)}
  </main>);
}
