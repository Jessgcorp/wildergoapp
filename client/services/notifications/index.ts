/**
 * WilderGo Notification Services
 * Export all notification-related functionality
 */

export {
  // Service functions
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
  // Types
  type NotificationType,
  type WilderGoNotification,
  type NotificationPayload,
  type NotificationSettings,
} from "./notificationService";
