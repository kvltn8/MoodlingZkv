// src/components/MoodCard.js
//
// A single mood card for the home screen's mood strip. Adds three small
// bits of "life" on top of a static illustration + label:
//   1. A gentle continuous float (translateY loop) so the card never sits
//      dead-still.
//   2. A spring "pop" scale when the user taps it.
//   3. A soft glow ring that fades in around the selected card.
//
// Swap `renderIllustration` for your existing <MoodIllustration mood={...} />
// (SvgUri-based) — it's left as a prop so this drops into your project
// without assuming the exact illustration-loading approach.

import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { MOOD_COLORS } from "../data/surahMoodMap";

export default function MoodCard({ mood, label, selected, onPress, renderIllustration }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  // Continuous gentle float, offset per-mood so a row of cards doesn't
  // bob in lockstep.
  useEffect(() => {
    const delay = (mood.length % 5) * 120;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim, mood]);

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: selected ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [selected, glowAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 4 }).start(() => {
      onPress?.(mood);
    });
  };

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const color = MOOD_COLORS[mood] || "#0B6E4F";

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.wrapper}>
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: color,
            opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
            transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.card,
          selected && { borderColor: color, borderWidth: 2 },
          { transform: [{ translateY }, { scale: scaleAnim }] },
        ]}
      >
        <View style={styles.illustrationSlot}>
          {renderIllustration ? renderIllustration(mood) : <View style={[styles.fallbackDot, { backgroundColor: color }]} />}
        </View>
        <Text style={[styles.label, selected && { color, fontFamily: "Outfit-Bold" }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 92,
  },
  glow: {
    position: "absolute",
    top: 6,
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  card: {
    width: 80,
    height: 96,
    borderRadius: 20,
    backgroundColor: "#FBF8F2",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  illustrationSlot: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  fallbackDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  label: {
    fontFamily: "Outfit-Medium",
    fontSize: 12,
    color: "#3A3A3A",
    textTransform: "capitalize",
  },
});