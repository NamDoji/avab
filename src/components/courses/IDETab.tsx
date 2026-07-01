'use client'

import { useState, useEffect } from 'react'
import { Maximize2, Minimize2, Code2, ExternalLink } from 'lucide-react'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

interface Question {
  id: string
  order: number
  questionType: string
  content: string
  options?: any
  correctAnswer: string
  explanation?: string
  points: number
}

// ── Python IDE (Pyodide sandbox) ──────────────────────────────────────────
const PYTHON_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;background:#1e1e2e;color:#cdd6f4;height:100vh;display:flex;flex-direction:column}
#tb{background:#313244;padding:8px 12px;display:flex;gap:8px;align-items:center;border-bottom:1px solid #45475a}
.btn{background:#89b4fa;color:#1e1e2e;border:none;padding:5px 14px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px}.btn:hover{background:#74c7ec}
.btn-r{background:#f38ba8}.btn-r:hover{background:#eb6f92}
#lbl{color:#a6e3a1;font-weight:bold;font-size:13px;flex:1}
#code{flex:1;background:#1e1e2e;color:#cdd6f4;border:none;padding:12px;font-family:'Courier New',monospace;font-size:14px;resize:none;outline:none;line-height:1.6}
#ow{height:35%;border-top:2px solid #45475a;display:flex;flex-direction:column}
#oh{background:#313244;padding:4px 12px;font-size:12px;color:#a6adc8}
#out{flex:1;background:#11111b;color:#a6e3a1;padding:10px;font-family:'Courier New',monospace;font-size:13px;overflow-y:auto;white-space:pre-wrap}
</style></head><body>
<div id="tb"><span id="lbl">🐍 Python Lab</span><button class="btn" onclick="run()">▶ Chạy</button><button class="btn btn-r" onclick="document.getElementById('out').textContent=''">✕ Xoá</button></div>
<textarea id="code" spellcheck="false"># Viết code Python ở đây
print("Hello, World!")
name = input("Tên bạn là gì? ")
print("Xin chào,", name, "🎉")</textarea>
<div id="ow"><div id="oh">▸ Output</div><div id="out"><span style="color:#f9e2af">Đang tải Python... ⏳</span></div></div>
<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
<script>
let py=null;
async function init(){try{py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'});document.getElementById('out').innerHTML='<span style="color:#a6e3a1">✅ Python sẵn sàng! Nhấn ▶ Chạy</span>';}catch(e){document.getElementById('out').innerHTML='<span style="color:#f38ba8">⚠️ Lỗi tải. Thử F5.</span>';}}
async function run(){if(!py){document.getElementById('out').textContent='⏳ Đang tải...';return;}
const code=document.getElementById('code').value;const out=[];
py.setStdout({batched:s=>out.push(s)});py.setStderr({batched:s=>out.push('⚠️ '+s)});
try{await py.runPythonAsync(code);document.getElementById('out').textContent=out.join('\\n')||'(Không có output)';}
catch(e){document.getElementById('out').innerHTML='<span style="color:#f38ba8">❌ '+e.message+'</span>';}}
init();
</script></body></html>`

// ── C++ Editor sandbox ─────────────────────────────────────────────────────
const CPP_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;background:#0d1117;color:#e6edf3;height:100vh;display:flex;flex-direction:column}
#tb{background:#161b22;padding:8px 12px;display:flex;gap:8px;align-items:center;border-bottom:1px solid #30363d}
.btn{background:#7c3aed;color:#fff;border:none;padding:5px 14px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px}.btn:hover{background:#6d28d9}
.btn-g{background:#374151}.btn-g:hover{background:#4b5563}
#lbl{color:#c084fc;font-weight:bold;font-size:13px;flex:1}
#code{flex:1;background:#0d1117;color:#e6edf3;border:none;padding:12px;font-family:'Courier New',monospace;font-size:14px;resize:none;outline:none;line-height:1.7}
#si{background:#161b22;border-top:1px solid #30363d;padding:6px 12px;display:flex;align-items:center;gap:8px}
#sl{color:#8b949e;font-size:12px;white-space:nowrap}
#stdin{flex:1;background:#0d1117;color:#e6edf3;border:1px solid #30363d;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:13px}
#ow{height:30%;border-top:2px solid #30363d;display:flex;flex-direction:column}
#oh{background:#161b22;padding:4px 12px;font-size:12px;color:#8b949e}
#out{flex:1;background:#010409;color:#3fb950;padding:10px;font-family:'Courier New',monospace;font-size:13px;overflow-y:auto;white-space:pre-wrap}
</style></head><body>
<div id="tb"><span id="lbl">⚡ C++ Editor</span><button class="btn" onclick="run()">▶ Biên dịch & Chạy</button><button class="btn btn-g" onclick="reset()">↺ Reset</button></div>
<textarea id="code" spellcheck="false">#include &lt;bits/stdc++.h&gt;
using namespace std;

int main() {
    // Viết code C++ ở đây
    cout &lt;&lt; "Hello, C++!" &lt;&lt; endl;
    
    int n;
    cout &lt;&lt; "Nhap so: ";
    cin &gt;&gt; n;
    cout &lt;&lt; "So ban nhap: " &lt;&lt; n &lt;&lt; endl;
    
    return 0;
}</textarea>
<div id="si"><span id="sl">📥 Input:</span><input id="stdin" type="text" placeholder="Nhập input (nếu cần)..."/></div>
<div id="ow"><div id="oh">▸ Output</div><div id="out">Nhấn ▶ để biên dịch và chạy...</div></div>
<script>
const DEF=document.getElementById('code').value;
async function run(){
  const code=document.getElementById('code').value,stdin=document.getElementById('stdin').value,out=document.getElementById('out');
  out.style.color='#f9e2af';out.textContent='⏳ Đang biên dịch...';
  try{
    const r=await fetch('https://emkc.org/api/v2/piston/execute',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({language:'cpp',version:'*',files:[{content:code}],stdin})});
    const d=await r.json();
    if(d.run?.stdout){out.style.color='#3fb950';out.textContent=d.run.stdout;}
    else if(d.run?.stderr){out.style.color='#f85149';out.textContent='❌ '+d.run.stderr;}
    else if(d.compile?.stderr){out.style.color='#f85149';out.textContent='❌ Compile Error:\\n'+d.compile.stderr;}
    else out.textContent='(Không có output)';
  }catch(e){
    out.style.color='#a6e3a1';out.innerHTML='💡 Dùng online compiler:\\n• <a href="https://cpp.sh" target="_blank" style="color:#79c0ff">cpp.sh</a>  • <a href="https://ide.geeksforgeeks.org" target="_blank" style="color:#79c0ff">GFG IDE</a>';
  }
}
function reset(){document.getElementById('code').value=DEF;document.getElementById('out').textContent='';}
</script></body></html>`

// ── Robot Drag-Drop IDE (Algorithm) ────────────────────────────────────────
const ROBOT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{font-family:'Segoe UI',sans-serif;background:#fef9c3;min-height:100vh;display:flex;flex-direction:column}
h2{text-align:center;color:#92400e;padding:10px 0 4px;font-size:16px}
#tb{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;padding:8px;background:#fde68a;border-bottom:2px solid #f59e0b}
.cmd{background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:8px 14px;font-size:15px;font-weight:bold;cursor:grab;user-select:none;touch-action:none;box-shadow:0 3px 6px #00000030;transition:transform .1s}
.cmd:active{transform:scale(.95)}
.cmd.rep{background:#8b5cf6}.cmd.iif{background:#ec4899}.cmd.stp{background:#ef4444}
#prog{min-height:70px;background:#fff;border:2px dashed #f59e0b;border-radius:12px;margin:8px;padding:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start}
#prog.over{background:#fef3c7;border-color:#d97706}
.slot{position:relative;display:inline-flex;align-items:center}
.slot button{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#ef4444;color:#fff;border:none;font-size:11px;line-height:18px;text-align:center;cursor:pointer;z-index:10;padding:0}
#btns{display:flex;gap:8px;justify-content:center;padding:6px}
.run{background:#16a34a;color:#fff;border:none;border-radius:10px;padding:9px 20px;font-size:15px;font-weight:bold;cursor:pointer}
.clr{background:#6b7280;color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:15px;cursor:pointer}
#maze{background:#fff;border-radius:16px;margin:8px;border:2px solid #f59e0b;overflow:hidden}
#msg{text-align:center;padding:6px;font-weight:bold;font-size:15px;min-height:30px;color:#92400e}
</style></head><body>
<h2>🤖 Robot Playground — Kéo lệnh để điều khiển robot!</h2>
<div id="tb">
  <div class="cmd" draggable="true" data-cmd="⬆️ Tiến">⬆️ Tiến</div>
  <div class="cmd" draggable="true" data-cmd="⬇️ Lùi">⬇️ Lùi</div>
  <div class="cmd" draggable="true" data-cmd="⬅️ Trái">⬅️ Trái</div>
  <div class="cmd" draggable="true" data-cmd="➡️ Phải">➡️ Phải</div>
  <div class="cmd rep" draggable="true" data-cmd="🔁 Lặp 2x">🔁 Lặp 2x</div>
  <div class="cmd rep" draggable="true" data-cmd="🔁 Lặp 3x">🔁 Lặp 3x</div>
  <div class="cmd iif" draggable="true" data-cmd="❓ Nếu...thì">❓ Nếu...thì</div>
  <div class="cmd stp" draggable="true" data-cmd="🛑 Dừng">🛑 Dừng</div>
</div>
<div id="prog" ondragover="ev.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event)">
  <span style="color:#9ca3af;font-size:13px;padding:4px">👆 Kéo lệnh vào đây...</span>
</div>
<div id="btns">
  <button class="run" onclick="runRobot()">▶ Chạy Robot</button>
  <button class="clr" onclick="clearProg()">✕ Xoá</button>
</div>
<canvas id="maze" width="280" height="200"></canvas>
<div id="msg">Lập trình robot đi từ 🏠 đến 🏫!</div>
<script>
const GRID=5,CS=40;
let robot={x:0,y:4},cmds=[],running=false;
const goal={x:4,y:0};
const walls=[[1,1],[1,2],[2,2],[3,2],[3,3]];
let dragging=null;

document.querySelectorAll('.cmd').forEach(el=>{
  el.addEventListener('dragstart',e=>{dragging=e.target.dataset.cmd;e.dataTransfer.effectAllowed='copy';});
  // Touch support
  el.addEventListener('touchstart',e=>{dragging=e.target.dataset.cmd;},{ passive:true });
});

document.getElementById('prog').addEventListener('touchmove',e=>{e.preventDefault();},{passive:false});
document.getElementById('prog').addEventListener('touchend',e=>{
  if(dragging){ addCmd(dragging); dragging=null; }
},{passive:true});

function drop(e){
  e.preventDefault();
  document.getElementById('prog').classList.remove('over');
  const cmd=dragging||e.dataTransfer.getData('text');
  if(cmd) addCmd(cmd);
  dragging=null;
}

function addCmd(cmd){
  const prog=document.getElementById('prog');
  const placeholder=prog.querySelector('span');
  if(placeholder) placeholder.remove();
  const slot=document.createElement('div');
  slot.className='slot';
  const btn=document.createElement('button');
  btn.textContent='×';btn.onclick=()=>slot.remove();
  const tag=document.createElement('div');
  tag.className='cmd';tag.textContent=cmd;tag.style.cursor='default';
  if(cmd.includes('Lặp')||cmd.includes('🔁'))tag.style.background='#8b5cf6';
  if(cmd.includes('Nếu'))tag.style.background='#ec4899';
  if(cmd.includes('Dừng'))tag.style.background='#ef4444';
  slot.appendChild(btn);slot.appendChild(tag);
  prog.appendChild(slot);
  cmds.push(cmd);
}

function clearProg(){
  const prog=document.getElementById('prog');
  prog.innerHTML='<span style="color:#9ca3af;font-size:13px;padding:4px">👆 Kéo lệnh vào đây...</span>';
  cmds=[];robot={x:0,y:4};draw();setMsg('Lập trình robot đi từ 🏠 đến 🏫!','#92400e');
}

function draw(highlight){
  const cv=document.getElementById('maze'),ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  for(let r=0;r<GRID;r++){for(let c=0;c<GRID;c++){
    const isWall=walls.some(w=>w[0]===c&&w[1]===r);
    ctx.fillStyle=isWall?'#374151':'#f0fdf4';
    ctx.fillRect(c*CS+2,r*CS+2,CS-4,CS-4);
    ctx.strokeStyle='#d1fae5';ctx.strokeRect(c*CS+2,r*CS+2,CS-4,CS-4);
  }}
  // Goal
  ctx.font='24px serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('🏫',goal.x*CS+CS/2,goal.y*CS+CS/2);
  // Robot
  if(highlight){ctx.fillStyle='rgba(59,130,246,0.3)';ctx.fillRect(robot.x*CS+2,robot.y*CS+2,CS-4,CS-4);}
  ctx.fillText('🤖',robot.x*CS+CS/2,robot.y*CS+CS/2);
}

function setMsg(t,c){document.getElementById('msg').textContent=t;document.getElementById('msg').style.color=c||'#92400e';}

async function runRobot(){
  if(running)return;running=true;
  robot={x:0,y:4};draw();setMsg('🤖 Đang chạy...','#1d4ed8');
  const prog=document.getElementById('prog');
  const slots=[...prog.querySelectorAll('.slot')];
  const commands=slots.map(s=>s.querySelector('.cmd').textContent);
  
  async function exec(list){
    for(const cmd of list){
      await new Promise(r=>setTimeout(r,400));
      let nx=robot.x,ny=robot.y;
      if(cmd.includes('Tiến'))ny--;
      else if(cmd.includes('Lùi'))ny++;
      else if(cmd.includes('Trái'))nx--;
      else if(cmd.includes('Phải'))nx++;
      else if(cmd.includes('Lặp 2x')){await exec(['⬆️ Tiến','⬆️ Tiến']);continue;}
      else if(cmd.includes('Lặp 3x')){await exec(['⬆️ Tiến','⬆️ Tiến','⬆️ Tiến']);continue;}
      else if(cmd.includes('Dừng'))break;
      
      const isWall=walls.some(w=>w[0]===nx&&w[1]===ny);
      if(nx<0||nx>=GRID||ny<0||ny>=GRID||isWall){
        setMsg('💥 Ối! Robot bị chặn rồi!','#dc2626');draw(true);running=false;return;
      }
      robot={x:nx,y:ny};draw(true);
      if(robot.x===goal.x&&robot.y===goal.y){
        setMsg('🎉 Robot đến đích rồi! Giỏi lắm!','#16a34a');running=false;return;
      }
    }
  }
  await exec(commands);
  if(running){setMsg(robot.x===goal.x&&robot.y===goal.y?'🎉 Tuyệt vời!':'🤔 Chưa đến đích. Thử lại nhé!',robot.x===goal.x&&robot.y===goal.y?'#16a34a':'#d97706');}
  running=false;
}

draw();
</script></body></html>`

// ── Sandbox iframe ─────────────────────────────────────────────────────────
function SandboxIDE({ html, title, height = '520px' }: { html: string; title: string; height?: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const blob = new Blob([html], { type: 'text/html' })
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [])
  if (!url) return <div className="flex items-center justify-center h-48 text-gray-400">Đang tải...</div>
  return <iframe src={url} className={`w-full rounded-2xl border-2 border-gray-200 shadow`} style={{ height }} title={title} sandbox="allow-scripts allow-same-origin" />
}

// ── Scratch via TurboWarp (cho phép iframe) ────────────────────────────────
function ScratchIDE({ height }: { height: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-start gap-3">
        <span className="text-2xl">🐱</span>
        <div className="text-sm flex-1">
          <p className="font-bold text-orange-800">Scratch Editor (TurboWarp)</p>
          <p className="text-orange-700 mt-0.5">Kéo thả block để lập trình. Nhấn <strong>🚩 cờ xanh</strong> để chạy!</p>
        </div>
        <a href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-1 rounded-lg font-bold shrink-0">
          <ExternalLink className="w-3 h-3" /> Mở rộng
        </a>
      </div>
      <iframe
        src="https://turbowarp.org/editor"
        className="w-full rounded-2xl border-2 border-orange-200 shadow-lg"
        style={{ height }}
        allow="microphone; camera"
        title="Scratch / TurboWarp Editor"
      />
    </div>
  )
}

// ── Question panel ─────────────────────────────────────────────────────────
function QuestionPanel({ questions }: { questions: Question[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  if (!questions || questions.length === 0) return null
  const q = questions[activeIdx]
  const opts: any[] = Array.isArray(q.options) ? q.options : []

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-100 p-4 flex flex-col gap-3">
      {/* Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-purple-700">📝 Câu hỏi thực hành:</span>
        <div className="flex gap-1 flex-wrap">
          {questions.slice(0, 10).map((_, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                i === activeIdx ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
              }`}>
              {i + 1}
            </button>
          ))}
          {questions.length > 10 && <span className="text-xs text-gray-400">+{questions.length - 10}</span>}
        </div>
      </div>

      {/* Question */}
      <div className="bg-purple-50 rounded-xl p-3">
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">{q.content}</p>
      </div>

      {/* Options for MC */}
      {(q.questionType === 'MULTIPLE_CHOICE' || q.questionType === 'TRUE_FALSE') && opts.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {opts.map((opt: any) => (
            <div key={opt.key} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700">
              <span className="font-bold text-purple-600">{opt.key}.</span> {opt.text}
            </div>
          ))}
        </div>
      )}

      {/* Answer toggle */}
      <details className="text-sm">
        <summary className="cursor-pointer text-purple-600 font-semibold hover:text-purple-800">💡 Xem đáp án</summary>
        <div className="mt-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <p className="font-bold text-green-700">✅ Đáp án: {q.correctAnswer}</p>
          {q.explanation && <p className="text-green-600 mt-1">{q.explanation}</p>}
        </div>
      </details>

      <div className="flex gap-2">
        <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))} disabled={activeIdx === 0}
          className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm disabled:opacity-40 hover:bg-gray-200 transition">
          ← Câu trước
        </button>
        <button onClick={() => setActiveIdx(i => Math.min(questions.length - 1, i + 1))} disabled={activeIdx === questions.length - 1}
          className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm disabled:opacity-40 hover:bg-purple-700 transition">
          Câu tiếp →
        </button>
      </div>
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
interface IDETabProps {
  courseType: CourseType
  subjectName: string
  questions?: Question[]
}

export function IDETab({ courseType, subjectName, questions = [] }: IDETabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const label: Record<string, { text: string; emoji: string }> = {
    LAP_TRINH_SCRATCH:    { text: 'Scratch Editor', emoji: '🐱' },
    LAP_TRINH_PYTHON:     { text: 'Python IDE',     emoji: '🐍' },
    LAP_TRINH_CPP:        { text: 'C++ Editor',     emoji: '⚡' },
    LAP_TRINH_THUAT_TOAN: { text: 'Robot Playground', emoji: '🤖' },
  }
  const lbl = label[courseType] ?? { text: 'IDE', emoji: '💻' }
  const ideH = isFullscreen ? '70vh' : '480px'

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-gray-50 overflow-auto p-4' : ''}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-600" />
          <h3 className="font-black text-gray-800">{lbl.emoji} {lbl.text}</h3>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold hidden sm:inline">{subjectName}</span>
        </div>
        <button onClick={() => setIsFullscreen(f => !f)}
          className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition">
          {isFullscreen
            ? <><Minimize2 className="w-4 h-4" /> Thu nhỏ</>
            : <><Maximize2 className="w-4 h-4" /> Phóng to</>}
        </button>
      </div>

      {/* Layout: questions top, IDE bottom (mobile) OR side by side (desktop fullscreen) */}
      <div className={isFullscreen ? 'grid grid-cols-2 gap-4 h-[calc(100vh-80px)]' : 'flex flex-col gap-4'}>
        {/* Question panel */}
        {questions.length > 0 && (
          <div className={isFullscreen ? 'overflow-auto' : ''}>
            <QuestionPanel questions={questions} />
          </div>
        )}

        {/* IDE */}
        <div className={isFullscreen ? 'flex flex-col' : ''}>
          {courseType === 'LAP_TRINH_SCRATCH'    && <ScratchIDE height={ideH} />}
          {courseType === 'LAP_TRINH_PYTHON'     && <SandboxIDE html={PYTHON_HTML}  title="Python IDE"    height={ideH} />}
          {courseType === 'LAP_TRINH_CPP'        && <SandboxIDE html={CPP_HTML}     title="C++ Editor"    height={ideH} />}
          {courseType === 'LAP_TRINH_THUAT_TOAN' && <SandboxIDE html={ROBOT_HTML}   title="Robot Playground" height={isFullscreen ? '100%' : '420px'} />}
        </div>
      </div>
    </div>
  )
}
