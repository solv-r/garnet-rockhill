"use client";
import { useEffect, useRef, useState } from "react";

export type MenuItem = { label: string; href: string; children?: { label: string; href: string }[] };

/**
 * Phone/tablet menu. Icon-only toggle (hamburger, becomes an X when open).
 * Closes with: the X button, tapping the dimmed area, the Escape key, tapping any link, or widening the window.
 * While open, the page behind does not scroll. The links are always in the page HTML (the panel is just hidden).
 */
export function MobileMenu({ items, cta, phone, whatsapp }: { items: MenuItem[]; cta: { label: string; href: string }; phone: string; whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    const onResize = () => { if (window.innerWidth > 940) setOpen(false); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); };
  }, [open]);

  return (
    <div className="mobile-menu">
      <button ref={toggle} type="button" className="mm-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu-panel" onClick={() => setOpen((o) => !o)}>
        {open
          ? <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          : <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}
      </button>
      <div className="mm-backdrop" hidden={!open} onClick={close} aria-hidden="true" />
      <div className="mm-panel" id="mobile-menu-panel" hidden={!open}>
        <nav aria-label="Mobile" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) close(); }}>
          {items.map((i) => i.children
            ? <details key={i.href} className="mm-group"><summary>{i.label}</summary><div>{i.children.map((c) => <a key={c.href} href={c.href}>{c.label}</a>)}</div></details>
            : <a key={i.href} href={i.href}>{i.label}</a>)}
        </nav>
        <div className="mm-actions" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) close(); }}>
          <a className="btn" href={cta.href}>{cta.label}</a><a className="btn outline" href={`tel:${phone}`}>Call us</a><a className="btn outline" href={whatsapp}>WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
