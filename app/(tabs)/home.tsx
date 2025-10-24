import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MealButton from "../components/MealButton";
import { NutrientProgressCircle } from "../components/NutrientProgressCircle";
import WaterModal from "../components/WaterModal";
import COLORS from "../utils/constants";

const smallNutrients = [
  { progress: 100, goal: 150, label: "Proteiini", size: 100, offset: -35 },
  { progress: 155, goal: 320, label: "Hiilihydraatti", size: 100, offset: 0 },
  { progress: 30, goal: 70, label: "Rasva", size: 100, offset: -35 },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showWater, setShowWater] = React.useState(false);
  
  const openMeal = (meal: string) => router.push(`/screens/${meal}`);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.container}>
        {/** JULIUKSEN RAKENTAMINEN */}
        <View style={[styles.section, styles.top, { alignItems: "center" }]}>
          <NutrientProgressCircle
            progressValue={1700}
            goalValue={3000}
            label="Kalorit"
            size={120}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginBottom: 75,
            }}
          >
            {smallNutrients.map(({ progress, goal, label, size, offset }) => (
              <View key={label} style={{ marginTop: offset }}>
                <NutrientProgressCircle
                  progressValue={progress}
                  goalValue={goal}
                  label={label}
                  size={size}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.mealsGrid}>
          <MealButton label="Aamupala" onPress={() => openMeal("breakfast")} />
          <MealButton label="Lounas" onPress={() => openMeal("lunch")} />
          <MealButton label="Päivällinen" onPress={() => openMeal("dinner")} />
          <MealButton label="Iltapala" onPress={() => openMeal("evening")} />
          <MealButton label="Snacks" onPress={() => openMeal("snack")} />
          <MealButton label="Vesi" onPress={() => setShowWater(true)} />
        </View>

        <WaterModal
          visible={showWater}
          onClose={() => setShowWater(false)}
          onSave={(ml) => {
            console.log("Lisättiin vettä:", ml, "ml");
            // TODO: tallennus veden määrä käyttäjän dataan
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  container: {
    flex: 1,
    padding: 12,
    gap: 12,
  },
  section: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  top: {},
  bottom: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    color: "#0f172a",
  },
  sectionBody: {
    color: "#334155",
  },
  mealsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
