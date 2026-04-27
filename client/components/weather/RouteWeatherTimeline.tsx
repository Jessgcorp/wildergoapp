import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { AnimatedWeatherIcon } from "./AnimatedWeatherIcons";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";

interface RouteWeatherPoint {
  time: string;
  location: string;
  condition:
    | "sunny"
    | "cloudy"
    | "rainy"
    | "snowy"
    | "stormy"
    | "windy"
    | "foggy";
  temperature: number;
  distance: string;
}

interface RouteWeatherTimelineProps {
  weatherPoints: RouteWeatherPoint[];
}

export const RouteWeatherTimeline: React.FC<RouteWeatherTimelineProps> = ({
  weatherPoints,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Weather Along Route</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {weatherPoints.map((point, index) => (
          <RouteWeatherCard
            key={index}
            point={point}
            index={index}
            isLast={index === weatherPoints.length - 1}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

interface RouteWeatherCardProps {
  point: RouteWeatherPoint;
  index: number;
  isLast: boolean;
}

const RouteWeatherCard: React.FC<RouteWeatherCardProps> = ({
  point,
  index,
  isLast,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, index]);

  return (
    <Animated.View
      style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <AnimatedWeatherIcon
            condition={point.condition}
            size={40}
            color={colors.accent.terracotta}
          />
        </View>

        <Text style={styles.time}>{point.time}</Text>
        <Text style={styles.temperature}>{point.temperature}°F</Text>
        <Text style={styles.location} numberOfLines={1}>
          {point.location}
        </Text>
        <Text style={styles.distance}>{point.distance}</Text>
      </View>

      {!isLast && (
        <View style={styles.connector}>
          <View style={styles.connectorLine} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(245, 239, 230, 0.95)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  cardWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    width: 120,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  iconWrapper: {
    marginBottom: spacing.xs,
  },
  time: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginBottom: 4,
  },
  temperature: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.lg,
    color: colors.accent.terracotta,
    marginBottom: 4,
  },
  location: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 2,
    textAlign: "center",
  },
  distance: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 11,
    color: "#8E8E8E",
  },
  connector: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  connectorLine: {
    width: 24,
    height: 2,
    backgroundColor: "#D4C5B5",
  },
});
