// app/components/MealButton.tsx
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type MealButtonProps = {
  label: string;
  onPress: () => void;
};

export default function MealButton({ label, onPress }: MealButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.mealCard}>
      <Text style={styles.mealLabel}>{label} <Text style={styles.plus}>+</Text></Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    flexBasis: "31%",  
    maxWidth: "31%",
    height: 92,
    marginBottom: 12,   
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  mealLabel: {
    textAlign: "center",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },
  plus: { color: "#94a3b8", fontWeight: "800" },
});
