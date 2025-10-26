import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { type DayEntry, type MealEntry } from "../utils/types";

type DayDetailModalProps = {
  visible: boolean;
  dayEntry: DayEntry | null;
  onClose: () => void;
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Aamupala",
  lunch: "Lounas",
  dinner: "Päivällinen",
  evening: "Iltapala",
  snack: "Snacks",
  water: "Vesi",
};

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function groupEntriesByMeal(entries: MealEntry[]): Record<string, MealEntry[]> {
  return entries.reduce((acc, entry) => {
    if (!acc[entry.meal]) {
      acc[entry.meal] = [];
    }
    acc[entry.meal].push(entry);
    return acc;
  }, {} as Record<string, MealEntry[]>);
}

function EntryItem({ entry }: { entry: MealEntry }) {
  const isWater = entry.meal === "water";

  return (
    <View style={styles.entryItem}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryName} numberOfLines={2}>
          {isWater ? `💧 ${entry.name}` : entry.name}
        </Text>
        <Text style={styles.entryAmount}>
          {entry.amount}
          {entry.unit}
        </Text>
      </View>
      {!isWater && (
        <View style={styles.entryNutrition}>
          <Text style={styles.nutritionText}>
            {Math.round(entry.calories)} kcal
          </Text>
          <Text style={styles.nutritionText}>
            P: {Math.round(entry.protein)}g
          </Text>
          <Text style={styles.nutritionText}>
            H: {Math.round(entry.carbohydrate)}g
          </Text>
          <Text style={styles.nutritionText}>R: {Math.round(entry.fat)}g</Text>
        </View>
      )}
    </View>
  );
}

function MealSection({
  mealType,
  entries,
}: {
  mealType: string;
  entries: MealEntry[];
}) {
  const isWater = mealType === "water";

  if (isWater) {
    const totalWater = entries.reduce((acc, entry) => acc + entry.water, 0);
    return (
      <View style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>
            💧 {MEAL_LABELS[mealType] || mealType}
          </Text>
          <Text style={styles.waterTotal}>{Math.round(totalWater)} ml</Text>
        </View>
        {entries.map((entry) => (
          <EntryItem key={entry.id} entry={entry} />
        ))}
      </View>
    );
  }

  const mealTotals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbohydrate: acc.carbohydrate + entry.carbohydrate,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbohydrate: 0, fat: 0 }
  );

  return (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>
          {MEAL_LABELS[mealType] || mealType}
        </Text>
        <Text style={styles.mealCalories}>
          {Math.round(mealTotals.calories)} kcal
        </Text>
      </View>

      <View style={styles.mealTotals}>
        <Text style={styles.totalText}>
          P: {Math.round(mealTotals.protein)}g
        </Text>
        <Text style={styles.totalText}>
          H: {Math.round(mealTotals.carbohydrate)}g
        </Text>
        <Text style={styles.totalText}>R: {Math.round(mealTotals.fat)}g</Text>
      </View>

      {entries.map((entry) => (
        <EntryItem key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

export default function DayDetailModal({
  visible,
  dayEntry,
  onClose,
}: DayDetailModalProps) {
  if (!dayEntry) return null;

  const groupedEntries = dayEntry.entries
    ? groupEntriesByMeal(dayEntry.entries)
    : {};
  const mealTypes = Object.keys(groupedEntries);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{formatDisplayDate(dayEntry.date)}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Päivän yhteenveto</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(dayEntry.calories)}
              </Text>
              <Text style={styles.summaryLabel}>kcal</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(dayEntry.protein)}g
              </Text>
              <Text style={styles.summaryLabel}>Proteiini</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(dayEntry.carbohydrate)}g
              </Text>
              <Text style={styles.summaryLabel}>Hiilihydr.</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(dayEntry.fat)}g
              </Text>
              <Text style={styles.summaryLabel}>Rasva</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, styles.waterValue]}>
                💧 {Math.round(dayEntry.water)} ml
              </Text>
              <Text style={styles.summaryLabel}>Vesi</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {mealTypes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Ei merkintöjä tälle päivälle</Text>
            </View>
          ) : (
            mealTypes.map((mealType) => (
              <MealSection
                key={mealType}
                mealType={mealType}
                entries={groupedEntries[mealType]}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#059669",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mealSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  mealTotals: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  totalText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  entryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  entryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginRight: 12,
  },
  entryAmount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  entryNutrition: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  waterTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
  waterValue: {
    color: "#3b82f6",
    fontSize: 16,
  },
});
