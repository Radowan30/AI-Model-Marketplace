import { supabase } from "./supabase";

/**
 * Notification Trigger Utilities
 *
 * These functions report something the current user just did (subscribed,
 * posted, rated, updated a model). The database function `notify_event`
 * checks the user really did it, then decides who is notified and what the
 * notification says. Clients can't choose recipients or wording, so
 * notifications can't be forged or sent to arbitrary users.
 *
 * Failures are logged and never thrown, so a notification problem can't
 * break the action that caused it.
 */

type NotificationEvent =
  | "subscribed"
  | "discussion"
  | "comment"
  | "rating"
  | "model_updated";

async function notifyEvent(
  event: NotificationEvent,
  refId: string,
  changes?: Array<{ field: string }>
): Promise<{ success: boolean; notificationCount: number }> {
  try {
    const { data, error } = await supabase.rpc("notify_event", {
      p_event: event,
      p_ref: refId,
      p_changes: changes ?? null,
    });

    if (error) {
      console.error(`Error creating ${event} notifications:`, error);
      return { success: false, notificationCount: 0 };
    }

    return { success: true, notificationCount: data ?? 0 };
  } catch (error) {
    console.error(`Exception while creating ${event} notifications:`, error);
    return { success: false, notificationCount: 0 };
  }
}

/**
 * Triggered after the current user subscribes to a model.
 * Notifies the model owner, its collaborators, and confirms to the subscriber.
 */
export async function triggerSubscriptionNotifications(params: {
  modelId: string;
  modelName: string;
  publisherId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
}) {
  return notifyEvent("subscribed", params.modelId);
}

/**
 * Triggered after the current user starts a discussion on a model.
 * Notifies the model owner and collaborators (never the poster).
 */
export async function triggerNewDiscussionNotification(params: {
  modelId: string;
  modelName: string;
  publisherId: string;
  discussionId: string;
  posterName: string;
  posterId: string;
  discussionPreview: string;
}) {
  return notifyEvent("discussion", params.discussionId);
}

/**
 * Triggered after the current user posts a comment.
 * A reply notifies only the author of the comment being answered; a new
 * comment notifies the model owner and collaborators.
 */
export async function triggerNewCommentNotification(params: {
  modelId: string;
  modelName: string;
  publisherId: string;
  discussionId: string;
  commentId: string;
  commenterName: string;
  commenterId: string;
  commentPreview: string;
  parentCommentUserId?: string;
}) {
  return notifyEvent("comment", params.commentId);
}

/**
 * Triggered after the current user rates a model.
 * Notifies the model owner and collaborators.
 */
export async function triggerNewRatingNotification(params: {
  modelId: string;
  modelName: string;
  publisherId: string;
  raterName: string;
  raterId: string;
  rating: number;
}) {
  return notifyEvent("rating", params.modelId);
}

/**
 * Triggered after the model owner or a collaborator saves changes to a model.
 * Notifies every active subscriber, one notification per changed field.
 */
export async function triggerModelUpdateNotifications(params: {
  modelId: string;
  modelName: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}) {
  return notifyEvent(
    "model_updated",
    params.modelId,
    params.changes.map((change) => ({ field: change.field }))
  );
}
