import "dotenv/config";
import express from "express";

const router = express.Router();

let tokenCache = { accessToken: "", expiresAt: 0 };

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.accessToken && tokenCache.expiresAt - 60 > now) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.FATSECRET_CLIENT_ID || "";
  const secretId = process.env.FATSECRET_SECRET_ID || "";
  if (!clientId || !secretId) {
    throw new Error("[env] FATSECRET_CLIENT_ID / FATSECRET_SECRET_ID missing");
  }

  const scope = (process.env.FATSECRET_SCOPES || "basic barcode").trim();

  const resp = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${secretId}`, "utf8").toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope,
    }),
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

const toGTIN13 = (raw = "") => {
  const digits = raw.replace(/\D/g, "");
  return digits.length > 13 ? digits.slice(-13) : digits.padStart(13, "0");
};

function isValidGTIN13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  const nums = code.split("").map(Number);
  const check = nums.pop()!;
  const sum = nums.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 1 : 3), 0);
  const calc = (10 - (sum % 10)) % 10;
  return calc === check;
}

async function fetchFoodIdByBarcode(
  barcode: string,
  region?: string
): Promise<string | null> {
  const token = await getAccessToken();

  const url = new URL(
    "https://platform.fatsecret.com/rest/food/barcode/find-by-id/v1"
  );
  url.searchParams.set("barcode", barcode);
  url.searchParams.set("format", "json");
  if (region) url.searchParams.set("region", region);

  const u = url.toString();
  console.log("[fatsecret] calling:", u);

  const resp = await fetch(u, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.warn("[fatsecret] http error", resp.status, data);
    return null;
  }

  const id = data?.food_id?.value ?? data?.food_id ?? null;
  if (!id) console.log("[fatsecret] no mapping for barcode. raw:", data);
  return id ? String(id) : null;
}

async function resolveFoodId(gtin13: string): Promise<string | null> {
  const region = process.env.FATSECRET_REGION || "FI";

  const idRegion = await fetchFoodIdByBarcode(gtin13, region);
  if (idRegion) {
    console.log(
      `[fatsecret] found via barcode (region=${region}): ${idRegion}`
    );
    return idRegion;
  }

  console.log(`[fatsecret] region=${region} not found → retry without region`);
  const idGlobal = await fetchFoodIdByBarcode(gtin13);
  if (idGlobal) {
    console.log("[fatsecret] found via barcode (global):", idGlobal);
    return idGlobal;
  }

  return null;
}

router.get("/:barcode", async (req, res) => {
  try {
    const gtin13 = toGTIN13(req.params.barcode || "");
    if (!isValidGTIN13(gtin13)) {
      console.warn("[fatsecret] WARNING: invalid GTIN-13:", gtin13);
    }

    const foodId = await resolveFoodId(gtin13);

    console.log(
      `[fatsecret] barcode ${gtin13} → food_id:`,
      foodId || "NOT FOUND"
    );

    if (!foodId) return res.status(404).json({ error: "Food not found" });
    res.json({ food_id: foodId });
  } catch (err: any) {
    console.error("[fatsecret] error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch food_id", message: err.message });
  }
});

export default router;
