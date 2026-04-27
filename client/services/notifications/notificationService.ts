/**
 * WilderGo Notification Service
 * Firebase Cloud Messaging architecture for real-time alerts
 * Handles push notifications for matches, messages, and help requests
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Notification types for WilderGo ecosystem
export type NotificationType =
  | "new_match"
  | "new_message"
  | "help_request"
  | "help_response"
  | "convoy_invite"
  | "campfire_event"
  | "route_overlap"
  | "builder_request"
  | "verification_complete"
  | "subscription_update";

export interface WilderGoNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Storage keys
const STORAGE_KEYS = {
  PUSH_TOKEN: "@wildergo_push_token",
  NOTIFICATIONS: "@wildergo_notifications",
  NOTIFICATION_SETTINGS: "@wildergo_notification_settings",
};

// Default notification settings
export interface NotificationSettings {
  enabled: boolean;
  newMatches: boolean;
  messages: boolean;
  helpRequests: boolean;
  convoyUpdates: boolean;
  campfireEvents: boolean;
  builderRequests: boolean;
  sound: boolean;
  vibration: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  newMatches: true,
  messages: true,
  helpRequests: true,
  convoyUpdates: true,
  campfireEvents: true,
  builderRequests: true,
  sound: true,
  vibration: true,
};

// Configure notification handling behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register device for push notifications
 * Returns the Expo push token for FCM
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Check if physical device (required for push notifications)
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return null;
    }

    // Get Expo push token (works with FCM on Android)
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    const token = tokenData.data;

    // Store token locally
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);

    // Configure Android notification channel
    if (Platform.OS === "android") {
      await setupAndroidNotificationChannels();
    }

    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Setup Android notification channels for different alert types
 */
async function setupAndroidNotificationChannels(): Promise<void> {
  // High priority channel for help requests
  await Notifications.setNotificationChannelAsync("help-requests", {
    name: "Help Requests",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: "#E87A47", // Help mode orange
    sound: "default",
  });

  // Medium priority for matches and messages
  await Notifications.setNotificationChannelAsync("matches", {
    name: "New Matches",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#DC2626", // SOS alert red
  });

  await Notifications.setNotificationChannelAsync("messages", {
    name: "Messages",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250],
    lightColor: "#2563EB", // Friends mode blue
  });

  // Standard priority for convoy and campfire
  await Notifications.setNotificationChannelAsync("convoy", {
    name: "Convoy Updates",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#D97706", // Builder mode amber
  });

  await Notifications.setNotificationChannelAsync("campfire", {
    name: "Campfire Events",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#F59E0B",
  });
}

/**
 * Get the notification channel for a specific type
 */
function getChannelForType(type: NotificationType): string {
  switch (type) {
    case "help_request":
    case "help_response":
      return "help-requests";
    case "new_match":
    case "route_overlap":
      return "matches";
    case "new_message":
      return "messages";
    case "convoy_invite":
    case "builder_request":
      return "convoy";
    case "campfire_event":
      return "campfire";
    default:
      return "default";
  }
}

/**
 * Schedule a local notification (for testing and offline scenarios)
 */
export async function scheduleLocalNotification(
  payload: NotificationPayload,
): Promise<string | null> {
  try {
    const settings = await getNotificationSettings();

    // Check if notifications are enabled
    if (!settings.enabled) {
      return null;
    }

    // Check type-specific settings
    if (!shouldShowNotification(payload.type, settings)) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: {
          type: payload.type,
          ...payload.data,
        },
        sound: settings.sound,
        ...(Platform.OS === "android" && {
          channelId: getChannelForType(payload.type),
        }),
      },
      trigger: null, // Show immediately
    });

    // Store notification in local history
    await addNotificationToHistory({
      id: notificationId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

/**
 * Check if a notification should be shown based on settings
 */
function shouldShowNotification(
  type: NotificationType,
  settings: NotificationSettings,
): boolean {
  switch (type) {
    case "new_match":
    case "route_overlap":
      return settings.newMatches;
    case "new_message":
      return settings.messages;
    case "help_request":
    case "help_response":
      return settings.helpRequests;
    case "convoy_invite":
      return settings.convoyUpdates;
    case "campfire_event":
      return settings.campfireEvents;
    case "builder_request":
      return settings.builderRequests;
    default:
      return true;
  }
}

/**
 * Get stored notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
    );
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      JSON.stringify(updated),
    );
    return updated;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
}

/**
 * Get notification history from local storage
 */
export async function getNotificationHistory(): Promise<
  WilderGoNotification[]
> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Add notification to local history
 */
async function addNotificationToHistory(
  notification: WilderGoNotification,
): Promise<void> {
  try {
    const history = await getNotificationHistory();
    // Keep last 100 notifications
    const updated = [notification, ...history].slice(0, 100);
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error("Error saving notification to history:", error);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map((n) => ({ ...n, read: true }));
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const history = await getNotificationHistory();
    return history.filter((n) => !n.read).length;
  } catch {
    return 0;
  }
}

/**
 * Clear notification history
 */
export async function clearNotificationHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  } catch (error) {
    console.error("Error clearing notification history:", error);
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
}

/**
 * Get the stored push token
 */
export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Clear stored push token (on logout)
 */
export async function clearPushToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
  } catch (error) {
    console.error("Error clearing push token:", error);
  }
}

// Pre-built notification payloads for common scenarios
export const NotificationTemplates = {
  newMatch: (
    matchName: string,
    overlapPercent?: number,
  ): NotificationPayload => ({
    type: "new_match",
    title: "🔥 New Match!",
    body: overlapPercent
      ? `${matchName} is heading your way! ${overlapPercent}% route overlap.`
      : `You matched with ${matchName}!`,
    data: { matchName, overlapPercent },
  }),

  newMessage: (senderName: string, preview: string): NotificationPayload => ({
    type: "new_message",
    title: senderName,
    body: preview.length > 50 ? `${preview.substring(0, 50)}...` : preview,
    data: { senderName },
  }),

  helpRequest: (category: string, distance: number): NotificationPayload => ({
    type: "help_request",
    title: "🆘 Nearby Nomad Needs Help",
    body: `${category} assistance needed ${distance.toFixed(1)} miles away`,
    data: { category, distance },
  }),

  helpResponse: (responderName: string, eta: string): NotificationPayload => ({
    type: "help_response",
    title: "✅ Help is Coming!",
    body: `${responderName} is on the way. ETA: ${eta}`,
    data: { responderName, eta },
  }),

  convoyInvite: (
    convoyName: string,
    leaderName: string,
  ): NotificationPayload => ({
    type: "convoy_invite",
    title: "🚐 Convoy Invite",
    body: `${leaderName} invited you to join "${convoyName}"`,
    data: { convoyName, leaderName },
  }),

  campfireEvent: (
    eventName: string,
    location: string,
  ): NotificationPayload => ({
    type: "campfire_event",
    title: "🏕️ Campfire Event",
    body: `"${eventName}" is happening at ${location}`,
    data: { eventName, location },
  }),

  routeOverlap: (userName: string, percent: number): NotificationPayload => ({
    type: "route_overlap",
    title: "🗺️ Route Match!",
    body: `${percent}% route overlap with ${userName}`,
    data: { userName, percent },
  }),

  builderRequest: (
    projectType: string,
    location: string,
  ): NotificationPayload => ({
    type: "builder_request",
    title: "🔧 Builder Request",
    body: `${projectType} help requested near ${location}`,
    data: { projectType, location },
  }),

  verificationComplete: (passed: boolean): NotificationPayload => ({
    type: "verification_complete",
    title: passed ? "✅ Verified!" : "⚠️ Verification Update",
    body: passed
      ? "Your photo verification was successful!"
      : "Please retry your photo verification",
    data: { passed },
  }),

  subscriptionUpdate: (
    tier: string,
    isUpgrade: boolean,
  ): NotificationPayload => ({
    type: "subscription_update",
    title: isUpgrade ? "🎉 Welcome to The Convoy!" : "Subscription Update",
    body: isUpgrade
      ? `You now have access to all ${tier} features!`
      : `Your subscription has been updated to ${tier}`,
    data: { tier, isUpgrade },
  }),
};

export default {
  registerForPushNotifications,
  scheduleLocalNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  clearNotificationHistory,
  cancelNotification,
  cancelAllNotifications,
  getStoredPushToken,
  clearPushToken,
  NotificationTemplates,
};
