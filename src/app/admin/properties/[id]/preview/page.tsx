import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { loadPropertyForPreview } from "@/lib/property";
import { PropertyView } from "@/app/homes/PropertyView";
import { PropertyTabs } from "@/components/AdminTabs";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["property_manager"]);
  const { id } = await params; const p = await loadPropertyForPreview(id);
  if (!p) notFound();
  return (<div><PropertyTabs id={id} active="preview" /><div data-brand="homes" style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--line)" }}><PropertyView p={p} preview /></div></div>);
}
