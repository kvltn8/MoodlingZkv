import React, { useEffect, useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import LottieView from "lottie-react-native";

type LottieSource = React.ComponentProps<typeof LottieView>["source"];

// Remote Lottie JSON is fetched once and cached for the session.
const cache = new Map<string, Promise<object | null>>();

function loadLottie(url: string) {
  let hit = cache.get(url);
  if (!hit) {
    hit = fetch(url)
      .then((r) => (r.ok ? (r.json() as Promise<object>) : null))
      .catch(() => null);
    cache.set(url, hit);
  }
  return hit;
}

export function LottieEmoji({
  url,
  size,
  loop = true,
  fallback,
  style
}: {
  url: string;
  size: number;
  loop?: boolean;
  /** Rendered while loading and if the animation can't be fetched (offline, 404…) */
  fallback?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    loadLottie(url).then((json) => {
      if (alive) setData(json);
    });
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      {data ? (
        <Animated.View entering={FadeIn.duration(350)}>
          <LottieView source={data as LottieSource} autoPlay loop={loop} style={{ width: size, height: size }} />
        </Animated.View>
      ) : (
        fallback ?? null
      )}
    </View>
  );
}