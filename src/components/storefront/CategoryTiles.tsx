"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MOBILES_CATEGORIES } from "@/lib/mobiles";

export function CategoryTiles() {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  return (
    <div className="category-tiles">
      {MOBILES_CATEGORIES.map((cat) => {
        const showImg = cat.image && !failed[cat.slug];
        return (
          <Link
            key={cat.slug}
            href={`/mobiles?category=${cat.slug}`}
            className="cat-tile"
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
              <div
                className="cat-tile-img"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  opacity: 0.9,
                }}
              >
                {cat.name.charAt(0)}
              </div>
            )}
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