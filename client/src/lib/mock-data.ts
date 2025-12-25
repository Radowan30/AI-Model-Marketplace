import { Model, Subscription, User, Discussion } from './types';

// Get user role from localStorage, default to 'publisher' if not set
const getUserRole = (): 'publisher' | 'buyer' => {
  const storedRole = localStorage.getItem('userRole');
  return (storedRole === 'buyer' || storedRole === 'publisher') ? storedRole : 'publisher';
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

export const MOCK_MODELS: Model[] = [
  {
    id: 'm1',
    name: 'MySejahtera Analytics AI',
    description: 'Advanced predictive modeling for disease outbreak patterns based on anonymized MySejahtera data. optimized for Malaysian local contexts.',
    publisherId: 'u1',
    publisherName: 'MIMOS Berhad',
    category: 'Healthcare',
    version: '2.1.0',
    status: 'published',
    price: 'paid',
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
  },
  {
    id: 'm2',
    name: 'Bahasa Melayu Sentiment Analyzer',
    description: 'High-accuracy sentiment analysis model specifically trained on informal Malaysian social media text (Manglish, diverse dialects).',
    publisherId: 'u2',
    publisherName: 'University Malaya NLP Group',
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
  },
  {
    id: 'm3',
    name: 'Traffic Flow Optimizer',
    description: 'Computer vision model for real-time traffic light optimization based on vehicle density at intersections.',
    publisherId: 'u1',
    publisherName: 'MIMOS Berhad',
    category: 'Smart City',
    version: '0.9.0',
    status: 'draft',
    price: 'paid',
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
  },
  {
    id: 'm4',
    name: 'AgriTech Crop Yield Predictor',
    description: 'Satellite imagery analysis to predict palm oil yield and detect early signs of disease.',
    publisherId: 'u3',
    publisherName: 'Sime Darby R&D',
    category: 'Agriculture',
    version: '3.2.1',
    status: 'published',
    price: 'paid',
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
