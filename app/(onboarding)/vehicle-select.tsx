/**
 * WilderGo Vehicle/Rig Selection
 * Inclusive nomad onboarding with support for all nomadic lifestyles
 * Van Lifer, RVer, Skoolie, Car Camper, Digital Nomad
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";
import { Logo } from "@/components/ui/Logo";

interface RigType {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  examples: string;
}

// Inclusive nomad types
const rigTypes: RigType[] = [
  {
    id: "van-lifer",
    name: "Van Lifer",
    icon: "car-sport",
    description: "Living the van life dream",
    examples: "Sprinter, Transit, Promaster",
  },
  {
    id: "rver",
    name: "RVer",
    icon: "home",
    description: "Full-time RV living",
    examples: "Class A, B, C, Fifth Wheel",
  },
  {
    id: "skoolie",
    name: "Skoolie",
    icon: "bus",
    description: "Converted school bus",
    examples: "Short bus, Full-size",
  },
  {
    id: "car-camper",
    name: "Car Camper",
    icon: "car",
    description: "Adventure in any vehicle",
    examples: "SUV, Wagon, Truck bed",
  },
  {
    id: "trailer",
    name: "Trailer Nomad",
    icon: "trail-sign",
    description: "Towing your home",
    examples: "Airstream, Teardrop, Toy Hauler",
  },
  {
    id: "digital-nomad",
    name: "Digital Nomad",
    icon: "laptop",
    description: "Location independent",
    examples: "Hotels, Airbnbs, Co-living",
  },
];

export default function VehicleSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRig, setSelectedRig] = useState<string | null>(null);
  const [rigName, setRigName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRig) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/(onboarding)/nomad-style");
    setLoading(false);
  };

  const selectedRigData = rigTypes.find((r) => r.id === selectedRig);

  return (
    <NatureBackground variant="forest" overlay overlayOpacity={0.45}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <Logo size="small" variant="light" />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, styles.progressActive]} />
        </View>

        <Text style={styles.stepLabel}>Step 4 of 4 • Rig Setup</Text>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="car-sport" size={32} color={colors.text.inverse} />
          </View>
          <Text style={styles.title}>Your Rig</Text>
          <Text style={styles.subtitle}>
            Every nomad has their own unique setup. Tell us about yours so we
            can connect you with the right tribe.
          </Text>
        </View>

        {/* Rig Type Selection */}
        <GlassCard variant="medium" padding="lg" style={styles.rigCard}>
          <Text style={styles.sectionTitle}>Select Your Nomad Type</Text>

          <View style={styles.rigGrid}>
            {rigTypes.map((rig) => (
              <TouchableOpacity
                key={rig.id}
                style={[
                  styles.rigOption,
                  selectedRig === rig.id && styles.rigOptionSelected,
                ]}
                onPress={() => setSelectedRig(rig.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.rigIconContainer,
                    selectedRig === rig.id && styles.rigIconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={rig.icon}
                    size={28}
                    color={
                      selectedRig === rig.id
                        ? colors.moss[600]
                        : colors.bark[500]
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.rigName,
                    selectedRig === rig.id && styles.rigNameSelected,
                  ]}
                >
                  {rig.name}
                </Text>
                <Text style={styles.rigDescription}>{rig.description}</Text>
                <Text style={styles.rigExamples}>{rig.examples}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Rig Name Section - Only show if rig type is not digital nomad */}
        {selectedRig && selectedRig !== "digital-nomad" && (
          <GlassCard variant="light" padding="lg" style={styles.nameCard}>
            <Text style={styles.nameTitle}>Name Your Rig (Optional)</Text>
            <Text style={styles.nameHint}>
              Many nomads give their rigs a name. It helps others recognize you
              on the road!
            </Text>
            <TextInput
              style={styles.nameInput}
              placeholder={`e.g., "The Wanderer", "Betsy", "Home"`}
              placeholderTextColor={colors.bark[300]}
              value={rigName}
              onChangeText={setRigName}
              maxLength={30}
            />
          </GlassCard>
        )}

        {/* Upload Rig Photo Section */}
        <GlassCard variant="light" padding="lg" style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Upload Setup Photo</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera" size={28} color={colors.moss[500]} />
            </View>
            <Text style={styles.uploadText}>
              {selectedRig === "digital-nomad"
                ? "Tap to add your workspace photo"
                : "Tap to add a photo of your rig"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>
            Photos help verify your nomad status and help others recognize your
            setup on the road
          </Text>
        </GlassCard>

        {/* Selected Rig Summary */}
        {selectedRigData && (
          <GlassCard variant="frost" padding="md" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons
                name={selectedRigData.icon}
                size={28}
                color={colors.moss[600]}
              />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryType}>{selectedRigData.name}</Text>
                {rigName ? (
                  <Text style={styles.summaryName}>&quot;{rigName}&quot;</Text>
                ) : null}
              </View>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.moss[500]}
              />
            </View>
          </GlassCard>
        )}

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="ember"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!selectedRig}
            icon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.text.inverse}
              />
            }
            iconPosition="right"
          />

          <Text style={styles.inclusiveNote}>
            All nomadic lifestyles welcome
          </Text>
        </View>
      </ScrollView>
    </NatureBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glass,
  },
  progressContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.full,
  },
  progressActive: {
    backgroundColor: colors.ember[500],
  },
  stepLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[200],
    marginTop: spacing.md,
  },
  titleSection: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.glass,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[200],
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  rigCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.lg,
  },
  rigGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  rigOption: {
    width: "48%",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  rigOptionSelected: {
    borderColor: colors.moss[500],
    backgroundColor: colors.moss[500] + "15",
  },
  rigIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rigIconContainerSelected: {
    backgroundColor: colors.moss[100],
  },
  rigName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  rigNameSelected: {
    color: colors.moss[600],
  },
  rigDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    textAlign: "center",
    marginBottom: 2,
  },
  rigExamples: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    textAlign: "center",
    fontStyle: "italic",
  },
  nameCard: {
    marginBottom: spacing.lg,
  },
  nameTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.xs,
  },
  nameHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
    marginBottom: spacing.md,
  },
  nameInput: {
    height: 48,
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[800],
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  uploadCard: {
    marginBottom: spacing.lg,
  },
  uploadTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.md,
  },
  uploadButton: {
    height: 100,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.moss[400],
    backgroundColor: colors.moss[500] + "10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.moss[600],
  },
  uploadHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
    textAlign: "center",
    lineHeight: 16,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryType: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  summaryName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    fontStyle: "italic",
  },
  ctaSection: {
    marginBottom: spacing.xl,
  },
  inclusiveNote: {
    textAlign: "center",
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    marginTop: spacing.md,
  },
});
