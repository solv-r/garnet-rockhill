import { Results } from "../Results";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/land", { title: "Land & Plots | Rockhill Homes", description: "Land and plots listed by Rockhill Homes." }); }
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Results sp={await searchParams} base="/land" heading="Land &amp; plots" preset={{ category: "land" }} />; }
