// src/components/SurahCard.js
//
// An "open card" for a suggested/selectable surah: collapsed it shows the
// name, Arabic name, and ayah count; tapping expands it in place to reveal
// the mood-matched blurb and a select/start action. Built with LayoutAnimation
// so the expand/collapse itself feels alive without a heavy animation lib.

import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SurahCard({ surah, accentColor = "#0B6E4F", selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  return (
    <Pressable
      onPress={toggle}
      style={[styles.card, selected && { borderColor: accentColor, backgroundColor: "#FBF8F2" }]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.numberBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.numberBadgeText}>{surah.number}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{surah.name}</Text>
          <Text style={styles.arabic}>{surah.arabic}</Text>
        </View>
        <Text style={styles.ayahCount}>{surah.ayahCount} ayahs</Text>
      </View>

      {open && (
        <View style={styles.expanded}>
          <Text style={styles.theme}>{surah.theme}</Text>
          <Pressable
            style={[styles.selectButton, { backgroundColor: accentColor }]}
            onPress={() => onSelect?.(surah)}
          >
            <Text style={styles.selectButtonText}>{selected ? "Selected ✓" : "Select this surah"}</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E7E0D2",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  numberBadgeText: {
    color: "#FBF8F2",
    fontFamily: "Outfit-Bold",
    fontSize: 12,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontFamily: "Outfit-Medium",
    fontSize: 15,
    color: "#2B2B2B",
  },
  arabic: {
    fontFamily: "Outfit-Regular",
    fontSize: 13,
    color: "#8A8478",
  },
  ayahCount: {
    fontFamily: "Outfit-Regular",
    fontSize: 12,
    color: "#A79C82",
  },
  expanded: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0EAE0",
  },
  theme: {
    fontFamily: "Outfit-Regular",
    fontSize: 13,
    color: "#4A4A4A",
    lineHeight: 19,
    marginBottom: 10,
  },
  selectButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  selectButtonText: {
    color: "#FBF8F2",
    fontFamily: "Outfit-Medium",
    fontSize: 13,
  },
});