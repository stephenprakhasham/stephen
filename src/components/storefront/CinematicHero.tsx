"use client";

import { useEffect, useRef, useState } from "react";

export function CinematicHero() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    function calc() {
      const w = window.innerWidth;
      if (w <= 700) setHeight(420);
      else if (w <= 1100) setHeight(520);
      else setHeight(600);
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return (
    <div className="ym-cinematic-hero" style={{ width: "100%", background: "#08090b" }}>
      <iframe
        ref={iframeRef}
        src="/yaga-mobiles-hero.html"
        title="YAGA MOBILES — Premium Mobile Accessories"
        style={{
          width: "100%",
          height: `${height}px`,
          border: "none",
          display: "block",
        }}
        scrolling="no"
      />
    </div>
  );
}