"use client";

/**
 * Ambient background v3 — "horizon glow".
 *
 * Layers (bottom to top): star dust, blueprint grid, a glowing horizon arc,
 * two huge slowly-rotating light beams, drifting colour fields, grain.
 * Everything is a gradient animated by transform only — GPU composited,
 * nothing repaints per frame.
 */
export default function Aurora({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden grain ${className}`}
    >
      {/* star dust — two layers drifting at different speeds for depth */}
      <div className="star-layer" style={{ animationDuration: "180s" }} />
      <div
        className="star-layer star-layer-far"
        style={{ animationDuration: "320s" }}
      />

      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* rotating light beams */}
      <div className="beam" style={{ animationDuration: "48s" }} />
      <div
        className="beam beam-reverse"
        style={{ animationDuration: "64s", opacity: 0.5 }}
      />

      {/* glowing horizon arc */}
      <div className="horizon-arc" />

      {/* drifting colour fields */}
      <div
        className="aurora-blob absolute -top-[20%] left-[-10%] h-[60vw] w-[60vw]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 20%, transparent), transparent 72%)",
          animationDuration: "26s",
        }}
      />
      <div
        className="aurora-blob aurora-blob-reverse absolute top-[5%] right-[-15%] h-[55vw] w-[55vw]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 20%, transparent), transparent 72%)",
          animationDuration: "32s",
        }}
      />
      <div
        className="aurora-blob absolute bottom-[-25%] left-[20%] h-[55vw] w-[55vw]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--accent-2) 14%, transparent), transparent 72%)",
          animationDuration: "38s",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg-page to-transparent" />
    </div>
  );
}
