import { redirect } from 'next/navigation'

// Consolidated into /admin/organizations (Principle 3: One Feature One Home)
export default function SchoolsRedirect() {
  redirect('/admin/organizations')
}
