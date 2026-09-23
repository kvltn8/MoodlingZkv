// Ordered as an actual low -> high scale rather than a flat list, since the
// design brief asked for the mood scale to "cooperate" and feel intentional.
// `key` matches the backend's MoodEntry.animations choices exactly.
// Illustrations are unDraw (MIT-licensed, free for commercial/personal use,
// no attribution required), hotlinked from the community CDN mirror.

const CDN =
  "https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations";

export const MOODS = [
  {
    key: "sad",
    label: "Sad",
    score: 1,
    blurb: "A heavy day. That's alright.",
    illo: `${CDN}/feeling_blue_4b7q.svg`,
  },
  {
    key: "anxious",
    label: "Anxious",
    score: 2,
    blurb: "A little unmoored today.",
    illo: `${CDN}/lost_bqr2.svg`,
  },
  {
    key: "tired",
    label: "Tired",
    score: 3,
    blurb: "Running low, and that's fine.",
    illo: `${CDN}/sleep_analysis_o5f9.svg`,
  },
  {
    key: "focused",
    label: "Focused",
    score: 4,
    blurb: "Clear-headed and on task.",
    illo: `${CDN}/focus_sey6.svg`,
  },
  {
    key: "calm",
    label: "Calm",
    score: 5,
    blurb: "Settled and steady.",
    illo: `${CDN}/meditating_0nae.svg`,
  },
  {
    key: "happy",
    label: "Happy",
    score: 6,
    blurb: "Good, plain and simple.",
    illo: `${CDN}/young_and_happy_hfpe.svg`,
  },
  {
    key: "excited",
    label: "Excited",
    score: 7,
    blurb: "Bright, buzzing, wide awake.",
    illo: `${CDN}/celebration_0jvk.svg`,
  },
];

export function moodByKey(key) {
  return MOODS.find((m) => m.key === key);
}

export function moodForEntry(entry) {
  return (
    MOODS.find((m) => m.key === entry.animations) ||
    MOODS.find((m) => m.label === entry.mood) ||
    null
  );
}

// Sad(1, rust) -> Excited(7, deep emerald), passing through gold.
export function scoreToColor(score) {
  const stops = [
    { s: 1, c: [166, 80, 60] },
    { s: 3, c: [176, 141, 87] },
    { s: 5, c: [128, 128, 90] },
    { s: 7, c: [47, 74, 61] },
  ];
  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (score >= stops[i].s && score <= stops[i + 1].s) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }
  const range = upper.s - lower.s || 1;
  const t = (score - lower.s) / range;
  const rgb = lower.c.map((v, i) => Math.round(v + (upper.c[i] - v) * t));
  return `rgb(${rgb.join(",")})`;
}

export function trailingAverage(entries) {
  const recent = entries.slice(0, 7);
  if (recent.length === 0) return null;
  const scores = recent.map((e) => moodForEntry(e)?.score).filter((s) => s != null);
  if (scores.length === 0) return null;
  let weightedSum = 0;
  let weightTotal = 0;
  scores.forEach((s, i) => {
    const weight = scores.length - i;
    weightedSum += s * weight;
    weightTotal += weight;
  });
  return weightedSum / weightTotal;
}