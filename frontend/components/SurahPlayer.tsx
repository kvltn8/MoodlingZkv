import React, { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BootstrapIcon } from "./BootstrapIcons";
import { useAudio } from "../lib/audio";
import { colors, fonts } from "../lib/theme";
import { safeHaptic } from "../lib/hooks";
import type { SurahRecommendation } from "../lib/types";

function EqBar({ active, delay, max }: { active: boolean; delay: number; max: number }) {
  const h = useSharedValue(5);
  useEffect(() => {
    if (active) {
      h.value = withDelay(
        delay,
        withRepeat(
          withSequence(withTiming(max, { duration: 340 + delay }), withTiming(5, { duration: 340 + delay })),
          -1
        )
      );
    } else {
      h.value = withTiming(5, { duration: 250 });
    }
  }, [active]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[styles.eqBar, style]} />;
}

/** Recommended surah for a mood: names, the reason, and a play button with live equalizer + progress. */
export function SurahPlayer({
  rec,
  playKey,
  showReason = true
}: {
  rec: SurahRecommendation;
  playKey: string;
  showReason?: boolean;
}) {
  const audio = useAudio();
  const mine = audio.activeKey === playKey;
  const playing = mine && audio.playing;
  const loading = mine && audio.loading;
  const canPlay = Boolean(rec.audio_url);

  const press = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const progressStyle = useAnimatedStyle(() => ({
    width: `${mine ? audio.progress * 100 : 0}%`
  }));

  return (
    <View>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{rec.surah.name_transliteration}</Text>
          <Text style={styles.meta}>
            {rec.surah.name_english} · {rec.surah.verses_count} verses
          </Text>
        </View>
        <Text style={styles.arabic}>{rec.surah.name_arabic}</Text>
      </View>

      {showReason && rec.reason ? <Text style={styles.reason}>{rec.reason}</Text> : null}

      <View style={styles.playerRow}>
        <Pressable
          disabled={!canPlay}
          onPress={() => {
            safeHaptic("light");
            audio.toggle(playKey, rec.audio_url!);
          }}
          onPressIn={() => (press.value = withSpring(0.9))}
          onPressOut={() => (press.value = withSpring(1, { damping: 8 }))}
        >
          <Animated.View style={pressStyle}>
            <LinearGradient
              colors={canPlay ? ["#E6CB94", colors.gold] : ["#E5E0D8", "#E5E0D8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.plum} />
              ) : (
                <BootstrapIcon name={playing ? "pause" : "play"} size={22} color={colors.plum} />
              )}
            </LinearGradient>
          </Animated.View>
        </Pressable>

        <View style={styles.playerBody}>
          {canPlay ? (
            <>
              <View style={styles.eq}>
                {[14, 22, 16, 26, 12, 20, 15].map((max, i) => (
                  <EqBar key={i} active={playing} delay={i * 55} max={max} />
                ))}
                <Text style={styles.playLabel}>
                  {playing ? "Now playing" : loading ? "Loading…" : mine ? "Paused" : "Play surah"}
                </Text>
              </View>
              <View style={styles.track}>
                <Animated.View style={[styles.trackFill, progressStyle]} />
              </View>
              {rec.reciter ? <Text style={styles.reciter}>{rec.reciter}</Text> : null}
            </>
          ) : (
            <Text style={styles.reciter}>Audio isn't available for this surah yet.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center" },
  name: { fontFamily: fonts.scriptBold, fontSize: 26, color: colors.ink, lineHeight: 32 },
  meta: { marginTop: 1, fontSize: 12, color: colors.muted },
  arabic: { fontSize: 30, color: colors.goldDeep, marginLeft: 12 },
  reason: { marginTop: 10, fontSize: 13.5, lineHeight: 20, color: colors.muted },
  playerRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 14 },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }
  },
  playerBody: { flex: 1 },
  eq: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 28 },
  eqBar: { width: 4, borderRadius: 2, backgroundColor: colors.gold },
  playLabel: { marginLeft: 10, marginBottom: 1, fontSize: 12, fontWeight: "700", color: colors.ink },
  track: { marginTop: 8, height: 4, borderRadius: 2, backgroundColor: colors.line, overflow: "hidden" },
  trackFill: { height: 4, borderRadius: 2, backgroundColor: colors.gold },
  reciter: { marginTop: 6, fontSize: 11.5, color: colors.muted }
});