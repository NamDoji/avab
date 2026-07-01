# Chuyên đề 4: Function & Recursion — Hàm và Đệ Quy

## 🎯 Mục tiêu
- Định nghĩa và gọi hàm trong C++
- Hiểu tham số (parameter), giá trị trả về (return value)
- Phân biệt truyền giá trị (by value) và tham chiếu (by reference)
- Hiểu đệ quy: base case và recursive case
- Nhận dạng bài toán phù hợp với đệ quy

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== BASIC FUNCTION =====
// Syntax: return_type functionName(parameter1, parameter2, ...) { ... }

// Function with no return value
void greet(string name) {
    cout << "Hello, " << name << "!\n";
}

// Function with return value
int add(int a, int b) {
    return a + b;
}

// Function with multiple parameters
double circleArea(double radius) {
    const double PI = acos(-1.0);
    return PI * radius * radius;
}

// ===== PASS BY VALUE vs BY REFERENCE =====
void swapByValue(int a, int b) {
    int temp = a; a = b; b = temp;
    // Only changes LOCAL copies, original unchanged
}

void swapByRef(int& a, int& b) {  // & means reference
    int temp = a; a = b; b = temp;
    // Changes the ORIGINAL variables
}

// ===== FUNCTION OVERLOADING =====
int maxOf(int a, int b) { return (a > b) ? a : b; }
double maxOf(double a, double b) { return (a > b) ? a : b; }
// Same name, different parameter types — C++ chooses the right one

// ===== RECURSIVE FUNCTION =====
// Factorial: n! = n × (n-1)!  with base case 0! = 1
long long factorial(int n) {
    if (n <= 1) return 1;          // Base case
    return n * factorial(n - 1);   // Recursive case
}

// Fibonacci: F(n) = F(n-1) + F(n-2), F(0)=0, F(1)=1
long long fibonacci(int n) {
    if (n <= 1) return n;          // Base cases: F(0)=0, F(1)=1
    return fibonacci(n-1) + fibonacci(n-2);  // Recursive
}

// GCD (Greatest Common Divisor) using Euclidean algorithm
int gcd(int a, int b) {
    if (b == 0) return a;  // Base case
    return gcd(b, a % b);  // Recursive: gcd(18,12) → gcd(12,6) → gcd(6,0) → 6
}

int main() {
    greet("Alice");             // Hello, Alice!
    cout << add(3, 4) << "\n"; // 7
    cout << circleArea(5.0) << "\n"; // 78.5398...

    int x = 3, y = 7;
    swapByValue(x, y);
    cout << x << " " << y << "\n";  // 3 7 (unchanged!)

    swapByRef(x, y);
    cout << x << " " << y << "\n";  // 7 3 (swapped!)

    cout << factorial(10) << "\n";  // 3628800
    cout << fibonacci(10) << "\n";  // 55
    cout << gcd(48, 18) << "\n";    // 6

    return 0;
}
```

**Sample Output:**
```
Hello, Alice!
7
78.5398
3 7
7 3
3628800
55
6
```

---

### Visualisasi Recursion Stack — Đệ quy hoạt động thế nào

```cpp
#include <bits/stdc++.h>
using namespace std;

// Power function: base^exp
long long power(long long base, int exp) {
    cout << "power(" << base << ", " << exp << ")\n";
    if (exp == 0) return 1;          // Anything^0 = 1
    if (exp % 2 == 0) {
        long long half = power(base, exp/2);
        return half * half;          // base^exp = (base^(exp/2))^2
    }
    return base * power(base, exp-1); // Odd exp
}

// Count digits recursively
int countDigits(int n) {
    if (n < 10) return 1;            // Single digit: base case
    return 1 + countDigits(n / 10); // Remove last digit, count rest
}

// Sum of digits recursively
int digitSum(int n) {
    if (n < 10) return n;
    return (n % 10) + digitSum(n / 10);
}

// Reverse a number
int reverseNum(int n, int rev = 0) {
    if (n == 0) return rev;
    return reverseNum(n / 10, rev * 10 + n % 10);
}

int main() {
    cout << power(2, 10) << "\n";      // 1024
    cout << countDigits(12345) << "\n"; // 5
    cout << digitSum(1234) << "\n";    // 10
    cout << reverseNum(12345) << "\n"; // 54321
    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### Anatomy of a Recursive Function
```
recursive function = BASE CASE + RECURSIVE CASE

BASE CASE: Điều kiện dừng — không gọi đệ quy nữa
           Nếu thiếu → Stack Overflow (crash!)

RECURSIVE CASE: Gọi chính nó với bài toán NHỎ HƠN
                Phải tiến về phía base case
```

### Call Stack — Ngăn xếp gọi hàm
```
factorial(4)
  → 4 * factorial(3)
        → 3 * factorial(2)
              → 2 * factorial(1)
                    → return 1  ← BASE CASE
              ← return 2 * 1 = 2
        ← return 3 * 2 = 6
  ← return 4 * 6 = 24
```

### Khi nào dùng đệ quy?
- Bài toán có thể chia thành các **bài toán con cùng dạng**
- Cấu trúc cây, đồ thị (DFS)
- Chia để trị (merge sort, binary search)
- Combinatorics (tổ hợp, hoán vị)

### Đệ quy vs Vòng lặp
| Tiêu chí | Đệ quy | Vòng lặp |
|---------|--------|---------|
| Dễ đọc | ✅ (với bài phức tạp) | ✅ (với bài đơn giản) |
| Tốc độ | ⚠️ Chậm hơn (overhead) | ✅ Nhanh hơn |
| Bộ nhớ | ⚠️ Stack memory | ✅ Ít hơn |
| Fibonacci(50) | ❌ Quá chậm! (2⁵⁰ gọi) | ✅ 50 phép tính |

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Hàm | Time | Space (Stack) |
|-----|------|--------------|
| `factorial(n)` | O(n) | O(n) |
| `fibonacci(n)` naive | O(2ⁿ) ❌ | O(n) |
| `gcd(a, b)` | O(log min(a,b)) | O(log min(a,b)) |
| `power(b, e)` fast | O(log e) | O(log e) |
| `power(b, e)` slow | O(e) | O(e) |

**Fibonacci cải thiện với memoization:**
```cpp
map<int, long long> memo;

long long fib(int n) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];  // Cached!
    return memo[n] = fib(n-1) + fib(n-2);
}
// Now O(n) instead of O(2^n)
```

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Tính UCLN và BCNN
**Đề bài:** Nhập hai số A, B. Tính UCLN (GCD) và BCNN (LCM).

**Input mẫu:**
```
12 18
```
**Output mẫu:**
```
GCD = 6
LCM = 36
```

**Gợi ý:** LCM(a,b) = a / GCD(a,b) × b (tránh overflow: chia trước nhân sau)

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int gcd(int a, int b) {
    return (b == 0) ? a : gcd(b, a % b);
}

int main() {
    int a, b;
    cin >> a >> b;
    int g = gcd(a, b);
    long long l = (long long)a / g * b;  // Divide first to avoid overflow
    cout << "GCD = " << g << "\n";
    cout << "LCM = " << l << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Tháp Hà Nội
**Đề bài:** In các bước di chuyển tháp Hà Nội N đĩa từ cọc A sang cọc C (dùng cọc B làm trung gian).

**Input mẫu:**
```
3
```
**Output mẫu:**
```
Move disk 1 from A to C
Move disk 2 from A to B
Move disk 1 from C to B
Move disk 3 from A to C
Move disk 1 from B to A
Move disk 2 from B to C
Move disk 1 from A to C
```

**Gợi ý:** `hanoi(n, from, to, via)`: Di chuyển n-1 đĩa sang `via`, rồi đĩa lớn nhất sang `to`, rồi n-1 đĩa từ `via` sang `to`.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

void hanoi(int n, char from, char to, char via) {
    if (n == 1) {
        cout << "Move disk 1 from " << from << " to " << to << "\n";
        return;
    }
    hanoi(n-1, from, via, to);  // Move n-1 disks to 'via'
    cout << "Move disk " << n << " from " << from << " to " << to << "\n";
    hanoi(n-1, via, to, from);  // Move n-1 disks from 'via' to 'to'
}

int main() {
    int n;
    cin >> n;
    hanoi(n, 'A', 'C', 'B');
    return 0;
}
```

---

### Bài 3 (Khó): Số Catalan
**Đề bài:** Tính số Catalan thứ N. C(n) = C(2n,n)/(n+1). Dùng công thức đệ quy: C(0)=1, C(n) = Σ C(i)×C(n-1-i) với i từ 0 đến n-1.

**Input mẫu:**
```
5
```
**Output mẫu:**
```
42
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

map<int, long long> dp;

long long catalan(int n) {
    if (n <= 1) return 1;
    if (dp.count(n)) return dp[n];

    long long result = 0;
    for (int i = 0; i < n; i++) {
        result += catalan(i) * catalan(n-1-i);
    }
    return dp[n] = result;
}

int main() {
    int n;
    cin >> n;
    cout << catalan(n) << "\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Demo Tháp Hà Nội thực tế:** Dùng 3 tờ giấy màu đặt chồng nhau (to → nhỏ), thách học sinh chuyển sang vị trí khác theo luật. Hỏi: "Cần bao nhiêu bước với 3 đĩa?" → 7 bước (2³-1).

### Theory (10 phút)
- Vẽ call stack của `factorial(4)` trên bảng
- Giải thích stack overflow bằng ví dụ: "Ngăn xếp đầy → crash!"
- Phân biệt by-value vs by-reference: "Photocopy vs Sách gốc"

### Worked Example (10 phút)
Cùng trace qua `fibonacci(5)` — vẽ cây đệ quy, đếm số lần gọi hàm. Thấy rõ sự lãng phí: `fib(2)` được tính 3 lần!

### Live Coding (10 phút)
**Challenge:** Viết hàm `power(base, exp)` đệ quy. Gợi ý từng bước:
- Base case: exp == 0
- Recursive: base × power(base, exp-1)
- Bonus: làm phiên bản nhanh O(log n)

### Practice (10 phút)
Làm Bài 1. Ai xong sớm thử Bài 2 (Tháp Hà Nội).

---

## 📝 Homework (5 bài)

1. **Pascal's Triangle** — Nhập N, in N hàng tam giác Pascal dùng đệ quy C(n,k) = C(n-1,k-1) + C(n-1,k)
2. **Tìm kiếm nhị phân đệ quy** — Implement binary search bằng đệ quy
3. **Palindrome đệ quy** — Kiểm tra chuỗi có phải palindrome bằng đệ quy
4. **Tổng các phần tử mảng** — Tính tổng mảng N phần tử bằng đệ quy
5. **Hoán vị** — In tất cả hoán vị của chuỗi N ký tự (dùng đệ quy + swap)

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Missing base case → Stack Overflow!
int badFactorial(int n) {
    return n * badFactorial(n-1);  // No base case!
    // Runs forever → crash
}

// ❌ MISTAKE 2: Wrong base case
int badFib(int n) {
    if (n == 0) return 0;
    // Missing: if (n == 1) return 1;
    return badFib(n-1) + badFib(n-2);  // badFib(-1) → infinite!
}

// ❌ MISTAKE 3: Not returning recursive result
int badGcd(int a, int b) {
    if (b == 0) return a;
    badGcd(b, a % b);  // Missing return!
    // Returns garbage value
}
// ✅ Fix:
int goodGcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);  // Must return!
}

// ❌ MISTAKE 4: Passing by value when you need reference
void incrementAll(vector<int> v) {  // Copy of vector
    for (int& x : v) x++;          // Only modifies copy
}
// ✅ Fix:
void incrementAll(vector<int>& v) { // Reference
    for (int& x : v) x++;
}

// ❌ MISTAKE 5: Naive fibonacci is EXPONENTIAL
long long fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);  // fib(50) = ~10^15 calls!
}
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Vẽ call stack của factorial(5) cho tôi xem"
- "Tại sao fibonacci(50) chạy rất chậm? Cách sửa?"
- "Giải thích by-value vs by-reference với ví dụ thực tế"
- "Làm sao biết bài toán này có thể giải bằng đệ quy?"
- "Stack overflow là gì? Khi nào xảy ra?"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Function Caller:** Viết và gọi hàm cơ bản, hiểu return value
**🥈 Silver — Recursive Thinker:** Viết đệ quy đúng base case, giải factorial/fibonacci
**🥇 Gold — Stack Tracer:** Trace được call stack, dùng memoization, giải Tháp Hà Nội
**💎 Diamond — Bonus:** Implement fast power O(log n) + Pascal's Triangle + submit lên OJ
