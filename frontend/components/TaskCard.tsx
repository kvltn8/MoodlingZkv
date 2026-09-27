import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import type { Task } from "../lib/types";
import { colors, radius, shadow } from "../lib/theme";
import { dueInfo } from "../lib/dates";
import { safeHaptic } from "../lib/hooks";
import { BootstrapIcon } from "./BootstrapIcons";
import { ConfettiBurst } from "./Confetti";

const TONES = {
  overdue: { bg: "#F4E1E1", fg: "#A25C5C" },
  today: { bg: "#F5EAD0", fg: colors.goldDeep },
  soon: { bg: "#E8E1F4", fg: colors.lavenderDeep },
  later: { bg: "#EFEBE3", fg: colors.muted },
  none: { bg: "#EFEBE3", fg: colors.muted }
} as const;

export function TaskCard({
  task,
  index = 0,
  onToggle,
  onDelete
}: {
  task: Task;
  index?: number;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  const done = Boolean(task.is_done);
  const due = dueInfo(task.end_date || task.End_date);
  const tone = TONES[due.tone];

  const check = useSharedValue(1);
  const press = useSharedValue(1);
  const [burst, setBurst] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    check.value = withSequence(withTiming(0.6, { duration: 90 }), withSpring(1, { damping: 4, stiffness: 220 }));
    if (done) setBurst((n) => n + 1);
  }, [done]);

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: check.value }] }));
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 55).duration(420)}
      layout={LinearTransition.springify().damping(18)}
      style={pressStyle}
    >
      <Pressable
        onPress={() => {
          safeHaptic(done ? "select" : "success");
          onToggle();
        }}
        onPressIn={() => (press.value = withSpring(0.98))}
        onPressOut={() => (press.value = withSpring(1, { damping: 9 }))}
        style={[styles.card, done && styles.cardDone]}
      >
        <View style={styles.checkWrap}>
          <Animated.View style={[styles.check, done && styles.checked, checkStyle]}>
            {done ? <BootstrapIcon name="check" size={18} color={colors.plum} /> : null}
          </Animated.View>
          <ConfettiBurst trigger={burst} />
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={[styles.chip, { backgroundColor: tone.bg }]}>
            <Text style={[styles.chipText, { color: tone.fg }]}>{done ? "Done ✓" : due.label}</Text>
          </View>
        </View>

        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={12} style={styles.delete}>
            <BootstrapIcon name="trash" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft
  },
  cardDone: { backgroundColor: "#F1F4EC", borderColor: "#DDE5D3" },
  checkWrap: { width: 34, height: 34, marginRight: 14, alignItems: "center", justifyContent: "center" },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center"
  },
  checked: { backgroundColor: colors.gold, borderColor: colors.gold },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: colors.ink },
  titleDone: { textDecorationLine: "line-through", color: colors.muted },
  chip: { alignSelf: "flex-start", marginTop: 7, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  chipText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  delete: { padding: 8, marginLeft: 8 }
});