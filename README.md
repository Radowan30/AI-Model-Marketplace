# MIMOS AI Model Marketplace

A modern marketplace platform where AI model publishers can upload and manage their models, and buyers can browse, subscribe to, and download models. Built for MIMOS to facilitate AI model sharing and collaboration.

## Overview

This platform provides a comprehensive solution for AI model distribution with separate portals for publishers and buyers. Publishers can upload their AI models with detailed documentation, manage subscriptions, and track analytics. Buyers can browse the marketplace, subscribe to models, participate in discussions, and download model files.

## Features

### For Publishers
- **Model Management**: Upload, edit, and delete AI models with rich documentation
- **File Management**: Upload model files or link to external URLs (GitHub, Hugging Face, etc.)
- **Analytics Dashboard**: Track model views, subscriptions, and performance metrics
- **Collaboration**: Add collaborators to models for team management
- **Categories**: Organize models with custom or predefined categories

### For Buyers
- **Marketplace Browsing**: Discover AI models with advanced filtering and search
- **Subscriptions**: Subscribe to free models instantly; access to paid models coming soon with integration of payment system
- **Downloads**: Access model files after successful subscription
- **Discussions**: Participate in model-specific discussions
- **Ratings**: Rate models and view overall community ratings
- **Activity Tracking**: Track your subscription and interaction history
- **Notifications**: Real-time updates for subscriptions, discussions, and model changes

### Platform Features
- **Authentication**: Email/password and Google OAuth via Supabase
- **Role-Based Access**: Separate portals for publishers and buyers
- **Real-time Notifications**: Stay updated with platform activities
- **Responsive Design**: Fully responsive UI for desktop and mobile devices
- **File Storage**: Secure file storage via Supabase Storage
- **API Documentation Rendering**: Support for JSON, YAML, Markdown, and plain text formats

## Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Wouter** - Lightweight routing
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/UI** - Beautiful UI components built on Radix UI

### Backend
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage + Real-time)
- **Express.js** - Minimal Node.js server for serving the app
- **PostgreSQL** - Relational database via Supabase

### Additional Libraries
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting
- **Lucide React** - Icon library

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-marketplace.git
cd ai-marketplace
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### A. Create a New Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in your project details:
   - **Project Name**: Choose any name (e.g., "AI Marketplace")
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for setup to complete

#### B. Run the Database Schema
1. In your Supabase project dashboard, navigate to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of the `schema.sql` file from this repository
4. Paste it into the SQL editor
5. Click **RUN** to execute the schema
6. You should see a success message indicating tables were created

#### C. Set Up Storage Bucket
1. Navigate to **Storage** in the Supabase dashboard (left sidebar)
2. Click "Create a new bucket"
3. Name it: `model-files`
4. Make it **Public** (check the public checkbox)
5. Click "Create bucket"

#### D. Apply Storage Policies
1. In the SQL Editor, create a new query
2. Copy and paste the contents of `supabase-storage-policies.sql`
3. Click **RUN** to apply the storage policies

#### E. Initialize Roles Data
1. In the SQL Editor, run this query to insert the default roles:

```sql
INSERT INTO roles (role_name) VALUES ('buyer'), ('publisher')
ON CONFLICT (role_name) DO NOTHING;
```

### 4. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open `.env` and fill in your Supabase credentials:

```env
# Get these from: Supabase Dashboard → Project Settings → Data API and API Keys

# Your project URL (e.g., https://abcdefghijklm.supabase.co)
VITE_SUPABASE_URL=your_supabase_project_url

# Anon/Public key (safe to use in frontend)
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Service role key (server-side only - keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Finding Your Supabase Credentials:
1. Go to your Supabase project dashboard
2. Click on **Project Settings** in the left sidebar → **Data API** → **Project URL** (Copy this)
3. Click on **Project Settings** in the left sidebar → **API Keys** → **Legacy anon, service_role API keys** → **anon public** and **service_role** (Copy these two) 
4. You'll find:
   - **Project URL** - Copy this to `VITE_SUPABASE_URL`
   - **anon/public** key - Copy this to `VITE_SUPABASE_ANON_KEY`
   - **service_role** key - Copy this to `SUPABASE_SERVICE_ROLE_KEY`

### 5. Run the Application

#### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

Then start the client side:

```bash
npm run dev:client
```

The application will be available at:
- **Express backend**: http://localhost:5000
- **Vite dev server (this loads the app)**: http://localhost:5001

#### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
AI-Marketplace/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   ├── pages/         # Route pages
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Express server
├── schema.sql             # Main database schema
├── supabase-*.sql         # Additional SQL scripts
└── package.json           # Project dependencies
```

## Usage Guide

### First Time Setup

1. **Visit the Landing Page**: Navigate to http://localhost:5001
2. **Register an Account**:
   - Click "Register as Publisher" or "Register as Buyer"
   - Choose email/password or Google OAuth
   - Complete the registration form
3. **Explore the Platform**:
   - **Publishers**: Access Analytics, create models, manage subscriptions
   - **Buyers**: Browse marketplace, subscribe to models, participate in discussions

### Publisher Workflow

1. Navigate to "My Models" → "Create Model"
2. Fill in model details (name, description, features, etc.)
3. Upload files or add external URLs
4. Add categories and API documentation
5. Publish the model
6. Monitor analytics and manage subscriptions from the dashboard

### Buyer Workflow

1. Browse the marketplace to discover models
2. Filter by category, subscription type, or search keywords
3. View model details, ratings, and discussions
4. Subscribe to models (free: instant, paid: coming soon)
5. Download model files
6. Rate and discuss models with the community

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run dev:client` - Run only the Vite dev server

---

**Developed with ❤️ for the AI community**
