"use client";

import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/storefront/ProductCard";

interface ProductGridProps {
  division: string;
  divisionName: string;
}

export function ProductGrid({ division, divisionName }: ProductGridProps) {
  const { products, isLoading, isError } = useProducts({ division, limit: 24 });

  if (isLoading) {
    return (
      <div className="products">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="product skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-price" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="notice">
        Failed to load products. Please refresh the page.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="notice">
        Catalogue is being prepared. Send an enquiry on WhatsApp for current availability
        and pricing. Final order details are confirmed manually by our team.
      </div>
    );
  }

  return (
    <div className="products">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={{
            ...p,
            division,
            divisionName,
          }}
        />
      ))}
    </div>
  );
}