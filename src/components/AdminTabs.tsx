export function PropertyTabs({ id, active }: { id: string; active: "details" | "photos" | "preview" }) {
  return (<nav className="tabs" aria-label="Property sections">
    <a href={`/admin/properties/${id}`} className={active === "details" ? "on" : ""}>Details</a>
    <a href={`/admin/properties/${id}/images`} className={active === "photos" ? "on" : ""}>Photos</a>
    <a href={`/admin/properties/${id}/preview`} className={active === "preview" ? "on" : ""}>Preview</a>
  </nav>);
}
