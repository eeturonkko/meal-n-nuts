import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MealButton from "../components/MealButton";
import { NutrientProgressCircle } from "../components/NutrientProgressCircle";
import WaterModal from "../components/WaterModal";
import COLORS from "../utils/constants";

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
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const userId = isLoaded ? user?.id ?? "" : "";

  const [showWater, setShowWater] = React.useState(false);
  const [totals, setTotals] = React.useState({
    calories: 0,
    protein: 0,
    carbohydrate: 0,
    fat: 0,
  });

  const dailyGoal = {
    calories: 2500,
    protein: 150,
    carbohydrate: 300,
    fat: 70,
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
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchTotals();
    }, [fetchTotals])
  );

  const openMeal = (meal: string) => router.push(`/screens/${meal}`);

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

        <View style={styles.mealsGrid}>
          <MealButton label="Aamupala" onPress={() => openMeal("breakfast")} />
          <MealButton label="Lounas" onPress={() => openMeal("lunch")} />
          <MealButton label="Päivällinen" onPress={() => openMeal("dinner")} />
          <MealButton label="Iltapala" onPress={() => openMeal("evening")} />
          <MealButton label="Snacks" onPress={() => openMeal("snack")} />
          <MealButton label="Vesi" onPress={() => setShowWater(true)} />
        </View>

        <WaterModal
          visible={showWater}
          onClose={() => setShowWater(false)}
          onSave={() => {}}
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
  mealsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
