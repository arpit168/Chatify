function MessageLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 py-4">
      {[...Array(8)].map((_, i) => {
        const isRight = i % 3 === 0;
        return (
          <div key={i} className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
            <div
              className="px-5 py-4 rounded-2xl animate-pulse"
              style={{
                background: "var(--bg-input)",
                width: `${35 + Math.random() * 30}%`,
                opacity: 1 - i * 0.08,
              }}
            >
              <div className="h-3 rounded-full bg-slate-700/40 mb-2 w-full" />
              {i % 2 === 0 && <div className="h-3 rounded-full bg-slate-700/30 w-3/4" />}
              <div className="h-2 rounded-full bg-slate-700/20 w-1/4 mt-3" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default MessageLoadingSkeleton;