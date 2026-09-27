import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import MoodMascot from "./MoodMascot";
import { colors, fonts, moodPalette, radii, shadow } from "@/constants/theme";
import { MoodEntry } from "@/constants/api";

export default function MoodCard({
  entry,
  index = 0,
  onDelete,
}: {
  entry: MoodEntry;
  index?: number;
  onDelete?: (id: number) => void;
}) {
  const palette = moodPalette[entry.animations] ?? moodPalette.calm;
  const rec = entry.quran_recommendations?.[0];
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const onPlaybackStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) setIsPlaying(false);
  };

  const togglePlay = async () => {
    if (!rec?.audio_url) return;
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      return;
    }
    try {
      setIsLoadingAudio(true);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: rec.audio_url },
        { shouldPlay: true },
        onPlaybackStatus
      );
      setSound(newSound);
    } catch {
      // playback failure is non-fatal — the card still shows the recommendation
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const date = new Date(entry.created_at);
  const dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(420)}
      style={[styles.card, { borderColor: palette.base + "33" }]}
    >
      <View style={styles.topRow}>
        <MoodMascot mood={entry.animations} size={64} />
        <View style={styles.headerText}>
          <Text style={[styles.moodLabel, { color: palette.base }]}>{entry.mood || palette.label}</Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
        {onDelete && (
          <Pressable hitSlop={10} onPress={() => onDelete(entry.id)} style={styles.deleteBtn}>
            <Ionicons name="close" size={16} color={colors.inkFaint} />
          </Pressable>
        )}
      </View>

      {!!entry.description && <Text style={styles.description}>{entry.description}</Text>}

      {rec && (
        <View style={[styles.surahBox, { backgroundColor: palette.soft }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.surahEyebrow}>recommended for you</Text>
            <Text style={styles.surahName}>
              {rec.surah.name_transliteration || rec.surah.name_english}
            </Text>
            <Text style={styles.surahReason}>{rec.reason}</Text>
          </View>
          {rec.audio_url && (
            <Pressable
              onPress={togglePlay}
              style={[styles.playBtn, { backgroundColor: palette.base }]}
            >
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Ionicons name={isPlaying ? "pause" : "play"} size={18} color={colors.surface} />
              )}
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    ...shadow.card,
  },
  topRow: { flexDirection: "row", alignItems: "center" },
  headerText: { flex: 1, marginLeft: 12 },
  moodLabel: { fontFamily: fonts.display, fontSize: 22 },
  date: { color: colors.inkMuted, fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 6 },
  description: { color: colors.ink, fontSize: 14, lineHeight: 20, marginTop: 12 },
  surahBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.md,
    padding: 14,
    marginTop: 14,
  },
  surahEyebrow: {
    color: colors.emeraldSoft,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  surahName: { fontFamily: fonts.script, fontSize: 20, color: colors.emerald, marginTop: 2 },
  surahReason: { color: colors.ink, fontSize: 13, marginTop: 4, lineHeight: 18 },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});
