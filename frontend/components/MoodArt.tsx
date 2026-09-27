import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { AnimatedIllustration } from "./AnimatedIllustration";
import { LottieEmoji } from "./LottieEmoji";
import { moodMeta } from "../lib/moodCatalog";
import type { MoodAnimation } from "../lib/types";

/**
 * The character for a mood. Plays a live Lottie animation (Google Noto Animated Emoji)
 * and falls back to the built-in vector blob if it can't load.
 * Swap `lottie` in lib/moodCatalog.ts to use your own illustrations.
 */
export function MoodArt({
  mood,
  size = 120,
  halo = true,
  style
}: {
  mood: MoodAnimation | string | null | undefined;
  size?: number;
  halo?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const meta = moodMeta(mood);
  const inner = halo ? size * 0.76 : size;

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      {halo ? (
        <View
          style={{
            position: "absolute",
            width: size * 0.94,
            height: size * 0.94,
            borderRadius: size,
            backgroundColor: meta.tint
          }}
        />
      ) : null}
      <LottieEmoji
        url={meta.lottie}
        size={inner}
        fallback={<AnimatedIllustration mood={meta.id} size={size * 0.9} />}
      />
    </View>
  );
}