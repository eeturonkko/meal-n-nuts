// app/(screens)/[meal].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
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
import { NutrientProgressCircle } from "../components/NutrientProgressCircle";
import COLORS from "../utils/constants";
import FoodSearchModal from "../components/FoodSearchModal";

type MealKey = "breakfast" | "lunch" | "dinner" | "evening" | "snack";

type SelectedItem = {
  id: string;
  name: string;
  unit: "g" | "ml";
  amount: number;
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

export default function MealScreen() {
  const { meal } = useLocalSearchParams<{ meal: MealKey }>();

  // DUmmyDataa
  const [selected, setSelected] = React.useState<SelectedItem[]>([
    { id: "1", name: "Kananrinta", unit: "g", amount: 160 },
    { id: "2", name: "Banaani", unit: "g", amount: 60 },
    { id: "3", name: "Mehukeitto", unit: "ml", amount: 200 },
  ]);

  const [query, setQuery] = React.useState("");

  const changeAmount = (id: string, delta: number) => {
    setSelected((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, amount: Math.max(0, it.amount + delta) } : it
        )
        .filter((it) => it.amount > 0)
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Otsikko */}
        <Text style={styles.title}>{mealTitle(meal)}</Text>

        {/* Kalorimittari */}
        <View style={styles.meterWrap}>
          <NutrientProgressCircle
            progressValue={1000}
            goalValue={2500}
            label="Kalorit"
            size={140}
          />
        </View>

        {/* Hakupalkki tee modali tai yhdistä hakumodalin*/}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#ffffffff" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Hae ruoka-aine"
            placeholderTextColor="#ffffffff"
            style={styles.searchInput}
          />
        </View>

        {/* Otsikko listalle, vai ilman? */}
        <Text style={styles.sectionHeader}>Valitut ruuat</Text>

        {/* Valituttujen ruokien lista*/}
        <FlatList
          data={selected}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingBottom: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {/*  säilytetäänkö og plan piste vai korvataanko jollain iconilla? */}
              <View style={styles.dot} />

              {/* nimi */}
              <Text style={styles.rowName} numberOfLines={1}>
                {item.name}
              </Text>

              {/* oikean laidan määräsäädin pillerimalli */}
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
          )}
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

  meterWrap: {
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: COLORS.white,
    alignSelf: "center",
    borderRadius: 120,
    padding: 8,
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

  sectionHeader: {
    color: COLORS.white,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },

  // valittujen ruokien kortti
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

  // oikean reunan määräsäädin pillerimalli
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
});
