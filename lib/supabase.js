// lib/supabase.js
// Enhanced Supabase client with proper error handling for Misti Italian Learning App

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables with helpful error messages
if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  console.error('💡 Check your .env.local file or Vercel environment variables')
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  console.error('💡 Check your .env.local file or Vercel environment variables')
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('❌ Invalid NEXT_PUBLIC_SUPABASE_URL format:', supabaseUrl)
  throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Also export the URL and key for any components that need them directly
export const SUPABASE_URL = supabaseUrl
export const SUPABASE_ANON_KEY = supabaseAnonKey

// Optional: Export a function to test the connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection test error:', error.message)
    return false
  }
}

// Export a function to get a fresh client if needed
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
