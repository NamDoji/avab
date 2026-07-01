import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react'

const painPoints = [
  'Con không có định hướng học tập rõ ràng, học mãi không tiến bộ',
  'Thiếu tài liệu chất lượng — tài liệu tràn lan nhưng thiếu hệ thống',
  'Áp lực kỳ thi cao, phụ huynh lo lắng không biết bắt đầu từ đâu',
  'Trẻ dễ nản khi học toán — cần phương pháp tư duy phù hợp lứa tuổi',
]

const solutions = [
  { icon: '🎯', title: 'Lộ trình cá nhân hoá', desc: 'Hệ thống chuyên đề được sắp xếp khoa học từ nền tảng đến nâng cao' },
  { icon: '🧠', title: 'Toán Tư Duy Đỉnh Cao', desc: 'Phương pháp độc quyền được phát triển bởi học sinh đạt giải quốc tế' },
  { icon: '🎮', title: 'Học mà như chơi', desc: 'Giao diện thân thiện, câu hỏi trực quan, phù hợp trẻ 5–6 tuổi' },
  { icon: '👨‍🏫', title: 'Giáo viên tận tâm', desc: 'Khoá học nhóm online tối đa 15 bạn — cam kết chất lượng, lịch linh hoạt' },
  { icon: '📊', title: 'Theo dõi tiến trình', desc: 'Bảng điểm real-time, phụ huynh nắm bắt tiến bộ của con mọi lúc' },
  { icon: '🏆', title: 'Kết quả được chứng minh', desc: 'Hàng trăm học viên đã đỗ vào các trường chất lượng cao Hà Nội' },
]

export function WhyAvab() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Pain points */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <AlertTriangle className="text-orange-500" size={24} />
            <span className="text-orange-600 font-bold uppercase text-sm tracking-wider">
              Bạn đang gặp phải?
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-8">
            Nỗi lo của hàng nghìn phụ huynh khi{' '}
            <span className="text-gradient">chuẩn bị cho con vào lớp 1</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {painPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <span className="text-orange-500 text-xl mt-0.5">😟</span>
                <p className="text-gray-700 text-sm font-medium">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Solutions */}
        <div>
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Lightbulb className="text-purple-600" size={24} />
            <span className="text-purple-600 font-bold uppercase text-sm tracking-wider">
              Giải pháp AvaB
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-10">
            Vì sao phụ huynh tin tưởng{' '}
            <span className="text-gradient">AvaB?</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {solutions.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 card-hover"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Origin story */}
        <div className="mt-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-4xl p-8 md:p-12 text-white text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-2xl md:text-3xl font-black mb-4">
            Câu chuyện khởi đầu của AvaB
          </h3>
          <p className="text-white/80 max-w-3xl mx-auto leading-relaxed text-base md:text-lg">
            AvaB ra đời từ ý tưởng khởi nghiệp của nhóm học sinh TenGo — những bạn trẻ đã chính mình 
            đạt nhiều giải cao tại các kỳ thi Toán Tư Duy Quốc Tế. Nhận thấy sự thiếu hụt về tài liệu 
            và phương pháp chất lượng cho trẻ 5–6 tuổi, nhóm đã xây dựng hệ thống bài giảng độc quyền 
            từ chính kinh nghiệm học và luyện thi của mình. Dự án đạt{' '}
            <strong className="text-yellow-300">Giải Nhất vòng Trường</strong>,{' '}
            <strong className="text-yellow-300">Giải Nhì cụm Nam–Bắc Từ Liêm</strong> và{' '}
            <strong className="text-yellow-300">Giải Ba Thành phố Hà Nội</strong> — Cuộc thi Ý tưởng Khởi nghiệp Sáng tạo.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <CheckCircle2 className="text-teal-300" size={20} />
            <span className="text-teal-300 font-semibold">Đã phục vụ phụ huynh và học viên từ năm 2021</span>
          </div>
        </div>
      </div>
    </section>
  )
}
