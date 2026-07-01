# Chuyên đề 9: Recursion & Backtracking — Đệ Quy và Quay Lui

## 🎯 Mục tiêu
- Hiểu sâu kỹ thuật Backtracking: thử → kiểm tra → quay lui
- Cài đặt bài toán mê cung (Maze Solving)
- Giải bài N-Queens kinh điển
- Sinh tất cả tổ hợp, hoán vị bằng đệ quy
- Áp dụng pruning (cắt nhánh) để tối ưu

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== GENERATE ALL SUBSETS =====
void generateSubsets(vector<int>& nums, int idx, vector<int>& current) {
    // Print current subset
    cout << "{";
    for (int i = 0; i < current.size(); i++) {
        if (i) cout << ",";
        cout << current[i];
    }
    cout << "}\n";

    for (int i = idx; i < nums.size(); i++) {
        current.push_back(nums[i]);     // Choose
        generateSubsets(nums, i+1, current);  // Explore
        current.pop_back();             // Unchoose (BACKTRACK)
    }
}

// ===== GENERATE ALL PERMUTATIONS =====
void generatePerms(vector<int>& nums, vector<bool>& used, vector<int>& current) {
    if (current.size() == nums.size()) {
        for (int x : current) cout << x << " ";
        cout << "\n";
        return;
    }
    for (int i = 0; i < nums.size(); i++) {
        if (used[i]) continue;          // Skip used elements
        used[i] = true;
        current.push_back(nums[i]);     // Choose
        generatePerms(nums, used, current);  // Explore
        current.pop_back();             // Unchoose
        used[i] = false;                // BACKTRACK
    }
}

// ===== MAZE SOLVER =====
const int WALL = 1, PATH = 0;
int dx[] = {0, 0, 1, -1};  // Right, Left, Down, Up
int dy[] = {1, -1, 0, 0};

bool solveMaze(vector<vector<int>>& maze, int x, int y, int endX, int endY,
               vector<vector<bool>>& visited) {
    int n = maze.size(), m = maze[0].size();

    // Base case: reached destination
    if (x == endX && y == endY) {
        maze[x][y] = 2;  // Mark as solution path
        return true;
    }

    // Try all 4 directions
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];

        // Check bounds, not wall, not visited
        if (nx >= 0 && nx < n && ny >= 0 && ny < m &&
            maze[nx][ny] != WALL && !visited[nx][ny]) {

            visited[nx][ny] = true;
            maze[nx][ny] = 2;   // Mark path

            if (solveMaze(maze, nx, ny, endX, endY, visited)) {
                return true;
            }

            maze[nx][ny] = PATH;  // BACKTRACK: unmark
            visited[nx][ny] = false;
        }
    }
    return false;
}

int main() {
    // Subsets of {1, 2, 3}
    vector<int> nums = {1, 2, 3};
    vector<int> current;
    cout << "All subsets:\n";
    generateSubsets(nums, 0, current);

    // Permutations of {1, 2, 3}
    vector<bool> used(3, false);
    cout << "\nAll permutations:\n";
    generatePerms(nums, used, current);

    // Maze: 0=path, 1=wall, S=start(0,0), E=end(3,3)
    vector<vector<int>> maze = {
        {0, 0, 1, 0},
        {1, 0, 1, 0},
        {0, 0, 0, 0},
        {0, 1, 1, 0}
    };
    vector<vector<bool>> visited(4, vector<bool>(4, false));
    visited[0][0] = true;

    if (solveMaze(maze, 0, 0, 3, 3, visited)) {
        cout << "\nMaze solution (2=path):\n";
        for (auto& row : maze) {
            for (int c : row) cout << c << " ";
            cout << "\n";
        }
    }
    return 0;
}
```

**Sample Output (Permutations of {1,2,3}):**
```
1 2 3
1 3 2
2 1 3
2 3 1
3 1 2
3 2 1
```

---

### N-Queens Problem

```cpp
#include <bits/stdc++.h>
using namespace std;

int n;
vector<int> col;        // col[row] = column where queen is placed
int solutions = 0;

// Check if placing queen at (row, c) is safe
bool isSafe(int row, int c) {
    for (int r = 0; r < row; r++) {
        // Same column or same diagonal
        if (col[r] == c || abs(col[r] - c) == abs(r - row)) {
            return false;
        }
    }
    return true;
}

void nQueens(int row) {
    if (row == n) {
        solutions++;
        // Print this solution
        cout << "Solution " << solutions << ": ";
        for (int r = 0; r < n; r++) cout << "(" << r << "," << col[r] << ") ";
        cout << "\n";
        return;
    }
    for (int c = 0; c < n; c++) {
        if (isSafe(row, c)) {
            col[row] = c;           // Place queen
            nQueens(row + 1);       // Try next row
            // Backtrack automatically (col[row] overwritten next iteration)
        }
    }
}

// Optimized N-Queens with bitmasking
int nQueensCount(int n) {
    int count = 0;
    function<void(int, int, int, int)> solve = [&](int row, int cols, int diag1, int diag2) {
        if (row == n) { count++; return; }
        int available = ((1 << n) - 1) & ~(cols | diag1 | diag2);
        while (available) {
            int bit = available & (-available);  // Lowest set bit
            available &= available - 1;
            solve(row + 1, cols | bit, (diag1 | bit) << 1, (diag2 | bit) >> 1);
        }
    };
    solve(0, 0, 0, 0);
    return count;
}

int main() {
    n = 4;
    col.assign(n, 0);
    cout << "N-Queens solutions for N=" << n << ":\n";
    nQueens(0);
    cout << "Total: " << solutions << "\n";

    // Fast count using bitmask
    cout << "N=8 Queens count: " << nQueensCount(8) << "\n";  // 92
    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### Template Backtracking

```
backtrack(state):
    if state is COMPLETE solution:
        record/print solution
        return
    
    for each CHOICE at this state:
        if choice is VALID (pruning):
            MAKE choice
            backtrack(next state)
            UNDO choice  ← This is the "backtrack" step!
```

### Pruning — Cắt Nhánh (Tối ưu quan trọng nhất!)

```cpp
// Without pruning: try ALL paths
// With pruning: cut branches that CAN'T lead to solution

// Example: Sum Subsets
// Find subsets with sum = target
void findSubsets(vector<int>& nums, int idx, int target, int current) {
    if (current == target) { /* found! */ return; }
    if (current > target) return;  // PRUNING: exceeded target, stop!
    if (idx == nums.size()) return;

    // Include nums[idx]
    findSubsets(nums, idx+1, target, current + nums[idx]);
    // Exclude nums[idx]
    findSubsets(nums, idx+1, target, current);
}
```

### Complexity of Backtracking

| Problem | Without Pruning | With Pruning |
|---------|----------------|-------------|
| Subsets | O(2ⁿ) | O(2ⁿ) worst case |
| Permutations | O(n!) | O(n!) worst case |
| N-Queens | O(n^n) | O(n!) with pruning |
| Sudoku | O(9^81) | Much better in practice |

Pruning không giảm worst case nhưng cải thiện **average case** rất nhiều!

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Problem | Time | Space (Stack) |
|---------|------|--------------|
| Generate Subsets (n items) | O(2ⁿ) | O(n) |
| Generate Permutations (n items) | O(n!) | O(n) |
| N-Queens (n×n) | O(n!) | O(n) |
| Maze (n×m) | O(4^(n×m)) worst | O(n×m) |
| Sudoku | O(9^81) worst | O(81) |

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Sinh tổ hợp
**Đề bài:** Nhập N và K. In tất cả tổ hợp chập K của {1, 2, ..., N} theo thứ tự từ điển.

**Input mẫu:**
```
4 2
```
**Output mẫu:**
```
1 2
1 3
1 4
2 3
2 4
3 4
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

void combine(int n, int k, int start, vector<int>& current) {
    if (current.size() == k) {
        for (int x : current) cout << x << " ";
        cout << "\n";
        return;
    }
    // Pruning: need (k - current.size()) more elements from [start..n]
    for (int i = start; i <= n - (k - current.size()) + 1; i++) {
        current.push_back(i);
        combine(n, k, i+1, current);
        current.pop_back();
    }
}

int main() {
    int n, k; cin >> n >> k;
    vector<int> current;
    combine(n, k, 1, current);
    return 0;
}
```

---

### Bài 2 (Trung bình): Sudoku Solver
**Đề bài:** Giải bảng Sudoku 9×9. Ô trống biểu diễn bằng 0. In bảng sau khi giải.

**Input mẫu:**
```
5 3 0 0 7 0 0 0 0
6 0 0 1 9 5 0 0 0
0 9 8 0 0 0 0 6 0
8 0 0 0 6 0 0 0 3
4 0 0 8 0 3 0 0 1
7 0 0 0 2 0 0 0 6
0 6 0 0 0 0 2 8 0
0 0 0 4 1 9 0 0 5
0 0 0 0 8 0 0 7 9
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int board[9][9];

bool isValid(int row, int col, int num) {
    // Check row
    for (int j = 0; j < 9; j++) if (board[row][j] == num) return false;
    // Check column
    for (int i = 0; i < 9; i++) if (board[i][col] == num) return false;
    // Check 3x3 box
    int boxRow = (row/3)*3, boxCol = (col/3)*3;
    for (int i = boxRow; i < boxRow+3; i++)
        for (int j = boxCol; j < boxCol+3; j++)
            if (board[i][j] == num) return false;
    return true;
}

bool solveSudoku() {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (board[i][j] == 0) {
                for (int num = 1; num <= 9; num++) {
                    if (isValid(i, j, num)) {
                        board[i][j] = num;      // Try
                        if (solveSudoku()) return true;
                        board[i][j] = 0;        // Backtrack
                    }
                }
                return false;  // No valid number → backtrack
            }
        }
    }
    return true;  // All cells filled
}

int main() {
    for (int i = 0; i < 9; i++)
        for (int j = 0; j < 9; j++) cin >> board[i][j];

    if (solveSudoku()) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) cout << board[i][j] << " ";
            cout << "\n";
        }
    }
    return 0;
}
```

---

### Bài 3 (Khó): Word Search
**Đề bài:** Cho bảng chữ M×N và từ W. Kiểm tra W có thể tạo thành từ các ô liền kề (4 hướng) không (không dùng lại ô).

**Input mẫu:**
```
4 4
ABCE
SFCS
ADEE
word: ABCCED
```
**Output mẫu:** `YES`

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<string> board;
string word;
int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};

bool dfs(int x, int y, int idx, vector<vector<bool>>& visited) {
    if (idx == word.size()) return true;
    if (x < 0 || x >= n || y < 0 || y >= m) return false;
    if (visited[x][y] || board[x][y] != word[idx]) return false;

    visited[x][y] = true;
    for (int d = 0; d < 4; d++) {
        if (dfs(x+dx[d], y+dy[d], idx+1, visited)) return true;
    }
    visited[x][y] = false;  // Backtrack
    return false;
}

int main() {
    cin >> n >> m;
    board.resize(n);
    for (string& row : board) cin >> row;
    cin >> word;

    vector<vector<bool>> visited(n, vector<bool>(m, false));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            if (dfs(i, j, 0, visited)) { cout << "YES\n"; return 0; }
    cout << "NO\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Trò chơi Mê cung:** Vẽ mê cung nhỏ 5×5 lên bảng, học sinh "thử đường" bằng bút chì. Khi gặp tường → tẩy và quay lại. Đây chính là backtracking!

### Theory (10 phút)
- Giải thích call tree: mỗi lựa chọn là một nhánh, backtrack = quay lại nút cha
- Demo pruning: "Nếu đã biết nhánh này không thể thành công → bỏ qua ngay!"
- Phân biệt DFS thông thường và Backtracking: backtracking UNDOES thay đổi

### Worked Example (10 phút)
Trace N-Queens N=4 lên bảng:
- Hàng 0: thử cột 0, 1, 2, 3
- Với cột 1: hàng 1 thử → bị chặn ở cột 0, 1, 2 → thử cột 3 → OK
- Continue...

### Live Coding (10 phút)
**Challenge:** Viết hàm sinh tất cả chuỗi nhị phân độ dài N:
- `00, 01, 10, 11` với N=2
- Gợi ý: tại mỗi vị trí, thử '0' rồi '1'

### Practice (10 phút)
Làm Bài 1 (Combinations). Ai xong sớm trace Maze Solver.

---

## 📝 Homework (5 bài)

1. **Phone Number Letters** — Cho số điện thoại, in tất cả chữ có thể ghép (như bàn phím điện thoại)
2. **Restore IP Addresses** — Cho chuỗi số, tìm tất cả IP address hợp lệ
3. **Rat in a Maze** — In TẤT CẢ đường đi qua mê cung (không chỉ 1 đường)
4. **Subset Sum** — Có tồn tại subset có tổng = target không?
5. **Cryptarithmetic** — Giải bài SEND + MORE = MONEY (gán chữ số cho chữ cái)

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Forgetting to backtrack (undo changes)
void permute(vector<int>& nums, int start) {
    if (start == nums.size()) { /* print */ return; }
    for (int i = start; i < nums.size(); i++) {
        swap(nums[start], nums[i]);
        permute(nums, start + 1);
        // MISSING: swap back! → Wrong permutations
    }
}
// ✅ Fix:
void permute(vector<int>& nums, int start) {
    if (start == nums.size()) { /* print */ return; }
    for (int i = start; i < nums.size(); i++) {
        swap(nums[start], nums[i]);
        permute(nums, start + 1);
        swap(nums[start], nums[i]);  // BACKTRACK: restore
    }
}

// ❌ MISTAKE 2: Marking visited but not unmarking
bool dfs(int x, int y) {
    visited[x][y] = true;
    // ... try directions ...
    // MISSING: visited[x][y] = false; at the end
    // → Can't explore other paths through this cell
}

// ❌ MISTAKE 3: Wrong base case order
void solve(int row) {
    // Check validity BEFORE checking completion
    for (int c = 0; c < n; c++) {
        // Should check isSafe FIRST, then recurse
        col[row] = c;
        solve(row + 1);  // Without safety check!
    }
}

// ❌ MISTAKE 4: No pruning on large inputs → TLE
// Always add early termination when possible
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "Tại sao backtracking cần 'undo' sau khi đệ quy?"
- "Vẽ call tree của N-Queens N=4 cho tôi xem"
- "Cách thêm pruning vào bài toán backtracking?"
- "Sudoku solver backtracking hoạt động thế nào từng bước?"
- "Bài Word Search có thể TLE không? Tối ưu ra sao?"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Path Finder:** Cài đặt maze solver cơ bản, sinh subsets
**🥈 Silver — Queen Placer:** Giải N-Queens, cài pruning cơ bản
**🥇 Gold — Backtracker:** Sudoku Solver, Word Search, sinh hoán vị
**💎 Diamond — Bonus:** Cryptarithmetic + tất cả đường mê cung + Restore IP Addresses
