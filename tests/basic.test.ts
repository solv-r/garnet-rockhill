import { describe, it, expect } from "vitest";
import { formatPrice } from "../src/lib/format";
import { enquirySchema } from "../src/lib/enquiry";
import { whatsappLink } from "../src/lib/config";
const base = { source_site: "homes", kind: "property", name: "Ada Obi", privacy_ack: true, idempotency_key: "abcdefgh1234" };
describe("format", () => { it("formats naira", () => { expect(formatPrice(25000000)).toContain("25,000,000"); expect(formatPrice(null)).toBe("Price on request"); }); });
describe("enquiry schema", () => {
  it("needs email or phone", () => expect(enquirySchema.safeParse(base).success).toBe(false));
  it("accepts valid", () => expect(enquirySchema.safeParse({ ...base, phone: "+234 903 666 6987" }).success).toBe(true));
  it("requires privacy ack", () => expect(enquirySchema.safeParse({ ...base, phone: "08030000000", privacy_ack: false }).success).toBe(false));
  it("lets the route see a filled honeypot (route discards it)", () => expect(enquirySchema.safeParse({ ...base, phone: "08030000000", website: "x" }).success).toBe(true));
});
describe("whatsapp", () => { it("encodes message", () => expect(whatsappLink("Ref RH-1 & more")).toBe("https://wa.me/2349036666987?text=Ref%20RH-1%20%26%20more")); });
