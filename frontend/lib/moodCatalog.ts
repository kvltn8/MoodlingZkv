import type { Mood, MoodAnimation, SurahRecommendation } from "./types";

// Animated emoji: Google "Noto Emoji Animated" (Lottie, CC BY 4.0)
// https://googlefonts.github.io/noto-emoji-animation/
export const notoLottie = (codepoint: string) =>
  `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/lottie.json`;

export type MoodMeta = {
  id: MoodAnimation;
  name: string;
  subtitle: string;
  glyph: string;
  /** Position on the Moodling scale, 0 (heavy) → 100 (radiant) */
  score: number;
  color: string;
  tint: string;
  lottie: string;
};

export const MOODS: MoodMeta[] = [
  { id: "sad", name: "Sad", subtitle: "A little heavy", glyph: "⌁", score: 14, color: "#8FA9D6", tint: "#E3EAF6", lottie: notoLottie("1f979") },
  { id: "anxious", name: "Anxious", subtitle: "A lot on my mind", glyph: "≈", score: 28, color: "#D6A58F", tint: "#F6E6DE", lottie: notoLottie("1f630") },
  { id: "tired", name: "Tired", subtitle: "Running low", glyph: "◌", score: 40, color: "#B7A9C8", tint: "#ECE7F2", lottie: notoLottie("1f634") },
  { id: "calm", name: "Calm", subtitle: "Soft & steady", glyph: "☾", score: 62, color: "#A9C3D8", tint: "#E4EEF5", lottie: notoLottie("1f60c") },
  { id: "focused", name: "Focused", subtitle: "Clear & present", glyph: "◎", score: 74, color: "#A9C9B4", tint: "#E3F0E7", lottie: notoLottie("1f9d0") },
  { id: "happy", name: "Happy", subtitle: "Light & bright", glyph: "✦", score: 88, color: "#E9C77B", tint: "#F9EFD3", lottie: notoLottie("1f60a") },
  { id: "excited", name: "Excited", subtitle: "Full of energy", glyph: "✹", score: 97, color: "#EFA98A", tint: "#FAE5DA", lottie: notoLottie("1f929") }
];

export function normalizeMoodAnimation(value?: string | null): MoodAnimation {
  const candidate = (value || "calm").toLowerCase() as MoodAnimation;
  return MOODS.some((m) => m.id === candidate) ? candidate : "calm";
}

export function moodMeta(value?: string | null): MoodMeta {
  const id = normalizeMoodAnimation(value);
  return MOODS.find((m) => m.id === id)!;
}

/** Average scale position of a list of moods (rounded), or null when empty. */
export function averageScore(moods: Mood[]): number | null {
  if (!moods.length) return null;
  const total = moods.reduce((sum, m) => sum + moodMeta(m.animation).score, 0);
  return Math.round(total / moods.length);
}

export function scoreLabel(score: number): string {
  if (score < 22) return "Tender";
  if (score < 38) return "Heavy-ish";
  if (score < 55) return "Low battery";
  if (score < 70) return "Steady";
  if (score < 84) return "Glowing";
  return "Radiant";
}

/** Newest first (moods have no timestamp, so id order is our proxy). */
export function newestFirst(moods: Mood[]): Mood[] {
  return [...moods].sort((a, b) => b.id - a.id);
}

/** Rotate through the available recommendations so each mood entry feels fresh. */
export function pickRecommendation(mood: Mood): SurahRecommendation | null {
  const recs = mood.quran_recommendations;
  if (!recs || !recs.length) return null;
  return recs[mood.id % recs.length];
}