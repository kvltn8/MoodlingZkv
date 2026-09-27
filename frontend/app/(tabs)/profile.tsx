import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import ScreenBackground from "@/components/ScreenBackground";
import MoodMascot from "@/components/MoodMascot";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useMoods } from "@/hooks/useMoods";
import { useTasks } from "@/hooks/useTasks";
import { colors, fonts, radii, shadow } from "@/constants/theme";
import { API_URL } from "@/constants/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const { moods } = useMoods();
  const { tasks } = useTasks();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const doneCount = tasks.filter((t) => t.is_done).length;

  return (
    <ScreenBackground>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.card}>
          <MoodMascot mood="calm" size={84} />
          <Text style={styles.username}>{user?.username ?? "—"}</Text>
          <Text style={styles.email}>{user?.email ?? ""}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(450)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{moods.length}</Text>
            <Text style={styles.statLabel}>moods logged</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{doneCount}</Text>
            <Text style={styles.statLabel}>tasks done</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(450)} style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="server-outline" size={16} color={colors.inkMuted} />
            <Text style={styles.infoText}>{API_URL}</Text>
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(220).duration(450)}>
          <Button title="Sign out" onPress={handleLogout} variant="ghost" />
        </Animated.View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 22, paddingTop: 70, paddingBottom: 130 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    alignItems: "center",
    paddingVertical: 30,
    ...shadow.card,
  },
  username: { fontFamily: fonts.display, fontSize: 26, color: colors.emerald, marginTop: 12 },
  email: { color: colors.inkMuted, fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
    ...shadow.card,
  },
  statNumber: { fontFamily: fonts.display, fontSize: 22, color: colors.emerald },
  statLabel: { fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
    marginTop: 14,
    ...shadow.card,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { color: colors.inkMuted, fontSize: 12 },
});
