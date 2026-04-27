import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

import DiscoveryScreen from "../../app/(tabs)/discovery";
import MapScreen from "../../app/(tabs)/map";
import MessagesScreen from "../../app/(tabs)/messages";
import ProfileScreen from "../../app/(tabs)/profile";
import HelpScreen from "../../app/(tabs)/help";

export type MainTabParamList = {
  Discovery: undefined;
  Map: undefined;
  Messages: undefined;
  Profile: undefined;
  Help: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Discovery"
      screenOptions={{
        tabBarActiveTintColor: colors.accent.terracotta,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: colors.background.primary,
          }),
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: "Outfit_500Medium",
          fontSize: 11,
          marginTop: 2,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background.primary },
              ]}
            />
          ),
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Discovery"
        component={DiscoveryScreen}
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: "Convoy",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Passport",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: "SOS",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
