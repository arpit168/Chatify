import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { Users, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

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

function GroupsList() {
  const { getMyGroups, groups, isUsersLoading, setSelectedUser, selectedUser } = useChatStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    getMyGroups();
  }, [getMyGroups]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-2 mb-2 border-b border-slate-700/50">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: "var(--accent-gradient)" }}
        >
          <Plus className="w-4 h-4" />
          Create New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <NoChatsFound />
      ) : (
        <div className="space-y-1 overflow-y-auto">
          {groups.map((group) => {
            const isActive = selectedUser?._id === group._id;

            return (
              <div
                key={group._id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group-hover hover:scale-[1.01] ${
                  isActive ? "shadow-md" : ""
                }`}
                style={{
                  background: isActive ? "var(--bg-input)" : "transparent",
                }}
                onClick={() => setSelectedUser({ ...group, isGroup: true, fullName: group.name, profilePic: group.avatar })}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                    {group.avatar ? (
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className="font-semibold text-[15px] truncate"
                      style={{ color: "var(--text-main)" }}
                    >
                      {group.name}
                    </h3>
                    {group.lastMessage && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {formatRelativeTime(group.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm truncate opacity-80"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {group.lastMessage?.text || (group.lastMessage?.image ? "📷 Photo" : "No messages yet")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default GroupsList;
