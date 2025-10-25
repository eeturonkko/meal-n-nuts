import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import COLORS from "../utils/constants";
import FoodRow, { FoodListItem } from "./FoodRow";

type Props = {
  visible: boolean;
  onClose: () => void;
  apiUrl: string;
  query: string;
  onSelect?: (item: FoodListItem) => void;
};

type FoodSearchResponse = {
  foods_search?: {
    max_results?: string | number;
    total_results?: string | number;
    page_number?: string | number;
    results?: { food?: any[] | any };
  };
};

function pickBestFoodImage(f: any): string | undefined {
  const imgs = f?.food_images?.food_image;
  const arr = Array.isArray(imgs) ? imgs : imgs ? [imgs] : [];
  if (arr.length === 0) return undefined;

  const byUrl = (u?: string) => (typeof u === "string" ? u : undefined);
  const get = (s: any) => byUrl(s?.image_url);

  const exact400 = arr.find((s: any) => get(s)?.includes("400x400"))?.image_url;
  if (exact400) return exact400;

  const approx = arr.find((s: any) =>
    /(\b384x384\b|\b360x360\b|\b512x512\b)/.test(get(s) || "")
  )?.image_url;
  if (approx) return approx;

  return get(arr[0]);
}

function normalizeFoods(resp: FoodSearchResponse): {
  items: FoodListItem[];
  total: number;
} {
  const results = resp?.foods_search?.results?.food;
  const list: any[] = Array.isArray(results)
    ? results
    : results
    ? [results]
    : [];
  const items: FoodListItem[] = list.map((f) => {
    let image = pickBestFoodImage(f);
    const imgs = f?.food_images?.food_image;
    if (imgs) {
      if (Array.isArray(imgs) && imgs.length > 0) image = imgs[0]?.image_url;
      else if (imgs?.image_url) image = imgs.image_url;
    }
    const servingsArr = f?.servings?.serving;
    let servingDesc: string | undefined;
    let calories: string | undefined;
    if (Array.isArray(servingsArr)) {
      const def =
        servingsArr.find((s) => s.is_default === "1") || servingsArr[0];
      if (def) {
        servingDesc = def.serving_description || undefined;
        calories = def.calories || undefined;
      }
    } else if (servingsArr) {
      servingDesc = servingsArr.serving_description || undefined;
      calories = servingsArr.calories || undefined;
    }
    return {
      id: String(f.food_id),
      name: String(f.food_name || ""),
      brand: f.food_type === "Brand" ? String(f.brand_name || "") : undefined,
      type: f.food_type,
      image,
      calories,
      serving: servingDesc,
    };
  });
  const total = Number(resp?.foods_search?.total_results ?? 0);
  return { items, total };
}

export default function FoodSearchModal({
  visible,
  onClose,
  apiUrl,
  query,
  onSelect
}: Props) {
  const [items, setItems] = useState<FoodListItem[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const canLoadMore = useMemo(
    () => (total == null ? false : items.length < total),
    [items.length, total]
  );

  const fetchPage = useCallback(
    async (q: string, p: number) => {
      if (!q.trim()) {
        setItems([]);
        setTotal(0);
        setPage(0);
        return;
      }
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          query: q,
          page: String(p),
          max_results: "20",
          include_food_images: "1",
          flag_default_serving: "1",
          nocache: String(Date.now()),
        });
        const resp = await fetch(`${apiUrl}/api/food/search?${qs.toString()}`, {
          headers: { Accept: "application/json" },
        });
        const json = (await resp.json()) as FoodSearchResponse;
        const { items: next, total } = normalizeFoods(json);
        setItems((prev) => (p === 0 ? next : [...prev, ...next]));
        setTotal(total);
        setPage(p);
      } catch {
        if (p === 0) {
          setItems([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    if (visible) fetchPage(query, 0);
  }, [visible, query, fetchPage]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Hakutulokset</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={COLORS.white} />
            </Pressable>
          </View>

          {!query.trim() ? (
            <View style={styles.center}>
              <Text style={styles.dim}>Syötä hakusana</Text>
            </View>
          ) : loading && page === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.dim}>Haetaan…</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.dim}>Ei tuloksia</Text>
            </View>
          ) : (
            <FlatList
              keyboardShouldPersistTaps="handled" 
              data={items}
              keyExtractor={(it) => it.id}
              contentContainerStyle={{ paddingBottom: 12 }}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              renderItem={({ item }) => (
                <FoodRow
                  item={item}
                  onPress={() => {
                    console.log("Food tapped:", item?.name); // debuggaus
                    onSelect?.(item);
                    onClose();
                  }}
                />
              )}
              onEndReachedThreshold={0.3}
              onEndReached={() => {
                if (!loading && canLoadMore) fetchPage(query, page + 1);
              }}
              ListFooterComponent={
                loading && page > 0 ? (
                  <View style={{ paddingVertical: 14 }}>
                    <ActivityIndicator />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#0009",
    justifyContent: "flex-end",
  },
  modalCard: {
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
  center: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dim: { color: COLORS.muted, marginTop: 8 },
});
