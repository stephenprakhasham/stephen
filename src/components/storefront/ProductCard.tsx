"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  retail_price: number | null;
  compare_at_price?: number | null;
  image_url: string | null;
  images: { id: string; url: string; alt: string | null; is_main: boolean; is_360: boolean; sort_order: number }[];
  category_name: string | null;
  material_finish: string | null;
  division: string;
  divisionName: string;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const regularImages = product.images?.filter((img) => !img.is_360) ?? [];
  const mainImage = product.image_url ?? regularImages[0]?.url ?? null;

  function addToCart() {
    if (product.retail_price == null || product.retail_price <= 0) return;
    add(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        division: product.division,
        price: product.retail_price,
        image: mainImage ?? undefined,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

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

  const displayImage = regularImages[currentImageIndex]?.url ?? mainImage;

  return (
    <article className="product">
      <Link className="productvisual" href={`/${product.division}/products/${product.slug}`}>
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayImage} alt={product.name} className="productimg" />
        ) : (
          <div className="productmark">{initial}</div>
        )}
        {discount && discount > 0 && (
          <span className="discount-badge">{discount}% OFF</span>
        )}
        {regularImages.length > 1 && (
          <div className="image-thumbnails">
            {regularImages.slice(0, 4).map((img, idx) => (
              <button
                key={img.id}
                className={`thumbnail ${idx === currentImageIndex ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(idx);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" />
              </button>
            ))}
          </div>
        )}
      </Link>
      <div className="productbody">
        {product.category_name && (
          <span className="category-badge">{product.category_name}</span>
        )}
        <Link href={`/${product.division}/products/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        {product.short_description && (
          <p>{product.short_description}</p>
        )}
        <div className="product-meta">
          {product.retail_price != null && (
            <>
              <span className="price">₹{product.retail_price.toLocaleString("en-IN")}</span>
              {product.compare_at_price != null && product.compare_at_price > product.retail_price && (
                <span className="compare-price">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
              )}
            </>
          )}
          {product.material_finish && <span className="material">{product.material_finish}</span>}
        </div>
        <div className="product-actions">
          <Link className="btn outline" href={`/${product.division}/products/${product.slug}`}>
            View Details
          </Link>
          {product.retail_price != null && product.retail_price > 0 && (
            <button className="btn gold" onClick={addToCart} disabled={added}>
              {added ? "✓ Added" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}