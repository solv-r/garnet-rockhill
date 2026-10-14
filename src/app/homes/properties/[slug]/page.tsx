import { notFound } from "next/navigation";
import { PropertyView } from "../../PropertyView";
import type { Metadata } from "next";
import { loadProperty as load } from "@/lib/property";
import { formatPrice } from "@/lib/format";
import { urls } from "@/lib/config";
import { publicUrl } from "@/lib/media";

export const dynamic = "force-dynamic";
const STATUS_META = ["sold", "rented", "leased", "withdrawn"];
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Property not found", robots: { index: false } };
  const desc = `${p.title} in ${p.location?.name}. ${formatPrice(p.price, p.currency, p.price_period)}. Ref ${p.reference}.`;
  const cover = (p.images ?? []).find((i: any) => i.id === p.cover_image_id) ?? p.images?.[0]; // eslint-disable-line
  return { title: `${p.title} | Rockhill Homes`, description: desc, alternates: { canonical: `${urls.homes}/properties/${p.slug}` },
    openGraph: { title: p.title, description: desc, images: cover ? [publicUrl("property-images", cover.storage_path)] : undefined },
    robots: STATUS_META.includes(p.status) ? { index: false } : undefined };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  if (!p) notFound();
  return <PropertyView p={p} />;
}
