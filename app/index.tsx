import { SignOutButton } from "@/app/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "./utils/constants";

export default function Page() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.replace("/(tabs)/home");
    }
  }, [isLoaded, user, router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logo}>Meal’n’Nuts</Text>

          <SignedIn>
            <View style={styles.section}>
              <Text style={styles.welcome}>
                Hello{" "}
                <Text style={styles.welcomeStrong}>
                  {user?.emailAddresses?.[0]?.emailAddress ?? "there"}
                </Text>
              </Text>
              <View style={styles.actionsRow}>
                <SignOutButton />
              </View>
            </View>
          </SignedIn>

          <SignedOut>
            <View style={styles.section}>
              <Text style={styles.subtitle}>Sign in to continue</Text>

              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity activeOpacity={0.9} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Sign in</Text>
                </TouchableOpacity>
              </Link>

              <View style={styles.divider} />

              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>Create account</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </SignedOut>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logo: {
    textAlign: "center",
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  section: { gap: 14 },
  subtitle: {
    textAlign: "center",
    color: COLORS.outline,
    fontSize: 14,
    marginBottom: 4,
  },
  primaryBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "transparent",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  secondaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  divider: { height: 10 },
  welcome: { textAlign: "center", color: COLORS.white, fontSize: 18 },
  welcomeStrong: { fontWeight: "800" },
  actionsRow: { marginTop: 8, alignItems: "center" },
});
