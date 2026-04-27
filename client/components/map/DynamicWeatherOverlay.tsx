/**
 * WilderGo Dynamic Weather Overlay
 * Semi-transparent animated layers for wind speeds and storm cells
 * Liquid Glass aesthetic with soft edges and organic movement
 */

import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface WeatherOverlayData {
  windSpeed: number; // mph
  windDirection: string;
  condition: "clear" | "cloudy" | "rain" | "storm" | "snow" | "windy" | "fog";
  stormCells?: {
    id: string;
    latitude: number;
    longitude: number;
    intensity: "light" | "moderate" | "severe";
  }[];
}

interface DynamicWeatherOverlayProps {
  data: WeatherOverlayData;
  visible: boolean;
}

/**
 * Convert wind direction to degrees
 */
function windDirectionToDegrees(direction: string): number {
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

/**
 * Wind Streaks Animation Layer
 */
const WindStreaksLayer: React.FC<{
  windSpeed: number;
  windDirection: string;
  opacity: Animated.Value;
}> = ({ windSpeed, windDirection, opacity }) => {
  const streakAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0)),
  ).current;

  const windDegrees = windDirectionToDegrees(windDirection);
  const animationSpeed = Math.max(800, 3000 - windSpeed * 50);

  useEffect(() => {
    // Animate each streak with staggered timing
    streakAnims.forEach((anim, index) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: animationSpeed + index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      );
      setTimeout(() => loop.start(), index * (animationSpeed / 8));
    });

    return () => {
      streakAnims.forEach((anim) => anim.stopAnimation());
    };
  }, [windSpeed, animationSpeed, streakAnims]);

  // Calculate streak positions based on wind direction
  const streaks = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      positions.push({
        top: 10 + i * 10 + Math.random() * 5,
        left: -20 + Math.random() * 10,
        width: 60 + windSpeed * 2 + Math.random() * 40,
        delay: i * 0.1,
      });
    }
    return positions;
  }, [windSpeed]);

  return (
    <Animated.View
      style={[
        styles.windLayer,
        {
          opacity,
          transform: [{ rotate: `${windDegrees}deg` }],
        },
      ]}
      pointerEvents="none"
    >
      {streaks.map((streak, index) => (
        <Animated.View
          key={index}
          style={[
            styles.windStreak,
            {
              top: `${streak.top}%`,
              left: `${streak.left}%`,
              width: streak.width,
              opacity: streakAnims[index].interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 0.6, 0.6, 0],
              }),
              transform: [
                {
                  translateX: streakAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCREEN_WIDTH * 1.5],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              "transparent",
              "rgba(255, 255, 255, 0.4)",
              "rgba(255, 255, 255, 0.5)",
              "transparent",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
};

/**
 * Storm Cell Overlay
 */
const StormCellsLayer: React.FC<{
  cells: WeatherOverlayData["stormCells"];
  opacity: Animated.Value;
}> = ({ cells, opacity }) => {
  const pulseAnims = useRef(
    (cells || []).map(() => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    pulseAnims.forEach((anim, index) => {
      const intensity = cells?.[index]?.intensity || "light";
      const duration =
        intensity === "severe" ? 800 : intensity === "moderate" ? 1200 : 1600;

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.3,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
    });

    return () => {
      pulseAnims.forEach((anim) => anim.stopAnimation());
    };
  }, [cells, pulseAnims]);

  if (!cells || cells.length === 0) return null;

  return (
    <Animated.View
      style={[styles.stormLayer, { opacity }]}
      pointerEvents="none"
    >
      {cells.map((cell, index) => {
        const size =
          cell.intensity === "severe"
            ? 120
            : cell.intensity === "moderate"
              ? 90
              : 60;
        const color =
          cell.intensity === "severe"
            ? colors.emergency.red
            : cell.intensity === "moderate"
              ? colors.sunsetOrange[500]
              : colors.deepTeal[400];

        // Convert lat/lng to approximate screen position (simplified)
        const top = 20 + index * 25;
        const left = 30 + index * 20;

        return (
          <Animated.View
            key={cell.id}
            style={[
              styles.stormCell,
              {
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
                borderRadius: size / 2,
                transform: [
                  { translateX: -size / 2 },
                  { translateY: -size / 2 },
                  { scale: pulseAnims[index] || 1 },
                ],
              },
            ]}
          >
            {/* Outer glow */}
            <View
              style={[
                styles.stormCellGlow,
                {
                  width: size * 1.5,
                  height: size * 1.5,
                  borderRadius: size * 0.75,
                  backgroundColor: color + "20",
                },
              ]}
            />
            {/* Inner cell */}
            <LinearGradient
              colors={[color + "60", color + "30", color + "10"]}
              style={[
                styles.stormCellInner,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
              ]}
            />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
};

/**
 * Fog/Mist Overlay
 */
const FogLayer: React.FC<{
  visible: boolean;
  opacity: Animated.Value;
}> = ({ visible, opacity }) => {
  const driftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const drift = Animated.loop(
        Animated.sequence([
          Animated.timing(driftAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(driftAnim, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
      );
      drift.start();
      return () => drift.stop();
    }
  }, [visible, driftAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.fogLayer, { opacity }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.fogBank,
          {
            transform: [
              {
                translateX: driftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 30],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0)",
            "rgba(255, 255, 255, 0.4)",
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0.3)",
            "rgba(255, 255, 255, 0)",
          ]}
          locations={[0, 0.3, 0.5, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
};

/**
 * Rain Drops Overlay
 */
const RainLayer: React.FC<{
  intensity: "light" | "moderate" | "heavy";
  opacity: Animated.Value;
}> = ({ intensity, opacity }) => {
  const dropCount =
    intensity === "heavy" ? 30 : intensity === "moderate" ? 20 : 10;
  const dropAnims = useRef(
    Array.from({ length: dropCount }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    dropAnims.forEach((anim, index) => {
      const duration = 600 + Math.random() * 400;
      const delay = index * 50;

      setTimeout(() => {
        const loop = Animated.loop(
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        );
        loop.start();
      }, delay);
    });

    return () => {
      dropAnims.forEach((anim) => anim.stopAnimation());
    };
  }, [intensity, dropAnims]);

  const drops = useMemo(() => {
    return Array.from({ length: dropCount }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
  }, [dropCount]);

  return (
    <Animated.View style={[styles.rainLayer, { opacity }]} pointerEvents="none">
      {drops.map((drop, index) => (
        <Animated.View
          key={index}
          style={[
            styles.rainDrop,
            {
              left: `${drop.left}%`,
              opacity: dropAnims[index].interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 0.8, 0.8, 0],
              }),
              transform: [
                {
                  translateY: dropAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, SCREEN_HEIGHT + 20],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

/**
 * Main Dynamic Weather Overlay Component
 */
export const DynamicWeatherOverlay: React.FC<DynamicWeatherOverlayProps> = ({
  data,
  visible,
}) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: visible ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [visible, overlayOpacity]);

  const showWind = data.windSpeed >= 10;
  const showFog = data.condition === "fog";
  const showRain = data.condition === "rain" || data.condition === "storm";
  const showStorm = data.condition === "storm" && data.stormCells;

  const rainIntensity = data.condition === "storm" ? "heavy" : "moderate";

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Base condition overlay */}
      <Animated.View
        style={[
          styles.conditionOverlay,
          {
            opacity: overlayOpacity,
            backgroundColor: getConditionOverlayColor(data.condition),
          },
        ]}
      />

      {/* Wind streaks */}
      {showWind && (
        <WindStreaksLayer
          windSpeed={data.windSpeed}
          windDirection={data.windDirection}
          opacity={overlayOpacity}
        />
      )}

      {/* Fog layer */}
      {showFog && <FogLayer visible={showFog} opacity={overlayOpacity} />}

      {/* Rain layer */}
      {showRain && (
        <RainLayer intensity={rainIntensity} opacity={overlayOpacity} />
      )}

      {/* Storm cells */}
      {showStorm && (
        <StormCellsLayer cells={data.stormCells} opacity={overlayOpacity} />
      )}
    </View>
  );
};

/**
 * Get overlay color based on weather condition
 */
function getConditionOverlayColor(
  condition: WeatherOverlayData["condition"],
): string {
  switch (condition) {
    case "clear":
      return "rgba(232, 122, 71, 0.08)"; // Warm orange tint
    case "cloudy":
      return "rgba(122, 110, 100, 0.12)";
    case "rain":
      return "rgba(27, 75, 82, 0.15)";
    case "storm":
      return "rgba(58, 48, 40, 0.2)";
    case "snow":
      return "rgba(220, 214, 208, 0.2)";
    case "windy":
      return "rgba(90, 102, 88, 0.08)";
    case "fog":
      return "rgba(154, 142, 132, 0.25)";
    default:
      return "transparent";
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  conditionOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  windLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  windStreak: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
  },
  stormLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  stormCell: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  stormCellGlow: {
    position: "absolute",
  },
  stormCellInner: {
    position: "absolute",
  },
  fogLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  fogBank: {
    ...StyleSheet.absoluteFillObject,
  },
  rainLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  rainDrop: {
    position: "absolute",
    top: 0,
    width: 2,
    height: 12,
    backgroundColor: "rgba(100, 150, 180, 0.5)",
    borderRadius: 1,
  },
});

export default DynamicWeatherOverlay;
