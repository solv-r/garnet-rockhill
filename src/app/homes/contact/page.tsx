import { EnquiryForm } from "../EnquiryForm";
import { getContact, whatsappLink } from "@/lib/config";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/contact", { title: "Contact & Viewing Requests | Rockhill Homes", description: "Contact Rockhill Homes or request a property viewing." }); }
export default async function Contact() {
  const c = await getContact("homes");
  return (<main className="section"><div className="container split"><div><h1>Contact &amp; viewing requests</h1>
    <div className="panel"><h2 style={{ marginTop: 0 }}>Send an enquiry or viewing request</h2><p className="muted">Viewing requests are not confirmed appointments until we confirm them with you.</p><EnquiryForm kind="general" showViewing /></div>
    <div className="panel" style={{ marginTop: "1.25rem" }}><h2 style={{ marginTop: 0 }}>Feedback</h2><p className="muted">Tell us how we can improve Rockhill Homes.</p><EnquiryForm kind="feedback" /></div></div>
    <aside className="panel" style={{ alignSelf: "start" }}><h2 style={{ marginTop: 0 }}>Our office</h2><p>{c.address}</p>
      <p><a href={`tel:${c.phone}`}>{c.phone}</a><br /><a href={`mailto:${c.email}`}>{c.email}</a></p>
      <p><a className="btn" href={whatsappLink(c.whatsapp_message, c.whatsapp)}>Chat on WhatsApp</a></p>
      <p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`}>Get directions on Google Maps</a></p></aside></div></main>);
}
