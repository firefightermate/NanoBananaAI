"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ArtTile from "./ArtTile";

/**
 * Drag-to-reveal before/after comparison. Falls back to generated tiles when
 * no image sources are supplied.
 */
export default function CompareSlider({
  beforeSrc,
  afterSrc,
  beforeSeed = "before-frame",
  afterSeed = "after-frame",
  beforeLabel = "Original",
  afterLabel = "Edited",
  className = "",
}) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updateFromClientX(clientX);
    };
    const onUp = () => setDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, updateFromClientX]);

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => {
        setDragging(true);
        updateFromClientX(e.clientX);
      }}
      onTouchStart={(e) => {
        setDragging(true);
        updateFromClientX(e.touches[0].clientX);
      }}
      className={`relative select-none overflow-hidden rounded-xl border border-glass-border ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
    >
      <ArtTile seed={beforeSeed} src={beforeSrc} alt={beforeLabel} />

      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <ArtTile seed={afterSeed} src={afterSrc} alt={afterLabel} />
      </div>

      {/* handle */}
      <div
        className="absolute inset-y-0 w-px bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/60 backdrop-blur">
          <span className="text-[10px] font-black tracking-tighter text-white">◀▶</span>
        </div>
      </div>

      <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/80 backdrop-blur">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-md bg-primary/90 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-primary-btn-text">
        {afterLabel}
      </span>
    </div>
  );
}
