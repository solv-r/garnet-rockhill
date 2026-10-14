import { z } from "zod";
export const enquirySchema = z.object({
  source_site: z.enum(["corporate", "homes"]),
  kind: z.enum(["general", "business", "property", "viewing", "upcoming", "feedback"]),
  property_ref: z.string().max(20).optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number").optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional(),
  preferred_viewing: z.string().datetime().optional().or(z.literal("")),
  privacy_ack: z.literal(true, { errorMap: () => ({ message: "Please acknowledge the privacy notice" }) }),
  idempotency_key: z.string().min(8).max(64),
  website: z.string().max(200).optional(), // honeypot: real users leave it empty; the route silently discards bots
}).refine((d) => d.email || d.phone, { message: "Provide an email or phone number", path: ["email"] });
export type EnquiryInput = z.infer<typeof enquirySchema>;

// Naive per-instance limiter. On serverless this is best-effort only; see docs for Turnstile/Upstash upgrade.
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, max = 5, windowMs = 10 * 60_000) {
  const now = Date.now(); const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(ip, arr); return arr.length > max;
}
