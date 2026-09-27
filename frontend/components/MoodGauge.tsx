import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from "react-native-svg";
import { safeHaptic, useCountUp } from "../lib/hooks";
import { colors, fonts } from "../lib/theme";

// low → high: blue, lavender, mint, gold, coral
const STOPS = ["#8FA9D6", "#B9A9E0", "#A9D3BE", "#EBCB85", "#F0A98A"];

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function tickColor(t: number) {
  const seg = Math.min(STOPS.length - 2, Math.floor(t * (STOPS.length - 1)));
  const local = t * (STOPS.length - 1) - seg;
  const a = hexToRgb(STOPS[seg]);
  const b = hexToRgb(STOPS[seg + 1]);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * local));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const TICKS = 48;

/**
 * The Moodling scale: a half-dial of ticks that fill in as the value rises,
 * with a gold marker that springs to the current position.
 * Tap it to replay the sweep.
 */
export function MoodGauge({
  score,
  width = 320,
  onDark = false,
  children
}: {
  /** 0–100, or null for "nothing logged yet" */
  score: number | null;
  width?: number;
  onDark?: boolean;
  /** Rendered in the bowl of the dial */
  children?: React.ReactNode;
}) {
  const R = width / 2 - 24;
  const cx = width / 2;
  const cy = R + 26;
  const height = cy + 26;
  const target = score ?? 0;

  const [replay, setReplay] = useState(0);
  const display = useCountUp(target, 1300, replay);

  const rot = useSharedValue(-90);
  useEffect(() => {
    rot.value = -90;
    rot.value = withSpring((target / 100) * 180 - 90, { damping: 8, stiffness: 55, mass: 1 });
  }, [target, replay]);

  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }]
  }));

  const ticks = useMemo(() => {
    return Array.from({ length: TICKS + 1 }, (_, i) => {
      const t = i / TICKS;
      const theta = Math.PI * (1 - t);
      const long = i % 6 === 0;
      const r1 = R;
      const r2 = R - (long ? 24 : 15);
      return {
        t,
        long,
        x1: cx + r1 * Math.cos(theta),
        y1: cy - r1 * Math.sin(theta),
        x2: cx + r2 * Math.cos(theta),
        y2: cy - r2 * Math.sin(theta)
      };
    });
  }, [R, cx, cy]);

  const idle = onDark ? "rgba(255,255,255,0.16)" : "rgba(35,27,48,0.14)";
  const labelColor = onDark ? "rgba(255,255,255,0.5)" : colors.muted;
  const wrap = R + 10;

  return (
    <Pressable
      onPress={() => {
        safeHaptic("light");
        setReplay((n) => n + 1);
      }}
      style={{ width, height, alignSelf: "center" }}
    >
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={colors.gold} stopOpacity={onDark ? 0.28 : 0.2} />
            <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={R + 4} fill="url(#glow)" />
        {ticks.map((tk, i) => (
          <Line
            key={i}
            x1={tk.x1}
            y1={tk.y1}
            x2={tk.x2}
            y2={tk.y2}
            stroke={score !== null && tk.t * 100 <= display ? tickColor(tk.t) : idle}
            strokeWidth={tk.long ? 3.2 : 2}
            strokeLinecap="round"
          />
        ))}
      </Svg>

      {/* gold marker riding the rim */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: cx - wrap,
            top: cy - wrap,
            width: wrap * 2,
            height: wrap * 2,
            opacity: score === null ? 0.35 : 1
          },
          markerStyle
        ]}
      >
        <View style={[styles.marker, { left: wrap - 4 }]} />
        <View style={[styles.markerDot, { left: wrap - 6 }]} />
      </Animated.View>

      <View
        pointerEvents="none"
        style={{ position: "absolute", left: cx - R * 0.62, width: R * 1.24, top: cy - R * 0.72, height: R * 0.72, alignItems: "center", justifyContent: "flex-end" }}
      >
        {children ?? (
          <Text style={[styles.value, { color: onDark ? colors.white : colors.ink }]}>
            {score === null ? "—" : Math.round(display)}
          </Text>
        )}
      </View>

      <Text style={[styles.end, { left: cx - R - 2, top: cy + 6, color: labelColor }]}>low</Text>
      <Text style={[styles.end, { right: cx - R - 2, top: cy + 6, color: labelColor }]}>high</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: "absolute",
    top: 0,
    width: 8,
    height: 36,
    borderRadius: 4,
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: "#FFF6DF",
    shadowColor: colors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 }
  },
  markerDot: {
    position: "absolute",
    top: -7,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFF6DF",
    borderWidth: 2,
    borderColor: colors.gold
  },
  value: { fontFamily: fonts.display, fontSize: 56, lineHeight: 64 },
  end: { position: "absolute", fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: "700" }
});