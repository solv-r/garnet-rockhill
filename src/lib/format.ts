export function formatPrice(amount: number | string | null, currency = "NGN", period?: string | null) {
  if (amount === null || amount === undefined || amount === "") return "Price on request";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "Price on request";
  const s = new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  const suffix = period && period !== "total" ? ` / ${period}` : "";
  return s + suffix;
}
