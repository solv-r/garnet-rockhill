import type { ReactNode } from "react";
import { getContact, urls, whatsappLink } from "@/lib/config";
import { getContent } from "@/lib/siteContent";
import { services, company } from "@/lib/corporate-content";
import { Emphasis } from "@/components/Emphasis";
import { WhatsAppIcon } from "@/components/Icons";
import { MobileMenu } from "@/components/MobileMenu";
export const dynamic = "force-dynamic";
export default async function CorpLayout({ children }: { children: ReactNode }) {
  const [c, banner, cta] = await Promise.all([getContact("corporate"), getContent("corporate", "banner"), getContent("corporate", "cta")]);
  const wa = whatsappLink(c.whatsapp_message, c.whatsapp);
  const org = { "@context": "https://schema.org", "@type": "Organization", name: "Garnet Rockhill Limited", url: urls.corporate, telephone: c.phone, email: c.email, address: c.address, logo: `${urls.corporate}/brand/garnet-rockhill.png` };
  return (
    <div data-brand="corporate">
      <a className="skip" href="#main">Skip to content</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org).replace(/</g, "\\u003c") }} />
      {banner.enabled.toLowerCase() === "yes" && banner.text && <div className="banner" role="status">{banner.text} {banner.link_url && <a href={banner.link_url}>{banner.link_text || "Learn more"}</a>}</div>}
      <div className="topbar"><div className="container"><span className="addr">{c.address}</span><span className="links"><a href={`tel:${c.phone}`}>{c.phone}</a><a href={`mailto:${c.email}`}>{c.email}</a></span></div></div>
      <header className="site-header"><div className="container bar">
        <a className="logo" href="/"><img src="/brand/garnet-rockhill.png" alt="Garnet Rockhill Ltd, General Contracts and Consultancy" /></a>
        <nav className="nav" aria-label="Main">
          <div className="has-dd"><a href="/about" aria-haspopup="true">Company</a><div className="dd"><a href="/about">About us</a><a href="/sectors">Sectors &amp; capabilities</a><a href="/hse">Health, safety &amp; environment</a></div></div>
          <div className="has-dd"><a href="/services" aria-haspopup="true">Services</a><div className="dd">{services.map((s) => <a key={s.slug} href={`/services/${s.slug}`}>{s.title}</a>)}</div></div>
          <a href="/projects">Projects</a><a href="/news">News</a><a href="/contact">Contact</a>
        </nav>
        <a className="btn outline" href={urls.homes}>Rockhill Homes →</a>
        <MobileMenu items={[{ label: "Home", href: "/" }, { label: "Company", href: "/about", children: [{ label: "About us", href: "/about" }, { label: "Sectors & capabilities", href: "/sectors" }, { label: "Health, safety & environment", href: "/hse" }] }, { label: "Services", href: "/services", children: [{ label: "All services", href: "/services" }, ...services.map((s) => ({ label: s.title, href: `/services/${s.slug}` }))] }, { label: "Projects", href: "/projects" }, { label: "News", href: "/news" }, { label: "Contact", href: "/contact" }]} cta={{ label: "Make a business enquiry", href: "/contact" }} phone={c.phone} whatsapp={wa} />
      </div></header>
      <div id="main">{children}</div>
      <section className="cta-final" aria-label="Contact us"><div className="container">
        <div><h2><Emphasis text={cta.title} /></h2><p>{cta.text}</p></div>
        <div className="actions"><a className="btn light" href="/contact">{cta.button}</a><a className="btn ghost" href={urls.homes}>Browse Rockhill Homes →</a></div>
      </div></section>
      <a className="float-wa" href={wa} aria-label="Chat with Garnet Rockhill on WhatsApp"><WhatsAppIcon /><span>WhatsApp us</span></a>
      <footer className="footer"><div className="container">
        <div className="cols">
          <div><strong style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>Garnet Rockhill Limited</strong><p><small>Incorporated {company.year} · {company.rc} · General contracts and consultancy</small></p><p>{c.address}</p></div>
          <div><h3>Services</h3><p>{services.map((s) => <span key={s.slug}><a href={`/services/${s.slug}`}>{s.title}</a><br /></span>)}</p></div>
          <div><h3>Contact</h3><p><a href={`tel:${c.phone}`}>{c.phone}</a><br /><a href={`mailto:${c.email}`}>{c.email}</a><br /><a href={wa}>WhatsApp</a><br /><a href="/contact">Business enquiry</a></p></div>
          <div><h3>Company</h3><p><a href="/about">About us</a><br /><a href="/projects">Projects</a><br /><a href="/news">News</a><br /><a href={urls.homes}>Rockhill Homes</a></p></div>
        </div>
        <div className="legal"><a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Use</a> · <a href="/cookies">Cookie notice</a></div>
      </div></footer>
    </div>
  );
}
