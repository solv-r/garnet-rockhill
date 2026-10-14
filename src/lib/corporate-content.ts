// Source: supplied company profile + approved brief. Capabilities only; no project claims, certifications or statistics.
export const company = { name: "Garnet Rockhill Limited", rc: "RC 1431936", incorporated: "16 August 2017", year: "2017" };
export type Service = { slug: string; action: string; title: string; summary: string; intro: string; capabilities: string[]; note?: string };
export const services: Service[] = [
  { slug: "construction", action: "See what we build", title: "Construction Services", summary: "General civil, building and infrastructure construction.",
    intro: "Garnet Rockhill delivers construction work across civil, building and infrastructure scopes, with attention to quality, safety and durability.",
    capabilities: ["General civil construction", "Residential, commercial and industrial building construction", "Road construction and rehabilitation", "Drainage systems and culverts", "General infrastructure development", "Construction and renovation", "Infrastructure and industrial facilities", "Bridge construction and renovation, subject to project scope and confirmed capability"] },
  { slug: "real-estate-development", action: "Explore development", title: "Real Estate Development", summary: "Planning and delivery of residential, commercial and mixed-use developments.",
    intro: "From early planning to project coordination, the company develops property with efficient land use and sustainable practices in mind.",
    capabilities: ["Development planning", "Feasibility studies and market analysis", "Residential, commercial and mixed-use developments", "Site acquisition and planning, where applicable", "Project coordination and delivery", "Efficient land use and sustainable development practices"],
    note: "Residential property for sale and rent is presented through Rockhill Homes." },
  { slug: "consultancy", action: "See how we advise", title: "Consultancy", summary: "Advisory support on strategy, operations and organisational change.",
    intro: "Garnet Rockhill offers consultancy to organisations seeking structured advice on strategy and operations.",
    capabilities: ["Competitive analysis", "Corporate strategy", "Operations management", "Human resources", "Culture transformation", "Change management", "Business continuity and enterprise risk advisory, where applicable", "IT-related consultancy"] },
  { slug: "design-build", action: "See how we deliver", title: "Design–Build", summary: "Integrated design and construction under one coordinated delivery team.",
    intro: "A single point of coordination for design and construction, aimed at practical, well-considered buildings delivered within agreed terms.",
    capabilities: ["Integrated design and construction", "Design and project coordination", "Functional, practical and aesthetically considered solutions", "Project delivery, cost control and timeline coordination within agreed terms"] },
  { slug: "urban-planning-design", action: "See our capability", title: "Urban Planning & Design", summary: "Planning and layout design for developments and communities.",
    intro: "Garnet Rockhill provides urban planning and design capability to support organised, well-planned development.",
    capabilities: ["Master planning and layout design support", "Site and land-use planning input for developments"],
    note: "Specific professional registrations for planning work will be shown here only once confirmed." },
];
export const values = [
  ["Integrity", "Honest, transparent dealings with clients, partners and communities."],
  ["Excellence", "A commitment to high-quality work and professional execution."],
  ["Safety", "Protecting people on site and in host communities."],
  ["Innovation", "Using modern methods, equipment and technology where they add value."],
  ["Sustainability", "Responsible use of land, materials and resources."],
  ["Teamwork", "Skilled personnel working together toward shared project goals."],
  ["Customer Focus", "Delivering outcomes that meet the client's needs."],
] as const;
export const mission = "To provide reliable and efficient real estate development and construction services through modern technology, skilled personnel, and best industry practices while ensuring safety, environmental responsibility, and client satisfaction.";
export const vision = "To become a leading and trusted real estate development and construction company recognised for delivering innovative, sustainable, high-quality solutions that contribute to economic growth and infrastructure development.";
export const enquiryCategories = ["General enquiry", "Construction", "Real estate development", "Consultancy", "Design–Build", "Urban planning & design", "Partnership"];

/** Three commitment pillars. Wording is limited to commitments stated in the company profile; no performance claims. */
export const pillars = [
  { icon: "Quality", title: "Quality and durability", points: ["Professional execution", "Skilled personnel", "Client satisfaction"] },
  { icon: "SafetyEnvironment", title: "Safety and environment", points: ["Workplace health and safety", "Protecting host communities", "Environmental responsibility"] },
  { icon: "Delivery", title: "Planning and delivery", points: ["Efficient project management", "Modern equipment and technology", "Timely delivery and cost control"] },
] as const;
