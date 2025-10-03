import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TabBar from "../components/TabBar";
import TopSearchBar from "../components/TopSearchBar";

export default function TabsLayout() {
  const [query, setQuery] = React.useState("");

  return (
    <SafeAreaProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          header: () => (
            <TopSearchBar
              value={query}
              onChangeText={setQuery}
              onSearchPress={() => {}}
            />
          ),
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Koti" }} />
        <Tabs.Screen name="diary" options={{ title: "Päiväkirja" }} />
        <Tabs.Screen name="recipes" options={{ title: "Reseptit" }} />
        <Tabs.Screen name="more" options={{ title: "Lisää" }} />
      </Tabs>
    </SafeAreaProvider>
  );
}
