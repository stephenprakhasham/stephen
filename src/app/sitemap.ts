import { MetadataRoute } from "next";

const SITE_URL = "https://yaga-group-website.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/mobiles",
    "/jewellery",
    "/digital",
    "/cart",
    "/checkout",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.includes("/mobiles") || route.includes("/jewellery") ? 0.9 : 0.5,
  }));
}