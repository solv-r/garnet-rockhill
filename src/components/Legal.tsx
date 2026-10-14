import { getContact, urls } from "@/lib/config";
type Brand = "corporate" | "homes";
const UPDATED = "10 October 2026";
// The yellow notice stays until LEGAL_REVIEWED=true is set in the hosting environment (after a Nigerian lawyer has reviewed this text).
const Banner = () => process.env.LEGAL_REVIEWED === "true" ? null : <p role="note" className="alert" style={{ marginBottom: "1.5rem" }}><strong>Draft for legal review.</strong> This text describes how this website works today. It should be reviewed by a qualified Nigerian legal adviser before launch.</p>;
const Wrap = ({ title, children }: { title: string; children: React.ReactNode }) => <main className="section"><div className="container" style={{ maxWidth: 820 }}><h1>{title}</h1><p className="muted">Last updated: {UPDATED}</p><Banner />{children}</div></main>;
const brandName = (b: Brand) => (b === "homes" ? "Rockhill Homes, a division of Garnet Rockhill Limited" : "Garnet Rockhill Limited");

export async function Privacy({ brand }: { brand: Brand }) {
  const c = await getContact(brand);
  return (<Wrap title="Privacy Policy">
    <p>This policy explains how personal data is collected and used on this website. We handle personal data in line with the Nigeria Data Protection Act 2023 (NDPA) and applicable regulations.</p>
    <h2>1. Who we are</h2>
    <p>The data controller is <strong>Garnet Rockhill Limited</strong> (RC 1431936), {c.address}. {brand === "homes" ? "Rockhill Homes is a division of Garnet Rockhill Limited, not a separate company. " : ""}You can contact us at <a href={`mailto:${c.email}`}>{c.email}</a> or {c.phone}.</p>
    <h2>2. What we collect</h2>
    <ul>
      <li><strong>Enquiry, viewing request and feedback forms:</strong> your name, email address and/or phone number, your message, the property or service you ask about, any preferred viewing time, the website you used, and the date and time of submission.</li>
      <li><strong>Technical data:</strong> like most websites, our hosting provider's servers record technical information such as IP address, browser type and pages requested, for security and reliability.</li>
      <li><strong>Staff accounts:</strong> name, work email and role for people who administer the site.</li>
      <li>If you contact us by phone, email or WhatsApp, we receive the details you send us. WhatsApp and Google Maps links open services run by other companies under their own privacy terms.</li>
    </ul>
    <p>We do not ask for sensitive personal data. Please do not include it in messages. We do not use advertising or analytics trackers on this website.</p>
    <h2>3. Why we use your data and our legal basis</h2>
    <ul>
      <li><strong>To respond to your enquiry or arrange a viewing</strong>, because you asked us to and have acknowledged this policy when submitting a form (consent), and to take steps you request before a transaction.</li>
      <li><strong>To keep the website secure and prevent spam or abuse</strong>, which is a legitimate interest of ours.</li>
      <li><strong>To keep records and meet legal obligations.</strong></li>
    </ul>
    <p>We only use your details to deal with your enquiry and related follow-up. We do not sell personal data.</p>
    <h2>4. Who we share it with</h2>
    <p>We use trusted service providers who process data for us. They may only use it to provide their service:</p>
    <ul>
      <li><strong>Supabase</strong>: database and file storage where enquiries and website content are stored.</li>
      <li><strong>Formspree</strong>: delivers a copy of each form submission to our team's email, and/or <strong>Resend</strong> (an email delivery service), if enabled.</li>
      <li><strong>Our website hosting provider</strong>: serves the website.</li>
      <li><strong>OpenFreeMap</strong>: supplies map images on the property map page. Your browser connects to it directly when you open the map, so it can see your IP address. It states that it does not use cookies.</li>
    </ul>
    <p>We may also disclose information where the law requires it.</p>
    <h2>5. Transfers outside Nigeria</h2>
    <p>Some providers store or process data outside Nigeria. Where that happens we rely on appropriate safeguards as required by the NDPA, such as contractual protections and providers' security commitments.</p>
    <h2>6. How long we keep data</h2>
    <p>We keep enquiry records only for as long as needed to deal with your enquiry, to keep reasonable business records, and to meet legal requirements. When no longer needed, we delete or anonymise them. You can ask us to delete your data at any time (see below).</p>
    <h2>7. Security</h2>
    <p>Enquiries are stored in a protected database. Access is limited to authorised staff with role-based permissions, connections are encrypted, and customer information is never shown on the public website. No system is completely secure, so we cannot guarantee absolute security.</p>
    <h2>8. Your rights</h2>
    <p>Under the NDPA you may ask us to: give you a copy of your personal data; correct it; delete it; restrict or object to our use of it; and give it to you in a portable format. You may withdraw consent at any time (this does not affect what we did before). To use these rights, contact us using the details above. You also have the right to complain to the <strong>Nigeria Data Protection Commission</strong> (ndpc.gov.ng).</p>
    <h2>9. Children</h2>
    <p>This website is not intended for people under 18, and we do not knowingly collect their personal data.</p>
    <h2>10. Changes</h2>
    <p>We may update this policy. The date above shows the latest version.</p>
  </Wrap>);
}

export async function Terms({ brand }: { brand: Brand }) {
  const c = await getContact(brand);
  return (<Wrap title="Terms of Use">
    <p>These terms apply when you use this website, operated by Garnet Rockhill Limited (RC 1431936) ({brandName(brand)}). By using the website you agree to them. If you do not agree, please do not use it.</p>
    <h2>1. Information on this website</h2>
    <p>We try to keep information accurate and up to date, but we do not promise that it is complete, current or error-free. Content is general information. It is not an offer, contract, valuation, or professional, legal or financial advice.</p>
    {brand === "homes" && <><h2>2. Property listings</h2>
      <p>Prices, availability, status and descriptions can change without notice and must be confirmed with us. Upcoming developments are not ready for occupation and any dates are estimates unless confirmed in writing. A property marked sold, rented or leased is not available. Map positions are approximate. See the <a href="/disclaimer">property listing disclaimer</a>.</p>
      <h2>3. Enquiries and viewing requests</h2>
      <p>Submitting an enquiry or viewing request does not create a contract, reservation or confirmed appointment. A viewing is arranged only when we confirm it with you. Short-let enquiries are not bookings until we confirm availability and terms with you in writing. We do not take payments through this website.</p></>}
    <h2>{brand === "homes" ? "4" : "2"}. Acceptable use</h2>
    <p>You must not misuse the website, attempt to gain unauthorised access, send spam or false enquiries, copy or scrape it in bulk, or use it for anything unlawful.</p>
    <h2>{brand === "homes" ? "5" : "3"}. Intellectual property</h2>
    <p>The website, its text, design, logos and photographs belong to Garnet Rockhill Limited or its licensors. You may view and share pages for personal, non-commercial purposes but must not reproduce them commercially without our written permission.</p>
    <h2>{brand === "homes" ? "6" : "4"}. Links and third parties</h2>
    <p>The website may link to other sites and services (for example WhatsApp and Google Maps). We do not control them and are not responsible for their content or privacy practices.</p>
    <h2>{brand === "homes" ? "7" : "5"}. Liability</h2>
    <p>To the extent permitted by law, we are not liable for loss arising from your use of, or reliance on, this website, or from it being unavailable. Nothing in these terms excludes liability that cannot be excluded by law.</p>
    <h2>{brand === "homes" ? "8" : "6"}. Changes and governing law</h2>
    <p>We may update these terms and the website at any time. These terms are governed by the laws of the Federal Republic of Nigeria, and Nigerian courts have jurisdiction over disputes.</p>
    <h2>{brand === "homes" ? "9" : "7"}. Contact</h2>
    <p>{c.address}. <a href={`mailto:${c.email}`}>{c.email}</a>, {c.phone}.</p>
  </Wrap>);
}

export async function Cookies() {
  return (<Wrap title="Cookie and Tracking Notice">
    <p>This website uses as little tracking as possible.</p>
    <h2>Cookies we set</h2>
    <ul><li><strong>Strictly necessary only:</strong> staff who sign in to the administration area receive session cookies (<code>rh_at</code> and <code>rh_rt</code>) so they stay signed in. They are not set for ordinary visitors and are not used for tracking.</li></ul>
    <h2>What we do not use</h2>
    <p>We do not use advertising cookies, analytics cookies, social media pixels or other tracking tools. Because of this we do not show a cookie consent banner. If we add analytics or other tracking in future, we will update this notice and ask for your consent first where required.</p>
    <h2>Third-party content</h2>
    <p>The property map loads map images from OpenFreeMap when you open it, so that service can see your IP address. Links to WhatsApp and Google Maps open those services, which have their own cookie and privacy policies.</p>
    <p>See also our <a href="/privacy">Privacy Policy</a>.</p>
  </Wrap>);
}

export async function Disclaimer() {
  return (<Wrap title="Property Listing Disclaimer">
    <p>Please read this before relying on any listing on Rockhill Homes ({urls.homes.replace(/^https?:\/\//, "")}).</p>
    <ul>
      <li><strong>Verify everything.</strong> Listing details, prices (in Nigerian naira unless stated), availability and status must be verified with Rockhill Homes. They can change without notice.</li>
      <li><strong>No guarantee of title or approvals.</strong> Website content alone does not establish ownership, valid title, planning approval, building approval or legal suitability of any property. Do your own due diligence, including independent legal and survey checks, before paying any money.</li>
      <li><strong>Upcoming developments</strong> are not ready for occupation. Dates, layouts and specifications are estimates and may change unless confirmed in writing.</li>
      <li><strong>Photographs and illustrations</strong> are for guidance. Some images on this website may be placeholders or illustrations and not the actual property.</li>
      <li><strong>Locations on maps are approximate.</strong> They show a general neighbourhood, not an exact address. Exact directions are shared on request.</li>
      <li><strong>Enquiries and viewings</strong> are not bookings or confirmed appointments until we confirm them. Short-let stays are arranged by enquiry only.</li>
      <li>We do not take payments through this website. Never pay money to anyone based only on a website listing; confirm payment details directly with our office.</li>
    </ul>
    <p>See also our <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>.</p>
  </Wrap>);
}
