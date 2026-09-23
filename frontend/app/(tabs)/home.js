import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { api, API_BASE_URL } from "../../src/api/client";
import { MOODS, moodByKey } from "../../src/data/moods";
import MoodIllustration from "../../src/components/MoodIllustration";
import SurahCard from "../../src/components/SurahCard";
import TopBar from "../../src/components/TopBar";
import { colors, fonts, spacing, radii } from "../../src/theme";

export default function HomeScreen() {
  const { session } = useAuth();
  const [selected, setSelected] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadRecommendations = useCallback(
    async (moodKey) => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await api.listMoodSurahs(session.token, moodKey);
        setRecommendations(data);
      } catch (err) {
        setLoadError(err.message || "Couldn't reach your backend.");
      } finally {
        setLoading(false);
      }
    },
    [session.token]
  );

  useEffect(() => {
    if (selected) {
      loadRecommendations(selected);
    } else {
      setRecommendations([]);
    }
  }, [selected, loadRecommendations]);

  const handleSelect = (key) => {
    setSelected((prev) => (prev === key ? null : key));
  };

  return (
    <View style={styles.safe}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>How are you feeling right now?</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.illoRow}>
          {MOODS.map((m) => {
            const active = selected === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => handleSelect(m.key)}
                style={[styles.illoCard, active && styles.illoCardActive]}
              >
                <MoodIllustration uri={m.illo} size={44} active={active} />
                <Text style={[styles.illoLabel, active && styles.illoLabelActive]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.surahSection}>
          <Text style={styles.subheading}>
            {selected ? `Surahs for feeling ${moodByKey(selected)?.label.toLowerCase()}` : "Pick a mood above"}
          </Text>

          {!selected && (
            <Text style={styles.muted}>We'll match a surah to how you're feeling right now.</Text>
          )}

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.muted}>Finding a surah for you…</Text>
            </View>
          )}

          {!!loadError && (
            <View style={styles.errorCard}>
              <Text style={styles.error}>Couldn't load a recommendation — {loadError}</Text>
              <Text style={styles.mutedSmall}>
                (Check that {API_BASE_URL} is reachable from your device.)
              </Text>
            </View>
          )}

          {!loading && !loadError && selected && recommendations.length === 0 && (
            <Text style={styles.muted}>No recommendation on file for this mood yet.</Text>
          )}

          {!loading &&
            !loadError &&
            recommendations.map((rec) => <SurahCard key={rec.id} recommendation={rec} token={session.token} />)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  heading: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.ink },
  subheading: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, marginBottom: spacing.xs },

  illoRow: { gap: spacing.md, paddingVertical: spacing.xs },
  illoCard: {
    width: 84,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  illoCardActive: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
  illoLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  illoLabelActive: { color: colors.primary, fontFamily: fonts.bodyMedium },

  surahSection: { gap: spacing.xs },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  muted: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, paddingVertical: spacing.xs },
  mutedSmall: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 4 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.danger },
  errorCard: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "#E9CFC6",
    borderRadius: radii.md,
    padding: spacing.md,
  },
});