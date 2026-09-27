# 🤖 AI Model Marketplace

A comprehensive platform for publishing, discovering, and subscribing to AI models. Publishers can showcase their AI models with detailed documentation, pricing, and collaboration features, while buyers can browse, subscribe to, and download models.

- **Live app:** https://ai-model-marketplace.onrender.com/
- **Source code:** https://github.com/Radowan30/AI-Model-Marketplace

## ✨ Features

### For Publishers
- **Model Management**: Create, edit, and publish AI models with rich descriptions
- **Collaboration**: Add collaborators to co-manage models
- **Analytics Dashboard**: Track views, subscribers, categories, and each model's downloads and ratings
- **File Management**: Upload model files or link external resources
- **API Documentation**: Provide API specs in JSON, YAML, Markdown, or plain text
- **Real-time Notifications**: Get notified of subscriptions, ratings, and discussions

### For Buyers
- **Model Discovery**: Browse and search through published AI models
- **Subscription Management**: Subscribe to free models instantly and manage subscriptions (paid subscriptions show "Payment method coming soon")
- **Ratings & Discussions**: Rate models from 1 to 5 stars and take part in discussion threads
- **Activity Tracking**: View your subscription and interaction history
- **Real-time Updates**: Receive notifications for model updates and replies

### Platform Features
- **Dual Role System**: Users can be both buyers and publishers
- **Real-time Notifications**: Powered by Supabase Realtime
- **Secure Authentication**: Google OAuth and email/password login
- **Row Level Security**: Database-level access control on every table and on stored files
- **MIMOS Brand Integration**: Custom themed UI with brand colors

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form management
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (Google OAuth, Email/Password)
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage (for file uploads)
- **Express.js** - Server-side API endpoints
- **Node.js** - Runtime environment

### Development Tools
- **ESBuild** - Fast bundler
- **TSX** - TypeScript execution
- **Cross-env** - Environment variables
- **Zod** - Schema validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up free](https://supabase.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Radowan30/AI-Model-Marketplace.git
cd AI-Model-Marketplace
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Database

#### Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: AI Model Marketplace
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for setup to complete

#### Run Database Setup Scripts

Once your project is ready:

1. Go to **SQL Editor** in your Supabase dashboard
2. Run each SQL file from `supabase_database/` folder in order:

```sql
-- 1. Create tables and constraints
-- Copy and paste contents of: supabase_database/01_schema.sql
-- Click "Run"

-- 2. Create custom functions
-- Copy and paste contents of: supabase_database/02_functions.sql
-- Click "Run"

-- 3. Create triggers
-- Copy and paste contents of: supabase_database/03_triggers.sql
-- Click "Run"

-- 4. Enable Row Level Security
-- Copy and paste contents of: supabase_database/04_rls.sql
-- Click "Run"

-- 5. Create performance indexes
-- Copy and paste contents of: supabase_database/05_indexes.sql
-- Click "Run"

-- 6. Seed initial data (roles and categories)
-- Copy and paste contents of: supabase_database/06_seed.sql
-- Click "Run"

-- 7. Apply security fixes (access rules, sign-up trigger, notification function)
-- Copy and paste contents of: supabase_database/07_security_fixes.sql
-- Click "Run"

-- 8. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

**✅ Verification**: After setup, run this query to verify:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
You should see 15+ tables listed.

#### Set Up Storage Bucket for Model Files

Model files are stored in a private Supabase Storage bucket:

1. In the Supabase Dashboard, go to **Storage** → **New Bucket**
2. Configure:
   - **Name**: `model-files`
   - **Public bucket**: ❌ **Keep disabled.** Files are only reachable through short-lived signed links, after an access check.
   - **File size limit**: `52428800` (50 MB)
3. Click **Create bucket**

The bucket's three access policies (upload, download, delete) are created by `07_security_fixes.sql`, so you don't need to add them by hand:

- **Upload:** only into a model the uploader owns or collaborates on.
- **Download:** by the model's owner, its collaborators, and buyers with an active subscription.
- **Delete:** by the model's owner and collaborators.

⚠️ Don't paste storage policies from older guides. Earlier versions matched collaborators by the editable profile email, which let anyone impersonate a collaborator.

**✅ Verify storage setup** in the SQL Editor:
```sql
-- Bucket exists and is private (public = false, file_size_limit = 52428800)
SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'model-files';

-- Three policies: INSERT, SELECT and DELETE
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname IN (
    'Allow owners and collaborators to upload',
    'Allow owners, subscribers, and collaborators to download',
    'Allow owners and collaborators to delete'
  );
```

### 4. Configure Environment Variables

1. Copy the example environment file by running this command in your terminal at your project's root directory:
```bash
cp .env.example .env.local
```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Click **Project Settings** in the left sidebar
   - Click **Data API** → Copy the **Project URL**
   - Click **API Keys** → Under "Legacy anon, service_role API keys":
     - Copy the **anon public** key
     - Copy the **service_role** key

3. Update `.env.local` with your values:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 5. Configure Authentication

#### Enable Google OAuth (Optional but Recommended)

1. In Supabase Dashboard, go to **Authentication** → **Sign In / Providers**
2. Find **Google** and click "Enable"
3. Follow the instructions to set up Google OAuth:
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

#### Enable Email Auth

1. In Supabase Dashboard, go to **Authentication** → **Sign In / Providers**
2. **Email** should be enabled by default
3. Configure email templates if needed under **Authentication** → **Email Templates**

#### Password Settings

The app requires new passwords to be at least 8 characters. To enforce the same rule on the server, go to **Authentication** → **Sign In / Providers** → **Email** and:
- set **Minimum password length** to `8`
- turn on **Prevent use of leaked passwords**

#### URL Configuration

Email links and Google sign-in return to these app pages: `/email-verified`, `/reset-password` and `/auth/callback`. Under **Authentication** → **URL Configuration**:
- Set **Site URL** to your app's address (e.g. `https://ai-model-marketplace.onrender.com`)
- Add **Redirect URLs** for every address you run the app on, e.g.:
  ```
  https://ai-model-marketplace.onrender.com/**
  http://localhost:5000/**
  ```

### 6. Run the Application

#### Development Mode

Run the server using the following command:

```bash
npm run dev
```

The application will be available at: http://localhost:5000. In development the server only listens on this computer. Set `HOST=0.0.0.0` if you need to reach it from other devices.

#### Production Build

```bash
# Build for production
npm run build

# Start production server (listens on all interfaces, port 5000 unless PORT is set)
npm start
```

## 📱 Using the Application

### First-Time Setup

1. **Create an Account**:
   - Go to http://localhost:5000 and click **Login / Register**
   - Pick the **Buyer Portal** or **Publisher Portal** tab, then **Sign Up** with email/password (at least 8 characters) or continue with Google
   - To use both portals, sign up again on the other tab with the same email. Your account gets the second role.

2. **As a Publisher**:
   - Go to **My Models** → **Create New Model**
   - Complete the four steps:
     - General Info: name, descriptions, categories, version, free or paid
     - Technical Details: features, response time, accuracy, API specification in JSON, YAML, Markdown or plain text
     - Files & Assets: uploads up to 50 MB, or `https://` links for larger files
     - Collaborators (optional)
   - Click **Create Model** to publish, or leave the wizard and choose **Save as Draft**

3. **As a Buyer**:
   - Open **Browse Marketplace** and filter by search, price and category
   - Open a model and click **Subscribe for Free** to unlock its files. Paid models show "Payment method coming soon".
   - Manage subscriptions in **My Subscriptions**

### Key Features to Try

- **Rate Models**: Give 1–5 star ratings on model pages. A model's owner and collaborators can't rate their own model.
- **Discussions**: Start threads, comment, and reply to comments
- **Notifications**: Real-time updates in the notification center (bell icon)
- **Collaboration**: Publishers can add collaborators by email to manage models together
- **Analytics**: Publishers see views, subscribers and categories on their dashboard
- **Activity Log**: Buyers see their recent subscriptions, downloads, comments and ratings on the dashboard

## 🧪 Testing

Two automated test suites run against the Supabase project in `.env.local`. They create temporary accounts named `mimos-test-*`, and delete them and their data when they finish.

```bash
npm run test:security    # 31 tests: database access rules, attacked as signed-out and signed-in users
npm run build            # the server tests run the production build
npm run test:server      # 6 tests: API routes, rate limit, removed endpoints
npm run test:cleanup     # removes mimos-test-* accounts left by an interrupted run
```

⚠️ The tests write to the configured project (temporary accounts, models, files). Point `.env.local` at a test project if you don't want that in production.

## 🚢 Deployment

The app is deployed on Render at https://ai-model-marketplace.onrender.com/, built from the `main` branch. Render redeploys automatically when `main` is pushed, so run `npm run check`, `npm run build` and both test suites before pushing to `main`. The health check endpoint is `GET /api/health`.

## 🐛 Troubleshooting

### Build Errors

**Problem**: TypeScript or build errors

**Solution**:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run check
```

### "Too many requests" on sign-up

The `/api/auth/*` endpoints allow 20 requests per 10 minutes per IP address. Wait for the window to pass, or restart the server.

## 📝 Available Scripts

```bash
# Development (Recommended)
npm run dev              # Start full-stack server (frontend + backend on port 5000)
npm run dev:client       # [Alternative] Start only the Vite frontend (no /api endpoints)

# Build
npm run build            # Build for production
npm run check            # TypeScript type checking

# Production
npm start                # Start production server

# Tests
npm run test:security    # Database security tests
npm run test:server      # API route tests (run npm run build first)
npm run test:cleanup     # Remove leftover test accounts
```
**Note**: You only need `npm run dev` for development. It runs the Express server with integrated Vite middleware, serving both frontend and backend on port 5000.

---
