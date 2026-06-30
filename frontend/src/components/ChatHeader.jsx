import { XIcon, Phone, Video, Search, MoreVertical, Image as ImageIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import MediaGalleryModal from "./MediaGalleryModal";

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center px-5 py-3 border-b backdrop-blur-xl"
      style={{
        background: "var(--bg-sidebar)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-offset-2 transition-all"
            style={{
              ringColor: isOnline ? "#22c55e" : "var(--border-color)",
              ringOffsetColor: "transparent",
            }}
          >
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2" style={{ borderColor: "var(--bg-sidebar)" }} />
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="font-semibold text-sm" style={{ color: "var(--text-main)" }}>
            {selectedUser.fullName}
          </h3>
          {isTyping ? (
            <p className="text-xs font-medium animate-pulse" style={{ color: "var(--accent-primary)" }}>
              typing...
            </p>
          ) : (
            <p className="text-xs" style={{ color: isOnline ? "#22c55e" : "var(--text-muted)" }}>
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-2.5 rounded-xl transition-all hover:scale-105 hidden sm:block"
          style={{ color: "var(--text-muted)" }}
          onClick={() => setIsMediaGalleryOpen(true)}
          title="Media, Links & Docs"
        >
          <ImageIcon className="w-[18px] h-[18px]" />
        </button>
        <button
          className="p-2.5 rounded-xl transition-all hover:scale-105"
          style={{ color: "var(--text-muted)" }}
          title="Voice Call"
        >
          <Phone className="w-[18px] h-[18px]" />
        </button>
        <button
          className="p-2.5 rounded-xl transition-all hover:scale-105"
          style={{ color: "var(--text-muted)" }}
          title="Video Call"
        >
          <Video className="w-[18px] h-[18px]" />
        </button>
        <button
          className="p-2.5 rounded-xl transition-all hover:scale-105"
          style={{ color: "var(--text-muted)" }}
          title="Search in chat"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2.5 rounded-xl transition-all hover:scale-105"
          style={{ color: "var(--text-muted)" }}
          title="Close chat (Esc)"
        >
          <XIcon className="w-[18px] h-[18px]" />
        </button>
      </div>

      <MediaGalleryModal
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
      />
    </div>
  );
}
export default ChatHeader;