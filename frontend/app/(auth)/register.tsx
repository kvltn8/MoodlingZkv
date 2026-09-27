import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { Screen } from "../../components/Screen";
import { AnimatedIllustration } from "../../components/AnimatedIllustration";
import { colors, fonts, radius } from "../../lib/theme";
import { useAuth } from "../../lib/auth";

export default function Register() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!username || !email || !password) return Alert.alert("Almost there", "Fill in all fields.");
    try {
      setBusy(true);
      await signUp({ username: username.trim(), email: email.trim(), password });
      router.replace("/(app)/home");
    } catch (e) {
      Alert.alert("Couldn't create account", e instanceof Error ? e.message : "Please check your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <AnimatedIllustration mood="happy" size={125} />
          <Text style={styles.logo}>moodling</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Make it yours.</Text>
          <Text style={styles.subtitle}>A small space for tasks, moods and moments.</Text>

          <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={colors.muted} autoCapitalize="none" style={styles.input} />
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry style={styles.input} />

          <Pressable onPress={submit} disabled={busy} style={styles.button}>
            {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Create account  →</Text>}
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.muted}>Already have an account?</Text>
            <Link href="/(auth)/login" style={styles.link}> Sign in</Link>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", justifyContent: "center", minHeight: "100%" },
  brand: { alignItems: "center", marginBottom: 16 },
  logo: { fontFamily: fonts.display, fontSize: 50, lineHeight: 60, color: colors.plum },
  form: { width: "100%", maxWidth: 440 },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.plum },
  subtitle: { marginTop: 6, marginBottom: 22, color: colors.muted, fontSize: 14 },
  input: { height: 58, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 18, marginBottom: 12, fontSize: 15, color: colors.ink },
  button: { height: 58, borderRadius: radius.md, backgroundColor: colors.plum, alignItems: "center", justifyContent: "center", marginTop: 5 },
  buttonText: { color: colors.gold, fontWeight: "800", fontSize: 15 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  muted: { color: colors.muted, fontSize: 13 },
  link: { color: colors.lavenderDeep, fontWeight: "700", fontSize: 13 }
});