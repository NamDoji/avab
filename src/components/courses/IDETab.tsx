'use client'

import { useState, useEffect } from 'react'
import { Maximize2, Minimize2, Code2, ExternalLink, Play, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

// ─── Coding problems per course/topic ─────────────────────────────────────
// Each problem: { title, description, sampleInput, sampleOutput, starterCode, hint }
interface CodingProblem {
  id: number
  title: string
  description: string
  sampleInput: string
  sampleOutput: string
  starterCode: string
  hint: string
}

const PYTHON_PROBLEMS: CodingProblem[] = [
  { id:1, title:'Hello World', description:'In ra màn hình dòng chữ:\n`Hello, World!`', sampleInput:'(không có)', sampleOutput:'Hello, World!', starterCode:'# Bài 1: In Hello World\nprint("...")', hint:'Dùng print() để in ra text' },
  { id:2, title:'In tên của bạn', description:'Cho tên là `"Nguyen An"`. In ra:\n`Xin chào, Nguyen An!`', sampleInput:'(không có)', sampleOutput:'Xin chào, Nguyen An!', starterCode:'name = "Nguyen An"\n# In ra lời chào', hint:'Dùng f-string: f"Xin chào, {name}!"' },
  { id:3, title:'Tính tổng', description:'Cho `a = 5`, `b = 3`. In ra tổng `a + b`.', sampleInput:'(không có)', sampleOutput:'8', starterCode:'a = 5\nb = 3\n# Tính và in tổng', hint:'print(a + b)' },
  { id:4, title:'Đếm đến 5', description:'In các số từ 1 đến 5, mỗi số một dòng.', sampleInput:'(không có)', sampleOutput:'1\n2\n3\n4\n5', starterCode:'# Dùng vòng lặp for\nfor i in range(1, 6):\n    pass  # thay pass bằng code', hint:'print(i) bên trong vòng lặp' },
  { id:5, title:'Số chẵn hay lẻ', description:'Cho `n = 7`. In `"Chan"` nếu n chẵn, `"Le"` nếu n lẻ.', sampleInput:'(không có)', sampleOutput:'Le', starterCode:'n = 7\n# Kiểm tra chẵn/lẻ\nif n % 2 == 0:\n    print("Chan")\nelse:\n    pass  # thêm code', hint:'n % 2 == 0 nghĩa là chẵn' },
  { id:6, title:'Tính giai thừa', description:'Tính `5!` = 5 × 4 × 3 × 2 × 1 = 120.\nIn kết quả.', sampleInput:'(không có)', sampleOutput:'120', starterCode:'result = 1\nfor i in range(1, 6):\n    result = result * i\nprint(...)', hint:'Thay ... bằng result' },
  { id:7, title:'Đảo ngược chuỗi', description:'Cho `text = "Python"`. In ra chuỗi bị đảo ngược: `nohtyP`', sampleInput:'(không có)', sampleOutput:'nohtyP', starterCode:'text = "Python"\n# Đảo ngược chuỗi\nprint(...)', hint:'text[::-1] đảo ngược chuỗi' },
  { id:8, title:'Đếm số lẻ trong list', description:'Cho `nums = [1, 2, 3, 4, 5, 6, 7]`.\nĐếm và in số lượng số lẻ.', sampleInput:'(không có)', sampleOutput:'4', starterCode:'nums = [1, 2, 3, 4, 5, 6, 7]\ncount = 0\nfor n in nums:\n    if n % 2 != 0:\n        count += 1\nprint(...)', hint:'In count sau vòng lặp' },
  { id:9, title:'FizzBuzz', description:'In số từ 1 đến 15:\n- Chia hết cho 3: in "Fizz"\n- Chia hết cho 5: in "Buzz"\n- Chia hết cả 3 và 5: in "FizzBuzz"\n- Còn lại: in số đó', sampleInput:'(không có)', sampleOutput:'1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', starterCode:'for i in range(1, 16):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif ...:\n        ...\n    elif ...:\n        ...\n    else:\n        print(i)', hint:'Kiểm tra % 15 trước, rồi % 3, rồi % 5' },
  { id:10, title:'Tổng list', description:'Tính tổng tất cả số trong list:\n`nums = [10, 20, 30, 40, 50]`\nIn kết quả.', sampleInput:'(không có)', sampleOutput:'150', starterCode:'nums = [10, 20, 30, 40, 50]\n# Tính tổng\ntotal = sum(nums)\nprint(...)', hint:'Dùng sum() hoặc vòng lặp' },
]

const CPP_PROBLEMS: CodingProblem[] = [
  { id:1, title:'Hello World', description:'In ra màn hình:\n`Hello, World!`', sampleInput:'', sampleOutput:'Hello, World!', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // In Hello World\n    cout << "..." << endl;\n    return 0;\n}', hint:'cout << "Hello, World!" << endl;' },
  { id:2, title:'Tính tổng 2 số', description:'Nhập 2 số nguyên a, b từ input.\nIn ra tổng a + b.', sampleInput:'3 5', sampleOutput:'8', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << ... << endl;\n    return 0;\n}', hint:'cout << a + b' },
  { id:3, title:'Số chẵn hay lẻ', description:'Nhập số nguyên n.\nIn `"Chan"` nếu n chia hết cho 2, ngược lại in `"Le"`.', sampleInput:'7', sampleOutput:'Le', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    if (n % 2 == 0) {\n        ...\n    } else {\n        ...\n    }\n    return 0;\n}', hint:'n % 2 == 0 là chẵn' },
  { id:4, title:'Tổng 1 đến N', description:'Nhập số nguyên N.\nTính và in tổng 1 + 2 + ... + N.', sampleInput:'5', sampleOutput:'15', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    int sum = 0;\n    for (int i = 1; i <= n; i++) {\n        sum += i;\n    }\n    cout << ... << endl;\n    return 0;\n}', hint:'cout << sum' },
  { id:5, title:'Số lớn nhất', description:'Nhập 3 số nguyên a, b, c.\nIn ra số lớn nhất trong 3 số.', sampleInput:'4 9 2', sampleOutput:'9', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    int mx = max({a, b, c});\n    cout << mx << endl;\n    return 0;\n}', hint:'max(a, max(b, c)) hoặc max({a,b,c})' },
  { id:6, title:'FizzBuzz', description:'In số từ 1 đến 20:\n- Chia hết 3 → "Fizz"\n- Chia hết 5 → "Buzz"\n- Chia hết cả 15 → "FizzBuzz"\n- Còn lại → in số', sampleInput:'', sampleOutput:'1\n2\nFizz\n4\nBuzz\n...', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    for (int i = 1; i <= 20; i++) {\n        if (i % 15 == 0) cout << "FizzBuzz";\n        else if (i % 3 == 0) ...\n        else if (i % 5 == 0) ...\n        else cout << i;\n        cout << "\\n";\n    }\n    return 0;\n}', hint:'Kiểm tra % 15 trước' },
  { id:7, title:'Đếm chữ số', description:'Nhập số nguyên dương N.\nĐếm số chữ số của N.', sampleInput:'12345', sampleOutput:'5', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    int count = 0;\n    while (n > 0) {\n        n /= 10;\n        count++;\n    }\n    cout << count << endl;\n    return 0;\n}', hint:'Chia cho 10 cho đến khi n = 0' },
  { id:8, title:'Mảng tổng', description:'Nhập N, rồi N số nguyên.\nIn tổng các số đó.', sampleInput:'4\n1 2 3 4', sampleOutput:'10', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    int sum = 0;\n    for (int i = 0; i < n; i++) {\n        int x; cin >> x;\n        sum += x;\n    }\n    cout << sum << endl;\n    return 0;\n}', hint:'Cộng dồn từng phần tử' },
  { id:9, title:'Kiểm tra số nguyên tố', description:'Nhập số nguyên n (2 ≤ n ≤ 1000).\nIn `"Nguyen to"` nếu n là số nguyên tố, ngược lại in `"Khong"`.', sampleInput:'7', sampleOutput:'Nguyen to', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    bool prime = true;\n    for (int i = 2; i * i <= n; i++) {\n        if (n % i == 0) { prime = false; break; }\n    }\n    cout << (prime ? "Nguyen to" : "Khong") << endl;\n    return 0;\n}', hint:'Kiểm tra từ 2 đến sqrt(n)' },
  { id:10, title:'Fibonacci', description:'Nhập N. In N số đầu dãy Fibonacci:\n0 1 1 2 3 5 8 13 ...', sampleInput:'7', sampleOutput:'0 1 1 2 3 5 8', starterCode:'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    int a = 0, b = 1;\n    for (int i = 0; i < n; i++) {\n        if (i > 0) cout << " ";\n        cout << a;\n        int c = a + b; a = b; b = c;\n    }\n    cout << endl;\n    return 0;\n}', hint:'Dùng 2 biến a, b và cập nhật lần lượt' },
]

// ─── Python sandbox HTML (fixed input() issue) ────────────────────────────
function makePythonHTML(starterCode: string) {
  const escaped = starterCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;background:#1e1e2e;color:#cdd6f4;height:100vh;display:flex;flex-direction:column}
#tb{background:#313244;padding:6px 10px;display:flex;gap:6px;align-items:center;border-bottom:1px solid #45475a;flex-shrink:0}
.btn{background:#89b4fa;color:#1e1e2e;border:none;padding:5px 12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px}.btn:hover{background:#74c7ec}
.btn-r{background:#f38ba8}.btn-r:hover{background:#eb6f92}
#lbl{color:#a6e3a1;font-weight:bold;font-size:13px;flex:1}
#code{flex:1;background:#1e1e2e;color:#cdd6f4;border:none;padding:12px;font-family:'Courier New',monospace;font-size:14px;resize:none;outline:none;line-height:1.6;min-height:0}
#ow{height:30%;border-top:2px solid #45475a;display:flex;flex-direction:column;flex-shrink:0}
#oh{background:#313244;padding:3px 12px;font-size:12px;color:#a6adc8;flex-shrink:0}
#out{flex:1;background:#11111b;color:#a6e3a1;padding:10px;font-family:'Courier New',monospace;font-size:13px;overflow-y:auto;white-space:pre-wrap}
</style></head><body>
<div id="tb"><span id="lbl">🐍 Python</span><button class="btn" onclick="run()">▶ Chạy</button><button class="btn btn-r" onclick="document.getElementById('out').textContent=''">✕</button></div>
<textarea id="code" spellcheck="false">${escaped}</textarea>
<div id="ow"><div id="oh">▸ Output</div><div id="out"><span style="color:#f9e2af">Đang tải Python... ⏳</span></div></div>
<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
<script>
let py=null;
async function init(){
  try{
    py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'});
    // Disable input() — không hỗ trợ interactive input trong browser
    await py.runPythonAsync(\`
import sys
class NoInput:
    def readline(self): return ''
sys.stdin = NoInput()
def input(prompt=''):
    return ''
import builtins
builtins.input = input
\`);
    document.getElementById('out').innerHTML='<span style="color:#a6e3a1">✅ Python sẵn sàng! Nhấn ▶ Chạy</span>';
  }catch(e){document.getElementById('out').innerHTML='<span style="color:#f38ba8">⚠️ Không tải được Pyodide.</span>';}
}
async function run(){
  if(!py){document.getElementById('out').textContent='⏳ Đang tải...';return;}
  const code=document.getElementById('code').value,out=[];
  py.setStdout({batched:s=>out.push(s)});py.setStderr({batched:s=>out.push('⚠️ '+s)});
  try{await py.runPythonAsync(code);document.getElementById('out').textContent=out.join('\\n')||'(Không có output)';}
  catch(e){document.getElementById('out').innerHTML='<span style="color:#f38ba8">❌ '+e.message+'</span>';}
}
init();
</script></body></html>`
}

// ─── C++ sandbox ──────────────────────────────────────────────────────────
function makeCppHTML(starterCode: string, stdinVal: string = '') {
  const escaped = starterCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;background:#0d1117;color:#e6edf3;height:100vh;display:flex;flex-direction:column}
#tb{background:#161b22;padding:6px 10px;display:flex;gap:6px;align-items:center;border-bottom:1px solid #30363d;flex-shrink:0}
.btn{background:#7c3aed;color:#fff;border:none;padding:5px 12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px}.btn:hover{background:#6d28d9}
.btn-g{background:#374151}.btn-g:hover{background:#4b5563}
#lbl{color:#c084fc;font-weight:bold;font-size:13px;flex:1}
#code{flex:1;background:#0d1117;color:#e6edf3;border:none;padding:12px;font-family:'Courier New',monospace;font-size:14px;resize:none;outline:none;line-height:1.7;min-height:0}
#si{background:#161b22;border-top:1px solid #30363d;padding:5px 10px;display:flex;align-items:center;gap:6px;flex-shrink:0}
#sl{color:#8b949e;font-size:12px;white-space:nowrap}
#stdin{flex:1;background:#0d1117;color:#e6edf3;border:1px solid #30363d;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:12px}
#ow{height:28%;border-top:2px solid #30363d;display:flex;flex-direction:column;flex-shrink:0}
#oh{background:#161b22;padding:3px 12px;font-size:12px;color:#8b949e;flex-shrink:0}
#out{flex:1;background:#010409;color:#3fb950;padding:10px;font-family:'Courier New',monospace;font-size:13px;overflow-y:auto;white-space:pre-wrap}
</style></head><body>
<div id="tb"><span id="lbl">⚡ C++</span><button class="btn" onclick="run()">▶ Chạy</button><button class="btn btn-g" onclick="reset()">↺</button></div>
<textarea id="code" spellcheck="false">${escaped}</textarea>
<div id="si"><span id="sl">📥 Input:</span><input id="stdin" type="text" value="${stdinVal}" placeholder="stdin..."/></div>
<div id="ow"><div id="oh">▸ Output</div><div id="out">Nhấn ▶ để chạy...</div></div>
<script>
const DEF=document.getElementById('code').value;
async function run(){
  const code=document.getElementById('code').value,stdin=document.getElementById('stdin').value,out=document.getElementById('out');
  out.style.color='#f9e2af';out.textContent='⏳ Biên dịch...';
  try{
    const r=await fetch('https://emkc.org/api/v2/piston/execute',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({language:'cpp',version:'*',files:[{content:code}],stdin})});
    const d=await r.json();
    if(d.run?.stdout){out.style.color='#3fb950';out.textContent=d.run.stdout;}
    else if(d.compile?.stderr){out.style.color='#f85149';out.textContent='❌ Compile Error:\\n'+d.compile.stderr;}
    else if(d.run?.stderr){out.style.color='#f85149';out.textContent='❌ '+d.run.stderr;}
    else out.textContent='(Không có output)';
  }catch(e){out.style.color='#79c0ff';out.innerHTML='💡 Thử: <a href="https://cpp.sh" target="_blank" style="color:#79c0ff">cpp.sh</a>';}
}
function reset(){document.getElementById('code').value=DEF;document.getElementById('out').textContent='';}
</script></body></html>`
}

// ─── Robot Playground ─────────────────────────────────────────────────────
const ROBOT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{font-family:'Segoe UI',sans-serif;background:#fef9c3;display:flex;flex-direction:column;height:100vh}
h2{text-align:center;color:#92400e;padding:8px 0 2px;font-size:15px;flex-shrink:0}
#tb{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;padding:6px;background:#fde68a;border-bottom:2px solid #f59e0b;flex-shrink:0}
.cmd{background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:7px 11px;font-size:13px;font-weight:bold;cursor:grab;user-select:none;touch-action:none;box-shadow:0 2px 4px #0003}
.cmd.rep{background:#8b5cf6}.cmd.iif{background:#ec4899}.cmd.stp{background:#ef4444}
#prog{min-height:50px;background:#fff;border:2px dashed #f59e0b;border-radius:10px;margin:5px;padding:5px;display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start;flex-shrink:0}
#prog.over{background:#fef3c7}
.slot{position:relative;display:inline-flex;align-items:center}
.slot button{position:absolute;top:-5px;right:-5px;width:15px;height:15px;border-radius:50%;background:#ef4444;color:#fff;border:none;font-size:10px;line-height:15px;text-align:center;cursor:pointer;z-index:10;padding:0}
#btns{display:flex;gap:6px;justify-content:center;padding:4px;flex-shrink:0}
.run{background:#16a34a;color:#fff;border:none;border-radius:10px;padding:7px 16px;font-size:13px;font-weight:bold;cursor:pointer}
.clr{background:#6b7280;color:#fff;border:none;border-radius:10px;padding:7px 12px;font-size:13px;cursor:pointer}
#mazeWrap{flex:1;display:flex;align-items:center;justify-content:center;min-height:0;padding:4px}
canvas{border-radius:12px;border:2px solid #f59e0b;max-height:100%;max-width:100%}
#msg{text-align:center;padding:5px;font-weight:bold;font-size:13px;color:#92400e;flex-shrink:0}
</style></head><body>
<h2>🤖 Kéo lệnh → Điều khiển Robot!</h2>
<div id="tb">
  <div class="cmd" draggable="true" data-cmd="⬆️">⬆️ Tiến</div>
  <div class="cmd" draggable="true" data-cmd="⬇️">⬇️ Lùi</div>
  <div class="cmd" draggable="true" data-cmd="⬅️">⬅️ Trái</div>
  <div class="cmd" draggable="true" data-cmd="➡️">➡️ Phải</div>
  <div class="cmd rep" draggable="true" data-cmd="🔁2">🔁×2</div>
  <div class="cmd rep" draggable="true" data-cmd="🔁3">🔁×3</div>
  <div class="cmd stp" draggable="true" data-cmd="🛑">🛑 Dừng</div>
</div>
<div id="prog" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event)">
  <span id="ph" style="color:#9ca3af;font-size:12px;padding:2px">👆 Kéo lệnh vào đây...</span>
</div>
<div id="btns"><button class="run" onclick="runRobot()">▶ Chạy</button><button class="clr" onclick="clear_()">✕ Xoá</button></div>
<div id="mazeWrap"><canvas id="maze"></canvas></div>
<div id="msg">Giúp 🤖 đến 🏫!</div>
<script>
const G=5,S=44;let rb={x:0,y:4},go={x:4,y:0},walls=[[1,1],[1,2],[2,2],[3,2],[3,3]],running=false,drag=null;
const cv=document.getElementById('maze');cv.width=G*S;cv.height=G*S;
document.querySelectorAll('.cmd').forEach(el=>{
  el.addEventListener('dragstart',e=>{drag=e.target.dataset.cmd;});
  el.addEventListener('touchstart',e=>{drag=e.target.dataset.cmd;},{passive:true});
});
const prog=document.getElementById('prog');
prog.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
prog.addEventListener('touchend',()=>{if(drag){add(drag);drag=null;}},{passive:true});
function drop(e){e.preventDefault();prog.classList.remove('over');add(drag||e.dataTransfer.getData('text'));drag=null;}
function add(cmd){if(!cmd)return;const ph=document.getElementById('ph');if(ph)ph.remove();
  const slot=document.createElement('div');slot.className='slot';
  const btn=document.createElement('button');btn.textContent='×';btn.onclick=()=>slot.remove();
  const tag=document.createElement('div');tag.className='cmd';tag.textContent=cmd;tag.style.cursor='default';tag.style.fontSize='12px';
  if(cmd.startsWith('🔁'))tag.style.background='#8b5cf6';
  if(cmd.startsWith('🛑'))tag.style.background='#ef4444';
  slot.append(btn,tag);prog.appendChild(slot);}
function clear_(){prog.innerHTML='<span id="ph" style="color:#9ca3af;font-size:12px;padding:2px">👆 Kéo lệnh vào đây...</span>';rb={x:0,y:4};draw();msg('Giúp 🤖 đến 🏫!','#92400e');}
function draw(hi){const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);
  for(let r=0;r<G;r++)for(let c=0;c<G;c++){const w=walls.some(x=>x[0]===c&&x[1]===r);ctx.fillStyle=w?'#374151':'#f0fdf4';ctx.fillRect(c*S+1,r*S+1,S-2,S-2);if(!w){ctx.strokeStyle='#bbf7d0';ctx.strokeRect(c*S+1,r*S+1,S-2,S-2);}}
  const f=S*.55+'px serif';ctx.font=f;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('🏫',go.x*S+S/2,go.y*S+S/2);
  if(hi){ctx.fillStyle='rgba(59,130,246,.2)';ctx.fillRect(rb.x*S+1,rb.y*S+1,S-2,S-2);}
  ctx.fillText('🤖',rb.x*S+S/2,rb.y*S+S/2);}
function msg(t,c){const m=document.getElementById('msg');m.textContent=t;m.style.color=c;}
async function runRobot(){if(running)return;running=true;rb={x:0,y:4};draw();msg('🤖 Chạy...','#1d4ed8');
  const cmds=[...prog.querySelectorAll('.slot')].map(s=>s.querySelector('.cmd').textContent);
  async function exec(list){for(const c of list){await new Promise(r=>setTimeout(r,350));
    let nx=rb.x,ny=rb.y;
    if(c.startsWith('⬆️'))ny--;else if(c.startsWith('⬇️'))ny++;else if(c.startsWith('⬅️'))nx--;else if(c.startsWith('➡️'))nx++;
    else if(c.startsWith('🔁2')){await exec(['⬆️','⬆️']);continue;}
    else if(c.startsWith('🔁3')){await exec(['⬆️','⬆️','⬆️']);continue;}
    else if(c.startsWith('🛑')){running=false;return;}
    if(nx<0||nx>=G||ny<0||ny>=G||walls.some(w=>w[0]===nx&&w[1]===ny)){msg('💥 Bị chặn! Thử lại 🔄','#dc2626');draw(true);running=false;return;}
    rb={x:nx,y:ny};draw(true);
    if(rb.x===go.x&&rb.y===go.y){msg('🎉 Giỏi lắm! Đến đích rồi!','#16a34a');running=false;return;}}}
  await exec(cmds);if(running){msg(rb.x===go.x&&rb.y===go.y?'🎉 Tuyệt!':'🤔 Chưa xong. Thử lại!',rb.x===go.x&&rb.y===go.y?'#16a34a':'#d97706');running=false;}
}draw();
</script></body></html>`

// ─── Sandbox iframe ────────────────────────────────────────────────────────
function SandboxIDE({ html, title }: { html: string; title: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const blob = new Blob([html], { type: 'text/html' })
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [html])
  if (!url) return <div className="flex items-center justify-center h-full bg-gray-900 rounded-2xl text-gray-400 text-sm">Đang tải IDE...</div>
  return <iframe src={url} className="w-full h-full rounded-2xl border-0" title={title} sandbox="allow-scripts allow-same-origin" />
}

// ─── Scratch — hướng dẫn rõ ràng ─────────────────────────────────────────
function ScratchPanel() {
  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🐱</span>
          <div>
            <p className="font-black text-orange-900 text-lg">Scratch — Lập trình kéo thả</p>
            <p className="text-sm text-orange-700">Scratch không hỗ trợ nhúng trực tiếp — mở tab mới để code!</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition">
            <ExternalLink className="w-4 h-4" /> Mở Scratch.mit.edu
          </a>
          <a href="https://turbowarp.org/" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 text-white font-black rounded-2xl transition">
            <ExternalLink className="w-4 h-4" /> Mở TurboWarp
          </a>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="font-bold text-gray-700 mb-3">📋 Hướng dẫn làm bài:</p>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">1</span>Đọc đề bài ở tab <strong>Bài tập</strong> bên trái</li>
          <li className="flex items-start gap-2"><span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">2</span>Nhấn nút trên để mở <strong>Scratch</strong> trong tab mới</li>
          <li className="flex items-start gap-2"><span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">3</span>Kéo thả block để tạo project theo yêu cầu</li>
          <li className="flex items-start gap-2"><span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs">4</span>Lưu → <strong>Share</strong> → Copy link → Gửi giáo viên</li>
        </ol>
      </div>
    </div>
  )
}

// ─── Problem panel (left side) ─────────────────────────────────────────────
function ProblemPanel({
  problems, theoryContent, subjectName, onSelectProblem,
}: {
  problems: CodingProblem[]
  theoryContent?: string
  subjectName: string
  onSelectProblem: (p: CodingProblem) => void
}) {
  const [tab, setTab] = useState<'problems' | 'theory'>('problems')
  const [qi, setQi] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showAns, setShowAns] = useState(false)

  const q = problems[qi]

  useEffect(() => { onSelectProblem(problems[0]) }, [])
  useEffect(() => { onSelectProblem(q); setShowHint(false); setShowAns(false) }, [qi])

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border-2 border-purple-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 flex-shrink-0 bg-purple-50">
        <Code2 className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-black text-purple-700">Bài tập thực hành ({problems.length} bài)</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {(
          <div className="p-3 space-y-3">
            {/* Problem navigator */}
            <div className="flex gap-1 flex-wrap">
              {problems.map((_, i) => (
                <button key={i} onClick={() => setQi(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${i === qi ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'}`}>
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Problem statement */}
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">Bài {qi + 1}</span>
                <span className="text-sm font-black text-gray-800">{q?.title}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{q?.description}</p>
            </div>

            {/* Sample I/O */}
            {q?.sampleInput && q.sampleInput !== '(không có)' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-900 rounded-xl p-2.5">
                  <p className="text-xs text-gray-400 font-bold mb-1">📥 Input mẫu</p>
                  <code className="text-xs text-green-400 font-mono">{q.sampleInput}</code>
                </div>
                <div className="bg-gray-900 rounded-xl p-2.5">
                  <p className="text-xs text-gray-400 font-bold mb-1">📤 Output mẫu</p>
                  <code className="text-xs text-yellow-400 font-mono">{q.sampleOutput}</code>
                </div>
              </div>
            )}
            {q?.sampleInput === '(không có)' && (
              <div className="bg-gray-900 rounded-xl p-2.5">
                <p className="text-xs text-gray-400 font-bold mb-1">📤 Output mẫu</p>
                <code className="text-xs text-yellow-400 font-mono whitespace-pre">{q.sampleOutput}</code>
              </div>
            )}

            {/* Hint */}
            <button onClick={() => setShowHint(h => !h)}
              className="w-full py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-xs font-bold text-yellow-700 hover:bg-yellow-100 transition">
              {showHint ? '🙈 Ẩn gợi ý' : '💡 Xem gợi ý'}
            </button>
            {showHint && <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">💡 {q?.hint}</div>}

            {/* Nav */}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setQi(i => Math.max(0, i-1))} disabled={qi === 0}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs disabled:opacity-30 hover:bg-gray-200 transition">
                <ChevronLeft className="w-3.5 h-3.5" /> Bài trước
              </button>
              <button onClick={() => setQi(i => Math.min(problems.length-1, i+1))} disabled={qi === problems.length-1}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs disabled:opacity-30 hover:bg-purple-700 transition">
                Bài tiếp <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main IDETab ───────────────────────────────────────────────────────────
interface IDETabProps {
  courseType: CourseType
  subjectName: string
  questions?: any[]
  theoryContent?: string
  theoryTitle?: string
}

export function IDETab({ courseType, subjectName, questions = [], theoryContent, theoryTitle }: IDETabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentProblem, setCurrentProblem] = useState<CodingProblem | null>(null)

  const isPython = courseType === 'LAP_TRINH_PYTHON'
  const isCpp    = courseType === 'LAP_TRINH_CPP'
  const isScratch = courseType === 'LAP_TRINH_SCRATCH'
  const isRobot  = courseType === 'LAP_TRINH_THUAT_TOAN'

  const problems = isPython ? PYTHON_PROBLEMS : isCpp ? CPP_PROBLEMS : []

  const ideHTML = isPython && currentProblem
    ? makePythonHTML(currentProblem.starterCode)
    : isCpp && currentProblem
    ? makeCppHTML(currentProblem.starterCode, currentProblem.sampleInput !== '(không có)' ? currentProblem.sampleInput : '')
    : isPython ? makePythonHTML('# Viết code Python ở đây\nprint("Hello, World!")')
    : isCpp    ? makeCppHTML('#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    cout << "Hello!" << endl;\n    return 0;\n}')
    : ''

  const label: Record<string, string> = {
    LAP_TRINH_SCRATCH: '🐱 Scratch', LAP_TRINH_PYTHON: '🐍 Python',
    LAP_TRINH_CPP: '⚡ C++',         LAP_TRINH_THUAT_TOAN: '🤖 Robot',
  }

  return (
    <div className={isFullscreen
      ? 'fixed inset-0 z-50 bg-gray-100 flex flex-col p-3 gap-2'
      : 'flex flex-col gap-3'}>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Code2 className="w-4 h-4 text-purple-600" />
        <span className="font-black text-gray-800 text-sm">{label[courseType] ?? '💻 IDE'}</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full hidden sm:inline">{subjectName}</span>
      </div>

      {/* Layout: bài tập + lý thuyết trên, IDE dưới */}
      <div className={isFullscreen ? 'flex-1 flex flex-col gap-3 min-h-0' : 'flex flex-col gap-3'}>

        {/* Scratch & Robot: không có IDE nhúng */}
        {isScratch && <ScratchPanel />}
        {isRobot && (
          <div className={isFullscreen ? 'flex-1 min-h-0' : 'h-[460px]'}>
            <SandboxIDE html={ROBOT_HTML} title="Robot" />
          </div>
        )}

        {/* Python & C++: ProblemPanel + IDE xếp dọc */}
        {(isPython || isCpp) && (
          <>
            {/* Problem panel */}
            <div className={isFullscreen ? 'h-[45%] min-h-0' : 'h-[300px]'}>
              <ProblemPanel
                problems={problems}
                theoryContent={theoryContent}
                subjectName={subjectName}
                onSelectProblem={setCurrentProblem}
              />
            </div>

            {/* IDE */}
            <div className={isFullscreen ? 'flex-1 min-h-0' : 'h-[400px]'}>
              {ideHTML && (
                <SandboxIDE key={currentProblem?.id ?? 0} html={ideHTML} title={isPython ? 'Python' : 'C++'} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
