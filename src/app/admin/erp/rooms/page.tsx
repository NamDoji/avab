import { redirect } from 'next/navigation'

// Rooms → redirect to classrooms (canonical home per PRINCIPLES One Feature One Home)
export default function RoomsPage() {
  redirect('/admin/erp/classrooms')
}
