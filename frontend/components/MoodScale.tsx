import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, fonts, MoodKey, moodPalette } from "@/constants/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Rough "how good does this mood feel" ordering, 0 (heavy) -> 1 (light/bright).
// Used only to place the needle on the scale — not shown to the user as a score.
export const MOOD_WEIGHT: Record<MoodKey, number> = {
  sad: 0.08,
  anxious: 0.24,
  tired: 0.38,
  calm: 0.62,
  focused: 0.74,
  happy: 0.88,
  excited: 1,
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function MoodScale({
  value,
  label,
  size = 260,
}: {
  value: number; // 0..1
  label: string;
  size?: number;
}) {
  const progress = useSharedValue(0);
  const r = size / 2 - 22;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    progress.value = withTiming(value, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    const angle = progress.value * 180;
    return { d: describeArc(cx, cy, r, 0, angle) };
  });

  const needleAngle = value * 180 - 180;
  const needleTip = polarToCartesian(cx, cy, r - 6, value * 180);

  return (
    <View style={{ width: size, height: size * 0.62, alignItems: "center" }}>
      <Svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <Defs>
          <LinearGradient id="scaleTrack" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.sky} />
            <Stop offset="0.5" stopColor={colors.gold} />
            <Stop offset="1" stopColor={colors.emerald} />
          </LinearGradient>
        </Defs>
        <Path
          d={describeArc(cx, cy, r, 0, 180)}
          stroke={colors.border}
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
        />
        <AnimatedPath
          animatedProps={animatedProps}
          stroke="url(#scaleTrack)"
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx={cx} cy={cy} r={7} fill={colors.emerald} />
        <Path
          d={`M ${cx} ${cy} L ${needleTip.x} ${needleTip.y}`}
          stroke={colors.emerald}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.readout}>
        <Text style={styles.readoutLabel}>this week, you've mostly felt</Text>
        <Text style={styles.readoutValue}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readout: {
    marginTop: -18,
    alignItems: "center",
  },
  readoutLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  readoutValue: {
    fontFamily: fonts.display,
    color: colors.emerald,
    fontSize: 30,
    marginTop: 2,
  },
});
