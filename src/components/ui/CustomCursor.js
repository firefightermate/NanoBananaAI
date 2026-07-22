"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Site-wide custom cursor. The dot is moved by writing transform directly to
 * the DOM inside the mousemove handler — no React, no framer, no batching —
 * so it cannot trail the pointer. The ring lerps toward the pointer in a
 * single rAF loop. Desktop fine pointers only.
 */
const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, .cursor-target";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-custom-cursor");

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let hovering = false;
    let pressed = false;
    let visible = false;
    let raf;

    const paintRing = () => {
      const size = hovering ? 42 : 24;
      const scale = pressed ? 0.8 : 1;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.opacity = visible ? (hovering ? "0.9" : "0.5") : "0";
      ring.style.backgroundColor = hovering
        ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
        : "transparent";
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
    };

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
      }
      // dot: written synchronously — glued to the pointer
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) scale(${pressed ? 0.6 : 1})`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      paintRing();
      raf = requestAnimationFrame(loop);
    };

    const over = (e) => {
      hovering = Boolean(e.target.closest?.(INTERACTIVE));
    };
    const down = () => {
      pressed = true;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) scale(0.6)`;
    };
    const up = () => {
      pressed = false;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) scale(1)`;
    };
    const leave = () => {
      visible = false;
      dot.style.opacity = "0";
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-primary opacity-0"
        style={{ transition: "opacity 120ms" }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border border-primary/60"
        style={{
          width: 24,
          height: 24,
          opacity: 0,
          transition: "width 200ms, height 200ms, background-color 200ms",
        }}
      />
    </>
  );
}
