import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import ScreenBackground from "@/components/ScreenBackground";
import AnimatedWordmark from "@/components/AnimatedWordmark";
import { useAuth } from "@/context/AuthContext";
import { colors, fonts } from "@/constants/theme";

export default function Intro() {
  const { isLoading, isAuthenticated } = useAuth();
  const [wordmarkDone, setWordmarkDone] = useState(false);
  const [ready, setReady] = useState(false);

  // Let the "Moodling" letters finish their pop-in, then hold a beat before
  // routing on — same beat Apple's boot animation gives its wordmark.
  const handleFinished = () => {
    setWordmarkDone(true);
    setTimeout(() => setReady(true), 550);
  };

  if (!isLoading && ready) {
    return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/(auth)/login"} />;
  }

  return (
    <ScreenBackground style={styles.center}>
      <AnimatedWordmark onFinished={handleFinished} />
      {wordmarkDone && (
        <Animated.Text entering={FadeIn.duration(400)} style={styles.tagline}>
          a quiet place for your feelings
        </Animated.Text>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  tagline: {
    fontFamily: fonts.scriptRegular,
    fontSize: 20,
    color: colors.inkMuted,
    marginTop: 14,
  },
});
