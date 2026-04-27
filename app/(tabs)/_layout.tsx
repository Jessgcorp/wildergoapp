import React, { useState, useRef, useCallback, useEffect } from "react";
import { Tabs, usePathname, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  cancelAnimation,
  useAnimatedProps,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

const SOS_CRIMSON = "#D90429";
const SOS_HOLD_DURATION = 1500;
const CIRCUMFERENCE = 2 * Math.PI * 14;

const ReanimatedCircle = Reanimated.createAnimatedComponent(Circle);

function SOSButton({ onActivate }: { onActivate: () => void }) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const isHolding = useRef(false);
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHeartbeat = useCallback(() => {
    if (hapticInterval.current) return;
    hapticInterval.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 300);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (hapticInterval.current) {
      clearInterval(hapticInterval.current);
      hapticInterval.current = null;
    }
  }, []);

  const triggerSOS = useCallback(() => {
    stopHeartbeat();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    onActivate();
  }, [onActivate, stopHeartbeat]);

  const handlePressIn = () => {
    isHolding.current = true;
    progress.value = withTiming(1, { duration: SOS_HOLD_DURATION });
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 150 }),
      ),
      -1,
      true,
    );
    startHeartbeat();

    setTimeout(() => {
      if (isHolding.current) {
        runOnJS(triggerSOS)();
      }
    }, SOS_HOLD_DURATION);
  };

  const handlePressOut = () => {
    isHolding.current = false;
    progress.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(1, { duration: 200 });
    stopHeartbeat();
  };

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.sosContainer}
    >
      <Reanimated.View style={[styles.sosBtn, animatedContainerStyle]}>
        <Svg width="44" height="44" style={styles.sosSvg}>
          <Circle
            cx="22"
            cy="22"
            r="14"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          <ReanimatedCircle
            cx="22"
            cy="22"
            r="14"
            fill="none"
            stroke={SOS_CRIMSON}
            strokeWidth="2"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
          />
        </Svg>
        <Text style={styles.sosText}>SOS</Text>
      </Reanimated.View>
    </Pressable>
  );
}

const TAB_ROUTES = [
  {
    key: "discovery",
    title: "Explore",
    icon: "compass-outline" as const,
    path: "/(tabs)/discovery",
  },
  {
    key: "map",
    title: "Map",
    icon: "map-outline" as const,
    path: "/(tabs)/map",
  },
  {
    key: "messages",
    title: "Gear",
    icon: "construct-outline" as const,
    path: "/(tabs)/messages",
  },
  {
    key: "profile",
    title: "Profile",
    icon: "person-outline" as const,
    path: "/(tabs)/profile",
  },
];

function WilderPill() {
  const pathname = usePathname();
  const router = useRouter();

  const activeKey =
    TAB_ROUTES.find((t) => pathname.includes(t.key))?.key || "discovery";

  const handleTabPress = useCallback(
    (path: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(path as any);
    },
    [router],
  );

  const handleSOS = useCallback(() => {
    router.push("/(tabs)/help" as any);
  }, [router]);

  return (
    <View style={styles.pillAnchor}>
      <View style={styles.pillOuter}>
        {/* Apple-style glass effect with blur and saturation */}
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.pillInner}>
          {/* Build 17 Indicator - "17" Badge */}
          <View style={styles.glassIndicator}>
            <Text style={styles.indicatorText}>17</Text>
          </View>

          <View style={styles.tabsContainer}>
            {TAB_ROUTES.map((tab) => {
              const isFocused = activeKey === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handleTabPress(tab.path)}
                  style={styles.tabItem}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={tab.icon}
                    size={22}
                    color={isFocused ? "#1d1d1f" : "rgba(29, 29, 31, 0.45)"}
                  />
                  {isFocused && (
                    <Text style={styles.tabLabel}>{tab.title}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Nearby Status Circle & SOS */}
          <View style={styles.statusGroup}>
            <View style={styles.nearbyCircle} />
            <SOSButton onActivate={handleSOS} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.moss[500]} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="discovery" />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="help" />
      </Tabs>
      <WilderPill />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  pillAnchor: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  pillOuter: {
    width: "92%",
    height: 64,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  pillInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nearbyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34C759", // Apple green
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1d1d1f",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1d1d1f",
  },
  glassIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    width: 36,
    height: 36,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  sosContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  sosBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  sosSvg: {
    position: "absolute",
  },
  sosText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1d1d1f",
  },
});
