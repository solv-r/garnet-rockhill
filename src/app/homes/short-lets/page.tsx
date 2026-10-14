import { Results } from "../Results";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/short-lets", { title: "Short-let Properties | Rockhill Homes", description: "Short-let properties. Stays are arranged by enquiry; no booking is confirmed online." }); }
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <Results sp={await searchParams} base="/short-lets" heading="Short-let properties" preset={{ category: "short-let" }} />; }
