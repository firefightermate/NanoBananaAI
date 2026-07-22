"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#K19△▽○◇";

/**
 * Decode effect: characters churn through random glyphs before locking in,
 * left to right. Runs once when scrolled into view.
 */
export default function ScrambleText({ text, className = "", delay = 0, speed = 28 }) {
  const [output, setOutput] = useState(text);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOutput(text);
      return;
    }

    let frame = 0;
    let raf;
    const totalFrames = text.length * 3 + 14;
    const start = performance.now() + delay * 1000;

    const tick = (now) => {
      if (now < start) {
        setOutput(" ");
        raf = requestAnimationFrame(tick);
        return;
      }
      frame = Math.floor((now - start) / speed);
      const settled = Math.floor(frame / 3);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          out += " ";
        } else if (i < settled) {
          out += text[i];
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setOutput(out);
      if (frame < totalFrames && settled <= text.length) {
        raf = requestAnimationFrame(tick);
      } else {
        setOutput(text);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, text, delay, speed]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {output}
    </span>
  );
}
