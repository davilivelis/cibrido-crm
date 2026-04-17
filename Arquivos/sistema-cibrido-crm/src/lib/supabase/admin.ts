// Cliente Supabase com service_role — bypassa RLS completamente.
// Use APENAS em server actions e route handlers, nunca no browser.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('[admin] SUPABASE_SERVICE_ROLE_KEY não configurada!')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Mantém compatibilidade com imports existentes
export function createAdminClient() {
  return supabaseAdmin
}
