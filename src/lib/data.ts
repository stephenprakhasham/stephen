export type Division = "mobiles" | "jewellery" | "digital";
const waDefault = "919787608569";
export const groupWhatsApp = process.env.NEXT_PUBLIC_YAGA_WHATSAPP || waDefault;
export const divisionInfo = {
 mobiles:{
   name:"YAGA MOBILES",
   tagline:"Mobile phones & accessories · Wholesale and retail",
   intro:"Discover mobile essentials, accessories and everyday technology. Enquire directly and our team will confirm availability, pricing and delivery.",
   wa:groupWhatsApp,
   emoji:"📱",
   keywords:["mobile phones","smartphones","mobile accessories","chargers","earphones","cables","cases","tempered glass","power banks","wholesale mobiles","retail mobiles"]
 },
 jewellery:{
   name:"YAGA GOLD & FASHION",
   tagline:"Jewellery for everyday elegance and celebrations",
   intro:"Explore elegant fashion jewellery, daily-wear favourites and festive collections. Ask our team about material, finish, size and availability.",
   wa:groupWhatsApp,
   emoji:"✦",
   keywords:["jewellery","fashion jewellery","necklace","earrings","bangles","bracelets","rings","pendants","gold plated","silver jewellery","bridal jewellery","festive jewellery"]
 },
 digital:{
   name:"YAGA DIGITAL NEXUS",
   tagline:"Digital growth, creative technology and marketing services",
   intro:"Creative campaigns, websites, social media and AI-powered content for growing businesses.",
   wa:groupWhatsApp,
   emoji:"✧",
   keywords:["digital marketing","social media management","SEO services","web development","website design","e-commerce development","content creation","video production","branding","online marketing","Google Ads","Facebook Ads","Instagram marketing"]
 }
} as const;
export const products = [
 {id:"mob-1",division:"mobiles" as const,name:"Fast Charging Cable",category:"Cables",sku:"DEMO-MOB-001",price:0,description:"Add verified cable type, length, compatibility and actual price before publishing.",emoji:"🔌"},
 {id:"mob-2",division:"mobiles" as const,name:"Wireless Neckband",category:"Audio",sku:"DEMO-MOB-002",price:0,description:"Add verified brand, model, warranty and actual price before publishing.",emoji:"🎧"},
 {id:"mob-3",division:"mobiles" as const,name:"Mobile Accessories Combo",category:"Combos",sku:"DEMO-MOB-003",price:0,description:"Replace with a real product, included items, stock and approved price.",emoji:"📦"},
 {id:"jwl-1",division:"jewellery" as const,name:"Fashion Necklace",category:"Neckwear",sku:"DEMO-JWL-001",price:0,description:"Specify exact material/finish, length, care instructions and real product price.",emoji:"📿"},
 {id:"jwl-2",division:"jewellery" as const,name:"Fashion Earrings",category:"Ear Jewellery",sku:"DEMO-JWL-002",price:0,description:"Specify material/finish, dimensions, care instructions and actual price.",emoji:"💎"},
 {id:"jwl-3",division:"jewellery" as const,name:"Bangle Set",category:"Bangles",sku:"DEMO-JWL-003",price:0,description:"Specify material/finish, sizes, set quantity and actual price.",emoji:"✨"}
];
export const digitalServices = ["AI Promotional Video Generation","Social Media Content Creation","Instagram Management","Facebook Page Management","YouTube Channel Management","Meta Ads Management","Google Ads Management","Portfolio Website Development","Company Website Development","E-commerce Website Development","Promotional Posters and Banner Design","Chatbot Development","SEO Setup"];
