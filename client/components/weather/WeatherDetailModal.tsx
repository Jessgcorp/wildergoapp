import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import {
  getDetailedForecast,
  getWeatherIconUrl,
  getWindDirection,
  DetailedForecastData,
  HourlyForecast,
  ForecastDay,
} from "@/services/weather/weatherService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WeatherDetailModalProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
}

export const WeatherDetailModal: React.FC<WeatherDetailModalProps> = ({
  visible,
  onClose,
  latitude,
  longitude,
}) => {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<DetailedForecastData | null>(null);

  useEffect(() => {
    if (visible && latitude && longitude) {
      fetchDetailedForecast();
    }
  }, [visible, latitude, longitude]);

  const fetchDetailedForecast = async () => {
    setLoading(true);
    const data = await getDetailedForecast(latitude, longitude);
    setForecast(data);
    setLoading(false);
  };

  const renderCurrentWeather = () => {
    if (!forecast?.current) return null;

    const { current, locationName } = forecast;

    return (
      <View style={styles.currentSection}>
        <Text style={styles.locationName}>{locationName}</Text>
        <View style={styles.currentMain}>
          <Image
            source={{ uri: getWeatherIconUrl(current.icon || "01d") }}
            style={styles.currentIcon}
            contentFit="contain"
          />
          <Text style={styles.currentTemp}>{current.temperature}°</Text>
        </View>
        <Text style={styles.currentCondition}>{current.description}</Text>

        <View style={styles.currentDetails}>
          <View style={styles.detailItem}>
            <Feather name="droplet" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{current.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="wind" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {current.windSpeed} mph{" "}
              {current.windDirection
                ? getWindDirection(current.windDirection)
                : ""}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="eye" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {current.visibility
                ? `${Math.round(current.visibility / 1609)} mi`
                : "--"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHourlyForecast = () => {
    if (!forecast?.hourly) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hourly Forecast</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyScroll}
        >
          {forecast.hourly.map((hour: HourlyForecast, index: number) => (
            <View key={index} style={styles.hourlyItem}>
              <Text style={styles.hourlyTime}>{hour.time}</Text>
              <Image
                source={{ uri: getWeatherIconUrl(hour.icon) }}
                style={styles.hourlyIcon}
                contentFit="contain"
              />
              <Text style={styles.hourlyTemp}>{hour.temperature}°</Text>
              <View style={styles.hourlyPrecip}>
                <Feather name="droplet" size={10} color={colors.moss[500]} />
                <Text style={styles.hourlyPrecipText}>
                  {hour.precipitation}%
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderDailyForecast = () => {
    if (!forecast?.daily) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5-Day Forecast</Text>
        {forecast.daily.map((day: ForecastDay, index: number) => (
          <View key={index} style={styles.dailyItem}>
            <Text style={styles.dailyDate}>{day.date}</Text>
            <Image
              source={{ uri: getWeatherIconUrl(day.icon) }}
              style={styles.dailyIcon}
              contentFit="contain"
            />
            <View style={styles.dailyCondition}>
              <Text style={styles.dailyConditionText} numberOfLines={1}>
                {day.condition}
              </Text>
            </View>
            <View style={styles.dailyTemps}>
              <Text style={styles.dailyHigh}>{day.tempMax}°</Text>
              <View style={styles.tempBar}>
                <View
                  style={[
                    styles.tempBarFill,
                    {
                      width: `${Math.min(100, ((day.tempMax || 0) / 100) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dailyLow}>{day.tempMin}°</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <View style={styles.handle} />
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text.inverse} />
              </Pressable>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.moss[500]} />
                <Text style={styles.loadingText}>Loading weather data...</Text>
              </View>
            ) : forecast?.success ? (
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {renderCurrentWeather()}
                {renderHourlyForecast()}
                {renderDailyForecast()}
              </ScrollView>
            ) : (
              <View style={styles.errorContainer}>
                <Feather
                  name="cloud-off"
                  size={48}
                  color={colors.text.secondary}
                />
                <Text style={styles.errorText}>
                  Unable to load weather data
                </Text>
                <Pressable
                  onPress={fetchDetailedForecast}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </Pressable>
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  blurContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: "hidden",
    maxHeight: "85%",
  },
  modalContent: {
    backgroundColor: "rgba(30, 35, 30, 0.9)",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    minHeight: 400,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    position: "relative",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  closeButton: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.md,
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing["2xl"],
  },
  loadingContainer: {
    padding: spacing["2xl"],
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
  errorContainer: {
    padding: spacing["2xl"],
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.moss[500],
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: typography.fontSize.md,
  },
  currentSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  locationName: {
    fontSize: typography.fontSize.xl,
    fontWeight: "600",
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  currentMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  currentIcon: {
    width: 80,
    height: 80,
  },
  currentTemp: {
    fontSize: 72,
    fontWeight: "200",
    color: colors.text.inverse,
    marginLeft: -spacing.sm,
  },
  currentCondition: {
    fontSize: typography.fontSize.lg,
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "capitalize",
    marginTop: spacing.xs,
  },
  currentDetails: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.7)",
  },
  section: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  hourlyScroll: {
    paddingRight: spacing.lg,
  },
  hourlyItem: {
    alignItems: "center",
    marginRight: spacing.lg,
    minWidth: 50,
  },
  hourlyTime: {
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: spacing.xs,
  },
  hourlyIcon: {
    width: 36,
    height: 36,
  },
  hourlyTemp: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.text.inverse,
    marginTop: spacing.xs,
  },
  hourlyPrecip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: spacing.xs,
  },
  hourlyPrecipText: {
    fontSize: typography.fontSize.xs,
    color: colors.moss[400],
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  dailyDate: {
    flex: 1.2,
    fontSize: typography.fontSize.md,
    color: colors.text.inverse,
  },
  dailyIcon: {
    width: 32,
    height: 32,
    marginHorizontal: spacing.sm,
  },
  dailyCondition: {
    flex: 1,
  },
  dailyConditionText: {
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "capitalize",
  },
  dailyTemps: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  dailyHigh: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.text.inverse,
    width: 30,
    textAlign: "right",
  },
  dailyLow: {
    fontSize: typography.fontSize.md,
    color: "rgba(255, 255, 255, 0.6)",
    width: 30,
    textAlign: "left",
  },
  tempBar: {
    width: 50,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  tempBarFill: {
    height: "100%",
    backgroundColor: colors.ember[400],
    borderRadius: 2,
  },
});

export default WeatherDetailModal;
