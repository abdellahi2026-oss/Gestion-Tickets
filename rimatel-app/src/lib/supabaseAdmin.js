import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔑 Supabase Admin Config:', {
  url: supabaseUrl,
  hasServiceKey: !!import.meta.env.VITE_SUPABASE_SERVICE_KEY,
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
})

// Admin client for user management
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

