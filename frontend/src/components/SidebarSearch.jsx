import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

function SidebarSearch() {
  const [query, setQuery] = useState("");
  const { searchUsers, searchResults, isSearching, setSelectedUser, setActiveTab } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (!value.trim()) {
        setShowResults(false);
        return;
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(value);
        setShowResults(true);
      }, 300);
    },
    [searchUsers]
  );

  const handleSelect = (user) => {
    setSelectedUser(user);
    setActiveTab("chats");
    setQuery("");
    setShowResults(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="px-4 py-2 relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Search users..."
          className="w-full py-2.5 pl-10 pr-10 rounded-xl text-sm border-0 outline-none transition-all focus:ring-2"
          style={{
            background: "var(--bg-input)",
            color: "var(--text-main)",
            borderRadius: "var(--app-radius)",
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setShowResults(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-700/50"
          >
            <X className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div
          className="absolute left-4 right-4 top-full mt-1 rounded-xl shadow-2xl border max-h-72 overflow-y-auto z-30"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "var(--accent-primary)" }} />
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No users found</p>
            </div>
          ) : (
            searchResults.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => handleSelect(user)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-700/30 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-full h-full object-cover" />
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2" style={{ borderColor: "var(--bg-card)" }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium truncate" style={{ color: "var(--text-main)" }}>{user.fullName}</h4>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default SidebarSearch;
