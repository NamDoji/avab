const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const TOPICS = [
  {
    order: 1,
    topicName: 'Robot Và Lệnh',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot cần đi thẳng về phía trước 3 bước. Lệnh nào đúng?',
        options: [{ key: 'A', text: 'Lùi 3 bước' }, { key: 'B', text: 'Tiến 3 bước' }, { key: 'C', text: 'Quay trái' }, { key: 'D', text: 'Dừng lại' }],
        answer: 'B',
        explanation: 'Lệnh "Tiến" giúp robot đi về phía trước. Robot cần tiến 3 bước để đi thẳng về phía trước!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Lệnh nào giúp robot quay sang bên trái?',
        options: [{ key: 'A', text: 'Tiến' }, { key: 'B', text: 'Lùi' }, { key: 'C', text: 'Trái' }, { key: 'D', text: 'Phải' }],
        answer: 'C',
        explanation: 'Lệnh "Trái" giúp robot quay sang bên trái. Giống như khi bạn rẽ trái khi đi xe đạp!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏠 Robot đang ở nhà muốn đến trường. Lệnh đầu tiên robot cần là gì?',
        options: [{ key: 'A', text: 'Dừng lại' }, { key: 'B', text: 'Lùi' }, { key: 'C', text: 'Tiến' }, { key: 'D', text: 'Phải' }],
        answer: 'C',
        explanation: 'Robot cần lệnh "Tiến" để bắt đầu di chuyển về phía trước đến trường!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🛑 Muốn robot dừng lại ngay, bạn dùng lệnh gì?',
        options: [{ key: 'A', text: 'Tiến' }, { key: 'B', text: 'Dừng' }, { key: 'C', text: 'Lùi' }, { key: 'D', text: 'Trái' }],
        answer: 'B',
        explanation: 'Lệnh "Dừng" giúp robot ngừng di chuyển ngay lập tức. Rất quan trọng để tránh nguy hiểm!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot quay phải rồi đi thẳng. Đó là mấy lệnh?',
        options: [{ key: 'A', text: '1 lệnh' }, { key: 'B', text: '2 lệnh' }, { key: 'C', text: '3 lệnh' }, { key: 'D', text: '4 lệnh' }],
        answer: 'B',
        explanation: '"Quay phải" là 1 lệnh và "Đi thẳng" là 1 lệnh nữa. Tổng cộng có 2 lệnh!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '💡 Trong lập trình, "Bắt đầu" giống với việc gì?',
        options: [{ key: 'A', text: 'Kết thúc chương trình' }, { key: 'B', text: 'Khởi động robot' }, { key: 'C', text: 'Tắt robot' }, { key: 'D', text: 'Quay robot' }],
        answer: 'B',
        explanation: '"Bắt đầu" giống như khởi động robot — đó là lúc robot bắt đầu thực hiện các lệnh bạn đưa ra!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🕹️ Robot có mấy lệnh di chuyển cơ bản (Tiến, Lùi, Trái, Phải)?',
        options: [{ key: 'A', text: '1 lệnh' }, { key: 'B', text: '2 lệnh' }, { key: 'C', text: '4 lệnh' }, { key: 'D', text: '10 lệnh' }],
        answer: 'C',
        explanation: 'Robot có 4 lệnh di chuyển cơ bản: Tiến, Lùi, Trái và Phải. Với 4 lệnh này robot có thể đi khắp nơi!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Lệnh "Phải" nghĩa là robot sẽ làm gì?',
        options: [{ key: 'A', text: 'Đi lùi' }, { key: 'B', text: 'Dừng lại' }, { key: 'C', text: 'Quay sang phải' }, { key: 'D', text: 'Nhảy lên' }],
        answer: 'C',
        explanation: 'Lệnh "Phải" giúp robot quay mặt sang bên phải, giống như bạn rẽ phải khi đi đường!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🤖 Lệnh "Tiến" giúp robot đi về phía trước. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Lệnh "Tiến" là lệnh giúp robot di chuyển về phía trước.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🗣️ Robot hiểu được tiếng người nói bình thường như "Ơi robot đi đi!". Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Robot chỉ hiểu những lệnh cụ thể do lập trình viên tạo ra, không hiểu tiếng nói thông thường.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🛑 Lệnh "Dừng" giúp robot ngừng di chuyển. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Lệnh "Dừng" giúp robot ngừng lại ngay lập tức.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🤖 Robot có thể tự chạy mà không cần bất kỳ lệnh nào. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Robot luôn cần có lệnh từ người dùng hoặc chương trình để biết phải làm gì.'
      },
      {
        type: 'TRUE_FALSE',
        content: '↔️ Lệnh "Trái" và lệnh "Phải" là hai lệnh ngược nhau. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! "Trái" và "Phải" là hai hướng ngược nhau, giống như tay trái và tay phải của bạn!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🤖 Mỗi robot chỉ hiểu được duy nhất 1 lệnh mà thôi. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Robot có thể được lập trình để hiểu nhiều lệnh khác nhau như Tiến, Lùi, Trái, Phải, Dừng...'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏭 Robot được dùng trong nhà máy để làm gì?',
        options: [{ key: 'A', text: 'Chỉ để vui chơi' }, { key: 'B', text: 'Làm việc nặng và lặp đi lặp lại' }, { key: 'C', text: 'Xem phim' }, { key: 'D', text: 'Ngủ' }],
        answer: 'B',
        explanation: 'Robot trong nhà máy giúp làm các công việc nặng và lặp lại nhiều lần như lắp ráp xe, đóng gói hàng hóa!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎯 Tại sao cần phải đưa lệnh rõ ràng cho robot?',
        options: [{ key: 'A', text: 'Vì robot thích nghe lệnh' }, { key: 'B', text: 'Vì robot không tự suy nghĩ được' }, { key: 'C', text: 'Vì lệnh rất vui' }, { key: 'D', text: 'Không cần thiết' }],
        answer: 'B',
        explanation: 'Robot không có khả năng tự suy nghĩ như con người. Cần lệnh rõ ràng để robot biết chính xác phải làm gì!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📱 Điều khiển robot giống với việc gì trong cuộc sống?',
        options: [{ key: 'A', text: 'Xem tivi' }, { key: 'B', text: 'Chơi điều khiển xe đồ chơi' }, { key: 'C', text: 'Ăn cơm' }, { key: 'D', text: 'Ngủ trưa' }],
        answer: 'B',
        explanation: 'Điều khiển robot giống như dùng tay cầm điều khiển xe đồ chơi — bạn bấm nút và xe phản ứng theo!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Khi robot nhận được lệnh sai, chuyện gì sẽ xảy ra?',
        options: [{ key: 'A', text: 'Robot tự sửa lệnh' }, { key: 'B', text: 'Robot làm theo đúng lệnh sai đó' }, { key: 'C', text: 'Robot dừng và suy nghĩ' }, { key: 'D', text: 'Robot bật khóc' }],
        answer: 'B',
        explanation: 'Robot thực hiện đúng lệnh được đưa ra, dù lệnh đó đúng hay sai. Vì vậy bạn cần viết lệnh thật chính xác!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '👨‍💻 Người viết lệnh cho robot được gọi là gì?',
        options: [{ key: 'A', text: 'Bác sĩ' }, { key: 'B', text: 'Lập trình viên' }, { key: 'C', text: 'Giáo viên' }, { key: 'D', text: 'Đầu bếp' }],
        answer: 'B',
        explanation: 'Người viết lệnh cho máy tính và robot được gọi là Lập trình viên. Đó có thể là bạn trong tương lai!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌟 Điều gì làm cho robot trở nên hữu ích?',
        options: [{ key: 'A', text: 'Màu sắc đẹp của robot' }, { key: 'B', text: 'Kích thước to của robot' }, { key: 'C', text: 'Những lệnh được lập trình tốt' }, { key: 'D', text: 'Tiếng ồn robot tạo ra' }],
        answer: 'C',
        explanation: 'Robot hữu ích khi được lập trình với các lệnh tốt! Một robot nhỏ với lệnh hay còn tốt hơn robot to với lệnh sai!'
      },
    ]
  },
  {
    order: 2,
    topicName: 'Thứ Tự Thực Hiện',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🦷 Khi đánh răng buổi sáng, bước nào phải làm ĐẦU TIÊN?',
        options: [{ key: 'A', text: 'Nhổ nước ra' }, { key: 'B', text: 'Lấy bàn chải và kem đánh răng' }, { key: 'C', text: 'Súc miệng' }, { key: 'D', text: 'Rửa bàn chải' }],
        answer: 'B',
        explanation: 'Bước đầu tiên là lấy bàn chải và kem đánh răng! Sau đó mới chải răng, súc miệng và nhổ nước.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎒 Thứ tự đúng khi chuẩn bị đi học là gì?',
        options: [{ key: 'A', text: 'Đến trường → Mặc đồng phục → Ăn sáng' }, { key: 'B', text: 'Mặc đồng phục → Ăn sáng → Đến trường' }, { key: 'C', text: 'Ăn sáng → Đến trường → Mặc đồng phục' }, { key: 'D', text: 'Đến trường → Ăn sáng → Mặc đồng phục' }],
        answer: 'B',
        explanation: 'Đúng rồi! Cần mặc đồng phục trước, rồi ăn sáng, sau đó mới đến trường. Thứ tự quan trọng lắm!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌱 Muốn tưới cây đúng cách, bước nào làm TRƯỚC?',
        options: [{ key: 'A', text: 'Tưới nước lên cây' }, { key: 'B', text: 'Lấy bình tưới' }, { key: 'C', text: 'Đặt bình vào chỗ cũ' }, { key: 'D', text: 'Ngắm cây đẹp' }],
        answer: 'B',
        explanation: 'Phải lấy bình tưới trước, rồi mới đổ nước vào bình, sau đó mới tưới cây được!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🍳 Bạn muốn luộc trứng. Bước nào phải làm TRƯỚC TIÊN?',
        options: [{ key: 'A', text: 'Bóc vỏ trứng' }, { key: 'B', text: 'Ăn trứng' }, { key: 'C', text: 'Bỏ trứng vào nồi nước' }, { key: 'D', text: 'Tắt bếp' }],
        answer: 'C',
        explanation: 'Phải bỏ trứng vào nồi nước trước, rồi đun sôi, rồi mới bóc vỏ và ăn được!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📐 Trong lập trình, "Sequence" (Thứ tự) có nghĩa là gì?',
        options: [{ key: 'A', text: 'Làm ngẫu nhiên không theo thứ tự' }, { key: 'B', text: 'Thực hiện các bước theo đúng thứ tự từng bước một' }, { key: 'C', text: 'Chỉ làm bước cuối cùng' }, { key: 'D', text: 'Bỏ qua các bước không thích' }],
        answer: 'B',
        explanation: 'Sequence nghĩa là thực hiện từng bước theo đúng thứ tự — bước này xong rồi mới làm bước tiếp theo!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🚿 Thứ tự đúng khi tắm là?',
        options: [{ key: 'A', text: 'Mặc quần áo → Tắm → Cởi quần áo' }, { key: 'B', text: 'Cởi quần áo → Tắm → Mặc quần áo' }, { key: 'C', text: 'Tắm → Cởi quần áo → Mặc quần áo' }, { key: 'D', text: 'Mặc quần áo → Cởi quần áo → Tắm' }],
        answer: 'B',
        explanation: 'Phải cởi quần áo trước, rồi tắm, sau đó mới mặc quần áo sạch vào. Thứ tự không thể đảo lộn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📝 Điều gì xảy ra nếu bạn làm sai thứ tự các bước?',
        options: [{ key: 'A', text: 'Không có gì thay đổi' }, { key: 'B', text: 'Kết quả sẽ sai hoặc không hoàn thành được' }, { key: 'C', text: 'Sẽ nhanh hơn' }, { key: 'D', text: 'Sẽ vui hơn' }],
        answer: 'B',
        explanation: 'Làm sai thứ tự sẽ dẫn đến kết quả sai! Ví dụ mặc quần áo trước khi tắm sẽ bị ướt hết quần áo.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎨 Bạn vẽ một bức tranh. Bước nào nên làm CUỐI CÙNG?',
        options: [{ key: 'A', text: 'Lấy giấy và bút' }, { key: 'B', text: 'Vẽ phác thảo' }, { key: 'C', text: 'Tô màu' }, { key: 'D', text: 'Ký tên vào tranh' }],
        answer: 'D',
        explanation: 'Bước cuối cùng là ký tên! Phải lấy giấy → vẽ phác thảo → tô màu → rồi mới ký tên để hoàn thành.'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '📋 Thứ tự các bước không quan trọng khi thực hiện công việc. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Thứ tự rất quan trọng. Làm sai thứ tự có thể khiến công việc thất bại hoặc gây nguy hiểm.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔢 Trong lập trình, máy tính thực hiện lệnh từ trên xuống dưới theo thứ tự. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Máy tính đọc và thực hiện lệnh từ trên xuống dưới, từng lệnh một theo thứ tự.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🌅 Có thể mặc quần áo trước khi thức dậy. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Phải thức dậy trước rồi mới mặc quần áo được. Đây là ví dụ về thứ tự không thể đảo lộn!'
      },
      {
        type: 'TRUE_FALSE',
        content: '👟 Mang giày trước khi mang tất là thứ tự sai. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Thứ tự đúng là: mang tất trước → rồi mới mang giày. Mang giày trước là sai thứ tự!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🍜 Có thể ăn phở trước khi phở được nấu xong. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Phải nấu phở xong trước rồi mới ăn được. Thứ tự này không thể đảo lộn!'
      },
      {
        type: 'TRUE_FALSE',
        content: '📚 Sequence trong lập trình giúp máy tính biết phải làm gì trước, làm gì sau. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Sequence chính là cách chúng ta sắp xếp các lệnh theo thứ tự để máy tính thực hiện đúng.'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎮 Khi viết chương trình, tại sao thứ tự lệnh quan trọng?',
        options: [{ key: 'A', text: 'Vì máy tính thích thứ tự' }, { key: 'B', text: 'Vì máy tính thực hiện đúng theo thứ tự và không tự sắp xếp lại' }, { key: 'C', text: 'Không quan trọng gì cả' }, { key: 'D', text: 'Vì lệnh trông đẹp hơn khi có thứ tự' }],
        answer: 'B',
        explanation: 'Máy tính không tự sắp xếp lệnh — nó làm đúng theo thứ tự bạn viết. Thứ tự sai → kết quả sai!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏃 Bạn chạy đua. Việc nào phải làm SAU KHI về đích?',
        options: [{ key: 'A', text: 'Buộc dây giày' }, { key: 'B', text: 'Ra vạch xuất phát' }, { key: 'C', text: 'Chạy về phía đích' }, { key: 'D', text: 'Nhận phần thưởng' }],
        answer: 'D',
        explanation: 'Nhận phần thưởng là bước sau cùng, sau khi đã chạy và về đích! Thứ tự: chuẩn bị → chạy → về đích → nhận thưởng.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📖 Trong câu chuyện cổ tích, tại sao có "mở đầu", "giữa truyện" và "kết thúc"?',
        options: [{ key: 'A', text: 'Vì quyển sách có 3 phần' }, { key: 'B', text: 'Vì thứ tự giúp câu chuyện có ý nghĩa và dễ hiểu' }, { key: 'C', text: 'Vì tác giả thích số 3' }, { key: 'D', text: 'Không có lý do gì' }],
        answer: 'B',
        explanation: 'Thứ tự mở đầu → giữa → kết thúc giúp câu chuyện có cấu trúc rõ ràng và dễ hiểu, giống như lập trình!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌸 Hoa nở theo thứ tự nào?',
        options: [{ key: 'A', text: 'Hoa nở → Hạt giống → Nảy mầm' }, { key: 'B', text: 'Hạt giống → Nảy mầm → Hoa nở' }, { key: 'C', text: 'Nảy mầm → Hạt giống → Hoa nở' }, { key: 'D', text: 'Hoa nở → Nảy mầm → Hạt giống' }],
        answer: 'B',
        explanation: 'Thứ tự tự nhiên: Hạt giống → Nảy mầm → Lớn lên → Hoa nở. Thiên nhiên cũng có "sequence"!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔢 Nếu bạn viết lệnh: 1) Nhảy, 2) Chạy, 3) Đi bộ. Robot sẽ làm gì TRƯỚC?',
        options: [{ key: 'A', text: 'Đi bộ' }, { key: 'B', text: 'Chạy' }, { key: 'C', text: 'Nhảy' }, { key: 'D', text: 'Đứng yên' }],
        answer: 'C',
        explanation: 'Robot thực hiện lệnh theo thứ tự từ đầu: lệnh số 1 là Nhảy, nên robot sẽ Nhảy trước!'
      },
    ]
  },
  {
    order: 3,
    topicName: 'Đi Trong Mê Cung',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🗺️ Khi đi trong mê cung, điều quan trọng nhất là gì?',
        options: [{ key: 'A', text: 'Chạy thật nhanh' }, { key: 'B', text: 'Lập kế hoạch đường đi' }, { key: 'C', text: 'Nhắm mắt và đi' }, { key: 'D', text: 'Ngồi im không di chuyển' }],
        answer: 'B',
        explanation: 'Lập kế hoạch đường đi giúp bạn tìm ra hướng đúng và thoát khỏi mê cung nhanh hơn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧱 Trong mê cung, khi gặp tường chặn, bạn nên làm gì?',
        options: [{ key: 'A', text: 'Đâm thẳng vào tường' }, { key: 'B', text: 'Dừng lại và tìm hướng khác' }, { key: 'C', text: 'Bỏ cuộc' }, { key: 'D', text: 'Đi lùi mãi mãi' }],
        answer: 'B',
        explanation: 'Khi gặp tường chặn, cần dừng lại và tìm đường khác. Đây là kỹ năng giải quyết vấn đề quan trọng!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🐭 Chuột đang ở ô A, cần đến phô mai ở ô D. Đường đi ít bước nhất là?',
        options: [{ key: 'A', text: 'A → B → E → D' }, { key: 'B', text: 'A → C → D' }, { key: 'C', text: 'A → B → C → D' }, { key: 'D', text: 'A → D thẳng một bước' }],
        answer: 'B',
        explanation: 'Đường ngắn nhất thường đi theo ít bước nhất. Trong mê cung, cần tìm con đường tối ưu!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤔 Vật cản trong mê cung là gì?',
        options: [{ key: 'A', text: 'Điểm đích cần đến' }, { key: 'B', text: 'Điểm bắt đầu' }, { key: 'C', text: 'Tường hoặc chướng ngại vật chặn đường' }, { key: 'D', text: 'Phần thưởng cuối mê cung' }],
        answer: 'C',
        explanation: 'Vật cản là những tường hoặc chướng ngại vật chặn đường đi. Robot phải tránh chúng để tìm đến đích!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🗺️ Để tìm đường trong mê cung, bạn cần làm gì ĐẦU TIÊN?',
        options: [{ key: 'A', text: 'Chạy thử ngẫu nhiên' }, { key: 'B', text: 'Nhìn toàn bộ mê cung và xác định điểm bắt đầu, điểm kết thúc' }, { key: 'C', text: 'Gọi người khác giúp' }, { key: 'D', text: 'Đoán mò' }],
        answer: 'B',
        explanation: 'Bước đầu tiên là nhìn tổng thể mê cung để biết bắt đầu từ đâu và cần đến đâu!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔄 Nếu đường bạn đang đi trong mê cung là ngõ cụt, bạn nên?',
        options: [{ key: 'A', text: 'Tiếp tục đi về phía trước' }, { key: 'B', text: 'Quay lại và thử đường khác' }, { key: 'C', text: 'Ngồi chờ ai đó cứu' }, { key: 'D', text: 'Đi xuyên qua tường' }],
        answer: 'B',
        explanation: 'Khi gặp ngõ cụt, cần quay lại điểm rẽ trước đó và thử đường khác. Đây gọi là thuật toán "backtracking"!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '⬆️ Robot đứng ở góc dưới trái mê cung, đích ở góc trên phải. Robot cần đi theo hướng chung nào?',
        options: [{ key: 'A', text: 'Xuống và sang trái' }, { key: 'B', text: 'Lên và sang phải' }, { key: 'C', text: 'Xuống và sang phải' }, { key: 'D', text: 'Lên và sang trái' }],
        answer: 'B',
        explanation: 'Từ góc dưới trái muốn đến góc trên phải, hướng chung là đi lên và sang phải!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏆 Con đường "ngắn nhất" trong mê cung là đường nào?',
        options: [{ key: 'A', text: 'Đường dài nhất' }, { key: 'B', text: 'Đường có nhiều rẽ nhất' }, { key: 'C', text: 'Đường ít bước đi nhất để đến đích' }, { key: 'D', text: 'Đường không có tường' }],
        answer: 'C',
        explanation: 'Đường ngắn nhất là đường dùng ít bước nhất để đến được đích. Trong lập trình, tìm đường ngắn nhất là bài toán rất quan trọng!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🗺️ Trong mê cung, có thể có nhiều hơn một đường để đến đích. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Thường có nhiều đường khác nhau trong mê cung. Công việc của chúng ta là tìm đường đúng hoặc đường ngắn nhất!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🧱 Robot có thể đi xuyên qua tường trong mê cung. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Robot phải đi vòng quanh tường, không thể đi xuyên qua. Đây là giới hạn robot phải tuân theo!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔍 Nhìn toàn bộ mê cung trước khi đi giúp tìm đường dễ hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Nhìn toàn cảnh giúp bạn lên kế hoạch tốt hơn trước khi bắt đầu đi.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎯 Mê cung luôn chỉ có một đường duy nhất dẫn đến đích. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Nhiều mê cung có nhiều đường khác nhau dẫn đến đích. Chúng ta cần tìm đường tốt nhất!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔄 Khi gặp ngõ cụt trong mê cung, ta nên quay lại và thử đường khác. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Quay lại thử đường khác là chiến lược thông minh trong mê cung và trong lập trình!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🏃 Chạy thật nhanh mà không có kế hoạch là cách tốt nhất để thoát mê cung. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Lên kế hoạch cẩn thận trước khi chạy sẽ giúp thoát mê cung nhanh hơn nhiều!'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '💻 Robot tìm đường trong mê cung giống với việc gì trong máy tính?',
        options: [{ key: 'A', text: 'Xem video' }, { key: 'B', text: 'GPS tìm đường đi' }, { key: 'C', text: 'Chơi nhạc' }, { key: 'D', text: 'Vẽ tranh' }],
        answer: 'B',
        explanation: 'GPS trên điện thoại dùng thuật toán tìm đường giống như robot trong mê cung — tìm con đường tốt nhất!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧩 Kỹ năng tìm đường trong mê cung giúp ích gì trong cuộc sống?',
        options: [{ key: 'A', text: 'Không giúp ích gì' }, { key: 'B', text: 'Giúp giải quyết vấn đề bằng cách thử từng bước một' }, { key: 'C', text: 'Chỉ hữu ích trong trò chơi' }, { key: 'D', text: 'Chỉ dùng được trong mê cung thật' }],
        answer: 'B',
        explanation: 'Tư duy tìm đường giúp bạn giải quyết mọi vấn đề trong cuộc sống bằng cách thử từng bước một!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot cần tìm đường ngắn nhất từ A đến B. Robot nên làm gì?',
        options: [{ key: 'A', text: 'Đi ngẫu nhiên cho đến khi gặp B' }, { key: 'B', text: 'Lập danh sách các đường có thể và chọn đường ít bước nhất' }, { key: 'C', text: 'Luôn đi sang phải' }, { key: 'D', text: 'Dừng lại ở giữa đường' }],
        answer: 'B',
        explanation: 'Thuật toán tìm đường tốt nhất là lập danh sách các đường có thể và chọn đường ít bước nhất!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🗺️ Mê cung có thể dạy chúng ta điều gì về lập trình?',
        options: [{ key: 'A', text: 'Lập trình rất khó' }, { key: 'B', text: 'Cần thử và sai, rồi cải thiện từng bước' }, { key: 'C', text: 'Lập trình chỉ dành cho người lớn' }, { key: 'D', text: 'Máy tính không cần thuật toán' }],
        answer: 'B',
        explanation: 'Mê cung dạy ta rằng lập trình cũng cần thử nghiệm, tìm lỗi và cải thiện dần dần!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '⭐ Điều gì xảy ra khi robot tìm được đường ra khỏi mê cung?',
        options: [{ key: 'A', text: 'Robot dừng mãi mãi' }, { key: 'B', text: 'Robot thực hiện xong nhiệm vụ thành công' }, { key: 'C', text: 'Robot bắt đầu lại từ đầu' }, { key: 'D', text: 'Robot bị hỏng' }],
        answer: 'B',
        explanation: 'Khi robot tìm được đường ra, đó là lúc thuật toán hoàn thành thành công. Nhiệm vụ hoàn tất!'
      },
    ]
  },
  {
    order: 4,
    topicName: 'Lặp Lại',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔁 "Lặp lại" trong lập trình có nghĩa là gì?',
        options: [{ key: 'A', text: 'Chỉ làm một lần' }, { key: 'B', text: 'Thực hiện một việc nhiều lần liên tiếp' }, { key: 'C', text: 'Làm ngược lại' }, { key: 'D', text: 'Dừng chương trình' }],
        answer: 'B',
        explanation: 'Lặp lại (Loop) là thực hiện cùng một việc nhiều lần. Ví dụ: nhảy 5 lần thay vì viết lệnh nhảy 5 lần!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌀 Robot cần nhảy 10 lần. Cách viết thông minh nhất là?',
        options: [{ key: 'A', text: 'Viết lệnh "Nhảy" 10 lần' }, { key: 'B', text: 'Lặp lại lệnh "Nhảy" 10 lần' }, { key: 'C', text: 'Chỉ viết 1 lệnh nhảy' }, { key: 'D', text: 'Không cần làm gì' }],
        answer: 'B',
        explanation: 'Dùng vòng lặp "Lặp 10 lần: Nhảy" thông minh hơn nhiều so với viết lệnh Nhảy 10 lần riêng lẻ!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '⏰ Kim giây trên đồng hồ quay vòng là ví dụ của gì?',
        options: [{ key: 'A', text: 'Thứ tự' }, { key: 'B', text: 'Điều kiện' }, { key: 'C', text: 'Lặp lại' }, { key: 'D', text: 'So sánh' }],
        answer: 'C',
        explanation: 'Kim giây lặp đi lặp lại vòng quay mỗi 60 giây — đây là ví dụ tuyệt vời về vòng lặp!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎵 Bài hát có điệp khúc lặp đi lặp lại 3 lần. Đó là bao nhiêu lần?',
        options: [{ key: 'A', text: '1 lần' }, { key: 'B', text: '2 lần' }, { key: 'C', text: '3 lần' }, { key: 'D', text: '4 lần' }],
        answer: 'C',
        explanation: 'Điệp khúc lặp 3 lần là 3 lần! Trong lập trình, cần chỉ định rõ số lần lặp.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌸 Trồng 5 cây hoa trong vườn. Bạn cần đào lỗ, thả hạt, tưới nước cho mỗi cây. Có thể dùng lặp lại như thế nào?',
        options: [{ key: 'A', text: 'Làm toàn bộ 3 bước 5 lần' }, { key: 'B', text: 'Chỉ làm bước đầu' }, { key: 'C', text: 'Không dùng lặp lại' }, { key: 'D', text: 'Làm 1 cây rồi bỏ' }],
        answer: 'A',
        explanation: 'Lặp lại 5 lần (đào lỗ → thả hạt → tưới nước) cho từng cây một. Đây là vòng lặp hiệu quả!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔢 Vòng lặp "Lặp 0 lần" sẽ thực hiện lệnh bao nhiêu lần?',
        options: [{ key: 'A', text: '1 lần' }, { key: 'B', text: '0 lần — không làm gì' }, { key: 'C', text: '10 lần' }, { key: 'D', text: 'Mãi mãi' }],
        answer: 'B',
        explanation: 'Lặp 0 lần nghĩa là không thực hiện gì cả! Số lần lặp quyết định robot làm bao nhiêu lần.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '♾️ Vòng lặp không bao giờ dừng được gọi là gì?',
        options: [{ key: 'A', text: 'Vòng lặp nhanh' }, { key: 'B', text: 'Vòng lặp vô hạn' }, { key: 'C', text: 'Vòng lặp chậm' }, { key: 'D', text: 'Vòng lặp tốt' }],
        answer: 'B',
        explanation: 'Vòng lặp vô hạn (infinite loop) không bao giờ dừng. Trong lập trình, đây thường là lỗi cần tránh!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎭 Trong trò chơi "Simon Says", bạn phải làm theo hiệu lệnh 4 lần. Đó là ví dụ gì?',
        options: [{ key: 'A', text: 'Điều kiện' }, { key: 'B', text: 'Lặp lại có số lần cố định' }, { key: 'C', text: 'Mê cung' }, { key: 'D', text: 'Phân loại' }],
        answer: 'B',
        explanation: 'Làm theo hiệu lệnh 4 lần là vòng lặp có số lần cố định — rất phổ biến trong lập trình!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🔁 Dùng vòng lặp giúp code ngắn hơn và dễ viết hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Thay vì viết lệnh 100 lần, dùng vòng lặp "Lặp 100 lần" chỉ cần viết 1 dòng!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🌙 Mặt trời mọc mỗi ngày là ví dụ về lặp lại trong tự nhiên. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Mặt trời mọc mỗi ngày là vòng lặp tự nhiên. Thiên nhiên cũng có "loop" đấy!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔢 Vòng lặp luôn phải chạy ít nhất 1 lần. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Vòng lặp có thể chạy 0 lần nếu điều kiện không thỏa mãn ngay từ đầu.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🥁 Tiếng trống đánh đều đặn theo nhịp là ví dụ về lặp lại. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Tiếng trống lặp đều đặn theo nhịp — đây là vòng lặp âm nhạc!'
      },
      {
        type: 'TRUE_FALSE',
        content: '💻 Trong lập trình, vòng lặp chỉ được dùng trong trò chơi. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Vòng lặp được dùng trong mọi loại chương trình: trò chơi, ứng dụng, trang web, robot...'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎯 "Lặp lại 5 lần" và "làm 5 bước" là hai điều giống nhau. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! "Lặp lại 5 lần" nghĩa là làm CÙNG MỘT VIỆC 5 lần. "5 bước" có thể là 5 việc KHÁC NHAU.'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏊 Em bơi 10 vòng hồ bơi. Cách nói theo ngôn ngữ lập trình là?',
        options: [{ key: 'A', text: 'Bơi, bơi, bơi... (10 lần)' }, { key: 'B', text: 'Lặp 10 lần: bơi 1 vòng' }, { key: 'C', text: 'Bơi mãi không dừng' }, { key: 'D', text: 'Không bơi' }],
        answer: 'B',
        explanation: '"Lặp 10 lần: bơi 1 vòng" là cách nói ngắn gọn và chính xác trong lập trình!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎪 Xiếc viên tung hứng 3 quả bóng liên tục. Đây là ví dụ gì?',
        options: [{ key: 'A', text: 'Vòng lặp vô hạn' }, { key: 'B', text: 'Vòng lặp có điều kiện' }, { key: 'C', text: 'Vòng lặp cố định 3 lần' }, { key: 'D', text: 'Không có vòng lặp' }],
        answer: 'A',
        explanation: 'Tung hứng liên tục không dừng là vòng lặp vô hạn — cứ tung lên rồi bắt, lại tung lên rồi bắt mãi!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot cần đi 20 bước thẳng. Cách dùng vòng lặp là?',
        options: [{ key: 'A', text: 'Tiến, tiến, tiến... (viết 20 lần)' }, { key: 'B', text: 'Lặp 20 lần: Tiến' }, { key: 'C', text: 'Tiến 1 lần rồi dừng' }, { key: 'D', text: 'Lùi 20 lần' }],
        answer: 'B',
        explanation: '"Lặp 20 lần: Tiến" thay thế cho việc viết lệnh Tiến 20 lần. Ngắn gọn và hiệu quả hơn nhiều!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧹 Quét nhà mỗi ngày trong 1 tuần có thể viết dưới dạng vòng lặp như thế nào?',
        options: [{ key: 'A', text: 'Quét nhà một lần là xong' }, { key: 'B', text: 'Lặp 7 lần: quét nhà 1 ngày' }, { key: 'C', text: 'Không quét nhà' }, { key: 'D', text: 'Quét nhà mãi mãi' }],
        answer: 'B',
        explanation: '"Lặp 7 lần: quét nhà" — lặp đủ 7 ngày trong tuần. Đây là vòng lặp có số lần cố định!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '⭐ Lợi ích lớn nhất của vòng lặp trong lập trình là gì?',
        options: [{ key: 'A', text: 'Làm chương trình chậm hơn' }, { key: 'B', text: 'Giúp viết ít code hơn mà làm được nhiều việc hơn' }, { key: 'C', text: 'Làm chương trình phức tạp hơn' }, { key: 'D', text: 'Chỉ dành cho máy tính đắt tiền' }],
        answer: 'B',
        explanation: 'Vòng lặp giúp viết ít code hơn nhưng làm được nhiều việc hơn — đây là sức mạnh của lập trình!'
      },
    ]
  },
  {
    order: 5,
    topicName: 'Điều Kiện',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌧️ "Nếu trời mưa thì mang ô đi học". Đây là ví dụ gì trong lập trình?',
        options: [{ key: 'A', text: 'Vòng lặp' }, { key: 'B', text: 'Điều kiện If/Then' }, { key: 'C', text: 'Thứ tự' }, { key: 'D', text: 'Phân loại' }],
        answer: 'B',
        explanation: '"Nếu... thì..." là câu lệnh điều kiện If/Then. Rất phổ biến trong lập trình và cuộc sống!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🚦 Đèn xanh bật → đi. Đèn đỏ bật → dừng. Đây là loại lập trình gì?',
        options: [{ key: 'A', text: 'Lặp lại' }, { key: 'B', text: 'Điều kiện' }, { key: 'C', text: 'Mê cung' }, { key: 'D', text: 'Sequence' }],
        answer: 'B',
        explanation: 'Đèn giao thông dùng điều kiện: Nếu xanh → đi, Nếu đỏ → dừng. Đây là If/Else kinh điển!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🍎 "Nếu đói thì ăn táo, không thì uống nước". Phần "không thì" trong lập trình gọi là?',
        options: [{ key: 'A', text: 'If (nếu)' }, { key: 'B', text: 'Then (thì)' }, { key: 'C', text: 'Else (không thì)' }, { key: 'D', text: 'Loop (lặp)' }],
        answer: 'C',
        explanation: '"Không thì" (Else) là phần xử lý khi điều kiện KHÔNG đúng. If → Else là cặp đôi hoàn hảo!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎮 Robot gặp vật cản: nếu có vật cản → rẽ phải, nếu không → tiếp tục đi. Robot làm gì khi không có vật cản?',
        options: [{ key: 'A', text: 'Rẽ phải' }, { key: 'B', text: 'Dừng lại' }, { key: 'C', text: 'Tiếp tục đi thẳng' }, { key: 'D', text: 'Quay lại' }],
        answer: 'C',
        explanation: 'Khi không có vật cản (điều kiện sai), robot tiếp tục đi thẳng. Đây là nhánh "Else"!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌡️ "Nếu nhiệt độ > 30 độ thì bật điều hòa". Điều gì kích hoạt điều hòa?',
        options: [{ key: 'A', text: 'Khi nhiệt độ dưới 20 độ' }, { key: 'B', text: 'Khi nhiệt độ trên 30 độ' }, { key: 'C', text: 'Mọi lúc' }, { key: 'D', text: 'Không bao giờ' }],
        answer: 'B',
        explanation: 'Điều hòa chỉ bật khi nhiệt độ vượt quá 30 độ. Đây là điều kiện kích hoạt!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔋 "Nếu pin điện thoại < 20% thì sạc pin". Khi pin 50%, điện thoại làm gì?',
        options: [{ key: 'A', text: 'Tự sạc pin' }, { key: 'B', text: 'Không làm gì (tiếp tục dùng bình thường)' }, { key: 'C', text: 'Tắt máy' }, { key: 'D', text: 'Báo động' }],
        answer: 'B',
        explanation: 'Pin 50% > 20%, điều kiện sai, nên điện thoại không làm gì đặc biệt — tiếp tục hoạt động bình thường!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎲 Khi nào câu lệnh "Nếu trời mưa" được thực hiện?',
        options: [{ key: 'A', text: 'Lúc trời nắng' }, { key: 'B', text: 'Lúc trời mưa' }, { key: 'C', text: 'Mọi lúc' }, { key: 'D', text: 'Không bao giờ' }],
        answer: 'B',
        explanation: 'Câu lệnh điều kiện chỉ thực hiện khi điều kiện ĐÚNG — tức là chỉ khi trời thực sự mưa!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧸 "Nếu mệt thì ngủ, nếu đói thì ăn, không thì chơi". Bạn đang khỏe và no, bạn sẽ?',
        options: [{ key: 'A', text: 'Ngủ' }, { key: 'B', text: 'Ăn' }, { key: 'C', text: 'Chơi' }, { key: 'D', text: 'Đứng im' }],
        answer: 'C',
        explanation: 'Không mệt, không đói → điều kiện "khác" kích hoạt → Chơi! Đây là If/Else If/Else.'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🌧️ Câu lệnh điều kiện chỉ thực hiện khi điều kiện đúng. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Lệnh điều kiện chỉ chạy khi điều kiện thỏa mãn (đúng). Nếu sai, nó bỏ qua hoặc chạy nhánh Else.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🤖 Robot không thể tự quyết định dựa trên điều kiện. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Robot có thể được lập trình để tự kiểm tra điều kiện và hành động khác nhau!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🚦 Đèn giao thông là ví dụ thực tế của câu lệnh điều kiện. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Đèn giao thông hoạt động theo điều kiện: Nếu xanh → đi, Nếu đỏ → dừng.'
      },
      {
        type: 'TRUE_FALSE',
        content: '💡 Câu lệnh điều kiện cho phép chương trình có nhiều lựa chọn hành động khác nhau. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Điều kiện giúp chương trình "thông minh hơn" vì có thể xử lý nhiều tình huống khác nhau.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎭 "Else" chỉ chạy khi điều kiện If là SAI. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Else là nhánh "không thì" — chỉ chạy khi điều kiện If không thỏa mãn.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎮 Câu lệnh điều kiện chỉ được dùng trong trò chơi điện tử. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Điều kiện được dùng khắp nơi: ứng dụng, robot, máy tự động, trang web...'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌡️ Máy lạnh tự động bật tắt dựa trên nhiệt độ phòng. Đây là ví dụ của gì?',
        options: [{ key: 'A', text: 'Vòng lặp' }, { key: 'B', text: 'Điều kiện tự động' }, { key: 'C', text: 'Sequence' }, { key: 'D', text: 'Phân loại' }],
        answer: 'B',
        explanation: 'Máy lạnh kiểm tra điều kiện nhiệt độ và tự bật/tắt. Đây là ứng dụng thực tế của lệnh điều kiện!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎯 Tại sao điều kiện quan trọng trong lập trình?',
        options: [{ key: 'A', text: 'Vì nó làm code đẹp hơn' }, { key: 'B', text: 'Vì nó giúp chương trình phản ứng linh hoạt với các tình huống khác nhau' }, { key: 'C', text: 'Vì bắt buộc phải dùng' }, { key: 'D', text: 'Không có lý do' }],
        answer: 'B',
        explanation: 'Điều kiện giúp chương trình "thông minh" — có thể xử lý khác nhau tùy theo tình huống!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🚪 "Nếu cửa đóng thì mở cửa, nếu đã mở thì đi vào". Robot làm gì khi cửa đang mở?',
        options: [{ key: 'A', text: 'Mở cửa ra' }, { key: 'B', text: 'Đứng chờ' }, { key: 'C', text: 'Đi vào thẳng' }, { key: 'D', text: 'Quay về' }],
        answer: 'C',
        explanation: 'Khi cửa đã mở (điều kiện "cửa đóng" sai), robot đi vào thẳng theo nhánh Else!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌈 Câu lệnh điều kiện trong cuộc sống hàng ngày là gì?',
        options: [{ key: 'A', text: '"Hãy ăn cơm"' }, { key: 'B', text: '"Đi ngủ đi"' }, { key: 'C', text: '"Nếu bẩn thì tắm"' }, { key: 'D', text: '"Đến trường đi"' }],
        answer: 'C',
        explanation: '"Nếu bẩn thì tắm" là điều kiện: tắm chỉ khi bẩn, không cần tắm khi đã sạch rồi!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot kiểm tra: "Nếu pin > 50% thì tiếp tục chạy". Pin robot = 30%, robot làm gì?',
        options: [{ key: 'A', text: 'Tiếp tục chạy' }, { key: 'B', text: 'Không chạy (điều kiện sai)' }, { key: 'C', text: 'Chạy nhanh hơn' }, { key: 'D', text: 'Nhảy lên' }],
        answer: 'B',
        explanation: 'Pin 30% < 50%, điều kiện sai, nên robot không tiếp tục chạy. Cần sạc pin trước!'
      },
    ]
  },
  {
    order: 6,
    topicName: 'So Sánh',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🍎🍊 Bạn có 5 quả táo và 3 quả cam. Con số nào LỚN HƠN?',
        options: [{ key: 'A', text: '3 (cam)' }, { key: 'B', text: '5 (táo)' }, { key: 'C', text: 'Bằng nhau' }, { key: 'D', text: 'Không so sánh được' }],
        answer: 'B',
        explanation: '5 > 3, nên 5 quả táo nhiều hơn 3 quả cam. So sánh số lượng là kỹ năng cơ bản!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📏 Con voi cao 3 mét, con chó cao 0.5 mét. Con nào THẤP HƠN?',
        options: [{ key: 'A', text: 'Con voi' }, { key: 'B', text: 'Con chó' }, { key: 'C', text: 'Bằng nhau' }, { key: 'D', text: 'Không biết' }],
        answer: 'B',
        explanation: '0.5 < 3, nên con chó thấp hơn con voi. So sánh chiều cao giúp ta biết vật nào nhỏ hơn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔢 Trong lập trình, dấu nào có nghĩa là "lớn hơn"?',
        options: [{ key: 'A', text: '<' }, { key: 'B', text: '>' }, { key: 'C', text: '=' }, { key: 'D', text: '!' }],
        answer: 'B',
        explanation: 'Dấu > có nghĩa là "lớn hơn". Ví dụ: 5 > 3 nghĩa là 5 lớn hơn 3!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌡️ 25 độ ___ 30 độ. Điền vào chỗ trống?',
        options: [{ key: 'A', text: '>' }, { key: 'B', text: '<' }, { key: 'C', text: '=' }, { key: 'D', text: '≠' }],
        answer: 'B',
        explanation: '25 < 30, nên 25 độ NHỎ HƠN 30 độ. Dấu < chỉ hướng về phía số nhỏ hơn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🍕 Hùng ăn 4 miếng pizza, Lan ăn 4 miếng pizza. Ai ăn NHIỀU HƠN?',
        options: [{ key: 'A', text: 'Hùng' }, { key: 'B', text: 'Lan' }, { key: 'C', text: 'Hai người bằng nhau' }, { key: 'D', text: 'Không tính được' }],
        answer: 'C',
        explanation: '4 = 4, cả hai ăn bằng nhau! Trong lập trình dùng dấu == để kiểm tra bằng nhau.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏃 Bé An chạy 100m trong 15 giây, bé Minh chạy 100m trong 12 giây. Ai NHANH HƠN?',
        options: [{ key: 'A', text: 'Bé An (15 giây)' }, { key: 'B', text: 'Bé Minh (12 giây)' }, { key: 'C', text: 'Bằng nhau' }, { key: 'D', text: 'Không biết' }],
        answer: 'B',
        explanation: 'Thời gian ít hơn = nhanh hơn! Bé Minh chạy 12 giây < 15 giây nên bé Minh nhanh hơn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '💰 Bạn có 10.000 đồng, kẹo giá 7.000 đồng. Bạn có ĐỦ TIỀN không?',
        options: [{ key: 'A', text: 'Không đủ (10 < 7)' }, { key: 'B', text: 'Đủ tiền (10 > 7)' }, { key: 'C', text: 'Vừa đúng' }, { key: 'D', text: 'Không tính được' }],
        answer: 'B',
        explanation: '10.000 > 7.000, bạn đủ tiền mua kẹo và còn thừa 3.000 đồng!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎂 Tuổi bạn: 7. Tuổi anh: 10. Ai LỚN HƠN?',
        options: [{ key: 'A', text: 'Bạn (7 tuổi)' }, { key: 'B', text: 'Anh (10 tuổi)' }, { key: 'C', text: 'Bằng tuổi nhau' }, { key: 'D', text: 'Không biết' }],
        answer: 'B',
        explanation: '10 > 7, nên anh lớn hơn. So sánh tuổi giúp biết ai lớn hơn, ai nhỏ hơn!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '📏 5 > 3 nghĩa là 5 lớn hơn 3. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Dấu > có nghĩa là "lớn hơn". 5 > 3 nghĩa là 5 lớn hơn 3.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔢 2 < 8 nghĩa là 2 lớn hơn 8. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! 2 < 8 nghĩa là 2 NHỎ HƠN 8. Dấu < chỉ từ số lớn sang số nhỏ hơn.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🍎 So sánh giúp máy tính quyết định phải làm gì tiếp theo. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! So sánh thường đi kèm với điều kiện để quyết định hành động: nếu A > B thì...'
      },
      {
        type: 'TRUE_FALSE',
        content: '🌡️ Nhiệt độ 0 độ lạnh hơn 20 độ. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! 0 < 20, nên 0 độ lạnh hơn (nhỏ hơn) 20 độ.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🍕 6 miếng bánh bằng 6 miếng bánh (6 = 6). Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! 6 = 6, hai số bằng nhau. Trong lập trình dùng == để kiểm tra bằng nhau.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎒 Túi nặng 5 kg nhẹ hơn túi nặng 3 kg. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! 5 kg > 3 kg, nên túi 5 kg NẶNG HƠN túi 3 kg, không phải nhẹ hơn!'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '💻 Robot cần kiểm tra "Nếu nhiệt độ lớn hơn 35 độ thì bật quạt". Máy tính dùng phép toán gì?',
        options: [{ key: 'A', text: 'Cộng (+)' }, { key: 'B', text: 'Trừ (-)' }, { key: 'C', text: 'So sánh (>)' }, { key: 'D', text: 'Nhân (×)' }],
        answer: 'C',
        explanation: 'Máy tính dùng phép so sánh > để kiểm tra nhiệt độ. So sánh kết hợp với điều kiện!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏆 Tìm số LỚN NHẤT trong dãy: 4, 9, 2, 7, 1',
        options: [{ key: 'A', text: '4' }, { key: 'B', text: '7' }, { key: 'C', text: '9' }, { key: 'D', text: '2' }],
        answer: 'C',
        explanation: 'So sánh từng số: 9 > 7 > 4 > 2 > 1. Số lớn nhất là 9! Máy tính cũng làm như vậy để tìm max.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎯 Trong siêu thị, máy tính kiểm tra giá tiền của bạn có đủ mua hàng không bằng cách nào?',
        options: [{ key: 'A', text: 'Đoán mò' }, { key: 'B', text: 'So sánh tiền bạn có với giá hàng' }, { key: 'C', text: 'Hỏi người bán' }, { key: 'D', text: 'Không kiểm tra' }],
        answer: 'B',
        explanation: 'Máy tính so sánh: Tiền bạn có ≥ Giá hàng? Nếu đúng → cho mua, sai → không đủ tiền!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📊 Tại sao so sánh quan trọng trong lập trình?',
        options: [{ key: 'A', text: 'Để chương trình trông đẹp' }, { key: 'B', text: 'Để máy tính có thể ra quyết định dựa trên dữ liệu' }, { key: 'C', text: 'Không có lý do' }, { key: 'D', text: 'Chỉ dùng cho toán học' }],
        answer: 'B',
        explanation: 'So sánh giúp máy tính ra quyết định thông minh dựa trên thông tin thực tế!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌡️ Ứng dụng thời tiết hiển thị cảnh báo "Quá nóng!" khi nào?',
        options: [{ key: 'A', text: 'Luôn luôn' }, { key: 'B', text: 'Khi nhiệt độ thấp hơn 20 độ' }, { key: 'C', text: 'Khi nhiệt độ cao hơn mức cảnh báo (ví dụ 40 độ)' }, { key: 'D', text: 'Không bao giờ' }],
        answer: 'C',
        explanation: 'App so sánh nhiệt độ với ngưỡng cảnh báo và hiện thông báo khi vượt ngưỡng đó!'
      },
    ]
  },
  {
    order: 7,
    topicName: 'Quy Luật',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔴🔵🔴🔵🔴❓ Hình tiếp theo trong dãy là gì?',
        options: [{ key: 'A', text: '🔴 (đỏ)' }, { key: 'B', text: '🔵 (xanh)' }, { key: 'C', text: '🟡 (vàng)' }, { key: 'D', text: '🟢 (lục)' }],
        answer: 'B',
        explanation: 'Quy luật: đỏ-xanh-đỏ-xanh... Tiếp theo là 🔵 xanh! Nhận ra quy luật giúp dự đoán được tương lai.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '1️⃣2️⃣3️⃣4️⃣5️⃣❓ Số tiếp theo là gì?',
        options: [{ key: 'A', text: '4' }, { key: 'B', text: '7' }, { key: 'C', text: '6' }, { key: 'D', text: '10' }],
        answer: 'C',
        explanation: 'Quy luật: cộng 1 mỗi lần! 1, 2, 3, 4, 5 → 6. Quy luật đơn giản nhất là đếm tăng dần!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '2️⃣4️⃣6️⃣8️⃣❓ Số tiếp theo là gì?',
        options: [{ key: 'A', text: '9' }, { key: 'B', text: '10' }, { key: 'C', text: '11' }, { key: 'D', text: '12' }],
        answer: 'B',
        explanation: 'Quy luật: các số chẵn, tăng thêm 2 mỗi lần! 2, 4, 6, 8 → 10. Đây là dãy số chẵn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌙🌟🌙🌟🌙❓ Biểu tượng tiếp theo là gì?',
        options: [{ key: 'A', text: '🌙 (trăng)' }, { key: 'B', text: '🌟 (sao)' }, { key: 'C', text: '☀️ (mặt trời)' }, { key: 'D', text: '⭐ (ngôi sao)' }],
        answer: 'B',
        explanation: 'Quy luật: trăng-sao-trăng-sao... Tiếp theo là 🌟 sao!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌸 Mùa xuân → Mùa hè → Mùa thu → Mùa đông → ❓',
        options: [{ key: 'A', text: 'Mùa hè' }, { key: 'B', text: 'Mùa thu' }, { key: 'C', text: 'Mùa xuân' }, { key: 'D', text: 'Mùa đông' }],
        answer: 'C',
        explanation: 'Bốn mùa lặp lại theo quy luật! Sau đông là xuân — đây là vòng lặp tuần hoàn của thiên nhiên!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔢 Dãy: 10, 8, 6, 4, ❓. Số tiếp theo là gì?',
        options: [{ key: 'A', text: '5' }, { key: 'B', text: '3' }, { key: 'C', text: '2' }, { key: 'D', text: '1' }],
        answer: 'C',
        explanation: 'Quy luật: trừ 2 mỗi lần! 10, 8, 6, 4 → 2. Dãy giảm dần mỗi lần 2 đơn vị!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎵 Do Re Mi Fa Sol La Si Do... Điều này minh họa khái niệm gì?',
        options: [{ key: 'A', text: 'Điều kiện' }, { key: 'B', text: 'Quy luật tuần tự trong âm nhạc' }, { key: 'C', text: 'Mê cung' }, { key: 'D', text: 'Phân loại' }],
        answer: 'B',
        explanation: 'Thang âm Do Re Mi... là quy luật âm thanh theo thứ tự nhất định — nhạc lý cũng có quy luật!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔑 Nhận ra quy luật giúp ích gì trong lập trình?',
        options: [{ key: 'A', text: 'Không giúp ích gì' }, { key: 'B', text: 'Giúp viết code hiệu quả hơn bằng cách tự động hóa quy luật' }, { key: 'C', text: 'Chỉ làm chương trình đẹp hơn' }, { key: 'D', text: 'Làm máy tính chậm hơn' }],
        answer: 'B',
        explanation: 'Nhận ra quy luật giúp lập trình viên viết code tự động tạo ra dãy hay xử lý dữ liệu có quy luật!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🔴🔵🔴🔵 Quy luật của dãy này là: đỏ rồi xanh luân phiên. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Quy luật rõ ràng là đỏ-xanh-đỏ-xanh luân phiên nhau.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🌙 Ngày và đêm thay nhau là quy luật của tự nhiên. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Ngày-đêm luân phiên theo quy luật 24 giờ. Thiên nhiên đầy các quy luật!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎲 Mọi dãy số đều có quy luật rõ ràng. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Có những dãy số ngẫu nhiên không có quy luật, ví dụ kết quả xổ số!'
      },
      {
        type: 'TRUE_FALSE',
        content: '💻 Máy tính có thể được lập trình để tạo ra dãy số theo quy luật. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Máy tính rất giỏi tạo ra dãy theo quy luật, như tạo bảng cửu chương hay số chẵn lẻ.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔢 1, 3, 5, 7 là dãy số lẻ tăng dần. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! 1, 3, 5, 7 là các số lẻ, tăng thêm 2 mỗi lần. Đây là quy luật dãy số lẻ!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎨 Quy luật màu sắc không thể tìm thấy trong thiên nhiên. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Cầu vồng luôn có 7 màu theo thứ tự cố định là quy luật màu sắc trong thiên nhiên!'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎯 Tìm quy luật: A, C, E, G, ❓',
        options: [{ key: 'A', text: 'H' }, { key: 'B', text: 'I' }, { key: 'C', text: 'J' }, { key: 'D', text: 'K' }],
        answer: 'B',
        explanation: 'Quy luật: bỏ qua 1 chữ cái mỗi lần! A(bỏ B)C(bỏ D)E(bỏ F)G(bỏ H)I. Tiếp theo là I!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌿 Cây ra lá vào mùa xuân, rụng lá vào mùa thu. Đây là ví dụ gì?',
        options: [{ key: 'A', text: 'Điều kiện ngẫu nhiên' }, { key: 'B', text: 'Quy luật theo mùa' }, { key: 'C', text: 'Lỗi của cây' }, { key: 'D', text: 'Không có quy luật' }],
        answer: 'B',
        explanation: 'Cây theo quy luật mùa vụ rất đều đặn — đây là quy luật sinh học của thiên nhiên!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏗️ Lập trình viên dùng quy luật để làm gì?',
        options: [{ key: 'A', text: 'Trang trí màn hình' }, { key: 'B', text: 'Tự động tạo dữ liệu và xử lý có quy luật' }, { key: 'C', text: 'Chỉ đếm số' }, { key: 'D', text: 'Không có ứng dụng' }],
        answer: 'B',
        explanation: 'Quy luật giúp lập trình viên tự động hóa: tạo bảng, sinh dữ liệu, xử lý theo thứ tự...'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔢 Bảng cửu chương 2: 2, 4, 6, 8, 10... Đây là quy luật gì?',
        options: [{ key: 'A', text: 'Cộng 1 mỗi lần' }, { key: 'B', text: 'Cộng 2 mỗi lần' }, { key: 'C', text: 'Nhân đôi mỗi lần' }, { key: 'D', text: 'Ngẫu nhiên' }],
        answer: 'B',
        explanation: 'Bảng cửu chương 2 tăng thêm 2 mỗi lần: 2, 4, 6, 8, 10... Đây là quy luật cộng 2!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌈 Cầu vồng có bao nhiêu màu và theo thứ tự nào?',
        options: [{ key: 'A', text: '5 màu, ngẫu nhiên' }, { key: 'B', text: '7 màu, luôn theo thứ tự cố định' }, { key: 'C', text: '3 màu, đổi chỗ' }, { key: 'D', text: '10 màu, khác nhau mỗi lần' }],
        answer: 'B',
        explanation: 'Cầu vồng luôn có 7 màu theo thứ tự: đỏ-cam-vàng-lục-lam-chàm-tím. Đây là quy luật quang học!'
      },
    ]
  },
  {
    order: 8,
    topicName: 'Phân Loại',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🍎🍌🚗🍊🚌 Nhóm nào dưới đây chỉ gồm trái cây?',
        options: [{ key: 'A', text: 'Táo, Chuối, Xe hơi' }, { key: 'B', text: 'Táo, Chuối, Cam' }, { key: 'C', text: 'Chuối, Xe hơi, Xe buýt' }, { key: 'D', text: 'Xe hơi, Xe buýt, Cam' }],
        answer: 'B',
        explanation: 'Táo, Chuối, Cam đều là trái cây! Xe hơi và xe buýt là phương tiện giao thông, không phải trái cây.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🐕🐈🦁🐠🐦 Con vật nào khác với 4 con còn lại?',
        options: [{ key: 'A', text: 'Chó' }, { key: 'B', text: 'Mèo' }, { key: 'C', text: 'Cá' }, { key: 'D', text: 'Chim' }],
        answer: 'C',
        explanation: 'Chó, Mèo, Sư tử, Chim đều sống trên cạn, còn Cá sống dưới nước. Cá là con vật khác nhóm!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📚🖊️📐🎸 Vật nào KHÔNG thuộc nhóm "dụng cụ học tập"?',
        options: [{ key: 'A', text: 'Sách' }, { key: 'B', text: 'Bút chì' }, { key: 'C', text: 'Thước kẻ' }, { key: 'D', text: 'Đàn guitar' }],
        answer: 'D',
        explanation: 'Đàn guitar là nhạc cụ, không phải dụng cụ học tập! Sách, bút chì, thước kẻ mới là dụng cụ học tập.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔴🔵🟡 Phân loại các hình: ⬛🔷🔵🟦 Có bao nhiêu hình MÀU XANH?',
        options: [{ key: 'A', text: '1 hình' }, { key: 'B', text: '2 hình' }, { key: 'C', text: '3 hình' }, { key: 'D', text: '4 hình' }],
        answer: 'C',
        explanation: 'Hình kim cương xanh 🔷, vòng tròn xanh 🔵, hình vuông xanh 🟦 — có 3 hình màu xanh!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌞🌧️❄️🌈 Thời tiết nào KHÔNG phải là thời tiết lạnh?',
        options: [{ key: 'A', text: 'Tuyết rơi' }, { key: 'B', text: 'Mưa lạnh' }, { key: 'C', text: 'Nắng nóng' }, { key: 'D', text: 'Gió lạnh' }],
        answer: 'C',
        explanation: 'Nắng nóng là thời tiết ấm/nóng, không phải lạnh! Còn lại tuyết, mưa lạnh, gió lạnh đều là thời tiết lạnh.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Máy tính phân loại email "quan trọng" và "spam" dựa vào gì?',
        options: [{ key: 'A', text: 'Màu sắc của email' }, { key: 'B', text: 'Các đặc điểm như từ ngữ, người gửi' }, { key: 'C', text: 'Thời gian nhận email' }, { key: 'D', text: 'Ngẫu nhiên' }],
        answer: 'B',
        explanation: 'Máy tính phân loại email dựa trên các đặc điểm như từ ngữ, người gửi, tiêu đề...'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏷️ Siêu thị sắp xếp hàng theo "khu rau", "khu thịt", "khu bánh". Đó là phân loại dựa trên tiêu chí gì?',
        options: [{ key: 'A', text: 'Màu sắc' }, { key: 'B', text: 'Kích thước' }, { key: 'C', text: 'Loại thực phẩm' }, { key: 'D', text: 'Giá tiền' }],
        answer: 'C',
        explanation: 'Siêu thị phân loại theo loại thực phẩm — giúp khách hàng tìm hàng dễ hơn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📂 Trong máy tính, tại sao nên phân loại file vào các thư mục?',
        options: [{ key: 'A', text: 'Để máy tính chạy nhanh hơn' }, { key: 'B', text: 'Để dễ tìm kiếm và quản lý file' }, { key: 'C', text: 'Vì máy tính bắt buộc phải làm vậy' }, { key: 'D', text: 'Không có lý do' }],
        answer: 'B',
        explanation: 'Phân loại file vào thư mục giúp tìm kiếm nhanh hơn và quản lý dữ liệu hiệu quả hơn!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🐟 Cá và chim đều sống dưới nước. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Cá sống dưới nước, còn chim sống trên cạn và bay được. Chúng thuộc hai nhóm khác nhau!'
      },
      {
        type: 'TRUE_FALSE',
        content: '📂 Phân loại dữ liệu giúp máy tính tìm kiếm thông tin nhanh hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Dữ liệu được phân loại tốt giúp máy tính tìm kiếm nhanh hơn rất nhiều!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🍎🍌 Táo và chuối đều là rau củ. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Táo và chuối là trái cây, không phải rau củ. Phân loại đúng rất quan trọng!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🏷️ Mỗi vật chỉ có thể thuộc về một nhóm phân loại duy nhất. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Một vật có thể thuộc nhiều nhóm: con cá vừa là "động vật" vừa là "sinh vật sống dưới nước".'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎨 Màu đỏ, xanh, vàng đều thuộc nhóm "màu sắc cơ bản". Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Đỏ, xanh, vàng là 3 màu cơ bản. Các màu khác được tạo từ sự pha trộn của chúng!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔢 Số chẵn và số lẻ là cách phân loại các số tự nhiên. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Chia số thành "chẵn" và "lẻ" là một cách phân loại dễ hiểu!'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Google Photos tự nhận ra ảnh có mặt người, ảnh phong cảnh, ảnh thức ăn. Đây là gì?',
        options: [{ key: 'A', text: 'Vòng lặp' }, { key: 'B', text: 'Phân loại tự động bằng AI' }, { key: 'C', text: 'Sequence' }, { key: 'D', text: 'Mê cung' }],
        answer: 'B',
        explanation: 'AI trong Google Photos phân loại ảnh tự động dựa trên nội dung — đây là ứng dụng của phân loại trong AI!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📚 Thư viện sắp xếp sách theo chủ đề: khoa học, văn học, lịch sử. Ai được giúp ích?',
        options: [{ key: 'A', text: 'Chỉ thủ thư' }, { key: 'B', text: 'Mọi người muốn tìm sách' }, { key: 'C', text: 'Chỉ học sinh' }, { key: 'D', text: 'Không ai' }],
        answer: 'B',
        explanation: 'Phân loại sách giúp mọi người tìm sách dễ dàng hơn — đây là lợi ích của phân loại tốt!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌿🐾🪨 Em phân loại vật thành "sống" và "không sống". Đá có thuộc nhóm "sống" không?',
        options: [{ key: 'A', text: 'Có, đá là sinh vật sống' }, { key: 'B', text: 'Không, đá là vật không sống' }, { key: 'C', text: 'Đá vừa sống vừa không sống' }, { key: 'D', text: 'Không phân loại được' }],
        answer: 'B',
        explanation: 'Đá là vật không sống — không cần ăn, không lớn lên, không sinh sản. Đá thuộc nhóm "không sống".'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎮 Trong game, quái vật được phân loại theo "lửa", "nước", "đất". Điều này giúp ích gì?',
        options: [{ key: 'A', text: 'Làm game đẹp hơn' }, { key: 'B', text: 'Giúp người chơi biết dùng vũ khí phù hợp' }, { key: 'C', text: 'Không giúp ích gì' }, { key: 'D', text: 'Làm game chậm hơn' }],
        answer: 'B',
        explanation: 'Phân loại theo nguyên tố giúp người chơi chọn chiến thuật đúng — phân loại tạo ra gameplay thú vị!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔑 Kỹ năng phân loại quan trọng vì?',
        options: [{ key: 'A', text: 'Không quan trọng' }, { key: 'B', text: 'Giúp tổ chức thông tin và tìm kiếm hiệu quả hơn' }, { key: 'C', text: 'Chỉ dùng trong máy tính' }, { key: 'D', text: 'Làm cho mọi thứ phức tạp hơn' }],
        answer: 'B',
        explanation: 'Phân loại tốt giúp tổ chức thông tin khoa học, tìm kiếm nhanh và hiệu quả hơn!'
      },
    ]
  },
  {
    order: 9,
    topicName: 'Tối Ưu',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏆 "Tối ưu" trong lập trình có nghĩa là gì?',
        options: [{ key: 'A', text: 'Làm phức tạp nhất có thể' }, { key: 'B', text: 'Tìm cách tốt nhất — nhanh hơn và ít bước hơn' }, { key: 'C', text: 'Làm mọi thứ nhiều lần' }, { key: 'D', text: 'Không làm gì hết' }],
        answer: 'B',
        explanation: 'Tối ưu là tìm giải pháp TỐT NHẤT — nhanh hơn, ít tài nguyên hơn, ít bước hơn mà vẫn đạt kết quả!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🚶 Từ nhà đến trường có 2 đường: đường A mất 5 phút, đường B mất 10 phút. Đường nào TỐI ƯU hơn?',
        options: [{ key: 'A', text: 'Đường B (10 phút)' }, { key: 'B', text: 'Đường A (5 phút)' }, { key: 'C', text: 'Cả hai như nhau' }, { key: 'D', text: 'Không có đường tốt' }],
        answer: 'B',
        explanation: 'Đường A mất ít thời gian hơn (5 phút < 10 phút) nên đường A tối ưu hơn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🛒 Mua sắm ở siêu thị: cách nào TỐI ƯU nhất?',
        options: [{ key: 'A', text: 'Đi vòng vòng ngẫu nhiên' }, { key: 'B', text: 'Lập danh sách theo khu vực và đi đúng lộ trình' }, { key: 'C', text: 'Mua từng món rồi về nhà rồi đi lại' }, { key: 'D', text: 'Nhờ người khác mua hộ' }],
        answer: 'B',
        explanation: 'Lập danh sách theo khu vực giúp đi ít bước nhất, tiết kiệm thời gian và công sức — đó là tối ưu!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot cần lấy 3 món đồ ở 3 góc phòng. Cách nào TIẾT KIỆM bước đi nhất?',
        options: [{ key: 'A', text: 'Đi lấy từng món, mỗi lần về trung tâm' }, { key: 'B', text: 'Lập lộ trình đi qua cả 3 góc một lần' }, { key: 'C', text: 'Chỉ lấy 1 món' }, { key: 'D', text: 'Đứng yên' }],
        answer: 'B',
        explanation: 'Đi qua cả 3 góc trong một chuyến giúp robot đi ít bước hơn nhiều so với quay về trung tâm mỗi lần!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📦 Xếp đồ vào balo: cách nào TỐI ƯU nhất?',
        options: [{ key: 'A', text: 'Nhét bừa vào' }, { key: 'B', text: 'Xếp đồ nặng dưới, đồ nhẹ trên để cân bằng và vừa khít' }, { key: 'C', text: 'Không xếp gì' }, { key: 'D', text: 'Chỉ mang 1 quyển sách' }],
        answer: 'B',
        explanation: 'Xếp thông minh giúp balo gọn hơn, cân bằng hơn và thoải mái hơn khi mang — đó là tối ưu không gian!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '⚡ Điện thoại có thể tối ưu pin bằng cách nào?',
        options: [{ key: 'A', text: 'Bật tất cả ứng dụng mọi lúc' }, { key: 'B', text: 'Tắt những ứng dụng không cần thiết' }, { key: 'C', text: 'Màn hình luôn sáng tối đa' }, { key: 'D', text: 'Không làm gì' }],
        answer: 'B',
        explanation: 'Tắt ứng dụng không dùng giúp tiết kiệm pin — đây là tối ưu việc sử dụng tài nguyên!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎯 Thuật toán tối ưu nhằm mục đích gì?',
        options: [{ key: 'A', text: 'Làm chương trình trông đẹp' }, { key: 'B', text: 'Giải quyết vấn đề với ít tài nguyên nhất có thể' }, { key: 'C', text: 'Làm chương trình phức tạp' }, { key: 'D', text: 'Không có mục đích' }],
        answer: 'B',
        explanation: 'Thuật toán tối ưu giải quyết bài toán với ít thời gian, ít bộ nhớ và ít bước nhất có thể!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌿 Tại sao nên tiết kiệm điện khi lập trình robot?',
        options: [{ key: 'A', text: 'Vì robot không cần điện' }, { key: 'B', text: 'Vì robot hoạt động lâu hơn khi tiết kiệm năng lượng' }, { key: 'C', text: 'Điện không quan trọng' }, { key: 'D', text: 'Robot tự tạo ra điện' }],
        answer: 'B',
        explanation: 'Tối ưu năng lượng giúp robot hoạt động lâu hơn trước khi cần sạc pin. Đây là tối ưu quan trọng!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '⚡ Đường đi ngắn hơn luôn là lựa chọn tối ưu hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Trong hầu hết trường hợp, đường ngắn hơn tiết kiệm thời gian và công sức hơn.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔄 Làm cùng một việc nhiều lần hơn bao giờ cũng tốt hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Tối ưu là làm ÍT hơn nhưng kết quả vẫn tốt. Làm nhiều hơn cần thiết là lãng phí!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🏃 GPS tìm đường ngắn nhất là ví dụ về tối ưu hóa. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! GPS tính toán và chọn đường ngắn nhất (hoặc nhanh nhất) — đây là thuật toán tối ưu thực tế!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎮 Trong game, nhân vật đánh quái vật theo cách tối ưu nhất sẽ thắng nhanh hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Chọn chiến thuật tối ưu (đánh đúng điểm yếu, dùng kỹ năng đúng lúc) giúp thắng nhanh hơn!'
      },
      {
        type: 'TRUE_FALSE',
        content: '💡 Tối ưu có nghĩa là chỉ nghĩ đến tốc độ, không cần quan tâm đến kết quả. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Tối ưu phải đảm bảo KẾT QUẢ vẫn đúng. Nhanh nhưng sai thì không phải tối ưu!'
      },
      {
        type: 'TRUE_FALSE',
        content: '📦 Xếp đồ khéo vào vali giúp mang được nhiều đồ hơn. Đây là tối ưu không gian. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Xếp đồ thông minh tận dụng tối đa không gian trong vali — đây là tối ưu không gian!'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🛣️ Bài toán "Người giao hàng cần đến 5 nhà với ít km nhất" là bài toán gì?',
        options: [{ key: 'A', text: 'Bài toán lặp lại' }, { key: 'B', text: 'Bài toán tối ưu đường đi' }, { key: 'C', text: 'Bài toán phân loại' }, { key: 'D', text: 'Bài toán điều kiện' }],
        answer: 'B',
        explanation: 'Đây là bài toán tối ưu đường đi nổi tiếng trong khoa học máy tính — Travelling Salesman Problem!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '⚡ Máy tính tối ưu giúp ích gì cho cuộc sống?',
        options: [{ key: 'A', text: 'Không giúp ích gì' }, { key: 'B', text: 'Tiết kiệm thời gian, điện năng và tài nguyên' }, { key: 'C', text: 'Chỉ làm máy tính đẹp hơn' }, { key: 'D', text: 'Làm mọi thứ chậm hơn' }],
        answer: 'B',
        explanation: 'Tối ưu hóa trong máy tính giúp tiết kiệm điện, thời gian và tài nguyên cho toàn xã hội!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎯 Khi nào cần tối ưu một chương trình?',
        options: [{ key: 'A', text: 'Khi chương trình đã hoàn toàn tốt rồi' }, { key: 'B', text: 'Khi chương trình chạy quá chậm hoặc dùng quá nhiều tài nguyên' }, { key: 'C', text: 'Không bao giờ cần tối ưu' }, { key: 'D', text: 'Chỉ tối ưu khi có lỗi' }],
        answer: 'B',
        explanation: 'Tối ưu khi chương trình chạy chậm hoặc tốn quá nhiều tài nguyên. Cải thiện hiệu suất là mục tiêu!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧠 Tư duy tối ưu giúp học sinh như thế nào?',
        options: [{ key: 'A', text: 'Không giúp gì' }, { key: 'B', text: 'Giúp làm bài tập nhanh hơn và thông minh hơn' }, { key: 'C', text: 'Chỉ dùng cho máy tính' }, { key: 'D', text: 'Làm bài khó hơn' }],
        answer: 'B',
        explanation: 'Tư duy tối ưu giúp bạn tìm cách học hiệu quả, giải bài nhanh, và làm việc thông minh hơn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌟 Trong cuộc sống, ví dụ nào là "tối ưu thời gian"?',
        options: [{ key: 'A', text: 'Học 10 giờ mỗi ngày không nghỉ' }, { key: 'B', text: 'Học tập trung 1 giờ hiệu quả hơn đọc lướt 5 giờ' }, { key: 'C', text: 'Không học gì cả' }, { key: 'D', text: 'Học mọi lúc mọi nơi' }],
        answer: 'B',
        explanation: 'Học tập trung 1 giờ có thể hiệu quả hơn đọc qua loa 5 giờ — đây là tối ưu thời gian học tập!'
      },
    ]
  },
  {
    order: 10,
    topicName: 'Gỡ Lỗi',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🐛 "Gỡ lỗi" trong lập trình (Debug) có nghĩa là gì?',
        options: [{ key: 'A', text: 'Thêm lỗi vào chương trình' }, { key: 'B', text: 'Tìm và sửa các lỗi trong chương trình' }, { key: 'C', text: 'Xóa toàn bộ chương trình' }, { key: 'D', text: 'Chơi game' }],
        answer: 'B',
        explanation: 'Debug là tìm và sửa lỗi trong chương trình. Từ "bug" nghĩa là con bọ — lỗi phần mềm!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot đi sang phải thay vì đi thẳng. Đây là loại lỗi gì?',
        options: [{ key: 'A', text: 'Robot bị hỏng' }, { key: 'B', text: 'Lỗi lệnh sai (viết "Phải" thay vì "Tiến")' }, { key: 'C', text: 'Pin yếu' }, { key: 'D', text: 'Không có lỗi' }],
        answer: 'B',
        explanation: 'Lệnh sai dẫn đến hành động sai! Cần kiểm tra lại lệnh đã viết đúng chưa.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔍 Bước đầu tiên khi gỡ lỗi là?',
        options: [{ key: 'A', text: 'Xóa tất cả và viết lại từ đầu' }, { key: 'B', text: 'Xác định lỗi ở đâu và tại sao xảy ra' }, { key: 'C', text: 'Bỏ qua lỗi' }, { key: 'D', text: 'Đổ lỗi cho máy tính' }],
        answer: 'B',
        explanation: 'Trước tiên cần tìm hiểu lỗi ở đâu và nguyên nhân là gì, rồi mới tìm cách sửa!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📝 Robot không dừng lại ở đích. Có thể lỗi ở đâu?',
        options: [{ key: 'A', text: 'Màu của robot' }, { key: 'B', text: 'Thiếu lệnh "Dừng" trong chương trình' }, { key: 'C', text: 'Robot quá nhanh' }, { key: 'D', text: 'Không có lỗi' }],
        answer: 'B',
        explanation: 'Nếu robot không dừng, có thể thiếu lệnh "Dừng". Gỡ lỗi là kiểm tra từng lệnh một!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧩 Khi bài toán cho kết quả sai, cần làm gì?',
        options: [{ key: 'A', text: 'Chấp nhận kết quả sai' }, { key: 'B', text: 'Kiểm tra lại từng bước để tìm bước sai' }, { key: 'C', text: 'Làm lại hoàn toàn mà không suy nghĩ' }, { key: 'D', text: 'Hỏi người khác làm hộ' }],
        answer: 'B',
        explanation: 'Kiểm tra từng bước là cách gỡ lỗi hiệu quả nhất — tìm bước nào cho kết quả sai!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌟 Điều tốt về việc mắc lỗi và sửa lỗi là gì?',
        options: [{ key: 'A', text: 'Không có gì tốt' }, { key: 'B', text: 'Giúp học hỏi và hiểu sâu hơn về vấn đề' }, { key: 'C', text: 'Mất thời gian' }, { key: 'D', text: 'Làm người khác cười' }],
        answer: 'B',
        explanation: 'Mắc lỗi rồi tự sửa giúp bạn hiểu vấn đề sâu hơn và nhớ lâu hơn. Lỗi là người thầy tốt!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔧 Lập trình viên dành bao nhiêu thời gian để gỡ lỗi?',
        options: [{ key: 'A', text: 'Không cần gỡ lỗi' }, { key: 'B', text: 'Rất nhiều thời gian — đây là phần quan trọng của lập trình' }, { key: 'C', text: 'Chỉ 1 phút' }, { key: 'D', text: 'Chỉ người mới học mới gỡ lỗi' }],
        answer: 'B',
        explanation: 'Gỡ lỗi chiếm rất nhiều thời gian trong lập trình! Ngay cả lập trình viên giỏi cũng gỡ lỗi mỗi ngày.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎯 Cách nào giúp phòng tránh lỗi TRƯỚC khi chạy chương trình?',
        options: [{ key: 'A', text: 'Không cần làm gì' }, { key: 'B', text: 'Đọc lại code cẩn thận trước khi chạy' }, { key: 'C', text: 'Chạy thật nhanh' }, { key: 'D', text: 'Chờ người khác tìm lỗi' }],
        answer: 'B',
        explanation: 'Đọc lại code cẩn thận trước khi chạy giúp phát hiện lỗi sớm, tiết kiệm thời gian sửa sau!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🐛 "Bug" trong lập trình là tên gọi khác của lỗi chương trình. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! "Bug" nghĩa là lỗi phần mềm. "Debug" là gỡ lỗi. Thuật ngữ này bắt nguồn từ con bọ thật!'
      },
      {
        type: 'TRUE_FALSE',
        content: '✨ Lập trình viên giỏi không bao giờ mắc lỗi. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Tất cả lập trình viên đều mắc lỗi. Điều quan trọng là biết cách tìm và sửa lỗi nhanh!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔍 Gỡ lỗi đòi hỏi sự kiên nhẫn và tư duy logic. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Gỡ lỗi cần kiên nhẫn để tìm kiếm và tư duy logic để hiểu nguyên nhân lỗi.'
      },
      {
        type: 'TRUE_FALSE',
        content: '🤖 Nếu robot làm sai, chắc chắn là phần cứng robot bị hỏng. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Robot làm sai thường do lỗi LỆNH (phần mềm), không phải phần cứng. Kiểm tra code trước!'
      },
      {
        type: 'TRUE_FALSE',
        content: '📝 Ghi chú lại lỗi đã gặp giúp tránh mắc lại lỗi tương tự. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Ghi chú lỗi giúp nhớ cách sửa và không mắc lại. Đây là thói quen tốt của lập trình viên!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎭 Khi gỡ lỗi, bạn nên thay đổi nhiều thứ cùng một lúc để tiết kiệm thời gian. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Thay đổi từng thứ một giúp biết chính xác thứ gì gây ra lỗi. Đổi nhiều cùng lúc gây nhầm lẫn!'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔍 Khi gỡ lỗi, tại sao nên kiểm tra từng bước một?',
        options: [{ key: 'A', text: 'Vì mất nhiều thời gian hơn' }, { key: 'B', text: 'Vì giúp tìm chính xác bước nào gây ra lỗi' }, { key: 'C', text: 'Không cần thiết' }, { key: 'D', text: 'Vì máy tính thích vậy' }],
        answer: 'B',
        explanation: 'Kiểm tra từng bước giúp khoanh vùng lỗi chính xác hơn, không phải đoán mò!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧪 Thử nghiệm chương trình nhiều lần với các trường hợp khác nhau giúp gì?',
        options: [{ key: 'A', text: 'Làm chương trình chậm hơn' }, { key: 'B', text: 'Phát hiện nhiều loại lỗi và trường hợp chưa xử lý' }, { key: 'C', text: 'Không giúp ích gì' }, { key: 'D', text: 'Xóa lỗi' }],
        answer: 'B',
        explanation: 'Thử nghiệm nhiều trường hợp giúp phát hiện lỗi ẩn mà không xuất hiện trong thử nghiệm thông thường!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '💡 Sau khi sửa một lỗi, bạn nên làm gì?',
        options: [{ key: 'A', text: 'Dừng kiểm tra' }, { key: 'B', text: 'Chạy lại chương trình để đảm bảo lỗi đã được sửa và không có lỗi mới' }, { key: 'C', text: 'Thêm nhiều tính năng mới ngay' }, { key: 'D', text: 'Xóa ghi chú' }],
        answer: 'B',
        explanation: 'Sau khi sửa, cần chạy lại để xác nhận lỗi đã hết và việc sửa không gây ra lỗi mới!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌟 Kỹ năng gỡ lỗi giúp ích trong cuộc sống hàng ngày như thế nào?',
        options: [{ key: 'A', text: 'Không giúp ích gì ngoài lập trình' }, { key: 'B', text: 'Giúp tìm nguyên nhân vấn đề và sửa chữa trong mọi tình huống' }, { key: 'C', text: 'Chỉ dùng cho máy tính' }, { key: 'D', text: 'Làm mọi thứ phức tạp hơn' }],
        answer: 'B',
        explanation: 'Tư duy gỡ lỗi giúp bạn phân tích vấn đề trong cuộc sống và tìm cách sửa — kỹ năng rất quan trọng!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏆 Lập trình viên nào giỏi gỡ lỗi hơn?',
        options: [{ key: 'A', text: 'Người chưa bao giờ mắc lỗi' }, { key: 'B', text: 'Người từng gặp nhiều lỗi và học cách sửa chúng' }, { key: 'C', text: 'Người né tránh gỡ lỗi' }, { key: 'D', text: 'Người nhờ người khác sửa hộ' }],
        answer: 'B',
        explanation: 'Kinh nghiệm gặp và sửa nhiều loại lỗi giúp lập trình viên trở nên giỏi gỡ lỗi hơn!'
      },
    ]
  },
  {
    order: 11,
    topicName: 'Chia Bài Toán',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧩 "Chia nhỏ bài toán" trong lập trình có nghĩa là gì?',
        options: [{ key: 'A', text: 'Bỏ bớt một phần bài toán' }, { key: 'B', text: 'Tách bài toán lớn thành các bài toán nhỏ hơn, dễ giải hơn' }, { key: 'C', text: 'Giải bài toán nhanh nhất có thể' }, { key: 'D', text: 'Chia đều bài toán cho nhiều người' }],
        answer: 'B',
        explanation: 'Chia nhỏ bài toán (Decomposition) giúp biến bài toán khó thành nhiều bài toán nhỏ dễ giải!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏠 Dọn dẹp cả căn nhà là bài toán lớn. Bạn chia nhỏ như thế nào?',
        options: [{ key: 'A', text: 'Dọn tất cả cùng một lúc' }, { key: 'B', text: 'Dọn từng phòng một: phòng ngủ, phòng khách, nhà bếp' }, { key: 'C', text: 'Bỏ qua không dọn' }, { key: 'D', text: 'Chỉ dọn 1 góc nhỏ' }],
        answer: 'B',
        explanation: 'Chia thành từng phòng nhỏ giúp dọn dẹp có hệ thống và không bị quên sót! Đây là Decomposition.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎂 Nấu bánh sinh nhật là bài toán lớn. Bước nào KHÔNG thuộc quá trình làm bánh?',
        options: [{ key: 'A', text: 'Chuẩn bị nguyên liệu' }, { key: 'B', text: 'Trộn bột và nướng' }, { key: 'C', text: 'Trang trí bánh' }, { key: 'D', text: 'Lái xe ô tô' }],
        answer: 'D',
        explanation: 'Lái xe ô tô không liên quan đến làm bánh! Khi chia nhỏ bài toán cần chọn đúng các bước liên quan.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📚 Học một môn học mới trong 1 tuần. Cách chia nhỏ nào tốt nhất?',
        options: [{ key: 'A', text: 'Học tất cả trong 1 ngày cuối' }, { key: 'B', text: 'Mỗi ngày học một phần nhỏ' }, { key: 'C', text: 'Không học gì cả' }, { key: 'D', text: 'Học cùng lúc nhiều môn' }],
        answer: 'B',
        explanation: 'Học từng phần nhỏ mỗi ngày hiệu quả hơn nhồi nhét. Đây là Decomposition trong học tập!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot cần dọn phòng. Bài toán lớn này chia thành bao nhiêu bài toán nhỏ?',
        options: [{ key: 'A', text: '1 bài toán' }, { key: 'B', text: 'Nhiều bài toán: nhặt đồ, hút bụi, lau sàn...' }, { key: 'C', text: 'Không thể chia nhỏ' }, { key: 'D', text: 'Chỉ 100 bài toán nhỏ' }],
        answer: 'B',
        explanation: 'Dọn phòng chia thành nhiều bài nhỏ: nhặt đồ → hút bụi → lau sàn → sắp xếp đồ đạc...'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎨 Vẽ tranh phong cảnh là bài toán lớn. Bước đầu tiên nên là gì?',
        options: [{ key: 'A', text: 'Tô màu ngay' }, { key: 'B', text: 'Phác thảo bố cục tổng thể trước' }, { key: 'C', text: 'Vẽ chi tiết nhỏ trước' }, { key: 'D', text: 'Chờ có cảm hứng' }],
        answer: 'B',
        explanation: 'Phác thảo tổng thể trước, rồi vẽ chi tiết, rồi tô màu. Chia theo bước giúp tranh cân đối!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '💻 Tại sao lập trình viên chia chương trình lớn thành nhiều hàm nhỏ?',
        options: [{ key: 'A', text: 'Vì máy tính bắt buộc phải làm vậy' }, { key: 'B', text: 'Để dễ viết, kiểm tra và sửa lỗi từng phần' }, { key: 'C', text: 'Vì code trông đẹp hơn' }, { key: 'D', text: 'Không có lý do' }],
        answer: 'B',
        explanation: 'Chia thành hàm nhỏ giúp viết từng phần độc lập, dễ test và khi có lỗi chỉ sửa phần đó!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌳 Bài toán lớn được chia thành bài toán nhỏ hơn, rồi nhỏ hơn nữa giống hình dạng gì?',
        options: [{ key: 'A', text: 'Hình tròn' }, { key: 'B', text: 'Cây với nhiều nhánh' }, { key: 'C', text: 'Đường thẳng' }, { key: 'D', text: 'Hình vuông' }],
        answer: 'B',
        explanation: 'Chia nhỏ bài toán tạo ra cấu trúc giống cây — thân cây là bài toán gốc, nhánh là các bài toán nhỏ hơn!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🧩 Bài toán nhỏ hơn luôn dễ giải hơn bài toán lớn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Đó chính là lý do tại sao chia nhỏ bài toán — mỗi phần nhỏ dễ giải hơn bài toán tổng thể!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🏗️ Xây nhà bằng cách đặt từng viên gạch là ví dụ của chia nhỏ bài toán. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Xây nhà = đặt nhiều viên gạch nhỏ. Bài toán lớn (nhà) chia thành nhiều bài nhỏ (gạch)!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎯 Khi giải xong tất cả bài toán nhỏ, bài toán lớn cũng được giải. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Giải tất cả bài toán nhỏ và ghép lại → bài toán lớn được hoàn thành!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🧠 Chia nhỏ bài toán là kỹ năng chỉ dành cho lập trình. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Chia nhỏ bài toán dùng được khắp nơi: học tập, dọn dẹp, làm dự án, nấu ăn...'
      },
      {
        type: 'TRUE_FALSE',
        content: '🔢 Giải toán 100 ÷ 4 bằng cách: 100 ÷ 2 = 50, rồi 50 ÷ 2 = 25. Đây là chia nhỏ bài toán. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Chia phép tính khó thành 2 phép tính dễ hơn là Decomposition trong toán học!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎪 Buổi biểu diễn xiếc lớn cần chia thành nhiều tiết mục nhỏ. Đây là ví dụ chia nhỏ bài toán. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Chương trình xiếc lớn chia thành nhiều tiết mục nhỏ, mỗi tiết mục có người biểu diễn riêng!'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🚀 Phóng tên lửa lên vũ trụ là bài toán siêu lớn. Ai giải được?',
        options: [{ key: 'A', text: 'Một người thiên tài' }, { key: 'B', text: 'Một nhóm lớn, mỗi người giải một phần nhỏ' }, { key: 'C', text: 'Không ai giải được' }, { key: 'D', text: 'Máy tính tự giải' }],
        answer: 'B',
        explanation: 'NASA có hàng nghìn kỹ sư, mỗi người phụ trách một phần nhỏ. Chia nhỏ bài toán giúp giải được bài toán khổng lồ!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📱 Ứng dụng điện thoại được chia thành các tính năng nhỏ (đăng nhập, tìm kiếm, chia sẻ). Điều này giúp gì?',
        options: [{ key: 'A', text: 'Làm app phức tạp hơn' }, { key: 'B', text: 'Mỗi lập trình viên làm một tính năng, cùng nhau hoàn thành app' }, { key: 'C', text: 'Không giúp gì' }, { key: 'D', text: 'Làm app chậm hơn' }],
        answer: 'B',
        explanation: 'Chia app thành tính năng nhỏ giúp cả nhóm làm song song, hoàn thành nhanh hơn!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🧁 Bạn muốn làm 100 cái bánh cho bữa tiệc. Cách chia nhỏ hiệu quả nhất là?',
        options: [{ key: 'A', text: 'Làm tất cả 100 cái cùng lúc' }, { key: 'B', text: 'Chia thành nhiều mẻ nhỏ, mỗi mẻ 10 cái' }, { key: 'C', text: 'Chỉ làm 1 cái' }, { key: 'D', text: 'Mua ở tiệm' }],
        answer: 'B',
        explanation: 'Chia thành nhiều mẻ nhỏ dễ quản lý hơn! Mỗi mẻ là một bài toán nhỏ dễ thực hiện.'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎓 Tốt nghiệp đại học là mục tiêu lớn. Chia nhỏ theo cách nào?',
        options: [{ key: 'A', text: 'Học tất cả trong 1 ngày' }, { key: 'B', text: 'Mỗi năm học 1 năm học, mỗi tuần làm bài tập' }, { key: 'C', text: 'Không cần học' }, { key: 'D', text: 'Học 100 môn cùng lúc' }],
        answer: 'B',
        explanation: 'Chia thành từng năm, từng học kỳ, từng tuần giúp đạt được mục tiêu lớn từng bước một!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '💡 Bài học quan trọng nhất từ "Chia bài toán" là gì?',
        options: [{ key: 'A', text: 'Tránh các bài toán khó' }, { key: 'B', text: 'Bài toán lớn nào cũng giải được nếu chia thành phần nhỏ hơn' }, { key: 'C', text: 'Nhờ người khác giải hết' }, { key: 'D', text: 'Chỉ giải bài dễ' }],
        answer: 'B',
        explanation: 'Bài học quan trọng nhất: mọi bài toán lớn đều có thể giải nếu biết chia nhỏ đúng cách!'
      },
    ]
  },
  {
    order: 12,
    topicName: 'Dự Án Tổng Kết',
    questions: [
      // Q1-8: MULTIPLE_CHOICE
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌟 Trong khóa học, bạn đã học được những kỹ năng nào?',
        options: [{ key: 'A', text: 'Chỉ học cách dùng điện thoại' }, { key: 'B', text: 'Lệnh robot, Sequence, Lặp lại, Điều kiện, So sánh, Quy luật, Phân loại, Tối ưu, Gỡ lỗi, Chia bài toán' }, { key: 'C', text: 'Chỉ học toán' }, { key: 'D', text: 'Không học được gì' }],
        answer: 'B',
        explanation: 'Bạn đã học 10 kỹ năng tư duy thuật toán quan trọng. Xin chúc mừng! Bạn là một nhà tư duy thuật toán!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Để lập trình robot nhảy 5 lần rồi dừng, bạn dùng kỹ năng nào?',
        options: [{ key: 'A', text: 'Chỉ cần lệnh Dừng' }, { key: 'B', text: 'Lặp lại (5 lần) + Lệnh (Nhảy, Dừng)' }, { key: 'C', text: 'Chỉ cần Sequence' }, { key: 'D', text: 'Chỉ cần So sánh' }],
        answer: 'B',
        explanation: 'Kết hợp kỹ năng: Lệnh robot (Nhảy, Dừng) + Vòng lặp (5 lần). Đây là cách lập trình thực tế!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎮 Trò chơi điện tử dùng kỹ năng nào trong số đã học?',
        options: [{ key: 'A', text: 'Chỉ dùng màu sắc' }, { key: 'B', text: 'Tất cả: Lệnh, Lặp lại, Điều kiện, So sánh, Tối ưu...' }, { key: 'C', text: 'Chỉ dùng âm thanh' }, { key: 'D', text: 'Không dùng kỹ năng nào' }],
        answer: 'B',
        explanation: 'Game dùng TẤT CẢ kỹ năng: lệnh điều khiển nhân vật, vòng lặp animation, điều kiện thắng/thua...'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🔍 Robot phát hiện chướng ngại vật và đi vòng qua. Dùng kỹ năng nào?',
        options: [{ key: 'A', text: 'Chỉ Sequence' }, { key: 'B', text: 'Điều kiện (nếu có vật cản thì rẽ) + Lệnh (Tiến, Trái, Phải)' }, { key: 'C', text: 'Chỉ So sánh' }, { key: 'D', text: 'Chỉ Phân loại' }],
        answer: 'B',
        explanation: 'Kết hợp: Điều kiện (IF vật cản THEN rẽ) + Lệnh di chuyển. Đây là lập trình robot thực tế!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '📊 Ứng dụng thời tiết làm gì với dữ liệu nhiệt độ?',
        options: [{ key: 'A', text: 'Không làm gì' }, { key: 'B', text: 'So sánh và phân loại: nóng/ấm/mát/lạnh để hiển thị cảnh báo phù hợp' }, { key: 'C', text: 'Chỉ hiển thị số' }, { key: 'D', text: 'Xóa dữ liệu' }],
        answer: 'B',
        explanation: 'App thời tiết dùng So sánh + Phân loại + Điều kiện để xử lý dữ liệu và đưa ra cảnh báo!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🚗 GPS tự lái xe cần những kỹ năng nào?',
        options: [{ key: 'A', text: 'Chỉ cần biết đường' }, { key: 'B', text: 'Tất cả: Lệnh, Điều kiện, So sánh, Tối ưu, Gỡ lỗi...' }, { key: 'C', text: 'Chỉ cần tốc độ' }, { key: 'D', text: 'Không cần kỹ năng' }],
        answer: 'B',
        explanation: 'Xe tự lái là đỉnh cao của tất cả kỹ năng: điều khiển, phát hiện chướng ngại, tối ưu đường đi...'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌈 Tại sao học tư duy thuật toán quan trọng ngay từ nhỏ?',
        options: [{ key: 'A', text: 'Không quan trọng gì' }, { key: 'B', text: 'Giúp tư duy logic, giải quyết vấn đề và sáng tạo trong tương lai' }, { key: 'C', text: 'Chỉ để học lập trình' }, { key: 'D', text: 'Để thi điểm cao' }],
        answer: 'B',
        explanation: 'Tư duy thuật toán trang bị kỹ năng giải quyết vấn đề cho mọi lĩnh vực — khoa học, kinh doanh, nghệ thuật!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏆 Sau khóa học này, bạn có thể làm gì?',
        options: [{ key: 'A', text: 'Không thay đổi gì' }, { key: 'B', text: 'Suy nghĩ như lập trình viên, giải quyết vấn đề có hệ thống' }, { key: 'C', text: 'Chỉ làm bài tập về robot' }, { key: 'D', text: 'Chỉ chơi game' }],
        answer: 'B',
        explanation: 'Bạn đã có tư duy thuật toán! Điều này giúp bạn giải quyết mọi vấn đề theo cách thông minh hơn!'
      },
      // Q9-14: TRUE_FALSE
      {
        type: 'TRUE_FALSE',
        content: '🌟 Tư duy thuật toán chỉ cần thiết cho lập trình viên. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Tư duy thuật toán cần thiết cho tất cả mọi người: bác sĩ, kỹ sư, nghệ sĩ, giáo viên...'
      },
      {
        type: 'TRUE_FALSE',
        content: '🤖 Kết hợp nhiều kỹ năng thuật toán giúp giải quyết vấn đề phức tạp hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Các kỹ năng kết hợp với nhau tạo ra sức mạnh lớn hơn để giải quyết bài toán phức tạp!'
      },
      {
        type: 'TRUE_FALSE',
        content: '📚 Học thuật toán giúp bạn trở nên sáng tạo hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Khi biết cách giải quyết vấn đề có hệ thống, bạn có nhiều không gian hơn để sáng tạo!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🌍 Máy tính và robot xung quanh chúng ta đều hoạt động dựa trên thuật toán. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Mọi thiết bị thông minh đều dùng thuật toán — từ điện thoại đến tivi thông minh!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🎯 Bạn chỉ có thể học tư duy thuật toán tại trường. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Sai',
        explanation: 'Sai! Bạn học tư duy thuật toán qua trò chơi, cuộc sống hàng ngày, giải quyết bài toán thực tế!'
      },
      {
        type: 'TRUE_FALSE',
        content: '🚀 Trong tương lai, tư duy thuật toán sẽ càng ngày càng quan trọng hơn. Đúng hay Sai?',
        options: [{ key: 'Đúng', text: 'Đúng ✅' }, { key: 'Sai', text: 'Sai ❌' }],
        answer: 'Đúng',
        explanation: 'Đúng! Thế giới ngày càng số hóa, AI và robot ngày càng nhiều — tư duy thuật toán là kỹ năng của tương lai!'
      },
      // Q15-20: MULTIPLE_CHOICE concept-based
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎪 Dự án tổng kết: Lập trình robot múa. Bạn cần kỹ năng nào ĐẦU TIÊN?',
        options: [{ key: 'A', text: 'Gỡ lỗi' }, { key: 'B', text: 'Lệnh cơ bản (Tiến, Lùi, Trái, Phải) và Sequence' }, { key: 'C', text: 'Tối ưu' }, { key: 'D', text: 'Phân loại' }],
        answer: 'B',
        explanation: 'Bắt đầu với nền tảng: Lệnh cơ bản và Sequence. Rồi mới thêm Lặp lại, Điều kiện...'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🤖 Robot làm bài múa lặp đi lặp lại 3 lần. Kỹ năng nào được dùng?',
        options: [{ key: 'A', text: 'Chỉ Sequence' }, { key: 'B', text: 'Lặp lại (3 lần) + Sequence (các bước múa)' }, { key: 'C', text: 'Chỉ Điều kiện' }, { key: 'D', text: 'Không cần kỹ năng' }],
        answer: 'B',
        explanation: 'Múa 3 lần = Vòng lặp 3 lần. Từng động tác trong bài múa = Sequence. Hai kỹ năng kết hợp!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🌟 Robot phát hiện khán giả và bắt đầu múa, không có khán giả thì đứng yên. Dùng kỹ năng nào?',
        options: [{ key: 'A', text: 'Chỉ Lặp lại' }, { key: 'B', text: 'Điều kiện (nếu có khán giả thì múa)' }, { key: 'C', text: 'Chỉ Phân loại' }, { key: 'D', text: 'Chỉ Quy luật' }],
        answer: 'B',
        explanation: '"Nếu có khán giả thì múa, không thì đứng yên" — đây là điều kiện If/Else hoàn hảo!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🎊 Bài thi cuối khóa: Tạo robot thực hiện 1 nhiệm vụ hữu ích. Bước đầu tiên là?',
        options: [{ key: 'A', text: 'Lập trình ngay' }, { key: 'B', text: 'Lên kế hoạch: xác định nhiệm vụ, chia nhỏ thành bước' }, { key: 'C', text: 'Gỡ lỗi' }, { key: 'D', text: 'Tối ưu ngay' }],
        answer: 'B',
        explanation: 'Bước đầu tiên: LÊN KẾ HOẠCH! Xác định nhiệm vụ rõ ràng rồi chia nhỏ thành các bước. Sau đó mới code!'
      },
      {
        type: 'MULTIPLE_CHOICE',
        content: '🏅 Nhà tư duy thuật toán giỏi là người như thế nào?',
        options: [{ key: 'A', text: 'Người biết tất cả mọi thứ' }, { key: 'B', text: 'Người biết chia nhỏ vấn đề, tìm quy luật, giải từng bước và không bỏ cuộc' }, { key: 'C', text: 'Người có máy tính đắt tiền' }, { key: 'D', text: 'Người học giỏi toán nhất lớp' }],
        answer: 'B',
        explanation: 'Nhà tư duy thuật toán giỏi: kiên nhẫn, có hệ thống, biết chia nhỏ vấn đề và học từ sai lầm. Đó là BẠN!'
      },
    ]
  },
]

async function main() {
  const course = await p.course.findUnique({
    where: { code: 'CODING-KIDS-ALGO' },
    include: { subjects: { orderBy: { order: 'asc' } } }
  })

  if (!course) {
    console.error('Course CODING-KIDS-ALGO not found!')
    return
  }

  let totalCreated = 0

  for (const topicData of TOPICS) {
    const subject = course.subjects.find(s => s.order === topicData.order)
    if (!subject) {
      console.log(`⚠️  Subject order ${topicData.order} (${topicData.topicName}) not found, skipping.`)
      continue
    }

    const existing = await p.question.count({ where: { subjectId: subject.id } })
    if (existing > 0) {
      console.log(`⏭️  Skip: ${topicData.topicName} (${existing} câu đã có)`)
      continue
    }

    await p.question.createMany({
      data: topicData.questions.map((q, i) => ({
        subjectId: subject.id,
        order: i + 1,
        questionType: q.type,
        content: q.content,
        options: q.options,
        correctAnswer: q.answer,
        explanation: q.explanation,
        points: 1,
      }))
    })

    console.log(`✅  ${topicData.order}. ${topicData.topicName} — ${topicData.questions.length} câu hỏi`)
    totalCreated += topicData.questions.length
  }

  console.log(`\n🎉 Hoàn tất! Đã tạo tổng cộng ${totalCreated} câu hỏi.`)
}

main()
  .catch(e => { console.error(e.message); process.exit(1) })
  .finally(() => p.$disconnect())
