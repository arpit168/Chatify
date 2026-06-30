function PageLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "var(--bg-app)" }}
    >
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse"
          style={{ background: "var(--accent-gradient)" }}
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-primary)", animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-primary)", animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-primary)", animationDelay: "300ms" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Loading Chatify...</p>
    </div>
  );
}
export default PageLoader;