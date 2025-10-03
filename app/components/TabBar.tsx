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
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
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
            if (!isFocused && !event.defaultPrevented)
              navigation.navigate(route.name, route.params);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "transparent",
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
});
