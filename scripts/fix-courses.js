/**
 * Fix courses to match exact spec in document
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateCourse(code, newData) {
  const course = await prisma.course.findUnique({ where: { code } })
  if (!course) { console.log(`❌ Not found: ${code}`); return }

  // Delete existing subjects
  await prisma.subject.deleteMany({ where: { courseId: course.id } })

  // Update course info
  await prisma.course.update({
    where: { code },
    data: {
      name: newData.name,
      description: newData.description,
      courseType: newData.courseType,
      price: newData.price,
    },
  })

  // Recreate subjects
  for (const sub of newData.subjects) {
    await prisma.subject.create({
      data: {
        courseId: course.id,
        order: sub.order,
        icon: sub.icon,
        name: sub.name,
        description: sub.description,
        isActive: true,
        isPreview: sub.order === 1,
      },
    })
  }
  console.log(`✅ Updated: ${newData.name} — ${newData.subjects.length} subjects`)
}

async function main() {
  console.log('🔧 Fixing courses to match spec...\n')

  // ── 1. ENGLISH STARTER ──────────────────────────────────────────────
  await updateCourse('ENGLISH-STARTER', {
    name: 'English Starter — Tiếng Anh Tư Duy Cho Trẻ 5 Tuổi',
    description: 'Tiếng Anh tư duy dành cho trẻ 5 tuổi chuẩn bị vào lớp 1. Học qua hình ảnh, trò chơi, AI hội thoại. Không học ngữ pháp, không dịch từng từ. Triết lý: English Through Thinking.',
    courseType: 'TIENG_ANH',
    price: 1500000,
    subjects: [
      { order: 1,  icon: '👋', name: 'Hello & My Name',     description: 'Chào hỏi, tự giới thiệu tên. Hello! What\'s your name? I\'m...' },
      { order: 2,  icon: '🎨', name: 'Colors',              description: 'Màu sắc: Red, Blue, Green, Yellow, Orange, Purple, Pink, White, Black, Brown' },
      { order: 3,  icon: '🔢', name: 'Numbers',             description: 'Số 1–20. How many? One, two, three... twenty' },
      { order: 4,  icon: '🔷', name: 'Shapes',              description: 'Circle, Square, Triangle, Rectangle, Star, Heart, Diamond' },
      { order: 5,  icon: '📏', name: 'Big & Small',         description: 'So sánh kích thước: Big/Small, Tall/Short, Long/Short, Heavy/Light' },
      { order: 6,  icon: '🤸', name: 'My Body',             description: 'Head, Eyes, Ears, Nose, Mouth, Hands, Legs, Feet, Tummy, Back' },
      { order: 7,  icon: '👨‍👩‍👧', name: 'My Family',          description: 'Mom, Dad, Brother, Sister, Grandma, Grandpa, Baby, Family' },
      { order: 8,  icon: '🐘', name: 'Animals',             description: 'Dog, Cat, Lion, Elephant, Monkey, Bird, Fish, Rabbit, Tiger, Bear' },
      { order: 9,  icon: '🍎', name: 'Fruits',              description: 'Apple, Banana, Mango, Orange, Grape, Watermelon, Strawberry, Pineapple' },
      { order: 10, icon: '🍕', name: 'Food & Drinks',       description: 'Rice, Bread, Egg, Milk, Water, Juice, Noodle, Cake, Cookie, Soup' },
      { order: 11, icon: '🧸', name: 'Toys',                description: 'Ball, Doll, Car, Robot, Kite, Puzzle, Blocks, Teddy bear, Bike, Balloon' },
      { order: 12, icon: '📚', name: 'Classroom Objects',   description: 'Book, Pen, Pencil, Ruler, Eraser, Bag, Chair, Table, Board, Crayon' },
      { order: 13, icon: '🏃', name: 'Actions',             description: 'Run, Jump, Eat, Sleep, Drink, Play, Read, Write, Swim, Sing, Dance' },
      { order: 14, icon: '😊', name: 'Feelings',            description: 'Happy, Sad, Angry, Scared, Surprised, Tired, Hungry, Excited, Bored, Sick' },
      { order: 15, icon: '⛅', name: 'Weather',             description: 'Sunny, Rainy, Cloudy, Windy, Snowy, Hot, Cold, Stormy, Foggy' },
      { order: 16, icon: '👕', name: 'Clothes',             description: 'Shirt, Pants, Dress, Skirt, Shoes, Socks, Hat, Jacket, Gloves, Uniform' },
      { order: 17, icon: '🏠', name: 'Places',              description: 'School, Park, Hospital, Market, Library, Zoo, Beach, Mountain, Farm, Home' },
      { order: 18, icon: '🚌', name: 'Transportation',      description: 'Bus, Car, Plane, Boat, Train, Bicycle, Motorbike, Truck, Taxi, Helicopter' },
      { order: 19, icon: '↕️', name: 'Position Words',      description: 'On, Under, Next to, Behind, In front of, Inside, Outside, Between, Above' },
      { order: 20, icon: '🌅', name: 'Daily Routine',       description: 'Wake up, Brush teeth, Eat breakfast, Go to school, Study, Play, Dinner, Sleep' },
    ],
  })

  // ── 2. CODING KIDS (THUẬT TOÁN) ─────────────────────────────────────
  await updateCourse('CODING-KIDS-ALGO', {
    name: 'Coding Kids — Tư Duy Thuật Toán Đầu Đời',
    description: 'Khóa học tư duy thuật toán dành cho học sinh lớp 1–2 (6–8 tuổi). Không cần biết code — học qua robot, mê cung, kéo thả lệnh, trò chơi hình ảnh.',
    courseType: 'LAP_TRINH_THUAT_TOAN',
    price: 1200000,
    subjects: [
      { order: 1,  icon: '🤖', name: 'Robot Và Lệnh',         description: 'Học lệnh cơ bản: tiến, lùi, trái, phải, bắt đầu, dừng. Robot đi từ nhà đến trường.' },
      { order: 2,  icon: '📋', name: 'Thứ Tự Thực Hiện',      description: 'Khái niệm Sequence. Sắp xếp bước đúng thứ tự: đánh răng, đi học, mở cửa, tưới cây.' },
      { order: 3,  icon: '🌀', name: 'Đi Trong Mê Cung',      description: 'Tìm đường đi cho robot. Tránh vật cản. Chọn đường đi hợp lý nhất.' },
      { order: 4,  icon: '🔁', name: 'Lặp Lại',               description: 'Khái niệm Repeat. Tiến 4 bước = Repeat 4. Thay nhiều lệnh giống nhau bằng một lệnh lặp.' },
      { order: 5,  icon: '❓', name: 'Điều Kiện',              description: 'Khái niệm If/Then. Nếu gặp tường thì rẽ. Nếu gặp nước thì dừng. Nếu thấy chìa khóa thì nhặt.' },
      { order: 6,  icon: '⚖️', name: 'So Sánh',               description: 'Lớn hơn, nhỏ hơn, bằng nhau. Robot chọn hộp lớn hơn, số lớn hơn, đường ngắn hơn.' },
      { order: 7,  icon: '🔮', name: 'Quy Luật',              description: 'Tìm pattern. Dãy hình tiếp theo là gì? Quy luật màu sắc, hình dạng, hướng đi.' },
      { order: 8,  icon: '📦', name: 'Phân Loại',             description: 'Classification. Phân loại theo màu, hình, kích thước. Robot dọn kho theo nhóm.' },
      { order: 9,  icon: '✨', name: 'Tối Ưu',                description: 'Chọn đường ít bước hơn. Lệnh ngắn hơn. Cách nhanh hơn — tối ưu chương trình.' },
      { order: 10, icon: '🔍', name: 'Gỡ Lỗi',               description: 'Debugging. Tìm lỗi trong chuỗi lệnh. Sửa lệnh sai để robot đi đúng đường.' },
      { order: 11, icon: '✂️', name: 'Chia Bài Toán',         description: 'Decomposition. Chia nhiệm vụ lớn thành nhỏ: lấy chìa khóa → mở cửa → đến đích.' },
      { order: 12, icon: '🏆', name: 'Dự Án Tổng Kết',        description: 'Kết hợp sequence, repeat, if, pattern, classification. Robot vượt mê cung, nhặt kim cương, về đích!' },
    ],
  })

  // ── 3. SCRATCH KIDS ─────────────────────────────────────────────────
  await updateCourse('SCRATCH-KIDS', {
    name: 'Ông Bụt Scratch Kids — Lập Trình Kéo Thả',
    description: 'Lập trình kéo thả Scratch cho học sinh 7–10 tuổi. Mỗi bài học tạo ra một mini project. Học bằng làm sản phẩm: kéo thả → chạy thử → sửa lỗi → sáng tạo thêm.',
    courseType: 'LAP_TRINH_SCRATCH',
    price: 1200000,
    subjects: [
      { order: 1,  icon: '🐱', name: 'Làm Quen Với Scratch',    description: 'Scratch là gì? Sprite là gì? Backdrop là gì? Kéo thả block đầu tiên. Project: Mèo Scratch tự giới thiệu.' },
      { order: 2,  icon: '🚶', name: 'Nhân Vật Di Chuyển',      description: 'Motion blocks: Move steps, Turn, Go to x/y, Glide. Project: Mèo đi dạo trong công viên.' },
      { order: 3,  icon: '⌨️', name: 'Sự Kiện Và Điều Khiển',   description: 'When green flag clicked, When key pressed, Broadcast, Start/Stop. Project: Điều khiển nhân vật bằng bàn phím.' },
      { order: 4,  icon: '💬', name: 'Ngoại Hình Và Hội Thoại',  description: 'Looks blocks: Say/Think, Costume, Show/Hide. Project: Câu chuyện hoạt hình ngắn.' },
      { order: 5,  icon: '🎵', name: 'Âm Thanh Và Hiệu Ứng',    description: 'Sound blocks: Play sound, Change volume, Add background music. Project: Sân khấu âm nhạc vui nhộn.' },
      { order: 6,  icon: '🔄', name: 'Vòng Lặp',                description: 'Repeat, Forever, Wait, Animation loop. Project: Nhân vật nhảy múa liên tục.' },
      { order: 7,  icon: '🔀', name: 'Điều Kiện If/Then',        description: 'If, If/Else, Touching, Key pressed. Project: Game tránh chướng ngại vật.' },
      { order: 8,  icon: '🏅', name: 'Biến Số Và Điểm Số',      description: 'Variable, Score, Lives, Timer. Project: Game nhặt sao tính điểm.' },
      { order: 9,  icon: '🗺️', name: 'Tọa Độ Và Bản Đồ',       description: 'X/Y coordinates, Direction, Random position, Boundary. Project: Game bắt táo rơi.' },
      { order: 10, icon: '👾', name: 'Clone Và Nhiều Đối Tượng',  description: 'Create clone, Delete clone, Random enemy, Multiple objects. Project: Game bắn bóng hoặc né vật cản.' },
      { order: 11, icon: '🎮', name: 'Thiết Kế Game Hoàn Chỉnh', description: 'Start screen, Game over, Win screen, Level. Project: Game mini hoàn chỉnh.' },
      { order: 12, icon: '🌟', name: 'Dự Án Cuối Khóa',          description: 'Học sinh tự chọn: Game / Hoạt hình / Truyện tương tác / Quiz. Có demo và thuyết trình sản phẩm.' },
    ],
  })

  // ── 4. ÔNG BỤT PYTHON LAB ───────────────────────────────────────────
  await updateCourse('PYTHON-BASIC', {
    name: 'Ông Bụt Python Lab — Python & AI',
    description: 'Python & AI dành cho học sinh 9–13 tuổi (lớp 4–8). Learn Python By Building — học bằng sản phẩm thực tế: game, chatbot, AI, website mini. IDE tích hợp ngay trong hệ thống.',
    courseType: 'LAP_TRINH_PYTHON',
    price: 1500000,
    subjects: [
      { order: 1,  icon: '👋', name: 'Hello Python',              description: 'Project: Hello World, Name Card, Funny Output. Chạy Python đầu tiên trong trình duyệt.' },
      { order: 2,  icon: '📦', name: 'Variables & Input',         description: 'Numbers, Strings, Input(). Project: Máy tính cộng trừ đơn giản.' },
      { order: 3,  icon: '🔀', name: 'If / Else',                 description: 'Rẽ nhánh chương trình. Project: Đoán tuổi, Kiểm tra điểm, Game Yes/No.' },
      { order: 4,  icon: '🔁', name: 'Loop',                      description: 'for, while. Project: Đếm số, Vẽ hình text, Animation Text.' },
      { order: 5,  icon: '🔧', name: 'Function',                  description: 'def, return, tái sử dụng code. Project: Máy tính thông minh, Mini Menu.' },
      { order: 6,  icon: '📝', name: 'List & Dictionary',         description: 'List, Dictionary, Tuple — lưu trữ dữ liệu. Project: Quản lý học sinh, Quản lý điểm.' },
      { order: 7,  icon: '🎲', name: 'Random & Game',             description: 'Module random. Project: Guess Number, Rock Paper Scissors, Dice Game.' },
      { order: 8,  icon: '🎨', name: 'Drawing & Turtle',          description: 'Vẽ hình bằng Python Turtle. Project: Robot, Hoa, Nhà, Cây, Fractal.' },
      { order: 9,  icon: '📂', name: 'Files & Data',              description: 'Đọc/ghi file, CSV, JSON. Project: Nhật ký cá nhân, Quản lý dữ liệu.' },
      { order: 10, icon: '🤖', name: 'AI & Chatbot',              description: 'OpenAI API / Gemini API. Project: Chatbot, AI Teacher, AI Translator.' },
      { order: 11, icon: '👁️', name: 'Computer Vision',           description: 'QR Code, OCR, Image. Project: QR Scanner, Image Classifier.' },
      { order: 12, icon: '🚀', name: 'Dự Án Cuối Khóa',          description: 'Học sinh tự chọn: Game / Chatbot / AI Tool / Website / Robot.' },
    ],
  })

  // ── 5. ÔNG BỤT ALGORITHM LAB (C++) ──────────────────────────────────
  await updateCourse('CPP-ALGO', {
    name: 'Ông Bụt Algorithm Lab — C++ & Competitive Programming',
    description: 'C++ & Competitive Programming cho học sinh 11–16 tuổi. Học bằng bài toán: Learn Algorithm By Solving Problems. Hệ thống judge tự chấm, contest, ranking như Codeforces.',
    courseType: 'LAP_TRINH_CPP',
    price: 2000000,
    subjects: [
      { order: 1,  icon: '⚡', name: 'Getting Started — C++',      description: 'Input/Output, Variables, kiểu dữ liệu cơ bản. Project: Calculator.' },
      { order: 2,  icon: '🔀', name: 'If / Else / Switch',          description: 'Rẽ nhánh, điều kiện phức hợp. Giải bài toán logic cơ bản.' },
      { order: 3,  icon: '🔁', name: 'Loop — for / while',          description: 'for, while, nested loop. Project: Pattern Printing, bài toán in hình.' },
      { order: 4,  icon: '🔧', name: 'Function & Recursion',        description: 'Parameter, return, đệ quy cơ bản.' },
      { order: 5,  icon: '🗂️', name: 'Array, String & Vector',     description: 'Mảng 1D/2D, xử lý chuỗi, vector STL. Project: Student Manager.' },
      { order: 6,  icon: '📊', name: 'Sorting & Searching',         description: 'Sắp xếp, Linear Search, Binary Search, Two Pointer.' },
      { order: 7,  icon: '📚', name: 'STL Containers',              description: 'vector, map, set, queue, stack, priority_queue.' },
      { order: 8,  icon: '💡', name: 'Greedy',                      description: 'Thuật toán tham lam. Project: Scheduling, Coins, Activity Selection.' },
      { order: 9,  icon: '🌀', name: 'Recursion & Backtracking',    description: 'Đệ quy nâng cao, quay lui. Project: Maze, N-Queens.' },
      { order: 10, icon: '🔍', name: 'Binary Search Nâng Cao',      description: 'Binary search on answer, tìm kiếm trên đoạn đơn điệu.' },
      { order: 11, icon: '🌲', name: 'Graph — DFS & BFS',           description: 'Đồ thị, DFS, BFS, Grid, Shortest Path cơ bản.' },
      { order: 12, icon: '💎', name: 'Dynamic Programming',         description: 'Knapsack, Fibonacci, LIS — quy hoạch động cơ bản.' },
      { order: 13, icon: '🏋️', name: 'Contest Skills',              description: 'Tối ưu I/O, phân tích độ phức tạp, debug, stress test.' },
      { order: 14, icon: '🏅', name: 'Mock Contest — 50 Bài OJ',    description: 'Luyện thi với 50 bài Online Judge tương tự Codeforces Div.4/Div.3.' },
      { order: 15, icon: '🏆', name: 'Final Project',               description: 'Mini Online Judge / Algorithm Visualizer / Game AI / Contest Analysis.' },
    ],
  })

  console.log('\n✅ All courses updated to match spec!')
  console.log('\nSummary:')
  const all = await prisma.course.findMany({
    select: { name: true, courseType: true, _count: { select: { subjects: true } } },
    where: { code: { in: ['ENGLISH-STARTER','CODING-KIDS-ALGO','SCRATCH-KIDS','PYTHON-BASIC','CPP-ALGO'] } },
  })
  all.forEach(c => console.log(`  ${c.courseType.padEnd(25)} ${c._count.subjects} subjects — ${c.name}`))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
