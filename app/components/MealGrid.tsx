import React from "react";
import { StyleSheet, View } from "react-native";
import MealButton from "./MealButton";

export type MealConfig = {
  id: string;
  label: string;
  route?: string;
  action?: "modal" | "navigation";
  variant?: "default" | "special";
};

type MealGridProps = {
  meals: readonly MealConfig[];
  onMealPress: (mealId: string) => void;
};

export default function MealGrid({ meals, onMealPress }: MealGridProps) {
  return (
    <View style={styles.mealsGrid}>
      {meals.map((meal) => (
        <MealButton
          key={meal.id}
          label={meal.label}
          variant={meal.variant}
          onPress={() => onMealPress(meal.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  mealsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
