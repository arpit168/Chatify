import { useChatStore } from "../store/useChatStore";
import { MessageCircle, Users } from "lucide-react";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  const tabs = [
    { id: "chats", label: "Chats", icon: MessageCircle },
    { id: "groups", label: "Groups", icon: Users },
    { id: "contacts", label: "Contacts", icon: Users },
  ];

  return (
    <div className="px-4 py-2">
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: "var(--bg-input)" }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                isActive ? "shadow-md text-white" : ""
              }`}
              style={{
                background: isActive ? "var(--accent-gradient)" : "transparent",
                color: isActive ? "#fff" : "var(--text-muted)",
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default ActiveTabSwitch;