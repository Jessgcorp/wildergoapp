/**
 * Weather HUD Panel
 * Liquid Glass panel showing Real-Feel temperature and weather shifts
 * Premium outdoor aesthetic with high-intensity blur
 */

import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
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
  WeatherData,
  weatherConditionConfig,
  getWeatherForLocation,
} from "@/services/map/advancedMapService";

interface WeatherHUDProps {
  latitude: number;
  longitude: number;
  onExpand?: () => void;
  compact?: boolean;
}

export const WeatherHUD: React.FC<WeatherHUDProps> = ({
  latitude,
  longitude,
  onExpand,
  compact = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shiftIndicatorAnim = useRef(new Animated.Value(0)).current;

  const weather = useMemo(
    () => getWeatherForLocation(latitude, longitude),
    [latitude, longitude],
  );

  // Calculate weather shift (comparing to forecast)
  const weatherShift = useMemo(() => {
    if (!weather?.forecast || weather.forecast.length === 0) {
      return null;
    }

    const tomorrow = weather.forecast[0];
    const tempDiff = tomorrow.high - weather.temperature;
    const isWarming = tempDiff > 0;
    const shiftMagnitude = Math.abs(tempDiff);

    let shiftLabel = "Stable";
    if (shiftMagnitude > 15) {
      shiftLabel = isWarming
        ? "Warming significantly"
        : "Cooling significantly";
    } else if (shiftMagnitude > 8) {
      shiftLabel = isWarming ? "Warming" : "Cooling";
    } else if (shiftMagnitude > 3) {
      shiftLabel = isWarming ? "Slight warming" : "Slight cooling";
    }

    return {
      isWarming,
      magnitude: shiftMagnitude,
      label: shiftLabel,
      nextCondition: tomorrow.condition,
    };
  }, [weather]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animate shift indicator
    if (weatherShift && weatherShift.magnitude > 5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shiftIndicatorAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(shiftIndicatorAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [fadeAnim, shiftIndicatorAnim, weatherShift]);

  if (!weather) return null;

  const config = weatherConditionConfig[weather.condition];

  // Calculate feel difference
  const feelDiff = weather.feelsLike - weather.temperature;
  const feelDescription =
    Math.abs(feelDiff) <= 2
      ? "Feels accurate"
      : feelDiff > 0
        ? `Feels ${Math.abs(feelDiff)}° warmer`
        : `Feels ${Math.abs(feelDiff)}° cooler`;

  const renderContent = () => (
    <View style={[styles.content, compact && styles.contentCompact]}>
      {/* Current Weather Row */}
      <View style={styles.currentRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: config.color + "20" },
          ]}
        >
          <Ionicons
            name={config.icon as keyof typeof Ionicons.glyphMap}
            size={compact ? 20 : 28}
            color={config.color}
          />
        </View>

        <View style={styles.tempContainer}>
          <Text
            style={[styles.temperature, compact && styles.temperatureCompact]}
          >
            {weather.temperature}°
          </Text>
          <Text style={styles.condition}>{config.label}</Text>
        </View>

        {!compact && (
          <View style={styles.feelsLikeContainer}>
            <Text style={styles.feelsLikeLabel}>Real-Feel</Text>
            <Text style={[styles.feelsLikeTemp, { color: config.color }]}>
              {weather.feelsLike}°F
            </Text>
            <Text style={styles.feelsLikeDesc}>{feelDescription}</Text>
          </View>
        )}
      </View>

      {/* Weather Metrics */}
      {!compact && (
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Ionicons
              name="water-outline"
              size={16}
              color={colors.deepTeal[500]}
            />
            <Text style={styles.metricValue}>{weather.humidity}%</Text>
            <Text style={styles.metricLabel}>Humidity</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Ionicons
              name="leaf-outline"
              size={16}
              color={colors.forestGreen[500]}
            />
            <Text style={styles.metricValue}>{weather.windSpeed} mph</Text>
            <Text style={styles.metricLabel}>{weather.windDirection}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Ionicons
              name="sunny-outline"
              size={16}
              color={colors.sunsetOrange[500]}
            />
            <Text style={styles.metricValue}>{weather.uvIndex}</Text>
            <Text style={styles.metricLabel}>UV Index</Text>
          </View>
        </View>
      )}

      {/* Weather Shift Indicator */}
      {weatherShift && weatherShift.magnitude > 3 && (
        <Animated.View
          style={[
            styles.shiftContainer,
            compact && styles.shiftContainerCompact,
            {
              opacity: shiftIndicatorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={
              weatherShift.isWarming
                ? [
                    colors.sunsetOrange[500] + "20",
                    colors.sunsetOrange[500] + "10",
                  ]
                : [colors.deepTeal[500] + "20", colors.deepTeal[500] + "10"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shiftGradient}
          >
            <Ionicons
              name={weatherShift.isWarming ? "trending-up" : "trending-down"}
              size={16}
              color={
                weatherShift.isWarming
                  ? colors.sunsetOrange[500]
                  : colors.deepTeal[500]
              }
            />
            <Text
              style={[
                styles.shiftText,
                {
                  color: weatherShift.isWarming
                    ? colors.sunsetOrange[600]
                    : colors.deepTeal[600],
                },
              ]}
            >
              {weatherShift.label}
            </Text>
            {weatherShift.nextCondition !== weather.condition && (
              <>
                <Ionicons
                  name="arrow-forward"
                  size={12}
                  color={colors.bark[400]}
                />
                <Ionicons
                  name={
                    weatherConditionConfig[weatherShift.nextCondition]
                      .icon as keyof typeof Ionicons.glyphMap
                  }
                  size={14}
                  color={
                    weatherConditionConfig[weatherShift.nextCondition].color
                  }
                />
              </>
            )}
          </LinearGradient>
        </Animated.View>
      )}

      {/* Expand Button */}
      {onExpand && (
        <TouchableOpacity style={styles.expandButton} onPress={onExpand}>
          <Text style={styles.expandText}>Full Forecast</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.bark[400]} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        compact && styles.containerCompact,
        { opacity: fadeAnim },
      ]}
    >
      {Platform.OS === "ios" ? (
        <BlurView
          tint="light"
          intensity={blur.heavy}
          style={[styles.blurContainer, compact && styles.blurContainerCompact]}
        >
          {renderContent()}
        </BlurView>
      ) : (
        <View
          style={[
            styles.androidContainer,
            compact && styles.androidContainerCompact,
          ]}
        >
          {renderContent()}
        </View>
      )}
    </Animated.View>
  );
};

// Mini weather indicator for map control bar
interface MiniWeatherIndicatorProps {
  latitude: number;
  longitude: number;
  onPress: () => void;
}

export const MiniWeatherIndicator: React.FC<MiniWeatherIndicatorProps> = ({
  latitude,
  longitude,
  onPress,
}) => {
  const weather = useMemo(
    () => getWeatherForLocation(latitude, longitude),
    [latitude, longitude],
  );

  if (!weather) return null;

  const config = weatherConditionConfig[weather.condition];

  return (
    <TouchableOpacity
      style={styles.miniContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {Platform.OS === "ios" ? (
        <BlurView tint="light" intensity={blur.medium} style={styles.miniBlur}>
          <View style={styles.miniContent}>
            <Ionicons
              name={config.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={config.color}
            />
            <Text style={styles.miniTemp}>{weather.temperature}°</Text>
          </View>
        </BlurView>
      ) : (
        <View style={styles.miniAndroid}>
          <Ionicons
            name={config.icon as keyof typeof Ionicons.glyphMap}
            size={16}
            color={config.color}
          />
          <Text style={styles.miniTemp}>{weather.temperature}°</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.liquidLg,
    overflow: "hidden",
    ...shadows.glass,
  },
  containerCompact: {
    borderRadius: borderRadius.liquid,
  },
  blurContainer: {
    borderRadius: borderRadius.liquidLg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  blurContainerCompact: {
    borderRadius: borderRadius.liquid,
  },
  androidContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: borderRadius.liquidLg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  androidContainerCompact: {
    borderRadius: borderRadius.liquid,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  contentCompact: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  currentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  tempContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: typography.fontSize["3xl"],
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    lineHeight: typography.fontSize["3xl"] * 1.1,
  },
  temperatureCompact: {
    fontSize: typography.fontSize.xl,
  },
  condition: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  feelsLikeContainer: {
    alignItems: "flex-end",
    backgroundColor: colors.glass.whiteSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  feelsLikeLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  feelsLikeTemp: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.display,
  },
  feelsLikeDesc: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xxs,
  },
  metricValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  metricLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.bark[200],
  },
  shiftContainer: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  shiftContainerCompact: {
    marginTop: spacing.xs,
  },
  shiftGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  shiftText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bark[100],
  },
  expandText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.secondary,
  },
  // Mini indicator
  miniContainer: {
    borderRadius: borderRadius.full,
    overflow: "hidden",
    ...shadows.sm,
  },
  miniBlur: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  miniAndroid: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glass.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  miniContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  miniTemp: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
});

export default WeatherHUD;
