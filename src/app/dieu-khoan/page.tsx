import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng — AvaB',
  description: 'Điều khoản và điều kiện sử dụng nền tảng học tập AvaB',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function DieuKhoanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-black mb-2">Điều khoản sử dụng</h1>
          <p className="text-rose-100 text-sm">Cập nhật lần cuối: 17/07/2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-700 mb-8 text-base leading-relaxed">
          Bằng cách sử dụng ứng dụng và trang web AvaB, bạn đồng ý với các điều khoản và điều kiện
          dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
        </p>

        <Section title="1. Về dịch vụ AvaB">
          <p>
            AvaB là nền tảng học tập trực tuyến cung cấp khóa học Toán, Tin học, lập trình và các
            môn học khác cho học sinh từ tiểu học đến trung học. Dịch vụ bao gồm ứng dụng di động
            (iOS và Android) và trang web tại avab.vn.
          </p>
          <p>
            <strong>Lưu ý:</strong> AvaB là ứng dụng đồng hành (companion app) dành cho học sinh đã
            được ghi danh vào khóa học. Việc đăng ký và thanh toán khóa học được thực hiện trực tiếp
            với trung tâm, không qua ứng dụng.
          </p>
        </Section>

        <Section title="2. Tài khoản người dùng">
          <ul className="list-disc list-inside space-y-2">
            <li>Tài khoản học sinh được tạo bởi giáo viên hoặc quản trị viên trung tâm</li>
            <li>Bạn có trách nhiệm bảo mật thông tin đăng nhập và không chia sẻ cho người khác</li>
            <li>Mỗi tài khoản chỉ dành cho một người sử dụng</li>
            <li>Thông báo ngay cho chúng tôi nếu phát hiện tài khoản bị truy cập trái phép</li>
          </ul>
        </Section>

        <Section title="3. Nội dung và bản quyền">
          <p>
            Toàn bộ nội dung trên AvaB (bài giảng, bài tập, hình ảnh, video, câu hỏi) là tài sản
            của AvaB và được bảo hộ bởi luật sở hữu trí tuệ Việt Nam.
          </p>
          <p>Bạn được phép:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Xem và học nội dung cho mục đích học tập cá nhân</li>
            <li>In tài liệu để phục vụ việc học (không thương mại)</li>
          </ul>
          <p className="mt-3">Bạn <strong>không được phép</strong>:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Sao chép, phân phối hoặc bán nội dung dưới bất kỳ hình thức nào</li>
            <li>Chia sẻ tài khoản để người khác truy cập nội dung trả phí</li>
            <li>Tải xuống video bài giảng hoặc tái phân phối</li>
          </ul>
        </Section>

        <Section title="4. Quy tắc sử dụng">
          <p>Khi sử dụng AvaB, bạn cam kết:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
            <li>Không cố gắng xâm nhập, phá hoại hoặc làm gián đoạn hệ thống</li>
            <li>Không gian lận trong các bài thi và kiểm tra</li>
            <li>Không đăng tải nội dung xúc phạm, phân biệt đối xử hoặc không phù hợp</li>
            <li>Thực hiện bài tập và thi cử một cách trung thực</li>
          </ul>
        </Section>

        <Section title="5. Dịch vụ và thanh toán">
          <p>
            Học phí và các khoản thanh toán được thực hiện trực tiếp với trung tâm AvaB theo thỏa
            thuận riêng. Ứng dụng di động và trang web không xử lý bất kỳ giao dịch thanh toán nào.
          </p>
          <p>
            Trung tâm có quyền điều chỉnh học phí với thông báo trước. Chính sách hoàn học phí
            theo thỏa thuận trực tiếp với trung tâm.
          </p>
        </Section>

        <Section title="6. Giới hạn trách nhiệm">
          <p>
            AvaB cung cấp dịch vụ "nguyên trạng" và nỗ lực đảm bảo hoạt động liên tục. Tuy nhiên,
            chúng tôi không chịu trách nhiệm cho các gián đoạn do lỗi kỹ thuật, sự cố ngoài tầm
            kiểm soát hoặc việc người dùng sử dụng dịch vụ không đúng cách.
          </p>
          <p>
            Kết quả học tập phụ thuộc vào nỗ lực của học sinh. AvaB không đảm bảo kết quả học tập
            cụ thể cho người dùng.
          </p>
        </Section>

        <Section title="7. Chấm dứt dịch vụ">
          <p>
            Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện vi phạm điều khoản
            sử dụng, đặc biệt là gian lận, chia sẻ tài khoản hoặc tấn công hệ thống.
          </p>
        </Section>

        <Section title="8. Thay đổi điều khoản">
          <p>
            Chúng tôi có thể cập nhật điều khoản này và sẽ thông báo trước ít nhất 7 ngày qua
            email hoặc thông báo trong ứng dụng. Việc tiếp tục sử dụng sau ngày có hiệu lực đồng
            nghĩa với việc bạn chấp nhận điều khoản mới.
          </p>
        </Section>

        <Section title="9. Luật áp dụng">
          <p>
            Điều khoản này được điều chỉnh theo pháp luật Cộng hòa Xã hội Chủ nghĩa Việt Nam.
            Mọi tranh chấp phát sinh sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
          </p>
        </Section>

        <Section title="10. Liên hệ">
          <p>Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ:</p>
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
