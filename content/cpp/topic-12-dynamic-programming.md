# Chuyên đề 12: Dynamic Programming — Quy Hoạch Động

## 🎯 Mục tiêu
- Hiểu tư duy DP: overlapping subproblems + optimal substructure
- Nắm vững 2 cách tiếp cận: Top-Down (memoization) và Bottom-Up (tabulation)
- Giải được các bài DP kinh điển: Knapsack, Fibonacci, LIS, LCS
- Nhận dạng bài toán DP và xây dựng công thức truy hồi
- Tối ưu không gian bộ nhớ DP

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== FIBONACCI DP =====

// Method 1: Naive recursion - O(2^n) -- TOO SLOW
long long fib_naive(int n) {
    if (n <= 1) return n;
    return fib_naive(n-1) + fib_naive(n-2);
}

// Method 2: Top-Down (Memoization) - O(n)
map<int, long long> memo;
long long fib_memo(int n) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];  // Cache hit!
    return memo[n] = fib_memo(n-1) + fib_memo(n-2);
}

// Method 3: Bottom-Up (Tabulation) - O(n) time, O(n) space
long long fib_dp(int n) {
    if (n <= 1) return n;
    vector<long long> dp(n+1);
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}

// Method 4: Space Optimized - O(n) time, O(1) space
long long fib_opt(int n) {
    if (n <= 1) return n;
    long long prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        long long curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}

// ===== 0/1 KNAPSACK =====
// N items: weight[i], value[i]. Bag capacity W.
// Max value without exceeding W.
int knapsack(vector<int>& weight, vector<int>& value, int W) {
    int n = weight.size();
    // dp[i][w] = max value using items 0..i-1 with capacity w
    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            // Don't take item i
            dp[i][w] = dp[i-1][w];
            // Take item i (if it fits)
            if (weight[i-1] <= w) {
                dp[i][w] = max(dp[i][w], dp[i-1][w - weight[i-1]] + value[i-1]);
            }
        }
    }
    return dp[n][W];
}

// Space-optimized knapsack (1D dp)
int knapsack1D(vector<int>& weight, vector<int>& value, int W) {
    int n = weight.size();
    vector<int> dp(W+1, 0);

    for (int i = 0; i < n; i++) {
        // Iterate backwards to avoid using item i twice!
        for (int w = W; w >= weight[i]; w--) {
            dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);
        }
    }
    return dp[W];
}

int main() {
    cout << fib_opt(10) << "\n";  // 55

    vector<int> weights = {2, 3, 4, 5};
    vector<int> values  = {3, 4, 5, 6};
    int W = 8;
    cout << knapsack(weights, values, W) << "\n";  // 10

    return 0;
}
```

---

### LIS, LCS và Coin Change DP

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== LONGEST INCREASING SUBSEQUENCE (LIS) =====
// Find length of longest strictly increasing subsequence
int lis(vector<int>& arr) {
    int n = arr.size();
    vector<int> dp(n, 1);  // dp[i] = LIS ending at index i

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (arr[j] < arr[i]) {  // Can extend
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
    }
    return *max_element(dp.begin(), dp.end());
}

// LIS in O(n log n) using patience sorting
int lisOptimal(vector<int>& arr) {
    vector<int> tails;  // tails[i] = smallest tail of IS of length i+1
    for (int x : arr) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}

// ===== LONGEST COMMON SUBSEQUENCE (LCS) =====
int lcs(string& s1, string& s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;  // Characters match
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);  // Best of skip either
            }
        }
    }
    return dp[m][n];
}

// ===== COIN CHANGE DP (Minimum coins) =====
int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount+1, INT_MAX);
    dp[0] = 0;  // 0 coins needed for amount 0

    for (int a = 1; a <= amount; a++) {
        for (int coin : coins) {
            if (coin <= a && dp[a-coin] != INT_MAX) {
                dp[a] = min(dp[a], dp[a-coin] + 1);
            }
        }
    }
    return (dp[amount] == INT_MAX) ? -1 : dp[amount];
}

// ===== EDIT DISTANCE =====
int editDistance(string& s1, string& s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));

    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1]) {
                dp[i][j] = dp[i-1][j-1];
            } else {
                dp[i][j] = 1 + min({dp[i-1][j],    // Delete
                                    dp[i][j-1],    // Insert
                                    dp[i-1][j-1]}); // Replace
            }
        }
    }
    return dp[m][n];
}

int main() {
    vector<int> arr = {10, 9, 2, 5, 3, 7, 101, 18};
    cout << "LIS: " << lis(arr) << "\n";         // 4 (2,3,7,101 or 2,5,7,101)
    cout << "LIS optimal: " << lisOptimal(arr) << "\n";  // 4

    string s1 = "ABCBDAB", s2 = "BDCAB";
    cout << "LCS: " << lcs(s1, s2) << "\n";      // 4 (BCAB or BDAB)

    vector<int> coins = {1, 5, 11};
    cout << "Coin Change(15): " << coinChange(coins, 15) << "\n";  // 3 (5+5+5)

    string word1 = "horse", word2 = "ros";
    cout << "Edit Distance: " << editDistance(word1, word2) << "\n";  // 3

    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### Tư Duy DP — 5 Bước

```
1. XÁC ĐỊNH bài toán con (subproblem)
   dp[i] = "câu trả lời cho bài toán với i phần tử đầu"

2. XÂY DỰNG công thức truy hồi (recurrence relation)
   dp[i] = f(dp[i-1], dp[i-2], ...)

3. XÁC ĐỊNH base case
   dp[0] = ?, dp[1] = ?

4. ĐIỀN bảng DP (bottom-up) hoặc dùng memo (top-down)

5. ĐỌC kết quả từ bảng DP
```

### Khi nào áp dụng DP?

**Dấu hiệu nhận biết:**
- "Đếm số cách..."
- "Tìm giá trị lớn nhất/nhỏ nhất..."
- "Có tồn tại cách nào không..."
- Bài toán có thể chia thành bài toán con **chồng lấn** (overlapping)

### Top-Down vs Bottom-Up

```cpp
// TOP-DOWN: Dễ viết, tự nhiên hơn
// Start from the answer, recurse down
// Pros: Only compute subproblems that are needed
// Cons: Function call overhead, stack depth

// BOTTOM-UP: Không cần đệ quy, kiểm soát tốt hơn
// Start from base cases, build up
// Pros: No recursion overhead, cache-friendly
// Cons: Must compute all subproblems in order
```

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Bài toán | Time | Space | Space Optimized |
|---------|------|-------|----------------|
| Fibonacci | O(n) | O(n) | O(1) |
| 0/1 Knapsack | O(n×W) | O(n×W) | O(W) |
| LIS (naive DP) | O(n²) | O(n) | — |
| LIS (patience) | O(n log n) | O(n) | — |
| LCS | O(m×n) | O(m×n) | O(min(m,n)) |
| Coin Change | O(amount×coins) | O(amount) | — |
| Edit Distance | O(m×n) | O(m×n) | O(min(m,n)) |

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Climbing Stairs
**Đề bài:** Leo cầu thang N bậc, mỗi lần leo 1 hoặc 2 bậc. Đếm số cách leo.

**Input mẫu:**
```
5
```
**Output mẫu:**
```
8
```
(Giống Fibonacci! f(1)=1, f(2)=2, f(n)=f(n-1)+f(n-2))

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;
    if (n <= 2) { cout << n << "\n"; return 0; }

    long long prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        long long curr = prev1 + prev2;
        prev2 = prev1; prev1 = curr;
    }
    cout << prev1 << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Longest Common Substring (Dãy con liên tiếp chung dài nhất)
**Đề bài:** Nhập 2 chuỗi S1, S2. Tìm dãy con **liên tiếp** (substring) chung dài nhất.

**Input mẫu:**
```
ABCDEF
ZBCDFG
```
**Output mẫu:**
```
3
BCD
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s1, s2;
    cin >> s1 >> s2;
    int m = s1.size(), n = s2.size();

    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    int maxLen = 0, endPos = 0;

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
                if (dp[i][j] > maxLen) {
                    maxLen = dp[i][j];
                    endPos = i;  // End position in s1
                }
            }
        }
    }
    cout << maxLen << "\n";
    cout << s1.substr(endPos - maxLen, maxLen) << "\n";
    return 0;
}
```

---

### Bài 3 (Khó): Maximum Sum Rectangle in 2D Matrix
**Đề bài:** Cho ma trận N×M số nguyên (có thể âm). Tìm hình chữ nhật con có tổng lớn nhất.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

// Kadane's for 1D array
int kadane(vector<int>& arr) {
    int maxSum = arr[0], curSum = arr[0];
    for (int i = 1; i < arr.size(); i++) {
        curSum = max(arr[i], curSum + arr[i]);
        maxSum = max(maxSum, curSum);
    }
    return maxSum;
}

int main() {
    int n, m; cin >> n >> m;
    vector<vector<int>> mat(n, vector<int>(m));
    for (auto& row : mat) for (int& x : row) cin >> x;

    int maxSum = INT_MIN;

    // Fix left column l, expand right column r
    for (int l = 0; l < m; l++) {
        vector<int> colSum(n, 0);
        for (int r = l; r < m; r++) {
            // Add column r to running sums
            for (int i = 0; i < n; i++) colSum[i] += mat[i][r];
            // Apply Kadane on the colSum array
            maxSum = max(maxSum, kadane(colSum));
        }
    }
    cout << maxSum << "\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Demo sức mạnh DP:** Tính fibonacci(50) bằng tay (giả vờ): "sẽ mất hàng tỷ phép tính". Với DP: chỉ 50 phép cộng. → DP là nghệ thuật "nhớ kết quả tránh tính lại"!

### Theory (10 phút)
- Giải thích overlapping subproblems: "fibonacci(4) cần fibonacci(3) và fibonacci(2); fibonacci(3) cũng cần fibonacci(2) → tính lại!"
- Vẽ bảng DP Knapsack 2D: hàng = items, cột = capacity
- Giải thích optimal substructure: "nghiệm tối ưu bao gồm nghiệm tối ưu của bài toán con"

### Worked Example (10 phút)
Trace Knapsack với weights=[2,3,4], values=[3,4,5], W=5:
- Điền bảng dp[i][w] từng ô
- Đọc kết quả: dp[3][5] = ?

### Live Coding (10 phút)
**Challenge:** Implement Coin Change DP từng bước:
1. `dp[0] = 0` (0 đồng cho amount=0)
2. Với mỗi amount a: thử từng coin, dp[a] = min(dp[a], dp[a-coin]+1)
3. In dp[amount]

### Practice (10 phút)
Làm Bài 1 (Climbing Stairs). Ai xong sớm thử LCS.

---

## 📝 Homework (5 bài)

1. **Triangle Path Sum** — Tìm đường đi từ đỉnh xuống đáy tam giác số có tổng nhỏ nhất
2. **Unique Paths** — Đếm đường đi từ (0,0) đến (m,n) chỉ đi phải và xuống
3. **Partition Equal Subset Sum** — Có thể chia mảng thành 2 phần có tổng bằng nhau không?
4. **Palindromic Substrings** — Đếm số chuỗi con palindrome
5. **Russian Doll Envelopes** — Bài LIS 2D: bao nhiêu phong bì có thể lồng vào nhau

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Wrong iteration order in 1D knapsack
for (int i = 0; i < n; i++) {
    for (int w = 0; w <= W; w++) {  // WRONG! Items can be used multiple times!
        dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);
    }
}
// ✅ Fix: Iterate backwards for 0/1 knapsack
for (int i = 0; i < n; i++) {
    for (int w = W; w >= weight[i]; w--) {  // CORRECT
        dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);
    }
}

// ❌ MISTAKE 2: Not initializing dp correctly
vector<int> dp(amount+1, 0);    // WRONG: 0 is a valid minimum!
// ✅ Fix:
vector<int> dp(amount+1, INT_MAX);  // Represents "impossible"
dp[0] = 0;

// ❌ MISTAKE 3: Wrong base case
// dp[0] = 0 for fibonacci, but
// dp[0] = 1 for "number of ways" (empty way)

// ❌ MISTAKE 4: Integer overflow
// DP values can get large! Use long long when needed
vector<long long> dp(n+1, 0);

// ❌ MISTAKE 5: Confusing LCS and LCS-substring
// LCS (subsequence): don't need to be contiguous → dp[i][j] = dp[i-1][j-1] + 1 or max
// LCS (substring): must be contiguous → dp[i][j] = dp[i-1][j-1]+1 only if match, else 0
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Giải thích tại sao phải duyệt ngược trong knapsack 1D"
- "Bài này nên dùng Top-Down hay Bottom-Up?"
- "Vẽ bảng DP cho bài LCS với input cụ thể"
- "Làm sao xây dựng công thức truy hồi từ bài toán?"
- "LIS O(n log n) hoạt động thế nào? Giải thích patience sorting"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — DP Beginner:** Fibonacci DP, Climbing Stairs, Coin Change
**🥈 Silver — DP Practitioner:** Knapsack 0/1, LIS O(n²), LCS cơ bản
**🥇 Gold — DP Master:** LIS O(n log n), Edit Distance, 2D Matrix Max Sum
**💎 Diamond — Bonus:** Russian Doll Envelopes + Partition Equal Subset + Triangle Path
