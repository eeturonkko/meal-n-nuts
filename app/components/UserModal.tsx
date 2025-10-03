import { useUser } from "@clerk/clerk-expo";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../utils/constants";
import { SignOutButton } from "./SignOutButton";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function UserModal({ visible, onClose }: Props) {
  const { user } = useUser();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.safe}>
        <View style={styles.card}>
          <Text style={styles.title}>User</Text>
          <Text style={styles.subtitle}>
            Hello{" "}
            <Text style={{ fontWeight: "700" }}>
              {user?.emailAddresses?.[0]?.emailAddress ?? "Guest"}
            </Text>
          </Text>

          <View style={styles.actions}>
            <SignOutButton />
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  actions: {
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
