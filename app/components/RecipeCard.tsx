import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import COLORS from "../utils/constants";

type RecipeCardProps = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  onAddToFavorite?: () => void;
  onPress?: () => void;
};

export default function RecipeCard({
  name,
  description,
  image,
  onAddToFavorite,
  onPress,
}: RecipeCardProps) {
  const imgSrc = image
    ? { uri: image }
    : { uri: "https://via.placeholder.com/120x120?text=Recipe" };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.card}>
        <Image source={imgSrc} style={styles.thumb} resizeMode="cover" />
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={2}>
            {name}
          </Text>
          {!!description && (
            <Text style={styles.desc} numberOfLines={3}>
              {description}
            </Text>
          )}
          {!!onAddToFavorite && (
            <TouchableOpacity
              onPress={onAddToFavorite}
              style={styles.favBtn}
              activeOpacity={0.9}
            >
              <Text style={styles.favText}>Add to favorites</Text>
            </TouchableOpacity>
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
    width: 96,
    height: 96,
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
  },
  meta: { flex: 1, minHeight: 96, justifyContent: "space-between" },
  title: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  desc: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  favBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  favText: { color: COLORS.white, fontWeight: "700" },
});
