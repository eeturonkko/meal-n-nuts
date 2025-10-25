import dotenv from "dotenv";
import express from "express";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const router = express.Router();

type TokenEntry = { token: string; expiresAt: number };
const tokenCache: Record<string, TokenEntry> = {};

async function getAccessToken(scopes: string[] = ["premier"]): Promise<string> {
  const key = scopes.slice().sort().join(" ");
  const now = Math.floor(Date.now() / 1000);

  const cached = tokenCache[key];
  if (cached && cached.expiresAt - 60 > now) return cached.token;

  const CLIENT_ID = process.env.FATSECRET_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.FATSECRET_SECRET_ID || "";
  if (!CLIENT_ID || !CLIENT_SECRET)
    throw new Error(
      "[fatsecret] Missing FATSECRET_CLIENT_ID or FATSECRET_SECRET_ID"
    );

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    ...(key ? { scope: key } : {}),
  });

  const resp = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`, "utf8").toString("base64"),
    },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`[fatsecret] token error: ${text}`);
  }

  const json = (await resp.json()) as {
    access_token: string;
    expires_in?: number;
  };
  tokenCache[key] = {
    token: json.access_token,
    expiresAt: now + (json.expires_in || 3600),
  };
  return tokenCache[key].token;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const yes = (v: unknown) =>
  typeof v === "string"
    ? ["1", "true", "yes", "on"].includes(v.toLowerCase())
    : !!v;

async function callFoodsSearch(
  token: string,
  params: {
    query: string;
    page: number;
    max: number;
    flagDefaultServing: boolean;
    region?: string;
    language?: string;
  }
) {
  const { query, page, max, flagDefaultServing, region, language } = params;
  const url = new URL("https://platform.fatsecret.com/rest/foods/search/v4");
  url.searchParams.set("format", "json");
  url.searchParams.set("page_number", String(page));
  url.searchParams.set("max_results", String(max));
  if (query) url.searchParams.set("search_expression", query);
  if (flagDefaultServing) url.searchParams.set("flag_default_serving", "true");
  if (region) url.searchParams.set("region", region);
  if (region && language) url.searchParams.set("language", language);
  url.searchParams.set("_", String(Date.now()));

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
    },
  });

  let data: any = {};
  try {
    data = await resp.json();
  } catch {}
  return { resp, data };
}

router.get("/search", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, max-age=0");

    const token = await getAccessToken(["premier"]);
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
    const flagDefault = yes(req.query.flag_default_serving ?? "1");
    const region =
      typeof req.query.region === "string" ? req.query.region : undefined;
    const language =
      typeof req.query.language === "string" ? req.query.language : undefined;

    const { resp, data } = await callFoodsSearch(token, {
      query,
      page,
      max,
      flagDefaultServing: flagDefault,
      region,
      language,
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
      .json({ error: "Failed to search foods", message: err.message });
  }
});

async function callBarcodeFind(
  token: string,
  params: {
    barcode: string;
    includeSubCats: boolean;
    includeFoodAttrs: boolean;
    flagDefaultServing: boolean;
    region?: string;
    language?: string;
  }
) {
  const {
    barcode,
    includeSubCats,
    includeFoodAttrs,
    flagDefaultServing,
    region,
    language,
  } = params;

  const url = new URL(
    "https://platform.fatsecret.com/rest/food/barcode/find-by-id/v2"
  );
  url.searchParams.set("format", "json");
  url.searchParams.set("barcode", barcode);
  if (includeSubCats) url.searchParams.set("include_sub_categories", "true");
  if (includeFoodAttrs) url.searchParams.set("include_food_attributes", "true");
  if (flagDefaultServing) url.searchParams.set("flag_default_serving", "true");
  if (region) url.searchParams.set("region", region);
  if (region && language) url.searchParams.set("language", language);
  url.searchParams.set("_", String(Date.now()));

  const upstream = url.toString();
  console.log("[barcode.find] upstream:", upstream);

  const resp = await fetch(upstream, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
    },
  });

  const raw = await resp.text();
  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {}

  return { resp, data };
}

router.get("/:barcode", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, max-age=0");

    const barcode = String(req.params.barcode || "").replace(/\D/g, "");
    if (!barcode) {
      return res
        .status(400)
        .json({ code: 101, message: "Missing or invalid barcode" });
    }

    const token = await getAccessToken(["barcode", "premier"]);

    const includeSubCats = yes(req.query.include_sub_categories ?? "0");
    const includeFoodAttrs = yes(req.query.include_food_attributes ?? "0");
    const flagDefaultServing = yes(req.query.flag_default_serving ?? "1");
    const region =
      typeof req.query.region === "string" ? req.query.region : undefined;
    const language =
      typeof req.query.language === "string" ? req.query.language : undefined;

    const { resp, data } = await callBarcodeFind(token, {
      barcode,
      includeSubCats,
      includeFoodAttrs,
      flagDefaultServing,
      region,
      language,
    });

    if (!resp.ok) {
      const errCode = data?.error?.code ?? data?.code ?? resp.status;
      const message = data?.error?.message ?? data?.message ?? "Unknown error";
      const status = Number(errCode) === 211 ? 404 : resp.status; // 211: No food item detected
      return res.status(status).json({ code: errCode, message, raw: data });
    }

    return res.json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to find food by barcode", message: err.message });
  }
});

export default router;
