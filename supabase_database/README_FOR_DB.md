# 🗄️ Database Setup Guide

This folder contains all SQL scripts needed to recreate the AI Model Marketplace database in your Supabase project.

## 📋 Files Overview

| File | Purpose | Must Run? |
|------|---------|-----------|
| `01_schema.sql` | Create all tables and constraints | ✅ Required |
| `02_functions.sql` | Custom PostgreSQL functions | ✅ Required |
| `03_triggers.sql` | Automatic triggers | ✅ Required |
| `04_rls.sql` | Row Level Security policies | ✅ Required |
| `05_indexes.sql` | Performance indexes | ✅ Required |
| `06_seed.sql` | Initial data (roles, categories) | ✅ Required |
| `07_security_fixes.sql` | Access-control hardening, sign-up trigger, notification and statistics functions | ✅ Required |

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to https://app.supabase.com/
2. Click "New Project"
3. Enter project details and create

### Step 2: Run SQL Scripts

Go to **SQL Editor** in your Supabase dashboard and run each file **in order**:

#### 1️⃣ Schema (Tables)
```sql
-- Copy all contents from: 01_schema.sql
-- Paste into SQL Editor
-- Click "Run"
```
✅ Creates: 15 tables with all columns, constraints, and relationships

#### 2️⃣ Functions
```sql
-- Copy all contents from: 02_functions.sql
-- Paste and Run
```
✅ Creates: 6 custom functions for authorization and utilities

#### 3️⃣ Triggers
```sql
-- Copy all contents from: 03_triggers.sql
-- Paste and Run
```
✅ Creates: 5 triggers for auto-updating timestamps

#### 4️⃣ RLS Policies
```sql
-- Copy all contents from: 04_rls.sql
-- Paste and Run
```
✅ Creates: 40+ security policies for data protection

#### 5️⃣ Indexes
```sql
-- Copy all contents from: 05_indexes.sql
-- Paste and Run
```
✅ Creates: 30+ indexes for query performance

#### 6️⃣ Seed Data
```sql
-- Copy all contents from: 06_seed.sql
-- Paste and Run
```
✅ Inserts: 2 roles (buyer, publisher) + 10 categories

#### 7️⃣ Security Fixes
```sql
-- Copy all contents from: 07_security_fixes.sql
-- Paste and Run
```
✅ Applies: row-level security hardening, profile privacy, sign-up trigger, database-generated notifications, and statistics functions

#### 8️⃣ Enable Realtime
```sql
-- Type this directly in SQL Editor:
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```
✅ Enables: Real-time notifications subscription

### Step 3: Verify Setup

Run this verification query:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Result**: Should return 15 tables:
- categories
- collaborators
- comments
- discussions
- model_categories
- model_files
- models
- notifications
- ratings
- roles
- subscriptions
- user_activities
- user_roles
- users
- views

## 🔍 What Each Component Does

### Tables (01_schema.sql)
- **users**: User profiles
- **roles** + **user_roles**: Dual-role system (buyer/publisher)
- **models**: AI model listings
- **categories** + **model_categories**: Model categorization
- **collaborators**: Multi-user model management
- **subscriptions**: Buyer-model relationships
- **ratings**: 5-star rating system
- **discussions** + **comments**: Community features
- **notifications**: Real-time alerts
- **views**: Page view analytics
- **user_activities**: Activity tracking
- **model_files**: File management

### Functions (02_functions.sql)
1. `update_updated_at_column()` - Auto-update timestamps
2. `is_model_owner()` - Check model ownership
3. `is_collaborator_by_email()` - Check collaborator status
4. `create_user_with_role()` - User creation with role
5. `create_notification()` - Notification creation (server-only after `07_security_fixes.sql`)
6. `add_email_identity_to_user()` - Link email sign-in to a Google account (server-only after `07_security_fixes.sql`)

### Triggers (03_triggers.sql)
- Auto-update `updated_at` on:
  - models
  - users
  - discussions
  - comments
  - ratings

### RLS Policies (04_rls.sql)
Security rules ensuring:
- Users see only their data
- Published models are public
- Draft models are private
- Collaborators have proper access
- Subscribers can access files
- Privacy for notifications and activities

### Indexes (05_indexes.sql)
Performance optimizations for:
- Foreign key lookups
- Common filter queries (status, dates)
- Search operations
- Join operations

### Seed Data (06_seed.sql)
Initial data:
- **Roles**: buyer, publisher
- **Categories**: NLP, Computer Vision, Speech Recognition, etc.

### Security Fixes (07_security_fixes.sql)
Hardens the access rules from 04 and adds the functions the app now depends on. **Required:** the app will not work correctly without it.

- **Identity:** `current_user_email()` returns the caller's verified login email, and collaborator access is based on it, never the editable profile email. `add_email_identity_to_user()` and `create_notification()` can only be called by the server (service role).
- **Account creation:** the `on_auth_user_created` trigger (`handle_new_auth_user()`) creates the profile and requested portal role at sign-up. `create_user_with_role()` now only acts on the caller's own account.
- **Profiles:** `can_view_user()` limits who can see a profile. Phone, company and bio are readable only by their owner, through `get_my_profile()`. `protect_user_email` keeps the profile email equal to the login email, and emails are unique regardless of letter case.
- **Models:** a model can only be created under the caller's account, and `prevent_model_owner_change` stops ownership from changing.
- **Subscriptions:** only for free, published models. `prevent_subscription_key_change` stops a subscription moving to another buyer or model. Collaborators can read their models' subscribers.
- **Discussions and comments:** always posted as the caller. The author names are set by triggers (`set_discussion_author_name`, `set_comment_author_names`). The model's owner and collaborators can delete them.
- **Views and statistics:** a view is recorded once per user per model, and viewing history is private. Totals come from `get_model_view_stats()`, `get_model_view_timestamps()`, `get_model_download_counts()` and `get_model_subscriber_counts()`.
- **Ratings:** a model's owner and collaborators can't rate it. The `refresh_model_rating` trigger keeps the stored average and count current.
- **Categories:** custom categories are attributed to their creator and limited to 100 characters.
- **Storage:** creates the three `model-files` bucket policies (upload into managed models only; download by owner, collaborators and active subscribers; delete by owner and collaborators).
- **Notifications:** created only by `notify_event()`. It checks that the caller really performed the action, then decides the recipients and wording itself.

## ⚠️ Important Notes

### Do NOT Skip Files
- Files must be run in order (dependencies exist)
- Skipping files will cause errors in later steps

### RLS is Critical
- Never disable RLS without understanding impact
- RLS policies protect user data
- Application security depends on proper RLS

### Backup Before Changes
- Export existing data before modifications
- Use Supabase dashboard backup features

## 🐛 Troubleshooting

### "relation does not exist"
**Cause**: Skipped schema file or typo in table name
**Fix**: Run `01_schema.sql` again

### "function does not exist"
**Cause**: Functions not created
**Fix**: Run `02_functions.sql`

### "permission denied"
**Cause**: RLS blocking access
**Fix**: Check RLS policies or use service role key for testing

### "duplicate key value violates unique constraint"
**Cause**: Re-running seed data
**Fix**: Normal - seed uses `ON CONFLICT DO NOTHING`

## 📊 Database Stats

After complete setup (01–07):
- **Tables**: 15, all with Row Level Security
- **Functions**: 22
- **Triggers**: 11 on application tables, plus `on_auth_user_created` on `auth.users`
- **RLS Policies**: 40+ on application tables, plus 3 storage policies
- **Indexes**: 30+ (plus primary keys and unique constraints)
- **Foreign Keys**: 25+
- **Check Constraints**: 10+

## 🔐 Security Features

✅ Row Level Security enabled on all tables
✅ Foreign key constraints enforce referential integrity
✅ Check constraints validate data
✅ Unique constraints prevent duplicates
✅ Cascade deletes maintain data consistency
✅ Security definer functions for admin operations, with privileged ones callable only by the server
✅ Access decisions use the verified login email, never editable profile data
✅ Private profile fields (phone, company, bio) readable only by their owner
✅ Notifications created only by the database, after checking the caller's action
✅ Automated tests for these rules: `npm run test:security` (see the main README)

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **SQL Tutorial**: https://www.postgresqltutorial.com/

---

Need help? Check the main `README.md` in the project root.
