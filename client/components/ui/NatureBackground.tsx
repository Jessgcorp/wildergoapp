import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { colors, natureImages } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

export type BackgroundVariant =
  | "forest"
  | "mountain"
  | "sunset"
  | "misty"
  | "sage"
  | "driftwood"
  | "starry"
  | "desert"
  | "canyon"
  | "campfire"
  | "coastal";

export type ImageMode = "gradient" | "image" | "hybrid";

interface NatureBackgroundProps {
  children: React.ReactNode;
  variant?: BackgroundVariant;
  overlay?: boolean;
  overlayOpacity?: number;
  imageMode?: ImageMode;
  animated?: boolean;
  customImage?: string;
}

// Map variants to image URLs
const variantImageMap: Record<BackgroundVariant, string> = {
  forest: natureImages.redwoodForest,
  mountain: natureImages.mountainLake,
  sunset: natureImages.desertSunrise,
  misty: natureImages.mistyForest,
  sage: natureImages.goldenMeadow,
  driftwood: natureImages.vanInterior,
  starry: natureImages.starryNight,
  desert: natureImages.desertCanyon,
  canyon: natureImages.canyonVista,
  campfire: natureImages.campfire,
  coastal: natureImages.pacificCoast,
};

// Gradient colors for different nature themes (fallback/hybrid mode)
const backgroundGradients = {
  forest: ["#1A2A1E", "#2E462F", "#3A5840", "#4A6B50", "#5A7D60"] as const,
  mountain: ["#2A3A40", "#3A4A50", "#4A5A60", "#5A6A70", "#6A7A80"] as const,
  sunset: ["#3A2820", "#4E3830", "#644840", "#7C5A4C", "#946C5C"] as const,
  misty: ["#2A3028", "#3A4238", "#4A5448", "#5A6658", "#6A7868"] as const,
  sage: ["#2A3530", "#3A4540", "#4A5550", "#5A6560", "#6A7570"] as const,
  driftwood: ["#2E2420", "#3E3430", "#4E4440", "#5E5450", "#6E6460"] as const,
  starry: ["#0D1117", "#1A1F2E", "#252D3D", "#2F3A4D", "#3A475E"] as const,
  desert: ["#3A2A20", "#4E3C30", "#644E40", "#7C6050", "#947260"] as const,
  canyon: ["#3A3020", "#4E4030", "#645040", "#7C6450", "#947860"] as const,
  campfire: ["#2A1A10", "#3E2A20", "#523A30", "#664A40", "#7A5A50"] as const,
  coastal: ["#1A2A3A", "#2A3A4A", "#3A4A5A", "#4A5A6A", "#5A6A7A"] as const,
} as const;

export const NatureBackground: React.FC<NatureBackgroundProps> = ({
  children,
  variant = "forest",
  overlay = true,
  overlayOpacity = 0.3,
  imageMode = "image",
  animated = true,
  customImage,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1.05)).current;

  useEffect(() => {
    if (animated) {
      // Subtle Ken Burns effect on the background
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.08,
              duration: 20000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 20000,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [fadeAnim, scaleAnim, animated]);

  const gradientColors = backgroundGradients[variant] as readonly [
    string,
    string,
    ...string[],
  ];
  const imageUrl = customImage || variantImageMap[variant];

  const renderBackground = () => {
    if (imageMode === "gradient") {
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={styles.gradient}
        />
      );
    }

    if (imageMode === "image" || imageMode === "hybrid") {
      return (
        <Animated.View
          style={[
            styles.imageContainer,
            animated && {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.backgroundImage}
            contentFit="cover"
            transition={500}
            placeholder={gradientColors[0]}
          />
          {imageMode === "hybrid" && (
            <LinearGradient
              colors={[
                "transparent",
                `${gradientColors[2]}90`,
                gradientColors[4],
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.hybridGradient}
            />
          )}
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Background layer */}
      {renderBackground()}

      {/* Gradient fallback for image loading */}
      {imageMode !== "gradient" && (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={[styles.gradient, styles.fallbackGradient]}
        />
      )}

      {/* Texture overlay for depth */}
      <View style={styles.textureOverlay}>
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.06)",
            "rgba(255, 255, 255, 0.02)",
            "rgba(255, 255, 255, 0.04)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0.2, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Vignette effect */}
      <LinearGradient
        colors={[
          "transparent",
          "transparent",
          "rgba(0, 0, 0, 0.15)",
          "rgba(0, 0, 0, 0.35)",
        ]}
        locations={[0, 0.5, 0.85, 1]}
        style={styles.vignette}
      />

      {/* Optional dark overlay for better text contrast */}
      {overlay && (
        <View
          style={[
            styles.darkOverlay,
            { backgroundColor: `rgba(30, 24, 20, ${overlayOpacity})` },
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

// Simpler version for sections within screens
export const GlassBackground: React.FC<{
  children: React.ReactNode;
  style?: object;
}> = ({ children, style }) => {
  return (
    <View style={[styles.glassBackground, style]}>
      <LinearGradient
        colors={["#2A3A30", "#3A4A40", "#4A5A50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glassOverlay} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.nature,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  backgroundImage: {
    width: width,
    height: height,
    position: "absolute",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackGradient: {
    zIndex: -1,
  },
  hybridGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  glassBackground: {
    flex: 1,
    overflow: "hidden",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});

export default NatureBackground;
