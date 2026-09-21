// app/(tabs)/home.js
//
// New Home tab. Assumes it sits alongside your existing Mood and Tasks
// tabs (see the _layout.js note below). Wire the two `TODO` imports up to
// your real theme tokens and illustration component — everything else
// runs as-is against React Native + Expo.
//
// TODO: replace with your real theme import, e.g. `import { colors, fonts } from "../../src/theme"`
// TODO: replace `renderIllustration` below with your existing <MoodIllustration mood={mood} /> (SvgUri-based)

import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import MoodCard from "../../src/components/MoodCard";
import SurahCard from "../../src/components/SurahCard";
import { MOODS, MOOD_COLORS, SURAH_MOOD_MAP } from "../../src/data/surahMoodMap";

const IVORY = "#FBF8F2";
const EMERALD = "#0B6E4F";

function getGreeting(hour) {
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down?";
}

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);

  // Live clock, ticks once a minute — plenty for a home-screen readout.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const timeString = useMemo(
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [now]
  );
  const dateString = useMemo(
    () => now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }),
    [now]
  );
  const greeting = useMemo(() => getGreeting(now.getHours()), [now]);

  const moodEntry = selectedMood ? SURAH_MOOD_MAP[selectedMood] : null;
  const surahOptions = moodEntry ? [moodEntry.primary, ...moodEntry.options] : [];
  const accentColor = selectedMood ? MOOD_COLORS[selectedMood] : EMERALD;

  const handleSelectMood = (mood) => {
    setSelectedMood((prev) => (prev === mood ? null : mood));
    setSelectedSurah(null);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Top bar with home button */}
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>Moodling</Text>
        <View style={styles.homeButton}>
          <Text style={styles.homeButtonIcon}>⌂</Text>
        </View>
      </View>

      {/* Time + greeting */}
      <View style={styles.timeBlock}>
        <Text style={styles.time}>{timeString}</Text>
        <Text style={styles.date}>{dateString}</Text>
        <Text style={styles.greeting}>{greeting}, how are you feeling?</Text>
      </View>

      {/* Mood strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodStrip}>
        {MOODS.map((mood) => (
          <MoodCard
            key={mood}
            mood={mood}
            label={mood}
            selected={selectedMood === mood}
            onPress={handleSelectMood}
            // TODO: swap for your real illustration component, e.g.:
            // renderIllustration={(m) => <MoodIllustration mood={m} width={40} height={40} />}
          />
        ))}
      </ScrollView>

      {/* Mood-matched surah suggestions */}
      <View style={styles.surahSection}>
        <Text style={styles.sectionTitle}>
          {selectedMood ? `Surahs for feeling ${selectedMood}` : "Pick a mood to get a surah"}
        </Text>
        {!selectedMood && (
          <Text style={styles.sectionSubtitle}>
            Tap a mood above and we'll suggest a surah that fits — tap a card to open it and select.
          </Text>
        )}
        {surahOptions.map((surah) => (
          <SurahCard
            key={surah.number}
            surah={surah}
            accentColor={accentColor}
            selected={selectedSurah?.number === surah.number}
            onSelect={setSelectedSurah}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: IVORY,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  wordmark: {
    fontFamily: "LobsterTwo-Regular",
    fontSize: 26,
    color: EMERALD,
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EMERALD,
    alignItems: "center",
    justifyContent: "center",
  },
  homeButtonIcon: {
    color: IVORY,
    fontSize: 18,
  },
  timeBlock: {
    marginBottom: 22,
  },
  time: {
    fontFamily: "Outfit-Bold",
    fontSize: 40,
    color: "#2B2B2B",
  },
  date: {
    fontFamily: "Outfit-Regular",
    fontSize: 13,
    color: "#9A9284",
    marginTop: 2,
  },
  greeting: {
    fontFamily: "DancingScript-Regular",
    fontSize: 22,
    color: EMERALD,
    marginTop: 10,
  },
  moodStrip: {
    paddingVertical: 8,
    paddingRight: 12,
    gap: 12,
  },
  surahSection: {
    marginTop: 26,
  },
  sectionTitle: {
    fontFamily: "Outfit-Bold",
    fontSize: 17,
    color: "#2B2B2B",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  sectionSubtitle: {
    fontFamily: "Outfit-Regular",
    fontSize: 13,
    color: "#9A9284",
    marginBottom: 14,
  },
});