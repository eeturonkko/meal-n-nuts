import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../utils/constants";

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.container}>
        {/** JULIUKSEN RAKENTAMINEN */}
        <View style={[styles.section, styles.top]}>
          <Text style={styles.sectionTitle}>Julius</Text>
          <Text style={styles.sectionBody}>(Kaloriosa – Julius rakentaa)</Text>
          {/** ----------------------- */}
        </View>

        <View style={[styles.section, styles.bottom]}>
          {/** BRORIN RAKENTAMINEN */}
          <Text style={styles.sectionTitle}>Bror</Text>
          <Text style={styles.sectionBody}>(Ateriaosa – Bror rakentaa)</Text>
          {/** ----------------------- */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  container: {
    flex: 1,
    padding: 12,
    gap: 12,
  },
  section: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  top: {},
  bottom: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    color: "#0f172a",
  },
  sectionBody: {
    color: "#334155",
  },
});
