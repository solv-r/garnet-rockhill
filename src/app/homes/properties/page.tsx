import { Results } from "../Results";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/properties", { title: "Properties for Sale and Rent | Rockhill Homes", description: "Search houses, apartments, land and developments from Rockhill Homes." }); }
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Results sp={await searchParams} base="/properties" heading="Properties" />; }
