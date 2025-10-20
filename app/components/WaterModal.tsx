import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../utils/constants";
import { NutrientProgressCircle } from "./NutrientProgressCircle";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave?: (total: number) => void;
  dailyGoalMl?: number;
  startAmountMl?: number;
};


export default function WaterModal({
  visible,
  onClose,
  onSave,
  dailyGoalMl = 2500,
  startAmountMl = 0,
  }: Props) {
  const [total, setTotal] = React.useState(startAmountMl);
  const [custom, setCustom] = React.useState("");

  const adjustWater = (amount: number) => {
    setTotal((prev) => Math.max(0, prev + amount)); 
  };

  const handleCustomAdd = () => {
    const n = Number(custom.replace(",", "."));
    if (!isNaN(n) && n > 0) {
      setTotal((prev) => prev + n);
      setCustom("");
    }
  };

  const handleSave = () => {
    onSave?.(total);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Veden määrä</Text>

          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <NutrientProgressCircle
              progressValue={total}
              goalValue={dailyGoalMl}
              label={`${total} / ${dailyGoalMl} ml`}
              size={140}
          />
        </View>
          <Text style={styles.amount}>{total} ml</Text>

          <View style={styles.row}>
            {[50, 100, 500].map((v) => (
              <TouchableOpacity key={`plus${v}`} style={styles.plusBtn} onPress={() => adjustWater(v)}>
                <Text style={styles.plusText}>+{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            {[50, 100, 500].map((v) => (
              <TouchableOpacity key={`minus${v}`} style={styles.minusBtn} onPress={() => adjustWater(-v)}>
                <Text style={styles.minusText}>-{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customRow}>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              placeholder="muu määrä (ml)"
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity style={styles.addCustom} onPress={handleCustomAdd}>
              <Text style={styles.addText}>Lisää</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.cancelText}>Sulje</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.save]} onPress={handleSave}>
              <Text style={styles.saveText}>Tallenna</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "90%",
    maxWidth: 480,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8, color: COLORS.primary },
  amount: { fontSize: 18, fontWeight: "800", marginBottom: 12, color: "#0f172a" },
  row: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginVertical: 4 },
  plusBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
  },
  plusText: { textAlign: "center", color: COLORS.white, fontWeight: "800", fontSize: 16 },
  minusBtn: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
  },
  minusText: { textAlign: "center", color: "#0f172a", fontWeight: "800", fontSize: 16 },
  customRow: { flexDirection: "row", width: "100%", marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  addCustom: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addText: { color: "#fff", fontWeight: "800" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, width: "100%" },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  cancel: { backgroundColor: "#e5e7eb" },
  save: { backgroundColor: COLORS.primary },
  cancelText: { color: "#0f172a", fontWeight: "700" },
  saveText: { color: "#fff", fontWeight: "800" },
});
