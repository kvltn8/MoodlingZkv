import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii } from "@/constants/theme";

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "gold";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "gold" && styles.gold,
        variant === "ghost" && styles.ghost,
        (disabled || loading) && { opacity: 0.6 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.emerald : colors.surface} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "ghost" && { color: colors.emerald },
            variant === "gold" && { color: colors.emeraldDeep },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.emerald },
  gold: { backgroundColor: colors.gold },
  ghost: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.emerald },
  label: { color: colors.surface, fontSize: 16, fontWeight: "600", letterSpacing: 0.2 },
});
