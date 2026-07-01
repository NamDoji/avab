# Chuyên đề 5: Array, String & Vector — Mảng, Chuỗi và Vector

## 🎯 Mục tiêu
- Khai báo và sử dụng mảng 1 chiều và 2 chiều
- Thao tác với chuỗi: cắt, tìm kiếm, so sánh
- Sử dụng `vector` (mảng động) thành thạo
- Áp dụng các thuật toán cơ bản trên mảng (min, max, sum, reverse)
- Hiểu cách STL string và vector hoạt động

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // ===== 1D ARRAY =====
    int arr[5] = {10, 20, 30, 40, 50};  // Fixed size array
    cout << arr[0] << "\n";  // First element: 10
    cout << arr[4] << "\n";  // Last element: 50

    // Traverse with for loop
    for (int i = 0; i < 5; i++) {
        cout << arr[i] << " ";
    }
    cout << "\n";

    // Range-based for loop (modern C++)
    for (int x : arr) {
        cout << x << " ";
    }
    cout << "\n";

    // ===== 2D ARRAY =====
    int grid[3][4] = {
        {1,  2,  3,  4},
        {5,  6,  7,  8},
        {9, 10, 11, 12}
    };
    // Access: grid[row][col]
    cout << grid[1][2] << "\n";  // Row 1, Col 2: 7

    // Print 2D grid
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 4; j++) {
            cout << setw(3) << grid[i][j];
        }
        cout << "\n";
    }

    // ===== VECTOR (dynamic array) =====
    vector<int> v;              // Empty vector
    v.push_back(10);            // Add to end
    v.push_back(20);
    v.push_back(30);
    v.pop_back();               // Remove from end

    vector<int> v2(5, 0);      // Vector of 5 zeros
    vector<int> v3 = {3, 1, 4, 1, 5, 9, 2, 6};

    cout << v.size() << "\n";   // 2 (10, 20)
    cout << v.front() << "\n";  // First: 10
    cout << v.back() << "\n";   // Last: 20

    // Common vector operations
    sort(v3.begin(), v3.end());        // Sort ascending
    reverse(v3.begin(), v3.end());     // Reverse
    int minV = *min_element(v3.begin(), v3.end());  // Min value
    int maxV = *max_element(v3.begin(), v3.end());  // Max value
    int sumV = accumulate(v3.begin(), v3.end(), 0); // Sum

    // ===== STRING =====
    string s = "Hello, World!";
    cout << s.length() << "\n";     // 13
    cout << s[0] << "\n";           // 'H'
    cout << s.substr(7, 5) << "\n"; // "World" (start=7, len=5)

    // Find substring
    int pos = s.find("World");      // Returns index or string::npos
    if (pos != string::npos) {
        cout << "Found at " << pos << "\n";  // 7
    }

    // String operations
    string a = "Hello";
    string b = " World";
    string c = a + b;              // Concatenation: "Hello World"
    cout << (a < b) << "\n";       // Lexicographic comparison: 0 (false)

    // Convert to/from number
    string numStr = "12345";
    int num = stoi(numStr);         // String to int
    string back = to_string(num);   // Int to string

    return 0;
}
```

---

### Bài toán thực tế: Xử lý mảng

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);

    for (int i = 0; i < n; i++) cin >> a[i];

    // Find min and max with their indices
    int minVal = a[0], maxVal = a[0];
    int minIdx = 0, maxIdx = 0;
    for (int i = 1; i < n; i++) {
        if (a[i] < minVal) { minVal = a[i]; minIdx = i; }
        if (a[i] > maxVal) { maxVal = a[i]; maxIdx = i; }
    }
    cout << "Min: " << minVal << " at index " << minIdx << "\n";
    cout << "Max: " << maxVal << " at index " << maxIdx << "\n";

    // Prefix sum (tổng tiền tố)
    vector<long long> prefix(n + 1, 0);
    for (int i = 0; i < n; i++) {
        prefix[i+1] = prefix[i] + a[i];
    }
    // Sum of subarray a[l..r] in O(1)
    int l = 1, r = 3;  // 0-indexed
    cout << "Sum a[" << l << ".." << r << "] = "
         << prefix[r+1] - prefix[l] << "\n";

    // Frequency counting
    int freq[101] = {0};  // Assuming values 0-100
    for (int x : a) freq[x]++;
    for (int i = 0; i <= 100; i++) {
        if (freq[i] > 0) cout << i << " appears " << freq[i] << " times\n";
    }

    return 0;
}
```

**Sample Input:**
```
6
3 1 4 1 5 9
```

**Sample Output:**
```
Min: 1 at index 1
Max: 9 at index 5
Sum a[1..3] = 6
1 appears 2 times
3 appears 1 times
4 appears 1 times
5 appears 1 times
9 appears 1 times
```

---

## 💡 Khái niệm & Thuật toán

### Tổng tiền tố (Prefix Sum) — Kỹ thuật vàng

```
Mảng:  3  1  4  1  5  9
Index: 0  1  2  3  4  5
Prefix: 0  3  4  8  9 14 23

Sum(l, r) = prefix[r+1] - prefix[l]
Sum(2, 4) = prefix[5] - prefix[2] = 14 - 4 = 10 ✓ (4+1+5=10)
```

**Tại sao dùng?** Tính tổng đoạn con từ O(n) → O(1) sau O(n) tiền xử lý.

### Vector vs Array

| | Array | Vector |
|---|-------|--------|
| Kích thước | Cố định, khai báo lúc compile | Động, thay đổi runtime |
| Tốc độ | Nhanh hơn chút | Gần tương đương |
| Tiện dụng | Kém hơn | Có nhiều hàm hỗ trợ |
| Khi dùng CP | Biết trước n ≤ 10⁵ | Linh hoạt hơn |

### String thường gặp

```cpp
string s = "Hello World";

// Uppercase/lowercase
transform(s.begin(), s.end(), s.begin(), toupper);  // "HELLO WORLD"
transform(s.begin(), s.end(), s.begin(), tolower);  // "hello world"

// Check character types
isalpha('a')   // true — letter
isdigit('5')   // true — digit
isspace(' ')   // true — whitespace
isupper('A')   // true — uppercase
islower('z')   // true — lowercase

// Split by space
string word;
stringstream ss("Hello World Foo");
while (ss >> word) {
    cout << word << "\n";  // Prints each word separately
}

// Replace
s.replace(6, 5, "C++");  // Replace "World" with "C++"
```

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Thao tác | Array/Vector | String |
|---------|-------------|--------|
| Truy cập a[i] | O(1) | O(1) |
| Tìm kiếm tuyến tính | O(n) | O(n) |
| push_back | O(1) amortized | O(1) amortized |
| insert giữa | O(n) | O(n) |
| sort | O(n log n) | O(n log n) |
| Prefix sum build | O(n) | — |
| Prefix sum query | O(1) | — |
| find() | — | O(n×m) |

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Xoay mảng
**Đề bài:** Nhập mảng N phần tử và số K. In mảng sau khi xoay phải K lần (phần tử cuối về đầu).

**Input mẫu:**
```
5 2
1 2 3 4 5
```
**Output mẫu:**
```
4 5 1 2 3
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> a(n);
    for (int& x : a) cin >> x;

    k %= n;  // Handle k >= n
    // Rotate right k = reverse whole, then reverse each part
    reverse(a.begin(), a.end());
    reverse(a.begin(), a.begin() + k);
    reverse(a.begin() + k, a.end());

    for (int x : a) cout << x << " ";
    cout << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Palindrome kiểm tra
**Đề bài:** Nhập chuỗi S. Kiểm tra S có phải palindrome không (đọc xuôi ngược như nhau), bỏ qua khoảng trắng và phân biệt HOA/thường.

**Input mẫu 1:** `A man a plan a canal Panama` → **Output:** `YES`
**Input mẫu 2:** `Hello` → **Output:** `NO`

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string line;
    getline(cin, line);

    // Keep only alphanumeric, convert to lowercase
    string cleaned = "";
    for (char c : line) {
        if (isalnum(c)) cleaned += tolower(c);
    }

    string reversed = cleaned;
    reverse(reversed.begin(), reversed.end());

    cout << (cleaned == reversed ? "YES" : "NO") << "\n";
    return 0;
}
```

---

### Bài 3 (Khó): Dãy con liên tiếp có tổng lớn nhất (Kadane's Algorithm)
**Đề bài:** Nhập mảng N số nguyên (có thể âm). Tìm tổng lớn nhất của dãy con liên tiếp.

**Input mẫu:**
```
8
-2 1 -3 4 -1 2 1 -5
```
**Output mẫu:**
```
6
```
(Dãy con [4, -1, 2, 1] có tổng = 6)

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;

    int maxSum = a[0], curSum = a[0];
    for (int i = 1; i < n; i++) {
        // Either extend previous subarray or start fresh
        curSum = max(a[i], curSum + a[i]);
        maxSum = max(maxSum, curSum);
    }
    cout << maxSum << "\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Trò chơi:** "Mảng con người" — Cho 8 học sinh cầm số 3,1,4,1,5,9,2,6. Yêu cầu: tìm nhanh min/max, tính tổng, reverse. → Hỏi: "Máy tính làm khác gì?"

### Theory (10 phút)
- Giải thích chỉ số 0-based vs 1-based: "C++ bắt đầu từ 0 như tầng trệt ở VN"
- Visualize prefix sum bằng bảng: điền từng ô, giải thích cách query O(1)
- Demo vector push_back: "vector giống ba lô — có thể thêm đồ vào lúc nào cũng được"

### Worked Example (10 phút)
Cùng implement Kadane's Algorithm:
1. Trace qua ví dụ trên bảng với từng phần tử
2. Giải thích: "curSum là tổng dãy con kết thúc tại đây, maxSum là câu trả lời tốt nhất"

### Live Coding (10 phút)
**Challenge:** Viết chương trình đếm tần suất chữ cái trong chuỗi:
- Nhập chuỗi → đếm số lần xuất hiện mỗi chữ a-z
- In ra: "a: 3, b: 0, c: 1, ..."

### Practice (10 phút)
Làm Bài 1 và 2. Ai xong sớm thử Bài 3 (Kadane).

---

## 📝 Homework (5 bài)

1. **Matrix Transpose** — Nhập ma trận N×N, in ma trận chuyển vị
2. **Anagram Check** — Kiểm tra hai chuỗi có phải anagram (cùng ký tự, khác thứ tự)
3. **Moving Average** — Tính trung bình động K phần tử liên tiếp cho mảng N phần tử
4. **Spiral Matrix** — Nhập ma trận N×M, in theo thứ tự xoắn ốc
5. **Longest Common Prefix** — Tìm tiền tố chung dài nhất của N chuỗi

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Array out of bounds
int arr[5];
arr[5] = 10;  // Index 5 doesn't exist (0-4)! Undefined behavior

// ❌ MISTAKE 2: Uninitialized array
int freq[26];  // Contains garbage values!
// ✅ Fix:
int freq[26] = {0};  // All zeros
// Or:
memset(freq, 0, sizeof(freq));

// ❌ MISTAKE 3: String comparison with ==... actually OK in C++
// But don't compare C-style char arrays with ==:
char a[] = "hello";
char b[] = "hello";
// a == b is comparing addresses, not content! Use strcmp(a, b) == 0
// Better: use std::string

// ❌ MISTAKE 4: Modifying vector while iterating
vector<int> v = {1, 2, 3, 4, 5};
for (int x : v) {
    if (x == 3) v.push_back(6);  // Undefined behavior! Iterator invalidated
}
// ✅ Fix: Iterate by index, or use a separate result vector

// ❌ MISTAKE 5: substr wrong arguments
string s = "Hello";
cout << s.substr(1, 3) << "\n";  // "ell" (start=1, LENGTH=3, not end!)
// NOT s.substr(1, 3) meaning "from 1 to 3"
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Prefix sum là gì? Tại sao nó hữu ích?"
- "Giải thích Kadane's algorithm từng bước"
- "Cách in ma trận theo thứ tự xoắn ốc?"
- "Sự khác biệt giữa array, vector, và string trong C++"
- "Code của tôi bị segmentation fault, tại sao? [paste code]"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Array Handler:** Khai báo, nhập, duyệt mảng; dùng vector cơ bản
**🥈 Silver — String Surgeon:** Xử lý chuỗi, palindrome, anagram, frequency count
**🥇 Gold — Prefix Summoner:** Cài đặt prefix sum, giải Kadane, tối ưu query đoạn
**💎 Diamond — Bonus:** Spiral Matrix + Moving Average + submit Codeforces array problems
