// seed-python-questions.js
// 240 câu hỏi cho khoá Python Lab (12 chủ đề × 20 câu)
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const MC = 'MULTIPLE_CHOICE'
const TF = 'TRUE_FALSE'

const tfOpts = [
  { key: 'A', text: 'Đúng ✅' },
  { key: 'B', text: 'Sai ❌' },
]

function mc(content, a, b, c, d, answer, explanation) {
  return {
    type: MC,
    content,
    options: [
      { key: 'A', text: a },
      { key: 'B', text: b },
      { key: 'C', text: c },
      { key: 'D', text: d },
    ],
    answer,
    explanation,
  }
}

function tf(content, isTrue, explanation) {
  return {
    type: TF,
    content,
    options: tfOpts,
    answer: isTrue ? 'A' : 'B',
    explanation,
  }
}

// ─────────────────────────────────────────────
// TOPIC 1 — Hello Python 🐍
// ─────────────────────────────────────────────
const topic1 = {
  order: 1,
  topicName: 'Hello Python',
  questions: [
    mc(
      '🐍 Đoạn code sau in ra gì?\n```python\nprint("Hello")\n```',
      'Hello', 'print', '"Hello"', 'Lỗi', 'A',
      '✅ print() in nội dung bên trong dấu ngoặc ra màn hình, không kèm dấu nháy.'
    ),
    mc(
      '💻 Python được dùng để làm gì?',
      'Chỉ tính toán số học', 'Làm game, web, AI và nhiều thứ khác', 'Chỉ in văn bản', 'Chỉ vẽ hình', 'B',
      '✅ Python là ngôn ngữ đa năng: dùng cho web, game, AI, khoa học dữ liệu, tự động hoá và nhiều hơn nữa!'
    ),
    mc(
      '🖨️ Lệnh in ra màn hình trong Python là gì?',
      'cout', 'System.out.println', 'print()', 'echo', 'C',
      '✅ Python dùng print() để in ra màn hình. cout là C++, System.out là Java, echo là PHP/Bash.'
    ),
    mc(
      '📄 File Python có phần mở rộng gì?',
      '.java', '.txt', '.py', '.html', 'C',
      '✅ File Python có đuôi .py, ví dụ: hello.py, game.py.'
    ),
    mc(
      '🐍 Đoạn code sau in ra gì?\n```python\nprint("Xin chào!")\n```',
      'Xin chào!', '"Xin chào!"', 'print', 'Lỗi', 'A',
      '✅ print() in nội dung chuỗi ra màn hình, không kèm dấu nháy.'
    ),
    mc(
      '💬 Dấu # trong Python dùng để làm gì?',
      'Tính toán số học', 'In ra màn hình', 'Viết chú thích (comment)', 'Khai báo biến', 'C',
      '✅ # là dấu chú thích. Python bỏ qua phần sau # khi chạy chương trình.'
    ),
    mc(
      '🔢 Đoạn code sau in ra gì?\n```python\nprint(2 + 3)\n```',
      '"2 + 3"', '2 + 3', '5', 'Lỗi', 'C',
      '✅ Python tính 2+3=5 trước rồi mới in. Không có dấu nháy nên đây là phép tính số học.'
    ),
    mc(
      '🌍 Python là loại ngôn ngữ lập trình gì?',
      'Compiled (biên dịch)', 'Interpreted (thông dịch)', 'Assembly', 'Machine code', 'B',
      '✅ Python là ngôn ngữ thông dịch — code được dịch và chạy từng dòng một.'
    ),
    mc(
      '📺 Đoạn code sau in ra bao nhiêu dòng?\n```python\nprint("Python")\nprint("Lab")\n```',
      '1 dòng: Python Lab', '2 dòng: Python và Lab riêng', 'Lỗi', 'Không in gì', 'B',
      '✅ Mỗi lệnh print() tự xuống dòng. Nên Python và Lab được in ra 2 dòng riêng biệt.'
    ),
    mc(
      '👨‍💻 Ai là người tạo ra ngôn ngữ lập trình Python?',
      'Bill Gates', 'Linus Torvalds', 'Guido van Rossum', 'Steve Jobs', 'C',
      '✅ Guido van Rossum tạo ra Python năm 1991. Ông lấy tên từ chương trình hài kịch Monty Python!'
    ),
    tf(
      '🔤 Python phân biệt chữ hoa và chữ thường (Print khác với print).',
      true,
      '✅ Đúng! Python case-sensitive. Print("hi") sẽ báo lỗi vì Python chỉ nhận print() chữ thường.'
    ),
    tf(
      '🤔 print("Hi") và print(\'Hi\') cho kết quả khác nhau.',
      false,
      '✅ Sai! Python cho phép dùng cả dấu nháy đơn \'\' và nháy kép "" — kết quả hoàn toàn giống nhau.'
    ),
    tf(
      '🤖 Python được dùng trong trí tuệ nhân tạo (AI).',
      true,
      '✅ Đúng! Python là ngôn ngữ số 1 cho AI và Machine Learning với các thư viện như TensorFlow, PyTorch.'
    ),
    tf(
      '🔢 Lệnh print() có thể in ra cả số lẫn chữ.',
      true,
      '✅ Đúng! print(42) in số, print("hello") in chữ, print(3.14) in số thập phân — đều được!'
    ),
    tf(
      '💻 Python chỉ chạy được trên Windows.',
      false,
      '✅ Sai! Python chạy được trên Windows, macOS, Linux — đa nền tảng!'
    ),
    tf(
      '📁 File Python bắt buộc phải đặt tên là "main.py".',
      false,
      '✅ Sai! Bạn có thể đặt tên file Python tuỳ ý, ví dụ: game.py, robot.py, bai1.py...'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi không?\n```python\nPrint("Hello World")\n```',
      'Không lỗi, chạy bình thường',
      'Lỗi! Print viết hoa phải là print (chữ thường)',
      'Lỗi vì thiếu dấu ;',
      'Lỗi vì không có dấu {}',
      'B',
      '✅ Python phân biệt hoa/thường. Print() không tồn tại — phải dùng print() chữ thường.'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau là gì?\n```python\nprint("5" + "3")\n```',
      '8', '53', '"53"', 'Lỗi', 'B',
      '✅ "5" và "3" là chuỗi (string), nên cộng chuỗi = nối chuỗi = "53", không phải 8.'
    ),
    mc(
      '🖨️ Đoạn code sau in ra gì?\n```python\nprint("Xin", "chào", "bạn")\n```',
      'Xin chào bạn (cách nhau bởi dấu cách)', 'Xinchàobạn (không cách)', 'Lỗi vì có 3 đối số', '"Xin" "chào" "bạn"', 'A',
      '✅ Khi print() có nhiều đối số cách nhau bởi dấu phẩy, Python tự thêm dấu cách giữa chúng.'
    ),
    mc(
      '🔍 Đoạn code sau in ra gì?\n```python\n# print("Hello")\nprint("World")\n```',
      'Hello\nWorld', 'Hello World', 'World', 'Không in gì hết', 'C',
      '✅ Dòng có # là comment, Python bỏ qua. Chỉ có print("World") được chạy → in ra World.'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 2 — Variables & Input 📦
// ─────────────────────────────────────────────
const topic2 = {
  order: 2,
  topicName: 'Variables & Input',
  questions: [
    mc(
      '📦 Sau khi chạy x = 5, x có giá trị bao nhiêu?',
      '"5" (chuỗi)', 'x (tên biến)', '5 (số nguyên)', 'Lỗi', 'C',
      '✅ x = 5 gán số nguyên 5 cho biến x. Không có dấu nháy nên đây là số, không phải chuỗi.'
    ),
    mc(
      '⌨️ Hàm input() dùng để làm gì?',
      'In dữ liệu ra màn hình', 'Nhận dữ liệu người dùng gõ vào', 'Tính toán', 'Lưu file', 'B',
      '✅ input() dừng chương trình, chờ người dùng gõ rồi nhấn Enter, sau đó trả về chuỗi đã nhập.'
    ),
    mc(
      '🔢 Kiểu dữ liệu nào dùng để lưu số nguyên?',
      'str', 'float', 'int', 'bool', 'C',
      '✅ int = integer = số nguyên (1, 42, -7). float = số thập phân. str = chuỗi. bool = True/False.'
    ),
    mc(
      '🔍 Kết quả của type("Hello") là gì?',
      "<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'bool'>", 'B',
      "✅ \"Hello\" là chuỗi văn bản nên type() trả về <class 'str'>."
    ),
    mc(
      '🧮 Đoạn code sau in ra gì?\n```python\nx = 10\ny = 3\nprint(x + y)\n```',
      'x + y', '"10 + 3"', '13', 'Lỗi', 'C',
      '✅ x=10, y=3, x+y=13. Python tính toán rồi mới in kết quả.'
    ),
    mc(
      '🔄 Để đổi chuỗi "5" thành số nguyên 5, ta dùng hàm gì?',
      'str()', 'float()', 'int()', 'num()', 'C',
      '✅ int("5") chuyển chuỗi "5" thành số nguyên 5. Cần thiết khi xử lý dữ liệu từ input().'
    ),
    mc(
      '👋 Đoạn code sau in ra gì?\n```python\nten = "Nam"\nprint("Xin chào,", ten)\n```',
      'Xin chào, ten', 'Xin chào, Nam', 'ten', 'Lỗi', 'B',
      '✅ ten là biến chứa "Nam". print() in giá trị biến, không in tên biến → Xin chào, Nam.'
    ),
    mc(
      '✅ Kiểu dữ liệu của True và False là gì?',
      'str', 'int', 'bool', 'float', 'C',
      '✅ True và False là kiểu bool (Boolean). Trong Python, bool là kiểu con của int (True=1, False=0).'
    ),
    mc(
      '🔢 Đoạn code sau in ra gì?\n```python\na = 3.14\nprint(type(a))\n```',
      "<class 'int'>", "<class 'str'>", "<class 'float'>", '3.14', 'C',
      "✅ 3.14 là số thập phân nên kiểu là float. type() trả về <class 'float'>."
    ),
    mc(
      '✍️ Cách đặt tên biến nào hợp lệ trong Python?',
      '1bien (bắt đầu bằng số)', 'bien-1 (có dấu trừ)', 'bien_1 (dấu gạch dưới)', 'bien 1 (có dấu cách)', 'C',
      '✅ Tên biến phải bắt đầu bằng chữ hoặc _, chỉ chứa chữ, số, dấu _. Không được bắt đầu bằng số hay có khoảng trắng.'
    ),
    tf(
      '🔄 Biến trong Python có thể thay đổi kiểu dữ liệu trong chương trình (x=5 rồi x="hello").',
      true,
      '✅ Đúng! Python là ngôn ngữ dynamically typed — biến có thể đổi kiểu bất kỳ lúc nào.'
    ),
    tf(
      '🔤 ten = "Nam" và TEN = "Nam" là cùng một biến trong Python.',
      false,
      '✅ Sai! Python phân biệt hoa/thường. ten và TEN là 2 biến khác nhau hoàn toàn.'
    ),
    tf(
      '⌨️ Hàm input() luôn trả về kiểu dữ liệu str (chuỗi văn bản).',
      true,
      '✅ Đúng! Dù người dùng nhập số, input() vẫn trả về chuỗi. Cần int() hoặc float() để chuyển đổi.'
    ),
    tf(
      '🔢 Kiểu float có thể lưu số thập phân như 3.14 hay 9.81.',
      true,
      '✅ Đúng! float (floating point) dùng cho số thập phân: 3.14, 2.718, -0.5...'
    ),
    tf(
      '❌ Tên biến có thể bắt đầu bằng chữ số (ví dụ: 1game = "Rắn").',
      false,
      '✅ Sai! Tên biến không được bắt đầu bằng số. 1game sẽ gây SyntaxError. Dùng game1 thay thế.'
    ),
    tf(
      '✂️ x = y = 5 là cú pháp hợp lệ để gán giá trị 5 cho cả x và y cùng lúc.',
      true,
      '✅ Đúng! Python cho phép gán nhiều biến cùng lúc: x = y = z = 0 đều hợp lệ.'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi gì?\n```python\ntuoi = input("Nhập tuổi: ")\nprint(tuoi + 1)\n```',
      'Không lỗi, chạy bình thường',
      'Lỗi! input() trả về str, không thể cộng với số 1',
      'Lỗi vì thiếu dấu ;',
      'Lỗi vì print sai cú pháp',
      'B',
      '✅ input() luôn trả về chuỗi. "15" + 1 gây TypeError. Sửa bằng: tuoi = int(input(...))'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\nx = 10\nx = x + 5\nprint(x)\n```',
      '10', '5', '15', 'x + 5', 'C',
      '✅ Đầu tiên x=10. Sau đó x = 10+5 = 15. print(x) in ra 15.'
    ),
    mc(
      '⌨️ Để nhận số nguyên từ người dùng, code nào đúng?',
      'x = input()', 'x = int(input())', 'x = num(input())', 'x = integer(input())', 'B',
      '✅ int(input()) là chuẩn: input() nhận chuỗi, int() chuyển thành số nguyên.'
    ),
    mc(
      '🔮 Đoạn code sau in ra gì?\n```python\na = 5\nb = a\na = 10\nprint(b)\n```',
      '10', '5', 'a', 'Lỗi', 'B',
      '✅ b = a khi a=5, nên b=5. Sau đó a đổi thành 10, nhưng b không bị ảnh hưởng. b vẫn là 5.'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 3 — If / Else 🔀
// ─────────────────────────────────────────────
const topic3 = {
  order: 3,
  topicName: 'If / Else',
  questions: [
    mc(
      '🔀 Kết quả của đoạn code sau?\n```python\nx = 10\nif x > 5:\n    print("Lớn")\n```',
      'Không in gì', 'Lớn', '10', 'Lỗi', 'B',
      '✅ x=10 > 5 → điều kiện đúng → in ra "Lớn".'
    ),
    mc(
      '❓ Từ khóa nào dùng để kiểm tra điều kiện trong Python?',
      'when', 'check', 'if', 'test', 'C',
      '✅ if là từ khóa kiểm tra điều kiện trong Python (và hầu hết ngôn ngữ lập trình).'
    ),
    mc(
      '🔀 Kết quả của đoạn code sau?\n```python\nx = 3\nif x > 5:\n    print("Lớn")\nelse:\n    print("Nhỏ")\n```',
      'Lớn', 'Nhỏ', 'Lớn\nNhỏ', 'Lỗi', 'B',
      '✅ x=3, 3>5 là sai → chạy else → in "Nhỏ".'
    ),
    mc(
      '⚖️ Toán tử nào dùng để kiểm tra hai giá trị bằng nhau trong Python?',
      '= (một dấu bằng)', '== (hai dấu bằng)', '!= (khác nhau)', '>= (lớn hơn hoặc bằng)', 'B',
      '✅ == so sánh hai giá trị. = là gán giá trị. Đừng nhầm lẫn! if x == 5 ✅  if x = 5 ❌'
    ),
    mc(
      '🎯 Kết quả của đoạn code sau?\n```python\ndiem = 8\nif diem >= 9:\n    print("Giỏi")\nelif diem >= 7:\n    print("Khá")\nelse:\n    print("Trung bình")\n```',
      'Giỏi', 'Khá', 'Trung bình', 'Lỗi', 'B',
      '✅ diem=8. 8>=9 sai → kiểm tra elif: 8>=7 đúng → in "Khá".'
    ),
    mc(
      '🤔 Từ khóa elif có nghĩa là gì?',
      'else if — kiểm tra thêm điều kiện khi if sai', 'end if — kết thúc khối if', 'else — trường hợp còn lại', 'equal if — so sánh bằng', 'A',
      '✅ elif = else if. Dùng khi cần kiểm tra nhiều điều kiện liên tiếp.'
    ),
    mc(
      '✅ Kết quả của đoạn code sau?\n```python\nx = 5\nif x == 5:\n    print("Đúng")\nelse:\n    print("Sai")\n```',
      'Sai', 'Đúng', '5', 'Lỗi', 'B',
      '✅ x=5, 5==5 là True → chạy if → in "Đúng".'
    ),
    mc(
      '❌ Toán tử nào có nghĩa là "không bằng nhau"?',
      '<>', '!=', '!==', 'not=', 'B',
      '✅ != là toán tử "không bằng". Ví dụ: 3 != 5 → True, 5 != 5 → False.'
    ),
    mc(
      '🔗 Kết quả của đoạn code sau?\n```python\na = True\nb = False\nif a and b:\n    print("Cả hai đúng")\nelse:\n    print("Không phải cả hai")\n```',
      'Cả hai đúng', 'Không phải cả hai', 'True', 'Lỗi', 'B',
      '✅ True and False = False → điều kiện sai → chạy else.'
    ),
    mc(
      '📐 Python dùng gì thay cho dấu {} để xác định khối lệnh bên trong if?',
      'Dấu ngoặc đơn ()', 'Dấu ngoặc vuông []', 'Thụt đầu dòng (indentation — 4 dấu cách)', 'Dấu chấm phẩy ;', 'C',
      '✅ Python dùng indentation (thụt vào 4 dấu cách hoặc 1 Tab) để xác định khối lệnh. Rất quan trọng!'
    ),
    tf(
      '❌ if x = 5: là cách đúng để kiểm tra x có bằng 5 không.',
      false,
      '✅ Sai! = là gán giá trị, phải dùng == để so sánh. Đúng là: if x == 5:'
    ),
    tf(
      '🔀 Có thể dùng nhiều elif sau một if trong Python.',
      true,
      '✅ Đúng! Bạn có thể có bao nhiêu elif tuỳ ý để kiểm tra nhiều điều kiện khác nhau.'
    ),
    tf(
      '⚠️ Phần else là bắt buộc sau mỗi câu lệnh if.',
      false,
      '✅ Sai! else là tuỳ chọn. Nếu không có else, khi điều kiện sai Python đơn giản là bỏ qua khối if.'
    ),
    tf(
      '📐 Python dùng indentation (thụt vào 4 dấu cách) để xác định khối lệnh if/else.',
      true,
      '✅ Đúng! Indentation trong Python không chỉ là phong cách — đây là cú pháp bắt buộc!'
    ),
    tf(
      '🔗 Điều kiện if có thể kết hợp and, or, not để kiểm tra nhiều điều kiện cùng lúc.',
      true,
      '✅ Đúng! if x > 0 and x < 10: — kiểm tra x nằm trong khoảng 0 đến 10.'
    ),
    tf(
      '📋 Nếu điều kiện if sai và không có else, Python sẽ báo lỗi.',
      false,
      '✅ Sai! Nếu không có else, Python chỉ đơn giản bỏ qua khối if và tiếp tục chạy code phía sau.'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi gì?\n```python\nx = 10\nif x > 5\n    print("Lớn")\n```',
      'Không lỗi',
      'Thiếu dấu hai chấm : sau điều kiện if',
      'Thiếu else phía sau',
      'Sai indentation',
      'B',
      '✅ Sau điều kiện if phải có dấu : (hai chấm). Đúng là: if x > 5:'
    ),
    mc(
      '🔮 Kết quả của đoạn code này?\n```python\nx = 0\nif x:\n    print("Đúng")\nelse:\n    print("Sai")\n```',
      'Đúng', 'Sai', '0', 'Lỗi', 'B',
      '✅ Trong Python, số 0 được coi là False. Nên if 0: sai → chạy else → in "Sai".'
    ),
    mc(
      '📊 Để kiểm tra x nằm trong khoảng từ 1 đến 10, code nào đúng?',
      'if 1 < x < 10 (chỉ không bao gồm đầu và cuối)',
      'if x > 1 and x < 10 (giống câu A)',
      'Cả A và B đều đúng trong Python',
      'if x between 1 and 10 (Python không có between)',
      'C',
      '✅ Python hỗ trợ cả hai cách: 1 < x < 10 và x > 1 and x < 10 đều cho kết quả như nhau!'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\nx = 15\nif x > 10:\n    print("Hơn 10")\nif x > 20:\n    print("Hơn 20")\n```',
      'Hơn 10', 'Hơn 20', 'Hơn 10\nHơn 20', 'Không in gì', 'A',
      '✅ Đây là 2 câu if độc lập. x=15 > 10 → in "Hơn 10". 15 > 20 sai → không in dòng thứ 2.'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 4 — Loop 🔁
// ─────────────────────────────────────────────
const topic4 = {
  order: 4,
  topicName: 'Loop',
  questions: [
    mc(
      '🔁 Vòng lặp for range(5) lặp bao nhiêu lần?',
      '4 lần', '5 lần', '6 lần', '1 đến 5 (không rõ)', 'B',
      '✅ range(5) tạo ra 0,1,2,3,4 — tổng cộng 5 số → lặp 5 lần.'
    ),
    mc(
      '🔢 Kết quả của đoạn code sau?\n```python\nfor i in range(3):\n    print(i)\n```',
      '1 2 3', '0 1 2', '0 1 2 3', '1 2 3 4', 'B',
      '✅ range(3) tạo ra 0,1,2. Vòng for in ra 0, 1, 2 (mỗi số một dòng).'
    ),
    mc(
      '🔄 Vòng lặp while dùng để làm gì?',
      'Lặp khi điều kiện còn đúng (True)', 'Lặp đúng 1 lần rồi dừng', 'Luôn lặp vô hạn', 'Chỉ kiểm tra điều kiện, không lặp', 'A',
      '✅ while lặp liên tục miễn là điều kiện còn True. Rất hữu ích khi không biết trước số lần lặp.'
    ),
    mc(
      '🛑 Lệnh nào dùng để thoát khỏi vòng lặp ngay lập tức?',
      'stop', 'exit', 'break', 'end', 'C',
      '✅ break dừng vòng lặp ngay lập tức và nhảy ra ngoài. Rất hữu dụng trong game!'
    ),
    mc(
      '➕ Kết quả của đoạn code sau?\n```python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)\n```',
      '6', '10', '3', '0', 'A',
      '✅ range(1,4) = 1,2,3. total = 0+1+2+3 = 6.'
    ),
    mc(
      '⏭️ Lệnh continue trong vòng lặp làm gì?',
      'Thoát vòng lặp hoàn toàn', 'Bỏ qua phần còn lại của vòng hiện tại, sang vòng tiếp', 'Dừng toàn bộ chương trình', 'Tăng biến đếm tự động', 'B',
      '✅ continue nhảy lên đầu vòng lặp kế tiếp, bỏ qua code phía dưới trong vòng hiện tại.'
    ),
    mc(
      '🔢 Kết quả của đoạn code sau?\n```python\nfor i in range(2, 10, 3):\n    print(i)\n```',
      '2 5 8', '2 3 4 5 6 7 8 9', '2 4 6 8', '3 6 9', 'A',
      '✅ range(2, 10, 3) bắt đầu từ 2, bước nhảy 3: 2, 5, 8 (11 >= 10 nên dừng).'
    ),
    mc(
      '🔢 range(1, 6) sinh ra dãy số nào?',
      '1 2 3 4 5 6', '1 2 3 4 5', '0 1 2 3 4 5', '1 2 3 4', 'B',
      '✅ range(1, 6) = 1,2,3,4,5. Số cuối (6) không được bao gồm. Nhớ: phần cuối của range luôn bị loại!'
    ),
    mc(
      '🔄 Kết quả của đoạn code sau?\n```python\ni = 1\nwhile i <= 3:\n    print(i)\n    i += 1\n```',
      '1 2 3', '0 1 2 3', '1 2 3 4', 'Vô hạn', 'A',
      '✅ i bắt đầu từ 1, in rồi tăng, dừng khi i=4 > 3. In ra: 1, 2, 3.'
    ),
    mc(
      '🤔 Vòng lặp nào phù hợp khi KHÔNG biết trước số lần lặp?',
      'for range(n)', 'while (điều kiện)', 'do-while', 'for each', 'B',
      '✅ while phù hợp khi không biết trước số lần lặp. Ví dụ: lặp cho đến khi người dùng đoán đúng.'
    ),
    tf(
      '❌ range(5) bao gồm số 5 trong dãy số.',
      false,
      '✅ Sai! range(5) = 0,1,2,3,4 — không có 5. Muốn có 5 thì dùng range(6).'
    ),
    tf(
      '🔁 Có thể lồng vòng lặp for bên trong một vòng for khác (nested loops).',
      true,
      '✅ Đúng! Vòng lặp lồng nhau rất hữu ích, ví dụ: in bảng cửu chương với 2 vòng for lồng nhau.'
    ),
    tf(
      '🛑 Lệnh break làm dừng toàn bộ chương trình Python.',
      false,
      '✅ Sai! break chỉ thoát khỏi vòng lặp gần nhất, không dừng toàn bộ chương trình.'
    ),
    tf(
      '✍️ i += 1 là cách viết tắt của i = i + 1.',
      true,
      '✅ Đúng! += là toán tử cộng và gán. Tương tự: -= (trừ), *= (nhân), /= (chia).'
    ),
    tf(
      '🔤 for char in "Python": sẽ duyệt qua từng ký tự trong chuỗi "Python".',
      true,
      '✅ Đúng! Vòng for có thể duyệt chuỗi: P,y,t,h,o,n — mỗi vòng một chữ cái.'
    ),
    tf(
      '♾️ while True: tạo ra vòng lặp vô hạn (infinite loop).',
      true,
      '✅ Đúng! while True luôn đúng nên lặp mãi. Dùng break để thoát. Thường dùng trong game loop.'
    ),
    mc(
      '🐛 Đoạn code sau có vấn đề gì?\n```python\ni = 0\nwhile i < 5:\n    print(i)\n```',
      'Không lỗi, chạy bình thường',
      'Vòng lặp vô hạn! i không bao giờ tăng',
      'Lỗi cú pháp while',
      'Thiếu range()',
      'B',
      '✅ i không bao giờ thay đổi → điều kiện i<5 luôn đúng → vòng lặp vô hạn! Cần thêm i += 1.'
    ),
    mc(
      '🔮 Kết quả của đoạn code này?\n```python\nfor i in range(5):\n    if i == 3:\n        break\n    print(i)\n```',
      '0 1 2 3 4', '0 1 2', '0 1 2 3', '1 2 3', 'B',
      '✅ In 0,1,2. Khi i=3, gặp break → thoát vòng lặp. Số 3 không được in.'
    ),
    mc(
      '📊 Đoạn code nào in ra bảng cửu chương của 2?',
      'for i in range(1, 11): print(2 * i)',
      'for i in range(10): print(2 + i)',
      'print(2 * range(10))',
      'while 2: print(i)',
      'A',
      '✅ range(1,11) = 1 đến 10. 2*1, 2*2, ..., 2*10 là đúng bảng cửu chương của 2.'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau tạo ra bao nhiêu dòng output?\n```python\nfor i in range(3):\n    for j in range(2):\n        print(i, j)\n```',
      '6 dòng: (0,0)(0,1)(1,0)(1,1)(2,0)(2,1)', '3 dòng', '2 dòng', 'Lỗi', 'A',
      '✅ Vòng ngoài chạy 3 lần (i=0,1,2), mỗi lần vòng trong chạy 2 lần (j=0,1) → 3×2=6 dòng.'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 5 — Function 🧩
// ─────────────────────────────────────────────
const topic5 = {
  order: 5,
  topicName: 'Function',
  questions: [
    mc(
      '🧩 Từ khóa nào dùng để định nghĩa hàm trong Python?',
      'function', 'def', 'func', 'define', 'B',
      '✅ def (viết tắt của define) là từ khóa tạo hàm trong Python. Ví dụ: def chao():'
    ),
    mc(
      '📣 Kết quả của đoạn code sau?\n```python\ndef chao():\n    print("Xin chào!")\nchao()\n```',
      'Không in gì', 'chao()', 'Xin chào!', 'Lỗi', 'C',
      '✅ Định nghĩa hàm không chạy code. Phải gọi chao() thì mới chạy → in "Xin chào!".'
    ),
    mc(
      '↩️ Từ khóa return dùng để làm gì?',
      'In kết quả ra màn hình', 'Kết thúc toàn bộ chương trình', 'Trả về giá trị từ hàm', 'Lặp lại hàm', 'C',
      '✅ return trả về giá trị từ hàm cho nơi gọi hàm. Không in ra màn hình!'
    ),
    mc(
      '🧮 Kết quả của đoạn code sau?\n```python\ndef cong(a, b):\n    return a + b\nprint(cong(3, 4))\n```',
      'a + b', '7', '3', 'Lỗi', 'B',
      '✅ cong(3,4) tính 3+4=7, return 7. print(7) → in ra 7.'
    ),
    mc(
      '📥 Tham số (parameter) của hàm là gì?',
      'Tên của hàm', 'Giá trị truyền vào hàm khi gọi', 'Giá trị trả về của hàm', 'Dấu () sau tên hàm', 'B',
      '✅ Tham số là "đầu vào" của hàm. Ví dụ: def cong(a, b): → a và b là tham số.'
    ),
    mc(
      '📐 Kết quả của đoạn code sau?\n```python\ndef binh_phuong(x):\n    return x * x\nket_qua = binh_phuong(5)\nprint(ket_qua)\n```',
      'x * x', '10', '25', 'Lỗi', 'C',
      '✅ binh_phuong(5) tính 5×5=25, return 25, gán vào ket_qua. print(25) → 25.'
    ),
    mc(
      '🔁 Hàm đã định nghĩa có thể được gọi bao nhiêu lần?',
      'Chỉ 1 lần', 'Tối đa 10 lần', 'Nhiều lần tuỳ ý', 'Không thể gọi lại', 'C',
      '✅ Đây chính là sức mạnh của hàm! Định nghĩa 1 lần, dùng nhiều lần ở bất kỳ đâu.'
    ),
    mc(
      '🎁 Kết quả của đoạn code sau?\n```python\ndef hello(ten="Bạn"):\n    print("Xin chào,", ten)\nhello()\n```',
      'Xin chào, ten', 'Xin chào, Bạn', 'Lỗi vì không truyền tham số', 'hello()', 'B',
      '✅ ten="Bạn" là giá trị mặc định. Gọi hello() không truyền gì → dùng mặc định "Bạn".'
    ),
    mc(
      '🏠 Biến khai báo bên trong hàm có phạm vi (scope) gì?',
      'Toàn chương trình (global)', 'Chỉ trong hàm đó (local)', 'Chỉ ngoài hàm', 'Không giới hạn', 'B',
      '✅ Biến local chỉ sống trong hàm. Ra ngoài hàm, biến đó không tồn tại nữa.'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\ndef dem(n):\n    if n == 0:\n        return\n    print(n)\n    dem(n - 1)\ndem(3)\n```',
      '1 2 3', '3 2 1', '0 1 2 3', 'Lỗi', 'B',
      '✅ dem(3) in 3, gọi dem(2) in 2, gọi dem(1) in 1, gọi dem(0) return không in. Kết quả: 3 2 1.'
    ),
    tf(
      '⚠️ Mọi hàm Python đều bắt buộc phải có lệnh return.',
      false,
      '✅ Sai! Hàm không cần return. Nếu không có return, hàm tự trả về None (không có giá trị).'
    ),
    tf(
      '🔗 Một hàm có thể gọi hàm khác bên trong nó.',
      true,
      '✅ Đúng! Hàm gọi hàm là kỹ thuật cơ bản. Ví dụ: hàm main() gọi hàm tinh_diem().'
    ),
    tf(
      '♻️ Hàm giúp tránh lặp code và dễ tái sử dụng.',
      true,
      '✅ Đúng! Thay vì copy-paste code 5 lần, viết 1 hàm và gọi 5 lần. Code ngắn gọn và dễ sửa hơn.'
    ),
    tf(
      '📚 Một hàm Python có thể có nhiều tham số đầu vào.',
      true,
      '✅ Đúng! def tinh(a, b, c, d): là hoàn toàn hợp lệ. Có thể có nhiều tham số tuỳ ý.'
    ),
    tf(
      '🐛 Gọi hàm mà không truyền đủ tham số bắt buộc sẽ gây ra lỗi TypeError.',
      true,
      '✅ Đúng! Nếu def cong(a, b): mà gọi cong(5) thiếu b → TypeError: missing 1 required argument.'
    ),
    tf(
      '🔄 Đệ quy (recursion) là khi hàm gọi chính nó bên trong hàm đó.',
      true,
      '✅ Đúng! Đệ quy là kỹ thuật mạnh nhưng cần điều kiện dừng (base case) để không lặp vô hạn.'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi gì?\n```python\ndef tinh_tong(a, b)\n    return a + b\nprint(tinh_tong(5, 3))\n```',
      'Không lỗi',
      'Thiếu dấu hai chấm : sau def tinh_tong(a, b)',
      'Lỗi return',
      'Lỗi print',
      'B',
      '✅ Sau phần khai báo hàm phải có dấu : (hai chấm). Đúng là: def tinh_tong(a, b):'
    ),
    mc(
      '🔮 Kết quả của đoạn code này?\n```python\ndef f(x):\n    return x * 2\nprint(f(f(3)))\n```',
      '6', '12', '9', 'Lỗi', 'B',
      '✅ f(3) = 3×2 = 6. f(6) = 6×2 = 12. print(12) → 12.'
    ),
    mc(
      '✅ Đoạn code nào tạo hàm tính diện tích hình chữ nhật đúng cú pháp?',
      'def area(w, h): return w * h',
      'def area(w h): return w * h',
      'function area(w, h): return w * h',
      'def area: return w * h',
      'A',
      '✅ Cú pháp đúng: def tên_hàm(tham_số): Tham số phân cách bằng dấu phẩy.'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\nx = 10\ndef thay_doi():\n    x = 20\n    print(x)\nthay_doi()\nprint(x)\n```',
      '20\n20', '10\n10', '20\n10', '10\n20', 'C',
      '✅ x=20 trong hàm là biến local. print(x) trong hàm → 20. x bên ngoài vẫn là 10. In: 20 rồi 10.'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 6 — List & Dictionary 📋
// ─────────────────────────────────────────────
const topic6 = {
  order: 6,
  topicName: 'List & Dictionary',
  questions: [
    mc(
      '📋 Cách tạo list trong Python?',
      'list = (1, 2, 3) — dùng ngoặc tròn',
      'list = [1, 2, 3] — dùng ngoặc vuông',
      'list = {1, 2, 3} — dùng ngoặc nhọn',
      'list = <1, 2, 3> — dùng dấu nhọn nhỏ',
      'B',
      '✅ List dùng dấu [] ngoặc vuông. (1,2,3) là tuple. {1,2,3} là set.'
    ),
    mc(
      '🍎 Kết quả của đoạn code sau?\n```python\nfruits = ["táo", "cam", "chuối"]\nprint(fruits[1])\n```',
      'táo', 'cam', 'chuối', '1', 'B',
      '✅ Index bắt đầu từ 0: fruits[0]="táo", fruits[1]="cam", fruits[2]="chuối".'
    ),
    mc(
      '0️⃣ Index đầu tiên của list trong Python là bao nhiêu?',
      '1', '-1', '0','Tuỳ độ dài list', 'C',
      '✅ Python đánh số từ 0! my_list[0] là phần tử đầu tiên. Nhớ: đếm từ 0, không phải 1!'
    ),
    mc(
      '➕ Hàm nào thêm phần tử vào CUỐI list?',
      'add()', 'push()', 'append()', 'insert()', 'C',
      '✅ append() thêm vào cuối. insert(i, x) chèn vào vị trí i. extend() nối list.'
    ),
    mc(
      '📏 Kết quả của đoạn code sau?\n```python\nso = [1, 2, 3, 4, 5]\nprint(len(so))\n```',
      '4', '5', '6', '15', 'B',
      '✅ len() trả về số phần tử trong list. List có 5 phần tử → len() = 5.'
    ),
    mc(
      '📖 Cách tạo dictionary trong Python?',
      'd = [key: value]', 'd = (key: value)', 'd = {key: value}', 'd = <key: value>', 'C',
      '✅ Dictionary dùng {} ngoặc nhọn với cặp key:value, phân cách bằng dấu phẩy.'
    ),
    mc(
      '📚 Kết quả của đoạn code sau?\n```python\nhs = {"ten": "Nam", "tuoi": 12}\nprint(hs["ten"])\n```',
      'ten', 'Nam', '"ten"', 'Lỗi', 'B',
      '✅ hs["ten"] lấy giá trị của key "ten" trong dictionary → "Nam".'
    ),
    mc(
      '🗑️ Lệnh nào XÓA phần tử cuối list VÀ trả về nó?',
      'remove()', 'delete()', 'pop()', 'clear()', 'C',
      '✅ pop() xóa và trả về phần tử cuối. pop(i) xóa phần tử tại vị trí i. remove(x) xóa theo giá trị.'
    ),
    mc(
      '🍊 Kết quả của đoạn code sau?\n```python\na = [1, 2, 3]\na.append(4)\nprint(a)\n```',
      '[1, 2, 3]', '[1, 2, 3, 4]', '[4, 1, 2, 3]', 'Lỗi', 'B',
      '✅ append(4) thêm 4 vào cuối list → [1, 2, 3, 4].'
    ),
    mc(
      '🔄 Cách duyệt tất cả phần tử trong list đúng cú pháp là?',
      'for item in my_list:', 'for item of my_list:', 'foreach item in my_list:', 'loop item in my_list:', 'A',
      '✅ Cú pháp Python: for item in list:. Không dùng of, foreach, hay loop.'
    ),
    tf(
      '🎭 List trong Python có thể chứa nhiều kiểu dữ liệu khác nhau (số, chuỗi, bool...).',
      true,
      '✅ Đúng! mixed = [1, "hello", True, 3.14] — hoàn toàn hợp lệ trong Python!'
    ),
    tf(
      '❌ Dictionary có thể có 2 key giống nhau.',
      false,
      '✅ Sai! Key trong dictionary phải duy nhất. Nếu thêm key trùng, giá trị mới sẽ ghi đè giá trị cũ.'
    ),
    tf(
      '✏️ Có thể thay đổi giá trị trong list sau khi tạo (list là mutable).',
      true,
      '✅ Đúng! my_list[0] = 99 hoàn toàn hợp lệ. List có thể thay đổi, khác với tuple (immutable).'
    ),
    tf(
      '🔒 Tuple giống list nhưng không thể thay đổi sau khi tạo (immutable).',
      true,
      '✅ Đúng! Tuple dùng (). my_tuple = (1,2,3). Không thể thay đổi phần tử sau khi tạo.'
    ),
    tf(
      '🔚 fruits[-1] trả về phần tử đầu tiên của list.',
      false,
      '✅ Sai! Index âm đếm từ cuối. fruits[-1] là phần tử CUỐI cùng. fruits[-2] là áp chót...'
    ),
    tf(
      '📏 len() trả về số phần tử trong list, tuple, dictionary và chuỗi.',
      true,
      '✅ Đúng! len([1,2,3])=3, len("hello")=5, len({"a":1})=1. len() rất đa năng!'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi gì?\n```python\nhs = {"ten": "Nam", "tuoi": 12}\nprint(hs["lop"])\n```',
      'Không lỗi, in ra None',
      'KeyError vì key "lop" không tồn tại trong dictionary',
      'Lỗi cú pháp',
      'In ra 0 (mặc định)',
      'B',
      '✅ Truy cập key không tồn tại → KeyError. Dùng hs.get("lop", "chưa có") để tránh lỗi.'
    ),
    mc(
      '🔮 Kết quả của đoạn code này?\n```python\nnumbers = [3, 1, 4, 1, 5]\nnumbers.sort()\nprint(numbers)\n```',
      '[3, 1, 4, 1, 5]', '[1, 1, 3, 4, 5]', '[5, 4, 3, 1, 1]', 'Lỗi', 'B',
      '✅ sort() sắp xếp list tăng dần (in-place). [3,1,4,1,5] → [1,1,3,4,5].'
    ),
    mc(
      '🔍 Đoạn code nào kiểm tra xem "táo" có trong list fruits không?',
      'if "táo" in fruits:',
      'if fruits.has("táo"):',
      'if fruits.contains("táo"):',
      'if "táo" == fruits:',
      'A',
      '✅ Từ khóa in kiểm tra sự tồn tại trong list/tuple/dict/string. Rất đơn giản và Pythonic!'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\nd = {"a": 1, "b": 2}\nd["c"] = 3\nprint(len(d))\n```',
      '2', '3', '4', 'Lỗi', 'B',
      '✅ Ban đầu d có 2 key. Thêm key "c" → dictionary có 3 key. len(d) = 3.'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 7 — Random & Game 🎮
// ─────────────────────────────────────────────
const topic7 = {
  order: 7,
  topicName: 'Random & Game',
  questions: [
    mc(
      '🎲 Để dùng thư viện random, ta cần làm gì đầu tiên?',
      'install random', 'import random', 'use random', 'load random', 'B',
      '✅ import random ở đầu file để nạp thư viện. random là thư viện có sẵn trong Python, không cần cài.'
    ),
    mc(
      '🎲 Hàm nào tạo số nguyên ngẫu nhiên từ 1 đến 10 (bao gồm cả 1 và 10)?',
      'random.random(1, 10)', 'random.int(1, 10)', 'random.randint(1, 10)', 'random.number(10)', 'C',
      '✅ randint(a, b) trả về số nguyên ngẫu nhiên trong khoảng [a, b], bao gồm cả a và b.'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau có thể là gì?\n```python\nimport random\nprint(random.randint(1, 3))\n```',
      'Luôn là 1', 'Luôn là 3', 'Một trong các số 1, 2, hoặc 3', 'Số thực từ 0 đến 3', 'C',
      '✅ randint(1,3) ngẫu nhiên chọn 1, 2, hoặc 3. Mỗi lần chạy có thể khác nhau!'
    ),
    mc(
      '🎯 Hàm random.random() trả về gì?',
      'Số nguyên từ 0 đến 100', 'Số thực từ 0.0 đến dưới 1.0 (không bao gồm 1.0)', 'True hoặc False', 'Chuỗi ngẫu nhiên', 'B',
      '✅ random.random() trả về float trong [0.0, 1.0). Thường dùng để tính xác suất.'
    ),
    mc(
      '🍎 Kết quả của đoạn code sau?\n```python\nimport random\nso = [1, 2, 3, 4, 5]\nprint(random.choice(so))\n```',
      'In toàn bộ list [1,2,3,4,5]', 'In một phần tử ngẫu nhiên từ list', 'Luôn in số đầu tiên (1)', 'Lỗi', 'B',
      '✅ random.choice(seq) chọn ngẫu nhiên 1 phần tử từ list, tuple hoặc chuỗi.'
    ),
    mc(
      '🎮 Trong game đoán số, vòng lặp nào phù hợp nhất để tiếp tục cho đến khi đoán đúng?',
      'for range(1)', 'while chưa đoán đúng:', 'if/else', 'for range(100)', 'B',
      '✅ while phù hợp vì không biết người chơi cần bao nhiêu lần đoán mới đúng.'
    ),
    mc(
      '🔒 Điều gì xảy ra khi đặt random.seed(42)?',
      'Tạo số ngẫu nhiên với giá trị hạt giống 42',
      'Số ngẫu nhiên sau đó luôn giống nhau mỗi khi seed là 42',
      'seed(42) nghĩa là random tối đa 42',
      'Lỗi vì seed không hợp lệ',
      'B',
      '✅ seed() đặt điểm xuất phát. Cùng seed → cùng chuỗi số ngẫu nhiên. Dùng để test/debug game.'
    ),
    mc(
      '🔀 Hàm random.shuffle() làm gì?',
      'Sắp xếp list theo thứ tự tăng dần', 'Trộn ngẫu nhiên thứ tự các phần tử trong list', 'Thêm phần tử ngẫu nhiên', 'Xóa phần tử ngẫu nhiên', 'B',
      '✅ shuffle() trộn list ngay tại chỗ (in-place). Dùng để xáo bài, trộn câu hỏi...'
    ),
    mc(
      '✂️ Trong game oẳn tù tì, để máy chọn ngẫu nhiên, code nào đúng?',
      'random.choice(["Kéo", "Búa", "Bao"])',
      'random.randint("Kéo", "Bao")',
      'random.pick(3)',
      'random.string(3)',
      'A',
      '✅ choice() chọn 1 phần tử ngẫu nhiên từ list. Hoàn hảo cho oẳn tù tì!'
    ),
    mc(
      '🎲 Kết quả của đoạn code sau (giả lập tung 2 xúc xắc)?\n```python\nimport random\ndiem = random.randint(1, 6) + random.randint(1, 6)\nprint(diem)\n```',
      'Số từ 1 đến 6', 'Số từ 2 đến 12', 'Luôn là 7', 'Lỗi', 'B',
      '✅ Mỗi xúc xắc từ 1-6. Tổng nhỏ nhất: 1+1=2. Lớn nhất: 6+6=12. Kết quả từ 2 đến 12.'
    ),
    tf(
      '🎲 random.randint(1, 6) có thể dùng để giả lập tung xúc xắc 6 mặt.',
      true,
      '✅ Đúng! randint(1,6) trả về 1,2,3,4,5 hoặc 6 — giống hệt xúc xắc thật!'
    ),
    tf(
      '🎯 random.random() có thể trả về đúng giá trị 1.0.',
      false,
      '✅ Sai! random.random() trả về [0.0, 1.0) — bao gồm 0.0 nhưng KHÔNG bao gồm 1.0.'
    ),
    tf(
      '📦 Thư viện random đã có sẵn trong Python, không cần pip install.',
      true,
      '✅ Đúng! random là thư viện chuẩn (standard library). Chỉ cần import random là dùng được.'
    ),
    tf(
      '🚨 random.choice([]) trên list rỗng sẽ gây ra lỗi IndexError.',
      true,
      '✅ Đúng! Không thể chọn từ list rỗng. Luôn kiểm tra list không rỗng trước khi dùng choice().'
    ),
    tf(
      '📊 random.randint(a, b) bao gồm cả hai đầu mút a và b.',
      true,
      '✅ Đúng! Khác với range(), randint() bao gồm cả a và b. randint(1,6) có thể trả về 1 hoặc 6.'
    ),
    tf(
      '♾️ Mỗi lần chạy chương trình, random.randint() luôn cho kết quả giống hệt nhau.',
      false,
      '✅ Sai! Mỗi lần chạy cho kết quả khác nhau (trừ khi đặt seed cụ thể). Đó là ý nghĩa của "ngẫu nhiên"!'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi gì?\n```python\nso_bi_mat = randint(1, 100)\nprint(so_bi_mat)\n```',
      'Không lỗi',
      'Lỗi! Thiếu "import random" và phải dùng random.randint()',
      'Lỗi cú pháp randint',
      'Lỗi print',
      'B',
      '✅ Phải import random trước và gọi đầy đủ random.randint(). Chỉ viết randint() sẽ gây NameError.'
    ),
    mc(
      '🔮 Kết quả của đoạn code này?\n```python\nimport random\nds = ["A", "B", "C", "D"]\nrandom.shuffle(ds)\nprint(len(ds))\n```',
      'Lỗi', '0', '4', 'Thay đổi mỗi lần chạy', 'C',
      '✅ shuffle() chỉ đổi THỨ TỰ, không xóa hay thêm phần tử. Số phần tử vẫn là 4.'
    ),
    mc(
      '🎮 Để tạo game oẳn tù tì, bước đầu tiên nên làm gì?',
      'In kết quả thắng thua ngay', 'Tạo lựa chọn ngẫu nhiên cho máy', 'Hỏi người chơi nhập lựa chọn', 'Khai báo điểm số', 'C',
      '✅ Luồng hợp lý: 1) Hỏi người chơi 2) Máy chọn ngẫu nhiên 3) So sánh 4) In kết quả.'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\nimport random\ntong = 0\nfor i in range(3):\n    tong += random.randint(1, 4)\nprint(tong >= 3)\n```',
      'Luôn True', 'Luôn False', 'True hoặc False tuỳ ngẫu nhiên (nhưng thường True)', 'Lỗi', 'C',
      '✅ Tổng 3 số mỗi số từ 1-4 → min=3, max=12. >= 3 có thể True hoặc False (min=3 → borderline).'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 8 — Drawing & Turtle 🐢
// ─────────────────────────────────────────────
const topic8 = {
  order: 8,
  topicName: 'Drawing & Turtle',
  questions: [
    mc(
      '🐢 Để vẽ bằng Turtle trong Python, ta cần import gì?',
      'import draw', 'import turtle', 'import graphics', 'import canvas', 'B',
      '✅ import turtle nạp thư viện Turtle có sẵn trong Python. Không cần cài thêm gì!'
    ),
    mc(
      '➡️ Lệnh nào di chuyển con rùa về phía TRƯỚC?',
      'turtle.move(100)', 'turtle.go(100)', 'turtle.forward(100)', 'turtle.walk(100)', 'C',
      '✅ turtle.forward(n) di chuyển n pixel theo hướng rùa đang nhìn. Viết tắt: turtle.fd(n).'
    ),
    mc(
      '↩️ turtle.right(90) làm gì?',
      'Di chuyển sang phải 90 pixel', 'Quay sang phải 90 độ', 'Vẽ đường thẳng dài 90', 'Xoay 90 vòng tròn', 'B',
      '✅ right(90) quay con rùa 90 độ theo chiều kim đồng hồ. left(90) quay ngược chiều kim.'
    ),
    mc(
      '⬜ Để vẽ hình vuông cạnh 100, ta cần lặp bao nhiêu lần forward(100) và right(90)?',
      '3 lần', '4 lần', '5 lần', '6 lần', 'B',
      '✅ Hình vuông có 4 cạnh, 4 góc vuông (90°). Lặp 4 lần: đi 100, quay 90, đi 100, quay 90...'
    ),
    mc(
      '🔴 Lệnh turtle.color("red") làm gì?',
      'Đặt màu nền thành đỏ', 'Đặt màu bút vẽ thành đỏ', 'Xóa tất cả vẽ màu đỏ', 'In chữ màu đỏ', 'B',
      '✅ turtle.color() đặt màu bút. Dùng tên màu tiếng Anh: "red", "blue", "green", "yellow"...'
    ),
    mc(
      '✏️ Lệnh nào NHẤC BÚT LÊN để di chuyển không vẽ?',
      'turtle.up()', 'turtle.lift()', 'turtle.penup()', 'turtle.stop()', 'C',
      '✅ penup() nhấc bút. pendown() hạ bút xuống. Dùng khi muốn di chuyển không để lại vệt.'
    ),
    mc(
      '🔺 Để vẽ tam giác đều, ta quay bao nhiêu độ sau mỗi cạnh?',
      '60 độ', '90 độ', '120 độ', '180 độ', 'C',
      '✅ Góc ngoài tam giác đều = 360/3 = 120 độ. Lặp 3 lần: forward(100), right(120).'
    ),
    mc(
      '⭕ Lệnh turtle.circle(50) vẽ gì?',
      'Hình vuông cạnh 50', 'Đường tròn bán kính 50', 'Ngũ giác cạnh 50', 'Điểm chấm to cỡ 50', 'B',
      '✅ turtle.circle(r) vẽ đường tròn bán kính r pixel.'
    ),
    mc(
      '🗑️ Lệnh nào xóa toàn bộ hình đã vẽ trên màn hình Turtle?',
      'turtle.delete()', 'turtle.clear()', 'turtle.erase()', 'turtle.wipe()', 'B',
      '✅ turtle.clear() xóa hình vẽ nhưng giữ vị trí rùa. turtle.reset() xóa và đặt lại mọi thứ.'
    ),
    mc(
      '⭐ Để vẽ ngôi sao 5 cánh, ta quay bao nhiêu độ sau mỗi cạnh?',
      '72 độ', '36 độ', '144 độ', '60 độ', 'C',
      '✅ Ngôi sao 5 cánh: lặp 5 lần forward(100), right(144). 5×144=720=2×360 → trở về điểm đầu!'
    ),
    tf(
      '⬅️ turtle.backward(100) di chuyển con rùa lùi 100 pixel.',
      true,
      '✅ Đúng! backward(n) hoặc bk(n) di chuyển ngược chiều rùa đang nhìn.'
    ),
    tf(
      '⏩ Có thể thay đổi tốc độ vẽ bằng turtle.speed().',
      true,
      '✅ Đúng! speed(0) = nhanh nhất. speed(1) = chậm nhất. speed(6) = bình thường.'
    ),
    tf(
      '⬆️ turtle.pendown() nhấc bút lên để di chuyển không vẽ.',
      false,
      '✅ Sai! pendown() HẠ bút xuống để vẽ. penup() mới là nhấc bút lên. Nhớ: up = lên = không vẽ.'
    ),
    tf(
      '🎨 Có thể vẽ nhiều hình dạng, màu sắc khác nhau bằng thư viện Turtle.',
      true,
      '✅ Đúng! Turtle có thể vẽ hình vuông, tròn, sao, fractal... với nhiều màu sắc đẹp!'
    ),
    tf(
      '🎨 turtle.bgcolor("blue") đặt màu nền màn hình là xanh dương.',
      true,
      '✅ Đúng! bgcolor() đặt màu nền (background color) của cửa sổ Turtle.'
    ),
    tf(
      '🏠 Mặc định, con rùa bắt đầu ở giữa màn hình và hướng về bên phải.',
      true,
      '✅ Đúng! Toạ độ (0,0) là trung tâm. Rùa mặc định hướng Đông (phải). turtle.home() trả về vị trí này.'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi gì?\n```python\nimport turtle\nfor i in range(4):\n    forward(100)\n    right(90)\n```',
      'Không lỗi',
      'Phải viết turtle.forward() và turtle.right() đầy đủ',
      'range(4) sai',
      'Thiếu turtle.done() ở cuối',
      'B',
      '✅ Sau import turtle, phải gọi turtle.forward() và turtle.right(). Hoặc dùng: from turtle import *'
    ),
    mc(
      '🔮 Đoạn code này vẽ hình gì?\n```python\nimport turtle\nfor i in range(6):\n    turtle.forward(100)\n    turtle.right(60)\n```',
      'Tam giác', 'Hình vuông', 'Lục giác (hexagon)', 'Ngôi sao', 'C',
      '✅ Lặp 6 lần, quay 60°: 6×60=360° → khép kín. Hình có 6 cạnh = lục giác đều!'
    ),
    mc(
      '🎨 Để vẽ hình có tô màu bên trong, ta cần dùng lệnh gì?',
      'turtle.fill()',
      'turtle.begin_fill() trước và turtle.end_fill() sau khi vẽ xong',
      'turtle.fillcolor() sau khi vẽ',
      'turtle.inside_color()',
      'B',
      '✅ begin_fill() trước khi vẽ → vẽ hình → end_fill() để tô màu bên trong.'
    ),
    mc(
      '✅ Đoạn code vẽ hình VUÔNG đúng nhất là?',
      'for i in range(4): turtle.forward(100); turtle.right(90)',
      'for i in range(4): turtle.forward(100); turtle.left(45)',
      'for i in range(3): turtle.forward(100); turtle.right(90)',
      'for i in range(4): turtle.right(100); turtle.forward(90)',
      'A',
      '✅ Hình vuông: 4 cạnh × 4 góc 90°. forward(100) vẽ cạnh, right(90) quay góc vuông.'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 9 — Files & Data 📂
// ─────────────────────────────────────────────
const topic9 = {
  order: 9,
  topicName: 'Files & Data',
  questions: [
    mc(
      '📂 Lệnh nào mở file để ĐỌC trong Python?',
      'open("file.txt") — mặc định mode "r"',
      'open("file.txt", "r") — chỉ định rõ mode đọc',
      'read("file.txt")',
      'Cả A và B đều đúng',
      'D',
      '✅ open("file.txt") và open("file.txt","r") đều mở để đọc. Mặc định là "r" (read).'
    ),
    mc(
      '✍️ Để ghi dữ liệu vào file MỚI (hoặc xóa file cũ rồi ghi lại), dùng mode nào?',
      '"r" (read)', '"w" (write)', '"a" (append)', '"x" (exclusive create)', 'B',
      '✅ "w" (write) xóa nội dung cũ rồi ghi mới. Nếu file chưa tồn tại, tạo file mới.'
    ),
    mc(
      '📊 Sự khác biệt giữa mode "w" và "a"?',
      '"w" đọc file, "a" ghi file',
      '"w" xóa nội dung cũ rồi ghi, "a" thêm vào cuối file',
      'Không có sự khác biệt',
      '"a" tạo file mới, "w" sửa file cũ',
      'B',
      '✅ "w" = write (ghi đè). "a" = append (thêm vào cuối). Dùng "a" để không mất dữ liệu cũ!'
    ),
    mc(
      '📖 Lệnh nào đọc TOÀN BỘ nội dung file thành một chuỗi?',
      'file.read()', 'file.readall()', 'file.get()', 'file.content()', 'A',
      '✅ file.read() đọc toàn bộ file thành 1 chuỗi. readline() đọc 1 dòng. readlines() đọc tất cả dòng thành list.'
    ),
    mc(
      '📝 Đoạn code sau làm gì?\n```python\nwith open("test.txt", "w") as f:\n    f.write("Hello\\n")\n    f.write("World")\n```',
      'Tạo file trống', 'Tạo file có 2 dòng: Hello và World', 'Lỗi vì thiếu f.close()', 'In Hello World ra màn hình', 'B',
      '✅ Tạo/ghi đè test.txt với 2 dòng: "Hello" (kèm xuống dòng \\n) và "World".'
    ),
    mc(
      '🔒 Lợi ích chính của dùng "with open()" là gì?',
      'Đọc file nhanh hơn', 'Tự động đóng file khi thoát khỏi khối with', 'Chỉ đọc được file .txt', 'Mã hóa file', 'B',
      '✅ with open() tự đóng file sau khối lệnh, tránh rò rỉ tài nguyên. Luôn dùng with open()!'
    ),
    mc(
      '📋 Lệnh nào đọc file theo từng dòng và trả về LIST các dòng?',
      'file.read()', 'file.readline()', 'file.readlines()', 'file.lines()', 'C',
      '✅ readlines() trả về list, mỗi phần tử là 1 dòng (có \\n). readline() chỉ đọc 1 dòng.'
    ),
    mc(
      '📊 Để xử lý dữ liệu CSV trong Python, thư viện nào thường dùng?',
      'import file', 'import csv', 'import excel', 'import data', 'B',
      '✅ import csv — thư viện chuẩn để đọc/ghi file CSV (Comma-Separated Values).'
    ),
    mc(
      '➕ Đoạn code sau làm gì?\n```python\nwith open("diem.txt", "a") as f:\n    f.write("Nam: 9\\n")\n```',
      'Tạo file mới diem.txt', 'THÊM dòng "Nam: 9" vào cuối file mà không xóa nội dung cũ', 'Xóa nội dung cũ rồi ghi', 'Đọc file diem.txt', 'B',
      '✅ Mode "a" (append) chỉ thêm vào cuối. Nội dung cũ được giữ nguyên.'
    ),
    mc(
      '📋 CSV là viết tắt của gì?',
      'Compressed Storage Value', 'Comma-Separated Values', 'Computer Saved Values', 'Code Storage Variable', 'B',
      '✅ CSV = Comma-Separated Values — dữ liệu phân cách bằng dấu phẩy. Excel, Google Sheets đều đọc được!'
    ),
    tf(
      '🔒 Sau khi dùng "with open()", Python tự động đóng file.',
      true,
      '✅ Đúng! Đây là lý do dùng with open() thay vì open() thủ công — không cần gọi f.close().'
    ),
    tf(
      '✍️ Mode "r" có thể vừa đọc vừa ghi file cùng lúc.',
      false,
      '✅ Sai! "r" chỉ đọc. Muốn vừa đọc vừa ghi dùng "r+" hoặc "w+".'
    ),
    tf(
      '📊 File CSV có thể mở và xem bằng Microsoft Excel hoặc Google Sheets.',
      true,
      '✅ Đúng! CSV là định dạng phổ biến, Excel và Google Sheets đều hỗ trợ import/export CSV.'
    ),
    tf(
      '↩️ Hàm f.write() tự động thêm ký tự xuống dòng \\n sau mỗi lần ghi.',
      false,
      '✅ Sai! f.write() không tự thêm \\n. Phải tự thêm: f.write("Hello\\n"). Khác với print()!'
    ),
    tf(
      '🖼️ Có thể đọc file nhị phân (ảnh, video) bằng open() với mode "rb".',
      true,
      '✅ Đúng! "rb" = read binary. Dùng cho ảnh (.jpg, .png), âm thanh (.mp3), video (.mp4)...'
    ),
    tf(
      '🚨 Nếu file không tồn tại và dùng open("file.txt", "r"), Python sẽ báo lỗi FileNotFoundError.',
      true,
      '✅ Đúng! Chỉ có "w" và "a" tự tạo file mới. "r" bắt buộc file phải tồn tại trước.'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi gì?\n```python\nf = open("data.txt", "r")\nf.write("Hello")\nf.close()\n```',
      'Không lỗi',
      'Lỗi! Không thể ghi vào file đang mở ở mode "r" (chỉ đọc)',
      'Thiếu with statement',
      'Lỗi hàm close()',
      'B',
      '✅ File mở ở mode "r" chỉ cho đọc. Ghi vào sẽ gây UnsupportedOperation error.'
    ),
    mc(
      '🔮 Kết quả của đoạn code này?\n```python\nwith open("so.txt", "w") as f:\n    for i in range(3):\n        f.write(str(i) + "\\n")\n```',
      'File trống', 'File có 3 dòng: 0, 1, 2', 'File có 1 dòng: 0 1 2', 'Lỗi', 'B',
      '✅ Vòng for i=0,1,2. Mỗi vòng ghi 1 số + xuống dòng. Kết quả: file 3 dòng chứa 0, 1, 2.'
    ),
    mc(
      '📏 Để đếm số dòng trong file, code nào đúng?',
      'len(open("file.txt"))',
      'count(open("file.txt"))',
      'len(open("file.txt").readlines())',
      'open("file.txt").count()',
      'C',
      '✅ readlines() trả về list các dòng. len() đếm số phần tử trong list = số dòng file.'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\ndu_lieu = {"ten": "Nam", "diem": 9}\nprint(du_lieu["diem"])\n```',
      'diem', '9', '{"diem": 9}', 'Lỗi', 'B',
      '✅ du_lieu["diem"] lấy giá trị của key "diem" = 9. Ví dụ dữ liệu học sinh lưu dạng dict!'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 10 — AI & Chatbot 🤖
// ─────────────────────────────────────────────
const topic10 = {
  order: 10,
  topicName: 'AI & Chatbot',
  questions: [
    mc(
      '🌐 API là viết tắt của gì?',
      'Automatic Programming Interface', 'Application Programming Interface', 'Advanced Python Integration', 'Artificial Python Intelligence', 'B',
      '✅ API = Application Programming Interface. Cầu nối cho phép 2 phần mềm giao tiếp với nhau.'
    ),
    mc(
      '📡 Để gửi yêu cầu HTTP đến API trong Python, thư viện nào thường dùng?',
      'import api', 'import requests', 'import internet', 'import http', 'B',
      '✅ requests là thư viện phổ biến nhất để gọi API. Cài bằng: pip install requests.'
    ),
    mc(
      '🤖 Chatbot là gì?',
      'Robot vật lý có thể đi lại', 'Chương trình máy tính trả lời tự động như con người', 'Trò chơi máy tính', 'Phần mềm chỉnh sửa ảnh', 'B',
      '✅ Chatbot là chương trình tự động trả lời tin nhắn. ChatGPT, Siri, Google Assistant đều là chatbot!'
    ),
    mc(
      '📋 JSON là gì trong lập trình?',
      'Ngôn ngữ lập trình mới', 'Định dạng dữ liệu phổ biến dùng trong API (giống dictionary Python)', 'Loại file ảnh', 'Framework Python', 'B',
      '✅ JSON = JavaScript Object Notation. Trông giống dict Python: {"key": "value"}. API thường trả về JSON.'
    ),
    mc(
      '📡 Đoạn code sau làm gì?\n```python\nimport requests\nresponse = requests.get("https://api.example.com/data")\nprint(response.status_code)\n```',
      'Tạo API server mới', 'Gọi API và in mã trạng thái HTTP', 'Gửi email', 'Tải file về máy', 'B',
      '✅ requests.get() gọi API bằng HTTP GET. status_code cho biết kết quả: 200=OK, 404=Not Found...'
    ),
    mc(
      '✅ Mã trạng thái HTTP 200 có nghĩa là gì?',
      'Lỗi server nội bộ', 'Không tìm thấy trang', 'Thành công (OK)', 'Cần xác thực đăng nhập', 'C',
      '✅ 200 = OK/Thành công. 404 = Not Found. 401 = Unauthorized. 500 = Server Error.'
    ),
    mc(
      '🔑 API key dùng để làm gì?',
      'Mã hóa dữ liệu gửi đi', 'Xác thực danh tính và phân quyền truy cập API', 'Tăng tốc độ API', 'Lưu dữ liệu vào server', 'B',
      '✅ API key như "mật khẩu" để xác nhận bạn có quyền dùng API đó. Giữ bí mật!'
    ),
    mc(
      '📖 Đoạn code sau làm gì?\n```python\ndata = response.json()\nprint(data["message"])\n```',
      'In toàn bộ JSON thô', 'Chuyển JSON thành dict Python và in giá trị của key "message"', 'Gửi JSON đến server', 'Lỗi', 'B',
      '✅ response.json() chuyển JSON → dict Python. data["message"] lấy giá trị key "message".'
    ),
    mc(
      '💬 Trong chatbot đơn giản dùng if/elif/else, mục đích chính là gì?',
      'Tạo giao diện đẹp', 'Kiểm tra câu hỏi người dùng và trả lời phù hợp', 'Kết nối internet', 'Lưu lịch sử chat', 'B',
      '✅ Chatbot rule-based dùng if/elif để khớp câu hỏi: if "xin chào" in msg: print("Chào bạn!")'
    ),
    mc(
      '🤖 Thư viện openai trong Python dùng để làm gì?',
      'Tạo game bằng AI', 'Vẽ đồ thị và biểu đồ', 'Kết nối và sử dụng AI của OpenAI (GPT, DALL-E...)', 'Xử lý file văn bản', 'C',
      '✅ pip install openai → dùng API của OpenAI để tích hợp ChatGPT vào chương trình Python!'
    ),
    tf(
      '🌐 API cho phép các chương trình khác nhau giao tiếp và trao đổi dữ liệu với nhau.',
      true,
      '✅ Đúng! App thời tiết dùng API để lấy dữ liệu thời tiết. App bản đồ dùng API Google Maps...'
    ),
    tf(
      '❌ Mã HTTP 404 có nghĩa là "Not Found" — không tìm thấy trang/tài nguyên yêu cầu.',
      true,
      '✅ Đúng! 404 rất phổ biến khi URL sai hoặc trang không tồn tại.'
    ),
    tf(
      '🔓 API key có thể đăng lên GitHub hoặc chia sẻ công khai vì nó không quan trọng.',
      false,
      '✅ Sai! API key là bí mật! Nếu lộ, người khác có thể dùng tài khoản bạn và tốn tiền. Dùng .env!'
    ),
    tf(
      '🧠 ChatGPT sử dụng mô hình ngôn ngữ lớn (LLM - Large Language Model).',
      true,
      '✅ Đúng! LLM được huấn luyện trên hàng tỷ đoạn văn bản để hiểu và tạo ra ngôn ngữ tự nhiên.'
    ),
    tf(
      '🔗 Python có thể gọi nhiều API khác nhau trong cùng một chương trình.',
      true,
      '✅ Đúng! Một app có thể dùng API thời tiết + API bản đồ + API ChatGPT cùng lúc!'
    ),
    tf(
      '🤖 Chatbot AI như ChatGPT chỉ có thể trả lời các câu hỏi được lập trình sẵn từ trước.',
      false,
      '✅ Sai! Chatbot AI dùng LLM có thể trả lời linh hoạt. Chatbot rule-based mới bị giới hạn câu hỏi định sẵn.'
    ),
    mc(
      '🐛 Đoạn code sau có lỗi gì?\n```python\nimport requests\nresponse = requests.get("https://api.example.com")\ndata = response.json\nprint(data["result"])\n```',
      'Không lỗi',
      'response.json phải là response.json() — thiếu dấu ()',
      'Lỗi import',
      'Lỗi print',
      'B',
      '✅ json là method, phải gọi với (): response.json(). Không có () → lấy object method, không phải dữ liệu.'
    ),
    mc(
      '🔮 Kết quả của đoạn code chatbot này?\n```python\nbot_replies = {\n    "xin chào": "Chào bạn! 👋",\n    "bạn tên gì": "Mình là PyBot! 🐍"\n}\nuser_input = "xin chào"\nprint(bot_replies.get(user_input, "Mình không hiểu 😅"))\n```',
      'Mình không hiểu 😅', 'Chào bạn! 👋', 'xin chào', 'Lỗi', 'B',
      '✅ bot_replies.get("xin chào", ...) tìm key "xin chào" → tìm thấy → trả về "Chào bạn! 👋".'
    ),
    mc(
      '🔐 Cách bảo vệ API key tốt nhất là?',
      'Viết thẳng vào code Python', 'Lưu vào file .env và không commit lên GitHub', 'In ra console để nhớ', 'Chia sẻ với bạn bè để cùng dùng', 'B',
      '✅ Dùng file .env và thư viện python-dotenv. Thêm .env vào .gitignore. Không để lộ API key!'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\nresponses = ["Thú vị!", "Hay đấy!", "Tuyệt!"]\nimport random\nuser_msg = "Python rất vui!"\nprint(random.choice(responses))\n```',
      'Luôn in "Thú vị!"', 'In ngẫu nhiên một trong 3 câu trả lời', 'In "Python rất vui!"', 'Lỗi', 'B',
      '✅ random.choice() chọn ngẫu nhiên từ list. Mỗi lần chạy có thể in câu khác nhau!'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 11 — Computer Vision 📸
// ─────────────────────────────────────────────
const topic11 = {
  order: 11,
  topicName: 'Computer Vision',
  questions: [
    mc(
      '📸 OpenCV trong Python dùng để làm gì?',
      'Tạo game 2D', 'Xử lý, phân tích và nhận diện hình ảnh/video', 'Vẽ đồ thị thống kê', 'Kết nối database', 'B',
      '✅ OpenCV (Open Computer Vision) là thư viện mạnh cho xử lý ảnh, nhận diện khuôn mặt, object detection...'
    ),
    mc(
      '📦 Để import OpenCV trong Python, ta viết gì?',
      'import opencv', 'import cv', 'import cv2', 'import vision', 'C',
      '✅ import cv2 — tên package là cv2 (Computer Vision 2). Cài bằng: pip install opencv-python.'
    ),
    mc(
      '🖼️ Hàm nào đọc ảnh từ file trong OpenCV?',
      'cv2.load()', 'cv2.imread()', 'cv2.open()', 'cv2.read()', 'B',
      '✅ cv2.imread("file.jpg") đọc ảnh và trả về mảng NumPy. Trả về None nếu không tìm thấy file.'
    ),
    mc(
      '🔢 Ảnh trong OpenCV được lưu dưới dạng gì?',
      'List Python thông thường', 'Chuỗi văn bản base64', 'Mảng NumPy (ndarray)', 'Dictionary', 'C',
      '✅ Ảnh là mảng NumPy 3D (hoặc 2D cho grayscale). Mỗi pixel là mảng [B,G,R] với giá trị 0-255.'
    ),
    mc(
      '🎨 Màu sắc trong OpenCV theo thứ tự nào?',
      'RGB (Red, Green, Blue) như web', 'BGR (Blue, Green, Red)', 'HSV (Hue, Saturation, Value)', 'CMYK như in ấn', 'B',
      '✅ OpenCV dùng BGR thay vì RGB! Đây là điểm dễ nhầm. Khi dùng matplotlib thì cần chuyển BGR→RGB.'
    ),
    mc(
      '📺 cv2.imshow() dùng để làm gì?',
      'Lưu ảnh ra file', 'Hiển thị ảnh lên cửa sổ', 'Xóa ảnh', 'Resize ảnh', 'B',
      '✅ cv2.imshow("tên cửa sổ", img) hiển thị ảnh. Cần dùng kèm cv2.waitKey() để cửa sổ không tắt ngay.'
    ),
    mc(
      '⚫ Để chuyển ảnh màu thành ảnh xám (grayscale), ta dùng lệnh nào?',
      'cv2.gray(img)', 'cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)', 'img.grayscale()', 'cv2.convert(img, "gray")', 'B',
      '✅ cvtColor() chuyển đổi không gian màu. COLOR_BGR2GRAY: màu → xám. COLOR_BGR2HSV: màu → HSV...'
    ),
    mc(
      '🔢 Thư viện NumPy dùng để làm gì trong Computer Vision?',
      'Tạo giao diện người dùng', 'Xử lý mảng số học và tính toán ma trận ảnh', 'Kết nối camera', 'Nhận diện giọng nói', 'B',
      '✅ NumPy cực kỳ quan trọng trong CV — ảnh là mảng số, NumPy giúp xử lý nhanh và hiệu quả.'
    ),
    mc(
      '📹 cv2.VideoCapture(0) dùng để làm gì?',
      'Phát video từ file MP4', 'Mở camera mặc định (camera số 0) của máy tính', 'Chụp ảnh màn hình', 'Ghi video ra file', 'B',
      '✅ VideoCapture(0) mở camera đầu tiên. VideoCapture("video.mp4") mở file video.'
    ),
    mc(
      '📐 Kết quả của đoạn code sau?\n```python\nimport cv2\nimg = cv2.imread("photo.jpg")\nprint(img.shape)\n```',
      'Tên file ảnh', '(chiều cao, chiều rộng, số kênh màu) ví dụ (480, 640, 3)', 'Kích thước file bytes', 'Lỗi', 'B',
      '✅ shape trả về tuple (height, width, channels). Ảnh màu BGR: 3 kênh. Ảnh xám: 2 chiều không có channels.'
    ),
    tf(
      '🎭 OpenCV có thể phát hiện và nhận diện khuôn mặt trong ảnh hoặc video.',
      true,
      '✅ Đúng! OpenCV có Haar Cascade và DNN modules để nhận diện khuôn mặt rất hiệu quả.'
    ),
    tf(
      '💾 cv2.imwrite("output.jpg", img) lưu ảnh vào file.',
      true,
      '✅ Đúng! imwrite() lưu mảng NumPy thành file ảnh. Hỗ trợ .jpg, .png, .bmp...'
    ),
    tf(
      '❌ OpenCV chỉ xử lý được ảnh tĩnh, không thể xử lý video hay camera trực tiếp.',
      false,
      '✅ Sai! OpenCV hỗ trợ đọc video frame-by-frame và xử lý camera real-time!'
    ),
    tf(
      '⚫ Ảnh grayscale chỉ có 1 kênh màu (mỗi pixel là 1 số từ 0-255).',
      true,
      '✅ Đúng! Xám: 0=đen, 255=trắng. Màu BGR: mỗi pixel có 3 số [B,G,R] từ 0-255.'
    ),
    tf(
      '📦 Cài OpenCV bằng lệnh: pip install opencv-python.',
      true,
      '✅ Đúng! pip install opencv-python cài cv2. pip install opencv-contrib-python cài thêm modules nâng cao.'
    ),
    tf(
      '🎨 Mỗi pixel trong ảnh màu BGR có 3 giá trị, mỗi giá trị từ 0 đến 255.',
      true,
      '✅ Đúng! [0,0,0]=đen, [255,255,255]=trắng, [255,0,0]=xanh dương, [0,0,255]=đỏ (BGR!).'
    ),
    mc(
      '🐛 Đoạn code sau có vấn đề gì?\n```python\nimport cv2\nimg = cv2.imread("photo.jpg")\ncv2.imshow("Ảnh", img)\n```',
      'Không lỗi, chạy bình thường',
      'Thiếu cv2.waitKey() — cửa sổ sẽ đóng ngay lập tức',
      'Lỗi imread',
      'Lỗi import',
      'B',
      '✅ Sau imshow() phải có cv2.waitKey(0) để chờ phím bấm. Không có → cửa sổ xuất hiện rồi tắt ngay.'
    ),
    mc(
      '🔮 Kết quả của đoạn code này?\n```python\nimport cv2\nimg = cv2.imread("photo.jpg")\ngray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\nprint(len(gray.shape))\n```',
      '3 (vì ảnh gốc có 3 kênh)', '2 (ảnh xám chỉ có chiều cao và chiều rộng)', '1', 'Lỗi', 'B',
      '✅ Ảnh màu: shape=(h,w,3) → len=3. Ảnh xám: shape=(h,w) → len=2. Không có chiều kênh màu!'
    ),
    mc(
      '🎭 Để nhận diện khuôn mặt, OpenCV dùng gì?',
      'Mạng nơ-ron tự viết từ đầu', 'Haar Cascade Classifier (file XML có sẵn)', 'Google Vision API bắt buộc', 'Chỉ có thể làm thủ công', 'B',
      '✅ OpenCV đi kèm file haarcascade_frontalface_default.xml. Load → detectMultiScale() → tìm khuôn mặt!'
    ),
    mc(
      '🔮 Kết quả của đoạn code sau?\n```python\nimport cv2\ncap = cv2.VideoCapture(0)\nret, frame = cap.read()\nprint(ret)\ncap.release()\n```',
      'Tên camera', 'True nếu đọc frame thành công, False nếu thất bại', 'Luôn là False', 'Lỗi', 'B',
      '✅ cap.read() trả về tuple (ret, frame). ret=True nếu OK. Nhớ cap.release() để giải phóng camera!'
    ),
  ],
}

// ─────────────────────────────────────────────
// TOPIC 12 — Dự Án Cuối Khóa 🏆
// ─────────────────────────────────────────────
const topic12 = {
  order: 12,
  topicName: 'Dự Án Cuối Khóa',
  questions: [
    mc(
      '🏆 Bước ĐẦU TIÊN khi bắt đầu lập trình một dự án là?',
      'Viết code ngay không cần suy nghĩ', 'Lên kế hoạch, xác định yêu cầu và tính năng cần có', 'Tìm kiếm code mẫu trên internet', 'Chọn màu sắc giao diện', 'B',
      '✅ Plan trước, code sau! Hiểu rõ dự án làm gì trước khi gõ dòng code đầu tiên.'
    ),
    mc(
      '💾 Trong dự án game, để LƯU ĐIỂM CAO nhất vào file, ta dùng gì?',
      'print()', 'input()', 'open() và write()', 'import random', 'C',
      '✅ open("diem.txt", "w") và f.write(str(diem)) lưu điểm vào file. Lần sau open("r") để đọc lại!'
    ),
    mc(
      '🎨 Kết quả của đoạn code kết hợp random + turtle?\n```python\nimport random, turtle\nturtle.color(random.choice(["red","blue","green"]))\nturtle.forward(100)\nturtle.done()\n```',
      'Lỗi vì không thể kết hợp random và turtle', 'Vẽ đường thẳng với màu ngẫu nhiên (đỏ, xanh, hoặc lá)', 'Luôn vẽ màu đỏ', 'Không vẽ gì', 'B',
      '✅ Hoàn toàn hợp lệ! random.choice() chọn màu ngẫu nhiên, turtle vẽ đường với màu đó.'
    ),
    mc(
      '📋 Để tạo MENU chương trình Python, cấu trúc nào phù hợp nhất?',
      'while True với if/elif để xử lý từng lựa chọn và break để thoát',
      'for range(5)',
      'import menu',
      'turtle.menu()',
      'A',
      '✅ while True + if/elif là chuẩn cho menu: hiển thị tùy chọn → nhận input → xử lý → lặp lại.'
    ),
    mc(
      '🎮 Kết quả của game đoán số sau?\n```python\nimport random\nso = random.randint(1, 100)\ndu_doan = int(input("Đoán: "))\nif du_doan == so:\n    print("🎉 Đúng!")\nelif du_doan < so:\n    print("📈 Số bí mật lớn hơn!")\nelse:\n    print("📉 Số bí mật nhỏ hơn!")\n```',
      'Luôn in "🎉 Đúng!"', 'Game đoán số 1 vòng với gợi ý lớn hơn/nhỏ hơn', 'Lỗi vì thiếu vòng lặp while', 'Không làm gì', 'B',
      '✅ Code đúng! Nhưng chỉ chơi 1 lần. Thêm while True + break để chơi nhiều lần!'
    ),
    mc(
      '📸 Trong dự án kết hợp Camera + AI, thứ tự xử lý đúng là?',
      'AI xử lý → Camera → Hiển thị', 'Camera chụp frame → AI xử lý → Hiển thị kết quả', 'Hiển thị → Camera → AI', 'Cả ba chạy song song', 'B',
      '✅ Pipeline CV+AI: Camera bắt hình → xử lý → AI nhận diện → vẽ kết quả lên frame → hiển thị.'
    ),
    mc(
      '🐍 Để tạo game Rắn Săn Mồi đơn giản bằng Python, cần những gì?',
      'Chỉ cần import random là đủ', 'Turtle/Pygame + vòng lặp game + biến vị trí rắn và mồi', 'OpenCV và AI nhận diện', 'Chỉ cần print()', 'B',
      '✅ Game cơ bản cần: thư viện đồ hoạ (Turtle/Pygame), game loop (while), logic di chuyển và va chạm.'
    ),
    mc(
      '🐛 Phương pháp DEBUG tốt nhất khi gặp lỗi là?',
      'Xóa hết code và viết lại từ đầu', 'Đọc thông báo lỗi, dùng print() kiểm tra từng bước', 'Hỏi ngay mà không cần thử', 'Bỏ qua lỗi và chạy tiếp', 'B',
      '✅ Debug = tìm lỗi. Đọc traceback → tìm dòng lỗi → thêm print() để kiểm tra giá trị biến từng bước.'
    ),
    mc(
      '💬 Kết quả của dự án chatbot vòng lặp này?\n```python\nwhile True:\n    user = input("Bạn: ")\n    if user == "thoát":\n        print("Bot: Tạm biệt! 👋")\n        break\n    else:\n        print("Bot: Câu thú vị đấy!")\n```',
      'Chạy 1 lần rồi dừng', 'Chatbot loop liên tục đến khi người dùng gõ "thoát"', 'Lỗi vì while True nguy hiểm', 'Không in gì', 'B',
      '✅ while True + break là pattern chuẩn cho chatbot. Chạy mãi đến khi người dùng chọn thoát.'
    ),
    mc(
      '🧩 Tại sao nên chia code dự án thành nhiều HÀM (functions)?',
      'Code dài hơn nên nhìn có vẻ chuyên nghiệp hơn', 'Dễ đọc, dễ sửa, tái sử dụng và dễ debug hơn', 'Python bắt buộc phải dùng hàm', 'Giúp code chạy nhanh hơn đáng kể', 'B',
      '✅ Hàm = chia nhỏ vấn đề. Mỗi hàm làm 1 việc rõ ràng. Dễ test, dễ sửa, dễ mở rộng!'
    ),
    tf(
      '📝 Dự án tốt nên có comment giải thích những đoạn code phức tạp.',
      true,
      '✅ Đúng! Comment giúp bạn hiểu code sau vài tháng và giúp người khác đọc code của bạn.'
    ),
    tf(
      '❌ Một chương trình Python không thể dùng cả random, turtle và cv2 cùng lúc.',
      false,
      '✅ Sai! Python có thể import bao nhiêu thư viện tuỳ ý. import random, turtle, cv2 đều được!'
    ),
    tf(
      '📚 Git giúp theo dõi lịch sử thay đổi code và phục hồi phiên bản cũ khi cần.',
      true,
      '✅ Đúng! Git là công cụ version control cực kỳ quan trọng cho mọi lập trình viên!'
    ),
    tf(
      '🌐 Khi gặp lỗi, lập trình viên thường tìm giải pháp trên Stack Overflow hoặc tài liệu chính thức.',
      true,
      '✅ Đúng! Google + Stack Overflow + docs.python.org là bộ ba không thể thiếu của lập trình viên!'
    ),
    tf(
      '✍️ Trong dự án, nên đặt tên biến có ý nghĩa (so_nguoi_choi) thay vì tên không rõ (x, y, z).',
      true,
      '✅ Đúng! Tên rõ ràng = code tự documenting. 6 tháng sau bạn sẽ hiểu code của chính mình!'
    ),
    tf(
      '📦 Một dự án Python có thể sử dụng nhiều thư viện (import) cùng lúc.',
      true,
      '✅ Đúng! Dự án thực tế thường dùng hàng chục thư viện. Đó là sức mạnh của hệ sinh thái Python!'
    ),
    mc(
      '🐛 Khi gặp IndentationError trong dự án lớn, nguyên nhân thường là?',
      'Biến chưa được khai báo', 'Lỗi thụt đầu dòng không đều (trộn Tab và Space)', 'Thiếu import thư viện', 'Tên hàm bị sai', 'B',
      '✅ IndentationError = lỗi thụt lề. Thường do trộn Tab và Space. Dùng 4 dấu cách hoặc Tab, chọn 1 cái!'
    ),
    mc(
      '🎯 Kết quả của dự án mini quiz game này?\n```python\nimport random\ndiem = 0\nfor i in range(5):\n    so = random.randint(1, 10)\n    guess = int(input(f"Câu {i+1}: Đoán số 1-10: "))\n    if guess == so:\n        diem += 10\n        print("✅ Đúng!")\n    else:\n        print(f"❌ Sai! Đáp án là {so}")\nprint(f"Điểm của bạn: {diem}/50")\n```',
      'Luôn được 50/50 điểm', 'Game 5 câu đoán số ngẫu nhiên, tính điểm cuối', 'Lỗi vì dùng f-string', 'Không làm gì', 'B',
      '✅ Dự án hoàn chỉnh! 5 câu đoán số, mỗi câu đúng +10 điểm, tổng kết điểm ở cuối.'
    ),
    mc(
      '📄 Để trình bày dự án cho các bạn và giáo viên, tài liệu nào quan trọng nhất?',
      'File .exe để chạy luôn', 'File README.md giải thích dự án, cách cài đặt và sử dụng', 'File .env chứa API key bí mật', 'File tạm thời __pycache__', 'B',
      '✅ README.md là "bộ mặt" của dự án. Giải thích: dự án làm gì, cài thế nào, chạy thế nào, tính năng gì.'
    ),
    mc(
      '🚀 Sau khoá Python Lab, bước tiếp theo để phát triển kỹ năng là?',
      'Dừng lại vì đã biết đủ rồi', 'Tiếp tục thực hành, làm dự án nhỏ, học thêm framework như Flask/Pygame/Django', 'Học Assembly ngay', 'Chuyển sang học Excel', 'B',
      '✅ Learning never stops! Làm project thật, đóng góp open source, học framework mới. Keep coding! 🐍🚀'
    ),
  ],
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
const TOPICS = [topic1, topic2, topic3, topic4, topic5, topic6, topic7, topic8, topic9, topic10, topic11, topic12]

async function main() {
  const course = await p.course.findUnique({
    where: { code: 'PYTHON-BASIC' },
    include: { subjects: { orderBy: { order: 'asc' } } },
  })

  if (!course) {
    console.error('❌ Không tìm thấy khoá PYTHON-BASIC!')
    process.exit(1)
  }

  console.log(`📚 Khoá: ${course.name} — ${TOPICS.length} chủ đề`)

  for (const t of TOPICS) {
    const s = course.subjects.find((sub) => sub.order === t.order)
    if (!s) {
      console.log(`⚠️  Không tìm thấy subject order=${t.order} (${t.topicName})`)
      continue
    }

    const cnt = await p.question.count({ where: { subjectId: s.id } })
    if (cnt > 0) {
      console.log(`⏭️  Bỏ qua: ${t.order}. ${t.topicName} (đã có ${cnt} câu)`)
      continue
    }

    await p.question.createMany({
      data: t.questions.map((q, i) => ({
        subjectId: s.id,
        order: i + 1,
        questionType: q.type,
        content: q.content,
        options: q.options,
        correctAnswer: q.answer,
        explanation: q.explanation,
        points: 1,
      })),
    })

    console.log(`✅ ${t.order}. ${t.topicName} — ${t.questions.length} câu`)
  }

  const total = await p.question.count({
    where: { subjectId: { in: course.subjects.map((s) => s.id) } },
  })
  console.log(`\n🎉 Hoàn thành! Tổng cộng: ${total} câu hỏi trong database`)
  await p.$disconnect()
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
