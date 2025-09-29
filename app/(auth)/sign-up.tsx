import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
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

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSignUpPress = async () => {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ??
        err?.message ??
        "Sign up failed. Check details and try again.";
      setError(msg);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        setError("Additional steps required to finish sign up.");
        console.error(JSON.stringify(attempt, null, 2));
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ??
        err?.message ??
        "Verification failed. Check the code and try again.";
      setError(msg);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.card}>
          <Text style={styles.logo}>Meal’n’Nuts</Text>

          {pendingVerification ? (
            <>
              <Text style={styles.title}>Verify your email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{" "}
                <Text style={styles.strong}>{emailAddress}</Text>
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification code</Text>
                <TextInput
                  placeholder="123456"
                  placeholderTextColor="#7aa38f"
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                  style={styles.input}
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={onVerifyPress}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onVerifyPress}
                disabled={!code || submitting}
                style={[
                  styles.primaryBtn,
                  (!code || submitting) && styles.btnDisabled,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Entered the wrong email?</Text>
                <TouchableOpacity onPress={() => setPendingVerification(false)}>
                  <Text style={styles.link}>Go back</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Email + password sign up</Text>

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
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#7aa38f"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={onSignUpPress}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onSignUpPress}
                disabled={!emailAddress || !password || submitting}
                style={[
                  styles.primaryBtn,
                  (!emailAddress || !password || submitting) &&
                    styles.btnDisabled,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.primaryBtnText}>Continue</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Link href="/sign-in">
                  <Text style={styles.link}>Sign in</Text>
                </Link>
              </View>
            </>
          )}
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
  strong: { color: COLORS.white, fontWeight: "800" },
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
  btnDisabled: { opacity: 0.6 },
  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  footerText: { color: COLORS.outline },
  link: { color: COLORS.white, fontWeight: "800" },
});
