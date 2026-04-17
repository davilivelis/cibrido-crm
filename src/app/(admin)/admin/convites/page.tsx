import { getInvites } from '@/lib/actions/admin'
import ConvitesClient from './ConvitesClient'

export default async function ConvitesPage() {
  const invites = await getInvites()
  return <ConvitesClient invites={invites} />
}
