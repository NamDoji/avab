# Chuyên đề 1: Getting Started — Nhập môn C++

## 🎯 Mục tiêu
- Cài đặt và chạy được chương trình C++ đầu tiên
- Hiểu cấu trúc cơ bản của một chương trình C++
- Sử dụng `cin`, `cout` để nhập/xuất dữ liệu
- Khai báo và sử dụng biến với các kiểu dữ liệu cơ bản
- Hiểu khái niệm overflow và cách chọn kiểu dữ liệu phù hợp

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>   // Include everything (competitive programming shortcut)
using namespace std;       // Don't need to write std:: before everything

int main() {
    // ===== HELLO WORLD =====
    cout << "Hello, World!" << endl;  // Print text + newline
    cout << "Xin chao Viet Nam!" << "\n";  // '\n' is faster than endl

    // ===== VARIABLES & DATA TYPES =====
    int a = 10;             // Integer: -2B to 2B (32-bit)
    long long b = 1e18;     // Big integer: use for large numbers
    double pi = 3.14159;    // Decimal number
    char grade = 'A';       // Single character
    string name = "Alice";  // Text
    bool isPrime = true;    // True or false

    // ===== INPUT =====
    int x, y;
    cout << "Enter two numbers: ";
    cin >> x >> y;          // Read two integers

    string word;
    cin >> word;            // Read one word (stops at space)

    string line;
    getline(cin, line);     // Read whole line including spaces

    // ===== OUTPUT =====
    cout << "Sum = " << x + y << "\n";
    cout << "Name: " << name << ", Grade: " << grade << "\n";

    // ===== ARITHMETIC =====
    cout << 10 / 3 << "\n";    // Integer division = 3
    cout << 10 % 3 << "\n";    // Modulo (remainder) = 1
    cout << 10.0 / 3 << "\n";  // Float division = 3.333...

    // ===== TYPE CASTING =====
    int p = 5, q = 2;
    cout << (double)p / q << "\n";  // Cast to double before dividing = 2.5

    return 0;
}
```

**Sample Input:**
```
3 7
```

**Sample Output:**
```
Hello, World!
Xin chao Viet Nam!
Sum = 10
Name: Alice, Grade: A
3
1
3.33333
2.5
```

---

### Bảng kiểu dữ liệu quan trọng

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // Data type sizes and ranges
    cout << "int: " << sizeof(int) << " bytes, max = " << INT_MAX << "\n";
    // int: 4 bytes, max = 2147483647 (~2 billion)

    cout << "long long: " << sizeof(long long) << " bytes, max = " << LLONG_MAX << "\n";
    // long long: 8 bytes, max = 9223372036854775807 (~9 * 10^18)

    // WARNING: Overflow example
    int big = 1000000000;
    cout << big * big << "\n";       // WRONG! Overflow: -1486618624
    cout << (long long)big * big << "\n"; // CORRECT: 1000000000000000000

    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### Cấu trúc chương trình C++
```
#include → nạp thư viện
using namespace std → dùng tên tắt
int main() → hàm chính, chương trình bắt đầu từ đây
return 0 → kết thúc chương trình thành công
```

### Các kiểu dữ liệu hay dùng trong lập trình thi đấu

| Kiểu | Kích thước | Phạm vi | Dùng khi |
|------|-----------|---------|---------|
| `int` | 4 bytes | ±2×10⁹ | Số nguyên nhỏ |
| `long long` | 8 bytes | ±9×10¹⁸ | Số nguyên lớn |
| `double` | 8 bytes | 15-16 chữ số | Số thực |
| `char` | 1 byte | 0-255 | Ký tự đơn |
| `string` | động | - | Chuỗi ký tự |
| `bool` | 1 byte | true/false | Điều kiện |

### Quy tắc vàng: Khi nào dùng `long long`?
- Kết quả có thể vượt quá 2×10⁹ → dùng `long long`
- Trong competitive programming: **nghi ngờ thì dùng `long long`**

---

## 📊 Độ phức tạp (Time & Space Complexity)

- **I/O Operations:** O(1) mỗi lần đọc/ghi
- **Tip:** Dùng `"\n"` thay vì `endl` — nhanh hơn nhiều vì `endl` flush buffer
- **Tip:** `ios::sync_with_stdio(false); cin.tie(0);` — tăng tốc I/O lên 5-10x

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // SPEED BOOST for competitive programming
    ios::sync_with_stdio(false);
    cin.tie(0);

    int n;
    cin >> n;
    cout << n << "\n";
    return 0;
}
```

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Tổng hai số
**Đề bài:** Nhập hai số nguyên A và B (1 ≤ A, B ≤ 10⁹). In ra tổng của chúng.

**Input mẫu:**
```
123456789 987654321
```

**Output mẫu:**
```
1111111110
```

**Gợi ý:** Kết quả có thể lên tới 2×10⁹ — dùng `long long`!

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Đổi đơn vị
**Đề bài:** Nhập số giây T (1 ≤ T ≤ 10⁶). In ra số giờ, phút, giây tương ứng.

**Input mẫu:**
```
3661
```

**Output mẫu:**
```
1 1 1
```
(1 giờ 1 phút 1 giây)

**Gợi ý:** Dùng phép chia nguyên `/` và lấy dư `%`

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    int hours = t / 3600;
    int minutes = (t % 3600) / 60;
    int seconds = t % 60;
    cout << hours << " " << minutes << " " << seconds << "\n";
    return 0;
}
```

---

### Bài 3 (Khó hơn): Hoán vị ba số
**Đề bài:** Nhập 3 số A, B, C. Gán A = B, B = C, C = A (hoán vị vòng tròn). In kết quả.

**Input mẫu:**
```
1 2 3
```

**Output mẫu:**
```
2 3 1
```

**Gợi ý:** Cần lưu giá trị A trước khi ghi đè!

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    int temp = a;  // Save A first!
    a = b;
    b = c;
    c = temp;
    cout << a << " " << b << " " << c << "\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Câu đố:** "Ai biết máy tính lưu số 1 tỷ tốn bao nhiêu bytes?" → Thảo luận → 4 bytes (int)
**Câu hỏi nhanh:** Hỏi học sinh đã từng dùng ngôn ngữ lập trình nào chưa?

### Theory (10 phút)
- Vẽ sơ đồ: **Chương trình = Input → Xử lý → Output**
- Giải thích bộ nhớ: "Biến giống như hộp đựng đồ, kiểu dữ liệu là kích thước hộp"
- Demo trực tiếp: Chạy Hello World trên màn hình chiếu
- Giải thích overflow bằng ví dụ: đồng hồ quay quá 12 giờ về lại 0

### Worked Example (10 phút)
Viết chương trình tính diện tích hình chữ nhật cùng nhau:
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    double width, height;
    cout << "Width: "; cin >> width;
    cout << "Height: "; cin >> height;
    cout << "Area = " << width * height << "\n";
    return 0;
}
```
Hỏi: "Điều gì xảy ra nếu nhập chữ thay vì số?"

### Live Coding (10 phút)
Thử thách: Học sinh tự gõ chương trình tính BMI:
- Nhập cân nặng (kg) và chiều cao (m)
- Tính BMI = cân nặng / (chiều cao × chiều cao)
- In kết quả với 2 chữ số thập phân: `cout << fixed << setprecision(2) << bmi`

### Practice (10 phút)
Làm Bài tập 1 và 2 ở trên. GV đi vòng hỗ trợ từng bàn.

---

## 📝 Homework (5 bài)

1. **Tính chu vi và diện tích hình tròn** — Nhập R, tính C = 2πR và S = πR² (dùng `acos(-1.0)` để lấy π)
2. **Chuyển đổi nhiệt độ** — Nhập °C, in °F = C × 9/5 + 32
3. **Tính tiền lẻ** — Nhập số tiền, in số tờ 100k/50k/20k/10k/5k/2k/1k
4. **Tốc độ trung bình** — Nhập quãng đường (km) và thời gian (giờ phút giây), in tốc độ km/h
5. **In tam giác số** — Nhập N, in N dòng: dòng i in số i (từ 1 đến N)

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Forgot to initialize variable
int x;
cout << x;  // Undefined behavior! Random number

// ✅ Fix:
int x = 0;

// ❌ MISTAKE 2: Integer overflow
int a = 1000000, b = 1000000;
cout << a * b;  // Overflow! Answer is wrong

// ✅ Fix:
long long a = 1000000, b = 1000000;
cout << a * b;  // 1000000000000

// ❌ MISTAKE 3: Integer division when you want float
int a = 5, b = 2;
cout << a / b;  // Prints 2, not 2.5!

// ✅ Fix:
cout << (double)a / b;  // 2.5

// ❌ MISTAKE 4: cin after getline
int n;
cin >> n;
string line;
getline(cin, line);  // BUG: reads the newline from after n!

// ✅ Fix:
cin >> n;
cin.ignore();  // Consume the newline
getline(cin, line);
```

---

## 🤖 AI Coach

**Hỏi AI khi bị stuck:**
- "Tại sao chương trình in ra số âm khi nhân hai số lớn?"
- "Sự khác biệt giữa `int` và `long long` là gì?"
- "Làm sao để đọc cả dòng có khoảng trắng?"
- "Tại sao `5/2` ra `2` chứ không phải `2.5`?"
- "Viết chương trình C++ tính [bài toán X] cho tôi xem và giải thích"

**Prompt mẫu:** "Tôi đang học C++ lần đầu. Giải thích [khái niệm] bằng ví dụ đơn giản và code ngắn."

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Hello Coder:** Chạy được Hello World và đọc được input/output
**🥈 Silver — Variable Master:** Dùng đúng kiểu dữ liệu, tránh overflow
**🥇 Gold — I/O Pro:** Viết chương trình hoàn chỉnh nhập/xử lý/xuất, tối ưu I/O với `ios::sync_with_stdio(false)`
**💎 Diamond — Bonus:** Solve 3 bài thực hành + submit lên Codeforces/VNOJ
