# Chuyên đề 15: Final Project — Dự Án Cuối Khóa

## 🎯 Mục tiêu
- Tổng hợp và áp dụng toàn bộ kiến thức C++ và thuật toán đã học
- Phát triển kỹ năng thiết kế và lập trình dự án hoàn chỉnh
- Học cách đọc, viết, và trình bày code chuyên nghiệp
- Làm việc nhóm hoặc cá nhân để hoàn thành sản phẩm thực sự
- Chuẩn bị portfolio cho olympiad và phỏng vấn

---

## 🗂️ Ba Lựa Chọn Dự Án

---

## 🏆 Dự Án A: Mini Online Judge (Hệ thống chấm điểm tự động)

### Mô tả
Xây dựng hệ thống chấm điểm code tự động trong terminal: học sinh nhập code → hệ thống compile → chạy test case → báo điểm.

### Tính năng cốt lõi
1. Quản lý bài toán (problem set) bằng file
2. Nhận code C++ từ người dùng
3. Compile code bằng `g++`
4. Chạy với nhiều test case
5. So sánh output và báo AC/WA/TLE

### Code Khung (C++)

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== PROBLEM STRUCTURE =====
struct Problem {
    int id;
    string title;
    string statement;
    vector<pair<string,string>> testCases;  // {input, expectedOutput}
    int timeLimit;  // seconds
};

// ===== JUDGE ENGINE =====
class Judge {
public:
    struct Verdict {
        string status;  // AC, WA, TLE, CE, RE
        int passedTests;
        int totalTests;
        double timeUsed;
        string errorMsg;
    };

    Verdict judge(const string& code, const Problem& prob) {
        Verdict v;
        v.totalTests = prob.testCases.size();
        v.passedTests = 0;

        // Write code to temp file
        string codeFile = "/tmp/solution.cpp";
        string exeFile  = "/tmp/solution";
        ofstream f(codeFile);
        f << code;
        f.close();

        // Compile
        string compileCmd = "g++ -O2 -o " + exeFile + " " + codeFile + " 2>/tmp/ce.txt";
        int compileResult = system(compileCmd.c_str());
        if (compileResult != 0) {
            v.status = "CE";
            ifstream ceFile("/tmp/ce.txt");
            v.errorMsg = string((istreambuf_iterator<char>(ceFile)),
                                istreambuf_iterator<char>());
            return v;
        }

        // Run each test case
        for (int i = 0; i < prob.testCases.size(); i++) {
            auto [input, expected] = prob.testCases[i];

            // Write input
            ofstream inFile("/tmp/input.txt");
            inFile << input;
            inFile.close();

            // Run with time limit
            string runCmd = "timeout " + to_string(prob.timeLimit) +
                           " " + exeFile + " < /tmp/input.txt > /tmp/output.txt 2>/dev/null";

            auto start = chrono::high_resolution_clock::now();
            int runResult = system(runCmd.c_str());
            auto end = chrono::high_resolution_clock::now();
            v.timeUsed = chrono::duration<double>(end - start).count();

            if (runResult != 0) {
                v.status = (runResult == 124) ? "TLE" : "RE";
                return v;
            }

            // Compare output
            ifstream outFile("/tmp/output.txt");
            string actualOutput((istreambuf_iterator<char>(outFile)),
                                istreambuf_iterator<char>());

            // Trim trailing whitespace for comparison
            while (!actualOutput.empty() && isspace(actualOutput.back()))
                actualOutput.pop_back();
            string trimExpected = expected;
            while (!trimExpected.empty() && isspace(trimExpected.back()))
                trimExpected.pop_back();

            if (actualOutput == trimExpected) {
                v.passedTests++;
            } else {
                v.status = "WA";
                cout << "Test " << i+1 << " failed!\n";
                cout << "Expected: " << trimExpected << "\n";
                cout << "Got:      " << actualOutput << "\n";
                return v;
            }
        }

        v.status = "AC";
        return v;
    }
};

// ===== PROBLEM DATABASE =====
class ProblemDB {
    map<int, Problem> problems;

public:
    void addProblem(Problem p) { problems[p.id] = p; }

    Problem* getProblem(int id) {
        if (problems.count(id)) return &problems[id];
        return nullptr;
    }

    void listProblems() {
        cout << "\n=== Available Problems ===\n";
        for (auto& [id, p] : problems) {
            cout << "[" << id << "] " << p.title << "\n";
        }
    }
};

// ===== MAIN INTERFACE =====
int main() {
    ios::sync_with_stdio(false);

    // Initialize problem database
    ProblemDB db;

    Problem p1;
    p1.id = 1;
    p1.title = "Sum of Two Numbers";
    p1.statement = "Given A and B, print A+B.";
    p1.testCases = {
        {"1 2\n", "3"},
        {"100 200\n", "300"},
        {"-5 3\n", "-2"}
    };
    p1.timeLimit = 1;
    db.addProblem(p1);

    Problem p2;
    p2.id = 2;
    p2.title = "Reverse Array";
    p2.statement = "Given N numbers, print them in reverse order.";
    p2.testCases = {
        {"5\n1 2 3 4 5\n", "5 4 3 2 1"},
        {"3\n10 20 30\n", "30 20 10"}
    };
    p2.timeLimit = 1;
    db.addProblem(p2);

    // Add more problems here...

    Judge judge;

    while (true) {
        cout << "\n========= MINI ONLINE JUDGE =========\n";
        cout << "1. View Problems\n";
        cout << "2. Submit Solution\n";
        cout << "3. Exit\n";
        cout << "Choice: ";

        int choice; cin >> choice;

        if (choice == 1) {
            db.listProblems();

        } else if (choice == 2) {
            db.listProblems();
            cout << "\nEnter Problem ID: ";
            int id; cin >> id;

            Problem* prob = db.getProblem(id);
            if (!prob) { cout << "Problem not found!\n"; continue; }

            cout << "\n--- " << prob->title << " ---\n";
            cout << prob->statement << "\n\n";
            cout << "Paste your C++ solution (end with 'END' on its own line):\n";

            string code = "", line;
            cin.ignore();
            while (getline(cin, line) && line != "END") {
                code += line + "\n";
            }

            cout << "\nJudging...\n";
            auto verdict = judge.judge(code, *prob);

            cout << "\n=== RESULT: " << verdict.status << " ===\n";
            cout << "Passed: " << verdict.passedTests << "/" << verdict.totalTests << " tests\n";
            if (!verdict.errorMsg.empty()) {
                cout << "Error:\n" << verdict.errorMsg << "\n";
            }
            cout << "Time: " << fixed << setprecision(3) << verdict.timeUsed << "s\n";

        } else if (choice == 3) {
            cout << "Goodbye!\n";
            break;
        }
    }
    return 0;
}
```

### Tính năng mở rộng (Bonus)
- Scoreboard với tên học sinh và điểm số
- Thêm 20+ bài toán từ các chủ đề đã học
- Multiple programming language support
- Web interface bằng Flask (Python) + frontend

---

## 🎨 Dự Án B: Algorithm Visualizer (Hiển thị thuật toán)

### Mô tả
Chương trình terminal animation hiển thị thuật toán đang chạy từng bước: sorting, pathfinding trên đồ thị.

### Code Khung

```cpp
#include <bits/stdc++.h>
using namespace std;

// ANSI color codes for terminal visualization
#define RESET   "\033[0m"
#define RED     "\033[31m"
#define GREEN   "\033[32m"
#define YELLOW  "\033[33m"
#define BLUE    "\033[34m"
#define MAGENTA "\033[35m"
#define CYAN    "\033[36m"
#define BOLD    "\033[1m"

// Clear screen
void clearScreen() { cout << "\033[2J\033[1;1H"; }

// Sleep for ms milliseconds
void sleep_ms(int ms) {
    usleep(ms * 1000);
}

// ===== BUBBLE SORT VISUALIZER =====
class BubbleSortVisualizer {
    vector<int> arr;
    int comparisons = 0, swaps = 0;

    void display(int highlight1 = -1, int highlight2 = -1, int sorted_from = -1) {
        clearScreen();
        cout << BOLD << "=== BUBBLE SORT VISUALIZER ===" << RESET << "\n\n";

        int maxVal = *max_element(arr.begin(), arr.end());

        // Draw bars
        for (int row = maxVal; row >= 1; row--) {
            for (int col = 0; col < arr.size(); col++) {
                if (arr[col] >= row) {
                    if (col == highlight1 || col == highlight2)
                        cout << RED << "█" << RESET;
                    else if (col >= sorted_from && sorted_from != -1)
                        cout << GREEN << "█" << RESET;
                    else
                        cout << CYAN << "█" << RESET;
                } else {
                    cout << " ";
                }
                cout << " ";
            }
            cout << "\n";
        }

        // Draw values
        for (int x : arr) cout << x << " ";
        cout << "\n\n";
        cout << "Comparisons: " << comparisons << "  Swaps: " << swaps << "\n";
    }

public:
    BubbleSortVisualizer(int n, int maxVal = 20) {
        mt19937 rng(42);
        arr.resize(n);
        for (int& x : arr) x = rng() % maxVal + 1;
    }

    void sort_visual(int delay_ms = 100) {
        int n = arr.size();
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                comparisons++;
                display(j, j+1, n-i);

                if (arr[j] > arr[j+1]) {
                    swap(arr[j], arr[j+1]);
                    swaps++;
                }
                sleep_ms(delay_ms);
            }
        }
        display(-1, -1, 0);
        cout << "\nSorted! Press Enter to continue...";
        cin.get();
    }
};

// ===== MAZE VISUALIZER =====
class MazeVisualizer {
    vector<vector<int>> maze;
    int n, m;

    void display(int curX = -1, int curY = -1) {
        clearScreen();
        cout << BOLD << "=== MAZE SOLVER (BFS) ===" << RESET << "\n\n";
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (i == curX && j == curY)
                    cout << RED << "@ " << RESET;
                else if (maze[i][j] == 1)
                    cout << BOLD << "██" << RESET;
                else if (maze[i][j] == 2)
                    cout << GREEN << "· " << RESET;  // Visited
                else if (maze[i][j] == 3)
                    cout << YELLOW << "* " << RESET;  // Path
                else if (i == 0 && j == 0)
                    cout << BLUE << "S " << RESET;
                else if (i == n-1 && j == m-1)
                    cout << MAGENTA << "E " << RESET;
                else
                    cout << "  ";
            }
            cout << "\n";
        }
        cout << "\n";
        sleep_ms(50);
    }

public:
    MazeVisualizer() {
        n = 10; m = 20;
        maze = {
            {0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0},
            {1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,1,1,0},
            {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
            {0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,0},
            {0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0},
            {1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,0,0,0},
            {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0},
            {0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,0,0,0,0},
            {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0},
            {0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0}
        };
    }

    void solveBFS() {
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        queue<pair<int,int>> q;
        vector<vector<pair<int,int>>> parent(n, vector<pair<int,int>>(m, {-1,-1}));
        vector<vector<bool>> visited(n, vector<bool>(m, false));

        q.push({0,0}); visited[0][0] = true;

        while (!q.empty()) {
            auto [x, y] = q.front(); q.pop();
            display(x, y);
            maze[x][y] = 2;  // Mark visited

            if (x == n-1 && y == m-1) {
                // Reconstruct path
                for (auto [px, py] = parent[x][y]; px != -1; ) {
                    maze[px][py] = 3;
                    auto [npx, npy] = parent[px][py];
                    px = npx; py = npy;
                    display();
                }
                display();
                cout << BOLD << GREEN << "PATH FOUND!" << RESET << "\n";
                return;
            }

            for (int d = 0; d < 4; d++) {
                int nx = x+dx[d], ny = y+dy[d];
                if (nx >= 0 && nx < n && ny >= 0 && ny < m &&
                    !visited[nx][ny] && maze[nx][ny] != 1) {
                    visited[nx][ny] = true;
                    parent[nx][ny] = {x, y};
                    q.push({nx, ny});
                }
            }
        }
        cout << RED << "No path found!" << RESET << "\n";
    }
};

// ===== MAIN MENU =====
int main() {
    while (true) {
        clearScreen();
        cout << BOLD << "=== ALGORITHM VISUALIZER ===" << RESET << "\n\n";
        cout << "1. Bubble Sort Visualizer\n";
        cout << "2. Maze Solver (BFS)\n";
        cout << "3. Exit\n\n";
        cout << "Choose: ";

        int choice; cin >> choice; cin.ignore();

        if (choice == 1) {
            cout << "Array size (5-20): ";
            int n; cin >> n; cin.ignore();
            BubbleSortVisualizer viz(min(max(n, 5), 20));
            viz.sort_visual(150);

        } else if (choice == 2) {
            MazeVisualizer maze;
            maze.solveBFS();
            cout << "Press Enter to continue..."; cin.get();

        } else if (choice == 3) {
            break;
        }
    }
    return 0;
}
```

### Tính năng mở rộng (Bonus)
- Thêm Quick Sort, Merge Sort visualizer
- Dijkstra shortest path visualization
- Binary Search visualization
- So sánh tốc độ các thuật toán side-by-side

---

## 🎮 Dự Án C: Game AI — Cờ Caro với Minimax

### Mô tả
Game Cờ Caro 15×15 người vs AI, AI dùng thuật toán Minimax với Alpha-Beta Pruning.

### Code Khung

```cpp
#include <bits/stdc++.h>
using namespace std;

// ANSI colors
#define RESET  "\033[0m"
#define RED    "\033[31m"
#define BLUE   "\033[34m"
#define BOLD   "\033[1m"

const int BOARD_SIZE = 10;  // 10x10 for demo (15x15 for full game)
const int WIN_LEN = 5;     // 5 in a row to win
const int AI_DEPTH = 3;    // Search depth (increase for harder AI)
const int INF = 1e9;

int board[BOARD_SIZE][BOARD_SIZE];  // 0=empty, 1=player, 2=AI
// Directions: right, down, diagonal, anti-diagonal
int dx[] = {0, 1, 1, 1};
int dy[] = {1, 0, 1, -1};

// ===== BOARD OPERATIONS =====
void printBoard() {
    cout << "\n  ";
    for (int j = 0; j < BOARD_SIZE; j++) cout << (char)('A'+j) << " ";
    cout << "\n";

    for (int i = 0; i < BOARD_SIZE; i++) {
        cout << (i+1 < 10 ? " " : "") << (i+1) << " ";
        for (int j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] == 1) cout << RED << "X" << RESET << " ";
            else if (board[i][j] == 2) cout << BLUE << "O" << RESET << " ";
            else cout << "· ";
        }
        cout << "\n";
    }
}

// Count consecutive pieces in one direction
int countDir(int x, int y, int dx, int dy, int player) {
    int count = 0;
    for (int step = 1; step < WIN_LEN; step++) {
        int nx = x + dx*step, ny = y + dy*step;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
        if (board[nx][ny] == player) count++;
        else break;
    }
    return count;
}

// Evaluate a line of 5 for scoring
int evalLine(int count, int openEnds) {
    if (count >= WIN_LEN) return 100000;
    if (count == WIN_LEN - 1 && openEnds == 2) return 10000;
    if (count == WIN_LEN - 1 && openEnds == 1) return 1000;
    if (count == WIN_LEN - 2 && openEnds == 2) return 100;
    if (count == WIN_LEN - 2 && openEnds == 1) return 10;
    return 1;
}

// ===== HEURISTIC EVALUATION =====
int evaluate() {
    int score = 0;

    for (int i = 0; i < BOARD_SIZE; i++) {
        for (int j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] == 0) continue;
            int player = board[i][j];
            int multiplier = (player == 2) ? 1 : -1;

            for (int d = 0; d < 4; d++) {
                int count = 1;
                int openEnds = 0;

                // Count forward
                int fwd = countDir(i, j, dx[d], dy[d], player);
                count += fwd;

                // Check if open at forward end
                int endX = i + dx[d]*(fwd+1), endY = j + dy[d]*(fwd+1);
                if (endX >= 0 && endX < BOARD_SIZE && endY >= 0 && endY < BOARD_SIZE
                    && board[endX][endY] == 0) openEnds++;

                // Count backward
                int bwd = countDir(i, j, -dx[d], -dy[d], player);
                // Check if open at backward end
                int startX = i - dx[d]*(bwd+1), startY = j - dy[d]*(bwd+1);
                if (startX >= 0 && startX < BOARD_SIZE && startY >= 0 && startY < BOARD_SIZE
                    && board[startX][startY] == 0) openEnds++;

                score += multiplier * evalLine(count, openEnds);
            }
        }
    }
    return score;
}

bool checkWin(int player) {
    for (int i = 0; i < BOARD_SIZE; i++) {
        for (int j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] != player) continue;
            for (int d = 0; d < 4; d++) {
                int count = 1 + countDir(i, j, dx[d], dy[d], player)
                              + countDir(i, j, -dx[d], -dy[d], player);
                if (count >= WIN_LEN) return true;
            }
        }
    }
    return false;
}

// ===== MINIMAX WITH ALPHA-BETA PRUNING =====
pair<int,pair<int,int>> minimax(int depth, int alpha, int beta, bool isMax) {
    if (checkWin(2)) return {INF, {-1,-1}};    // AI wins
    if (checkWin(1)) return {-INF, {-1,-1}};   // Player wins
    if (depth == 0) return {evaluate(), {-1,-1}};

    int bestScore = isMax ? -INF : INF;
    pair<int,int> bestMove = {-1,-1};

    // Only consider moves near existing pieces (optimization)
    set<pair<int,int>> candidates;
    for (int i = 0; i < BOARD_SIZE; i++) {
        for (int j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] != 0) {
                for (int di = -2; di <= 2; di++) {
                    for (int dj = -2; dj <= 2; dj++) {
                        int ni = i+di, nj = j+dj;
                        if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE
                            && board[ni][nj] == 0) {
                            candidates.insert({ni, nj});
                        }
                    }
                }
            }
        }
    }
    if (candidates.empty()) candidates.insert({BOARD_SIZE/2, BOARD_SIZE/2});

    for (auto [x, y] : candidates) {
        board[x][y] = isMax ? 2 : 1;
        auto [score, _] = minimax(depth-1, alpha, beta, !isMax);
        board[x][y] = 0;

        if (isMax) {
            if (score > bestScore) { bestScore = score; bestMove = {x,y}; }
            alpha = max(alpha, score);
        } else {
            if (score < bestScore) { bestScore = score; bestMove = {x,y}; }
            beta = min(beta, score);
        }

        if (alpha >= beta) break;  // Alpha-beta pruning!
    }
    return {bestScore, bestMove};
}

// ===== MAIN GAME LOOP =====
int main() {
    memset(board, 0, sizeof(board));

    // First move: AI goes center
    board[BOARD_SIZE/2][BOARD_SIZE/2] = 2;

    cout << BOLD << "=== GOMOKU (5 in a Row) ===" << RESET << "\n";
    cout << "You are X (RED), AI is O (BLUE)\n";
    cout << "Enter moves as: row col (e.g., 5 F)\n\n";

    while (true) {
        printBoard();

        if (checkWin(2)) { cout << BLUE << BOLD << "AI wins! 🤖\n" << RESET; break; }
        if (checkWin(1)) { cout << RED  << BOLD << "You win! 🎉\n" << RESET; break; }

        // Player move
        cout << "\nYour move (row col, e.g. '5 F'): ";
        int row; char col;
        cin >> row >> col;
        int r = row - 1, c = toupper(col) - 'A';

        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] != 0) {
            cout << "Invalid move! Try again.\n";
            continue;
        }
        board[r][c] = 1;

        if (checkWin(1)) { printBoard(); cout << RED << BOLD << "You win! 🎉\n" << RESET; break; }

        // AI move
        cout << "AI is thinking...\n";
        auto [score, move] = minimax(AI_DEPTH, -INF, INF, true);
        if (move.first != -1) {
            board[move.first][move.second] = 2;
            cout << "AI plays: " << (move.first+1) << (char)('A'+move.second) << "\n";
        }
    }
    return 0;
}
```

---

## 📋 Tiêu Chí Đánh Giá Dự Án

### Rubric chấm điểm (100 điểm)

| Tiêu chí | Điểm tối đa | Mô tả |
|---------|------------|-------|
| **Tính năng hoạt động** | 30 | Chương trình chạy đúng, không crash |
| **Chất lượng code** | 20 | Có comment, tên biến rõ ràng, structure tốt |
| **Áp dụng thuật toán** | 25 | Dùng đúng và hiệu quả các thuật toán đã học |
| **Xử lý edge case** | 10 | Không crash với input bất thường |
| **Tính năng mở rộng** | 10 | Bonus features (UI đẹp, thêm chức năng) |
| **Thuyết trình** | 5 | Demo rõ ràng, giải thích được code |

---

## 🎮 Hoạt động lớp (45 phút × 4 buổi)

### Buổi 1: Planning & Setup (45 phút)
- Mỗi học sinh/nhóm chọn dự án (A, B, hoặc C)
- Lập kế hoạch: tính năng nào làm trước?
- Tạo project structure
- Cài đặt tools: g++, code editor

### Buổi 2: Core Development (45 phút)
- Implement tính năng cốt lõi
- GV hướng dẫn từng nhóm
- Debug cùng nhau

### Buổi 3: Polish & Testing (45 phút)
- Thêm tính năng bonus
- Test với edge cases
- Fix bugs

### Buổi 4: Demo Day (45 phút)
- Mỗi nhóm demo 5 phút
- Q&A từ lớp
- Trao huy hiệu

---

## 📝 Homework: Kế Hoạch Dự Án

**Week 1:** Chọn dự án, thiết lập môi trường, implement khung cơ bản
**Week 2:** Implement tính năng chính, testing, bug fixing
**Week 3:** Thêm bonus features, documentation, prepare demo
**Week 4:** Demo Day preparation, code review

---

## ❌ Common Project Mistakes

```cpp
// ❌ MISTAKE 1: Trying to do too much
// Don't add 10 features. Do 3 features WELL.

// ❌ MISTAKE 2: Not testing incrementally
// Test EACH feature as you build it, not all at the end

// ❌ MISTAKE 3: Magic numbers without explanation
int arr[1005][1005];  // Why 1005? Not 1000?
// ✅ Fix:
const int MAXN = 1005;  // 1000 + 5 buffer for safety
int arr[MAXN][MAXN];

// ❌ MISTAKE 4: Global variables everywhere
// Use functions and pass parameters instead

// ❌ MISTAKE 5: Not using const for fixed values
int n = 10;  // Will n change? If not, use const!
const int N = 10;  // Clear: N is fixed
```

---

## 🤖 AI Coach

**Dùng AI trong dự án (hợp lệ):**
- "Giải thích code này làm gì: [paste code]"
- "Cách tốt hơn để implement [tính năng]?"
- "Debug giúp tôi: program crashes when [situation]"
- "Tại sao minimax của tôi slow? Cách optimize?"
- "Review architecture của project tôi"

**Không dùng AI để:**
- Generate toàn bộ code — tự làm và học!
- Copy paste mà không hiểu

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Project Starter:** Khung cơ bản hoạt động, chạy không crash
**🥈 Silver — Feature Complete:** Tất cả tính năng chính hoạt động, code có comment
**🥇 Gold — Polish Master:** Bonus features, edge cases handled, demo xuất sắc
**💎 Diamond — Algorithm Champion:** Cả ba: Project hoàn chỉnh + AC 30+ bài OJ + Codeforces rating > 1000

---

## 🎓 Lời Kết — Hành Trình Của Em

Chúc mừng em đã hoàn thành khóa học Algorithm Lab!

**Em đã học được:**
- ✅ Nhập xuất C++, kiểu dữ liệu, biến
- ✅ Rẽ nhánh và điều kiện
- ✅ Vòng lặp và pattern
- ✅ Hàm và đệ quy
- ✅ Mảng, chuỗi, vector
- ✅ Sắp xếp và tìm kiếm nhị phân
- ✅ STL containers (map, set, priority_queue...)
- ✅ Greedy algorithms
- ✅ Backtracking
- ✅ Binary search on answer
- ✅ Graph (DFS, BFS, Dijkstra)
- ✅ Dynamic Programming
- ✅ Contest skills
- ✅ 50 bài Online Judge
- ✅ Dự án thực tế

**Bước tiếp theo:**
1. **Luyện tập đều đặn:** Tối thiểu 1-2 bài Codeforces/ngày
2. **Tham gia contest:** Codeforces Div3, AtCoder ABC mỗi tuần
3. **Học sâu hơn:** Segment Tree, Fenwick Tree, Convex Hull, FFT
4. **Tham gia cộng đồng:** VNOI, Codeforces Discord
5. **Mục tiêu:** Codeforces Expert (1600+), USACO Silver/Gold

**"The only way to get better at competitive programming is to practice."** — William Lin

🚀 Em đã có nền tảng. Bây giờ chỉ cần bay!
