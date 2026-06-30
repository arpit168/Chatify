import { MessageCircle, Hand } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const quickMessages = [
  { emoji: "👋", text: "Hey there!" },
  { emoji: "😊", text: "How are you?" },
  { emoji: "🎉", text: "What's new?" },
];

const NoChatHistoryPlaceholder = ({ name }) => {
  const { sendMessage } = useChatStore();

  const handleQuickSend = (text) => {
    sendMessage({ text });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
        style={{ background: "var(--bg-input)" }}
      >
        <Hand className="w-10 h-10" style={{ color: "var(--accent-primary)" }} />
      </div>

      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-main)" }}>
        Start chatting with {name}
      </h3>

      <p className="text-sm max-w-sm mb-6" style={{ color: "var(--text-muted)" }}>
        This is the beginning of your conversation. Say hello!
      </p>

      <div className="h-px w-24 mx-auto mb-6" style={{ background: "var(--border-color)" }} />

      <div className="flex flex-wrap gap-2 justify-center">
        {quickMessages.map((qm) => (
          <button
            key={qm.text}
            onClick={() => handleQuickSend(`${qm.emoji} ${qm.text}`)}
            className="px-4 py-2 text-xs font-medium rounded-full border transition-all hover:scale-105"
            style={{
              background: "var(--bg-input)",
              color: "var(--accent-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            {qm.emoji} {qm.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;