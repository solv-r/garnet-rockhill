import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { publicDb } from "@/lib/supabase";
import { serviceDb } from "@/lib/supabase";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim(), password = String(formData.get("password") ?? "");
  const { data, error } = await publicDb().auth.signInWithPassword({ email, password });
  // Same message for every failure so we do not reveal which emails exist.
  if (error || !data.session) redirect("/admin/login?e=1");
  const { data: prof } = await serviceDb().from("staff_profiles").select("is_active").eq("id", data.user.id).maybeSingle();
  if (!prof?.is_active) redirect("/admin/login?e=1");
  const c = await cookies(); const o = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  c.set("rh_at", data.session.access_token, { ...o, maxAge: data.session.expires_in });
  if (data.session.refresh_token) c.set("rh_rt", data.session.refresh_token, { ...o, maxAge: 60 * 60 * 24 * 14 });
  redirect("/admin");
}
export const metadata = { title: "Staff sign in", robots: { index: false, follow: false } };
export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const sp = await searchParams;
  return (
    <main data-brand="corporate" style={{ maxWidth: 400, margin: "4rem auto", padding: "1rem" }}>
      <h1>Staff sign in</h1>
      {sp.e && <p role="alert" className="alert error">Sign-in failed. Check your details or ask an administrator.</p>}
      <form action={login} className="panel" style={{ display: "grid", gap: ".75rem" }}>
        <label>Email<input name="email" type="email" required autoComplete="username" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
