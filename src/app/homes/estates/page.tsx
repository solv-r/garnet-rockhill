import { Results } from "../Results";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/estates", { title: "Estate Developments | Rockhill Homes", description: "Estate developments by Rockhill Homes." }); }
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Results sp={await searchParams} base="/estates" heading="Estate developments" preset={{ category: "estate" }} />; }
