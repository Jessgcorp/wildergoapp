/**
 * SmartRouteScreen - Web Version
 * Uses a placeholder map view for web compatibility
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  getSmartRoute,
  getWeatherIconName,
  getRoadRiskColor,
  SmartRouteData,
  Coordinate,
} from "@/services/smartRouteService";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

const COLORS = {
  warmCream: "#F5EFE6",
  lightCream: "#FAF6F2",
  desertSand: "#E8C5A5",
  sandDark: "#D9B894",
  skyBlue: "#4A90E2",
  skyBlueLight: "#E3F0FF",
  skyBlueDark: "#3B7BC8",
  amber: "#F2A154",
  amberLight: "#FFF9F0",
  amberDark: "#D48A3A",
  forestGreenLight: "#E8F5E9",
  forestGreenDark: "#2D5A3D",
};

interface SmartRouteScreenProps {
  origin?: Coordinate;
  destination?: Coordinate;
  originName?: string;
  destinationName?: string;
  onClose?: () => void;
  onStartNavigation?: (
    destination: Coordinate,
    destinationName: string,
  ) => void;
}

export function SmartRouteScreen({
  origin = { latitude: 39.7392, longitude: -104.9903 },
  destination = { latitude: 40.015, longitude: -105.2705 },
  originName = "Denver, CO",
  destinationName = "Boulder, CO",
  onClose,
  onStartNavigation,
}: SmartRouteScreenProps) {
  const insets = useSafeAreaInsets();
  const [smartRoute, setSmartRoute] = useState<SmartRouteData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSmartRoute = useCallback(async () => {
    setLoading(true);
    try {
      const route = await getSmartRoute(origin, destination);
      if (route.success) {
        setSmartRoute(route);
      }
    } catch (error) {
      console.error("Error loading Smart Route:", error);
    } finally {
      setLoading(false);
    }
  }, [origin, destination]);

  useEffect(() => {
    loadSmartRoute();
  }, [loadSmartRoute]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.sunsetOrange[500]} />
        <Text style={styles.loadingText}>Calculating Smart Route...</Text>
        <Text style={styles.loadingSubtext}>
          Analyzing weather and road conditions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerContent}>
          {onClose ? (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              testID="button-close-route"
            >
              <Ionicons name="close" size={24} color={colors.bark[700]} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Smart Route</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Navigation</Text>
          </View>
          <TouchableOpacity
            onPress={loadSmartRoute}
            style={styles.refreshButton}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={colors.sunsetOrange[500]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapPlaceholder}>
        <LinearGradient
          colors={[COLORS.forestGreenLight, COLORS.skyBlueLight]}
          style={styles.mapGradient}
        >
          <View style={styles.mapContent}>
            <Ionicons name="map" size={48} color={colors.forestGreen[500]} />
            <Text style={styles.mapText}>Route Preview</Text>
            <Text style={styles.mapSubtext}>
              {originName} to {destinationName}
            </Text>
            <View style={styles.routeVisual}>
              <View
                style={[
                  styles.routePoint,
                  { backgroundColor: colors.forestGreen[500] },
                ]}
              >
                <Text style={styles.routePointText}>A</Text>
              </View>
              <View style={styles.routeDash} />
              <View
                style={[styles.routePoint, { backgroundColor: COLORS.skyBlue }]}
              >
                <Text style={styles.routePointText}>M</Text>
              </View>
              <View style={styles.routeDash} />
              <View
                style={[
                  styles.routePoint,
                  { backgroundColor: colors.sunsetOrange[500] },
                ]}
              >
                <Text style={styles.routePointText}>B</Text>
              </View>
            </View>
            <Text style={styles.webNote}>
              Use Expo Go app for full map experience
            </Text>
          </View>
        </LinearGradient>
      </View>

      {smartRoute ? (
        <ScrollView
          style={styles.infoCardContainer}
          contentContainerStyle={[
            styles.infoCard,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.routeInfo}>
            <View style={styles.routeEndpoints}>
              <View style={styles.endpointRow}>
                <View
                  style={[
                    styles.endpointDot,
                    { backgroundColor: colors.forestGreen[500] },
                  ]}
                />
                <Text style={styles.endpointText} numberOfLines={1}>
                  {originName}
                </Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.endpointRow}>
                <View
                  style={[
                    styles.endpointDot,
                    { backgroundColor: colors.sunsetOrange[500] },
                  ]}
                />
                <Text style={styles.endpointText} numberOfLines={1}>
                  {destinationName}
                </Text>
              </View>
            </View>
            <View style={styles.routeStats}>
              <Text style={styles.distance}>{smartRoute.distance}</Text>
              <Text style={styles.duration}>{smartRoute.duration}</Text>
            </View>
          </View>

          <View
            style={[
              styles.roadRiskBadge,
              { backgroundColor: getRoadRiskColor(smartRoute.safety.level) },
            ]}
          >
            <View style={styles.roadRiskHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.roadRiskLabel}>ROAD RISK</Text>
            </View>
            <Text style={styles.roadRiskLevel}>
              {smartRoute.safety.level.toUpperCase()}
            </Text>
            <View style={styles.roadRiskScoreContainer}>
              <Text style={styles.roadRiskScore}>
                {smartRoute.safety.score}
              </Text>
              <Text style={styles.roadRiskScoreMax}>/100</Text>
            </View>
          </View>

          <View style={styles.weatherSummary}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="partly-sunny"
                size={20}
                color={colors.sunsetOrange[500]}
              />
              <Text style={styles.sectionTitle}>Weather Forecast</Text>
            </View>
            <View style={styles.weatherRow}>
              <View style={styles.weatherPoint}>
                <View
                  style={[
                    styles.weatherIconContainer,
                    { backgroundColor: COLORS.forestGreenLight },
                  ]}
                >
                  <Ionicons
                    name={
                      getWeatherIconName(
                        smartRoute.weather.start.condition,
                      ) as keyof typeof Ionicons.glyphMap
                    }
                    size={28}
                    color={COLORS.forestGreenDark}
                  />
                </View>
                <Text style={styles.weatherTemp}>
                  {smartRoute.weather.start.temperature}°F
                </Text>
                <Text style={styles.weatherLabel}>Start</Text>
              </View>
              <View style={styles.weatherDivider} />
              <View style={styles.weatherPoint}>
                <View
                  style={[
                    styles.weatherIconContainer,
                    { backgroundColor: COLORS.skyBlueLight },
                  ]}
                >
                  <Ionicons
                    name={
                      getWeatherIconName(
                        smartRoute.weather.middle.condition,
                      ) as keyof typeof Ionicons.glyphMap
                    }
                    size={28}
                    color={COLORS.skyBlueDark}
                  />
                </View>
                <Text style={styles.weatherTemp}>
                  {smartRoute.weather.middle.temperature}°F
                </Text>
                <Text style={styles.weatherLabel}>Middle</Text>
              </View>
              <View style={styles.weatherDivider} />
              <View style={styles.weatherPoint}>
                <View
                  style={[
                    styles.weatherIconContainer,
                    { backgroundColor: colors.sunsetOrange[100] },
                  ]}
                >
                  <Ionicons
                    name={
                      getWeatherIconName(
                        smartRoute.weather.end.condition,
                      ) as keyof typeof Ionicons.glyphMap
                    }
                    size={28}
                    color={colors.sunsetOrange[600]}
                  />
                </View>
                <Text style={styles.weatherTemp}>
                  {smartRoute.weather.end.temperature}°F
                </Text>
                <Text style={styles.weatherLabel}>End</Text>
              </View>
            </View>
          </View>

          {smartRoute.safety.warnings.length > 0 ? (
            <View style={styles.warningsContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="warning"
                  size={20}
                  color={colors.sunsetOrange[600]}
                />
                <Text style={styles.warningsTitle}>Warnings</Text>
              </View>
              {smartRoute.safety.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <View style={styles.warningBullet} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {smartRoute.safety.recommendations.length > 0 ? (
            <View style={styles.recommendationsContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={20} color={COLORS.amberDark} />
                <Text style={styles.recommendationsTitle}>Recommendations</Text>
              </View>
              {smartRoute.safety.recommendations
                .slice(0, 3)
                .map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View
                      style={[
                        styles.recommendationBullet,
                        { backgroundColor: COLORS.amber },
                      ]}
                    />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
            </View>
          ) : null}

          <View style={styles.aiBadge}>
            <Ionicons
              name="sparkles"
              size={16}
              color={colors.sunsetOrange[500]}
            />
            <Text style={styles.aiBadgeText}>AI Optimized Route</Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              const { latitude, longitude } = destination;
              const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
              Linking.openURL(fallbackUrl);
              onStartNavigation?.(destination, destinationName);
            }}
            activeOpacity={0.8}
            testID="button-start-navigation"
          >
            <LinearGradient
              colors={[colors.sunsetOrange[500], colors.sunsetOrange[600]]}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Navigation</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.warmCream,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.bark[700],
    fontWeight: "600",
  },
  loadingSubtext: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.desertSand,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: "bold",
    color: colors.bark[800],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.sunsetOrange[500],
    fontWeight: "600",
  },
  refreshButton: {
    padding: spacing.sm,
    backgroundColor: colors.sunsetOrange[100],
    borderRadius: borderRadius.full,
  },
  mapPlaceholder: {
    height: height * 0.28,
    width: "100%",
  },
  mapGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContent: {
    alignItems: "center",
  },
  mapText: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
    color: colors.bark[700],
    marginTop: spacing.sm,
  },
  mapSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    marginTop: spacing.xs,
  },
  routeVisual: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  routePoint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  routePointText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: typography.fontSize.sm,
  },
  routeDash: {
    width: 40,
    height: 3,
    backgroundColor: colors.bark[300],
    marginHorizontal: spacing.xs,
  },
  webNote: {
    fontSize: typography.fontSize.xs,
    color: colors.bark[400],
    marginTop: spacing.md,
    fontStyle: "italic",
  },
  infoCardContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  infoCard: {
    padding: spacing.lg,
  },
  routeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.desertSand,
  },
  routeEndpoints: {
    flex: 1,
    marginRight: spacing.md,
  },
  endpointRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  endpointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  endpointText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.sandDark,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeStats: {
    alignItems: "flex-end",
  },
  distance: {
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
    color: colors.bark[800],
  },
  duration: {
    fontSize: typography.fontSize.md,
    color: colors.bark[500],
    fontWeight: "600",
  },
  roadRiskBadge: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  roadRiskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  roadRiskLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginLeft: spacing.xs,
  },
  roadRiskLevel: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  roadRiskScoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  roadRiskScore: {
    fontSize: typography.fontSize.xl,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  roadRiskScoreMax: {
    fontSize: typography.fontSize.md,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  weatherSummary: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: colors.bark[800],
    marginLeft: spacing.sm,
  },
  weatherRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.lightCream,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  weatherPoint: {
    alignItems: "center",
    flex: 1,
  },
  weatherDivider: {
    width: 1,
    backgroundColor: COLORS.desertSand,
  },
  weatherIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  weatherTemp: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.bark[800],
  },
  weatherLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.bark[500],
    marginTop: 2,
  },
  warningsContainer: {
    backgroundColor: colors.sunsetOrange[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.sunsetOrange[500],
  },
  warningsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: colors.sunsetOrange[700],
    marginLeft: spacing.sm,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
  },
  warningBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sunsetOrange[500],
    marginTop: 6,
    marginRight: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
    lineHeight: 20,
  },
  recommendationsContainer: {
    backgroundColor: COLORS.amberLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.amber,
  },
  recommendationsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: COLORS.amberDark,
    marginLeft: spacing.sm,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
    lineHeight: 20,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sunsetOrange[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  aiBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.sunsetOrange[600],
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  startButton: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    shadowColor: colors.sunsetOrange[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: spacing.sm,
  },
});

export default SmartRouteScreen;
