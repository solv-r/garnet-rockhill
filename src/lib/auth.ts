import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serviceDb } from "./supabase";

export type Role = "super_admin" | "property_manager" | "content_editor" | "lead_handler";
export type Staff = { id: string; email: string | undefined; full_name: string; role: Role };

/** Verifies the session token with Supabase on every request, then loads the staff profile. Never trusts the client. */
export async function getStaff(): Promise<Staff | null> {
  const token = (await cookies()).get("rh_at")?.value;
  if (!token) return null;
  const db = serviceDb();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: prof } = await db.from("staff_profiles").select("full_name, role, is_active").eq("id", data.user.id).maybeSingle();
  if (!prof || !prof.is_active) return null;
  return { id: data.user.id, email: data.user.email, full_name: prof.full_name, role: prof.role as Role };
}
/** Call at the top of every admin page AND every server action. super_admin passes all checks. */
export async function requireRole(allowed: Role[]): Promise<Staff> {
  const s = await getStaff();
  if (!s) redirect("/admin/login");
  if (s.role !== "super_admin" && !allowed.includes(s.role)) redirect("/admin?denied=1"); // friendly redirect; the action or page never runs
  return s;
}
export const can = (s: Staff, allowed: Role[]) => s.role === "super_admin" || allowed.includes(s.role);
