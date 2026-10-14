"use client";
import { useRef, useState } from "react";

// crypto.randomUUID only exists on secure pages (https or localhost); fall back so the page never crashes on plain http.
function newKey() {
  const c = typeof globalThis !== "undefined" ? (globalThis as { crypto?: Crypto }).crypto : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") c.getRandomValues(bytes); else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
type Props = { kind: "general" | "business" | "property" | "viewing" | "upcoming" | "feedback"; propertyRef?: string; showViewing?: boolean; site?: "corporate" | "homes"; categories?: string[] };
export function EnquiryForm({ kind, propertyRef, showViewing, site = "homes", categories }: Props) {
  const key = useRef(newKey());          // one key per form instance blocks double-submits
  const [state, setState] = useState<{ s: "idle" | "sending" | "ok" | "error"; msg?: string; ref?: string; fields?: Record<string, string[]> }>({ s: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.s === "sending") return;
    const f = new FormData(e.currentTarget);
    const viewing = String(f.get("preferred_viewing") || "");
    setState({ s: "sending" });
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_site: site, kind, property_ref: propertyRef,
          name: f.get("name"), email: f.get("email") || undefined, phone: f.get("phone") || undefined,
          message: (f.get("category") ? `[${f.get("category")}] ` : "") + (String(f.get("message") ?? "")) || undefined,
          preferred_viewing: viewing ? new Date(viewing).toISOString() : undefined,
          privacy_ack: f.get("privacy_ack") === "on", idempotency_key: key.current, website: f.get("website") || undefined,
        }),
      });
      const j = await res.json();
      if (j.ok) setState({ s: "ok", ref: j.reference });
      else setState({ s: "error", msg: j.error ?? "Something went wrong.", fields: j.fields });
    } catch { setState({ s: "error", msg: "Network problem. Your enquiry was not sent. Please try again or contact us by phone or WhatsApp." }); }
  }

  if (state.s === "ok") return (
    <div role="status" className="alert ok">
      <strong>Thank you. We have received your {kind === "viewing" ? "viewing request" : kind === "feedback" ? "feedback" : "enquiry"}.</strong>
      <p>Reference: {state.ref}. {kind === "viewing" && "This is a request only, not a confirmed appointment, until we confirm it with you."}</p>
    </div>
  );
  const err = (n: string) => state.fields?.[n]?.[0] && <span role="alert" style={{ color: "#a11" }}>{state.fields[n][0]}</span>;
  return (
    <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: ".5rem" }} aria-busy={state.s === "sending"}>
      <label>Full name<input name="name" required autoComplete="name" />{err("name")}</label>
      <label>Email<input name="email" type="email" autoComplete="email" />{err("email")}</label>
      <label>Phone<input name="phone" type="tel" autoComplete="tel" placeholder="+234 ..." />{err("phone")}</label>
      {showViewing && <label>Preferred viewing date and time (optional)<input name="preferred_viewing" type="datetime-local" /></label>}
      {categories && <label>Enquiry type<select name="category" required>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>}
      <label>Message<textarea name="message" rows={4} maxLength={2000} /></label>
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label><input type="checkbox" name="privacy_ack" required /> I agree that my details may be used and shared with our service providers to respond to this message. <a href="/privacy">Privacy notice</a></label>
      {err("privacy_ack")}
      {state.s === "error" && <p role="alert" className="alert error">{state.msg}</p>}
      <button type="submit" disabled={state.s === "sending"}>{state.s === "sending" ? "Sending…" : kind === "viewing" ? "Request viewing" : kind === "feedback" ? "Send feedback" : "Send enquiry"}</button>
    </form>
  );
}
