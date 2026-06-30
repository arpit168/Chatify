import React, { useState } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES, WALLPAPERS, BUBBLE_STYLES } from "../lib/themes";
import { Palette, X, Check, RotateCcw, Sparkles, Sliders, Layout, Type } from "lucide-react";

export default function ThemeModal({ isOpen, onClose }) {
  const {
    themeId,
    setTheme,
    customAccent,
    setCustomAccent,
    wallpaper,
    setWallpaper,
    fontSize,
    setFontSize,
    borderRadius,
    setBorderRadius,
    bubbleStyle,
    setBubbleStyle,
    resetToDefault,
  } = useThemeStore();

  const [activeTab, setActiveTab] = useState("presets"); // presets, customization, preview

  if (!isOpen) return null;

  const currentThemeObj = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const categories = ["Dark", "Light", "Brand", "Vibrant", "Nature", "Colors", "Special"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border overflow-hidden shadow-2xl transition-all"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-main)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ background: "var(--accent-gradient)" }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Appearance & Themes
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  19 Presets
                </span>
              </h2>
              <p className="text-xs text-slate-400">Customize visual appearance across all devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/60 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-700/40 px-4 pt-2 gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab("presets")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "presets"
                ? "border-cyan-400 text-cyan-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Theme Palettes
          </button>
          <button
            onClick={() => setActiveTab("customization")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "customization"
                ? "border-cyan-400 text-cyan-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Wallpaper & UI Style
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "preview"
                ? "border-cyan-400 text-cyan-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layout className="w-4 h-4" />
            Live Preview
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {activeTab === "presets" && (
            <div className="space-y-6">
              {categories.map((cat) => {
                const catThemes = THEMES.filter((t) => t.category === cat);
                if (catThemes.length === 0) return null;
                return (
                  <div key={cat} className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {cat} Themes
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {catThemes.map((t) => {
                        const isSelected = themeId === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`group relative p-3 rounded-xl border transition-all text-left flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                              isSelected
                                ? "border-cyan-400 ring-2 ring-cyan-400/20 bg-slate-800/80"
                                : "border-slate-700/50 hover:border-slate-600 bg-slate-900/40"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-slate-200 truncate">
                                {t.name}
                              </span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-900 flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            {/* Color Dots */}
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: t.preview.primary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: t.preview.bg }}
                              />
                              <div
                                className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: t.preview.card }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "customization" && (
            <div className="space-y-8">
              {/* Custom Accent Color */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  Custom Brand Accent Color
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Override the preset accent color with your own favorite shade
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
                    "#ef4444", "#f97316", "#eab308", "#10b981", "#14b8a6",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCustomAccent(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        customAccent === color ? "scale-125 ring-2 ring-white" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="relative">
                    <input
                      type="color"
                      value={customAccent || "#06b6d4"}
                      onChange={(e) => setCustomAccent(e.target.value)}
                      className="w-9 h-9 rounded-full cursor-pointer bg-transparent border-0 p-0"
                    />
                  </div>
                  {customAccent && (
                    <button
                      onClick={() => setCustomAccent(null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Reset Accent
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Wallpaper */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-cyan-400" />
                  Chat Background Wallpaper
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WALLPAPERS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => setWallpaper(wp.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        wallpaper === wp.id
                          ? "border-cyan-400 ring-2 ring-cyan-400/20 bg-slate-800/80"
                          : "border-slate-700/50 hover:border-slate-600 bg-slate-900/40"
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded-lg mb-2 border border-white/10"
                        style={{
                          background: wp.value !== "none" ? wp.value : "#0f172a",
                          backgroundColor: "var(--bg-app)",
                        }}
                      />
                      <span className="text-xs font-medium">{wp.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Bubble Style */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Message Bubble Style
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BUBBLE_STYLES.map((bs) => (
                    <button
                      key={bs.id}
                      onClick={() => setBubbleStyle(bs.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        bubbleStyle === bs.id
                          ? "border-cyan-400 ring-2 ring-cyan-400/20 bg-slate-800/80"
                          : "border-slate-700/50 hover:border-slate-600 bg-slate-900/40"
                      }`}
                    >
                      <div
                        className="w-full py-2 px-3 text-xs mb-2 bg-cyan-500 text-white font-medium"
                        style={{ borderRadius: bs.radius }}
                      >
                        Hello! 👋
                      </div>
                      <span className="text-xs font-medium">{bs.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography & Scaling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4 text-cyan-400" />
                    Font Size
                  </h3>
                  <div className="flex gap-2">
                    {["sm", "normal", "lg"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium capitalize transition-all ${
                          fontSize === size
                            ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                            : "border-slate-700/50 hover:bg-slate-800/50 text-slate-300"
                        }`}
                      >
                        {size === "sm" ? "Small" : size === "normal" ? "Normal" : "Large"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-cyan-400" />
                    Border Corner Radius
                  </h3>
                  <div className="flex gap-2">
                    {["sharp", "rounded", "modern", "pill"].map((rad) => (
                      <button
                        key={rad}
                        onClick={() => setBorderRadius(rad)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium capitalize transition-all ${
                          borderRadius === rad
                            ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                            : "border-slate-700/50 hover:bg-slate-800/50 text-slate-300"
                        }`}
                      >
                        {rad}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Live Chat Interface Preview</h3>
              <div
                className="w-full rounded-2xl border p-4 sm:p-6 shadow-xl space-y-4 relative overflow-hidden"
                style={{
                  background: "var(--bg-app)",
                  borderColor: "var(--border-color)",
                }}
              >
                {/* Wallpaper overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{ background: "var(--wallpaper-bg)" }}
                />

                <div className="relative z-10 flex items-center gap-3 pb-3 border-b border-slate-700/40">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                    S
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Sarah Jenkins</h4>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Online
                    </span>
                  </div>
                </div>

                <div className="relative z-10 space-y-3 py-2">
                  <div className="flex justify-start">
                    <div
                      className="max-w-[80%] px-4 py-2.5 shadow-md text-sm"
                      style={{
                        background: "var(--bubble-received-bg)",
                        color: "var(--bubble-received-text)",
                        borderRadius: "var(--bubble-radius)",
                      }}
                    >
                      Hey there! Check out the new enterprise messaging design 🚀
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div
                      className="max-w-[80%] px-4 py-2.5 shadow-md text-sm"
                      style={{
                        background: "var(--bubble-sent-bg)",
                        color: "var(--bubble-sent-text)",
                        borderRadius: "var(--bubble-radius)",
                      }}
                    >
                      It looks absolutely stunning! All 19 themes switch instantly! ✨
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-2 flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="Type your message..."
                    className="flex-1 px-4 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{
                      background: "var(--bg-input)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-muted)",
                      borderRadius: "var(--app-radius)",
                    }}
                  />
                  <button
                    className="px-4 py-2 font-medium text-sm text-white shadow-md"
                    style={{
                      background: "var(--accent-gradient)",
                      borderRadius: "var(--app-radius)",
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-700/40 flex items-center justify-between">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-semibold text-sm text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: "var(--accent-gradient)" }}
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
