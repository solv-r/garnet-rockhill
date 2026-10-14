// Placeholder artwork lives in /public/placeholders. See docs/PLACEHOLDER_PHOTOS.md for how to replace each one with real photos.
export const PH = {
  heroCorporate: "/placeholders/hero-corporate.svg", heroHomes: "/placeholders/hero-homes.svg", project: "/placeholders/project.svg", news: "/placeholders/news.svg",
  service: (slug: string) => `/placeholders/service-${slug}.svg`,
  property: (category?: string | null) => `/placeholders/property-${["house", "apartment", "land", "commercial"].includes(category ?? "") ? category : category === "luxury-home" ? "house" : category === "estate" || category === "off-plan" || category === "short-let" ? "house" : "house"}.svg`,
};
