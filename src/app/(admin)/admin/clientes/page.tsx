import { getAdminClients } from '@/lib/actions/admin'
import ClientesClient from './ClientesClient'

export default async function ClientesPage() {
  const clients = await getAdminClients()
  return <ClientesClient clients={clients} />
}
