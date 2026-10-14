import { Results } from "../Results";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/commercial", { title: "Commercial Properties | Rockhill Homes", description: "Commercial property listed by Rockhill Homes." }); }
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Results sp={await searchParams} base="/commercial" heading="Commercial properties" preset={{ category: "commercial" }} />; }
