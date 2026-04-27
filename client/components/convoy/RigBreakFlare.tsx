/**
 * WilderGo Rig Break Flare
 * Emergency system for convoy members to signal rig issues
 * Sends red-alert notifications and pins location on everyone's map
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Vibration,
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
  RigBreakFlare as RigBreakFlareType,
  RigBreakSeverity,
  rigBreakConfig,
  convoyCoordinationService,
} from "@/services/convoy/convoyCoordinationService";

// Emergency Flare Button (always visible in convoy mode)
interface RigBreakFlareButtonProps {
  onPress: () => void;
  hasActiveFlare?: boolean;
}

export const RigBreakFlareButton: React.FC<RigBreakFlareButtonProps> = ({
  onPress,
  hasActiveFlare = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (hasActiveFlare) {
      // Urgent pulsing animation when there's an active flare
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.8,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [hasActiveFlare, pulseAnim, glowAnim]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[buttonStyles.container, { transform: [{ scale: pulseAnim }] }]}
      >
        {/* Emergency Glow */}
        <Animated.View
          style={[
            buttonStyles.glow,
            {
              opacity: glowAnim,
              backgroundColor: hasActiveFlare
                ? colors.emergency.redGlow
                : colors.sunsetOrange[500] + "40",
            },
          ]}
        />

        <LinearGradient
          colors={
            hasActiveFlare
              ? [colors.emergency.red, "#B91C1C"]
              : [colors.sunsetOrange[500], colors.sunsetOrange[600]]
          }
          style={buttonStyles.button}
        >
          <Ionicons
            name={hasActiveFlare ? "alert" : "warning"}
            size={24}
            color={colors.text.inverse}
          />
        </LinearGradient>

        {hasActiveFlare && (
          <View style={buttonStyles.alertBadge}>
            <Text style={buttonStyles.alertText}>!</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Rig Break Flare Modal
interface RigBreakFlareModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    flare: Omit<
      RigBreakFlareType,
      "id" | "respondersCount" | "responderIds" | "resolved" | "isActive"
    >,
  ) => void;
  convoyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rigName: string;
  currentLocation: { latitude: number; longitude: number };
}

export const RigBreakFlareModal: React.FC<RigBreakFlareModalProps> = ({
  visible,
  onClose,
  onSubmit,
  convoyId,
  userId,
  userName,
  userAvatar,
  rigName,
  currentLocation,
}) => {
  const [severity, setSeverity] = useState<RigBreakSeverity>("moderate");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;

  const issueTypes = [
    "Flat Tire",
    "Engine Trouble",
    "Electrical Issue",
    "Brake Problem",
    "Transmission",
    "Overheating",
    "Fuel Issue",
    "Other",
  ];

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, slideAnim]);

  const handleSubmit = () => {
    if (!issueType || !description) return;

    // Vibrate for emergency effect
    Vibration.vibrate([0, 100, 100, 100]);

    onSubmit({
      convoyId,
      userId,
      userName,
      userAvatar,
      rigName,
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
      severity,
      issueType,
      description,
      createdAt: new Date().toISOString(),
    });

    // Reset form
    setSeverity("moderate");
    setIssueType("");
    setDescription("");
    onClose();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <TouchableOpacity style={modalStyles.backdrop} onPress={onClose} />

        <Animated.View
          style={[modalStyles.content, { transform: [{ translateY }] }]}
        >
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={blur.heavy}
              tint="light"
              style={modalStyles.blur}
            >
              <FlareForm
                severity={severity}
                onSeverityChange={setSeverity}
                issueType={issueType}
                onIssueTypeChange={setIssueType}
                issueTypes={issueTypes}
                description={description}
                onDescriptionChange={setDescription}
                onSubmit={handleSubmit}
                onCancel={onClose}
              />
            </BlurView>
          ) : (
            <View style={[modalStyles.blur, modalStyles.fallback]}>
              <FlareForm
                severity={severity}
                onSeverityChange={setSeverity}
                issueType={issueType}
                onIssueTypeChange={setIssueType}
                issueTypes={issueTypes}
                description={description}
                onDescriptionChange={setDescription}
                onSubmit={handleSubmit}
                onCancel={onClose}
              />
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// Flare Form Component
interface FlareFormProps {
  severity: RigBreakSeverity;
  onSeverityChange: (severity: RigBreakSeverity) => void;
  issueType: string;
  onIssueTypeChange: (type: string) => void;
  issueTypes: string[];
  description: string;
  onDescriptionChange: (desc: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const FlareForm: React.FC<FlareFormProps> = ({
  severity,
  onSeverityChange,
  issueType,
  onIssueTypeChange,
  issueTypes,
  description,
  onDescriptionChange,
  onSubmit,
  onCancel,
}) => {
  const severities: RigBreakSeverity[] = [
    "minor",
    "moderate",
    "severe",
    "emergency",
  ];

  return (
    <View style={formStyles.container}>
      {/* Emergency Header */}
      <View style={formStyles.header}>
        <View style={formStyles.warningIcon}>
          <Ionicons name="warning" size={32} color={colors.emergency.red} />
        </View>
        <Text style={formStyles.title}>Rig Break Flare</Text>
        <Text style={formStyles.subtitle}>
          Alert your convoy about a vehicle issue
        </Text>
      </View>

      {/* Severity Selector */}
      <Text style={formStyles.label}>Severity Level</Text>
      <View style={formStyles.severityRow}>
        {severities.map((sev) => {
          const config = rigBreakConfig[sev];
          const isSelected = severity === sev;

          return (
            <TouchableOpacity
              key={sev}
              style={[
                formStyles.severityButton,
                isSelected && {
                  backgroundColor: config.color + "20",
                  borderColor: config.color,
                },
              ]}
              onPress={() => onSeverityChange(sev)}
            >
              <Ionicons
                name={config.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={isSelected ? config.color : colors.bark[400]}
              />
              <Text
                style={[
                  formStyles.severityLabel,
                  isSelected && { color: config.color },
                ]}
              >
                {config.label.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Issue Type Selector */}
      <Text style={formStyles.label}>Issue Type</Text>
      <View style={formStyles.issueGrid}>
        {issueTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              formStyles.issueButton,
              issueType === type && formStyles.issueButtonSelected,
            ]}
            onPress={() => onIssueTypeChange(type)}
          >
            <Text
              style={[
                formStyles.issueText,
                issueType === type && formStyles.issueTextSelected,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Description Input */}
      <Text style={formStyles.label}>Description</Text>
      <TextInput
        style={formStyles.descriptionInput}
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Describe the issue and what help you need..."
        placeholderTextColor={"rgba(0, 0, 0, 0.4)"}
        multiline
        numberOfLines={4}
      />

      {/* Location Info */}
      <View style={formStyles.locationInfo}>
        <Ionicons name="location" size={16} color={colors.forestGreen[500]} />
        <Text style={formStyles.locationText}>
          Your current location will be shared with the convoy
        </Text>
      </View>

      {/* Actions */}
      <View style={formStyles.actions}>
        <TouchableOpacity style={formStyles.cancelButton} onPress={onCancel}>
          <Text style={formStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            formStyles.submitButton,
            (!issueType || !description) && formStyles.disabledButton,
          ]}
          onPress={onSubmit}
          disabled={!issueType || !description}
        >
          <LinearGradient
            colors={[colors.emergency.red, "#B91C1C"]}
            style={formStyles.submitGradient}
          >
            <Ionicons name="send" size={18} color={colors.text.inverse} />
            <Text style={formStyles.submitText}>Send Flare</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Active Flare Card (shown to convoy members)
interface ActiveFlareCardProps {
  flare: RigBreakFlareType;
  onRespond: () => void;
  onViewOnMap: () => void;
  hasResponded: boolean;
  distance?: number;
}

export const ActiveFlareCard: React.FC<ActiveFlareCardProps> = ({
  flare,
  onRespond,
  onViewOnMap,
  hasResponded,
  distance,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = rigBreakConfig[flare.severity];

  useEffect(() => {
    if (flare.severity === "emergency" || flare.severity === "severe") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [flare.severity, pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <GlassCard
        variant="frost"
        padding="md"
        style={[
          cardStyles.container,
          { borderLeftColor: config.color, borderLeftWidth: 4 },
        ]}
      >
        {/* Header */}
        <View style={cardStyles.header}>
          <View
            style={[
              cardStyles.severityBadge,
              { backgroundColor: config.color },
            ]}
          >
            <Ionicons
              name={config.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={colors.text.inverse}
            />
            <Text style={cardStyles.severityText}>{config.label}</Text>
          </View>
          {distance && (
            <Text style={cardStyles.distance}>{distance} mi away</Text>
          )}
        </View>

        {/* Content */}
        <View style={cardStyles.content}>
          <Text style={cardStyles.userName}>{flare.userName}</Text>
          <Text style={cardStyles.rigName}>{flare.rigName}</Text>
          <Text style={cardStyles.issueType}>{flare.issueType}</Text>
          <Text style={cardStyles.description} numberOfLines={2}>
            {flare.description}
          </Text>
        </View>

        {/* Responders */}
        <View style={cardStyles.respondersRow}>
          <Ionicons name="people" size={14} color={colors.bark[400]} />
          <Text style={cardStyles.respondersText}>
            {flare.respondersCount}{" "}
            {flare.respondersCount === 1 ? "person" : "people"} responding
          </Text>
        </View>

        {/* Actions */}
        <View style={cardStyles.actions}>
          <TouchableOpacity style={cardStyles.mapButton} onPress={onViewOnMap}>
            <Ionicons name="map" size={16} color={colors.forestGreen[600]} />
            <Text style={cardStyles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              cardStyles.respondButton,
              hasResponded && cardStyles.respondedButton,
            ]}
            onPress={onRespond}
            disabled={hasResponded}
          >
            <Ionicons
              name={hasResponded ? "checkmark-circle" : "hand-right"}
              size={16}
              color={
                hasResponded ? colors.forestGreen[500] : colors.text.inverse
              }
            />
            <Text
              style={[
                cardStyles.respondButtonText,
                hasResponded && cardStyles.respondedButtonText,
              ]}
            >
              {hasResponded ? "Responding" : "I Can Help"}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const buttonStyles = StyleSheet.create({
  container: {
    position: "relative",
  },
  glow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: borderRadius.full,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  alertBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.inverse,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.emergency.red,
  },
  alertText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.emergency.red,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  content: {
    borderTopLeftRadius: borderRadius.liquid,
    borderTopRightRadius: borderRadius.liquid,
    overflow: "hidden",
    maxHeight: "90%",
  },
  blur: {
    padding: spacing.xl,
  },
  fallback: {
    backgroundColor: colors.background.primary,
  },
});

const formStyles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.emergency.redLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.emergency.red,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    textAlign: "center",
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.xs,
  },
  severityRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  severityButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1,
    borderColor: colors.bark[200],
    gap: spacing.xs,
  },
  severityLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#4A5568",
  },
  issueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  issueButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  issueButtonSelected: {
    backgroundColor: colors.sunsetOrange[100],
    borderColor: colors.sunsetOrange[500],
  },
  issueText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
  },
  issueTextSelected: {
    color: colors.sunsetOrange[600],
  },
  descriptionInput: {
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[800],
    borderWidth: 1,
    borderColor: colors.bark[200],
    height: 100,
    textAlignVertical: "top",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.forestGreen[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  locationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.forestGreen[700],
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

const cardStyles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  severityText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  distance: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#4A5568",
  },
  content: {
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  rigName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginBottom: spacing.xs,
  },
  issueType: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[900],
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
  },
  respondersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  respondersText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  mapButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.forestGreen[50],
    borderWidth: 1,
    borderColor: colors.forestGreen[200],
  },
  mapButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[600],
  },
  respondButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.burntSienna[500],
  },
  respondedButton: {
    backgroundColor: colors.forestGreen[100],
    borderWidth: 1,
    borderColor: colors.forestGreen[300],
  },
  respondButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  respondedButtonText: {
    color: colors.forestGreen[600],
  },
});

export default RigBreakFlareButton;
