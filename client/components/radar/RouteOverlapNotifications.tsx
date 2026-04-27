/**
 * WilderGo Route Overlap Notifications
 * Shows predicted path crossings and high-match alerts
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
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
import {
  RouteOverlapNotification,
  radarService,
} from "@/services/radar/radarService";

interface RouteOverlapNotificationsProps {
  notifications: RouteOverlapNotification[];
  onNotificationPress?: (notification: RouteOverlapNotification) => void;
  onDismiss?: (notificationId: string) => void;
}

export const RouteOverlapNotifications: React.FC<
  RouteOverlapNotificationsProps
> = ({ notifications, onNotificationPress, onDismiss }) => {
  if (notifications.length === 0) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="git-merge" size={18} color={colors.moss[500]} />
          <Text style={styles.headerTitle}>Route Updates</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => onNotificationPress?.(item)}
            onDismiss={() => onDismiss?.(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
      />
    </View>
  );
};

interface NotificationCardProps {
  notification: RouteOverlapNotification;
  onPress?: () => void;
  onDismiss?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDismiss,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const priorityColor = radarService.getNotificationPriorityColor(
    notification.priority,
  );
  const icon = radarService.getNotificationIcon(notification.type);

  useEffect(() => {
    if (notification.priority === "high" && !notification.isRead) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [notification, pulseAnim]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const CardContent = () => (
    <View style={cardStyles.content}>
      {/* Priority indicator */}
      <View
        style={[cardStyles.priorityBar, { backgroundColor: priorityColor }]}
      />

      {/* Icon or user avatar */}
      <View style={cardStyles.iconContainer}>
        {notification.relatedUser?.avatar ? (
          <View style={cardStyles.avatarContainer}>
            <Image
              source={{ uri: notification.relatedUser.avatar }}
              style={cardStyles.avatar}
            />
            <View
              style={[
                cardStyles.typeIconOverlay,
                { backgroundColor: priorityColor },
              ]}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={10}
                color={colors.text.inverse}
              />
            </View>
          </View>
        ) : (
          <View
            style={[
              cardStyles.iconWrapper,
              { backgroundColor: priorityColor + "20" },
            ]}
          >
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={priorityColor}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={cardStyles.textContainer}>
        <Text
          style={[
            cardStyles.title,
            !notification.isRead && cardStyles.titleUnread,
          ]}
        >
          {notification.title}
        </Text>
        <Text style={cardStyles.description} numberOfLines={2}>
          {notification.description}
        </Text>

        {/* Meta info */}
        <View style={cardStyles.metaRow}>
          {notification.matchPercentage && (
            <View style={cardStyles.matchBadge}>
              <Ionicons name="navigate" size={10} color={priorityColor} />
              <Text style={[cardStyles.matchText, { color: priorityColor }]}>
                {notification.matchPercentage}%
              </Text>
            </View>
          )}
          {notification.predictedLocation && (
            <View style={cardStyles.locationBadge}>
              <Ionicons
                name="location-outline"
                size={10}
                color={colors.bark[400]}
              />
              <Text style={cardStyles.locationText} numberOfLines={1}>
                {notification.predictedLocation}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Timestamp */}
      <Text style={cardStyles.timestamp}>
        {formatTime(notification.createdAt)}
      </Text>

      {/* Dismiss button */}
      <TouchableOpacity
        style={cardStyles.dismissButton}
        onPress={(e) => {
          e.stopPropagation();
          onDismiss?.();
        }}
      >
        <Ionicons name="close" size={16} color={colors.bark[400]} />
      </TouchableOpacity>

      {/* Unread indicator */}
      {!notification.isRead && <View style={cardStyles.unreadDot} />}
    </View>
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          cardStyles.card,
          notification.priority === "high" && {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={blur.medium}
            tint="light"
            style={cardStyles.blur}
          >
            <CardContent />
          </BlurView>
        ) : (
          <View style={[cardStyles.blur, cardStyles.fallback]}>
            <CardContent />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Compact notification banner for map overlay
interface NotificationBannerProps {
  notification: RouteOverlapNotification;
  onPress?: () => void;
  onDismiss?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onPress,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const priorityColor = radarService.getNotificationPriorityColor(
    notification.priority,
  );
  const icon = radarService.getNotificationIcon(notification.type);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  return (
    <Animated.View
      style={[
        bannerStyles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={bannerStyles.banner}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={blur.heavy}
            tint="light"
            style={bannerStyles.blur}
          >
            <View
              style={[
                bannerStyles.priorityStripe,
                { backgroundColor: priorityColor },
              ]}
            />
            <View
              style={[
                bannerStyles.iconContainer,
                { backgroundColor: priorityColor + "20" },
              ]}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={priorityColor}
              />
            </View>
            <View style={bannerStyles.textContainer}>
              <Text style={bannerStyles.title}>{notification.title}</Text>
              <Text style={bannerStyles.description} numberOfLines={1}>
                {notification.description}
              </Text>
            </View>
            <TouchableOpacity
              style={bannerStyles.dismissButton}
              onPress={handleDismiss}
            >
              <Ionicons name="close" size={20} color={colors.bark[500]} />
            </TouchableOpacity>
          </BlurView>
        ) : (
          <View style={[bannerStyles.blur, bannerStyles.fallback]}>
            <View
              style={[
                bannerStyles.priorityStripe,
                { backgroundColor: priorityColor },
              ]}
            />
            <View
              style={[
                bannerStyles.iconContainer,
                { backgroundColor: priorityColor + "20" },
              ]}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={priorityColor}
              />
            </View>
            <View style={bannerStyles.textContainer}>
              <Text style={bannerStyles.title}>{notification.title}</Text>
              <Text style={bannerStyles.description} numberOfLines={1}>
                {notification.description}
              </Text>
            </View>
            <TouchableOpacity
              style={bannerStyles.dismissButton}
              onPress={handleDismiss}
            >
              <Ionicons name="close" size={20} color={colors.bark[500]} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  unreadBadge: {
    backgroundColor: colors.ember[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  unreadCount: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.text.inverse,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.glass,
  },
  blur: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  fallback: {
    backgroundColor: colors.glass.white,
  },
  content: {
    padding: spacing.sm,
    position: "relative",
  },
  priorityBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: "relative",
    width: 32,
    height: 32,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  typeIconOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.glass.white,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[700],
    marginBottom: spacing.xxs,
  },
  titleUnread: {
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[900],
  },
  description: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.glass.whiteLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  matchText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    maxWidth: 120,
  },
  locationText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  timestamp: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  dismissButton: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ember[500],
  },
});

const bannerStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  banner: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glass,
  },
  blur: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    position: "relative",
  },
  fallback: {
    backgroundColor: colors.glass.white,
  },
  priorityStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  description: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  dismissButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RouteOverlapNotifications;
