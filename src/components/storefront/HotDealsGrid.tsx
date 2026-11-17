"use client";

import { useEffect, useState } from "react";
import {
  HotDealProduct,
  WHATSAPP_NUMBER,
  HOT_DEALS_DEADLINE,
  getInitials,
  getProductImageUrl,
  buildWhatsappUrl,
  buildShareText,
  formatPrice,
} from "@/lib/hot-deals";

function useCountdown(deadline: string) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });

  useEffect(() => {
    const end = new Date(deadline).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        return;
      }
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        ended: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return remaining;
}

function Countdown({ deadline }: { deadline: string }) {
  const c = useCountdown(deadline);
  if (c.ended) {
    return (
      <span className="hotdeals-countdown-ended">Sale Ended</span>
    );
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="hotdeals-countdown" aria-label="Sale ends in">
      <span><b>{c.days}</b><small>Days</small></span>
      <i>:</i>
      <span><b>{pad(c.hours)}</b><small>Hrs</small></span>
      <i>:</i>
      <span><b>{pad(c.minutes)}</b><small>Min</small></span>
      <i>:</i>
      <span><b>{pad(c.seconds)}</b><small>Sec</small></span>
    </div>
  );
}

function ProductCard({ product }: { product: HotDealProduct }) {
  const [imgOk, setImgOk] = useState(true);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const waUrl = buildWhatsappUrl(product);
  const initials = getInitials(product.name);
  const imageUrl = getProductImageUrl(product);

  async function shareProductImage() {
    setShareNotice(null);
    setSharing(true);
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error("image fetch failed");
      const blob = await res.blob();
      const file = new File([blob], product.image, { type: blob.type });
      const shareData = { files: [file], text: buildShareText(product) };

      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        setShareNotice(
          "Image sharing is not supported on this browser. Use “Order on WhatsApp” and the image link is included in the message."
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setShareNotice("Share cancelled.");
      } else {
        setShareNotice(
          "Couldn't share the image automatically. Use “Order on WhatsApp” — the product image link is included in the message."
        );
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <article className="hotdeals-product">
      <div className="hotdeals-product-img">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={product.name} loading="lazy" onError={() => setImgOk(false)} />
        ) : (
          <div className="hotdeals-product-fallback">{initials}</div>
        )}
        <span className="hotdeals-badge">{product.badge}</span>
        {!product.inStock && <span className="hotdeals-out">Out of Stock</span>}
      </div>
      <div className="hotdeals-product-body">
        <span className="hotdeals-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="hotdeals-code">Product Code: {product.productCode}</p>
        <div className="hotdeals-pricing">
          <span className="hotdeals-offer">₹{formatPrice(product.offerPrice)}</span>
          <span className="hotdeals-mrp">₹{formatPrice(product.mrp)}</span>
        </div>
        <p className="hotdeals-desc">{product.description}</p>
        <div className="hotdeals-actions">
          {product.inStock ? (
            <a
              className="btn gold hotdeals-btn"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ORDER NOW ON WHATSAPP
            </a>
          ) : (
            <a
              className="btn outline hotdeals-btn"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hi YAGA'S MART, I want to know about your mega offers.\n\nIs the following out-of-stock product available now?\n\nProduct: ${product.name}\nProduct Code: ${product.productCode}\n\nHot Deals Page: https://yaga-group-website.vercel.app/yaga-hot-deals\n\nPlease advise.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ENQUIRE ON WHATSAPP
            </a>
          )}
          <button
            type="button"
            className="btn outline hotdeals-btn hotdeals-share"
            onClick={shareProductImage}
            disabled={sharing}
          >
            {sharing ? "Sharing…" : "SHARE PRODUCT IMAGE"}
          </button>
        </div>
        {shareNotice && <p className="hotdeals-share-notice">{shareNotice}</p>}
      </div>
    </article>
  );
}

export function HotDealsGrid({ products }: { products: HotDealProduct[] }) {
  return (
    <div className="hotdeals-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export { Countdown };