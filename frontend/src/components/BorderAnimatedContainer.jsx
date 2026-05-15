// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/

function BorderAnimatedContainer({ children }) {
  return (
    <div
      className="
        w-full h-full
        rounded-2xl border border-transparent
        animate-border
        flex overflow-hidden
        [ background: linear-gradient(45deg,#172033,oklch(27.9% 0.041 260.031) 50%,#172033) padding-box,conic-gradient(from var(--border-angle),color-mix(in oklab, oklch(44.6% 0.043 257.281) 48%, transparent) 80%, oklch(71.5% 0.143 215.221) 86%, oklch(86.5% 0.127 207.078) 90%, oklch(71.5% 0.143 215.221) 94%, color-mix(in oklab, oklch(44.6% 0.043 257.281) 48%, transparent)) border-box;]
      "
    >
      {children}
    </div>
  );
}

export default BorderAnimatedContainer;