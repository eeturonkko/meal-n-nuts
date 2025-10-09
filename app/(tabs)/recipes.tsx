import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCard from "../components/RecipeCard";
import COLORS from "../utils/constants";

const DEFAULT_API = "http://localhost:4000";
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:4000" : DEFAULT_API);

type ApiRecipe = {
  recipe_id: string;
  recipe_name: string;
  recipe_description?: string;
  recipe_image?: string;
};

type ApiResponse = {
  recipes?: {
    recipe?: ApiRecipe[];
    page_number?: number;
    max_results?: number;
    total_results?: number;
  };
};

type ListItem = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};

export default function Recipes() {
  const [tab, setTab] = useState<"search" | "favorites">("search");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const canLoadMore = useMemo(() => {
    if (total == null) return false;
    return items.length < total;
  }, [items.length, total]);

  const mapApiToItems = (
    res: ApiResponse
  ): { items: ListItem[]; total: number } => {
    const list = res.recipes?.recipe ?? [];
    const mapped: ListItem[] = list.map((r) => ({
      id: String(r.recipe_id),
      name: r.recipe_name,
      description: r.recipe_description,
      image: r.recipe_image,
    }));
    const totalResults = Number(res.recipes?.total_results ?? 0);
    return { items: mapped, total: totalResults };
  };

  const fetchPage = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        query: q,
        page: String(p),
        max_results: "20",
      });
      const resp = await fetch(
        `${API_URL}/api/recipes/search?${qs.toString()}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      const json: ApiResponse = await resp.json();
      if (!resp.ok) throw new Error("API error");
      const { items: nextItems, total } = mapApiToItems(json);
      setItems((prev) => (p === 0 ? nextItems : [...prev, ...nextItems]));
      setTotal(total);
      setPage(p);
    } catch (e) {
      console.warn("Fetch recipes error:", e);
      setItems((prev) => (p === 0 ? [] : prev));
      setTotal(0);
    } finally {
      setLoading(false);
      setFirstLoadDone(true);
    }
  }, []);

  const onSearch = useCallback(() => {
    Keyboard.dismiss();
    if (!query.trim()) {
      setItems([]);
      setTotal(0);
      setFirstLoadDone(true);
      return;
    }
    fetchPage(query.trim(), 0);
  }, [query, fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || !canLoadMore) return;
    fetchPage(query.trim(), page + 1);
  }, [loading, canLoadMore, fetchPage, page, query]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => (
      <RecipeCard
        id={item.id}
        name={item.name}
        description={item.description}
        image={item.image}
        onAddToFavorite={() => {}}
      />
    ),
    []
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab("search")}
          style={[styles.tabBtn, tab === "search" && styles.tabActive]}
        >
          <Text
            style={[styles.tabText, tab === "search" && styles.tabTextActive]}
          >
            Etsi reseptiä
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("favorites")}
          style={[styles.tabBtn, tab === "favorites" && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              tab === "favorites" && styles.tabTextActive,
            ]}
          >
            Suosikit
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "search" ? (
        <View style={{ flex: 1, width: "100%" }}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              placeholder="Etsi reseptiä..."
              placeholderTextColor="#888"
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={onSearch}
              clearButtonMode="while-editing"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
              <Text style={styles.searchBtnText}>Hae</Text>
            </TouchableOpacity>
          </View>

          {loading && page === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.dim}>Haetaan...</Text>
            </View>
          ) : items.length === 0 && firstLoadDone ? (
            <View style={styles.center}>
              <Text style={styles.dim}>Ei tuloksia</Text>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={styles.listPad}
              data={items}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              onEndReachedThreshold={0.3}
              onEndReached={loadMore}
              ListFooterComponent={
                loading && page > 0 ? (
                  <View style={styles.footerLoad}>
                    <ActivityIndicator />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.dim}>Favorites (coming soon)</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center" },
  tabs: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.primaryDark, fontWeight: "700" },
  tabTextActive: { color: COLORS.white },

  searchRow: {
    marginTop: 10,
    marginBottom: 8,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { flex: 1, color: COLORS.bg, paddingVertical: 6 },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchBtnText: { color: COLORS.white, fontWeight: "700" },

  listPad: { padding: 12, paddingBottom: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  dim: { color: COLORS.muted, marginTop: 8 },
  footerLoad: { paddingVertical: 16 },
});
