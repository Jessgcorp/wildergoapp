/**
 * WilderGo AI Route Planner
 * Uses AI to analyze and suggest optimal social routes
 * Highlights routes with highest nomadic density and social overlap
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import {
  getSmartRouteSuggestions,
  SmartRouteSuggestion,
} from "@/services/map/mapService";
import { SmartRouteWeather } from "@/components/map/SmartRouteWeather";

// Stub hook for text generation (AI disabled in this environment)
function useTextGeneration(_options?: { onError?: (err: Error) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const generateText = useCallback(async (_prompt: string): Promise<string> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    return "";
  }, []);
  return { generateText, isLoading };
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AIRoutePlannerProps {
  visible: boolean;
  onClose: () => void;
  onRouteSelect?: (route: SmartRouteSuggestion) => void;
  currentLocation?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number; name?: string };
}

export const AIRoutePlanner: React.FC<AIRoutePlannerProps> = ({
  visible,
  onClose,
  onRouteSelect,
  currentLocation,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [selectedRoute, setSelectedRoute] =
    useState<SmartRouteSuggestion | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Scanning animation
  const scanRotation = useRef(new Animated.Value(0)).current;
  const scanPulse = useRef(new Animated.Value(0.3)).current;

  const routes = getSmartRouteSuggestions();

  // Newell AI integration
  const { generateText, isLoading: isGenerating } = useTextGeneration({
    onError: (err) => {
      console.error("AI Route error:", err);
    },
  });

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  // Scanning animation
  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.timing(scanRotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(scanPulse, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scanPulse, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isAnalyzing, scanRotation, scanPulse]);

  const handleRouteSelect = async (route: SmartRouteSuggestion) => {
    setSelectedRoute(route);
    setIsAnalyzing(true);

    // Generate AI insight for the route
    const prompt = `You are a friendly van life route advisor. Analyze this route and give a brief, enthusiastic recommendation (2-3 sentences max):

Route: ${route.name}
Description: ${route.description}
Social Overlap: ${route.overlapPercentage}%
Nomads in Area: ${route.nomadicDensity}
Highlights: ${route.highlights.join(", ")}
Travel Time: ${route.estimatedTravelTime}

Give a personalized, warm recommendation focusing on the social opportunities along this route. Be concise and friendly, like advice from an experienced nomad friend.`;

    try {
      const result = await generateText(prompt);
      setAiInsight(
        result ||
          "Great route choice! This path offers excellent social opportunities with fellow nomads.",
      );
    } catch {
      setAiInsight(
        "This route has high nomadic density - you'll meet plenty of fellow travelers!",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmRoute = () => {
    if (selectedRoute) {
      onRouteSelect?.(selectedRoute);
      onClose();
    }
  };

  const spin = scanRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const SheetContent = Platform.OS === "ios" ? BlurView : View;
  const sheetProps =
    Platform.OS === "ios" ? { tint: "dark" as const, intensity: 85 } : {};

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          paddingBottom: insets.bottom,
        },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <SheetContent
        {...sheetProps}
        style={[styles.sheet, Platform.OS !== "ios" && styles.sheetFallback]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={20} color={colors.moss[400]} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Smart Route</Text>
              <Text style={styles.headerSubtitle}>
                AI-Powered Route Planning
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Route List */}
        <ScrollView
          style={styles.routeList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.routeListContent}
        >
          <Text style={styles.sectionTitle}>Suggested Routes</Text>
          <Text style={styles.sectionSubtitle}>
            Based on social overlap and nomadic density
          </Text>

          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              onPress={() => handleRouteSelect(route)}
              activeOpacity={0.8}
            >
              <GlassCard
                variant={selectedRoute?.id === route.id ? "medium" : "light"}
                padding="lg"
                style={[
                  styles.routeCard,
                  selectedRoute?.id === route.id
                    ? styles.routeCardSelected
                    : undefined,
                ]}
              >
                <View style={styles.routeHeader}>
                  <View style={styles.routeNameContainer}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <View style={styles.overlapBadge}>
                      <Ionicons
                        name="git-merge"
                        size={12}
                        color={colors.text.inverse}
                      />
                      <Text style={styles.overlapBadgeText}>
                        {route.overlapPercentage}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.routeDescription}>
                    {route.description}
                  </Text>
                </View>

                <View style={styles.routeStats}>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="people"
                      size={16}
                      color={colors.moss[500]}
                    />
                    <Text style={styles.statText}>
                      {route.nomadicDensity} nomads
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="time"
                      size={16}
                      color={colors.driftwood[500]}
                    />
                    <Text style={styles.statText}>
                      {route.estimatedTravelTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.highlightsContainer}>
                  {route.highlights.map((highlight, i) => (
                    <View key={i} style={styles.highlightChip}>
                      <Ionicons
                        name="checkmark-circle"
                        size={12}
                        color={colors.moss[500]}
                      />
                      <Text style={styles.highlightText}>{highlight}</Text>
                    </View>
                  ))}
                </View>

                {route.weatherSummary ? (
                  <View style={styles.weatherSummaryRow}>
                    <View
                      style={[
                        styles.weatherBadge,
                        route.weatherSummary.overallRating === "excellent" &&
                          styles.weatherExcellent,
                        route.weatherSummary.overallRating === "good" &&
                          styles.weatherGood,
                        route.weatherSummary.overallRating === "fair" &&
                          styles.weatherFair,
                        route.weatherSummary.overallRating === "poor" &&
                          styles.weatherPoor,
                      ]}
                    >
                      <Ionicons
                        name="partly-sunny"
                        size={12}
                        color={
                          route.weatherSummary.overallRating === "excellent" ||
                          route.weatherSummary.overallRating === "good"
                            ? colors.forestGreen[600]
                            : route.weatherSummary.overallRating === "fair"
                              ? colors.sunsetOrange[600]
                              : colors.emergency.primary
                        }
                      />
                      <Text
                        style={[
                          styles.weatherBadgeText,
                          route.weatherSummary.overallRating === "excellent" &&
                            styles.weatherExcellentText,
                          route.weatherSummary.overallRating === "good" &&
                            styles.weatherGoodText,
                          route.weatherSummary.overallRating === "fair" &&
                            styles.weatherFairText,
                          route.weatherSummary.overallRating === "poor" &&
                            styles.weatherPoorText,
                        ]}
                      >
                        {route.weatherSummary.overallRating?.toUpperCase()}
                      </Text>
                    </View>
                    {route.weatherSummary.alerts > 0 ? (
                      <View style={styles.alertBadge}>
                        <Ionicons
                          name="warning"
                          size={10}
                          color={colors.sunsetOrange[600]}
                        />
                        <Text style={styles.alertBadgeText}>
                          {route.weatherSummary.alerts}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={styles.departureWindowText} numberOfLines={1}>
                      Depart: {route.weatherSummary.bestDepartureWindow}
                    </Text>
                  </View>
                ) : null}

                {selectedRoute?.id === route.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.moss[500]}
                    />
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AI Insight Panel */}
        {selectedRoute && (
          <View style={styles.insightPanel}>
            {isAnalyzing || isGenerating ? (
              <View style={styles.analyzingContainer}>
                <Animated.View
                  style={[styles.scanIcon, { transform: [{ rotate: spin }] }]}
                >
                  <Ionicons name="scan" size={24} color={colors.moss[400]} />
                </Animated.View>
                <Animated.View
                  style={[styles.scanPulse, { opacity: scanPulse }]}
                />
                <Text style={styles.analyzingText}>Analyzing route...</Text>
              </View>
            ) : aiInsight ? (
              <GlassCard
                variant="frost"
                padding="md"
                style={styles.insightCard}
              >
                <View style={styles.insightHeader}>
                  <Ionicons name="bulb" size={18} color={colors.ember[400]} />
                  <Text style={styles.insightTitle}>AI Insight</Text>
                </View>
                <Text style={styles.insightText}>{aiInsight}</Text>
              </GlassCard>
            ) : null}

            <Button
              title="Set as My Route"
              onPress={handleConfirmRoute}
              variant="ember"
              size="lg"
              fullWidth
              disabled={isAnalyzing || isGenerating}
              icon={
                <Ionicons
                  name="navigate"
                  size={20}
                  color={colors.text.inverse}
                />
              }
            />
          </View>
        )}
      </SheetContent>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.85,
    zIndex: 200,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: borderRadius["2xl"],
    borderTopRightRadius: borderRadius["2xl"],
    overflow: "hidden",
  },
  sheetFallback: {
    backgroundColor: "rgba(30, 24, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.borderLight,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.moss[500] + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "700",
    color: colors.text.inverse,
    fontFamily: typography.fontFamily.heading,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[300],
    fontFamily: typography.fontFamily.body,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
  },
  routeList: {
    flex: 1,
  },
  routeListContent: {
    padding: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.text.inverse,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[300],
    marginBottom: spacing.lg,
    fontFamily: typography.fontFamily.body,
  },
  routeCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    position: "relative",
  },
  routeCardSelected: {
    borderWidth: 2,
    borderColor: colors.moss[500],
  },
  routeHeader: {
    marginBottom: spacing.md,
  },
  routeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  routeName: {
    fontSize: typography.fontSize.md,
    fontWeight: "700",
    color: colors.bark[800],
    fontFamily: typography.fontFamily.heading,
  },
  overlapBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ember[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  overlapBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.inverse,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  routeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    lineHeight: 20,
    fontFamily: typography.fontFamily.body,
  },
  routeStats: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    fontFamily: typography.fontFamily.bodyMedium,
  },
  highlightsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  highlightChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.moss[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  highlightText: {
    fontSize: typography.fontSize.xs,
    color: colors.moss[700],
    fontFamily: typography.fontFamily.body,
  },
  selectedIndicator: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },
  insightPanel: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glass.borderLight,
    gap: spacing.lg,
  },
  analyzingContainer: {
    alignItems: "center",
    padding: spacing.lg,
    position: "relative",
  },
  scanIcon: {
    zIndex: 2,
  },
  scanPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.moss[500],
    zIndex: 1,
  },
  analyzingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.bark[300],
    fontFamily: typography.fontFamily.body,
  },
  insightCard: {
    borderRadius: borderRadius.lg,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.bark[700],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  insightText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    lineHeight: 20,
    fontFamily: typography.fontFamily.body,
  },
  weatherSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glass.borderLight,
  },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: "#E8F5E9",
  },
  weatherExcellent: {
    backgroundColor: "#E8F5E9",
  },
  weatherGood: {
    backgroundColor: "#E3F2E8",
  },
  weatherFair: {
    backgroundColor: "#FFF3E0",
  },
  weatherPoor: {
    backgroundColor: "#FFEBEE",
  },
  weatherBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[600],
  },
  weatherExcellentText: {
    color: colors.forestGreen[600],
  },
  weatherGoodText: {
    color: colors.forestGreen[500],
  },
  weatherFairText: {
    color: colors.sunsetOrange[600],
  },
  weatherPoorText: {
    color: colors.emergency.primary,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.sunsetOrange[600],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  departureWindowText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.bark[500],
    fontFamily: typography.fontFamily.body,
  },
});

export default AIRoutePlanner;
