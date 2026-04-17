'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Cadastra usuário e confirma email automaticamente (sem precisar clicar em link)
export async function signUpConfirmed(data: {
  email: string
  password: string
  name: string
}) {
  const admin = createAdminClient()

  const { data: created, error } = await admin.auth.admin.createUser({
    email:         data.email.trim(),
    password:      data.password,
    email_confirm: true, // auto-confirma, usuário pode logar imediatamente
    user_metadata: { full_name: data.name.trim() },
  })

  if (error) {
    const msg = error.message
    if (msg.toLowerCase().includes('already')) throw new Error('Este email já está cadastrado.')
    throw new Error(msg)
  }

  return { userId: created.user?.id }
}
