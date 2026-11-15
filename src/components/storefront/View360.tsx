"use client";

import { useState, useRef, useCallback } from "react";

interface Frame360 {
  id: string;
  url: string;
  sort_order: number;
}

export function View360({ frames, productName }: { frames: Frame360[]; productName: string }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sortedFrames = [...frames].sort((a, b) => a.sort_order - b.sort_order);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, x / rect.width));
      const frameIndex = Math.floor(progress * sortedFrames.length);
      setCurrentFrame(frameIndex);
    },
    [isDragging, sortedFrames.length]
  );

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, x / rect.width));
      const frameIndex = Math.floor(progress * sortedFrames.length);
      setCurrentFrame(frameIndex);
    },
    [isDragging, sortedFrames.length]
  );

  const toggleAutoRotate = useCallback(() => {
    if (autoRotate) {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
      setAutoRotate(false);
    } else {
      setAutoRotate(true);
      autoRotateRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % sortedFrames.length);
      }, 100);
    }
  }, [autoRotate, sortedFrames.length]);

  if (sortedFrames.length === 0) {
    return (
      <div className="view360-empty" style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1eee7", borderRadius: 12, color: "#999" }}>
        No 360° frames available
      </div>
    );
  }

  return (
    <div className="view360-container">
      <div
        ref={containerRef}
        className="view360-viewport"
        style={{
          position: "relative",
          width: "100%",
          height: 300,
          background: "#f9f8f5",
          borderRadius: 12,
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          border: "1px solid #ece8df",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sortedFrames[currentFrame]?.url}
          alt={`${productName} - 360° view ${currentFrame + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,.6)",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            pointerEvents: "none",
          }}
        >
          360° View - Drag to rotate
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 12 }}>
        <button
          className="btn outline"
          onClick={toggleAutoRotate}
          style={{ fontSize: 12, padding: "8px 16px" }}
        >
          {autoRotate ? "⏸ Pause" : "▶ Auto Rotate"}
        </button>
        <span style={{ fontSize: 12, color: "#888" }}>
          Frame {currentFrame + 1} / {sortedFrames.length}
        </span>
      </div>
    </div>
  );
}