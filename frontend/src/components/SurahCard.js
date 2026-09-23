// src/components/SurahCard.js
//
// One mood-matched surah recommendation. Collapsed: name, Arabic name,
// verse count. Tapping opens it to show the "reason" text from the
// backend and a real in-app Listen control (play / pause / loading),
// backed by the shared player in src/audio/surahPlayer.js - so only one
// recitation plays at a time across the whole app.

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../api/client";
import { useSurahAudio } from "../audio/surahPlayer";
import { colors, fonts, radii, spacing } from "../theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SurahCard({ recommendation, token }) {
  const [open, setOpen] = useState(false);
  // "looking up" covers the standalone-flow case where the audio URL
  // isn't embedded yet and has to be fetched before playback can start.
  const [lookupState, setLookupState] = useState("idle"); // idle | looking | none | error

  // Two shapes reach this component: the standalone /moodsurahs/?mood=
  // list (nests full surah info under `surah_detail`) and the
  // recommendations embedded on each saved mood entry (nests it under
  // `surah`, and already includes `audio_url` + `reciter` - no extra
  // request needed there).
  const surah = recommendation.surah_detail || recommendation.surah;
  const cardKey = recommendation.id;

  const { activeKey, status: playerStatus, toggle } = useSurahAudio();
  const isThisCard = activeKey === cardKey;
  const isPlaying = isThisCard && playerStatus === "playing";
  const isLoadingAudio = isThisCard && playerStatus === "loading";
  const hadPlayerError = isThisCard && playerStatus === "error";

  // Reset the "no recitation found" note if the user closes and reopens.
  useEffect(() => {
    if (!open) setLookupState("idle");
  }, [open]);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  const handleListen = async () => {
    if (!surah) return;

    // Already playing or paused on this card - just hand off to the
    // shared player, no network needed.
    if (isThisCard && (playerStatus === "playing" || playerStatus === "paused")) {
      toggle(cardKey, recommendation.audio_url);
      return;
    }

    if (recommendation.audio_url) {
      toggle(cardKey, recommendation.audio_url);
      return;
    }

    // No embedded URL - look one up.
    setLookupState("looking");
    try {
      const audios = await api.listAudios(token, { surah: surah.id });
      if (audios.length === 0) {
        setLookupState("none");
        return;
      }
      setLookupState("idle");
      toggle(cardKey, audios[0].audio_url);
    } catch {
      setLookupState("error");
    }
  };

  if (!surah) return null;

  const isBusy = lookupState === "looking" || isLoadingAudio;

  return (
    <Pressable onPress={toggleOpen} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberBadgeText}>{surah.quran_id}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{surah.name_transliteration || surah.name_english}</Text>
          <Text style={styles.arabic}>{surah.name_arabic}</Text>
        </View>
        <Text style={styles.ayahCount}>{surah.verses_count} verses</Text>
      </View>

      {open && (
        <View style={styles.expanded}>
          <Text style={styles.reason}>{recommendation.reason}</Text>

          <Pressable style={styles.listenButton} onPress={handleListen} disabled={isBusy}>
            {isBusy ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <>
                <Ionicons name={isPlaying ? "pause" : "play"} size={14} color={colors.surface} />
                <Text style={styles.listenText}>{isPlaying ? "Pause" : "Listen"}</Text>
              </>
            )}
          </Pressable>

          {lookupState === "none" && (
            <Text style={styles.audioNote}>No recitation on file for this surah yet.</Text>
          )}
          {(lookupState === "error" || hadPlayerError) && (
            <Text style={styles.audioNote}>Couldn't play that recitation right now.</Text>
          )}
          {!!recommendation.reciter && (
            <Text style={styles.audioNote}>Recited by {recommendation.reciter}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  numberBadgeText: {
    color: colors.surface,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  titleBlock: { flex: 1 },
  name: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  arabic: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  ayahCount: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },

  expanded: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    gap: spacing.sm,
  },
  reason: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 7,
    paddingHorizontal: 14,
    minWidth: 76,
    justifyContent: "center",
  },
  listenText: { color: colors.surface, fontFamily: fonts.bodyMedium, fontSize: 12 },
  audioNote: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
});