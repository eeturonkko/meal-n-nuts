import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FoodSearchModal from "../components/FoodSearchModal";
import COLORS from "../utils/constants";

type MealKey = "breakfast" | "lunch" | "dinner" | "evening" | "snack";

type FoodPick = {
  id: string;
  name: string;
  serving?: string;
  amount: number;
  unit: "g" | "ml";
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbohydratePerUnit: number;
  fatPerUnit: number;
};

const mealTitle = (meal?: string) =>
  meal === "breakfast"
    ? "Aamupala"
    : meal === "lunch"
    ? "Lounas"
    : meal === "dinner"
    ? "Päivällinen"
    : meal === "evening"
    ? "Iltapala"
    : "Snacks";

function guessUnit(serving?: string): "g" | "ml" {
  const s = (serving || "").toLowerCase();
  return s.includes("ml") || s.includes("dl") || s.includes("l") ? "ml" : "g";
}

function todayLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export default function MealScreen() {
  const { meal } = useLocalSearchParams<{ meal: MealKey }>();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const userId = isLoaded ? user?.id ?? "" : "";

  const [query, setQuery] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);

  const [selected, setSelected] = React.useState<FoodPick[]>([]);

  const changeAmount = (id: string, delta: number) => {
    setSelected((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, amount: Math.max(0, it.amount + delta) } : it
        )
        .filter((it) => it.amount > 0)
    );
  };

  const onSelectFood = (item: {
    id: string;
    name: string;
    serving?: string;
    metricAmount?: number;
    metricUnit?: "g" | "ml" | "oz";
    calories?: number;
    protein?: number;
    carbohydrate?: number;
    fat?: number;
  }) => {
    const unit = guessUnit(item.serving);
    const metricAmount = Number(item.metricAmount || 0);
    const metricUnit = (item.metricUnit as any) || unit;
    let grams = metricAmount;
    if (metricUnit === "oz") grams = metricAmount * 28.35;
    if (metricUnit === "ml") grams = metricAmount;
    const perUnitFactor = grams > 0 ? 1 / grams : 0;
    const caloriesPerUnit = Number(item.calories || 0) * perUnitFactor || 0;
    const proteinPerUnit = Number(item.protein || 0) * perUnitFactor || 0;
    const carbohydratePerUnit =
      Number(item.carbohydrate || 0) * perUnitFactor || 0;
    const fatPerUnit = Number(item.fat || 0) * perUnitFactor || 0;
    setSelected((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      if (exists) {
        return prev.map((x) =>
          x.id === item.id ? { ...x, amount: x.amount + 100 } : x
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          serving: item.serving,
          amount: 100,
          unit,
          caloriesPerUnit,
          proteinPerUnit,
          carbohydratePerUnit,
          fatPerUnit,
        },
      ];
    });
    setShowSearch(false);
  };

  const totalCalories = selected.reduce(
    (sum, it) => sum + it.caloriesPerUnit * it.amount,
    0
  );
  const totalProtein = selected.reduce(
    (sum, it) => sum + it.proteinPerUnit * it.amount,
    0
  );
  const totalCarb = selected.reduce(
    (sum, it) => sum + it.carbohydratePerUnit * it.amount,
    0
  );
  const totalFat = selected.reduce(
    (sum, it) => sum + it.fatPerUnit * it.amount,
    0
  );

  const onSave = async () => {
    if (!userId || !meal || selected.length === 0) {
      router.back();
      return;
    }
    const items = selected.map((x) => ({
      name: x.name,
      amount: x.amount,
      unit: x.unit,
      calories: x.caloriesPerUnit * x.amount,
      protein: x.proteinPerUnit * x.amount,
      carbohydrate: x.carbohydratePerUnit * x.amount,
      fat: x.fatPerUnit * x.amount,
    }));
    await fetch(`${API_URL}/api/diary/add-many`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        date: todayLocal(),
        meal,
        items,
      }),
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{mealTitle(meal)}</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#ffffffff" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Hae ruoka-aine"
            placeholderTextColor="#ffffffff"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => setShowSearch(true)}
          />
          <TouchableOpacity onPress={() => setShowSearch(true)}>
            <Text style={styles.searchBtnText}>Hae</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Valitut ruuat</Text>

        <FlatList
          data={selected}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.9}>
              <View style={styles.row}>
                <View style={styles.dot} />
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.amountPill}>
                  <TouchableOpacity
                    onPress={() => changeAmount(item.id, -10)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.minus}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.amountText}>
                    {item.amount} {item.unit}
                  </Text>
                  <TouchableOpacity
                    onPress={() => changeAmount(item.id, +10)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.plus}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        <View style={styles.totals}>
          <Text style={styles.totalText}>
            {Math.round(totalCalories)} kcal • P {Math.round(totalProtein)}g • C{" "}
            {Math.round(totalCarb)}g • F {Math.round(totalFat)}g
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => router.back()}
          >
            <Text style={styles.btnSecondaryText}>Peruuta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={onSave}
            disabled={selected.length === 0}
          >
            <Text style={styles.btnPrimaryText}>
              {selected.length === 0
                ? "Tallenna"
                : `Tallenna (${selected.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        <FoodSearchModal
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          apiUrl={API_URL}
          query={query}
          onSelect={onSelectFood}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  container: { flex: 1, padding: 16 },
  title: {
    textAlign: "center",
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f0e0e22",
    borderWidth: 1,
    borderColor: "#ffffff44",
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
  },
  searchBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  sectionHeader: {
    color: COLORS.white,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    opacity: 0.7,
  },
  rowName: {
    flex: 1,
    color: "#0f172a",
    fontWeight: "700",
  },
  amountPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  amountText: { color: "#0f172a", fontWeight: "700" },
  minus: { color: "#64748b", fontSize: 18, fontWeight: "900" },
  plus: { color: COLORS.primary, fontSize: 18, fontWeight: "900" },
  totals: { alignItems: "center", marginBottom: 72, marginTop: 12 },
  totalText: { color: COLORS.white, fontWeight: "700" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ffffff55",
  },
  btnSecondaryText: {
    color: COLORS.white,
    fontWeight: "800",
  },
  btnPrimary: {
    backgroundColor: COLORS.white,
  },
  btnPrimaryText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
});
