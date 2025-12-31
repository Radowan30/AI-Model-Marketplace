/**
 * API helper functions for database operations
 */
import { supabase } from './supabase';
import { transformDatabaseModels, transformDatabaseModel } from './data-transforms';

/**
 * Fetch all published models with their categories and publisher info
 */
export async function fetchPublishedModels() {
  const { data, error } = await supabase
    .from('models')
    .select(`
      *,
      model_categories(
        categories(id, name, is_custom)
      ),
      users:publisher_id(
        name,
        email
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform the nested categories structure and add publisher info
  const modelsWithCategories = (data || []).map(model => ({
    ...model,
    categories: model.model_categories?.map((mc: any) => mc.categories).filter(Boolean) || [],
    publisher_name: model.users?.name || 'Unknown Publisher',
    publisher_email: model.users?.email || ''
  }));

  return transformDatabaseModels(modelsWithCategories);
}

/**
 * Fetch single model by ID with its categories and publisher info
 */
export async function fetchModelById(modelId: string) {
  const { data, error } = await supabase
    .from('models')
    .select(`
      *,
      model_categories(
        categories(id, name, is_custom)
      ),
      users:publisher_id(
        name,
        email
      )
    `)
    .eq('id', modelId)
    .single();

  if (error) throw error;

  // Transform the nested categories structure and add publisher info
  const modelWithCategories = {
    ...data,
    categories: data.model_categories?.map((mc: any) => mc.categories).filter(Boolean) || [],
    publisher_name: data.users?.name || 'Unknown Publisher',
    publisher_email: data.users?.email || ''
  };

  return transformDatabaseModel(modelWithCategories);
}

/**
 * Fetch publisher's models with their categories and publisher info
 */
export async function fetchPublisherModels(publisherId: string) {
  const { data, error } = await supabase
    .from('models')
    .select(`
      *,
      model_categories(
        categories(id, name, is_custom)
      ),
      users:publisher_id(
        name,
        email
      )
    `)
    .eq('publisher_id', publisherId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform the nested categories structure and add publisher info
  const modelsWithCategories = (data || []).map(model => ({
    ...model,
    categories: model.model_categories?.map((mc: any) => mc.categories).filter(Boolean) || [],
    publisher_name: model.users?.name || 'Unknown Publisher',
    publisher_email: model.users?.email || ''
  }));

  return transformDatabaseModels(modelsWithCategories);
}

/**
 * Create a new model
 */
export async function createModel(modelData: any) {
  const { data, error } = await supabase
    .from('models')
    .insert({
      model_name: modelData.name,
      short_description: modelData.shortDescription,
      detailed_description: modelData.detailedDescription,
      version: modelData.version,
      features: modelData.features,
      response_time: modelData.responseTime,
      accuracy: modelData.accuracy,
      api_documentation: modelData.apiDocumentation,
      api_spec_format: modelData.apiSpecFormat || 'text',
      publisher_id: modelData.publisherId,
      status: modelData.status || 'draft',
      subscription_type: modelData.subscriptionType || 'free',
      subscription_amount: modelData.priceAmount,
    })
    .select()
    .single();

  if (error) throw error;
  return transformDatabaseModel(data);
}

/**
 * Update an existing model
 */
export async function updateModel(modelId: string, updates: any) {
  const { data, error } = await supabase
    .from('models')
    .update({
      model_name: updates.name,
      short_description: updates.shortDescription,
      detailed_description: updates.detailedDescription,
      version: updates.version,
      features: updates.features,
      response_time: updates.responseTime,
      accuracy: updates.accuracy,
      api_documentation: updates.apiDocumentation,
      api_spec_format: updates.apiSpecFormat || 'text',
      status: updates.status,
      subscription_type: updates.subscriptionType,
      subscription_amount: updates.priceAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', modelId)
    .select()
    .single();

  if (error) throw error;
  return transformDatabaseModel(data);
}

/**
 * Delete a model
 */
export async function deleteModel(modelId: string) {
  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', modelId);

  if (error) throw error;
}

/**
 * Create a subscription
 */
export async function createSubscription(buyerId: string, modelId: string) {
  // First get the model to check subscription type
  const { data: model } = await supabase
    .from('models')
    .select('subscription_type')
    .eq('id', modelId)
    .single();

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      buyer_id: buyerId,
      model_id: modelId,
      status: 'active',
      approved_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch user's subscriptions
 */
export async function fetchUserSubscriptions(buyerId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      model:models(*)
    `)
    .eq('buyer_id', buyerId)
    .order('subscribed_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) throw error;
}

/**
 * Fetch discussions for a model
 */
export async function fetchModelDiscussions(modelId: string) {
  const { data, error } = await supabase
    .from('discussions')
    .select(`
      *,
      comments(*)
    `)
    .eq('model_id', modelId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a discussion
 */
export async function createDiscussion(discussionData: any) {
  const { data, error } = await supabase
    .from('discussions')
    .insert({
      model_id: discussionData.modelId,
      user_id: discussionData.userId,
      user_name: discussionData.userName,
      title: discussionData.title,
      content: discussionData.content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a comment on a discussion
 */
export async function createComment(commentData: any) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      discussion_id: commentData.discussionId,
      user_id: commentData.userId,
      user_name: commentData.userName,
      content: commentData.content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Log activity
 */
export async function logActivity(userId: string, activityType: string, modelId: string, details?: any) {
  const { data: model } = await supabase
    .from('models')
    .select('model_name')
    .eq('id', modelId)
    .single();

  const { error } = await supabase
    .from('activity_log')
    .insert({
      user_id: userId,
      activity_type: activityType,
      model_id: modelId,
      model_name: model?.model_name,
      details: details,
    });

  if (error) throw error;
}

/**
 * Fetch recent activity for a user
 */
export async function fetchUserActivity(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
