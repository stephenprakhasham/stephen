"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MOBILES_CATEGORIES } from "@/lib/mobiles";

export function CategoryTiles() {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  return (
    <div className="category-tiles">
      {MOBILES_CATEGORIES.map((cat, idx) => {
        const showImg = cat.image && !failed[cat.slug];
        const featured = idx === 0 ? " t-featured" : "";
        return (
          <Link
            key={cat.slug}
            href={`/mobiles?category=${cat.slug}`}
            className={`cat-tile${featured}`}
          >
            {showImg ? (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 800px) 50vw, 25vw"
                className="cat-tile-img"
                onError={() => setFailed((s) => ({ ...s, [cat.slug]: true }))}
              />
            ) : (
              <div className="cat-tile-fallback" aria-hidden="true">
                {cat.name.charAt(0)}
              </div>
            )}
            <svg className="cat-tile-arr" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
            <div className="cat-tile-body">
              <strong>{cat.name}</strong>
              <span>{cat.count} items</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}