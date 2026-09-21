// src/data/surahMoodMap.js
//
// Curated mapping from Moodling's 7-mood scale to a suggested surah.
// Each mood also carries a small "surahOptions" list so the user isn't
// locked into a single suggestion — they can browse and pick another
// surah that fits how they're feeling.
//
// Ayah counts and transliterations are standard reference data; swap in
// your own copy/translation source if you already have one wired up.

export const MOODS = [
  "sad",
  "anxious",
  "tired",
  "focused",
  "calm",
  "happy",
  "excited",
];

// One illustration seed per mood — point these at your existing unDraw
// hotlink pattern (same CDN you're already using in MoodIllustration).
export const MOOD_ILLUSTRATIONS = {
  sad: "undraw_feeling_blue",
  anxious: "undraw_thoughts",
  tired: "undraw_relaxation",
  focused: "undraw_deep_focus",
  calm: "undraw_meditation",
  happy: "undraw_celebration",
  excited: "undraw_fireworks",
};

export const MOOD_COLORS = {
  sad: "#6E8CA0",
  anxious: "#B08968",
  tired: "#8A7C9A",
  focused: "#0B6E4F", // deep emerald
  calm: "#4C9A7B",
  happy: "#C9A227", // antique gold
  excited: "#D97E4A",
};

export const SURAH_MOOD_MAP = {
  sad: {
    primary: {
      number: 94,
      name: "Ash-Sharh",
      arabic: "الشرح",
      ayahCount: 8,
      theme: "Comfort after hardship — a reminder that ease follows every difficulty.",
    },
    options: [
      { number: 12, name: "Yusuf", arabic: "يوسف", ayahCount: 111, theme: "Patience through loss and separation." },
      { number: 93, name: "Ad-Duha", arabic: "الضحى", ayahCount: 11, theme: "Reassurance that you haven't been abandoned." },
    ],
  },
  anxious: {
    primary: {
      number: 13,
      name: "Ar-Ra'd",
      arabic: "الرعد",
      ayahCount: 43,
      theme: "Hearts find rest in remembrance — steadying in uncertainty.",
    },
    options: [
      { number: 3, name: "Ali 'Imran", arabic: "آل عمران", ayahCount: 200, theme: "Trust and steadfastness under pressure." },
      { number: 65, name: "At-Talaq", arabic: "الطلاق", ayahCount: 12, theme: "A way out appears for those who stay mindful." },
    ],
  },
  tired: {
    primary: {
      number: 73,
      name: "Al-Muzzammil",
      arabic: "المزّمّل",
      ayahCount: 20,
      theme: "Rest, night prayer, and pacing yourself with patience.",
    },
    options: [
      { number: 78, name: "An-Naba", arabic: "النبأ", ayahCount: 40, theme: "Sleep as a mercy and a rhythm to lean on." },
    ],
  },
  focused: {
    primary: {
      number: 18,
      name: "Al-Kahf",
      arabic: "الكهف",
      ayahCount: 110,
      theme: "Clarity, discernment, and staying the course.",
    },
    options: [
      { number: 96, name: "Al-'Alaq", arabic: "العلق", ayahCount: 19, theme: "Reading, learning, and disciplined effort." },
    ],
  },
  calm: {
    primary: {
      number: 55,
      name: "Ar-Rahman",
      arabic: "الرحمن",
      ayahCount: 78,
      theme: "A gentle, rhythmic reminder of everyday blessings.",
    },
    options: [
      { number: 67, name: "Al-Mulk", arabic: "الملك", ayahCount: 30, theme: "Quiet reflection on the order of things." },
    ],
  },
  happy: {
    primary: {
      number: 93,
      name: "Ad-Duha",
      arabic: "الضحى",
      ayahCount: 11,
      theme: "Gratitude for the morning light and what's been given.",
    },
    options: [
      { number: 108, name: "Al-Kawthar", arabic: "الكوثر", ayahCount: 3, theme: "Short and full of abundance." },
    ],
  },
  excited: {
    primary: {
      number: 1,
      name: "Al-Fatiha",
      arabic: "الفاتحة",
      ayahCount: 7,
      theme: "A grounding opener to carry good energy with intention.",
    },
    options: [
      { number: 110, name: "An-Nasr", arabic: "النصر", ayahCount: 3, theme: "Celebrating progress with gratitude." },
    ],
  },
};