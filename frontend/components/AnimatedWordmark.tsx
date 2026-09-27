import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { colors, fonts } from "@/constants/theme";

const WORD = "Moodling";
const LETTER_STAGGER = 90;

function Letter({
  char,
  index,
  onLast,
  fontSize,
}: {
  char: string;
  index: number;
  onLast?: () => void;
  fontSize: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    const delay = index * LETTER_STAGGER;
    opacity.value = withDelay(delay, withTiming(1, { duration: 260 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 9, stiffness: 140 }));
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 7, stiffness: 160 }, (finished) => {
        if (finished && index === WORD.length - 1 && onLast) runOnJS(onLast)();
      })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.letter, { fontSize }, style]}>
      {char}
    </Animated.Text>
  );
}

// Mirrors the letter-by-letter pop-in feel of Apple's boot-up "hello" —
// staggered, springy, one word, set in Lobster Two.
export default function AnimatedWordmark({
  onFinished,
  fontSize = 56,
}: {
  onFinished?: () => void;
  fontSize?: number;
}) {
  return (
    <View style={styles.row}>
      {WORD.split("").map((char, i) => (
        <Letter key={`${char}-${i}`} char={char} index={i} onLast={onFinished} fontSize={fontSize} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  letter: {
    fontFamily: fonts.display,
    color: colors.emerald,
  },
});
