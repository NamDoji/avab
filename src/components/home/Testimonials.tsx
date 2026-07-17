'use client'

import { useLang } from '@/contexts/LanguageContext'

export function Testimonials() {
  const { lang } = useLang()
  const vi = lang === 'vi'

  const testimonials = vi ? [
    {
      name: 'Chị Thanh Hương',
      child: 'Con Minh Khoa, 5 tuổi',
      avatar: '👩',
      text: 'Con tôi rất thích học AvaB vì bài tập hiển thị hình ảnh sinh động, con tự làm được mà không cần nhắc. Sau 2 tháng luyện, con đã vào được trường Nguyễn Siêu!',
      stars: 5,
    },
    {
      name: 'Anh Quốc Tuấn',
      child: 'Con Bảo Châu, 5 tuổi',
      avatar: '👨',
      text: 'Điều tôi thích nhất là hệ thống chấm bài tự động và bảng xếp hạng — con rất hứng khởi khi thấy tên mình lên cao. Phương pháp giảng dạy rất khoa học.',
      stars: 5,
    },
    {
      name: 'Chị Mai Anh',
      child: 'Con Gia Huy, 5 tuổi',
      avatar: '👩',
      text: 'Giáo viên nhiệt tình, tài liệu bài bản, giao diện đẹp và dễ dùng. Cả nhà đánh giá cao chương trình AvaB. Sẽ tiếp tục đăng ký cho kỳ sau.',
      stars: 5,
    },
  ] : [
    {
      name: 'Ms. Thanh Huong',
      child: 'Child: Minh Khoa, age 5',
      avatar: '👩',
      text: 'My child loves AvaB because the exercises show vivid visuals — he works independently without prompting. After 2 months he was admitted to Nguyễn Siêu school!',
      stars: 5,
    },
    {
      name: 'Mr. Quoc Tuan',
      child: 'Child: Bao Chau, age 5',
      avatar: '👨',
      text: 'What I love most is the auto-grading system and leaderboard — my child gets so motivated seeing his name climb up. The teaching methodology is very scientific.',
      stars: 5,
    },
    {
      name: 'Ms. Mai Anh',
      child: 'Child: Gia Huy, age 5',
      avatar: '👩',
      text: 'Dedicated teachers, quality materials, beautiful and easy-to-use interface. The whole family highly recommends AvaB. We will definitely re-enrol next term.',
      stars: 5,
    },
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-cherry-50 to-teal-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-cherry-600 font-bold uppercase text-sm tracking-wider">
            {vi ? 'Phụ huynh nói gì' : 'What parents say'}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
            {vi
              ? <> Hàng trăm gia đình{' '}<span className="text-gradient">tin tưởng AvaB</span></>
              : <> Hundreds of families{' '}<span className="text-gradient">trust AvaB</span></>}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-3xl p-6 shadow-sm border border-cherry-50 card-hover">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{t.avatar}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.child}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
