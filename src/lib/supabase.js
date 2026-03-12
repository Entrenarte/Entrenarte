import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elguacpepvyxdpdyfnhd.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PEKyH6-u4jGdNcbnbX3JvQ_YzepvMl4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
