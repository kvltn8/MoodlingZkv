import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import ScreenBackground from "@/components/ScreenBackground";
import TaskRow from "@/components/TaskRow";
import { useTasks } from "@/hooks/useTasks";
import { colors, fonts, radii, shadow } from "@/constants/theme";

type Filter = "all" | "active" | "done";

export default function Tasks() {
  const { tasks, isLoading, refetch, addTask, toggleTask, removeTask } = useTasks();
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.is_done);
    if (filter === "done") return tasks.filter((t) => t.is_done);
    return tasks;
  }, [tasks, filter]);

  const handleAdd = async () => {
    const text = draft.trim();
    if (!text) return;
    setAdding(true);
    setDraft("");
    try {
      await addTask(text);
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.emerald} />}
          ListHeaderComponent={
            <Animated.View entering={FadeInDown.duration(450)}>
              <Text style={styles.title}>Your tasks</Text>
              <Text style={styles.subtitle}>small wins, gently tracked</Text>

              <View style={styles.addRow}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Add a task…"
                  placeholderTextColor={colors.inkFaint}
                  style={styles.addInput}
                  onSubmitEditing={handleAdd}
                  returnKeyType="done"
                />
                <Pressable style={styles.addBtn} onPress={handleAdd} disabled={adding}>
                  <Ionicons name="add" size={22} color={colors.surface} />
                </Pressable>
              </View>

              <View style={styles.filterRow}>
                {(["all", "active", "done"] as Filter[]).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[styles.filterChip, filter === f && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                      {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          }
          renderItem={({ item, index }) => (
            <TaskRow task={item} index={index} onToggle={toggleTask} onDelete={removeTask} />
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>All clear ✦</Text>
                <Text style={styles.emptyBody}>Add something above to get started.</Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, paddingTop: 62, paddingBottom: 140 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.emerald },
  subtitle: { fontFamily: fonts.scriptRegular, fontSize: 16, color: colors.inkMuted, marginTop: 2, marginBottom: 18 },
  addRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  addInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  filterText: { fontSize: 12, color: colors.inkMuted, fontWeight: "600" },
  filterTextActive: { color: colors.emeraldDeep },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 26,
    alignItems: "center",
    marginTop: 10,
    ...shadow.card,
  },
  emptyTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.emerald, marginBottom: 6 },
  emptyBody: { color: colors.inkMuted, fontSize: 13 },
});
