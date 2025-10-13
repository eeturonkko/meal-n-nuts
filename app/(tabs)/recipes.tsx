import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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

type RecipeDetail = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  ingredients: string[];
  nutrition?: {
    calories?: string;
    carbohydrate?: string;
    fat?: string;
    protein?: string;
  };
  types: string[];
  directions: { number: string; text: string }[];
};

type FatSecretRecipe = {
  recipe_id: string;
  recipe_name: string;
  recipe_description?: string;
  recipe_image?: string;
  recipe_images?: { recipe_image?: string | string[] };
  ingredients?: { ingredient?: any[] };
  recipe_ingredients?: { ingredient?: any[] };
  recipe_types?: { recipe_type?: any[] };
  recipe_categories?: { recipe_category?: any[] };
  serving_sizes?: { serving?: Record<string, string> };
  recipe_nutrition?: {
    calories?: string;
    carbohydrate?: string;
    fat?: string;
    protein?: string;
  };
  directions?: { direction?: any[] };
};

type RecipeGetResponseV2 =
  | { recipe?: FatSecretRecipe }
  | { recipes?: { recipe?: FatSecretRecipe | FatSecretRecipe[] } };

function pickFirstRecipe(data: RecipeGetResponseV2): FatSecretRecipe | null {
  if ((data as any)?.recipe && typeof (data as any).recipe === "object")
    return (data as any).recipe as FatSecretRecipe;
  const rr = (data as any)?.recipes?.recipe;
  if (!rr) return null;
  if (Array.isArray(rr)) return rr[0] ?? null;
  return rr as FatSecretRecipe;
}

function pickImage(r: FatSecretRecipe): string | undefined {
  if (r.recipe_image) return r.recipe_image;
  const ri = r.recipe_images?.recipe_image;
  if (!ri) return undefined;
  if (Array.isArray(ri)) return ri[0];
  return ri;
}

function normalizeIngredients(v: any[] | undefined): string[] {
  if (!v) return [];
  return v
    .map((x) => {
      if (typeof x === "string") return x;
      if (x?.ingredient_description) return String(x.ingredient_description);
      if (x?.food_name && x?.number_of_units && x?.measurement_description)
        return `${x.number_of_units} ${x.measurement_description} ${x.food_name}`;
      return String(x?.name ?? x?.text ?? "").trim() || "";
    })
    .filter(Boolean);
}

function normalizeTypes(raw: any[] | undefined): string[] {
  if (!raw) return [];
  return raw
    .map((x) => {
      if (typeof x === "string") return x;
      if (x?.recipe_category_name) return x.recipe_category_name;
      return String(x?.name ?? x ?? "").trim();
    })
    .filter(Boolean);
}

function pickNutrition(
  r: FatSecretRecipe
):
  | { calories?: string; carbohydrate?: string; fat?: string; protein?: string }
  | undefined {
  if (r.recipe_nutrition) return r.recipe_nutrition;
  const s = r.serving_sizes?.serving;
  if (!s) return undefined;
  const { calories, carbohydrate, fat, protein } = s;
  return { calories, carbohydrate, fat, protein };
}

function pickDirections(
  r: FatSecretRecipe
): { number: string; text: string }[] {
  const arr = r.directions?.direction;
  if (!arr) return [];
  const list = Array.isArray(arr) ? arr : [arr];
  return list
    .map((d: any) => ({
      number: String(d?.direction_number ?? ""),
      text: String(d?.direction_description ?? "").trim(),
    }))
    .filter((d: any) => d.text);
}

export default function Recipes() {
  const [tab, setTab] = useState<"search" | "favorites">("search");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [selected, setSelected] = useState<ListItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

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
        { headers: { Accept: "application/json" } }
      );
      const json: ApiResponse = await resp.json();
      if (!resp.ok) throw new Error("API error");
      const { items: nextItems, total } = mapApiToItems(json);
      setItems((prev) => (p === 0 ? nextItems : [...prev, ...nextItems]));
      setTotal(total);
      setPage(p);
    } catch {
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

  const fetchDetail = useCallback(async (id: string) => {
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const url = `${API_URL}/api/recipes/${encodeURIComponent(
        id
      )}?nocache=${Date.now()}`;
      const resp = await fetch(url, {
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      });
      const raw = await resp.text();
      const ct = resp.headers.get("content-type") || "";
      if (!resp.ok)
        throw new Error(`HTTP ${resp.status}: ${raw.slice(0, 200)}`);
      if (!ct.includes("application/json"))
        throw new Error(`Non-JSON (${ct}). Body: ${raw.slice(0, 120)}`);
      const json = JSON.parse(raw) as RecipeGetResponseV2;
      const r = pickFirstRecipe(json);
      if (!r) throw new Error("Recipe not found in payload");
      const img = pickImage(r);
      const ingredientsArr =
        r.recipe_ingredients?.ingredient ?? r.ingredients?.ingredient ?? [];
      const typesArr =
        r.recipe_types?.recipe_type ??
        r.recipe_categories?.recipe_category ??
        [];
      const mapped: RecipeDetail = {
        id: String(r.recipe_id),
        name: r.recipe_name,
        description: r.recipe_description,
        image: img,
        ingredients: normalizeIngredients(ingredientsArr as any[]),
        nutrition: pickNutrition(r),
        types: normalizeTypes(typesArr as any[]),
        directions: pickDirections(r),
      };
      setDetail(mapped);
    } catch (e: any) {
      setDetailError(e?.message || "Tietojen lataus epäonnistui");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openModal = useCallback(
    (item: ListItem) => {
      setSelected(item);
      setModalVisible(true);
      fetchDetail(item.id);
    },
    [fetchDetail]
  );

  const closeModal = useCallback(() => setModalVisible(false), []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => (
      <RecipeCard
        id={item.id}
        name={item.name}
        description={item.description}
        image={item.image}
        onAddToFavorite={() => {}}
        onPress={() => openModal(item)}
      />
    ),
    [openModal]
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selected?.name ?? "Resepti"}
              </Text>
              <Pressable onPress={closeModal} hitSlop={8}>
                <Ionicons name="close" size={22} color={COLORS.white} />
              </Pressable>
            </View>

            {detailLoading ? (
              <View style={[styles.center, { paddingVertical: 24 }]}>
                <ActivityIndicator />
                <Text style={styles.dim}>Ladataan reseptiä…</Text>
              </View>
            ) : detailError ? (
              <View style={[styles.center, { paddingVertical: 24 }]}>
                <Text style={styles.dim}>{detailError}</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                {detail?.image ? (
                  <Image
                    source={{ uri: detail.image }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[styles.modalImage, styles.modalImagePlaceholder]}
                  >
                    <Text style={styles.dim}>No image</Text>
                  </View>
                )}

                {!!detail?.description && (
                  <Text style={styles.modalDesc}>{detail.description}</Text>
                )}

                {detail && detail.ingredients.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ainekset</Text>
                    {detail.ingredients.map((ing, i) => (
                      <View key={`${ing}-${i}`} style={styles.ingRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.ingText}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {detail && detail.directions.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ohjeet</Text>
                    {detail.directions.map((d, i) => (
                      <View key={`${d.number || i}-${i}`} style={styles.dirRow}>
                        <View style={styles.dirBadge}>
                          <Text style={styles.dirBadgeText}>
                            {d.number || i + 1}
                          </Text>
                        </View>
                        <Text style={styles.dirText}>{d.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    marginBottom: 12,
  },
  modalImagePlaceholder: { alignItems: "center", justifyContent: "center" },
  modalDesc: { color: COLORS.white, lineHeight: 20, marginBottom: 12 },
  section: { marginTop: 8 },
  sectionTitle: {
    color: COLORS.white,
    fontWeight: "800",
    marginBottom: 8,
    fontSize: 16,
  },
  nutGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nutItem: {
    minWidth: "47%",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  nutLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  nutValue: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
  ingRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  ingText: { color: COLORS.white },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagText: { color: COLORS.white, fontWeight: "700" },
  dirRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  dirBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  dirBadgeText: { color: COLORS.white, fontWeight: "800" },
  dirText: { color: COLORS.white, flex: 1, lineHeight: 20 },
});
