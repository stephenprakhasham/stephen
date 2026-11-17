import { MobilesProductCard } from "@/components/storefront/MobilesProductCard";
import type { ProductCardData } from "@/components/storefront/ProductCard";

export function FeaturedRow({ products }: { products: ProductCardData[] }) {
  return (
    <div className="featured-row">
      {products.map((p) => (
        <MobilesProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}