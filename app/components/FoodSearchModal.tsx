import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../utils/constants";

type FoodApiItem = {
  food_id: string;
  food_name: string;
  brand_name?: string;
  servings?: {
    serving:
      | {
          serving_id: string;
          serving_description: string;
          metric_serving_amount?: string;
          metric_serving_unit?: string;
          calories?: string;
          protein?: string;
          carbohydrate?: string;
          fat?: string;
          is_default?: string;
        }[]
      | {
          serving_id: string;
          serving_description: string;
          metric_serving_amount?: string;
          metric_serving_unit?: string;
          calories?: string;
          protein?: string;
          carbohydrate?: string;
          fat?: string;
          is_default?: string;
        };
  };
};

type Props = {
  visible: boolean;
  onClose: () => void;
  apiUrl: string;
  query: string;
  onSelect: (item: {
    id: string;
    name: string;
    serving?: string;
    metricAmount?: number;
    metricUnit?: "g" | "ml" | "oz";
    calories?: number;
    protein?: number;
    carbohydrate?: number;
    fat?: number;
  }) => void;
};

export default function FoodSearchModal({
  visible,
  onClose,
  apiUrl,
  query: initialQuery,
  onSelect,
}: Props) {
  const [query, setQuery] = React.useState(initialQuery);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<FoodApiItem[]>([]);

  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const search = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = `${apiUrl}/api/food/search?query=${encodeURIComponent(
        query || ""
      )}&page=0&max_results=20&flag_default_serving=1`;
      const resp = await fetch(url);
      const json = await resp.json();
      const arr =
        json?.foods_search?.results?.food ||
        json?.foods_search?.food ||
        json?.results?.food ||
        [];
      setItems(arr);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, query]);

  React.useEffect(() => {
    if (!visible) return;
    if ((query || "").trim().length === 0) return;
    search();
  }, [visible, search]);

  const renderItem = ({ item }: { item: FoodApiItem }) => {
    const servings = Array.isArray(item.servings?.serving)
      ? item.servings?.serving
      : item.servings?.serving
      ? [item.servings?.serving]
      : [];
    const best =
      servings.find((s) => String(s.is_default) === "1") ||
      servings[0] ||
      undefined;
    const servingDesc = best?.serving_description || "";
    const metricAmount = Number(best?.metric_serving_amount || 0) || undefined;
    const metricUnit = (best?.metric_serving_unit as any) || undefined;
    const calories = Number(best?.calories || 0) || undefined;
    const protein = Number(best?.protein || 0) || undefined;
    const carbohydrate = Number(best?.carbohydrate || 0) || undefined;
    const fat = Number(best?.fat || 0) || undefined;
    return (
      <TouchableOpacity
        onPress={() =>
          onSelect({
            id: item.food_id,
            name: item.brand_name
              ? `${item.brand_name} ${item.food_name}`
              : item.food_name,
            serving: servingDesc,
            metricAmount,
            metricUnit,
            calories,
            protein,
            carbohydrate,
            fat,
          })
        }
        activeOpacity={0.85}
        style={styles.card}
      >
        <View style={styles.dot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {item.brand_name
              ? `${item.brand_name} ${item.food_name}`
              : item.food_name}
          </Text>
          {!!servingDesc && (
            <Text style={styles.serving} numberOfLines={1}>
              {servingDesc}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.cardWrap}>
          <View style={styles.header}>
            <Text style={styles.title}>Hae ruoka</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={COLORS.white} />
            </Pressable>
          </View>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color="#7aa38f" />
            <TextInput
              style={styles.input}
              placeholder="Hae ruokaa"
              placeholderTextColor="#7aa38f"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={search}
            />
            <TouchableOpacity onPress={search} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Hae</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.dim}>Ladataan…</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.dim}>Ei tuloksia</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(it) => it.food_id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#0009", justifyContent: "flex-end" },
  cardWrap: {
    maxHeight: "88%",
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  searchRow: {
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { flex: 1, color: "#0f172a", paddingVertical: 6 },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchBtnText: { color: COLORS.white, fontWeight: "700" },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  dim: { color: COLORS.muted, marginTop: 6 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  name: { color: COLORS.white, fontWeight: "800" },
  serving: { color: COLORS.muted, marginTop: 2, fontSize: 12 },
});
