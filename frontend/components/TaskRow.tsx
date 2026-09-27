import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInRight,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, fonts, radii, shadow } from "@/constants/theme";
import { TaskItem } from "@/constants/api";

export default function TaskRow({
  task,
  index = 0,
  onToggle,
  onDelete,
}: {
  task: TaskItem;
  index?: number;
  onToggle: (task: TaskItem) => void;
  onDelete: (id: number) => void;
}) {
  const pop = useSharedValue(1);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    pop.value = withSequence(withTiming(1.15, { duration: 110 }), withTiming(1, { duration: 140 }));
    onToggle(task);
  };

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(340)}
      layout={Layout.springify()}
      style={[styles.row, task.is_done && styles.rowDone]}
    >
      <Pressable onPress={handleToggle} hitSlop={8}>
        <Animated.View
          style={[styles.checkbox, task.is_done && styles.checkboxDone, checkStyle]}
        >
          {task.is_done && <Ionicons name="checkmark" size={16} color={colors.surface} />}
        </Animated.View>
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, task.is_done && styles.titleDone]}>{task.Task}</Text>
        {!!task.note && (
          <Text style={[styles.note, task.is_done && styles.titleDone]} numberOfLines={2}>
            {task.note}
          </Text>
        )}
      </View>

      <Pressable onPress={() => onDelete(task.id)} hitSlop={10} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={17} color={colors.inkFaint} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
    ...shadow.card,
  },
  rowDone: { backgroundColor: colors.surfaceMuted },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxDone: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  body: { flex: 1 },
  title: { fontSize: 15, color: colors.ink, fontWeight: "600" },
  titleDone: { color: colors.inkFaint, textDecorationLine: "line-through" },
  note: { fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  deleteBtn: { padding: 6, marginLeft: 6 },
});
