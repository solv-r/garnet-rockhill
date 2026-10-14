"use client";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <p role="status">Loading map…</p> });
export default function Client(props: { styleUrl: string }) { return <MapView {...props} />; }
