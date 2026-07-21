"use client";

/**
 * A sample-output tile.
 *
 * If `src` is provided it renders the real image. Otherwise it paints a
 * deterministic, layered gradient "artwork" derived from the seed so the
 * showcase looks alive before real generations are dropped into /public.
 */

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function palette(seed) {
  const h = hash(seed);
  const base = h % 360;
  return {
    a: base,
    b: (base + 40 + (h % 60)) % 360,
    c: (base + 190 + (h % 40)) % 360,
    x1: 15 + (h % 55),
    y1: 15 + ((h >> 3) % 55),
    x2: 30 + ((h >> 5) % 60),
    y2: 30 + ((h >> 7) % 60),
    angle: h % 360,
  };
}

export default function ArtTile({ seed = "banana", src, alt = "", className = "" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const p = palette(seed);

  const background = [
    `radial-gradient(60% 55% at ${p.x1}% ${p.y1}%, hsl(${p.a} 92% 62% / 0.95), transparent 70%)`,
    `radial-gradient(55% 50% at ${p.x2}% ${p.y2}%, hsl(${p.b} 88% 55% / 0.85), transparent 72%)`,
    `radial-gradient(80% 70% at 80% 90%, hsl(${p.c} 80% 45% / 0.75), transparent 75%)`,
    `conic-gradient(from ${p.angle}deg at 50% 50%, hsl(${p.a} 70% 30% / 0.6), hsl(${p.c} 70% 22% / 0.7), hsl(${p.b} 70% 28% / 0.6), hsl(${p.a} 70% 30% / 0.6))`,
    `linear-gradient(160deg, #0a0a0d, #08080b)`,
  ].join(", ");

  return (
    <div
      role="img"
      aria-label={alt || "Sample generation"}
      className={`relative h-full w-full overflow-hidden grain ${className}`}
      style={{ background, filter: "saturate(1.15) contrast(1.05)" }}
    >
      {/* soft focus bloom */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 60% at ${p.x1}% ${p.y1}%, hsl(${p.a} 100% 70% / 0.35), transparent 65%)`,
          filter: "blur(28px)",
        }}
      />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}
