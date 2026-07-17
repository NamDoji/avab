'use client'

import { useLang } from '@/contexts/LanguageContext'

const years = [
  {
    year:    '2024 – 2025',
    members: '468+',
    buyers:  '135',
    zalo:    'https://zalo.me/g/bzcsls045',
    color:   'from-cherry-500 to-cherry-700',
    badge:   'bg-cherry-100 text-cherry-700',
    dot:     'bg-cherry-500',
  },
  {
    year:    '2025 – 2026',
    members: '590+',
    buyers:  '330',
    zalo:    'https://zalo.me/g/kmtfcc357',
    color:   'from-teal-500 to-teal-700',
    badge:   'bg-teal-100 text-teal-700',
    dot:     'bg-teal-500',
    current: true,
  },
  {
    year:    '2026 – 2027',
    members: '450+',
    buyers:  '250+',
    zalo:    'https://zalo.me/g/bzcsls045',
    color:   'from-blue-500 to-blue-700',
    badge:   'bg-blue-100 text-blue-700',
    dot:     'bg-blue-500',
  },
]

export function YearlyStats() {
  const { lang } = useLang()

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-cherry-100 text-cherry-700 text-xs font-black px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
            {lang === 'vi' ? '📊 Số liệu thực tế' : '📊 Real Numbers'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            {lang === 'vi' ? 'Hành trình 3 năm của AvaB' : '3 Years of AvaB'}
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            {lang === 'vi'
              ? 'Những con số thực tế từ cộng đồng phụ huynh và học viên tin tưởng đồng hành cùng AvaB.'
              : 'Real numbers from parents and students who trust AvaB.'}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cherry-200 via-teal-200 to-blue-200 -translate-x-1/2" />

          <div className="space-y-8 md:space-y-0">
            {years.map((y, i) => (
              <div key={y.year} className={`relative md:flex ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 mb-8`}>
                {/* Dot trên timeline */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-5 h-5 rounded-full border-4 border-white shadow-md ${y.dot}`} />
                </div>

                {/* Card */}
                <div className={`w-full md:w-[46%] ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  <div className={`relative rounded-3xl overflow-hidden shadow-lg ${y.current ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}>
                    {/* Header năm */}
                    <div className={`bg-gradient-to-r ${y.color} px-6 py-4 flex items-center justify-between`}>
                      <span className="text-white font-black text-lg">Năm {y.year}</span>
                      {y.current && (
                        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ✦ Hiện tại
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="bg-white px-6 py-5">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className={`rounded-2xl p-4 ${y.badge.replace('text-', 'bg-').replace('-700', '-50')}`}>
                          <p className="text-xs text-gray-500 mb-1">
                            {lang === 'vi' ? 'Thành viên tham gia' : 'Members joined'}
                          </p>
                          <p className={`text-2xl font-black ${y.badge.split(' ')[1]}`}>{y.members}</p>
                        </div>
                        <div className={`rounded-2xl p-4 ${y.badge.replace('text-', 'bg-').replace('-700', '-50')}`}>
                          <p className="text-xs text-gray-500 mb-1">
                            {lang === 'vi' ? 'Học viên mua khoá' : 'Enrolled students'}
                          </p>
                          <p className={`text-2xl font-black ${y.badge.split(' ')[1]}`}>{y.buyers}</p>
                        </div>
                      </div>

                      {/* Zalo group */}
                      <a href={y.zalo} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-sm font-semibold ${y.badge.split(' ')[1]} hover:opacity-80 transition`}>
                        <span className="text-base">💬</span>
                        {lang === 'vi' ? 'Tham gia nhóm Zalo' : 'Join Zalo group'}
                        <span className="ml-auto text-xs opacity-60">→</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Spacer bên kia (desktop) */}
                <div className="hidden md:block w-[46%]" />
              </div>
            ))}
          </div>
        </div>

        {/* Tổng cộng */}
        <div className="mt-8 bg-gradient-to-r from-cherry-600 to-teal-600 rounded-3xl p-6 md:p-8 text-white text-center">
          <p className="text-white/70 text-sm mb-3 uppercase tracking-wider font-semibold">
            {lang === 'vi' ? 'Tổng 3 năm hoạt động' : '3-year total'}
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { value: '1.500+', label: lang === 'vi' ? 'Thành viên' : 'Members' },
              { value: '715+',   label: lang === 'vi' ? 'Học viên' : 'Students' },
              { value: '3',      label: lang === 'vi' ? 'Nhóm Zalo' : 'Zalo groups' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-4xl md:text-5xl font-black text-yellow-300">{s.value}</p>
                <p className="text-white/80 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
