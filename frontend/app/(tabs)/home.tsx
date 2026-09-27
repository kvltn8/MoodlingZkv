import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import ScreenBackground from "@/components/ScreenBackground";
import MoodScale, { MOOD_WEIGHT } from "@/components/MoodScale";
import MoodMascot from "@/components/MoodMascot";
import { useAuth } from "@/context/AuthContext";
import { useMoods } from "@/hooks/useMoods";
import { useTasks } from "@/hooks/useTasks";
import { colors, fonts, moodPalette, radii, shadow, MoodKey } from "@/constants/theme";

export default function Home() {
  const { user } = useAuth();
  const { moods, isLoading: moodsLoading, refetch: refetchMoods } = useMoods();
  const { tasks, isLoading: tasksLoading, refetch: refetchTasks, toggleTask } = useTasks();

  const recent = moods.slice(0, 7);
  const avgWeight = useMemo(() => {
    if (recent.length === 0) return 0.5;
    const sum = recent.reduce((acc, m) => acc + (MOOD_WEIGHT[m.animations] ?? 0.5), 0);
    return sum / recent.length;
  }, [recent]);

  const dominantMood: MoodKey = useMemo(() => {
    if (recent.length === 0) return "calm";
    const counts: Record<string, number> = {};
    recent.forEach((m) => (counts[m.animations] = (counts[m.animations] ?? 0) + 1));
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodKey) ?? "calm";
  }, [recent]);

  const todaysTasks = tasks.filter((t) => !t.is_done).slice(0, 4);
  const doneCount = tasks.filter((t) => t.is_done).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={moodsLoading || tasksLoading}
            onRefresh={() => {
              refetchMoods();
              refetchTasks();
            }}
            tintColor={colors.emerald}
          />
        }
      >
        <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}{user ? "," : ""}</Text>
            {user && <Text style={styles.name}>{user.username}</Text>}
          </View>
          <MoodMascot mood={dominantMood} size={54} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.gaugeCard}>
          <MoodScale value={avgWeight} label={moodPalette[dominantMood].label} />
          <Pressable style={styles.logMoodBtn} onPress={() => router.push("/mood/new")}>
            <Ionicons name="add" size={18} color={colors.surface} />
            <Text style={styles.logMoodText}>Log how you feel</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(180).duration(500)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{moods.length}</Text>
            <Text style={styles.statLabel}>moods logged</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{doneCount}</Text>
            <Text style={styles.statLabel}>tasks completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{tasks.length - doneCount}</Text>
            <Text style={styles.statLabel}>tasks open</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(240).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's tasks</Text>
            <Pressable onPress={() => router.push("/(tabs)/tasks")}>
              <Text style={styles.sectionLink}>see all</Text>
            </Pressable>
          </View>

          {todaysTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nothing pending — enjoy the calm ✦</Text>
            </View>
          ) : (
            todaysTasks.map((t) => (
              <Pressable key={t.id} style={styles.taskRow} onPress={() => toggleTask(t)}>
                <View style={styles.taskDot} />
                <Text style={styles.taskText}>{t.Task}</Text>
              </Pressable>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, paddingTop: 62, paddingBottom: 140 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  greeting: { fontSize: 14, color: colors.inkMuted },
  name: { fontFamily: fonts.display, fontSize: 28, color: colors.emerald, marginTop: 2 },
  gaugeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: 26,
    alignItems: "center",
    ...shadow.card,
  },
  logMoodBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.emerald,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 8,
  },
  logMoodText: { color: colors.surface, fontWeight: "600", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
    ...shadow.card,
  },
  statNumber: { fontFamily: fonts.display, fontSize: 24, color: colors.emerald },
  statLabel: { fontSize: 11, color: colors.inkMuted, marginTop: 2, textAlign: "center" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.emerald },
  sectionLink: { fontSize: 13, color: colors.gold, fontWeight: "600" },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 8,
    ...shadow.card,
  },
  taskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold, marginRight: 10 },
  taskText: { color: colors.ink, fontSize: 14 },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 18,
    alignItems: "center",
    ...shadow.card,
  },
  emptyText: { color: colors.inkMuted, fontSize: 13 },
});
