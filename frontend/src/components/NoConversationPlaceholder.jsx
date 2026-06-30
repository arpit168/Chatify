import { MessageCircle, Sparkles, Shield, Zap } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      {/* Animated Logo */}
      <div className="relative mb-8">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
          style={{ background: "var(--accent-gradient)" }}
        >
          <MessageCircle className="w-12 h-12 text-white" />
        </div>
        <div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "var(--bg-card)" }}
        >
          <Sparkles className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-main)" }}>
        Welcome to Chatify
      </h2>
      <p className="text-sm max-w-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Select a conversation from the sidebar to start messaging, or search for someone new.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full">
        {[
          { icon: Zap, title: "Lightning Fast", desc: "Real-time messaging" },
          { icon: Shield, title: "Secure", desc: "End-to-end security" },
          { icon: Sparkles, title: "Rich Features", desc: "Reactions, replies & more" },
        ].map((feature) => (
          <div
            key={feature.title}
            className="p-4 rounded-2xl border text-center transition-all hover:scale-105"
            style={{ background: "var(--bg-input)", borderColor: "var(--border-color)" }}
          >
            <feature.icon className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--accent-primary)" }} />
            <h4 className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-main)" }}>
              {feature.title}
            </h4>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoConversationPlaceholder;