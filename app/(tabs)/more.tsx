import { useUser } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOutButton } from "../components/SignOutButton";
import UserModal from "../components/UserModal";

type MoreItemProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: string;
  rightText?: string;
  showChevron?: boolean;
};

function MoreItem({
  title,
  subtitle,
  onPress,
  icon,
  rightText,
  showChevron = true,
}: MoreItemProps) {
  return (
    <TouchableOpacity style={styles.moreItem} onPress={onPress}>
      <View style={styles.itemLeft}>
        {icon && <Text style={styles.itemIcon}>{icon}</Text>}
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.itemRight}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        {showChevron && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function More() {
  const { user, isLoaded } = useUser();
  const [showUserModal, setShowUserModal] = useState(false);

  const handleAbout = () => {
    Alert.alert(
      "Meal & Nuts - Ravitsemusseuranta",
      "Versio 1.0.0\n\nHelppokäyttöinen sovellus ruokavalion ja ravitsemuksen seuraamiseen. Kirjaa ateriat, seuraa makroravinteita ja pidä kirjaa päivittäisestä vedenjuonnista.\n\n© 2025 Meal & Nuts",
      [{ text: "Sulje", style: "default" }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Tietosuoja",
      "Meal & Nuts arvostaa yksityisyyttäsi. Kaikki henkilökohtaiset tiedot ja ruokapäiväkirjamerkinnät tallennetaan turvallisesti ja käytetään vain sovelluksen toiminnallisuuden tarjoamiseen.\n\nEmme jaa tietojasi kolmansille osapuolille ilman lupaasi.",
      [{ text: "Ymmärretty", style: "default" }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      "Tuki ja palaute",
      "Tarvitsetko apua tai haluat antaa palautetta?\n\nVoit ottaa yhteyttä kehittäjiin sähköpostitse tai käydä sovelluksen verkkosivuilla.",
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Lähetä sähköposti",
          onPress: () => Linking.openURL("mailto:support@mealandnuts.com"),
        },
      ]
    );
  };

  const handleTips = () => {
    Alert.alert(
      "Vinkkejä sovelluksen käyttöön",
      "🍽️ Lisää ateriat kotisivulta valitsemalla ateriatyyppi\n\n💧 Muista kirjata veden juonti päivittäin\n\n📊 Seuraa edistymistäsi päiväkirjasivulta\n\n🔍 Etsi reseptejä reseptisivulta\n\n⚙️ Muokkaa tavoitteitasi profiilin kautta",
      [{ text: "Kiitos!", style: "default" }]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      "Tietojen vienti",
      "Haluatko viedä ruokapäiväkirjasi tiedot?\n\nTämä toiminto tulossa tulevassa päivityksessä.",
      [{ text: "Selvä", style: "default" }]
    );
  };

  const openWebsite = () => {
    Linking.openURL("https://mealandnuts.com");
  };

  const userName =
    isLoaded && user
      ? user.fullName ||
        user.firstName ||
        user.emailAddresses[0]?.emailAddress ||
        "Käyttäjä"
      : "Lataa...";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Lisää</Text>
          <Text style={styles.subtitle}>Asetukset ja tiedot</Text>
        </View>

        <Section title="Profiili">
          <MoreItem
            title={userName}
            subtitle={
              isLoaded && user ? user.emailAddresses[0]?.emailAddress : ""
            }
            icon="👤"
            onPress={() => setShowUserModal(true)}
          />
        </Section>

        <Section title="Sovellus">
          <MoreItem
            title="Käyttövinkit"
            subtitle="Opi käyttämään sovellusta tehokkaammin"
            icon="💡"
            onPress={handleTips}
          />
          <MoreItem
            title="Vie tiedot"
            subtitle="Lataa ruokapäiväkirjasi"
            icon="📤"
            onPress={handleDataExport}
          />
        </Section>

        <Section title="Tuki ja tiedot">
          <MoreItem
            title="Tuki ja palaute"
            subtitle="Ota yhteyttä kehittäjiin"
            icon="💬"
            onPress={handleSupport}
          />
          <MoreItem
            title="Verkkosivusto"
            subtitle="Käy sovelluksen kotisivulla"
            icon="🌐"
            onPress={openWebsite}
          />
          <MoreItem
            title="Tietosuoja"
            subtitle="Lue tietosuojaseloste"
            icon="🔒"
            onPress={handlePrivacy}
          />
          <MoreItem
            title="Tietoja sovelluksesta"
            subtitle="Versio ja kehittäjätiedot"
            icon="ℹ️"
            onPress={handleAbout}
          />
        </Section>

        <Section title="Tili">
          <View style={styles.signOutContainer}>
            <SignOutButton />
          </View>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Meal & Nuts - Ravitsemusseuranta
          </Text>
          <Text style={styles.versionText}>Versio 1.0.0</Text>
        </View>
      </ScrollView>

      <UserModal
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginHorizontal: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  moreItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightText: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: "#9ca3af",
    fontWeight: "300",
  },
  signOutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});
