/* eslint-disable */
// FIX 3: NOMAD PASSPORT - Remove Rainbow Background & Clean Layout
// =================================================================

// PROBLEM: Confusing rainbow/pattern background that doesn't match branding
// SOLUTION: Clean, simple backgrounds like The Dyrt

// In your Nomad Passport screen file:

import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";

export const NomadPassportScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nomad</Text>
        <Text style={styles.headerTitle}>Passport</Text>
      </View>

      {/* Profile Card - Like The Dyrt's clean cards */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: "profile-image-url" }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Nomad</Text>
            <Text style={styles.profileVehicle}>
              2019 Mercedes Sprinter 144
            </Text>
            <View style={styles.badges}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium</Text>
              </View>
              <View style={styles.sinceBadge}>
                <Text style={styles.sinceText}>Since 2023</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>127</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Convoys</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>States</Text>
          </View>
        </View>
      </View>

      {/* Compact Tabs Component */}
      <NomadPassportTabs />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EFE6", // ✅ Clean cream background (not rainbow!)
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#F5EFE6",
  },
  headerTitle: {
    fontFamily: "RussoOne-Regular",
    fontSize: 32,
    color: "#2C2C2C",
    lineHeight: 36,
  },
  profileCard: {
    backgroundColor: "#FFFFFF", // ✅ Clean white card
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: "RussoOne-Regular",
    fontSize: 24,
    color: "#2C2C2C",
    marginBottom: 4,
  },
  profileVehicle: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 8,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  premiumBadge: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  sinceBadge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sinceText: {
    fontFamily: "Outfit-Medium",
    fontSize: 12,
    color: "#4A4A4A",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontFamily: "RussoOne-Regular",
    fontSize: 28,
    color: "#FF6B35",
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Outfit-Regular",
    fontSize: 12,
    color: "#6B6B6B",
  },
});

// BEFORE vs AFTER:
// ❌ BEFORE: Rainbow/pattern background, huge vertical tabs, cluttered
// ✅ AFTER: Clean cream background, white cards, compact horizontal tabs

// MATCHES THE DYRT AESTHETIC:
// ✅ Clean white cards on light background
// ✅ Proper spacing and margins (16px)
// ✅ Subtle shadows for depth
// ✅ Clear visual hierarchy
// ✅ Readable fonts and sizing
// ✅ Professional, uncluttered layout
