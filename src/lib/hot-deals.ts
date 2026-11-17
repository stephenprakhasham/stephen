export const WHATSAPP_NUMBER = "919787608569";
export const SITE_URL = "https://yaga-group-website.vercel.app";
export const IMAGE_FOLDER = "assets/yaga-hot-deals/";
export const HOT_DEALS_DEADLINE = "2026-12-31T23:59:59";

export interface HotDealProduct {
  id: number;
  productCode: string;
  name: string;
  category: string;
  image: string;
  mrp: number;
  offerPrice: number;
  badge: string;
  description: string;
  inStock: boolean;
}

export const HOT_DEALS_PRODUCTS: HotDealProduct[] = [
  {
    id: 1,
    productCode: "YHD001",
    name: "Bluetooth Neckband",
    category: "Neckbands",
    image: "neckband.jpg",
    mrp: 999,
    offerPrice: 499,
    badge: "50% OFF",
    description: "Premium Bluetooth neckband with rich bass and long battery life.",
    inStock: true,
  },
  {
    id: 2,
    productCode: "YHD002",
    name: "Fast Charging Cable",
    category: "Cables",
    image: "charging-cable.jpg",
    mrp: 599,
    offerPrice: 299,
    badge: "50% OFF",
    description: "Braided Type-C fast charging cable, durable and tangle-free.",
    inStock: true,
  },
  {
    id: 3,
    productCode: "YHD003",
    name: "Wireless Earbuds",
    category: "Audio",
    image: "earbuds.jpg",
    mrp: 2499,
    offerPrice: 1499,
    badge: "40% OFF",
    description: "True wireless earbuds with touch controls and charging case.",
    inStock: true,
  },
  {
    id: 4,
    productCode: "YHD004",
    name: "Power Bank 20000mAh",
    category: "Power Banks",
    image: "powerbank.jpg",
    mrp: 1999,
    offerPrice: 1299,
    badge: "35% OFF",
    description: "High capacity power bank with dual USB fast charging output.",
    inStock: true,
  },
  {
    id: 5,
    productCode: "YHD005",
    name: "Tempered Glass Protector",
    category: "Screen Guards",
    image: "tempered-glass.jpg",
    mrp: 299,
    offerPrice: 99,
    badge: "67% OFF",
    description: "9H hardness tempered glass with edge-to-edge full coverage.",
    inStock: true,
  },
  {
    id: 6,
    productCode: "YHD006",
    name: "Car Phone Holder",
    category: "Accessories",
    image: "car-holder.jpg",
    mrp: 899,
    offerPrice: 499,
    badge: "45% OFF",
    description: "Adjustable car phone holder with air vent clip mount.",
    inStock: false,
  },
];

export function getPublicImageUrl(filename: string): string {
  return `${SITE_URL}/${IMAGE_FOLDER}${filename}`;
}

export function getProductImageUrl(product: HotDealProduct): string {
  return getPublicImageUrl(product.image);
}

export function buildWhatsappMessage(product: HotDealProduct): string {
  return [
    "Hi YAGA'S MART, I want to know about your mega offers.",
    "",
    "I am interested in purchasing this product from YAGA HOT DEALS.",
    "",
    `Product Name: ${product.name}`,
    `Product Code: ${product.productCode}`,
    `MRP: ₹${product.mrp}`,
    `Offer Price: ₹${product.offerPrice}`,
    "",
    "Please confirm product availability and ordering details.",
    "",
    `Product Image: ${getProductImageUrl(product)}`,
    `Hot Deals Page: ${SITE_URL}/yaga-hot-deals`,
  ].join("\n");
}

export function buildWhatsappUrl(product: HotDealProduct): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappMessage(product))}`;
}

export function buildShareText(product: HotDealProduct): string {
  return [
    "YAGA HOT DEALS – SPECIAL OFFER!",
    "",
    `Product: ${product.name}`,
    `Product Code: ${product.productCode}`,
    `Offer Price: ₹${product.offerPrice}`,
    "",
    `Contact YAGA MOBILES: +91 9787608569`,
  ].join("\n");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatPrice(value: number): string {
  return value.toLocaleString("en-IN");
}