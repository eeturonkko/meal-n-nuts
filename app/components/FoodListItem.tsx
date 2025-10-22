import React from "react";
import { StyleSheet, Text, View } from "react-native";
import COLORS from "../utils/constants";

type Props = {
  name: string;
  brand?: string;
  type: string;
};

export default function FoodListItem({ name, brand, type }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={2}>
        {name}
      </Text>
      <View style={styles.bottomRow}>
        {!!brand && (
          <Text style={styles.sub} numberOfLines={1}>
            {brand}
          </Text>
        )}
        <View style={styles.pill}>
          <Text style={styles.pillText}>{type}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  title: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sub: { color: COLORS.muted, fontSize: 13, marginRight: 8, flex: 1 },
  pill: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pillText: { color: COLORS.white, fontWeight: "700", fontSize: 12 },
});
