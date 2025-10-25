import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FoodListItem } from "../components/FoodRow";
import FoodSearchModal from "../components/FoodSearchModal";
import { NutrientProgressCircle } from "../components/NutrientProgressCircle";
import COLORS from "../utils/constants";

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
  const router = useRouter();

  // mittarin placeholderi arvot
  const progress = 350;
  const goal = 700;

  // haku ja sen modalin näkyvyys
  const [query, setQuery] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);

  // valitut tuotteet fake data sis
  const [selected, setSelected] = React.useState<SelectedItem[]>([
    { id: "1", name: "Kananrinta", unit: "g", amount: 160 },
    { id: "2", name: "Banaani", unit: "g", amount: 60 },
    { id: "3", name: "Mehukeitto", unit: "ml", amount: 200 },
  ]);

  // poistettavan rivin "kohde" (long-press)
  const [deleteTarget, setDeleteTarget] = React.useState<SelectedItem | null>(null);

  // määrän muutos
  const changeAmount = (id: string, delta: number) => {
    setSelected((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, amount: Math.max(0, it.amount + delta) } : it
        )
        .filter((it) => it.amount > 0)
    );
  };

  // yksikön arvaus annoksen perusteella ei ole kovin tarkka :D vaihdetaan kun keksii paremman
  const guessUnit = (serving?: string): "g" | "ml" => {
    const s = (serving || "").toLowerCase();
    return s.includes("ml") || s.includes("dl") || s.includes("l") ? "ml" : "g";
  };

  // kun käyttäjä valitsee tuotteen hakumodaalista
  const onSelectFood = (item: FoodListItem) => {
    const unit: "g" | "ml" = guessUnit(item.serving);
    setSelected((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      if (exists) {
        return prev.map((x) =>
          x.id === item.id ? { ...x, amount: x.amount + 100 } : x
        );
      }
      return [...prev, { id: item.id, name: item.name, unit, amount: 100 }];
    });
    setShowSearch(false);
  };

  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

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

        {/* Hakupalkki */}
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

        {/* Otsikko listalle */}
        <Text style={styles.sectionHeader}>Valitut ruuat</Text>

        {/* Valittujen ruokien lista */}
        <FlatList
          data={selected}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingBottom: 120 }} 
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => setDeleteTarget(item)}
              delayLongPress={400}
            >
              <View style={styles.row}>
                {/* vasen “dot” */}
                <View style={styles.dot} />

                {/* nimi */}
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>

                {/* määräsäädin pillerinä */}
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

        {/* Footer-napit */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => router.back()}
          >
            <Text style={styles.btnSecondaryText}>Peruuta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => {
              // TODO: bakend
              console.log("Tallenna:", { meal, items: selected });
              router.back();
            }}
            disabled={selected.length === 0}
          >
            <Text style={styles.btnPrimaryText}>
              {selected.length === 0 ? "Tallenna" : `Tallenna (${selected.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hakumodaali */}
        <FoodSearchModal
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          apiUrl={API_URL}
          query={query}
          onSelect={onSelectFood}
        />

        {/* Poiston vahvistus */}
        {deleteTarget && (
          <View style={styles.deleteOverlay}>
            <View style={styles.deleteCard}>
              <Text style={styles.deleteTitle}>Poistetaanko?</Text>
              <Text style={styles.deleteName}>{deleteTarget.name}</Text>

              <View style={styles.deleteActions}>
                <TouchableOpacity
                  onPress={() => setDeleteTarget(null)}
                  style={[styles.deleteBtn, { backgroundColor: "#9aa1aa" }]}
                >
                  <Text style={styles.deleteBtnText}>Peruuta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setSelected((prev) =>
                      prev.filter((x) => x.id !== deleteTarget.id)
                    );
                    setDeleteTarget(null);
                  }}
                  style={[styles.deleteBtn, { backgroundColor: "#d11" }]}
                >
                  <Text style={styles.deleteBtnText}>Poista</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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

  // footer
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

  // delete modalin tyylit
  deleteOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0f172a",
  },
  deleteName: {
    fontSize: 16,
    marginBottom: 20,
    color: "#334155",
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteBtnText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
