import { Notification, NotificationType } from "./types";

/**
 * Notification Trigger Utilities
 *
 * This file contains trigger functions for creating notifications when specific events occur.
 * In a production app, these would be called from API response handlers or event listeners.
 *
 * Integration Points:
 * - Subscribe to model: Call triggerSubscriptionNotifications() after successful subscription
 * - Update model rating: Call triggerRatingChangeNotification() after rating update
 * - Post discussion: Call triggerDiscussionNotification() after creating discussion
 * - Reply to discussion: Call triggerDiscussionReplyNotification() after posting reply
 * - Update model: Call triggerModelUpdateNotification() after model update
 */

/**
 * Generate a unique notification ID
 */
function generateNotificationId(): string {
  return `n${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Trigger notifications when a user subscribes to a model
 *
 * WHERE TO USE:
 * - In the model details page when subscription button is clicked
 * - After successful API call to subscribe endpoint
 *
 * EXAMPLE USAGE:
 * ```typescript
 * // In model-details.tsx after subscription API call
 * const handleSubscribe = async () => {
 *   const result = await api.subscribe(modelId);
 *   if (result.success) {
 *     const { publisherNotif, buyerNotif } = triggerSubscriptionNotifications({
 *       modelId: model.id,
 *       modelName: model.name,
 *       publisherId: model.publisherId,
 *       buyerId: currentUser.id,
 *       buyerName: currentUser.name,
 *       buyerEmail: currentUser.email,
 *     });
 *     // Send to notification system
 *     addNotification(publisherNotif);
 *     addNotification(buyerNotif);
 *   }
 * };
 * ```
 */
export function triggerSubscriptionNotifications(params: {
  modelId: string;
  modelName: string;
  publisherId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
}): { publisherNotif: Notification; buyerNotif: Notification } {
  const now = new Date().toISOString();

  // Notification for publisher
  const publisherNotif: Notification = {
    id: generateNotificationId(),
    userId: params.publisherId,
    type: "new_subscription",
    title: `New Subscription to ${params.modelName}`,
    message: `${params.buyerName} subscribed to your model`,
    relatedModelId: params.modelId,
    relatedModelName: params.modelName,
    isRead: false,
    createdAt: now,
    metadata: {
      subscriberName: params.buyerName,
      subscriberEmail: params.buyerEmail,
    },
  };

  // Notification for buyer
  const buyerNotif: Notification = {
    id: generateNotificationId(),
    userId: params.buyerId,
    type: "subscription_success",
    title: `Successfully Subscribed to ${params.modelName}`,
    message: "You can now access this model's API",
    relatedModelId: params.modelId,
    relatedModelName: params.modelName,
    isRead: false,
    createdAt: now,
  };

  return { publisherNotif, buyerNotif };
}

/**
 * Trigger notification when model rating changes
 *
 * WHERE TO USE:
 * - After user submits a rating/review
 * - When aggregate rating is recalculated
 *
 * EXAMPLE USAGE:
 * ```typescript
 * // In rating component after submitting review
 * const handleRatingSubmit = async (newRating: number) => {
 *   const result = await api.submitRating(modelId, newRating);
 *   if (result.success && result.ratingChanged) {
 *     const notification = triggerRatingChangeNotification({
 *       modelId: model.id,
 *       modelName: model.name,
 *       publisherId: model.publisherId,
 *       oldRating: result.oldRating,
 *       newRating: result.newRating,
 *     });
 *     addNotification(notification);
 *   }
 * };
 * ```
 */
export function triggerRatingChangeNotification(params: {
  modelId: string;
  modelName: string;
  publisherId: string;
  oldRating: number;
  newRating: number;
}): Notification {
  const direction = params.newRating > params.oldRating ? "increased" : "decreased";

  return {
    id: generateNotificationId(),
    userId: params.publisherId,
    type: "model_rating_changed",
    title: `Rating Updated for ${params.modelName}`,
    message: `Rating ${direction} from ${params.oldRating.toFixed(1)} to ${params.newRating.toFixed(1)} stars`,
    relatedModelId: params.modelId,
    relatedModelName: params.modelName,
    isRead: false,
    createdAt: new Date().toISOString(),
    metadata: {
      oldRating: params.oldRating,
      newRating: params.newRating,
    },
  };
}

/**
 * Trigger notification when a discussion message is posted
 *
 * WHERE TO USE:
 * - After posting a new discussion thread on a model page
 * - Notify the publisher about the discussion
 *
 * EXAMPLE USAGE:
 * ```typescript
 * // In model-details.tsx after posting discussion
 * const handlePostDiscussion = async (content: string) => {
 *   const result = await api.postDiscussion(modelId, content);
 *   if (result.success) {
 *     const notification = triggerDiscussionNotification({
 *       modelId: model.id,
 *       modelName: model.name,
 *       publisherId: model.publisherId,
 *       discussionId: result.discussionId,
 *       posterName: currentUser.name,
 *       discussionPreview: content.substring(0, 100),
 *     });
 *     addNotification(notification);
 *   }
 * };
 * ```
 */
export function triggerDiscussionNotification(params: {
  modelId: string;
  modelName: string;
  publisherId: string;
  discussionId: string;
  posterName: string;
  discussionPreview: string;
}): Notification {
  return {
    id: generateNotificationId(),
    userId: params.publisherId,
    type: "discussion_message",
    title: `New Discussion on ${params.modelName}`,
    message: `${params.posterName} started a discussion`,
    relatedModelId: params.modelId,
    relatedModelName: params.modelName,
    relatedDiscussionId: params.discussionId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Trigger notification when someone replies to a discussion
 *
 * WHERE TO USE:
 * - After posting a reply to an existing discussion
 * - Notify the original poster about the reply
 *
 * EXAMPLE USAGE:
 * ```typescript
 * // In discussion component after posting reply
 * const handlePostReply = async (discussionId: string, content: string) => {
 *   const result = await api.postReply(discussionId, content);
 *   if (result.success) {
 *     const notification = triggerDiscussionReplyNotification({
 *       modelId: discussion.modelId,
 *       modelName: discussion.modelName,
 *       originalPosterId: discussion.userId,
 *       discussionId: discussionId,
 *       replyAuthor: currentUser.name,
 *       replyPreview: content.substring(0, 100),
 *     });
 *     addNotification(notification);
 *   }
 * };
 * ```
 */
export function triggerDiscussionReplyNotification(params: {
  modelId: string;
  modelName: string;
  originalPosterId: string;
  discussionId: string;
  replyAuthor: string;
  replyPreview: string;
}): Notification {
  return {
    id: generateNotificationId(),
    userId: params.originalPosterId,
    type: "discussion_reply",
    title: `New Reply on ${params.modelName}`,
    message: `${params.replyAuthor} replied to your discussion`,
    relatedModelId: params.modelId,
    relatedModelName: params.modelName,
    relatedDiscussionId: params.discussionId,
    isRead: false,
    createdAt: new Date().toISOString(),
    metadata: {
      replyAuthor: params.replyAuthor,
    },
  };
}

/**
 * Trigger notifications when a model is updated
 *
 * WHERE TO USE:
 * - In publisher's edit-model page after saving changes
 * - Notify all subscribers about the update
 *
 * EXAMPLE USAGE:
 * ```typescript
 * // In edit-model.tsx after successful update
 * const handleUpdateModel = async (updates: Partial<Model>) => {
 *   const result = await api.updateModel(modelId, updates);
 *   if (result.success) {
 *     const subscribers = await api.getModelSubscribers(modelId);
 *     const notifications = triggerModelUpdateNotifications({
 *       modelId: model.id,
 *       modelName: model.name,
 *       subscriberIds: subscribers.map(s => s.userId),
 *       updatedFields: Object.keys(updates),
 *     });
 *     notifications.forEach(notif => addNotification(notif));
 *   }
 * };
 * ```
 */
export function triggerModelUpdateNotifications(params: {
  modelId: string;
  modelName: string;
  subscriberIds: string[];
  updatedFields: string[];
}): Notification[] {
  const now = new Date().toISOString();

  return params.subscriberIds.map((subscriberId) => ({
    id: generateNotificationId(),
    userId: subscriberId,
    type: "model_updated" as NotificationType,
    title: `${params.modelName} Updated`,
    message: `The model has been updated with new changes`,
    relatedModelId: params.modelId,
    relatedModelName: params.modelName,
    isRead: false,
    createdAt: now,
    metadata: {
      updatedFields: params.updatedFields,
    },
  }));
}

/**
 * Integration Guide:
 *
 * To integrate these notification triggers into your application:
 *
 * 1. Import the useNotifications hook in your component:
 *    ```typescript
 *    import { useNotifications } from "@/hooks/use-notifications";
 *    ```
 *
 * 2. Get the addNotification function:
 *    ```typescript
 *    const { addNotification } = useNotifications();
 *    ```
 *
 * 3. Call the appropriate trigger function when an event occurs:
 *    ```typescript
 *    import { triggerSubscriptionNotifications } from "@/lib/notification-triggers";
 *
 *    // After successful subscription
 *    const { publisherNotif, buyerNotif } = triggerSubscriptionNotifications({
 *      modelId: model.id,
 *      modelName: model.name,
 *      publisherId: model.publisherId,
 *      buyerId: currentUser.id,
 *      buyerName: currentUser.name,
 *      buyerEmail: currentUser.email,
 *    });
 *
 *    addNotification(publisherNotif);
 *    addNotification(buyerNotif);
 *    ```
 *
 * 4. For production, move notification creation to backend:
 *    - Backend should create notifications in database when events occur
 *    - Frontend should poll or use WebSocket/Realtime to receive new notifications
 *    - useNotifications hook already fetches from database
 */
