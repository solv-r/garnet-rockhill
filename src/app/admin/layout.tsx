import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStaff, can } from "@/lib/auth";
export const metadata = { robots: { index: false, follow: false } };
async function logout() { "use server"; const c = await cookies(); c.delete("rh_at"); c.delete("rh_rt"); redirect("/admin/login"); }
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const s = await getStaff();
  if (!s) return <>{children}</>; // login page renders itself; every other admin page calls requireRole()
  const items: [string, string, boolean][] = [
    ["Dashboard", "/admin", true], ["Properties", "/admin/properties", can(s, ["property_manager", "content_editor", "lead_handler"])], ["Enquiries", "/admin/enquiries", can(s, ["lead_handler", "property_manager"])],
    ["Locations", "/admin/locations", can(s, ["property_manager"])], ["Projects & news", "/admin/content", can(s, ["content_editor"])], ["Site content", "/admin/site-content", can(s, ["content_editor"])],
    ["SEO", "/admin/seo", can(s, ["content_editor"])], ["Settings", "/admin/settings", can(s, ["content_editor"])], ["Staff", "/admin/staff", s.role === "super_admin"],
  ];
  return (
    <div data-brand="corporate" style={{ minHeight: "100vh", background: "var(--surface-alt)" }}>
      <header className="admin-bar"><div className="inner">
        <strong>Garnet Rockhill · Admin</strong>
        <nav aria-label="Admin" style={{ display: "flex", gap: ".5rem 1.1rem", flexWrap: "wrap" }}>{items.filter((i) => i[2]).map(([l, h]) => <a key={h} href={h}>{l}</a>)}</nav>
        <span className="who">{s.full_name} ({s.role.replace("_", " ")})</span>
        <form action={logout}><button type="submit" className="btn ghost" style={{ padding: ".35rem .8rem" }}>Sign out</button></form>
      </div></header>
      <div className="container" style={{ padding: "1.5rem 1.25rem 3rem" }}>{children}</div>
    </div>
  );
}
