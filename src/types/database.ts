// Tipos TypeScript espelhando exatamente o schema do banco
// Cada interface = 1 tabela no Supabase

export type UserRole = 'owner' | 'gestor' | 'atendente'
export type ClinicPlan = 'trial' | 'basic' | 'pro'
export type LeadStatus = 'active' | 'lost' | 'converted'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'
export type CampaignStatus = 'active' | 'paused' | 'ended'
export type CampaignPlatform = 'meta' | 'google' | 'tiktok'
export type LeadEventType = 'stage_change' | 'note' | 'call' | 'whatsapp' | 'appointment'

export interface Clinic {
  id: string
  name: string
  slug: string
  phone: string | null
  email: string | null
  address: string | null
  plan: ClinicPlan
  trial_ends_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  clinic_id: string
  name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  clinic_id: string
  name: string
  color: string
  position: number
  is_active: boolean
  created_at: string
}

export interface Lead {
  id: string
  clinic_id: string
  stage_id: string | null
  assigned_to: string | null
  name: string
  phone: string
  email: string | null
  source: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  notes: string | null
  status: LeadStatus
  lost_reason: string | null
  converted_at: string | null
  created_at: string
  updated_at: string
}

export interface LeadEvent {
  id: string
  clinic_id: string
  lead_id: string
  user_id: string | null
  type: LeadEventType
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Conversation {
  id: string
  clinic_id: string
  lead_id: string
  channel: 'whatsapp' | 'sms' | 'email'
  direction: MessageDirection
  content: string
  media_url: string | null
  media_type: 'image' | 'audio' | 'document' | 'video' | null
  sent_by: string | null
  external_id: string | null
  status: MessageStatus
  created_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  lead_id: string
  scheduled_by: string | null
  title: string
  scheduled_at: string
  duration_min: number
  status: AppointmentStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  clinic_id: string
  name: string
  platform: CampaignPlatform
  status: CampaignStatus
  budget_monthly: number | null
  spent_total: number
  impressions: number
  clicks: number
  leads_generated: number
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

// Tipos com joins (usado em queries com dados relacionados)
export interface LeadWithStage extends Lead {
  stage: PipelineStage | null
  assigned_user: User | null
}

export interface AppointmentWithLead extends Appointment {
  lead: Lead
}

// Status do recall
export type RecallStatus = 'pending' | 'contacted' | 'scheduled' | 'done' | 'cancelled'

export interface Recall {
  id: string
  clinic_id: string
  lead_id: string
  assigned_to: string | null
  recall_date: string        // DATE — formato YYYY-MM-DD
  reason: string
  notes: string | null
  status: RecallStatus
  contacted_at: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

// Recall com dados do lead e responsável
export interface RecallWithLead extends Recall {
  lead: Pick<Lead, 'id' | 'name' | 'phone'>
  assigned_user: Pick<User, 'id' | 'name'> | null
}
