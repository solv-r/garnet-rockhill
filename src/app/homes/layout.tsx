import type { ReactNode } from "react";
import { getContact, urls, whatsappLink } from "@/lib/config";
import { getContent } from "@/lib/siteContent";
import { WhatsAppIcon } from "@/components/Icons";
import { MobileMenu } from "@/components/MobileMenu";
export const dynamic = "force-dynamic";
const props: [string, string][] = [["For sale", "/sale"], ["For rent / lease", "/rent"], ["Land & plots", "/land"], ["Off-plan & upcoming", "/off-plan"], ["Commercial", "/commercial"], ["Estate developments", "/estates"], ["Short-lets", "/short-lets"], ["All properties", "/properties"]];
export default async function HomesLayout({ children }: { children: ReactNode }) {
  const [c, banner] = await Promise.all([getContact("homes"), getContent("homes", "banner")]);
  const wa = whatsappLink(c.whatsapp_message, c.whatsapp);
  return (
    <div data-brand="homes">
      <a className="skip" href="#main">Skip to content</a>
      {banner.enabled.toLowerCase() === "yes" && banner.text && <div className="banner" role="status">{banner.text} {banner.link_url && <a href={banner.link_url}>{banner.link_text || "Learn more"}</a>}</div>}
      <div className="topbar"><div className="container"><span className="addr">{c.address}</span><span className="links"><a href={`tel:${c.phone}`}>{c.phone}</a><a href={`mailto:${c.email}`}>{c.email}</a><a href={urls.corporate}>Garnet Rockhill ↗</a></span></div></div>
      <header className="site-header"><div className="container bar">
        <a className="logo" href="/"><img src="/brand/rockhill-homes.png" alt="Rockhill Homes by Garnet Rockhill Limited" style={{ height: 66 }} /></a>
        <nav className="nav" aria-label="Main">
          <a href="/">Home</a>
          <div className="has-dd"><a href="/properties" aria-haspopup="true">Properties</a><div className="dd">{props.map(([l, h]) => <a key={h} href={h}>{l}</a>)}</div></div>
          <a href="/map">Map</a><a href="/about">About</a><a href="/contact">Contact</a>
        </nav>
        <a className="btn" href="/contact">Request a viewing</a>
        <MobileMenu items={[{ label: "Home", href: "/" }, { label: "Properties", href: "/properties", children: props.map(([label, href]) => ({ label, href })) }, { label: "Map", href: "/map" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }]} cta={{ label: "Request a viewing", href: "/contact" }} phone={c.phone} whatsapp={wa} />
      </div></header>
      <div id="main">{children}</div>
      <a className="float-wa" href={wa} aria-label="Chat with Rockhill Homes on WhatsApp"><WhatsAppIcon /><span>WhatsApp us</span></a>
      <footer className="footer"><div className="container">
        <div className="cols">
          <div><div className="brandline"><strong style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>Rockhill Homes</strong></div><p><small>A division of Garnet Rockhill Limited (RC 1431936)</small></p><p>{c.address}</p></div>
          <div><h3>Properties</h3><p>{props.slice(0, 5).map(([l, h]) => <span key={h}><a href={h}>{l}</a><br /></span>)}</p></div>
          <div><h3>Contact</h3><p><a href={`tel:${c.phone}`}>{c.phone}</a><br /><a href={`mailto:${c.email}`}>{c.email}</a><br /><a href={wa}>WhatsApp</a><br /><a href="/contact">Request a viewing</a></p></div>
          <div><h3>Company</h3><p><a href="/about">About Rockhill Homes</a><br /><a href={urls.corporate}>Garnet Rockhill (corporate)</a><br /><a href="/map">Property map</a></p></div>
        </div>
        <div className="legal"><a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Use</a> · <a href="/cookies">Cookie notice</a> · <a href="/disclaimer">Listing disclaimer</a><br />Listing details and availability must be verified with the company. Website content does not establish ownership, valid title or planning approval.</div>
      </div></footer>
    </div>
  );
}
