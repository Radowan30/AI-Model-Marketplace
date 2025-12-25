# MIMOS AI Model Marketplace - Requirements Specification

## Project Overview

A marketplace platform where publishers can upload their AI models and buyers can browse, subscribe to, and download models. The platform supports both free and paid subscription models (payment system to be implemented later).

### Key Components
1. **Landing Page** - Public-facing homepage with registration/login
2. **Publisher Portal** - For AI model publishers to manage their models
3. **Buyer Portal** - For buyers to browse and subscribe to models

---

## User Roles

### Publisher
- Can upload and manage AI models
- Can monitor analytics and subscriptions
- Can approve paid subscription requests
- Can browse marketplace (preview only)
- Cannot subscribe to or download models

### Buyer
- Can browse the marketplace
- Can subscribe to models (free: immediate access, paid: payment system coming soon)
- Can download model files (if subscribed)
- Can participate in discussions

---

## Authentication & Authorization

### Registration & Login
- **Methods**:
  - Email and password
  - Google OAuth
- **User Types**: Separate registration/login flows for Buyers and Publishers
- **Implementation**: Using Supabase for authentication and database

---

## Landing Page

### Sections (in order)

1. **Hero Section**
   - Platform introduction

2. **Powered by MIMOS Section**
   - Display MIMOS logo (attached: `client/public/MIMOSlogo.png`)
   - Text: "MIMOS is Malaysia's national Applied Research and Development Centre that contributes to socio-economic growth through innovative technology platforms"

3. **Platform Statistics**
   - Number of models currently on the platform
   - Number of active users

4. **Platform Features**
   - What can be done on this platform

5. **Footer**
   - All rights reserved text

### Navigation
- Options to Register or Login as:
  - Buyer → Redirects to Buyer Portal
  - Publisher → Redirects to Publisher Portal

---

## Publisher Portal

### Navigation Structure
**Side Navigation Bar**:
- Analytics
- Marketplace
- My Models
- Settings
- Logout button (with user name and type displayed beside it)

**Responsive Behavior**:
- Desktop: Side-nav always visible
- Mobile: Side-nav slides in from left when hamburger icon (top left) is clicked

---

### 1. Analytics Page

**Overview Cards**:
- Total number of models
- Total views across all models
- Total active subscriptions (across all models)

**Charts**:
- **Model Views Over Time**: Views per week
- **Models by Category**: Distribution of models by category

**Tables**:

**Most Viewed Models**:
| Column | Description |
|--------|-------------|
| Model Name | Name of the model |
| Views | Number of views |
| Status | Published/Draft |
| Category | Model category |

**Model Subscribers**:
| Column | Description |
|--------|-------------|
| Subscriber | Subscriber name |
| Email | Subscriber email |
| Model | Model name |
| Status | Subscription status |
| Subscription Date | Date of subscription |

---

### 2. Marketplace Page

**Features**:
- Search bar: Search models by name
- Filter by: Category
- Display: Model cards showing all models (from all publishers)
- **Note**: "Models are for preview only. To use models, please use a buyer account"

**Model Card**: Shows model preview information

---

### 3. My Models Page

**Overview Cards**:
- Total Models
- Published models count
- Total Users

**Model Management**:
- Search bar: Search models by name
- Filters:
  - Category
  - Status (Draft/Published)

**Empty State**:
- Text: "No models found"
- Button: "+ New Model"

**Action Button** (Top Right):
- "+ Create Model" button

---

#### Create/Edit Model Overlay

**Tab 1: General**

| Field | Type | Validation |
|-------|------|------------|
| Model Name | Text | Required, Max 25 characters |
| Description | Long Text | Required, Max 700 characters |
| Categories | Multi-select | Required, At least one category |
| Version | Text | Required |

- Buttons: Cancel, Next

---

**Tab 2: Details**

| Field | Type | Validation |
|-------|------|------------|
| Features | Comma-separated list | Optional |
| Response Time (ms) | Number | Required |
| Accuracy (%) | Number | Required |
| API Specification / Documentation | Long Text | Optional |

- **Features**: After typing comma-separated list, click "+" button to add each as unique feature
- **API Specification**: Supports JSON/YAML (OpenAPI/Swagger), Markdown, or Plain Text (must be properly rendered)
- Buttons: Cancel, Next

---

**Tab 3: Files**

**Add File/Resource Form**:

| Field | Type | Validation |
|-------|------|------------|
| File Name | Text | Required |
| File Type | Dropdown | Required: "Upload File (< 100MB)" or "External URL (> 100MB)" |
| File Upload | File picker | Required if "Upload File" selected |
| External URL | Text/URL | Required if "External URL" selected |
| Description | Long Text | Optional |

- Button: "+ Add File"
- **Information Message**: "Files under 100MB can be uploaded directly, use URLs for larger resources"
- Buttons: Cancel, Next

---

**Tab 4: Collaborators**

**Add by Email**:
| Field | Type | Validation |
|-------|------|------------|
| Email Address | Email | Required |
| First Name | Text | Required |
| Last Name | Text | Required |

- Button: "+ Add Collaborator"

**Add Existing Users**:
- Dropdown menu listing all publishers in the system
- Can select and add existing publishers

**Collaborator List** (Left Side):
- Display all added collaborators
- Option to delete each collaborator

- Buttons: Cancel, **Create Model** (replaces "Next")

---

### 4. Settings Page

**Editable Fields**:
- Name
- Email address
- Company name
- Bio

---

## Buyer Portal

### Navigation Structure
**Side Navigation Bar**:
- Dashboard
- Marketplace
- My Purchases
- Settings
- Logout button (with user name and type displayed)

**Responsive Behavior**: Same as Publisher Portal

---

### 1. Dashboard Page

**Overview Cards**:
- Number of available models in the system
- Total number of user's subscriptions

**Quick Actions**:
- Browse Marketplace
- Manage Subscriptions

**Recent Activity Section**:
- Latest purchases
- Latest uses
- Subscription events (when subscribed, when cancelled)
- Display: Model subscribed to and date

---

### 2. Marketplace Page

**Features**:
- Search bar: Search models by name
- Filters:
  - Category
  - **Subscribed** models
- Display: Model cards

**Model Card**: Shows model information

---

### 3. My Purchases Page

**Active Subscriptions Section**:
- List of currently active subscriptions

**Previous Purchases Section**:
- Expired subscriptions
- Cancelled subscriptions

---

### 4. Settings Page

**Editable Fields**:
- Name
- Email address
- Profile information

---

## Model Details Page

**Access**: Clicking on a model card from Marketplace

### Top Section

**Subscription Plan**:
- **For Publishers**: Message indicating they cannot subscribe (preview only)
- **For Buyers**:
  - **Free Model**: "Subscribe" button → Immediate access
  - **Paid Model**: "Subscribe" button → Message: "Paid subscription unavailable. Payment method coming soon."

**Model Stats**:
| Stat | Input By |
|------|----------|
| Version | Publisher |
| Response Time | Publisher |
| Accuracy | Publisher |

---

### Tabbed Section (Horizontal Tabs)

#### Tab 1: Info

**Key Features Section**:
- Display model features

**Model Details**:
| Field | Details |
|-------|---------|
| Creator | Hyperlink to creator's email |
| Collaborators | Hyperlinks to collaborator emails |
| Published On | Publication date |
| Last Update | Last update date |

**Help & Report Section**:
- Button: "Contact Publisher" → Opens email client with publisher's email

**Access Status Section**:
- Free subscription OR
- Paid subscription (with amount)

---

#### Tab 2: Docs

**Content**:
- API specification
- Model documentation
- Any documentation provided by publisher

---

#### Tab 3: Discuss

**Features**:
- Button: "+ Start Discussion"
- Display: Previous discussion threads
- Action: Comment on discussion threads

**Access**: Anyone can start discussions and comment

---

#### Tab 4: Files

**Content**:
- List of all files associated with the model

**Download Behavior**:
- **Publishers**: Download button unavailable
- **Buyers**:
  - **Files < 100MB**: Can download if subscribed
  - **Files > 100MB (URLs)**: Link shown only to subscribed buyers

---

#### Tab 5: Stats

**Analytics** (Last 30 days):
- Page Views
- Active Subscribers (current)
- Total Subscribers (all time)
- Engagement Rate (Subscribers/Views)
- Number of Discussions

---

## Technical Stack

### Database
- **Supabase**
  - Authentication (email/password + OAuth)
  - Database storage
  - File storage (for files < 100MB)

### Authentication
- Email and password
- Google OAuth
- Supabase Auth

---

## Security Requirements

- Follow best security practices
- No vulnerabilities in the application
- Secure authentication flows
- Protected routes based on user role
- Input validation and sanitization
- Secure file upload handling
- Protection against common vulnerabilities:
  - SQL Injection
  - XSS (Cross-Site Scripting)
  - CSRF (Cross-Site Request Forgery)
  - Unauthorized access
  - File upload vulnerabilities

---

## Design Requirements

### Branding
- **Owner**: MIMOS
- **Color Scheme**: Complementary to MIMOS logo (`client/public/MIMOSlogo.png`)
- **Logo Usage**: Display MIMOS logo in landing page

### Responsive Design
- Desktop: Full navigation visible
- Mobile: Hamburger menu with slide-out navigation

---

## Business Logic

### Subscription Flow

**Free Models**:
1. Buyer clicks "Subscribe"
2. Instant access granted
3. Can download files immediately

**Paid Models**:
1. Buyer clicks "Subscribe"
2. Display toast: "Paid subscription unavailable. Payment method coming soon."
3. No subscription created (payment system to be implemented in future phase)

### File Access Rules
- Publishers: Can upload, cannot download
- Buyers: Can download only if subscribed
- Files < 100MB: Direct upload to platform
- Files > 100MB: Store as external URLs, show only to subscribed buyers

### Model Publishing
- Models can be in "Draft" or "Published" status
- Only published models appear in marketplace
- Publishers can edit their own models

### Collaborators
- Can be added by email (new users)
- Can be selected from existing publishers
- Have access to collaborate on the model

---

## Data Models

### User
- ID
- Name (First Name, Last Name)
- Email
- User Type (Publisher/Buyer)
- Company Name (optional)
- Bio (optional)
- Created At
- Updated At

### Model
- ID
- Model Name (max 25 chars)
- Description (max 700 chars)
- Categories (array)
- Version
- Features (array)
- Response Time (ms)
- Accuracy (%)
- API Documentation (supports JSON/YAML/Markdown/Plain Text)
- Publisher ID (foreign key)
- Status (Draft/Published)
- Subscription Type (Free/Paid)
- Subscription Amount (if paid)
- Created At
- Updated At
- View Count
- Published On
- Last Update Date

### Model Files
- ID
- Model ID (foreign key)
- File Name
- File Type (Upload/External URL)
- File URL/Path
- Description (optional)
- File Size
- Created At

### Collaborator
- ID
- Model ID (foreign key)
- User ID (foreign key) or Email
- First Name
- Last Name
- Added At

### Subscription
- ID
- Buyer ID (foreign key)
- Model ID (foreign key)
- Status (Pending/Active/Expired/Cancelled)
- Subscribed At
- Approved At (for paid models)
- Expires At
- Cancelled At

### Discussion
- ID
- Model ID (foreign key)
- User ID (foreign key)
- Title
- Content
- Created At
- Updated At

### Comment
- ID
- Discussion ID (foreign key)
- User ID (foreign key)
- Content
- Created At
- Updated At

### Activity Log
- ID
- User ID (foreign key)
- Activity Type (Subscribe, Cancel, Download, etc.)
- Model ID (foreign key)
- Timestamp
- Details

---

## Current Application State

### Existing Tech Stack
- **Frontend**: React 19.2.0 + Vite
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js (local strategy)
- **UI Components**: Radix UI + Tailwind CSS
- **Routing**: Wouter

### Existing Pages/Components
- Landing page (partial)
- Auth page (partial)
- Publisher dashboard
- Buyer dashboard
- Marketplace page
- Model details page
- My Models page
- My Purchases page
- Layout components (Navbar, Sidebar)
- UI component library (complete)

---

## Migration Requirements

### Critical Changes Needed

**1. Database Migration: Drizzle ORM → Supabase**
- Replace Drizzle ORM with Supabase client
- Migrate PostgreSQL schema to Supabase
- Update all database queries to use Supabase SDK
- Implement Row Level Security (RLS) policies
- Set up Supabase Storage for file uploads

**2. Authentication Migration: Passport.js → Supabase Auth**
- Remove Passport.js and express-session
- Implement Supabase Auth with:
  - Email/password authentication
  - Google OAuth provider
  - User type (Publisher/Buyer) stored in user metadata or profiles table
- Update protected routes to use Supabase auth state
- Implement auth state management in React

**3. Missing Features to Implement**
- Complete landing page with MIMOS branding
- Analytics page for publishers
- Create Model overlay with all 4 tabs
- Discussion forum functionality
- File upload/download system
- Subscription management system
- Settings pages for both portals
- Collaborator management
- Recent activity tracking
- Payment system for paid subscriptions (currently showing "coming soon" message)

---

## Implementation Checklist

**Current Status**: ~65-70% Complete (Frontend structure mostly done with mock data)

**Strategy**: Fix all Buyer & Publisher portal UI/UX issues first with mock data, then migrate to Supabase backend

---

## PART A: FRONTEND FIXES (Buyer & Publisher Portals Only)

Complete all frontend work before backend migration. Test thoroughly with mock data.

---

### Phase 1A: Auth Page - Add Registration Flow & Fix Login

**Priority**: CRITICAL

**File**: `client/src/pages/auth.tsx`

**Current Issues**:
- Only has "Sign In" (login) functionality
- Missing registration/signup flow
- No way for new users to create accounts

**Tasks**:

#### 1A.1. Change "Sign In" to "Login"
- [x] **UPDATE All Text References**:
  - [x] Change all "Sign In" text to "Login"
  - [x] Update page title: "Login to MIMOS AI Marketplace"
  - [x] Keep the two-tab structure (Buyer tab, Publisher tab)

#### 1A.2. Add "Sign Up" Link/Button
- [x] **ADD Navigation to Registration**:
  - [x] Below the login form, add text: "Don't have an account? Sign Up"
  - [x] Make "Sign up" a clickable link/button
  - [x] Style similar to "Forgot password?" links (small, underlined)
  - [x] On click: Show registration form (same page)

#### 1A.3. Create Registration Form
- [x] **CREATE Registration Interface**:
  - [x] Same two-tab structure: "Buyer" | "Publisher"
  - [x] Tab selected determines the role (buyer or publisher)
  - [x] Registration form fields for each tab:
    - [x] **Name** (text input, required)
      - Placeholder: "Full Name"
      - Validation: HTML5 required attribute
    - [x] **Email** (email input, required)
      - Placeholder: "email@example.com"
      - Validation: Valid email format
    - [x] **Password** (password input, required)
      - Placeholder: "Create a password"
      - Validation: HTML5 required attribute
    - [x] **Confirm Password** (password input, required)
      - Placeholder: "Re-enter password"
      - Validation: Must match password (validated in handler)
    - [x] **"Create Account" button** (primary button)
    - [ ] **"Continue with Google" button** (below email/password signup) - Not implemented
  - [x] Below form: "Already have an account? Login" (link back to login)

#### 1A.4. Implement Multi-Role Support (Mock)
**Important**: Users can have BOTH buyer AND publisher roles with the same email.

- [x] **UPDATE Mock Data Structure** (`client/src/lib/mock-data.ts`):
  - [x] Create `USERS` array to store registered users:
    ```typescript
    export const USERS = [
      {
        id: '1',
        email: 'aminah@mimos.my',
        name: 'Dr. Aminah Hassan',
        password: 'hashed_password', // Mock - store plain text for now
        roles: ['publisher'] // Array of roles
      },
      {
        id: '2',
        email: 'john@buyer.com',
        name: 'John Doe',
        password: 'password123',
        roles: ['buyer']
      },
      {
        id: '3',
        email: 'multi@user.com',
        name: 'Multi Role User',
        password: 'password123',
        roles: ['buyer', 'publisher'] // Same user, multiple roles
      }
    ];
    ```

- [x] **IMPLEMENT Registration Logic**:
  - [x] On "Sign Up" button click:
    - [x] Validate all fields (name, email, password match)
    - [x] Get role from selected tab ('buyer' or 'publisher')
    - [x] Check if user exists in USERS array:
      - [x] If email + role combination exists:
        - Show error: "An account with this email already exists as [role]. Please login instead."
        - Prevent registration
      - [x] If email exists but with different role:
        - Find existing user and add new role to their roles array
        - Show success: "Role added successfully!"
      - [x] If email doesn't exist:
        - Create new user object with single role in roles array
        - Add to USERS array
        - Store in localStorage
        - Show success: "Account created!"
    - [x] Auto-login and redirect to portal

- [ ] **IMPLEMENT Google OAuth Registration**: Not implemented

#### 1A.5. Update Login Logic for Multi-Role Support
- [x] **MODIFY Login to Use Selected Tab**:
  - [x] On login attempt:
    - [x] Get email and password from form
    - [x] Get role from selected tab ('buyer' or 'publisher')
    - [x] Find user in USERS array by email
    - [x] Verify password matches
    - [x] Check if user has the selected role in their roles array:
      - [x] If YES: Login successful
        - Store current session with role: `{ userId, currentRole }`
        - Redirect to appropriate portal based on currentRole
      - [x] If NO: Show error
        - "You don't have [role] access. Please check your account role or register as [role]."
    - [x] If email or password wrong: "Invalid email or password"

- [x] **ADD Role Selection for Multi-Role Users** (Optional Enhancement):
  - [x] Respects the tab they selected during login (simpler approach)

#### 1A.6. Update Current User Mock Data
- [x] **UPDATE CURRENT_USER** (`client/src/lib/mock-data.ts`):
  - [x] Change structure to support current role:
    ```typescript
    export const CURRENT_USER = {
      id: 'u1',
      name: 'Dr. Aminah',
      email: 'aminah@mimos.my',
      get role() {
        return getUserRole(); // Dynamically gets from localStorage
      },
      company: 'MIMOS Berhad',
      bio: 'Senior AI Researcher specializing in NLP and Computer Vision.',
      avatar: '...'
    };
    ```

- [x] **ADD Helper Function**:
  ```typescript
  export const getCurrentUserRole = () => getUserRole();
  export const userHasRole = (role: 'buyer' | 'publisher') =>
    CURRENT_USER.roles.includes(role);
  ```

---

### Phase 1: Sidebar Component & Mobile Navigation Fixes

**Priority**: HIGH

**File**: `client/src/components/layout/Sidebar.tsx` and `client/src/components/layout/Navbar.tsx`

**Current Issues**:
- Logout button doesn't show user info above it
- Mobile/tablet view shows dropdown from top instead of sliding sidebar from left
- Hamburger icon position incorrect
- Profile icons should show user initials

**Tasks**:

#### 1.1. Add User Info Section Above Logout
- [x] **ADD User Info Display** (in Sidebar footer, above logout):
  - [x] Create user info section displaying:
    - [x] **User Initials**: Show initials in colored circle (not profile icon)
      - Extract from CURRENT_USER.name (e.g., "Aminah Hassan" → "AH")
      - Circle background: Primary color
      - Text: White, bold, centered
      - Size: 40x40px (implemented as w-10 h-10)
    - [x] **User Name**: Display CURRENT_USER.name
      - Font: Medium weight, 14px
      - Color: Text primary
    - [x] **User Type Badge**: Display role
      - Show "Publisher" or "Buyer"
      - Style as small badge/pill
      - Background: Secondary color
      - Font: 12px
  - [x] Layout:
    ```
    ┌──────────────────────┐
    │  [AH]  Aminah Hassan │
    │        Publisher     │
    ├──────────────────────┤
    │  [→] Logout          │
    └──────────────────────┘
    ```
  - [x] Position: Bottom of sidebar (shrink-0 class)
  - [x] Spacing: Adequate padding around elements
  - [x] **NO LINK**: Not clickable

#### 1.2. Fix Mobile/Tablet Navigation
**Current Behavior** (WRONG):
- Hamburger icon at top right
- Clicking shows dropdown from top with logout + user info
- Sidebar doesn't slide in

**Required Behavior** (CORRECT):
- Hamburger icon at top LEFT
- "MIMOS AI Marketplace" branding at top RIGHT
- Clicking hamburger slides in FULL SIDEBAR from left
- Sidebar shows all nav links + user info + logout

- [x] **REMOVE Top Dropdown Component**:
  - [x] Found and deleted the dropdown/menu component in Navbar
  - [x] Removed `DropdownMenu` from Navbar
  - [x] Removed avatar/profile icon from navbar

- [x] **REPOSITION Elements in Navbar**:
  - [x] **Hamburger Icon**:
    - Position: Top left using flexbox order
    - Only visible on mobile (`md:hidden` class)
    - Icon: Menu icon (from lucide-react)
  - [x] **Branding**:
    - Position: Top right on mobile using flexbox order (`order-last` on mobile)
    - Show: "MIMOS AI Marketplace" text + logo
    - Consistent styling maintained

- [x] **IMPLEMENT Sidebar Slide-In on Mobile**:
  - [x] Add state: Managed in Layout.tsx as `mobileSidebarOpen`
  - [x] On hamburger click: Toggles state via `onMobileSidebarToggle`
  - [x] Sidebar component:
    - [x] Desktop (>1024px): Always visible (static position, `hidden md:flex`)
    - [x] Mobile/Tablet (<=1024px):
      - Hidden by default (`-translate-x-full`)
      - When open: Slide in from left (`translate-x-0`)
      - Position: Fixed, full height
      - Width: 256px (w-64)
      - Z-index: 50
      - Animation: `transition-transform duration-300 ease-in-out`
  - [x] Add backdrop/overlay when sidebar open:
    - [x] Dark semi-transparent background (`bg-black/50`)
    - [x] Clicking backdrop closes sidebar
    - [x] Z-index: 40 (below sidebar)
  - [x] Close sidebar when:
    - [x] User clicks backdrop
    - [x] User clicks any nav link
    - [x] User clicks logout

- [x] **REPLACE All Profile Icons with Initials**:
  - [x] Navbar: Removed all profile icons and dropdown menu
  - [x] Sidebar user info: Initials circle implemented
  - [x] Removed Avatar component imports from Navbar
  - [x] Helper function to extract initials:
    ```typescript
    const getInitials = (name: string): string => {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2); // Max 2 letters
    };
    ```
    Implemented in Sidebar.tsx

### Phase 2: Publisher Analytics Page Fixes

**Priority**: HIGH

**File**: `client/src/pages/publisher/dashboard.tsx`

**Current Issues**:
- Has 4 stat cards but should only have 3
- Chart shows daily views instead of weekly
- Table has wrong columns
- Missing entire "Model Subscribers" table

**Tasks**:

#### 2A. Fix Stats Cards (Lines ~23-76)
- [x] **REMOVE "Total Downloads" Card**:
  - [x] Deleted the 4th StatsCard component (was showing downloads with CreditCard icon)
  - [x] Kept only 3 cards: Total Models, Total Views, Active Subscriptions
  - [x] Adjusted grid layout to `lg:grid-cols-3` for even spacing

#### 2B. Fix "Model Views Over Time" Chart (Lines ~84-114)
- [x] **Update Chart Title**:
  - [x] Changed from "Model Views Overview" → "Model Views Over Time" (line 80)

- [x] **Change Time Period from Daily to Weekly**:
  - [x] Updated mock data for chart from 7 days to 6 weeks (Week 1-6)
  - [x] X-axis labels: "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"
  - [x] Y-axis: Views per week (2800, 3200, 2900, 3800, 3400, 4100)
  - [x] Updated chart data structure in component (lines 24-31)

#### 2C. Fix "Most Viewed Models" Table (Lines ~154-215)
- [x] **Fix Table Columns**:
  - [x] Changed from: Model Name, Category, Status, Views, Downloads
  - [x] To: Model Name, Views, Status, Category
  - [x] Removed "Downloads" column entirely
  - [x] Reordered columns: Model Name → Views → Status → Category
  - [x] Updated TableHeader (lines 154-160) and TableBody (lines 162-175) accordingly

#### 2D. Add "Model Subscribers" Table (NEW)
- [x] **Create New Table Below "Most Viewed Models"**:
  - [x] Added section heading: "Model Subscribers" (line 183)
  - [x] Created table with columns (lines 187-195):
    1. **Subscriber** (name of buyer)
    2. **Email** (buyer's email)
    3. **Model** (name of subscribed model)
    4. **Status** (Active/Pending/Cancelled)
    5. **Subscription Date** (formatted date)
  - [x] Used same `Table` component styling as "Most Viewed Models"
  - [x] Shows all subscribers across ALL publisher's models (aggregate view)

- [x] **Create Mock Data for Subscribers**:
  - [x] In `client/src/lib/mock-data.ts`, added `MODEL_SUBSCRIBERS` array (lines 213-294)
  - [x] Each entry: `{ id, subscriber, email, model, status, subscriptionDate }`
  - [x] Created 10 sample subscriber entries
  - [x] Mix of Active (6), Pending (2), Cancelled (2) statuses
  - [x] Referenced existing models: "MySejahtera Analytics AI" and "Traffic Flow Optimizer"

- [x] **Import and Display Mock Data**:
  - [x] Imported `MODEL_SUBSCRIBERS` in dashboard.tsx (line 3)
  - [x] Mapped over array to render table rows (lines 197-224)
  - [x] Added status badge with color coding:
    - Active = green (`bg-green-500`)
    - Pending = yellow (`bg-yellow-500`)
    - Cancelled = gray (`bg-gray-500`)

---

### Phase 3: Publisher My Models Page Fixes

**Priority**: HIGH

**File**: `client/src/pages/publisher/my-models.tsx`

**Current Issues**:
- Missing overview cards at top
- Filter UI not implemented (only shows button)
- Empty state could be clearer

**Tasks**:

#### 3A. Add Overview Cards Section (NEW - Add at Top)
- [x] **Create Overview Stats Section**:
  - [x] Placed ABOVE search bar and filter buttons (lines 68-88)
  - [x] Created 3 stat cards in a grid row (`lg:grid-cols-3`):
    1. **Total Models**: Count all models (published + draft)
       - Icon: Package ✓
       - Value: `totalModels` calculated from `myModels.length` ✓
    2. **Published**: Count only published models
       - Icon: CheckCircle ✓
       - Value: `publishedModels` filtered where status === 'published' ✓
    3. **Total Users**: Total unique subscribers across all models
       - Icon: Users ✓
       - Value: `uniqueSubscribers` using Set to count distinct emails ✓
  - [x] Used `StatsCard` component (imported on line 8)
  - [x] Styled similar to Analytics dashboard cards

#### 3B. Implement Filter UI (Lines ~40-45)
- [x] **Replace Filter Button with Actual Filters**:
  - [x] Replaced "Filter" and "Sort" buttons with actual dropdowns (lines 95-118)
  - [x] Added **Category Filter**:
    - [x] Select dropdown showing all categories dynamically
    - [x] Options: "All Categories" + categories from models
    - [x] Filters table based on selected category
  - [x] Added **Status Filter**:
    - [x] Select dropdown with options: "All Status", "Published", "Draft"
    - [x] Filters table based on selected status
  - [x] Placed filters next to search bar (horizontal layout with flexbox)
  - [ ] Show active filter count badge - Not implemented (not critical)

- [x] **Implement Filter Logic**:
  - [x] Created state for selected category and status (lines 29-30)
  - [x] Filter `myModels` array based on selections (lines 43-48)
  - [x] Updated table to use `filteredModels` instead of `myModels` (line 148)
  - [x] Filters reset to "all" by default (implicit clear via dropdown)

#### 3C. Enhance Empty State (Line ~63)
- [x] **Update Empty State Message**:
  - [x] Changed text from "No models found. Create your first one!" to just "No models found." (line 138)
  - [x] Added separate "+ New Model" button below the text (lines 139-143)
  - [x] Made button prominent with outline variant and icon
  - [x] Provides two entry points for creating a model (top-right + empty state)

---

### Phase 4: Publisher Create Model Page - Complete All Tabs

**Priority**: CRITICAL (Many missing fields)

**File**: `client/src/pages/publisher/create-model.tsx`

---

#### 4A. Tab 1: General (Step 1, Lines ~301-373)

**Current Issues**:
- Missing Version field
- No character counters
- No validation enforcement

**Tasks**:
- [x] **ADD Version Field**:
  - [x] Added text input for "Version" field (lines 353-360)
  - [x] Placed after Category selection
  - [x] Made required with asterisk
  - [x] Placeholder: "e.g., 1.0.0 or v2.1"
  - [x] Accepts text format (no strict validation)

- [x] **ADD Character Counters**:
  - [x] Model Name field: Shows "X / 25 characters" below input (lines 312-317)
  - [x] Short Description field: Shows "X / 700 characters" (lines 328-333)
  - [x] Counters update in real-time as user types
  - [x] Turn red when approaching limit (> 20 for name, > 650 for description)

- [x] **ADD Validation**:
  - [x] Enforced 25 character max for Model Name using slice (line 309)
  - [x] Enforced 700 character max for Description using slice (line 325)
  - [x] Validation function `isTab1Valid()` checks all requirements (lines 95-104)
  - [x] "Next" button disabled if validation fails (line 737)
  - [x] Toast error message shown if validation fails (lines 107-113)
  - [x] Controlled inputs with maxLength attribute prevent exceeding limits

- [x] **ADD Price Type and Price Fields**:
  - [x] Add "Price Type" field with radio buttons or select dropdown (Required)
    - Label: "Price Type" with red asterisk
    - Options: "Free" or "Paid"
    - Position: After Version field, before Detailed Description
  - [x] Add conditional "Price" field that appears when "Paid" is selected (Required when Paid)
    - Label: "Price (MYR)" with red asterisk
    - Input type: number
    - Placeholder: "e.g., 1000.00"
    - Validation: Must be greater than 0
    - Only visible when Price Type = "Paid"
  - [x] Update validation to include:
    - Price Type is required (must select Free or Paid)
    - If Paid selected, Price must be filled and > 0
    - Update `isTab1Complete()` function accordingly
  - [x] Store price type and price in form state
  - [x] Include in form submission data

---

#### 4B. Tab 2: Technical Details (Step 2, Lines ~376-475)

**Current Issues**:
- Missing Features field
- Has Framework field (not required)
- API Specification field lacks rendering

**Tasks**:
- [x] **ADD Features Field**:
  - [x] Added text input labeled "Features (comma-separated)" at top (lines 378-409)
  - [x] Placeholder: "e.g., Real-time processing, Multi-language support, Cloud-based"
  - [x] "+ Add Features" button next to input (line 392)
  - [x] On button click or Enter key:
    - [x] Parses input by commas (line 136)
    - [x] Creates array of feature strings (lines 135-138)
    - [x] Displays as chips/badges below input (lines 396-408)
    - [x] Each chip has X icon to remove (lines 401-404)
  - [x] Features array stored in form state (line 73)
  - [x] Marked as optional field (no asterisk)

- [x] **REMOVE Framework Field**:
  - [x] Deleted the Framework input field from Tab 2 (no longer present)
  - [x] Moved Version field to Tab 1 instead

- [x] **ENHANCE API Specification Field** (Lines 432-473):
  - [x] Added format selector dropdown with "JSON", "YAML", "Markdown", "Plain Text" (lines 436-446)
  - [x] Added "Preview" / "Edit" toggle button (lines 447-454)
  - [x] When in Preview mode:
    - [x] Shows content in preformatted block (lines 467-471)
    - [x] Basic preview with monospace font and word wrapping
    - [x] Shows "No content to preview" when empty
  - [x] Dynamic placeholder based on selected format (line 461)
  - [x] Kept as optional field

---

#### 4C. Tab 3: Files (Step 3, Lines ~478-591)

**Current Issues**:
- Current implementation too simple (just drop area + URL input)
- Missing structured form with all required fields
- No file list management

**Tasks**:
- [x] **RESTRUCTURE to Complete File Form**:
  - [x] Replaced simple implementation with structured form (lines 488-546)

- [x] **ADD File Form Fields**:
  - [x] **File Name** (text input, required) (lines 492-499)
    - Label: "File Name" with asterisk
    - Placeholder: "e.g., model_weights.h5"
  - [x] **File Type** (dropdown, required) (lines 501-512)
    - Label: "File Type" with asterisk
    - Options:
      - "Upload File (< 100MB)"
      - "External URL (> 100MB)"
  - [x] **Conditional Field** based on File Type:
    - If "Upload File" selected: Shows file picker / drop zone (lines 515-521)
    - If "External URL" selected: Shows URL text input (lines 523-530)
  - [x] **Description** (textarea, optional) (lines 533-541)
    - Label: "Description (Optional)"
    - Placeholder: "Brief description of this file"
  - [x] **"+ Add File" Button** (lines 543-545)
    - On click: Validates and adds file object to files array (lines 149-182)
    - Validates required fields before adding
    - Clears form for next file

- [x] **ADD File List Display** (Lines 549-589):
  - [x] Shows list of added files below the form
  - [x] Each file entry displays (lines 553-586):
    - File name with FileText icon (lines 559-565)
    - File type badge (Upload or URL) (lines 562-564)
    - URL if external (lines 571-575)
    - Description snippet (lines 566-570)
    - Delete button with trash icon (lines 577-584)
  - [x] Files can be deleted from list (line 185)
  - [x] Files array stored in form state (line 85)

- [x] **ADD Information Message** (Lines 480-485):
  - [x] Displayed info alert banner: "Files under 100MB can be uploaded directly. Use external URLs for larger resources"
  - [x] Placed at top above form
  - [x] Styled as blue info alert with Info icon

---

#### 4D. Tab 4: Collaborators (Step 4, Lines ~594-728)

**Current Issues**:
- Email field exists but missing First Name and Last Name
- No dropdown for existing publishers
- Collaborator list only shows current user
- No delete functionality

**Tasks**:
- [x] **COMPLETE "Add by Email" Form** (Lines 648-693):
  - [x] Kept existing Email Address field (lines 671-679)
  - [x] ADDED First Name field (text input, required) (lines 653-660)
  - [x] ADDED Last Name field (text input, required) (lines 661-668)
  - [x] Email format validation before adding (lines 200-207)
  - [x] "+ Add Collaborator" button functionality (lines 681-688):
    - Creates collaborator object: `{ email, firstName, lastName, role }` (lines 210-215)
    - Adds to collaborators array (line 217)
    - Clears form fields (lines 219-222)
    - Shows in collaborators list immediately

- [x] **ADD "Add Existing Publisher" Section** (Lines 695-724):
  - [x] Added section heading: "Add Existing Publisher" (line 697)
  - [x] Created dropdown/select menu (lines 700-713)
  - [x] Populated with publishers from `PUBLISHERS` mock data (lines 25-30)
  - [x] Each option shows: "Name - email@example.com" (lines 707-709)
  - [x] "+ Add Publisher" button to add selected publisher (lines 715-723)
  - [x] Placed below "Add by Email" section in right column

- [x] **ENHANCE Collaborator List Display** (Lines 597-644):
  - [x] Positioned on LEFT side of form in 2-column grid (line 598)
  - [x] Shows ALL added collaborators (lines 615-636)
  - [x] Each collaborator shows:
    - Initials circle with getInitials() function (lines 617-619)
    - Full name (lines 621-623)
    - Email address (line 624)
    - Role (Collaborator or Publisher) (line 625)
    - Delete/remove button with X icon (lines 627-634)
  - [x] Current user (owner) shown separately without delete button (lines 603-612)
  - [x] Empty state message when no collaborators (lines 638-642)
  - [x] List updates when collaborators added/removed (handler at line 254)

---

### Phase 4E: Model Details Page - Update Subscription Flow

**Priority**: HIGH

**File**: `client/src/pages/model-details.tsx`

**Current Issues**:
- All models show generic subscription flow
- No differentiation between free and paid models
- No pricing information displayed
- Paid model subscriptions should be blocked until payment system is implemented

**Tasks**:

- [x] **UPDATE Model Display to Show Price Information**:
  - [x] Add price display in the sidebar card (where license info is shown)
  - [x] If model is Free: Show "FREE" badge
  - [x] If model is Paid: Show "PAID - MYR {price}" badge
  - [x] Position: In the pricing card alongside License and Version info

- [x] **IMPLEMENT Free Model Subscription Flow**:
  - [x] If model price type is "free":
    - [x] "Subscribe" button should work immediately
    - [x] On click: Add subscription to user's purchases
    - [x] Show success toast: "Successfully subscribed to {model name}"
    - [x] Update UI to show "Subscribed" state

- [x] **IMPLEMENT Paid Model Subscription Flow**:
  - [x] If model price type is "paid":
    - [x] Display price prominently in sidebar
    - [x] "Subscribe" button should be enabled but show blocking message
    - [x] On click: Show toast (not success, just info)
      - Title: "Payment Method Coming Soon"
      - Description: "Paid model subscription is unavailable now. Payment method coming soon."
    - [x] Do NOT add subscription
    - [x] Button text remains "Subscribe" (not "Subscribed")

- [x] **ADD Visual Indicators**:
  - [x] Free models: Green "FREE" badge with Unlock icon
  - [x] Paid models: Primary badge with Lock icon and price "MYR 2500.00"
  - [x] Added icons (lock icon for paid, unlock for free)

---

### Phase 4F: Publisher My Models - Implement Action Buttons

**Priority**: HIGH

**File**: `client/src/pages/publisher/my-models.tsx`

**Current Issues**:
- Three-dot menu (DropdownMenu) has action buttons that don't do anything
- "View Details" button has no onClick handler
- "Edit Model" button has no onClick handler
- "Delete" button has no onClick handler

**Tasks**:

- [x] **IMPLEMENT "View Details" Action**:
  - [x] Add onClick handler to DropdownMenuItem
  - [x] Use wouter's `useLocation` hook to navigate
  - [x] Navigate to: `/model/{model.id}`
  - [x] Should open the model details page for that specific model

- [x] **IMPLEMENT "Edit Model" Action**:
  - [x] Create new route: `/publisher/edit-model/:id`
  - [x] Create new page file: `client/src/pages/publisher/edit-model.tsx`
  - [x] Copy structure from `create-model.tsx` (same tabs, same layout)
  - [x] Key differences:
    - Page title: "Edit Model" instead of "Create New Model"
    - Pre-fill ALL form fields with existing model data
    - Load model data using `useRoute` to get model ID from URL
    - Find model in MOCK_MODELS using the ID
    - Button text: "Update Model" instead of "Create Model"
    - Success toast: "Model updated successfully" instead of "Model created successfully"
  - [x] Add onClick handler in my-models.tsx:
    - Navigate to: `/publisher/edit-model/{model.id}`
  - [x] Form state should initialize with:
    - modelName: model.name
    - shortDescription: (extract from model.description)
    - category: model.category
    - version: model.version
    - priceType: model.price (free/paid)
    - price: (if paid, show price; will need to add this to mock data)
    - features: model.features array
    - responseTime: model.stats.responseTime
    - accuracy: model.stats.accuracy
    - files: (if applicable)
    - collaborators: (if applicable)

- [x] **IMPLEMENT "Delete" Action**:
  - [x] Add onClick handler to DropdownMenuItem
  - [x] Show confirmation dialog before deleting:
    - Use AlertDialog component
    - Message: "Are you sure you want to delete this model? This action cannot be undone."
  - [x] If confirmed:
    - Show success toast: "{model.name} has been deleted"
    - (In real app, would be API call to remove from database)
  - [x] If cancelled:
    - Close dialog, no action

---

### Phase 4G: Publisher Dashboard - Fix Date Range Button Styling

**Priority**: MEDIUM

**File**: `client/src/pages/publisher/dashboard.tsx`

**Current Issues**:
- "Select date range" button (lines ~333-390) doesn't match the styling of other filters
- Other filters (Search bar, Model filter, Status filter) have consistent styling
- Date range button looks different/out of place

**Tasks**:

- [x] **UPDATE Date Range Button Styling**:
  - [x] Match the height with other filter dropdowns (Select components)
  - [x] Ensure consistent border styling
  - [x] Match background color with Select triggers
  - [x] Align padding and spacing
  - [x] Applied styling updates:
    - Added h-10 for matching height
    - Added border-input bg-background for consistent appearance
    - Added text-sm for matching text size
    - Added proper hover states to match other filters

- [x] **VERIFY Visual Consistency**:
  - [x] All filters have same height (h-10)
  - [x] All filters have same border style (border-input)
  - [x] All filters align properly in the flex container
  - [x] Spacing between filters is consistent

---

### Phase 5: Publisher Settings Page - Create New Page

**Priority**: MEDIUM

**File**: `client/src/pages/publisher/settings.tsx` - **MUST CREATE THIS FILE**

**Tasks**:
- [x] **CREATE New File**: `client/src/pages/publisher/settings.tsx`

- [x] **SET UP Page Structure**:
  - [x] Import Layout component
  - [x] Use `<Layout type="dashboard">` wrapper
  - [x] Add page title: "Settings"
  - [x] Add description below title

- [x] **CREATE Settings Form**:
  - [x] Form fields (use controlled inputs):
    1. **Name** (text input)
       - Label: "Full Name"
       - Pre-fill from `CURRENT_USER.name`
    2. **Email** (email input)
       - Label: "Email Address"
       - Pre-fill from `CURRENT_USER.email`
    3. **Company Name** (text input, optional)
       - Label: "Company / Organization"
       - Placeholder: "e.g., MIMOS Berhad"
    4. **Bio** (textarea, optional)
       - Label: "Bio"
       - Placeholder: "Tell us about yourself..."
       - Max 500 characters
       - Show character counter
  - [x] Buttons:
    - "Save Changes" (primary button)
    - "Cancel" (secondary button, resets form)

- [x] **ADD Form Functionality** (using mock data):
  - [x] Create form state with useState
  - [x] Pre-fill form with `CURRENT_USER` data using useEffect
  - [x] Track if form has been modified (dirty state with isDirty() function)
  - [x] On "Save Changes":
    - Show success toast: "Settings saved successfully"
    - Update original values to reflect the save
  - [x] On "Cancel":
    - Reset form to original `CURRENT_USER` values
    - Show toast: "Changes discarded"
  - [x] Disable "Save Changes" if no changes made or required fields empty

- [x] **ADD to Routing**:
  - [x] In `client/src/App.tsx`, add route: `/publisher/settings`
  - [x] Import Settings component
  - [x] Verify sidebar navigation link works (already exists at line 62)

---

### Phase 6: Buyer Dashboard Fixes

**Priority**: HIGH

**File**: `client/src/pages/buyer/dashboard.tsx`

**Current Issues**:
- Wrong stats cards (Active Models, Pending Requests, Total Spent)
- Missing Quick Actions section
- Missing Recent Activity section

**Tasks**:

#### 6A. Fix Stats Cards (Lines ~23-47)
- [x] **REPLACE All Current Stats Cards**:
  - [x] Remove: "Active Models", "Pending Requests", "Total Spent" cards
  - [x] Add: "Available Models" card
    - Label: "Available Models in Marketplace"
    - Value: Total count of all models in system (count `MODELS` array)
    - Icon: Store
  - [x] Add: "My Subscriptions" card
    - Label: "My Subscriptions"
    - Value: Count of user's active subscriptions (filter `SUBSCRIPTIONS` where status='active')
    - Icon: ShoppingBag
  - [x] Show only 2 cards in grid (md:grid-cols-2)

#### 6B. Add Quick Actions Section (NEW)
- [x] **CREATE Quick Actions Section**:
  - [x] Place below stats cards
  - [x] Section heading: "Quick Actions"
  - [x] Create 2 action buttons/cards:
    1. **Browse Marketplace**
       - Icon: Search
       - Text: "Browse Marketplace"
       - Description: "Discover and subscribe to AI models"
       - Links to: `/marketplace`
    2. **Manage Subscriptions**
       - Icon: Package
       - Text: "Manage Subscriptions"
       - Description: "View and manage your subscriptions"
       - Links to: `/buyer/my-purchases`
  - [x] Style as prominent CTA cards (gradient background, hover shadow)
  - [x] Add hover effects (arrow translation, color transitions)

#### 6C. Add Recent Activity Section (NEW)
- [x] **CREATE Recent Activity Section**:
  - [x] Place below Quick Actions (after "Your Active Models")
  - [x] Section heading: "Recent Activity"

- [x] **CREATE Mock Data for Activities** (in `mock-data.ts`):
  - [x] Add `RECENT_ACTIVITIES` array
  - [x] Each activity: `{ id, type, modelId, modelName, timestamp, description }`
  - [x] Activity types: "subscribed", "cancelled", "downloaded", "commented"
  - [x] Create 10 sample activities
  - [x] Use recent timestamps (last 7 days)

- [x] **DISPLAY Activity List**:
  - [x] Import and map over `RECENT_ACTIVITIES`
  - [x] Each activity shows:
    - Activity icon (based on type):
      - Subscribed: CheckCircle (green)
      - Cancelled: XCircle (red)
      - Downloaded: Download (blue)
      - Commented: MessageSquare (purple)
    - Activity description
    - Model name as clickable link to model details
    - Relative timestamp with helper function (e.g., "2 hours ago", "Yesterday")
  - [x] Show most recent 5 activities by default
  - [x] Add "Show More" button below the activity list
  - [x] When "Show More" is clicked, display all activities (up to 10)
  - [x] Button changes to "Show Less" after expansion
  - [x] Hover effects for better interactivity

---

### Phase 7: Buyer Marketplace - Add Subscribed Filter

**Priority**: MEDIUM

**File**: `client/src/pages/marketplace.tsx`

**Current**:
- Search and category filter work
- No filter for subscribed models

**Tasks**:
- [x] **ADD "Subscribed Models Only" Filter**:
  - [x] Add checkbox near Category filter
  - [x] Label: "Show only my subscriptions"
  - [x] Icon: CheckCircle
  - [x] Place in filter section below search and category filter (separated by border)

- [x] **IMPLEMENT Filter Logic**:
  - [x] Create state for "subscribed filter" (boolean: showSubscribedOnly)
  - [x] When checked:
    - Get user's subscribed model IDs from `SUBSCRIPTIONS` mock data
    - Filter `MODELS` to only show subscribed models
    - Show count badge: "(X subscribed)"
  - [x] When unchecked: Show all models
  - [x] Combine with existing search and category filters
  - [x] Update displayed results

- [x] **ADD Visual Indicator**:
  - [x] On model cards of subscribed models, add green badge: "Subscribed" with CheckCircle icon
  - [x] Badge appears next to category badge
  - [x] Helps user quickly identify subscriptions even when filter is off

---

### Phase 8: Buyer My Purchases - Add Section Organization

**Priority**: MEDIUM

**File**: `client/src/pages/buyer/my-purchases.tsx`

**Current**:
- Lists all subscriptions in one section
- Shows subscription dates and status badges
- Download and docs buttons work

**Tasks**:

#### 8A. Add Section Headers and Organization
- [x] **SPLIT Subscriptions into Two Sections**:
  - [x] Section 1: "Active Subscriptions"
    - Heading: "Active Subscriptions"
    - Filter `SUBSCRIPTIONS` where status === "active"
    - Display active subscriptions in this section
  - [x] Section 2: "Previous Purchases"
    - Heading: "Previous Purchases"
    - Filter `SUBSCRIPTIONS` where status === "cancelled"
    - Display cancelled subscriptions in this section
  - [x] Add visual separator (border, spacing, or divider) between sections

#### 8B. Enhance Subscription Details Display
- [x] **ADD More Date Information**:
  - [x] For Active subscriptions:
    - Show: "Subscribed on {date}"
  - [x] For Cancelled subscriptions:
    - Show: "Subscribed on {date}"
    - ADD: "Cancelled on {cancelledDate}"

- [x] **ENHANCE Status Badges**:
  - [x] Active: Green badge with checkmark
  - [x] Cancelled: Gray badge with X icon
  - [x] Pending: Outline badge with clock icon
  - [x] Make badges visually distinct

- [x] **UPDATE Mock Data** (in `mock-data.ts`):
  - [x] Add `cancelledDate` field for cancelled subscriptions
  - [x] Ensure SUBSCRIPTIONS has examples of all statuses (active, pending, cancelled)

---

### Phase 9: Buyer Settings Page - Create New Page

**Priority**: MEDIUM

**File**: `client/src/pages/buyer/settings.tsx` - **MUST CREATE THIS FILE**

**Tasks**:
- [x] **CREATE New File**: `client/src/pages/buyer/settings.tsx`

- [x] **SET UP Page Structure**:
  - [x] Import Layout component
  - [x] Use `<Layout type="dashboard">` wrapper
  - [x] Add page title: "Settings"

- [x] **CREATE Settings Form**:
  - [x] Form fields (controlled inputs):
    1. **Name** (text input)
       - Label: "Full Name"
       - Pre-fill from `CURRENT_USER.name`
    2. **Email** (email input)
       - Label: "Email Address"
       - Pre-fill from `CURRENT_USER.email`
    3. **Profile Information** (optional additional fields):
       - Company (text input, optional)
       - Phone (text input, optional)
       - Bio (textarea, optional, max 500 chars with counter)
  - [x] Buttons:
    - "Save Changes" (primary)
    - "Cancel" (secondary)

- [x] **ADD Form Functionality** (mock data):
  - [x] Create form state
  - [x] Pre-fill with `CURRENT_USER` data
  - [x] Track dirty state
  - [x] On save: Update `CURRENT_USER` or localStorage, show success toast
  - [x] On cancel: Reset form
  - [x] Disable save if no changes

- [x] **ADD to Routing**:
  - [x] In `App.tsx`, add route: `/buyer/settings`
  - [x] Import Settings component
  - [x] Verify sidebar link works

---

### Phase 10: Model Details Page - Add Missing Tabs & Fix Sections

**Priority**: CRITICAL (Missing 2 entire tabs)

**File**: `client/src/pages/model-details.tsx`

---

#### 10A. Fix Top Section - Subscription Buttons (Lines ~80-105)

**Tasks**:
- [x] **IMPLEMENT Subscription Logic - Free vs Paid**:
  - [x] Add field to mock model data: `subscriptionType: "free" | "paid"` and `subscriptionAmount: number | null`
  - [x] Check user role and subscription status to determine button behavior

  **For Publishers (viewing any model)**:
  - [x] Show button: "Preview Only - Cannot Subscribe"
  - [x] Button disabled/inactive
  - [x] Show info message: "Publishers can only preview models. Use a buyer account to subscribe."

  **For Buyers viewing FREE models**:
  - [x] If NOT subscribed:
    - [x] Button text: "Subscribe for Free"
    - [x] Button style: Primary/success color
    - [x] On click:
      - Immediately create active subscription in mock data
      - Add to user's subscriptions: `{ modelId, userId, status: 'active', subscribedAt: Date.now() }`
      - Show success toast: "Successfully subscribed to [Model Name]!"
      - Update button to show "Subscribed" (disabled, with checkmark)
      - Enable file download buttons in Files tab
  - [x] If already subscribed:
    - [x] Button text: "Subscribed ✓"
    - [x] Button disabled, success/green color
    - [x] Optional: Add "Unsubscribe" button beside it

  **For Buyers viewing PAID models**:
  - [x] If NOT subscribed:
    - [x] Button text: "Subscribe (MYR XX/mo)"
    - [x] Show subscription amount from model data
    - [x] Button style: Primary color
    - [x] On click:
      - Show toast message:
        - Title: "Paid Subscription Unavailable"
        - Message: "Payment method coming soon."
      - Do NOT create any subscription or change button state
      - Payment system will be implemented in future phase

- [x] **ADD Version to Stats Section** (Lines ~108-145):
  - [x] Add "Version" stat card alongside Accuracy and Response time
  - [x] Display model version from model data (in pricing card)
  - [x] Icon: Not needed (displayed as text in pricing card)
  - [x] Optional: Keep Rating card (kept with interactive rating feature)

---

#### 10B. Add Missing DOCS Tab (NEW Tab - Insert as Tab 2)

**Tasks**:
- [x] **ADD "Docs" Tab to Tab List** (After Overview tab):
  - [x] Tab label: "Docs"
  - [x] Insert between "Overview" and "Files" tabs

- [x] **CREATE Docs Tab Content**:
  - [x] Section heading: "API Documentation"
  - [x] Display model's API specification/documentation
  - [x] Check format and render accordingly:
    - Display in `<pre>` tag with monospace font (all formats)
  - [x] Pull from model data field: `apiDocumentation`
  - [x] If empty/null: Show message "No documentation provided for this model"

- [x] **UPDATE Mock Data** (in `mock-data.ts`):
  - [x] Ensure models have `apiDocumentation` field
  - [x] Add sample documentation for some models:
    - JSON example (OpenAPI spec snippet for m2)
    - Markdown example (formatted docs for m1)
    - Plain text example (for m4)
  - [x] Leave m3 without docs to test empty state

---

#### 10C. Add Missing STATS Tab (NEW Tab - Insert as Tab 5/Last)

**Tasks**:
- [x] **ADD "Stats" Tab to Tab List** (As last tab):
  - [x] Tab label: "Stats"
  - [x] Place after Discussion tab

- [x] **CREATE Stats Tab Content**:
  - [x] Section heading: "Model Statistics"
  - [x] Create 6 stat cards in grid layout:

  1. **Page Views (Last 30 Days)**:
     - [x] Large number display (e.g., 3,482)
     - [x] Icon: Eye
     - [x] Optional: Small trend chart (not added)

  2. **Active Subscribers**:
     - [x] Current subscription count (e.g., 127)
     - [x] Icon: Users
     - [x] Label: "Active Subscribers"

  3. **Total Subscribers (All Time)**:
     - [x] Lifetime subscription count (e.g., 215)
     - [x] Icon: TrendingUp
     - [x] Label: "Total Subscribers"

  4. **Engagement Rate**:
     - [x] Calculation: (Total Subscribers / Page Views) × 100
     - [x] Display as percentage (e.g., 6.2%)
     - [x] Icon: BarChart
     - [x] Calculated in component (no tooltip added)

  5. **Discussions**:
     - [x] Count of discussion threads (e.g., 18)
     - [x] Icon: MessageSquare
     - [x] Label: "Discussions"

  6. **Total Downloads**:
     - [x] Display total downloads
     - [x] Icon: Download
     - [x] Label: "Total Downloads"

  - [x] Style similar to dashboard stat cards
  - [x] Use grid layout (3 columns on large screens, 2 on medium, 1 on mobile)

- [x] **ADD Mock Data for Stats**:
  - [x] In `mock-data.ts`, add analytics data per model
  - [x] Add to each model object:
    - `pageViews30Days: number`
    - `activeSubscribers: number`
    - `totalSubscribers: number`
    - `discussionCount: number`
  - [x] Calculate engagement rate in component

---

#### 10D. Fix Info/Overview Tab - Add Missing Sections (Lines ~161-191)

**Current**:
- Has Key Features
- Has some technical documentation

**Tasks**:
- [x] **ADD Model Details Subsection**:
  - [x] Section heading: "Model Details"
  - [x] Display:
    - **Creator**: Show publisher name as `mailto:` link
      - Format: "Creator: Dr. Aminah Hassan"
      - Link to: `mailto:aminah@mimos.my`
    - **Collaborators**: Show as comma-separated `mailto:` links
      - Format: "Collaborators: John Doe, Jane Smith"
      - Each name links to respective email
      - If no collaborators: "No collaborators"
    - **Published On**: Date model was published
      - Format: "Published On: January 15, 2025"
    - **Last Update**: Date model was last updated
      - Format: "Last Update: March 10, 2025"
  - [x] Pull from model mock data
  - [x] Place below Technical Documentation section

- [x] **ADD Help & Report Section**:
  - [x] Section heading: "Help & Support"
  - [x] "Contact Publisher" button:
    - On click: Open mailto: link with publisher's email
    - Subject pre-filled: "Question about [Model Name]"
    - Use outline button style with Mail icon
  - [x] Optional: "Report Issue" button (not added - future feature)

- [x] **ADD Access Status Section**:
  - [x] Section heading: "Access & Pricing"
  - [x] Display subscription information:
    - If Free: Show badge "Free Subscription" with green checkmark
    - If Paid: Show badge "Paid Subscription" with price (e.g., "MYR 50.00/month")
  - [x] Add description:
    - Free: "Subscribe to access and download model files"
    - Paid: "Requires paid subscription"
  - [x] Make visually prominent (use Card component with primary accent)

---

#### 10E. Minor Tab Fixes

**Tasks**:
- [x] **FIX Discussion Tab Button Label** (Line ~251):
  - [x] Change "Start New Topic" → "+ Start Discussion"

- [x] **FIX Files Tab Name** (Tab label):
  - [x] Change "Files & SDK" → "Files"

---

### Phase 11: Discussion Forum - Add Creation Forms

**Priority**: MEDIUM

**Current**:
- Displays discussions and comments (read-only)
- "+ Start Discussion" button exists but doesn't work
- No way to add comments

**Tasks**:

#### 11A. Create Discussion Modal/Form
- [x] **CREATE Discussion Creation Modal**:
  - [x] Use Dialog or Modal component
  - [x] Triggered by "+ Start Discussion" button (in Model Details Discussion tab)
  - [x] Modal title: "Start New Discussion"

- [x] **ADD Discussion Form**:
  - [x] Form fields:
    1. Title (text input, required, max 100 chars)
       - Label: "Discussion Title"
       - Placeholder: "What would you like to discuss?"
    2. Content (textarea, required, max 2000 chars)
       - Label: "Description"
       - Placeholder: "Provide details about your question or topic..."
       - Show character counter
  - [x] Buttons:
    - "Cancel" (closes modal, resets form)
    - "Post Discussion" (submits form)

- [x] **IMPLEMENT Form Functionality**:
  - [x] On submit:
    - Create discussion object: `{ id, modelId, userId, userName, title, content, replies: [], createdAt }`
    - Add to `DISCUSSIONS` mock data array
    - Close modal
    - Clear form
    - Show success toast: "Discussion created"
    - Scroll to new discussion or refresh list
  - [x] Add validation (required fields, char limits)

#### 11B. Add Comment/Reply Form
- [x] **ADD Comment Form to Each Discussion**:
  - [x] Place below discussion content, above existing replies
  - [x] Collapsible or always visible (your choice)
  - [x] Form:
    - Textarea for comment content (max 1000 chars)
    - Label: "Add a comment" or "Reply"
    - "Cancel" and "Post Comment" buttons
    - Character counter

- [x] **IMPLEMENT Comment Functionality**:
  - [x] On submit:
    - Create comment object: `{ id, userId, userName, content, createdAt }`
    - Add to discussion's `replies` array
    - Clear textarea
    - Show success toast: "Comment added"
    - Display new comment in list

---

### Phase 12: Form Validation & User Feedback

**Priority**: HIGH

**Apply to All Forms Throughout Application**:

**Tasks**:
- [x] **ADD Field-Level Validation**:
  - [x] Model Name: Required, max 25 chars
  - [x] Description: Required, max 700 chars
  - [x] Email: Required, valid email format (regex)
  - [x] Response Time: Required, positive number
  - [x] Accuracy: Required, 0-100 range
  - [x] Version: Required
  - [x] File upload: Max 100MB (mock validation)
  - [x] Display inline error messages in red below each field
  - [x] Clear errors when user corrects input

- [x] **ADD Form-Level Validation**:
  - [x] Disable submit/next button if validation fails
  - [x] Show error summary at top if multiple errors: "Please fix 3 errors to continue"
  - [x] Highlight invalid fields with red border

- [x] **ADD Success Feedback (Toasts)**:
  - [x] Use existing `useToast` hook or toast system
  - [x] Show success messages for:
    - Model created: "Model created successfully"
    - Settings saved: "Settings updated"
    - Subscribed: "Successfully subscribed to [Model Name]"
    - Discussion posted: "Discussion created"
    - Comment added: "Comment posted"
  - [x] Show error toasts for failures:
    - "Failed to save settings. Please try again."
    - "Error creating model. Check required fields."

- [x] **ADD Loading States**:
  - [x] During form submission: Show spinner on submit button, disable button
  - [x] Change button text: "Saving..." or "Creating..."
  - [x] Prevent double-submission

---

### Phase 13: Empty States & Loading States

**Priority**: MEDIUM

#### 13A. Enhance Empty States
**Current**:
- "No models found" exists in My Models

**Tasks**:
- [x] **ADD More Empty States Across App**:
  - [x] My Purchases (Buyer):
    - "No subscriptions yet"
    - "Subscribe to models to see them here"
    - "Browse Marketplace" button
  - [x] Discussion tab (Model Details):
    - "No discussions yet"
    - "Be the first to start a discussion"
    - "+ Start Discussion" button
  - [x] Files tab (Model Details):
    - "No files available"
    - "Subscribe to access model files" (if not subscribed)
  - [x] Recent Activity (Buyer Dashboard):
    - "No recent activity"
    - "Your actions will appear here"
  - [x] Each empty state should have:
    - Friendly icon (from lucide-react)
    - Clear message
    - Optional CTA button

#### 13B. Add Loading States
- [x] **ADD Loading Indicators**:
  - [x] While "fetching" data (with mock delay):
    - Show skeleton loaders for cards/lists
    - Use Spinner component for small elements
    - Show page-level loading for route transitions
  - [x] File upload progress bar (mock for now)
  - [x] Button loading states (spinner + disabled)

---

### Phase 14: Mobile Responsiveness

**Priority**: MEDIUM

**What's Mostly Working**:
- Navbar mobile menu
- Basic grid layouts responsive

**Tasks**:
- [ ] **Test and Fix Sidebar on Mobile**:
  - [ ] Sidebar should be hidden by default on mobile
  - [ ] Add hamburger menu icon in navbar (top left) on mobile
  - [ ] Sidebar slides in from left when hamburger clicked
  - [ ] Backdrop/overlay when sidebar open
  - [ ] Close sidebar when clicking outside or selecting nav item
  - [ ] User info section should display properly in mobile sidebar

- [ ] **Test Tables on Mobile**:
  - [ ] Analytics tables: Enable horizontal scroll or convert to card view
  - [ ] My Models table: Consider card view on mobile (stacked layout)
  - [ ] Ensure table headers and data readable

- [ ] **Test Forms on Mobile**:
  - [ ] Create Model form: Proper spacing, full-width inputs
  - [ ] Settings forms: Stack vertically, adequate touch targets
  - [ ] Form buttons stack vertically or full width

- [ ] **Test Charts on Mobile**:
  - [ ] Pie chart and bar chart resize properly
  - [ ] Labels remain legible
  - [ ] Touch interactions work

- [ ] **Test Model Cards Grid**:
  - [ ] Desktop: 3 columns
  - [ ] Tablet: 2 columns
  - [ ] Mobile: 1 column
  - [ ] Proper spacing maintained

---

### Phase 15: Mock Data Enhancements

**Priority**: MEDIUM (Better testing experience)

**File**: `client/src/lib/mock-data.ts`

**Tasks**:
- [ ] **Expand Existing Mock Data**:
  - [ ] Add more models (total 20-30 models)
  - [ ] Variety of categories, statuses, subscription types
  - [ ] Realistic names, descriptions, stats

- [ ] **Add New Mock Data Arrays**:
  - [ ] `MODEL_SUBSCRIBERS` - for Publisher Analytics table (8-12 entries)
  - [ ] `RECENT_ACTIVITIES` - for Buyer Dashboard (10-15 entries)
  - [ ] `PUBLISHERS` - for Collaborator dropdown (5-10 publishers)
  - [ ] Expand `DISCUSSIONS` - more threads and replies

- [ ] **Add Missing Fields to Models**:
  - [ ] `version` field (e.g., "1.0.0", "v2.1")
  - [ ] `subscriptionType` field ("free" or "paid")
  - [ ] `subscriptionAmount` field (for paid models)
  - [ ] `apiDocumentation` field (sample docs)
  - [ ] `pageViews30Days` field
  - [ ] `activeSubscribers` field
  - [ ] `totalSubscribers` field
  - [ ] `discussionCount` field
  - [ ] `features` array (list of feature strings)

- [ ] **Add Missing Fields to Subscriptions**:
  - [ ] `expiryDate` for expired subscriptions
  - [ ] `cancelledDate` for cancelled subscriptions
  - [ ] Mix of active, expired, cancelled statuses

- [ ] **Ensure Data Consistency**:
  - [ ] Subscription `modelId` references actual model IDs
  - [ ] Activity `modelId` references actual models
  - [ ] Subscriber data references actual models
  - [ ] Dates are realistic and recent
  - [ ] All required fields present

---

### Phase 16: Final Frontend Testing with Mock Data

**Priority**: HIGH (Before moving to backend)

**Complete Manual Testing of All Flows**:

#### Publisher Flow
- [ ] **Login as Publisher**:
  - [ ] Login works, redirects to publisher dashboard
- [ ] **Analytics Dashboard**:
  - [ ] All 3 stat cards display correct mock data
  - [ ] Both charts render without errors
  - [ ] Both tables display with correct columns
  - [ ] Model Subscribers table shows data
- [ ] **Marketplace**:
  - [ ] Can search models by name
  - [ ] Can filter by category
  - [ ] Preview message displays
  - [ ] Cannot subscribe (correct behavior)
- [ ] **My Models**:
  - [ ] Overview cards show correct counts
  - [ ] Can search models
  - [ ] Can filter by category and status
  - [ ] Can create new model (all tabs work)
  - [ ] All fields in Create Model work and validate
  - [ ] Can edit/view/delete models (if implemented)
- [ ] **Settings**:
  - [ ] Page loads
  - [ ] Form pre-fills with user data
  - [ ] Can save changes
  - [ ] Toast appears on save
- [ ] **Sidebar**:
  - [ ] User info displays correctly
  - [ ] All navigation links work
  - [ ] Logout works

#### Buyer Flow
- [ ] **Login as Buyer**:
  - [ ] Login works, redirects to buyer dashboard
- [ ] **Dashboard**:
  - [ ] Correct stat cards display
  - [ ] Quick Actions section present with working links
  - [ ] Recent Activity section displays activities
- [ ] **Marketplace**:
  - [ ] Can search and filter
  - [ ] "Subscribed" filter works
  - [ ] Can view model details
- [ ] **Model Details**:
  - [ ] All 5 tabs present (Overview, Docs, Discussion, Files, Stats)
  - [ ] Subscribe button works (free models)
  - [ ] Paid model shows approval message
  - [ ] Files accessible based on subscription
  - [ ] Can create discussion
  - [ ] Can add comments
  - [ ] Stats tab displays analytics
- [ ] **My Purchases**:
  - [ ] Active and Previous sections separated
  - [ ] Dates display correctly
  - [ ] Status badges colored correctly
  - [ ] Download buttons work for active subscriptions
- [ ] **Settings**:
  - [ ] Page loads and works
- [ ] **Sidebar**:
  - [ ] User info displays
  - [ ] Navigation works
  - [ ] Logout works

#### General Testing
- [ ] **Mobile Responsive**:
  - [ ] Test on mobile device or DevTools device mode
  - [ ] Sidebar hamburger menu works
  - [ ] All pages readable and functional
  - [ ] Forms usable on mobile
- [ ] **Console Errors**:
  - [ ] No errors in browser console
  - [ ] No React warnings
- [ ] **Links & Navigation**:
  - [ ] All internal links work
  - [ ] mailto: links open email client
  - [ ] Back/forward browser buttons work
- [ ] **Forms & Validation**:
  - [ ] All forms validate properly
  - [ ] Error messages display
  - [ ] Success toasts appear
  - [ ] Character counters update
- [ ] **Mock Data**:
  - [ ] All data displays correctly
  - [ ] No missing data errors
  - [ ] Relationships between data work (e.g., subscriptions link to models)

---

## PART B: BACKEND MIGRATION TO SUPABASE

**Only start this after completing ALL frontend fixes (Phases 1-16)**

**Strategy**: Migrate from Drizzle ORM + Passport.js to Supabase (PostgreSQL + Auth + Storage)

---

### Phase 17: Supabase Project Setup

**Priority**: CRITICAL - Foundation for backend

**Tasks**:

#### 17A. Create Supabase Project
- [ ] **Sign up for Supabase**:
  - [ ] Go to https://supabase.com
  - [ ] Create account or sign in
  - [ ] Click "New Project"
  - [ ] Choose organization or create new one

- [ ] **Configure Project**:
  - [ ] Project name: "MIMOS AI Marketplace" or similar
  - [ ] Database password: Generate strong password, save securely
  - [ ] Region: Choose closest to Malaysia (Singapore recommended)
  - [ ] Pricing plan: Free tier for development, Pro for production
  - [ ] Wait for project to be provisioned (~2 minutes)

- [ ] **Collect Project Credentials**:
  - [ ] Go to Project Settings > API
  - [ ] Copy **Project URL** (e.g., https://xxxxx.supabase.co)
  - [ ] Copy **anon/public key** (safe to use in frontend)
  - [ ] Copy **service_role key** (keep secret, server-side only)
  - [ ] Save all credentials securely (password manager recommended)

#### 17B. Environment Configuration
- [ ] **Create Environment File**:
  - [ ] Create `.env.local` file in project root (or `.env`)
  - [ ] Add to `.gitignore` if not already there
  - [ ] Add variables:
    ```env
    VITE_SUPABASE_URL=your_project_url_here
    VITE_SUPABASE_ANON_KEY=your_anon_key_here
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
    ```
  - [ ] Replace placeholder values with actual credentials
  - [ ] Verify `.env.local` is in `.gitignore`

- [ ] **Create Example Environment File**:
  - [ ] Create `.env.example` file
  - [ ] Add variable names without values:
    ```env
    VITE_SUPABASE_URL=
    VITE_SUPABASE_ANON_KEY=
    SUPABASE_SERVICE_ROLE_KEY=
    ```
  - [ ] Commit `.env.example` to git (safe to share)

#### 17C. Install Supabase Client
- [ ] **Install Package**:
  - [ ] Run: `npm install @supabase/supabase-js`
  - [ ] Verify installation in `package.json`

- [ ] **Create Supabase Client File**:
  - [ ] Create `client/src/lib/supabase.ts`
  - [ ] Initialize Supabase client:
    ```typescript
    import { createClient } from '@supabase/supabase-js'

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey)
    ```
  - [ ] Export client for use throughout app

- [ ] **Test Connection**:
  - [ ] Import supabase client in a test file
  - [ ] Try simple query: `await supabase.from('test').select('*')`
  - [ ] Should return empty array or error (table doesn't exist yet)
  - [ ] Verify no credential errors

#### 17D. Remove Old Dependencies
- [ ] **Uninstall Drizzle ORM** (after migration complete):
  - [ ] `npm uninstall drizzle-orm drizzle-kit`
  - [ ] Delete `drizzle.config.ts` if exists
  - [ ] Delete any Drizzle schema files

- [ ] **Uninstall Passport.js** (after auth migration):
  - [ ] `npm uninstall passport passport-local express-session`
  - [ ] `npm uninstall @types/passport @types/passport-local @types/express-session`
  - [ ] Delete server auth files using Passport

- [ ] **Clean Package.json**:
  - [ ] Remove any unused dependencies
  - [ ] Run `npm install` to update lock file

---

### Phase 18: Database Schema Creation

**Priority**: CRITICAL - Data structure foundation

**Use Supabase SQL Editor** for all table creation

#### 18A. Enable UUID Extension
- [ ] **Enable Extension**:
  - [ ] Go to Supabase Dashboard > SQL Editor
  - [ ] Run SQL:
    ```sql
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    ```
  - [ ] Verify: No errors returned

#### 18B. Create Users and Roles Tables (Multi-Role Support)

**Important**: Users can have BOTH buyer AND publisher roles simultaneously.

- [ ] **Create Users Table**:
  ```sql
  CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- [ ] **Add Indexes to Users**:
  ```sql
  CREATE INDEX users_email_idx ON users(email);
  ```

- [ ] **Create Roles Table**:
  ```sql
  CREATE TABLE roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE CHECK (role_name IN ('buyer', 'publisher')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- [ ] **Insert Default Roles**:
  ```sql
  INSERT INTO roles (role_name) VALUES ('buyer'), ('publisher');
  ```

- [ ] **Create User_Roles Junction Table**:
  ```sql
  CREATE TABLE user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
  );
  ```

- [ ] **Add Indexes to User_Roles**:
  ```sql
  CREATE INDEX user_roles_user_id_idx ON user_roles(user_id);
  CREATE INDEX user_roles_role_id_idx ON user_roles(role_id);
  ```

- [ ] **Create Helper View for User Roles** (optional but useful):
  ```sql
  CREATE VIEW user_roles_view AS
  SELECT
    u.id as user_id,
    u.name,
    u.email,
    r.role_name,
    ur.created_at as role_assigned_at
  FROM users u
  JOIN user_roles ur ON u.id = ur.user_id
  JOIN roles r ON ur.role_id = r.role_id;
  ```

- [ ] **Verify**:
  - [ ] Query `SELECT * FROM users;` returns empty set
  - [ ] Query `SELECT * FROM roles;` returns 2 rows (buyer, publisher)
  - [ ] Query `SELECT * FROM user_roles;` returns empty set

#### 18C. Create Models Table
- [ ] **Create Table**:
  ```sql
  CREATE TABLE models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model_name TEXT NOT NULL,
    description TEXT NOT NULL,
    categories TEXT[] NOT NULL,
    version TEXT NOT NULL,
    features TEXT[],
    response_time INTEGER NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    api_documentation TEXT,
    publisher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'paid')),
    subscription_amount DECIMAL(10,2),
    view_count INTEGER DEFAULT 0,
    published_on TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] **Add Indexes**:
  ```sql
  CREATE INDEX models_publisher_id_idx ON models(publisher_id);
  CREATE INDEX models_status_idx ON models(status);
  CREATE INDEX models_subscription_type_idx ON models(subscription_type);
  CREATE INDEX models_created_at_idx ON models(created_at DESC);
  ```
- [ ] **Verify**: Query `SELECT * FROM models;` works

#### 18D. Create Model_Files Table
- [ ] **Create Table**:
  ```sql
  CREATE TABLE model_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('upload', 'external_url')),
    file_url TEXT NOT NULL,
    description TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] **Add Indexes**:
  ```sql
  CREATE INDEX model_files_model_id_idx ON model_files(model_id);
  ```

#### 18E. Create Collaborators Table
- [ ] **Create Table**:
  ```sql
  CREATE TABLE collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model_id, user_id)
  );
  ```
- [ ] **Add Indexes**:
  ```sql
  CREATE INDEX collaborators_model_id_idx ON collaborators(model_id);
  CREATE INDEX collaborators_user_id_idx ON collaborators(user_id);
  ```

#### 18F. Create Subscriptions Table
- [ ] **Create Table**:
  ```sql
  CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(buyer_id, model_id)
  );
  ```
- [ ] **Add Indexes**:
  ```sql
  CREATE INDEX subscriptions_buyer_id_idx ON subscriptions(buyer_id);
  CREATE INDEX subscriptions_model_id_idx ON subscriptions(model_id);
  CREATE INDEX subscriptions_status_idx ON subscriptions(status);
  ```

#### 18G. Create Discussions Table
- [ ] **Create Table**:
  ```sql
  CREATE TABLE discussions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] **Add Indexes**:
  ```sql
  CREATE INDEX discussions_model_id_idx ON discussions(model_id);
  CREATE INDEX discussions_created_at_idx ON discussions(created_at DESC);
  ```

#### 18H. Create Comments Table
- [ ] **Create Table**:
  ```sql
  CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] **Add Indexes**:
  ```sql
  CREATE INDEX comments_discussion_id_idx ON comments(discussion_id);
  CREATE INDEX comments_created_at_idx ON comments(created_at ASC);
  ```

#### 18I. Create Activity_Log Table
- [ ] **Create Table**:
  ```sql
  CREATE TABLE activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('subscribed', 'cancelled', 'downloaded', 'commented', 'published')),
    model_id UUID REFERENCES models(id) ON DELETE SET NULL,
    model_name TEXT,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] **Add Indexes**:
  ```sql
  CREATE INDEX activity_log_user_id_idx ON activity_log(user_id);
  CREATE INDEX activity_log_timestamp_idx ON activity_log(timestamp DESC);
  ```

#### 18J. Create Views Table (for tracking)
- [ ] **Create Table**:
  ```sql
  CREATE TABLE views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] **Add Indexes**:
  ```sql
  CREATE INDEX views_model_id_idx ON views(model_id);
  CREATE INDEX views_timestamp_idx ON views(timestamp DESC);
  ```

#### 18K. Create Updated_At Trigger
- [ ] **Create Trigger Function**:
  ```sql
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```
- [ ] **Apply Trigger to Tables**:
  ```sql
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  ```

#### 18L. Verify Schema
- [ ] **Test All Tables**:
  - [ ] Run `SELECT * FROM users;` - should work
  - [ ] Run `SELECT * FROM roles;` - should return 2 rows
  - [ ] Run `SELECT * FROM user_roles;` - should work
  - [ ] Run `SELECT * FROM models;` - should work
  - [ ] Run `SELECT * FROM subscriptions;` - should work
  - [ ] Verify all 12 tables exist in Supabase Dashboard > Table Editor (users, roles, user_roles, models, model_files, collaborators, subscriptions, discussions, comments, activity_log, views)

---

### Phase 19: Row Level Security (RLS) Policies

**Priority**: CRITICAL - Security foundation

**Enable RLS on all tables first, then add policies**

#### 19A. Enable RLS on All Tables
- [ ] **Enable RLS**:
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE models ENABLE ROW LEVEL SECURITY;
  ALTER TABLE model_files ENABLE ROW LEVEL SECURITY;
  ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
  ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
  ALTER TABLE views ENABLE ROW LEVEL SECURITY;
  ```

#### 19B. Users, Roles, and User_Roles Table Policies
- [ ] **Users Read Policy** (Anyone can read user profiles):
  ```sql
  CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);
  ```
- [ ] **Users Insert Policy** (Users can insert their own profile):
  ```sql
  CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);
  ```
- [ ] **Users Update Policy** (Users can update their own profile):
  ```sql
  CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);
  ```

- [ ] **Roles Read Policy** (Anyone can read roles):
  ```sql
  CREATE POLICY "Roles are viewable by everyone"
    ON roles FOR SELECT
    USING (true);
  ```

- [ ] **User_Roles Read Policy** (Anyone can see user role assignments):
  ```sql
  CREATE POLICY "User roles are viewable by everyone"
    ON user_roles FOR SELECT
    USING (true);
  ```
- [ ] **User_Roles Insert Policy** (Users can add their own roles):
  ```sql
  CREATE POLICY "Users can add their own roles"
    ON user_roles FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  ```
- [ ] **User_Roles Delete Policy** (Users can remove their own roles):
  ```sql
  CREATE POLICY "Users can remove their own roles"
    ON user_roles FOR DELETE
    USING (auth.uid() = user_id);
  ```

#### 19C. Models Table Policies
- [ ] **Read Policy** (Anyone can read published models):
  ```sql
  CREATE POLICY "Published models are viewable by everyone"
    ON models FOR SELECT
    USING (status = 'published' OR publisher_id = auth.uid());
  ```
- [ ] **Insert Policy** (Publishers can create models):
  ```sql
  CREATE POLICY "Publishers can create models"
    ON models FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.role_name = 'publisher'
      )
    );
  ```
- [ ] **Update Policy** (Publishers can update own models):
  ```sql
  CREATE POLICY "Publishers can update own models"
    ON models FOR UPDATE
    USING (publisher_id = auth.uid());
  ```
- [ ] **Delete Policy** (Publishers can delete own models):
  ```sql
  CREATE POLICY "Publishers can delete own models"
    ON models FOR DELETE
    USING (publisher_id = auth.uid());
  ```

#### 19D. Model_Files Table Policies
- [ ] **Read Policy** (Files visible based on subscription):
  ```sql
  CREATE POLICY "Model files are viewable by subscribers and owners"
    ON model_files FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM models m
        WHERE m.id = model_files.model_id
        AND (
          m.publisher_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.model_id = m.id
            AND s.buyer_id = auth.uid()
            AND s.status = 'active'
          )
        )
      )
    );
  ```
- [ ] **Insert/Update/Delete Policies** (Only model owner):
  ```sql
  CREATE POLICY "Model owners can manage files"
    ON model_files FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM models
        WHERE id = model_files.model_id
        AND publisher_id = auth.uid()
      )
    );
  ```

#### 19E. Subscriptions Table Policies
- [ ] **Read Policy** (Users see own subscriptions, publishers see subscriptions to their models):
  ```sql
  CREATE POLICY "Users can view relevant subscriptions"
    ON subscriptions FOR SELECT
    USING (
      buyer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM models
        WHERE models.id = subscriptions.model_id
        AND models.publisher_id = auth.uid()
      )
    );
  ```
- [ ] **Insert Policy** (Buyers can create subscriptions):
  ```sql
  CREATE POLICY "Buyers can create subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (
      buyer_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND user_type = 'buyer'
      )
    );
  ```
- [ ] **Update Policy** (Publishers can approve, buyers can cancel):
  ```sql
  CREATE POLICY "Publishers can approve, buyers can cancel"
    ON subscriptions FOR UPDATE
    USING (
      buyer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM models
        WHERE models.id = subscriptions.model_id
        AND models.publisher_id = auth.uid()
      )
    );
  ```
- [ ] **Delete Policy** (Buyers can delete own subscriptions):
  ```sql
  CREATE POLICY "Buyers can delete own subscriptions"
    ON subscriptions FOR DELETE
    USING (buyer_id = auth.uid());
  ```

#### 19F. Discussions & Comments Policies
- [ ] **Discussions Read Policy** (Anyone can read):
  ```sql
  CREATE POLICY "Discussions are public"
    ON discussions FOR SELECT
    USING (true);
  ```
- [ ] **Discussions Insert Policy** (Authenticated users can create):
  ```sql
  CREATE POLICY "Authenticated users can create discussions"
    ON discussions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  ```
- [ ] **Comments Policies** (Same as discussions):
  ```sql
  CREATE POLICY "Comments are public"
    ON comments FOR SELECT
    USING (true);

  CREATE POLICY "Authenticated users can create comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  ```

#### 19G. Activity_Log & Views Policies
- [ ] **Activity Log Policies**:
  ```sql
  CREATE POLICY "Users can view own activity"
    ON activity_log FOR SELECT
    USING (user_id = auth.uid());

  CREATE POLICY "Users can log own activity"
    ON activity_log FOR INSERT
    WITH CHECK (user_id = auth.uid());
  ```
- [ ] **Views Policies** (Anyone can track views):
  ```sql
  CREATE POLICY "Anyone can track views"
    ON views FOR INSERT
    WITH CHECK (true);
  ```

#### 19H. Test RLS Policies
- [ ] **Test as Anonymous User**:
  - [ ] Try to read profiles - should work
  - [ ] Try to read published models - should work
  - [ ] Try to create model - should fail
- [ ] **Test as Authenticated Publisher**:
  - [ ] Can create models
  - [ ] Can update own models
  - [ ] Cannot update other's models
- [ ] **Test as Authenticated Buyer**:
  - [ ] Can create subscriptions
  - [ ] Can see own subscriptions only
  - [ ] Can see files of subscribed models only

---

### Phase 20: Supabase Storage Setup

**Priority**: HIGH - File upload/download

#### 20A. Create Storage Bucket
- [ ] **Create Bucket**:
  - [ ] Go to Supabase Dashboard > Storage
  - [ ] Click "New Bucket"
  - [ ] Bucket name: `model-files`
  - [ ] Make bucket **Private** (not public)
  - [ ] File size limit: 100MB (set in bucket settings)
  - [ ] Allowed MIME types: Leave empty or specify (e.g., application/*, model/*)

#### 20B. Configure Storage Policies
- [ ] **Upload Policy** (Publishers can upload to their models):
  ```sql
  CREATE POLICY "Publishers can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'model-files'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  ```
- [ ] **Read Policy** (Subscribed buyers and publishers can download):
  ```sql
  CREATE POLICY "Subscribers can download files"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'model-files'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR EXISTS (
          SELECT 1 FROM subscriptions s
          JOIN model_files mf ON mf.model_id = s.model_id
          WHERE s.buyer_id = auth.uid()
          AND s.status = 'active'
          AND mf.file_url LIKE '%' || name || '%'
        )
      )
    );
  ```
- [ ] **Delete Policy** (Publishers can delete own files):
  ```sql
  CREATE POLICY "Publishers can delete own files"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'model-files'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  ```

#### 20C. Test Storage
- [ ] **Test File Upload**:
  - [ ] Use Supabase client to upload test file
  - [ ] Verify file appears in Storage dashboard
  - [ ] Verify file path structure: `model-files/{publisher_id}/{model_id}/{filename}`
- [ ] **Test File Download**:
  - [ ] Generate signed URL for file
  - [ ] Verify URL works in browser
  - [ ] Verify URL expires after set time
- [ ] **Test Access Control**:
  - [ ] Unauthenticated user cannot download
  - [ ] Non-subscriber cannot download
  - [ ] Subscriber can download

---

### Phase 21: Authentication Migration

**Priority**: CRITICAL - User access foundation

#### 21A. Configure Supabase Auth
- [ ] **Email Auth Settings**:
  - [ ] Go to Supabase Dashboard > Authentication > Settings
  - [ ] Enable Email provider (should be enabled by default)
  - [ ] Email confirmation: Enable for production, disable for development
  - [ ] Configure email templates (welcome, reset password, etc.)

- [ ] **Google OAuth Setup**:
  - [ ] Go to Google Cloud Console (console.cloud.google.com)
  - [ ] Create new project or select existing
  - [ ] Enable Google+ API
  - [ ] Create OAuth 2.0 credentials:
    - [ ] Application type: Web application
    - [ ] Authorized redirect URIs: Add Supabase callback URL
    - [ ] Copy Client ID and Client Secret
  - [ ] In Supabase Dashboard > Authentication > Providers:
    - [ ] Enable Google provider
    - [ ] Paste Client ID and Client Secret
    - [ ] Save configuration

#### 21B. Update Auth Page (client/src/pages/auth.tsx)
- [ ] **Remove Old Auth Logic**:
  - [ ] Remove localStorage role storage
  - [ ] Remove mock authentication
  - [ ] Keep UI structure (tabs for buyer/publisher, login/registration toggle)

- [ ] **Implement Supabase Auth - Registration (Multi-Role Support)**:
  ```typescript
  const handleRegister = async (email: string, password: string, selectedRole: 'buyer' | 'publisher', name: string) => {
    // Step 1: Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // Step 2: Check if user already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Step 3: Create user record if doesn't exist
      if (!existingUser) {
        await supabase.from('users').insert({
          id: data.user.id,
          name: name,
          email: email
        });
      }

      // Step 4: Get role ID
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', selectedRole)
        .single();

      if (!role) throw new Error('Role not found');

      // Step 5: Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('role_id', role.id)
        .single();

      // Step 6: Add role if doesn't exist
      if (!existingRole) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role_id: role.id
        });
      } else {
        throw new Error(`You already have a ${selectedRole} account. Please login instead.`);
      }

      // Step 7: Store current role in session/localStorage for routing
      localStorage.setItem('currentRole', selectedRole);
    }
  };
  ```

- [ ] **Implement Supabase Auth - Login (Multi-Role Support)**:
  ```typescript
  const handleLogin = async (email: string, password: string, selectedRole: 'buyer' | 'publisher') => {
    // Step 1: Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Step 2: Get role ID
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', selectedRole)
      .single();

    if (!role) throw new Error('Role not found');

    // Step 3: Check if user has the selected role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', data.user.id)
      .eq('role_id', role.id)
      .single();

    if (!userRole) {
      // User doesn't have this role
      await supabase.auth.signOut();
      throw new Error(`No ${selectedRole} account found for this email. Please check your account type or register.`);
    }

    // Step 4: Store current role in localStorage for app routing
    localStorage.setItem('currentRole', selectedRole);

    // Step 5: Redirect based on role
    if (selectedRole === 'publisher') {
      navigate('/publisher/dashboard');
    } else {
      navigate('/buyer/dashboard');
    }
  };
  ```

- [ ] **Implement Google OAuth**:
  ```typescript
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };
  ```

#### 21C. Create Auth Callback Handler (OAuth - Multi-Role Support)
- [ ] **Create Auth Callback Page** (`client/src/pages/auth-callback.tsx`):
  ```typescript
  // Handle OAuth redirect
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Check if user exists in users table
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!user) {
          // First time OAuth login - create user and show role selection
          await supabase.from('users').insert({
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
            email: session.user.email
          });

          // Redirect to role selection page
          navigate('/auth/select-role');
        } else {
          // Existing user - check roles
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select(`
              roles (
                role_name
              )
            `)
            .eq('user_id', session.user.id);

          if (!userRoles || userRoles.length === 0) {
            // User exists but has no roles - show role selection
            navigate('/auth/select-role');
          } else if (userRoles.length === 1) {
            // User has one role - redirect to appropriate portal
            const roleName = userRoles[0].roles.role_name;
            localStorage.setItem('currentRole', roleName);
            navigate(roleName === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard');
          } else {
            // User has both roles - show role selection modal
            navigate('/auth/select-role');
          }
        }
      }
    });
  }, []);
  ```

- [ ] **Create Role Selection Page** (`client/src/pages/auth/select-role.tsx`):
  ```typescript
  // Page shown when OAuth user needs to select their role
  const SelectRolePage = () => {
    const [, setLocation] = useLocation();

    const selectRole = async (roleName: 'buyer' | 'publisher') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get role ID
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', roleName)
        .single();

      if (!role) return;

      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role_id', role.id)
        .single();

      // Add role if doesn't exist
      if (!existingRole) {
        await supabase.from('user_roles').insert({
          user_id: user.id,
          role_id: role.id
        });
      }

      // Store current role and redirect
      localStorage.setItem('currentRole', roleName);
      setLocation(roleName === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard');
    };

    return (
      <div className="role-selection-container">
        <h1>Select Your Account Type</h1>
        <div className="role-cards">
          <button onClick={() => selectRole('buyer')}>
            I'm a Buyer
            <p>Browse and subscribe to AI models</p>
          </button>
          <button onClick={() => selectRole('publisher')}>
            I'm a Publisher
            <p>Upload and manage AI models</p>
          </button>
        </div>
      </div>
    );
  };
  ```

#### 21D. Create Auth Context/Provider (Multi-Role Support)
- [ ] **Create Auth Context** (`client/src/contexts/AuthContext.tsx`):
  ```typescript
  export const AuthContext = createContext({});

  export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [currentRole, setCurrentRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        }
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setUserProfile(null);
          setUserRoles([]);
          setCurrentRole(null);
        }
      });

      return () => subscription.unsubscribe();
    }, []);

    const fetchUserData = async (userId) => {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      setUserProfile(profile);

      // Fetch user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select(`
          roles (
            role_name
          )
        `)
        .eq('user_id', userId);

      const roleNames = roles?.map(r => r.roles.role_name) || [];
      setUserRoles(roleNames);

      // Get current role from localStorage or default to first role
      const storedRole = localStorage.getItem('currentRole');
      if (storedRole && roleNames.includes(storedRole)) {
        setCurrentRole(storedRole);
      } else if (roleNames.length > 0) {
        setCurrentRole(roleNames[0]);
        localStorage.setItem('currentRole', roleNames[0]);
      }
    };

    const switchRole = (newRole: 'buyer' | 'publisher') => {
      if (userRoles.includes(newRole)) {
        setCurrentRole(newRole);
        localStorage.setItem('currentRole', newRole);
        // Redirect to appropriate portal
        window.location.href = newRole === 'publisher' ? '/publisher/dashboard' : '/buyer/dashboard';
      }
    };

    return (
      <AuthContext.Provider value={{
        user,
        userProfile,
        userRoles,
        currentRole,
        loading,
        switchRole
      }}>
        {children}
      </AuthContext.Provider>
    );
  }
  ```

- [ ] **Wrap App with AuthProvider**:
  - [ ] In `client/src/main.tsx` or `App.tsx`
  - [ ] Wrap `<App>` with `<AuthProvider>`

#### 21E. Implement Protected Routes
- [ ] **Create ProtectedRoute Component**:
  ```typescript
  function ProtectedRoute({ children, allowedTypes }) {
    const { user, profile, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/auth" />;
    if (allowedTypes && !allowedTypes.includes(profile?.user_type)) {
      return <Navigate to="/" />;
    }

    return children;
  }
  ```

- [ ] **Update Routes**:
  - [ ] Wrap publisher routes with `<ProtectedRoute allowedTypes={['publisher']}>`
  - [ ] Wrap buyer routes with `<ProtectedRoute allowedTypes={['buyer']}>`

#### 21F. Update CURRENT_USER Mock Data Usage
- [ ] **Replace CURRENT_USER with useAuth**:
  - [ ] In Navbar: Use `const { profile } = useAuth()`
  - [ ] In Sidebar: Use `const { profile } = useAuth()`
  - [ ] In Settings pages: Use `const { profile } = useAuth()`
  - [ ] Remove all imports of CURRENT_USER from mock-data.ts

---

### Phase 22: Data Migration & API Integration

**Priority**: HIGH - Connect UI to database

#### 22A. Models Data Integration

**File**: Update all pages that fetch/display models

- [ ] **Fetch Models for Marketplace**:
  ```typescript
  const fetchModels = async () => {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };
  ```

- [ ] **Fetch Publisher's Models** (My Models page):
  ```typescript
  const { data } = await supabase
    .from('models')
    .select('*')
    .eq('publisher_id', user.id)
    .order('created_at', { ascending: false });
  ```

- [ ] **Fetch Single Model** (Model Details):
  ```typescript
  const { data } = await supabase
    .from('models')
    .select(`
      *,
      publisher:profiles!publisher_id(name, email),
      files:model_files(*),
      collaborators(*)
    `)
    .eq('id', modelId)
    .single();
  ```

- [ ] **Create Model**:
  ```typescript
  const { data, error } = await supabase
    .from('models')
    .insert({
      model_name: formData.name,
      description: formData.description,
      categories: formData.categories,
      version: formData.version,
      features: formData.features,
      response_time: formData.responseTime,
      accuracy: formData.accuracy,
      api_documentation: formData.apiDocs,
      publisher_id: user.id,
      status: 'draft',
      subscription_type: formData.subscriptionType
    })
    .select()
    .single();
  ```

- [ ] **Update Model**:
  ```typescript
  const { error } = await supabase
    .from('models')
    .update(updatedData)
    .eq('id', modelId);
  ```

- [ ] **Delete Model**:
  ```typescript
  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', modelId);
  ```

#### 22B. Subscriptions Integration

- [ ] **Create Subscription** (Subscribe button):
  ```typescript
  const handleSubscribe = async (modelId) => {
    // Check if model is free or paid
    const { data: model } = await supabase
      .from('models')
      .select('subscription_type')
      .eq('id', modelId)
      .single();

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        buyer_id: user.id,
        model_id: modelId,
        status: model.subscription_type === 'free' ? 'active' : 'pending',
        approved_at: model.subscription_type === 'free' ? new Date().toISOString() : null
      })
      .select()
      .single();

    // Log activity
    await logActivity('subscribed', modelId);
  };
  ```

- [ ] **Fetch User Subscriptions** (My Purchases):
  ```typescript
  const { data } = await supabase
    .from('subscriptions')
    .select(`
      *,
      model:models(*)
    `)
    .eq('buyer_id', user.id)
    .order('subscribed_at', { ascending: false });
  ```

- [ ] **Approve Subscription** (Publisher analytics):
  ```typescript
  const approveSubscription = async (subscriptionId) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        approved_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);
  };
  ```

- [ ] **Cancel Subscription**:
  ```typescript
  const cancelSubscription = async (subscriptionId) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);
  };
  ```

#### 22C. Discussions & Comments Integration

- [ ] **Fetch Discussions**:
  ```typescript
  const { data } = await supabase
    .from('discussions')
    .select(`
      *,
      comments(*)
    `)
    .eq('model_id', modelId)
    .order('created_at', { ascending: false });
  ```

- [ ] **Create Discussion**:
  ```typescript
  const { data, error } = await supabase
    .from('discussions')
    .insert({
      model_id: modelId,
      user_id: user.id,
      user_name: profile.name,
      title: formData.title,
      content: formData.content
    })
    .select()
    .single();
  ```

- [ ] **Create Comment**:
  ```typescript
  const { data, error } = await supabase
    .from('comments')
    .insert({
      discussion_id: discussionId,
      user_id: user.id,
      user_name: profile.name,
      content: commentText
    })
    .select()
    .single();
  ```

#### 22D. Analytics Integration

- [ ] **Fetch Publisher Analytics**:
  ```typescript
  // Total models
  const { count: totalModels } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true })
    .eq('publisher_id', user.id);

  // Total views
  const { count: totalViews } = await supabase
    .from('views')
    .select('*', { count: 'exact', head: true })
    .in('model_id', publisherModelIds);

  // Active subscriptions
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .in('model_id', publisherModelIds)
    .eq('status', 'active');

  // Model subscribers (for table)
  const { data: subscribers } = await supabase
    .from('subscriptions')
    .select(`
      *,
      buyer:profiles!buyer_id(name, email),
      model:models!model_id(model_name)
    `)
    .in('model_id', publisherModelIds)
    .order('subscribed_at', { ascending: false });
  ```

- [ ] **Weekly Views Chart Data**:
  ```typescript
  // Fetch views from last 6 weeks, group by week
  const sixWeeksAgo = new Date();
  sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

  const { data: views } = await supabase
    .from('views')
    .select('timestamp')
    .in('model_id', publisherModelIds)
    .gte('timestamp', sixWeeksAgo.toISOString());

  // Process to weekly buckets
  const weeklyData = processViewsByWeek(views);
  ```

#### 22E. Activity Logging

- [ ] **Create Activity Log Function**:
  ```typescript
  const logActivity = async (activityType, modelId, details = {}) => {
    const { data: model } = await supabase
      .from('models')
      .select('model_name')
      .eq('id', modelId)
      .single();

    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        model_id: modelId,
        model_name: model?.model_name,
        details: details
      });
  };
  ```

- [ ] **Fetch Recent Activity** (Buyer Dashboard):
  ```typescript
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(10);
  ```

#### 22F. Update Settings Pages

- [ ] **Save Settings**:
  ```typescript
  const saveSettings = async (formData) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        email: formData.email,
        company_name: formData.companyName,
        bio: formData.bio
      })
      .eq('id', user.id);

    if (!error) {
      // Refresh profile in context
      await fetchProfile(user.id);
    }
  };
  ```

---

### Phase 23: File Upload/Download Implementation

**Priority**: HIGH - Core functionality

#### 23A. File Upload (Create Model - Files Tab)

- [ ] **Implement File Upload Function**:
  ```typescript
  const uploadFile = async (file: File, modelId: string) => {
    // Generate file path: publisher_id/model_id/filename
    const filePath = `${user.id}/${modelId}/${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('model-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('model-files')
      .getPublicUrl(filePath);

    // Save file metadata to database
    await supabase
      .from('model_files')
      .insert({
        model_id: modelId,
        file_name: file.name,
        file_type: 'upload',
        file_url: publicUrl,
        file_size: file.size,
        description: fileDescription
      });

    return publicUrl;
  };
  ```

- [ ] **Add File Size Validation**:
  ```typescript
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 100MB limit. Please use external URL instead.');
  }
  ```

- [ ] **Add Progress Indicator**:
  ```typescript
  const uploadFileWithProgress = async (file: File, onProgress: (progress: number) => void) => {
    // Use XMLHttpRequest for progress tracking
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  };
  ```

#### 23B. File Download (Model Details - Files Tab)

- [ ] **Generate Signed URL for Download**:
  ```typescript
  const downloadFile = async (filePath: string) => {
    // Check if user has access (subscribed)
    const hasAccess = await checkFileAccess(modelId, user.id);

    if (!hasAccess) {
      throw new Error('You must be subscribed to download files');
    }

    // Generate signed URL (expires in 1 hour)
    const { data, error } = await supabase.storage
      .from('model-files')
      .createSignedUrl(filePath, 3600);

    if (error) throw error;

    // Trigger download
    window.open(data.signedUrl, '_blank');

    // Log download activity
    await logActivity('downloaded', modelId, { fileName: filePath });
  };
  ```

- [ ] **Check File Access**:
  ```typescript
  const checkFileAccess = async (modelId: string, userId: string) => {
    // Check if user is publisher of model
    const { data: model } = await supabase
      .from('models')
      .select('publisher_id')
      .eq('id', modelId)
      .single();

    if (model.publisher_id === userId) return true;

    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('model_id', modelId)
      .eq('buyer_id', userId)
      .single();

    return subscription?.status === 'active';
  };
  ```

#### 23C. External URL Handling

- [ ] **Save External URL**:
  ```typescript
  const saveExternalUrl = async (modelId: string, url: string, fileName: string) => {
    // Validate URL format
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL format');
    }

    await supabase
      .from('model_files')
      .insert({
        model_id: modelId,
        file_name: fileName,
        file_type: 'external_url',
        file_url: url,
        description: fileDescription
      });
  };
  ```

- [ ] **Display External URL** (only to subscribers):
  ```typescript
  const ExternalFileLink = ({ file, hasAccess }) => {
    if (!hasAccess) {
      return <div>Subscribe to access this file</div>;
    }

    return (
      <a href={file.file_url} target="_blank" rel="noopener noreferrer">
        {file.file_name} <ExternalLink className="w-4 h-4" />
      </a>
    );
  };
  ```

---

### Phase 24: View Tracking & Analytics

**Priority**: MEDIUM - Insights

#### 24A. Implement View Tracking

- [ ] **Track Page View** (Model Details page):
  ```typescript
  useEffect(() => {
    const trackView = async () => {
      await supabase
        .from('views')
        .insert({
          model_id: modelId,
          user_id: user?.id || null, // null if anonymous
          timestamp: new Date().toISOString()
        });

      // Increment view count on model
      await supabase
        .from('models')
        .update({ view_count: model.view_count + 1 })
        .eq('id', modelId);
    };

    trackView();
  }, [modelId]);
  ```

- [ ] **Prevent Duplicate Views**:
  ```typescript
  // Track views in session storage to avoid duplicates
  const viewedModels = JSON.parse(sessionStorage.getItem('viewedModels') || '[]');

  if (!viewedModels.includes(modelId)) {
    await trackView();
    viewedModels.push(modelId);
    sessionStorage.setItem('viewedModels', JSON.stringify(viewedModels));
  }
  ```

#### 24B. Calculate Analytics

- [ ] **Engagement Rate Calculation**:
  ```typescript
  const calculateEngagementRate = (subscribers: number, views: number) => {
    if (views === 0) return 0;
    return ((subscribers / views) * 100).toFixed(2);
  };
  ```

- [ ] **Weekly View Aggregation**:
  ```typescript
  const aggregateWeeklyViews = (views: any[]) => {
    const weeks = {};

    views.forEach(view => {
      const date = new Date(view.timestamp);
      const weekStart = getWeekStart(date);
      const weekKey = `Week ${getWeekNumber(date)}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = 0;
      }
      weeks[weekKey]++;
    });

    return Object.entries(weeks).map(([week, views]) => ({
      week,
      views
    }));
  };
  ```

- [ ] **Category Distribution**:
  ```typescript
  const getCategoryDistribution = async (publisherId: string) => {
    const { data: models } = await supabase
      .from('models')
      .select('categories')
      .eq('publisher_id', publisherId);

    const distribution = {};
    models.forEach(model => {
      model.categories.forEach(category => {
        distribution[category] = (distribution[category] || 0) + 1;
      });
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  };
  ```

---

### Phase 25: Testing & Deployment

**Priority**: CRITICAL - Quality assurance

#### 25A. End-to-End Testing with Database

- [ ] **Test Publisher Flow**:
  - [ ] Create publisher account via registration
  - [ ] Login as publisher
  - [ ] Create new model with all fields
  - [ ] Upload file (<100MB)
  - [ ] Add external URL (>100MB)
  - [ ] Add collaborators
  - [ ] Publish model
  - [ ] View analytics (should show new model)
  - [ ] Edit model
  - [ ] Update settings

- [ ] **Test Buyer Flow**:
  - [ ] Create buyer account via registration
  - [ ] Login as buyer
  - [ ] Browse marketplace
  - [ ] Search and filter models
  - [ ] View model details (should increment view count)
  - [ ] Subscribe to free model (should be immediate)
  - [ ] Subscribe to paid model (should be pending)
  - [ ] Download file from subscribed model (should work)
  - [ ] Try to download from non-subscribed model (should fail)
  - [ ] Create discussion
  - [ ] Add comment
  - [ ] View recent activity
  - [ ] Cancel subscription

- [ ] **Test Publisher Approval Flow**:
  - [ ] As publisher, view pending subscriptions
  - [ ] Approve pending subscription
  - [ ] Verify buyer can now download files

#### 25B. Performance Testing

- [ ] **Test with Large Dataset**:
  - [ ] Create 50-100 models
  - [ ] Create 200+ subscriptions
  - [ ] Add 100+ discussions with comments
  - [ ] Test page load times
  - [ ] Check for slow queries in Supabase logs

- [ ] **Optimize Slow Queries**:
  - [ ] Identify queries taking >1 second
  - [ ] Add missing indexes
  - [ ] Use query optimization techniques (select only needed fields)
  - [ ] Implement pagination for long lists

- [ ] **Implement Pagination**:
  ```typescript
  const fetchModelsWithPagination = async (page: number, pageSize: number = 20) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('models')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .range(from, to)
      .order('created_at', { ascending: false });

    return { models: data, total: count };
  };
  ```

#### 25C. Error Handling

- [ ] **Add Global Error Boundary**:
  ```typescript
  class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught:', error, errorInfo);
      // Log to error tracking service
    }

    render() {
      if (this.state.hasError) {
        return <ErrorFallback />;
      }
      return this.props.children;
    }
  }
  ```

- [ ] **Add Try-Catch to All Async Operations**:
  ```typescript
  try {
    const { data, error } = await supabase.from('models').select('*');
    if (error) throw error;
    setModels(data);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    toast({
      title: 'Error',
      description: 'Failed to load models. Please try again.',
      variant: 'destructive'
    });
  }
  ```

#### 25D. Production Deployment Preparation

- [ ] **Create Production Supabase Project**:
  - [ ] Separate project from development
  - [ ] Run all schema SQL scripts
  - [ ] Set up all RLS policies
  - [ ] Configure storage bucket
  - [ ] Set up Google OAuth (production redirect URLs)

- [ ] **Environment Variables**:
  - [ ] Create `.env.production` file
  - [ ] Use production Supabase URL and keys
  - [ ] Keep service role key secure

- [ ] **Build & Deploy Frontend**:
  - [ ] Run `npm run build`
  - [ ] Test production build locally
  - [ ] Deploy to hosting (Vercel, Netlify, etc.)
  - [ ] Configure environment variables in hosting platform
  - [ ] Set up custom domain (optional)
  - [ ] Enable HTTPS

- [ ] **Configure CORS** (if needed):
  - [ ] In Supabase Dashboard > Settings > API
  - [ ] Add allowed origins (production domain)

- [ ] **Set Up Monitoring**:
  - [ ] Enable Supabase logs
  - [ ] Set up error tracking (Sentry, LogRocket, etc.)
  - [ ] Set up analytics (Google Analytics, Plausible, etc.)
  - [ ] Monitor Supabase usage and billing

#### 25E. Post-Deployment Verification

- [ ] **Smoke Testing on Production**:
  - [ ] Test registration/login
  - [ ] Test creating model
  - [ ] Test file upload
  - [ ] Test subscriptions
  - [ ] Test discussions
  - [ ] Verify all pages load correctly
  - [ ] Check for console errors
  - [ ] Test on mobile device

- [ ] **Database Backup Strategy**:
  - [ ] Set up automated daily backups
  - [ ] Test backup restoration process
  - [ ] Document backup/restore procedures

---

## PART B SUMMARY

**Total Backend Tasks**: ~120-140 tasks across 9 phases
**Estimated Timeline**: 2-3 weeks for solo developer

**Dependencies**:
- Phase 17 must be completed first (foundation)
- Phase 18 before Phase 19 (schema before RLS)
- Phase 21 before Phase 22 (auth before data)
- All phases before Phase 25 (testing last)

**Critical Path**:
1. Phase 17 → Phase 18 → Phase 19 (Database setup)
2. Phase 20 (Storage)
3. Phase 21 (Auth migration)
4. Phase 22 → Phase 23 (Data & files)
5. Phase 24 (Analytics)
6. Phase 25 (Testing & deployment)

---

## Summary

**Total Frontend Tasks (Part A)**: ~150-180 tasks across 16 phases
**Estimated Timeline for Frontend**: 2-3 weeks for solo developer

**Priority Order**:
1. **Phase 4**: Create Model page (most missing fields) - CRITICAL
2. **Phase 2**: Analytics page fixes - HIGH
3. **Phase 10**: Model Details missing tabs - CRITICAL
4. **Phase 6**: Buyer Dashboard fixes - HIGH
5. **Phases 5, 9, 11**: Settings pages - MEDIUM
6. **Phases 3, 7, 8**: My Models, Marketplace, My Purchases fixes - MEDIUM
7. **Phases 1, 11-15**: Polish, validation, testing - MEDIUM/LOW

---

# Part C: Security & Best Practices Implementation

## Overview
This section covers all security measures and best practices to ensure the application is secure against common vulnerabilities and follows industry-standard security practices. Implement these phases **AFTER** completing Parts A and B.

**Total Security Tasks**: ~100-120 tasks across 8 phases

---

## Phase 26: Authentication & Authorization Security

### 26A. Secure Password Requirements
**File**: `client/src/pages/auth.tsx` and Supabase Auth configuration

- [ ] **Implement Strong Password Policy**:
  - [ ] Minimum 8 characters
  - [ ] At least one uppercase letter
  - [ ] At least one lowercase letter
  - [ ] At least one number
  - [ ] At least one special character
  - [ ] Add real-time validation feedback in UI

  ```typescript
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  };
  ```

- [ ] **Configure Supabase Auth Settings**:
  - [ ] Go to Supabase Dashboard → Authentication → Policies
  - [ ] Set minimum password length: 8
  - [ ] Enable password strength indicator
  - [ ] Set email confirmation required: Yes
  - [ ] Set password reset expiry: 1 hour

### 26B. Session Management Security
**File**: `client/src/lib/supabase.ts` and auth context

- [ ] **Implement Secure Session Handling**:
  - [ ] Set session timeout: 7 days
  - [ ] Enable automatic session refresh
  - [ ] Clear session data on logout
  - [ ] Implement "remember me" securely with longer-lived refresh tokens

  ```typescript
  // client/src/lib/supabase.ts
  import { createClient } from '@supabase/supabase-js';

  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // Use PKCE flow for better security
      },
    }
  );

  // Secure logout
  export const secureLogout = async () => {
    await supabase.auth.signOut();
    // Clear any local storage
    localStorage.clear();
    sessionStorage.clear();
  };
  ```

- [ ] **Implement Session Validation**:
  - [ ] Verify session on every protected route access
  - [ ] Check session validity before API calls
  - [ ] Handle expired sessions gracefully

  ```typescript
  // client/src/hooks/useAuth.ts
  export const useAuth = () => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Redirect to login
        window.location.href = '/auth';
        return null;
      }

      return session;
    };

    return { checkSession };
  };
  ```

### 26C. OAuth Security
**File**: `client/src/pages/auth.tsx`

- [ ] **Secure Google OAuth Implementation**:
  - [ ] Verify OAuth state parameter to prevent CSRF
  - [ ] Use PKCE (Proof Key for Code Exchange) flow
  - [ ] Validate OAuth redirect URI
  - [ ] Store OAuth tokens securely (Supabase handles this)

  ```typescript
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      toast({
        title: 'Authentication failed',
        description: 'Unable to sign in with Google',
        variant: 'destructive',
      });
    }
  };
  ```

### 26D. Role-Based Access Control (RBAC)
**Files**: All protected routes and components

- [ ] **Implement Route Protection**:
  - [ ] Create ProtectedRoute component
  - [ ] Verify user role matches route requirement
  - [ ] Redirect unauthorized access attempts

  ```typescript
  // client/src/components/auth/ProtectedRoute.tsx
  interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: ('buyer' | 'publisher')[];
  }

  export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
  }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [, setLocation] = useLocation();

    useEffect(() => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setLocation('/auth');
          return;
        }

        setSession(session);

        // Get user profile to check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!profile || !allowedRoles.includes(profile.role)) {
          setLocation('/unauthorized');
          return;
        }

        setUserRole(profile.role);
        setLoading(false);
      };

      checkAuth();
    }, []);

    if (loading) return <div>Loading...</div>;

    return <>{children}</>;
  };
  ```

- [ ] **Apply Route Protection**:
  - [ ] Wrap all publisher routes with ProtectedRoute (allowedRoles: ['publisher'])
  - [ ] Wrap all buyer routes with ProtectedRoute (allowedRoles: ['buyer'])
  - [ ] Wrap marketplace with appropriate logic (both roles allowed)

### 26E. JWT Token Security
**File**: Backend API middleware (if needed beyond Supabase)

- [ ] **Secure Token Handling**:
  - [ ] Never log tokens
  - [ ] Validate token signature on every request
  - [ ] Check token expiration
  - [ ] Implement token refresh mechanism

  ```typescript
  // server/middleware/auth.ts (if using custom backend)
  import { supabase } from '../lib/supabase';

  export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token validation failed' });
    }
  };
  ```

---

## Phase 27: Input Validation & Sanitization

### 27A. Frontend Validation
**Files**: All form components

- [ ] **Model Creation Form Validation** (`client/src/pages/publisher/create-model.tsx`):
  - [ ] Validate model name: alphanumeric + spaces, 1-25 chars
  - [ ] Validate description: 1-700 chars, no script tags
  - [ ] Validate version: semantic versioning format (e.g., 1.0.0)
  - [ ] Validate response time: positive integer only
  - [ ] Validate accuracy: 0-100, max 2 decimal places
  - [ ] Validate email addresses for collaborators
  - [ ] Validate URLs for external file links (https only)

  ```typescript
  import DOMPurify from 'dompurify';

  const validateModelForm = (formData: ModelFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Model Name
    if (!formData.modelName || formData.modelName.trim().length === 0) {
      errors.modelName = 'Model name is required';
    } else if (formData.modelName.length > 25) {
      errors.modelName = 'Model name must be 25 characters or less';
    } else if (!/^[a-zA-Z0-9\s-_]+$/.test(formData.modelName)) {
      errors.modelName = 'Model name can only contain letters, numbers, spaces, hyphens, and underscores';
    }

    // Description - sanitize HTML
    if (!formData.description || formData.description.trim().length === 0) {
      errors.description = 'Description is required';
    } else if (formData.description.length > 700) {
      errors.description = 'Description must be 700 characters or less';
    }
    // Sanitize to prevent XSS
    formData.description = DOMPurify.sanitize(formData.description, {
      ALLOWED_TAGS: [], // Strip all HTML tags
      ALLOWED_ATTR: []
    });

    // Version - semantic versioning
    if (!formData.version) {
      errors.version = 'Version is required';
    } else if (!/^\d+\.\d+\.\d+$/.test(formData.version)) {
      errors.version = 'Version must follow semantic versioning (e.g., 1.0.0)';
    }

    // Response Time
    if (!formData.responseTime) {
      errors.responseTime = 'Response time is required';
    } else if (isNaN(Number(formData.responseTime)) || Number(formData.responseTime) <= 0) {
      errors.responseTime = 'Response time must be a positive number';
    }

    // Accuracy
    if (!formData.accuracy) {
      errors.accuracy = 'Accuracy is required';
    } else {
      const acc = Number(formData.accuracy);
      if (isNaN(acc) || acc < 0 || acc > 100) {
        errors.accuracy = 'Accuracy must be between 0 and 100';
      }
    }

    // External URL validation
    if (formData.fileType === 'External URL' && formData.externalUrl) {
      try {
        const url = new URL(formData.externalUrl);
        if (url.protocol !== 'https:') {
          errors.externalUrl = 'External URLs must use HTTPS';
        }
      } catch {
        errors.externalUrl = 'Invalid URL format';
      }
    }

    return errors;
  };
  ```

- [ ] **Install DOMPurify**:
  ```bash
  npm install dompurify
  npm install --save-dev @types/dompurify
  ```

### 27B. XSS Prevention
**Files**: All components displaying user-generated content

- [ ] **Sanitize User Input Before Display**:
  - [ ] Model descriptions
  - [ ] Discussion content
  - [ ] Comment content
  - [ ] User bio
  - [ ] Model documentation

  ```typescript
  // client/src/components/model/ModelDescription.tsx
  import DOMPurify from 'dompurify';

  interface ModelDescriptionProps {
    description: string;
  }

  export const ModelDescription: React.FC<ModelDescriptionProps> = ({ description }) => {
    // Sanitize with allowed safe tags for formatting
    const sanitized = DOMPurify.sanitize(description, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
    });

    return (
      <div
        className="prose prose-sm"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  };
  ```

- [ ] **Configure Content Security Policy**:
  - [ ] Add CSP meta tag to `client/index.html`

  ```html
  <meta
    http-equiv="Content-Security-Policy"
    content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://accounts.google.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co;
      frame-src https://accounts.google.com;
    "
  />
  ```

### 27C. SQL Injection Prevention
**Note**: Supabase handles this automatically via parameterized queries, but ensure proper usage

- [ ] **Use Supabase Query Builder Correctly**:
  - [ ] NEVER concatenate user input into queries
  - [ ] ALWAYS use parameterized queries
  - [ ] Verify all queries use `.eq()`, `.filter()`, `.match()` methods

  ```typescript
  // ❌ WRONG - Never do this
  const { data } = await supabase
    .from('models')
    .select('*')
    .eq('model_name', userInput); // If userInput is from user, this is safe in Supabase

  // ✅ CORRECT - Supabase automatically parameterizes
  const { data } = await supabase
    .from('models')
    .select('*')
    .eq('model_name', userInput); // This is safe

  // ❌ WRONG - Raw SQL (avoid if possible)
  const { data } = await supabase.rpc('custom_function', {
    search: `'; DROP TABLE models; --`
  });

  // ✅ CORRECT - Use RLS and parameterized RPC
  const { data } = await supabase.rpc('search_models', {
    search_term: userInput // Supabase handles sanitization
  });
  ```

### 27D. File Upload Validation
**File**: `client/src/pages/publisher/create-model.tsx` and file upload handlers

- [ ] **Validate File Types**:
  - [ ] Create whitelist of allowed file extensions
  - [ ] Check MIME type (not just extension)
  - [ ] Validate file size (max 100MB for direct upload)

  ```typescript
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv',
    'application/json',
    'application/octet-stream', // For .pkl, .h5, .pt files
  ];

  const ALLOWED_EXTENSIONS = [
    '.pdf', '.zip', '.txt', '.csv', '.json',
    '.pkl', '.h5', '.pt', '.pth', '.onnx', '.pb'
  ];

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 100MB. Please use an external URL.'
      };
    }

    // Check file extension
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return {
        valid: false,
        error: `File type ${fileExt} is not allowed`
      };
    }

    // Check MIME type
    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
      return {
        valid: false,
        error: 'Invalid file type'
      };
    }

    // Check for suspicious file names
    if (/[<>:"|?*]/.test(file.name)) {
      return {
        valid: false,
        error: 'File name contains invalid characters'
      };
    }

    return { valid: true };
  };

  const handleFileUpload = async (file: File) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    // Proceed with upload
    // ...
  };
  ```

- [ ] **Implement File Scanning** (Optional but recommended):
  - [ ] Consider integrating ClamAV or similar antivirus
  - [ ] Scan files before storing in Supabase Storage
  - [ ] Quarantine suspicious files

### 27E. CSRF Protection
**Files**: Auth and form components

- [ ] **Implement CSRF Tokens for State-Changing Operations**:
  - [ ] Use Supabase Auth built-in CSRF protection
  - [ ] Verify same-origin for all POST/PUT/DELETE requests

  ```typescript
  // Supabase automatically handles CSRF with PKCE flow
  // Ensure all API calls include auth token

  const makeAuthenticatedRequest = async (url: string, options: RequestInit) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };

    return fetch(url, { ...options, headers });
  };
  ```

---

## Phase 28: Data Security & Privacy

### 28A. Encryption at Rest
**Note**: Supabase provides encryption at rest by default

- [ ] **Verify Supabase Encryption Settings**:
  - [ ] Confirm database encryption is enabled (default for all projects)
  - [ ] Confirm Storage encryption is enabled (default)
  - [ ] Document encryption status in README

### 28B. Encryption in Transit
**Files**: All API communications

- [ ] **Enforce HTTPS Only**:
  - [ ] Configure Vite to redirect HTTP to HTTPS in production
  - [ ] Update Supabase project settings to enforce HTTPS

  ```typescript
  // vite.config.ts
  export default defineConfig({
    server: {
      https: process.env.NODE_ENV === 'production',
    },
  });
  ```

- [ ] **Verify SSL/TLS Configuration**:
  - [ ] Supabase uses TLS 1.2+ (automatically enforced)
  - [ ] All `fetch` calls use HTTPS URLs
  - [ ] No mixed content warnings in browser

### 28C. Sensitive Data Handling
**Files**: All components handling PII

- [ ] **Identify and Protect PII**:
  - [ ] Email addresses
  - [ ] Names
  - [ ] Company information
  - [ ] Never log PII to console
  - [ ] Never expose PII in URLs or query params

  ```typescript
  // ❌ WRONG - PII in URL
  setLocation(`/profile?email=${userEmail}`);

  // ✅ CORRECT - Use user ID
  setLocation(`/profile/${userId}`);

  // ❌ WRONG - Logging PII
  console.log('User email:', user.email);

  // ✅ CORRECT - Log anonymized data
  console.log('User ID:', user.id);
  ```

- [ ] **Implement Data Minimization**:
  - [ ] Only request necessary user data
  - [ ] Don't store data you don't need
  - [ ] Provide data deletion capability in Settings

### 28D. Row Level Security (RLS) Verification
**Files**: Supabase Dashboard

- [ ] **Audit All RLS Policies**:
  - [ ] Test that users can only see their own data
  - [ ] Test that publishers can only edit their models
  - [ ] Test that buyers can only subscribe to published models
  - [ ] Test that collaborators can access models they're added to
  - [ ] Test anonymous users can only view published models

  ```sql
  -- Test queries to run in Supabase SQL Editor

  -- 1. Test user can only update their own profile
  -- Should return 0 rows if RLS is working
  SELECT * FROM profiles WHERE id != auth.uid();

  -- 2. Test user can only see published models or their own
  -- Should only show published models + user's own models
  SELECT * FROM models WHERE status = 'draft' AND publisher_id != auth.uid();

  -- 3. Test unauthorized file access
  -- Should fail or return 0 rows
  SELECT * FROM model_files
  WHERE model_id IN (
    SELECT id FROM models WHERE publisher_id != auth.uid() AND status = 'draft'
  );
  ```

### 28E. Data Retention & Deletion
**Files**: Settings pages, Supabase functions

- [ ] **Implement Account Deletion**:
  - [ ] Add "Delete Account" option in Settings
  - [ ] Cascade delete all user data (RLS handles this)
  - [ ] Confirm deletion with re-authentication

  ```typescript
  // client/src/pages/publisher/settings.tsx or buyer/settings.tsx
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will delete all your data.'
    );

    if (!confirmed) return;

    try {
      // Re-authenticate before deletion
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Session expired',
          description: 'Please log in again to delete your account',
          variant: 'destructive',
        });
        return;
      }

      // Delete user profile (cascades to all related data via foreign keys)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session.user.id);

      if (deleteError) throw deleteError;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(
        session.user.id
      );

      if (authError) throw authError;

      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been permanently deleted',
      });

      setLocation('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: 'Deletion failed',
        description: 'Unable to delete account. Please contact support.',
        variant: 'destructive',
      });
    }
  };
  ```

---

## Phase 29: API & Application Security

### 29A. Rate Limiting
**Files**: Supabase Edge Functions or backend API

- [ ] **Implement Rate Limiting for Critical Endpoints**:
  - [ ] Login attempts: 5 per 15 minutes per IP
  - [ ] Registration: 3 per hour per IP
  - [ ] Model creation: 10 per hour per user
  - [ ] Discussion posts: 20 per hour per user
  - [ ] File uploads: 5 per hour per user

  ```typescript
  // server/middleware/rateLimit.ts (if using custom backend)
  import rateLimit from 'express-rate-limit';

  export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many registration attempts, please try again later',
  });

  export const modelCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many models created, please try again later',
    keyGenerator: (req) => req.user?.id || req.ip, // Rate limit by user ID
  });
  ```

- [ ] **For Supabase-only setup**, use Edge Functions with rate limiting:

  ```typescript
  // supabase/functions/create-model/index.ts
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

  const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
  const RATE_LIMIT_MAX = 10;

  serve(async (req) => {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check rate limit
    const { count } = await supabaseClient
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'create_model')
      .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString());

    if (count && count >= RATE_LIMIT_MAX) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    // Proceed with model creation...
  });
  ```

### 29B. Secure Error Handling
**Files**: All components and API handlers

- [ ] **Implement Safe Error Messages**:
  - [ ] Never expose stack traces to users
  - [ ] Never expose database errors
  - [ ] Never expose file paths
  - [ ] Log detailed errors server-side only

  ```typescript
  // client/src/lib/errorHandler.ts
  export const handleError = (error: any, userMessage?: string) => {
    // Log detailed error (only in development or to error tracking service)
    if (process.env.NODE_ENV === 'development') {
      console.error('Detailed error:', error);
    } else {
      // Send to error tracking service (e.g., Sentry)
      // Sentry.captureException(error);
    }

    // Show safe message to user
    const safeMessage = userMessage || 'An error occurred. Please try again.';

    toast({
      title: 'Error',
      description: safeMessage,
      variant: 'destructive',
    });
  };

  // Usage
  try {
    await supabase.from('models').insert(data);
  } catch (error) {
    // ❌ WRONG - Exposing detailed error
    // toast({ description: error.message });

    // ✅ CORRECT - Safe error handling
    handleError(error, 'Unable to create model. Please try again.');
  }
  ```

### 29C. Secure Headers Configuration
**Files**: `vite.config.ts` and deployment config

- [ ] **Add Security Headers**:

  ```typescript
  // vite.config.ts
  export default defineConfig({
    server: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      },
    },
  });
  ```

- [ ] **Configure CORS Properly**:
  - [ ] Only allow trusted origins
  - [ ] Don't use wildcard (*) in production

  ```typescript
  // server/index.ts (if using custom backend)
  import cors from 'cors';

  const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
  ];

  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:5173');
  }

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  ```

### 29D. API Request Validation
**Files**: All API integration points

- [ ] **Validate All API Requests**:
  - [ ] Check request method
  - [ ] Validate request body structure
  - [ ] Validate query parameters
  - [ ] Sanitize all inputs

  ```typescript
  // client/src/lib/api.ts
  import { z } from 'zod';

  // Install zod: npm install zod

  const CreateModelSchema = z.object({
    model_name: z.string().min(1).max(25),
    description: z.string().min(1).max(700),
    categories: z.array(z.string()).min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    response_time: z.number().positive(),
    accuracy: z.number().min(0).max(100),
    features: z.array(z.string()).optional(),
    api_documentation: z.string().optional(),
    subscription_type: z.enum(['free', 'paid']),
    subscription_amount: z.number().optional(),
  });

  export const createModel = async (data: unknown) => {
    // Validate data structure
    const validationResult = CreateModelSchema.safeParse(data);

    if (!validationResult.success) {
      throw new Error('Invalid model data: ' + validationResult.error.message);
    }

    const validData = validationResult.data;

    // Proceed with API call
    const { data: model, error } = await supabase
      .from('models')
      .insert(validData)
      .select()
      .single();

    if (error) throw error;

    return model;
  };
  ```

---

## Phase 30: File Upload & Storage Security

### 30A. Secure File Storage Configuration
**Files**: Supabase Storage settings

- [ ] **Configure Storage Bucket Security**:
  - [ ] Make bucket private (not public)
  - [ ] Implement signed URLs for downloads
  - [ ] Set file size limits
  - [ ] Enable file type restrictions

  ```sql
  -- Supabase Storage Policies

  -- Only authenticated users can upload
  CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'model-files' AND
      auth.uid() IS NOT NULL
    );

  -- Users can only delete their own files
  CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'model-files' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );

  -- Only subscribed users can download files
  CREATE POLICY "Subscribed users can download files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'model-files' AND (
        -- Publisher can always access their files
        auth.uid()::text = (storage.foldername(name))[1]
        OR
        -- Buyer must have active subscription
        EXISTS (
          SELECT 1 FROM subscriptions s
          JOIN models m ON s.model_id = m.id
          WHERE s.buyer_id = auth.uid()
            AND s.status = 'active'
            AND m.id::text = (storage.foldername(name))[2]
        )
      )
    );
  ```

### 30B. File Upload Security Implementation
**File**: `client/src/lib/fileUpload.ts`

- [ ] **Implement Secure File Upload**:

  ```typescript
  import { supabase } from './supabase';

  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/zip',
    'text/plain',
    'text/csv',
    'application/json',
    'application/octet-stream',
  ];

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  export const uploadModelFile = async (
    file: File,
    modelId: string,
    userId: string
  ): Promise<{ url: string; error?: string }> => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: '',
        error: 'File size exceeds 100MB limit'
      };
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== '') {
      return {
        url: '',
        error: 'File type not allowed'
      };
    }

    // Generate safe file name (prevent path traversal)
    const fileExt = file.name.split('.').pop();
    const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Storage path: userId/modelId/filename
    const filePath = `${userId}/${modelId}/${safeFileName}`;

    try {
      // Upload file
      const { data, error } = await supabase.storage
        .from('model-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Don't allow overwriting
        });

      if (error) {
        console.error('Upload error:', error);
        return { url: '', error: 'Upload failed' };
      }

      // Get signed URL (valid for 1 year)
      const { data: urlData } = await supabase.storage
        .from('model-files')
        .createSignedUrl(filePath, 31536000); // 1 year

      return { url: urlData?.signedUrl || '' };
    } catch (error) {
      console.error('Upload exception:', error);
      return { url: '', error: 'Upload failed' };
    }
  };
  ```

### 30C. File Download Security
**File**: `client/src/pages/model-details.tsx`

- [ ] **Implement Secure File Download**:

  ```typescript
  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      // Check if user is subscribed
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('model_id', modelId)
        .eq('buyer_id', user.id)
        .single();

      if (!subscription || subscription.status !== 'active') {
        toast({
          title: 'Access denied',
          description: 'You must subscribe to this model to download files',
          variant: 'destructive',
        });
        return;
      }

      // Get file details
      const { data: fileData } = await supabase
        .from('model_files')
        .select('file_path')
        .eq('id', fileId)
        .single();

      if (!fileData) {
        toast({
          title: 'File not found',
          variant: 'destructive',
        });
        return;
      }

      // Generate signed URL (valid for 1 hour)
      const { data: urlData, error } = await supabase.storage
        .from('model-files')
        .createSignedUrl(fileData.file_path, 3600);

      if (error || !urlData) {
        toast({
          title: 'Download failed',
          variant: 'destructive',
        });
        return;
      }

      // Download file
      const link = document.createElement('a');
      link.href = urlData.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download started',
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        variant: 'destructive',
      });
    }
  };
  ```

---

## Phase 31: Infrastructure & Deployment Security

### 31A. Environment Variables Security
**Files**: `.env`, `.env.example`, `.gitignore`

- [ ] **Secure Environment Variables**:
  - [ ] Never commit `.env` to git
  - [ ] Add `.env` to `.gitignore`
  - [ ] Create `.env.example` with dummy values
  - [ ] Use different credentials for dev/staging/prod

  ```bash
  # .gitignore
  .env
  .env.local
  .env.*.local
  *.env

  # .env.example (commit this)
  VITE_SUPABASE_URL=your_supabase_url_here
  VITE_SUPABASE_ANON_KEY=your_anon_key_here

  # .env (DO NOT commit)
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

- [ ] **Validate Environment Variables at Runtime**:

  ```typescript
  // client/src/lib/env.ts
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ] as const;

  export const validateEnv = () => {
    const missing = requiredEnvVars.filter(
      (key) => !import.meta.env[key]
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }
  };

  // Call in main.tsx
  validateEnv();
  ```

### 31B. Production Build Security
**Files**: `vite.config.ts`, `package.json`

- [ ] **Configure Production Build**:
  - [ ] Remove console.logs in production
  - [ ] Enable minification
  - [ ] Remove source maps from production

  ```typescript
  // vite.config.ts
  export default defineConfig({
    build: {
      sourcemap: false, // Don't include source maps
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs
          drop_debugger: true, // Remove debugger statements
        },
      },
    },
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  });
  ```

### 31C. Dependency Security
**Files**: `package.json`

- [ ] **Audit Dependencies Regularly**:

  ```bash
  # Run npm audit
  npm audit

  # Fix vulnerabilities automatically
  npm audit fix

  # Check for outdated packages
  npm outdated
  ```

- [ ] **Add npm audit to CI/CD**:

  ```yaml
  # .github/workflows/security.yml
  name: Security Audit

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]
    schedule:
      - cron: '0 0 * * 0' # Weekly

  jobs:
    audit:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
        - run: npm ci
        - run: npm audit --audit-level=moderate
  ```

- [ ] **Keep Dependencies Updated**:
  - [ ] Review and update dependencies monthly
  - [ ] Test thoroughly after updates
  - [ ] Subscribe to security advisories for critical packages

### 31D. HTTPS & SSL Configuration
**Files**: Deployment configuration (Vercel, Netlify, etc.)

- [ ] **Enforce HTTPS**:
  - [ ] Enable automatic HTTPS redirect
  - [ ] Configure HSTS (HTTP Strict Transport Security)
  - [ ] Ensure all external resources use HTTPS

  ```typescript
  // For Vercel deployment - vercel.json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ],
    "redirects": [
      {
        "source": "/:path*",
        "has": [
          {
            "type": "header",
            "key": "x-forwarded-proto",
            "value": "http"
          }
        ],
        "destination": "https://yourdomain.com/:path*",
        "permanent": true
      }
    ]
  }
  ```

---

## Phase 32: Security Monitoring & Logging

### 32A. Activity Logging
**Files**: Database and API handlers

- [ ] **Implement Comprehensive Activity Logging**:
  - [ ] Log all authentication events (login, logout, failed attempts)
  - [ ] Log model creation, updates, deletion
  - [ ] Log subscription events
  - [ ] Log file uploads and downloads
  - [ ] Log security events (access denied, rate limit exceeded)

  ```typescript
  // client/src/lib/activityLogger.ts
  export enum ActivityAction {
    LOGIN = 'login',
    LOGOUT = 'logout',
    LOGIN_FAILED = 'login_failed',
    CREATE_MODEL = 'create_model',
    UPDATE_MODEL = 'update_model',
    DELETE_MODEL = 'delete_model',
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
    FILE_UPLOAD = 'file_upload',
    FILE_DOWNLOAD = 'file_download',
    ACCESS_DENIED = 'access_denied',
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  }

  export const logActivity = async (
    action: ActivityAction,
    details?: Record<string, any>
  ) => {
    const { data: { user } } = await supabase.auth.getUser();

    try {
      await supabase.from('activity_log').insert({
        user_id: user?.id || null,
        action,
        details,
        ip_address: await getUserIP(), // Implement this
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      // Don't throw - logging should not break app
      console.error('Activity logging failed:', error);
    }
  };

  // Usage
  await logActivity(ActivityAction.CREATE_MODEL, {
    model_id: newModel.id,
    model_name: newModel.model_name,
  });
  ```

### 32B. Error Tracking
**Files**: Application-wide

- [ ] **Set Up Error Tracking Service** (e.g., Sentry):

  ```bash
  npm install @sentry/react @sentry/vite-plugin
  ```

  ```typescript
  // client/src/main.tsx
  import * as Sentry from '@sentry/react';

  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.['Authorization'];
        }
        return event;
      },
    });
  }
  ```

### 32C. Security Alerts
**Files**: Backend monitoring

- [ ] **Set Up Security Alerts**:
  - [ ] Alert on multiple failed login attempts
  - [ ] Alert on rate limit exceeded
  - [ ] Alert on unauthorized access attempts
  - [ ] Alert on suspicious file uploads

  ```sql
  -- Supabase Database Function for failed login alerts
  CREATE OR REPLACE FUNCTION check_failed_logins()
  RETURNS TRIGGER AS $$
  DECLARE
    failed_count INTEGER;
  BEGIN
    IF NEW.action = 'login_failed' THEN
      -- Count failed logins in last 15 minutes from same IP
      SELECT COUNT(*) INTO failed_count
      FROM activity_log
      WHERE action = 'login_failed'
        AND ip_address = NEW.ip_address
        AND created_at > NOW() - INTERVAL '15 minutes';

      IF failed_count >= 5 THEN
        -- Trigger alert (could send webhook, email, etc.)
        INSERT INTO security_alerts (type, details, severity)
        VALUES (
          'multiple_failed_logins',
          jsonb_build_object('ip_address', NEW.ip_address, 'count', failed_count),
          'high'
        );
      END IF;
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER failed_login_alert
  AFTER INSERT ON activity_log
  FOR EACH ROW
  EXECUTE FUNCTION check_failed_logins();
  ```

---

## Phase 33: Security Testing & Auditing

### 33A. Automated Security Scanning
**Files**: CI/CD pipeline

- [ ] **Implement Automated Security Scans**:
  - [ ] Add OWASP dependency check
  - [ ] Add static code analysis
  - [ ] Add container scanning (if using Docker)

  ```yaml
  # .github/workflows/security-scan.yml
  name: Security Scan

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    dependency-check:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Run npm audit
          run: npm audit --audit-level=moderate

    code-scan:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Run ESLint security plugin
          run: |
            npm install eslint-plugin-security
            npx eslint . --ext .ts,.tsx --plugin security

    semgrep:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: returntocorp/semgrep-action@v1
          with:
            config: >-
              p/security-audit
              p/secrets
              p/owasp-top-ten
  ```

### 33B. Manual Security Testing
**Files**: Testing documentation

- [ ] **Create Security Test Checklist**:

  ```markdown
  # Security Testing Checklist

  ## Authentication & Authorization
  - [ ] Test SQL injection in login form
  - [ ] Test XSS in login form
  - [ ] Test password reset flow
  - [ ] Test OAuth flow (happy path and errors)
  - [ ] Verify session timeout
  - [ ] Test accessing buyer routes as publisher
  - [ ] Test accessing publisher routes as buyer
  - [ ] Test accessing protected routes while logged out

  ## Input Validation
  - [ ] Test XSS in model description
  - [ ] Test XSS in discussion posts
  - [ ] Test XSS in comments
  - [ ] Test file upload with malicious file names
  - [ ] Test file upload with executable files
  - [ ] Test file upload exceeding size limit
  - [ ] Test invalid URLs in external file links

  ## API Security
  - [ ] Test accessing other users' models via API
  - [ ] Test modifying other users' subscriptions
  - [ ] Test rate limiting on model creation
  - [ ] Test rate limiting on file uploads
  - [ ] Test CORS configuration

  ## Data Security
  - [ ] Verify RLS policies block unauthorized access
  - [ ] Test downloading files without subscription
  - [ ] Test accessing draft models by non-publishers
  - [ ] Verify sensitive data not in URLs
  - [ ] Verify no PII in logs

  ## File Security
  - [ ] Test uploading files with script tags in metadata
  - [ ] Test path traversal in file names (../../etc/passwd)
  - [ ] Test downloading files without proper authentication
  - [ ] Verify signed URLs expire correctly
  ```

### 33C. Penetration Testing
**Files**: Documentation

- [ ] **Plan Penetration Testing**:
  - [ ] Schedule quarterly penetration tests
  - [ ] Document findings and remediation
  - [ ] Re-test after fixes

  ```markdown
  # Penetration Testing Plan

  ## Scope
  - Authentication system
  - Authorization (RLS policies)
  - File upload/download
  - API endpoints
  - Input validation

  ## Tools
  - OWASP ZAP
  - Burp Suite
  - SQLMap
  - Nikto

  ## Timeline
  - Quarterly tests
  - After major feature releases
  - After security incidents

  ## Reporting
  - Document all findings
  - Categorize by severity (Critical, High, Medium, Low)
  - Track remediation status
  - Re-test after fixes
  ```

### 33D. Security Audit Checklist
**Files**: Documentation

- [ ] **Create Ongoing Security Audit Process**:

  ```markdown
  # Monthly Security Audit

  ## Authentication & Access Control
  - [ ] Review Supabase auth logs for suspicious activity
  - [ ] Review failed login attempts
  - [ ] Check for brute force patterns
  - [ ] Verify RLS policies are still correct
  - [ ] Review user permissions

  ## Data Security
  - [ ] Audit database for sensitive data exposure
  - [ ] Review activity logs for unauthorized access
  - [ ] Check encryption settings (at rest and in transit)
  - [ ] Verify backup encryption

  ## Application Security
  - [ ] Review recent code changes for security issues
  - [ ] Check for new vulnerabilities in dependencies
  - [ ] Review error logs for security events
  - [ ] Test file upload restrictions

  ## Infrastructure
  - [ ] Review environment variables security
  - [ ] Check SSL/TLS certificates expiry
  - [ ] Verify HTTPS enforcement
  - [ ] Review security headers configuration

  ## Compliance
  - [ ] Review data retention policies
  - [ ] Verify user data deletion requests processed
  - [ ] Check privacy policy is up to date
  - [ ] Verify terms of service is current
  ```

---

## Part C Summary

**Total Security Tasks**: ~100-120 tasks across 8 phases

**Phase Overview**:
- **Phase 26**: Authentication & Authorization Security (18-22 tasks)
- **Phase 27**: Input Validation & Sanitization (15-18 tasks)
- **Phase 28**: Data Security & Privacy (12-15 tasks)
- **Phase 29**: API & Application Security (15-18 tasks)
- **Phase 30**: File Upload & Storage Security (10-12 tasks)
- **Phase 31**: Infrastructure & Deployment Security (12-15 tasks)
- **Phase 32**: Security Monitoring & Logging (8-10 tasks)
- **Phase 33**: Security Testing & Auditing (10-12 tasks)

**Critical Security Priorities**:
1. **Phase 26 & 27**: Authentication and input validation - CRITICAL (prevent most common attacks)
2. **Phase 28**: Data security and RLS - HIGH (protect user data)
3. **Phase 30**: File upload security - HIGH (prevent malware and unauthorized access)
4. **Phase 31**: Infrastructure security - MEDIUM (foundation for all other security)
5. **Phases 32 & 33**: Monitoring and testing - ONGOING (detect and prevent future issues)

**Dependencies**:
- Implement after Parts A and B are complete
- Phase 26 should be implemented first (authentication is foundation)
- Phases 27-30 can be implemented in parallel
- Phase 31 during deployment preparation
- Phases 32-33 are ongoing activities

**Testing Requirements**:
- Manual testing of all security features
- Automated security scans in CI/CD
- Quarterly penetration testing
- Monthly security audits

**Additional Tools Needed**:
```bash
npm install dompurify @types/dompurify
npm install zod
npm install express-rate-limit  # If using custom backend
npm install @sentry/react @sentry/vite-plugin  # For error tracking
```

---

## Final Implementation Summary

### Complete Project Overview

**Total Implementation Tasks**: ~370-420 tasks across 33 phases

**Part A: Frontend Fixes** (~150-180 tasks, 16 phases)
- Focus: Fix all buyer and publisher portal UI/UX issues with mock data
- Timeline: 2-3 weeks for solo developer
- Status: To be implemented FIRST

**Part B: Backend Migration** (~120-140 tasks, 9 phases)
- Focus: Migrate from mock data to Supabase (Auth, Database, Storage)
- Timeline: 2-3 weeks for solo developer
- Status: Implement AFTER Part A is complete

**Part C: Security & Best Practices** (~100-120 tasks, 8 phases)
- Focus: Implement security measures and best practices
- Timeline: 1-2 weeks for solo developer + ongoing monitoring
- Status: Implement AFTER Parts A & B, then maintain ongoing

**Critical Path**:
1. Complete Part A (Frontend) → 2-3 weeks
2. Complete Part B (Backend) → 2-3 weeks
3. Implement Part C (Security) → 1-2 weeks
4. Testing & deployment → 1 week
5. **Total estimated time**: 6-9 weeks for solo developer

**Success Criteria**:
- ✅ All frontend matches requirements exactly
- ✅ Full Supabase integration (Auth, Database, Storage)
- ✅ Comprehensive security implementation
- ✅ No security vulnerabilities (OWASP Top 10 protected)
- ✅ All features functional and tested
- ✅ Production-ready deployment

---

**END OF REQUIREMENTS DOCUMENT**

**Start with Phase 1 and work sequentially through Phase 16 before migrating to Supabase.**

---

## Database Schema Notes

### Additional Considerations
- **User Metadata**: Store user_type (Publisher/Buyer) in Supabase auth.users metadata or separate profiles table
- **View Tracking**: Implement views table or use analytics service
- **File Storage**: Use Supabase Storage with proper access policies
- **Audit Trail**: Consider adding created_by, updated_by fields to models
- **Soft Deletes**: Consider implementing soft deletes for models and discussions

---

## API Endpoints Needed

### Authentication
- POST `/auth/signup` - Register new user
- POST `/auth/login` - Login user
- POST `/auth/logout` - Logout user
- GET `/auth/user` - Get current user
- GET `/auth/google` - OAuth redirect
- GET `/auth/google/callback` - OAuth callback

### Models (Publisher)
- GET `/api/models` - List all models (with filters)
- GET `/api/models/:id` - Get model details
- POST `/api/models` - Create new model
- PUT `/api/models/:id` - Update model
- DELETE `/api/models/:id` - Delete model
- POST `/api/models/:id/publish` - Publish draft model

### Files
- POST `/api/models/:id/files` - Upload file
- GET `/api/models/:id/files` - List model files
- GET `/api/files/:id/download` - Download file (authenticated)
- DELETE `/api/files/:id` - Delete file

### Subscriptions
- POST `/api/subscriptions` - Subscribe to model
- GET `/api/subscriptions` - List user subscriptions
- PUT `/api/subscriptions/:id/approve` - Approve subscription (publisher)
- DELETE `/api/subscriptions/:id` - Cancel subscription

### Discussions
- GET `/api/models/:id/discussions` - List discussions
- POST `/api/models/:id/discussions` - Create discussion
- POST `/api/discussions/:id/comments` - Add comment
- GET `/api/discussions/:id/comments` - Get comments

### Analytics
- GET `/api/analytics/overview` - Publisher analytics overview
- GET `/api/analytics/models/:id` - Model-specific analytics
- POST `/api/analytics/track-view` - Track model view

### Collaborators
- GET `/api/models/:id/collaborators` - List collaborators
- POST `/api/models/:id/collaborators` - Add collaborator
- DELETE `/api/models/:id/collaborators/:userId` - Remove collaborator

---

## Environment Variables Required

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application
VITE_APP_URL=http://localhost:5000
NODE_ENV=development
```

---

## Future Enhancements
- Payment system integration for paid subscriptions
- Advanced analytics and reporting
- Email notifications for subscription approvals
- Model versioning system
- API access management
- Usage tracking and billing
- Model rating and reviews
- Advanced search with ML-based recommendations
- Export analytics to CSV/PDF
- Webhook support for integrations
