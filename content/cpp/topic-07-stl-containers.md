# Chuyên đề 7: STL Containers — Map, Set, Queue, Stack, Priority Queue

## 🎯 Mục tiêu
- Sử dụng thành thạo `map`, `unordered_map` cho từ điển
- Dùng `set`, `multiset` cho tập hợp không lặp
- Hiểu và dùng `stack`, `queue`, `priority_queue`
- Biết khi nào chọn container nào cho đúng bài
- Giải các bài toán điển hình sử dụng STL container

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // ===== MAP (ordered key-value dictionary) =====
    map<string, int> scores;
    scores["Alice"] = 95;
    scores["Bob"] = 87;
    scores["Carol"] = 91;

    // Access
    cout << scores["Alice"] << "\n";  // 95
    cout << scores.count("David") << "\n";  // 0 (not exists)

    // Iterate (in sorted key order)
    for (auto& [name, score] : scores) {
        cout << name << ": " << score << "\n";
    }
    // Alice: 95, Bob: 87, Carol: 91

    // ===== UNORDERED_MAP (hash map - faster O(1) avg) =====
    unordered_map<string, int> freq;
    string words[] = {"apple", "banana", "apple", "cherry", "banana", "apple"};
    for (string& w : words) freq[w]++;

    for (auto& [w, cnt] : freq) {
        cout << w << ": " << cnt << "\n";
    }

    // ===== SET (sorted unique elements) =====
    set<int> s = {5, 3, 8, 1, 3, 5};  // Duplicates removed!
    cout << "Set size: " << s.size() << "\n";  // 4
    s.insert(7);
    s.erase(3);

    // Binary search on set
    auto it = s.lower_bound(4);  // First element >= 4
    cout << *it << "\n";  // 5

    // ===== MULTISET (sorted, allows duplicates) =====
    multiset<int> ms = {3, 1, 4, 1, 5, 9, 2, 6, 5};
    ms.erase(ms.find(1));  // Remove only ONE occurrence of 1
    cout << ms.size() << "\n";  // 8

    // ===== STACK (LIFO - Last In First Out) =====
    stack<int> stk;
    stk.push(1);  // Push
    stk.push(2);
    stk.push(3);
    cout << stk.top() << "\n";  // 3 (peek top)
    stk.pop();                  // Remove top
    cout << stk.top() << "\n";  // 2

    // ===== QUEUE (FIFO - First In First Out) =====
    queue<int> q;
    q.push(1);
    q.push(2);
    q.push(3);
    cout << q.front() << "\n";  // 1 (peek front)
    q.pop();                    // Remove front
    cout << q.front() << "\n";  // 2

    // ===== PRIORITY QUEUE (Max Heap by default) =====
    priority_queue<int> pq;  // Max heap
    pq.push(3);
    pq.push(1);
    pq.push(4);
    pq.push(1);
    pq.push(5);

    while (!pq.empty()) {
        cout << pq.top() << " ";  // 5 4 3 1 1
        pq.pop();
    }
    cout << "\n";

    // Min heap
    priority_queue<int, vector<int>, greater<int>> minPQ;
    minPQ.push(3); minPQ.push(1); minPQ.push(4);
    cout << minPQ.top() << "\n";  // 1 (smallest)

    return 0;
}
```

---

### Ứng dụng thực tế: Bài toán điển hình

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== PROBLEM 1: Valid Parentheses (Ngoặc hợp lệ) =====
bool isValid(string s) {
    stack<char> stk;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            stk.push(c);
        } else {
            if (stk.empty()) return false;
            if (c == ')' && stk.top() != '(') return false;
            if (c == ']' && stk.top() != '[') return false;
            if (c == '}' && stk.top() != '{') return false;
            stk.pop();
        }
    }
    return stk.empty();
}

// ===== PROBLEM 2: Top K Frequent Elements =====
vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> freq;
    for (int x : nums) freq[x]++;

    // Min heap of (frequency, number)
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    for (auto& [num, cnt] : freq) {
        pq.push({cnt, num});
        if (pq.size() > k) pq.pop();  // Keep only top k
    }

    vector<int> result;
    while (!pq.empty()) {
        result.push_back(pq.top().second);
        pq.pop();
    }
    return result;
}

// ===== PROBLEM 3: Sliding Window Maximum =====
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;  // Stores indices, decreasing order of values
    vector<int> result;

    for (int i = 0; i < nums.size(); i++) {
        // Remove elements outside window
        while (!dq.empty() && dq.front() < i - k + 1) dq.pop_front();
        // Remove smaller elements (they'll never be maximum)
        while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
        dq.push_back(i);
        // Window is full
        if (i >= k - 1) result.push_back(nums[dq.front()]);
    }
    return result;
}

int main() {
    cout << isValid("()[]{}") << "\n";    // 1 (valid)
    cout << isValid("([)]") << "\n";     // 0 (invalid)

    vector<int> nums = {1, 1, 1, 2, 2, 3};
    auto topK = topKFrequent(nums, 2);
    for (int x : topK) cout << x << " ";  // 1 2
    cout << "\n";

    vector<int> w = {1, 3, -1, -3, 5, 3, 6, 7};
    auto maxWin = maxSlidingWindow(w, 3);
    for (int x : maxWin) cout << x << " ";  // 3 3 5 5 6 7
    cout << "\n";
}
```

---

## 💡 Khái niệm & Thuật toán

### Bảng so sánh STL Containers

| Container | Cấu trúc | Insert | Find | Delete | Ordered? |
|-----------|---------|--------|------|--------|---------|
| `vector` | Array động | O(1)* | O(n) | O(n) | ❌ |
| `map` | Red-Black Tree | O(log n) | O(log n) | O(log n) | ✅ |
| `unordered_map` | Hash Table | O(1)* | O(1)* | O(1)* | ❌ |
| `set` | Red-Black Tree | O(log n) | O(log n) | O(log n) | ✅ |
| `unordered_set` | Hash Table | O(1)* | O(1)* | O(1)* | ❌ |
| `stack` | Adapter | O(1) | — | O(1) | ❌ |
| `queue` | Adapter | O(1) | — | O(1) | ❌ |
| `priority_queue` | Heap | O(log n) | O(1) top | O(log n) | Partial |

*Amortized; worst case O(n) for hash collision

### Chọn Container Nào?

```
Cần tra cứu nhanh theo key → map / unordered_map
Cần tập hợp không trùng → set / unordered_set
Cần min/max nhanh → priority_queue
Cần LIFO (undo, dfs, ngoặc) → stack
Cần FIFO (BFS, hàng đợi) → queue
Cần truy cập đầu VÀ cuối nhanh → deque
Cần mảng động linh hoạt → vector
```

### Map vs Unordered_Map

```cpp
// map: sorted by key, O(log n) operations
map<string, int> m;  // Always sorted alphabetically

// unordered_map: hash-based, O(1) average
unordered_map<string, int> um;  // No guaranteed order

// Use map when: need sorted keys, iterate in order, use lower_bound
// Use unordered_map when: need speed, don't care about order
```

---

## 📊 Độ phức tạp (Time & Space Complexity)

**Priority Queue Operations:**
- `push()`: O(log n) — thêm phần tử, sắp xếp lại heap
- `top()`: O(1) — xem phần tử lớn nhất
- `pop()`: O(log n) — xóa phần tử lớn nhất

**Dijkstra's shortest path uses priority_queue: O((V+E) log V)**

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Đếm từ xuất hiện nhiều nhất
**Đề bài:** Nhập đoạn văn bản. In ra từ xuất hiện nhiều nhất (không phân biệt HOA/thường). Nếu nhiều từ cùng số lần, in từ đầu tiên xuất hiện.

**Input mẫu:**
```
the quick brown fox jumps over the lazy dog the
```
**Output mẫu:**
```
the 3
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    map<string, int> freq;
    vector<string> order;
    string word;

    while (cin >> word) {
        transform(word.begin(), word.end(), word.begin(), tolower);
        if (!freq.count(word)) order.push_back(word);
        freq[word]++;
    }

    string bestWord = order[0];
    for (string& w : order) {
        if (freq[w] > freq[bestWord]) bestWord = w;
    }
    cout << bestWord << " " << freq[bestWord] << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Ngăn xếp tính toán RPN
**Đề bài:** Tính giá trị biểu thức dạng RPN (Reverse Polish Notation). Các phép tính: + - * /. Số và toán tử cách nhau bởi khoảng trắng.

**Input mẫu:**
```
3 4 + 2 * 7 /
```
**Output mẫu:**
```
2
```
(3+4=7, 7×2=14, 14/7=2)

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    stack<long long> stk;
    string token;

    while (cin >> token) {
        if (token == "+" || token == "-" || token == "*" || token == "/") {
            long long b = stk.top(); stk.pop();
            long long a = stk.top(); stk.pop();
            if (token == "+") stk.push(a + b);
            else if (token == "-") stk.push(a - b);
            else if (token == "*") stk.push(a * b);
            else stk.push(a / b);
        } else {
            stk.push(stoll(token));
        }
    }
    cout << stk.top() << "\n";
    return 0;
}
```

---

### Bài 3 (Khó): K Phần tử Gần nhất
**Đề bài:** Nhập mảng N số nguyên, số X, và K. Tìm K số trong mảng gần X nhất (theo trị tuyệt đối hiệu). Nếu cùng khoảng cách, ưu tiên số nhỏ hơn. In theo thứ tự tăng dần.

**Input mẫu:**
```
8 5 3
1 2 3 4 5 6 7 8
```
**Output mẫu:**
```
4 5 6
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, x, k;
    cin >> n >> x >> k;
    vector<int> a(n);
    for (int& v : a) cin >> v;

    // Sort by distance to x, then by value
    sort(a.begin(), a.end(), [&](int p, int q) {
        int dp = abs(p - x), dq = abs(q - x);
        if (dp != dq) return dp < dq;
        return p < q;
    });

    vector<int> result(a.begin(), a.begin() + k);
    sort(result.begin(), result.end());
    for (int v : result) cout << v << " ";
    cout << "\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Mô phỏng Stack/Queue:** Cho 5 học sinh: 3 người xếp hàng (queue), 3 người chồng tập sách (stack). Hỏi: "Ai ra trước?"
- Hàng đợi → người vào trước ra trước (FIFO)
- Chồng sách → cuốn trên cùng lấy ra trước (LIFO)

### Theory (10 phút)
- Vẽ sơ đồ Heap: cây nhị phân, con luôn nhỏ hơn cha (max-heap)
- Demo map vs unordered_map: map giống từ điển sắp xếp, unordered_map giống hộp hash nhanh hơn
- Khi nào dùng set: loại bỏ phần tử trùng, tìm kiếm O(log n)

### Worked Example (10 phút)
Trace bài Valid Parentheses từng bước với chuỗi `"([{}])"`:
- `(` → push
- `[` → push
- `{` → push
- `}` → match `{` → pop
- `]` → match `[` → pop
- `)` → match `(` → pop
- Stack empty → VALID ✅

### Live Coding (10 phút)
**Challenge:** Implement stack với chức năng `getMin()` O(1) — stack đặc biệt trả về min hiện tại trong O(1).

Gợi ý: Dùng 2 stack — một stack chính, một stack lưu min.

### Practice (10 phút)
Làm Bài 1. Ai xong sớm thử Bài 2 (RPN Calculator).

---

## 📝 Homework (5 bài)

1. **Group Anagrams** — Nhóm các từ là anagram của nhau (dùng map)
2. **LRU Cache** — Implement LRU Cache với map + deque
3. **Phân tích nguyên tố** — In phân tích thừa số nguyên tố (dùng map lưu tần số)
4. **Dãy số duy nhất** — Dùng set để in các phần tử duy nhất theo thứ tự xuất hiện
5. **Meeting Rooms** — Cho N buổi họp [start, end], tìm số phòng tối thiểu (dùng priority_queue)

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Accessing non-existent key creates it!
map<string, int> m;
if (m["key"] == 0) {  // This CREATES "key" with value 0!
    ...
}
// ✅ Fix: Use count() or find()
if (m.count("key") && m["key"] == 0) { ... }
if (m.find("key") != m.end()) { ... }

// ❌ MISTAKE 2: Iterating map while erasing
for (auto it = m.begin(); it != m.end(); it++) {
    if (condition) m.erase(it);  // Iterator invalidated!
}
// ✅ Fix:
for (auto it = m.begin(); it != m.end(); ) {
    if (condition) it = m.erase(it);  // erase returns next iterator
    else it++;
}

// ❌ MISTAKE 3: Using [] on const map
void process(const map<string,int>& m) {
    cout << m["key"];  // Compile error! [] is not const
}
// ✅ Fix:
void process(const map<string,int>& m) {
    cout << m.at("key");  // at() is const-safe (throws if not found)
}

// ❌ MISTAKE 4: priority_queue default is MAX heap
priority_queue<int> pq;  // MAX heap (largest on top)
// For min heap:
priority_queue<int, vector<int>, greater<int>> minPQ;
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Khi nào dùng map vs unordered_map?"
- "Priority queue min heap trong C++ viết thế nào?"
- "Tại sao dùng `m.count()` thay vì `m["key"]` để kiểm tra?"
- "Deque khác gì với queue và vector?"
- "Implement LRU Cache bằng C++ như thế nào?"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Container User:** Dùng map, set, stack, queue cơ bản
**🥈 Silver — STL Pro:** Dùng priority_queue, giải Valid Parentheses, RPN Calculator
**🥇 Gold — DS Designer:** Chọn đúng container cho bài toán, giải Sliding Window Maximum
**💎 Diamond — Bonus:** Implement Min Stack + LRU Cache + Meeting Rooms
