function UsersLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
          style={{ background: "var(--bg-input)", opacity: 1 - i * 0.1 }}
        >
          <div className="w-12 h-12 rounded-full bg-slate-700/50 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 rounded-full bg-slate-700/50 w-3/4" />
            <div className="h-2.5 rounded-full bg-slate-700/30 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;