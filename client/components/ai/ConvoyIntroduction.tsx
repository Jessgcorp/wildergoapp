/**
 * WilderGo Convoy Introduction Component
 * AI-powered welcome messages for new convoy members
 * Features:
 * - Personalized welcome generation
 * - Conversation starters
 * - Shared interests highlighting
 * - Activity suggestions
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  colors,
  borderRadius,
  spacing,
  typography,
  shadows,
  blur,
} from "@/constants/theme";
import {
  ConvoyMember,
  ConvoyIntroduction,
  generateConvoyIntroduction,
} from "@/services/ai/convoyAIService";

interface ConvoyIntroductionCardProps {
  newMember: ConvoyMember;
  existingMembers: ConvoyMember[];
  convoyName: string;
  onDismiss?: () => void;
  onStartConversation?: (starter: string) => void;
}

export const ConvoyIntroductionCard: React.FC<ConvoyIntroductionCardProps> = ({
  newMember,
  existingMembers,
  convoyName,
  onDismiss,
  onStartConversation,
}) => {
  const [introduction, setIntroduction] = useState<ConvoyIntroduction | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadIntroduction();
  }, [newMember, existingMembers, convoyName]);

  useEffect(() => {
    if (introduction) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [introduction, fadeAnim, slideAnim]);

  const loadIntroduction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateConvoyIntroduction(
        newMember,
        existingMembers,
        convoyName,
      );
      setIntroduction(result);
    } catch (err) {
      setError("Unable to generate introduction. Please try again.");
      console.error("Introduction generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;
  const containerProps =
    Platform.OS === "ios"
      ? {
          tint: "light" as const,
          intensity: blur.medium,
          style: styles.container,
        }
      : { style: [styles.container, styles.containerFallback] };

  return (
    <ContainerWrapper {...containerProps}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIconContainer}>
            <LinearGradient
              colors={[colors.forestGreen[500], colors.forestGreen[600]]}
              style={styles.aiIcon}
            >
              <Ionicons name="sparkles" size={16} color={colors.text.inverse} />
            </LinearGradient>
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Introduction</Text>
            <Text style={styles.headerSubtitle}>Powered by Newell AI</Text>
          </View>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss}>
            <Ionicons name="close" size={24} color={colors.bark[400]} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.forestGreen[500]} />
          <Text style={styles.loadingText}>
            Generating personalized introduction...
          </Text>
          <Text style={styles.loadingSubtext}>This takes a few seconds</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="warning-outline"
            size={32}
            color={colors.sunsetOrange[500]}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadIntroduction}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : introduction ? (
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* New member info */}
          <View style={styles.memberInfo}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberInitial}>
                {newMember.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{newMember.name}</Text>
              <Text style={styles.memberRig}>
                {newMember.rigType || "Fellow Nomad"}
              </Text>
            </View>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </View>

          {/* Welcome message */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeMessage}>
              {introduction.welcomeMessage}
            </Text>
          </View>

          {/* Shared interests */}
          {introduction.sharedInterests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="heart"
                  size={16}
                  color={colors.sunsetOrange[500]}
                />
                <Text style={styles.sectionTitle}>Shared Interests</Text>
              </View>
              <View style={styles.interestTags}>
                {introduction.sharedInterests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Conversation starters */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="chatbubbles"
                size={16}
                color={colors.forestGreen[500]}
              />
              <Text style={styles.sectionTitle}>Break the Ice</Text>
            </View>
            <ScrollView
              style={styles.startersContainer}
              showsVerticalScrollIndicator={false}
            >
              {introduction.conversationStarters.map((starter, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.starterItem}
                  onPress={() => onStartConversation?.(starter)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.starterText}>{starter}</Text>
                  <Ionicons
                    name="send"
                    size={16}
                    color={colors.forestGreen[500]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Suggested activities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="bonfire"
                size={16}
                color={colors.sunsetOrange[500]}
              />
              <Text style={styles.sectionTitle}>Suggested Activities</Text>
            </View>
            {introduction.suggestedActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityBullet} />
                <Text style={styles.activityText}>{activity}</Text>
              </View>
            ))}
          </View>

          {/* Send welcome button */}
          <TouchableOpacity
            style={styles.sendWelcomeButton}
            onPress={() => onStartConversation?.(introduction.welcomeMessage)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.forestGreen[500], colors.forestGreen[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendWelcomeGradient}
            >
              <Ionicons
                name="hand-left"
                size={20}
                color={colors.text.inverse}
              />
              <Text style={styles.sendWelcomeText}>Send Welcome Message</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </ContainerWrapper>
  );
};

// Compact version for notifications
interface ConvoyIntroductionBannerProps {
  memberName: string;
  convoyName: string;
  onPress: () => void;
}

export const ConvoyIntroductionBanner: React.FC<
  ConvoyIntroductionBannerProps
> = ({ memberName, convoyName, onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={styles.banner}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[
            colors.forestGreen[500] + "E0",
            colors.forestGreen[600] + "E0",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerIconContainer}>
            <Ionicons name="person-add" size={20} color={colors.text.inverse} />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>
              {memberName} joined {convoyName}!
            </Text>
            <Text style={styles.bannerSubtitle}>
              Tap to send an AI-generated welcome
            </Text>
          </View>
          <Ionicons
            name="sparkles"
            size={20}
            color={colors.sunsetOrange[400]}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xxl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  containerFallback: {
    backgroundColor: colors.glass.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[200],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  aiIconContainer: {
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  aiIcon: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  // Loading
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  // Error
  errorContainer: {
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.forestGreen[500],
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  // Content
  content: {
    padding: spacing.lg,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.forestGreen[500],
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitial: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.inverse,
  },
  memberDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  memberRig: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  newBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.forestGreen[100],
    borderRadius: borderRadius.full,
  },
  newBadgeText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[600],
  },
  // Welcome
  welcomeSection: {
    backgroundColor: colors.forestGreen[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  welcomeMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Interests
  interestTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  interestTag: {
    backgroundColor: colors.sunsetOrange[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  interestTagText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.sunsetOrange[600],
  },
  // Starters
  startersContainer: {
    maxHeight: 150,
  },
  starterItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bark[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  starterText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  // Activities
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  activityBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sunsetOrange[400],
    marginRight: spacing.sm,
  },
  activityText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  // Send welcome
  sendWelcomeButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  sendWelcomeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  sendWelcomeText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  // Banner
  banner: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  bannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  bannerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.whiteSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  bannerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: 2,
  },
});

export default ConvoyIntroductionCard;
