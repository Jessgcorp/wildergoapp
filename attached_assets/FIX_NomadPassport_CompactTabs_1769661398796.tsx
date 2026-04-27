/* eslint-disable */
// FIX 2: NOMAD PASSPORT - Compact Tabs & Clean Background
// ========================================================

// PROBLEM:
// 1. Vertical tabs are WAY too long (taking up half the screen)
// 2. Rainbow background is confusing and off-brand
// 3. Layout doesn't match The Dyrt's clean aesthetic

// SOLUTION: Horizontal compact tabs like The Dyrt example

// Replace your Nomad Passport tab section with this:

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TabType = "overview" | "rig" | "travel" | "maintenance";

export const NomadPassportTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: "person-outline" },
    { id: "rig", label: "Rig Specs", icon: "car-outline" },
    { id: "travel", label: "Travel", icon: "map-outline" },
    { id: "maintenance", label: "Maintenance", icon: "build-outline" },
  ];

  return (
    <View style={styles.container}>
      {/* FIXED: Horizontal compact tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? "#FFFFFF" : "#FF6B35"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <View style={styles.contentContainer}>
        {activeTab === "overview" && <OverviewContent />}
        {activeTab === "rig" && <RigSpecsContent />}
        {activeTab === "travel" && <TravelContent />}
        {activeTab === "maintenance" && <MaintenanceContent />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EFE6", // Clean cream background (not rainbow!)
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#FF6B35", // Burnt sienna for active
  },
  tabText: {
    fontFamily: "Outfit-Medium",
    fontSize: 13,
    color: "#4A4A4A",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontFamily: "Outfit-SemiBold",
  },
  contentContainer: {
    flex: 1,
    marginTop: 16,
  },
});

// COMPARISON:
// ❌ BEFORE: Vertical pills ~200px tall each, rainbow background, cluttered
// ✅ AFTER: Horizontal tabs ~46px tall total, clean white/cream, like The Dyrt

// KEY IMPROVEMENTS:
// 1. Tabs are now 85% smaller (46px vs 200px+ per tab)
// 2. Clean white card on cream background (matches The Dyrt)
// 3. Icons + text in compact horizontal layout
// 4. Active state clearly visible with burnt sienna
// 5. Proper spacing and shadows for depth
// 6. All 4 tabs visible at once (no scrolling needed)
