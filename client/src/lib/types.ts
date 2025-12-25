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

export type SubscriptionStatus = 'active' | 'pending' | 'cancelled';

export interface Subscription {
  id: string;
  modelId: string;
  buyerId: string;
  status: SubscriptionStatus;
  startDate: string;
  cancelledDate?: string;
}

export type ModelStatus = 'draft' | 'published' | 'archived';

export interface Model {
  id: string;
  name: string;
  description: string;
  publisherId: string;
  publisherName: string;
  publisherEmail: string;
  category: string;
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
