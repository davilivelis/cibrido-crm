'use server'

// Server Actions — perfil do usuário logado
// Troca de nome e senha via supabase.auth.updateUser()

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Atualiza o nome exibido do usuário (tabela users + auth metadata)
export async function updateUserName(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const trimmed = name.trim()
  if (!trimmed) throw new Error('Nome não pode ser vazio')

  // Atualiza na tabela users (perfil interno)
  const { error: dbError } = await supabase
    .from('users')
    .update({ name: trimmed })
    .eq('id', user.id)

  if (dbError) throw new Error(dbError.message)

  // Atualiza também nos metadados do auth (exibido pelo Supabase)
  await supabase.auth.updateUser({ data: { full_name: trimmed } })

  revalidatePath('/perfil')
}

// Troca de senha — exige confirmação (new_password === confirm_password validado no cliente)
export async function updateUserPassword(newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  if (newPassword.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}
