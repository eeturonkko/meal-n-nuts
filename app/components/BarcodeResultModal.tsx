import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../utils/constants";

export type BarcodeServing = {
  id: string;
  desc: string;
  calories?: string;
  protein?: string;
  carbohydrate?: string;
  fat?: string;
};

export type BarcodeFood = {
  id: string;
  name: string;
  brand?: string;
  type: string;
  url?: string;
  servings: BarcodeServing[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  food: BarcodeFood | null;
  error?: string | null;
  onScanAgain?: () => void;
};

export default function BarcodeResultModal({
  visible,
  onClose,
  food,
  error,
  onScanAgain,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Scan result</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={COLORS.white} />
            </Pressable>
          </View>

          {error ? (
            <View style={styles.center}>
              <Text style={styles.dim}>{error}</Text>
            </View>
          ) : !food ? (
            <View style={styles.center}>
              <Text style={styles.dim}>No data</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
              <Text style={styles.foodName}>{food.name}</Text>

              <View style={styles.row}>
                {!!food.brand && <Text style={styles.sub}>{food.brand}</Text>}
              </View>

              {food.servings.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.sectionTitle}>Servings</Text>
                  {food.servings.slice(0, 5).map((s) => (
                    <View key={s.id} style={styles.serving}>
                      <Text style={styles.servingDesc}>{s.desc}</Text>
                      <Text style={styles.servingMacros}>
                        {!!s.calories && `${s.calories} kcal`}{" "}
                        {!!s.protein && ` • P ${s.protein}g`}{" "}
                        {!!s.carbohydrate && ` • C ${s.carbohydrate}g`}{" "}
                        {!!s.fat && ` • F ${s.fat}g`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.footerActions}>
            {!!onScanAgain && (
              <TouchableOpacity
                onPress={onScanAgain}
                style={[styles.btn, styles.hollow]}
              >
                <Text style={styles.btnText}>Scan again</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.btn}>
              <Text style={styles.btnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#0009", justifyContent: "flex-end" },
  card: {
    maxHeight: "88%",
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  foodName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
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
  sectionTitle: {
    color: COLORS.white,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 2,
  },
  serving: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  servingDesc: { color: COLORS.white, fontWeight: "700" },
  servingMacros: { color: COLORS.muted, marginTop: 2 },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  dim: { color: COLORS.muted },
  footerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  hollow: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  btnText: { color: COLORS.white, fontWeight: "700" },
});
