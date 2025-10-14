import type { FatSecretRecipe, RecipeGetResponseV2 } from "./types";

export function pickFirstRecipe(
  data: RecipeGetResponseV2
): FatSecretRecipe | null {
  if ((data as any)?.recipe && typeof (data as any).recipe === "object")
    return (data as any).recipe as FatSecretRecipe;
  const rr = (data as any)?.recipes?.recipe;
  if (!rr) return null;
  return Array.isArray(rr) ? rr[0] ?? null : (rr as FatSecretRecipe);
}
export function pickImage(r: FatSecretRecipe): string | undefined {
  if (r.recipe_image) return r.recipe_image;
  const ri = r.recipe_images?.recipe_image;
  if (!ri) return undefined;
  return Array.isArray(ri) ? ri[0] : ri;
}
export function normalizeIngredients(v: any[] | undefined): string[] {
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
export function normalizeTypes(raw: any[] | undefined): string[] {
  if (!raw) return [];
  return raw
    .map((x) => {
      if (typeof x === "string") return x;
      if (x?.recipe_category_name) return x.recipe_category_name;
      return String(x?.name ?? x ?? "").trim();
    })
    .filter(Boolean);
}
export function pickNutrition(
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
export function pickDirections(
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
    .filter((d) => d.text);
}
