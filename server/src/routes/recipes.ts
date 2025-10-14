import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { db } from "../db.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const router = express.Router();

let tokenCache = { accessToken: "", expiresAt: 0 };

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.accessToken && tokenCache.expiresAt - 60 > now)
    return tokenCache.accessToken;
  const CLIENT_ID = process.env.FATSECRET_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.FATSECRET_SECRET_ID || "";
  if (!CLIENT_ID || !CLIENT_SECRET)
    throw new Error(
      "[fatsecret] Missing FATSECRET_CLIENT_ID or FATSECRET_SECRET_ID"
    );
  const resp = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`, "utf8").toString("base64"),
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`[fatsecret] token error: ${text}`);
  }
  const json = await resp.json();
  tokenCache.accessToken = json.access_token;
  tokenCache.expiresAt = now + (json.expires_in || 3600);
  return tokenCache.accessToken;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const yes = (v: unknown) =>
  typeof v === "string"
    ? ["1", "true", "yes", "on"].includes(v.toLowerCase())
    : !!v;

const SORT_VALUES = new Set([
  "newest",
  "oldest",
  "caloriesPerServingAscending",
  "caloriesPerServingDescending",
]);

async function callRecipesSearch(
  token: string,
  params: {
    query: string;
    page: number;
    max: number;
    mustHaveImages: boolean;
    sortBy: string;
  }
) {
  const { query, page, max, mustHaveImages, sortBy } = params;
  const url = new URL("https://platform.fatsecret.com/rest/recipes/search/v3");
  url.searchParams.set("format", "json");
  url.searchParams.set("page_number", String(page));
  url.searchParams.set("max_results", String(max));
  url.searchParams.set("sort_by", sortBy);
  if (query) url.searchParams.set("search_expression", query);
  if (mustHaveImages) url.searchParams.set("must_have_images", "true");
  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  let data: any = {};
  try {
    data = await resp.json();
  } catch {}
  return { resp, data };
}

router.get("/search", async (req, res) => {
  try {
    const token = await getAccessToken();
    const query = String(req.query.query || "").trim();
    const page = clamp(
      parseInt(String(req.query.page ?? "0"), 10) || 0,
      0,
      9999
    );
    const max = clamp(
      parseInt(String(req.query.max_results ?? "20"), 10) || 20,
      1,
      50
    );
    const mustHaveImages = yes(req.query.must_have_images ?? true);
    const sortRaw = String(req.query.sort_by || "newest");
    const sort_by = SORT_VALUES.has(sortRaw) ? sortRaw : "newest";
    let { resp, data } = await callRecipesSearch(token, {
      query,
      page,
      max,
      mustHaveImages,
      sortBy: sort_by,
    });
    if (!resp.ok) {
      const errCode = data?.error?.code ?? data?.code ?? resp.status;
      const message = data?.error?.message ?? data?.message ?? "Unknown error";
      return res
        .status(resp.status)
        .json({ code: errCode, message, raw: data });
    }
    return res.json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to search recipes", message: err.message });
  }
});

const insertFavorite = db.prepare(
  "INSERT OR IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)"
);
const deleteFavorite = db.prepare(
  "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?"
);
const listFavorites = db.prepare(
  "SELECT recipe_id AS id, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC"
);
const isFavoriteStmt = db.prepare(
  "SELECT 1 FROM favorites WHERE user_id = ? AND recipe_id = ? LIMIT 1"
);

router.post("/favorite", (req, res) => {
  try {
    const user_id = String(req.body.user_id || "").trim();
    const recipe_id = String(req.body.recipe_id || "").trim();
    if (!user_id || !recipe_id)
      return res.status(400).json({ error: "Missing user_id or recipe_id" });
    const result = insertFavorite.run(user_id, recipe_id);
    return res.json({ ok: true, inserted: result.changes > 0 });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to add favorite", message: err.message });
  }
});

router.delete("/favorite", (req, res) => {
  try {
    const user_id = String(req.query.user_id || req.body?.user_id || "").trim();
    const recipe_id = String(
      req.query.recipe_id || req.body?.recipe_id || ""
    ).trim();
    if (!user_id || !recipe_id)
      return res.status(400).json({ error: "Missing user_id or recipe_id" });
    const result = deleteFavorite.run(user_id, recipe_id);
    return res.json({ ok: true, deleted: result.changes > 0 });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to remove favorite", message: err.message });
  }
});

function pickFirstRecipeServer(data: any): any | null {
  if (data?.recipe && typeof data.recipe === "object") return data.recipe;
  const rr = data?.recipes?.recipe;
  if (!rr) return null;
  return Array.isArray(rr) ? rr[0] ?? null : rr;
}
function pickImageServer(r: any): string | undefined {
  if (r?.recipe_image) return r.recipe_image;
  const v = r?.recipe_images?.recipe_image;
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

async function callRecipeGetV2(token: string, recipeId: string) {
  const url = new URL("https://platform.fatsecret.com/rest/recipe/v2");
  url.searchParams.set("format", "json");
  url.searchParams.set("recipe_id", recipeId);
  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const raw = await resp.text();
  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {}
  return { resp, data, raw };
}

router.get("/favorites", async (req, res) => {
  try {
    const user_id = String(req.query.user_id || "").trim();
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });
    const expand = yes(req.query.expand ?? "1");
    const rows = listFavorites.all(user_id) as {
      id: string;
      created_at: string;
    }[];
    if (!expand) return res.json({ favorites: rows });

    const createdAt = new Map(rows.map((r) => [String(r.id), r.created_at]));
    const ids = rows.map((r) => String(r.id));
    const token = await getAccessToken();
    const details = await Promise.all(
      ids.map(async (id) => {
        try {
          const { resp, data } = await callRecipeGetV2(token, id);
          if (!resp.ok) return null;
          const r = pickFirstRecipeServer(data);
          if (!r) return null;
          return {
            id,
            name: r.recipe_name,
            description: r.recipe_description || "",
            image: pickImageServer(r),
            created_at: createdAt.get(id) || null,
          };
        } catch {
          return null;
        }
      })
    );
    const favorites = details.filter(Boolean);
    return res.json({ favorites });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to list favorites", message: err.message });
  }
});

router.get("/favorite/check", (req, res) => {
  try {
    const user_id = String(req.query.user_id || "").trim();
    const recipe_id = String(req.query.recipe_id || "").trim();
    if (!user_id || !recipe_id)
      return res.status(400).json({ error: "Missing user_id or recipe_id" });
    const row = isFavoriteStmt.get(user_id, recipe_id);
    return res.json({ isFavorite: !!row });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to check favorite", message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id)
      return res.status(400).json({ code: 400, message: "Missing recipe id" });
    const token = await getAccessToken();
    const { resp, data, raw } = await callRecipeGetV2(token, id);
    if (!resp.ok) {
      const errCode =
        (data as any)?.error?.code ?? (data as any)?.code ?? resp.status;
      const message =
        (data as any)?.error?.message ??
        (data as any)?.message ??
        raw?.slice(0, 300) ??
        "Unknown error";
      return res
        .status(resp.status)
        .json({ code: errCode, message, raw: data ?? raw });
    }
    return res.json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to fetch recipe", message: err.message });
  }
});

export default router;
