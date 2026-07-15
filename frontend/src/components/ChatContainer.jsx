import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessageLoadingSkeleton";
import {
  Reply, Pencil, Trash2, Copy, SmileIcon, Check, CheckCheck, Ban, 
  Star, Pin, Forward, CornerUpRight, FileText, Download
} from "lucide-react";
import ForwardMessageModal from "./ForwardMessageModal";

// Constants
const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

// Utility functions
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { 
    weekday: "long", 
    month: "short", 
    day: "numeric" 
  });
};

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Sub-components
const MessageStatusIcon = ({ status }) => {
  const statusConfig = {
    seen: { Icon: CheckCheck, color: "text-blue-400" },
    delivered: { Icon: CheckCheck, color: "text-muted" },
    sent: { Icon: Check, color: "text-muted" }
  };
  
  const config = statusConfig[status] || statusConfig.sent;
  const { Icon, color } = config;
  
  return <Icon className={`w-3.5 h-3.5 ${color}`} />;
};

const DateDivider = ({ label }) => (
  <div className="flex justify-center py-3">
    <span
      className="px-4 py-1.5 rounded-full text-xs font-medium shadow-sm backdrop-blur-md"
      style={{
        background: "var(--bg-input)",
        color: "var(--text-muted)",
      }}
    >
      {label}
    </span>
  </div>
);

const ReplyReference = ({ replyTo, isMine, selectedUserName, authUserId }) => {
  const senderName = replyTo.senderId === authUserId ? "You" : selectedUserName;
  const content = replyTo.text || (replyTo.image ? "📷 Photo" : "📎 File");
  
  return (
    <div
      className="px-3 py-1.5 mb-0.5 rounded-t-xl text-xs border-l-2"
      style={{
        background: "var(--bg-input)",
        borderLeftColor: "var(--accent-primary)",
        color: "var(--text-muted)",
      }}
    >
      <span className="font-semibold" style={{ color: "var(--accent-primary)" }}>
        {senderName}
      </span>
      <p className="truncate">{content}</p>
    </div>
  );
};

const ReactionPicker = ({ messageId, isMine, onReact, onClose }) => {
  return (
    <div
      className={`absolute z-20 bottom-full mb-1 flex gap-1 p-1.5 rounded-xl shadow-xl border ${
        isMine ? "right-0" : "left-0"
      }`}
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onReact(messageId, emoji);
            onClose();
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-base hover:bg-slate-700/50 transition-transform hover:scale-125"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

const MessageBubble = ({ 
  message, 
  isMine, 
  selectedUser, 
  authUser,
  onContextMenu,
  onReply,
  onCopy,
  onStar,
  onPin,
  onForward,
  onDelete,
  onEdit,
  showReactionPicker,
  onToggleReactionPicker,
  onReact
}) => {
  const isDeleted = message.deletedForEveryone;
  const isStarred = message.starredBy?.includes(authUser._id);
  
  if (isDeleted) {
    return (
      <div
        className={`flex ${isMine ? "justify-end" : "justify-start"} group`}
      >
        <div className="max-w-[75%] sm:max-w-[65%]">
          <div
            className="px-4 py-2.5 shadow-sm"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-muted)",
              borderRadius: "var(--bubble-radius)",
            }}
          >
            <p className="text-sm italic flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5" />
              This message was deleted
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} group`}
      onContextMenu={(e) => onContextMenu(e, message)}
    >
      <div className="relative max-w-[75%] sm:max-w-[65%]">
        {/* Reply Reference */}
        {message.replyTo && (
          <ReplyReference 
            replyTo={message.replyTo}
            isMine={isMine}
            selectedUserName={selectedUser.fullName}
            authUserId={authUser._id}
          />
        )}

        {/* Message Bubble */}
        <div
          className="px-4 py-2.5 shadow-sm transition-all duration-200"
          style={{
            background: isMine ? "var(--bubble-sent-bg)" : "var(--bubble-received-bg)",
            color: isMine ? "var(--bubble-sent-text)" : "var(--bubble-received-text)",
            borderRadius: "var(--bubble-radius)",
          }}
        >
          {/* Metadata */}
          {(message.isForwarded || message.isPinned) && (
            <div className="flex items-center gap-1 mb-1 text-[10px] opacity-70">
              {message.isForwarded && <CornerUpRight className="w-3 h-3" />}
              {message.isForwarded && <span>Forwarded</span>}
              {message.isForwarded && message.isPinned && <span className="w-0.5 h-3 bg-current opacity-30" />}
              {message.isPinned && <Pin className="w-3 h-3" />}
              {message.isPinned && <span>Pinned</span>}
            </div>
          )}

          {/* Media Content */}
          {message.image && (
            <img
              src={message.image}
              alt="Shared"
              className="rounded-lg max-h-64 w-auto object-cover mb-1.5 cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          )}
          
          {message.file && (
            <a
              href={message.file.url || message.file.data}
              download={message.file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 my-1 rounded-xl border transition-all hover:scale-[1.02] shadow-sm bg-black/20"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <FileText className="w-8 h-8 shrink-0 text-indigo-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{message.file.name}</p>
                <p className="text-[10px] opacity-75">
                  {message.file.size ? `${(message.file.size / 1024).toFixed(1)} KB` : "Document"}
                </p>
              </div>
              <Download className="w-4 h-4 shrink-0 opacity-80" />
            </a>
          )}
          
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.text}
            </p>
          )}
        </div>

        {/* Reactions Display */}
        {message.reactions?.length > 0 && (
          <div className={`flex gap-0.5 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
            <div
              className="inline-flex gap-0.5 px-2 py-0.5 rounded-full shadow-sm text-xs"
              style={{ background: "var(--bg-input)" }}
            >
              {message.reactions.map((r, i) => (
                <span key={i}>{r.emoji}</span>
              ))}
              {message.reactions.length > 1 && (
                <span style={{ color: "var(--text-muted)" }}>
                  {message.reactions.length}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Time & Status */}
        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
          {isStarred && <Star className="w-2.5 h-2.5 text-yellow-400" />}
          <span className="text-[10px] opacity-60">{formatTime(message.createdAt)}</span>
          {message.isEdited && <span className="text-[10px] opacity-50 italic">edited</span>}
          {isMine && <MessageStatusIcon status={message.status} />}
        </div>

        {/* Quick Reaction Button */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
            isMine ? "-left-10" : "-right-10"
          }`}
        >
          <button
            onClick={() => onToggleReactionPicker(message._id)}
            className="p-1.5 rounded-full transition-all hover:scale-110"
            style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}
          >
            <SmileIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Reaction Picker */}
        {showReactionPicker === message._id && (
          <ReactionPicker
            messageId={message._id}
            isMine={isMine}
            onReact={onReact}
            onClose={() => onToggleReactionPicker(null)}
          />
        )}
      </div>
    </div>
  );
};

const ContextMenu = ({ 
  contextMenu, 
  onClose, 
  onReply, 
  onCopy, 
  onStar, 
  onPin, 
  onForward, 
  onEdit, 
  onDelete,
  isOwnMessage,
  hasText
}) => {
  if (!contextMenu) return null;

  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <div
      className="fixed z-50 py-2 rounded-xl shadow-2xl border backdrop-blur-xl min-w-[180px]"
      style={{
        top: contextMenu.y,
        left: contextMenu.x,
        background: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
        style={{ color: "var(--text-main)" }}
        onClick={() => handleAction(onReply)}
      >
        <Reply className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
        Reply
      </button>

      {hasText && (
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
          style={{ color: "var(--text-main)" }}
          onClick={() => handleAction(() => onCopy(contextMenu.message.text))}
        >
          <Copy className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          Copy Text
        </button>
      )}

      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
        style={{ color: "var(--text-main)" }}
        onClick={() => handleAction(onStar)}
      >
        <Star className="w-4 h-4 text-yellow-400" />
        {contextMenu.message.starredBy?.includes(contextMenu.authUserId) ? "Unstar" : "Star"}
      </button>

      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
        style={{ color: "var(--text-main)" }}
        onClick={() => handleAction(onPin)}
      >
        <Pin className="w-4 h-4 text-indigo-400" />
        {contextMenu.message.isPinned ? "Unpin" : "Pin"}
      </button>

      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
        style={{ color: "var(--text-main)" }}
        onClick={() => handleAction(onForward)}
      >
        <Forward className="w-4 h-4 text-green-400" />
        Forward
      </button>

      {isOwnMessage && (
        <>
          {hasText && (
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
              style={{ color: "var(--text-main)" }}
              onClick={() => handleAction(onEdit)}
            >
              <Pencil className="w-4 h-4 text-amber-400" />
              Edit
            </button>
          )}
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors text-red-400"
            onClick={() => handleAction(() => onDelete(true))}
          >
            <Trash2 className="w-4 h-4" />
            Delete for Everyone
          </button>
        </>
      )}

      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors text-red-300"
        onClick={() => handleAction(() => onDelete(false))}
      >
        <Trash2 className="w-4 h-4" />
        Delete for Me
      </button>
    </div>
  );
};

// Main Component
function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    setReplyingTo,
    setEditingMessage,
    deleteMessage,
    reactToMessage,
    starMessage,
    pinMessage,
    forwardMessage
  } = useChatStore();
  const { authUser } = useAuthStore();
  
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [messageToForward, setMessageToForward] = useState(null);

  // Load messages on user change
  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenu(null);
      setShowReactionPicker(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Handlers
  const handleContextMenu = useCallback((e, msg) => {
    e.preventDefault();
    setContextMenu({ 
      x: e.clientX, 
      y: e.clientY, 
      message: msg,
      authUserId: authUser._id 
    });
    setShowReactionPicker(null);
  }, [authUser._id]);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleReply = useCallback((message) => {
    setReplyingTo({
      ...message,
      senderName: message.senderId === authUser._id ? "You" : selectedUser.fullName,
    });
  }, [setReplyingTo, authUser._id, selectedUser.fullName]);

  const handleStar = useCallback((messageId) => {
    starMessage(messageId);
  }, [starMessage]);

  const handlePin = useCallback((messageId) => {
    pinMessage(messageId);
  }, [pinMessage]);

  const handleForward = useCallback((message) => {
    setMessageToForward(message);
  }, []);

  const handleEdit = useCallback((message) => {
    setEditingMessage(message);
  }, [setEditingMessage]);

  const handleDelete = useCallback((messageId, forEveryone) => {
    deleteMessage(messageId, forEveryone);
  }, [deleteMessage]);

  const handleReact = useCallback((messageId, emoji) => {
    reactToMessage(messageId, emoji);
  }, [reactToMessage]);

  const handleToggleReactionPicker = useCallback((messageId) => {
    setShowReactionPicker(prev => prev === messageId ? null : messageId);
  }, []);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = "";
    
    messages.forEach((msg) => {
      const dateLabel = formatDate(msg.createdAt);
      if (dateLabel !== lastDate) {
        groups.push({ type: "date", label: dateLabel });
        lastDate = dateLabel;
      }
      groups.push({ type: "message", data: msg });
    });
    
    return groups;
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Dynamic Wallpaper Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: "var(--wallpaper-bg)" }}
        />

        <div className="relative z-10 px-4 sm:px-6 py-4">
          {isMessagesLoading ? (
            <MessagesLoadingSkeleton />
          ) : messages.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-1">
              {groupedMessages.map((item, idx) => {
                if (item.type === "date") {
                  return <DateDivider key={`date-${idx}`} label={item.label} />;
                }

                const message = item.data;
                const isMine = message.senderId === authUser._id;
                
                return (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isMine={isMine}
                    selectedUser={selectedUser}
                    authUser={authUser}
                    onContextMenu={handleContextMenu}
                    onReply={() => handleReply(message)}
                    onCopy={handleCopy}
                    onStar={() => handleStar(message._id)}
                    onPin={() => handlePin(message._id)}
                    onForward={() => handleForward(message)}
                    onEdit={() => handleEdit(message)}
                    onDelete={(forEveryone) => handleDelete(message._id, forEveryone)}
                    showReactionPicker={showReactionPicker}
                    onToggleReactionPicker={handleToggleReactionPicker}
                    onReact={handleReact}
                  />
                );
              })}
              <div ref={messageEndRef} />
            </div>
          ) : (
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onClose={() => setContextMenu(null)}
          onReply={() => handleReply(contextMenu.message)}
          onCopy={handleCopy}
          onStar={() => handleStar(contextMenu.message._id)}
          onPin={() => handlePin(contextMenu.message._id)}
          onForward={() => handleForward(contextMenu.message)}
          onEdit={() => handleEdit(contextMenu.message)}
          onDelete={(forEveryone) => handleDelete(contextMenu.message._id, forEveryone)}
          isOwnMessage={contextMenu.message.senderId === authUser._id}
          hasText={!!contextMenu.message.text}
        />
      )}

      <MessageInput />

      <ForwardMessageModal
        isOpen={!!messageToForward}
        onClose={() => setMessageToForward(null)}
        messageToForward={messageToForward}
      />
    </>
  );
}

export default ChatContainer;