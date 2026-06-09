import { createClient } from "@supabase/supabase-js";

// Safe loading with fallback to the configured MVGR Supabase Storage project credentials
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://zsmyweuwpvtnpvzreglr.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzbXl3ZXV3cHZ0bnB2enJlZ2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTQzNDgsImV4cCI6MjA5NjU3MDM0OH0.P0TGub90tEavxZpCaO4Jubf9GtJySu2JiVPZsk2_244";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
