import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  if (allContacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--bg-input)" }}
        >
          <span className="text-2xl">👥</span>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--text-main)" }}>No contacts yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Your contacts will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {allContacts.map((contact) => {
        const isOnline = onlineUsers.includes(contact._id);
        const isActive = selectedUser?._id === contact._id;

        return (
          <div
            key={contact._id}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
              isActive ? "shadow-md" : "hover:scale-[1.01]"
            }`}
            style={{
              background: isActive ? "var(--bg-input)" : "transparent",
            }}
            onClick={() => setSelectedUser(contact)}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={contact.profilePic || "/avatar.png"}
                  alt={contact.fullName}
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

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate" style={{ color: "var(--text-main)" }}>
                {contact.fullName}
              </h4>
              <p className="text-xs truncate" style={{ color: isOnline ? "#22c55e" : "var(--text-muted)" }}>
                {isOnline ? "Online" : (contact.about || "Hey there! I'm using Chatify")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default ContactList;