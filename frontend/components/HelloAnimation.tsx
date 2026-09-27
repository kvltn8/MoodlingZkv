import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedIllustration } from "./AnimatedIllustration";
import { colors, fonts } from "../lib/theme";

const WORD = "Moodling";

/** Entry screen: "Moodling" types itself out in Lobster Two, then the tagline drifts in. */
export function HelloAnimation({ onFinish }: { onFinish: () => void }) {
  const [count, setCount] = useState(0);
  const cursor = useSharedValue(1);
  const tagline = useSharedValue(0);
  const art = useSharedValue(0);
  const shine = useSharedValue(0);
  const exit = useSharedValue(1);

  useEffect(() => {
    art.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    cursor.value = withRepeat(
      withSequence(withTiming(0, { duration: 420 }), withTiming(1, { duration: 420 })),
      -1
    );

    let interval: ReturnType<typeof setInterval> | undefined;
    let i = 0;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= WORD.length && interval) clearInterval(interval);
      }, 135);
    }, 550);

    const typedAt = 550 + WORD.length * 135;
    const taglineTimer = setTimeout(() => {
      tagline.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
      shine.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) });
    }, typedAt + 150);
    const exitTimer = setTimeout(() => {
      exit.value = withTiming(0, { duration: 450 });
    }, typedAt + 1600);
    const doneTimer = setTimeout(onFinish, typedAt + 2100);

    return () => {
      clearTimeout(start);
      clearTimeout(taglineTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      if (interval) clearInterval(interval);
    };
  }, []);

  const root = useAnimatedStyle(() => ({ opacity: exit.value }));
  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursor.value }));
  const artStyle = useAnimatedStyle(() => ({
    opacity: art.value,
    transform: [{ translateY: (1 - art.value) * 18 }, { scale: 0.9 + art.value * 0.1 }]
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: (1 - tagline.value) * 12 }]
  }));
  const shineStyle = useAnimatedStyle(() => ({
    width: `${shine.value * 100}%`,
    opacity: shine.value
  }));

  return (
    <Animated.View style={[styles.container, root]}>
      <LinearGradient colors={["#F8F5EF", "#F1EAF4"]} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={styles.glow} />

      <Animated.View style={artStyle}>
        <AnimatedIllustration mood="calm" size={150} />
      </Animated.View>

      <View style={styles.row}>
        {WORD.slice(0, count)
          .split("")
          .map((ch, i) => (
            <Animated.Text
              key={i}
              entering={FadeInDown.duration(320).springify().damping(13)}
              style={styles.letter}
            >
              {ch}
            </Animated.Text>
          ))}
        <Animated.View style={[styles.cursor, cursorStyle]} />
      </View>

      <View style={styles.rule}>
        <Animated.View style={[styles.ruleFill, shineStyle]} />
      </View>

      <Animated.Text style={[styles.tagline, taglineStyle]}>your day, your way.</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  glow: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 340,
    backgroundColor: "rgba(201,166,107,0.14)"
  },
  row: { flexDirection: "row", alignItems: "center", height: 84, marginTop: 6 },
  letter: { fontFamily: fonts.display, fontSize: 64, lineHeight: 78, color: colors.plum },
  cursor: { width: 3, height: 52, marginLeft: 4, borderRadius: 2, backgroundColor: colors.gold },
  rule: { width: 150, height: 2, marginTop: 4, backgroundColor: "rgba(201,166,107,0.18)", borderRadius: 2, overflow: "hidden" },
  ruleFill: { height: 2, backgroundColor: colors.gold },
  tagline: { marginTop: 14, fontFamily: fonts.script, fontSize: 25, color: colors.lavenderDeep }
});