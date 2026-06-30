import { MessageCircle, ArrowRight } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
        style={{ background: "var(--bg-input)" }}
      >
        <MessageCircle className="w-8 h-8" style={{ color: "var(--accent-primary)" }} />
      </div>

      <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-main)" }}>
        No conversations yet
      </h3>
      <p className="text-xs max-w-xs mb-5" style={{ color: "var(--text-muted)" }}>
        Start messaging by searching for someone or browsing the contacts tab.
      </p>

      <button
        onClick={() => setActiveTab("contacts")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
        style={{ background: "var(--accent-gradient)" }}
      >
        Browse Contacts
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default NoChatsFound;