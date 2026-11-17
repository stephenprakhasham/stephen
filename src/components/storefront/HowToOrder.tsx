"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "Pick your product",
    text: "Browse the store, or message the YAGA team and tell us what you need.",
  },
  {
    title: "Order online or on WhatsApp",
    text: "Check out on the store, or send your order in a WhatsApp message.",
  },
  {
    title: "Pay when it arrives",
    text: "Cash on delivery. Orders over ₹499 ship free.",
  },
];

export function HowToOrder() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="ym-barcode" aria-hidden="true">
        <span className="ym-barcode-lines" />
      </div>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className={`step${active === i ? " active" : ""}`}
          >
            <span className="step-num">{i + 1}</span>
            <strong>{s.title}</strong>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </>
  );
}