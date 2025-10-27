import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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

  const [caloriesGoal, setCaloriesGoal] = useState("2500");
  const [proteinGoal, setProteinGoal] = useState("150");
  const [carbsGoal, setCarbsGoal] = useState("200");
  const [fatGoal, setFatGoal] = useState("70");
  const [waterGoal, setWaterGoal] = useState("3000");

  const [nutrientsExpanded, setNutrientsExpanded] = useState(false);
  const nutrientsHeight = useSharedValue(0);
  const nutrientsOpacity = useSharedValue(0);
  const nutrientsRotation = useSharedValue(0);

  const [profileExpanded, setProfileExpanded] = useState(false);
  const profileHeight = useSharedValue(0);
  const profileOpacity = useSharedValue(0);
  const profileRotation = useSharedValue(0);

  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const goalsHeight = useSharedValue(0);
  const goalsOpacity = useSharedValue(0);
  const goalsRotation = useSharedValue(0);

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const [gender, setGender] = useState("man");

  const closeOtherDropdowns = (dropdown: "nutrients" | "profile" | "goals") => {
    setNutrientsExpanded(dropdown === "nutrients" ? !nutrientsExpanded : false);
    setProfileExpanded(dropdown === "profile" ? !profileExpanded : false);
    setGoalsExpanded(dropdown === "goals" ? !goalsExpanded : false);
  };

  useEffect(() => {
    nutrientsHeight.value = withTiming(nutrientsExpanded ? 260 : 0, {
      duration: 400,
    });
    nutrientsOpacity.value = withTiming(nutrientsExpanded ? 1 : 0, {
      duration: 400,
    });
    nutrientsRotation.value = withTiming(nutrientsExpanded ? 180 : 0, {
      duration: 400,
    });
  }, [nutrientsExpanded]);

  useEffect(() => {
    profileHeight.value = withTiming(profileExpanded ? 450 : 0, {
      duration: 400,
    });
    profileOpacity.value = withTiming(profileExpanded ? 1 : 0, {
      duration: 400,
    });
    profileRotation.value = withTiming(profileExpanded ? 180 : 0, {
      duration: 400,
    });
  }, [profileExpanded]);

  useEffect(() => {
    goalsHeight.value = withTiming(goalsExpanded ? 240 : 0, {
      duration: 400,
    });
    goalsOpacity.value = withTiming(goalsExpanded ? 1 : 0, {
      duration: 400,
    });
    goalsRotation.value = withTiming(goalsExpanded ? 180 : 0, {
      duration: 400,
    });
  }, [goalsExpanded]);

  const nutrientsAnimatedStyle = useAnimatedStyle(() => ({
    height: nutrientsHeight.value,
    opacity: nutrientsOpacity.value,
  }));

  const nutrientArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${nutrientsRotation.value}deg` }],
  }));

  const profileAnimatedStyle = useAnimatedStyle(() => ({
    height: profileHeight.value,
    opacity: profileOpacity.value,
  }));

  const profileArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${profileRotation.value}deg` }],
  }));

  const goalsAnimatedStyle = useAnimatedStyle(() => ({
    height: goalsHeight.value,
    opacity: goalsOpacity.value,
  }));

  const goalsArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${goalsRotation.value}deg` }],
  }));

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
          setTotal(0);
          console.log("Total calories: 0");
          setValue("");
        },
      },
    ]);
  };

  const handleSaveProfile = () => {
    console.log("Saving profile data:", {
      gender,
      age,
      weight,
      height,
    });
    Alert.alert("Tallennettu", "Käyttäjätiedot tallennettu onnistuneesti!");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.safe}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.card}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Käyttäjä</Text>
              <Text style={styles.subtitle}>
                Hei{" "}
                <Text style={{ fontWeight: "700" }}>
                  {user?.emailAddresses?.[0]?.emailAddress ?? "Guest"}
                </Text>
              </Text>

              <View style={styles.inputSection}>
                <Pressable
                  onPress={() => closeOtherDropdowns("profile")}
                  style={styles.dropdownBtn}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                    {profileExpanded
                      ? "Piilota käyttäjätiedot"
                      : "Näytä käyttäjätiedot"}
                  </Text>

                  <Animated.View style={profileArrowStyle}>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={COLORS.primary}
                    />
                  </Animated.View>
                </Pressable>

                <Animated.View
                  style={[{ width: "100%" }, profileAnimatedStyle]}
                  pointerEvents={profileExpanded ? "auto" : "none"}
                >
                  <View style={styles.profileContent}>
                    <View style={styles.genderSection}>
                      <Text style={styles.sectionLabel}>Sukupuoli:</Text>
                      <View style={styles.radioGroup}>
                        <TouchableOpacity
                          style={styles.radioOption}
                          onPress={() => setGender("man")}
                        >
                          <View style={styles.radioCircle}>
                            {gender === "man" && (
                              <View style={styles.radioDot} />
                            )}
                          </View>
                          <Text style={styles.radioLabel}>Mies</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.radioOption}
                          onPress={() => setGender("woman")}
                        >
                          <View style={styles.radioCircle}>
                            {gender === "woman" && (
                              <View style={styles.radioDot} />
                            )}
                          </View>
                          <Text style={styles.radioLabel}>Nainen</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.radioOption}
                          onPress={() => setGender("other")}
                        >
                          <View style={styles.radioCircle}>
                            {gender === "other" && (
                              <View style={styles.radioDot} />
                            )}
                          </View>
                          <Text style={styles.radioLabel}>Muu</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputRow}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Ikä</Text>
                        <TextInput
                          style={styles.profileInput}
                          placeholder="vuotta"
                          value={age}
                          onChangeText={setAge}
                          keyboardType="numeric"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Paino</Text>
                        <TextInput
                          style={styles.profileInput}
                          placeholder="kg"
                          value={weight}
                          onChangeText={setWeight}
                          keyboardType="numeric"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    </View>

                    <View style={styles.inputRow}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Pituus</Text>
                        <TextInput
                          style={styles.profileInput}
                          placeholder="cm"
                          value={height}
                          onChangeText={setHeight}
                          keyboardType="numeric"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      <View style={styles.inputGroup}></View>
                    </View>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveProfile}
                    >
                      <Text style={styles.addBtn}>Tallenna tiedot</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                <Pressable
                  onPress={() => closeOtherDropdowns("nutrients")}
                  style={styles.dropdownBtn}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                    Manuaalinen aterian lisäys
                  </Text>

                  <Animated.View style={nutrientArrowStyle}>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={COLORS.primary}
                    />
                  </Animated.View>
                </Pressable>

                <Animated.View
                  style={[{ width: "100%" }, nutrientsAnimatedStyle]}
                  pointerEvents={nutrientsExpanded ? "auto" : "none"}
                >
                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Kalorit:</Text>
                    <TextInput
                      inputMode="numeric"
                      style={styles.input}
                      placeholder="Kalorit"
                      value={value}
                      onChangeText={setValue}
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Proteiini:</Text>
                    <TextInput
                      inputMode="numeric"
                      style={styles.input}
                      placeholder="Proteiini"
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Hiilihydraatti:</Text>
                    <TextInput
                      inputMode="numeric"
                      style={styles.input}
                      placeholder="Hiilihydraatti"
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Rasva:</Text>
                    <TextInput
                      inputMode="numeric"
                      style={styles.input}
                      placeholder="Rasva"
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Vesi:</Text>
                    <TextInput
                      inputMode="numeric"
                      style={styles.input}
                      placeholder="Vesi"
                    />
                  </View>

                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-evenly",
                      marginTop: 5,
                    }}
                  >
                    <TouchableOpacity onPress={Add}>
                      <Text style={styles.addBtn}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={Reset}>
                      <Text style={styles.addBtn}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                <Pressable
                  onPress={() => closeOtherDropdowns("goals")}
                  style={styles.dropdownBtn}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                    {goalsExpanded ? "Piilota tavoitteet" : "Näytä tavoitteet"}
                  </Text>

                  <Animated.View style={goalsArrowStyle}>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={COLORS.primary}
                    />
                  </Animated.View>
                </Pressable>

                <Animated.View
                  style={[{ width: "100%" }, goalsAnimatedStyle]}
                  pointerEvents={goalsExpanded ? "auto" : "none"}
                >
                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Kalorit:</Text>
                    <TextInput
                      style={styles.input}
                      value={caloriesGoal}
                      onChangeText={setCaloriesGoal}
                      keyboardType="numeric"
                      placeholder="2500"
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Proteiini:</Text>
                    <TextInput
                      style={styles.input}
                      value={proteinGoal}
                      onChangeText={setProteinGoal}
                      keyboardType="numeric"
                      placeholder="150"
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Hiilihydraatti:</Text>
                    <TextInput
                      style={styles.input}
                      value={carbsGoal}
                      onChangeText={setCarbsGoal}
                      keyboardType="numeric"
                      placeholder="200"
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Rasva:</Text>
                    <TextInput
                      style={styles.input}
                      value={fatGoal}
                      onChangeText={setFatGoal}
                      keyboardType="numeric"
                      placeholder="70"
                    />
                  </View>

                  <View style={styles.inlineRow}>
                    <Text style={styles.inlineLabel}>Vesi:</Text>
                    <TextInput
                      style={styles.input}
                      value={waterGoal}
                      onChangeText={setWaterGoal}
                      keyboardType="numeric"
                      placeholder="3000"
                    />
                  </View>
                </Animated.View>
              </View>

              <View style={styles.actions}>
                <SignOutButton />
              </View>
            </ScrollView>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Sulje</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    maxHeight: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  scrollContent: {
    width: "100%",
  },
  scrollContentContainer: {
    alignItems: "center",
    paddingBottom: 20,
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
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    justifyContent: "center",
    paddingBottom: 10,
    paddingTop: 10,
  },
  manualInput: {
    height: 40,
    margin: 5,
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
  dropdownBtn: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    margin: 12,
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    width: "100%",
  },
  inlineLabel: {
    width: 110,
    fontWeight: "700",
    color: COLORS.white,
    paddingLeft: 8,
  },
  input: {
    flex: 1,
    maxWidth: 110,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  genderPicker: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    justifyContent: "center",
  },
  profileContent: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  genderSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 12,
    textAlign: "center",
  },
  radioGroup: {
    flexDirection: "column",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: "100%",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 6,
    textAlign: "center",
  },
  profileInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    fontSize: 16,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
    alignSelf: "center",
    minWidth: 150,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
