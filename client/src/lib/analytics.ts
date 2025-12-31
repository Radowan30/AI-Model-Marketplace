/**
 * Analytics utility functions
 */
import { supabase } from './supabase';

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(subscribers: number, views: number): string {
  if (views === 0) return '0.00';
  return ((subscribers / views) * 100).toFixed(2);
}

/**
 * Get week number from date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get start of week from date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

/**
 * Aggregate views by week
 */
export function aggregateWeeklyViews(views: any[]): { week: string; views: number }[] {
  const weeks: { [key: string]: number } = {};

  views.forEach(view => {
    const date = new Date(view.timestamp);
    const weekStart = getWeekStart(date);
    const weekKey = `Week ${getWeekNumber(date)}`;

    if (!weeks[weekKey]) {
      weeks[weekKey] = 0;
    }
    weeks[weekKey]++;
  });

  return Object.entries(weeks).map(([week, viewCount]) => ({
    week,
    views: viewCount
  }));
}

/**
 * Get category distribution for a publisher
 */
export async function getCategoryDistribution(publisherId: string): Promise<{ name: string; value: number }[]> {
  const { data: models, error } = await supabase
    .from('models')
    .select('categories')
    .eq('publisher_id', publisherId);

  if (error) {
    console.error('Error fetching category distribution:', error);
    return [];
  }

  if (!models || models.length === 0) {
    return [];
  }

  const distribution: { [key: string]: number } = {};

  models.forEach(model => {
    const category = model.categories;
    if (category) {
      distribution[category] = (distribution[category] || 0) + 1;
    }
  });

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value
  }));
}

/**
 * Fetch analytics data for a publisher
 */
export async function fetchPublisherAnalytics(publisherId: string) {
  try {
    // Fetch publisher's models with view counts
    const { data: models, error: modelsError } = await supabase
      .from('models')
      .select('id, model_name, total_views, total_subscribers, categories')
      .eq('publisher_id', publisherId);

    if (modelsError) throw modelsError;

    // Calculate totals
    const totalViews = models?.reduce((sum, model) => sum + (model.total_views || 0), 0) || 0;
    const totalSubscribers = models?.reduce((sum, model) => sum + (model.total_subscribers || 0), 0) || 0;

    // Fetch recent views (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const modelIds = models?.map(m => m.id) || [];

    const { data: recentViews, error: viewsError } = await supabase
      .from('views')
      .select('*')
      .in('model_id', modelIds)
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (viewsError) {
      console.error('Error fetching recent views:', viewsError);
    }

    // Get category distribution
    const categoryDist = await getCategoryDistribution(publisherId);

    // Aggregate weekly views
    const weeklyViews = recentViews ? aggregateWeeklyViews(recentViews) : [];

    return {
      totalViews,
      totalSubscribers,
      totalModels: models?.length || 0,
      engagementRate: calculateEngagementRate(totalSubscribers, totalViews),
      categoryDistribution: categoryDist,
      weeklyViews: weeklyViews,
      models: models || []
    };
  } catch (error) {
    console.error('Error fetching publisher analytics:', error);
    throw error;
  }
}

/**
 * Fetch analytics for a specific model
 */
export async function fetchModelAnalytics(modelId: string) {
  try {
    // Fetch model details
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .single();

    if (modelError) throw modelError;

    // Fetch views for this model (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: views, error: viewsError } = await supabase
      .from('views')
      .select('*')
      .eq('model_id', modelId)
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (viewsError) {
      console.error('Error fetching model views:', viewsError);
    }

    // Aggregate by day for the last 30 days
    const dailyViews = views ? aggregateDailyViews(views) : [];

    return {
      totalViews: model.total_views || 0,
      totalSubscribers: model.total_subscribers || 0,
      engagementRate: calculateEngagementRate(model.total_subscribers || 0, model.total_views || 0),
      dailyViews: dailyViews,
      views30Days: views?.length || 0
    };
  } catch (error) {
    console.error('Error fetching model analytics:', error);
    throw error;
  }
}

/**
 * Aggregate views by day
 */
function aggregateDailyViews(views: any[]): { date: string; views: number }[] {
  const days: { [key: string]: number } = {};

  views.forEach(view => {
    const date = new Date(view.timestamp);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!days[dateKey]) {
      days[dateKey] = 0;
    }
    days[dateKey]++;
  });

  // Convert to array and sort by date
  return Object.entries(days)
    .map(([date, viewCount]) => ({
      date,
      views: viewCount
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
