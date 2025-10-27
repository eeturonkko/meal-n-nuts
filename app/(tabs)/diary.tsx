import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DayCard from "../components/DayCard";
import DayDetailModal from "../components/DayDetailModal";
import COLORS from "../utils/constants";
import {
  type DayEntry,
  type DiaryApiResponse,
  type MealEntry,
} from "../utils/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

function getDateRange(days: number = 30) {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - days);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    from: formatDate(fromDate),
    to: formatDate(today),
  };
}

export default function Diary() {
  const { user, isLoaded } = useUser();
  const userId = isLoaded ? user?.id ?? "" : "";

  const [diaryEntries, setDiaryEntries] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingDayDetails, setLoadingDayDetails] = useState(false);

  const fetchDiaryData = useCallback(async () => {
    if (!userId) {
      setDiaryEntries([]);
      return;
    }

    setLoading(true);
    try {
      const { from, to } = getDateRange(30);
      const response = await fetch(
        `${API_URL}/api/diary/summary?user_id=${encodeURIComponent(
          userId
        )}&from=${from}&to=${to}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch diary data");
      }

      const data: DiaryApiResponse = await response.json();

      // Sort by date descending (newest first)
      const sortedEntries = data.rows.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setDiaryEntries(sortedEntries);
    } catch (error) {
      console.error("Error fetching diary data:", error);
      setDiaryEntries([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchDayDetails = useCallback(
    async (date: string) => {
      if (!userId) return;

      setLoadingDayDetails(true);
      try {
        const response = await fetch(
          `${API_URL}/api/diary/day?user_id=${encodeURIComponent(
            userId
          )}&date=${date}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch day details");
        }

        const data = await response.json();

        return {
          date,
          calories: Number(data?.totals?.calories || 0),
          protein: Number(data?.totals?.protein || 0),
          carbohydrate: Number(data?.totals?.carbohydrate || 0),
          fat: Number(data?.totals?.fat || 0),
          water: Number(data?.totals?.water || 0),
          entries: data?.entries || [],
        } as DayEntry & { entries: MealEntry[] };
      } catch (error) {
        console.error("Error fetching day details:", error);
        return null;
      } finally {
        setLoadingDayDetails(false);
      }
    },
    [userId]
  );

  const handleDayPress = useCallback(
    async (dayEntry: DayEntry) => {
      if (dayEntry.calories === 0 && dayEntry.water === 0) return; // Don't open modal for empty days

      const dayWithDetails = await fetchDayDetails(dayEntry.date);
      if (dayWithDetails) {
        setSelectedDay(dayWithDetails);
        setModalVisible(true);
      }
    },
    [fetchDayDetails]
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedDay(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDiaryData();
    }, [fetchDiaryData])
  );

  const renderDayCard = useCallback(
    ({ item }: { item: DayEntry }) => (
      <DayCard dayEntry={item} onPress={() => handleDayPress(item)} />
    ),
    [handleDayPress]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Ladataan päiväkirjaa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Päiväkirja</Text>
        <Text style={styles.subtitle}>Viimeisten 30 päivän merkinnät</Text>
      </View>

      <FlatList
        data={diaryEntries}
        renderItem={renderDayCard}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Ei merkintöjä vielä.{"\n"}
              Aloita lisäämällä ruokia kotisivulta!
            </Text>
          </View>
        }
      />

      <DayDetailModal
        visible={modalVisible && !loadingDayDetails}
        dayEntry={selectedDay}
        onClose={handleCloseModal}
      />

      {loadingDayDetails && (
        <View style={styles.modalLoadingOverlay}>
          <View style={styles.modalLoadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.modalLoadingText}>
              Ladataan päivän tietoja...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
  },
  modalLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalLoadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    margin: 20,
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#374151",
  },
});
