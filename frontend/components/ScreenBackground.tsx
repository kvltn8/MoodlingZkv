import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/theme";

export default function ScreenBackground({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundAlt]}
      style={[StyleSheet.absoluteFillObject]}
    >
      <View style={[{ flex: 1 }, style]}>{children}</View>
    </LinearGradient>
  );
}
