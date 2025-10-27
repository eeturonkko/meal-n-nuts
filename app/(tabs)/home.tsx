import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MealGrid, { type MealConfig } from "../components/MealGrid";
import { NutrientProgressCircle } from "../components/NutrientProgressCircle";
import WaterModal from "../components/WaterModal";
import COLORS from "../utils/constants";
import { useMealActions } from "../utils/hooks";

const ALL_MEALS: readonly MealConfig[] = [
  {
    id: "breakfast",
    label: "Aamupala",
    route: "breakfast",
    action: "navigation",
  },
  { id: "lunch", label: "Lounas", route: "lunch", action: "navigation" },
  { id: "dinner", label: "Päivällinen", route: "dinner", action: "navigation" },
  { id: "evening", label: "Iltapala", route: "evening", action: "navigation" },
  { id: "snack", label: "Snacks", route: "snack", action: "navigation" },
  { id: "water", label: "Vesi", action: "modal", variant: "special" },
] as const;

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

function formatDMY(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function HomeScreen() {
  const { user, isLoaded } = useUser();
  const userId = isLoaded ? user?.id ?? "" : "";

  const [showWater, setShowWater] = React.useState(false);
  const { handleMealPress } = useMealActions({
    onWaterPress: () => setShowWater(true),
  });
  const [totals, setTotals] = React.useState({
    calories: 0,
    protein: 0,
    carbohydrate: 0,
    fat: 0,
  });
  const [waterTotal, setWaterTotal] = React.useState(0);

  const dailyGoal = {
    calories: 2500,
    protein: 150,
    carbohydrate: 300,
    fat: 70,
    water: 2500,
  };
  const prettyDate = formatDMY(new Date());

  const fetchTotals = useCallback(async () => {
    if (!userId) {
      setTotals({ calories: 0, protein: 0, carbohydrate: 0, fat: 0 });
      return;
    }
    const resp = await fetch(
      `${API_URL}/api/diary/day?user_id=${encodeURIComponent(
        userId
      )}&date=${todayISO()}`
    );
    const json = await resp.json();
    setTotals({
      calories: Number(json?.totals?.calories || 0),
      protein: Number(json?.totals?.protein || 0),
      carbohydrate: Number(json?.totals?.carbohydrate || 0),
      fat: Number(json?.totals?.fat || 0),
    });
    setWaterTotal(Number(json?.totals?.water || 0));
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchTotals();
    }, [fetchTotals])
  );

  const handleWaterSave = useCallback(
    async (amount: number) => {
      if (!userId || amount <= 0) return;

      try {
        const response = await fetch(`${API_URL}/api/diary/add-water`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            amount,
            date: todayISO(),
          }),
        });

        if (response.ok) {
          // Refresh totals after adding water
          fetchTotals();
        }
      } catch (error) {
        console.error("Error saving water:", error);
      }
    },
    [userId, fetchTotals]
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.container}>
        <View style={[styles.section, styles.top, { alignItems: "center" }]}>
          <View style={styles.dateWrap}>
            <Text style={styles.dateText}>{prettyDate}</Text>
          </View>

          <NutrientProgressCircle
            progressValue={Math.round(totals.calories)}
            goalValue={dailyGoal.calories}
            label="Kalorit"
            size={120}
          />

          <View style={styles.smallRow}>
            <View style={{ marginTop: -35 }}>
              <NutrientProgressCircle
                progressValue={Math.round(totals.protein)}
                goalValue={dailyGoal.protein}
                label="Proteiini"
                size={100}
              />
            </View>
            <View>
              <NutrientProgressCircle
                progressValue={Math.round(totals.carbohydrate)}
                goalValue={dailyGoal.carbohydrate}
                label="Hiilihydraatti"
                size={100}
              />
            </View>
            <View style={{ marginTop: -35 }}>
              <NutrientProgressCircle
                progressValue={Math.round(totals.fat)}
                goalValue={dailyGoal.fat}
                label="Rasva"
                size={100}
              />
            </View>
          </View>
        </View>

        <MealGrid
          meals={ALL_MEALS}
          onMealPress={(mealId) => handleMealPress(mealId, ALL_MEALS)}
        />

        <WaterModal
          visible={showWater}
          onClose={() => setShowWater(false)}
          onSave={handleWaterSave}
          dailyGoalMl={dailyGoal.water}
          startAmountMl={waterTotal}
        />
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
  },
  top: {},
  dateWrap: {
    alignSelf: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  dateText: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  smallRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 75,
    marginTop: 8,
  },
});
