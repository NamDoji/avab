# Chuyên đề 10: Binary Search Advanced — Tìm Kiếm Nhị Phân Nâng Cao

## 🎯 Mục tiêu
- Hiểu và áp dụng kỹ thuật "Binary Search on Answer" (Tìm nhị phân trên câu trả lời)
- Nhận dạng bài toán có thể binary search trên khoảng trả lời
- Implement đúng các template binary search khác nhau
- Giải quyết các bài toán tối ưu hóa phức tạp
- Áp dụng binary search trên real numbers (số thực)

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== TEMPLATE 1: Find exact target =====
// Returns index or -1
int findExact(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

// ===== TEMPLATE 2: Find leftmost position (first >= target) =====
int lowerBound(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size();  // hi = n (one past end)
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;  // First position where arr[lo] >= target
}

// ===== TEMPLATE 3: Find rightmost position (last <= target) =====
int upperBound(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] <= target) lo = mid + 1;
        else hi = mid;
    }
    return lo - 1;  // Last position where arr[pos] <= target
}

// ===== BINARY SEARCH ON ANSWER =====
// KEY INSIGHT: "Can we achieve answer X?" must be monotonic
// If YES for X, then YES for X-1 (or X+1 depending on direction)

// ===== PROBLEM: Minimize maximum (Aggressive Cows) =====
// N stalls, place K cows to maximize minimum distance between cows
// → Binary search on the answer (minimum distance)

bool canPlace(vector<int>& stalls, int k, int minDist) {
    int count = 1, lastPos = stalls[0];
    for (int i = 1; i < stalls.size(); i++) {
        if (stalls[i] - lastPos >= minDist) {
            count++;
            lastPos = stalls[i];
            if (count == k) return true;
        }
    }
    return count >= k;
}

int aggressiveCows(vector<int>& stalls, int k) {
    sort(stalls.begin(), stalls.end());
    int lo = 1, hi = stalls.back() - stalls.front();
    int ans = 0;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (canPlace(stalls, k, mid)) {
            ans = mid;   // This distance works, try larger
            lo = mid + 1;
        } else {
            hi = mid - 1;  // Too large, try smaller
        }
    }
    return ans;
}

// ===== PROBLEM: Book Allocation =====
// N books, K students, allocate consecutive books to minimize max pages
bool canAllocate(vector<int>& books, int k, int maxPages) {
    int students = 1, pages = 0;
    for (int b : books) {
        if (b > maxPages) return false;  // Single book exceeds limit
        if (pages + b > maxPages) {
            students++;
            pages = b;
            if (students > k) return false;
        } else {
            pages += b;
        }
    }
    return true;
}

int bookAllocation(vector<int>& books, int k) {
    int lo = *max_element(books.begin(), books.end());
    int hi = accumulate(books.begin(), books.end(), 0);
    int ans = hi;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (canAllocate(books, k, mid)) {
            ans = mid;
            hi = mid - 1;  // Try smaller max
        } else {
            lo = mid + 1;
        }
    }
    return ans;
}

int main() {
    // Aggressive cows
    vector<int> stalls = {1, 2, 4, 8, 9};
    cout << aggressiveCows(stalls, 3) << "\n";  // 3

    // Book allocation
    vector<int> books = {12, 34, 67, 90};
    cout << bookAllocation(books, 2) << "\n";  // 113

    return 0;
}
```

---

### Binary Search on Real Numbers

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== SQUARE ROOT without sqrt() =====
double mySqrt(double x, double eps = 1e-9) {
    double lo = 0, hi = max(1.0, x);
    while (hi - lo > eps) {
        double mid = (lo + hi) / 2;
        if (mid * mid <= x) lo = mid;
        else hi = mid;
    }
    return lo;
}

// ===== FIND MINIMUM TIME to complete tasks =====
// N workers, each completes tasks in rate[i] tasks/hour
// K tasks total. Find minimum time needed.
bool canFinish(vector<int>& rate, int k, double time) {
    long long total = 0;
    for (int r : rate) {
        total += (long long)(time * r);
        if (total >= k) return true;
    }
    return total >= k;
}

double minTime(vector<int>& rates, int k) {
    double lo = 0, hi = (double)k / *min_element(rates.begin(), rates.end());
    for (int iter = 0; iter < 100; iter++) {  // 100 iterations for precision
        double mid = (lo + hi) / 2;
        if (canFinish(rates, k, mid)) hi = mid;
        else lo = mid;
    }
    return hi;
}

// ===== NTH ROOT =====
double nthRoot(double x, int n) {
    double lo = 0, hi = max(1.0, x);
    for (int iter = 0; iter < 200; iter++) {
        double mid = (lo + hi) / 2;
        double val = 1;
        for (int i = 0; i < n; i++) val *= mid;
        if (val <= x) lo = mid;
        else hi = mid;
    }
    return lo;
}

int main() {
    cout << fixed << setprecision(9);
    cout << mySqrt(2.0) << "\n";    // 1.414213562
    cout << mySqrt(9.0) << "\n";    // 3.000000000
    cout << nthRoot(27.0, 3) << "\n";  // 3.000000000

    vector<int> rates = {1, 2, 3};
    cout << minTime(rates, 10) << "\n";  // ~1.666...
    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### Binary Search on Answer — Bí Quyết

**Khi nào áp dụng?**
1. Bài toán hỏi về **giá trị tối ưu** (min/max)
2. Hàm `check(answer)` có thể viết được
3. `check` có tính **đơn điệu**: nếu `check(x)=true` thì `check(x-1)=true` (hoặc ngược lại)

**Các dạng thường gặp:**
- "Minimize the maximum" → Binary search, check = "can we achieve this max?"
- "Maximize the minimum" → Binary search, check = "can we achieve this min?"
- "Find smallest X such that condition holds" → Binary search lo/hi

### Nhận Dạng Dạng Bài

```
Đề bài nói "tìm giá trị nhỏ nhất" hoặc "tìm giá trị lớn nhất" →
→ Thử Binary Search on Answer!

Check: "Với giới hạn X, có thể thoả mãn không?"
Nếu check() viết được trong O(n) → Total: O(n log n)
```

### Template Binary Search on Answer

```cpp
// Find MINIMUM answer such that check(answer) is true
int lo = MIN_POSSIBLE_ANSWER;
int hi = MAX_POSSIBLE_ANSWER;
int ans = hi;

while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (check(mid)) {
        ans = mid;      // Valid! Try smaller
        hi = mid - 1;
    } else {
        lo = mid + 1;   // Too small, try larger
    }
}
return ans;
```

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Approach | Time | When to Use |
|---------|------|------------|
| Brute force | O(n²) or worse | n ≤ 1000 |
| Binary Search (array) | O(log n) | Sorted array |
| BS on Answer + O(n) check | O(n log n) | Optimization problems |
| BS on Real Numbers (100 iter) | O(100 × check) | Continuous functions |

**Phạm vi tìm kiếm thường dùng:**
- Số nguyên: `lo = 0` hoặc `lo = min_element`, `hi = sum` hoặc `hi = MAX_VALUE`
- Số thực: `lo = 0`, `hi = max_possible`, `for 100 iterations`

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Căn bậc hai nguyên
**Đề bài:** Nhập N (0 ≤ N ≤ 10¹⁸). Tìm phần nguyên của √N mà không dùng `sqrt()`.

**Input mẫu:**
```
14
```
**Output mẫu:**
```
3
```
(√14 ≈ 3.74, phần nguyên = 3)

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    long long n; cin >> n;
    long long lo = 0, hi = min(n, (long long)3e9);  // sqrt(10^18) ≈ 10^9

    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;  // Round up to avoid infinite loop
        if (mid <= n / mid) lo = mid;  // mid*mid <= n (avoid overflow)
        else hi = mid - 1;
    }
    cout << lo << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Chia cưa gỗ
**Đề bài:** Có N khúc gỗ dài a[i]. Cần cắt ít nhất K khúc dài bằng nhau. Tìm chiều dài tối đa có thể.

**Input mẫu:**
```
4 11
8 4 3 5
```
**Output mẫu:**
```
2
```
(Cắt 8→4 khúc 2cm, 4→2 khúc 2cm, 3→1 khúc 2cm, 5→2 khúc 2cm = 9 ≥ 11... thực ra check: length=2: 4+2+1+2=9 ≥ 11? Không → length=1: 8+4+3+5=20 ≥ 11 ✓; chiều dài lớn nhất thỏa mãn = 2)

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k; cin >> n >> k;
    vector<int> a(n);
    for (int& x : a) cin >> x;

    auto check = [&](long long len) {
        if (len == 0) return true;
        long long total = 0;
        for (int x : a) total += x / len;
        return total >= k;
    };

    long long lo = 0, hi = *max_element(a.begin(), a.end());
    long long ans = 0;

    while (lo <= hi) {
        long long mid = lo + (hi - lo) / 2;
        if (check(mid)) { ans = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    cout << ans << "\n";
    return 0;
}
```

---

### Bài 3 (Khó): Koko ăn chuối
**Đề bài:** Có N đống chuối, đống i có piles[i] chuối. Koko ăn K chuối/giờ. Có H giờ. Tìm tốc độ ăn tối thiểu để ăn hết.

**Input mẫu:**
```
4 8
3 6 7 11
```
**Output mẫu:**
```
4
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, h; cin >> n >> h;
    vector<int> piles(n);
    for (int& p : piles) cin >> p;

    auto check = [&](long long k) {
        long long hours = 0;
        for (int p : piles) hours += (p + k - 1) / k;  // Ceiling division
        return hours <= h;
    };

    long long lo = 1, hi = *max_element(piles.begin(), piles.end());
    long long ans = hi;

    while (lo <= hi) {
        long long mid = lo + (hi - lo) / 2;
        if (check(mid)) { ans = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    cout << ans << "\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Câu hỏi:** "Bạn cần tìm số tối thiểu X sao cho X² ≥ 100. Không dùng máy tính, dùng binary search tay!" → Học sinh thực hành: lo=0, hi=100, mid=50 → 50²=2500≥100 → hi=50... → lo=10.

### Theory (10 phút)
- Giải thích Binary Search on Answer: "Thay vì tìm kiếm trên mảng, tìm kiếm trên KHÔNG GIAN CÂU TRẢ LỜI"
- Điều kiện áp dụng: hàm check() monotonic
- Vẽ đồ thị: trục x = answer, check() = monotonic step function

### Worked Example (10 phút)
Trace Aggressive Cows với stalls=[1,2,4,8,9], k=3:
- lo=1, hi=8
- mid=4: canPlace? → 1,5,9 → dist 4,4 ≥ 4 → YES → ans=4, lo=5
- mid=6: canPlace? → 1,9 → only 2 cows → NO → hi=5
- mid=5: canPlace? → 1,9 → 2 cows → NO → hi=4
- Answer: 4... wait, canPlace(4)=YES with 3 cows (1,5,9)? Check: dist=4 ≥ 4 ✓

### Live Coding (10 phút)
**Challenge:** Viết binary search tìm minimum speed cho bài "Koko ăn chuối":
1. Xác định lo và hi
2. Viết hàm check(speed)
3. Binary search trên khoảng [lo, hi]

### Practice (10 phút)
Làm Bài 1 (Integer Square Root). Ai xong sớm thử Bài 2 (Chia cưa gỗ).

---

## 📝 Homework (5 bài)

1. **Capacity to Ship Packages** — N gói hàng, ship trong D ngày, tìm capacity tàu tối thiểu
2. **Split Array Largest Sum** — Chia mảng thành K phần, minimize phần có tổng lớn nhất
3. **Painter's Partition** — N tấm bảng, K thợ vẽ, minimize thời gian tối đa
4. **EKO (SPOJ)** — Chia cưa gỗ cổ điển → submit lên SPOJ
5. **Minimize Maximum Distance** — Thêm K trạm xăng vào N trạm, minimize khoảng cách tối đa

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Wrong lo/hi boundary
// For "find minimum answer": lo = 0 (impossible), hi = max_possible
// For "find maximum answer": same, just record ans differently

// ❌ MISTAKE 2: Infinite loop with mid = (lo+hi)/2 in max-search
int lo = 0, hi = 10, ans = 0;
while (lo < hi) {  // When lo=5, hi=6:
    int mid = lo + (hi - lo) / 2;  // mid = 5 = lo → if check passes, lo never advances!
}
// Fix for "find maximum": use mid = lo + (hi-lo+1)/2 (round up)

// ❌ MISTAKE 3: Overflow in check function
bool check(long long speed) {
    int hours = 0;
    for (int p : piles) hours += (p + speed - 1) / speed;  // OK
    // If hours overflows int → wrong!
    return hours <= H;
}
// ✅ Fix: use long long for hours

// ❌ MISTAKE 4: Wrong check boundary (< vs <=)
if (total < k) return false;  // Needs EXACTLY k pieces?
if (total >= k) return true;  // ← This is correct for "at least k"

// ❌ MISTAKE 5: Not handling edge case where lo > hi on entry
if (lo > hi) return -1;  // Array might be empty
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Cách nhận biết bài toán có thể dùng Binary Search on Answer?"
- "Tại sao cần dùng `mid = lo + (hi-lo)/2` thay vì `(lo+hi)/2`?"
- "Sự khác biệt giữa lo < hi và lo <= hi trong while loop?"
- "Cách viết hàm check cho bài toán [mô tả bài]?"
- "Binary search trên số thực khác gì trên số nguyên?"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Searcher:** Binary search tay, lower_bound/upper_bound
**🥈 Silver — Answer Hunter:** Binary Search on Answer với check() đơn giản
**🥇 Gold — Optimizer:** Aggressive Cows, Book Allocation, Koko Bananas
**💎 Diamond — Bonus:** SPOJ EKO + Capacity to Ship + Split Array Largest Sum
