import { useState, useEffect } from "react";
import { X, Users, Loader2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function CreateGroupModal({ isOpen, onClose }) {
  const { allContacts, getAllContacts, getMyGroups } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen && allContacts.length === 0) {
      getAllContacts();
    }
  }, [isOpen, allContacts.length, getAllContacts]);

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      return toast.error("Group name is required");
    }
    if (selectedMembers.length === 0) {
      return toast.error("Select at least one member");
    }

    setIsCreating(true);
    try {
      await axiosInstance.post("/groups/create", {
        name: groupName,
        memberIds: selectedMembers,
      });
      toast.success("Group created successfully");
      getMyGroups(); // Refresh groups
      onClose();
      setGroupName("");
      setSelectedMembers([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-slideUp flex flex-col max-h-[80vh]"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
            <Users className="w-5 h-5 text-indigo-400" />
            Create Group
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:scale-105 hover:bg-slate-700/50"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-main)" }}>
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="E.g., Engineering Team"
              className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all"
              style={{
                background: "var(--bg-input)",
                color: "var(--text-main)",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-main)" }}>
              Select Members ({selectedMembers.length} selected)
            </label>
            <div className="space-y-1 mt-2">
              {allContacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => toggleMember(contact._id)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors border ${
                    selectedMembers.includes(contact._id) ? "border-indigo-500 bg-indigo-500/10" : "border-transparent hover:bg-slate-700/30"
                  }`}
                >
                  <img
                    src={contact.profilePic || "/avatar.png"}
                    alt={contact.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium" style={{ color: "var(--text-main)" }}>
                    {contact.fullName}
                  </span>
                </div>
              ))}
              {allContacts.length === 0 && (
                <p className="text-center text-sm p-4" style={{ color: "var(--text-muted)" }}>
                  Loading contacts...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t shrink-0 flex justify-end gap-2"
          style={{ borderColor: "var(--border-color)", background: "var(--bg-app)" }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium transition-colors hover:bg-slate-700/50"
            style={{ color: "var(--text-main)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={isCreating}
            className="px-6 py-2.5 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
            style={{ background: "var(--accent-gradient)" }}
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
