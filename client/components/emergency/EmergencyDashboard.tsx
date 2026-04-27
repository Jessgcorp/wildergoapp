/**
 * Emergency Help Dashboard
 * Clean, distraction-free SOS screen for urgent situations
 * Focus on clarity and quick action
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import { EmergencyCategory, EMERGENCY_CATEGORIES } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = spacing.lg;
const CARD_GAP = 12;

interface EmergencyDashboardProps {
  onSelectCategory: (category: EmergencyCategory) => void;
  activeRequests?: number;
  onViewActiveRequest?: () => void;
  isInConvoy?: boolean;
  onRigBreakFlare?: () => void;
}

const nearbyHelpers = [
  {
    id: "1",
    name: "Mike T.",
    skill: "Mechanic",
    distance: "2.4 mi",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Sarah K.",
    skill: "EMT",
    distance: "3.1 mi",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5.0,
  },
  {
    id: "3",
    name: "Jake R.",
    skill: "Security",
    distance: "4.5 mi",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    rating: 4.8,
  },
];

// Community Guidelines content
const COMMUNITY_GUIDELINES = [
  {
    title: "1. Be Respectful",
    content:
      "WilderGo is a community for outdoor enthusiasts. Treat fellow hikers with respect. Harassment, hate speech, bullying, or discrimination of any kind will not be tolerated.",
  },
  {
    title: "2. Keep It Clean",
    content:
      "Do not post content that is sexually explicit, violent, illegal, or offensive.",
  },
  {
    title: "3. Respect Privacy",
    content:
      "Do not post private information about yourself or others (doxing).",
  },
  {
    title: "4. No Spam",
    content: "Do not use WilderGo to spam users or sell unrelated products.",
  },
  {
    title: "5. Reporting Violations",
    content:
      'If you see content that violates these guidelines, please report it immediately using the "Report" button in the app or email us at privacy@wildergo.com. We review all reports within 24 hours and take appropriate action, including removing content and banning repeat offenders.',
  },
  {
    title: "6. Zero Tolerance",
    content:
      "We have a zero-tolerance policy for objectionable content and abusive users. Violators will be permanently banned from the platform.",
  },
];

// Getting Started guide content
const GETTING_STARTED_STEPS = [
  {
    icon: "person-circle" as const,
    title: "Set Up Your Profile",
    content:
      "Add your photo, rig details, and travel preferences to connect with like-minded nomads.",
  },
  {
    icon: "map" as const,
    title: "Explore the Map",
    content:
      "Discover campsites, trails, and points of interest. Use Smart Route to plan your adventures.",
  },
  {
    icon: "people" as const,
    title: "Connect with Others",
    content:
      "Swipe to find travel buddies, join convoys, and message fellow adventurers.",
  },
  {
    icon: "warning" as const,
    title: "Use SOS When Needed",
    content:
      "If you need help, tap an emergency category to broadcast to nearby nomads who can assist.",
  },
];

// FAQs content
const FAQS = [
  {
    question: "How do I request help in an emergency?",
    answer:
      "From the Help tab, select the type of help you need (Mechanical, Medical, Security, or Supplies). Describe your situation and broadcast to nearby nomads.",
  },
  {
    question: "What is a Convoy?",
    answer:
      "A Convoy is a group of travelers moving together. You can coordinate routes, share locations, and communicate in real-time with your convoy members.",
  },
  {
    question: "How do I upgrade to Premium?",
    answer:
      "Go to your Profile tab and tap the Premium banner. Premium unlocks Smart Route AI, unlimited events, priority emergency response, and more.",
  },
  {
    question: "Can I use WilderGo offline?",
    answer:
      "Premium members can download offline maps for areas with limited connectivity. Basic features require an internet connection.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      "Use the Report button on any profile or message, or email privacy@wildergo.com. We review all reports within 24 hours.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "Go to your device Settings > Subscriptions and select WilderGo to manage or cancel your subscription.",
  },
  {
    question: "What are Earned Patches and how do I earn them?",
    answer:
      "Earned Patches are badges displayed on your profile that recognize your achievements and contributions to the WilderGo community. Here are the patches you can earn:\n\n" +
      "Trail Blazer - Awarded when you discover and share 10 new trail locations with the community.\n\n" +
      "Road Warrior - Earned after logging 5,000+ miles on your nomadic journeys tracked through WilderGo.\n\n" +
      "Good Samaritan - Given when you respond to and help with 5 or more SOS help requests from fellow nomads.\n\n" +
      "Convoy Captain - Unlocked after leading 3 or more convoys with other travelers.\n\n" +
      "Campfire Host - Awarded for organizing 5 community meetups or events through the app.\n\n" +
      "Off-Grid Pro - Earned by spending 30+ cumulative days in off-grid locations tracked by the app.\n\n" +
      "Verified Nomad - Given to users who have been active members for 6+ months with a verified profile.\n\n" +
      "Master Builder - Awarded for sharing detailed rig build guides that receive 50+ saves from other users.\n\n" +
      "Patches appear on your profile for others to see and help build trust within the community.",
  },
  {
    question: "What is Pending Verification and how do I get verified?",
    answer:
      'WilderGo uses selfie verification to keep the community safe and authentic. When you first sign up, your profile will show "Pending Verification" until you complete the process.\n\n' +
      "How to verify:\n" +
      "1. During onboarding, you will be asked to take a live selfie using your phone camera.\n" +
      "2. The selfie is compared against your profile photo to confirm you are who you say you are.\n" +
      "3. Our review process typically takes a few minutes but may take up to 24 hours during busy periods.\n\n" +
      "What verification unlocks:\n" +
      "- A verified badge on your profile, visible to all other users.\n" +
      "- Full access to messaging and convoy features.\n" +
      "- The ability to appear in Discovery and connect with other nomads.\n" +
      "- Higher trust ranking in SOS help responses.\n\n" +
      "Your selfie is used only for verification and is stored securely. You can re-verify at any time from your Profile settings.",
  },
  {
    question: "How do users stay safe when meeting other nomads?",
    answer:
      "Your safety is our top priority at WilderGo. Here are the safety features and best practices built into the app:\n\n" +
      "Built-in Safety Features:\n" +
      "- Selfie Verification: All users must verify their identity with a live selfie, so you know who you are meeting.\n" +
      "- Profile Trust Indicators: Verified badges, earned patches, and community ratings help you assess trustworthiness.\n" +
      "- Convoy System: Travel in groups with real-time location sharing so your convoy always knows where you are.\n" +
      "- SOS Emergency Broadcast: One-tap emergency alerts notify nearby nomads and share your GPS location instantly.\n" +
      "- Report and Block: Easily report suspicious behavior or block users directly from their profile or messages.\n\n" +
      "Safety Best Practices:\n" +
      "- Always meet in public areas or well-populated campgrounds for first meetings.\n" +
      "- Share your travel plans and location with a trusted friend or family member outside the app.\n" +
      "- Join a convoy when traveling through remote areas rather than going solo.\n" +
      "- Trust your instincts. If something feels off, use the SOS feature or leave the situation.\n" +
      "- Check a user's verification status, patches, and community standing before meeting in person.\n" +
      "- Keep your vehicle fueled and maintained so you can leave any situation quickly if needed.\n\n" +
      "If you ever feel unsafe, tap the SOS button on the Help tab to immediately broadcast your location and request assistance from nearby verified nomads.",
  },
];

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  onSelectCategory,
  activeRequests = 0,
  isInConvoy = false,
  onRigBreakFlare,
  onViewActiveRequest,
}) => {
  const insets = useSafeAreaInsets();
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showGettingStartedModal, setShowGettingStartedModal] = useState(false);
  const [showFAQsModal, setShowFAQsModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleContactSupport = () => {
    Linking.openURL(
      "mailto:support@wildergo.com?subject=WilderGo%20Support%20Request",
    );
  };

  const handleReportBug = () => {
    Linking.openURL(
      "mailto:reportbugs@wildergo.com?subject=WilderGo%20Bug%20Report",
    );
  };

  const renderCategoryCard = (category: EmergencyCategory) => {
    const info = EMERGENCY_CATEGORIES[category];

    return (
      <TouchableOpacity
        key={category}
        style={styles.categoryCard}
        onPress={() => onSelectCategory(category)}
        activeOpacity={0.7}
        testID={`category-${category}`}
        accessibilityLabel={`${info.label} emergency category`}
      >
        <View
          style={[styles.categoryContent, { borderColor: info.color + "40" }]}
        >
          <View
            style={[
              styles.categoryIconContainer,
              { backgroundColor: info.color + "20" },
            ]}
          >
            <Ionicons
              name={info.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={info.color}
            />
          </View>
          <Text style={styles.categoryLabel}>{info.label}</Text>
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {info.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sosIcon}>
            <Ionicons
              name="warning"
              size={32}
              color={colors.sunsetOrange[500]}
            />
          </View>
          <Text style={styles.headerTitle}>SOS</Text>
          <Text style={styles.headerSubtitle}>Get help from nearby nomads</Text>
        </View>

        {/* Active Request Banner */}
        {activeRequests > 0 && (
          <TouchableOpacity
            style={styles.activeRequestBanner}
            onPress={onViewActiveRequest}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.sunsetOrange[500], colors.burntSienna[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeRequestGradient}
            >
              <View style={styles.activeRequestContent}>
                <View style={styles.activeRequestLeft}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.activeRequestText}>
                    Active Request Broadcasting
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Emergency Call Card */}
        <TouchableOpacity style={styles.emergencyCallCard} activeOpacity={0.8}>
          <View style={styles.emergencyCallIcon}>
            <Ionicons name="call" size={22} color="#DC2626" />
          </View>
          <View style={styles.emergencyCallText}>
            <Text style={styles.emergencyCallTitle}>Emergency? Call 911</Text>
            <Text style={styles.emergencyCallSubtitle}>
              For life-threatening situations
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.bark[400]} />
        </TouchableOpacity>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>What do you need help with?</Text>

        {/* Category Cards - 2x2 Grid */}
        <View style={styles.categoriesGrid}>
          <View style={styles.categoryRow}>
            {renderCategoryCard("mechanical")}
            {renderCategoryCard("medical")}
          </View>
          <View style={styles.categoryRow}>
            {renderCategoryCard("security")}
            {renderCategoryCard("supplies")}
          </View>
        </View>

        {/* Nearby Helpers Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nearby Helpers</Text>
          <View style={styles.helpersBadge}>
            <Text style={styles.helpersBadgeText}>
              {nearbyHelpers.length} available
            </Text>
          </View>
        </View>

        <View style={styles.helpersContainer}>
          {nearbyHelpers.map((helper) => (
            <View key={helper.id} style={styles.helperCard}>
              <Image
                source={{ uri: helper.avatar }}
                style={styles.helperAvatar}
                contentFit="cover"
              />
              <View style={styles.helperInfo}>
                <Text style={styles.helperName}>{helper.name}</Text>
                <View style={styles.helperMeta}>
                  <View style={styles.helperSkillBadge}>
                    <Text style={styles.helperSkill}>{helper.skill}</Text>
                  </View>
                  <Text style={styles.helperDistance}>{helper.distance}</Text>
                </View>
              </View>
              <View style={styles.helperRating}>
                <Ionicons
                  name="star"
                  size={14}
                  color={colors.sunsetOrange[500]}
                />
                <Text style={styles.helperRatingText}>{helper.rating}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Convoy Rig Break Flare Option */}
        {isInConvoy && onRigBreakFlare && (
          <TouchableOpacity
            style={styles.convoyFlareCard}
            onPress={onRigBreakFlare}
            activeOpacity={0.8}
          >
            <View style={styles.convoyFlareIcon}>
              <Ionicons
                name="flash"
                size={22}
                color={colors.burntSienna[500]}
              />
            </View>
            <View style={styles.convoyFlareText}>
              <Text style={styles.convoyFlareTitle}>Convoy Rig Break</Text>
              <Text style={styles.convoyFlareSubtitle}>
                Alert your convoy members instantly
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.burntSienna[500]}
            />
          </TouchableOpacity>
        )}

        {/* Community Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,247</Text>
            <Text style={styles.statLabel}>Nomads Helped</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8 min</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Safety Notice */}
        <View style={styles.safetyNotice}>
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={colors.moss[600]}
          />
          <Text style={styles.safetyText}>
            All helpers are verified community members. Your safety is our
            priority.
          </Text>
        </View>

        {/* Help & Resources Section */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
          Help & Resources
        </Text>

        <View style={styles.resourcesContainer}>
          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => setShowGettingStartedModal(true)}
            activeOpacity={0.7}
            testID="button-getting-started"
          >
            <View
              style={[
                styles.resourceIcon,
                { backgroundColor: colors.moss[500] + "20" },
              ]}
            >
              <Ionicons name="rocket" size={20} color={colors.moss[600]} />
            </View>
            <Text style={styles.resourceTitle}>Getting Started</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.bark[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => setShowFAQsModal(true)}
            activeOpacity={0.7}
            testID="button-faqs"
          >
            <View
              style={[
                styles.resourceIcon,
                { backgroundColor: colors.sage[500] + "20" },
              ]}
            >
              <Ionicons name="help-circle" size={20} color={colors.sage[600]} />
            </View>
            <Text style={styles.resourceTitle}>FAQs</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.bark[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => setShowGuidelinesModal(true)}
            activeOpacity={0.7}
            testID="button-community-guidelines"
          >
            <View
              style={[
                styles.resourceIcon,
                { backgroundColor: colors.ember[500] + "20" },
              ]}
            >
              <Ionicons
                name="document-text"
                size={20}
                color={colors.ember[600]}
              />
            </View>
            <Text style={styles.resourceTitle}>Community Guidelines</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.bark[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={handleContactSupport}
            activeOpacity={0.7}
            testID="button-contact-support"
          >
            <View
              style={[
                styles.resourceIcon,
                { backgroundColor: colors.burntSienna[500] + "20" },
              ]}
            >
              <Ionicons name="mail" size={20} color={colors.burntSienna[600]} />
            </View>
            <Text style={styles.resourceTitle}>Contact Support</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.bark[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={handleReportBug}
            activeOpacity={0.7}
            testID="button-report-bug"
          >
            <View
              style={[
                styles.resourceIcon,
                { backgroundColor: colors.sunsetOrange[500] + "20" },
              ]}
            >
              <Ionicons name="bug" size={20} color={colors.sunsetOrange[600]} />
            </View>
            <Text style={styles.resourceTitle}>Report a Bug</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.bark[400]}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Community Guidelines Modal */}
      <Modal
        visible={showGuidelinesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGuidelinesModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Community Guidelines</Text>
            <TouchableOpacity
              onPress={() => setShowGuidelinesModal(false)}
              style={styles.modalCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.bark[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{
              paddingBottom: insets.bottom + spacing.xl,
            }}
          >
            {COMMUNITY_GUIDELINES.map((guideline, index) => (
              <View key={index} style={styles.guidelineItem}>
                <Text style={styles.guidelineTitle}>{guideline.title}</Text>
                <Text style={styles.guidelineContent}>{guideline.content}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Getting Started Modal */}
      <Modal
        visible={showGettingStartedModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGettingStartedModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Getting Started</Text>
            <TouchableOpacity
              onPress={() => setShowGettingStartedModal(false)}
              style={styles.modalCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.bark[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{
              paddingBottom: insets.bottom + spacing.xl,
            }}
          >
            <Text style={styles.gettingStartedIntro}>
              Welcome to WilderGo! Here&apos;s how to get the most out of your
              adventure companion.
            </Text>
            {GETTING_STARTED_STEPS.map((step, index) => (
              <View key={index} style={styles.gettingStartedStep}>
                <View style={styles.gettingStartedIconContainer}>
                  <Ionicons
                    name={step.icon}
                    size={28}
                    color={colors.moss[600]}
                  />
                </View>
                <View style={styles.gettingStartedTextContainer}>
                  <Text style={styles.gettingStartedStepTitle}>
                    {step.title}
                  </Text>
                  <Text style={styles.gettingStartedStepContent}>
                    {step.content}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* FAQs Modal */}
      <Modal
        visible={showFAQsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFAQsModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
            <TouchableOpacity
              onPress={() => setShowFAQsModal(false)}
              style={styles.modalCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.bark[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{
              paddingBottom: insets.bottom + spacing.xl,
            }}
          >
            {FAQS.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() =>
                  setExpandedFAQ(expandedFAQ === index ? null : index)
                }
                activeOpacity={0.7}
              >
                <View style={styles.faqQuestion}>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFAQ === index ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.bark[500]}
                  />
                </View>
                {expandedFAQ === index ? (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EFE6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  sosIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sunsetOrange[500] + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.sunsetOrange[500] + "30",
  },
  headerTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: 36,
    color: colors.sunsetOrange[600],
    letterSpacing: typography.letterSpacing.rugged,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: "#2A2A2A",
    textAlign: "center",
  },
  activeRequestBanner: {
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  activeRequestGradient: {
    borderRadius: borderRadius.liquid,
  },
  activeRequestContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  activeRequestLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
  },
  activeRequestText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: "#FFF",
  },
  emergencyCallCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.liquid,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  emergencyCallIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyCallText: {
    flex: 1,
  },
  emergencyCallTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: "#DC2626",
    marginBottom: 2,
  },
  emergencyCallSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: "#4A5568",
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    color: colors.bark[800],
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    marginBottom: spacing.xl,
    gap: CARD_GAP,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: CARD_GAP,
  },
  categoryCard: {
    flex: 1,
    maxWidth: "48%",
    borderRadius: borderRadius.liquidLg,
    overflow: "hidden",
  },
  categoryContent: {
    backgroundColor: "#FFFFFF",
    padding: spacing.lg,
    minHeight: 140,
    borderRadius: borderRadius.liquidLg,
    borderWidth: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    color: colors.bark[800],
    marginBottom: spacing.xxs,
  },
  categoryDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: "#4A5568",
    lineHeight: typography.fontSize.xs * 1.4,
  },
  helpersContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  helperCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.liquid,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  helperAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.moss[500],
  },
  helperInfo: {
    flex: 1,
  },
  helperName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
    marginBottom: spacing.xxs,
  },
  helperMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  helperSkillBadge: {
    backgroundColor: colors.moss[500] + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  helperSkill: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.xs,
    color: colors.moss[600],
  },
  helperDistance: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: "#4A5568",
  },
  helperRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  helperRatingText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
  },
  helpersBadge: {
    backgroundColor: colors.moss[500] + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  helpersBadgeText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.xs,
    color: colors.moss[600],
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.liquid,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    color: colors.sunsetOrange[500],
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[500],
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border.light,
  },
  safetyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.moss[500] + "10",
    borderRadius: borderRadius.liquid,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.moss[500] + "25",
  },
  safetyText: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.moss[700],
    lineHeight: typography.fontSize.sm * 1.4,
  },
  convoyFlareCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.burntSienna[500] + "08",
    borderRadius: borderRadius.liquid,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.burntSienna[500] + "25",
  },
  convoyFlareIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.burntSienna[500] + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  convoyFlareText: {
    flex: 1,
  },
  convoyFlareTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
    marginBottom: spacing.xxs,
  },
  convoyFlareSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
  },
  resourcesContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.liquid,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  resourceTitle: {
    flex: 1,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5EFE6",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    color: colors.bark[800],
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  guidelineItem: {
    marginBottom: spacing.lg,
  },
  guidelineTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
    marginBottom: spacing.xs,
  },
  guidelineContent: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    lineHeight: typography.fontSize.sm * 1.5,
  },
  gettingStartedIntro: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[600],
    marginBottom: spacing.xl,
    lineHeight: typography.fontSize.base * 1.5,
  },
  gettingStartedStep: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  gettingStartedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.moss[500] + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  gettingStartedTextContainer: {
    flex: 1,
  },
  gettingStartedStepTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
    marginBottom: spacing.xxs,
  },
  gettingStartedStepContent: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    lineHeight: typography.fontSize.sm * 1.5,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.liquid,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestionText: {
    flex: 1,
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[800],
    marginRight: spacing.sm,
  },
  faqAnswer: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    marginTop: spacing.md,
    lineHeight: typography.fontSize.sm * 1.5,
  },
});

export default EmergencyDashboard;
