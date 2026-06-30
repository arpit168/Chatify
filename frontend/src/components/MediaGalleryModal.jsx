import { useState, useEffect } from "react";
import { X, Image as ImageIcon, FileText } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function MediaGalleryModal({ isOpen, onClose }) {
  const { messages } = useChatStore();
  const [activeTab, setActiveTab] = useState("media"); // "media" | "links" | "docs"
  
  if (!isOpen) return null;

  const mediaMessages = messages.filter(m => m.image);
  const docMessages = messages.filter(m => m.file);
  const linkMessages = messages.filter(m => {
    if (!m.text) return false;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return m.text.match(urlRegex);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden animate-slideUp flex flex-col h-[80vh]"
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
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            Media, Links & Docs
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:scale-105 hover:bg-slate-700/50"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4 shrink-0" style={{ borderColor: "var(--border-color)" }}>
          <button
            onClick={() => setActiveTab("media")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "media" ? "border-indigo-500 text-indigo-400" : "border-transparent"
            }`}
            style={{ color: activeTab === "media" ? "" : "var(--text-muted)" }}
          >
            Media ({mediaMessages.length})
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "links" ? "border-indigo-500 text-indigo-400" : "border-transparent"
            }`}
            style={{ color: activeTab === "links" ? "" : "var(--text-muted)" }}
          >
            Links ({linkMessages.length})
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "docs" ? "border-indigo-500 text-indigo-400" : "border-transparent"
            }`}
            style={{ color: activeTab === "docs" ? "" : "var(--text-muted)" }}
          >
            Docs ({docMessages.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === "media" && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {mediaMessages.length === 0 ? (
                <p className="col-span-full text-center py-8 text-sm opacity-60">No media shared yet.</p>
              ) : (
                mediaMessages.map(m => (
                  <div key={m._id} className="aspect-square rounded-lg overflow-hidden border border-slate-700 hover:opacity-90 cursor-pointer">
                    <img src={m.image} alt="Shared media" className="w-full h-full object-cover" />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "links" && (
            <div className="space-y-3">
              {linkMessages.length === 0 ? (
                <p className="text-center py-8 text-sm opacity-60">No links shared yet.</p>
              ) : (
                linkMessages.map(m => {
                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  const urls = m.text.match(urlRegex) || [];
                  return urls.map((url, i) => (
                    <a
                      key={`${m._id}-${i}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl border hover:bg-slate-700/20 transition-colors"
                      style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    >
                      <p className="text-sm font-medium text-blue-400 truncate">{url}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </a>
                  ));
                })
              )}
            </div>
          )}

          {activeTab === "docs" && (
            <div className="space-y-3">
              {docMessages.length === 0 ? (
                <p className="text-center py-8 text-sm opacity-60">No documents shared yet.</p>
              ) : (
                docMessages.map(m => (
                  <div
                    key={m._id}
                    className="flex items-center gap-3 p-4 rounded-xl border"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  >
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      <FileText className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.file?.name || "Document"}</p>
                      <p className="text-xs opacity-60">
                        {new Date(m.createdAt).toLocaleDateString()} • {(m.file?.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaGalleryModal;
