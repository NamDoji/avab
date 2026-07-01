# Chuyên đề 13: Contest Skills — Kỹ Năng Thi Đấu

## 🎯 Mục tiêu
- Tối ưu I/O để không bị TLE do đọc/ghi chậm
- Phân tích độ phức tạp nhanh để chọn thuật toán phù hợp
- Biết kỹ thuật stress testing để phát hiện bug
- Quản lý thời gian thi hiệu quả
- Các tricks và templates hay dùng trong competitive programming

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== I/O OPTIMIZATION =====
// This is the FIRST thing to write in every competitive programming solution!

int main() {
    // Speed up cin/cout (removes sync with C stdio)
    ios::sync_with_stdio(false);
    cin.tie(0);  // Untie cin from cout (no flush before cin)
    // cout.tie(0); // Rarely needed

    // Now cin/cout is as fast as scanf/printf!

    // Use '\n' instead of endl (endl flushes buffer = slow!)
    cout << "Hello\n";   // FAST ✅
    cout << "Hello" << endl;  // SLOW ❌ (flushes every time)

    return 0;
}
```

---

### Fast I/O with scanf/printf (khi cần thiết)

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // scanf/printf (C-style) - always fast
    int n;
    scanf("%d", &n);

    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        printf("%d\n", x * 2);
    }

    // Reading until EOF
    int x;
    while (scanf("%d", &x) != EOF) {
        // Process x
    }

    // Formatted output
    double pi = acos(-1.0);
    printf("%.10f\n", pi);  // 10 decimal places

    return 0;
}
```

---

### Phân Tích Độ Phức Tạp — Chọn Thuật Toán

```cpp
/*
RULE OF THUMB:
Constraints → What complexity is acceptable?

n ≤ 10         → O(n!) or O(2^n) — brute force OK
n ≤ 20         → O(2^n) — bitmask DP OK
n ≤ 100        → O(n^3) — Floyd-Warshall, cubic DP
n ≤ 1,000      → O(n^2) — O(n^2) DP, O(n^2) algorithms
n ≤ 10,000     → O(n^2) barely, prefer O(n√n) or O(n log^2 n)
n ≤ 100,000    → O(n log n) — sorting, balanced BST, segment tree
n ≤ 1,000,000  → O(n) or O(n log n)
n ≤ 10^8       → O(n) only — careful with constants
n ≤ 10^18      → O(log n) — binary search, modular exp

Memory:
256MB ≈ 64M integers (int)
256MB ≈ 32M doubles
→ 10^7 or 10^8 elements: feasible
→ 10^9 elements: NOT feasible
*/

void complexityExamples() {
    int n = 100000;

    // O(n) - OK for n=10^6
    for (int i = 0; i < n; i++) { /* simple op */ }

    // O(n log n) - OK for n=10^5 ~ 10^6
    vector<int> v(n); sort(v.begin(), v.end());

    // O(n√n) - OK for n=10^5
    for (int i = 0; i < n; i++)
        for (int j = i; j < n && j < i + (int)sqrt(n); j++) { }

    // O(n²) - only for n ≤ 10^4
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) { }  // 10^10 ops → TLE for n=10^5!
}
```

---

### Stress Testing — Tìm Bug Tự Động

```cpp
// HOW STRESS TESTING WORKS:
// 1. Write your SOLUTION (might have bugs)
// 2. Write a BRUTE FORCE solution (definitely correct, just slow)
// 3. Generate random small test cases
// 4. Compare outputs — if different → found a bug!

#include <bits/stdc++.h>
using namespace std;

// Solution to test (might be wrong)
int solution(vector<int>& arr) {
    // ... your algorithm here
    return 0;
}

// Brute force (definitely correct)
int bruteForce(vector<int>& arr) {
    // ... simple O(n^2) solution
    return 0;
}

// Random test generator
vector<int> generateTest(int n, int maxVal, int seed) {
    mt19937 rng(seed);
    vector<int> arr(n);
    for (int& x : arr) x = rng() % maxVal + 1;
    return arr;
}

int main() {
    // Stress test: run 1000 random tests
    for (int test = 1; test <= 1000; test++) {
        int n = rand() % 10 + 1;  // Small n for stress test
        vector<int> arr = generateTest(n, 100, test);

        int sol = solution(arr);
        int bf = bruteForce(arr);

        if (sol != bf) {
            cout << "MISMATCH on test " << test << "!\n";
            cout << "Input: ";
            for (int x : arr) cout << x << " ";
            cout << "\nSolution: " << sol << "\nBrute: " << bf << "\n";
            return 1;  // Stop and investigate
        }
    }
    cout << "All tests passed!\n";
    return 0;
}
```

---

### Useful Templates & Tricks

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== MODULAR ARITHMETIC =====
const long long MOD = 1e9 + 7;

long long modpow(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

long long modinv(long long a, long long mod) {
    return modpow(a, mod - 2, mod);  // Fermat's little theorem (mod must be prime)
}

// ===== COMMON MACROS =====
#define ll long long
#define pii pair<int,int>
#define vi vector<int>
#define vll vector<long long>
#define pb push_back
#define mp make_pair
#define F first
#define S second
#define all(x) x.begin(), x.end()
#define sz(x) (int)x.size()

// ===== USEFUL FUNCTIONS =====
// GCD/LCM
ll gcd(ll a, ll b) { return b ? gcd(b, a%b) : a; }
ll lcm(ll a, ll b) { return a / gcd(a,b) * b; }

// Integer square root
ll isqrt(ll n) { return (ll)sqrt((double)n); }

// Ceiling division
ll cdiv(ll a, ll b) { return (a + b - 1) / b; }

// Check bit
bool hasBit(int mask, int bit) { return (mask >> bit) & 1; }

// Count bits set
int countBits(int n) { return __builtin_popcount(n); }

// ===== COMMON PATTERNS =====

// Read N numbers
void readArray(vector<int>& a, int n) {
    a.resize(n);
    for (int& x : a) cin >> x;
}

// Print vector
void printVec(vector<int>& a) {
    for (int i = 0; i < a.size(); i++) {
        cout << a[i];
        if (i + 1 < a.size()) cout << " ";
    }
    cout << "\n";
}

// Min/Max of initializer list
int mn = min({a, b, c});
int mx = max({a, b, c, d});

int main() {
    cout << modpow(2, 62, MOD) << "\n";  // 2^62 mod 10^9+7
    cout << gcd(48LL, 18LL) << "\n";     // 6
    cout << cdiv(7LL, 3LL) << "\n";      // 3
    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### Contest Time Management

```
Codeforces (2-3h): 5-8 bài
→ Đọc TẤT CẢ bài trước (15 phút)
→ Sắp xếp theo độ khó cảm quan
→ Giải từ dễ đến khó
→ Không stuck quá 20 phút → bỏ qua, làm bài khác
→ Submit sớm, debug sau nếu WA
```

### Checklist trước khi submit

```
☐ Đọc kỹ đề: n, constraints, input/output format
☐ Tính complexity: có vừa với time limit không?
☐ Edge cases: n=0, n=1, tất cả số âm, overflow?
☐ Data type: dùng long long chỗ cần thiết?
☐ Output format: dấu cách, xuống dòng đúng chưa?
☐ Multiple test cases: reset variables không?
☐ I/O optimization: đã thêm ios::sync_with_stdio(false)?
```

### Common Edge Cases

```cpp
// Edge cases to always check:
// 1. n = 0 or n = 1
// 2. All elements the same
// 3. All elements negative
// 4. Maximum constraints (will it TLE/MLE?)
// 5. Integer overflow (multiply two 10^9 values → use long long)
// 6. Division by zero
// 7. Empty array/string
// 8. Disconnected graph
```

---

## 📊 Độ phức tạp (Time & Space Complexity)

### Bảng tham chiếu nhanh

| n | Max Complexity | Typical Algorithm |
|---|---------------|-------------------|
| ≤ 10 | O(n!) | Permutations |
| ≤ 20 | O(2ⁿ) | Bitmask DP |
| ≤ 500 | O(n³) | Floyd-Warshall |
| ≤ 5000 | O(n²) | Simple DP, quadratic sort |
| ≤ 10⁵ | O(n log n) | Sort, binary search |
| ≤ 10⁶ | O(n) or O(n log n) | Linear scan, prefix sum |
| ≤ 10⁸ | O(n) tight | Very simple loops |
| any | O(log n) | Binary search on answer |

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): I/O Benchmark
**Đề bài:** Nhập N số nguyên, in tổng của chúng. N có thể lên tới 10⁶.

**Input mẫu:**
```
1000000
(1 million numbers)
```

**Thử nghiệm:** So sánh thời gian chạy với và không có `ios::sync_with_stdio(false)`.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);

    int n; cin >> n;
    long long sum = 0;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        sum += x;
    }
    cout << sum << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Multiple Test Cases
**Đề bài:** Nhập T test cases. Mỗi test: N số, tìm max. (Chú ý reset variables!)

**Input mẫu:**
```
3
5
1 5 3 2 4
3
9 2 7
4
1 1 1 1
```
**Output mẫu:**
```
5
9
1
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false); cin.tie(0);

    int T; cin >> T;
    while (T--) {
        int n; cin >> n;
        int maxVal = INT_MIN;
        for (int i = 0; i < n; i++) {
            int x; cin >> x;
            maxVal = max(maxVal, x);
        }
        cout << maxVal << "\n";
    }
    return 0;
}
```

---

### Bài 3 (Khó): Stress Test Practice
**Đề bài:** Implement brute force và solution cho bài "Tìm độ dài dãy con liên tiếp có tổng = K", rồi stress test 1000 trường hợp ngẫu nhiên.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

// Brute force O(n^2)
int bruteForce(vector<int>& a, int k) {
    int n = a.size(), count = 0;
    for (int i = 0; i < n; i++) {
        int sum = 0;
        for (int j = i; j < n; j++) {
            sum += a[j];
            if (sum == k) count++;
        }
    }
    return count;
}

// Optimal O(n) using prefix sum + hashmap
int solution(vector<int>& a, int k) {
    unordered_map<int,int> prefixCount;
    prefixCount[0] = 1;
    int sum = 0, count = 0;
    for (int x : a) {
        sum += x;
        count += prefixCount[sum - k];
        prefixCount[sum]++;
    }
    return count;
}

int main() {
    mt19937 rng(42);
    for (int test = 1; test <= 1000; test++) {
        int n = rng() % 8 + 1;
        int k = (rng() % 11) - 5;  // k from -5 to 5
        vector<int> a(n);
        for (int& x : a) x = (rng() % 11) - 5;  // Values -5 to 5

        int bf = bruteForce(a, k);
        int sol = solution(a, k);

        if (bf != sol) {
            cout << "FAIL test " << test << "! k=" << k << " arr:";
            for (int x : a) cout << " " << x;
            cout << "\nBrute=" << bf << " Solution=" << sol << "\n";
            return 1;
        }
    }
    cout << "All 1000 tests passed!\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Cuộc thi nhỏ:** Đọc 10⁶ số và in tổng. Version 1: không tối ưu. Version 2: với ios::sync. → Đo thời gian thực tế. Thấy rõ sự khác biệt!

### Theory (10 phút)
- Giải thích bảng n → complexity → algorithm
- Demo phân tích bài: "n=10⁵, time limit 1s → cần O(n log n) hoặc tốt hơn"
- Giới thiệu checklist trước khi submit
- Stress testing concept: "robot tester thay vì người tester"

### Worked Example (10 phút)
Thực hành phân tích đề bài mẫu:
- Đọc đề → xác định n, constraints
- Tính complexity yêu cầu
- Liệt kê các thuật toán phù hợp
- Chọn và implement

### Live Coding (10 phút)
**Speed Round:** Mỗi học sinh giải bài đơn giản (sum of array) nhưng phải HOÀN TOÀN ĐÚNG bao gồm:
- I/O optimization
- Đúng data type
- Edge case n=0
- Đúng output format

### Practice (10 phút)
Làm Bài 1 và 2. Thực hành contest mindset: đọc đề → plan → code → test → submit.

---

## 📝 Homework (5 bài)

1. **Template hoàn chỉnh** — Tạo template CP của riêng bạn với các macros, fast I/O, và functions thường dùng
2. **Phân tích 5 bài** — Với 5 bài Codeforces Div2 A-C, phân tích n và chọn thuật toán TRƯỚC KHI code
3. **Stress test** — Viết stress test cho bài số nguyên tố: so sánh O(√n) với O(n)
4. **Time limit trick** — Submit bài TLE, thêm tối ưu từng bước và đo lại
5. **Virtual contest** — Tham gia 1 virtual contest Codeforces Div2, ghi lại approach từng bài

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Using endl in tight loops
for (int i = 0; i < n; i++) {
    cout << arr[i] << endl;  // Flushes n times → SLOW!
}
// ✅ Fix:
for (int i = 0; i < n; i++) cout << arr[i] << "\n";

// ❌ MISTAKE 2: Forgetting to reset in multi-test
int T; cin >> T;
while (T--) {
    int n; cin >> n;
    // vector<int> dp(n+1, 0);  // Must re-create or clear each test!
    // If using global arrays: memset(dp, 0, sizeof(dp));
}

// ❌ MISTAKE 3: Wrong output format
cout << a << " " << b << "\n";   // Check: space or newline between?
cout << a << "\n" << b << "\n";  // Match exactly what problem says

// ❌ MISTAKE 4: Using double for exact arithmetic
double x = 0.1 + 0.2;
if (x == 0.3) { /* WRONG */ }
// Use integer arithmetic or careful epsilon comparison

// ❌ MISTAKE 5: Submitting before testing
// Always: test with sample cases, then edge cases, then submit
// "Think twice, code once"
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Bài này n=10^5 với O(n^2) có pass 2s time limit không?"
- "Viết stress test script cho bài [mô tả bài]"
- "Template C++ competitive programming tốt nhất là gì?"
- "Tại sao code đúng nhưng bị TLE? Cách tối ưu?"
- "Cách debug khi bị WA mà không biết test case nào sai?"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Contest Ready:** I/O optimization, đúng output format, basic edge cases
**🥈 Silver — Time Analyst:** Phân tích complexity chính xác, chọn thuật toán phù hợp
**🥇 Gold — Bug Hunter:** Stress testing thành thạo, checklist đầy đủ, template tối ưu
**💎 Diamond — Bonus:** Tham gia 1 virtual contest + stress test bài DP + template hoàn chỉnh
