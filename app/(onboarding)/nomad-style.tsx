import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  natureImages,
} from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

const { width, height } = Dimensions.get("window");

interface NomadStyleOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const nomadStyles: NomadStyleOption[] = [
  {
    id: "fulltime",
    title: "Full-Time Nomad",
    description: "Living on the road year-round",
    icon: "navigate",
    color: colors.ember[500],
  },
  {
    id: "parttime",
    title: "Part-Time Explorer",
    description: "Weekends and vacations",
    icon: "compass",
    color: colors.moss[500],
  },
  {
    id: "seasonal",
    title: "Seasonal Traveler",
    description: "Following the weather",
    icon: "sunny",
    color: colors.driftwood[500],
  },
  {
    id: "remote",
    title: "Remote Worker",
    description: "Working from anywhere",
    icon: "laptop",
    color: colors.bark[600],
  },
  {
    id: "retired",
    title: "Retired Adventurer",
    description: "Living the dream",
    icon: "heart",
    color: colors.ember[400],
  },
  {
    id: "building",
    title: "Currently Building",
    description: "Future nomad in progress",
    icon: "construct",
    color: colors.moss[600],
  },
];

const interests: { name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: "Hiking", icon: "walk" },
  { name: "Photography", icon: "camera" },
  { name: "Fishing", icon: "fish" },
  { name: "Climbing", icon: "trending-up" },
  { name: "Surfing", icon: "water" },
  { name: "Coffee", icon: "cafe" },
  { name: "Wine", icon: "wine" },
  { name: "Cooking", icon: "restaurant" },
  { name: "Music", icon: "musical-notes" },
  { name: "Yoga", icon: "body" },
  { name: "MTB", icon: "bicycle" },
  { name: "Kayaking", icon: "boat" },
  { name: "Stargazing", icon: "star" },
  { name: "Wildlife", icon: "paw" },
  { name: "Hot Springs", icon: "flame" },
];

export default function NomadStyleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const backgroundScale = useRef(new Animated.Value(1.1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backgroundScale, {
        toValue: 1.05,
        duration: 20000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, backgroundScale]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleContinue = async () => {
    if (!selectedStyle) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/(onboarding)/selfie-verify");
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Full-Screen Background Image */}
      <Animated.View
        style={[
          styles.backgroundContainer,
          { transform: [{ scale: backgroundScale }] },
        ]}
      >
        <Image
          source={{ uri: natureImages.desertSunrise }}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={800}
        />
      </Animated.View>

      {/* Gradient Overlay */}
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.3)",
          "rgba(0, 0, 0, 0.5)",
          "rgba(30, 24, 20, 0.85)",
          "rgba(30, 24, 20, 0.98)",
        ]}
        locations={[0, 0.25, 0.6, 1]}
        style={styles.gradient}
      />

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={styles.progressBar} />
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.stepLabel}>Step 3 of 5 • Nomad Profile</Text>

        {/* Title Section */}
        <Animated.View
          style={[
            styles.titleSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.titleIconContainer}>
            <Ionicons
              name="person-circle"
              size={36}
              color={colors.ember[400]}
            />
          </View>
          <Text style={styles.title}>Your Nomad Style</Text>
          <Text style={styles.subtitle}>
            Help us match you with like-minded travelers
          </Text>
        </Animated.View>

        {/* Nomad Style Selection */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <GlassCard variant="frost" padding="lg" style={styles.styleCard}>
            <Text style={styles.sectionTitle}>
              What describes your journey?
            </Text>
            <View style={styles.styleGrid}>
              {nomadStyles.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleOption,
                    selectedStyle === style.id && styles.styleOptionSelected,
                  ]}
                  onPress={() => setSelectedStyle(style.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.styleIconContainer,
                      { backgroundColor: style.color + "20" },
                      selectedStyle === style.id && {
                        backgroundColor: style.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={style.icon}
                      size={22}
                      color={
                        selectedStyle === style.id
                          ? colors.text.inverse
                          : style.color
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.styleTitle,
                      selectedStyle === style.id && styles.styleTitleSelected,
                    ]}
                  >
                    {style.title}
                  </Text>
                  <Text style={styles.styleDescription}>
                    {style.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Interests Selection */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <GlassCard variant="frost" padding="lg" style={styles.interestsCard}>
            <View style={styles.interestsHeader}>
              <Text style={styles.sectionTitle}>Your Interests</Text>
              <View style={styles.interestCountBadge}>
                <Text style={styles.interestCountText}>
                  {selectedInterests.length}/5
                </Text>
              </View>
            </View>
            <View style={styles.interestsGrid}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest.name}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest.name) &&
                      styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={interest.icon}
                    size={16}
                    color={
                      selectedInterests.includes(interest.name)
                        ? colors.text.inverse
                        : colors.bark[500]
                    }
                    style={styles.interestIcon}
                  />
                  <Text
                    style={[
                      styles.interestText,
                      selectedInterests.includes(interest.name) &&
                        styles.interestTextSelected,
                    ]}
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="ember"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!selectedStyle}
            icon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.text.inverse}
              />
            }
            iconPosition="right"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1814",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
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
    color: colors.bark[200],
    marginTop: spacing.md,
  },
  titleSection: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  titleIconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.glassFloat,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: "700",
    color: colors.text.inverse,
    marginBottom: spacing.sm,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.bark[200],
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.lg,
  },
  styleCard: {
    borderRadius: borderRadius["2xl"],
  },
  interestsCard: {
    borderRadius: borderRadius["2xl"],
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.bark[700],
    marginBottom: spacing.lg,
  },
  interestsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  interestCountBadge: {
    backgroundColor: colors.moss[500] + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  interestCountText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.moss[600],
  },
  styleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  styleOption: {
    width: "48%",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    gap: 4,
  },
  styleOptionSelected: {
    borderColor: colors.moss[500],
    backgroundColor: colors.moss[500] + "15",
  },
  styleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  styleTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.bark[700],
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  styleTitleSelected: {
    color: colors.moss[600],
  },
  styleDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.bark[400],
    textAlign: "center",
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteSubtle,
    borderWidth: 1.5,
    borderColor: colors.glass.border,
  },
  interestChipSelected: {
    backgroundColor: colors.moss[500],
    borderColor: colors.moss[500],
  },
  interestIcon: {
    marginRight: spacing.xs,
  },
  interestText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    fontWeight: "500",
  },
  interestTextSelected: {
    color: colors.text.inverse,
  },
  ctaSection: {
    marginTop: "auto",
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
