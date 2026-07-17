'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

const t = {
  vi: {
    heroTitle: 'Mô Hình Kinh Doanh',
    heroSub: 'Đơn giản, hiệu quả — AvaB tập trung 100% vào chất lượng khoá học Toán Tư Duy cho trẻ.',
    coreProductTitle: 'Sản phẩm cốt lõi',
    coreProductSub: 'Khoá học luyện thi học bổng vào Lớp 1',
    topicTitle: '25 Chuyên đề Toán Tư Duy',
    topicDesc: 'Nội dung được xây dựng bởi chính các học sinh xuất sắc đạt giải quốc tế — đúng cấu trúc đề thi các trường chất lượng cao Hà Nội.',
    onlineTitle: 'Khoá học theo nhóm online',
    onlineDesc: 'Dạy theo nhóm tối đa 15 học sinh — giáo viên giỏi, lịch linh hoạt.',
    priceLabel: 'VND / năm / học sinh',
    revenueTitle: '💰 2 Nguồn doanh thu chính',
    rev1Title: 'Bán khoá học trực tiếp',
    rev1Desc: 'Phụ huynh đăng ký mua trực tiếp qua website avab.vn hoặc qua mạng xã hội Facebook, Zalo.',
    rev1Items: ['Đăng ký online', 'Thanh toán chuyển khoản', 'Cộng đồng 590+ phụ huynh/năm'],
    rev2Title: 'Hợp tác trường học',
    rev2Desc: 'Hợp tác với các trường học, trung tâm dạy thêm để đưa chương trình AvaB vào giảng dạy.',
    rev2Items: ['Hợp đồng theo năm học', 'Tư vấn & triển khai tại trường', 'Đào tạo giáo viên sử dụng nền tảng'],
    channelsTitle: '🤝 Kênh phân phối',
    channels: [
      { icon: '🌐', label: 'Website', desc: 'avab.vn — đăng ký và thanh toán trực tiếp' },
      { icon: '👥', label: 'Đại lý phụ huynh', desc: 'Phụ huynh có con học giới thiệu — hoa hồng 15–20%' },
      { icon: '📱', label: 'Mạng xã hội', desc: 'Cộng đồng Zalo/Facebook 590+ phụ huynh/năm' },
    ],
    ctaTitle: 'Tầm nhìn 2035: Doanh thu 15 tỷ VND',
    ctaDesc: 'Từ nền tảng khoá học luyện thi lớp 1 đã được chứng minh, AvaB đang mở rộng sang hợp tác trường học và chuẩn bị các môn học mới.',
    ctaBtn: 'Tham gia cùng AvaB →',
  },
  en: {
    heroTitle: 'Business Model',
    heroSub: 'Simple, effective — AvaB is 100% focused on the quality of its Math Thinking courses for children.',
    coreProductTitle: 'Core Product',
    coreProductSub: 'Grade 1 scholarship exam prep course',
    topicTitle: '25 Math Thinking Topics',
    topicDesc: 'Content built by top-achieving students who won international awards — matching the structure of entrance exams at Hanoi\'s best schools.',
    onlineTitle: 'Group Online Sessions',
    onlineDesc: 'Group sessions (max 15 students) — skilled tutors, flexible schedules.',
    priceLabel: 'VND / year / student',
    revenueTitle: '💰 2 Core Revenue Streams',
    rev1Title: 'Direct course sales',
    rev1Desc: 'Parents register and purchase directly through avab.vn or via Facebook and Zalo social channels.',
    rev1Items: ['Online registration', 'Bank-transfer payment', 'Community of 590+ parents/year'],
    rev2Title: 'School partnerships',
    rev2Desc: 'Partnering with schools and tutoring centres to bring the AvaB curriculum into their teaching.',
    rev2Items: ['Annual school contracts', 'On-site consulting & implementation', 'Teacher training on the platform'],
    channelsTitle: '🤝 Distribution Channels',
    channels: [
      { icon: '🌐', label: 'Website', desc: 'avab.vn — direct registration and payment' },
      { icon: '👥', label: 'Parent agents', desc: 'Parents with enrolled children refer others — 15–20% commission' },
      { icon: '📱', label: 'Social media', desc: 'Zalo/Facebook community of 590+ parents/year' },
    ],
    ctaTitle: 'Vision 2035: 15B VND Revenue',
    ctaDesc: 'Building on the proven Grade 1 exam-prep course, AvaB is expanding into school partnerships and preparing new subject offerings.',
    ctaBtn: 'Join AvaB →',
  },
}

export default function MoHinhKinhDoanhPage() {
  const { lang } = useLang()
  const ui = t[lang]

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="gradient-hero text-white py-16">
        <div className="container-custom text-center">
          <div className="text-6xl mb-4">💡</div>
          <h1 className="text-2xl md:text-4xl font-black mb-4">{ui.heroTitle}</h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg">
            {ui.heroSub}
          </p>
        </div>
      </div>

      <div className="container-custom py-16 space-y-14 max-w-4xl mx-auto">

        {/* Core product */}
        <section className="bg-gradient-to-br from-cherry-50 to-teal-50 rounded-4xl p-8 md:p-10 border border-cherry-100">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">{ui.coreProductTitle}</h2>
            <p className="text-gray-500 mt-2">{ui.coreProductSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{ui.topicTitle}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {ui.topicDesc}
              </p>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {['Lương Thế Vinh','Nguyễn Siêu','Vinschool','THCS Ngô Sĩ Liên','Và nhiều trường khác'].map(s => (
                  <li key={s} className="flex items-center gap-2"><span className="text-cherry-400">✓</span>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{ui.onlineTitle}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {ui.onlineDesc}
              </p>
              <div className="bg-cherry-50 rounded-2xl p-4 text-center">
                <div className="text-3xl font-black text-cherry-700">1,5 triệu</div>
                <div className="text-gray-500 text-sm">{ui.priceLabel}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2 revenue sources */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">
            {ui.revenueTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                num: '01',
                title: ui.rev1Title,
                icon: '👨‍👩‍👧',
                color: 'border-cherry-200 bg-cherry-50',
                numColor: 'text-cherry-500',
                desc: ui.rev1Desc,
                items: ui.rev1Items,
              },
              {
                num: '02',
                title: ui.rev2Title,
                icon: '🏫',
                color: 'border-teal-200 bg-teal-50',
                numColor: 'text-teal-600',
                desc: ui.rev2Desc,
                items: ui.rev2Items,
              },
            ].map((src) => (
              <div key={src.num} className={`rounded-4xl border-2 p-6 ${src.color}`}>
                <div className={`text-5xl font-black mb-3 ${src.numColor} opacity-30`}>{src.num}</div>
                <div className="text-3xl mb-3">{src.icon}</div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{src.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{src.desc}</p>
                <ul className="space-y-1.5">
                  {src.items.map(i => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Distribution */}
        <section className="bg-white rounded-4xl border-2 border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6">{ui.channelsTitle}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {ui.channels.map((k) => (
              <div key={k.label} className="text-center p-4 rounded-3xl bg-gray-50">
                <div className="text-4xl mb-2">{k.icon}</div>
                <div className="font-bold text-gray-900 text-sm mb-1">{k.label}</div>
                <div className="text-gray-500 text-xs">{k.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="gradient-hero rounded-4xl p-8 text-white text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-2xl font-black mb-2">{ui.ctaTitle}</h3>
          <p className="text-white/80 mb-5 max-w-lg mx-auto">
            {ui.ctaDesc}
          </p>
          <Link href="/lien-he" className="inline-block bg-white text-cherry-700 font-extrabold px-8 py-3 rounded-2xl hover:scale-105 transition-all">
            {ui.ctaBtn}
          </Link>
        </div>

      </div>
    </div>
  )
}
