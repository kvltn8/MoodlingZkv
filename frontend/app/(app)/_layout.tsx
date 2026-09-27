import React from "react";
import { Redirect, Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { BottomNav } from "../../components/BottomNav";
import { useAuth } from "../../lib/auth";

export default function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }} />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
