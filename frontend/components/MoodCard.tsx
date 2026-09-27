import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { moodMeta, pickRecommendation } from "../lib/moodCatalog";
import { colors, fonts, radius, shadow } from "../lib/theme";
import type { Mood } from "../lib/types";
import { BootstrapIcon } from "./BootstrapIcons";
import { MoodArt } from "./MoodArt";
import { SurahPlayer } from "./SurahPlayer";

/** A logged mood: live character, your note, the recommended surah, why, and a play button. */
export function MoodCard({
  mood,
  index = 0,
  onDelete
}: {
  mood: Mood;
  index?: number;
  onDelete?: () => void;
}) {
  const meta = moodMeta(mood.animation);
  const rec = pickRecommendation(mood);
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 90).duration(520).springify().damping(16)}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.985))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 9 }))}
      >
        <Animated.View style={[styles.card, style]}>
          <LinearGradient
            colors={[meta.tint, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <MoodArt mood={mood.animation} size={112} />
            <View style={styles.headerCopy}>
              <View style={styles.chipRow}>
                <View style={[styles.chip, { backgroundColor: meta.color + "55" }]}>
                  <Text style={styles.chipText}>SCALE {meta.score}</Text>
                </View>
              </View>
              <Text style={styles.name}>{mood.name}</Text>
              {mood.note ? (
                <Text style={styles.note} numberOfLines={3}>
                  “{mood.note}”
                </Text>
              ) : (
                <Text style={styles.note}>{meta.subtitle}</Text>
              )}
            </View>
            {onDelete ? (
              <Pressable onPress={onDelete} hitSlop={12} style={styles.trash}>
                <BootstrapIcon name="trash" size={17} color={colors.muted} />
              </Pressable>
            ) : null}
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.eyebrow}>RECOMMENDED FOR THIS MOOD</Text>
            {rec ? (
              <SurahPlayer rec={rec} playKey={`mood-${mood.id}`} />
            ) : (
              <Text style={styles.empty}>
                No surah is linked to this mood yet. Add one from the Django admin (Mood surah recommendations).
              </Text>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    ...shadow.soft
  },
  header: { flexDirection: "row", alignItems: "center", padding: 16, paddingRight: 44 },
  headerCopy: { flex: 1, marginLeft: 6 },
  chipRow: { flexDirection: "row" },
  chip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  chipText: { fontSize: 9.5, fontWeight: "800", letterSpacing: 1.4, color: colors.ink },
  name: { marginTop: 6, fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.plum },
  note: { marginTop: 4, fontSize: 13, lineHeight: 19, color: colors.muted, fontStyle: "italic" },
  trash: { position: "absolute", top: 14, right: 14, padding: 4 },
  body: { padding: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.8, color: colors.goldDeep, marginBottom: 10 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19 }
});