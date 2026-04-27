/**
 * WilderGo Notifications Hook
 * React hook for managing push notifications
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  getNotificationHistory,
  getNotificationSettings,
  updateNotificationSettings,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  scheduleLocalNotification,
  WilderGoNotification,
  NotificationSettings,
  NotificationPayload,
  NotificationType,
} from "@/services/notifications/notificationService";

interface UseNotificationsReturn {
  // State
  pushToken: string | null;
  notifications: WilderGoNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  isLoading: boolean;
  error: Error | null;

  // Actions
  initialize: () => Promise<void>;
  sendNotification: (payload: NotificationPayload) => Promise<string | null>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<WilderGoNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    newMatches: true,
    messages: true,
    helpRequests: true,
    convoyUpdates: true,
    campfireEvents: true,
    builderRequests: true,
    sound: true,
    vibration: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Refs for notification listeners
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Mark notification as read (defined early for use in useEffect)
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  // Handle navigation when notification is tapped
  const handleNotificationNavigation = useCallback(
    (data: Record<string, unknown> | undefined) => {
      if (!data?.type) return;

      // Navigation would be handled by the app's navigation context
      // This is a placeholder for the actual implementation
      console.log("Navigate based on notification type:", data.type);

      // Example navigation patterns:
      // - new_match: Navigate to match profile
      // - new_message: Navigate to conversation
      // - help_request: Navigate to help tab
      // - convoy_invite: Navigate to convoy details
      // - campfire_event: Navigate to map with event marker
    },
    [],
  );

  // Initialize notifications system
  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Register for push notifications
      const token = await registerForPushNotifications();
      setPushToken(token);

      // Load notification history
      const history = await getNotificationHistory();
      setNotifications(history);

      // Load unread count
      const count = await getUnreadCount();
      setUnreadCount(count);

      // Load settings
      const savedSettings = await getNotificationSettings();
      setSettings(savedSettings);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to initialize notifications"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        const notificationType =
          (data?.type as NotificationType) || "new_message";

        // Add to local state immediately
        const newNotification: WilderGoNotification = {
          id: notification.request.identifier,
          type: notificationType,
          title: notification.request.content.title || "",
          body: notification.request.content.body || "",
          data: data,
          read: false,
          createdAt: new Date().toISOString(),
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

    // Listener for notification interactions (taps)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationId = response.notification.request.identifier;
        // Mark as read when user taps
        markAsRead(notificationId);

        // Handle navigation based on notification type
        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        handleNotificationNavigation(data);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [markAsRead, handleNotificationNavigation]);

  // Send a local notification
  const sendNotification = useCallback(async (payload: NotificationPayload) => {
    try {
      return await scheduleLocalNotification(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to send notification"),
      );
      return null;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }, []);

  // Update notification settings
  const updateSettingsHandler = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      try {
        const updated = await updateNotificationSettings(newSettings);
        setSettings(updated);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update settings"),
        );
      }
    },
    [],
  );

  // Refresh notification data
  const refresh = useCallback(async () => {
    try {
      const history = await getNotificationHistory();
      setNotifications(history);
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Error refreshing notifications:", err);
    }
  }, []);

  return {
    pushToken,
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    initialize,
    sendNotification,
    markAsRead,
    markAllAsRead,
    updateSettings: updateSettingsHandler,
    refresh,
  };
}

export default useNotifications;
