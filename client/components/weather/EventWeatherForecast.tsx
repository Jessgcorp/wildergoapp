import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import { AnimatedWeatherIcon } from "./AnimatedWeatherIcons";

export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "stormy"
  | "windy"
  | "foggy"
  | "partlyCloudy"
  | "clear";
export type AlertSeverity = "info" | "warning" | "danger";

export interface HourlyForecast {
  hour: string;
  condition: WeatherCondition;
  temperature: number;
  windSpeed: number;
  precipChance: number;
}

export interface EventWeatherData {
  eventId: string;
  eventTitle: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  currentCondition: WeatherCondition;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipChance: number;
  uvIndex: number;
  visibility: number;
  cloudCover: number;
  sunriseTime: string;
  sunsetTime: string;
  moonPhase: string;
  hourlyForecast: HourlyForecast[];
  weatherImpact: EventWeatherImpact;
  alerts?: WeatherAlert[];
}

export interface EventWeatherImpact {
  overallRating: "excellent" | "good" | "fair" | "poor" | "dangerous";
  activitySpecificNotes: string[];
  recommendations: string[];
  goldenHour?: { start: string; end: string };
  blueHour?: { start: string; end: string };
  stargazingConditions?: "excellent" | "good" | "fair" | "poor";
}

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  validFrom: string;
  validTo: string;
  affectedArea: string;
  safetyActions: string[];
}

interface EventWeatherForecastProps {
  weather: EventWeatherData;
  onDismissAlert?: (alertId: string) => void;
  compact?: boolean;
}

const impactColors: Record<EventWeatherImpact["overallRating"], string> = {
  excellent: "#22C55E",
  good: "#84CC16",
  fair: "#F59E0B",
  poor: "#EF4444",
  dangerous: "#DC2626",
};

const alertColors: Record<
  AlertSeverity,
  { bg: string; border: string; icon: string }
> = {
  info: { bg: "rgba(59, 130, 246, 0.15)", border: "#3B82F6", icon: "#3B82F6" },
  warning: {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "#F59E0B",
    icon: "#F59E0B",
  },
  danger: { bg: "rgba(239, 68, 68, 0.15)", border: "#EF4444", icon: "#EF4444" },
};

export const EventWeatherForecast: React.FC<EventWeatherForecastProps> = ({
  weather,
  onDismissAlert,
  compact = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getConditionLabel = (condition: WeatherCondition): string => {
    const labels: Record<WeatherCondition, string> = {
      sunny: "Sunny",
      cloudy: "Cloudy",
      rainy: "Rainy",
      snowy: "Snowy",
      stormy: "Stormy",
      windy: "Windy",
      foggy: "Foggy",
      partlyCloudy: "Partly Cloudy",
      clear: "Clear",
    };
    return labels[condition];
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {weather.alerts && weather.alerts.length > 0 ? (
        <View style={styles.alertsSection}>
          {weather.alerts.map((alert) => (
            <WeatherAlertCard
              key={alert.id}
              alert={alert}
              onDismiss={() => onDismissAlert?.(alert.id)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.mainWeatherCard}>
        <View style={styles.weatherHeader}>
          <View style={styles.conditionSection}>
            <AnimatedWeatherIcon
              condition={
                weather.currentCondition === "partlyCloudy"
                  ? "cloudy"
                  : weather.currentCondition === "clear"
                    ? "sunny"
                    : weather.currentCondition
              }
              size={compact ? 36 : 48}
              color={colors.ember[500]}
            />
            <View style={styles.conditionInfo}>
              <Text style={styles.temperature}>{weather.temperature}°F</Text>
              <Text style={styles.conditionText}>
                {getConditionLabel(weather.currentCondition)}
              </Text>
              <Text style={styles.feelsLike}>
                Feels like {weather.feelsLike}°F
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.impactBadge,
              {
                backgroundColor:
                  impactColors[weather.weatherImpact.overallRating],
              },
            ]}
          >
            <Text style={styles.impactText}>
              {weather.weatherImpact.overallRating.toUpperCase()}
            </Text>
          </View>
        </View>

        {!compact ? (
          <>
            <View style={styles.detailsGrid}>
              <WeatherDetailItem
                icon="water"
                label="Humidity"
                value={`${weather.humidity}%`}
              />
              <WeatherDetailItem
                icon="speedometer"
                label="Wind"
                value={`${weather.windSpeed} mph ${weather.windDirection}`}
              />
              <WeatherDetailItem
                icon="rainy"
                label="Precip"
                value={`${weather.precipChance}%`}
              />
              <WeatherDetailItem
                icon="sunny"
                label="UV Index"
                value={`${weather.uvIndex}`}
              />
              <WeatherDetailItem
                icon="eye"
                label="Visibility"
                value={`${weather.visibility} mi`}
              />
              <WeatherDetailItem
                icon="cloud"
                label="Cloud Cover"
                value={`${weather.cloudCover}%`}
              />
            </View>

            <View style={styles.sunMoonSection}>
              <View style={styles.sunMoonItem}>
                <Ionicons
                  name="sunny-outline"
                  size={18}
                  color={colors.ember[500]}
                />
                <Text style={styles.sunMoonLabel}>Sunrise</Text>
                <Text style={styles.sunMoonValue}>{weather.sunriseTime}</Text>
              </View>
              <View style={styles.sunMoonItem}>
                <Ionicons
                  name="moon-outline"
                  size={18}
                  color={colors.bark[500]}
                />
                <Text style={styles.sunMoonLabel}>Sunset</Text>
                <Text style={styles.sunMoonValue}>{weather.sunsetTime}</Text>
              </View>
              <View style={styles.sunMoonItem}>
                <Ionicons name="moon" size={18} color={colors.bark[400]} />
                <Text style={styles.sunMoonLabel}>Moon</Text>
                <Text style={styles.sunMoonValue}>{weather.moonPhase}</Text>
              </View>
            </View>
          </>
        ) : null}
      </View>

      {!compact ? (
        <>
          <View style={styles.hourlySection}>
            <Text style={styles.sectionTitle}>Hour-by-Hour Forecast</Text>
            <View style={styles.hourlyScrollContainer}>
              {weather.hourlyForecast.map((hour, index) => (
                <HourlyForecastCard key={index} forecast={hour} />
              ))}
            </View>
          </View>

          <View style={styles.impactSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.moss[500]}
              />{" "}
              Event-Specific Impact
            </Text>
            <View style={styles.impactNotes}>
              {weather.weatherImpact.activitySpecificNotes.map(
                (note, index) => (
                  <View key={index} style={styles.noteRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.moss[500]}
                    />
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ),
              )}
            </View>

            {weather.weatherImpact.recommendations.length > 0 ? (
              <View style={styles.recommendationsSection}>
                <Text style={styles.recommendationsTitle}>Recommendations</Text>
                {weather.weatherImpact.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recRow}>
                    <Ionicons name="bulb" size={14} color={colors.ember[500]} />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {weather.weatherImpact.goldenHour ? (
              <View style={styles.lightingInfo}>
                <View style={styles.lightingItem}>
                  <LinearGradient
                    colors={["#FF9500", "#FFD60A"]}
                    style={styles.lightingBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="sunny" size={12} color="#FFFFFF" />
                    <Text style={styles.lightingBadgeText}>Golden Hour</Text>
                  </LinearGradient>
                  <Text style={styles.lightingTime}>
                    {weather.weatherImpact.goldenHour.start} -{" "}
                    {weather.weatherImpact.goldenHour.end}
                  </Text>
                </View>
              </View>
            ) : null}

            {weather.weatherImpact.blueHour ? (
              <View style={styles.lightingInfo}>
                <View style={styles.lightingItem}>
                  <LinearGradient
                    colors={["#5E5CE6", "#007AFF"]}
                    style={styles.lightingBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="moon" size={12} color="#FFFFFF" />
                    <Text style={styles.lightingBadgeText}>Blue Hour</Text>
                  </LinearGradient>
                  <Text style={styles.lightingTime}>
                    {weather.weatherImpact.blueHour.start} -{" "}
                    {weather.weatherImpact.blueHour.end}
                  </Text>
                </View>
              </View>
            ) : null}

            {weather.weatherImpact.stargazingConditions ? (
              <View style={styles.stargazingRow}>
                <Ionicons name="star" size={16} color={colors.bark[400]} />
                <Text style={styles.stargazingLabel}>Stargazing:</Text>
                <Text
                  style={[
                    styles.stargazingValue,
                    {
                      color:
                        impactColors[
                          weather.weatherImpact.stargazingConditions ===
                          "excellent"
                            ? "excellent"
                            : weather.weatherImpact.stargazingConditions ===
                                "good"
                              ? "good"
                              : weather.weatherImpact.stargazingConditions ===
                                  "fair"
                                ? "fair"
                                : "poor"
                        ],
                    },
                  ]}
                >
                  {weather.weatherImpact.stargazingConditions
                    .charAt(0)
                    .toUpperCase() +
                    weather.weatherImpact.stargazingConditions.slice(1)}
                </Text>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </Animated.View>
  );
};

interface WeatherDetailItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const WeatherDetailItem: React.FC<WeatherDetailItemProps> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={16} color={colors.bark[400]} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

interface HourlyForecastCardProps {
  forecast: HourlyForecast;
}

const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({
  forecast,
}) => (
  <View style={styles.hourlyCard}>
    <Text style={styles.hourlyTime}>{forecast.hour}</Text>
    <AnimatedWeatherIcon
      condition={
        forecast.condition === "partlyCloudy"
          ? "cloudy"
          : forecast.condition === "clear"
            ? "sunny"
            : forecast.condition
      }
      size={24}
      color={colors.ember[400]}
    />
    <Text style={styles.hourlyTemp}>{forecast.temperature}°</Text>
    <View style={styles.hourlyWind}>
      <Ionicons name="speedometer-outline" size={10} color={colors.bark[400]} />
      <Text style={styles.hourlyWindText}>{forecast.windSpeed}</Text>
    </View>
    {forecast.precipChance > 20 ? (
      <View style={styles.hourlyPrecip}>
        <Ionicons name="water" size={10} color="#3B82F6" />
        <Text style={styles.hourlyPrecipText}>{forecast.precipChance}%</Text>
      </View>
    ) : null}
  </View>
);

interface WeatherAlertCardProps {
  alert: WeatherAlert;
  onDismiss?: () => void;
}

const WeatherAlertCard: React.FC<WeatherAlertCardProps> = ({
  alert,
  onDismiss,
}) => {
  const alertStyle = alertColors[alert.severity];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (alert.severity === "danger") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [alert.severity, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.alertCard,
        {
          backgroundColor: alertStyle.bg,
          borderColor: alertStyle.border,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertTitleRow}>
          <Ionicons
            name={
              alert.severity === "danger"
                ? "warning"
                : alert.severity === "warning"
                  ? "alert-circle"
                  : "information-circle"
            }
            size={20}
            color={alertStyle.icon}
          />
          <Text style={[styles.alertTitle, { color: alertStyle.icon }]}>
            {alert.title}
          </Text>
        </View>
        {onDismiss ? (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={18} color={colors.bark[400]} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.alertMessage}>{alert.message}</Text>

      <View style={styles.alertTimeRange}>
        <Ionicons name="time-outline" size={12} color={colors.bark[400]} />
        <Text style={styles.alertTimeText}>
          {alert.validFrom} - {alert.validTo}
        </Text>
      </View>

      {alert.safetyActions.length > 0 ? (
        <View style={styles.safetyActionsSection}>
          <Text style={styles.safetyActionsTitle}>Safety Actions:</Text>
          {alert.safetyActions.map((action, index) => (
            <View key={index} style={styles.safetyActionRow}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={colors.moss[500]}
              />
              <Text style={styles.safetyActionText}>{action}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
};

export const SevereWeatherBanner: React.FC<{
  alert: WeatherAlert;
  onViewDetails?: () => void;
}> = ({ alert, onViewDetails }) => {
  const alertStyle = alertColors[alert.severity];

  return (
    <TouchableOpacity
      style={[styles.severeBanner, { backgroundColor: alertStyle.border }]}
      onPress={onViewDetails}
      activeOpacity={0.8}
    >
      <Ionicons name="warning" size={20} color="#FFFFFF" />
      <View style={styles.severeBannerContent}>
        <Text style={styles.severeBannerTitle}>{alert.title}</Text>
        <Text style={styles.severeBannerMessage} numberOfLines={1}>
          {alert.message}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  alertsSection: {
    marginBottom: spacing.md,
  },
  mainWeatherCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  conditionSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  conditionInfo: {
    gap: 2,
  },
  temperature: {
    fontSize: 36,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
  },
  conditionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
  },
  feelsLike: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  impactBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  impactText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodyBold,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailItem: {
    width: "30%",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  sunMoonSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bark[100],
  },
  sunMoonItem: {
    alignItems: "center",
    gap: 4,
  },
  sunMoonLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  sunMoonValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  hourlySection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  hourlyScrollContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  hourlyCard: {
    alignItems: "center",
    backgroundColor: colors.bark[50],
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    minWidth: 56,
    gap: 4,
  },
  hourlyTime: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[500],
  },
  hourlyTemp: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.text.primary,
  },
  hourlyWind: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  hourlyWindText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  hourlyPrecip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  hourlyPrecipText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
    color: "#3B82F6",
  },
  impactSection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  impactNotes: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
    lineHeight: 20,
  },
  recommendationsSection: {
    backgroundColor: colors.bark[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  recommendationsTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  recRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  recText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  lightingInfo: {
    marginTop: spacing.sm,
  },
  lightingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  lightingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  lightingBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  lightingTime: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  stargazingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bark[100],
  },
  stargazingLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  stargazingValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyBold,
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyBold,
  },
  dismissButton: {
    padding: spacing.xs,
  },
  alertMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  alertTimeRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  alertTimeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  safetyActionsSection: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  safetyActionsTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  safetyActionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  safetyActionText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
  },
  severeBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  severeBannerContent: {
    flex: 1,
  },
  severeBannerTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyBold,
    color: "#FFFFFF",
  },
  severeBannerMessage: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255,255,255,0.9)",
  },
});

export { WeatherAlertCard };
