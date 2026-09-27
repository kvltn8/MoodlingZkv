import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { Link, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadow } from "../lib/theme";
import { safeHaptic } from "../lib/hooks";

type IconName = keyof typeof Ionicons.glyphMap;

const items: Array<{
  href: "/(app)/home" | "/(app)/moods" | "/(app)/tasks" | "/(app)/profile";
  label: string;
  icon: IconName;
  activeIcon: IconName;
  match: string[];
}> = [
  { href: "/(app)/home", label: "Home", icon: "grid-outline", activeIcon: "grid", match: ["/home"] },
  { href: "/(app)/moods", label: "Moods", icon: "happy-outline", activeIcon: "happy", match: ["/moods", "/add-mood"] },
  { href: "/(app)/tasks", label: "Tasks", icon: "checkmark-done-outline", activeIcon: "checkmark-done", match: ["/tasks", "/add-task"] },
  { href: "/(app)/profile", label: "Profile", icon: "person-outline", activeIcon: "person", match: ["/profile"] }
];

function NavItem({ item, active }: { item: (typeof items)[number]; active: boolean }) {
  const pill = useAnimatedStyle(() => ({
    width: withSpring(active ? 108 : 50, { damping: 15, stiffness: 160 }),
    backgroundColor: withTiming(active ? colors.plum : "rgba(35,27,48,0)", { duration: 220 })
  }));
  const label = useAnimatedStyle(() => ({
    opacity: withTiming(active ? 1 : 0, { duration: active ? 260 : 100 }),
    width: withSpring(active ? 48 : 0, { damping: 18, stiffness: 180 })
  }));
  const icon = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(active ? 1.08 : 1, { damping: 10, stiffness: 200 }) }]
  }));

  return (
    <Link href={item.href} asChild>
      <Pressable onPress={() => safeHaptic("select")} hitSlop={6}>
        <Animated.View style={[styles.pill, pill]}>
          <Animated.View style={icon}>
            <Ionicons
              name={active ? item.activeIcon : item.icon}
              size={21}
              color={active ? colors.gold : colors.muted}
            />
          </Animated.View>
          <Animated.Text numberOfLines={1} style={[styles.label, label]}>
            {item.label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.shell, { bottom: Platform.OS === "web" ? 20 : Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.bar}>
        {items.map((item) => (
          <NavItem key={item.href} item={item} active={item.match.some((m) => pathname.includes(m))} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    borderRadius: 32,
    backgroundColor: "rgba(255,252,247,0.96)",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.lift
  },
  pill: {
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    gap: 6
  },
  label: { color: colors.white, fontSize: 12.5, fontWeight: "700", letterSpacing: 0.3 }
});