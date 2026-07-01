'use client'

import { useState, useRef, useEffect } from 'react'
import { Maximize2, Minimize2, Play, RotateCcw, Code2 } from 'lucide-react'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

// ── Python IDE (Pyodide in iframe sandbox) ─────────────────────────────────
const PYTHON_SANDBOX_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; background: #1e1e2e; color: #cdd6f4; height: 100vh; display: flex; flex-direction: column; }
  #toolbar { background: #313244; padding: 8px 12px; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid #45475a; }
  .btn { background: #89b4fa; color: #1e1e2e; border: none; padding: 5px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; }
  .btn:hover { background: #74c7ec; }
  .btn-red { background: #f38ba8; }
  .btn-red:hover { background: #eb6f92; }
  #label { color: #a6e3a1; font-weight: bold; font-size: 13px; flex: 1; }
  #editor-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  #code { flex: 1; background: #1e1e2e; color: #cdd6f4; border: none; padding: 12px; font-family: 'Courier New', monospace; font-size: 14px; resize: none; outline: none; line-height: 1.6; }
  #output-wrap { height: 35%; border-top: 2px solid #45475a; display: flex; flex-direction: column; }
  #output-header { background: #313244; padding: 4px 12px; font-size: 12px; color: #a6adc8; }
  #output { flex: 1; background: #11111b; color: #a6e3a1; padding: 10px; font-family: 'Courier New', monospace; font-size: 13px; overflow-y: auto; white-space: pre-wrap; }
  .loading { color: #f9e2af; }
</style>
</head>
<body>
<div id="toolbar">
  <span id="label">🐍 Python Lab</span>
  <button class="btn" onclick="runCode()">▶ Chạy</button>
  <button class="btn btn-red" onclick="clearOutput()">✕ Xoá</button>
</div>
<div id="editor-wrap">
  <textarea id="code" spellcheck="false" placeholder="# Viết code Python ở đây...
print('Hello, World!')
print('Xin chào Việt Nam 🇻🇳')
"></textarea>
</div>
<div id="output-wrap">
  <div id="output-header">▸ Output</div>
  <div id="output"><span class="loading">Đang tải Python... vui lòng chờ ⏳</span></div>
</div>
<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
<script>
let pyodide = null;
async function loadPy() {
  try {
    pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
    document.getElementById('output').innerHTML = '<span style="color:#a6e3a1">✅ Python sẵn sàng! Nhấn ▶ Chạy để bắt đầu.</span>';
  } catch(e) {
    document.getElementById('output').innerHTML = '<span style="color:#f38ba8">⚠️ Không tải được Pyodide. Kiểm tra kết nối mạng.</span>';
  }
}
async function runCode() {
  if (!pyodide) { document.getElementById('output').textContent = '⏳ Python đang tải...'; return; }
  const code = document.getElementById('code').value;
  document.getElementById('output').textContent = '';
  const out = [];
  pyodide.setStdout({ batched: (s) => out.push(s) });
  pyodide.setStderr({ batched: (s) => out.push('⚠️ ' + s) });
  try {
    await pyodide.runPythonAsync(code);
    document.getElementById('output').textContent = out.join('\\n') || '(Không có output)';
  } catch(e) {
    document.getElementById('output').innerHTML = '<span style="color:#f38ba8">❌ Lỗi: ' + e.message + '</span>';
  }
}
function clearOutput() { document.getElementById('output').textContent = ''; }
loadPy();
</script>
</body>
</html>`

// ── C++ IDE (Monaco + Judge0 public API) ───────────────────────────────────
const CPP_SANDBOX_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; background: #0d1117; color: #e6edf3; height: 100vh; display: flex; flex-direction: column; }
  #toolbar { background: #161b22; padding: 8px 12px; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid #30363d; }
  .btn { background: #7c3aed; color: white; border: none; padding: 5px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; }
  .btn:hover { background: #6d28d9; }
  .btn-gray { background: #374151; }
  .btn-gray:hover { background: #4b5563; }
  #label { color: #c084fc; font-weight: bold; font-size: 13px; flex: 1; }
  textarea#code { flex: 1; background: #0d1117; color: #e6edf3; border: none; padding: 12px; font-family: 'Courier New', monospace; font-size: 14px; resize: none; outline: none; line-height: 1.7; }
  #editor-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  #stdin-wrap { background: #161b22; border-top: 1px solid #30363d; padding: 6px 12px; display: flex; align-items: center; gap: 8px; }
  #stdin-label { color: #8b949e; font-size: 12px; white-space: nowrap; }
  input#stdin { flex: 1; background: #0d1117; color: #e6edf3; border: 1px solid #30363d; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 13px; }
  #output-wrap { height: 35%; border-top: 2px solid #30363d; display: flex; flex-direction: column; }
  #output-header { background: #161b22; padding: 4px 12px; font-size: 12px; color: #8b949e; }
  #output { flex: 1; background: #010409; color: #3fb950; padding: 10px; font-family: 'Courier New', monospace; font-size: 13px; overflow-y: auto; white-space: pre-wrap; }
</style>
</head>
<body>
<div id="toolbar">
  <span id="label">⚡ C++ Editor</span>
  <button class="btn" onclick="runCode()">▶ Biên dịch & Chạy</button>
  <button class="btn btn-gray" onclick="resetCode()">↺ Reset</button>
</div>
<div id="editor-wrap">
  <textarea id="code" spellcheck="false">#include &lt;bits/stdc++.h&gt;
using namespace std;

int main() {
    cout &lt;&lt; "Hello, C++!" &lt;&lt; endl;
    
    int n;
    cin &gt;&gt; n;
    cout &lt;&lt; "So ban nhap: " &lt;&lt; n &lt;&lt; endl;
    
    return 0;
}</textarea>
</div>
<div id="stdin-wrap">
  <span id="stdin-label">📥 Input (stdin):</span>
  <input id="stdin" type="text" placeholder="Nhập dữ liệu vào đây (nếu có)..." />
</div>
<div id="output-wrap">
  <div id="output-header">▸ Output</div>
  <div id="output">Nhấn ▶ Biên dịch & Chạy để thực thi code...</div>
</div>
<script>
const DEFAULT_CODE = document.getElementById('code').value;
async function runCode() {
  const code = document.getElementById('code').value;
  const stdin = document.getElementById('stdin').value;
  const out = document.getElementById('output');
  out.style.color = '#f9e2af';
  out.textContent = '⏳ Đang biên dịch...';
  try {
    const res = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': 'DEMO'
      },
      body: JSON.stringify({ source_code: code, language_id: 54, stdin })
    });
    const data = await res.json();
    if (data.stdout) { out.style.color='#3fb950'; out.textContent = data.stdout; }
    else if (data.compile_output) { out.style.color='#f85149'; out.textContent = '❌ Compile Error:\\n' + data.compile_output; }
    else if (data.stderr) { out.style.color='#f85149'; out.textContent = '❌ Runtime Error:\\n' + data.stderr; }
    else out.textContent = '(Không có output)';
  } catch(e) {
    // Fallback: hướng dẫn dùng online compiler
    out.style.color='#a6e3a1';
    out.innerHTML = '💡 Để chạy C++ online, dán code vào:\\n• <a href="https://cpp.sh" target="_blank" style="color:#79c0ff">cpp.sh</a>\\n• <a href="https://codeforces.com/problemset" target="_blank" style="color:#79c0ff">Codeforces</a>\\n• <a href="https://ide.geeksforgeeks.org" target="_blank" style="color:#79c0ff">GFG IDE</a>';
  }
}
function resetCode() { document.getElementById('code').value = DEFAULT_CODE; document.getElementById('output').textContent = ''; }
</script>
</body>
</html>`

// ── Scratch Embed ───────────────────────────────────────────────────────────
function ScratchIDE({ isFullscreen }: { isFullscreen: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3 flex items-start gap-3">
        <span className="text-2xl">🐱</span>
        <div className="text-sm">
          <p className="font-bold text-amber-800">Scratch Editor</p>
          <p className="text-amber-700 mt-0.5">Kéo thả block để lập trình! Nhấn <strong>🚩 cờ xanh</strong> để chạy chương trình.</p>
        </div>
      </div>
      <div className={`flex-1 rounded-xl overflow-hidden border-2 border-orange-200 shadow-lg ${isFullscreen ? 'h-[80vh]' : 'h-[500px]'}`}>
        <iframe
          src="https://scratch.mit.edu/projects/editor/"
          className="w-full h-full"
          allow="microphone; camera"
          title="Scratch Editor"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">
        💾 Lưu project: File → Save to computer (.sb3) | 📤 Nộp bài: liên hệ giáo viên
      </p>
    </div>
  )
}

// ── Algorithm Visual (Coding Kids) ─────────────────────────────────────────
function AlgorithmIDE() {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 text-center">
        <div className="text-5xl mb-3">🤖</div>
        <h3 className="font-black text-yellow-900 text-xl mb-2">Robot Playground</h3>
        <p className="text-yellow-800 text-sm mb-4">Điều khiển robot bằng cách kéo thả lệnh. Giúp robot đến đích!</p>
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {[
            { icon: '⬆️', label: 'Tiến' },
            { icon: '⬇️', label: 'Lùi' },
            { icon: '⬅️', label: 'Trái' },
            { icon: '➡️', label: 'Phải' },
            { icon: '🔁', label: 'Lặp 2x' },
            { icon: '❓', label: 'Nếu...' },
          ].map(cmd => (
            <div key={cmd.label} className="bg-white border-2 border-yellow-300 rounded-xl px-4 py-2.5 font-bold text-yellow-900 text-sm cursor-grab hover:bg-yellow-100 transition shadow-sm">
              {cmd.icon} {cmd.label}
            </div>
          ))}
        </div>
        <p className="text-xs text-yellow-600 mb-3">👆 Kéo các lệnh vào vùng lập trình bên dưới</p>
        <div className="bg-white border-2 border-dashed border-yellow-300 rounded-xl min-h-[100px] p-3 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Thả lệnh vào đây...</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
        <p className="text-sm text-orange-700 font-semibold mb-2">🎮 Thực hành thêm với các tool miễn phí:</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="https://studio.code.org/hoc/1" target="_blank" rel="noopener noreferrer"
            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition">
            🚀 Code.org
          </a>
          <a href="https://blockly.games" target="_blank" rel="noopener noreferrer"
            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition">
            🎲 Blockly Games
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Sandboxed iframe IDE ────────────────────────────────────────────────────
function SandboxIDE({ html, title, isFullscreen }: { html: string; title: string; isFullscreen: boolean }) {
  const blob = new Blob([html], { type: 'text/html' })
  const [url, setUrl] = useState<string>('')
  useEffect(() => {
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [])
  if (!url) return <div className="flex items-center justify-center h-64 text-gray-400">Đang tải IDE...</div>
  return (
    <iframe
      src={url}
      className={`w-full rounded-xl border-2 border-gray-200 shadow-lg ${isFullscreen ? 'h-[80vh]' : 'h-[520px]'}`}
      title={title}
      sandbox="allow-scripts allow-same-origin"
    />
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
interface IDETabProps {
  courseType: CourseType
  subjectName: string
}

export function IDETab({ courseType, subjectName }: IDETabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const label: Record<string, string> = {
    LAP_TRINH_SCRATCH:    '🐱 Scratch Editor',
    LAP_TRINH_PYTHON:     '🐍 Python IDE',
    LAP_TRINH_CPP:        '⚡ C++ Editor',
    LAP_TRINH_THUAT_TOAN: '🤖 Robot Playground',
  }

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : ''}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-600" />
          <h3 className="font-black text-gray-800">{label[courseType] ?? 'IDE'}</h3>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
            {subjectName}
          </span>
        </div>
        <button
          onClick={() => setIsFullscreen(f => !f)}
          className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition"
        >
          {isFullscreen ? <><Minimize2 className="w-4 h-4" /> Thu nhỏ</> : <><Maximize2 className="w-4 h-4" /> Toàn màn hình</>}
        </button>
      </div>

      {/* IDE content */}
      {courseType === 'LAP_TRINH_SCRATCH'    && <ScratchIDE isFullscreen={isFullscreen} />}
      {courseType === 'LAP_TRINH_PYTHON'     && <SandboxIDE html={PYTHON_SANDBOX_HTML} title="Python IDE" isFullscreen={isFullscreen} />}
      {courseType === 'LAP_TRINH_CPP'        && <SandboxIDE html={CPP_SANDBOX_HTML}    title="C++ Editor"  isFullscreen={isFullscreen} />}
      {courseType === 'LAP_TRINH_THUAT_TOAN' && <AlgorithmIDE />}
    </div>
  )
}
