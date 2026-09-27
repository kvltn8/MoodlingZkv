// Moodling — "quiet luxury" palette: deep emerald + warm ivory + muted gold.
// Calm enough to sit with your feelings, rich enough to feel considered.

export const colors = {
  background: "#F7F2EA", // warm ivory
  backgroundAlt: "#EFE6D8",
  surface: "#FFFFFF",
  surfaceMuted: "#FBF8F2",

  emerald: "#1F3B34", // primary
  emeraldDeep: "#142722",
  emeraldSoft: "#3D5A50",

  gold: "#C9A24B", // accent
  goldSoft: "#E4CE9A",
  goldMuted: "#B08F45",

  ink: "#26312C", // primary text
  inkMuted: "#6C7A72",
  inkFaint: "#A6B0A9",

  rose: "#B8756A",
  sky: "#7E97A6",

  success: "#5F8F6E",
  danger: "#B0564C",

  overlay: "rgba(20, 39, 34, 0.55)",
  border: "rgba(38, 49, 44, 0.08)",
};

export const moodPalette: Record<
  string,
  { base: string; soft: string; label: string; emoji: string }
> = {
  happy: { base: "#C9A24B", soft: "#F3E6C4", label: "Happy", emoji: "☺" },
  calm: { base: "#7E97A6", soft: "#E1EAEE", label: "Calm", emoji: "〜" },
  focused: { base: "#1F3B34", soft: "#DCE6E1", label: "Focused", emoji: "◎" },
  tired: { base: "#8A7B9E", soft: "#E7E1EE", label: "Tired", emoji: "◡" },
  sad: { base: "#7E8CA6", soft: "#E1E4EE", label: "Sad", emoji: "︶" },
  anxious: { base: "#B8756A", soft: "#F1DEDA", label: "Anxious", emoji: "≈" },
  excited: { base: "#C97B4B", soft: "#F3D9C4", label: "Excited", emoji: "✦" },
};

export type MoodKey = keyof typeof moodPalette;

export const radii = { sm: 12, md: 18, lg: 26, xl: 34, pill: 999 };

export const shadow = {
  card: {
    shadowColor: "#142722",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  floating: {
    shadowColor: "#142722",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

export const fonts = {
  display: "LobsterTwo_400Regular", // headlines, the "Moodling" wordmark
  displayItalic: "LobsterTwo_400Regular_Italic",
  script: "DancingScript_600SemiBold", // accents, quotes, mood labels
  scriptRegular: "DancingScript_400Regular",
};
