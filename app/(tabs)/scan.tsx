import { Ionicons } from "@expo/vector-icons";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../utils/constants";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission, requestPermission]);

  const onBarCodeScanned = useCallback(
    (res: BarcodeScanningResult) => {
      if (scanned) return;
      setScanned(true);
      console.log("BARCODE:", res.data, "type:", res.type);
      router.replace({ pathname: "/home" });
    },
    [scanned, router]
  );

  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator />
        <Text style={styles.info}>Checking camera permission…</Text>
      </SafeAreaView>
    );
  }
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.info}>
          Camera access is required to scan barcodes.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.permBtn, styles.cancelBtn]}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan barcode</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
              "code128",
              "code39",
              "code93",
              "pdf417",
            ],
          }}
          onBarcodeScanned={onBarCodeScanned}
        />
        <View style={styles.frame} pointerEvents="none" />
      </View>

      <Text style={styles.hint}>Align the barcode within the frame</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000", alignItems: "center" },
  header: {
    height: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  backBtn: { padding: 6 },
  title: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cameraWrap: {
    flex: 1,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    marginTop: 8,
  },
  frame: {
    position: "absolute",
    top: "20%",
    left: "10%",
    right: "10%",
    bottom: "30%",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 14,
  },
  hint: { color: "#fff", marginVertical: 12 },
  info: {
    color: "#fff",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 20,
  },
  permBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  permText: { color: "#fff", fontWeight: "700" },
  cancelBtn: { backgroundColor: "#222" },
  cancelText: { color: "#fff", fontWeight: "700" },
});
