import { redirect } from 'next/navigation'

// Consolidated into /admin/ai-studio/course-generator (Principle 3: One Feature One Home)
export default function ContentStudioRedirect() {
  redirect('/admin/ai-studio/course-generator')
}
