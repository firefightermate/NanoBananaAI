"use client";

/**
 * Ambient background: colour fields, masked grid, grain.
 *
 * Perf-critical: the blobs are radial gradients with alpha falloff — NOT
 * filter:blur — and drift via CSS keyframe transforms only, so the browser
 * composites them on the GPU without repainting. No JS, no framer-motion.
 */
export default function Aurora({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden grain ${className}`}
    >
      <div className="absolute inset-0 grid-bg opacity-[0.5]" />

      <div
        className="aurora-blob absolute -top-[20%] left-[-10%] h-[60vw] w-[60vw]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 72%)",
          animationDuration: "26s",
        }}
      />
      <div
        className="aurora-blob aurora-blob-reverse absolute top-[10%] right-[-15%] h-[55vw] w-[55vw]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 16%, transparent), transparent 72%)",
          animationDuration: "32s",
        }}
      />
      <div
        className="aurora-blob absolute bottom-[-25%] left-[25%] h-[50vw] w-[50vw]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--accent-2) 12%, transparent), transparent 72%)",
          animationDuration: "38s",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg-page to-transparent" />
    </div>
  );
}
