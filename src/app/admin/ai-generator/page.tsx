import { redirect } from 'next/navigation'

// Consolidated into /admin/ai-studio (Principle 3: One Feature One Home)
export default function AIGeneratorRedirect() {
  redirect('/admin/ai-studio')
}
