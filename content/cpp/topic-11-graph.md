# Chuyên đề 11: Graph — Đồ Thị, DFS và BFS

## 🎯 Mục tiêu
- Hiểu cấu trúc đồ thị: đỉnh, cạnh, có hướng/vô hướng, có trọng số
- Biểu diễn đồ thị bằng adjacency list và adjacency matrix
- Cài đặt DFS (Depth-First Search) và ứng dụng
- Cài đặt BFS (Breadth-First Search) và tìm đường ngắn nhất
- Nhận dạng và giải các bài toán đồ thị cơ bản

---

## ⚡ C++ Syntax & Code

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<int> adj[MAXN];    // Adjacency list
bool visited[MAXN];

// ===== GRAPH REPRESENTATION =====
void buildGraph() {
    int n, m;  // n vertices, m edges
    cin >> n >> m;

    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);  // Remove for directed graph
    }
}

// ===== DFS (Depth-First Search) =====
void dfs(int node) {
    visited[node] = true;
    cout << node << " ";  // Process node

    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            dfs(neighbor);
        }
    }
}

// DFS iterative (avoid stack overflow for large graphs)
void dfsIterative(int start) {
    stack<int> stk;
    stk.push(start);

    while (!stk.empty()) {
        int node = stk.top(); stk.pop();
        if (visited[node]) continue;
        visited[node] = true;
        cout << node << " ";

        for (int neighbor : adj[node]) {
            if (!visited[neighbor]) stk.push(neighbor);
        }
    }
}

// ===== BFS (Breadth-First Search) =====
vector<int> bfs(int start, int n) {
    vector<int> dist(n + 1, -1);  // -1 = unvisited
    queue<int> q;
    q.push(start);
    dist[start] = 0;

    while (!q.empty()) {
        int node = q.front(); q.pop();

        for (int neighbor : adj[node]) {
            if (dist[neighbor] == -1) {
                dist[neighbor] = dist[node] + 1;
                q.push(neighbor);
            }
        }
    }
    return dist;  // dist[v] = shortest path from start to v
}

// ===== COUNT CONNECTED COMPONENTS =====
int countComponents(int n) {
    fill(visited + 1, visited + n + 1, false);
    int components = 0;

    for (int i = 1; i <= n; i++) {
        if (!visited[i]) {
            dfs(i);
            components++;
        }
    }
    return components;
}

// ===== BIPARTITE CHECK (Two-coloring) =====
bool isBipartite(int start, int n) {
    vector<int> color(n + 1, -1);
    queue<int> q;
    q.push(start);
    color[start] = 0;

    while (!q.empty()) {
        int node = q.front(); q.pop();
        for (int neighbor : adj[node]) {
            if (color[neighbor] == -1) {
                color[neighbor] = 1 - color[node];
                q.push(neighbor);
            } else if (color[neighbor] == color[node]) {
                return false;  // Same color = odd cycle = not bipartite
            }
        }
    }
    return true;
}

int main() {
    int n = 6, m = 5;
    // Build graph: 1-2, 1-3, 2-4, 3-4, 5-6
    vector<pair<int,int>> edges = {{1,2},{1,3},{2,4},{3,4},{5,6}};
    for (auto [u, v] : edges) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    // DFS from node 1
    cout << "DFS: ";
    memset(visited, false, sizeof(visited));
    dfs(1);
    cout << "\n";

    // BFS distances from node 1
    cout << "BFS distances from 1: ";
    auto dist = bfs(1, n);
    for (int i = 1; i <= n; i++) cout << dist[i] << " ";
    cout << "\n";

    // Count components
    memset(visited, false, sizeof(visited));
    cout << "Components: " << countComponents(n) << "\n";  // 2

    return 0;
}
```

---

### Weighted Graph & Dijkstra's Algorithm

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef pair<int,int> pii;  // {weight, node}
const int INF = 1e9;

vector<pii> adjW[100005];  // {neighbor, weight}

// ===== DIJKSTRA'S SHORTEST PATH =====
vector<int> dijkstra(int start, int n) {
    vector<int> dist(n + 1, INF);
    priority_queue<pii, vector<pii>, greater<pii>> pq;  // Min heap

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, node] = pq.top(); pq.pop();

        if (d > dist[node]) continue;  // Outdated entry, skip

        for (auto [neighbor, weight] : adjW[node]) {
            if (dist[node] + weight < dist[neighbor]) {
                dist[neighbor] = dist[node] + weight;
                pq.push({dist[neighbor], neighbor});
            }
        }
    }
    return dist;
}

// ===== TOPOLOGICAL SORT (for DAG) =====
vector<int> topoSort(int n) {
    vector<int> inDegree(n + 1, 0);
    vector<vector<int>> dag(n + 1);

    // Build DAG (example)
    // dag[u].push_back(v); inDegree[v]++;

    queue<int> q;
    for (int i = 1; i <= n; i++) if (inDegree[i] == 0) q.push(i);

    vector<int> order;
    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);
        for (int next : dag[node]) {
            if (--inDegree[next] == 0) q.push(next);
        }
    }
    return order;  // If order.size() != n → cycle exists
}

// ===== CYCLE DETECTION in directed graph =====
vector<int> adjDir[100005];
int state[100005];  // 0=unvisited, 1=in-progress, 2=done

bool hasCycle(int node) {
    state[node] = 1;
    for (int neighbor : adjDir[node]) {
        if (state[neighbor] == 1) return true;  // Back edge = cycle
        if (state[neighbor] == 0 && hasCycle(neighbor)) return true;
    }
    state[node] = 2;
    return false;
}

int main() {
    // Dijkstra example: 4 nodes, edges with weights
    adjW[1].push_back({2, 4}); adjW[2].push_back({1, 4});
    adjW[1].push_back({3, 1}); adjW[3].push_back({1, 1});
    adjW[2].push_back({3, 2}); adjW[3].push_back({2, 2});
    adjW[2].push_back({4, 5}); adjW[4].push_back({2, 5});
    adjW[3].push_back({4, 8}); adjW[4].push_back({3, 8});

    auto dist = dijkstra(1, 4);
    cout << "Shortest from 1: ";
    for (int i = 1; i <= 4; i++) cout << dist[i] << " ";
    // 0 3 1 8
    cout << "\n";
    return 0;
}
```

---

## 💡 Khái niệm & Thuật toán

### Biểu diễn đồ thị

**Adjacency Matrix (Ma trận kề):**
```cpp
int adj[N][N];  // adj[u][v] = 1 if edge u-v exists
// Pro: O(1) edge query
// Con: O(N²) space — bad for sparse graphs!
```

**Adjacency List (Danh sách kề):**
```cpp
vector<int> adj[N];  // adj[u] = list of neighbors of u
// Pro: O(V+E) space — good for sparse graphs
// Con: O(degree) edge query
```

### DFS vs BFS

| | DFS | BFS |
|--|-----|-----|
| Cấu trúc | Stack (đệ quy) | Queue |
| Ứng dụng | Tìm chu trình, tô màu, topo sort | Đường ngắn nhất (unweighted) |
| Bộ nhớ | O(depth) | O(width) |
| Thường dùng | Backtracking, Components | Shortest path, Level order |

### Dijkstra Complexity
- Time: O((V+E) log V) với priority_queue
- Chỉ hoạt động với **trọng số không âm**!
- Trọng số âm → dùng Bellman-Ford

### Ứng dụng thực tế
```
DFS → Phát hiện chu trình, Topo Sort, SCC (Tarjan)
BFS → Đường ngắn nhất unweighted, Bipartite check
Dijkstra → Đường ngắn nhất weighted (không âm)
Union-Find → Kiểm tra kết nối, MST (Kruskal)
```

---

## 📊 Độ phức tạp (Time & Space Complexity)

| Thuật toán | Time | Space |
|-----------|------|-------|
| DFS | O(V+E) | O(V) stack |
| BFS | O(V+E) | O(V) queue |
| Dijkstra | O((V+E)log V) | O(V+E) |
| Bellman-Ford | O(VE) | O(V) |
| Floyd-Warshall | O(V³) | O(V²) |
| Kruskal MST | O(E log E) | O(V) |
| Topological Sort | O(V+E) | O(V) |

---

## 🔨 Bài tập thực hành

### Bài 1 (Dễ): Số đảo (Islands)
**Đề bài:** Cho lưới N×M gồm '0' (nước) và '1' (đất). Đếm số đảo (vùng đất liên thông).

**Input mẫu:**
```
4 5
11110
11010
11000
00000
```
**Output mẫu:**
```
1
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<string> grid;
int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};

void dfs(int x, int y) {
    if (x < 0 || x >= n || y < 0 || y >= m || grid[x][y] != '1') return;
    grid[x][y] = '0';  // Mark as visited
    for (int d = 0; d < 4; d++) dfs(x+dx[d], y+dy[d]);
}

int main() {
    cin >> n >> m;
    grid.resize(n);
    for (string& row : grid) cin >> row;

    int islands = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            if (grid[i][j] == '1') { dfs(i, j); islands++; }

    cout << islands << "\n";
    return 0;
}
```

---

### Bài 2 (Trung bình): Đường ngắn nhất trên đồ thị vô trọng số
**Đề bài:** Cho đồ thị N đỉnh, M cạnh vô hướng không trọng số. Trả lời Q truy vấn: khoảng cách ngắn nhất giữa S và T.

**Input mẫu:**
```
5 5 3
1 2
1 3
2 4
3 4
4 5
1 5
2 5
3 5
```
**Output mẫu:**
```
3
2
3
```

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<int> adj[MAXN];

vector<int> bfs(int start, int n) {
    vector<int> dist(n + 1, -1);
    queue<int> q;
    q.push(start); dist[start] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
        }
    }
    return dist;
}

int main() {
    int n, m, q; cin >> n >> m >> q;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v); adj[v].push_back(u);
    }
    while (q--) {
        int s, t; cin >> s >> t;
        auto dist = bfs(s, n);
        cout << dist[t] << "\n";
    }
    return 0;
}
```

---

### Bài 3 (Khó): Dijkstra + Path Reconstruction
**Đề bài:** Tìm đường đi ngắn nhất có trọng số và in đường đi từ S đến T.

**Lời giải:**
```cpp
#include <bits/stdc++.h>
using namespace std;

typedef pair<int,int> pii;
const int INF = 1e9;
vector<pii> adj[100005];

pair<vector<int>, vector<int>> dijkstra(int start, int n) {
    vector<int> dist(n+1, INF), parent(n+1, -1);
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    dist[start] = 0; pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }
    return {dist, parent};
}

int main() {
    int n, m, s, t; cin >> n >> m >> s >> t;
    for (int i = 0; i < m; i++) {
        int u, v, w; cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    auto [dist, parent] = dijkstra(s, n);
    if (dist[t] == INF) { cout << "No path\n"; return 0; }

    // Reconstruct path
    vector<int> path;
    for (int v = t; v != -1; v = parent[v]) path.push_back(v);
    reverse(path.begin(), path.end());

    cout << "Distance: " << dist[t] << "\n";
    cout << "Path: ";
    for (int v : path) cout << v << " ";
    cout << "\n";
    return 0;
}
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm Up (5 phút)
**Trò chơi Six Degrees:** Thử kết nối hai học sinh trong lớp qua "bạn của bạn". Demo BFS bằng tay: ai biết ai. → Khái niệm "shortest social path".

### Theory (10 phút)
- Vẽ đồ thị trên bảng, giải thích đỉnh/cạnh
- Demo DFS: đi càng sâu càng tốt trước, quay lui khi hết đường
- Demo BFS: mở rộng theo từng "tầng" (level by level)

### Worked Example (10 phút)
Trace BFS trên đồ thị nhỏ 5 đỉnh:
1. Start từ đỉnh 1, queue=[1]
2. Xử lý 1, thêm 2,3 vào queue
3. Xử lý 2, thêm 4 vào queue
4. Xử lý 3, thêm 4 (đã thăm) → skip
5. Khoảng cách: 1→1=0, 1→2=1, 1→3=1, 1→4=2

### Live Coding (10 phút)
**Challenge:** Implement đếm số thành phần liên thông bằng DFS:
- Duyệt mỗi đỉnh chưa thăm → DFS → components++

### Practice (10 phút)
Làm Bài 1 (Number of Islands). Ai xong sớm thử Bài 2.

---

## 📝 Homework (5 bài)

1. **Tìm đường trong mê cung** — Lưới N×M, '.' là đường đi, '#' là tường. BFS từ 'S' đến 'E', in số bước tối thiểu
2. **Flood Fill** — Tô màu vùng liên thông trên ảnh (giống Paint Fill)
3. **Course Schedule** — Có cycle không? Topological sort
4. **Word Ladder** — Từ word1 đến word2, mỗi bước đổi 1 ký tự, tìm đường ngắn nhất
5. **Network Delay Time** — Dijkstra: tìm thời gian để tín hiệu đến tất cả nodes

---

## ❌ Lỗi thường gặp (Common Mistakes)

```cpp
// ❌ MISTAKE 1: Stack overflow with recursive DFS on large graphs
// For n = 10^5 nodes, recursion depth can be 10^5 → Stack Overflow!
// ✅ Fix: Use iterative DFS with explicit stack

// ❌ MISTAKE 2: Forgetting to mark visited BEFORE pushing to queue
queue<int> q;
q.push(start);
while (!q.empty()) {
    int u = q.front(); q.pop();
    visited[u] = true;  // WRONG: should mark when PUSHING not POPPING
    for (int v : adj[u]) {
        if (!visited[v]) q.push(v);  // v might be pushed multiple times!
    }
}
// ✅ Fix: Mark visited when pushing to queue

// ❌ MISTAKE 3: Dijkstra with negative weights
// Dijkstra gives WRONG answers with negative edge weights!
// Use Bellman-Ford instead

// ❌ MISTAKE 4: Wrong adjacency list for directed graph
adj[u].push_back(v);  // Directed: only u→v
adj[v].push_back(u);  // Only add this for UNDIRECTED!

// ❌ MISTAKE 5: Not resetting visited array between queries
// If running multiple BFS/DFS, clear visited[] each time!
```

---

## 🤖 AI Coach

**Hỏi AI khi cần:**
- "DFS và BFS khác nhau như thế nào? Khi nào dùng cái nào?"
- "Tại sao Dijkstra không hoạt động với cạnh âm?"
- "Cách phát hiện chu trình trong đồ thị có hướng?"
- "Topological sort là gì? Khi nào dùng?"
- "Vẽ và giải thích BFS tree cho đồ thị của tôi"

---

## 🏅 Huy hiệu hoàn thành

**🥉 Bronze — Graph Builder:** Xây dựng đồ thị, DFS/BFS cơ bản
**🥈 Silver — Pathfinder:** BFS shortest path, count components, bipartite check
**🥇 Gold — Dijkstra Master:** Dijkstra với priority_queue, path reconstruction
**💎 Diamond — Bonus:** Topological Sort + Word Ladder + Network Delay Time
