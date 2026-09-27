import React from "react";
import { Platform, ScrollView, StyleSheet, View, type ScrollViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../lib/theme";

export function Screen({
  children,
  contentContainerStyle,
  ...props
}: ScrollViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={["#F8F5EF", "#F6F1EA", "#EFEAF3"]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.glowA} />
      <View pointerEvents="none" style={styles.glowB} />
      <View pointerEvents="none" style={styles.glowC} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }, contentContainerStyle]}
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    paddingHorizontal: Platform.OS === "web" ? 32 : 20,
    paddingBottom: 130
  },
  glowA: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: "rgba(187,170,219,0.20)",
    top: -120,
    right: -90
  },
  glowB: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(201,166,107,0.13)",
    bottom: 80,
    left: -110
  },
  glowC: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(232,197,203,0.16)",
    top: 340,
    right: -70
  }
});