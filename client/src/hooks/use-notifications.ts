import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function useNotifications() {
  const { user } = useAuth();

  // Initialize with empty array, will be populated from database
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to match expected format
        const transformed = data?.map(n => ({
          id: n.id,
          userId: n.user_id,
          type: n.type,
          title: n.title,
          message: n.message,
          createdAt: n.created_at,
          isRead: n.is_read,
          modelId: n.model_id,
          metadata: n.metadata
        })) || [];

        setNotifications(transformed);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [user]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark a single notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  // Add a new notification (for future use when implementing triggers)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  // Remove a notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: Notification["type"]) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => !n.isRead);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    getNotificationsByType,
    getUnreadNotifications,
  };
}
