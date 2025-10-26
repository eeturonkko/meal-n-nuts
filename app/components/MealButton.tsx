// app/components/MealButton.tsx
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type MealButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "default" | "special";
  disabled?: boolean;
};

export default function MealButton({
  label,
  onPress,
  variant = "default",
  disabled = false,
}: MealButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.mealCard,
        variant === "special" && styles.specialCard,
        disabled && styles.disabledCard,
      ]}
      disabled={disabled}
    >
      <Text
        style={[
          styles.mealLabel,
          variant === "special" && styles.specialLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {label} <Text style={styles.plus}>+</Text>
      </Text>
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
  specialCard: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
  },
  disabledCard: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
    opacity: 0.6,
  },
  mealLabel: {
    textAlign: "center",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },
  specialLabel: {
    color: "#1e40af",
  },
  disabledLabel: {
    color: "#9ca3af",
  },
  plus: {
    color: "#94a3b8",
    fontWeight: "800",
  },
});
