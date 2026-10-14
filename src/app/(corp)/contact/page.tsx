import { EnquiryForm } from "@/app/homes/EnquiryForm";
import { getContact, whatsappLink } from "@/lib/config";
import { enquiryCategories } from "@/lib/corporate-content";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("corporate", "/contact", { title: "Contact Garnet Rockhill Limited", description: "Contact Garnet Rockhill Limited in Abuja for construction, development and consultancy enquiries." }); }
export default async function Contact() {
  const c = await getContact("corporate");
  return (<main className="section"><div className="container split"><div><h1>Contact us</h1>
    <div className="panel"><h2 style={{ marginTop: 0 }}>Business enquiry</h2><EnquiryForm kind="business" site="corporate" categories={enquiryCategories} /></div>
    <div className="panel" style={{ marginTop: "1.25rem" }}><h2 style={{ marginTop: 0 }}>Feedback</h2><p className="muted">Tell us how we can improve our service or website.</p><EnquiryForm kind="feedback" site="corporate" /></div></div>
    <aside className="panel" style={{ alignSelf: "start" }}><h2 style={{ marginTop: 0 }}>Our office</h2><p>{c.address}</p>
      <p><a href={`tel:${c.phone}`}>{c.phone}</a><br /><a href={`mailto:${c.email}`}>{c.email}</a></p>
      <p><a className="btn" href={whatsappLink(c.whatsapp_message, c.whatsapp)}>Chat on WhatsApp</a></p>
      <p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`}>Get directions on Google Maps</a></p></aside></div></main>);
}
