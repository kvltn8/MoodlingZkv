import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { LobsterTwo_400Regular, LobsterTwo_700Bold } from "@expo-google-fonts/lobster-two";
import { DancingScript_500Medium, DancingScript_700Bold } from "@expo-google-fonts/dancing-script";
import { AuthProvider } from "../lib/auth";
import { AudioProvider } from "../lib/audio";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    LobsterTwo_400Regular,
    LobsterTwo_700Bold,
    DancingScript_500Medium,
    DancingScript_700Bold
  });

  // Hold the first frame until fonts are ready so the intro types out in Lobster Two, not a fallback.
  if (!loaded && !error) return null;

  return (
    <AuthProvider>
      <AudioProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </AudioProvider>
    </AuthProvider>
  );
}