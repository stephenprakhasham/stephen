"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductCardData } from "@/components/storefront/ProductCard";
import { WHATSAPP_NUMBER } from "@/lib/hot-deals";

function buildMessage(p: ProductCardData): string {
  const price = p.retail_price ?? 0;
  const mrp = p.compare_at_price ?? price;
  const save = mrp - price;
  return [
    "Hello YAGA MOBILES!",
    "",
    "I am interested in purchasing this product.",
    "",
    `Product Name: ${p.name}`,
    `Category: ${p.category_name ?? "Mobile Accessory"}`,
    `MRP: ₹${mrp}`,
    `Offer Price: ₹${price}`,
    save > 0 ? `You Save: ₹${save}` : "",
    "",
    "Please confirm product availability and ordering details.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function MobilesProductCard({ product }: { product: ProductCardData }) {
  const [imgOk, setImgOk] = useState(true);
  const regularImages = product.images?.filter((img) => !img.is_360) ?? [];
  const mainImage = product.image_url ?? regularImages[0]?.url ?? null;

  const initial = product.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const discount =
    product.compare_at_price && product.retail_price && product.compare_at_price > product.retail_price
      ? Math.round(((product.compare_at_price - product.retail_price) / product.compare_at_price) * 100)
      : null;

  const save =
    product.compare_at_price && product.retail_price
      ? product.compare_at_price - product.retail_price
      : 0;

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(product))}`;

  const spec = product.material_finish || product.category_name || "";

  return (
    <article className="ym-product">
      <div className="ym-product-img">
        {imgOk && mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 25vw"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="ym-product-fallback">{initial}</div>
        )}
        {discount && discount > 0 && <span className="ym-badge">{discount}% OFF</span>}
        {spec && <span className="ym-spec">{spec}</span>}
        {product.retail_price != null && product.retail_price <= 0 && (
          <span className="ym-out">Out of Stock</span>
        )}
      </div>
      <div className="ym-product-body">
        {product.category_name && <span className="ym-cat">{product.category_name}</span>}
        <h3>{product.name}</h3>
        {product.retail_price != null && (
          <>
            <div className="ym-pricing">
              <span className="ym-offer">₹{product.retail_price.toLocaleString("en-IN")}</span>
              {product.compare_at_price != null && product.compare_at_price > product.retail_price && (
                <span className="ym-mrp">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
              )}
            </div>
            {save > 0 && <span className="ym-save">You Save ₹{save.toLocaleString("en-IN")}</span>}
          </>
        )}
        <div className="ym-actions">
          {product.retail_price != null && product.retail_price > 0 ? (
            <a
              className="btn gold"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ORDER NOW
            </a>
          ) : (
            <a
              className="btn outline"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hello YAGA MOBILES! Is the following product available now?\n\nProduct: ${product.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ENQUIRE
            </a>
          )}
        </div>
      </div>
    </article>
  );
}