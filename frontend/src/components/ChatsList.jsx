import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHrs < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <div className="space-y-1">
      {chats.map((chat) => {
        const isOnline = onlineUsers.includes(chat._id);
        const isActive = selectedUser?._id === chat._id;
        const isMySentMessage = chat.lastMessageSenderId === authUser?._id;

        return (
          <div
            key={chat._id}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
              isActive ? "shadow-md" : "hover:scale-[1.01]"
            }`}
            style={{
              background: isActive ? "var(--bg-input)" : "transparent",
            }}
            onClick={() => setSelectedUser(chat)}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={chat.profilePic || "/avatar.png"}
                  alt={chat.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {isOnline && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2"
                  style={{ borderColor: "var(--bg-sidebar)" }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm truncate" style={{ color: "var(--text-main)" }}>
                  {chat.fullName}
                </h4>
                <span className="text-[10px] shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>
                  {formatRelativeTime(chat.lastMessageTime)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs truncate max-w-[180px]" style={{ color: "var(--text-muted)" }}>
                  {isMySentMessage && <span className="opacity-70">You: </span>}
                  {chat.lastMessage || "Start a conversation"}
                </p>
                {chat.unreadCount > 0 && (
                  <span
                    className="ml-2 shrink-0 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1.5"
                    style={{ background: "var(--accent-primary)" }}
                  >
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default ChatsList;