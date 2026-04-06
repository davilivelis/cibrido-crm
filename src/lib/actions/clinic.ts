'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function updateClinic(data: {
  name: string
  phone: string
  email: string
  address: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  // Verifica clínica via RPC (funciona sem GRANT nas tabelas)
  const { data: clinicId } = await supabase.rpc('get_user_clinic_id')

  const admin = createAdminClient()

  if (!clinicId) {
    // Novo usuário sem clínica → cria via admin client
    const { data: newClinic, error: clinicErr } = await admin
      .from('clinics')
      .insert({
        name:      data.name.trim() || 'Minha Clínica',
        slug:      'clinica-' + user.id.slice(0, 8),
        plan:      'trial',
        is_active: true,
      })
      .select('id')
      .single()

    if (clinicErr) {
      // Se admin client também falha, salva nos metadados e segue
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          name:               data.name.trim() || 'Usuário',
          clinic_name:        data.name.trim() || 'Minha Clínica',
          phone:              data.phone.trim() || null,
          onboarding_complete: true,
        },
      })
      revalidatePath('/dashboard')
      return
    }

    // Cria perfil de usuário
    await admin.from('users').upsert({
      id:        user.id,
      clinic_id: newClinic.id,
      name:      user.user_metadata?.full_name || data.name.trim() || 'Usuário',
      email:     user.email ?? '',
      role:      'owner',
      is_active: true,
    })

    // Salva nos metadados do auth para acesso rápido
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        clinic_id:           newClinic.id,
        clinic_name:         data.name.trim() || 'Minha Clínica',
        name:                user.user_metadata?.full_name || data.name.trim() || 'Usuário',
        role:                'owner',
        onboarding_complete: true,
      },
    })
  } else {
    // Atualiza clínica existente
    await admin.from('clinics').update({
      name:    data.name.trim()  || undefined,
      phone:   data.phone.trim() || null,
      email:   data.email.trim() || null,
      address: data.address.trim() || null,
    }).eq('id', clinicId)

    // Atualiza metadados
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        clinic_name:         data.name.trim() || user.user_metadata?.clinic_name,
        onboarding_complete: true,
      },
    })
  }

  revalidatePath('/configuracoes')
  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
}

export async function inviteUser(data: {
  email: string
  name: string
  role: string
}): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: 'Configuração do servidor incompleta. Contate o suporte.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { data: clinicId } = await supabase.rpc('get_user_clinic_id')
    if (!clinicId) return { error: 'Clínica não encontrada' }

    const { supabaseAdmin } = await import('@/lib/supabase/admin')

    // Gera senha temporária forte (usuário pode redefinir depois)
    const tempPassword = crypto.randomUUID().replace(/-/g, '') + 'Aa1!'

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email:         data.email.trim(),
      password:      tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name.trim(),
        name:      data.name.trim(),
        role:      data.role,
        clinic_id: clinicId,
      },
    })

    if (error) {
      const msg = error.message
      if (msg.toLowerCase().includes('already')) return { error: 'Este email já está cadastrado.' }
      return { error: msg }
    }

    if (!created.user) return { error: 'Erro ao criar usuário' }

    // Garante perfil na tabela users (trigger do banco pode ter rodado, upsert é seguro)
    const { error: upsertError } = await supabaseAdmin.from('users').upsert({
      id:        created.user.id,
      clinic_id: clinicId,
      name:      data.name.trim(),
      email:     data.email.trim(),
      role:      data.role,
      is_active: true,
    }, { onConflict: 'id' })

    if (upsertError) return { error: 'Usuário criado mas erro ao salvar perfil: ' + upsertError.message }

    revalidatePath('/configuracoes')
    return { success: true }
  } catch (err: unknown) {
    console.error('[inviteUser]', err)
    return { error: 'Erro interno ao convidar membro. Tente novamente.' }
  }
}
