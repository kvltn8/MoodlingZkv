import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { colors } from "../lib/theme";
import type { MoodAnimation } from "../lib/types";

const palette: Record<MoodAnimation, string> = {
  happy: "#E9C77B",
  calm: "#A9B8D8",
  focused: "#A9C3B3",
  tired: "#B7A9C8",
  sad: "#91A5C4",
  anxious: "#D6A58F",
  excited: "#E6A66E"
};

export function AnimatedIllustration({
  mood = "calm",
  size = 190
}: {
  mood?: MoodAnimation;
  size?: number;
}) {
  const float = useSharedValue(0);
  const pulse = useSharedValue(1);
  const color = palette[mood];

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(7, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1400 }),
        withTiming(0.96, { duration: 1400 })
      ),
      -1,
      true
    );
  }, [mood]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }]
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, floatingStyle]}>
      <View style={[styles.orbit, { width: size * 0.88, height: size * 0.88, borderRadius: size }]}>
        <Animated.View
          style={[
            styles.blob,
            pulseStyle,
            {
              width: size * 0.55,
              height: size * 0.55,
              borderRadius: size * 0.28,
              backgroundColor: color
            }
          ]}
        />
        <View style={[styles.spark, { top: size * 0.14, right: size * 0.08 }]} />
        <View style={[styles.sparkSmall, { bottom: size * 0.2, left: size * 0.1 }]} />
        <View style={[styles.face, { width: size * 0.26, height: size * 0.12 }]}>
          <View style={styles.eye} />
          <View style={styles.eye} />
          <View style={styles.smile} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orbit: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.38)"
  },
  blob: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 }
  },
  spark: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.white,
    opacity: 0.85
  },
  sparkSmall: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: colors.white,
    opacity: 0.7
  },
  face: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around"
  },
  eye: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: colors.ink
  },
  smile: {
    position: "absolute",
    width: 24,
    height: 10,
    bottom: -6,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    borderRadius: 20
  }
});
