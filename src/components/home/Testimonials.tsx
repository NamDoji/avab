export function Testimonials() {
  const testimonials = [
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
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-purple-50 to-teal-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-purple-600 font-bold uppercase text-sm tracking-wider">Phụ huynh nói gì</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
            Hàng trăm gia đình{' '}
            <span className="text-gradient">tin tưởng AvaB</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 card-hover">
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
