import React, { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Screen } from "../../components/Screen";
import { MoodArt } from "../../components/MoodArt";
import { MoodGauge } from "../../components/MoodGauge";
import { MoodPicker } from "../../components/MoodPicker";
import { createMood } from "../../lib/api";
import { colors, fonts, radius, shadow } from "../../lib/theme";
import { moodMeta, scoreLabel } from "../../lib/moodCatalog";
import { safeHaptic } from "../../lib/hooks";
import type { MoodAnimation } from "../../lib/types";

export default function AddMood() {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<MoodAnimation>("calm");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const meta = moodMeta(selected);
  const gaugeWidth = Math.min(width - (Platform.OS === "web" ? 64 : 40), 320);

  async function submit() {
    setBusy(true);
    try {
      await createMood({ name: meta.name, note: note.trim(), animation: selected });
      safeHaptic("success");
      router.replace("/(app)/moods");
    } catch (e) {
      Alert.alert("Couldn't save your mood", e instanceof Error ? e.message : "Try again.");
    } finally { setBusy(false); }
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>

      <Animated.View entering={FadeInDown.duration(500)} style={styles.center}>
        <Text style={styles.eyebrow}>CHECK IN</Text>
        <Text style={styles.title}>How are you feeling?</Text>
      </Animated.View>

      {/* the scale swings as you choose */}
      <MoodGauge score={meta.score} width={gaugeWidth}>
        <MoodArt mood={selected} size={92} halo={false} />
      </MoodGauge>

      <Animated.View key={selected} entering={FadeIn.duration(350)} style={styles.readout}>
        <Text style={styles.selected}>{meta.name}</Text>
        <Text style={styles.selectedSub}>{meta.subtitle} · {scoreLabel(meta.score)}</Text>
      </Animated.View>

      <MoodPicker selected={selected} onSelect={setSelected} />

      <View style={styles.noteBox}>
        <Text style={styles.label}>ANYTHING ON YOUR MIND?</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Write a little, or leave it blank..."
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          style={styles.note}
        />
      </View>

      <Pressable onPress={submit} disabled={busy}>
        <LinearGradient colors={[colors.plum, colors.plumSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
          <Text style={styles.buttonText}>{busy ? "Saving..." : "Save mood  →"}</Text>
        </LinearGradient>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.muted, fontWeight: "600", marginBottom: 18 },
  center: { alignItems: "center", marginBottom: 6 },
  eyebrow: { fontSize: 10.5, letterSpacing: 2.2, fontWeight: "800", color: colors.goldDeep },
  title: { marginTop: 4, fontFamily: fonts.display, fontSize: 38, lineHeight: 46, color: colors.plum, textAlign: "center" },
  readout: { alignItems: "center", marginTop: 4, marginBottom: 6 },
  selected: { fontFamily: fonts.display, fontSize: 36, lineHeight: 44, color: colors.plum },
  selectedSub: { fontFamily: fonts.script, fontSize: 21, color: colors.lavenderDeep },
  noteBox: { marginTop: 22 },
  label: { fontSize: 10, letterSpacing: 1.8, fontWeight: "800", color: colors.muted, marginBottom: 9 },
  note: { minHeight: 120, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 18, color: colors.ink, fontSize: 15, lineHeight: 22 },
  button: { marginTop: 16, minHeight: 58, borderRadius: radius.md, alignItems: "center", justifyContent: "center", ...shadow.lift },
  buttonText: { color: colors.gold, fontWeight: "800", fontSize: 15, letterSpacing: 0.4 }
});