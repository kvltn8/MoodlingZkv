import React from "react";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radius } from "../lib/theme";

export function GlassCard({ children, style, ...props }: ViewProps) {
  if (Platform.OS === "web") {
    return (
      <View style={[styles.card, style]} {...props}>
        {children}
      </View>
    );
  }
  return (
    <BlurView intensity={22} tint="light" style={[styles.card, style]} {...props}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "rgba(255,253,249,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)"
  },
  inner: {
    flex: 1
  }
});
