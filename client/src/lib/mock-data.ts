import { Model, Subscription, User, Discussion } from './types';

// USERS array - stores all registered users with multi-role support
export const USERS = [
  {
    id: '1',
    email: 'aminah@mimos.my',
    name: 'Dr. Aminah Hassan',
    password: 'password', // Mock - plain text for development
    roles: ['publisher'] as ('buyer' | 'publisher')[]
  },
  {
    id: '2',
    email: 'buyer@example.com',
    name: 'John Doe',
    password: 'password',
    roles: ['buyer'] as ('buyer' | 'publisher')[]
  },
  {
    id: '3',
    email: 'multi@user.com',
    name: 'Multi Role User',
    password: 'password',
    roles: ['buyer', 'publisher'] as ('buyer' | 'publisher')[]
  }
];

// Get user role from localStorage, default to 'publisher' if not set
const getUserRole = (): 'publisher' | 'buyer' => {
  const storedRole = localStorage.getItem('userRole');
  return (storedRole === 'buyer' || storedRole === 'publisher') ? storedRole : 'publisher';
};

// Get current user from localStorage
const getCurrentUser = () => {
  const userId = localStorage.getItem('userId');
  const currentRole = getUserRole();

  if (userId) {
    const user = USERS.find(u => u.id === userId);
    if (user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: currentRole,
        company: 'MIMOS Berhad',
        bio: 'Senior AI Researcher specializing in NLP and Computer Vision.',
        avatar: null
      };
    }
  }

  // Default fallback
  return {
    id: '1',
    name: 'Dr. Aminah Hassan',
    email: 'aminah@mimos.my',
    roles: ['publisher'] as ('buyer' | 'publisher')[],
    currentRole: currentRole,
    company: 'MIMOS Berhad',
    bio: 'Senior AI Researcher specializing in NLP and Computer Vision.',
    avatar: null
  };
};

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Dr. Aminah',
  email: 'aminah@mimos.my',
  get role() {
    return getUserRole();
  },
  company: 'MIMOS Berhad',
  bio: 'Senior AI Researcher specializing in NLP and Computer Vision.',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
};

// Helper functions
export const getCurrentUserRole = () => getUserRole();

export const userHasRole = (role: 'buyer' | 'publisher'): boolean => {
  const user = getCurrentUser();
  return user.roles.includes(role);
};

export const MOCK_MODELS: Model[] = [
  {
    id: 'm1',
    name: 'MySejahtera Analytics AI',
    description: 'Advanced predictive modeling for disease outbreak patterns based on anonymized MySejahtera data. optimized for Malaysian local contexts.',
    publisherId: 'u1',
    publisherName: 'MIMOS Berhad',
    publisherEmail: 'aminah@mimos.my',
    category: 'Healthcare',
    version: '2.1.0',
    status: 'published',
    price: 'paid',
    priceAmount: 60.00,
    tags: ['healthcare', 'predictive', 'covid-19'],
    stats: {
      views: 12500,
      downloads: 450,
      accuracy: 98.5,
      responseTime: 120,
      uptime: 99.99,
    },
    features: ['Real-time hotspot detection', 'Vaccination rate correlation', 'Resource allocation suggestion'],
    updatedAt: '2025-06-15',
    publishedDate: '2024-11-20',
    collaborators: ['researcher@health.gov.my', 'data@mimos.my'],
    apiDocumentation: `# MySejahtera Analytics AI API

## Overview
This API provides predictive analytics for disease outbreak patterns using MySejahtera data.

## Authentication
All requests require an API key in the header:
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### POST /api/v1/predict
Analyzes disease outbreak patterns based on input data.

**Request Body:**
\`\`\`json
{
  "region": "Selangor",
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "threshold": 0.85
}
\`\`\`

**Response:**
\`\`\`json
{
  "prediction": {
    "risk_level": "high",
    "confidence": 0.92,
    "hotspots": ["Petaling", "Shah Alam"],
    "recommendations": [...]
  }
}
\`\`\``,
    pageViews30Days: 3482,
    activeSubscribers: 127,
    totalSubscribers: 215,
    discussionCount: 18,
  },
  {
    id: 'm2',
    name: 'Bahasa Melayu Sentiment Analyzer',
    description: 'High-accuracy sentiment analysis model specifically trained on informal Malaysian social media text (Manglish, diverse dialects).',
    publisherId: 'u2',
    publisherName: 'University Malaya NLP Group',
    publisherEmail: 'nlp@um.edu.my',
    category: 'NLP',
    version: '1.0.5',
    status: 'published',
    price: 'free',
    tags: ['nlp', 'sentiment-analysis', 'bahasa-melayu'],
    stats: {
      views: 8900,
      downloads: 1200,
      accuracy: 94.2,
      responseTime: 45,
      uptime: 99.95,
    },
    features: ['Slang detection', 'Mixed-language support', 'Emoji sentiment weighting'],
    updatedAt: '2025-08-01',
    publishedDate: '2024-12-10',
    apiDocumentation: `{
  "openapi": "3.0.0",
  "info": {
    "title": "Bahasa Melayu Sentiment Analyzer API",
    "version": "1.0.5",
    "description": "Sentiment analysis for Malaysian social media text"
  },
  "paths": {
    "/analyze": {
      "post": {
        "summary": "Analyze sentiment",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "text": {
                    "type": "string",
                    "example": "Best giler bro! Memang power lah"
                  },
                  "includeEmoji": {
                    "type": "boolean",
                    "default": true
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Sentiment analysis result",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "sentiment": {
                      "type": "string",
                      "enum": ["positive", "negative", "neutral"]
                    },
                    "confidence": {
                      "type": "number",
                      "example": 0.95
                    },
                    "slangDetected": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`,
    pageViews30Days: 5234,
    activeSubscribers: 892,
    totalSubscribers: 1156,
    discussionCount: 45,
  },
  {
    id: 'm3',
    name: 'Traffic Flow Optimizer',
    description: 'Computer vision model for real-time traffic light optimization based on vehicle density at intersections.',
    publisherId: 'u1',
    publisherName: 'MIMOS Berhad',
    publisherEmail: 'aminah@mimos.my',
    category: 'Smart City',
    version: '0.9.0',
    status: 'published',
    price: 'paid',
    priceAmount: 50.00,
    tags: ['computer-vision', 'smart-city', 'traffic'],
    stats: {
      views: 340,
      downloads: 10,
      accuracy: 88.0,
      responseTime: 200,
      uptime: 99.5,
    },
    features: ['Vehicle counting', 'Emergency vehicle priority', 'Pedestrian detection'],
    updatedAt: '2025-08-20',
    publishedDate: '2025-07-01',
    collaborators: ['traffic@dbkl.gov.my'],
    pageViews30Days: 421,
    activeSubscribers: 12,
    totalSubscribers: 18,
    discussionCount: 3,
  },
  {
    id: 'm4',
    name: 'AgriTech Crop Yield Predictor',
    description: 'Satellite imagery analysis to predict palm oil yield and detect early signs of disease.',
    publisherId: 'u3',
    publisherName: 'Sime Darby R&D',
    publisherEmail: 'research@simedarby.com',
    category: 'Agriculture',
    version: '3.2.1',
    status: 'published',
    price: 'paid',
    priceAmount: 55.00,
    tags: ['agriculture', 'satellite', 'forecasting'],
    stats: {
      views: 5600,
      downloads: 85,
      accuracy: 92.5,
      responseTime: 500,
      uptime: 99.9,
    },
    features: ['Yield forecasting', 'Disease heatmap', 'Soil moisture estimation'],
    updatedAt: '2025-07-10',
    publishedDate: '2024-09-15',
    collaborators: ['agri@mpob.gov.my', 'satellite@mosti.gov.my'],
    apiDocumentation: 'API documentation for this model is currently being prepared. Please contact the publisher for early access to technical specifications and integration guides.',
    pageViews30Days: 1876,
    activeSubscribers: 64,
    totalSubscribers: 89,
    discussionCount: 12,
  },
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 's1',
    modelId: 'm2',
    buyerId: 'u1',
    status: 'active',
    startDate: '2025-01-15',
  },
  {
    id: 's2',
    modelId: 'm4',
    buyerId: 'u1',
    status: 'pending',
    startDate: '2025-08-21',
  },
  {
    id: 's3',
    modelId: 'm1',
    buyerId: 'u1',
    status: 'active',
    startDate: '2024-06-10',
  }
];

export const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 'd1',
    modelId: 'm1',
    userId: 'u4',
    userName: 'Ahmad Zaki',
    content: 'Is this model compatible with the latest Tensorflow Lite for edge deployment?',
    date: '2025-08-15',
    replies: [
      {
        id: 'd2',
        modelId: 'm1',
        userId: 'u1',
        userName: 'Dr. Aminah',
        content: 'Yes, we recently added TFLite support in version 2.1.0.',
        date: '2025-08-16',
      }
    ]
  }
];

export const MODEL_SUBSCRIBERS = [
  {
    id: 'sub1',
    subscriber: 'Dr. Ahmad Rahman',
    email: 'ahmad.rahman@hospital.my',
    model: 'MySejahtera Analytics AI',
    status: 'Active',
    subscriptionDate: '2025-06-20'
  },
  {
    id: 'sub2',
    subscriber: 'Sarah Lee',
    email: 'sarah.lee@smart.city',
    model: 'Traffic Flow Optimizer',
    status: 'Pending',
    subscriptionDate: '2025-08-22'
  },
  {
    id: 'sub3',
    subscriber: 'Tan Wei Ming',
    email: 'wei.ming@tech.com',
    model: 'MySejahtera Analytics AI',
    status: 'Active',
    subscriptionDate: '2025-07-10'
  },
  {
    id: 'sub4',
    subscriber: 'Nurul Aina',
    email: 'nurul@health.gov.my',
    model: 'MySejahtera Analytics AI',
    status: 'Active',
    subscriptionDate: '2025-08-01'
  },
  {
    id: 'sub5',
    subscriber: 'Rajesh Kumar',
    email: 'rajesh.k@analytics.io',
    model: 'Traffic Flow Optimizer',
    status: 'Cancelled',
    subscriptionDate: '2025-05-15'
  },
  {
    id: 'sub6',
    subscriber: 'Emily Wong',
    email: 'emily.wong@enterprise.com',
    model: 'MySejahtera Analytics AI',
    status: 'Pending',
    subscriptionDate: '2025-08-25'
  },
  {
    id: 'sub7',
    subscriber: 'Hassan Abdullah',
    email: 'hassan@ministry.gov.my',
    model: 'Traffic Flow Optimizer',
    status: 'Active',
    subscriptionDate: '2025-07-28'
  },
  {
    id: 'sub8',
    subscriber: 'Lim Chong Wei',
    email: 'chongwei@startup.my',
    model: 'MySejahtera Analytics AI',
    status: 'Active',
    subscriptionDate: '2025-06-05'
  },
  {
    id: 'sub9',
    subscriber: 'Priya Sharma',
    email: 'priya.sharma@hospital.my',
    model: 'Traffic Flow Optimizer',
    status: 'Active',
    subscriptionDate: '2025-08-10'
  },
  {
    id: 'sub10',
    subscriber: 'Chen Yi',
    email: 'chen.yi@research.edu',
    model: 'MySejahtera Analytics AI',
    status: 'Cancelled',
    subscriptionDate: '2025-04-20'
  }
];

export interface RecentActivity {
  id: string;
  type: 'subscribed' | 'cancelled' | 'downloaded' | 'commented';
  modelId: string;
  modelName: string;
  timestamp: string;
  description: string;
}

export const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: 'act1',
    type: 'subscribed',
    modelId: 'm2',
    modelName: 'Bahasa Melayu Sentiment Analyzer',
    timestamp: '2025-12-26T10:30:00Z',
    description: 'Subscribed to Bahasa Melayu Sentiment Analyzer'
  },
  {
    id: 'act2',
    type: 'downloaded',
    modelId: 'm2',
    modelName: 'Bahasa Melayu Sentiment Analyzer',
    timestamp: '2025-12-25T15:45:00Z',
    description: 'Downloaded model files for Bahasa Melayu Sentiment Analyzer'
  },
  {
    id: 'act3',
    type: 'commented',
    modelId: 'm1',
    modelName: 'MySejahtera Analytics AI',
    timestamp: '2025-12-24T09:20:00Z',
    description: 'Commented on MySejahtera Analytics AI'
  },
  {
    id: 'act4',
    type: 'subscribed',
    modelId: 'm4',
    modelName: 'AgriTech Crop Yield Predictor',
    timestamp: '2025-12-23T14:10:00Z',
    description: 'Subscribed to AgriTech Crop Yield Predictor'
  },
  {
    id: 'act5',
    type: 'downloaded',
    modelId: 'm4',
    modelName: 'AgriTech Crop Yield Predictor',
    timestamp: '2025-12-23T14:25:00Z',
    description: 'Downloaded SDK for AgriTech Crop Yield Predictor'
  },
  {
    id: 'act6',
    type: 'commented',
    modelId: 'm2',
    modelName: 'Bahasa Melayu Sentiment Analyzer',
    timestamp: '2025-12-22T11:30:00Z',
    description: 'Commented on Bahasa Melayu Sentiment Analyzer'
  },
  {
    id: 'act7',
    type: 'downloaded',
    modelId: 'm2',
    modelName: 'Bahasa Melayu Sentiment Analyzer',
    timestamp: '2025-12-21T16:00:00Z',
    description: 'Downloaded documentation for Bahasa Melayu Sentiment Analyzer'
  },
  {
    id: 'act8',
    type: 'cancelled',
    modelId: 'm1',
    modelName: 'MySejahtera Analytics AI',
    timestamp: '2025-12-20T13:40:00Z',
    description: 'Cancelled subscription to MySejahtera Analytics AI'
  },
  {
    id: 'act9',
    type: 'subscribed',
    modelId: 'm1',
    modelName: 'MySejahtera Analytics AI',
    timestamp: '2025-12-19T10:15:00Z',
    description: 'Subscribed to MySejahtera Analytics AI'
  },
  {
    id: 'act10',
    type: 'commented',
    modelId: 'm4',
    modelName: 'AgriTech Crop Yield Predictor',
    timestamp: '2025-12-19T08:50:00Z',
    description: 'Commented on AgriTech Crop Yield Predictor'
  }
];
