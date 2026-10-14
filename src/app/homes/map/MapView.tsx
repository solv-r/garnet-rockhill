"use client";
import { useEffect, useRef, useState } from "react";
import "../../../styles/maplibre-gl.css";
import { formatPrice } from "@/lib/format";
type Pin = { area: string; lat: number; lng: number; items: { slug: string; title: string; reference: string; price: number | null; period: string | null; currency: string; status: string }[] };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export default function MapView({ styleUrl }: { styleUrl: string }) {
  const ref = useRef<HTMLDivElement>(null); const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  useEffect(() => {
    let map: import("maplibre-gl").Map | undefined; let dead = false;
    (async () => {
      try {
        const ml = await import("maplibre-gl");
        // Load the map's background worker from our own site (public/vendor). Bundled workers break in minified production builds.
        ml.setWorkerUrl("/vendor/maplibre-gl-csp-worker.js");
        const res = await fetch("/api/map-pins"); if (!res.ok) throw new Error();
        const { pins } = (await res.json()) as { pins: Pin[] }; if (dead || !ref.current) return;
        if (!pins.length) { setState("empty"); return; }
        map = new ml.Map({ container: ref.current, style: styleUrl, center: [pins[0].lng, pins[0].lat], zoom: 10 });
        map.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
        const bounds = new ml.LngLatBounds();
        for (const p of pins) {
          const el = document.createElement("button"); el.type = "button"; el.setAttribute("aria-label", `${p.area}: ${p.items.length} propert${p.items.length === 1 ? "y" : "ies"}`);
          el.style.cssText = "background:#083848;color:#fff;border:2px solid #fff;border-radius:999px;width:34px;height:34px;font:700 14px system-ui;cursor:pointer;padding:0";
          el.textContent = String(p.items.length);
          const html = `<strong>${esc(p.area)}</strong> (${p.items.length})<ul style="padding-left:1rem;margin:.25rem 0">` + p.items.slice(0, 6).map((i) => `<li><a href="/properties/${encodeURIComponent(i.slug)}">${esc(i.title)}</a><br>${esc(formatPrice(i.price, i.currency, i.period))}${i.status === "upcoming" ? " · upcoming" : ""}</li>`).join("") + "</ul>";
          new ml.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(new ml.Popup({ offset: 20 }).setHTML(html)).addTo(map); bounds.extend([p.lng, p.lat]);
        }
        if (pins.length > 1) map.fitBounds(bounds, { padding: 60, maxZoom: 13 });
        setState("ready");
      } catch { if (!dead) setState("error"); }
    })();
    return () => { dead = true; map?.remove(); };
  }, [styleUrl]);
  return (<div>
    {state === "loading" && <p role="status">Loading map…</p>}
    {state === "error" && <p role="alert" className="alert error">The map could not be loaded. You can still <a href="/properties">browse the list</a>.</p>}
    {state === "empty" && <div className="empty">No properties with a map position are published yet. <a href="/properties">Browse the list</a>.</div>}
    <div ref={ref} style={{ height: "70vh", minHeight: 360, borderRadius: 10, overflow: "hidden", display: state === "empty" || state === "error" ? "none" : "block" }} aria-label="Map of properties by area" />
    <p className="muted" style={{ fontSize: ".85rem" }}>Each marker shows a neighbourhood and how many properties are listed there, not an exact property location.</p>
  </div>);
}
