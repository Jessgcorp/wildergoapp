/**
 * WilderGo Shared Itinerary Component
 * Convoy members can pin suggested stops (fuel, water, campsites)
 * Features glassmorphism design with drag-to-reorder
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";

export type StopType =
  | "fuel"
  | "water"
  | "campsite"
  | "food"
  | "scenic"
  | "repair"
  | "other";

export interface ItineraryStop {
  id: string;
  type: StopType;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  suggestedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  votes: number;
  userVoted: boolean;
  estimatedTime?: string;
  notes?: string;
  addedAt: string;
  isPinned: boolean;
}

const stopTypeConfig: Record<
  StopType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  fuel: { icon: "flash", color: colors.sunsetOrange[500], label: "Fuel" },
  water: { icon: "water", color: colors.deepTeal[500], label: "Water" },
  campsite: {
    icon: "bonfire",
    color: colors.forestGreen[600],
    label: "Campsite",
  },
  food: { icon: "restaurant", color: colors.burntSienna[500], label: "Food" },
  scenic: { icon: "camera", color: colors.desertSand[700], label: "Scenic" },
  repair: { icon: "construct", color: colors.deepTeal[600], label: "Repair" },
  other: { icon: "location", color: colors.bark[500], label: "Other" },
};

interface SharedItineraryProps {
  stops: ItineraryStop[];
  currentUserId: string;
  onAddStop: (
    stop: Omit<ItineraryStop, "id" | "votes" | "userVoted" | "addedAt">,
  ) => void;
  onVoteStop: (stopId: string) => void;
  onPinStop: (stopId: string) => void;
  onRemoveStop: (stopId: string) => void;
  onViewOnMap: (latitude: number, longitude: number) => void;
}

export const SharedItinerary: React.FC<SharedItineraryProps> = ({
  stops,
  currentUserId,
  onAddStop,
  onVoteStop,
  onPinStop,
  onRemoveStop,
  onViewOnMap,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const pinnedStops = stops.filter((s) => s.isPinned);
  const suggestedStops = stops
    .filter((s) => !s.isPinned)
    .sort((a, b) => b.votes - a.votes);

  const toggleExpand = () => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();
    setExpanded(!expanded);
  };

  const maxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [180, 500],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8}>
        <GlassCard variant="frost" padding="md" style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="map"
                  size={20}
                  color={colors.forestGreen[600]}
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>Shared Itinerary</Text>
                <Text style={styles.headerSubtitle}>
                  {pinnedStops.length} stops • {suggestedStops.length} suggested
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={20} color={colors.text.inverse} />
              </TouchableOpacity>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: expandAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.bark[500]}
                />
              </Animated.View>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>

      {/* Expandable Content */}
      <Animated.View style={[styles.expandableContent, { maxHeight }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.stopsScrollContent}
          nestedScrollEnabled
        >
          {/* Pinned Stops */}
          {pinnedStops.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="pin"
                  size={14}
                  color={colors.sunsetOrange[500]}
                />
                <Text style={styles.sectionTitle}>Confirmed Stops</Text>
              </View>
              {pinnedStops.map((stop, index) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  index={index + 1}
                  currentUserId={currentUserId}
                  onVote={() => onVoteStop(stop.id)}
                  onPin={() => onPinStop(stop.id)}
                  onRemove={() => onRemoveStop(stop.id)}
                  onViewOnMap={() => onViewOnMap(stop.latitude, stop.longitude)}
                />
              ))}
            </View>
          )}

          {/* Suggested Stops */}
          {suggestedStops.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="bulb"
                  size={14}
                  color={colors.desertSand[700]}
                />
                <Text style={styles.sectionTitle}>Suggested</Text>
              </View>
              {suggestedStops.map((stop) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  currentUserId={currentUserId}
                  onVote={() => onVoteStop(stop.id)}
                  onPin={() => onPinStop(stop.id)}
                  onRemove={() => onRemoveStop(stop.id)}
                  onViewOnMap={() => onViewOnMap(stop.latitude, stop.longitude)}
                />
              ))}
            </View>
          )}

          {stops.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="compass-outline"
                size={48}
                color={colors.bark[300]}
              />
              <Text style={styles.emptyText}>No stops added yet</Text>
              <Text style={styles.emptySubtext}>
                Add fuel stations, water fills, or campsites for the convoy
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Add Stop Modal */}
      <AddStopModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(stop) => {
          onAddStop({
            ...stop,
            suggestedBy: { id: currentUserId, name: "You" },
            isPinned: false,
          });
          setShowAddModal(false);
        }}
      />
    </View>
  );
};

// Individual Stop Card
interface StopCardProps {
  stop: ItineraryStop;
  index?: number;
  currentUserId: string;
  onVote: () => void;
  onPin: () => void;
  onRemove: () => void;
  onViewOnMap: () => void;
}

const StopCard: React.FC<StopCardProps> = ({
  stop,
  index,
  currentUserId,
  onVote,
  onPin,
  onRemove,
  onViewOnMap,
}) => {
  const config = stopTypeConfig[stop.type];
  const isOwner = stop.suggestedBy.id === currentUserId;

  return (
    <GlassCard variant="light" padding="sm" style={styles.stopCard}>
      <View style={styles.stopContent}>
        {/* Index badge for pinned stops */}
        {index && (
          <View style={[styles.indexBadge, { backgroundColor: config.color }]}>
            <Text style={styles.indexText}>{index}</Text>
          </View>
        )}

        {/* Type Icon */}
        <View
          style={[styles.typeIcon, { backgroundColor: config.color + "20" }]}
        >
          <Ionicons name={config.icon} size={18} color={config.color} />
        </View>

        {/* Stop Info */}
        <View style={styles.stopInfo}>
          <View style={styles.stopHeader}>
            <Text style={styles.stopName} numberOfLines={1}>
              {stop.name}
            </Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: config.color + "15" },
              ]}
            >
              <Text style={[styles.typeLabel, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>
          {stop.description && (
            <Text style={styles.stopDescription} numberOfLines={1}>
              {stop.description}
            </Text>
          )}
          <View style={styles.stopMeta}>
            <Text style={styles.suggestedBy}>by {stop.suggestedBy.name}</Text>
            {stop.estimatedTime && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.estimatedTime}>{stop.estimatedTime}</Text>
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.stopActions}>
          {/* Vote Button */}
          <TouchableOpacity
            style={[
              styles.voteButton,
              stop.userVoted && styles.voteButtonActive,
            ]}
            onPress={onVote}
          >
            <Ionicons
              name={stop.userVoted ? "arrow-up" : "arrow-up-outline"}
              size={14}
              color={
                stop.userVoted ? colors.text.inverse : colors.forestGreen[600]
              }
            />
            <Text
              style={[
                styles.voteCount,
                stop.userVoted && styles.voteCountActive,
              ]}
            >
              {stop.votes}
            </Text>
          </TouchableOpacity>

          {/* Map Button */}
          <TouchableOpacity style={styles.mapButton} onPress={onViewOnMap}>
            <Ionicons name="navigate" size={14} color={colors.deepTeal[500]} />
          </TouchableOpacity>

          {/* Pin/Remove Buttons (for owner or convoy leaders) */}
          {!stop.isPinned && (
            <TouchableOpacity style={styles.pinButton} onPress={onPin}>
              <Ionicons
                name="pin-outline"
                size={14}
                color={colors.sunsetOrange[500]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </GlassCard>
  );
};

// Add Stop Modal
interface AddStopModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    stop: Omit<
      ItineraryStop,
      "id" | "votes" | "userVoted" | "addedAt" | "suggestedBy" | "isPinned"
    >,
  ) => void;
}

const AddStopModal: React.FC<AddStopModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<StopType>("campsite");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;

    onAdd({
      type: selectedType,
      name: name.trim(),
      description: description.trim() || undefined,
      latitude: 38.5733, // Would be from location picker
      longitude: -109.5498,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setName("");
    setDescription("");
    setSelectedType("campsite");
    setNotes("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[modalStyles.container, { paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={modalStyles.title}>Add Stop</Text>
          <TouchableOpacity onPress={handleAdd} disabled={!name.trim()}>
            <Text
              style={[
                modalStyles.addText,
                !name.trim() && modalStyles.addTextDisabled,
              ]}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={modalStyles.content}
          contentContainerStyle={modalStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stop Type Selector */}
          <Text style={modalStyles.sectionLabel}>Type</Text>
          <View style={modalStyles.typeGrid}>
            {(Object.keys(stopTypeConfig) as StopType[]).map((type) => {
              const config = stopTypeConfig[type];
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    modalStyles.typeButton,
                    isSelected && {
                      backgroundColor: config.color + "20",
                      borderColor: config.color,
                    },
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Ionicons
                    name={config.icon}
                    size={20}
                    color={isSelected ? config.color : colors.bark[400]}
                  />
                  <Text
                    style={[
                      modalStyles.typeButtonText,
                      isSelected && { color: config.color },
                    ]}
                  >
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Name Input */}
          <Text style={modalStyles.sectionLabel}>Name</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="e.g., Shell Gas Station, Hidden Spring..."
            placeholderTextColor={"rgba(0, 0, 0, 0.4)"}
            value={name}
            onChangeText={setName}
          />

          {/* Description Input */}
          <Text style={modalStyles.sectionLabel}>Description (optional)</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="Brief description..."
            placeholderTextColor={"rgba(0, 0, 0, 0.4)"}
            value={description}
            onChangeText={setDescription}
          />

          {/* Location Picker Placeholder */}
          <Text style={modalStyles.sectionLabel}>Location</Text>
          <TouchableOpacity style={modalStyles.locationPicker}>
            <Ionicons
              name="location"
              size={20}
              color={colors.forestGreen[600]}
            />
            <Text style={modalStyles.locationText}>Tap to select on map</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.bark[400]}
            />
          </TouchableOpacity>

          {/* Notes Input */}
          <Text style={modalStyles.sectionLabel}>
            Notes for convoy (optional)
          </Text>
          <TextInput
            style={[modalStyles.input, modalStyles.notesInput]}
            placeholder="Any tips or important info..."
            placeholderTextColor={"rgba(0, 0, 0, 0.4)"}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

// Compact Itinerary Bar (for showing in chat)
interface ItineraryBarProps {
  nextStop?: ItineraryStop;
  totalStops: number;
  onPress: () => void;
}

export const ItineraryBar: React.FC<ItineraryBarProps> = ({
  nextStop,
  totalStops,
  onPress,
}) => {
  if (!nextStop) return null;

  const config = stopTypeConfig[nextStop.type];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard
        variant="frost"
        padding="sm"
        style={itineraryBarStyles.container}
      >
        <View style={itineraryBarStyles.content}>
          <View
            style={[
              itineraryBarStyles.icon,
              { backgroundColor: config.color + "20" },
            ]}
          >
            <Ionicons name={config.icon} size={16} color={config.color} />
          </View>
          <View style={itineraryBarStyles.info}>
            <Text style={itineraryBarStyles.label}>Next Stop</Text>
            <Text style={itineraryBarStyles.name} numberOfLines={1}>
              {nextStop.name}
            </Text>
          </View>
          <View style={itineraryBarStyles.badge}>
            <Text style={itineraryBarStyles.badgeText}>{totalStops} stops</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.bark[400]} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  headerCard: {
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.forestGreen[600] + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.forestGreen[600],
    justifyContent: "center",
    alignItems: "center",
  },
  expandableContent: {
    overflow: "hidden",
  },
  stopsScrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stopCard: {
    marginBottom: spacing.sm,
  },
  stopContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  indexText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.text.inverse,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  stopInfo: {
    flex: 1,
  },
  stopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stopName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeLabel: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stopDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginTop: 2,
  },
  stopMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  suggestedBy: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.bark[300],
    marginHorizontal: spacing.xs,
  },
  estimatedTime: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  stopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.forestGreen[600] + "15",
    gap: spacing.xxs,
  },
  voteButtonActive: {
    backgroundColor: colors.forestGreen[600],
  },
  voteCount: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[600],
  },
  voteCountActive: {
    color: colors.text.inverse,
  },
  mapButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.deepTeal[500] + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  pinButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.sunsetOrange[500] + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    textAlign: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
});

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  addText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[600],
  },
  addTextDisabled: {
    color: "#4A5568",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: spacing.xs,
  },
  typeButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
  },
  input: {
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[800],
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  locationPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    gap: spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
});

const itineraryBarStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  badge: {
    backgroundColor: colors.forestGreen[600] + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[600],
  },
});

export default SharedItinerary;
