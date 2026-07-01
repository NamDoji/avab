import { Briefcase, Users, CheckCircle } from 'lucide-react'

interface RecruitmentItem {
  id: string
  title: string
  type: 'TEACHER' | 'AGENT'
  description: string
  requirements: string | null
  benefits: string | null
}

async function getRecruitments(): Promise<RecruitmentItem[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/recruitment`, {
      cache: 'no-store',
    })
    const data = await res.json()
    return data.success ? data.data : []
  } catch {
    return []
  }
}

function TypeBadge({ type }: { type: 'TEACHER' | 'AGENT' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
        type === 'TEACHER'
          ? 'bg-purple-100 text-purple-700'
          : 'bg-teal-100 text-teal-700'
      }`}
    >
      {type === 'TEACHER' ? <Users className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
      {type === 'TEACHER' ? 'Giáo viên' : 'Đại lý'}
    </span>
  )
}

export default async function TuyenDungPage() {
  const recruitments = await getRecruitments()
  const teachers = recruitments.filter((r) => r.type === 'TEACHER')
  const agents = recruitments.filter((r) => r.type === 'AGENT')

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Tuyển dụng</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Gia nhập đội ngũ AVAB — nơi đam mê giáo dục gặp gỡ cơ hội phát triển bền vững
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Giáo viên đang dạy', value: '50+', color: 'text-purple-600' },
            { label: 'Đại lý toàn quốc', value: '120+', color: 'text-teal-600' },
            { label: 'Tỉnh thành phủ sóng', value: '15+', color: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 text-center shadow-sm">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Job Listings */}
        {[
          { title: 'Vị trí Giáo viên', icon: Users, items: teachers, color: 'purple' },
          { title: 'Vị trí Đại lý', icon: Briefcase, items: agents, color: 'teal' },
        ].map(({ title, icon: Icon, items, color }) => (
          <section key={title} className="mb-10">
            <h2 className={`text-2xl font-bold text-${color}-700 flex items-center gap-2 mb-6`}>
              <Icon className="w-6 h-6" />
              {title}
            </h2>
            {items.length === 0 ? (
              <p className="text-gray-400 italic">Hiện chưa có vị trí tuyển dụng.</p>
            ) : (
              <div className="space-y-4">
                {items.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                      <TypeBadge type={job.type} />
                    </div>
                    <p className="text-gray-600 mb-4">{job.description}</p>

                    {job.requirements && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Yêu cầu:</h4>
                        <ul className="space-y-1">
                          {job.requirements.split('\n').filter(Boolean).map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {job.benefits && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Quyền lợi:</h4>
                        <ul className="space-y-1">
                          {job.benefits.split('\n').filter(Boolean).map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <a
                        href="mailto:tuyen-dung@avab.vn"
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
                      >
                        Ứng tuyển ngay
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
