# Chuyên đề 14: Mock Contest — Luyện Thi 50 Bài Online Judge

## 🎯 Mục tiêu
- Thực chiến 50 bài từ các OJ (Online Judge) phổ biến
- Áp dụng tổng hợp kiến thức từ chuyên đề 1-13
- Phát triển tư duy giải quyết vấn đề dưới áp lực thời gian
- Làm quen với format thi: Codeforces, VNOJ, AtCoder, LeetCode
- Xây dựng "muscle memory" cho các thuật toán cơ bản

---

## 📋 Danh Sách 50 Bài Tập (Theo Chủ Đề)

### 🟢 Nhóm 1: Nhập Xuất & Toán Cơ Bản (Bài 1-8)

**Bài 1: A+B Problem**
- Link: Codeforces 1A style
- Đề: Nhập A, B (có thể là số rất lớn). In A+B.
- Hint: long long, cin/cout cơ bản
- ```cpp
  #include <bits/stdc++.h>
  using namespace std;
  int main() {
      long long a, b; cin >> a >> b;
      cout << a + b << "\n";
  }
  ```

**Bài 2: Tính trung bình**
- Nhập N số, in trung bình với 2 chữ số thập phân
- Hint: `cout << fixed << setprecision(2) << sum/n`

**Bài 3: Hình học cơ bản**
- Nhập 3 cạnh tam giác, kiểm tra hợp lệ, phân loại, tính diện tích (Heron)
- Hint: `sqrt(s*(s-a)*(s-b)*(s-c))` với `s=(a+b+c)/2`

**Bài 4: FizzBuzz nâng cao**
- Nhập N và hai số P, Q. Từ 1 đến N: chia hết P in "Fizz", chia hết Q in "Buzz", cả hai in "FizzBuzz", không thì in số
- Link: Codeforces 230A (similar)

**Bài 5: Palindrome số**
- Nhập N (1 ≤ N ≤ 10^9). Kiểm tra N có phải palindrome không (không convert sang string)
- Hint: Reverse số và so sánh

**Bài 6: Chia hết cho 9**
- Nhập chuỗi số rất dài (lên tới 10^100 chữ số). Kiểm tra chia hết cho 9?
- Hint: Tổng chữ số chia hết cho 9 ⟺ số chia hết cho 9

**Bài 7: Chess board**
- Nhập N, in bàn cờ N×N với '#' và '.' xen kẽ. Ô (1,1) là '#'.
- Link: Codeforces 1A style

**Bài 8: Watermelon**
- Nhập khối lượng dưa hấu W. Có thể chia thành 2 phần chẵn không?
- Link: Codeforces 4A (beginner)

---

### 🟡 Nhóm 2: Sắp Xếp & Tìm Kiếm (Bài 9-16)

**Bài 9: Sắp xếp tên**
- Nhập N tên, sắp xếp theo alphabet (không phân biệt HOA/thường)
- Hint: `sort` với custom comparator + `tolower`

**Bài 10: Phần tử thứ K**
- Nhập N số và K. In phần tử lớn thứ K (K-th largest)
- Hint: `nth_element` hoặc sort + index

**Bài 11: Hai mảng sắp xếp**
- Merge 2 sorted arrays, in kết quả sorted
- Hint: Two pointers merge

**Bài 12: Count distinct values**
- Đếm số giá trị phân biệt trong mảng
- Hint: Sort + count adjacent different, hoặc set

**Bài 13: Binary search count**
- Đếm số phần tử trong đoạn [L, R] của mảng đã sort
- Hint: `upper_bound - lower_bound`

**Bài 14: Closest pair**
- Nhập N số, tìm cặp có hiệu tuyệt đối nhỏ nhất
- Hint: Sort, check adjacent pairs

**Bài 15: Inversion count**
- Đếm số cặp nghịch thế trong mảng (i < j nhưng a[i] > a[j])
- Hint: Merge sort counting

**Bài 16: Sort by frequency**
- Sắp xếp mảng theo tần suất xuất hiện giảm dần, cùng tần suất thì tăng dần theo giá trị
- Hint: Custom comparator với frequency map

---

### 🟠 Nhóm 3: STL & Data Structures (Bài 17-24)

**Bài 17: Word frequency**
- Đếm tần suất từ, in top-5 từ phổ biến nhất
- Hint: map + priority_queue

**Bài 18: Stack simulation**
- Simulate stack với commands: push x, pop, top, isEmpty
- Link: Codeforces-style stack problem

**Bài 19: Queue simulation**
- Simulate queue: enqueue, dequeue, front, size
- Thêm challenge: circular queue với array

**Bài 20: Bracket matching**
- Kiểm tra chuỗi có nhiều loại ngoặc `()[]{}` hợp lệ
- Link: LeetCode 20

**Bài 21: Set operations**
- Nhập 2 tập hợp, tính giao (intersection), hợp (union), hiệu (difference)
- Hint: `set_intersection`, `set_union`, `set_difference`

**Bài 22: Map anagram groups**
- Nhập N từ, nhóm các anagram lại với nhau
- Hint: Sort each word as key → map<string, vector<string>>

**Bài 23: Priority Queue - Tasks**
- Có N task với priority và deadline. Process tasks theo priority, in thứ tự xử lý
- Hint: priority_queue<pair<int,int>>

**Bài 24: Sliding Window Maximum**
- Mảng N số, cửa sổ kích thước K, in max của mỗi cửa sổ
- Link: LeetCode 239 (Hard → Medium sau khi học deque)

---

### 🔴 Nhóm 4: Đệ Quy & Backtracking (Bài 25-30)

**Bài 25: Power set**
- In tất cả tập con của {1..N} theo thứ tự từ điển
- Hint: Backtracking

**Bài 26: Permutations**
- In tất cả hoán vị của chuỗi, không lặp
- Hint: next_permutation hoặc backtracking với used[]

**Bài 27: N-Queens count**
- Đếm số cách đặt N quân hậu trên bàn cờ N×N
- Hint: Backtracking + bitmask optimization

**Bài 28: Maze shortest path**
- Lưới N×M, tìm đường ngắn nhất từ (0,0) đến (N-1,M-1)
- Hint: BFS (NOT DFS - DFS doesn't give shortest path!)

**Bài 29: Phone keypad**
- Nhập chuỗi số, in tất cả chữ có thể ghép (phone keypad mapping)
- Link: LeetCode 17

**Bài 30: Sudoku Solver**
- Giải bảng Sudoku 9×9
- Hint: Backtracking với constraint propagation

---

### 🟣 Nhóm 5: Greedy & DP (Bài 31-40)

**Bài 31: Activity Selection**
- N hoạt động [start, end], chọn nhiều nhất
- Hint: Sort by end time

**Bài 32: Coin Change minimum**
- Tìm số đồng xu ít nhất để đổi amount
- Link: LeetCode 322

**Bài 33: Climbing Stairs**
- Đếm số cách leo N bậc (mỗi bước 1 hoặc 2 bậc)
- Link: LeetCode 70

**Bài 34: Maximum subarray**
- Tìm dãy con liên tiếp có tổng lớn nhất (Kadane's)
- Link: LeetCode 53

**Bài 35: LIS length**
- Tìm độ dài LIS (Longest Increasing Subsequence)
- Link: LeetCode 300, VNOJ: NKSEQ

**Bài 36: Knapsack 01**
- 0/1 Knapsack cổ điển
- Link: VNOJ: KNAPSK

**Bài 37: Edit Distance**
- Tính số thao tác ít nhất (insert/delete/replace) để biến s1 thành s2
- Link: LeetCode 72

**Bài 38: Unique Paths**
- Đếm đường đi trên lưới M×N từ (0,0) đến (M-1,N-1)
- Link: LeetCode 62

**Bài 39: Longest Common Subsequence**
- Link: LeetCode 1143, VNOJ: LCS

**Bài 40: Gas Station**
- N trạm xăng vòng tròn, tìm điểm xuất phát
- Link: LeetCode 134

---

### 🔵 Nhóm 6: Đồ Thị (Bài 41-47)

**Bài 41: Number of Islands**
- Đếm số đảo trên lưới (DFS/BFS flood fill)
- Link: LeetCode 200

**Bài 42: BFS shortest path**
- Đường ngắn nhất unweighted graph
- Link: VNOJ: GRAPH

**Bài 43: Detect cycle**
- Phát hiện chu trình trong đồ thị vô hướng (Union-Find)
- Link: LeetCode 684

**Bài 44: Topological Sort**
- Sắp xếp topo của DAG
- Link: VNOJ: TOPO, LeetCode 207

**Bài 45: Dijkstra**
- Đường ngắn nhất có trọng số không âm
- Link: VNOJ: ROADS

**Bài 46: MST (Kruskal)**
- Cây khung nhỏ nhất
- Link: VNOJ: MST

**Bài 47: Bipartite check**
- Kiểm tra đồ thị hai phía (2-colorable)
- Link: LeetCode 785

---

### ⚡ Nhóm 7: Mixed & Challenge (Bài 48-50)

**Bài 48: VNOJ - Codeforces Div2 B**
- Tự chọn 1 bài Codeforces Div2 B (rating ~1200-1400)
- Submit và lấy AC

**Bài 49: VNOJ - Codeforces Div2 C**
- Tự chọn 1 bài Codeforces Div2 C (rating ~1500-1700)
- Được dùng editorial hint nếu stuck > 30 phút

**Bài 50: Final Challenge**
- Tự chọn bài yêu thích nhất từ các chủ đề đã học
- Viết editorial (giải thích thuật toán) cho bài đó

---

## 🏆 Cấu Trúc Mock Contest

### Contest 1: Speed Round (90 phút)
Giải bài 1-8 (nhóm I/O và math cơ bản)
Mục tiêu: AC tất cả 8 bài

### Contest 2: Classic Algorithms (120 phút)
Giải bài 9-20 (sort, search, STL)
Mục tiêu: AC ít nhất 8/12 bài

### Contest 3: Full Contest (180 phút)
Codeforces-style: 5 bài, thời gian thực
Chọn ngẫu nhiên từ các nhóm
Mục tiêu: AC ít nhất 3 bài

---

## 💡 Các Online Judge Để Luyện

| OJ | URL | Đặc điểm |
|----|-----|----------|
| Codeforces | codeforces.com | Phổ biến nhất, rating system |
| VNOJ | oj.vnoi.info | Tiếng Việt, bài VN |
| AtCoder | atcoder.jp | Nhật Bản, bài chất lượng cao |
| LeetCode | leetcode.com | Interview-focused, có IDE online |
| SPOJ | spoj.com | Nhiều bài kinh điển |
| Kattis | open.kattis.com | Sáng tạo, bài thực tế |

---

## 📊 Tracking Progress

### Bảng theo dõi (điền vào sau mỗi bài):

| Bài | Trạng thái | Thời gian | Số lần submit | Ghi chú |
|-----|-----------|---------|--------------|--------|
| 1 | ✅ AC | 5 phút | 1 | easy |
| 2 | ✅ AC | 8 phút | 2 | forgot precision |
| 3 | 🔄 WA | 15 phút | 3 | float comparison bug |
| ... | | | | |

**Màu sắc:**
- ✅ AC (Accepted) — Xanh lá
- 🔄 WA/TLE/RE — Đỏ → cần xem lại
- ⏳ Chưa làm — Trắng

---

## 🎮 Hoạt động lớp (45 phút × 2 buổi)

### Buổi 1: Individual Contest

#### Warm Up (5 phút)
GV giải thích format contest: các loại verdict (AC, WA, TLE, RE, MLE, CE)

#### Contest Time (35 phút)
5 bài được chọn sẵn từ các nhóm khác nhau:
- Bài A: Nhóm 1 (dễ)
- Bài B: Nhóm 2 (trung bình)
- Bài C: Nhóm 3/4 (trung bình)
- Bài D: Nhóm 5 (khó)
- Bài E: Nhóm 6 (khó)

#### Debrief (5 phút)
Ai giải được bài nào? Approach của bài khó nhất?

### Buổi 2: Team Contest

#### Team Setup (5 phút)
Chia nhóm 2-3 người

#### Team Contest (35 phút)
Mỗi nhóm: 1 máy tính, 5 bài. Ai code, ai think?

#### Award Ceremony (5 phút)
Trao huy hiệu cho nhóm thắng + cá nhân xuất sắc

---

## 📝 Homework: 50 Bài Tập

Mỗi tuần giải ít nhất 5 bài từ danh sách trên. Theo dõi progress trong bảng tracking.

**Gợi ý lộ trình:**
- Tuần 1: Bài 1-10 (warm up)
- Tuần 2: Bài 11-20 (data structures)
- Tuần 3: Bài 21-30 (recursion + backtracking)
- Tuần 4: Bài 31-40 (greedy + DP)
- Tuần 5: Bài 41-47 (graphs)
- Tuần 6: Bài 48-50 + review

---

## ❌ Contest Mistakes to Avoid

```
1. Đọc đề không kỹ → WA vì sai output format
2. Không test edge case n=1 → WA
3. Dùng int thay vì long long → WA vì overflow
4. Không add fast I/O → TLE
5. Stuck quá lâu 1 bài → bỏ lỡ bài khác dễ hơn
6. Submit chưa test → WA tốn penalty time
7. Panic và viết code ngẫu nhiên → bug nhiều hơn
8. Không đọc tất cả bài trước → bỏ lỡ bài dễ cuối
```

---

## 🤖 AI Coach

**Trong contest, hỏi AI:**
- "Bài này hint nhẹ thôi, không spoil" (khi stuck > 20 phút)
- "Review code này có bug không?" (sau khi WA)
- "Cách tiếp cận bài [mô tả] nào phù hợp với constraints n=10⁵?"
- "Giải thích WA case: input=[...], expected=[...], got=[...]"

**Sau contest:**
- "Giải thích editorial của bài tôi không làm được"
- "Code clean hơn cho bài này trông thế nào?"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — OJ Explorer:** AC 15/50 bài, submit lên ít nhất 2 OJ khác nhau
**🥈 Silver — Contest Fighter:** AC 30/50 bài, tham gia ít nhất 1 real contest
**🥇 Gold — AC Hunter:** AC 45/50 bài, rating trên Codeforces ≥ 1000
**💎 Diamond — Champion:** AC 50/50 + Codeforces rating ≥ 1200 (Specialist) + giúp bạn bè

---

## 🎯 Resources cho Tự Học

**Websites:**
- **USACO Guide** (usaco.guide) — roadmap học CP tốt nhất
- **CP-algorithms** (cp-algorithms.com) — giải thích thuật toán chi tiết
- **Codeforces EDU** — courses miễn phí

**YouTube:**
- **Errichto** — giải thích thuật toán rõ
- **William Lin** — speedcoding tham khảo
- **Back To Back SWE** — data structures visual

**Books:**
- "Competitive Programmer's Handbook" (Antti Laaksonen) — FREE online
- "Introduction to Algorithms" (CLRS) — sách nền tảng
