/**
 * WilderGo Nomad Passport Profile Screen
 * Premium profile experience with:
 * - Rig Specs Editor
 * - Travel History
 * - Privacy Vault (Live Pin vs Ghost Mode)
 * - Maintenance Tracker
 * - Private Journal
 * - AI Build Assistant
 */

import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Modal,
} from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { getApiUrl } from "@/lib/query-client";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  profileImages,
} from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useMode } from "@/contexts/ModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { RigSpecsEditor } from "@/components/passport/RigSpecsEditor";
import { TravelHistory } from "@/components/passport/TravelHistory";
import { MaintenanceTracker } from "@/components/passport/MaintenanceTracker";
import { NomadJournal } from "@/components/passport/NomadJournal";
import { RigSpecifications } from "@/services/passport/nomadPassportService";
import PaywallScreen from "@/components/PaywallScreen";
import { AchievementGallery } from "@/components/passport/AchievementGallery";

// Mock user data
const mockUser = {
  id: "user-1",
  name: "Alex Nomad",
  avatar: profileImages.alex,
  rigName: "Wanderlust Express",
  rigType: "2019 Mercedes Sprinter 144",
  memberSince: "2023",
  verified: true,
  premium: true,
  stats: {
    connections: 127,
    convoys: 12,
    daysOnRoad: 89,
    statesVisited: 24,
    milesTracked: 15420,
  },
};

// Mock rig specs
const mockRigSpecs: RigSpecifications = {
  id: "rig-1",
  userId: "user-1",
  rigName: "Wanderlust Express",
  rigType: "2019 Mercedes Sprinter 144",
  year: 2019,
  solarWattage: 400,
  batteryCapacity: 300,
  batteryType: "lithium",
  hasShorepower: true,
  hasGenerator: true,
  generatorType: "Honda 2000",
  freshWaterCapacity: 40,
  greyWaterCapacity: 30,
  blackWaterCapacity: 0,
  hasWaterFilter: true,
  hasWaterHeater: true,
  connectivityType: "starlink",
  starlinkActive: true,
  hasBooster: true,
  hasAC: true,
  acType: "mini-split",
  hasHeater: true,
  heaterType: "diesel",
  sleeps: 2,
  hasKitchen: true,
  hasBathroom: true,
  lastUpdated: new Date().toISOString(),
};

// Passport sections
type PassportSection =
  | "overview"
  | "rig-specs"
  | "travel-history"
  | "maintenance"
  | "journal";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isGhostMode, toggleGhostMode, isPremium, setPremium } = useMode();
  const { user, logout, isAuthenticated } = useAuth();
  const { logoutRevenueCat } = useRevenueCat();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([
    "1",
    "2",
    "3",
    "5",
    "8",
  ]);
  const [badgesLoaded, setBadgesLoaded] = useState(false);
  const [genesisAvailable, setGenesisAvailable] = useState(true);

  const [activeSection, setActiveSection] =
    useState<PassportSection>("overview");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [rigSpecs, setRigSpecs] = useState<RigSpecifications>(mockRigSpecs);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);

  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState<
    "everyone" | "friends" | "nobody"
  >("friends");
  const [messageRequests, setMessageRequests] = useState<
    "everyone" | "friends" | "nobody"
  >("everyone");
  const [convoyInvites, setConvoyInvites] = useState<
    "everyone" | "connections" | "nobody"
  >("connections");
  const [activityStatus, setActivityStatus] = useState(true);
  const [showPrivacySettingModal, setShowPrivacySettingModal] = useState<
    string | null
  >(null);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    convoy: true,
    messages: true,
    weather: true,
    maintenance: false,
    events: true,
  });

  useEffect(() => {
    if (user?.uid) {
      const fetchBadges = async () => {
        try {
          const baseUrl = getApiUrl();
          const response = await fetch(
            new URL(`/api/badges/${user.uid}`, baseUrl).href,
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const defaultBadges = ["1", "2", "3", "5", "8"];
              const merged = Array.from(
                new Set([...defaultBadges, ...data.earnedBadgeIds]),
              );
              setEarnedBadgeIds(merged);
              setGenesisAvailable(data.genesisAvailable);
              setBadgesLoaded(true);
            }
          }
        } catch (e) {}
      };
      fetchBadges();
    }
  }, [user?.uid]);

  // HUD animation
  const hudGlowAnim = useRef(new Animated.Value(0.3)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Glow animation for HUD
    Animated.loop(
      Animated.sequence([
        Animated.timing(hudGlowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(hudGlowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Scan line animation
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [hudGlowAnim, scanLineAnim, pulseAnim]);

  // Section Navigation
  const sections: {
    key: PassportSection;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }[] = [
    { key: "overview", icon: "person", label: "Overview" },
    { key: "rig-specs", icon: "car-sport", label: "Rig Specs" },
    { key: "travel-history", icon: "map", label: "Travel" },
    { key: "maintenance", icon: "construct", label: "Maintenance" },
    { key: "journal", icon: "book", label: "Journal" },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case "rig-specs":
        return (
          <RigSpecsEditor
            specs={rigSpecs}
            onSave={(updatedSpecs) =>
              setRigSpecs((prev) => ({ ...prev, ...updatedSpecs }))
            }
          />
        );
      case "travel-history":
        return (
          <TravelHistory
            userId={mockUser.id}
            onSpotPress={(spot) => {
              console.log("View spot:", spot);
            }}
            onAddSpot={() => {
              console.log("Add spot");
            }}
          />
        );
      case "maintenance":
        return (
          <MaintenanceTracker
            rigId="rig-1"
            currentMileage={mockUser.stats.milesTracked}
          />
        );
      case "journal":
        return (
          <NomadJournal
            userId={mockUser.id}
            currentLocation={{
              latitude: 38.5733,
              longitude: -109.5498,
              name: "Moab, UT",
            }}
          />
        );
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      {/* Profile Header Card */}
      <GlassCard variant="frost" padding="md" style={styles.profileHeaderCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarContainer}>
            {mockUser.avatar ? (
              <Image
                source={{ uri: mockUser.avatar }}
                style={styles.profileAvatar}
              />
            ) : (
              <View
                style={[styles.profileAvatar, styles.profileAvatarPlaceholder]}
              >
                <Ionicons
                  name="person"
                  size={30}
                  color={colors.burntSienna[500]}
                />
              </View>
            )}
            {mockUser.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color={colors.text.inverse}
                />
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{mockUser.name}</Text>
            <Text style={styles.profileRig}>{mockUser.rigType}</Text>
            <View style={styles.profileBadges}>
              {mockUser.premium && (
                <View style={styles.premiumBadge}>
                  <Ionicons
                    name="diamond"
                    size={10}
                    color={colors.text.inverse}
                  />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>
                  Since {mockUser.memberSince}
                </Text>
              </View>
            </View>
          </View>

          {/* Privacy Status Button */}
          <TouchableOpacity
            style={[
              styles.privacyButton,
              isGhostMode && styles.privacyButtonActive,
            ]}
            onPress={() => setShowPrivacyModal(true)}
          >
            <Ionicons
              name={isGhostMode ? "eye-off" : "location"}
              size={16}
              color={
                isGhostMode ? colors.deepTeal[500] : colors.forestGreen[600]
              }
            />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.stats.connections}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.stats.convoys}</Text>
            <Text style={styles.statLabel}>Convoys</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.stats.daysOnRoad}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockUser.stats.statesVisited}
            </Text>
            <Text style={styles.statLabel}>States</Text>
          </View>
        </View>
      </GlassCard>

      {/* Nomad Chronicles - Achievement Gallery */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nomad Chronicles</Text>
      </View>
      <AchievementGallery
        earnedBadgeIds={earnedBadgeIds}
        genesisAvailable={genesisAvailable}
      />

      {/* Rig Quick Specs */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rig at a Glance</Text>
        <TouchableOpacity onPress={() => setActiveSection("rig-specs")}>
          <Text style={styles.viewAllText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rigQuickSpecsCard}>
        <View style={styles.specsGrid}>
          <View style={styles.specItem}>
            <View style={styles.specIconContainer}>
              <Ionicons
                name="sunny"
                size={20}
                color={colors.sunsetOrange[500]}
              />
            </View>
            <Text style={styles.specValue}>{rigSpecs.solarWattage}W</Text>
            <Text style={styles.specLabel}>Solar</Text>
          </View>
          <View style={styles.specItem}>
            <View style={styles.specIconContainer}>
              <Ionicons
                name="battery-charging"
                size={20}
                color={colors.forestGreen[500]}
              />
            </View>
            <Text style={styles.specValue}>{rigSpecs.batteryCapacity}Ah</Text>
            <Text style={styles.specLabel}>Battery</Text>
          </View>
          <View style={styles.specItem}>
            <View style={styles.specIconContainer}>
              <Ionicons name="water" size={20} color={colors.deepTeal[500]} />
            </View>
            <Text style={styles.specValue}>
              {rigSpecs.freshWaterCapacity}gal
            </Text>
            <Text style={styles.specLabel}>Water</Text>
          </View>
          <View style={styles.specItem}>
            <View style={styles.specIconContainer}>
              <Ionicons name="wifi" size={20} color={colors.burntSienna[500]} />
            </View>
            <Text style={styles.specValue}>
              {rigSpecs.connectivityType === "starlink"
                ? "Starlink"
                : rigSpecs.connectivityType === "cellular"
                  ? "Cellular"
                  : rigSpecs.connectivityType === "both"
                    ? "Both"
                    : "None"}
            </Text>
            <Text style={styles.specLabel}>Internet</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nomad Passport</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setActiveSection("travel-history")}
        >
          <GlassCard
            variant="medium"
            padding="md"
            style={styles.actionCardInner}
          >
            <LinearGradient
              colors={[
                colors.forestGreen[500] + "30",
                colors.forestGreen[600] + "15",
              ]}
              style={styles.actionIconBg}
            >
              <Ionicons name="map" size={24} color={colors.forestGreen[600]} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Travel History</Text>
            <Text style={styles.actionSublabel}>
              {mockUser.stats.milesTracked.toLocaleString()} mi
            </Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setActiveSection("maintenance")}
        >
          <GlassCard
            variant="medium"
            padding="md"
            style={styles.actionCardInner}
          >
            <LinearGradient
              colors={[
                colors.deepTeal[500] + "30",
                colors.deepTeal[600] + "15",
              ]}
              style={styles.actionIconBg}
            >
              <Ionicons
                name="construct"
                size={24}
                color={colors.deepTeal[600]}
              />
            </LinearGradient>
            <Text style={styles.actionLabel}>Maintenance</Text>
            <Text style={styles.actionSublabel}>HUD Tracker</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setActiveSection("journal")}
        >
          <GlassCard
            variant="medium"
            padding="md"
            style={styles.actionCardInner}
          >
            <LinearGradient
              colors={[
                colors.burntSienna[500] + "30",
                colors.burntSienna[600] + "15",
              ]}
              style={styles.actionIconBg}
            >
              <Ionicons name="book" size={24} color={colors.burntSienna[600]} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Journal</Text>
            <Text style={styles.actionSublabel}>Private Notes</Text>
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* Upgrade to Premium Card - Only show when not premium */}
      {!isPremium ? (
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => setShowPaywallModal(true)}
          activeOpacity={0.8}
          testID="button-upgrade-premium"
        >
          <LinearGradient
            colors={[colors.ember[500], colors.ember[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upgradeGradient}
          >
            <View style={styles.upgradeContent}>
              <View style={styles.upgradeIconContainer}>
                <Ionicons name="star" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.upgradeTextContainer}>
                <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                <Text style={styles.upgradeSubtitle}>
                  Unlock all features with 7-day free trial
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="rgba(255,255,255,0.8)"
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.premiumStatusBadge}>
          <LinearGradient
            colors={[colors.moss[500], colors.moss[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumStatusBadgeGradient}
          >
            <Ionicons name="star" size={16} color="#FFFFFF" />
            <Text style={styles.premiumStatusBadgeText}>Premium Member</Text>
          </LinearGradient>
        </View>
      )}

      {/* Settings Menu */}
      <GlassCard variant="light" padding="none" style={styles.settingsCard}>
        {[
          {
            icon: "person-outline",
            label: "Edit Profile",
            onPress: () => setShowEditProfileModal(true),
          },
          {
            icon: "notifications-outline",
            label: "Notifications",
            onPress: () => setShowNotificationsModal(true),
          },
          {
            icon: "shield-outline",
            label: "Privacy & Safety",
            onPress: () => setShowPrivacyModal(true),
          },
          {
            icon: "help-circle-outline",
            label: "Help & Support",
            onPress: () => setShowHelpModal(true),
          },
          ...(isPremium
            ? [
                {
                  icon: "card-outline",
                  label: "Manage Subscription",
                  onPress: () => setShowSubscriptionModal(true),
                },
              ]
            : [
                {
                  icon: "star-outline",
                  label: "Upgrade to Premium",
                  premium: true,
                  onPress: () => setShowPaywallModal(true),
                },
              ]),
          {
            icon: "log-out-outline",
            label: "Sign Out",
            danger: true,
            onPress: () => setIsSignedOut(true),
          },
        ].map((item, index, arr) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.settingsItem,
              index < arr.length - 1 && styles.settingsItemBorder,
            ]}
            onPress={item.onPress}
          >
            <View
              style={[
                styles.settingsIconContainer,
                item.danger && styles.settingsIconDanger,
                (item as any).premium && styles.settingsIconPremium,
              ]}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={
                  item.danger
                    ? colors.sunsetOrange[500]
                    : (item as any).premium
                      ? colors.ember[500]
                      : colors.bark[600]
                }
              />
            </View>
            <Text
              style={[
                styles.settingsLabel,
                item.danger && styles.dangerLabel,
                (item as any).premium && styles.premiumLabel,
              ]}
            >
              {item.label}
            </Text>
            {(item as any).premium ? (
              <View style={styles.freeTrialBadge}>
                <Text style={styles.freeTrialText}>Free Trial</Text>
              </View>
            ) : null}
            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                (item as any).premium ? colors.ember[400] : colors.bark[400]
              }
            />
          </TouchableOpacity>
        ))}
      </GlassCard>
    </>
  );

  return (
    <View style={[styles.cleanContainer, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {activeSection !== "overview" ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setActiveSection("overview")}
            >
              <Ionicons name="chevron-back" size={24} color="#2C2C2C" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.logoIcon}
              onPress={() => router.push("Map")}
              activeOpacity={0.7}
            >
              <Ionicons name="compass" size={24} color={colors.ember[500]} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {activeSection === "overview"
              ? "Nomad Passport"
              : activeSection === "rig-specs"
                ? "Rig Specs"
                : activeSection === "travel-history"
                  ? "Travel History"
                  : activeSection === "maintenance"
                    ? "Maintenance"
                    : "Journal"}
          </Text>
        </View>

        {/* Settings button removed - settings are accessible in the overview section */}
      </View>

      {/* Section Navigation - Compact Horizontal Tabs */}
      <View style={styles.sectionNav}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.sectionNavItem,
              activeSection === section.key && styles.sectionNavItemActive,
            ]}
            onPress={() => setActiveSection(section.key)}
          >
            <Ionicons
              name={section.icon}
              size={14}
              color={activeSection === section.key ? "#FFFFFF" : "#FF6B35"}
            />
            <Text
              style={[
                styles.sectionNavText,
                activeSection === section.key && styles.sectionNavTextActive,
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderSectionContent()}
      </ScrollView>

      {/* Privacy Vault Modal */}
      <PrivacyVaultModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        isGhostMode={isGhostMode}
        onToggleGhostMode={toggleGhostMode}
        isPremium={isPremium}
        onUpgrade={() => setPremium(true)}
        profileVisibility={profileVisibility}
        setProfileVisibility={setProfileVisibility}
        messageRequests={messageRequests}
        setMessageRequests={setMessageRequests}
        convoyInvites={convoyInvites}
        setConvoyInvites={setConvoyInvites}
        activityStatus={activityStatus}
        setActivityStatus={setActivityStatus}
        showPrivacySettingModal={showPrivacySettingModal}
        setShowPrivacySettingModal={setShowPrivacySettingModal}
      />

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={[modalStyles.container, { paddingBottom: insets.bottom }]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
              <Ionicons name="close" size={24} color={colors.bark[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={modalStyles.content}
            contentContainerStyle={modalStyles.scrollContent}
          >
            <View style={modalStyles.formSection}>
              <Text style={modalStyles.formLabel}>Display Name</Text>
              <View style={modalStyles.inputContainer}>
                <Text style={modalStyles.inputText}>{mockUser.name}</Text>
                <Ionicons name="pencil" size={18} color={colors.bark[400]} />
              </View>
            </View>
            <View style={modalStyles.formSection}>
              <Text style={modalStyles.formLabel}>Rig Name</Text>
              <View style={modalStyles.inputContainer}>
                <Text style={modalStyles.inputText}>{mockUser.rigName}</Text>
                <Ionicons name="pencil" size={18} color={colors.bark[400]} />
              </View>
            </View>
            <View style={modalStyles.formSection}>
              <Text style={modalStyles.formLabel}>Bio</Text>
              <View style={modalStyles.inputContainer}>
                <Text style={modalStyles.inputText}>
                  Living the nomad life...
                </Text>
                <Ionicons name="pencil" size={18} color={colors.bark[400]} />
              </View>
            </View>
            <Button
              title="Save Changes"
              onPress={() => setShowEditProfileModal(false)}
              variant="ember"
              size="lg"
              fullWidth
              style={{ marginTop: spacing.xl }}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={[modalStyles.container, { paddingBottom: insets.bottom }]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
              <Ionicons name="close" size={24} color={colors.bark[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={modalStyles.content}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {[
              { key: "convoy", label: "Convoy Invites", icon: "people" },
              { key: "messages", label: "Message Alerts", icon: "chatbubble" },
              {
                key: "weather",
                label: "Weather Warnings",
                icon: "thunderstorm",
              },
              {
                key: "maintenance",
                label: "Maintenance Reminders",
                icon: "construct",
              },
              { key: "events", label: "Community Events", icon: "calendar" },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={modalStyles.notificationItem}
                onPress={() =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof prev],
                  }))
                }
              >
                <View style={modalStyles.notificationLeft}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={colors.forestGreen[600]}
                  />
                  <Text style={modalStyles.notificationLabel}>
                    {item.label}
                  </Text>
                </View>
                <View
                  style={[
                    modalStyles.toggle,
                    notificationSettings[
                      item.key as keyof typeof notificationSettings
                    ] && modalStyles.toggleActive,
                  ]}
                >
                  <View
                    style={[
                      modalStyles.toggleDot,
                      notificationSettings[
                        item.key as keyof typeof notificationSettings
                      ] && modalStyles.toggleDotActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={[modalStyles.container, { paddingBottom: insets.bottom }]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Help & Support</Text>
            <TouchableOpacity onPress={() => setShowHelpModal(false)}>
              <Ionicons name="close" size={24} color={colors.bark[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={modalStyles.content}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {[
              {
                label: "Getting Started",
                icon: "rocket",
                description: "Learn the basics",
              },
              {
                label: "FAQs",
                icon: "help-circle",
                description: "Common questions",
              },
              {
                label: "Contact Support",
                icon: "mail",
                description: "Get in touch",
              },
              {
                label: "Report a Bug",
                icon: "bug",
                description: "Help us improve",
              },
              {
                label: "Community Guidelines",
                icon: "document-text",
                description: "Our rules",
              },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} style={modalStyles.helpItem}>
                <View style={modalStyles.helpIconContainer}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={colors.forestGreen[600]}
                  />
                </View>
                <View style={modalStyles.helpContent}>
                  <Text style={modalStyles.helpLabel}>{item.label}</Text>
                  <Text style={modalStyles.helpDescription}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.bark[400]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={isSignedOut}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSignedOut(false)}
      >
        <View style={modalStyles.signOutOverlay}>
          <View style={modalStyles.signOutCard}>
            <Ionicons
              name="log-out"
              size={48}
              color={colors.sunsetOrange[500]}
            />
            <Text style={modalStyles.signOutTitle}>Sign Out?</Text>
            <Text style={modalStyles.signOutDescription}>
              You will need to sign in again to access your Nomad Passport.
            </Text>
            <View style={modalStyles.signOutButtons}>
              <TouchableOpacity
                style={modalStyles.signOutCancel}
                onPress={() => setIsSignedOut(false)}
              >
                <Text style={modalStyles.signOutCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.signOutConfirm}
                onPress={async () => {
                  setIsSigningOut(true);
                  setIsSignedOut(false);

                  try {
                    logoutRevenueCat().catch(() => {});
                  } catch (e) {}
                  try {
                    await AsyncStorage.removeItem("@wildergo_auth");
                  } catch (e) {}
                  if (Platform.OS === "web" && typeof window !== "undefined") {
                    try {
                      window.localStorage.clear();
                    } catch (e) {}
                  }

                  await logout();
                  setIsSigningOut(false);
                  setIsSignedOut(false);
                }}
                disabled={isSigningOut}
                testID="button-confirm-sign-out"
              >
                <Text style={modalStyles.signOutConfirmText}>
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywallModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowPaywallModal(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.paywallCloseButton}
            onPress={() => setShowPaywallModal(false)}
          >
            <Ionicons name="close" size={28} color={colors.text.inverse} />
          </TouchableOpacity>
          <PaywallScreen
            onComplete={() => {
              setPremium(true);
              setShowPaywallModal(false);
            }}
            showSkip={false}
          />
        </View>
      </Modal>

      {/* Subscription Management Modal */}
      <Modal
        visible={showSubscriptionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={[modalStyles.container, { paddingBottom: insets.bottom }]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Manage Subscription</Text>
            <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
              <Ionicons name="close" size={24} color={colors.bark[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={modalStyles.content}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {/* Current Plan */}
            <View style={styles.subscriptionPlanCard}>
              <LinearGradient
                colors={[colors.ember[500], colors.sunsetOrange[500]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.subscriptionPlanGradient}
              >
                <View style={styles.subscriptionPlanHeader}>
                  <Ionicons name="diamond" size={28} color="#FFFFFF" />
                  <View style={styles.subscriptionPlanInfo}>
                    <Text style={styles.subscriptionPlanTitle}>
                      WilderGo Premium
                    </Text>
                    <Text style={styles.subscriptionPlanPrice}>
                      $4.99/month
                    </Text>
                  </View>
                  <View style={styles.subscriptionActiveBadge}>
                    <Text style={styles.subscriptionActiveText}>Active</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.subscriptionSectionTitle}>
              Your Premium Benefits
            </Text>

            {[
              {
                icon: "map",
                label: "Unlimited Route Planning",
                description: "Plan as many routes as you need",
              },
              {
                icon: "calendar",
                label: "Event Access",
                description: "RSVP to exclusive community events",
              },
              {
                icon: "warning",
                label: "Priority Emergency Response",
                description: "Get help faster when you need it",
              },
              {
                icon: "people",
                label: "Builder Consultations",
                description: "Connect with rig building experts",
              },
              {
                icon: "analytics",
                label: "Advanced Analytics",
                description: "Track your journey in detail",
              },
            ].map((benefit, idx) => (
              <View key={idx} style={styles.subscriptionBenefitItem}>
                <View style={styles.subscriptionBenefitIcon}>
                  <Ionicons
                    name={benefit.icon as any}
                    size={20}
                    color={colors.forestGreen[600]}
                  />
                </View>
                <View style={styles.subscriptionBenefitText}>
                  <Text style={styles.subscriptionBenefitLabel}>
                    {benefit.label}
                  </Text>
                  <Text style={styles.subscriptionBenefitDescription}>
                    {benefit.description}
                  </Text>
                </View>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.moss[500]}
                />
              </View>
            ))}

            <View style={styles.subscriptionDivider} />

            {/* Cancel Subscription */}
            <TouchableOpacity
              style={styles.cancelSubscriptionButton}
              onPress={() => {
                setPremium(false);
                setShowSubscriptionModal(false);
              }}
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={colors.sunsetOrange[500]}
              />
              <Text style={styles.cancelSubscriptionText}>
                Cancel Subscription
              </Text>
            </TouchableOpacity>

            <Text style={styles.subscriptionNote}>
              Your subscription will remain active until the end of your billing
              period. You can resubscribe anytime.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// Privacy Vault Modal Component
interface PrivacyVaultModalProps {
  visible: boolean;
  onClose: () => void;
  isGhostMode: boolean;
  onToggleGhostMode: () => void;
  isPremium: boolean;
  profileVisibility: "everyone" | "friends" | "nobody";
  setProfileVisibility: (value: "everyone" | "friends" | "nobody") => void;
  messageRequests: "everyone" | "friends" | "nobody";
  setMessageRequests: (value: "everyone" | "friends" | "nobody") => void;
  convoyInvites: "everyone" | "connections" | "nobody";
  setConvoyInvites: (value: "everyone" | "connections" | "nobody") => void;
  activityStatus: boolean;
  setActivityStatus: (value: boolean) => void;
  showPrivacySettingModal: string | null;
  setShowPrivacySettingModal: (value: string | null) => void;
  onUpgrade: () => void;
}

const PrivacyVaultModal: React.FC<PrivacyVaultModalProps> = ({
  visible,
  onClose,
  isGhostMode,
  onToggleGhostMode,
  isPremium,
  onUpgrade,
  profileVisibility,
  setProfileVisibility,
  messageRequests,
  setMessageRequests,
  convoyInvites,
  setConvoyInvites,
  activityStatus,
  setActivityStatus,
  showPrivacySettingModal,
  setShowPrivacySettingModal,
}) => {
  const insets = useSafeAreaInsets();

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
          <Text style={modalStyles.title}>Privacy Vault</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.bark[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={modalStyles.content}
          contentContainerStyle={modalStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Location Sharing Header */}
          <View style={modalStyles.sectionHeader}>
            <Ionicons
              name="location"
              size={20}
              color={colors.forestGreen[600]}
            />
            <Text style={modalStyles.sectionTitle}>Location Sharing</Text>
          </View>
          <Text style={modalStyles.sectionDescription}>
            Control how your location is shared with the community
          </Text>

          {/* Live Pin Option */}
          <TouchableOpacity
            style={[
              modalStyles.optionCard,
              !isGhostMode && modalStyles.optionCardActive,
            ]}
            onPress={() => isGhostMode && onToggleGhostMode()}
          >
            <LinearGradient
              colors={
                !isGhostMode
                  ? [colors.forestGreen[500], colors.forestGreen[600]]
                  : [colors.glass.whiteLight, colors.glass.whiteLight]
              }
              style={modalStyles.optionIconBg}
            >
              <Ionicons
                name="location"
                size={24}
                color={!isGhostMode ? colors.text.inverse : colors.bark[400]}
              />
            </LinearGradient>
            <View style={modalStyles.optionContent}>
              <Text
                style={[
                  modalStyles.optionTitle,
                  !isGhostMode && modalStyles.optionTitleActive,
                ]}
              >
                Live Pin
              </Text>
              <Text style={modalStyles.optionDescription}>
                Share your exact location with connections and convoy members
              </Text>
            </View>
            <View
              style={[
                modalStyles.radioButton,
                !isGhostMode && modalStyles.radioButtonActive,
              ]}
            >
              {!isGhostMode && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={colors.text.inverse}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Ghost Mode Option */}
          <TouchableOpacity
            style={[
              modalStyles.optionCard,
              isGhostMode && modalStyles.optionCardActive,
              !isPremium && modalStyles.optionCardLocked,
            ]}
            onPress={() => {
              if (!isPremium) {
                onUpgrade();
              } else if (!isGhostMode) {
                onToggleGhostMode();
              }
            }}
          >
            <LinearGradient
              colors={
                isGhostMode
                  ? [colors.deepTeal[500], colors.deepTeal[600]]
                  : [colors.glass.whiteLight, colors.glass.whiteLight]
              }
              style={modalStyles.optionIconBg}
            >
              <Ionicons
                name="eye-off"
                size={24}
                color={isGhostMode ? colors.text.inverse : colors.bark[400]}
              />
            </LinearGradient>
            <View style={modalStyles.optionContent}>
              <View style={modalStyles.optionTitleRow}>
                <Text
                  style={[
                    modalStyles.optionTitle,
                    isGhostMode && modalStyles.optionTitleActive,
                  ]}
                >
                  Ghost Mode
                </Text>
                {!isPremium && (
                  <View style={modalStyles.premiumBadge}>
                    <Ionicons
                      name="diamond"
                      size={10}
                      color={colors.text.inverse}
                    />
                    <Text style={modalStyles.premiumBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={modalStyles.optionDescription}>
                Show a blurred area instead of exact location. Stay private
                while still connecting.
              </Text>
            </View>
            <View
              style={[
                modalStyles.radioButton,
                isGhostMode && modalStyles.radioButtonActive,
              ]}
            >
              {isGhostMode && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={colors.text.inverse}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Ghost Mode Preview */}
          {isGhostMode && (
            <GlassCard
              variant="frost"
              padding="md"
              style={modalStyles.previewCard}
            >
              <View style={modalStyles.previewHeader}>
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={colors.deepTeal[600]}
                />
                <Text style={modalStyles.previewTitle}>Ghost Mode Active</Text>
              </View>
              <Text style={modalStyles.previewText}>
                Others will see a ~10 mile blurred radius around your location.
                Your convoy can still coordinate meetups.
              </Text>
            </GlassCard>
          )}

          {/* Additional Privacy Settings */}
          <View style={[modalStyles.sectionHeader, { marginTop: spacing.xl }]}>
            <Ionicons name="shield" size={20} color={colors.deepTeal[600]} />
            <Text style={modalStyles.sectionTitle}>Additional Settings</Text>
          </View>

          <GlassCard
            variant="light"
            padding="none"
            style={modalStyles.settingsList}
          >
            {/* Profile Visibility */}
            <TouchableOpacity
              style={[modalStyles.settingItem, modalStyles.settingItemBorder]}
              onPress={() => setShowPrivacySettingModal("visibility")}
            >
              <Ionicons name="eye-outline" size={20} color={colors.bark[500]} />
              <Text style={modalStyles.settingLabel}>Profile Visibility</Text>
              <Text style={modalStyles.settingValue}>
                {profileVisibility === "everyone"
                  ? "Everyone"
                  : profileVisibility === "friends"
                    ? "Friends Only"
                    : "Nobody"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.bark[400]}
              />
            </TouchableOpacity>

            {/* Message Requests */}
            <TouchableOpacity
              style={[modalStyles.settingItem, modalStyles.settingItemBorder]}
              onPress={() => setShowPrivacySettingModal("messages")}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.bark[500]}
              />
              <Text style={modalStyles.settingLabel}>Message Requests</Text>
              <Text style={modalStyles.settingValue}>
                {messageRequests === "everyone"
                  ? "Everyone"
                  : messageRequests === "friends"
                    ? "Friends Only"
                    : "Nobody"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.bark[400]}
              />
            </TouchableOpacity>

            {/* Convoy Invites */}
            <TouchableOpacity
              style={[modalStyles.settingItem, modalStyles.settingItemBorder]}
              onPress={() => setShowPrivacySettingModal("convoy")}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={colors.bark[500]}
              />
              <Text style={modalStyles.settingLabel}>Convoy Invites</Text>
              <Text style={modalStyles.settingValue}>
                {convoyInvites === "everyone"
                  ? "Everyone"
                  : convoyInvites === "connections"
                    ? "Connections"
                    : "Nobody"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.bark[400]}
              />
            </TouchableOpacity>

            {/* Activity Status */}
            <TouchableOpacity
              style={modalStyles.settingItem}
              onPress={() => setActivityStatus(!activityStatus)}
            >
              <Ionicons
                name="analytics-outline"
                size={20}
                color={colors.bark[500]}
              />
              <Text style={modalStyles.settingLabel}>Activity Status</Text>
              <View
                style={[
                  modalStyles.toggle,
                  activityStatus && modalStyles.toggleActive,
                ]}
              >
                <View
                  style={[
                    modalStyles.toggleDot,
                    activityStatus && modalStyles.toggleDotActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>

        {/* Privacy Setting Selection Modal */}
        <Modal
          visible={showPrivacySettingModal !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPrivacySettingModal(null)}
        >
          <TouchableOpacity
            style={modalStyles.settingModalOverlay}
            activeOpacity={1}
            onPress={() => setShowPrivacySettingModal(null)}
          >
            <View style={modalStyles.settingModalContent}>
              <Text style={modalStyles.settingModalTitle}>
                {showPrivacySettingModal === "visibility"
                  ? "Profile Visibility"
                  : showPrivacySettingModal === "messages"
                    ? "Message Requests"
                    : "Convoy Invites"}
              </Text>

              {showPrivacySettingModal === "visibility" && (
                <>
                  {(["everyone", "friends", "nobody"] as const).map(
                    (option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          modalStyles.settingOption,
                          profileVisibility === option &&
                            modalStyles.settingOptionActive,
                        ]}
                        onPress={() => {
                          setProfileVisibility(option);
                          setShowPrivacySettingModal(null);
                        }}
                      >
                        <Text
                          style={[
                            modalStyles.settingOptionText,
                            profileVisibility === option &&
                              modalStyles.settingOptionTextActive,
                          ]}
                        >
                          {option === "everyone"
                            ? "Everyone"
                            : option === "friends"
                              ? "Friends Only"
                              : "Nobody"}
                        </Text>
                        {profileVisibility === option && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={colors.moss[600]}
                          />
                        )}
                      </TouchableOpacity>
                    ),
                  )}
                </>
              )}

              {showPrivacySettingModal === "messages" && (
                <>
                  {(["everyone", "friends", "nobody"] as const).map(
                    (option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          modalStyles.settingOption,
                          messageRequests === option &&
                            modalStyles.settingOptionActive,
                        ]}
                        onPress={() => {
                          setMessageRequests(option);
                          setShowPrivacySettingModal(null);
                        }}
                      >
                        <Text
                          style={[
                            modalStyles.settingOptionText,
                            messageRequests === option &&
                              modalStyles.settingOptionTextActive,
                          ]}
                        >
                          {option === "everyone"
                            ? "Everyone"
                            : option === "friends"
                              ? "Friends Only"
                              : "Nobody"}
                        </Text>
                        {messageRequests === option && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={colors.moss[600]}
                          />
                        )}
                      </TouchableOpacity>
                    ),
                  )}
                </>
              )}

              {showPrivacySettingModal === "convoy" && (
                <>
                  {(["everyone", "connections", "nobody"] as const).map(
                    (option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          modalStyles.settingOption,
                          convoyInvites === option &&
                            modalStyles.settingOptionActive,
                        ]}
                        onPress={() => {
                          setConvoyInvites(option);
                          setShowPrivacySettingModal(null);
                        }}
                      >
                        <Text
                          style={[
                            modalStyles.settingOptionText,
                            convoyInvites === option &&
                              modalStyles.settingOptionTextActive,
                          ]}
                        >
                          {option === "everyone"
                            ? "Everyone"
                            : option === "connections"
                              ? "Connections"
                              : "Nobody"}
                        </Text>
                        {convoyInvites === option && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={colors.moss[600]}
                          />
                        )}
                      </TouchableOpacity>
                    ),
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cleanContainer: {
    flex: 1,
    backgroundColor: "#F5EFE6",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    width: 80,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 80,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#2A2A2A",
    marginLeft: spacing.sm,
    letterSpacing: typography.letterSpacing.wide,
  },
  settingsButton: {
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  settingsBlur: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  settingsFallback: {
    backgroundColor: colors.glass.whiteMedium,
  },
  sectionNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    justifyContent: "space-between",
    ...shadows.soft,
  },
  sectionNavItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xxs,
  },
  sectionNavItemActive: {
    backgroundColor: "#FF6B35",
  },
  sectionNavText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#4A4A4A",
  },
  sectionNavTextActive: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  profileHeaderCard: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  profileAvatarContainer: {
    position: "relative",
    marginRight: spacing.sm,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.glass.whiteLight,
  },
  profileAvatarPlaceholder: {
    backgroundColor: colors.burntSienna[500] + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.forestGreen[500],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.glass.whiteLight,
  },
  onlineIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.forestGreen[500],
    borderWidth: 2,
    borderColor: colors.glass.whiteLight,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
    lineHeight: 22,
  },
  profileRig: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  profileBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.burntSienna[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  memberBadge: {
    backgroundColor: colors.bark[100],
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  memberBadgeText: {
    fontSize: 8,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  privacyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.forestGreen[500] + "15",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.forestGreen[500] + "30",
  },
  privacyButtonActive: {
    backgroundColor: colors.deepTeal[500] + "20",
    borderColor: colors.deepTeal[500] + "40",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: spacing.sm,
  },
  statItem: {
    width: "48%",
    backgroundColor: "#F8F5F0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.burntSienna[500],
  },
  statLabel: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: "#2A2A2A",
    letterSpacing: typography.letterSpacing.wide,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.desertSand[600],
  },
  rigQuickSpecs: {
    marginBottom: spacing.xl,
  },
  rigQuickSpecsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.liquid,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  specIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specItem: {
    width: "47%",
    alignItems: "center",
    backgroundColor: "#F8F5F0",
    borderRadius: 12,
    padding: 12,
    gap: spacing.xs,
  },
  specValue: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  specLabel: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  aiCard: {
    marginBottom: spacing.xl,
    position: "relative",
    overflow: "hidden",
  },
  aiCardSolid: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.liquid,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  aiIconContainerSolid: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.forestGreen[50],
    justifyContent: "center",
    alignItems: "center",
  },
  aiStatusBadgeSolid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.forestGreen[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  aiStatusDotSolid: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.forestGreen[500],
    marginRight: spacing.xs,
  },
  aiStatusTextSolid: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.forestGreen[600],
    textTransform: "uppercase",
  },
  aiTitleSolid: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.headingSemiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  aiDescriptionSolid: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  aiFeaturesSolid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  aiFeatureItemSolid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  aiFeatureTextSolid: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.forestGreen[400],
  },
  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  aiIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.forestGreen[500] + "15",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: colors.forestGreen[400] + "30",
  },
  aiIconGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: borderRadius["2xl"],
    backgroundColor: colors.forestGreen[400],
  },
  aiStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.forestGreen[500] + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.forestGreen[400] + "30",
  },
  aiStatusDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.forestGreen[500],
    marginRight: spacing.xs,
  },
  aiStatusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.forestGreen[500],
    letterSpacing: 1,
  },
  aiTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
    marginBottom: spacing.sm,
  },
  aiDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255,255,255,0.85)",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  aiFeatures: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  aiFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  aiFeatureText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "rgba(255,255,255,0.9)",
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickActionCard: {
    flex: 1,
  },
  actionCardInner: {
    alignItems: "center",
    gap: spacing.sm,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    textAlign: "center",
  },
  actionSublabel: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  socialPrefsWrap: {
    marginBottom: spacing.lg,
    borderRadius: 25,
    overflow: "hidden",
  },
  socialPrefsBlur: {
    borderRadius: 25,
    overflow: "hidden",
  },
  socialPrefsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 0.3,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    padding: spacing.lg,
    paddingVertical: 18,
  },
  socialPrefsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  socialPrefsLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  socialPrefsTextWrap: {
    flex: 1,
  },
  socialPrefsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: "500",
    color: "#2A2A2A",
    marginBottom: 3,
  },
  socialPrefsStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  socialPrefsStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  socialPrefsStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: "400",
    color: "rgba(0,0,0,0.35)",
    letterSpacing: 0.2,
  },
  socialPrefsStatusActive: {
    color: "#D4A054",
    fontWeight: "500",
  },
  socialPrefsSwitch: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: "rgba(120, 120, 128, 0.16)",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  socialPrefsSwitchOn: {
    backgroundColor: "#D4A054",
  },
  socialPrefsSwitchThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  socialPrefsSwitchThumbOn: {
    alignSelf: "flex-end",
  },
  socialPrefsNote: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.3,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  socialPrefsNoteText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "300",
    color: colors.bark[400],
    lineHeight: 17,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  settingsCard: {
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.bark[500] + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  settingsIconDanger: {
    backgroundColor: colors.sunsetOrange[500] + "15",
  },
  settingsIconPremium: {
    backgroundColor: colors.ember[500] + "15",
  },
  settingsLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[700],
  },
  dangerLabel: {
    color: colors.sunsetOrange[500],
  },
  premiumLabel: {
    color: colors.ember[600],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  freeTrialBadge: {
    backgroundColor: colors.moss[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  freeTrialText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.moss[700],
    textTransform: "uppercase",
  },
  upgradeCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glass,
  },
  upgradeGradient: {
    borderRadius: borderRadius.xl,
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  upgradeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
    marginBottom: spacing.xxs,
  },
  upgradeSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255,255,255,0.85)",
  },
  premiumStatusBadge: {
    marginBottom: spacing.lg,
    alignSelf: "flex-start",
  },
  premiumStatusBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    gap: spacing.xs,
  },
  premiumStatusBadgeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  paywallCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  subscriptionPlanCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  subscriptionPlanGradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  subscriptionPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscriptionPlanInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  subscriptionPlanTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  subscriptionPlanPrice: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255,255,255,0.85)",
    marginTop: spacing.xxs,
  },
  subscriptionActiveBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  subscriptionActiveText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  subscriptionSectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
    marginBottom: spacing.md,
  },
  subscriptionBenefitItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  subscriptionBenefitIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.forestGreen[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  subscriptionBenefitText: {
    flex: 1,
  },
  subscriptionBenefitLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
  },
  subscriptionBenefitDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginTop: spacing.xxs,
  },
  subscriptionDivider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginVertical: spacing.xl,
  },
  cancelSubscriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  cancelSubscriptionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.sunsetOrange[500],
  },
  subscriptionNote: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 18,
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginBottom: spacing.lg,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.glass.whiteLight,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardActive: {
    borderColor: colors.forestGreen[500],
    backgroundColor: colors.forestGreen[50],
  },
  optionCardLocked: {
    opacity: 0.7,
  },
  optionIconBg: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  optionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
  },
  optionTitleActive: {
    color: colors.forestGreen[700],
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginTop: spacing.xxs,
  },
  optionPremiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.burntSienna[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: spacing.xxs,
  },
  optionPremiumBadgeText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.burntSienna[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: spacing.xxs,
  },
  premiumBadgeText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.bark[300],
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonActive: {
    backgroundColor: colors.forestGreen[500],
    borderColor: colors.forestGreen[500],
  },
  previewCard: {
    marginTop: spacing.sm,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  previewTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.deepTeal[700],
  },
  previewText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
    lineHeight: 20,
  },
  settingsList: {
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  settingLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[700],
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#4A5568",
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.glass.whiteLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  inputText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[700],
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  notificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  notificationLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[700],
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bark[200],
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.forestGreen[500],
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  toggleDotActive: {
    alignSelf: "flex-end",
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  helpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.forestGreen[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
  },
  helpDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  signOutOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  signOutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
  },
  signOutTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
    marginTop: spacing.md,
  },
  signOutDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  signOutButtons: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  signOutCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteLight,
    alignItems: "center",
  },
  signOutCancelText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
  },
  signOutConfirm: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.sunsetOrange[500],
    alignItems: "center",
  },
  signOutConfirmText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  settingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  settingModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 320,
  },
  settingModalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
    marginBottom: spacing.md,
    textAlign: "center",
  },
  settingOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  settingOptionActive: {
    backgroundColor: colors.moss[50],
  },
  settingOptionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[700],
  },
  settingOptionTextActive: {
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.moss[700],
  },
});
