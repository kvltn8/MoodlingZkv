import React, { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Link, useFocusEffect } from "expo-router";
import { Screen } from "../../components/Screen";
import { MoodArt } from "../../components/MoodArt";
import { MoodCard } from "../../components/MoodCard";
import { BootstrapIcon } from "../../components/BootstrapIcons";
import { deleteMood, getMoods } from "../../lib/api";
import { colors, fonts, radius, shadow } from "../../lib/theme";
import { moodMeta, newestFirst } from "../../lib/moodCatalog";
import { confirmAction } from "../../lib/confirm";
import type { Mood } from "../../lib/types";

export default function Moods() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setMoods(newestFirst(await getMoods())); } catch {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  function remove(mood: Mood) {
    confirmAction("Remove this check-in?", `${mood.name} will be deleted.`, "Delete", async () => {
      setMoods((x) => x.filter((m) => m.id !== mood.id));
      try { await deleteMood(mood.id); } catch { load(); }
    });
  }

  // most-felt mood, for the little summary strip
  const top = useMemo(() => {
    if (!moods.length) return null;
    const counts = new Map<string, number>();
    moods.forEach((m) => counts.set(moodMeta(m.animation).id, (counts.get(moodMeta(m.animation).id) || 0) + 1));
    const [id] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return moodMeta(id);
  }, [moods]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>CHECK IN</Text>
          <Text style={styles.title}>Your moods</Text>
          <Text style={styles.sub}>Notice it. Name it. Let it move through.</Text>
        </View>
        <Link href="/(app)/add-mood" asChild>
          <Pressable style={styles.add}>
            <BootstrapIcon name="plus" size={26} color={colors.gold} />
          </Pressable>
        </Link>
      </View>

      {top ? (
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.strip, { backgroundColor: top.tint }]}>
          <MoodArt mood={top.id} size={54} halo={false} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.stripLabel}>YOU FEEL {top.name.toUpperCase()} MOST OFTEN</Text>
            <Text style={styles.stripText}>{moods.length} check-in{moods.length === 1 ? "" : "s"} logged</Text>
          </View>
        </Animated.View>
      ) : null}

      {moods.length ? (
        moods.map((mood, i) => <MoodCard key={mood.id} mood={mood} index={i} onDelete={() => remove(mood)} />)
      ) : (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.empty}>
          <MoodArt mood="calm" size={170} />
          <Text style={styles.emptyTitle}>Nothing recorded yet.</Text>
          <Text style={styles.emptyText}>Your first check-in can be one word. That's enough.</Text>
          <Link href="/(app)/add-mood" asChild>
            <Pressable style={styles.button}><Text style={styles.buttonText}>Check in</Text></Pressable>
          </Link>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  eyebrow: { fontSize: 10.5, letterSpacing: 2.2, fontWeight: "800", color: colors.goldDeep },
  title: { marginTop: 2, fontFamily: fonts.display, fontSize: 46, lineHeight: 56, color: colors.plum },
  sub: { fontFamily: fonts.script, fontSize: 21, color: colors.lavenderDeep },
  add: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.plum, alignItems: "center", justifyContent: "center", ...shadow.lift },
  strip: { flexDirection: "row", alignItems: "center", padding: 10, paddingRight: 16, borderRadius: radius.lg, marginBottom: 18 },
  stripLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, color: colors.ink },
  stripText: { marginTop: 3, fontFamily: fonts.scriptBold, fontSize: 20, color: colors.plum },
  empty: { alignItems: "center", padding: 28, marginTop: 10 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 30, color: colors.plum, marginTop: 4 },
  emptyText: { marginTop: 6, textAlign: "center", color: colors.muted, maxWidth: 340, lineHeight: 20 },
  button: { marginTop: 18, backgroundColor: colors.plum, paddingHorizontal: 22, paddingVertical: 13, borderRadius: radius.pill },
  buttonText: { color: colors.white, fontWeight: "700" }
});