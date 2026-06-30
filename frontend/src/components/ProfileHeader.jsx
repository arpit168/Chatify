import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, Palette, UserCircle, Shield } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ThemeModal from "./ThemeModal";
import ProfileModal from "./ProfileModal";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="p-6 border-b" style={{ borderColor: "var(--border-color)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
          {/* AVATAR */}
          <div className="relative group shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="User image"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">View</span>
              </div>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2" style={{ borderColor: "var(--bg-sidebar)" }} />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate" style={{ color: "var(--text-main)" }}>
              {authUser?.fullName}
            </h3>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {authUser?.about || "Online"}
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 items-center">
          {/* ADMIN BTN */}
          {authUser?.isAdmin && (
            <Link
              to="/admin"
              className="p-2.5 rounded-xl transition-all hover:scale-105 text-indigo-400 hover:text-indigo-300"
              style={{ background: "var(--bg-input)" }}
              title="Admin Dashboard"
            >
              <Shield className="w-[18px] h-[18px]" />
            </Link>
          )}

          {/* PROFILE BTN */}
          <button
            className="p-2.5 rounded-xl transition-all hover:scale-105"
            style={{ color: "var(--text-muted)", background: "var(--bg-input)" }}
            onClick={() => setIsProfileModalOpen(true)}
            title="Profile"
          >
            <UserCircle className="w-[18px] h-[18px]" />
          </button>
          
          {/* THEME CUSTOMIZER BTN */}
          <button
            className="p-2.5 rounded-xl transition-all hover:scale-105"
            style={{ color: "var(--text-muted)", background: "var(--bg-input)" }}
            onClick={() => setIsThemeModalOpen(true)}
            title="Appearance & Themes"
          >
            <Palette className="w-[18px] h-[18px]" />
          </button>

          {/* SOUND TOGGLE BTN */}
          <button
            className="p-2.5 rounded-xl transition-all hover:scale-105"
            style={{ color: "var(--text-muted)", background: "var(--bg-input)" }}
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
            title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="w-[18px] h-[18px]" />
            ) : (
              <VolumeOffIcon className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* LOGOUT BTN */}
          <button
            className="p-2.5 rounded-xl transition-all hover:scale-105 hover:text-red-400"
            style={{ color: "var(--text-muted)", background: "var(--bg-input)" }}
            onClick={logout}
            title="Logout"
          >
            <LogOutIcon className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
export default ProfileHeader;