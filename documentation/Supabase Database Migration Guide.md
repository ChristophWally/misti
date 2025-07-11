# Supabase Database Migration Guide

## Overview

This guide walks you through migrating a Supabase project from one region to another (e.g., US East to EU West). Since Supabase doesn't allow changing regions on existing projects, this process involves creating a new project and migrating all data, schema, and configuration.

**Total Time Required:** 45-60 minutes  
**Downtime:** Temporary (during environment variable update)

## Prerequisites

Before starting, ensure you have:
- Access to your current Supabase project
- Admin access to your Vercel deployment (or wherever your app is hosted)
- A text editor to save backup data temporarily

## Phase 1: Backup Current Database

### Step 1: Export Database Schema

1. **Access your current Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your existing project

2. **Get exact table structures**
   - Go to SQL Editor in the left sidebar
   - Create a new query and run:
   ```sql
   SELECT 
     table_name,
     'CREATE TABLE ' || table_name || ' (' ||
     string_agg(
       column_name || ' ' || 
       CASE 
         WHEN data_type = 'USER-DEFINED' THEN udt_name
         ELSE data_type 
       END ||
       CASE WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')' 
            ELSE '' END ||
       CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
       CASE WHEN column_default IS NOT NULL 
            THEN ' DEFAULT ' || column_default 
            ELSE '' END,
       ', ' ORDER BY ordinal_position
     ) || ');' as create_statement
   FROM information_schema.columns 
   WHERE table_schema = 'public'
   GROUP BY table_name
   ORDER BY table_name;
   ```

3. **Save the results** - Copy all CREATE TABLE statements to a text file

### Step 2: Export Data from All Tables

1. **Check which tables contain data**
   ```sql
   SELECT schemaname,tablename,n_tup_ins as "rows"
   FROM pg_stat_user_tables 
   WHERE schemaname='public' AND n_tup_ins > 0
   ORDER BY n_tup_ins DESC;
   ```

2. **Export data from each table with content**
   For each table that contains data, run:
   ```sql
   SELECT * FROM [table_name];
   ```
   Save the results as CSV or copy the data for later import.

### Step 3: Document Current Configuration

1. **Get current environment variables**
   - Go to Settings → API in your Supabase dashboard
   - Note down:
     - Project URL (e.g., `https://[project-id].supabase.co`)
     - Anon/public key (the JWT token)

2. **Check storage buckets**
   - Go to Storage in the left sidebar
   - Note any existing buckets and their contents
   - Download important files if needed

## Phase 2: Create New Project

### Step 1: Initialize New Supabase Project

1. **Create the new project**
   - Go to https://supabase.com/dashboard
   - Click "New project"
   - Configure settings:
     - **Name:** Choose a descriptive name (e.g., `[project-name]-eu`)
     - **Database Password:** Create a strong password and save it
     - **Region:** Select your target region (e.g., "West Europe (UK)")
     - **Pricing Plan:** Free (or your preferred tier)

2. **Wait for project creation**
   - Project setup takes 2-3 minutes
   - Don't proceed until you can access the new dashboard

### Step 2: Recreate Database Schema

1. **Access SQL Editor in the new project**
   - Go to SQL Editor → Create new query

2. **Execute schema creation**
   - Paste and run your saved CREATE TABLE statements from Phase 1
   - Fix any syntax errors (common issues):
     - Array declarations: Use `text[]` instead of `ARRAY`
     - UUID references: Ensure proper foreign key syntax

3. **Verify table creation**
   - Go to Table Editor to confirm all tables exist
   - Check that column types and constraints match your original schema

### Step 3: Configure Security and Policies

1. **Enable Row Level Security**
   ```sql
   -- Enable RLS on user-specific tables
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE deck_words ENABLE ROW LEVEL SECURITY;
   
   -- Enable RLS on shared tables (with public access)
   ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;
   ALTER TABLE word_forms ENABLE ROW LEVEL SECURITY;
   ALTER TABLE word_audio_metadata ENABLE ROW LEVEL SECURITY;
   ```

2. **Create access policies**
   ```sql
   -- User profile policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);
   
   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);
   
   -- Deck policies
   CREATE POLICY "Users can manage own decks" ON decks
     FOR ALL USING (auth.uid() = user_id);
   
   -- Deck words policies
   CREATE POLICY "Users can manage their deck words" ON deck_words
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM decks 
         WHERE decks.id = deck_words.deck_id 
         AND decks.user_id = auth.uid()
       )
     );
   
   -- Public read access for shared content
   CREATE POLICY "Dictionary is publicly readable" ON dictionary
     FOR SELECT TO PUBLIC USING (true);
   
   CREATE POLICY "Word forms are publicly readable" ON word_forms
     FOR SELECT TO PUBLIC USING (true);
   
   CREATE POLICY "Audio metadata is publicly readable" ON word_audio_metadata
     FOR SELECT TO PUBLIC USING (true);
   ```

### Step 4: Set Up Storage

1. **Create storage buckets**
   - Go to Storage → Create bucket
   - Create buckets matching your original setup (e.g., `audio-files`)
   - Keep buckets private unless specifically needed public

2. **Configure storage policies**
   ```sql
   -- Allow authenticated users to read files
   CREATE POLICY "Allow authenticated users to read audio files" 
   ON storage.objects FOR SELECT 
   TO authenticated 
   USING (bucket_id = 'audio-files');
   
   -- Allow service role to manage files
   CREATE POLICY "Allow service role to manage audio files" 
   ON storage.objects FOR ALL 
   TO service_role 
   USING (bucket_id = 'audio-files');
   ```

## Phase 3: Data Migration

### Step 1: Import Data

1. **Format your saved data for import**
   - Convert CSV data to SQL INSERT statements
   - Handle array fields properly (use `ARRAY['item1','item2']` syntax)
   - Preserve UUIDs and timestamps exactly

2. **Execute data imports**
   ```sql
   -- Example format for dictionary data
   INSERT INTO dictionary (id, italian, english, word_type, created_at, tags, phonetic_pronunciation, image_url, audio_url, updated_at, audio_filename) VALUES
   ('uuid-here', 'italian-word', 'english-translation', 'WORD_TYPE', 'timestamp', ARRAY['tag1','tag2'], 'pronunciation', null, null, 'timestamp', null);
   ```

3. **Verify data integrity**
   ```sql
   -- Check row counts match original
   SELECT 'dictionary' as table_name, count(*) FROM dictionary
   UNION ALL
   SELECT 'profiles', count(*) FROM profiles
   UNION ALL
   SELECT 'decks', count(*) FROM decks;
   ```

### Step 2: Upload Files (if applicable)

1. **Upload files to storage buckets**
   - Use Supabase dashboard file upload for small quantities
   - Use Supabase CLI or API for bulk uploads

2. **Verify file access**
   - Test that files are accessible with proper authentication
   - Check that storage policies work correctly

## Phase 4: Application Update

### Step 1: Update Environment Variables

1. **Get new connection details**
   - In new project: Settings → API
   - Copy the new Project URL and Anon key

2. **Update your hosting platform**
   - **For Vercel:**
     - Go to your project → Settings → Environment Variables
     - Update `NEXT_PUBLIC_SUPABASE_URL` with new project URL
     - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with new anon key
     - Redeploy your application

   - **For other platforms:**
     - Update environment variables according to your platform's process
     - Ensure changes are applied to production environment

### Step 2: Test Migration

1. **Verify application functionality**
   - Test database reads (should see migrated data)
   - Test authentication (users may need to log in again)
   - Test any file uploads/downloads
   - Verify that all features work as expected

2. **Monitor for issues**
   - Check application logs for connection errors
   - Verify that queries return expected data
   - Test user-specific functionality

## Phase 5: Cleanup

### Step 1: Validate Complete Migration

1. **Comprehensive testing**
   - Test all major application features
   - Verify data integrity and completeness
   - Confirm performance is acceptable

2. **User communication**
   - If you have existing users, notify them of the migration
   - Inform them they may need to log in again
   - Provide support for any migration-related issues

### Step 2: Decommission Old Project

1. **Pause the old project (recommended initially)**
   - Go to old project → Settings → General
   - Click "Pause project"
   - This keeps the project recoverable but inactive

2. **Delete old project (after confidence period)**
   - Only after you're certain the migration is successful
   - Go to Settings → General → "Delete project"
   - Type project name to confirm deletion

## Troubleshooting Common Issues

### Schema Migration Problems

**Array field syntax errors:**
- Use `text[]` instead of `ARRAY` in column definitions
- Use `ARRAY['item1','item2']` in INSERT statements

**Foreign key constraint errors:**
- Ensure referenced tables exist before creating tables with foreign keys
- Check that UUID formats are preserved exactly

### Data Import Issues

**Character encoding problems:**
- Ensure your data export/import uses UTF-8 encoding
- Special characters in Italian text may cause issues with wrong encoding

**Timestamp format errors:**
- Preserve exact timestamp formats from original database
- Include timezone information (`+00` suffix)

### Authentication Issues

**Users can't access data:**
- Verify Row Level Security policies are correctly configured
- Check that user IDs are preserved during migration
- Confirm that authentication is working in the new project

### Performance Issues

**Slow queries after migration:**
- Recreate indexes that may not have been included in schema export
- Run `ANALYZE` on tables to update query statistics
- Monitor query performance and add indexes as needed

## Best Practices

1. **Test the migration process** on a development copy first if possible
2. **Communicate downtime** to users in advance
3. **Keep the old project paused** for at least a week before deletion
4. **Document any custom configurations** that need to be recreated
5. **Verify backups** are working in the new environment
6. **Monitor application performance** after migration for any issues

## Recovery Plan

If issues arise after migration:

1. **Immediate rollback:** Update environment variables back to old project
2. **Unpause old project** if it was paused
3. **Investigate issues** in new project while old project serves users
4. **Fix problems** and re-attempt migration
5. **Always maintain ability to rollback** until confident in new setup

This migration process ensures a complete and safe transition between Supabase regions while maintaining data integrity and application functionality.
