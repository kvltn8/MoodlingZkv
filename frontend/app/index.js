import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { colors, fonts } from "../src/theme";

const WORD = "Moodling";
const LETTER_DELAY = 130;
const HOLD_AFTER = 700;

export default function Index() {
  const { session, isRestoring } = useAuth();
  const [visibleChars, setVisibleChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (visibleChars >= WORD.length) {
      setTypingDone(true);
      return;
    }
    const t = setTimeout(() => setVisibleChars((n) => n + 1), LETTER_DELAY);
    return () => clearTimeout(t);
  }, [visibleChars]);

  useEffect(() => {
    if (!typingDone || isRestoring) return;
    const t = setTimeout(() => {
      router.replace(session ? "/(tabs)/home" : "/(auth)/login");
    }, HOLD_AFTER);
    return () => clearTimeout(t);
  }, [typingDone, isRestoring, session]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.word}>
        {WORD.slice(0, visibleChars)}
        <Text style={styles.cursor}>{visibleChars < WORD.length ? "|" : ""}</Text>
      </Text>
      <Text style={styles.tagline}>a quiet place to check in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: 14 },
  word: { fontFamily: fonts.display, fontSize: 46, color: colors.primary, minHeight: 58 },
  cursor: { color: colors.gold },
  tagline: { fontFamily: fonts.script, fontSize: 20, color: colors.muted },
});