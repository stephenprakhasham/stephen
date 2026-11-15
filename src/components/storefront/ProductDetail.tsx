"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { View360 } from "@/components/storefront/View360";
import type { PublicProductDetail } from "@/lib/catalogue";

interface ProductVideo {
  id: string;
  url: string;
  title: string | null;
  is_feature: boolean;
}

export function ProductDetail({
  product,
  division,
  videos = [],
}: {
  product: PublicProductDetail;
  division: string;
  videos?: ProductVideo[];
}) {
  const { add } = useCart();
  const [mainSrc, setMainSrc] = useState<string | null>(
    product.images.find((i) => i.is_main)?.url ?? product.images[0]?.url ?? product.image_urls[0] ?? null
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<"images" | "360" | "video">("images");
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const gallery = product.images.length
    ? product.images
    : (product.image_urls ?? []).map((url, idx) => ({
        id: `fallback-${idx}`,
        url,
        alt: null,
        is_main: idx === 0,
        sort_order: idx,
      }));

  // Separate 360 frames (frames with is_360 flag or sort_order >= 100)
  const frames360 = gallery.filter((img: any) => img.is_360 || img.sort_order >= 100);
  const regularImages = gallery.filter((img: any) => !img.is_360 && img.sort_order < 100);

  const featuredVideo = videos.find((v) => v.is_feature) ?? videos[0];

  function addToCart() {
    add(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        division,
        price: product.retail_price ?? 0,
        image: mainSrc ?? undefined,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const zoomStyle = mainSrc
    ? {
        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
        transform: zoom ? "scale(2.5)" : "scale(1)",
      }
    : {};

  return (
    <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, padding: "32px 0" }}>
      {/* Image section with tabs */}
      <div>
        {/* Tabs */}
        {(frames360.length > 0 || featuredVideo) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #ece8df", paddingBottom: 12 }}>
            <button
              onClick={() => setActiveTab("images")}
              style={{
                padding: "8px 16px",
                border: "none",
                background: activeTab === "images" ? "#b18b50" : "#f1eee7",
                color: activeTab === "images" ? "#111" : "#555",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Images
            </button>
            {frames360.length > 0 && (
              <button
                onClick={() => setActiveTab("360")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  background: activeTab === "360" ? "#b18b50" : "#f1eee7",
                  color: activeTab === "360" ? "#111" : "#555",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                360° View
              </button>
            )}
            {featuredVideo && (
              <button
                onClick={() => setActiveTab("video")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  background: activeTab === "video" ? "#b18b50" : "#f1eee7",
                  color: activeTab === "video" ? "#111" : "#555",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Video
              </button>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <>
            <div
              ref={containerRef}
              className="zoom-container"
              style={{ position: "relative", overflow: "hidden", borderRadius: 16, border: "1px solid #ece8df", background: "#f9f8f5", cursor: mainSrc ? "crosshair" : "default" }}
              onMouseEnter={() => mainSrc && setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMouseMove}
            >
              {mainSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={imgRef}
                  src={mainSrc}
                  alt={product.name}
                  style={{
                    width: "100%",
                    display: "block",
                    transition: "transform .15s ease",
                    ...zoomStyle,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: "#f1eee7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  No image
                </div>
              )}
              {zoom && mainSrc && (
                <div className="zoom-lens" style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  border: "2px solid #b18b50",
                  borderRadius: 8,
                  pointerEvents: "none",
                  left: `calc(${zoomPos.x}% - 60px)`,
                  top: `calc(${zoomPos.y}% - 60px)`,
                  background: "rgba(177,139,80,.1)",
                  zIndex: 10,
                }} />
              )}
            </div>
            {regularImages.length > 1 && (
              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                {regularImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setMainSrc(img.url)}
                    style={{
                      width: 72,
                      height: 72,
                      padding: 0,
                      border: mainSrc === img.url ? "2px solid #b18b50" : "1px solid #ddd",
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "none",
                      transition: "border-color .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#b18b50")}
                    onMouseLeave={(e) => {
                      if (mainSrc !== img.url) e.currentTarget.style.borderColor = "#ddd";
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* 360° View Tab */}
        {activeTab === "360" && (
          <View360
            frames={frames360.map((f: any) => ({ id: f.id, url: f.url, sort_order: f.sort_order }))}
            productName={product.name}
          />
        )}

        {/* Video Tab */}
        {activeTab === "video" && featuredVideo && (
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #ece8df" }}>
            <video
              src={featuredVideo.url}
              controls
              style={{ width: "100%", display: "block" }}
              poster={mainSrc ?? undefined}
            >
              Your browser does not support the video tag.
            </video>
            {featuredVideo.title && (
              <p style={{ padding: 12, margin: 0, fontSize: 13, color: "#666", background: "#fff" }}>
                {featuredVideo.title}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Product info */}
      <div>
        <Link href={`/${division}`} className="muted" style={{ fontSize: 13, color: "#a17c42" }}>
          ← Back to {division}
        </Link>
        <h1 style={{ fontSize: 28, margin: "12px 0 8px", lineHeight: 1.3 }}>{product.name}</h1>
        {product.short_description && (
          <p className="muted" style={{ fontSize: 15, marginBottom: 16 }}>{product.short_description}</p>
        )}

        <div style={{ margin: "20px 0", display: "flex", alignItems: "baseline", gap: 12 }}>
          {product.retail_price != null && (
            <span style={{ fontSize: 28, fontWeight: 700, color: "#171717" }}>
              ₹{product.retail_price.toLocaleString("en-IN")}
            </span>
          )}
          {product.compare_at_price != null && product.compare_at_price > (product.retail_price ?? 0) && (
            <span className="muted" style={{ textDecoration: "line-through", fontSize: 16 }}>
              ₹{product.compare_at_price.toLocaleString("en-IN")}
            </span>
          )}
          {product.compare_at_price != null && product.retail_price != null && product.compare_at_price > product.retail_price && (
            <span style={{ background: "#e6f4ea", color: "#1e7b3c", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
              {Math.round(((product.compare_at_price - product.retail_price) / product.compare_at_price) * 100)}% off
            </span>
          )}
        </div>

        {product.material_finish && (
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            <strong>Material:</strong> {product.material_finish}
          </p>
        )}

        {product.variants.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Available Options</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.variants.map((v) => (
                <span
                  key={v.id}
                  className="pill"
                  style={{
                    fontSize: 12,
                    padding: "6px 12px",
                    opacity: v.stock_quantity > 0 ? 1 : 0.5,
                    background: v.stock_quantity > 0 ? "#f1eee7" : "#fdecea",
                  }}
                >
                  {v.title ?? v.sku ?? v.id.slice(0, 6)} {v.stock_quantity > 0 ? "" : "(out of stock)"}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            style={{ width: 70, padding: "8px 10px", border: "1px solid #d9d3c7", borderRadius: 8, fontSize: 14 }}
          />
          <button className="btn gold" onClick={addToCart} style={{ padding: "12px 24px" }}>
            {added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
          <Link
            className="btn outline"
            href="/checkout"
            onClick={(e) => {
              if (qty > 0) {
                e.preventDefault();
                addToCart();
                window.location.href = "/checkout";
              }
            }}
            style={{ padding: "12px 24px" }}
          >
            Buy Now
          </Link>
        </div>

        {product.description && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #ece8df" }}>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Product Details</h3>
            <div
              className="muted"
              style={{ fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.8 }}
            >
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}