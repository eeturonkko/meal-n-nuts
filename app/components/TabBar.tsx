import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../utils/constants";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  diary: "book-outline",
  recipes: "fast-food-outline",
  more: "ellipsis-horizontal",
};

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const routes = state.routes.filter((r) => r.name !== "scan");

  const goScan = () => navigation.navigate("scan" as never);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.wrap}>
        <View style={styles.bar}>
          {routes.map((route) => {
            const isFocused = state.routes[state.index].name === route.name;
            const options = descriptors[route.key].options;
            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : options.title ?? route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const icon = ICONS[route.name] ?? "ellipse-outline";

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.item}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                <Ionicons
                  name={icon}
                  size={22}
                  color={isFocused ? COLORS.primary : "#6b7280"}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.fab}
          onPress={goScan}
          activeOpacity={0.9}
        >
          <Ionicons name="barcode-sharp" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "transparent",
  },
  wrap: {
    position: "relative",
    paddingBottom: 12,
  },
  bar: {
    marginHorizontal: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 6,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  item: {
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  labelActive: {
    color: COLORS.primary,
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
    bottom: 22,
    transform: [{ translateY: -14 }],
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    zIndex: 10,
  },
});
