/**
 * WilderGo Live Pin Card
 * Interactive glass card for shared locations in convoy chat
 * Tap to open location on map
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { LivePin, getPinTypeConfig } from "@/services/convoy/convoyService";

interface LivePinCardProps {
  pin: LivePin;
  onPress?: (pin: LivePin) => void;
  compact?: boolean;
}

export const LivePinCard: React.FC<LivePinCardProps> = ({
  pin,
  onPress,
  compact = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const pinConfig = getPinTypeConfig(pin.pinType);

  useEffect(() => {
    // Subtle pulse for live pins
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim, glowAnim]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  };

  const CardContent = () => (
    <View style={[styles.cardInner, compact && styles.cardInnerCompact]}>
      {/* Pin type icon with glow */}
      <Animated.View
        style={[
          styles.iconContainer,
          { backgroundColor: pinConfig.color + "25" },
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Animated.View
          style={[
            styles.iconGlow,
            { backgroundColor: pinConfig.color, opacity: glowAnim },
          ]}
        />
        <Ionicons
          name={pinConfig.icon as keyof typeof Ionicons.glyphMap}
          size={compact ? 18 : 24}
          color={pinConfig.color}
        />
      </Animated.View>

      {/* Pin details */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.pinType, { color: pinConfig.color }]}>
            {pinConfig.label}
          </Text>
          <View style={styles.liveIndicator}>
            <View
              style={[styles.liveDot, { backgroundColor: pinConfig.color }]}
            />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <Text style={styles.locationName} numberOfLines={2}>
          {pin.locationName}
        </Text>

        {pin.note && !compact && (
          <Text style={styles.note} numberOfLines={2}>
            {pin.note}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={styles.coordsContainer}>
            <Ionicons name="navigate" size={12} color={colors.bark[400]} />
            <Text style={styles.coords}>
              {formatCoordinates(pin.latitude, pin.longitude)}
            </Text>
          </View>
          <Text style={styles.timestamp}>{formatTimestamp(pin.timestamp)}</Text>
        </View>
      </View>

      {/* Open on map arrow */}
      <View style={styles.arrowContainer}>
        <Ionicons name="map-outline" size={16} color={colors.bark[400]} />
        <Ionicons name="chevron-forward" size={14} color={colors.bark[400]} />
      </View>
    </View>
  );

  const cardStyles = [styles.card, compact && styles.cardCompact];

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={() => onPress?.(pin)}
      activeOpacity={0.85}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={blur.heavy} tint="light" style={styles.blurView}>
          {/* Gradient border effect */}
          <View
            style={[
              styles.borderAccent,
              { backgroundColor: pinConfig.color + "30" },
            ]}
          />
          <CardContent />
        </BlurView>
      ) : (
        <View style={[styles.blurView, styles.fallbackBg]}>
          <View
            style={[
              styles.borderAccent,
              { backgroundColor: pinConfig.color + "30" },
            ]}
          />
          <CardContent />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Pin type selector for creating new pins
interface LivePinTypeSelectorProps {
  selectedType: LivePin["pinType"];
  onSelect: (type: LivePin["pinType"]) => void;
}

export const LivePinTypeSelector: React.FC<LivePinTypeSelectorProps> = ({
  selectedType,
  onSelect,
}) => {
  const pinTypes: LivePin["pinType"][] = [
    "camp_spot",
    "meetup",
    "scenic",
    "resource",
    "hazard",
    "general",
  ];

  return (
    <View style={selectorStyles.container}>
      {pinTypes.map((type) => {
        const config = getPinTypeConfig(type);
        const isSelected = selectedType === type;

        return (
          <TouchableOpacity
            key={type}
            style={[
              selectorStyles.option,
              isSelected && { borderColor: config.color },
            ]}
            onPress={() => onSelect(type)}
            activeOpacity={0.7}
          >
            <View
              style={[
                selectorStyles.iconWrapper,
                { backgroundColor: config.color + (isSelected ? "30" : "15") },
              ]}
            >
              <Ionicons
                name={config.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={config.color}
              />
            </View>
            <Text
              style={[
                selectorStyles.label,
                isSelected && { color: config.color, fontWeight: "600" },
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    ...shadows.glass,
    marginVertical: spacing.xs,
  },
  cardCompact: {
    maxWidth: 280,
  },
  blurView: {
    borderRadius: borderRadius["2xl"],
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  fallbackBg: {
    backgroundColor: colors.glass.white,
  },
  borderAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: borderRadius["2xl"],
    borderTopRightRadius: borderRadius["2xl"],
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    gap: spacing.sm,
    minWidth: 200,
  },
  cardInnerCompact: {
    padding: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    flexShrink: 0,
  },
  iconGlow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: borderRadius.xl,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  pinType: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bodyBold,
    color: "#4A5568",
    letterSpacing: 0.5,
  },
  locationName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  note: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coordsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  coords: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 2,
    flexShrink: 0,
  },
});

const selectorStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
  },
});

export default LivePinCard;
