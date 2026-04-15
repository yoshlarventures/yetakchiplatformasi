import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xabqxntjdgkieiqkmbzx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYnF4bnRqZGdraWVpcWttYnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDgxMTEsImV4cCI6MjA5MTc4NDExMX0.Kk4pET422r8vQP-SKJ6yJeSRkaVFTiNDvK2hBheSGdk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket nomi
export const STORAGE_BUCKET = 'projects';
