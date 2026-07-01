# Chuyên đề 2: If/Else/Switch — Rẽ nhánh và Điều kiện

## 🎯 Mục tiêu
- Sử dụng `if`, `else if`, `else` để rẽ nhánh chương trình
- Hiểu và dùng các toán tử logic: `&&`, `||`, `!`
- Dùng `switch-case` cho các trường hợp rời rạc
- Áp dụng toán tử tam nguyên `?:` (ternary operator)
- Giải các bài toán phân loại, so sánh điển hình

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // ===== BASIC IF-ELSE =====
    int score;
    cin >> score;

    if (score >= 90) {
        cout << "Excellent!\n";
    } else if (score >= 70) {
        cout << "Good\n";
    } else if (score >= 50) {
        cout << "Pass\n";
    } else {
        cout << "Fail\n";
    }

    // ===== LOGICAL OPERATORS =====
    int age = 15;
    bool hasTicket = true;

    // AND: both must be true
    if (age >= 12 && hasTicket) {
        cout << "Can enter cinema\n";
    }

    // OR: at least one must be true
    if (age < 6 || age > 65) {
        cout << "Free ticket!\n";
    }

    // NOT: flip true/false
    if (!hasTicket) {
        cout << "Buy a ticket first!\n";
    }

    // ===== COMPARISON OPERATORS =====
    // ==  equal to
    // !=  not equal
    // >   greater than
    // <   less than
    // >=  greater or equal
    // <=  less or equal

    // ===== TERNARY OPERATOR =====
    int a = 5, b = 8;
    int maxVal = (a > b) ? a : b;  // If a>b, use a; else use b
    cout << "Max = " << maxVal << "\n";  // 8

    // ===== SWITCH CASE =====
    int day;
    cin >> day;

    switch (day) {
        case 1: cout << "Monday\n";    break;
        case 2: cout << "Tuesday\n";   break;
        case 3: cout << "Wednesday\n"; break;
        case 4: cout << "Thursday\n";  break;
        case 5: cout << "Friday\n";    break;
        case 6: cout << "Saturday\n";  break;
        case 7: cout << "Sunday\n";    break;
        default: cout << "Invalid day!\n";
    }

    return 0;
}
```

**Sample Input:**
```
85
3
```

**Sample Output:**
```
Good
Can enter cinema
Max = 8
Wednesday
```

---

### Ví dụ nâng cao: Bài toán tam giác

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    // Check if valid triangle (sum of any 2 sides > 3rd side)
    if (a + b <= c || a + c <= b || b + c <= a) {
        cout << "Not a triangle\n";
        return 0;
    }

    // Check triangle type
    if (a == b && b == c) {
        cout << "Equilateral triangle\n";  // Tam giác đều
    } else if (a == b || b == c || a == c) {
        cout << "Isosceles triangle\n";    // Tam giác cân
    } else {
        cout << "Scalene triangle\n";      // Tam giác thường
    }

    // Check right triangle using Pythagorean theorem
    // Sort so c is the largest
    int sides[3] = {a, b, c};
    sort(sides, sides + 3);  // Ascending order
    if (sides[0]*sides[0] + sides[1]*sides[1] == sides[2]*sides[2]) {
        cout << "And it's RIGHT-angled!\n";
    }

    return 0;
}
```

**Sample Input:**
```
3 4 5
```

**Sample Output:**
```
Scalene triangle
And it's RIGHT-angled!
```

---

## 💡 Khái niệm & Thuật toán

### Bảng giá trị logic (Truth Table)

| A | B | A && B | A \|\| B | !A |
|---|---|--------|---------|-----|
| T | T | T | T | F |
| T | F | F | T | F |
| F | T | F | T | T |
| F | F | F | F | T |

### Quy tắc De Morgan
```
!(A && B)  ≡  !A || !B
!(A || B)  ≡  !A && !B
```

**Ví dụ thực tế:**
```cpp
// "Không phải (nắng VÀ nóng)" = "Không nắng HOẶC không nóng"
bool sunny = true, hot = false;
bool notBothSunnyAndHot = !(sunny && hot);  // true
bool eitherNotSunnyOrNotHot = !sunny || !hot;  // true
// Kết quả giống nhau!
```

### Short-Circuit Evaluation
C++ dừng kiểm tra ngay khi đã biết kết quả:
```cpp
int arr[5] = {1, 2, 3, 4, 5};
int i = 10;

// SAFE: Checks i < 5 first; if false, arr[i] is NOT evaluated
if (i < 5 && arr[i] > 0) {
    cout << "Found\n";
}

// DANGEROUS: arr[i] evaluated even when i >= 5 → crash!
if (arr[i] > 0 && i < 5) {
    cout << "Found\n";
}
```

---

## 📊 Độ phức tạp (Time & Space Complexity)

- **Mỗi câu lệnh if/else:** O(1) — thực thi tức thì
- **Switch vs if-else:** Switch thường nhanh hơn với nhiều trường hợp rời rạc
- **Space:** O(1) — không dùng thêm bộ nhớ

**Khi nào dùng Switch vs If-Else?**
- `switch`: khi kiểm tra giá trị bằng nhau của **một biến** (int, char)
- `if-else`: khi điều kiện phức tạp, so sánh phạm vi (range), nhiều biến

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Số chẵn lẻ và dương âm
**Đề bài:** Nhập số nguyên N. In:
- "EVEN POSITIVE" nếu N > 0 và chẵn
- "ODD POSITIVE" nếu N > 0 và lẻ
- "EVEN NEGATIVE" nếu N < 0 và chẵn
- "ODD NEGATIVE" nếu N < 0 và lẻ
- "ZERO" nếu N = 0

**Input mẫu:**
```
-6
```
**Output mẫu:**
```
EVEN NEGATIVE
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    if (n == 0) {
        cout << "ZERO\n";
    } else {
        // Determine positive or negative
        string sign = (n > 0) ? "POSITIVE" : "NEGATIVE";
        // Determine even or odd (use abs() to handle negatives)
        string parity = (n % 2 == 0) ? "EVEN" : "ODD";
        cout << parity << " " << sign << "\n";
    }
    return 0;
}
```

---

### Bài 2 (Trung bình): Máy tính đơn giản
**Đề bài:** Nhập hai số thực A, B và ký tự phép tính ('+', '-', '*', '/'). In kết quả. Nếu chia cho 0, in "Error: Division by zero".

**Input mẫu:**
```
10 3 /
```
**Output mẫu:**
```
3.33
```

**Gợi ý:** Dùng `switch` trên ký tự phép tính. Dùng `fixed << setprecision(2)` để in 2 số thập phân.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    double a, b;
    char op;
    cin >> a >> b >> op;

    cout << fixed << setprecision(2);

    switch (op) {
        case '+': cout << a + b << "\n"; break;
        case '-': cout << a - b << "\n"; break;
        case '*': cout << a * b << "\n"; break;
        case '/':
            if (b == 0) cout << "Error: Division by zero\n";
            else cout << a / b << "\n";
            break;
        default:
            cout << "Unknown operator\n";
    }
    return 0;
}
```

---

### Bài 3 (Khó): Phân loại năm học
**Đề bài:** Nhập điểm trung bình (0.0–10.0) và số ngày vắng (0–N). Phân loại:
- **Giỏi:** TB ≥ 8.0 VÀ vắng ≤ 5
- **Khá:** TB ≥ 6.5 VÀ vắng ≤ 10
- **Trung bình:** TB ≥ 5.0
- **Yếu:** Còn lại

**Input mẫu:**
```
7.5 8
```
**Output mẫu:**
```
Kha
```

**Gợi ý:** Kiểm tra điều kiện kết hợp với `&&`. Thứ tự kiểm tra từ tốt nhất xuống.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    double gpa;
    int absences;
    cin >> gpa >> absences;

    if (gpa >= 8.0 && absences <= 5) {
        cout << "Gioi\n";
    } else if (gpa >= 6.5 && absences <= 10) {
        cout << "Kha\n";
    } else if (gpa >= 5.0) {
        cout << "Trung binh\n";
    } else {
        cout << "Yeu\n";
    }
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Trò chơi:** "Đúng hay Sai?" — GV đọc biểu thức logic, học sinh giơ tay:
- `5 > 3 && 2 < 1` → Sai (vì 2 < 1 sai)
- `5 > 3 || 2 < 1` → Đúng (vì 5 > 3 đúng)
- `!(4 == 4)` → Sai (vì 4 == 4 đúng, NOT đúng = sai)

### Theory (10 phút)
- Vẽ flowchart của if-else lên bảng: ◇ = quyết định, □ = hành động
- Giải thích short-circuit với ví dụ thực: "Trước khi mở cửa (arr[i]), phải kiểm tra cửa có tồn tại không (i < 5)"
- Phân biệt `=` (gán) và `==` (so sánh) — lỗi kinh điển

### Worked Example (10 phút)
Cùng viết chương trình phân loại tam giác (xem code ở trên). GV vẽ flowchart từng bước.

### Live Coding (10 phút)
**Thử thách:** Viết chương trình "Người gác cổng rạp chiếu phim":
- Tuổi < 13: "No entry - too young"
- Tuổi 13-17: Cần phụ huynh đi cùng: "Need parent accompaniment"
- Tuổi ≥ 18: "Welcome!"
- Có thẻ VIP: Bất kể tuổi nào → "Welcome VIP!"

### Practice (10 phút)
Làm Bài tập 1 và 2. Ai xong sớm thử Bài 3.

---

## 📝 Homework (5 bài)

1. **FizzBuzz** — Nhập N, nếu chia hết 3 in "Fizz", chia hết 5 in "Buzz", chia hết cả hai in "FizzBuzz", còn lại in N
2. **Tháng trong năm** — Nhập số tháng (1-12), in số ngày của tháng đó (coi tháng 2 có 28 ngày)
3. **Giải phương trình bậc 2** — Nhập a, b, c (ax²+bx+c=0). In nghiệm hoặc "Vo nghiem" / "Vo so nghiem"
4. **Đơn vị đo** — Nhập số và đơn vị ('k' = km, 'm' = mile, 'y' = yard). Đổi ra mét
5. **Bảng lương** — Nhập số giờ làm (≤160h lương cơ bản 50k/h; vượt tính 75k/h). Tính tổng lương

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Assignment instead of comparison
int x = 5;
if (x = 10) {  // BUG: assigns 10 to x, always true!
    cout << "x is 10\n";
}
// ✅ Fix:
if (x == 10) { ... }

// ❌ MISTAKE 2: Floating point comparison
double a = 0.1 + 0.2;
if (a == 0.3) {  // BUG: 0.1+0.2 = 0.30000000000000004 ≠ 0.3!
    cout << "Equal\n";
}
// ✅ Fix:
if (abs(a - 0.3) < 1e-9) {
    cout << "Equal\n";
}

// ❌ MISTAKE 3: Missing break in switch
int x = 2;
switch (x) {
    case 1: cout << "one\n";
    case 2: cout << "two\n";   // Prints "two" AND "three" (falls through!)
    case 3: cout << "three\n";
}
// ✅ Fix: Add break after each case

// ❌ MISTAKE 4: Wrong operator precedence
if (a == 1 || b == 2 && c == 3) {
    // && binds tighter than ||
    // Parsed as: a==1 || (b==2 && c==3)
    // May not be what you want!
}
// ✅ Fix: Use parentheses
if ((a == 1 || b == 2) && c == 3) { ... }
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Tại sao `if (x = 5)` không báo lỗi mà vẫn chạy sai?"
- "Giải thích short-circuit evaluation bằng ví dụ thực tế"
- "Khi nào nên dùng switch thay vì if-else?"
- "Làm sao so sánh hai số thực (float/double) chính xác?"
- "Debug giúp tôi: [paste code bị sai]"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Decision Maker:** Viết đúng if-else cơ bản, phân biệt `=` và `==`
**🥈 Silver — Logic Master:** Dùng được `&&`, `||`, `!` kết hợp, tránh lỗi float comparison
**🥇 Gold — Branch Expert:** Dùng switch, ternary, giải bài toán phân loại phức tạp
**💎 Diamond — Bonus:** Giải bài phương trình bậc 2 đầy đủ mọi trường hợp + submit Online Judge
