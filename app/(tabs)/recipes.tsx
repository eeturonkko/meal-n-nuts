import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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
import RecipeModal from "../components/RecipeModal";
import COLORS from "../utils/constants";
import { useFavorites, useRecipeDetail, useRecipeSearch } from "../utils/hooks";
import type { ListItem } from "../utils/types";

const DEFAULT_API = "http://localhost:4000";
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:4000" : DEFAULT_API);

export default function Recipes() {
  const { user, isLoaded } = useUser();
  const userId = isLoaded ? user?.id ?? "" : "";
  const [tab, setTab] = useState<"search" | "favorites">("search");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ListItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { items, page, loading, canLoadMore, fetchPage, reset } =
    useRecipeSearch(API_URL);
  const { detail, detailLoading, detailError, fetchDetail } =
    useRecipeDetail(API_URL);
  const {
    favItems,
    favLoading,
    favoriteIds,
    refreshFavorites,
    addFavorite,
    removeFavorite,
  } = useFavorites(API_URL, userId);

  useEffect(() => {
    if (tab === "favorites") refreshFavorites();
  }, [tab, refreshFavorites]);

  const onSearch = useCallback(() => {
    Keyboard.dismiss();
    if (!query.trim()) return reset();
    fetchPage(query.trim(), 0);
  }, [query, fetchPage, reset]);

  const loadMore = useCallback(() => {
    if (loading || !canLoadMore) return;
    fetchPage(query.trim(), page + 1);
  }, [loading, canLoadMore, fetchPage, page, query]);

  const openModal = useCallback(
    (item: ListItem) => {
      setSelected(item);
      setModalVisible(true);
      fetchDetail(item.id);
    },
    [fetchDetail]
  );

  const closeModal = useCallback(() => setModalVisible(false), []);

  const data = tab === "favorites" ? favItems : items;

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => (
      <RecipeCard
        id={item.id}
        name={item.name}
        description={item.description}
        image={item.image}
        onAddToFavorite={
          tab === "favorites" ? undefined : () => addFavorite(item)
        }
        onPress={() => openModal(item)}
      />
    ),
    [openModal, addFavorite, tab]
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

      <View style={{ flex: 1, width: "100%" }}>
        {tab === "search" && (
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
        )}

        {(tab === "search" && loading && page === 0) ||
        (tab === "favorites" && favLoading) ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.dim}>
              {tab === "search" ? "Haetaan..." : "Ladataan suosikkeja..."}
            </Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.dim}>
              {tab === "search" ? "Ei tuloksia" : "Ei suosikkeja"}
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listPad}
            data={data}
            keyExtractor={(it) => it.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            onEndReachedThreshold={0.3}
            onEndReached={tab === "search" ? loadMore : undefined}
            ListFooterComponent={
              tab === "search" && loading && page > 0 ? (
                <View style={styles.footerLoad}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
          />
        )}
      </View>

      <RecipeModal
        visible={modalVisible}
        onClose={closeModal}
        title={selected?.name ?? "Resepti"}
        detail={detail}
        loading={detailLoading}
        error={detailError}
        canFavorite={!!selected && userId.length > 0}
        isFavorite={!!selected && favoriteIds.has(selected.id)}
        onToggleFavorite={async () => {
          if (!selected) return;
          if (favoriteIds.has(selected.id)) await removeFavorite(selected.id);
          else await addFavorite(selected);
        }}
      />
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
