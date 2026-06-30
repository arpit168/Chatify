import { useState, useEffect } from "react";
import { X, Send, Search, Forward as ForwardIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function ForwardMessageModal({ isOpen, onClose, messageToForward }) {
  const { allContacts, getAllContacts, getMyChatPartners, forwardMessage } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);

  useEffect(() => {
    if (isOpen && allContacts.length === 0) {
      getAllContacts();
    }
  }, [isOpen, allContacts.length, getAllContacts]);

  if (!isOpen || !messageToForward) return null;

  const filteredContacts = allContacts.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleForward = async (userId) => {
    setIsForwarding(true);
    await forwardMessage(messageToForward._id, userId);
    setIsForwarding(false);
    getMyChatPartners(); // update chats list
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden animate-slideUp flex flex-col max-h-[80vh]"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
            <ForwardIcon className="w-5 h-5 text-indigo-400" />
            Forward Message
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-all hover:scale-105 hover:bg-slate-700/50"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b shrink-0" style={{ borderColor: "var(--border-color)" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none focus:ring-1"
              style={{
                background: "var(--bg-input)",
                color: "var(--text-main)",
              }}
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto flex-1 p-2 custom-scrollbar space-y-1">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-sm p-4 opacity-60">No contacts found.</p>
          ) : (
            filteredContacts.map(contact => (
              <div
                key={contact._id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-700/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={contact.profilePic || "/avatar.png"}
                    alt={contact.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium" style={{ color: "var(--text-main)" }}>
                    {contact.fullName}
                  </span>
                </div>
                <button
                  onClick={() => handleForward(contact._id)}
                  disabled={isForwarding}
                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  Send
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ForwardMessageModal;
