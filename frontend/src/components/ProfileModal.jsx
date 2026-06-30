import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  X, Camera, Mail, User, Info, Save, Loader2
} from "lucide-react";

function ProfileModal({ isOpen, onClose }) {
  const { authUser, updateProfile } = useAuthStore();
  const [about, setAbout] = useState(authUser?.about || "Hey there! I'm using Chatify");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        await updateProfile({ profilePic: reader.result });
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleSaveAbout = async () => {
    // About is saved locally — backend update can be extended later
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-slideUp"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
            Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:scale-105"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-offset-4 shadow-xl"
                style={{ ringColor: "var(--accent-primary)", ringOffsetColor: "var(--bg-card)" }}
              >
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white transition-all hover:scale-110"
                style={{ background: "var(--accent-gradient)" }}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <h3 className="mt-4 text-xl font-bold" style={{ color: "var(--text-main)" }}>
              {authUser?.fullName}
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {authUser?.email}
            </p>
          </div>

          {/* Info Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <User className="w-3.5 h-3.5" />
                Name
              </label>
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "var(--bg-input)",
                  color: "var(--text-main)",
                }}
              >
                {authUser?.fullName}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </label>
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "var(--bg-input)",
                  color: "var(--text-main)",
                }}
              >
                {authUser?.email}
              </div>
            </div>

            {/* About */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <Info className="w-3.5 h-3.5" />
                About
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={2}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none border-0 outline-none focus:ring-2 transition-all"
                style={{
                  background: "var(--bg-input)",
                  color: "var(--text-main)",
                }}
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-right" style={{ color: "var(--text-muted)" }}>
                {about.length}/500
              </p>
            </div>
          </div>

          {/* Member Since */}
          <div className="text-center pt-2">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Member since {new Date(authUser?.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
