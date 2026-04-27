/**
 * WilderGo Travel History
 * Visual timeline and map display of previous Pinned Spots
 * Features:
 * - Timeline view with spot cards
 * - Spot type filtering
 * - Rating stars
 * - Favorite toggle
 * - Days stayed tracking
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  borderRadius,
  spacing,
  typography,
  shadows,
  blur,
} from "@/constants/theme";
import {
  PinnedSpot,
  SpotType,
  spotTypeConfig,
  getPinnedSpots,
  getTravelStats,
  updatePinnedSpot,
} from "@/services/passport/nomadPassportService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TravelHistoryProps {
  userId: string;
  onSpotPress?: (spot: PinnedSpot) => void;
  onAddSpot?: () => void;
}

// Stats card showing travel summary
const TravelStatsCard: React.FC<{ userId: string }> = ({ userId }) => {
  const stats = useMemo(() => getTravelStats(userId), [userId]);
  const mostVisitedConfig = stats.mostVisitedType
    ? spotTypeConfig[stats.mostVisitedType]
    : null;

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;
  const containerProps =
    Platform.OS === "ios"
      ? {
          tint: "light" as const,
          intensity: blur.medium,
          style: styles.statsCard,
        }
      : { style: [styles.statsCard, styles.statsCardFallback] };

  return (
    <ContainerWrapper {...containerProps}>
      <Text style={styles.statsTitle}>Your Journey</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalSpots}</Text>
          <Text style={styles.statLabel}>Spots</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalDays}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.favoriteSpots}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.ratingContainer}>
            <Text style={styles.statValue}>{stats.averageRating}</Text>
            <Ionicons name="star" size={14} color={colors.sunsetOrange[500]} />
          </View>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {mostVisitedConfig && (
        <View style={styles.favoriteType}>
          <Ionicons
            name={mostVisitedConfig.icon as keyof typeof Ionicons.glyphMap}
            size={16}
            color={mostVisitedConfig.color}
          />
          <Text style={styles.favoriteTypeText}>
            Most visited: {mostVisitedConfig.label}
          </Text>
        </View>
      )}
    </ContainerWrapper>
  );
};

// Filter chips for spot types
interface FilterChipsProps {
  selectedType: SpotType | null;
  onSelectType: (type: SpotType | null) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  selectedType,
  onSelectType,
}) => {
  const spotTypes = Object.entries(spotTypeConfig) as [
    SpotType,
    (typeof spotTypeConfig)[SpotType],
  ][];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      <TouchableOpacity
        style={[styles.filterChip, !selectedType && styles.filterChipActive]}
        onPress={() => onSelectType(null)}
      >
        <Text
          style={[
            styles.filterChipText,
            !selectedType && styles.filterChipTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {spotTypes.map(([type, config]) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.filterChip,
            selectedType === type && {
              backgroundColor: config.color + "20",
              borderColor: config.color,
            },
          ]}
          onPress={() => onSelectType(type)}
        >
          <Ionicons
            name={config.icon as keyof typeof Ionicons.glyphMap}
            size={14}
            color={selectedType === type ? config.color : colors.bark[400]}
          />
          <Text
            style={[
              styles.filterChipText,
              selectedType === type && { color: config.color },
            ]}
          >
            {config.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Individual spot card in timeline
interface SpotCardProps {
  spot: PinnedSpot;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  isFirst,
  isLast,
  onPress,
  onToggleFavorite,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const config = spotTypeConfig[spot.type];
  const visitDate = new Date(spot.visitedAt);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;
  const containerProps =
    Platform.OS === "ios"
      ? {
          tint: "light" as const,
          intensity: blur.light,
          style: styles.spotCard,
        }
      : { style: [styles.spotCard, styles.spotCardFallback] };

  return (
    <View style={styles.timelineItem}>
      {/* Timeline connector */}
      <View style={styles.timelineConnector}>
        {!isFirst && <View style={styles.timelineLine} />}
        <View style={[styles.timelineDot, { backgroundColor: config.color }]}>
          <Ionicons
            name={config.icon as keyof typeof Ionicons.glyphMap}
            size={12}
            color={colors.text.inverse}
          />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Card content */}
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <ContainerWrapper {...containerProps}>
            <View style={styles.spotHeader}>
              <View style={styles.spotTitleRow}>
                <Text style={styles.spotName} numberOfLines={1}>
                  {spot.name}
                </Text>
                <TouchableOpacity
                  onPress={onToggleFavorite}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={spot.isFavorite ? "heart" : "heart-outline"}
                    size={20}
                    color={
                      spot.isFavorite
                        ? colors.sunsetOrange[500]
                        : colors.bark[400]
                    }
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.spotMeta}>
                <View
                  style={[
                    styles.spotTypeBadge,
                    { backgroundColor: config.color + "20" },
                  ]}
                >
                  <Text style={[styles.spotTypeText, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>
                <Text style={styles.spotDate}>
                  {visitDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.spotDetails}>
              <View style={styles.spotDetailItem}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={colors.bark[400]}
                />
                <Text style={styles.spotDetailText}>
                  {spot.daysStayed} {spot.daysStayed === 1 ? "day" : "days"}
                </Text>
              </View>

              {spot.rating && (
                <View style={styles.spotDetailItem}>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= spot.rating! ? "star" : "star-outline"}
                        size={12}
                        color={
                          star <= spot.rating!
                            ? colors.sunsetOrange[500]
                            : colors.bark[300]
                        }
                      />
                    ))}
                  </View>
                </View>
              )}

              {spot.cellSignal !== undefined && (
                <View style={styles.spotDetailItem}>
                  <Ionicons
                    name="cellular"
                    size={14}
                    color={colors.bark[400]}
                  />
                  <Text style={styles.spotDetailText}>
                    {spot.cellSignal}/5 bars
                  </Text>
                </View>
              )}
            </View>

            {spot.notes && (
              <Text style={styles.spotNotes} numberOfLines={2}>
                {spot.notes}
              </Text>
            )}

            {spot.tags && spot.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {spot.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </ContainerWrapper>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Main component
export const TravelHistory: React.FC<TravelHistoryProps> = ({
  userId,
  onSpotPress,
  onAddSpot,
}) => {
  const [selectedType, setSelectedType] = useState<SpotType | null>(null);
  const [spots, setSpots] = useState<PinnedSpot[]>([]);

  useEffect(() => {
    setSpots(getPinnedSpots(userId));
  }, [userId]);

  const filteredSpots = useMemo(() => {
    if (!selectedType) return spots;
    return spots.filter((s) => s.type === selectedType);
  }, [spots, selectedType]);

  const handleToggleFavorite = (spotId: string) => {
    const spot = spots.find((s) => s.id === spotId);
    if (spot) {
      updatePinnedSpot(spotId, { isFavorite: !spot.isFavorite });
      setSpots(getPinnedSpots(userId));
    }
  };

  return (
    <View style={styles.container}>
      {/* Stats card */}
      <TravelStatsCard userId={userId} />

      {/* Timeline */}
      <ScrollView
        style={styles.timelineContainer}
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSpots.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="trail-sign-outline"
              size={48}
              color={colors.bark[300]}
            />
            <Text style={styles.emptyTitle}>No spots yet</Text>
            <Text style={styles.emptyText}>
              Start pinning your favorite camping spots, BLM land, and
              adventures!
            </Text>
            {onAddSpot && (
              <TouchableOpacity style={styles.addButton} onPress={onAddSpot}>
                <LinearGradient
                  colors={[colors.forestGreen[500], colors.forestGreen[600]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="add" size={20} color={colors.text.inverse} />
                  <Text style={styles.addButtonText}>Pin Your First Spot</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {filteredSpots.map((spot, index) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                isFirst={index === 0}
                isLast={index === filteredSpots.length - 1}
                onPress={() => onSpotPress?.(spot)}
                onToggleFavorite={() => handleToggleFavorite(spot.id)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating add button */}
      {filteredSpots.length > 0 && onAddSpot && (
        <TouchableOpacity
          style={styles.fab}
          onPress={onAddSpot}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.forestGreen[500], colors.forestGreen[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={colors.text.inverse} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Stats card
  statsCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  statsCardFallback: {
    backgroundColor: "#FFFFFF",
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.bark[200],
  },
  statValue: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.display,
    color: colors.forestGreen[600],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  favoriteType: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bark[200],
  },
  favoriteTypeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  // Filter chips
  filterContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.bark[200],
    backgroundColor: colors.glass.white,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.forestGreen[500],
    borderColor: colors.forestGreen[500],
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[500],
  },
  filterChipTextActive: {
    color: colors.text.inverse,
  },
  // Timeline
  timelineContainer: {
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  timelineConnector: {
    width: 40,
    alignItems: "center",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.bark[200],
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  // Spot card
  spotCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  spotCardFallback: {
    backgroundColor: colors.glass.white,
  },
  spotHeader: {
    marginBottom: spacing.sm,
  },
  spotTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  spotName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  spotMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  spotTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  spotTypeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  spotDate: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  spotDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  spotDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  spotDetailText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 2,
  },
  spotNotes: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.bark[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginTop: spacing.md,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    borderRadius: 30,
    overflow: "hidden",
    ...shadows.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TravelHistory;
