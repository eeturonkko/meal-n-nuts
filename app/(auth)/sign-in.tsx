import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../utils/constants";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSignInPress = async () => {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const attempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        setError("Additional steps required to sign in.");
        console.error(JSON.stringify(attempt, null, 2));
      }
    } catch (err: any) {
      // Clerk errors often have an 'errors' array
      const msg =
        err?.errors?.[0]?.message ??
        err?.message ??
        "Sign in failed. Check your email and password.";
      setError(msg);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = !emailAddress || !password || submitting;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.card}>
          <Text style={styles.logo}>Meal’n’Nuts</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Use your email and password</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#7aa38f"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={emailAddress}
              onChangeText={setEmailAddress}
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#7aa38f"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={onSignInPress}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onSignInPress}
            disabled={disabled}
            style={[styles.primaryBtn, disabled && styles.btnDisabled]}
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.primaryBtnText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>No account?</Text>
            <Link href="/sign-up">
              <Text style={styles.link}>Create one</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logo: {
    textAlign: "center",
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  title: {
    textAlign: "center",
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    color: COLORS.outline,
    marginTop: 4,
    marginBottom: 14,
  },
  inputGroup: { marginBottom: 12 },
  label: { color: COLORS.white, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#0f172a",
  },
  error: {
    color: COLORS.white,
    backgroundColor: COLORS.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  footerText: { color: COLORS.outline },
  link: { color: COLORS.white, fontWeight: "800" },
});
