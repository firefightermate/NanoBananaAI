"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive molecule field: drifting atoms joined by bonds when close,
 * gently repelled by the cursor. Canvas-rendered, DPR-aware, pauses when
 * offscreen, disabled entirely under prefers-reduced-motion.
 */
export default function Molecules({ density = 26, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let raf;
    let running = true;
    const mouse = { x: -9999, y: -9999 };
    let atoms = [];

    const css = getComputedStyle(document.documentElement);
    const primary = css.getPropertyValue("--color-primary").trim() || "#ffc531";
    const accent = css.getPropertyValue("--accent").trim() || "#a855f7";

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        Math.floor((width * height) / 1_000_000 * density) + 14,
        48,
      );
      atoms = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.2 + Math.random() * 2.2,
        hue: Math.random() < 0.7 ? primary : accent,
      }));
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const step = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      const LINK = 130;

      for (const a of atoms) {
        // cursor repulsion
        const dx = a.x - mouse.x;
        const dy = a.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22500) {
          const d = Math.sqrt(d2) || 1;
          const force = ((150 - d) / 150) * 0.6;
          a.vx += (dx / d) * force;
          a.vy += (dy / d) * force;
        }

        a.vx *= 0.985;
        a.vy *= 0.985;
        // idle drift floor so the field never stalls
        const speed = Math.hypot(a.vx, a.vy);
        if (speed < 0.12) {
          a.vx += (Math.random() - 0.5) * 0.04;
          a.vy += (Math.random() - 0.5) * 0.04;
        }

        a.x += a.vx;
        a.y += a.vy;
        if (a.x < -20) a.x = width + 20;
        if (a.x > width + 20) a.x = -20;
        if (a.y < -20) a.y = height + 20;
        if (a.y > height + 20) a.y = -20;
      }

      // bonds
      ctx.lineWidth = 0.6;
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const dx = atoms[i].x - atoms[j].x;
          const dy = atoms[i].y - atoms[j].y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.35;
            ctx.strokeStyle = `${atoms[i].hue}${Math.round(alpha * 255)
              .toString(16)
              .padStart(2, "0")}`;
            ctx.beginPath();
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(atoms[j].x, atoms[j].y);
            ctx.stroke();
          }
        }
      }

      // atoms
      for (const a of atoms) {
        ctx.fillStyle = a.hue;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0 },
    );

    resize();
    io.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
