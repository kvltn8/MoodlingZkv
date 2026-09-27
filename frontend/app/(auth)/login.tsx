import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import ScreenBackground from "@/components/ScreenBackground";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { colors, fonts, radii } from "@/constants/theme";

export default function Login() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/(tabs)/home");
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.title}>Moodling</Text>
            <Text style={styles.subtitle}>welcome back — let's see how you're doing</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholder="yourname"
                placeholderTextColor={colors.inkFaint}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.inkFaint}
                style={styles.input}
              />
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Button title="Sign in" onPress={handleLogin} loading={submitting} style={{ marginTop: 8 }} />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New here?</Text>
              <Link href="/(auth)/register" style={styles.footerLink}>
                Create an account
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 28 },
  title: { fontFamily: fonts.display, fontSize: 44, color: colors.emerald, textAlign: "center" },
  subtitle: {
    fontFamily: fonts.scriptRegular,
    fontSize: 18,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 34,
  },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: colors.inkMuted, marginBottom: 6, letterSpacing: 0.3 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { color: colors.danger, fontSize: 13, marginBottom: 10, textAlign: "center" },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 22, gap: 6 },
  footerText: { color: colors.inkMuted, fontSize: 14 },
  footerLink: { color: colors.gold, fontSize: 14, fontWeight: "600" },
});
