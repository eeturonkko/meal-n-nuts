import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import COLORS from "../utils/constants";

export type FoodListItem = {
  id: string;
  name: string;
  brand?: string;
  type?: string;
  image?: string;
  calories?: string;
  serving?: string;
};

type Props = {
  item: FoodListItem;
  onPress?: () => void;
};

export default function FoodRow({ item, onPress }: Props) {
  const imgSrc = item.image
    ? { uri: item.image }
    : { uri: "https://via.placeholder.com/96x96?text=Food" };

  console.log(item);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.card}>
        <Image source={imgSrc} style={styles.thumb} resizeMode="cover" />
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>

          {!!item.brand && (
            <Text style={styles.brand} numberOfLines={1}>
              {item.brand}
            </Text>
          )}
          {(item.serving || item.calories) && (
            <Text style={styles.sub} numberOfLines={1}>
              {item.serving ? item.serving : ""}{" "}
              {item.calories ? `• ${item.calories} kcal` : ""}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
  },
  meta: { flex: 1, minHeight: 72, justifyContent: "center" },
  title: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  brand: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  sub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
});
