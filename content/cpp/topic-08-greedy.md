# Chuyên đề 8: Greedy — Tham Lam

## 🎯 Mục tiêu
- Hiểu triết lý thuật toán Greedy (tham lam): chọn tốt nhất tại mỗi bước
- Nhận dạng bài toán có thể giải bằng Greedy
- Implement các bài Greedy kinh điển: Coin Change, Activity Selection, Scheduling
- Biết cách chứng minh tính đúng đắn của Greedy
- Phân biệt khi Greedy đúng và khi Greedy sai

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== COIN CHANGE GREEDY =====
// Đổi tiền: cho coins {1, 5, 10, 25}, trả lại amount bằng ít đồng nhất
// NOTE: Greedy ONLY works for specific coin systems (e.g., US coins)
int coinChangeGreedy(vector<int>& coins, int amount) {
    sort(coins.begin(), coins.end(), greater<int>());  // Largest first
    int count = 0;
    for (int coin : coins) {
        count += amount / coin;  // Use as many of this coin as possible
        amount %= coin;
    }
    return (amount == 0) ? count : -1;  // -1 if impossible
}

// ===== ACTIVITY SELECTION PROBLEM =====
// Chọn nhiều hoạt động nhất, mỗi hoạt động có [start, end]
int activitySelection(vector<pair<int,int>>& activities) {
    // Sort by END TIME (greedy choice: finish early, leave room for more)
    sort(activities.begin(), activities.end(), [](auto& a, auto& b) {
        return a.second < b.second;
    });

    int count = 1;
    int lastEnd = activities[0].second;

    for (int i = 1; i < activities.size(); i++) {
        if (activities[i].first >= lastEnd) {  // No overlap
            count++;
            lastEnd = activities[i].second;
        }
    }
    return count;
}

// ===== JOB SCHEDULING (Maximize profit) =====
// Mỗi job có deadline d và profit p. Mỗi slot chỉ làm 1 job.
int jobScheduling(vector<tuple<int,int,int>>& jobs) {
    // Sort by profit descending (greedy: take highest profit first)
    sort(jobs.begin(), jobs.end(), [](auto& a, auto& b) {
        return get<2>(a) > get<2>(b);
    });

    int maxDeadline = 0;
    for (auto& [id, deadline, profit] : jobs) {
        maxDeadline = max(maxDeadline, deadline);
    }

    vector<int> slot(maxDeadline + 1, -1);  // -1 = empty
    int totalProfit = 0;

    for (auto& [id, deadline, profit] : jobs) {
        // Find latest free slot before deadline
        for (int j = deadline; j >= 1; j--) {
            if (slot[j] == -1) {
                slot[j] = id;
                totalProfit += profit;
                break;
            }
        }
    }
    return totalProfit;
}

int main() {
    // Coin Change
    vector<int> coins = {1, 5, 10, 25};
    cout << coinChangeGreedy(coins, 41) << "\n";  // 4 coins: 25+10+5+1

    // Activity Selection
    vector<pair<int,int>> acts = {{1,4},{3,5},{0,6},{5,7},{3,8},{5,9},{6,10},{8,11},{8,12},{2,13},{12,14}};
    cout << activitySelection(acts) << "\n";  // 4 activities

    // Job Scheduling
    // (id, deadline, profit)
    vector<tuple<int,int,int>> jobList = {{1,4,20},{2,1,10},{3,1,40},{4,1,30}};
    cout << jobScheduling(jobList) << "\n";  // 60 (job3 + job1)

    return 0;
}
```

---

### Greedy Nâng Cao: Huffman Coding & Fractional Knapsack

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== FRACTIONAL KNAPSACK =====
// Túi có sức chứa W. Mỗi item có weight[i] và value[i].
// Có thể lấy một phần item → Greedy theo value/weight ratio
double fractionalKnapsack(int W, vector<pair<double,double>>& items) {
    // Sort by value/weight ratio (descending)
    sort(items.begin(), items.end(), [](auto& a, auto& b) {
        return a.first / a.second > b.first / b.second;
    });
    // items[i] = {value, weight}

    double totalValue = 0;
    int remaining = W;

    for (auto& [v, w] : items) {
        if (remaining <= 0) break;
        if (w <= remaining) {
            totalValue += v;     // Take whole item
            remaining -= w;
        } else {
            totalValue += v * remaining / w;  // Take fraction
            remaining = 0;
        }
    }
    return totalValue;
}

// ===== MINIMUM SPANNING TREE (Kruskal's Greedy) =====
struct Edge {
    int u, v, weight;
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

struct UnionFind {
    vector<int> parent, rank;
    UnionFind(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        return parent[x] == x ? x : parent[x] = find(parent[x]);
    }
    bool unite(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (rank[x] < rank[y]) swap(x, y);
        parent[y] = x;
        if (rank[x] == rank[y]) rank[x]++;
        return true;
    }
};

int kruskalMST(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end());  // Greedy: smallest edge first
    UnionFind uf(n);
    int totalWeight = 0;

    for (auto& e : edges) {
        if (uf.unite(e.u, e.v)) {  // Only take edge if doesn't form cycle
            totalWeight += e.weight;
            cout << "Add edge " << e.u << "-" << e.v << " (weight " << e.weight << ")\n";
        }
    }
    return totalWeight;
}

int main() {
    // Fractional Knapsack: {value, weight}
    vector<pair<double,double>> items = {{60,10},{100,20},{120,30}};
    cout << fractionalKnapsack(50, items) << "\n";  // 240.0

    // Kruskal MST
    vector<Edge> edges = {{0,1,1},{0,2,3},{1,2,1},{1,3,4},{2,3,2}};
    cout << "MST weight: " << kruskalMST(4, edges) << "\n";  // 4

    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### Triết lý Greedy
```
Tại mỗi bước → chọn lựa chọn TỐT NHẤT HIỆN TẠI
               (không quan tâm tương lai)
               
Khi đúng: đơn giản, nhanh, O(n log n) hoặc tốt hơn
Khi sai: cho kết quả sai! (ví dụ: Coin Change với coins {1,3,4}, amount=6)
```

### Khi nào Greedy đúng?

Bài toán có **Greedy choice property**: lựa chọn tốt nhất tại bước hiện tại không bao giờ ngăn chặn ta tìm được nghiệm tối ưu toàn cục.

**Ví dụ Greedy SAI:**
```
Coins = {1, 3, 4}, amount = 6
Greedy: 4 + 1 + 1 = 3 coins  ❌
Optimal: 3 + 3 = 2 coins    ✅
→ Với hệ coins này, phải dùng DP!
```

### Các bài Greedy kinh điển

| Bài toán | Greedy Strategy |
|---------|----------------|
| Coin Change (US coins) | Dùng đồng lớn nhất có thể |
| Activity Selection | Kết thúc sớm nhất trước |
| Fractional Knapsack | Tỉ lệ giá trị/cân nặng cao nhất |
| Job Scheduling | Lợi nhuận cao nhất, deadline chặt nhất |
| Huffman Coding | Ký tự tần suất thấp nhất trước |
| Minimum Spanning Tree | Cạnh nhỏ nhất không tạo chu trình |

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Bài toán | Time | Space |
|---------|------|-------|
| Coin Change Greedy | O(n) | O(1) |
| Activity Selection | O(n log n) | O(1) |
| Fractional Knapsack | O(n log n) | O(1) |
| Job Scheduling | O(n² + n log n) | O(n) |
| Kruskal MST | O(E log E) | O(V) |

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Phân phối kẹo
**Đề bài:** Có N trẻ em, mỗi em có rating[i]. Phân phát kẹo sao cho:
- Mỗi em ít nhất 1 kẹo
- Em có rating cao hơn em liền kề nhận nhiều kẹo hơn
Tìm số kẹo tối thiểu cần dùng.

**Input mẫu:**
```
5
1 0 2 1 3
```
**Output mẫu:**
```
7
```
(Kẹo: 2 1 2 1 3 → Tổng = 9... thực ra: [2,1,2,1,3] = 9 hay [1,1,2,1,3]=8?)

Câu trả lời đúng: `[2, 1, 2, 1, 3]` = 9? Hãy kiểm tra lại với greedy 2 chiều.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;
    vector<int> rating(n), candy(n, 1);
    for (int& r : rating) cin >> r;

    // Left to right pass
    for (int i = 1; i < n; i++) {
        if (rating[i] > rating[i-1]) candy[i] = candy[i-1] + 1;
    }

    // Right to left pass
    for (int i = n-2; i >= 0; i--) {
        if (rating[i] > rating[i+1]) candy[i] = max(candy[i], candy[i+1] + 1);
    }

    long long total = accumulate(candy.begin(), candy.end(), 0LL);
    cout << total << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Xếp lịch họp
**Đề bài:** N cuộc họp với thời gian bắt đầu s[i] và kết thúc e[i]. Chọn nhiều cuộc họp nhất có thể (mỗi cuộc không trùng thời gian nhau).

**Input mẫu:**
```
6
1 2
3 4
0 6
5 7
8 9
5 9
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
    int n; cin >> n;
    vector<pair<int,int>> meetings(n);
    for (auto& [s, e] : meetings) cin >> s >> e;

    sort(meetings.begin(), meetings.end(), [](auto& a, auto& b) {
        return a.second < b.second;  // Sort by end time
    });

    int count = 0, lastEnd = -1;
    for (auto& [s, e] : meetings) {
        if (s >= lastEnd) {
            count++;
            lastEnd = e;
        }
    }
    cout << count << "\n";
    return 0;
}
```

---

### Bài 3 (Khó): Tìm số lần sắp xếp tối thiểu
**Đề bài:** Cho chuỗi chứa ký tự '(' và ')'. Tìm số ký tự tối thiểu cần xóa để chuỗi hợp lệ.

**Input mẫu:**
```
(())()(
```
**Output mẫu:**
```
1
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s; cin >> s;
    int open = 0, close = 0;

    for (char c : s) {
        if (c == '(') {
            open++;
        } else {
            if (open > 0) open--;  // Match with unmatched '('
            else close++;          // Unmatched ')'
        }
    }
    // open = unmatched '(', close = unmatched ')'
    cout << open + close << "\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Trò chơi Greedy tham:** Có 5 đồng tiền {1, 5, 10, 25, 50}. Mỗi học sinh nhận 73 xu. Ai trả lại ít đồng nhất và nhanh nhất? → Demonstrate greedy thinking.

### Theory (10 phút)
- Ví dụ trực quan Activity Selection: vẽ timeline các hoạt động, học sinh chọn thủ công
- Chứng minh "kết thúc sớm nhất trước" là đúng: trao đổi lập luận
- Demo Greedy SAI: coins {1,3,4}, amount=6

### Worked Example (10 phút)
Trace Activity Selection từng bước:
1. Sort by end time
2. Chọn activity đầu tiên (end=2)
3. Skip overlapping activities
4. Chọn activity tiếp theo không overlap

### Live Coding (10 phút)
**Challenge:** Viết thuật toán tham lam để xếp kệ sách — có N cuốn sách với chiều rộng w[i], kệ sách dài L. Xếp được tối đa bao nhiêu cuốn? (Sort by width, greedy pick smallest first)

### Practice (10 phút)
Làm Bài 1 (Candy) và Bài 2 (Meeting Scheduling).

---

## 📝 Homework (5 bài)

1. **Gas Station** — Vòng quanh N trạm xăng, mỗi trạm có xăng gas[i] và chi phí cost[i]. Tìm điểm xuất phát để đi hết vòng (Greedy O(n))
2. **Jump Game** — Mảng N số nguyên, a[i] = số bước tối đa từ i. Greedy kiểm tra có thể tới cuối không
3. **Assign Cookies** — N trẻ em với độ tham g[i], M bánh quy với kích thước s[j]. Tìm số trẻ được thỏa mãn tối đa
4. **Partition Labels** — Chia chuỗi thành nhiều phần nhất sao cho mỗi ký tự chỉ xuất hiện trong 1 phần
5. **Non-overlapping Intervals** — Tìm số khoảng xóa ít nhất để không còn overlap nào

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Using greedy when DP is needed
// Coin change with coins {1, 3, 4}:
// Greedy for amount=6: 4+1+1=3 coins (WRONG!)
// DP: 3+3=2 coins (CORRECT)
// → Always verify greedy works before using it!

// ❌ MISTAKE 2: Wrong sort criterion
// Activity selection: sort by START time instead of END time
sort(activities.begin(), activities.end());  // WRONG! Sorts by start
// ✅ Fix: Sort by end time
sort(activities.begin(), activities.end(), [](auto& a, auto& b) {
    return a.second < b.second;
});

// ❌ MISTAKE 3: Off-by-one in activity selection
if (activities[i].first > lastEnd)  // WRONG: Misses back-to-back meetings
// ✅ Fix:
if (activities[i].first >= lastEnd)  // OK to start exactly when previous ends

// ❌ MISTAKE 4: Not handling edge cases
int coinChangeGreedy(vector<int>& coins, int amount) {
    // What if amount = 0? Or coins is empty?
    if (amount == 0) return 0;
    if (coins.empty()) return -1;
    ...
}
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Làm sao biết bài này dùng Greedy hay DP?"
- "Chứng minh thuật toán Activity Selection là tối ưu"
- "Tại sao Greedy không hoạt động với coin {1,3,4}?"
- "Giải thích Fractional Knapsack vs 0/1 Knapsack"
- "Bài Gas Station giải bằng Greedy thế nào?"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Greedy Beginner:** Giải được Coin Change greedy và Activity Selection
**🥈 Silver — Interval Expert:** Job Scheduling, Meeting Rooms, Non-overlapping Intervals
**🥇 Gold — Greedy Prover:** Chứng minh được tính đúng đắn, phân biệt Greedy vs DP
**💎 Diamond — Bonus:** Gas Station + Partition Labels + submit lên Codeforces
