import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

interface AnimatedWeatherIconProps {
  condition:
    | "sunny"
    | "cloudy"
    | "rainy"
    | "snowy"
    | "stormy"
    | "windy"
    | "foggy";
  size?: number;
  color?: string;
}

export const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  condition,
  size = 48,
  color = colors.accent.terracotta,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    switch (condition) {
      case "sunny":
        animation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
        );
        break;

      case "cloudy":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(translateYAnim, {
              toValue: -8,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "rainy":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.15,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "snowy":
        animation = Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(translateYAnim, {
                toValue: 10,
                duration: 2500,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0.6,
                duration: 2500,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 2500,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: true,
              }),
            ]),
          ]),
        );
        break;

      case "stormy":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(translateYAnim, {
              toValue: -5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: -3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.delay(1000),
          ]),
        );
        break;

      case "windy":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 0.05,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -0.05,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "foggy":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.4,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      default:
        animation = Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        });
    }

    animation.start();

    return () => animation.stop();
  }, [condition, fadeAnim, rotateAnim, scaleAnim, translateYAnim]);

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (condition) {
      case "sunny":
        return "sunny";
      case "cloudy":
        return "cloudy";
      case "rainy":
        return "rainy";
      case "snowy":
        return "snow";
      case "stormy":
        return "thunderstorm";
      case "windy":
        return "leaf";
      case "foggy":
        return "cloud";
      default:
        return "sunny";
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
            {
              rotate:
                condition === "sunny"
                  ? spin
                  : condition === "windy"
                    ? rotate
                    : "0deg",
            },
          ],
        },
      ]}
    >
      <Ionicons name={getIconName()} size={size} color={color} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
