import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xfwmradfsfbhcbqvrhxe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmd21yYWRmc2ZiaGNicXZyaHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjEwMDAsImV4cCI6MjA5Mjc5NzAwMH0.kiWIyvg3eT5HHE_mu0KOEn0LKJiWkcccPUyg6E24ang'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)