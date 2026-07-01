# Chuyên đề 3: Loop — Vòng lặp và In Pattern

## 🎯 Mục tiêu
- Sử dụng thành thạo vòng lặp `for`, `while`, `do-while`
- Hiểu vòng lặp lồng nhau (nested loop) và ứng dụng
- In các pattern (tam giác, kim cương, bàn cờ)
- Dùng `break` và `continue` hợp lý
- Giải bài toán số học với vòng lặp

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // ===== FOR LOOP =====
    // for (init; condition; update)
    for (int i = 1; i <= 5; i++) {
        cout << i << " ";  // 1 2 3 4 5
    }
    cout << "\n";

    // Count down
    for (int i = 10; i >= 1; i--) {
        cout << i << " ";  // 10 9 8 ... 1
    }
    cout << "\n";

    // Step by 2
    for (int i = 0; i <= 10; i += 2) {
        cout << i << " ";  // 0 2 4 6 8 10
    }
    cout << "\n";

    // ===== WHILE LOOP =====
    int n = 100;
    while (n > 1) {
        if (n % 2 == 0) n /= 2;  // Even: divide by 2
        else n = 3 * n + 1;      // Odd: Collatz sequence
        cout << n << " ";
    }
    cout << "\n";

    // ===== DO-WHILE (executes at least once) =====
    int input;
    do {
        cout << "Enter positive number: ";
        cin >> input;
    } while (input <= 0);  // Keep asking until positive

    // ===== BREAK AND CONTINUE =====
    for (int i = 1; i <= 10; i++) {
        if (i == 7) break;      // Stop loop when i = 7
        if (i % 2 == 0) continue;  // Skip even numbers
        cout << i << " ";       // Prints: 1 3 5
    }
    cout << "\n";

    return 0;
}
```

---

### Pattern Printing — In Hình với Vòng Lặp Lồng Nhau

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;  // n = 5

    // Pattern 1: Right Triangle (tam giác vuông)
    cout << "=== Right Triangle ===\n";
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << "*";
        }
        cout << "\n";
    }
    // *
    // **
    // ***
    // ****
    // *****

    // Pattern 2: Inverted Triangle (tam giác ngược)
    cout << "=== Inverted Triangle ===\n";
    for (int i = n; i >= 1; i--) {
        for (int j = 1; j <= i; j++) {
            cout << "*";
        }
        cout << "\n";
    }

    // Pattern 3: Number Triangle (tam giác số)
    cout << "=== Number Triangle ===\n";
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << j;
        }
        cout << "\n";
    }
    // 1
    // 12
    // 123
    // 1234
    // 12345

    // Pattern 4: Pyramid (kim tự tháp)
    cout << "=== Pyramid ===\n";
    for (int i = 1; i <= n; i++) {
        // Print spaces
        for (int j = 1; j <= n - i; j++) cout << " ";
        // Print stars
        for (int j = 1; j <= 2*i - 1; j++) cout << "*";
        cout << "\n";
    }
    //     *
    //    ***
    //   *****
    //  *******
    // *********

    // Pattern 5: Diamond (kim cương)
    cout << "=== Diamond ===\n";
    // Upper half
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n - i; j++) cout << " ";
        for (int j = 1; j <= 2*i - 1; j++) cout << "*";
        cout << "\n";
    }
    // Lower half
    for (int i = n-1; i >= 1; i--) {
        for (int j = 1; j <= n - i; j++) cout << " ";
        for (int j = 1; j <= 2*i - 1; j++) cout << "*";
        cout << "\n";
    }

    return 0;
}
```

**Sample Input:** `5`

**Sample Output (Pyramid):**
```
    *
   ***
  *****
 *******
*********
```

---

## 💡 Khái niệm & Thuật toán

### Khi nào dùng for vs while?

| Tình huống | Dùng loại nào |
|-----------|--------------|
| Biết trước số lần lặp | `for` |
| Không biết số lần, dựa vào điều kiện | `while` |
| Cần chạy ít nhất 1 lần | `do-while` |
| Đọc input cho đến EOF | `while (cin >> x)` |

### Đọc input đến hết file (EOF)
```cpp
int x, sum = 0;
while (cin >> x) {   // Returns false when no more input
    sum += x;
}
cout << sum << "\n";
```

### Tổng kết công thức pattern
Với vòng lặp ngoài `i` từ 1 đến n, dòng thứ `i` có:
- **Spaces trước:** `n - i` khoảng trắng
- **Stars:** `2*i - 1` dấu sao (kim tự tháp)
- **Stars:** `i` dấu sao (tam giác vuông)

### Vòng lặp vô hạn có kiểm soát
```cpp
while (true) {
    int cmd;
    cin >> cmd;
    if (cmd == 0) break;  // Exit when user inputs 0
    // Process command
}
```

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Loại vòng lặp | Time Complexity |
|--------------|----------------|
| Vòng lặp đơn n lần | O(n) |
| Vòng lặp lồng 2 cấp | O(n²) |
| Vòng lặp lồng 3 cấp | O(n³) |
| Vòng lặp giảm một nửa mỗi lần | O(log n) |

**Ước lượng nhanh:** Máy tính chạy khoảng **10⁸ phép tính/giây**
- n = 10⁶ với O(n): OK ✅
- n = 10⁴ với O(n²): OK ✅ (10⁸ phép)
- n = 10³ với O(n³): OK ✅ (10⁹ phép — vừa đủ)
- n = 10⁴ với O(n³): TLE ❌ (10¹² phép — quá chậm)

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Tổng và tích số nguyên
**Đề bài:** Nhập N. Tính tổng 1+2+...+N và tích 1×2×...×N (N!).

**Input mẫu:**
```
5
```
**Output mẫu:**
```
Sum = 15
Factorial = 120
```

**Gợi ý:** Dùng `long long` cho tích vì N! tăng rất nhanh.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    long long sum = 0, fact = 1;
    for (int i = 1; i <= n; i++) {
        sum += i;
        fact *= i;
    }
    cout << "Sum = " << sum << "\n";
    cout << "Factorial = " << fact << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Số nguyên tố
**Đề bài:** Nhập N. In tất cả số nguyên tố từ 2 đến N.

**Input mẫu:**
```
20
```
**Output mẫu:**
```
2 3 5 7 11 13 17 19
```

**Gợi ý:** Số p là nguyên tố nếu không chia hết cho bất kỳ số nào từ 2 đến √p.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

bool isPrime(int p) {
    if (p < 2) return false;
    for (int i = 2; i * i <= p; i++) {  // Check up to sqrt(p)
        if (p % i == 0) return false;
    }
    return true;
}

int main() {
    int n;
    cin >> n;

    for (int i = 2; i <= n; i++) {
        if (isPrime(i)) {
            cout << i << " ";
        }
    }
    cout << "\n";
    return 0;
}
```

---

### Bài 3 (Khó): In bảng nhân
**Đề bài:** Nhập N (1 ≤ N ≤ 9). In bảng nhân N×N có căn chỉnh đẹp.

**Input mẫu:**
```
4
```
**Output mẫu:**
```
 1  2  3  4
 2  4  6  8
 3  6  9 12
 4  8 12 16
```

**Gợi ý:** Dùng `setw(3)` từ `<iomanip>` để căn chỉnh cột. Hoặc tự tính chiều rộng cần thiết.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Calculate max number of digits
    int maxVal = n * n;
    int width = to_string(maxVal).length() + 1;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            cout << setw(width) << i * j;
        }
        cout << "\n";
    }
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Câu đố:** "Bạn gấp tờ giấy 50 lần (mỗi lần đôi đôi lại). Dày bao nhiêu?" → Thảo luận → 2⁵⁰ × 0.1mm ≈ khoảng cách Trái Đất - Mặt Trời! → Đây là O(log n) trong thực tế.

### Theory (10 phút)
- Vẽ flowchart vòng lặp for: khởi tạo → kiểm tra → thực thi → cập nhật → lặp lại
- So sánh for/while/do-while với ví dụ tương ứng
- Trực quan: "vòng lặp lồng = bảng nhân" — mỗi ô (i,j) được tính 1 lần

### Worked Example (10 phút)
Cùng xây dựng Pattern Pyramid từng bước:
1. Vẽ pattern ra giấy trước
2. Nhận ra quy luật: dòng i có (n-i) space và (2i-1) sao
3. Viết vòng lặp ngoài (i)
4. Viết vòng lặp trong (spaces, stars)
5. Chạy thử

### Live Coding (10 phút)
**Pattern Challenge:** Học sinh tự in hình chữ Z với dấu sao (n=5):
```
*****
   *
  *
 *
*****
```

### Practice (10 phút)
Làm Bài 1 và 2. Ai xong sớm thử in hình bàn cờ vua (checkerboard).

---

## 📝 Homework (5 bài)

1. **Dãy Fibonacci** — In N số đầu của dãy Fibonacci (F0=0, F1=1, Fn=Fn-1+Fn-2)
2. **Số hoàn hảo** — Tìm tất cả số hoàn hảo từ 1 đến 10000 (số bằng tổng các ước của nó trừ chính nó)
3. **Pattern X** — Nhập N lẻ, in hình chữ X (các đường chéo được đánh dấu sao)
4. **Tổng chữ số** — Nhập N, tính tổng các chữ số của N (VD: 1234 → 1+2+3+4=10)
5. **Số Armstrong** — In tất cả số Armstrong 3 chữ số (abc sao cho a³+b³+c³=abc)

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Off-by-one error (lỗi lệch 1)
for (int i = 0; i < n; i++)   // Runs n times: 0,1,...,n-1
for (int i = 1; i <= n; i++)  // Also runs n times: 1,2,...,n
// Be careful which you need!

// ❌ MISTAKE 2: Infinite loop
int i = 1;
while (i < 10) {
    cout << i << "\n";
    // Forgot i++! Runs forever
}

// ❌ MISTAKE 3: Wrong variable in nested loop
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n; j++) {
        cout << i;  // Prints i instead of j? Check your logic
    }
}

// ❌ MISTAKE 4: Integer overflow in loop product
long long factorial = 1;
for (int i = 1; i <= 20; i++) {
    factorial *= i;  // OK with long long
}
// int would overflow at i=13!

// ❌ MISTAKE 5: Modifying loop variable inside loop
for (int i = 0; i < n; i++) {
    if (someCondition) i++;  // Dangerous! Use continue instead
}
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Giải thích vòng lặp lồng bằng ví dụ bảng nhân"
- "Pattern này có quy luật gì? [paste pattern]"
- "Tại sao loop của tôi chạy vô hạn? [paste code]"
- "Cách in số với độ rộng cố định trong C++ là gì?"
- "Bài số nguyên tố của tôi chạy đúng không? Có cách nào nhanh hơn?"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Loop Runner:** Viết đúng for/while, tính tổng/tích cơ bản
**🥈 Silver — Pattern Artist:** In được tam giác, kim tự tháp với vòng lặp lồng
**🥇 Gold — Prime Hunter:** Viết hàm kiểm tra số nguyên tố tối ưu O(√n)
**💎 Diamond — Bonus:** In kim cương + bảng nhân căn chỉnh đẹp + solve Collatz conjecture
