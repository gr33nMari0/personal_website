/**
 * The site's signature: the hexagon lattice from the original cybersite,
 * rebuilt as a pure SVG pattern with a slow CSS drift instead of a mousemove
 * canvas loop — zero JavaScript, zero main-thread cost, and it stops entirely
 * under prefers-reduced-motion. Opacity is a token (--hex-opacity) so each
 * theme tunes how loud the lattice is.
 */
export default function HexBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute -inset-x-0 -top-[104px] h-[calc(100%+208px)] w-full animate-hex-drift"
        style={{ opacity: "var(--hex-opacity)" }}
      >
        <defs>
          <pattern id="hexes" width="120" height="104" patternUnits="userSpaceOnUse">
            <g stroke="rgb(var(--c-primary))" strokeWidth="1" fill="none">
              <path d="M30 0 L60 17.3 L60 51.9 L30 69.2 L0 51.9 L0 17.3 Z" />
              <path d="M90 52 L120 69.3 L120 103.9 L90 121.2 L60 103.9 L60 69.3 Z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexes)" />
      </svg>
      {/* Soft radial glow anchoring the hero */}
      <div
        className="absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgb(var(--c-primary) / 0.10), transparent)" }}
      />
    </div>
  );
}
