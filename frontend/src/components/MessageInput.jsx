import { useState, useRef, useCallback, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import {
  ImageIcon, SendIcon, XIcon, SmileIcon, Paperclip,
  Mic, Reply, Pencil, FileText
} from "lucide-react";

const EMOJI_LIST = ["😀","😂","❤️","🔥","👍","👎","🎉","😢","😮","🤔","👏","💯","🙏","✨","💪","🫡"];

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    sendMessage, isSoundEnabled, replyingTo, clearReply,
    editingMessage, clearEditingMessage, editMessage,
    emitTyping, emitStopTyping,
  } = useChatStore();

  // Pre-fill text when editing
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  const handleTyping = useCallback(() => {
    emitTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 2000);
  }, [emitTyping, emitStopTyping]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview) return;

    if (editingMessage) {
      editMessage(editingMessage._id, text.trim());
      setText("");
      return;
    }

    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
      file: filePreview,
      replyTo: replyingTo?._id || null,
    });
    setText("");
    setImagePreview(null);
    setFilePreview(null);
    setShowEmoji(false);
    emitStopTyping();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10MB");
      return;
    }
    const reader = new FileReader();
    if (file.type.startsWith("image/")) {
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFilePreview(null);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onloadend = () => {
        setFilePreview({
          data: reader.result,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
        });
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const removeAttachment = () => {
    setImagePreview(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-t transition-all relative ${isDragging ? "bg-indigo-500/10 border-indigo-500" : ""}`}
      style={{ borderColor: "var(--border-color)", background: "var(--bg-sidebar)" }}
    >
      {isDragging && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-indigo-500/20 backdrop-blur-xs border-2 border-dashed border-indigo-400 rounded-lg">
          <p className="text-sm font-semibold text-indigo-300">Drop file to attach</p>
        </div>
      )}

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div
          className="flex items-center gap-3 px-5 py-2.5 border-b"
          style={{ borderColor: "var(--border-color)", background: "var(--bg-input)" }}
        >
          <div className="w-1 h-10 rounded-full" style={{ background: "var(--accent-primary)" }} />
          <Reply className="w-4 h-4 shrink-0" style={{ color: "var(--accent-primary)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: "var(--accent-primary)" }}>
              Replying to {replyingTo.senderName || "message"}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {replyingTo.text || (replyingTo.image ? "📷 Photo" : "📎 File")}
            </p>
          </div>
          <button onClick={clearReply} className="p-1 rounded-full hover:bg-slate-700/50">
            <XIcon className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      )}

      {/* Edit Banner */}
      {editingMessage && (
        <div
          className="flex items-center gap-3 px-5 py-2.5 border-b"
          style={{ borderColor: "var(--border-color)", background: "var(--bg-input)" }}
        >
          <div className="w-1 h-10 rounded-full bg-amber-400" />
          <Pencil className="w-4 h-4 shrink-0 text-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-400">Editing message</p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {editingMessage.text}
            </p>
          </div>
          <button
            onClick={() => { clearEditingMessage(); setText(""); }}
            className="p-1 rounded-full hover:bg-slate-700/50"
          >
            <XIcon className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      )}

      {/* Attachment Preview (Image or File) */}
      {(imagePreview || filePreview) && (
        <div className="px-5 pt-3">
          <div className="relative inline-block">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-xl border shadow-lg"
                style={{ borderColor: "var(--border-color)" }}
              />
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl border shadow-lg bg-slate-800/80" style={{ borderColor: "var(--border-color)" }}>
                <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                <div className="text-xs min-w-0 max-w-[160px]">
                  <p className="font-semibold truncate" style={{ color: "var(--text-main)" }}>{filePreview.name}</p>
                  <p className="text-slate-400">{(filePreview.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}
            <button
              onClick={removeAttachment}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              type="button"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="px-5 pt-3 pb-1 flex flex-wrap gap-1.5">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => insertEmoji(emoji)}
              type="button"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-lg hover:bg-slate-700/50 transition-colors hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2 p-3 sm:p-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl transition-all hover:scale-105"
          style={{
            color: imagePreview || filePreview ? "var(--accent-primary)" : "var(--text-muted)",
            background: "var(--bg-input)",
          }}
          title="Attach image or file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-2.5 rounded-xl transition-all hover:scale-105"
          style={{
            color: showEmoji ? "var(--accent-primary)" : "var(--text-muted)",
            background: "var(--bg-input)",
          }}
          title="Emojis"
        >
          <SmileIcon className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (editingMessage) { clearEditingMessage(); setText(""); }
                if (replyingTo) clearReply();
              }
            }}
            className="w-full py-3 px-5 rounded-2xl text-sm border-0 outline-none transition-all focus:ring-2"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-main)",
              borderRadius: "var(--app-radius)",
            }}
            placeholder={editingMessage ? "Edit your message..." : "Type a message or drop file..."}
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview && !filePreview}
          className="p-3 rounded-2xl text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg active:scale-95"
          style={{
            background: text.trim() || imagePreview || filePreview ? "var(--accent-gradient)" : "var(--bg-input)",
            borderRadius: "var(--app-radius)",
          }}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;