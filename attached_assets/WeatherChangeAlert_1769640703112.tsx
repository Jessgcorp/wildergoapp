/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { AnimatedWeatherIcon } from "./AnimatedWeatherIcons";

interface WeatherChange {
  location: string;
  distance: string;
  currentCondition:
    | "sunny"
    | "cloudy"
    | "rainy"
    | "snowy"
    | "stormy"
    | "windy"
    | "foggy";
  upcomingCondition:
    | "sunny"
    | "cloudy"
    | "rainy"
    | "snowy"
    | "stormy"
    | "windy"
    | "foggy";
  severity: "low" | "medium" | "high";
}

interface WeatherChangeAlertProps {
  weatherChanges: WeatherChange[];
  visible: boolean;
  onDismiss?: () => void;
}

export const WeatherChangeAlert: React.FC<WeatherChangeAlertProps> = ({
  weatherChanges,
  visible,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (visible && weatherChanges.length > 0) {
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 20,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Pulse animation for alerts
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Rotate through weather changes
      if (weatherChanges.length > 1) {
        const interval = setInterval(() => {
          setCurrentIndex(
            (prevIndex) => (prevIndex + 1) % weatherChanges.length,
          );
        }, 5000);

        return () => clearInterval(interval);
      }
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, weatherChanges]);

  if (!visible || weatherChanges.length === 0) return null;

  const currentWeather = weatherChanges[currentIndex];
  const severityColor = {
    low: "#4A90E2",
    medium: "#F5A623",
    high: "#D0021B",
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
          borderLeftColor: severityColor[currentWeather.severity],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AnimatedWeatherIcon
            condition={currentWeather.currentCondition}
            size={32}
            color="#FF6B35"
          />
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
          <AnimatedWeatherIcon
            condition={currentWeather.upcomingCondition}
            size={32}
            color="#4A4A4A"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Weather Change Ahead</Text>
          <Text style={styles.location}>{currentWeather.location}</Text>
          <Text style={styles.distance}>In {currentWeather.distance}</Text>
        </View>

        {weatherChanges.length > 1 && (
          <View style={styles.pagination}>
            {weatherChanges.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentIndex && styles.activeDot]}
              />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: "rgba(245, 239, 230, 0.98)",
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  content: {
    padding: 16,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  arrowContainer: {
    marginHorizontal: 12,
  },
  arrow: {
    fontSize: 24,
    color: "#4A4A4A",
    fontWeight: "bold",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontFamily: "RussoOne-Regular",
    fontSize: 16,
    color: "#2C2C2C",
    marginBottom: 4,
  },
  location: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 2,
  },
  distance: {
    fontFamily: "Outfit-Medium",
    fontSize: 12,
    color: "#FF6B35",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C4C4C4",
  },
  activeDot: {
    backgroundColor: "#FF6B35",
    width: 20,
  },
});
