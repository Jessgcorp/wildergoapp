/**
 * WilderGo Shared Route Timeline
 * Collaborative route planning with suggested stops
 * Features voting, confirmation, and real-time updates
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
  ConvoyRoute,
  RouteStop,
  RouteStopType,
  routeStopConfig,
  convoyCoordinationService,
} from "@/services/convoy/convoyCoordinationService";

interface SharedRouteTimelineProps {
  route: ConvoyRoute;
  currentUserId: string;
  onStopPress?: (stop: RouteStop) => void;
  onAddStop?: (
    stop: Omit<RouteStop, "id" | "votes" | "voterIds" | "isConfirmed">,
  ) => void;
  onVoteStop?: (stopId: string) => void;
}

export const SharedRouteTimeline: React.FC<SharedRouteTimelineProps> = ({
  route,
  currentUserId,
  onStopPress,
  onAddStop,
  onVoteStop,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStopType, setSelectedStopType] =
    useState<RouteStopType>("campsite");
  const [stopName, setStopName] = useState("");
  const [stopNotes, setStopNotes] = useState("");

  const handleAddStop = () => {
    if (!stopName.trim()) return;

    onAddStop?.({
      type: selectedStopType,
      name: stopName,
      latitude: route.startLocation.latitude + Math.random() * 2,
      longitude: route.startLocation.longitude + Math.random() * 2,
      addedBy: currentUserId,
      addedAt: new Date().toISOString(),
      notes: stopNotes || undefined,
    });

    setShowAddModal(false);
    setStopName("");
    setStopNotes("");
  };

  return (
    <View style={styles.container}>
      {/* Route Header */}
      <View style={styles.routeHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{route.name}</Text>
          <Text style={styles.routeStats}>
            {route.totalDistance} mi • ~{route.estimatedDuration}h
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(route.status) },
          ]}
        >
          <Text style={styles.statusText}>{route.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Start Location */}
      <View style={styles.locationRow}>
        <View style={styles.locationDot}>
          <LinearGradient
            colors={[colors.forestGreen[500], colors.forestGreen[600]]}
            style={styles.startDot}
          >
            <Ionicons name="flag" size={12} color={colors.text.inverse} />
          </LinearGradient>
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>START</Text>
          <Text style={styles.locationName}>{route.startLocation.name}</Text>
        </View>
      </View>

      {/* Timeline Stops */}
      <View style={styles.timeline}>
        {route.stops.map((stop, index) => (
          <StopCard
            key={stop.id}
            stop={stop}
            isLast={index === route.stops.length - 1}
            currentUserId={currentUserId}
            onPress={() => onStopPress?.(stop)}
            onVote={() => onVoteStop?.(stop.id)}
          />
        ))}

        {/* Add Stop Button */}
        <TouchableOpacity
          style={styles.addStopButton}
          onPress={() => setShowAddModal(true)}
        >
          <View style={styles.addStopLine} />
          <View style={styles.addStopDot}>
            <Ionicons name="add" size={16} color={colors.burntSienna[500]} />
          </View>
          <Text style={styles.addStopText}>Add a Stop</Text>
        </TouchableOpacity>
      </View>

      {/* End Location */}
      <View style={styles.locationRow}>
        <View style={styles.locationDot}>
          <LinearGradient
            colors={[colors.sunsetOrange[500], colors.sunsetOrange[600]]}
            style={styles.endDot}
          >
            <Ionicons name="location" size={12} color={colors.text.inverse} />
          </LinearGradient>
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>DESTINATION</Text>
          <Text style={styles.locationName}>{route.endLocation.name}</Text>
        </View>
      </View>

      {/* Add Stop Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {Platform.OS === "ios" ? (
              <BlurView
                intensity={blur.heavy}
                tint="light"
                style={styles.modalBlur}
              >
                <AddStopForm
                  selectedType={selectedStopType}
                  onTypeSelect={setSelectedStopType}
                  name={stopName}
                  onNameChange={setStopName}
                  notes={stopNotes}
                  onNotesChange={setStopNotes}
                  onSubmit={handleAddStop}
                  onCancel={() => setShowAddModal(false)}
                />
              </BlurView>
            ) : (
              <View style={[styles.modalBlur, styles.modalFallback]}>
                <AddStopForm
                  selectedType={selectedStopType}
                  onTypeSelect={setSelectedStopType}
                  name={stopName}
                  onNameChange={setStopName}
                  notes={stopNotes}
                  onNotesChange={setStopNotes}
                  onSubmit={handleAddStop}
                  onCancel={() => setShowAddModal(false)}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Stop Card Component
interface StopCardProps {
  stop: RouteStop;
  isLast: boolean;
  currentUserId: string;
  onPress: () => void;
  onVote: () => void;
}

const StopCard: React.FC<StopCardProps> = ({
  stop,
  isLast,
  currentUserId,
  onPress,
  onVote,
}) => {
  const config = routeStopConfig[stop.type];
  const hasVoted = stop.voterIds.includes(currentUserId);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleVote = () => {
    if (hasVoted) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onVote();
  };

  return (
    <View style={stopStyles.container}>
      {/* Timeline Line */}
      <View style={stopStyles.timelineColumn}>
        <View style={[stopStyles.line, !isLast && stopStyles.lineExtended]} />
        <View style={[stopStyles.dot, { backgroundColor: config.color }]}>
          <Ionicons
            name={config.icon as keyof typeof Ionicons.glyphMap}
            size={14}
            color={colors.text.inverse}
          />
        </View>
        {!isLast && <View style={stopStyles.lineBottom} />}
      </View>

      {/* Stop Content */}
      <TouchableOpacity
        style={stopStyles.content}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <GlassCard variant="frost" padding="sm" style={stopStyles.card}>
          <View style={stopStyles.cardHeader}>
            <View style={stopStyles.cardInfo}>
              <Text style={stopStyles.stopName}>{stop.name}</Text>
              <View style={stopStyles.typeBadge}>
                <Text style={[stopStyles.typeText, { color: config.color }]}>
                  {config.label}
                </Text>
                {stop.isConfirmed && (
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={colors.forestGreen[500]}
                  />
                )}
              </View>
            </View>

            {/* Vote Button */}
            <TouchableOpacity onPress={handleVote} disabled={hasVoted}>
              <Animated.View
                style={[
                  stopStyles.voteButton,
                  hasVoted && stopStyles.votedButton,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Ionicons
                  name={hasVoted ? "checkmark" : "thumbs-up"}
                  size={14}
                  color={hasVoted ? colors.forestGreen[500] : colors.bark[400]}
                />
                <Text
                  style={[
                    stopStyles.voteCount,
                    hasVoted && stopStyles.votedCount,
                  ]}
                >
                  {stop.votes}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {stop.notes && (
            <Text style={stopStyles.notes} numberOfLines={2}>
              {stop.notes}
            </Text>
          )}

          <View style={stopStyles.cardFooter}>
            <Text style={stopStyles.addedBy}>Added by {stop.addedBy}</Text>
            {stop.rating && (
              <View style={stopStyles.rating}>
                <Ionicons
                  name="star"
                  size={10}
                  color={colors.sunsetOrange[500]}
                />
                <Text style={stopStyles.ratingText}>{stop.rating}</Text>
              </View>
            )}
          </View>
        </GlassCard>
      </TouchableOpacity>
    </View>
  );
};

// Add Stop Form Component
interface AddStopFormProps {
  selectedType: RouteStopType;
  onTypeSelect: (type: RouteStopType) => void;
  name: string;
  onNameChange: (name: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddStopForm: React.FC<AddStopFormProps> = ({
  selectedType,
  onTypeSelect,
  name,
  onNameChange,
  notes,
  onNotesChange,
  onSubmit,
  onCancel,
}) => {
  const stopTypes = Object.entries(routeStopConfig) as [
    RouteStopType,
    (typeof routeStopConfig)[RouteStopType],
  ][];

  return (
    <View style={formStyles.container}>
      <Text style={formStyles.title}>Add a Stop</Text>
      <Text style={formStyles.subtitle}>Suggest a waypoint for the convoy</Text>

      {/* Stop Type Selector */}
      <Text style={formStyles.label}>Stop Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={formStyles.typeScroll}
      >
        {stopTypes.map(([type, config]) => (
          <TouchableOpacity
            key={type}
            style={[
              formStyles.typeButton,
              selectedType === type && {
                backgroundColor: config.color + "20",
                borderColor: config.color,
              },
            ]}
            onPress={() => onTypeSelect(type)}
          >
            <Ionicons
              name={config.icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color={selectedType === type ? config.color : colors.bark[400]}
            />
            <Text
              style={[
                formStyles.typeLabel,
                selectedType === type && { color: config.color },
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Name Input */}
      <Text style={formStyles.label}>Name</Text>
      <TextInput
        style={formStyles.input}
        value={name}
        onChangeText={onNameChange}
        placeholder="Stop name..."
        placeholderTextColor={"rgba(0, 0, 0, 0.4)"}
      />

      {/* Notes Input */}
      <Text style={formStyles.label}>Notes (optional)</Text>
      <TextInput
        style={[formStyles.input, formStyles.notesInput]}
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Any tips or info..."
        placeholderTextColor={"rgba(0, 0, 0, 0.4)"}
        multiline
        numberOfLines={3}
      />

      {/* Actions */}
      <View style={formStyles.actions}>
        <TouchableOpacity style={formStyles.cancelButton} onPress={onCancel}>
          <Text style={formStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            formStyles.submitButton,
            !name.trim() && formStyles.disabledButton,
          ]}
          onPress={onSubmit}
          disabled={!name.trim()}
        >
          <LinearGradient
            colors={[colors.burntSienna[500], colors.burntSienna[600]]}
            style={formStyles.submitGradient}
          >
            <Ionicons name="add" size={18} color={colors.text.inverse} />
            <Text style={formStyles.submitText}>Add Stop</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function
function getStatusColor(status: ConvoyRoute["status"]): string {
  switch (status) {
    case "planning":
      return colors.desertSand[600];
    case "active":
      return colors.forestGreen[500];
    case "completed":
      return colors.bark[400];
    default:
      return colors.bark[400];
  }
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
    marginBottom: spacing.xs,
  },
  routeStats: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  locationDot: {
    width: 40,
    alignItems: "center",
  },
  startDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  endDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  locationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  locationLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#4A5568",
    letterSpacing: 0.5,
  },
  locationName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[800],
  },
  timeline: {
    marginVertical: spacing.md,
  },
  addStopButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    marginLeft: 20,
  },
  addStopLine: {
    position: "absolute",
    left: 0,
    width: 2,
    height: "100%",
    backgroundColor: colors.bark[100],
  },
  addStopDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 2,
    borderColor: colors.burntSienna[300],
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  addStopText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.burntSienna[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.liquid,
    borderTopRightRadius: borderRadius.liquid,
    overflow: "hidden",
  },
  modalBlur: {
    padding: spacing.xl,
  },
  modalFallback: {
    backgroundColor: colors.background.primary,
  },
});

const stopStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  timelineColumn: {
    width: 40,
    alignItems: "center",
  },
  line: {
    width: 2,
    height: 10,
    backgroundColor: colors.bark[200],
  },
  lineExtended: {
    height: 20,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },
  lineBottom: {
    flex: 1,
    width: 2,
    backgroundColor: colors.bark[200],
  },
  content: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  cardInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  votedButton: {
    backgroundColor: colors.forestGreen[50],
    borderColor: colors.forestGreen[300],
  },
  voteCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#4A5568",
  },
  votedCount: {
    color: colors.forestGreen[600],
  },
  notes: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addedBy: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.sunsetOrange[600],
  },
});

const formStyles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.xs,
  },
  typeScroll: {
    marginBottom: spacing.md,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1,
    borderColor: colors.bark[200],
    marginRight: spacing.sm,
  },
  typeLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#4A5568",
  },
  input: {
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[800],
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.xl,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
  },
  submitButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  submitText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SharedRouteTimeline;
