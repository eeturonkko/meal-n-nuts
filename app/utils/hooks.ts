import { useCallback, useEffect, useMemo, useState } from "react";
import {
  normalizeIngredients,
  normalizeTypes,
  pickDirections,
  pickFirstRecipe,
  pickImage,
  pickNutrition,
} from "./functions";
import type {
  ApiResponse,
  ListItem,
  RecipeDetail,
  RecipeGetResponseV2,
} from "./types";

/* -------- search -------- */
export function useRecipeSearch(API_URL: string) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const canLoadMore = useMemo(
    () => (total == null ? false : items.length < total),
    [items.length, total]
  );

  const mapApiToItems = useCallback(
    (res: ApiResponse): { items: ListItem[]; total: number } => {
      const list = res.recipes?.recipe ?? [];
      const mapped: ListItem[] = list.map((r) => ({
        id: String(r.recipe_id),
        name: r.recipe_name,
        description: r.recipe_description,
        image: r.recipe_image,
      }));
      const totalResults = Number(res.recipes?.total_results ?? 0);
      return { items: mapped, total: totalResults };
    },
    []
  );

  const fetchPage = useCallback(
    async (q: string, p: number) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          query: q,
          page: String(p),
          max_results: "20",
          nocache: String(Date.now()),
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
      } catch {
        setItems((prev) => (p === 0 ? [] : prev));
        setTotal(0);
      } finally {
        setLoading(false);
        setFirstLoadDone(true);
      }
    },
    [API_URL, mapApiToItems]
  );

  const reset = useCallback(() => {
    setItems([]);
    setTotal(0);
    setPage(0);
    setFirstLoadDone(true);
  }, []);

  return {
    items,
    page,
    total,
    loading,
    firstLoadDone,
    canLoadMore,
    fetchPage,
    reset,
  };
}

/* -------- detail -------- */
export function useRecipeDetail(API_URL: string) {
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchDetail = useCallback(
    async (id: string) => {
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
    },
    [API_URL]
  );

  return { detail, detailLoading, detailError, fetchDetail };
}

/* -------- favorites -------- */
export function useFavorites(API_URL: string, userId?: string) {
  const [favItems, setFavItems] = useState<ListItem[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const refreshFavorites = useCallback(async () => {
    if (!userId) {
      setFavItems([]);
      setFavoriteIds(new Set());
      return;
    }
    setFavLoading(true);
    try {
      const resp = await fetch(
        `${API_URL}/api/recipes/favorites?user_id=${encodeURIComponent(
          userId
        )}&expand=1`,
        { headers: { Accept: "application/json" } }
      );
      const json = await resp.json();
      const arr: ListItem[] = (json?.favorites || []).map((r: any) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        description: r.description ?? "",
        image: r.image ?? undefined,
      }));
      setFavItems(arr);
      setFavoriteIds(new Set(arr.map((x) => x.id)));
    } catch {
      setFavItems([]);
    } finally {
      setFavLoading(false);
    }
  }, [API_URL, userId]);

  const addFavorite = useCallback(
    async (item: ListItem) => {
      if (!userId) return;
      await fetch(`${API_URL}/api/recipes/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_id: userId, recipe_id: item.id }),
      });
      await refreshFavorites();
    },
    [API_URL, userId, refreshFavorites]
  );

  const removeFavorite = useCallback(
    async (recipeId: string) => {
      if (!userId) return;
      const qs = new URLSearchParams({ user_id: userId, recipe_id: recipeId });
      await fetch(`${API_URL}/api/recipes/favorite?${qs.toString()}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      await refreshFavorites();
    },
    [API_URL, userId, refreshFavorites]
  );

  useEffect(() => {
    if (userId) refreshFavorites();
  }, [userId, refreshFavorites]);

  return {
    favItems,
    favLoading,
    favoriteIds,
    refreshFavorites,
    addFavorite,
    removeFavorite,
  };
}
