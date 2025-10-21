import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../utils/constants";
import UserModal from "./UserModal";

type Props = {
  value?: string;
  onChangeText?: (t: string) => void;
  onSearchPress?: () => void;
};

export default function TopSearchBar({
  value,
  onChangeText,
  onSearchPress,
}: Props) {
  const [userModalVisible, setUserModalVisible] = useState(false);

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.row}>
          {/* User icon button */}
          <TouchableOpacity
            onPress={() => setUserModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-circle-outline"
              size={34}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <View style={styles.inputWrap}>
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder="Hae resepti / ruoka"
              placeholderTextColor="#7aa38f"
              returnKeyType="search"
              onSubmitEditing={onSearchPress}
              style={styles.input}
            />
            <TouchableOpacity onPress={onSearchPress} style={styles.iconRight}>
              <Ionicons name="search" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <UserModal
        visible={userModalVisible}
        onClose={() => setUserModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  inputWrap: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 38,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    position: "relative",
  },
  input: { color: "#0f172a", fontSize: 15 },
  iconLeft: { position: "absolute", left: 12, top: 10, color: "#7aa38f" },
  iconRight: { position: "absolute", right: 10, top: 8 },
});
