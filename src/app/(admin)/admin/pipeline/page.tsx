import { getCibridoLeads } from '@/lib/actions/admin'
import PipelineClient from './PipelineClient'

export default async function PipelinePage() {
  const leads = await getCibridoLeads()
  return <PipelineClient leads={leads} />
}
