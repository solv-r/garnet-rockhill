import { Results } from "../Results";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/off-plan", { title: "Off-plan & Upcoming Developments | Rockhill Homes", description: "Upcoming developments. These are not yet ready for occupation." }); }
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Results sp={await searchParams} base="/off-plan" heading="Off-plan &amp; upcoming developments" preset={{ category: "off-plan", status: "upcoming,available" }} />; }
