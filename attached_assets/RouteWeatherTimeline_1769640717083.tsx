/* eslint-disable */
import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { AnimatedWeatherIcon } from "./AnimatedWeatherIcons";

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
  }, []);

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
  }, []);

  return (
    <Animated.View
      style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <AnimatedWeatherIcon
            condition={point.condition}
            size={40}
            color="#FF6B35"
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
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
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
    marginBottom: 16,
  },
  headerText: {
    fontFamily: "RussoOne-Regular",
    fontSize: 18,
    color: "#2C2C2C",
  },
  scrollContent: {
    paddingRight: 16,
  },
  cardWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    width: 120,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F5EFE6",
  },
  iconWrapper: {
    marginBottom: 8,
  },
  time: {
    fontFamily: "Outfit-Bold",
    fontSize: 14,
    color: "#2C2C2C",
    marginBottom: 4,
  },
  temperature: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 18,
    color: "#FF6B35",
    marginBottom: 4,
  },
  location: {
    fontFamily: "Outfit-Regular",
    fontSize: 12,
    color: "#4A4A4A",
    marginBottom: 2,
    textAlign: "center",
  },
  distance: {
    fontFamily: "Outfit-Medium",
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
