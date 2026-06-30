// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/

function BorderAnimatedContainer({ children }) {
  return (
    <div
      className="w-full h-full rounded-2xl border border-transparent animate-border flex overflow-hidden shadow-2xl transition-colors duration-300"
      style={{
        background:
          "var(--bg-card) padding-box, conic-gradient(from var(--border-angle), transparent 70%, var(--accent-primary) 85%, #8b5cf6 92%, var(--accent-primary) 96%, transparent) border-box",
      }}
    >
      {children}
    </div>
  );
}

export default BorderAnimatedContainer;