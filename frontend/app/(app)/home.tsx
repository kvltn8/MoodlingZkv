import React, { useCallback, useMemo, useState } from "react";
import { Platform, Pressable, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useFocusEffect } from "expo-router";
import { Screen } from "../../components/Screen";
import { MoodGauge } from "../../components/MoodGauge";
import { MoodArt } from "../../components/MoodArt";
import { SurahPlayer } from "../../components/SurahPlayer";
import { TaskCard } from "../../components/TaskCard";
import { BootstrapIcon } from "../../components/BootstrapIcons";
import { colors, fonts, radius, shadow } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import { getMoods, getTasks, updateTask } from "../../lib/api";
import { greeting, todayISO } from "../../lib/dates";
import { useCountUp } from "../../lib/hooks";
import { averageScore, moodMeta, newestFirst, pickRecommendation, scoreLabel } from "../../lib/moodCatalog";
import type { Mood, Task } from "../../lib/types";

function StatTile({ value, label, colorsPair, icon, delay }: {
  value: number;
  label: string;
  colorsPair: [string, string];
  icon: string;
  delay: number;
}) {
  const shown = useCountUp(value, 1000);
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={styles.tileWrap}>
      <LinearGradient colors={colorsPair} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
        <View style={styles.tileIcon}>
          <BootstrapIcon name={icon} size={16} color={colors.plum} />
        </View>
        <Text style={styles.tileValue}>{Math.round(shown)}</Text>
        <Text style={styles.tileLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, m] = await Promise.all([getTasks(), getMoods()]);
      setTasks(t);
      setMoods(newestFirst(m));
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const firstName = user?.first_name || user?.username || "there";
  const latest = moods[0] || null;
  const latestMeta = moodMeta(latest?.animation);
  const recent = moods.slice(0, 7);
  const score = averageScore(recent);
  const rec = latest ? pickRecommendation(latest) : null;

  const today = todayISO();
  const doneToday = tasks.filter((t) => t.is_done && t.updated_at === today).length;
  const open = tasks.filter((t) => !t.is_done);
  const focus = useMemo(
    () => [...open].sort((a, b) => (a.end_date || a.End_date || "").localeCompare(b.end_date || b.End_date || "")).slice(0, 3),
    [tasks]
  );

  const gaugeWidth = Math.min(width - (Platform.OS === "web" ? 64 : 40) - 44, 340);

  async function toggle(task: Task) {
    const next = !task.is_done;
    setTasks((items) => items.map((x) => (x.id === task.id ? { ...x, is_done: next, updated_at: today } : x)));
    try {
      await updateTask(task.id, { is_done: next });
    } catch {
      setTasks((items) => items.map((x) => (x.id === task.id ? { ...x, is_done: !next } : x)));
    }
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}>
      <Animated.View entering={FadeInDown.duration(550)}>
        <Text style={styles.eyebrow}>{greeting().toUpperCase()}</Text>
        <Text style={styles.greeting}>Hello, {firstName}.</Text>
        <Text style={styles.sub}>Let's make today feel a little lighter.</Text>
      </Animated.View>

      {/* ── The scale ── */}
      <Animated.View entering={FadeInDown.delay(120).duration(600)}>
        <LinearGradient colors={[colors.plum, colors.plumSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>YOUR MOOD SCALE</Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{recent.length ? `last ${recent.length}` : "no check-ins"}</Text>
            </View>
          </View>

          <MoodGauge score={score} width={gaugeWidth} onDark />

          <Text style={styles.heroState}>
            {score === null ? "Check in to wake the dial" : scoreLabel(score)}
          </Text>

          <View style={styles.heroFoot}>
            <MoodArt mood={latest?.animation} size={64} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.footLabel}>{latest ? "LATEST MOOD" : "HOW ARE YOU?"}</Text>
              <Text style={styles.footName}>{latest ? latest.name : "Not yet today"}</Text>
            </View>
            <Link href="/(app)/add-mood" asChild>
              <Pressable style={styles.checkIn}>
                <Text style={styles.checkInText}>{latest ? "Update" : "Check in"}</Text>
                <BootstrapIcon name="arrow" size={15} color={colors.plum} />
              </Pressable>
            </Link>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Stat tiles ── */}
      <View style={styles.tiles}>
        <StatTile value={doneToday} label="done today" icon="check" colorsPair={["#E4EFDF", "#CFE0C8"]} delay={220} />
        <StatTile value={open.length} label="still open" icon="checklist" colorsPair={["#E9E1F5", "#D6C9EC"]} delay={290} />
        <StatTile value={moods.length} label="check-ins" icon="smile" colorsPair={["#FAE6D8", "#F1CDB6"]} delay={360} />
      </View>

      {/* ── Listen ── */}
      {latest && rec ? (
        <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.listen}>
          <Text style={styles.listenEyebrow}>FOR YOUR {latestMeta.name.toUpperCase()} MOMENT</Text>
          <SurahPlayer rec={rec} playKey={`home-${latest.id}`} />
        </Animated.View>
      ) : null}

      {/* ── Focus ── */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Today's focus</Text>
          <Text style={styles.sectionSub}>{focus.length ? `${open.length} thing${open.length === 1 ? "" : "s"} on your radar` : "A clean slate."}</Text>
        </View>
        <Link href="/(app)/tasks" asChild>
          <Pressable><Text style={styles.link}>See all</Text></Pressable>
        </Link>
      </View>

      {focus.length ? (
        focus.map((task, i) => <TaskCard key={task.id} index={i} task={task} onToggle={() => toggle(task)} />)
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing waiting for you.</Text>
          <Text style={styles.emptyText}>Add a small task and let Moodling keep it close.</Text>
          <Link href="/(app)/tasks" asChild>
            <Pressable style={styles.button}><Text style={styles.buttonText}>Add a task</Text></Pressable>
          </Link>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 2.4, color: colors.goldDeep },
  greeting: { marginTop: 4, fontFamily: fonts.display, fontSize: 44, lineHeight: 54, color: colors.plum },
  sub: { marginTop: 0, fontFamily: fonts.script, fontSize: 22, color: colors.lavenderDeep },

  hero: { marginTop: 22, borderRadius: 34, padding: 22, ...shadow.lift },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  heroLabel: { fontSize: 10.5, fontWeight: "800", letterSpacing: 2, color: "rgba(255,255,255,0.6)" },
  heroPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.12)" },
  heroPillText: { fontSize: 10.5, color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  heroState: { marginTop: 4, textAlign: "center", fontFamily: fonts.scriptBold, fontSize: 28, color: colors.gold },
  heroFoot: {
    marginTop: 16,
    padding: 10,
    paddingLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  footLabel: { fontSize: 9.5, fontWeight: "800", letterSpacing: 1.6, color: "rgba(255,255,255,0.5)" },
  footName: { marginTop: 2, fontFamily: fonts.display, fontSize: 24, color: colors.white },
  checkIn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.gold, paddingHorizontal: 15, paddingVertical: 11, borderRadius: radius.pill },
  checkInText: { fontWeight: "800", fontSize: 12.5, color: colors.plum },

  tiles: { flexDirection: "row", gap: 10, marginTop: 16 },
  tileWrap: { flex: 1 },
  tile: { borderRadius: 24, padding: 14, minHeight: 112, justifyContent: "space-between" },
  tileIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.65)", alignItems: "center", justifyContent: "center" },
  tileValue: { fontFamily: fonts.display, fontSize: 38, lineHeight: 44, color: colors.plum },
  tileLabel: { fontSize: 11.5, fontWeight: "600", color: "rgba(35,27,48,0.65)" },

  listen: { marginTop: 16, padding: 18, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, ...shadow.soft },
  listenEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.8, color: colors.goldDeep, marginBottom: 10 },

  sectionHeader: { marginTop: 30, marginBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  sectionTitle: { fontFamily: fonts.display, fontSize: 28, color: colors.plum },
  sectionSub: { marginTop: 2, color: colors.muted, fontSize: 12 },
  link: { color: colors.lavenderDeep, fontWeight: "700", fontSize: 13 },
  empty: { padding: 26, alignItems: "center", borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { fontFamily: fonts.scriptBold, fontSize: 26, color: colors.ink },
  emptyText: { marginTop: 4, textAlign: "center", maxWidth: 330, color: colors.muted, lineHeight: 20 },
  button: { marginTop: 16, backgroundColor: colors.plum, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.pill },
  buttonText: { color: colors.white, fontWeight: "700" }
});