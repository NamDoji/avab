import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật — AvaB',
  description: 'Chính sách bảo mật và quyền riêng tư của nền tảng học tập AvaB',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function ChinhSachBaoMatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-black mb-2">Chính sách bảo mật</h1>
          <p className="text-rose-100 text-sm">Cập nhật lần cuối: 17/07/2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-700 mb-8 text-base leading-relaxed">
          AvaB (sau đây gọi là "chúng tôi") tôn trọng quyền riêng tư của người dùng và cam kết bảo vệ
          thông tin cá nhân của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và
          bảo vệ dữ liệu của bạn khi sử dụng ứng dụng và trang web AvaB.
        </p>

        <Section title="1. Thông tin chúng tôi thu thập">
          <p><strong>Thông tin tài khoản:</strong> Họ tên, số điện thoại, địa chỉ email và mật khẩu được mã hóa khi bạn đăng ký tài khoản.</p>
          <p><strong>Dữ liệu học tập:</strong> Kết quả bài tập, điểm số, tiến độ hoàn thành chuyên đề, nhận xét của giáo viên và thống kê hoạt động học tập.</p>
          <p><strong>Thông tin thiết bị:</strong> Loại thiết bị, hệ điều hành và phiên bản ứng dụng nhằm mục đích hỗ trợ kỹ thuật.</p>
          <p><strong>Điểm danh và học phí:</strong> Thông tin điểm danh buổi học và trạng thái đóng học phí (chỉ hiển thị nội bộ cho giáo viên và phụ huynh).</p>
        </Section>

        <Section title="2. Mục đích sử dụng thông tin">
          <ul className="list-disc list-inside space-y-2">
            <li>Cung cấp dịch vụ học tập cá nhân hóa và theo dõi tiến độ</li>
            <li>Giáo viên có thể xem kết quả và đưa ra nhận xét cho học sinh</li>
            <li>Phụ huynh theo dõi việc học và điểm chuyên cần của con</li>
            <li>Cải thiện chất lượng nội dung và tính năng ứng dụng</li>
            <li>Gửi thông báo quan trọng liên quan đến tài khoản và khoá học</li>
          </ul>
        </Section>

        <Section title="3. Bảo vệ dữ liệu trẻ em">
          <p>
            AvaB phục vụ học sinh từ bậc tiểu học trở lên. Chúng tôi tuân thủ các quy định bảo vệ
            quyền riêng tư trẻ em. Tài khoản học sinh chỉ được tạo bởi giáo viên hoặc quản trị viên
            của trung tâm, không thu thập trực tiếp từ trẻ em dưới 13 tuổi mà không có sự đồng ý của
            phụ huynh.
          </p>
          <p>
            Dữ liệu học tập của học sinh chỉ được chia sẻ với giáo viên phụ trách và phụ huynh/người
            giám hộ hợp lệ của học sinh đó.
          </p>
        </Section>

        <Section title="4. Chia sẻ thông tin">
          <p>Chúng tôi <strong>không bán, không cho thuê</strong> thông tin cá nhân của bạn cho bên thứ ba.</p>
          <p>Thông tin chỉ được chia sẻ trong các trường hợp:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Với giáo viên và quản trị viên của trung tâm mà bạn đã đăng ký</li>
            <li>Với phụ huynh/người giám hộ của học sinh (theo liên kết tài khoản)</li>
            <li>Khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền</li>
          </ul>
        </Section>

        <Section title="5. Lưu trữ và bảo mật">
          <p>
            Dữ liệu được lưu trữ trên máy chủ bảo mật. Mật khẩu được mã hóa bằng bcrypt.
            Kết nối sử dụng HTTPS/TLS. Chúng tôi định kỳ kiểm tra và nâng cấp các biện pháp bảo mật.
          </p>
          <p>
            Dữ liệu tài khoản được giữ trong suốt thời gian tài khoản hoạt động. Sau khi tài khoản
            bị xóa hoặc bất hoạt theo yêu cầu, dữ liệu sẽ được xóa trong vòng 90 ngày.
          </p>
        </Section>

        <Section title="6. Quyền của bạn">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Xem và chỉnh sửa:</strong> Truy cập trang Tài khoản để cập nhật thông tin cá nhân</li>
            <li><strong>Yêu cầu xóa:</strong> Liên hệ chúng tôi để xóa tài khoản và dữ liệu</li>
            <li><strong>Đổi mật khẩu:</strong> Thực hiện bất cứ lúc nào trong cài đặt tài khoản</li>
          </ul>
        </Section>

        <Section title="7. Cookie và theo dõi">
          <p>
            Ứng dụng di động sử dụng bộ nhớ cục bộ (local storage) để lưu phiên đăng nhập.
            Trang web sử dụng cookie phiên cần thiết để xác thực. Chúng tôi không sử dụng cookie
            quảng cáo hoặc theo dõi bên thứ ba.
          </p>
        </Section>

        <Section title="8. Thay đổi chính sách">
          <p>
            Chúng tôi có thể cập nhật chính sách này và sẽ thông báo qua email hoặc thông báo
            trong ứng dụng. Việc tiếp tục sử dụng dịch vụ sau khi cập nhật đồng nghĩa với việc
            bạn chấp nhận chính sách mới.
          </p>
        </Section>

        <Section title="9. Liên hệ">
          <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ:</p>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mt-3">
            <p className="font-bold text-rose-800">AvaB — Trung tâm học tập thông minh</p>
            <p className="text-rose-700 mt-1">Email: support@avab.vn</p>
            <p className="text-rose-700">Website: avab.vn</p>
          </div>
        </Section>
      </div>
    </div>
  )
}
