import { useUser } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../utils/constants";
import { SignOutButton } from "./SignOutButton";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function UserModal({ visible, onClose }: Props) {
  const { user } = useUser();

  const [value, setValue] = useState("");
  const [total, setTotal] = useState(0);

  const Add = () => {
    const num = Number(value);
    if (!isNaN(num)) {
      const newTotal = total + num;
      setTotal(newTotal);
      console.log("Total calories: ", newTotal);
      setValue("");
    }
  };

  const Reset = () => {
    Alert.alert("Varoitus", "Haluatko varmasti resetoida kalorit?", [
      { text: "Peru", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          const newTotal = 0;
          setTotal(newTotal);
          console.log("Total calories: ", newTotal);
          setValue("");
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.safe}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.card}>
            <Text style={styles.title}>User</Text>
            <Text style={styles.subtitle}>
              Hello{" "}
              <Text style={{ fontWeight: "700" }}>
                {user?.emailAddresses?.[0]?.emailAddress ?? "Guest"}
              </Text>
            </Text>
            <View style={styles.inputSection}>
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: COLORS.white,
                  }}
                >
                  Add nutrients
                </Text>
              </View>

              <View style={{ width: "100%" }}>
                <TextInput
                  inputMode="numeric"
                  style={styles.input}
                  placeholder="Kalorit"
                  value={value}
                  onChangeText={setValue}
                />
              </View>

              <View style={{ width: "100%" }}>
                <TextInput
                  inputMode="numeric"
                  style={styles.input}
                  placeholder="Proteiini"
                />
              </View>

              <View style={{ width: "100%" }}>
                <TextInput
                  inputMode="numeric"
                  style={styles.input}
                  placeholder="Hiilihydraatti"
                />
              </View>

              <View style={{ width: "100%" }}>
                <TextInput
                  inputMode="numeric"
                  style={styles.input}
                  placeholder="Rasva"
                />
              </View>

              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}
              >
                <TouchableOpacity onPress={Add}>
                  <Text style={styles.addBtn}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={Reset}>
                  <Text style={styles.addBtn}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actions}>
              <SignOutButton />
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  inputSection: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: "100%",
    height: 425,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    justifyContent: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  addBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    color: COLORS.primary,
    fontWeight: "700",
  },
});
