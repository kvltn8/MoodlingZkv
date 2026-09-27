import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { MoodKey, moodPalette } from "@/constants/theme";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// A small, self-contained animated character — no network Lottie dependency.
// Breathes gently, blinks, and wears a mood-appropriate expression. Swap this
// component's internals for a real Lottie file later if you want; every call
// site just passes a `mood` + `size` prop.

const EXPRESSIONS: Record<
  MoodKey,
  { mouth: string; brow: number; eyeScale: number; bob: number }
> = {
  happy: { mouth: "M 34 62 Q 50 78 66 62", brow: 0, eyeScale: 1, bob: 10 },
  excited: { mouth: "M 32 60 Q 50 82 68 60", brow: -3, eyeScale: 1.15, bob: 16 },
  calm: { mouth: "M 36 64 Q 50 68 64 64", brow: 0, eyeScale: 0.55, bob: 4 },
  focused: { mouth: "M 38 64 L 62 64", brow: -2, eyeScale: 0.85, bob: 3 },
  tired: { mouth: "M 38 66 Q 50 62 62 66", brow: 4, eyeScale: 0.4, bob: 2 },
  sad: { mouth: "M 34 68 Q 50 56 66 68", brow: 6, eyeScale: 0.9, bob: 3 },
  anxious: { mouth: "M 36 66 Q 50 60 64 66", brow: 5, eyeScale: 1, bob: 8 },
};

export default function MoodMascot({
  mood,
  size = 96,
}: {
  mood: MoodKey;
  size?: number;
}) {
  const palette = moodPalette[mood];
  const expr = EXPRESSIONS[mood];

  const breathe = useSharedValue(0);
  const blink = useSharedValue(1);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600 + expr.bob * 30, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600 + expr.bob * 30, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    blink.value = withRepeat(
      withSequence(
        withDelay(2600, withTiming(0.05, { duration: 90 })),
        withTiming(1, { duration: 110 })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -breathe.value * (expr.bob / 8) },
      { scale: 1 + breathe.value * 0.02 },
    ],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: blink.value * expr.eyeScale }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={bodyStyle}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx={50} cy={50} r={42} fill={palette.soft} />
          <Circle cx={50} cy={52} r={32} fill={palette.base} opacity={0.92} />
          {/* brows */}
          <Path
            d={`M 30 ${38 + expr.brow} L 40 ${36 + expr.brow}`}
            stroke="#26312C"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.55}
          />
          <Path
            d={`M 70 ${38 + expr.brow} L 60 ${36 + expr.brow}`}
            stroke="#26312C"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.55}
          />
          {/* mouth */}
          <Path
            d={expr.mouth}
            stroke="#26312C"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
        </Svg>
      </Animated.View>
      {/* eyes overlay, animated separately for the blink */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { alignItems: "center", justifyContent: "center" },
          eyeStyle,
        ]}
        pointerEvents="none"
      >
        <View style={{ flexDirection: "row", width: size * 0.4, justifyContent: "space-between", marginTop: -size * 0.02 }}>
          <View style={[styles.eye, { width: size * 0.09, height: size * 0.09 }]} />
          <View style={[styles.eye, { width: size * 0.09, height: size * 0.09 }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  eye: {
    borderRadius: 999,
    backgroundColor: "#26312C",
  },
});
