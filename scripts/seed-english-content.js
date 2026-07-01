/**
 * Seed English course questions — 20 topics × 20 câu = 400 câu
 * Run: node scripts/seed-english-content.js
 */
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

// ─── Question data per topic ───────────────────────────────────────────────
const TOPICS = [
  {
    topicName: 'Hello & My Name',
    mc: [
      { q:'🙋 "Xin chào" tiếng Anh là gì?', opts:['Hello','Goodbye','Thank you','Sorry'], ans:'A', ex:'Hello = Xin chào 👋' },
      { q:'🌅 "Good morning" nghĩa là gì?', opts:['Buổi tối','Buổi trưa','Buổi sáng','Tạm biệt'], ans:'C', ex:'Good morning = Chào buổi sáng ☀️' },
      { q:'👋 "Goodbye" nghĩa là gì?', opts:['Xin chào','Tạm biệt','Cảm ơn','Xin lỗi'], ans:'B', ex:'Goodbye = Tạm biệt 👋' },
      { q:'😊 "Nice to meet you" nghĩa là gì?', opts:['Bạn tên là gì?','Rất vui được gặp bạn','Tôi tên là...','Hẹn gặp lại'], ans:'B', ex:'Nice to meet you = Rất vui được gặp bạn 😊' },
      { q:'❓ "What is your name?" nghĩa là gì?', opts:['Bạn bao nhiêu tuổi?','Bạn ở đâu?','Bạn tên là gì?','Bạn thế nào?'], ans:'C', ex:'What is your name? = Bạn tên là gì? 😊' },
      { q:'🌙 "Good night" nghĩa là gì?', opts:['Buổi sáng','Buổi chiều','Buổi tối','Chúc ngủ ngon'], ans:'D', ex:'Good night = Chúc ngủ ngon 🌙' },
      { q:'🤝 Khi gặp bạn mới, con nói gì?', opts:['Goodbye','Hello','Sorry','Please'], ans:'B', ex:'Hello! = Xin chào! Dùng khi gặp ai đó 👋' },
      { q:'📛 "My name is Nam" nghĩa là gì?', opts:['Tên bạn là Nam','Tôi tên là Nam','Bạn tên là gì','Xin chào Nam'], ans:'B', ex:'My name is Nam = Tôi tên là Nam 😊' },
    ],
    matching: [
      {left:'Hello',      right:'Xin chào'},
      {left:'Goodbye',    right:'Tạm biệt'},
      {left:'Thank you',  right:'Cảm ơn'},
      {left:'Sorry',      right:'Xin lỗi'},
      {left:'Please',     right:'Làm ơn'},
      {left:'Good morning', right:'Chào buổi sáng'},
    ],
    tf: [
      { q:'"Hello" dùng để chào hỏi — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Hello = Xin chào 👋' },
      { q:'"Goodbye" nghĩa là Xin chào — Đúng hay Sai?', ans:'Sai', ex:'Sai! Goodbye = Tạm biệt. Hello = Xin chào 😊' },
      { q:'"My name is" dùng để giới thiệu tên — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! My name is Lan = Tôi tên là Lan 📛' },
      { q:'"Good morning" dùng vào buổi tối — Đúng hay Sai?', ans:'Sai', ex:'Sai! Good morning = buổi sáng. Good night = buổi tối 🌙' },
      { q:'"Nice to meet you" là câu chào khi gặp người mới — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Rất vui khi gặp bạn mới 😊' },
      { q:'"Hi" và "Hello" đều có nghĩa là Xin chào — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Hi và Hello đều là Xin chào 👋' },
    ],
  },
  {
    topicName: 'Colors',
    mc: [
      { q:'🍎 Quả táo màu gì? The apple is ___', opts:['Blue','Red','Green','Yellow'], ans:'B', ex:'Red = Đỏ 🔴 Quả táo màu đỏ!' },
      { q:'🌊 Biển màu gì? The sea is ___', opts:['Red','Pink','Blue','Orange'], ans:'C', ex:'Blue = Xanh dương 🔵 Biển màu xanh dương!' },
      { q:'🌿 Lá cây màu gì? The leaf is ___', opts:['Purple','Yellow','Green','Brown'], ans:'C', ex:'Green = Xanh lá 💚' },
      { q:'☀️ Mặt trời màu gì? The sun is ___', opts:['Blue','Yellow','White','Black'], ans:'B', ex:'Yellow = Vàng 💛 Mặt trời màu vàng!' },
      { q:'🐘 Con voi màu gì? The elephant is ___', opts:['White','Orange','Gray','Pink'], ans:'C', ex:'Gray = Xám 🩶' },
      { q:'🍊 Quả cam màu gì? The orange is ___', opts:['Red','Purple','Blue','Orange'], ans:'D', ex:'Orange = Màu cam 🟠' },
      { q:'⬛ "Black" nghĩa là màu gì?', opts:['Trắng','Đen','Xám','Nâu'], ans:'B', ex:'Black = Đen ⬛' },
      { q:'🩷 "Pink" nghĩa là màu gì?', opts:['Đỏ','Vàng','Hồng','Tím'], ans:'C', ex:'Pink = Hồng 🩷' },
    ],
    matching: [
      {left:'Red',    right:'Đỏ'},
      {left:'Blue',   right:'Xanh dương'},
      {left:'Green',  right:'Xanh lá'},
      {left:'Yellow', right:'Vàng'},
      {left:'Orange', right:'Cam'},
      {left:'Purple', right:'Tím'},
    ],
    tf: [
      { q:'"Red" nghĩa là màu Đỏ — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Red = Đỏ 🔴' },
      { q:'"Blue" nghĩa là màu Xanh lá — Đúng hay Sai?', ans:'Sai', ex:'Sai! Blue = Xanh dương 🔵. Green = Xanh lá 💚' },
      { q:'"Yellow" nghĩa là màu Vàng — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Yellow = Vàng 💛' },
      { q:'"White" nghĩa là màu Đen — Đúng hay Sai?', ans:'Sai', ex:'Sai! White = Trắng ⬜. Black = Đen ⬛' },
      { q:'Quả chuối màu Yellow — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Quả chuối màu vàng = Yellow 🍌💛' },
      { q:'"Pink" nghĩa là màu Tím — Đúng hay Sai?', ans:'Sai', ex:'Sai! Pink = Hồng 🩷. Purple = Tím 💜' },
    ],
  },
  {
    topicName: 'Numbers',
    mc: [
      { q:'🍎🍎🍎 Có bao nhiêu quả táo? How many apples?', opts:['One','Two','Three','Four'], ans:'C', ex:'Three = 3 🍎🍎🍎' },
      { q:'🐱🐱 Có bao nhiêu con mèo? How many cats?', opts:['One','Two','Three','Four'], ans:'B', ex:'Two = 2 🐱🐱' },
      { q:'✋ Bàn tay có bao nhiêu ngón? How many fingers?', opts:['Four','Five','Six','Seven'], ans:'B', ex:'Five = 5 ✋' },
      { q:'🔢 "Seven" là số mấy?', opts:['5','6','7','8'], ans:'C', ex:'Seven = 7 🔢' },
      { q:'🔢 "Ten" là số mấy?', opts:['8','9','10','11'], ans:'C', ex:'Ten = 10 🔟' },
      { q:'🔢 Số 4 tiếng Anh là gì?', opts:['Three','Four','Five','Six'], ans:'B', ex:'Four = 4 🍀' },
      { q:'🔢 "Twelve" là số mấy?', opts:['10','11','12','13'], ans:'C', ex:'Twelve = 12 🕛' },
      { q:'❓ "How many?" nghĩa là gì?', opts:['Cái gì?','Ở đâu?','Bao nhiêu?','Như thế nào?'], ans:'C', ex:'How many? = Bao nhiêu? 🔢' },
    ],
    matching: [
      {left:'One',   right:'Một'},
      {left:'Two',   right:'Hai'},
      {left:'Three', right:'Ba'},
      {left:'Four',  right:'Bốn'},
      {left:'Five',  right:'Năm'},
      {left:'Ten',   right:'Mười'},
    ],
    tf: [
      { q:'"Three" là số 3 — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Three = 3 🎯' },
      { q:'"Five" là số 4 — Đúng hay Sai?', ans:'Sai', ex:'Sai! Five = 5. Four = 4 🍀' },
      { q:'"Ten" là số 10 — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Ten = 10 🔟' },
      { q:'"Two" là số 3 — Đúng hay Sai?', ans:'Sai', ex:'Sai! Two = 2. Three = 3 🎯' },
      { q:'Số 7 tiếng Anh là "Seven" — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Seven = 7 🌈' },
      { q:'"Eleven" là số 12 — Đúng hay Sai?', ans:'Sai', ex:'Sai! Eleven = 11. Twelve = 12 🕛' },
    ],
  },
  {
    topicName: 'Shapes',
    mc: [
      { q:'⭕ Hình này tên là gì? This shape is ___', opts:['Square','Circle','Triangle','Star'], ans:'B', ex:'Circle = Hình tròn ⭕' },
      { q:'🔷 Hình vuông tiếng Anh là gì?', opts:['Circle','Triangle','Square','Rectangle'], ans:'C', ex:'Square = Hình vuông 🔷' },
      { q:'🔺 Hình tam giác tiếng Anh là gì?', opts:['Circle','Triangle','Square','Heart'], ans:'B', ex:'Triangle = Hình tam giác 🔺' },
      { q:'⭐ Hình ngôi sao tiếng Anh là gì?', opts:['Heart','Diamond','Star','Circle'], ans:'C', ex:'Star = Hình ngôi sao ⭐' },
      { q:'❤️ Hình trái tim tiếng Anh là gì?', opts:['Star','Diamond','Circle','Heart'], ans:'D', ex:'Heart = Hình trái tim ❤️' },
      { q:'🔶 "Rectangle" nghĩa là hình gì?', opts:['Tròn','Vuông','Chữ nhật','Tam giác'], ans:'C', ex:'Rectangle = Hình chữ nhật 🔶' },
      { q:'💎 "Diamond" nghĩa là hình gì?', opts:['Hình tròn','Hình thoi','Hình sao','Hình tim'], ans:'B', ex:'Diamond = Hình thoi 💎' },
      { q:'🥚 "Oval" nghĩa là hình gì?', opts:['Hình tròn','Hình vuông','Hình bầu dục','Hình tam giác'], ans:'C', ex:'Oval = Hình bầu dục 🥚' },
    ],
    matching: [
      {left:'Circle',    right:'Hình tròn'},
      {left:'Square',    right:'Hình vuông'},
      {left:'Triangle',  right:'Hình tam giác'},
      {left:'Star',      right:'Hình ngôi sao'},
      {left:'Heart',     right:'Hình trái tim'},
      {left:'Rectangle', right:'Hình chữ nhật'},
    ],
    tf: [
      { q:'"Circle" là hình tròn — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Circle = Hình tròn ⭕' },
      { q:'"Triangle" là hình vuông — Đúng hay Sai?', ans:'Sai', ex:'Sai! Triangle = Hình tam giác 🔺. Square = Hình vuông' },
      { q:'"Star" là hình ngôi sao — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Star = Hình ngôi sao ⭐' },
      { q:'"Heart" là hình thoi — Đúng hay Sai?', ans:'Sai', ex:'Sai! Heart = Hình trái tim ❤️. Diamond = Hình thoi' },
      { q:'"Rectangle" là hình chữ nhật — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Rectangle = Hình chữ nhật 🔶' },
      { q:'"Square" là hình tròn — Đúng hay Sai?', ans:'Sai', ex:'Sai! Square = Hình vuông. Circle = Hình tròn ⭕' },
    ],
  },
  {
    topicName: 'Big & Small',
    mc: [
      { q:'🐘🐭 Con voi và con chuột, con nào BIG?', opts:['Con chuột','Con voi','Cả hai','Không con nào'], ans:'B', ex:'Big = To lớn 🐘 Con voi to hơn!' },
      { q:'📏 "Tall" nghĩa là gì?', opts:['Thấp','Cao','Nặng','Nhẹ'], ans:'B', ex:'Tall = Cao 📏' },
      { q:'🐜 "Small" nghĩa là gì?', opts:['To','Nhỏ','Cao','Thấp'], ans:'B', ex:'Small = Nhỏ 🐜' },
      { q:'⚖️ "Heavy" nghĩa là gì?', opts:['Nhẹ','Cao','Nặng','Nhỏ'], ans:'C', ex:'Heavy = Nặng ⚖️' },
      { q:'🪶 "Light" (nhẹ) nghĩa là gì?', opts:['Nặng','Nhẹ','To','Nhỏ'], ans:'B', ex:'Light = Nhẹ 🪶' },
      { q:'📏 "Short" (chiều cao) nghĩa là gì?', opts:['Cao','Thấp','Dài','Ngắn'], ans:'B', ex:'Short = Thấp 📏' },
      { q:'🐍 "Long" nghĩa là gì?', opts:['Ngắn','Dài','To','Nhỏ'], ans:'B', ex:'Long = Dài 🐍' },
      { q:'🔢 "More" nghĩa là gì?', opts:['Ít hơn','Bằng nhau','Nhiều hơn','Không có'], ans:'C', ex:'More = Nhiều hơn 🔢' },
    ],
    matching: [
      {left:'Big',    right:'To'},
      {left:'Small',  right:'Nhỏ'},
      {left:'Tall',   right:'Cao'},
      {left:'Short',  right:'Thấp'},
      {left:'Heavy',  right:'Nặng'},
      {left:'Light',  right:'Nhẹ'},
    ],
    tf: [
      { q:'"Big" nghĩa là To lớn — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Big = To 🐘' },
      { q:'"Small" nghĩa là To — Đúng hay Sai?', ans:'Sai', ex:'Sai! Small = Nhỏ 🐜. Big = To 🐘' },
      { q:'"Tall" nghĩa là Cao — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Tall = Cao 📏' },
      { q:'"Heavy" nghĩa là Nhẹ — Đúng hay Sai?', ans:'Sai', ex:'Sai! Heavy = Nặng ⚖️. Light = Nhẹ 🪶' },
      { q:'Con voi thì Big, con kiến thì Small — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! 🐘 Big, 🐜 Small!' },
      { q:'"Long" và "Short" là hai từ trái nghĩa — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Long = Dài, Short = Ngắn 📏' },
    ],
  },
  {
    topicName: 'My Body',
    mc: [
      { q:'👁️ "Eyes" là bộ phận nào?', opts:['Tai','Mắt','Mũi','Miệng'], ans:'B', ex:'Eyes = Mắt 👁️' },
      { q:'👂 "Ears" là bộ phận nào?', opts:['Mắt','Mũi','Tai','Miệng'], ans:'C', ex:'Ears = Tai 👂' },
      { q:'👃 "Nose" là bộ phận nào?', opts:['Tai','Miệng','Mắt','Mũi'], ans:'D', ex:'Nose = Mũi 👃' },
      { q:'👋 "Hands" là bộ phận nào?', opts:['Chân','Tay','Đầu','Bụng'], ans:'B', ex:'Hands = Tay 👋' },
      { q:'🦵 "Legs" là bộ phận nào?', opts:['Tay','Đầu','Chân','Lưng'], ans:'C', ex:'Legs = Chân 🦵' },
      { q:'🦷 "Teeth" là bộ phận nào?', opts:['Tóc','Răng','Môi','Lưỡi'], ans:'B', ex:'Teeth = Răng 🦷' },
      { q:'💆 "Head" là bộ phận nào?', opts:['Bụng','Lưng','Đầu','Cổ'], ans:'C', ex:'Head = Đầu 💆' },
      { q:'👣 "Feet" là bộ phận nào?', opts:['Tay','Chân (bàn chân)','Đầu','Lưng'], ans:'B', ex:'Feet = Bàn chân 👣' },
    ],
    matching: [
      {left:'Head',  right:'Đầu'},
      {left:'Eyes',  right:'Mắt'},
      {left:'Nose',  right:'Mũi'},
      {left:'Mouth', right:'Miệng'},
      {left:'Hands', right:'Tay'},
      {left:'Legs',  right:'Chân'},
    ],
    tf: [
      { q:'"Eyes" là Mắt — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Eyes = Mắt 👁️' },
      { q:'"Nose" là Tai — Đúng hay Sai?', ans:'Sai', ex:'Sai! Nose = Mũi 👃. Ears = Tai 👂' },
      { q:'"Hands" là Tay — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Hands = Tay 👋' },
      { q:'"Head" là Chân — Đúng hay Sai?', ans:'Sai', ex:'Sai! Head = Đầu 💆. Legs = Chân 🦵' },
      { q:'"Teeth" là Răng — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Teeth = Răng 🦷' },
      { q:'"Hair" là Tóc — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Hair = Tóc 💇' },
    ],
  },
  {
    topicName: 'My Family',
    mc: [
      { q:'👩 "Mom" nghĩa là gì?', opts:['Bà','Mẹ','Chị','Cô'], ans:'B', ex:'Mom = Mẹ 👩‍❤️‍👧' },
      { q:'👨 "Dad" nghĩa là gì?', opts:['Ông','Chú','Bố','Anh'], ans:'C', ex:'Dad = Bố/Ba 👨' },
      { q:'👧 "Sister" nghĩa là gì?', opts:['Anh trai','Em trai','Chị/em gái','Mẹ'], ans:'C', ex:'Sister = Chị/Em gái 👧' },
      { q:'👦 "Brother" nghĩa là gì?', opts:['Anh/Em trai','Bố','Ông','Chú'], ans:'A', ex:'Brother = Anh/Em trai 👦' },
      { q:'👵 "Grandma" nghĩa là gì?', opts:['Mẹ','Bà','Cô','Chị'], ans:'B', ex:'Grandma = Bà 👵' },
      { q:'👴 "Grandpa" nghĩa là gì?', opts:['Bố','Chú','Ông','Anh'], ans:'C', ex:'Grandpa = Ông 👴' },
      { q:'👶 "Baby" nghĩa là gì?', opts:['Trẻ em lớn','Em bé','Bạn bè','Ông bà'], ans:'B', ex:'Baby = Em bé 👶' },
      { q:'👪 "Family" nghĩa là gì?', opts:['Bạn bè','Gia đình','Lớp học','Nhà trường'], ans:'B', ex:'Family = Gia đình 👪' },
    ],
    matching: [
      {left:'Mom',     right:'Mẹ'},
      {left:'Dad',     right:'Bố'},
      {left:'Brother', right:'Anh/Em trai'},
      {left:'Sister',  right:'Chị/Em gái'},
      {left:'Grandma', right:'Bà'},
      {left:'Grandpa', right:'Ông'},
    ],
    tf: [
      { q:'"Mom" nghĩa là Mẹ — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Mom = Mẹ 👩' },
      { q:'"Dad" nghĩa là Ông — Đúng hay Sai?', ans:'Sai', ex:'Sai! Dad = Bố 👨. Grandpa = Ông 👴' },
      { q:'"Sister" nghĩa là Chị/Em gái — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Sister = Chị/Em gái 👧' },
      { q:'"Baby" nghĩa là Em bé — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Baby = Em bé 👶' },
      { q:'"Brother" nghĩa là Chị gái — Đúng hay Sai?', ans:'Sai', ex:'Sai! Brother = Anh/Em trai 👦. Sister = Chị/Em gái 👧' },
      { q:'"Family" nghĩa là Gia đình — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Family = Gia đình 👪' },
    ],
  },
  {
    topicName: 'Animals',
    mc: [
      { q:'🐕 Con chó tiếng Anh là gì?', opts:['Cat','Dog','Bird','Fish'], ans:'B', ex:'Dog = Chó 🐕' },
      { q:'🐈 Con mèo tiếng Anh là gì?', opts:['Dog','Lion','Cat','Rabbit'], ans:'C', ex:'Cat = Mèo 🐈' },
      { q:'🐘 Con voi tiếng Anh là gì?', opts:['Tiger','Lion','Bear','Elephant'], ans:'D', ex:'Elephant = Voi 🐘' },
      { q:'🐒 Con khỉ tiếng Anh là gì?', opts:['Bear','Frog','Monkey','Bird'], ans:'C', ex:'Monkey = Khỉ 🐒' },
      { q:'🐟 Con cá tiếng Anh là gì?', opts:['Bird','Fish','Duck','Rabbit'], ans:'B', ex:'Fish = Cá 🐟' },
      { q:'🐰 "Rabbit" nghĩa là con gì?', opts:['Mèo','Chó','Thỏ','Ếch'], ans:'C', ex:'Rabbit = Thỏ 🐰' },
      { q:'🐯 "Tiger" nghĩa là con gì?', opts:['Sư tử','Gấu','Hổ','Voi'], ans:'C', ex:'Tiger = Hổ 🐯' },
      { q:'🐸 "Frog" nghĩa là con gì?', opts:['Vịt','Ếch','Cá','Chim'], ans:'B', ex:'Frog = Ếch 🐸' },
    ],
    matching: [
      {left:'Dog',      right:'Chó'},
      {left:'Cat',      right:'Mèo'},
      {left:'Elephant', right:'Voi'},
      {left:'Bird',     right:'Chim'},
      {left:'Fish',     right:'Cá'},
      {left:'Rabbit',   right:'Thỏ'},
    ],
    tf: [
      { q:'"Dog" nghĩa là Chó — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Dog = Chó 🐕' },
      { q:'"Cat" nghĩa là Chó — Đúng hay Sai?', ans:'Sai', ex:'Sai! Cat = Mèo 🐈. Dog = Chó 🐕' },
      { q:'"Elephant" là con Voi — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Elephant = Voi 🐘' },
      { q:'"Fish" là con Chim — Đúng hay Sai?', ans:'Sai', ex:'Sai! Fish = Cá 🐟. Bird = Chim 🐦' },
      { q:'"Tiger" là con Hổ — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Tiger = Hổ 🐯' },
      { q:'"Monkey" là con Khỉ — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Monkey = Khỉ 🐒' },
    ],
  },
  {
    topicName: 'Fruits',
    mc: [
      { q:'🍎 Quả táo tiếng Anh là gì?', opts:['Banana','Orange','Apple','Mango'], ans:'C', ex:'Apple = Táo 🍎' },
      { q:'🍌 Quả chuối tiếng Anh là gì?', opts:['Apple','Banana','Grape','Lemon'], ans:'B', ex:'Banana = Chuối 🍌' },
      { q:'🍊 "Orange" (quả) nghĩa là gì?', opts:['Táo','Xoài','Cam','Chuối'], ans:'C', ex:'Orange = Cam 🍊' },
      { q:'🍇 Quả nho tiếng Anh là gì?', opts:['Mango','Grape','Lemon','Peach'], ans:'B', ex:'Grape = Nho 🍇' },
      { q:'🍓 "Strawberry" nghĩa là gì?', opts:['Xoài','Dâu tây','Táo','Cam'], ans:'B', ex:'Strawberry = Dâu tây 🍓' },
      { q:'🍋 "Lemon" nghĩa là gì?', opts:['Cam','Táo','Chanh','Chuối'], ans:'C', ex:'Lemon = Chanh 🍋' },
      { q:'🥭 "Mango" nghĩa là gì?', opts:['Táo','Xoài','Nho','Dừa'], ans:'B', ex:'Mango = Xoài 🥭' },
      { q:'🍍 "Pineapple" nghĩa là gì?', opts:['Dừa','Táo','Dứa/Thơm','Xoài'], ans:'C', ex:'Pineapple = Dứa/Thơm 🍍' },
    ],
    matching: [
      {left:'Apple',      right:'Táo'},
      {left:'Banana',     right:'Chuối'},
      {left:'Orange',     right:'Cam'},
      {left:'Grape',      right:'Nho'},
      {left:'Mango',      right:'Xoài'},
      {left:'Strawberry', right:'Dâu tây'},
    ],
    tf: [
      { q:'"Apple" nghĩa là Táo — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Apple = Táo 🍎' },
      { q:'"Banana" nghĩa là Cam — Đúng hay Sai?', ans:'Sai', ex:'Sai! Banana = Chuối 🍌. Orange = Cam 🍊' },
      { q:'"Grape" nghĩa là Nho — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Grape = Nho 🍇' },
      { q:'"Lemon" nghĩa là Xoài — Đúng hay Sai?', ans:'Sai', ex:'Sai! Lemon = Chanh 🍋. Mango = Xoài 🥭' },
      { q:'"Strawberry" là Dâu tây — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Strawberry = Dâu tây 🍓' },
      { q:'"Pineapple" là Dứa — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Pineapple = Dứa/Thơm 🍍' },
    ],
  },
  {
    topicName: 'Food & Drinks',
    mc: [
      { q:'🥛 Sữa tiếng Anh là gì?', opts:['Water','Juice','Milk','Tea'], ans:'C', ex:'Milk = Sữa 🥛' },
      { q:'💧 Nước tiếng Anh là gì?', opts:['Milk','Juice','Tea','Water'], ans:'D', ex:'Water = Nước 💧' },
      { q:'🍳 "Egg" nghĩa là gì?', opts:['Bánh mì','Trứng','Cơm','Mì'], ans:'B', ex:'Egg = Trứng 🍳' },
      { q:'🍚 "Rice" nghĩa là gì?', opts:['Mì','Bánh mì','Cơm','Súp'], ans:'C', ex:'Rice = Cơm 🍚' },
      { q:'🎂 "Cake" nghĩa là gì?', opts:['Kẹo','Bánh quy','Bánh kem','Súp'], ans:'C', ex:'Cake = Bánh kem 🎂' },
      { q:'🍬 "Candy" nghĩa là gì?', opts:['Bánh kem','Kẹo','Cookies','Sữa'], ans:'B', ex:'Candy = Kẹo 🍬' },
      { q:'🍵 "Tea" nghĩa là gì?', opts:['Sữa','Nước','Trà','Nước cam'], ans:'C', ex:'Tea = Trà 🍵' },
      { q:'🍊 "Juice" nghĩa là gì?', opts:['Sữa','Nước lọc','Nước ép hoa quả','Trà'], ans:'C', ex:'Juice = Nước ép hoa quả 🧃' },
    ],
    matching: [
      {left:'Milk',  right:'Sữa'},
      {left:'Water', right:'Nước'},
      {left:'Rice',  right:'Cơm'},
      {left:'Bread', right:'Bánh mì'},
      {left:'Egg',   right:'Trứng'},
      {left:'Cake',  right:'Bánh kem'},
    ],
    tf: [
      { q:'"Milk" nghĩa là Sữa — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Milk = Sữa 🥛' },
      { q:'"Water" nghĩa là Sữa — Đúng hay Sai?', ans:'Sai', ex:'Sai! Water = Nước 💧. Milk = Sữa 🥛' },
      { q:'"Egg" nghĩa là Trứng — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Egg = Trứng 🍳' },
      { q:'"Cake" nghĩa là Kẹo — Đúng hay Sai?', ans:'Sai', ex:'Sai! Cake = Bánh kem 🎂. Candy = Kẹo 🍬' },
      { q:'"Rice" nghĩa là Cơm — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Rice = Cơm 🍚' },
      { q:'"Juice" là Nước ép hoa quả — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Juice = Nước ép 🧃' },
    ],
  },
  {
    topicName: 'Toys',
    mc: [
      { q:'⚽ Quả bóng tiếng Anh là gì?', opts:['Doll','Car','Ball','Kite'], ans:'C', ex:'Ball = Bóng ⚽' },
      { q:'🪀 "Kite" nghĩa là gì?', opts:['Bóng','Diều','Xe đồ chơi','Robot'], ans:'B', ex:'Kite = Diều 🪀' },
      { q:'🤖 "Robot" nghĩa là gì?', opts:['Búp bê','Robot','Xe hơi','Diều'], ans:'B', ex:'Robot = Robot 🤖' },
      { q:'🧸 "Teddy bear" nghĩa là gì?', opts:['Búp bê','Xe đồ chơi','Gấu bông','Diều'], ans:'C', ex:'Teddy bear = Gấu bông 🧸' },
      { q:'🚲 "Bike" nghĩa là gì?', opts:['Xe hơi','Xe lửa','Xe đạp','Tàu'], ans:'C', ex:'Bike = Xe đạp 🚲' },
      { q:'🎈 "Balloon" nghĩa là gì?', opts:['Diều','Bóng bay','Bóng đá','Dây thừng'], ans:'B', ex:'Balloon = Bóng bay 🎈' },
      { q:'🧩 "Puzzle" nghĩa là gì?', opts:['Xếp hình','Búp bê','Robot','Diều'], ans:'A', ex:'Puzzle = Xếp hình 🧩' },
      { q:'🚗 "Car" (đồ chơi) nghĩa là gì?', opts:['Xe đạp','Xe hơi đồ chơi','Tàu lửa','Tàu thuyền'], ans:'B', ex:'Car = Xe hơi 🚗' },
    ],
    matching: [
      {left:'Ball',      right:'Bóng'},
      {left:'Doll',      right:'Búp bê'},
      {left:'Car',       right:'Xe hơi đồ chơi'},
      {left:'Robot',     right:'Robot'},
      {left:'Kite',      right:'Diều'},
      {left:'Teddy bear',right:'Gấu bông'},
    ],
    tf: [
      { q:'"Ball" nghĩa là Bóng — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Ball = Bóng ⚽' },
      { q:'"Kite" nghĩa là Búp bê — Đúng hay Sai?', ans:'Sai', ex:'Sai! Kite = Diều 🪀. Doll = Búp bê 🪆' },
      { q:'"Teddy bear" là Gấu bông — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Teddy bear = Gấu bông 🧸' },
      { q:'"Balloon" là Bóng đá — Đúng hay Sai?', ans:'Sai', ex:'Sai! Balloon = Bóng bay 🎈. Ball = Bóng' },
      { q:'"Puzzle" là Xếp hình — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Puzzle = Xếp hình 🧩' },
      { q:'"Bike" là Xe đạp — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Bike = Xe đạp 🚲' },
    ],
  },
  {
    topicName: 'Classroom Objects',
    mc: [
      { q:'📚 "Book" nghĩa là gì?', opts:['Bút','Sách','Thước','Tẩy'], ans:'B', ex:'Book = Sách 📚' },
      { q:'✏️ "Pencil" nghĩa là gì?', opts:['Bút bi','Bút chì','Thước','Tẩy'], ans:'B', ex:'Pencil = Bút chì ✏️' },
      { q:'📏 "Ruler" nghĩa là gì?', opts:['Tẩy','Bút','Thước kẻ','Kéo'], ans:'C', ex:'Ruler = Thước kẻ 📏' },
      { q:'🎒 "Bag" nghĩa là gì?', opts:['Ghế','Bàn','Cặp sách','Bảng'], ans:'C', ex:'Bag = Cặp sách 🎒' },
      { q:'🖊️ "Pen" nghĩa là gì?', opts:['Bút chì','Bút bi','Tẩy','Thước'], ans:'B', ex:'Pen = Bút bi 🖊️' },
      { q:'⬜ "Board" (bảng) nghĩa là gì?', opts:['Ghế','Bàn','Bảng viết','Cửa sổ'], ans:'C', ex:'Board = Bảng viết ⬜' },
      { q:'✂️ "Scissors" nghĩa là gì?', opts:['Kéo','Thước','Bút','Tẩy'], ans:'A', ex:'Scissors = Kéo ✂️' },
      { q:'🪑 "Chair" nghĩa là gì?', opts:['Bàn','Ghế','Cửa','Cửa sổ'], ans:'B', ex:'Chair = Ghế 🪑' },
    ],
    matching: [
      {left:'Book',    right:'Sách'},
      {left:'Pen',     right:'Bút bi'},
      {left:'Pencil',  right:'Bút chì'},
      {left:'Ruler',   right:'Thước kẻ'},
      {left:'Eraser',  right:'Cục tẩy'},
      {left:'Bag',     right:'Cặp sách'},
    ],
    tf: [
      { q:'"Book" nghĩa là Sách — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Book = Sách 📚' },
      { q:'"Pencil" nghĩa là Bút bi — Đúng hay Sai?', ans:'Sai', ex:'Sai! Pencil = Bút chì ✏️. Pen = Bút bi 🖊️' },
      { q:'"Ruler" là Thước kẻ — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Ruler = Thước kẻ 📏' },
      { q:'"Bag" là Ghế — Đúng hay Sai?', ans:'Sai', ex:'Sai! Bag = Cặp sách 🎒. Chair = Ghế 🪑' },
      { q:'"Scissors" là Kéo — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Scissors = Kéo ✂️' },
      { q:'"Eraser" là Cục tẩy — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Eraser = Cục tẩy 🩹' },
    ],
  },
  {
    topicName: 'Actions',
    mc: [
      { q:'🏃 "Run" nghĩa là gì?', opts:['Nhảy','Chạy','Bơi','Ăn'], ans:'B', ex:'Run = Chạy 🏃' },
      { q:'🦘 "Jump" nghĩa là gì?', opts:['Chạy','Bơi','Nhảy','Ngủ'], ans:'C', ex:'Jump = Nhảy 🦘' },
      { q:'😴 "Sleep" nghĩa là gì?', opts:['Ăn','Uống','Chơi','Ngủ'], ans:'D', ex:'Sleep = Ngủ 😴' },
      { q:'🍽️ "Eat" nghĩa là gì?', opts:['Uống','Ăn','Đọc','Viết'], ans:'B', ex:'Eat = Ăn 🍽️' },
      { q:'🎵 "Sing" nghĩa là gì?', opts:['Nhảy múa','Chạy','Hát','Bơi'], ans:'C', ex:'Sing = Hát 🎵' },
      { q:'💃 "Dance" nghĩa là gì?', opts:['Hát','Nhảy múa','Bơi','Đọc'], ans:'B', ex:'Dance = Nhảy múa 💃' },
      { q:'🏊 "Swim" nghĩa là gì?', opts:['Chạy','Nhảy','Bơi','Hát'], ans:'C', ex:'Swim = Bơi 🏊' },
      { q:'📖 "Read" nghĩa là gì?', opts:['Viết','Đọc','Vẽ','Chạy'], ans:'B', ex:'Read = Đọc 📖' },
    ],
    matching: [
      {left:'Run',   right:'Chạy'},
      {left:'Jump',  right:'Nhảy'},
      {left:'Eat',   right:'Ăn'},
      {left:'Sleep', right:'Ngủ'},
      {left:'Sing',  right:'Hát'},
      {left:'Swim',  right:'Bơi'},
    ],
    tf: [
      { q:'"Run" nghĩa là Chạy — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Run = Chạy 🏃' },
      { q:'"Jump" nghĩa là Bơi — Đúng hay Sai?', ans:'Sai', ex:'Sai! Jump = Nhảy 🦘. Swim = Bơi 🏊' },
      { q:'"Eat" nghĩa là Ăn — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Eat = Ăn 🍽️' },
      { q:'"Sleep" nghĩa là Uống — Đúng hay Sai?', ans:'Sai', ex:'Sai! Sleep = Ngủ 😴. Drink = Uống 🥤' },
      { q:'"Sing" nghĩa là Hát — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Sing = Hát 🎵' },
      { q:'"Dance" và "Sing" đều là các hành động — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Dance = Nhảy múa 💃, Sing = Hát 🎵' },
    ],
  },
  {
    topicName: 'Feelings',
    mc: [
      { q:'😊 "Happy" nghĩa là gì?', opts:['Buồn','Vui/Hạnh phúc','Tức giận','Sợ'], ans:'B', ex:'Happy = Vui/Hạnh phúc 😊' },
      { q:'😢 "Sad" nghĩa là gì?', opts:['Vui','Buồn','Tức giận','Ngạc nhiên'], ans:'B', ex:'Sad = Buồn 😢' },
      { q:'😠 "Angry" nghĩa là gì?', opts:['Vui','Buồn','Tức giận','Sợ hãi'], ans:'C', ex:'Angry = Tức giận 😠' },
      { q:'😱 "Scared" nghĩa là gì?', opts:['Vui','Tức giận','Buồn','Sợ hãi'], ans:'D', ex:'Scared = Sợ hãi 😱' },
      { q:'😲 "Surprised" nghĩa là gì?', opts:['Mệt','Ngạc nhiên','Buồn','Đói'], ans:'B', ex:'Surprised = Ngạc nhiên 😲' },
      { q:'😴 "Tired" nghĩa là gì?', opts:['Đói','Mệt','Vui','Buồn'], ans:'B', ex:'Tired = Mệt mỏi 😴' },
      { q:'🤩 "Excited" nghĩa là gì?', opts:['Buồn','Mệt','Hào hứng/Phấn khích','Sợ'], ans:'C', ex:'Excited = Hào hứng/Phấn khích 🤩' },
      { q:'🤒 "Sick" nghĩa là gì?', opts:['Vui','Đói','Ốm/Bệnh','Mệt'], ans:'C', ex:'Sick = Ốm/Bệnh 🤒' },
    ],
    matching: [
      {left:'Happy',     right:'Vui'},
      {left:'Sad',       right:'Buồn'},
      {left:'Angry',     right:'Tức giận'},
      {left:'Scared',    right:'Sợ hãi'},
      {left:'Tired',     right:'Mệt mỏi'},
      {left:'Surprised', right:'Ngạc nhiên'},
    ],
    tf: [
      { q:'"Happy" nghĩa là Vui — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Happy = Vui/Hạnh phúc 😊' },
      { q:'"Sad" nghĩa là Vui — Đúng hay Sai?', ans:'Sai', ex:'Sai! Sad = Buồn 😢. Happy = Vui 😊' },
      { q:'"Angry" nghĩa là Tức giận — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Angry = Tức giận 😠' },
      { q:'"Tired" nghĩa là Đói — Đúng hay Sai?', ans:'Sai', ex:'Sai! Tired = Mệt 😴. Hungry = Đói' },
      { q:'"Scared" nghĩa là Sợ hãi — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Scared = Sợ hãi 😱' },
      { q:'"Excited" nghĩa là Hào hứng — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Excited = Hào hứng/Phấn khích 🤩' },
    ],
  },
  {
    topicName: 'Weather',
    mc: [
      { q:'☀️ "Sunny" nghĩa là gì?', opts:['Mưa','Nắng/Trời nắng','Nhiều mây','Tuyết'], ans:'B', ex:'Sunny = Trời nắng ☀️' },
      { q:'🌧️ "Rainy" nghĩa là gì?', opts:['Nắng','Mưa','Gió','Tuyết'], ans:'B', ex:'Rainy = Trời mưa 🌧️' },
      { q:'☁️ "Cloudy" nghĩa là gì?', opts:['Nắng','Mưa','Nhiều mây','Gió'], ans:'C', ex:'Cloudy = Nhiều mây ☁️' },
      { q:'🌬️ "Windy" nghĩa là gì?', opts:['Mưa','Nắng','Lạnh','Có gió'], ans:'D', ex:'Windy = Có gió 🌬️' },
      { q:'❄️ "Snowy" nghĩa là gì?', opts:['Mưa','Gió','Có tuyết','Nóng'], ans:'C', ex:'Snowy = Có tuyết ❄️' },
      { q:'🥵 "Hot" nghĩa là gì?', opts:['Lạnh','Nóng','Ấm','Mát'], ans:'B', ex:'Hot = Nóng 🥵' },
      { q:'🥶 "Cold" nghĩa là gì?', opts:['Nóng','Ấm','Lạnh','Mát'], ans:'C', ex:'Cold = Lạnh 🥶' },
      { q:'⛈️ "Stormy" nghĩa là gì?', opts:['Nắng','Có giông bão','Mưa nhẹ','Mây'], ans:'B', ex:'Stormy = Có giông bão ⛈️' },
    ],
    matching: [
      {left:'Sunny',  right:'Nắng'},
      {left:'Rainy',  right:'Mưa'},
      {left:'Cloudy', right:'Nhiều mây'},
      {left:'Windy',  right:'Có gió'},
      {left:'Hot',    right:'Nóng'},
      {left:'Cold',   right:'Lạnh'},
    ],
    tf: [
      { q:'"Sunny" nghĩa là Trời nắng — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Sunny = Trời nắng ☀️' },
      { q:'"Rainy" nghĩa là Có gió — Đúng hay Sai?', ans:'Sai', ex:'Sai! Rainy = Mưa 🌧️. Windy = Có gió 🌬️' },
      { q:'"Cold" nghĩa là Lạnh — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Cold = Lạnh 🥶' },
      { q:'"Hot" nghĩa là Lạnh — Đúng hay Sai?', ans:'Sai', ex:'Sai! Hot = Nóng 🥵. Cold = Lạnh 🥶' },
      { q:'"Snowy" nghĩa là Có tuyết — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Snowy = Có tuyết ❄️' },
      { q:'"Cloudy" nghĩa là Nhiều mây — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Cloudy = Nhiều mây ☁️' },
    ],
  },
  {
    topicName: 'Clothes',
    mc: [
      { q:'👕 "Shirt" nghĩa là gì?', opts:['Quần','Áo sơ mi','Váy','Mũ'], ans:'B', ex:'Shirt = Áo sơ mi 👕' },
      { q:'👖 "Pants" nghĩa là gì?', opts:['Áo','Quần dài','Váy','Giày'], ans:'B', ex:'Pants = Quần dài 👖' },
      { q:'👗 "Dress" nghĩa là gì?', opts:['Áo sơ mi','Quần','Váy đầm','Mũ'], ans:'C', ex:'Dress = Váy đầm 👗' },
      { q:'👟 "Shoes" nghĩa là gì?', opts:['Tất','Mũ','Giày','Áo'], ans:'C', ex:'Shoes = Giày 👟' },
      { q:'🧢 "Hat" nghĩa là gì?', opts:['Tất','Găng tay','Mũ','Khăn quàng'], ans:'C', ex:'Hat = Mũ 🧢' },
      { q:'🧤 "Gloves" nghĩa là gì?', opts:['Tất','Găng tay','Mũ','Áo khoác'], ans:'B', ex:'Gloves = Găng tay 🧤' },
      { q:'🧥 "Jacket" nghĩa là gì?', opts:['Áo phông','Áo khoác','Quần','Váy'], ans:'B', ex:'Jacket = Áo khoác 🧥' },
      { q:'🧦 "Socks" nghĩa là gì?', opts:['Giày','Dép','Tất/Vớ','Mũ'], ans:'C', ex:'Socks = Tất/Vớ 🧦' },
    ],
    matching: [
      {left:'Shirt',   right:'Áo sơ mi'},
      {left:'Pants',   right:'Quần dài'},
      {left:'Dress',   right:'Váy đầm'},
      {left:'Shoes',   right:'Giày'},
      {left:'Hat',     right:'Mũ'},
      {left:'Socks',   right:'Tất'},
    ],
    tf: [
      { q:'"Shirt" nghĩa là Áo sơ mi — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Shirt = Áo sơ mi 👕' },
      { q:'"Pants" nghĩa là Váy — Đúng hay Sai?', ans:'Sai', ex:'Sai! Pants = Quần 👖. Dress = Váy đầm 👗' },
      { q:'"Shoes" nghĩa là Giày — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Shoes = Giày 👟' },
      { q:'"Hat" nghĩa là Găng tay — Đúng hay Sai?', ans:'Sai', ex:'Sai! Hat = Mũ 🧢. Gloves = Găng tay 🧤' },
      { q:'"Jacket" nghĩa là Áo khoác — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Jacket = Áo khoác 🧥' },
      { q:'"Socks" nghĩa là Tất — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Socks = Tất/Vớ 🧦' },
    ],
  },
  {
    topicName: 'Places',
    mc: [
      { q:'🏫 "School" nghĩa là gì?', opts:['Bệnh viện','Trường học','Công viên','Thư viện'], ans:'B', ex:'School = Trường học 🏫' },
      { q:'🌳 "Park" nghĩa là gì?', opts:['Vườn thú','Bệnh viện','Công viên','Bãi biển'], ans:'C', ex:'Park = Công viên 🌳' },
      { q:'🏥 "Hospital" nghĩa là gì?', opts:['Trường học','Bệnh viện','Nhà hàng','Thư viện'], ans:'B', ex:'Hospital = Bệnh viện 🏥' },
      { q:'🦁 "Zoo" nghĩa là gì?', opts:['Công viên','Bệnh viện','Vườn thú','Bãi biển'], ans:'C', ex:'Zoo = Vườn thú 🦁' },
      { q:'🏖️ "Beach" nghĩa là gì?', opts:['Núi','Biển/Bãi biển','Công viên','Trang trại'], ans:'B', ex:'Beach = Bãi biển 🏖️' },
      { q:'🏠 "Home" nghĩa là gì?', opts:['Trường học','Nhà hàng','Nhà/Gia đình','Thư viện'], ans:'C', ex:'Home = Nhà 🏠' },
      { q:'📚 "Library" nghĩa là gì?', opts:['Nhà hàng','Bệnh viện','Công viên','Thư viện'], ans:'D', ex:'Library = Thư viện 📚' },
      { q:'🏔️ "Mountain" nghĩa là gì?', opts:['Biển','Công viên','Núi','Trang trại'], ans:'C', ex:'Mountain = Núi 🏔️' },
    ],
    matching: [
      {left:'School',   right:'Trường học'},
      {left:'Park',     right:'Công viên'},
      {left:'Hospital', right:'Bệnh viện'},
      {left:'Zoo',      right:'Vườn thú'},
      {left:'Beach',    right:'Bãi biển'},
      {left:'Home',     right:'Nhà'},
    ],
    tf: [
      { q:'"School" nghĩa là Trường học — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! School = Trường học 🏫' },
      { q:'"Hospital" nghĩa là Trường học — Đúng hay Sai?', ans:'Sai', ex:'Sai! Hospital = Bệnh viện 🏥. School = Trường học 🏫' },
      { q:'"Zoo" là nơi có nhiều con vật — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Zoo = Vườn thú 🦁' },
      { q:'"Beach" nghĩa là Núi — Đúng hay Sai?', ans:'Sai', ex:'Sai! Beach = Bãi biển 🏖️. Mountain = Núi 🏔️' },
      { q:'"Library" là nơi đọc sách — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Library = Thư viện 📚' },
      { q:'"Home" nghĩa là Nhà — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Home = Nhà 🏠' },
    ],
  },
  {
    topicName: 'Transportation',
    mc: [
      { q:'🚌 "Bus" nghĩa là gì?', opts:['Xe hơi','Xe buýt','Tàu lửa','Máy bay'], ans:'B', ex:'Bus = Xe buýt 🚌' },
      { q:'✈️ "Plane" nghĩa là gì?', opts:['Tàu lửa','Xe buýt','Máy bay','Tàu thuyền'], ans:'C', ex:'Plane = Máy bay ✈️' },
      { q:'🚢 "Boat" nghĩa là gì?', opts:['Xe đạp','Máy bay','Xe máy','Tàu thuyền'], ans:'D', ex:'Boat = Tàu thuyền 🚢' },
      { q:'🚂 "Train" nghĩa là gì?', opts:['Xe buýt','Tàu lửa','Xe đạp','Máy bay'], ans:'B', ex:'Train = Tàu lửa 🚂' },
      { q:'🚲 "Bicycle" nghĩa là gì?', opts:['Xe máy','Xe hơi','Xe đạp','Tàu lửa'], ans:'C', ex:'Bicycle = Xe đạp 🚲' },
      { q:'🚁 "Helicopter" nghĩa là gì?', opts:['Máy bay','Trực thăng','Tàu','Xe buýt'], ans:'B', ex:'Helicopter = Trực thăng 🚁' },
      { q:'🚗 "Car" nghĩa là gì?', opts:['Xe buýt','Xe máy','Xe hơi','Xe đạp'], ans:'C', ex:'Car = Xe hơi 🚗' },
      { q:'🛵 "Motorbike" nghĩa là gì?', opts:['Xe đạp','Xe máy','Xe hơi','Xe buýt'], ans:'B', ex:'Motorbike = Xe máy 🛵' },
    ],
    matching: [
      {left:'Bus',     right:'Xe buýt'},
      {left:'Car',     right:'Xe hơi'},
      {left:'Plane',   right:'Máy bay'},
      {left:'Train',   right:'Tàu lửa'},
      {left:'Bicycle', right:'Xe đạp'},
      {left:'Boat',    right:'Tàu thuyền'},
    ],
    tf: [
      { q:'"Bus" nghĩa là Xe buýt — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Bus = Xe buýt 🚌' },
      { q:'"Plane" nghĩa là Tàu lửa — Đúng hay Sai?', ans:'Sai', ex:'Sai! Plane = Máy bay ✈️. Train = Tàu lửa 🚂' },
      { q:'"Bicycle" nghĩa là Xe đạp — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Bicycle = Xe đạp 🚲' },
      { q:'"Helicopter" là một loại phương tiện bay — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Helicopter = Trực thăng 🚁' },
      { q:'"Boat" nghĩa là Xe máy — Đúng hay Sai?', ans:'Sai', ex:'Sai! Boat = Tàu thuyền 🚢. Motorbike = Xe máy 🛵' },
      { q:'"Car" nghĩa là Xe hơi — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Car = Xe hơi 🚗' },
    ],
  },
  {
    topicName: 'Position Words',
    mc: [
      { q:'📦 Quả bóng ở TRÊN hộp. The ball is ___ the box.', opts:['Under','On','Behind','Next to'], ans:'B', ex:'On = Trên (tiếp xúc bề mặt) 📦' },
      { q:'📦 Quả bóng ở DƯỚI hộp. The ball is ___ the box.', opts:['On','Next to','Under','Behind'], ans:'C', ex:'Under = Dưới 👇' },
      { q:'🚗🚗 Xe đỏ ở BÊN CẠNH xe xanh. The red car is ___ the blue car.', opts:['Behind','Under','On','Next to'], ans:'D', ex:'Next to = Bên cạnh 👐' },
      { q:'🚪 Con mèo ở PHÍA SAU cửa. The cat is ___ the door.', opts:['In front of','Behind','On','Under'], ans:'B', ex:'Behind = Phía sau 🔙' },
      { q:'🏠 Cây ở PHÍA TRƯỚC nhà. The tree is ___ the house.', opts:['Behind','Under','In front of','On'], ans:'C', ex:'In front of = Phía trước 🔛' },
      { q:'📦 Quà ở BÊN TRONG hộp. The gift is ___ the box.', opts:['Outside','On','Behind','Inside'], ans:'D', ex:'Inside = Bên trong 📦' },
      { q:'🐱 Con mèo ở BÊN NGOÀI nhà. The cat is ___ the house.', opts:['Inside','On','Outside','Under'], ans:'C', ex:'Outside = Bên ngoài 🚪' },
      { q:'↔️ "Between" nghĩa là gì?', opts:['Trên','Dưới','Ở giữa (hai vật)','Bên cạnh'], ans:'C', ex:'Between = Ở giữa hai vật ↔️' },
    ],
    matching: [
      {left:'On',          right:'Trên'},
      {left:'Under',       right:'Dưới'},
      {left:'Next to',     right:'Bên cạnh'},
      {left:'Behind',      right:'Phía sau'},
      {left:'In front of', right:'Phía trước'},
      {left:'Inside',      right:'Bên trong'},
    ],
    tf: [
      { q:'"On" nghĩa là Trên — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! On = Trên/Ở trên 📦' },
      { q:'"Under" nghĩa là Trên — Đúng hay Sai?', ans:'Sai', ex:'Sai! Under = Dưới 👇. On = Trên ☝️' },
      { q:'"Behind" nghĩa là Phía sau — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Behind = Phía sau 🔙' },
      { q:'"Inside" nghĩa là Bên ngoài — Đúng hay Sai?', ans:'Sai', ex:'Sai! Inside = Bên trong 📦. Outside = Bên ngoài' },
      { q:'"Next to" nghĩa là Bên cạnh — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Next to = Bên cạnh 👐' },
      { q:'"In front of" nghĩa là Phía trước — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! In front of = Phía trước 🔛' },
    ],
  },
  {
    topicName: 'Daily Routine',
    mc: [
      { q:'⏰ Buổi sáng con làm gì đầu tiên? Wake ___ !', opts:['down','in','up','out'], ans:'C', ex:'Wake up = Thức dậy ⏰' },
      { q:'🪥 "Brush teeth" nghĩa là gì?', opts:['Rửa mặt','Đánh răng','Tắm','Ăn sáng'], ans:'B', ex:'Brush teeth = Đánh răng 🪥' },
      { q:'🌊 "Wash face" nghĩa là gì?', opts:['Đánh răng','Tắm','Rửa mặt','Đi ngủ'], ans:'C', ex:'Wash face = Rửa mặt 🌊' },
      { q:'🍳 "Eat breakfast" nghĩa là gì?', opts:['Ăn trưa','Ăn tối','Ăn sáng','Uống sữa'], ans:'C', ex:'Eat breakfast = Ăn sáng 🍳' },
      { q:'🏫 "Go to school" nghĩa là gì?', opts:['Ở nhà','Đi chơi','Đi học','Đi ngủ'], ans:'C', ex:'Go to school = Đi học 🏫' },
      { q:'🛁 "Take a bath" nghĩa là gì?', opts:['Rửa mặt','Đánh răng','Tắm','Đi ngủ'], ans:'C', ex:'Take a bath = Tắm 🛁' },
      { q:'🌙 "Sleep" nghĩa là gì?', opts:['Thức dậy','Chơi','Ăn tối','Ngủ'], ans:'D', ex:'Sleep = Ngủ 😴 Good night! 🌙' },
      { q:'📚 "Study" nghĩa là gì?', opts:['Chơi','Học bài','Ăn','Ngủ'], ans:'B', ex:'Study = Học bài 📚' },
    ],
    matching: [
      {left:'Wake up',       right:'Thức dậy'},
      {left:'Brush teeth',   right:'Đánh răng'},
      {left:'Eat breakfast', right:'Ăn sáng'},
      {left:'Go to school',  right:'Đi học'},
      {left:'Take a bath',   right:'Tắm'},
      {left:'Sleep',         right:'Ngủ'},
    ],
    tf: [
      { q:'"Wake up" nghĩa là Thức dậy — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Wake up = Thức dậy ⏰' },
      { q:'"Brush teeth" nghĩa là Rửa mặt — Đúng hay Sai?', ans:'Sai', ex:'Sai! Brush teeth = Đánh răng 🪥. Wash face = Rửa mặt' },
      { q:'"Eat breakfast" là ăn buổi sáng — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Eat breakfast = Ăn sáng 🍳' },
      { q:'"Sleep" nghĩa là Thức dậy — Đúng hay Sai?', ans:'Sai', ex:'Sai! Sleep = Ngủ 😴. Wake up = Thức dậy ⏰' },
      { q:'"Go to school" nghĩa là Đi học — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Go to school = Đi học 🏫' },
      { q:'"Take a bath" nghĩa là Tắm — Đúng hay Sai?', ans:'Đúng', ex:'Đúng! Take a bath = Tắm 🛁' },
    ],
  },
]

// ─── Insert into DB ────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding English course questions...\n')

  const course = await p.course.findUnique({
    where: { code: 'ENGLISH-STARTER' },
    include: { subjects: { orderBy: { order: 'asc' } } },
  })
  if (!course) { console.error('❌ ENGLISH-STARTER course not found!'); return }

  let totalCreated = 0

  for (let i = 0; i < course.subjects.length; i++) {
    const subject = course.subjects[i]
    const topicData = TOPICS[i]
    if (!topicData) continue

    // Skip if already has questions
    const existing = await p.question.count({ where: { subjectId: subject.id } })
    if (existing > 0) {
      console.log(`⏭️  Skipped (has ${existing} questions): ${subject.name}`)
      continue
    }

    let order = 1
    const questions = []

    // Multiple Choice (1-8)
    for (const mc of topicData.mc) {
      questions.push({
        subjectId: subject.id,
        order: order++,
        questionType: 'MULTIPLE_CHOICE',
        content: mc.q,
        options: [
          { key: 'A', text: mc.opts[0] },
          { key: 'B', text: mc.opts[1] },
          { key: 'C', text: mc.opts[2] },
          { key: 'D', text: mc.opts[3] },
        ],
        correctAnswer: mc.ans,
        explanation: mc.ex,
        points: 1,
      })
    }

    // Matching (9-14) — 1 question with 6 pairs
    const matchPairs = topicData.matching
    questions.push({
      subjectId: subject.id,
      order: order++,
      questionType: 'MATCHING',
      content: `🔗 Nối từ tiếng Anh với nghĩa tiếng Việt cho đúng nhé!`,
      options: matchPairs,
      correctAnswer: JSON.stringify(matchPairs),
      explanation: 'Nối đúng hết = giỏi lắm! ⭐',
      points: 3,
    })
    // Add 5 individual matching as simple MC (9-14)
    for (let m = 0; m < Math.min(5, matchPairs.length); m++) {
      const pair = matchPairs[m]
      const wrong = matchPairs.filter((_, idx) => idx !== m).slice(0, 3).map(p => p.right)
      const allOpts = [pair.right, ...wrong].sort(() => Math.random() - 0.5)
      questions.push({
        subjectId: subject.id,
        order: order++,
        questionType: 'MULTIPLE_CHOICE',
        content: `🔗 "${pair.left}" nghĩa là gì?`,
        options: allOpts.map((t, idx) => ({ key: String.fromCharCode(65+idx), text: t })),
        correctAnswer: String.fromCharCode(65 + allOpts.indexOf(pair.right)),
        explanation: `${pair.left} = ${pair.right} ⭐`,
        points: 1,
      })
    }

    // True/False (15-20)
    for (const tf of topicData.tf) {
      questions.push({
        subjectId: subject.id,
        order: order++,
        questionType: 'TRUE_FALSE',
        content: tf.q,
        options: [
          { key: 'Đúng', text: 'Đúng ✅' },
          { key: 'Sai', text: 'Sai ❌' },
        ],
        correctAnswer: tf.ans,
        explanation: tf.ex,
        points: 1,
      })
    }

    // Insert all questions for this topic
    for (const q of questions) {
      await p.question.create({ data: { ...q, options: q.options } })
    }

    console.log(`✅ Topic ${i+1}/20: ${subject.name} — ${questions.length} câu`)
    totalCreated += questions.length
  }

  console.log(`\n🎉 Done! Total: ${totalCreated} câu hỏi đã tạo`)
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1) })
  .finally(() => p.$disconnect())
