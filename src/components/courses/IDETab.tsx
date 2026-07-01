'use client'

import { useState, useEffect } from 'react'
import { Maximize2, Minimize2, Code2, ExternalLink, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

interface Question {
  id: string; order: number; questionType: string; content: string
  options?: any; correctAnswer: string; explanation?: string; points: number
}

// ─── Python IDE ────────────────────────────────────────────────────────────
const PYTHON_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;background:#1e1e2e;color:#cdd6f4;height:100vh;display:flex;flex-direction:column}
#tb{background:#313244;padding:6px 10px;display:flex;gap:6px;align-items:center;border-bottom:1px solid #45475a;flex-shrink:0}
.btn{background:#89b4fa;color:#1e1e2e;border:none;padding:5px 12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px}.btn:hover{background:#74c7ec}
.btn-r{background:#f38ba8}.btn-r:hover{background:#eb6f92}
#lbl{color:#a6e3a1;font-weight:bold;font-size:13px;flex:1}
#code{flex:1;background:#1e1e2e;color:#cdd6f4;border:none;padding:12px;font-family:'Courier New',monospace;font-size:14px;resize:none;outline:none;line-height:1.6;min-height:0}
#ow{height:32%;border-top:2px solid #45475a;display:flex;flex-direction:column;flex-shrink:0}
#oh{background:#313244;padding:3px 12px;font-size:12px;color:#a6adc8;flex-shrink:0}
#out{flex:1;background:#11111b;color:#a6e3a1;padding:10px;font-family:'Courier New',monospace;font-size:13px;overflow-y:auto;white-space:pre-wrap}
</style></head><body>
<div id="tb"><span id="lbl">🐍 Python</span><button class="btn" onclick="run()">▶ Chạy</button><button class="btn btn-r" onclick="document.getElementById('out').textContent=''">✕</button></div>
<textarea id="code" spellcheck="false"># Viết code Python ở đây
print("Hello, World!")

# Thử input:
# name = input("Tên bạn: ")
# print("Xin chào,", name)</textarea>
<div id="ow"><div id="oh">▸ Output</div><div id="out"><span style="color:#f9e2af">Đang tải Python... ⏳</span></div></div>
<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
<script>
let py=null;
async function init(){try{py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'});document.getElementById('out').innerHTML='<span style="color:#a6e3a1">✅ Python sẵn sàng! Nhấn ▶ Chạy</span>';}catch(e){document.getElementById('out').innerHTML='<span style="color:#f38ba8">⚠️ Không tải được Pyodide.</span>';}}
async function run(){if(!py){document.getElementById('out').textContent='⏳ Đang tải...';return;}
const code=document.getElementById('code').value,out=[];
py.setStdout({batched:s=>out.push(s)});py.setStderr({batched:s=>out.push('⚠️ '+s)});
try{await py.runPythonAsync(code);document.getElementById('out').textContent=out.join('\n')||'(Không có output)';}
catch(e){document.getElementById('out').innerHTML='<span style="color:#f38ba8">❌ '+e.message+'</span>';}}
init();
</script></body></html>`

// ─── C++ Editor ────────────────────────────────────────────────────────────
const CPP_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;background:#0d1117;color:#e6edf3;height:100vh;display:flex;flex-direction:column}
#tb{background:#161b22;padding:6px 10px;display:flex;gap:6px;align-items:center;border-bottom:1px solid #30363d;flex-shrink:0}
.btn{background:#7c3aed;color:#fff;border:none;padding:5px 12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px}.btn:hover{background:#6d28d9}
.btn-g{background:#374151}.btn-g:hover{background:#4b5563}
#lbl{color:#c084fc;font-weight:bold;font-size:13px;flex:1}
#code{flex:1;background:#0d1117;color:#e6edf3;border:none;padding:12px;font-family:'Courier New',monospace;font-size:14px;resize:none;outline:none;line-height:1.7;min-height:0}
#si{background:#161b22;border-top:1px solid #30363d;padding:5px 10px;display:flex;align-items:center;gap:6px;flex-shrink:0}
#sl{color:#8b949e;font-size:12px;white-space:nowrap}
#stdin{flex:1;background:#0d1117;color:#e6edf3;border:1px solid #30363d;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:12px}
#ow{height:30%;border-top:2px solid #30363d;display:flex;flex-direction:column;flex-shrink:0}
#oh{background:#161b22;padding:3px 12px;font-size:12px;color:#8b949e;flex-shrink:0}
#out{flex:1;background:#010409;color:#3fb950;padding:10px;font-family:'Courier New',monospace;font-size:13px;overflow-y:auto;white-space:pre-wrap}
</style></head><body>
<div id="tb"><span id="lbl">⚡ C++</span><button class="btn" onclick="run()">▶ Chạy</button><button class="btn btn-g" onclick="reset()">↺</button></div>
<textarea id="code" spellcheck="false">#include &lt;bits/stdc++.h&gt;
using namespace std;
int main() {
    // Viết code C++ ở đây
    cout &lt;&lt; "Hello, C++!" &lt;&lt; endl;
    return 0;
}</textarea>
<div id="si"><span id="sl">📥 Input:</span><input id="stdin" type="text" placeholder="stdin (nếu cần)"/></div>
<div id="ow"><div id="oh">▸ Output</div><div id="out">Nhấn ▶ để chạy...</div></div>
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
    else if(d.compile?.stderr){out.style.color='#f85149';out.textContent='❌ Compile Error:\n'+d.compile.stderr;}
    else if(d.run?.stderr){out.style.color='#f85149';out.textContent='❌ '+d.run.stderr;}
    else out.textContent='(Không có output)';
  }catch(e){out.style.color='#79c0ff';out.innerHTML='💡 <a href="https://cpp.sh" target="_blank" style="color:#79c0ff">cpp.sh</a> • <a href="https://ide.geeksforgeeks.org" target="_blank" style="color:#79c0ff">GFG IDE</a>';}
}
function reset(){document.getElementById('code').value=DEF;document.getElementById('out').textContent='';}
</script></body></html>`

// ─── Robot Playground ──────────────────────────────────────────────────────
const ROBOT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{font-family:'Segoe UI',sans-serif;background:#fef9c3;display:flex;flex-direction:column;height:100vh;overflow:hidden}
h2{text-align:center;color:#92400e;padding:8px 0 2px;font-size:15px;flex-shrink:0}
#tb{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;padding:6px;background:#fde68a;border-bottom:2px solid #f59e0b;flex-shrink:0}
.cmd{background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:7px 12px;font-size:14px;font-weight:bold;cursor:grab;user-select:none;touch-action:none;box-shadow:0 2px 5px #00000025;transition:transform .1s}
.cmd:active{transform:scale(.94)}
.cmd.rep{background:#8b5cf6}.cmd.iif{background:#ec4899}.cmd.stp{background:#ef4444}
#prog{min-height:55px;background:#fff;border:2px dashed #f59e0b;border-radius:10px;margin:6px;padding:6px;display:flex;flex-wrap:wrap;gap:5px;align-items:flex-start;flex-shrink:0}
#prog.over{background:#fef3c7;border-color:#d97706}
.slot{position:relative;display:inline-flex;align-items:center}
.slot button{position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:#fff;border:none;font-size:10px;line-height:16px;text-align:center;cursor:pointer;z-index:10;padding:0}
#btns{display:flex;gap:8px;justify-content:center;padding:5px;flex-shrink:0}
.run{background:#16a34a;color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:14px;font-weight:bold;cursor:pointer}
.clr{background:#6b7280;color:#fff;border:none;border-radius:10px;padding:8px 12px;font-size:14px;cursor:pointer}
#mazeWrap{flex:1;display:flex;align-items:center;justify-content:center;min-height:0}
canvas{border-radius:14px;border:2px solid #f59e0b}
#msg{text-align:center;padding:5px;font-weight:bold;font-size:14px;color:#92400e;flex-shrink:0}
</style></head><body>
<h2>🤖 Robot Playground</h2>
<div id="tb">
  <div class="cmd" draggable="true" data-cmd="⬆️ Tiến">⬆️ Tiến</div>
  <div class="cmd" draggable="true" data-cmd="⬇️ Lùi">⬇️ Lùi</div>
  <div class="cmd" draggable="true" data-cmd="⬅️ Trái">⬅️ Trái</div>
  <div class="cmd" draggable="true" data-cmd="➡️ Phải">➡️ Phải</div>
  <div class="cmd rep" draggable="true" data-cmd="🔁×2">🔁×2</div>
  <div class="cmd rep" draggable="true" data-cmd="🔁×3">🔁×3</div>
  <div class="cmd iif" draggable="true" data-cmd="❓ Nếu">❓ Nếu</div>
  <div class="cmd stp" draggable="true" data-cmd="🛑 Dừng">🛑 Dừng</div>
</div>
<div id="prog" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event)">
  <span style="color:#9ca3af;font-size:12px;padding:3px">👆 Kéo lệnh vào đây...</span>
</div>
<div id="btns">
  <button class="run" onclick="runRobot()">▶ Chạy</button>
  <button class="clr" onclick="clearProg()">✕ Xoá</button>
</div>
<div id="mazeWrap"><canvas id="maze"></canvas></div>
<div id="msg">Giúp robot 🤖 đến trường 🏫!</div>
<script>
const GRID=5,CS=38;let robot={x:0,y:4},running=false;
const goal={x:4,y:0},walls=[[1,1],[1,2],[2,2],[3,2],[3,3]];
let dragging=null;
const cv=document.getElementById('maze');cv.width=GRID*CS+4;cv.height=GRID*CS+4;

document.querySelectorAll('.cmd').forEach(el=>{
  el.addEventListener('dragstart',e=>{dragging=e.target.dataset.cmd;});
  el.addEventListener('touchstart',e=>{dragging=e.target.dataset.cmd;},{passive:true});
});
document.getElementById('prog').addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
document.getElementById('prog').addEventListener('touchend',e=>{if(dragging){addCmd(dragging);dragging=null;}},{passive:true});

function drop(e){e.preventDefault();document.getElementById('prog').classList.remove('over');addCmd(dragging||e.dataTransfer.getData('text'));dragging=null;}

function addCmd(cmd){
  if(!cmd)return;
  const prog=document.getElementById('prog'),ph=prog.querySelector('span');if(ph)ph.remove();
  const slot=document.createElement('div');slot.className='slot';
  const btn=document.createElement('button');btn.textContent='×';btn.onclick=()=>slot.remove();
  const tag=document.createElement('div');tag.className='cmd';tag.textContent=cmd;tag.style.cursor='default';
  if(cmd.includes('🔁'))tag.style.background='#8b5cf6';
  if(cmd.includes('❓'))tag.style.background='#ec4899';
  if(cmd.includes('🛑'))tag.style.background='#ef4444';
  slot.append(btn,tag);prog.appendChild(slot);
}

function clearProg(){
  const prog=document.getElementById('prog');
  prog.innerHTML='<span style="color:#9ca3af;font-size:12px;padding:3px">👆 Kéo lệnh vào đây...</span>';
  robot={x:0,y:4};draw();setMsg('Giúp robot 🤖 đến trường 🏫!','#92400e');
}

function draw(hi){
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);
  for(let r=0;r<GRID;r++){for(let c=0;c<GRID;c++){
    const iW=walls.some(w=>w[0]===c&&w[1]===r);
    ctx.fillStyle=iW?'#374151':'#f0fdf4';
    ctx.fillRect(c*CS+2,r*CS+2,CS-2,CS-2);
    if(!iW){ctx.strokeStyle='#bbf7d0';ctx.strokeRect(c*CS+2,r*CS+2,CS-2,CS-2);}
  }}
  ctx.font=(CS*.55)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('🏫',goal.x*CS+CS/2+2,goal.y*CS+CS/2+2);
  if(hi){ctx.fillStyle='rgba(59,130,246,.25)';ctx.fillRect(robot.x*CS+2,robot.y*CS+2,CS-2,CS-2);}
  ctx.fillText('🤖',robot.x*CS+CS/2+2,robot.y*CS+CS/2+2);
}

function setMsg(t,c){const m=document.getElementById('msg');m.textContent=t;m.style.color=c||'#92400e';}

async function runRobot(){
  if(running)return;running=true;
  robot={x:0,y:4};draw();setMsg('🤖 Đang chạy...','#1d4ed8');
  const slots=[...document.getElementById('prog').querySelectorAll('.slot')];
  const commands=slots.map(s=>s.querySelector('.cmd').textContent);
  async function exec(list){
    for(const cmd of list){
      await new Promise(r=>setTimeout(r,380));
      let nx=robot.x,ny=robot.y;
      if(cmd.includes('Tiến'))ny--;
      else if(cmd.includes('Lùi'))ny++;
      else if(cmd.includes('Trái'))nx--;
      else if(cmd.includes('Phải'))nx++;
      else if(cmd.includes('×2')){await exec([cmd.replace(/×./,''),cmd.replace(/×./,'')]);continue;}
      else if(cmd.includes('×3')){await exec([cmd.replace(/×./,''),cmd.replace(/×./,''),cmd.replace(/×./,'')]);continue;}
      else if(cmd.includes('Dừng')){running=false;break;}
      if(nx<0||nx>=GRID||ny<0||ny>=GRID||walls.some(w=>w[0]===nx&&w[1]===ny)){
        setMsg('💥 Robot bị chặn! Thử lại nhé 🔄','#dc2626');draw(true);running=false;return;
      }
      robot={x:nx,y:ny};draw(true);
      if(robot.x===goal.x&&robot.y===goal.y){setMsg('🎉 Tuyệt vời! Robot đến đích rồi!','#16a34a');running=false;return;}
    }
  }
  await exec(commands);
  if(running){setMsg(robot.x===goal.x&&robot.y===goal.y?'🎉 Xuất sắc!':'🤔 Chưa đến đích. Thử lại!',robot.x===goal.x&&robot.y===goal.y?'#16a34a':'#d97706');running=false;}
}
draw();
</script></body></html>`

// ─── Sandbox iframe ────────────────────────────────────────────────────────
function SandboxIDE({ html, title, className = '' }: { html: string; title: string; className?: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const blob = new Blob([html], { type: 'text/html' })
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [])
  if (!url) return <div className="flex items-center justify-center h-full text-gray-400 bg-gray-900 rounded-2xl">Đang tải IDE...</div>
  return <iframe src={url} className={`w-full h-full rounded-2xl border-0 ${className}`} title={title} sandbox="allow-scripts allow-same-origin" />
}

// ─── Scratch via TurboWarp ─────────────────────────────────────────────────
function ScratchIDE() {
  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-sm flex-shrink-0">
        <span className="text-lg">🐱</span>
        <span className="text-orange-800 font-semibold flex-1">Scratch — kéo thả block để lập trình!</span>
        <a href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-1 rounded-lg font-bold">
          <ExternalLink className="w-3 h-3" /> Mở to
        </a>
      </div>
      <div className="flex-1 min-h-0">
        <iframe src="https://turbowarp.org/editor" className="w-full h-full rounded-2xl border-2 border-orange-200"
          allow="microphone; camera" title="TurboWarp Scratch Editor" />
      </div>
    </div>
  )
}

// ─── Left panel: bài học / đề bài ─────────────────────────────────────────
function ProblemPanel({
  theoryContent, theoryTitle, questions, subjectName,
}: {
  theoryContent?: string; theoryTitle?: string
  questions: Question[]; subjectName: string
}) {
  const [tab, setTab] = useState<'lesson' | 'problems'>('lesson')
  const [qi, setQi] = useState(0)
  const [showAns, setShowAns] = useState(false)

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border-2 border-purple-100 overflow-hidden">
      {/* Tab switch */}
      <div className="flex border-b border-gray-100 flex-shrink-0">
        <button onClick={() => setTab('lesson')}
          className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 transition ${tab === 'lesson' ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'}`}>
          <BookOpen className="w-4 h-4" /> Bài giảng
        </button>
        <button onClick={() => { setTab('problems'); setShowAns(false) }}
          className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 transition ${tab === 'problems' ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'}`}>
          ✏️ Bài tập ({questions.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {tab === 'lesson' ? (
          theoryContent ? (
            <div className="prose prose-sm max-w-none
              prose-headings:font-black prose-headings:text-gray-900
              prose-h1:text-lg prose-h2:text-base prose-h2:text-purple-700
              prose-p:text-gray-700 prose-li:text-gray-700
              prose-code:bg-gray-100 prose-code:text-purple-700 prose-code:px-1 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:rounded-xl
              prose-table:text-xs prose-th:bg-purple-50">
              <ReactMarkdown>{theoryContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Bài giảng {subjectName}</p>
            </div>
          )
        ) : (
          /* Problems tab */
          questions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {/* Navigator */}
              <div className="flex items-center gap-2 flex-wrap">
                {questions.slice(0, 20).map((_, i) => (
                  <button key={i} onClick={() => { setQi(i); setShowAns(false) }}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition ${i === qi ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Current question */}
              {(() => {
                const q = questions[qi]
                const opts: any[] = Array.isArray(q?.options) ? q.options : []
                return (
                  <div className="space-y-3">
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <p className="text-xs text-purple-500 font-semibold mb-1">Câu {qi + 1} / {questions.length}</p>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">{q?.content}</p>
                    </div>

                    {opts.length > 0 && (
                      <div className="space-y-1.5">
                        {opts.map((opt: any, i: number) => {
                          const colors = ['bg-blue-50 border-blue-200 text-blue-800','bg-green-50 border-green-200 text-green-800','bg-yellow-50 border-yellow-200 text-yellow-800','bg-red-50 border-red-200 text-red-800']
                          return (
                            <div key={opt.key ?? i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${colors[i % 4]}`}>
                              <span className="font-black w-5">{opt.key}.</span>
                              <span>{opt.text}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <button onClick={() => setShowAns(a => !a)}
                      className="w-full py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition">
                      {showAns ? '🙈 Ẩn đáp án' : '💡 Xem đáp án'}
                    </button>

                    {showAns && q && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                        <p className="font-bold text-green-700">✅ Đáp án: {q.correctAnswer}</p>
                        {q.explanation && <p className="text-green-600 mt-1">{q.explanation}</p>}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Prev / Next */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setQi(i => Math.max(0, i - 1)); setShowAns(false) }} disabled={qi === 0}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm disabled:opacity-30 hover:bg-gray-200 transition">
                  <ChevronLeft className="w-4 h-4" /> Trước
                </button>
                <button onClick={() => { setQi(i => Math.min(questions.length - 1, i + 1)); setShowAns(false) }} disabled={qi === questions.length - 1}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm disabled:opacity-30 hover:bg-purple-700 transition">
                  Tiếp <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Chưa có bài tập</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────
interface IDETabProps {
  courseType: CourseType
  subjectName: string
  questions?: Question[]
  theoryContent?: string
  theoryTitle?: string
}

export function IDETab({ courseType, subjectName, questions = [], theoryContent, theoryTitle }: IDETabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const label: Record<string, string> = {
    LAP_TRINH_SCRATCH:    '🐱 Scratch',
    LAP_TRINH_PYTHON:     '🐍 Python',
    LAP_TRINH_CPP:        '⚡ C++',
    LAP_TRINH_THUAT_TOAN: '🤖 Robot',
  }

  return (
    <div className={isFullscreen
      ? 'fixed inset-0 z-50 bg-gray-100 flex flex-col p-3 gap-3'
      : 'flex flex-col gap-3'}>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-600" />
          <span className="font-black text-gray-800 text-sm">{label[courseType] ?? '💻 IDE'}</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full hidden sm:inline">{subjectName}</span>
        </div>
        <button onClick={() => setIsFullscreen(f => !f)}
          className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-gray-600 transition">
          {isFullscreen ? <><Minimize2 className="w-4 h-4"/>Thu nhỏ</> : <><Maximize2 className="w-4 h-4"/>Phóng to</>}
        </button>
      </div>

      {/* Split layout: Đề bài | IDE */}
      <div className={
        isFullscreen
          ? 'flex-1 grid grid-cols-2 gap-3 min-h-0'
          : 'grid md:grid-cols-2 gap-3'
      } style={isFullscreen ? {} : {}}>

        {/* LEFT — Bài giảng + Bài tập */}
        <div className={isFullscreen ? 'min-h-0' : 'h-[520px]'}>
          <ProblemPanel
            theoryContent={theoryContent}
            theoryTitle={theoryTitle}
            questions={questions}
            subjectName={subjectName}
          />
        </div>

        {/* RIGHT — IDE */}
        <div className={isFullscreen ? 'min-h-0' : 'h-[520px]'}>
          {courseType === 'LAP_TRINH_SCRATCH'    && <ScratchIDE />}
          {courseType === 'LAP_TRINH_PYTHON'     && <SandboxIDE html={PYTHON_HTML} title="Python IDE" />}
          {courseType === 'LAP_TRINH_CPP'        && <SandboxIDE html={CPP_HTML}    title="C++ Editor" />}
          {courseType === 'LAP_TRINH_THUAT_TOAN' && <SandboxIDE html={ROBOT_HTML}  title="Robot" />}
        </div>
      </div>
    </div>
  )
}
