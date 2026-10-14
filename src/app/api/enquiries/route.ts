import { NextRequest, NextResponse } from "next/server";
import { serviceDb } from "@/lib/supabase";
import { enquirySchema, rateLimited } from "@/lib/enquiry";
import { notifyAndRecord } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  let body: unknown; try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 }); }
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please check the form", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true }); // bot: pretend success, store nothing

  const db = serviceDb();
  let property_id: string | null = null;
  if (d.property_ref) {
    const { data } = await db.from("properties").select("id").eq("reference", d.property_ref).eq("publish", "published").maybeSingle();
    property_id = data?.id ?? null;
  }
  // 1) SAVE FIRST. Idempotency key makes a double-click return the original record.
  const { data: row, error } = await db.from("enquiries").insert({
    source_site: d.source_site, kind: d.kind, property_id, name: d.name,
    email: d.email || null, phone: d.phone || null, message: d.message || null,
    preferred_viewing: d.preferred_viewing || null, privacy_ack_at: new Date().toISOString(), idempotency_key: d.idempotency_key,
  }).select("id, reference").single();
  if (error) {
    if (error.code === "23505") {
      const { data: ex } = await db.from("enquiries").select("reference").eq("idempotency_key", d.idempotency_key).single();
      return NextResponse.json({ ok: true, reference: ex?.reference, duplicate: true });
    }
    console.error("enquiry insert failed", error.message);
    return NextResponse.json({ ok: false, error: "We could not save your enquiry. Please try again or contact us by phone or WhatsApp." }, { status: 500 });
  }
  // 2) THEN notify (Formspree or Resend, plus customer acknowledgement); the real outcome is recorded on the row. Failure never loses the enquiry.
  const brand = d.source_site === "homes" ? "Rockhill Homes (Garnet Rockhill Limited)" : "Garnet Rockhill Limited";
  await notifyAndRecord(row.id, { reference: row.reference, source_site: d.source_site, kind: d.kind, name: d.name, email: d.email || null, phone: d.phone || null, message: d.message || null, property_ref: d.property_ref ?? null, preferred_viewing: d.preferred_viewing || null }, brand);
  return NextResponse.json({ ok: true, reference: row.reference });
}
