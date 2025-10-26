import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type DayEntry } from "../utils/types";

type DayCardProps = {
  dayEntry: DayEntry;
  onPress: () => void;
};

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function DayCard({ dayEntry, onPress }: DayCardProps) {
  const totalCalories = Math.round(dayEntry.calories);
  const totalWater = Math.round(dayEntry.water);
  const hasEntries = totalCalories > 0 || totalWater > 0;

  return (
    <TouchableOpacity
      style={[styles.card, !hasEntries && styles.emptyCard]}
      onPress={onPress}
      disabled={!hasEntries}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDisplayDate(dayEntry.date)}</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.calories, !hasEntries && styles.emptyText]}>
            {hasEntries ? `${totalCalories} kcal` : "Ei merkintöjä"}
          </Text>
          {totalWater > 0 && (
            <Text style={styles.water}>💧 {totalWater} ml</Text>
          )}
        </View>
      </View>

      {hasEntries && (
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {Math.round(dayEntry.protein)}g
            </Text>
            <Text style={styles.macroLabel}>Proteiini</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {Math.round(dayEntry.carbohydrate)}g
            </Text>
            <Text style={styles.macroLabel}>Hiilihydr.</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{Math.round(dayEntry.fat)}g</Text>
            <Text style={styles.macroLabel}>Rasva</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyCard: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  date: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  calories: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  water: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
    marginTop: 2,
  },
  emptyText: {
    color: "#9ca3af",
    fontWeight: "500",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  macroLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
});
