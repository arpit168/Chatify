import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessageLoadingSkeleton";
import {
  Reply, Pencil, Trash2, Copy, SmileIcon, Check, CheckCheck, Ban, Star, Pin, Forward, CornerUpRight
} from "lucide-react";
import ForwardMessageModal from "./ForwardMessageModal";

const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageStatusIcon({ status }) {
  if (status === "seen") return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
  if (status === "delivered") return <CheckCheck className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />;
  return <Check className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />;
}

function ChatContainer() {
  const {
    selectedUser, getMessagesByUserId, messages, isMessagesLoading,
    subscribeToMessages, unsubscribeFromMessages,
    setReplyingTo, setEditingMessage, deleteMessage, reactToMessage,
    starMessage, pinMessage, forwardMessage
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [messageToForward, setMessageToForward] = useState(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handler = () => { setContextMenu(null); setShowReactionPicker(null); };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
    setShowReactionPicker(null);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setContextMenu(null);
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = "";
  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.createdAt);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: "date", label: dateLabel });
      lastDate = dateLabel;
    }
    groupedMessages.push({ type: "message", data: msg });
  });

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
          {messages.length > 0 && !isMessagesLoading ? (
            <div className="max-w-3xl mx-auto space-y-1">
              {groupedMessages.map((item, idx) => {
                if (item.type === "date") {
                  return (
                    <div key={`date-${idx}`} className="flex justify-center py-3">
                      <span
                        className="px-4 py-1.5 rounded-full text-xs font-medium shadow-sm backdrop-blur-md"
                        style={{
                          background: "var(--bg-input)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                }

                const msg = item.data;
                const isMine = msg.senderId === authUser._id;
                const isDeleted = msg.deletedForEveryone;

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} group`}
                    onContextMenu={(e) => !isDeleted && handleContextMenu(e, msg)}
                  >
                    <div className="relative max-w-[75%] sm:max-w-[65%]">
                      {/* Reply Reference */}
                      {msg.replyTo && !isDeleted && (
                        <div
                          className="px-3 py-1.5 mb-0.5 rounded-t-xl text-xs border-l-2"
                          style={{
                            background: "var(--bg-input)",
                            borderLeftColor: "var(--accent-primary)",
                            color: "var(--text-muted)",
                          }}
                        >
                          <span className="font-semibold" style={{ color: "var(--accent-primary)" }}>
                            {msg.replyTo.senderId === authUser._id ? "You" : selectedUser.fullName}
                          </span>
                          <p className="truncate">{msg.replyTo.text || "📷 Photo"}</p>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className="px-4 py-2.5 shadow-sm transition-all duration-200"
                        style={{
                          background: isDeleted
                            ? "var(--bg-input)"
                            : isMine
                              ? "var(--bubble-sent-bg)"
                              : "var(--bubble-received-bg)",
                          color: isDeleted
                            ? "var(--text-muted)"
                            : isMine
                              ? "var(--bubble-sent-text)"
                              : "var(--bubble-received-text)",
                          borderRadius: "var(--bubble-radius)",
                        }}
                      >
                        {isDeleted ? (
                          <p className="text-sm italic flex items-center gap-1.5">
                            <Ban className="w-3.5 h-3.5" />
                            This message was deleted
                          </p>
                        ) : (
                          <>
                            {msg.isForwarded && (
                              <div className="flex items-center gap-1 mb-1 text-[10px] opacity-70">
                                <CornerUpRight className="w-3 h-3" />
                                <span>Forwarded</span>
                              </div>
                            )}
                            {msg.isPinned && (
                              <div className="flex items-center gap-1 mb-1 text-[10px] opacity-70">
                                <Pin className="w-3 h-3" />
                                <span>Pinned</span>
                              </div>
                            )}
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="Shared"
                                className="rounded-lg max-h-64 w-auto object-cover mb-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            )}
                            {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>}
                          </>
                        )}

                        {/* Time & Status */}
                        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                          {msg.starredBy?.includes(authUser._id) && (
                            <Star className="w-2.5 h-2.5 text-yellow-400" />
                          )}
                          <span className="text-[10px] opacity-60">{formatTime(msg.createdAt)}</span>
                          {msg.isEdited && <span className="text-[10px] opacity-50 italic">edited</span>}
                          {isMine && !isDeleted && <MessageStatusIcon status={msg.status} />}
                        </div>
                      </div>

                      {/* Reactions Display */}
                      {msg.reactions && msg.reactions.length > 0 && !isDeleted && (
                        <div className={`flex gap-0.5 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className="inline-flex gap-0.5 px-2 py-0.5 rounded-full shadow-sm text-xs"
                            style={{ background: "var(--bg-input)" }}
                          >
                            {msg.reactions.map((r, i) => (
                              <span key={i}>{r.emoji}</span>
                            ))}
                            {msg.reactions.length > 1 && (
                              <span style={{ color: "var(--text-muted)" }}>{msg.reactions.length}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quick Reaction Button (hover) */}
                      {!isDeleted && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isMine ? "-left-10" : "-right-10"
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id);
                            }}
                            className="p-1.5 rounded-full transition-all hover:scale-110"
                            style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}
                          >
                            <SmileIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Reaction Picker */}
                      {showReactionPicker === msg._id && (
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
                                reactToMessage(msg._id, emoji);
                                setShowReactionPicker(null);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-base hover:bg-slate-700/50 transition-transform hover:scale-125"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>
          ) : isMessagesLoading ? (
            <MessagesLoadingSkeleton />
          ) : (
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
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
            onClick={() => {
              setReplyingTo({
                ...contextMenu.message,
                senderName: contextMenu.message.senderId === authUser._id ? "You" : selectedUser.fullName,
              });
              setContextMenu(null);
            }}
          >
            <Reply className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
            Reply
          </button>

          {contextMenu.message.text && (
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
              style={{ color: "var(--text-main)" }}
              onClick={() => handleCopy(contextMenu.message.text)}
            >
              <Copy className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              Copy Text
            </button>
          )}

          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
            style={{ color: "var(--text-main)" }}
            onClick={() => {
              starMessage(contextMenu.message._id);
              setContextMenu(null);
            }}
          >
            <Star className="w-4 h-4 text-yellow-400" />
            {contextMenu.message.starredBy?.includes(authUser._id) ? "Unstar" : "Star"}
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
            style={{ color: "var(--text-main)" }}
            onClick={() => {
              pinMessage(contextMenu.message._id);
              setContextMenu(null);
            }}
          >
            <Pin className="w-4 h-4 text-indigo-400" />
            {contextMenu.message.isPinned ? "Unpin" : "Pin"}
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
            style={{ color: "var(--text-main)" }}
            onClick={() => {
              setMessageToForward(contextMenu.message);
              setContextMenu(null);
            }}
          >
            <Forward className="w-4 h-4 text-green-400" />
            Forward
          </button>

          {contextMenu.message.senderId === authUser._id && (
            <>
              {contextMenu.message.text && (
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors"
                  style={{ color: "var(--text-main)" }}
                  onClick={() => {
                    setEditingMessage(contextMenu.message);
                    setContextMenu(null);
                  }}
                >
                  <Pencil className="w-4 h-4 text-amber-400" />
                  Edit
                </button>
              )}
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors text-red-400"
                onClick={() => {
                  deleteMessage(contextMenu.message._id, true);
                  setContextMenu(null);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete for Everyone
              </button>
            </>
          )}

          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700/30 transition-colors text-red-300"
            onClick={() => {
              deleteMessage(contextMenu.message._id, false);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete for Me
          </button>
        </div>
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