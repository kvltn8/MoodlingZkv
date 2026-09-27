import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { Screen } from "../../components/Screen";
import { TaskCard } from "../../components/TaskCard";
import { ProgressRing } from "../../components/ProgressRing";
import { LottieEmoji } from "../../components/LottieEmoji";
import { BootstrapIcon } from "../../components/BootstrapIcons";
import { colors, fonts, radius, shadow } from "../../lib/theme";
import { createTask, deleteTask, getTasks, updateTask } from "../../lib/api";
import { addDaysISO, todayISO } from "../../lib/dates";
import { confirmAction } from "../../lib/confirm";
import { safeHaptic } from "../../lib/hooks";
import { notoLottie } from "../../lib/moodCatalog";
import type { Task } from "../../lib/types";

type Filter = "all" | "today" | "later" | "done";
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "later", label: "Later" },
  { id: "done", label: "Done" }
];

const DATE_CHIPS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next week", days: 7 }
];

const dateOf = (t: Task) => t.end_date || t.End_date || "";

function cheer(done: number, total: number) {
  if (!total) return "A blank page, full of potential.";
  if (done === 0) return "Pick one small thing. Start there.";
  if (done === total) return "All done. Breathe out.";
  if (done / total >= 0.5) return "Look at you go!";
  return "Small steps still count.";
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(0);
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setTasks(await getTasks()); } catch (e) { Alert.alert("Couldn't load tasks", e instanceof Error ? e.message : "Try again."); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  async function toggle(task: Task) {
    const is_done = !task.is_done;
    setTasks((x) => x.map((t) => (t.id === task.id ? { ...t, is_done } : t)));
    try { await updateTask(task.id, { is_done }); } catch { load(); }
  }

  function remove(task: Task) {
    confirmAction("Delete task?", task.title, "Delete", async () => {
      setTasks((x) => x.filter((t) => t.id !== task.id));
      try { await deleteTask(task.id); } catch { load(); }
    });
  }

  async function add() {
    const text = title.trim();
    if (!text || adding) return;
    setAdding(true);
    try {
      const created = await createTask({ title: text, end_date: addDaysISO(days) });
      setTasks((x) => [created, ...x]);
      setTitle("");
      safeHaptic("success");
    } catch (e) {
      Alert.alert("Couldn't create task", e instanceof Error ? e.message : "Try again.");
    } finally { setAdding(false); }
  }

  const today = todayISO();
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.is_done).length;

  const counts: Record<Filter, number> = {
    all: total,
    today: tasks.filter((t) => !t.is_done && dateOf(t) <= today).length,
    later: tasks.filter((t) => !t.is_done && dateOf(t) > today).length,
    done: doneCount
  };

  const visible = useMemo(() => {
    const list = tasks.filter((t) => {
      if (filter === "today") return !t.is_done && dateOf(t) <= today;
      if (filter === "later") return !t.is_done && dateOf(t) > today;
      if (filter === "done") return t.is_done;
      return true;
    });
    return list.sort((a, b) => {
      if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
      return dateOf(a).localeCompare(dateOf(b));
    });
  }, [tasks, filter, today]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR SPACE</Text>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.sub}>Small steps still count.</Text>
      </View>

      {/* progress */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <LinearGradient colors={[colors.plum, colors.plumSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.progressCard}>
          <ProgressRing progress={total ? doneCount / total : 0} size={96}>
            <Text style={styles.pct}>{total ? Math.round((doneCount / total) * 100) : 0}%</Text>
          </ProgressRing>
          <View style={{ flex: 1, marginLeft: 18 }}>
            <Text style={styles.progressLabel}>{doneCount} OF {total} DONE</Text>
            <Text style={styles.cheer}>{cheer(doneCount, total)}</Text>
          </View>
          {total > 0 && doneCount === total ? <LottieEmoji url={notoLottie("1f389")} size={64} loop={false} /> : null}
        </LinearGradient>
      </Animated.View>

      {/* quick add */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.addCard}>
        <View style={styles.inputRow}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={add}
            maxLength={50}
            returnKeyType="done"
            placeholder="What's next?"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable onPress={add} disabled={!title.trim() || adding} style={[styles.addBtn, !title.trim() && { opacity: 0.4 }]}>
            {adding ? <ActivityIndicator color={colors.plum} /> : <BootstrapIcon name="plus" size={24} color={colors.plum} />}
          </Pressable>
        </View>
        <View style={styles.chips}>
          {DATE_CHIPS.map((c) => (
            <Pressable
              key={c.label}
              onPress={() => { safeHaptic("select"); setDays(c.days); }}
              style={[styles.chip, days === c.days && styles.chipActive]}
            >
              <Text style={[styles.chipText, days === c.days && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* filters */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => { safeHaptic("select"); setFilter(f.id); }}
            style={[styles.filter, filter === f.id && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
              {f.label}{counts[f.id] ? `  ${counts[f.id]}` : ""}
            </Text>
          </Pressable>
        ))}
      </View>

      {visible.length ? (
        visible.map((task, i) => (
          <TaskCard key={task.id} index={i} task={task} onToggle={() => toggle(task)} onDelete={() => remove(task)} />
        ))
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={styles.empty}>
          <LottieEmoji
            url={notoLottie(filter === "done" ? "1f4aa" : "2728")}
            size={110}
            fallback={<Text style={styles.emptyGlyph}>✦</Text>}
          />
          <Text style={styles.emptyTitle}>{filter === "done" ? "Nothing finished yet." : "A quiet list."}</Text>
          <Text style={styles.emptyText}>
            {filter === "done" ? "Tick something off and watch it land here." : "Add your first task above and keep the day moving gently."}
          </Text>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  eyebrow: { fontSize: 10.5, letterSpacing: 2.2, fontWeight: "800", color: colors.goldDeep },
  title: { marginTop: 2, fontFamily: fonts.display, fontSize: 46, lineHeight: 56, color: colors.plum },
  sub: { fontFamily: fonts.script, fontSize: 21, color: colors.lavenderDeep },

  progressCard: { flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 30, ...shadow.lift },
  pct: { fontFamily: fonts.display, fontSize: 26, color: colors.white },
  progressLabel: { fontSize: 10.5, fontWeight: "800", letterSpacing: 1.8, color: "rgba(255,255,255,0.6)" },
  cheer: { marginTop: 4, fontFamily: fonts.scriptBold, fontSize: 25, lineHeight: 30, color: colors.gold },

  addCard: { marginTop: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, ...shadow.soft },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: { flex: 1, height: 52, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.background, color: colors.ink, fontSize: 15 },
  addBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.plum },
  chipText: { fontSize: 12, fontWeight: "700", color: colors.muted },
  chipTextActive: { color: colors.gold },

  filters: { flexDirection: "row", gap: 8, marginTop: 20, marginBottom: 16, flexWrap: "wrap" },
  filter: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  filterActive: { backgroundColor: colors.plum, borderColor: colors.plum },
  filterText: { fontSize: 12.5, fontWeight: "700", color: colors.muted },
  filterTextActive: { color: colors.white },

  empty: { marginTop: 10, alignItems: "center", padding: 26 },
  emptyGlyph: { fontSize: 44, color: colors.gold },
  emptyTitle: { marginTop: 6, fontFamily: fonts.display, fontSize: 28, color: colors.plum },
  emptyText: { marginTop: 6, textAlign: "center", color: colors.muted, maxWidth: 320, lineHeight: 20 }
});