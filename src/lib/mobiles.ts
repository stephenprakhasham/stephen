export interface MobilesCategory {
  name: string;
  slug: string;
  image: string;
  count: number;
}

export const MOBILES_CATEGORIES: MobilesCategory[] = [
  { name: "Smartphones", slug: "smartphones", image: "", count: 12 },
  { name: "Earbuds", slug: "earbuds", image: "", count: 9 },
  { name: "Headphones", slug: "headphones", image: "", count: 7 },
  { name: "Chargers", slug: "chargers", image: "", count: 14 },
  { name: "Power Banks", slug: "power-banks", image: "", count: 8 },
  { name: "Cases & Covers", slug: "cases", image: "", count: 21 },
  { name: "Smartwatches", slug: "smartwatches", image: "", count: 6 },
  { name: "Cables", slug: "cables", image: "", count: 11 },
];

export const MOBILES_BRANDS = [
  "VIVO",
  "Oppo",
  "REALME",
  "Redmi",
  "Treams",
  "RSD",
];

export interface BundleKit {
  name: string;
  items: string;
  price: number;
  originalPrice: number;
  emoji: string;
}

export const BUNDLE_KITS: BundleKit[] = [
  {
    name: "Car Kit",
    items: "Wireless car charger + car mount + fast cable",
    price: 1299,
    originalPrice: 1799,
    emoji: "🚗",
  },
  {
    name: "Power Kit",
    items: "20000mAh power bank + 20W charger + cable",
    price: 1499,
    originalPrice: 2199,
    emoji: "🔋",
  },
  {
    name: "Audio Kit",
    items: "Bluetooth earbuds + neckband + charging cable",
    price: 1199,
    originalPrice: 1699,
    emoji: "🎧",
  },
];

export const FAQ_ITEMS = [
  {
    q: "How do I order?",
    a: "Add items to your cart and check out online, or message our team on WhatsApp at +91 9787608569 with the product name and code. We confirm availability and delivery details instantly.",
  },
  {
    q: "Can I pay when the order arrives?",
    a: "Yes. YAGA MOBILES offers Cash on Delivery (COD) across India. You pay when your order arrives at your doorstep.",
  },
  {
    q: "Is delivery free?",
    a: "Delivery is free on orders above ₹499. A flat ₹60 shipping fee applies below that, shown at checkout before you pay. No hidden charges.",
  },
  {
    q: "What warranty do products carry?",
    a: "All products carry a manufacturer warranty (typically 1 year). Warranty claims are handled directly — contact us on WhatsApp with your order details.",
  },
  {
    q: "What is the return policy?",
    a: "We offer a 3-day return and replacement window from the date of delivery for eligible products. Contact us on WhatsApp to initiate a return.",
  },
  {
    q: "Which brands are available?",
    a: "We stock Apple, Samsung, boAt, Noise, OnePlus, Realme, Anker, Mi and more — across smartphones, audio, chargers, power banks, cases and accessories.",
  },
];