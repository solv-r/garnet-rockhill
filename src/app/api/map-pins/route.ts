import { NextResponse } from "next/server";
import { publicDb } from "@/lib/supabase";
export const dynamic = "force-dynamic";
// Public endpoint: one pin per AREA (neighbourhood centroid), never per-property coordinates. Only published, available/upcoming listings.
export async function GET() {
  const { data, error } = await publicDb().from("properties")
    .select("slug, title, reference, price, price_period, currency, status, location:locations(name, public_lat, public_lng)")
    .eq("publish", "published").in("status", ["available", "upcoming"]).limit(500);
  if (error) return NextResponse.json({ error: "Unavailable" }, { status: 500 });
  const pins = new Map<string, { area: string; lat: number; lng: number; items: Record<string, unknown>[] }>();
  for (const p of (data ?? []) as any[]) { // eslint-disable-line
    const l = p.location; if (!l || l.public_lat == null || l.public_lng == null) continue;
    const k = `${l.public_lat},${l.public_lng}`; const pin: { area: string; lat: number; lng: number; items: Record<string, unknown>[] } = pins.get(k) ?? { area: l.name, lat: Number(l.public_lat), lng: Number(l.public_lng), items: [] };
    pin.items.push({ slug: p.slug, title: p.title, reference: p.reference, price: p.price, period: p.price_period, currency: p.currency, status: p.status }); pins.set(k, pin);
  }
  return NextResponse.json({ pins: [...pins.values()] }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
