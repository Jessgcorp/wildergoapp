/**
 * WilderGo Convoy Member Status Component
 * Displays member status badges for convoy coordination
 * Shows: En Route, Stationary, Looking for Camp
 */

import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/theme";
import {
  ConvoyMemberStatus as MemberStatusType,
  getMemberStatusLabel,
  getMemberStatusColor,
  getMemberStatusIcon,
} from "@/services/convoy/convoyService";

interface ConvoyMemberStatusProps {
  status: MemberStatusType;
  eta?: string;
  destination?: string;
  showLabel?: boolean;
  compact?: boolean;
  animated?: boolean;
}

export const ConvoyMemberStatus: React.FC<ConvoyMemberStatusProps> = ({
  status,
  eta,
  destination,
  showLabel = true,
  compact = false,
  animated = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0.5)).current;

  const statusColor = getMemberStatusColor(status);
  const statusLabel = getMemberStatusLabel(status);
  const statusIcon = getMemberStatusIcon(status);

  useEffect(() => {
    if (animated && status === "en_route") {
      // Pulse animation for en route status
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
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
    }

    if (animated && status !== "offline") {
      // Dot animation for online statuses
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }

    return () => {
      pulseAnim.stopAnimation();
      dotAnim.stopAnimation();
    };
  }, [animated, status, pulseAnim, dotAnim]);

  if (compact) {
    return (
      <View
        style={[
          compactStyles.container,
          { backgroundColor: statusColor + "20" },
        ]}
      >
        <Animated.View
          style={[
            compactStyles.dot,
            {
              backgroundColor: statusColor,
              opacity: status === "offline" ? 0.5 : dotAnim,
            },
          ]}
        />
        {showLabel && (
          <Text style={[compactStyles.label, { color: statusColor }]}>
            {statusLabel}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status badge */}
      <View style={[styles.badge, { backgroundColor: statusColor + "15" }]}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: statusColor + "25",
              transform: status === "en_route" ? [{ scale: pulseAnim }] : [],
            },
          ]}
        >
          <Ionicons
            name={statusIcon as keyof typeof Ionicons.glyphMap}
            size={16}
            color={statusColor}
          />
        </Animated.View>

        <View style={styles.textContainer}>
          {showLabel && (
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {statusLabel}
            </Text>
          )}

          {/* ETA or destination info */}
          {status === "en_route" && eta && (
            <Text style={styles.etaText}>ETA: {eta}</Text>
          )}
          {status === "looking_for_camp" && destination && (
            <Text style={styles.etaText}>Near: {destination}</Text>
          )}
        </View>

        {/* Live indicator */}
        {status !== "offline" && (
          <Animated.View
            style={[
              styles.liveIndicator,
              {
                backgroundColor: statusColor,
                opacity: dotAnim,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

// Header component for convoy chat showing all member statuses
interface ConvoyStatusHeaderProps {
  members: {
    id: string;
    name: string;
    avatar?: string;
    status: MemberStatusType;
  }[];
}

export const ConvoyStatusHeader: React.FC<ConvoyStatusHeaderProps> = ({
  members,
}) => {
  const statusCounts = {
    en_route: members.filter((m) => m.status === "en_route").length,
    stationary: members.filter((m) => m.status === "stationary").length,
    looking_for_camp: members.filter((m) => m.status === "looking_for_camp")
      .length,
    offline: members.filter((m) => m.status === "offline").length,
  };

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.statusRow}>
        {statusCounts.en_route > 0 && (
          <View style={headerStyles.statusItem}>
            <View
              style={[
                headerStyles.statusDot,
                { backgroundColor: getMemberStatusColor("en_route") },
              ]}
            />
            <Text style={headerStyles.statusCount}>
              {statusCounts.en_route} En Route
            </Text>
          </View>
        )}

        {statusCounts.stationary > 0 && (
          <View style={headerStyles.statusItem}>
            <View
              style={[
                headerStyles.statusDot,
                { backgroundColor: getMemberStatusColor("stationary") },
              ]}
            />
            <Text style={headerStyles.statusCount}>
              {statusCounts.stationary} Stationary
            </Text>
          </View>
        )}

        {statusCounts.looking_for_camp > 0 && (
          <View style={headerStyles.statusItem}>
            <View
              style={[
                headerStyles.statusDot,
                { backgroundColor: getMemberStatusColor("looking_for_camp") },
              ]}
            />
            <Text style={headerStyles.statusCount}>
              {statusCounts.looking_for_camp} Looking
            </Text>
          </View>
        )}

        {statusCounts.offline > 0 && (
          <View style={headerStyles.statusItem}>
            <View
              style={[
                headerStyles.statusDot,
                { backgroundColor: getMemberStatusColor("offline") },
                headerStyles.offlineDot,
              ]}
            />
            <Text style={[headerStyles.statusCount, headerStyles.offlineText]}>
              {statusCounts.offline} Offline
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  etaText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginTop: 1,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

const compactStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
});

const headerStyles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.lg,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  offlineDot: {
    opacity: 0.5,
  },
  statusCount: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
  },
  offlineText: {
    color: "#4A5568",
  },
});

export default ConvoyMemberStatus;
