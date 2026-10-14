import { Results } from "../Results";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/sale", { title: "Properties for Sale | Rockhill Homes", description: "Homes, apartments and plots for sale from Rockhill Homes." }); }
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Results sp={await searchParams} base="/sale" heading="Properties for sale" preset={{ tx: "sale" }} />; }
