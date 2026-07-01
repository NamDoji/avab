# Chuyên đề 6: Sorting & Searching — Sắp Xếp và Tìm Kiếm

## 🎯 Mục tiêu
- Hiểu và cài đặt Bubble Sort từ đầu
- Sử dụng STL `sort()` thành thạo với custom comparator
- Cài đặt Binary Search và hiểu điều kiện áp dụng
- Thành thạo kỹ thuật Two Pointers
- Giải các bài toán tìm kiếm và sắp xếp điển hình

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== BUBBLE SORT =====
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
                swapped = true;
            }
        }
        if (!swapped) break;  // Already sorted: early exit
    }
}

// ===== SELECTION SORT =====
void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
    }
}

// ===== BINARY SEARCH (manual) =====
int binarySearch(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;  // Avoid overflow: NOT (lo+hi)/2
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;  // Not found
}

int main() {
    vector<int> v = {64, 34, 25, 12, 22, 11, 90};

    // Bubble sort
    bubbleSort(v);
    for (int x : v) cout << x << " ";  // 11 12 22 25 34 64 90
    cout << "\n";

    // STL sort (fastest, O(n log n))
    vector<int> v2 = {5, 2, 8, 1, 9, 3};
    sort(v2.begin(), v2.end());              // Ascending
    sort(v2.begin(), v2.end(), greater<int>());  // Descending

    // Sort with custom comparator
    vector<pair<int,int>> pairs = {{3,1},{1,3},{2,2},{1,1}};
    sort(pairs.begin(), pairs.end(), [](auto& a, auto& b) {
        if (a.first != b.first) return a.first < b.first;  // Sort by first
        return a.second < b.second;  // Tie-break by second
    });

    // Binary search (array MUST be sorted!)
    sort(v.begin(), v.end());
    int idx = binarySearch(v, 25);
    cout << "Found 25 at index " << idx << "\n";  // 3

    // STL binary search functions
    auto it = lower_bound(v.begin(), v.end(), 22);  // First element >= 22
    auto it2 = upper_bound(v.begin(), v.end(), 22); // First element > 22
    cout << "lower_bound(22) = index " << (it - v.begin()) << "\n";
    cout << "upper_bound(22) = index " << (it2 - v.begin()) << "\n";

    // Check if element exists
    bool found = binary_search(v.begin(), v.end(), 25);  // true
    cout << "25 exists: " << found << "\n";

    return 0;
}
```

---

### Two Pointers Technique

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== TWO SUM: Find pair with given sum =====
pair<int,int> twoSum(vector<int>& arr, int target) {
    sort(arr.begin(), arr.end());
    int left = 0, right = arr.size() - 1;

    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return {arr[left], arr[right]};
        else if (sum < target) left++;   // Need bigger sum
        else right--;                    // Need smaller sum
    }
    return {-1, -1};  // Not found
}

// ===== REMOVE DUPLICATES in-place =====
int removeDups(vector<int>& arr) {
    if (arr.empty()) return 0;
    sort(arr.begin(), arr.end());
    int write = 0;  // Write pointer
    for (int read = 0; read < arr.size(); read++) {
        if (read == 0 || arr[read] != arr[read-1]) {
            arr[write++] = arr[read];
        }
    }
    return write;  // New size
}

// ===== CONTAINER WITH MOST WATER =====
int maxWater(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int maxArea = 0;
    while (left < right) {
        int h = min(height[left], height[right]);
        int area = h * (right - left);
        maxArea = max(maxArea, area);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxArea;
}

int main() {
    vector<int> arr = {2, 7, 11, 15};
    auto [a, b] = twoSum(arr, 9);
    cout << a << " + " << b << " = 9\n";  // 2 + 7 = 9

    vector<int> dups = {1, 1, 2, 2, 3};
    int newSize = removeDups(dups);
    for (int i = 0; i < newSize; i++) cout << dups[i] << " ";
    cout << "\n";  // 1 2 3

    vector<int> walls = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    cout << maxWater(walls) << "\n";  // 49

    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### So sánh các thuật toán sắp xếp

| Thuật toán | Tốt nhất | Trung bình | Xấu nhất | Ổn định |
|-----------|---------|-----------|---------|--------|
| Bubble Sort | O(n) | O(n²) | O(n²) | ✅ |
| Selection Sort | O(n²) | O(n²) | O(n²) | ❌ |
| Insertion Sort | O(n) | O(n²) | O(n²) | ✅ |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | ❌ |
| **STL sort** | O(n log n) | O(n log n) | O(n log n) | ❌ |

**Trong competitive programming:** Luôn dùng `sort()` của STL! Nhanh nhất, ít bug nhất.

### Binary Search — Khi nào áp dụng?
1. Mảng **đã được sắp xếp**
2. Bài toán có cấu trúc **đơn điệu** (monotonic): nếu x thỏa mãn thì x+1 cũng thỏa mãn (hoặc ngược lại)

### Template Binary Search
```cpp
// Find FIRST position where condition is true
// Condition: arr[mid] >= target
int lo = 0, hi = n - 1, ans = -1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] >= target) {
        ans = mid;    // This could be the answer
        hi = mid - 1; // Try to find earlier position
    } else {
        lo = mid + 1;
    }
}
```

### Two Pointers — Khi nào áp dụng?
- Mảng đã sắp xếp, cần tìm **cặp/bộ** thỏa mãn điều kiện
- Sliding window: cửa sổ trượt trên mảng
- Palindrome check: so sánh từ hai đầu vào giữa

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Thao tác | Complexity |
|---------|-----------|
| Bubble/Selection Sort | O(n²) |
| STL sort | O(n log n) |
| Binary Search | O(log n) |
| lower_bound / upper_bound | O(log n) |
| Two Pointers | O(n) |

**Ứng dụng thực tế:**
- n = 10⁵: dùng O(n log n) sort ✅
- n = 10⁴: O(n²) bubble sort vừa đủ ⚠️
- n = 10⁶: PHẢI O(n log n) hoặc tốt hơn

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Số xuất hiện nhiều nhất
**Đề bài:** Nhập N số nguyên (1 ≤ a[i] ≤ 10⁶). Tìm số xuất hiện nhiều nhất. Nếu nhiều số cùng xuất hiện nhiều nhất, in số nhỏ nhất.

**Input mẫu:**
```
7
3 1 4 1 5 9 2
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
    int n; cin >> n;
    map<int,int> freq;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        freq[x]++;
    }
    int bestNum = -1, bestFreq = 0;
    for (auto [num, cnt] : freq) {
        if (cnt > bestFreq) {
            bestFreq = cnt;
            bestNum = num;
        }
    }
    cout << bestNum << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Đếm cặp có tổng bằng K
**Đề bài:** Nhập N số nguyên và K. Đếm số cặp (i, j) với i < j và a[i] + a[j] = K.

**Input mẫu:**
```
6 9
2 7 4 5 3 6
```
**Output mẫu:**
```
3
```
(Các cặp: (2,7), (4,5), (3,6))

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k; cin >> n >> k;
    vector<int> a(n);
    for (int& x : a) cin >> x;
    sort(a.begin(), a.end());

    int count = 0;
    int left = 0, right = n - 1;
    while (left < right) {
        int sum = a[left] + a[right];
        if (sum == k) {
            count++;
            left++; right--;
        } else if (sum < k) left++;
        else right--;
    }
    cout << count << "\n";
    return 0;
}
```

---

### Bài 3 (Khó): Tìm vị trí chèn
**Đề bài:** Nhập mảng N phần tử đã sắp xếp tăng dần và Q truy vấn. Mỗi truy vấn gồm số X — tìm vị trí (1-indexed) mà X sẽ được chèn vào để mảng vẫn sắp xếp. Nếu X đã tồn tại, in vị trí đó.

**Input mẫu:**
```
5 3
1 3 5 7 9
2
5
10
```
**Output mẫu:**
```
2
3
6
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, q; cin >> n >> q;
    vector<int> a(n);
    for (int& x : a) cin >> x;

    while (q--) {
        int x; cin >> x;
        // lower_bound returns iterator to first element >= x
        int pos = lower_bound(a.begin(), a.end(), x) - a.begin();
        cout << pos + 1 << "\n";  // +1 for 1-indexed
    }
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Trò chơi số bí mật:** GV nghĩ số 1-100, học sinh đoán. GV chỉ nói "cao hơn" / "thấp hơn". Đếm số lần đoán. → Tối ưu: Binary Search! Tối đa 7 lần (2⁷=128>100).

### Theory (10 phút)
- Vẽ Bubble Sort trực quan: học sinh đứng hàng cầm số, swap khi sai thứ tự
- Vẽ Binary Search: thu hẹp khoảng tìm kiếm bằng một nửa mỗi bước
- Explain Two Pointers với hình hai mũi tên chạy ngược chiều

### Worked Example (10 phút)
Trace Binary Search tay:
- Mảng: [1, 3, 5, 7, 9, 11, 13, 15], target = 7
- Step 1: lo=0, hi=7, mid=3, arr[3]=7 → FOUND!
- Trace một lần nữa với target=6 → NOT FOUND

### Live Coding (10 phút)
**Challenge:** Implement Insertion Sort (bài tập tư duy):
```
Ý tưởng: Duyệt từ i=1, đưa arr[i] vào đúng vị trí trong arr[0..i-1]
```

### Practice (10 phút)
Làm Bài 1 và 2. Ai xong sớm thử tìm hiểu `lower_bound` / `upper_bound`.

---

## 📝 Homework (5 bài)

1. **Merge Two Sorted Arrays** — Gộp 2 mảng đã sắp xếp thành 1 mảng sắp xếp (O(n+m))
2. **Find Peak Element** — Tìm một phần tử "đỉnh" (lớn hơn cả hai phần tử kề) bằng Binary Search O(log n)
3. **Kth Smallest** — Tìm phần tử lớn thứ K trong mảng (không dùng sort)
4. **Count Inversions** — Đếm số cặp (i,j) với i<j nhưng a[i]>a[j] (dùng merge sort)
5. **3Sum** — Tìm tất cả bộ ba số có tổng = 0 (không lặp lại)

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Binary search on unsorted array
vector<int> v = {5, 2, 8, 1};
// DON'T: binary_search(v.begin(), v.end(), 8);  // Wrong! Undefined behavior
// ✅: Sort first, then search
sort(v.begin(), v.end());
binary_search(v.begin(), v.end(), 8);

// ❌ MISTAKE 2: Overflow in mid calculation
int mid = (lo + hi) / 2;  // lo+hi might overflow if both are ~INT_MAX
// ✅ Fix:
int mid = lo + (hi - lo) / 2;

// ❌ MISTAKE 3: Infinite loop in binary search
while (lo < hi) {         // Wrong condition for some templates
    int mid = (lo + hi) / 2;
    if (arr[mid] >= target) hi = mid;    // hi = mid, not mid-1
    else lo = mid + 1;
}
// Study which template to use for which problem!

// ❌ MISTAKE 4: Custom comparator must be strict weak ordering
sort(v.begin(), v.end(), [](int a, int b) {
    return a <= b;  // WRONG: <= is not strict (causes UB)
});
// ✅ Fix:
sort(v.begin(), v.end(), [](int a, int b) {
    return a < b;  // Strict less than
});
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Giải thích Binary Search bằng ví dụ đơn giản"
- "Sự khác biệt giữa lower_bound và upper_bound?"
- "Two Pointers pattern hoạt động thế nào?"
- "Tại sao không nên dùng (lo+hi)/2?"
- "Tôi muốn sort mảng pair theo thứ tự: tăng dần theo first, giảm dần theo second"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Sorter:** Implement Bubble Sort, dùng STL sort cơ bản
**🥈 Silver — Searcher:** Binary Search tay, dùng lower/upper_bound, Two Sum với Two Pointers
**🥇 Gold — Algorithm Pro:** Custom comparator, Count Pairs, Merge Sorted Arrays
**💎 Diamond — Bonus:** Count Inversions (O(n log n) merge sort) + 3Sum problem
