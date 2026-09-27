import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue
} from "react-native-reanimated";
import { colors } from "../lib/theme";

const PALETTE = [colors.gold, colors.lavender, colors.peach, colors.sage, colors.rose, "#FFFFFF"];

function Piece({
  progress,
  angle,
  distance,
  size,
  color,
  spin,
  round
}: {
  progress: SharedValue<number>;
  angle: number;
  distance: number;
  size: number;
  color: string;
  spin: number;
  round: boolean;
}) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p === 0 ? 0 : 1 - p * p,
      transform: [
        { translateX: Math.cos(angle) * distance * p },
        { translateY: Math.sin(angle) * distance * p + 46 * p * p },
        { rotate: `${spin * p}deg` },
        { scale: 1 - p * 0.35 }
      ]
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: round ? size : size * 0.5,
          borderRadius: round ? size : 2,
          backgroundColor: color
        },
        style
      ]}
    />
  );
}

/** Tiny particle burst. Bump `trigger` (any number > 0) to fire it. */
export function ConfettiBurst({ trigger, count = 16 }: { trigger: number; count?: number }) {
  const progress = useSharedValue(0);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (Math.PI * 2 * i) / count + Math.random() * 0.5,
        distance: 34 + Math.random() * 46,
        size: 5 + Math.random() * 5,
        color: PALETTE[i % PALETTE.length],
        spin: (Math.random() - 0.5) * 540,
        round: i % 3 === 0
      })),
    [count, trigger]
  );

  useEffect(() => {
    if (trigger <= 0) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [trigger]);

  return (
    <View pointerEvents="none" style={styles.anchor}>
      {pieces.map((p, i) => (
        <Piece key={i} progress={progress} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: "absolute", left: 0, top: 0, width: 0, height: 0, overflow: "visible" }
});