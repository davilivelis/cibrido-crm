import { notFound } from 'next/navigation'
import { getAdminClientDetail } from '@/lib/actions/admin'
import ClientDetailClient from './ClientDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params

  try {
    const data = await getAdminClientDetail(id)
    return <ClientDetailClient data={data} clinicId={id} />
  } catch {
    notFound()
  }
}
