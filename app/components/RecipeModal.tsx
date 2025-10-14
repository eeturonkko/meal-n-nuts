import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../utils/constants";
import type { RecipeDetail } from "../utils/types";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  detail: RecipeDetail | null;
  loading: boolean;
  error: string | null;
  canFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void | Promise<void>;
};

export default function RecipeModal({
  visible,
  onClose,
  title,
  detail,
  loading,
  error,
  canFavorite = false,
  isFavorite = false,
  onToggleFavorite,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={COLORS.white} />
            </Pressable>
          </View>

          {loading ? (
            <View style={[styles.center, { paddingVertical: 24 }]}>
              <ActivityIndicator />
              <Text style={styles.dim}>Ladataan reseptiä…</Text>
            </View>
          ) : error ? (
            <View style={[styles.center, { paddingVertical: 24 }]}>
              <Text style={styles.dim}>{error}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              {detail?.image ? (
                <Image
                  source={{ uri: detail.image }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.modalImage, styles.modalImagePlaceholder]}>
                  <Text style={styles.dim}>No image</Text>
                </View>
              )}

              {!!detail?.description && (
                <Text style={styles.modalDesc}>{detail.description}</Text>
              )}

              {detail && detail.ingredients.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ainekset</Text>
                  {detail.ingredients.map((ing, i) => (
                    <View key={`${ing}-${i}`} style={styles.ingRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.ingText}>{ing}</Text>
                    </View>
                  ))}
                </View>
              )}

              {canFavorite && (
                <TouchableOpacity
                  onPress={onToggleFavorite}
                  style={[
                    styles.favBigBtn,
                    isFavorite && styles.favBigBtnActive,
                  ]}
                  activeOpacity={0.9}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={18}
                    color={COLORS.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.favBigText}>
                    {isFavorite ? "Poista suosikeista" : "Lisää suosikkeihin"}
                  </Text>
                </TouchableOpacity>
              )}

              {detail && detail.directions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ohjeet</Text>
                  {detail.directions.map((d, i) => (
                    <View key={`${d.number || i}-${i}`} style={styles.dirRow}>
                      <View style={styles.dirBadge}>
                        <Text style={styles.dirBadgeText}>
                          {d.number || i + 1}
                        </Text>
                      </View>
                      <Text style={styles.dirText}>{d.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#0009",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "88%",
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    marginBottom: 12,
  },
  modalImagePlaceholder: { alignItems: "center", justifyContent: "center" },
  modalDesc: { color: COLORS.white, lineHeight: 20, marginBottom: 12 },
  section: { marginTop: 8 },
  sectionTitle: {
    color: COLORS.white,
    fontWeight: "800",
    marginBottom: 8,
    fontSize: 16,
  },
  nutGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nutItem: {
    minWidth: "47%",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  nutLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  nutValue: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
  ingRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  ingText: { color: COLORS.white },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagText: { color: COLORS.white, fontWeight: "700" },
  favBigBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  favBigBtnActive: { backgroundColor: COLORS.primaryDark },
  favBigText: { color: COLORS.white, fontWeight: "700" },
  dirRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  dirBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  dirBadgeText: { color: COLORS.white, fontWeight: "800" },
  dirText: { color: COLORS.white, flex: 1, lineHeight: 20 },
  center: { alignItems: "center", justifyContent: "center" },
  dim: { color: COLORS.muted, marginTop: 8 },
});
