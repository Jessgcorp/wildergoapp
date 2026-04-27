import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import {
  getSmartRoute,
  SmartRouteData,
} from "@/services/smartRoute/smartRouteService";

export default function TestSmartRoute() {
  const insets = useSafeAreaInsets();
  const [origin, setOrigin] = useState("Denver, CO");
  const [destination, setDestination] = useState("Boulder, CO");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartRouteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testSmartRoute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const smartRoute = await getSmartRoute(origin, destination);

      if (smartRoute.success) {
        setResult(smartRoute);
      } else {
        setError(smartRoute.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case "safe":
        return colors.forestGreen[500];
      case "caution":
        return colors.sunsetOrange[500];
      case "warning":
        return colors.ember[500];
      default:
        return colors.text.secondary;
    }
  };

  const getRoadRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return colors.forestGreen[500];
      case "moderate":
        return colors.sunsetOrange[500];
      case "high":
        return "#E67E22";
      case "extreme":
        return colors.ember[500];
      default:
        return colors.text.secondary;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "Extreme":
        return "#D94848";
      case "Severe":
        return "#E67E22";
      case "Moderate":
        return colors.sunsetOrange[500];
      case "Minor":
        return "#4A90E2";
      default:
        return colors.text.secondary;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Feather name="map" size={32} color={colors.ember[500]} />
        <Text style={styles.title}>Smart Route Test</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Origin</Text>
        <TextInput
          style={styles.input}
          value={origin}
          onChangeText={setOrigin}
          placeholder="Enter origin address"
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
          placeholder="Enter destination address"
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={testSmartRoute}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Feather name="navigation" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Get Smart Route</Text>
          </>
        )}
      </Pressable>

      {error ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={20} color={colors.ember[500]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {result ? (
        <View style={styles.resultBox}>
          <View style={styles.resultHeader}>
            <Feather
              name="check-circle"
              size={24}
              color={colors.forestGreen[500]}
            />
            <Text style={styles.resultTitle}>Smart Route Generated</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={18} color={colors.ember[500]} />
              <Text style={styles.sectionTitle}>Route Info</Text>
            </View>
            <Text style={styles.text}>Distance: {result.distance}</Text>
            <Text style={styles.text}>Duration: {result.duration}</Text>
            <Text style={styles.text}>From: {result.startAddress}</Text>
            <Text style={styles.text}>To: {result.endAddress}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="sun" size={18} color={colors.sunsetOrange[500]} />
              <Text style={styles.sectionTitle}>Weather Along Route</Text>
            </View>
            <Text style={styles.text}>
              Start: {result.weather?.start?.temperature}°F -{" "}
              {result.weather?.start?.description}
            </Text>
            <Text style={styles.text}>
              Middle: {result.weather?.middle?.temperature}°F -{" "}
              {result.weather?.middle?.description}
            </Text>
            <Text style={styles.text}>
              End: {result.weather?.end?.temperature}°F -{" "}
              {result.weather?.end?.description}
            </Text>
            <Text style={styles.textBold}>
              Overall: {result.weather?.overall}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather
                name="shield"
                size={18}
                color={getSafetyColor(result.safety?.level || "safe")}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: getSafetyColor(result.safety?.level || "safe") },
                ]}
              >
                Safety: {(result.safety?.level || "safe").toUpperCase()}
              </Text>
            </View>
            <Text style={styles.text}>Score: {result.safety?.score}/100</Text>

            {result.safety?.warnings && result.safety.warnings.length > 0 ? (
              <View style={styles.listSection}>
                <Text style={styles.subTitle}>Warnings:</Text>
                {result.safety.warnings.map((warning, i) => (
                  <View key={i} style={styles.listItem}>
                    <Feather
                      name="alert-triangle"
                      size={14}
                      color={colors.sunsetOrange[500]}
                    />
                    <Text style={styles.listText}>{warning}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {result.safety?.recommendations &&
            result.safety.recommendations.length > 0 ? (
              <View style={styles.listSection}>
                <Text style={styles.subTitle}>Recommendations:</Text>
                {result.safety.recommendations.map((rec, i) => (
                  <View key={i} style={styles.listItem}>
                    <Feather
                      name="info"
                      size={14}
                      color={colors.forestGreen[500]}
                    />
                    <Text style={styles.listText}>{rec}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {result.roadRisk ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather
                  name="alert-octagon"
                  size={18}
                  color={getRoadRiskColor(result.roadRisk.riskLevel)}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: getRoadRiskColor(result.roadRisk.riskLevel) },
                  ]}
                >
                  Road Risk: {result.roadRisk.riskLevel.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.text}>
                Road Safety Score: {result.roadRisk.riskScore}/100
              </Text>

              {result.roadRisk.hasBlackIce ? (
                <View style={styles.blackIceWarning}>
                  <Feather name="alert-triangle" size={16} color="#FFFFFF" />
                  <Text style={styles.blackIceText}>BLACK ICE DETECTED</Text>
                </View>
              ) : null}

              {result.roadRisk.hasPrecipitation ? (
                <View style={styles.listItem}>
                  <Feather name="cloud-rain" size={14} color="#4A90E2" />
                  <Text style={styles.listText}>Precipitation along route</Text>
                </View>
              ) : null}

              {result.roadRisk.nationalAlerts.length > 0 ? (
                <View style={styles.listSection}>
                  <Text style={styles.subTitle}>
                    National Alerts ({result.roadRisk.nationalAlerts.length}):
                  </Text>
                  {result.roadRisk.nationalAlerts.map((alert, i) => (
                    <View
                      key={i}
                      style={[
                        styles.alertItem,
                        { borderLeftColor: getAlertColor(alert.severity) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.alertSeverity,
                          { color: getAlertColor(alert.severity) },
                        ]}
                      >
                        {alert.severity}: {alert.event}
                      </Text>
                      <Text style={styles.alertAgency}>{alert.senderName}</Text>
                      {alert.description ? (
                        <Text style={styles.alertDesc} numberOfLines={2}>
                          {alert.description}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              {result.roadRisk.roadWarnings.length > 0 ? (
                <View style={styles.listSection}>
                  <Text style={styles.subTitle}>Road Conditions:</Text>
                  {result.roadRisk.roadWarnings.map((warning, i) => (
                    <View key={i} style={styles.listItem}>
                      <Feather
                        name="alert-circle"
                        size={14}
                        color={colors.sunsetOrange[500]}
                      />
                      <Text style={styles.listText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Route Summary</Text>
                <Text style={styles.summaryText}>
                  Temp Range: {result.roadRisk.summary.minTemp}°F -{" "}
                  {result.roadRisk.summary.maxTemp}°F
                </Text>
                <Text style={styles.summaryText}>
                  Max Wind: {result.roadRisk.summary.maxWindSpeed} mph
                </Text>
                <Text style={styles.summaryText}>
                  Visibility:{" "}
                  {Math.round(result.roadRisk.summary.avgVisibility / 1000)} km
                  avg
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="cpu" size={18} color={colors.driftwood[500]} />
              <Text style={styles.sectionTitle}>AI Status</Text>
            </View>
            <Text style={styles.text}>
              {result.aiOptimized ? "AI Optimized" : "Not optimized"}
            </Text>
            <Text style={styles.text}>
              Generated:{" "}
              {result.generatedAt
                ? new Date(result.generatedAt).toLocaleString()
                : "--"}
            </Text>
            <Text style={styles.text}>
              Route points: {result.coordinates?.length || 0}
            </Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.driftwood[300],
  },
  button: {
    backgroundColor: colors.ember[500],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  errorBox: {
    backgroundColor: "rgba(217, 72, 72, 0.1)",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.ember[500],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    color: colors.ember[500],
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    flex: 1,
  },
  resultBox: {
    backgroundColor: "#FFFFFF",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  resultTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[500],
  },
  section: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.driftwood[200],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.ember[500],
  },
  subTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  textBold: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  listSection: {
    marginTop: spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  listText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    flex: 1,
  },
  blackIceWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#D94848",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  blackIceText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  alertItem: {
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  alertSeverity: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  alertAgency: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  alertDesc: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  summaryBox: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginBottom: 4,
  },
});
