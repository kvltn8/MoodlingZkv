import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import ScreenBackground from "@/components/ScreenBackground";
import MoodCard from "@/components/MoodCard";
import { useMoods } from "@/hooks/useMoods";
import { colors, fonts, radii, shadow } from "@/constants/theme";

export default function Moods() {
  const { moods, isLoading, error, refetch, removeMood } = useMoods();

  return (
    <ScreenBackground>
      <FlatList
        data={moods}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.emerald} />}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
            <View>
              <Text style={styles.title}>Your moods</Text>
              <Text style={styles.subtitle}>a soft record of how you've been</Text>
            </View>
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <MoodCard entry={item} index={index} onDelete={removeMood} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing logged yet</Text>
              <Text style={styles.emptyBody}>{error ?? "Tap the ✦ button to log your first mood."}</Text>
            </View>
          ) : null
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push("/mood/new")}>
        <Ionicons name="sparkles" size={22} color={colors.surface} />
      </Pressable>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, paddingTop: 62, paddingBottom: 140 },
  header: { marginBottom: 18 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.emerald },
  subtitle: { fontFamily: fonts.scriptRegular, fontSize: 16, color: colors.inkMuted, marginTop: 2 },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 104,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.floating,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 26,
    alignItems: "center",
    marginTop: 20,
    ...shadow.card,
  },
  emptyTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.emerald, marginBottom: 6 },
  emptyBody: { color: colors.inkMuted, fontSize: 13, textAlign: "center" },
});
