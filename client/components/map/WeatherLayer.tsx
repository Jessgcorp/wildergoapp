/**
 * WilderGo Weather Layer
 * Visual overlay showing weather conditions for nomad planning
 * Features:
 * - Weather condition overlay
 * - Temperature display
 * - Wind indicators
 * - Weather alerts
 * - 5-day forecast preview
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  ScrollView,
  Dimensions,
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
  WeatherAlert,
  WeatherCondition,
  weatherConditionConfig,
  getWeatherForLocation,
  getWeatherAlerts,
  getWeatherOverlayStyle,
} from "@/services/map/advancedMapService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WeatherLayerProps {
  latitude: number;
  longitude: number;
  showOverlay?: boolean;
  onWeatherPress?: () => void;
}

// Weather widget shown on map
export const WeatherWidget: React.FC<WeatherLayerProps> = ({
  latitude,
  longitude,
  showOverlay = false,
  onWeatherPress,
}) => {
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const weather = useMemo(
    () => getWeatherForLocation(latitude, longitude),
    [latitude, longitude],
  );

  const alerts = useMemo(
    () => getWeatherAlerts(latitude, longitude),
    [latitude, longitude],
  );

  const hasAlerts = alerts.length > 0;

  // Pulse animation for alerts
  useEffect(() => {
    if (hasAlerts) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [hasAlerts, pulseAnim]);

  // Expand/collapse animation
  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 12,
    }).start();
  }, [expanded, expandAnim]);

  if (!weather) return null;

  const config = weatherConditionConfig[weather.condition];
  const widgetHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 200],
  });

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;
  const containerProps =
    Platform.OS === "ios"
      ? { tint: "light" as const, intensity: blur.medium }
      : {};

  return (
    <Animated.View style={[styles.widgetContainer, { height: widgetHeight }]}>
      <ContainerWrapper {...containerProps} style={styles.widget}>
        <TouchableOpacity
          style={styles.widgetHeader}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.8}
        >
          <View style={styles.weatherMain}>
            <View
              style={[
                styles.weatherIconBg,
                { backgroundColor: config.color + "20" },
              ]}
            >
              <Ionicons
                name={config.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={config.color}
              />
            </View>
            <View style={styles.weatherInfo}>
              <Text style={styles.temperature}>{weather.temperature}°F</Text>
              <Text style={styles.condition}>{config.label}</Text>
            </View>
          </View>

          <View style={styles.weatherMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="water-outline"
                size={14}
                color={colors.bark[400]}
              />
              <Text style={styles.metaText}>{weather.humidity}%</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="leaf-outline"
                size={14}
                color={colors.bark[400]}
              />
              <Text style={styles.metaText}>{weather.windSpeed} mph</Text>
            </View>
          </View>

          {hasAlerts && (
            <Animated.View
              style={[styles.alertBadge, { transform: [{ scale: pulseAnim }] }]}
            >
              <Ionicons name="warning" size={12} color={colors.text.inverse} />
            </Animated.View>
          )}

          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.bark[400]}
          />
        </TouchableOpacity>

        {/* Expanded content */}
        {expanded && (
          <Animated.View style={styles.expandedContent}>
            {/* Wind info */}
            <View style={styles.windInfo}>
              <Text style={styles.sectionLabel}>Wind</Text>
              <View style={styles.windDetails}>
                <View style={styles.windDirection}>
                  <Ionicons
                    name="compass"
                    size={20}
                    color={colors.forestGreen[500]}
                  />
                  <Text style={styles.windDirectionText}>
                    {weather.windDirection}
                  </Text>
                </View>
                <Text style={styles.windSpeed}>{weather.windSpeed} mph</Text>
              </View>
            </View>

            {/* Forecast preview */}
            {weather.forecast && (
              <View style={styles.forecastContainer}>
                <Text style={styles.sectionLabel}>5-Day Forecast</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.forecastRow}>
                    {weather.forecast.map((day, index) => {
                      const dayConfig = weatherConditionConfig[day.condition];
                      return (
                        <View key={index} style={styles.forecastDay}>
                          <Text style={styles.forecastDayName}>{day.day}</Text>
                          <Ionicons
                            name={
                              dayConfig.icon as keyof typeof Ionicons.glyphMap
                            }
                            size={18}
                            color={dayConfig.color}
                          />
                          <Text style={styles.forecastHigh}>{day.high}°</Text>
                          <Text style={styles.forecastLow}>{day.low}°</Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Alerts */}
            {hasAlerts && (
              <View style={styles.alertsContainer}>
                {alerts.map((alert) => (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertItem,
                      {
                        backgroundColor:
                          alert.severity === "severe" ||
                          alert.severity === "extreme"
                            ? colors.emergency.redLight
                            : colors.sunsetOrange[50],
                      },
                    ]}
                  >
                    <Ionicons
                      name="warning"
                      size={16}
                      color={
                        alert.severity === "severe" ||
                        alert.severity === "extreme"
                          ? colors.emergency.red
                          : colors.sunsetOrange[500]
                      }
                    />
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertDescription} numberOfLines={2}>
                        {alert.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </ContainerWrapper>
    </Animated.View>
  );
};

// Weather overlay for the entire map
interface WeatherOverlayProps {
  condition: WeatherCondition;
  visible: boolean;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  condition,
  visible,
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: visible ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [visible, opacityAnim]);

  const config = weatherConditionConfig[condition];

  return (
    <Animated.View
      style={[
        styles.overlay,
        { backgroundColor: config.overlayColor, opacity: opacityAnim },
      ]}
      pointerEvents="none"
    />
  );
};

// Toggle button for weather layer
interface WeatherToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  hasAlerts?: boolean;
}

export const WeatherToggle: React.FC<WeatherToggleProps> = ({
  isEnabled,
  onToggle,
  hasAlerts = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hasAlerts) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [hasAlerts, pulseAnim]);

  return (
    <Animated.View
      style={{ transform: [{ scale: hasAlerts ? pulseAnim : 1 }] }}
    >
      <TouchableOpacity
        style={[styles.toggleButton, isEnabled && styles.toggleButtonActive]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Ionicons
          name="cloudy"
          size={20}
          color={isEnabled ? colors.text.inverse : colors.bark[500]}
        />
        {hasAlerts && <View style={styles.alertDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Full weather details modal
interface WeatherDetailsModalProps {
  visible: boolean;
  weather: WeatherData | null;
  alerts: WeatherAlert[];
  onClose: () => void;
}

export const WeatherDetailsModal: React.FC<WeatherDetailsModalProps> = ({
  visible,
  weather,
  alerts,
  onClose,
}) => {
  if (!weather) return null;

  const config = weatherConditionConfig[weather.condition];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalBackdrop}>
          <LinearGradient
            colors={[config.color + "40", colors.background.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.3 }}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Weather Details</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.bark[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Current conditions */}
              <View style={styles.currentConditions}>
                <View
                  style={[
                    styles.largeIconBg,
                    { backgroundColor: config.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={config.icon as keyof typeof Ionicons.glyphMap}
                    size={64}
                    color={config.color}
                  />
                </View>
                <Text style={styles.largeTemperature}>
                  {weather.temperature}°F
                </Text>
                <Text style={styles.largeCondition}>{config.label}</Text>
                <Text style={styles.feelsLike}>
                  Feels like {weather.feelsLike}°F
                </Text>
              </View>

              {/* Details grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="water-outline"
                    size={24}
                    color={colors.deepTeal[500]}
                  />
                  <Text style={styles.detailValue}>{weather.humidity}%</Text>
                  <Text style={styles.detailLabel}>Humidity</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="leaf-outline"
                    size={24}
                    color={colors.forestGreen[500]}
                  />
                  <Text style={styles.detailValue}>
                    {weather.windSpeed} mph
                  </Text>
                  <Text style={styles.detailLabel}>Wind</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="sunny-outline"
                    size={24}
                    color={colors.sunsetOrange[500]}
                  />
                  <Text style={styles.detailValue}>{weather.uvIndex}</Text>
                  <Text style={styles.detailLabel}>UV Index</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="eye-outline"
                    size={24}
                    color={colors.bark[400]}
                  />
                  <Text style={styles.detailValue}>
                    {weather.visibility} mi
                  </Text>
                  <Text style={styles.detailLabel}>Visibility</Text>
                </View>
              </View>

              {/* Forecast */}
              {weather.forecast && (
                <View style={styles.fullForecast}>
                  <Text style={styles.forecastTitle}>5-Day Forecast</Text>
                  {weather.forecast.map((day, index) => {
                    const dayConfig = weatherConditionConfig[day.condition];
                    return (
                      <View key={index} style={styles.fullForecastDay}>
                        <Text style={styles.fullForecastDayName}>
                          {day.day}
                        </Text>
                        <View style={styles.fullForecastIcon}>
                          <Ionicons
                            name={
                              dayConfig.icon as keyof typeof Ionicons.glyphMap
                            }
                            size={24}
                            color={dayConfig.color}
                          />
                        </View>
                        <Text style={styles.fullForecastCondition}>
                          {dayConfig.label}
                        </Text>
                        <View style={styles.fullForecastTemps}>
                          <Text style={styles.fullForecastHigh}>
                            {day.high}°
                          </Text>
                          <Text style={styles.fullForecastLow}>{day.low}°</Text>
                        </View>
                        <View style={styles.fullForecastPrecip}>
                          <Ionicons
                            name="water"
                            size={12}
                            color={colors.deepTeal[400]}
                          />
                          <Text style={styles.fullForecastPrecipText}>
                            {day.precipChance}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Alerts */}
              {alerts.length > 0 && (
                <View style={styles.fullAlerts}>
                  <Text style={styles.alertsTitle}>Active Alerts</Text>
                  {alerts.map((alert) => (
                    <View key={alert.id} style={styles.fullAlertItem}>
                      <View style={styles.fullAlertHeader}>
                        <Ionicons
                          name="warning"
                          size={20}
                          color={
                            alert.severity === "severe" ||
                            alert.severity === "extreme"
                              ? colors.emergency.red
                              : colors.sunsetOrange[500]
                          }
                        />
                        <Text style={styles.fullAlertTitle}>{alert.title}</Text>
                        <View
                          style={[
                            styles.severityBadge,
                            {
                              backgroundColor:
                                alert.severity === "severe" ||
                                alert.severity === "extreme"
                                  ? colors.emergency.redLight
                                  : colors.sunsetOrange[100],
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.severityText,
                              {
                                color:
                                  alert.severity === "severe" ||
                                  alert.severity === "extreme"
                                    ? colors.emergency.red
                                    : colors.sunsetOrange[600],
                              },
                            ]}
                          >
                            {alert.severity.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.fullAlertDescription}>
                        {alert.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Widget styles
  widgetContainer: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glass,
  },
  widget: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: borderRadius.xl,
    backgroundColor: Platform.OS === "android" ? colors.glass.white : undefined,
  },
  widgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  weatherIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  weatherInfo: {
    gap: 2,
  },
  temperature: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
  },
  condition: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  weatherMeta: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  alertBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.sunsetOrange[500],
    justifyContent: "center",
    alignItems: "center",
  },
  // Expanded content
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bark[200],
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  windInfo: {
    marginBottom: spacing.md,
  },
  windDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  windDirection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  windDirectionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  windSpeed: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.display,
    color: colors.forestGreen[600],
  },
  forecastContainer: {
    marginBottom: spacing.md,
  },
  forecastRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  forecastDay: {
    alignItems: "center",
    gap: spacing.xxs,
    minWidth: 50,
  },
  forecastDayName: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
  },
  forecastHigh: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  forecastLow: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  alertsContainer: {
    gap: spacing.sm,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  alertDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  // Toggle button
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.deepTeal[500],
    borderColor: colors.deepTeal[600],
  },
  alertDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.sunsetOrange[500],
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  modalBody: {
    padding: spacing.lg,
  },
  // Current conditions
  currentConditions: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  largeIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  largeTemperature: {
    fontSize: typography.fontSize["4xl"],
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
  },
  largeCondition: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
  },
  feelsLike: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Details grid
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  detailItem: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2) / 2 - spacing.md,
    backgroundColor: colors.bark[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  // Full forecast
  fullForecast: {
    marginBottom: spacing.xl,
  },
  forecastTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
    marginBottom: spacing.md,
  },
  fullForecastDay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[100],
  },
  fullForecastDayName: {
    width: 70,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  fullForecastIcon: {
    width: 40,
    alignItems: "center",
  },
  fullForecastCondition: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  fullForecastTemps: {
    flexDirection: "row",
    gap: spacing.sm,
    marginRight: spacing.md,
  },
  fullForecastHigh: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  fullForecastLow: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  fullForecastPrecip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    width: 40,
  },
  fullForecastPrecipText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.deepTeal[500],
  },
  // Full alerts
  fullAlerts: {
    marginBottom: spacing.xl,
  },
  alertsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
    marginBottom: spacing.md,
  },
  fullAlertItem: {
    backgroundColor: colors.sunsetOrange[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  fullAlertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  fullAlertTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  severityText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  fullAlertDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default WeatherWidget;
