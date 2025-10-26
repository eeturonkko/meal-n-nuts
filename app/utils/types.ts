export type ApiRecipe = {
  recipe_id: string;
  recipe_name: string;
  recipe_description?: string;
  recipe_image?: string;
};
export type ApiResponse = {
  recipes?: {
    recipe?: ApiRecipe[];
    page_number?: number;
    max_results?: number;
    total_results?: number;
  };
};
export type ListItem = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};

export type RecipeDetail = {
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

export type FatSecretRecipe = {
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
export type RecipeGetResponseV2 =
  | { recipe?: FatSecretRecipe }
  | { recipes?: { recipe?: FatSecretRecipe | FatSecretRecipe[] } };

export type UseMealActionsProps = {
  onWaterPress: () => void;
};