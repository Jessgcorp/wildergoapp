/**
 * WilderGo Enhanced Weather HUD
 * Floating frosted glass panel with Real-Feel, wind direction,
 * and AI-powered "Nomadic Outlook" summary
 * Liquid Glass aesthetic with soft edges and organic movement
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  borderRadius,
  spacing,
  typography,
  shadows,
  blur,
} from "@/constants/theme";
import {
  weatherConditionConfig,
  getWeatherForLocation,
} from "@/services/map/advancedMapService";
import {
  generateNomadicOutlook,
  getQuickWeatherSummary,
  getOutlookRatingColor,
  getOutlookRatingIcon,
  NomadicOutlook,
  WeatherConditions,
} from "@/services/ai/weatherAIService";

interface EnhancedWeatherHUDProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  onExpand?: () => void;
  onClose?: () => void;
}

export const EnhancedWeatherHUD: React.FC<EnhancedWeatherHUDProps> = ({
  latitude,
  longitude,
  locationName,
  onExpand,
  onClose,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [outlook, setOutlook] = useState<NomadicOutlook | null>(null);
  const [quickSummary, setQuickSummary] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const windArrowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const weather = useMemo(
    () => getWeatherForLocation(latitude, longitude),
    [latitude, longitude],
  );

  // Convert weather data to conditions format
  const weatherConditions: WeatherConditions | null = useMemo(() => {
    if (!weather) return null;
    return {
      temperature: weather.temperature,
      feelsLike: weather.feelsLike,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      windDirection: weather.windDirection,
      condition: weather.condition,
      uvIndex: weather.uvIndex,
      visibility: weather.visibility,
      forecast: weather.forecast,
    };
  }, [weather]);

  // Load AI summary on mount
  useEffect(() => {
    if (weatherConditions && !quickSummary) {
      getQuickWeatherSummary(weatherConditions)
        .then(setQuickSummary)
        .catch(console.error);
    }
  }, [weatherConditions, quickSummary]);

  // Entrance animation
  // Note: useNativeDriver must be false because this animation shares
  // the same Animated.View with height animation (which doesn't support native driver)
  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [fadeAnim]);

  // Expand/collapse animation
  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: false,
      tension: 65,
      friction: 10,
    }).start();
  }, [expanded, expandAnim]);

  // Wind direction arrow animation
  useEffect(() => {
    if (weather) {
      const windDegrees = getWindDirectionDegrees(weather.windDirection);
      Animated.spring(windArrowAnim, {
        toValue: windDegrees,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();
    }
  }, [weather, windArrowAnim]);

  // Pulse animation for severe conditions
  // Note: useNativeDriver must be false because this animation shares
  // the same Animated.View with height animation (which doesn't support native driver)
  useEffect(() => {
    if (weather && (weather.windSpeed > 20 || weather.condition === "storm")) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [weather, pulseAnim]);

  // Load full outlook when expanded
  const loadFullOutlook = useCallback(async () => {
    if (!weatherConditions || outlook) return;

    setIsLoadingAI(true);
    try {
      const result = await generateNomadicOutlook(
        weatherConditions,
        locationName,
      );
      setOutlook(result);
    } catch (error) {
      console.error("Error loading outlook:", error);
    } finally {
      setIsLoadingAI(false);
    }
  }, [weatherConditions, locationName, outlook]);

  const handleExpand = useCallback(() => {
    setExpanded(!expanded);
    if (!expanded && !outlook) {
      loadFullOutlook();
    }
  }, [expanded, outlook, loadFullOutlook]);

  if (!weather) return null;

  const config = weatherConditionConfig[weather.condition];
  const feelDiff = weather.feelsLike - weather.temperature;
  const feelDescription =
    Math.abs(feelDiff) <= 2
      ? "Accurate"
      : feelDiff > 0
        ? `+${Math.abs(feelDiff)}° warmer`
        : `-${Math.abs(feelDiff)}° cooler`;

  const containerHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 400],
  });

  const renderContent = () => (
    <View style={styles.content}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.weatherMain}>
          {/* Weather Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.color + "25" },
            ]}
          >
            <Ionicons
              name={config.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={config.color}
            />
          </View>

          {/* Temperature */}
          <View style={styles.tempSection}>
            <Text style={styles.temperature}>{weather.temperature}°</Text>
            <Text style={styles.condition}>{config.label}</Text>
          </View>
        </View>

        {/* Real-Feel Panel */}
        <View style={styles.realFeelPanel}>
          <Text style={styles.realFeelLabel}>Real-Feel</Text>
          <Text style={[styles.realFeelTemp, { color: config.color }]}>
            {weather.feelsLike}°F
          </Text>
          <Text style={styles.realFeelDiff}>{feelDescription}</Text>
        </View>

        {/* Close/Expand */}
        <View style={styles.headerActions}>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.bark[400]} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleExpand} style={styles.expandBtn}>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.bark[500]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Wind & Metrics Row */}
      <View style={styles.metricsRow}>
        {/* Wind Direction Compass */}
        <View style={styles.windCompass}>
          <View style={styles.compassRing}>
            <Animated.View
              style={[
                styles.windArrow,
                {
                  transform: [
                    {
                      rotate: windArrowAnim.interpolate({
                        inputRange: [0, 360],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="navigate" size={16} color={colors.moss[500]} />
            </Animated.View>
          </View>
          <Text style={styles.windLabel}>{weather.windDirection}</Text>
        </View>

        {/* Wind Speed */}
        <View style={styles.metric}>
          <Ionicons
            name="leaf-outline"
            size={16}
            color={colors.forestGreen[500]}
          />
          <Text style={styles.metricValue}>{weather.windSpeed}</Text>
          <Text style={styles.metricUnit}>mph</Text>
        </View>

        {/* Humidity */}
        <View style={styles.metric}>
          <Ionicons
            name="water-outline"
            size={16}
            color={colors.deepTeal[500]}
          />
          <Text style={styles.metricValue}>{weather.humidity}</Text>
          <Text style={styles.metricUnit}>%</Text>
        </View>

        {/* UV Index */}
        <View style={styles.metric}>
          <Ionicons
            name="sunny-outline"
            size={16}
            color={colors.sunsetOrange[500]}
          />
          <Text style={styles.metricValue}>{weather.uvIndex}</Text>
          <Text style={styles.metricUnit}>UV</Text>
        </View>
      </View>

      {/* AI Nomadic Outlook Summary */}
      {quickSummary && !expanded && (
        <View style={styles.quickSummaryContainer}>
          <LinearGradient
            colors={["rgba(245, 239, 230, 0.8)", "rgba(237, 229, 216, 0.6)"]}
            style={styles.quickSummaryGradient}
          >
            <Ionicons name="bulb-outline" size={14} color={colors.ember[500]} />
            <Text style={styles.quickSummaryText} numberOfLines={2}>
              {quickSummary}
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Expanded Content - Full Nomadic Outlook */}
      {expanded && (
        <Animated.View
          style={[
            styles.expandedContent,
            {
              opacity: expandAnim,
            },
          ]}
        >
          {isLoadingAI ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.ember[500]} />
              <Text style={styles.loadingText}>
                Generating Nomadic Outlook...
              </Text>
            </View>
          ) : outlook ? (
            <>
              {/* Outlook Header */}
              <View style={styles.outlookHeader}>
                <View
                  style={[
                    styles.ratingBadge,
                    {
                      backgroundColor: getOutlookRatingColor(
                        outlook.overallRating,
                      ),
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      getOutlookRatingIcon(
                        outlook.overallRating,
                      ) as keyof typeof Ionicons.glyphMap
                    }
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.ratingText}>
                    {outlook.overallRating.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.outlookHeadline}>{outlook.headline}</Text>
              </View>

              {/* Summary */}
              <Text style={styles.outlookSummary}>{outlook.summary}</Text>

              {/* Advice Section */}
              {outlook.advice.length > 0 && (
                <View style={styles.adviceSection}>
                  <Text style={styles.sectionTitle}>Nomad Tips</Text>
                  {outlook.advice.map((tip, index) => (
                    <View key={index} style={styles.adviceItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={colors.moss[500]}
                      />
                      <Text style={styles.adviceText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Warnings */}
              {outlook.warnings.length > 0 && (
                <View style={styles.warningsSection}>
                  {outlook.warnings.map((warning, index) => (
                    <View key={index} style={styles.warningItem}>
                      <Ionicons
                        name="alert-circle"
                        size={14}
                        color={colors.ember[500]}
                      />
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Activity Suggestions */}
              {outlook.activitySuggestions.length > 0 && (
                <View style={styles.activitiesSection}>
                  <Text style={styles.sectionTitle}>Great For</Text>
                  <View style={styles.activitiesTags}>
                    {outlook.activitySuggestions.map((activity, index) => (
                      <View key={index} style={styles.activityTag}>
                        <Text style={styles.activityTagText}>{activity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity
              style={styles.loadOutlookBtn}
              onPress={loadFullOutlook}
            >
              <Ionicons name="sparkles" size={16} color={colors.ember[500]} />
              <Text style={styles.loadOutlookText}>Get AI Weather Insight</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
          height: containerHeight,
        },
      ]}
    >
      {Platform.OS === "ios" ? (
        <BlurView
          tint="light"
          intensity={blur.heavy}
          style={styles.blurContainer}
        >
          {renderContent()}
        </BlurView>
      ) : (
        <View style={styles.androidContainer}>{renderContent()}</View>
      )}
    </Animated.View>
  );
};

/**
 * Convert wind direction string to degrees for compass rotation
 */
function getWindDirectionDegrees(direction: string): number {
  const directions: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  };
  return directions[direction] || 0;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.liquidLg,
    overflow: "hidden",
    ...shadows.glass,
  },
  blurContainer: {
    flex: 1,
    borderRadius: borderRadius.liquidLg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  androidContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: borderRadius.liquidLg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  tempSection: {
    gap: 2,
  },
  temperature: {
    fontSize: typography.fontSize["3xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    lineHeight: typography.fontSize["3xl"] * 1.1,
  },
  condition: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  realFeelPanel: {
    backgroundColor: colors.glass.whiteSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  realFeelLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  realFeelTemp: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
  },
  realFeelDiff: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  headerActions: {
    flexDirection: "column",
    gap: spacing.xs,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass.whiteSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  expandBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass.whiteSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  windCompass: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  compassRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.bark[200],
    justifyContent: "center",
    alignItems: "center",
  },
  windArrow: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  windLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
  },
  metric: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  metricValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  metricUnit: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  quickSummaryContainer: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  quickSummaryGradient: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  quickSummaryText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[700],
    lineHeight: 18,
  },
  expandedContent: {
    flex: 1,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bark[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  outlookHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  outlookHeadline: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
  },
  outlookSummary: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  adviceSection: {
    marginBottom: spacing.md,
  },
  adviceItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  adviceText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[700],
    lineHeight: 18,
  },
  warningsSection: {
    backgroundColor: colors.ember[50],
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.ember[700],
    lineHeight: 18,
  },
  activitiesSection: {
    marginBottom: spacing.sm,
  },
  activitiesTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  activityTag: {
    backgroundColor: colors.moss[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  activityTagText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.moss[700],
  },
  loadOutlookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.lg,
  },
  loadOutlookText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.ember[500],
  },
});

export default EnhancedWeatherHUD;
