import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import {
  SmartRouteSuggestion,
  SmartRouteWaypoint,
} from "@/services/map/mapService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SmartRouteWeatherProps {
  route: SmartRouteSuggestion | null;
  onClose?: () => void;
  onWaypointSelect?: (waypoint: SmartRouteWaypoint, index: number) => void;
  compact?: boolean;
}

const getWeatherIcon = (condition: string): string => {
  switch (condition) {
    case "clear":
      return "sunny";
    case "cloudy":
      return "cloudy";
    case "rain":
      return "rainy";
    case "storm":
      return "thunderstorm";
    case "snow":
      return "snow";
    case "fog":
      return "cloudy-outline";
    case "windy":
      return "leaf";
    default:
      return "partly-sunny";
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "excellent":
      return colors.forestGreen[600];
    case "good":
      return colors.forestGreen[500];
    case "fair":
      return colors.sunsetOrange[500];
    case "poor":
      return colors.emergency.primary;
    case "dangerous":
      return colors.emergency.red;
    default:
      return colors.text.secondary;
  }
};

const getImpactBadgeColor = (impact: string) => {
  switch (impact) {
    case "excellent":
      return { bg: "#E8F5E9", text: colors.forestGreen[600] };
    case "good":
      return { bg: "#E3F2E8", text: colors.forestGreen[500] };
    case "fair":
      return { bg: "#FFF3E0", text: colors.sunsetOrange[600] };
    case "poor":
      return { bg: "#FFEBEE", text: colors.emergency.primary };
    case "dangerous":
      return { bg: "#FFEBEE", text: colors.emergency.red };
    default:
      return { bg: colors.background.secondary, text: colors.text.secondary };
  }
};

const WaypointWeatherCard: React.FC<{
  waypoint: SmartRouteWaypoint;
  index: number;
  isLast: boolean;
  onPress?: () => void;
}> = ({ waypoint, index, isLast, onPress }) => {
  const impactColors = getImpactBadgeColor(waypoint.weatherImpact || "good");
  const weather = waypoint.weather;

  return (
    <TouchableOpacity
      style={[styles.waypointCard, isLast && styles.waypointCardLast]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.waypointHeader}>
        <View style={styles.waypointIndex}>
          <Text style={styles.waypointIndexText}>{index + 1}</Text>
        </View>
        <View style={styles.waypointInfo}>
          <Text style={styles.waypointName}>{waypoint.name}</Text>
          <Text style={styles.waypointTime}>{waypoint.arrivalTime}</Text>
        </View>
        {weather ? (
          <View style={styles.weatherQuick}>
            <Ionicons
              name={getWeatherIcon(weather.condition) as any}
              size={24}
              color={colors.burntSienna[500]}
            />
            <Text style={styles.weatherTemp}>{weather.temperature}°</Text>
          </View>
        ) : null}
      </View>

      {weather ? (
        <>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherStat}>
              <Ionicons
                name="water-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Text style={styles.weatherStatText}>{weather.humidity}%</Text>
            </View>
            <View style={styles.weatherStat}>
              <Ionicons
                name="leaf-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Text style={styles.weatherStatText}>
                {weather.windSpeed} mph
              </Text>
            </View>
            <View style={styles.weatherStat}>
              <Ionicons
                name="umbrella-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Text style={styles.weatherStatText}>
                {weather.precipitation}%
              </Text>
            </View>
            <View
              style={[styles.impactBadge, { backgroundColor: impactColors.bg }]}
            >
              <Text style={[styles.impactText, { color: impactColors.text }]}>
                {waypoint.weatherImpact?.toUpperCase()}
              </Text>
            </View>
          </View>

          {waypoint.aiRecommendation ? (
            <View style={styles.aiRecommendation}>
              <Ionicons
                name="sparkles"
                size={14}
                color={colors.forestGreen[500]}
              />
              <Text style={styles.aiRecommendationText}>
                {waypoint.aiRecommendation}
              </Text>
            </View>
          ) : null}

          {weather.alert ? (
            <View
              style={[
                styles.alertBanner,
                weather.alert.type === "danger"
                  ? styles.alertDanger
                  : styles.alertWarning,
              ]}
            >
              <Ionicons
                name="warning"
                size={14}
                color={
                  weather.alert.type === "danger"
                    ? colors.emergency.red
                    : colors.sunsetOrange[600]
                }
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{weather.alert.message}</Text>
                <Text style={styles.alertAction}>{weather.alert.action}</Text>
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {!isLast ? (
        <View style={styles.connector}>
          <View style={styles.connectorLine} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export const SmartRouteWeather: React.FC<SmartRouteWeatherProps> = ({
  route,
  onClose,
  onWaypointSelect,
  compact = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (route) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [route, fadeAnim]);

  if (!route) return null;

  const summaryColors = getImpactBadgeColor(
    route.weatherSummary?.overallRating || "good",
  );

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, { opacity: fadeAnim }]}>
        <View style={styles.compactHeader}>
          <View style={styles.compactLeft}>
            <Ionicons
              name="navigate"
              size={18}
              color={colors.burntSienna[500]}
            />
            <Text style={styles.compactRouteName} numberOfLines={1}>
              {route.name}
            </Text>
          </View>
          <View
            style={[styles.compactBadge, { backgroundColor: summaryColors.bg }]}
          >
            <Ionicons
              name="partly-sunny"
              size={12}
              color={summaryColors.text}
            />
            <Text
              style={[styles.compactBadgeText, { color: summaryColors.text }]}
            >
              {route.weatherSummary?.overallRating?.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.compactRecommendation} numberOfLines={2}>
          {route.weatherSummary?.recommendation}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="navigate" size={20} color={colors.burntSienna[500]} />
          <Text style={styles.routeName}>{route.name}</Text>
          {route.aiOptimized ? (
            <View style={styles.aiBadge}>
              <Ionicons
                name="sparkles"
                size={12}
                color={colors.forestGreen[500]}
              />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          ) : null}
        </View>
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {route.weatherSummary ? (
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={["#F5EFE6", "#E8DCC8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryTop}>
              <View
                style={[
                  styles.summaryBadge,
                  { backgroundColor: summaryColors.bg },
                ]}
              >
                <Text
                  style={[
                    styles.summaryBadgeText,
                    { color: summaryColors.text },
                  ]}
                >
                  {route.weatherSummary.overallRating?.toUpperCase()} CONDITIONS
                </Text>
              </View>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.summaryStatText}>
                    {route.estimatedTravelTime}
                  </Text>
                </View>
                {route.weatherSummary.alerts > 0 ? (
                  <View style={styles.summaryStat}>
                    <Ionicons
                      name="warning-outline"
                      size={14}
                      color={colors.sunsetOrange[500]}
                    />
                    <Text
                      style={[
                        styles.summaryStatText,
                        { color: colors.sunsetOrange[600] },
                      ]}
                    >
                      {route.weatherSummary.alerts} alert
                      {route.weatherSummary.alerts > 1 ? "s" : ""}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.summaryDeparture}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.forestGreen[600]}
              />
              <Text style={styles.departureText}>
                Best departure:{" "}
                <Text style={styles.departureTime}>
                  {route.weatherSummary.bestDepartureWindow}
                </Text>
              </Text>
            </View>
            <Text style={styles.recommendation}>
              {route.weatherSummary.recommendation}
            </Text>
          </LinearGradient>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Route Weather Timeline</Text>

      <ScrollView
        style={styles.waypointsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.waypointsContent}
      >
        {route.waypoints.map((waypoint, index) => (
          <WaypointWeatherCard
            key={`${waypoint.name}-${index}`}
            waypoint={waypoint}
            index={index}
            isLast={index === route.waypoints.length - 1}
            onPress={() => onWaypointSelect?.(waypoint, index)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  routeName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    flex: 1,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  aiBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.forestGreen[600],
  },
  closeButton: {
    padding: spacing.xs,
  },
  summaryCard: {
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  summaryGradient: {
    padding: spacing.md,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  summaryBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyBold,
  },
  summaryStats: {
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryStatText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.secondary,
  },
  summaryDeparture: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  departureText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  departureTime: {
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[600],
  },
  recommendation: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  waypointsList: {
    maxHeight: 300,
  },
  waypointsContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  waypointCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    position: "relative",
  },
  waypointCardLast: {
    marginBottom: 0,
  },
  waypointHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  waypointIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.burntSienna[500],
    justifyContent: "center",
    alignItems: "center",
  },
  waypointIndexText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyBold,
    color: "#FFFFFF",
  },
  waypointInfo: {
    flex: 1,
  },
  waypointName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  waypointTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  weatherQuick: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  weatherTemp: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  weatherDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  weatherStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  weatherStatText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  impactBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  impactText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodyBold,
  },
  aiRecommendation: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: "#E8F5E9",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  aiRecommendationText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.forestGreen[600],
    flex: 1,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  alertWarning: {
    backgroundColor: "#FFF3E0",
  },
  alertDanger: {
    backgroundColor: "#FFEBEE",
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  alertAction: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginTop: 2,
  },
  connector: {
    position: "absolute",
    left: spacing.md + 11,
    bottom: -spacing.sm - 2,
    zIndex: 1,
  },
  connectorLine: {
    width: 2,
    height: spacing.sm + 4,
    backgroundColor: colors.border.primary,
  },
  compactContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  compactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  compactLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  compactRouteName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    flex: 1,
  },
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  compactBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodyBold,
  },
  compactRecommendation: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});

export default SmartRouteWeather;
