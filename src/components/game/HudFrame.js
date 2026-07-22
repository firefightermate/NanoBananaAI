"use client";

/**
 * Static HUD dressing for the studio: corner brackets, scanlines, vignette.
 * All CSS, zero per-frame work.
 */
export default function HudFrame() {
  const corner = "absolute h-8 w-8 border-primary/40";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-3 z-20 sm:inset-5">
      <div className={`${corner} left-0 top-0 rounded-tl-lg border-l-2 border-t-2`} />
      <div className={`${corner} right-0 top-0 rounded-tr-lg border-r-2 border-t-2`} />
      <div className={`${corner} bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2`} />
      <div className={`${corner} bottom-0 right-0 rounded-br-lg border-b-2 border-r-2`} />

      {/* scanlines */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0 2px, currentColor 2px 3px)",
          color: "var(--color-primary-text)",
        }}
      />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}
