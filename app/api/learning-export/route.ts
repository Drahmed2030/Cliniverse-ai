import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '../../supabase'
import { createLearningExportHandler } from '../../lib/learningExport/handler'
export const runtime='nodejs'
export const GET=createLearningExportHandler(token=>createClient(supabaseUrl,supabaseAnonKey,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}}))
