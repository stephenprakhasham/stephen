"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/mobiles";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, i) => (
        <div className="faq-item" key={item.q}>
          <button
            className="faq-q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {item.q}
            <span>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <div className="faq-a">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}