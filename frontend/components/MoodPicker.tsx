import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { MoodArt } from "./MoodArt";
import { MOODS } from "../lib/moodCatalog";
import { safeHaptic } from "../lib/hooks";
import type { MoodAnimation } from "../lib/types";
import { colors, fonts, radius, shadow } from "../lib/theme";

const ITEM_W = 122;
const GAP = 12;

function PickerItem({
  mood,
  active,
  first,
  last,
  onPress
}: {
  mood: (typeof MOODS)[number];
  active: boolean;
  first: boolean;
  last: boolean;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: withSpring(active ? 1 : 0.62),
    transform: [{ scale: withSpring(active ? 1 : 0.92, { damping: 11, stiffness: 170 }) }, { translateY: withSpring(active ? -6 : 0) }]
  }));
  const dot = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(active ? 1.7 : 1, { damping: 8 }) }]
  }));

  return (
    <View style={{ width: ITEM_W }}>
      <Pressable onPress={onPress}>
        <Animated.View
          style={[
            styles.card,
            active && { borderColor: colors.gold, backgroundColor: mood.tint, ...shadow.lift },
            style
          ]}
        >
          <MoodArt mood={mood.id} size={92} halo={!active} />
          <Text style={styles.name}>{mood.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{mood.subtitle}</Text>
        </Animated.View>
      </Pressable>

      {/* dot on the scale line, so the moods sit "lined up" from heavy → radiant */}
      <View style={styles.scaleRow}>
        <View
          style={[
            styles.scaleLine,
            { left: first ? ITEM_W / 2 : -GAP / 2, right: last ? ITEM_W / 2 : -GAP / 2 }
          ]}
        />
        <Animated.View style={[styles.dot, { backgroundColor: mood.color }, active && styles.dotActive, dot]} />
      </View>
    </View>
  );
}

export function MoodPicker({
  selected,
  onSelect
}: {
  selected: MoodAnimation;
  onSelect: (value: MoodAnimation) => void;
}) {
  const ref = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const index = MOODS.findIndex((m) => m.id === selected);
    const x = index * (ITEM_W + GAP) - (width - ITEM_W) / 2;
    ref.current?.scrollTo({ x: Math.max(0, x), animated: true });
  }, [selected, width]);

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {MOODS.map((mood, i) => (
        <PickerItem
          key={mood.id}
          mood={mood}
          active={selected === mood.id}
          first={i === 0}
          last={i === MOODS.length - 1}
          onPress={() => {
            safeHaptic("select");
            onSelect(mood.id);
          }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { overflow: "visible" },
  row: { gap: GAP, paddingTop: 14, paddingBottom: 4, paddingHorizontal: 4 },
  card: {
    height: 178,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },
  name: { marginTop: 4, fontFamily: fonts.scriptBold, fontSize: 24, color: colors.ink, lineHeight: 28 },
  subtitle: { fontSize: 11, color: colors.muted, marginTop: 1 },
  scaleRow: { height: 30, justifyContent: "center", alignItems: "center", marginTop: 8 },
  scaleLine: { position: "absolute", height: 2, backgroundColor: colors.line },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.surface },
  dotActive: { borderColor: colors.gold }
});