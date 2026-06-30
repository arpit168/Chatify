import { create } from "zustand";
import { THEMES, WALLPAPERS, BUBBLE_STYLES } from "../lib/themes";

const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem("chatify_theme_prefs");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse saved theme preferences:", e);
  }
  return {
    themeId: "dark",
    customAccent: null,
    wallpaper: "default",
    fontSize: "normal",
    borderRadius: "modern",
    bubbleStyle: "modern",
  };
};

export const useThemeStore = create((set, get) => ({
  ...getSavedTheme(),

  setTheme: (themeId) => {
    set({ themeId, customAccent: null });
    get().applyTheme();
  },

  setCustomAccent: (customAccent) => {
    set({ customAccent });
    get().applyTheme();
  },

  setWallpaper: (wallpaper) => {
    set({ wallpaper });
    get().applyTheme();
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    get().applyTheme();
  },

  setBorderRadius: (borderRadius) => {
    set({ borderRadius });
    get().applyTheme();
  },

  setBubbleStyle: (bubbleStyle) => {
    set({ bubbleStyle });
    get().applyTheme();
  },

  resetToDefault: () => {
    const defaultState = {
      themeId: "dark",
      customAccent: null,
      wallpaper: "default",
      fontSize: "normal",
      borderRadius: "modern",
      bubbleStyle: "modern",
    };
    set(defaultState);
    get().applyTheme();
  },

  applyTheme: () => {
    const { themeId, customAccent, wallpaper, fontSize, borderRadius, bubbleStyle } = get();

    // Save to local storage
    localStorage.setItem(
      "chatify_theme_prefs",
      JSON.stringify({ themeId, customAccent, wallpaper, fontSize, borderRadius, bubbleStyle })
    );

    const themeObj = THEMES.find((t) => t.id === themeId) || THEMES[0];
    const root = document.documentElement;

    // Apply colors
    Object.entries(themeObj.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Override custom accent if specified
    if (customAccent) {
      root.style.setProperty("--accent-primary", customAccent);
      root.style.setProperty("--accent-gradient", `linear-gradient(to right, ${customAccent}, #8b5cf6)`);
      root.style.setProperty("--bubble-sent-bg", `linear-gradient(135deg, ${customAccent}, #3b82f6)`);
    }

    // Apply wallpaper
    const wpObj = WALLPAPERS.find((w) => w.id === wallpaper) || WALLPAPERS[0];
    root.style.setProperty("--wallpaper-bg", wpObj.value);

    // Apply font size
    const sizeMap = { sm: "14px", normal: "16px", lg: "18px" };
    root.style.setProperty("--app-font-size", sizeMap[fontSize] || "16px");

    // Apply border radius
    const radiusMap = { sharp: "0px", rounded: "8px", modern: "16px", pill: "24px" };
    root.style.setProperty("--app-radius", radiusMap[borderRadius] || "16px");

    // Apply bubble radius
    const bStyle = BUBBLE_STYLES.find((b) => b.id === bubbleStyle) || BUBBLE_STYLES[0];
    root.style.setProperty("--bubble-radius", bStyle.radius);
  },
}));
