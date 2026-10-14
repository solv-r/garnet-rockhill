const P = { className: "ico", viewBox: "0 0 24 24", "aria-hidden": true } as const;
export const Bed = () => <svg {...P}><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.5"/></svg>;
export const Bath = () => <svg {...P}><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM7 12V6a2 2 0 0 1 4 0M6 21l1-2M18 21l-1-2"/></svg>;
export const Area = () => <svg {...P}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>;
export const Pin = () => <svg {...P}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
export const WhatsAppIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.1L2 22l5-1.3A11 11 0 1 0 20.5 3.5Zm-8.4 17a9 9 0 0 1-4.6-1.3l-.3-.2-3 .8.8-2.9-.2-.3a9 9 0 1 1 7.3 3.9Zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.5-.1-.7.1-.8.9-.9 1.1-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.9-2c-.2-.5-.5-.4-.7-.4h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.4 3.4 14.7 14.7 0 0 0 5.6 4.9c2.1.9 2.9 1 3.9.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4Z"/></svg>;

const PATHS: Record<string, React.ReactNode> = {
  Integrity: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
  Excellence: <><path d="M6 4h12l3 5-9 11L3 9l3-5Z" /><path d="M3 9h18M9 4l3 5 3-5M12 20L9 9m3 11l3-11" /></>,
  Safety: <><path d="M5 15a7 7 0 0 1 14 0" /><path d="M3 15h18v3H3zM10 9V6h4v3" /></>,
  Innovation: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></>,
  Sustainability: <><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" /><path d="M5 19c2-5 5-8 9-10" /></>,
  Teamwork: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2c3 .2 5 2.4 5 5.8" /></>,
  "Customer Focus": <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></>,
  Quality: <><path d="M12 3l9 5-9 5-9-5 9-5Z" /><path d="M3 12.5l9 5 9-5M3 17l9 5 9-5" /></>,
  SafetyEnvironment: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="M9 14c0-3 2-5 6-5 0 3-2 5-5 5Z" /></>,
  Delivery: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9zM9 13.5l2 2 4-4" /></>,
};
/** Original line icons for the company values and the three commitment pillars. */
export function NamedIcon({ name, large = false }: { name: string; large?: boolean }) {
  return <svg className={large ? "ico ico-lg" : "ico"} viewBox="0 0 24 24" aria-hidden="true">{PATHS[name] ?? null}</svg>;
}
