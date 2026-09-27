import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { Screen } from "../../components/Screen";
import { AnimatedIllustration } from "../../components/AnimatedIllustration";
import { colors, fonts, radius } from "../../lib/theme";
import { useAuth } from "../../lib/auth";

export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!username || !password) return Alert.alert("Almost there", "Enter your username and password.");
    try {
      setBusy(true);
      await signIn(username.trim(), password);
      router.replace("/(app)/home");
    } catch (e) {
      Alert.alert("Couldn't sign in", e instanceof Error ? e.message : "Please check your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <AnimatedIllustration mood="calm" size={150} />
          <Text style={styles.logo}>moodling</Text>
          <Text style={styles.tagline}>A softer way to organize your day.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>Let's pick up where you left off.</Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
          />

          <Pressable onPress={submit} disabled={busy} style={styles.button}>
            {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Sign in  →</Text>}
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.muted}>New to Moodling?</Text>
            <Link href="/(auth)/register" style={styles.link}> Create account</Link>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", justifyContent: "center", minHeight: "100%" },
  brand: { alignItems: "center", marginBottom: 22 },
  logo: { fontFamily: fonts.display, fontSize: 52, lineHeight: 62, color: colors.plum },
  tagline: { fontFamily: fonts.script, color: colors.lavenderDeep, fontSize: 21 },
  form: { width: "100%", maxWidth: 440 },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.plum },
  subtitle: { marginTop: 6, marginBottom: 22, color: colors.muted, fontSize: 14 },
  input: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 18,
    marginBottom: 12,
    fontSize: 15,
    color: colors.ink
  },
  button: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.plum,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5
  },
  buttonText: { color: colors.gold, fontWeight: "800", fontSize: 15 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  muted: { color: colors.muted, fontSize: 13 },
  link: { color: colors.lavenderDeep, fontWeight: "700", fontSize: 13 }
});