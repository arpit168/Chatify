import { XIcon, Phone, Video, Search, MoreVertical, Image as ImageIcon, Ban, CheckCircle, Info } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import MediaGalleryModal from "./MediaGalleryModal";
import GroupDetailsModal from "./GroupDetailsModal";
import toast from "react-hot-toast";

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers, authUser, blockUser, unblockUser } = useAuthStore();
  const { startCall } = useCallStore();
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];
  const isBlocked = authUser?.blockedUsers?.includes(selectedUser._id);

  const handleCall = (type) => {
    if (selectedUser.isGroup) {
      return toast.error("Group calls are not supported yet");
    }
    startCall(selectedUser, type);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center px-5 py-3 border-b backdrop-blur-xl relative z-10"
      style={{
        background: "var(--bg-sidebar)",
        borderColor: "var(--border-color)",
      }}
    >
      <div
        className={`flex items-center gap-3 ${selectedUser.isGroup ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
        onClick={() => {
          if (selectedUser.isGroup) setIsGroupModalOpen(true);
        }}
      >
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
              alt={selectedUser.fullName || selectedUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          {isOnline && !selectedUser.isGroup && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2" style={{ borderColor: "var(--bg-sidebar)" }} />
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--text-main)" }}>
            {selectedUser.fullName || selectedUser.name}
            {isBlocked && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">Blocked</span>}
          </h3>
          {isTyping ? (
            <p className="text-xs font-medium animate-pulse" style={{ color: "var(--accent-primary)" }}>
              typing...
            </p>
          ) : (
            <p className="text-xs" style={{ color: isOnline ? "#22c55e" : "var(--text-muted)" }}>
              {selectedUser.isGroup ? `${selectedUser.members?.length || 0} members · Click for settings` : isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 relative">
        <button
          className="p-2.5 rounded-xl transition-all hover:scale-105 hidden sm:block"
          style={{ color: "var(--text-muted)" }}
          onClick={() => setIsMediaGalleryOpen(true)}
          title="Media, Links & Docs"
        >
          <ImageIcon className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={() => handleCall("audio")}
          className="p-2.5 rounded-xl transition-all hover:scale-105"
          style={{ color: "var(--text-muted)" }}
          title="Voice Call"
        >
          <Phone className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={() => handleCall("video")}
          className="p-2.5 rounded-xl transition-all hover:scale-105"
          style={{ color: "var(--text-muted)" }}
          title="Video Call"
        >
          <Video className="w-[18px] h-[18px]" />
        </button>
        
        {selectedUser.isGroup ? (
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="p-2.5 rounded-xl transition-all hover:scale-105"
            style={{ color: "var(--text-muted)" }}
            title="Group Info"
          >
            <Info className="w-[18px] h-[18px]" />
          </button>
        ) : (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 rounded-xl transition-all hover:scale-105 relative"
            style={{ color: "var(--text-muted)" }}
            title="More options"
          >
            <MoreVertical className="w-[18px] h-[18px]" />
          </button>
        )}

        {showMenu && !selectedUser.isGroup && (
          <div
            className="absolute right-12 top-12 w-40 rounded-xl shadow-2xl border p-1 animate-fadeIn z-50"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <button
              onClick={() => {
                if (isBlocked) unblockUser(selectedUser._id);
                else blockUser(selectedUser._id);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors hover:bg-red-500/10 text-red-400"
            >
              {isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              {isBlocked ? "Unblock User" : "Block User"}
            </button>
          </div>
        )}

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

      {selectedUser.isGroup && (
        <GroupDetailsModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          group={selectedUser}
        />
      )}
    </div>
  );
}
export default ChatHeader;