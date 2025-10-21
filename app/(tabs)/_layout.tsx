import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FoodSearchModal from "../components/FoodSearchModal";
import TabBar from "../components/TabBar";
import TopSearchBar from "../components/TopSearchBar";

const DEFAULT_API = "http://localhost:4000";
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:4000" : DEFAULT_API);

export default function TabsLayout() {
  const [query, setQuery] = React.useState("");
  const [foodModalVisible, setFoodModalVisible] = React.useState(false);

  return (
    <SafeAreaProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          header: () => (
            <TopSearchBar
              value={query}
              onChangeText={setQuery}
              onSearchPress={() => setFoodModalVisible(true)}
            />
          ),
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Koti" }} />
        <Tabs.Screen name="diary" options={{ title: "Päiväkirja" }} />
        <Tabs.Screen name="recipes" options={{ title: "Reseptit" }} />
        <Tabs.Screen name="more" options={{ title: "Lisää" }} />
        <Tabs.Screen name="scan" options={{ title: "Scan", href: null }} />
      </Tabs>

      <FoodSearchModal
        visible={foodModalVisible}
        onClose={() => setFoodModalVisible(false)}
        apiUrl={API_URL}
        query={query}
      />
    </SafeAreaProvider>
  );
}
