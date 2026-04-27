/**
 * WilderGo Look Ahead Radar (Premium)
 * See future nomads and events at your destination
 * Ghost view of predicted social activity
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  FutureNomad,
  FutureEvent,
  LookAheadResult,
  radarService,
} from "@/services/radar/radarService";

interface LookAheadRadarProps {
  visible: boolean;
  onClose: () => void;
  onSelectNomad?: (nomad: FutureNomad) => void;
  onSelectEvent?: (event: FutureEvent) => void;
  currentLocation?: { latitude: number; longitude: number };
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export const LookAheadRadar: React.FC<LookAheadRadarProps> = ({
  visible,
  onClose,
  onSelectNomad,
  onSelectEvent,
  currentLocation,
  isPremium = true,
  onUpgrade,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [destination, setDestination] = useState({
    latitude: 48.7596,
    longitude: -113.787,
    name: "Glacier National Park",
  });
  const [lookAheadResult, setLookAheadResult] =
    useState<LookAheadResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Radar scan animation
      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Initial load
      handleLookAhead();
    } else {
      fadeAnim.setValue(0);
      scanAnim.stopAnimation();
      pulseAnim.stopAnimation();
    }
  }, [visible]);

  const handleLookAhead = useCallback(() => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const result = radarService.getLookAheadPrediction(
        selectedDate.toISOString().split("T")[0],
        destination,
      );
      setLookAheadResult(result);
      setIsLoading(false);
    }, 1500);
  }, [selectedDate, destination]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDensityColor = (density: "low" | "medium" | "high") => {
    switch (density) {
      case "high":
        return colors.ember[500];
      case "medium":
        return colors.moss[500];
      case "low":
        return colors.bark[400];
    }
  };

  if (!isPremium) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.premiumGate, { opacity: fadeAnim }]}>
            <GlassCard variant="frost" padding="xl">
              <View style={styles.premiumContent}>
                <View style={styles.premiumIconContainer}>
                  <Ionicons
                    name="telescope"
                    size={48}
                    color={colors.ember[500]}
                  />
                </View>
                <Text style={styles.premiumTitle}>Advanced Radar</Text>
                <Text style={styles.premiumDescription}>
                  Unlock the Look Ahead feature to see which nomads and events
                  are predicted at your destination before you arrive.
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={onUpgrade}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[
                      colors.ember[400],
                      colors.ember[500],
                      colors.ember[600],
                    ]}
                    style={styles.upgradeGradient}
                  >
                    <Ionicons
                      name="star"
                      size={18}
                      color={colors.text.inverse}
                    />
                    <Text style={styles.upgradeText}>
                      Upgrade to Convoy Pro
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={blur.intense}
              tint="dark"
              style={styles.blurContainer}
            >
              <RadarContent
                lookAheadResult={lookAheadResult}
                isLoading={isLoading}
                selectedDate={selectedDate}
                destination={destination}
                scanAnim={scanAnim}
                pulseAnim={pulseAnim}
                onClose={onClose}
                onDatePress={() => setShowDatePicker(true)}
                onLookAhead={handleLookAhead}
                onSelectNomad={onSelectNomad}
                onSelectEvent={onSelectEvent}
                formatDate={formatDate}
                getDensityColor={getDensityColor}
              />
            </BlurView>
          ) : (
            <View style={[styles.blurContainer, styles.blurFallback]}>
              <RadarContent
                lookAheadResult={lookAheadResult}
                isLoading={isLoading}
                selectedDate={selectedDate}
                destination={destination}
                scanAnim={scanAnim}
                pulseAnim={pulseAnim}
                onClose={onClose}
                onDatePress={() => setShowDatePicker(true)}
                onLookAhead={handleLookAhead}
                onSelectNomad={onSelectNomad}
                onSelectEvent={onSelectEvent}
                formatDate={formatDate}
                getDensityColor={getDensityColor}
              />
            </View>
          )}
        </Animated.View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          />
        )}
      </View>
    </Modal>
  );
};

// Radar content component
interface RadarContentProps {
  lookAheadResult: LookAheadResult | null;
  isLoading: boolean;
  selectedDate: Date;
  destination: { latitude: number; longitude: number; name: string };
  scanAnim: Animated.Value;
  pulseAnim: Animated.Value;
  onClose: () => void;
  onDatePress: () => void;
  onLookAhead: () => void;
  onSelectNomad?: (nomad: FutureNomad) => void;
  onSelectEvent?: (event: FutureEvent) => void;
  formatDate: (date: Date) => string;
  getDensityColor: (density: "low" | "medium" | "high") => string;
}

const RadarContent: React.FC<RadarContentProps> = ({
  lookAheadResult,
  isLoading,
  selectedDate,
  destination,
  scanAnim,
  pulseAnim,
  onClose,
  onDatePress,
  onLookAhead,
  onSelectNomad,
  onSelectEvent,
  formatDate,
  getDensityColor,
}) => (
  <View style={contentStyles.container}>
    {/* Header */}
    <View style={contentStyles.header}>
      <View style={contentStyles.headerTitle}>
        <View style={contentStyles.radarIcon}>
          <Ionicons name="radio" size={20} color={colors.moss[400]} />
        </View>
        <View>
          <Text style={contentStyles.title}>Look Ahead</Text>
          <Text style={contentStyles.subtitle}>See the future</Text>
        </View>
      </View>
      <TouchableOpacity style={contentStyles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={colors.bark[300]} />
      </TouchableOpacity>
    </View>

    {/* Date & Destination Selector */}
    <View style={contentStyles.selectors}>
      <TouchableOpacity style={contentStyles.selector} onPress={onDatePress}>
        <Ionicons name="calendar-outline" size={20} color={colors.ember[400]} />
        <Text style={contentStyles.selectorText}>
          {formatDate(selectedDate)}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.bark[400]} />
      </TouchableOpacity>

      <View style={contentStyles.selectorDivider} />

      <TouchableOpacity style={contentStyles.selector}>
        <Ionicons name="location-outline" size={20} color={colors.moss[400]} />
        <Text style={contentStyles.selectorText} numberOfLines={1}>
          {destination.name}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.bark[400]} />
      </TouchableOpacity>
    </View>

    {/* Radar Visualization */}
    <View style={contentStyles.radarContainer}>
      <View style={contentStyles.radarRings}>
        <View style={[contentStyles.radarRing, contentStyles.radarRing1]} />
        <View style={[contentStyles.radarRing, contentStyles.radarRing2]} />
        <View style={[contentStyles.radarRing, contentStyles.radarRing3]} />

        {/* Scan sweep */}
        <Animated.View
          style={[
            contentStyles.radarSweep,
            {
              transform: [
                {
                  rotate: scanAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Center dot */}
        <Animated.View
          style={[contentStyles.radarCenter, { opacity: pulseAnim }]}
        />

        {/* Ghost markers for predicted nomads */}
        {lookAheadResult?.nomads.slice(0, 5).map((nomad, index) => {
          const angle = (index / 5) * 2 * Math.PI;
          const radius = 30 + (100 - nomad.routeOverlap) * 0.8;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <TouchableOpacity
              key={nomad.id}
              style={[
                contentStyles.ghostMarker,
                {
                  left: "50%",
                  top: "50%",
                  marginLeft: x - 16,
                  marginTop: y - 16,
                  opacity: nomad.confidence / 100,
                },
              ]}
              onPress={() => onSelectNomad?.(nomad)}
            >
              {nomad.avatar ? (
                <Image
                  source={{ uri: nomad.avatar }}
                  style={contentStyles.ghostAvatar}
                />
              ) : (
                <View style={contentStyles.ghostAvatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={14}
                    color={colors.text.inverse}
                  />
                </View>
              )}
              {nomad.isMatch && (
                <View style={contentStyles.matchIndicator}>
                  <Ionicons name="heart" size={8} color={colors.text.inverse} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && (
        <View style={contentStyles.loadingOverlay}>
          <Text style={contentStyles.loadingText}>Scanning future...</Text>
        </View>
      )}
    </View>

    {/* Results */}
    {lookAheadResult && !isLoading && (
      <ScrollView
        style={contentStyles.results}
        showsVerticalScrollIndicator={false}
      >
        {/* Density indicator */}
        <View style={contentStyles.densityCard}>
          <View
            style={[
              contentStyles.densityIndicator,
              {
                backgroundColor: getDensityColor(
                  lookAheadResult.nomadicDensity,
                ),
              },
            ]}
          >
            <Ionicons name="people" size={16} color={colors.text.inverse} />
            <Text style={contentStyles.densityText}>
              {lookAheadResult.nomadicDensity.toUpperCase()} DENSITY
            </Text>
          </View>
          <Text style={contentStyles.densityCount}>
            {lookAheadResult.nomads.length} nomads predicted
          </Text>
        </View>

        {/* Recommendation */}
        {lookAheadResult.recommendation && (
          <View style={contentStyles.recommendation}>
            <Ionicons name="bulb" size={16} color={colors.ember[400]} />
            <Text style={contentStyles.recommendationText}>
              {lookAheadResult.recommendation}
            </Text>
          </View>
        )}

        {/* High overlap matches */}
        <Text style={contentStyles.sectionTitle}>High Route Overlap</Text>
        {lookAheadResult.nomads
          .filter((n) => n.routeOverlap >= 70)
          .map((nomad) => (
            <TouchableOpacity
              key={nomad.id}
              style={contentStyles.nomadCard}
              onPress={() => onSelectNomad?.(nomad)}
              activeOpacity={0.8}
            >
              <View style={contentStyles.nomadAvatar}>
                {nomad.avatar ? (
                  <Image
                    source={{ uri: nomad.avatar }}
                    style={contentStyles.nomadImage}
                  />
                ) : (
                  <View style={contentStyles.nomadImagePlaceholder}>
                    <Ionicons
                      name="person"
                      size={20}
                      color={colors.bark[400]}
                    />
                  </View>
                )}
                {nomad.isMatch && (
                  <View style={contentStyles.nomadMatchBadge}>
                    <Ionicons
                      name="heart"
                      size={10}
                      color={colors.text.inverse}
                    />
                  </View>
                )}
              </View>
              <View style={contentStyles.nomadInfo}>
                <Text style={contentStyles.nomadName}>{nomad.name}</Text>
                <Text style={contentStyles.nomadVehicle}>{nomad.vehicle}</Text>
              </View>
              <View style={contentStyles.nomadOverlap}>
                <Text style={contentStyles.overlapPercent}>
                  {nomad.routeOverlap}%
                </Text>
                <Text style={contentStyles.overlapLabel}>overlap</Text>
              </View>
            </TouchableOpacity>
          ))}

        {/* Upcoming events */}
        {lookAheadResult.events.length > 0 && (
          <>
            <Text style={contentStyles.sectionTitle}>Predicted Events</Text>
            {lookAheadResult.events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={contentStyles.eventCard}
                onPress={() => onSelectEvent?.(event)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={event.type === "social" ? "flame" : "walk"}
                  size={20}
                  color={
                    event.type === "social"
                      ? colors.ember[500]
                      : colors.moss[500]
                  }
                />
                <View style={contentStyles.eventInfo}>
                  <Text style={contentStyles.eventTitle}>{event.title}</Text>
                  <Text style={contentStyles.eventMeta}>
                    {event.expectedAttendees} expected • Hosted by {event.host}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    )}

    {/* Scan button */}
    <TouchableOpacity
      style={contentStyles.scanButton}
      onPress={onLookAhead}
      activeOpacity={0.85}
      disabled={isLoading}
    >
      <LinearGradient
        colors={[colors.moss[400], colors.moss[500], colors.moss[600]]}
        style={contentStyles.scanGradient}
      >
        <Ionicons name="radio" size={20} color={colors.text.inverse} />
        <Text style={contentStyles.scanText}>
          {isLoading ? "Scanning..." : "Look Ahead"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    height: "90%",
    borderTopLeftRadius: borderRadius["3xl"],
    borderTopRightRadius: borderRadius["3xl"],
    overflow: "hidden",
  },
  blurContainer: {
    flex: 1,
  },
  blurFallback: {
    backgroundColor: "rgba(30, 24, 20, 0.95)",
  },
  premiumGate: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  premiumContent: {
    alignItems: "center",
  },
  premiumIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius["2xl"],
    backgroundColor: colors.ember[500] + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  premiumTitle: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
    marginBottom: spacing.md,
  },
  premiumDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  upgradeButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    width: "100%",
    marginBottom: spacing.md,
  },
  upgradeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  upgradeText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  closeButton: {
    paddingVertical: spacing.md,
  },
  closeButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[400],
  },
});

const contentStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  radarIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.moss[500] + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  selectors: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.darkLight,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    marginBottom: spacing.xl,
  },
  selector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  selectorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.inverse,
  },
  selectorDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.glass.borderLight,
  },
  radarContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    position: "relative",
  },
  radarRings: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  radarRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.moss[500] + "30",
  },
  radarRing1: {
    width: 60,
    height: 60,
  },
  radarRing2: {
    width: 120,
    height: 120,
  },
  radarRing3: {
    width: 180,
    height: 180,
  },
  radarSweep: {
    position: "absolute",
    width: 100,
    height: 2,
    backgroundColor: colors.moss[400],
    opacity: 0.6,
    transformOrigin: "left center",
  },
  radarCenter: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.moss[400],
  },
  ghostMarker: {
    position: "absolute",
    width: 32,
    height: 32,
  },
  ghostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.moss[400] + "60",
  },
  ghostAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.darkMedium,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.moss[400] + "60",
  },
  matchIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.ember[500],
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: borderRadius.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.moss[400],
  },
  results: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  densityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  densityIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  densityText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  densityCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  recommendation: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.ember[500] + "15",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[400],
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nomadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.darkLight,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  nomadAvatar: {
    position: "relative",
  },
  nomadImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  nomadImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass.darkMedium,
    justifyContent: "center",
    alignItems: "center",
  },
  nomadMatchBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.ember[500],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.glass.darkLight,
  },
  nomadInfo: {
    flex: 1,
  },
  nomadName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  nomadVehicle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  nomadOverlap: {
    alignItems: "flex-end",
  },
  overlapPercent: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.ember[400],
  },
  overlapLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.darkLight,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  eventMeta: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  scanButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  scanGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  scanText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
});

export default LookAheadRadar;
