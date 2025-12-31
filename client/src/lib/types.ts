export type UserRole = 'buyer' | 'publisher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  bio?: string;
}

export type SubscriptionStatus = 'active' | 'cancelled';

export interface Subscription {
  id: string;
  modelId: string;
  buyerId: string;
  status: SubscriptionStatus;
  startDate: string;
  cancelledDate?: string;
}

export type ModelStatus = 'draft' | 'published' | 'archived';

export interface Category {
  id: string;
  name: string;
  is_custom: boolean;
}

export interface Model {
  id: string;
  name: string;
  shortDescription: string; // Brief summary (max 700 chars)
  detailedDescription: string; // Full detailed description
  publisherId: string;
  publisherName: string;
  publisherEmail: string;
  categories: Category[]; // Array of categories from junction table
  version: string;
  status: ModelStatus;
  price: 'free' | 'paid';
  priceAmount?: number; // Price in MYR (only for paid models)
  tags: string[];
  stats: {
    views: number;
    downloads: number;
    accuracy: number;
    responseTime: number; // in ms
    uptime: number; // percentage
  };
  features: string[];
  updatedAt: string;
  publishedDate: string;
  collaborators?: string[]; // Array of collaborator emails
  apiDocumentation?: string; // API docs in markdown, JSON, or plain text
  apiSpecFormat?: "json" | "yaml" | "markdown" | "text"; // Format of API specification
  pageViews30Days: number;
  activeSubscribers: number;
  totalSubscribers: number;
  discussionCount: number;
}

export interface Discussion {
  id: string;
  modelId: string;
  userId: string;
  userName: string;
  content: string;
  date: string;
  replies?: Discussion[];
}

export type NotificationType =
  | 'new_subscription'      // Publisher: new subscriber
  | 'discussion_message'    // Publisher: new message in their model's discussion
  | 'model_rating_changed'  // Publisher: rating updated
  | 'subscription_success'  // Buyer: successfully subscribed
  | 'discussion_reply'      // Buyer: reply to their discussion message
  | 'model_updated';        // Buyer: subscribed model updated

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  title: string;
  message: string;
  relatedModelId?: string;
  relatedModelName?: string;
  relatedDiscussionId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    subscriberName?: string;
    subscriberEmail?: string;
    oldRating?: number;
    newRating?: number;
    updatedFields?: string[];
    discussionTitle?: string;
    replyAuthor?: string;
  };
}
