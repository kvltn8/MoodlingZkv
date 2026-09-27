import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import ScreenBackground from "@/components/ScreenBackground";
import MoodMascot from "@/components/MoodMascot";
import Button from "@/components/Button";
import { useMoods } from "@/hooks/useMoods";
import { colors, fonts, moodPalette, radii, shadow, MoodKey } from "@/constants/theme";
import { MoodAnimation } from "@/constants/api";

const MOOD_ORDER: MoodKey[] = ["happy", "excited", "calm", "focused", "tired", "sad", "anxious"];

function MoodChip({
  mood,
  selected,
  onPress,
}: {
  mood: MoodKey;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(1.08, { damping: 6 }, () => {
          scale.value = withSpring(1);
        });
        onPress();
      }}
    >
      <Animated.View
        style={[
          styles.chip,
          { backgroundColor: selected ? moodPalette[mood].base : colors.surface },
          style,
        ]}
      >
        <MoodMascot mood={mood} size={46} />
        <Text style={[styles.chipLabel, { color: selected ? colors.surface : colors.ink }]}>
          {moodPalette[mood].label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function NewMood() {
  const { addMood } = useMoods();
  const [selected, setSelected] = useState<MoodKey>("calm");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addMood({
        mood: moodPalette[selected].label,
        description: note.trim(),
        animations: selected as MoodAnimation,
      });
      router.back();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.handle} />
          <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="close" size={20} color={colors.inkMuted} />
          </Pressable>

          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.title}>How do you feel?</Text>
            <Text style={styles.subtitle}>choose the one that fits closest</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.chipGrid}>
            {MOOD_ORDER.map((mood) => (
              <MoodChip
                key={mood}
                mood={mood}
                selected={selected === mood}
                onPress={() => setSelected(mood)}
              />
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.noteBox}>
            <Text style={styles.noteLabel}>What's on your mind? (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Write a line or two…"
              placeholderTextColor={colors.inkFaint}
              style={styles.noteInput}
            />
          </Animated.View>

          <Button title="Save mood" onPress={handleSubmit} loading={submitting} variant="gold" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, paddingTop: 18, paddingBottom: 60 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 6,
  },
  closeBtn: { position: "absolute", top: 16, right: 20, padding: 6, zIndex: 2 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.emerald, marginTop: 14 },
  subtitle: { fontFamily: fonts.scriptRegular, fontSize: 16, color: colors.inkMuted, marginTop: 2, marginBottom: 20 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  chip: {
    width: "31%",
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 4,
    ...shadow.card,
  },
  chipLabel: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  noteBox: { marginTop: 22, marginBottom: 24 },
  noteLabel: { fontSize: 12, color: colors.inkMuted, marginBottom: 8 },
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    minHeight: 96,
    textAlignVertical: "top",
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
