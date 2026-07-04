import { redirect } from 'next/navigation'

// Workflow đã có tại /admin/workflow — redirect thay vì duplicate
export default function CollabWorkflowPage() {
  redirect('/admin/workflow')
}
