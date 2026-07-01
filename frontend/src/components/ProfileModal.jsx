import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  X, Camera, Mail, User, Info, Save, Loader2, AtSign, Image as ImageIcon
} from "lucide-react";

function ProfileModal({ isOpen, onClose }) {
  const { authUser, updateProfile } = useAuthStore();
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [username, setUsername] = useState(authUser?.username || "");
  const [about, setAbout] = useState(authUser?.about || "Hey there! I'm using Chatify");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

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

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        await updateProfile({ banner: reader.result });
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ fullName, username, about, bio });
      onClose();
    } finally {
      setIsSaving(false);
    }
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
        className="relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-slideUp max-h-[90vh] flex flex-col"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Banner Section */}
        <div className="relative h-32 w-full bg-gradient-to-r from-purple-600 to-cyan-500 overflow-hidden">
          {authUser?.banner && (
            <img src={authUser.banner} alt="Banner" className="w-full h-full object-cover" />
          )}
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={isUploading}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all text-xs flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4" /> Edit Banner
          </button>
          <input
            type="file"
            accept="image/*"
            ref={bannerInputRef}
            onChange={handleBannerUpload}
            className="hidden"
          />
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Content */}
        <div className="px-6 pb-6 pt-0 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center -mt-14">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 shadow-xl"
                style={{ ringColor: "var(--bg-card)" }}
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
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-white transition-all hover:scale-110"
                style={{ background: "var(--accent-gradient)" }}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
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
          </div>

          {/* Info Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border-0 outline-none focus:ring-2 transition-all"
                style={{ background: "var(--bg-input)", color: "var(--text-main)" }}
                placeholder="Your display name"
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <AtSign className="w-3.5 h-3.5" /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border-0 outline-none focus:ring-2 transition-all"
                style={{ background: "var(--bg-input)", color: "var(--text-main)" }}
                placeholder="unique_username"
              />
            </div>

            {/* Email (readonly) */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <div
                className="px-4 py-2.5 rounded-xl text-sm opacity-70"
                style={{ background: "var(--bg-input)", color: "var(--text-main)" }}
              >
                {authUser?.email}
              </div>
            </div>

            {/* About */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <Info className="w-3.5 h-3.5" /> Status / About
              </label>
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl text-sm border-0 outline-none focus:ring-2 transition-all"
                style={{ background: "var(--bg-input)", color: "var(--text-main)" }}
                placeholder="Hey there! I'm using Chatify"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <Info className="w-3.5 h-3.5" /> Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={300}
                className="w-full px-4 py-2.5 rounded-xl text-sm resize-none border-0 outline-none focus:ring-2 transition-all"
                style={{ background: "var(--bg-input)", color: "var(--text-main)" }}
                placeholder="Write a short bio..."
              />
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: "var(--bg-input)", color: "var(--text-main)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2 shadow-lg transition-all hover:scale-105"
              style={{ background: "var(--accent-gradient)" }}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
