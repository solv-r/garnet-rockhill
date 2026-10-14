import "../styles/tokens.css";
import "../styles/globals.css";
import type { ReactNode } from "react";
export const metadata = { robots: undefined };
// suppressHydrationWarning: browser extensions (e.g. Grammarly) add attributes to <html>/<body> before React loads, which would otherwise log a harmless hydration warning in development.
export default function Root({ children }: { children: ReactNode }) {
  return <html lang="en-NG" suppressHydrationWarning><body suppressHydrationWarning>{children}</body></html>;
}
