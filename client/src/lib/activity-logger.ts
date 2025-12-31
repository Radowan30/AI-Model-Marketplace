import { supabase } from './supabase';

/**
 * Activity Logger Utilities
 *
 * This library provides functions for logging and fetching user activities.
 * Activities are tracked in the user_activities table in Supabase.
 *
 * Supported Activity Types (Buyer-focused):
 * - subscribed: User subscribed to a model
 * - unsubscribed: User cancelled subscription
 * - downloaded: User downloaded a file
 * - commented: User posted a comment/discussion
 * - rated: User rated a model
 */

export type ActivityType =
  | 'subscribed'
  | 'unsubscribed'
  | 'downloaded'
  | 'commented'
  | 'rated';

export interface Activity {
  id: string;
  userId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  modelId?: string;
  modelName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface LogActivityParams {
  userId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  modelId?: string;
  modelName?: string;
  metadata?: Record<string, any>;
}

/**
 * Log a user activity to the database
 *
 * This function inserts a new activity record into the user_activities table.
 * Activity logging is non-blocking - errors are logged but not thrown.
 *
 * @param params - Activity parameters
 * @returns Promise<void>
 *
 * @example
 * await logActivity({
 *   userId: user.id,
 *   activityType: 'subscribed',
 *   title: 'Subscribed to GPT-4 Vision API',
 *   description: 'Free subscription',
 *   modelId: 'model-123',
 *   modelName: 'GPT-4 Vision API'
 * });
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: params.userId,
        activity_type: params.activityType,
        title: params.title,
        description: params.description,
        model_id: params.modelId,
        model_name: params.modelName,
        metadata: params.metadata,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should be non-blocking
    // The main user action should succeed even if activity logging fails
  }
}

/**
 * Fetch user activities (with pagination)
 *
 * Retrieves activities for a specific user, sorted by creation date (newest first).
 * Supports pagination via limit and offset parameters.
 *
 * @param userId - The user's ID
 * @param limit - Maximum number of activities to fetch (default: 20)
 * @param offset - Number of activities to skip (default: 0)
 * @returns Promise<Activity[]>
 *
 * @example
 * // Fetch first 20 activities
 * const activities = await fetchUserActivities(user.id);
 *
 * // Fetch next 20 activities
 * const moreActivities = await fetchUserActivities(user.id, 20, 20);
 */
export async function fetchUserActivities(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform to match Activity interface
    return (data || []).map(activity => ({
      id: activity.id,
      userId: activity.user_id,
      activityType: activity.activity_type,
      title: activity.title,
      description: activity.description,
      modelId: activity.model_id,
      modelName: activity.model_name,
      metadata: activity.metadata,
      createdAt: activity.created_at
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

/**
 * Fetch activities by type
 *
 * Retrieves activities of a specific type for a user.
 * Useful for filtering activities by action (e.g., only subscriptions).
 *
 * @param userId - The user's ID
 * @param activityType - The type of activity to filter by
 * @param limit - Maximum number of activities to fetch (default: 10)
 * @returns Promise<Activity[]>
 *
 * @example
 * // Fetch last 10 subscription activities
 * const subscriptions = await fetchActivitiesByType(user.id, 'subscribed');
 */
export async function fetchActivitiesByType(
  userId: string,
  activityType: ActivityType,
  limit: number = 10
): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform to match Activity interface
    return (data || []).map(activity => ({
      id: activity.id,
      userId: activity.user_id,
      activityType: activity.activity_type,
      title: activity.title,
      description: activity.description,
      modelId: activity.model_id,
      modelName: activity.model_name,
      metadata: activity.metadata,
      createdAt: activity.created_at
    }));
  } catch (error) {
    console.error('Error fetching activities by type:', error);
    return [];
  }
}

/**
 * Delete old activities (cleanup utility)
 *
 * Removes activities older than 90 days for a specific user.
 * This helps keep the database clean and maintains performance.
 *
 * Recommended to run periodically (e.g., monthly) or on user request.
 *
 * @param userId - The user's ID
 * @returns Promise<void>
 *
 * @example
 * // Clean up old activities for current user
 * await cleanupOldActivities(user.id);
 */
export async function cleanupOldActivities(userId: string): Promise<void> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    const { error } = await supabase
      .from('user_activities')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', ninetyDaysAgo.toISOString());

    if (error) throw error;
  } catch (error) {
    console.error('Error cleaning up old activities:', error);
  }
}

/**
 * Get total activity count for a user
 *
 * Returns the total number of activities for a user.
 * Useful for pagination and statistics.
 *
 * @param userId - The user's ID
 * @returns Promise<number>
 *
 * @example
 * const totalActivities = await getActivityCount(user.id);
 * const totalPages = Math.ceil(totalActivities / 20);
 */
export async function getActivityCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting activity count:', error);
    return 0;
  }
}

/**
 * Integration Guide:
 *
 * To integrate activity logging into your application:
 *
 * 1. Import the logActivity function:
 *    ```typescript
 *    import { logActivity } from '@/lib/activity-logger';
 *    ```
 *
 * 2. Call logActivity after successful user actions:
 *    ```typescript
 *    // After subscription
 *    await logActivity({
 *      userId: user.id,
 *      activityType: 'subscribed',
 *      title: `Subscribed to ${model.model_name}`,
 *      description: 'Free subscription',
 *      modelId: model.id,
 *      modelName: model.model_name
 *    });
 *    ```
 *
 * 3. Fetch activities in components:
 *    ```typescript
 *    import { fetchUserActivities } from '@/lib/activity-logger';
 *
 *    const activities = await fetchUserActivities(user.id, 20);
 *    setRecentActivities(activities);
 *    ```
 *
 * 4. Display activities with proper UI formatting
 *    - Show icons based on activityType
 *    - Format timestamps as relative time
 *    - Link to related models via modelId
 */
