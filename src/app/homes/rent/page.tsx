import { Results } from "../Results";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/rent", { title: "Properties for Rent and Lease | Rockhill Homes", description: "Properties available to rent or lease from Rockhill Homes." }); }
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Results sp={await searchParams} base="/rent" heading="For rent / lease" preset={{ tx: "rent" }} />; }
