import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BootstrapIcon } from "../../components/BootstrapIcons";
import { MoodArt } from "../../components/MoodArt";
import { Screen } from "../../components/Screen";
import { getMoods, getTasks } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { confirmAction } from "../../lib/confirm";
import { useCountUp } from "../../lib/hooks";
import { MOODS, moodMeta, newestFirst } from "../../lib/moodCatalog";
import { colors, fonts, radius, shadow } from "../../lib/theme";
import type { Mood, Task } from "../../lib/types";

function Stat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const shown = useCountUp(value, 1000);
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{Math.round(shown)}{suffix}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
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

  async function logout() {
    await signOut();
    router.replace("/(auth)/login");
  }

  const name = user?.first_name || user?.username || "you";
  const done = tasks.filter((t) => t.is_done).length;
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const latest = moods[0];

  const mix = useMemo(() => {
    const counts = MOODS.map((m) => ({ meta: m, count: moods.filter((x) => moodMeta(x.animation).id === m.id).length }));
    return counts.filter((c) => c.count > 0);
  }, [moods]);
  const top = [...mix].sort((a, b) => b.count - a.count)[0];

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}>
      <Text style={styles.eyebrow}>YOUR SPACE</Text>
      <Text style={styles.title}>Profile</Text>

      <Animated.View entering={FadeInDown.duration(550)} style={styles.profile}>
        <LinearGradient colors={[colors.gold, colors.lavender, colors.rose]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ring}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        </LinearGradient>
        {latest ? (
          <View style={styles.badge}>
            <MoodArt mood={latest.animation} size={54} />
          </View>
        ) : null}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(550)} style={styles.stats}>
        <Stat value={moods.length} label="check-ins" />
        <View style={styles.divider} />
        <Stat value={done} label="tasks done" />
        <View style={styles.divider} />
        <Stat value={rate} suffix="%" label="completion" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).duration(550)} style={styles.card}>
        <Text style={styles.cardEyebrow}>YOUR MOOD MIX</Text>
        {mix.length ? (
          <>
            <View style={styles.mixBar}>
              {mix.map((m) => (
                <View key={m.meta.id} style={{ flex: m.count, backgroundColor: m.meta.color }} />
              ))}
            </View>
            <View style={styles.legend}>
              {mix.map((m) => (
                <View key={m.meta.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: m.meta.color }]} />
                  <Text style={styles.legendText}>{m.meta.name} · {m.count}</Text>
                </View>
              ))}
            </View>
            {top ? (
              <View style={styles.topRow}>
                <MoodArt mood={top.meta.id} size={64} />
                <Text style={styles.topText}>Mostly {top.meta.name.toLowerCase()} lately.</Text>
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.cardText}>Log a mood and your colours will show up here.</Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).duration(550)} style={styles.card}>
        <Text style={styles.cardTitle}>Moodling</Text>
        <Text style={styles.cardText}>A calm little system for keeping tasks and feelings in the same room.</Text>
        <Text style={styles.credit}>Animated emoji: Google Noto Emoji Animated, licensed CC BY 4.0.</Text>
      </Animated.View>

      <Pressable
        style={styles.logout}
        onPress={() => confirmAction("Sign out?", "You can always come back.", "Sign out", logout)}
      >
        <BootstrapIcon name="logout" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 10.5, letterSpacing: 2.2, fontWeight: "800", color: colors.goldDeep },
  title: { marginTop: 2, fontFamily: fonts.display, fontSize: 46, lineHeight: 56, color: colors.plum },
  profile: { alignItems: "center", marginTop: 14, marginBottom: 6 },
  ring: { width: 122, height: 122, borderRadius: 61, alignItems: "center", justifyContent: "center", ...shadow.lift },
  avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.plum, alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: fonts.display, fontSize: 56, color: colors.gold, lineHeight: 68 },
  badge: { position: "absolute", top: 68, left: "50%", marginLeft: 22 },
  name: { marginTop: 14, fontFamily: fonts.scriptBold, fontSize: 34, color: colors.ink, lineHeight: 40 },
  email: { color: colors.muted },

  stats: { flexDirection: "row", alignItems: "center", marginTop: 20, paddingVertical: 20, borderRadius: radius.lg, backgroundColor: colors.plum, ...shadow.lift },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.gold },
  statLabel: { marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  divider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.14)" },

  card: { marginTop: 14, padding: 20, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, ...shadow.soft },
  cardEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.8, color: colors.goldDeep, marginBottom: 14 },
  cardTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.plum },
  cardText: { marginTop: 6, color: colors.muted, lineHeight: 21 },
  credit: { marginTop: 12, fontSize: 11, color: colors.muted },
  mixBar: { height: 14, borderRadius: 7, overflow: "hidden", flexDirection: "row", gap: 2 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.ink, fontWeight: "600" },
  topRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  topText: { fontFamily: fonts.scriptBold, fontSize: 24, color: colors.plum },

  logout: { marginTop: 18, height: 54, borderRadius: radius.md, backgroundColor: "#F3E7E7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoutText: { fontWeight: "700", color: colors.danger }
});