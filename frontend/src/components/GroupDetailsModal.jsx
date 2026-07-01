import { useState, useRef, useEffect } from "react";
import { X, Users, UserPlus, Trash2, Edit2, Check, Camera, LogOut, Loader2, Shield } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

function GroupDetailsModal({ isOpen, onClose, group }) {
  const { authUser } = useAuthStore();
  const { updateGroup, addGroupMembers, removeGroupMember, allContacts, getAllContacts } = useChatStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
    }
  }, [group]);

  useEffect(() => {
    if (showAddMembers && allContacts.length === 0) {
      getAllContacts();
    }
  }, [showAddMembers, allContacts.length, getAllContacts]);

  if (!isOpen || !group) return null;

  const isAdmin = group.adminId === authUser?._id || group.adminIds?.includes(authUser?._id);

  const handleSaveEdit = async () => {
    await updateGroup(group._id, { name, description });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        await updateGroup(group._id, { avatar: reader.result });
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleAddSelectedMembers = async () => {
    if (selectedToAdd.length === 0) return;
    await addGroupMembers(group._id, selectedToAdd);
    setSelectedToAdd([]);
    setShowAddMembers(false);
  };

  const existingMemberIds = group.members?.map((m) => (typeof m === "object" ? m._id : m)) || [];
  const availableToAdd = allContacts.filter((c) => !existingMemberIds.includes(c._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-slideUp flex flex-col max-h-[85vh]"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--border-color)" }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
            <Users className="w-5 h-5 text-indigo-400" /> Group Settings
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Avatar & Title */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 shadow-xl bg-slate-700 flex items-center justify-center">
                {group.avatar || group.profilePic ? (
                  <img src={group.avatar || group.profilePic} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-10 h-10 text-slate-300" />
                )}
              </div>

              {isAdmin && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-white transition-all hover:scale-110"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
                </>
              )}
            </div>

            {isEditing ? (
              <div className="w-full mt-4 space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-sm border outline-none"
                  style={{ background: "var(--bg-input)", color: "var(--text-main)", borderColor: "var(--border-color)" }}
                  placeholder="Group Name"
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-sm border outline-none"
                  style={{ background: "var(--bg-input)", color: "var(--text-main)", borderColor: "var(--border-color)" }}
                  placeholder="Group Description"
                />
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1 shadow-md"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center mt-3">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                    {group.name}
                  </h3>
                  {isAdmin && (
                    <button onClick={() => setIsEditing(true)} className="p-1 rounded-md text-slate-400 hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {group.description && (
                  <p className="text-xs mt-1 max-w-sm text-center" style={{ color: "var(--text-muted)" }}>
                    {group.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Members list header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Members ({group.members?.length || 0})
              </span>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMembers(!showAddMembers)}
                  className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> {showAddMembers ? "Close" : "Add Member"}
                </button>
              )}
            </div>

            {showAddMembers && (
              <div className="p-3 rounded-xl border space-y-2 bg-slate-800/40" style={{ borderColor: "var(--border-color)" }}>
                <span className="text-xs font-semibold text-slate-300">Select Contacts to Add:</span>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {availableToAdd.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No more contacts to add.</p>
                  ) : (
                    availableToAdd.map((contact) => (
                      <div
                        key={contact._id}
                        onClick={() => {
                          if (selectedToAdd.includes(contact._id)) {
                            setSelectedToAdd(selectedToAdd.filter((id) => id !== contact._id));
                          } else {
                            setSelectedToAdd([...selectedToAdd, contact._id]);
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          selectedToAdd.includes(contact._id) ? "bg-indigo-500/20 border border-indigo-500/40" : "hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} className="w-6 h-6 rounded-full object-cover" />
                          <span style={{ color: "var(--text-main)" }}>{contact.fullName}</span>
                        </div>
                        {selectedToAdd.includes(contact._id) && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                    ))
                  )}
                </div>
                {selectedToAdd.length > 0 && (
                  <button
                    onClick={handleAddSelectedMembers}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    Add {selectedToAdd.length} Member(s)
                  </button>
                )}
              </div>
            )}

            {/* Existing Members list */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {group.members?.map((member) => {
                const memObj = typeof member === "object" ? member : { _id: member, fullName: "Member" };
                const isMemAdmin = group.adminId === memObj._id || group.adminIds?.includes(memObj._id);
                const isSelf = memObj._id === authUser?._id;

                return (
                  <div
                    key={memObj._id}
                    className="flex items-center justify-between p-2.5 rounded-xl border transition-colors bg-slate-800/20"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={memObj.profilePic || "/avatar.png"}
                        alt={memObj.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--text-main)" }}>
                          {memObj.fullName} {isSelf && "(You)"}
                        </span>
                        {isMemAdmin && (
                          <span className="text-[10px] text-indigo-400 flex items-center gap-0.5 font-medium">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {(isAdmin || isSelf) && (
                      <button
                        onClick={() => {
                          if (confirm(isSelf ? "Leave group?" : `Remove ${memObj.fullName} from group?`)) {
                            removeGroupMember(group._id, memObj._id);
                            if (isSelf) onClose();
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        title={isSelf ? "Leave Group" : "Remove Member"}
                      >
                        {isSelf ? <LogOut className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetailsModal;
