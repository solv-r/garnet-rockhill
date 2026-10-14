const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];
const nextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "40mb" } },
  images: { remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }] },
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
};
export default nextConfig;
