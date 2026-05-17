import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

const themes = {
  dark: {
    bg: "#020617",
    card: "#0F172A",
    text: "#FFFFFF",
    subText: "#94A3B8",
    border: "#1E293B",
    input: "#07111F",
    primary: "#22C55E",
    glow: "#22C55E",
    danger: "#EF4444",
  },

  neon: {
    bg: "#050014",
    card: "#10002B",
    text: "#F8FAFC",
    subText: "#C084FC",
    border: "#7C3AED",
    input: "#1E063B",
    primary: "#A855F7",
    glow: "#D946EF",
    danger: "#FB7185",
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("dark");

  const [name, setNameState] = useState("User");
  const [selectedAvatar, setSelectedAvatarState] = useState("🧑");

  const [saveChat, setSaveChatState] = useState(true);
  const [secureMode, setSecureModeState] = useState(true);
  const [sosShortcut, setSosShortcutState] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("APP_SETTINGS");

      if (saved) {
        const data = JSON.parse(saved);

        if (data.theme === "dark" || data.theme === "neon") {
          setThemeState(data.theme);
        }

        if (data.name) setNameState(data.name);
        if (data.selectedAvatar) setSelectedAvatarState(data.selectedAvatar);
        if (data.saveChat !== undefined) setSaveChatState(data.saveChat);
        if (data.secureMode !== undefined) setSecureModeState(data.secureMode);
        if (data.sosShortcut !== undefined) setSosShortcutState(data.sosShortcut);
      }
    } catch (error) {
      console.log("Load settings error:", error);
    }
  };

  const saveSettings = async (newData) => {
    try {
      const old = await AsyncStorage.getItem("APP_SETTINGS");
      const oldData = old ? JSON.parse(old) : {};

      await AsyncStorage.setItem(
        "APP_SETTINGS",
        JSON.stringify({
          ...oldData,
          ...newData,
        })
      );
    } catch (error) {
      console.log("Save settings error:", error);
    }
  };

  const setTheme = (value) => {
    if (value !== "dark" && value !== "neon") return;

    setThemeState(value);
    saveSettings({ theme: value });
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "neon" : "dark";
    setTheme(nextTheme);
  };

  const colors = themes[theme] || themes.dark;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        colors,

        name,
        setName: (value) => {
          setNameState(value);
          saveSettings({ name: value });
        },

        selectedAvatar,
        setSelectedAvatar: (value) => {
          setSelectedAvatarState(value);
          saveSettings({ selectedAvatar: value });
        },

        saveChat,
        setSaveChat: (value) => {
          setSaveChatState(value);
          saveSettings({ saveChat: value });
        },

        secureMode,
        setSecureMode: (value) => {
          setSecureModeState(value);
          saveSettings({ secureMode: value });
        },

        sosShortcut,
        setSosShortcut: (value) => {
          setSosShortcutState(value);
          saveSettings({ sosShortcut: value });
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);