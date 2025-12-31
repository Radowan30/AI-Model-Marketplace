import { useState } from "react";
import { Notification, NotificationType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem } from "./NotificationItem";

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<"all" | NotificationType>("all");

  // Filter notifications based on selected tab
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    return notification.type === filter;
  });

  // Get counts for each category
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const publisherNotifications = notifications.filter((n) =>
    ["new_subscription", "discussion_message", "model_rating_changed"].includes(n.type)
  );
  const buyerNotifications = notifications.filter((n) =>
    ["subscription_success", "discussion_reply", "model_updated"].includes(n.type)
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pr-12 border-b">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg truncate">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground truncate">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs flex-shrink-0 ml-2 mr-2"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs for filtering */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | NotificationType)}>
        <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 flex-wrap">
          <TabsTrigger value="all" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="new_subscription" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4">
            Subs ({publisherNotifications.filter(n => n.type === 'new_subscription').length})
          </TabsTrigger>
          <TabsTrigger value="discussion_message" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4">
            Discuss ({notifications.filter(n => ['discussion_message', 'discussion_reply'].includes(n.type)).length})
          </TabsTrigger>
          <TabsTrigger value="model_updated" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4">
            Updates ({notifications.filter(n => ['model_updated', 'model_rating_changed'].includes(n.type)).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="m-0">
          <ScrollArea className="h-[60vh] max-h-[500px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground px-4">
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
