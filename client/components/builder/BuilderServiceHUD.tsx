/**
 * WilderGo Builder Service HUD
 * Professional marketplace component showing build history, expertise, and consultation booking
 * Part of the Builder Mode marketplace with verified professional network
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface BuildProject {
  id: string;
  title: string;
  vehicleType: string;
  completionDate: string;
  imageUrl: string;
  rating: number;
  features: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface BuilderService {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  icon: keyof typeof Ionicons.glyphMap;
  popular?: boolean;
}

interface BuilderData {
  id: string;
  name: string;
  businessName: string;
  avatarUrl: string;
  coverImageUrl: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  yearsExperience: number;
  buildsCompleted: number;
  responseTime: string;
  specialties: string[];
  certifications: Certification[];
  services: BuilderService[];
  portfolio: BuildProject[];
  bio: string;
  availability: "available" | "limited" | "booked";
}

interface BuilderServiceHUDProps {
  builder: BuilderData;
  onBookConsultation?: () => void;
  onViewPortfolio?: () => void;
  onMessage?: () => void;
  onRequestQuote?: (service: BuilderService) => void;
}

const availabilityConfig = {
  available: {
    color: colors.moss[500],
    label: "Available Now",
    icon: "checkmark-circle" as const,
  },
  limited: {
    color: colors.ember[500],
    label: "Limited Slots",
    icon: "time" as const,
  },
  booked: {
    color: colors.bark[400],
    label: "Fully Booked",
    icon: "close-circle" as const,
  },
};

export const BuilderServiceHUD: React.FC<BuilderServiceHUDProps> = ({
  builder,
  onBookConsultation,
  onViewPortfolio,
  onMessage,
  onRequestQuote,
}) => {
  const [activeTab, setActiveTab] = useState<
    "services" | "portfolio" | "reviews"
  >("services");
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const statsAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const availability = availabilityConfig[builder.availability];

  useEffect(() => {
    // Animate stats on mount
    statsAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 100,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, [statsAnims]);

  useEffect(() => {
    const tabIndex =
      activeTab === "services" ? 0 : activeTab === "portfolio" ? 1 : 2;
    Animated.spring(tabIndicatorAnim, {
      toValue: tabIndex,
      tension: 120,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabIndicatorAnim]);

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;
  const tabWidth = (SCREEN_WIDTH - spacing.xl * 2) / 3;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: builder.coverImageUrl }}
          style={styles.coverImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.coverGradient}
        />

        {/* Builder Avatar & Info */}
        <View style={styles.heroContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: builder.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
            {builder.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={colors.moss[500]}
                />
              </View>
            )}
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.businessName}>{builder.businessName}</Text>
            <Text style={styles.builderName}>{builder.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.text.inverse} />
              <Text style={styles.locationText}>{builder.location}</Text>
            </View>
          </View>

          {/* Availability Badge */}
          <View
            style={[
              styles.availabilityBadge,
              { backgroundColor: availability.color + "20" },
            ]}
          >
            <Ionicons
              name={availability.icon}
              size={14}
              color={availability.color}
            />
            <Text
              style={[styles.availabilityText, { color: availability.color }]}
            >
              {availability.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { value: builder.rating.toFixed(1), label: "Rating", icon: "star" },
          {
            value: `${builder.buildsCompleted}+`,
            label: "Builds",
            icon: "construct",
          },
          {
            value: `${builder.yearsExperience}yr`,
            label: "Experience",
            icon: "calendar",
          },
          { value: builder.responseTime, label: "Response", icon: "time" },
        ].map((stat, index) => (
          <Animated.View
            key={stat.label}
            style={[
              styles.statItem,
              {
                opacity: statsAnims[index],
                transform: [
                  {
                    translateY: statsAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ContainerWrapper
              {...(Platform.OS === "ios"
                ? {
                    tint: "light" as const,
                    intensity: blur.medium,
                    style: styles.statCard,
                  }
                : { style: [styles.statCard, styles.statCardFallback] })}
            >
              <Ionicons
                name={stat.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.driftwood[500]}
              />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </ContainerWrapper>
          </Animated.View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={onBookConsultation}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[
              colors.driftwood[400],
              colors.driftwood[500],
              colors.driftwood[600],
            ]}
            style={styles.primaryActionGradient}
          >
            <Ionicons name="videocam" size={20} color={colors.text.inverse} />
            <Text style={styles.primaryActionText}>Book Consultation</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={onMessage}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colors.driftwood[600]}
          />
        </TouchableOpacity>
      </View>

      {/* Specialties */}
      <GlassCard variant="light" padding="lg" style={styles.section}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.specialtiesGrid}>
          {builder.specialties.map((specialty, index) => (
            <View key={index} style={styles.specialtyChip}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Certifications */}
      {builder.certifications.length > 0 && (
        <GlassCard variant="light" padding="lg" style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.certificationsContainer}>
            {builder.certifications.map((cert) => (
              <View key={cert.id} style={styles.certificationItem}>
                <View style={styles.certificationIcon}>
                  <Ionicons
                    name={cert.icon}
                    size={18}
                    color={colors.moss[500]}
                  />
                </View>
                <View style={styles.certificationInfo}>
                  <Text style={styles.certificationName}>{cert.name}</Text>
                  <Text style={styles.certificationIssuer}>{cert.issuer}</Text>
                </View>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.moss[500]}
                />
              </View>
            ))}
          </View>
        </GlassCard>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: tabWidth - spacing.sm,
                transform: [
                  {
                    translateX: tabIndicatorAnim.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [
                        spacing.xs,
                        tabWidth + spacing.xs,
                        tabWidth * 2 + spacing.xs,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
          {(["services", "portfolio", "reviews"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === "services" && (
        <View style={styles.tabContent}>
          {builder.services.map((service) => (
            <GlassCard
              key={service.id}
              variant="frost"
              padding="lg"
              style={styles.serviceCard}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconContainer}>
                  <Ionicons
                    name={service.icon}
                    size={22}
                    color={colors.driftwood[500]}
                  />
                </View>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceNameRow}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.serviceDescription}>
                    {service.description}
                  </Text>
                </View>
              </View>
              <View style={styles.serviceFooter}>
                <View style={styles.serviceMeta}>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                  <Text style={styles.serviceDuration}>{service.duration}</Text>
                </View>
                <TouchableOpacity
                  style={styles.requestQuoteButton}
                  onPress={() => onRequestQuote?.(service)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.requestQuoteText}>Request Quote</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={colors.driftwood[600]}
                  />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>
      )}

      {activeTab === "portfolio" && (
        <View style={styles.tabContent}>
          <View style={styles.portfolioGrid}>
            {builder.portfolio.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.portfolioCard}
                onPress={onViewPortfolio}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: project.imageUrl }}
                  style={styles.portfolioImage}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={styles.portfolioOverlay}
                >
                  <Text style={styles.portfolioTitle}>{project.title}</Text>
                  <Text style={styles.portfolioType}>
                    {project.vehicleType}
                  </Text>
                  <View style={styles.portfolioRating}>
                    <Ionicons name="star" size={12} color={colors.ember[400]} />
                    <Text style={styles.portfolioRatingText}>
                      {project.rating}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewPortfolio}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>View Full Portfolio</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={colors.driftwood[600]}
            />
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "reviews" && (
        <View style={styles.tabContent}>
          <View style={styles.reviewsSummary}>
            <Text style={styles.reviewsRating}>
              {builder.rating.toFixed(1)}
            </Text>
            <View style={styles.reviewsStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={
                    star <= Math.round(builder.rating) ? "star" : "star-outline"
                  }
                  size={20}
                  color={colors.ember[400]}
                />
              ))}
            </View>
            <Text style={styles.reviewsCount}>
              Based on {builder.reviewCount} reviews
            </Text>
          </View>

          {/* Placeholder for reviews */}
          <GlassCard variant="frost" padding="lg" style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitial}>J</Text>
              </View>
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>Jake M.</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color={colors.ember[400]}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>2 weeks ago</Text>
            </View>
            <Text style={styles.reviewText}>
              Incredible work on my Sprinter build! Attention to detail was
              amazing and they really understood the nomadic lifestyle. Highly
              recommend for any conversion project.
            </Text>
          </GlassCard>
        </View>
      )}

      {/* Bio */}
      <GlassCard variant="light" padding="lg" style={styles.bioSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{builder.bio}</Text>
      </GlassCard>

      {/* Bottom padding */}
      <View style={{ height: spacing["3xl"] }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  heroSection: {
    height: 280,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: "absolute",
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    borderColor: colors.text.inverse,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.text.inverse,
  },
  heroInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  businessName: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    color: colors.text.inverse,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  builderName: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[200],
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    position: "absolute",
    top: -220,
    right: 0,
  },
  availabilityText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.xs,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
  },
  statCard: {
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  statCardFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  statValue: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    color: colors.bark[800],
    marginTop: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[400],
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glass,
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  primaryActionText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.wide,
  },
  secondaryAction: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.driftwood[300],
  },
  section: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.bark[700],
    marginBottom: spacing.md,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  specialtyChip: {
    backgroundColor: colors.driftwood[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  specialtyText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.driftwood[700],
  },
  certificationsContainer: {
    gap: spacing.md,
  },
  certificationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  certificationIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.moss[50],
    justifyContent: "center",
    alignItems: "center",
  },
  certificationInfo: {
    flex: 1,
  },
  certificationName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
  },
  certificationIssuer: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[400],
  },
  tabContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: spacing.xs,
    height: "100%",
    backgroundColor: colors.glass.white,
    borderRadius: borderRadius.lg,
    ...shadows.glassSubtle,
  },
  tab: {
    paddingVertical: spacing.md,
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
  },
  tabTextActive: {
    color: colors.bark[800],
  },
  tabContent: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  serviceCard: {
    marginBottom: spacing.md,
  },
  serviceHeader: {
    flexDirection: "row",
    gap: spacing.md,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.driftwood[100],
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  serviceName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
  },
  popularBadge: {
    backgroundColor: colors.ember[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 9,
    color: colors.ember[600],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  serviceDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  serviceFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glass.borderLight,
  },
  serviceMeta: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  servicePrice: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    color: colors.bark[800],
  },
  serviceDuration: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[400],
  },
  requestQuoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.driftwood[100],
  },
  requestQuoteText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.driftwood[600],
  },
  portfolioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  portfolioCard: {
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2,
    height: 160,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  portfolioImage: {
    width: "100%",
    height: "100%",
  },
  portfolioOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  portfolioTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
  },
  portfolioType: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[200],
    marginTop: 2,
  },
  portfolioRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  portfolioRatingText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  viewAllText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.driftwood[600],
  },
  reviewsSummary: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  reviewsRating: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["3xl"],
    color: colors.bark[800],
  },
  reviewsStars: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  reviewsCount: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    marginTop: spacing.sm,
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.driftwood[200],
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerInitial: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.driftwood[700],
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  reviewerName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[300],
  },
  reviewText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    lineHeight: 20,
  },
  bioSection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  bioText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    lineHeight: 22,
  },
});

export default BuilderServiceHUD;
