#!/usr/bin/env node
// Builds web/index.html — a static, zero-dependency playground that mirrors
// `aicfg init`. Reads the SAME templates the CLI ships, so the browser preview
// and the real command never drift. Deploy target: GitHub Pages.
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEMPLATES = join(ROOT, 'templates');
const OUT_DIR = join(ROOT, 'web');

// Shims are identical to bin/aicfg.js — keep in sync if the CLI changes.
const SHIMS = {
  'CLAUDE.md': `# CLAUDE.md
<!-- This is a shim. All agent instructions live in AGENTS.md -->
Read and follow all instructions in [AGENTS.md](./AGENTS.md).
`,
  '.cursorrules': `# .cursorrules
# Shim — all instructions live in AGENTS.md
Read and follow all instructions in AGENTS.md.
`,
  'GEMINI.md': `# GEMINI.md
<!-- Shim — all instructions live in AGENTS.md -->
Read and follow all instructions in [AGENTS.md](./AGENTS.md).
`,
  '.github/copilot-instructions.md': `# Copilot Instructions
<!-- Shim — all instructions live in AGENTS.md -->
Read and follow all instructions in AGENTS.md.
`,
};

const STACK_LABELS = {
  'go': 'Go',
  'rust': 'Rust',
  'node-express': 'Node + Express',
  'nextjs-typescript': 'Next.js + TypeScript',
  'python-fastapi': 'Python + FastAPI',
  'monorepo': 'Monorepo',
  'microservices': 'Microservices',
  'fullstack-nextjs': 'Fullstack Next.js',
  'enterprise-python': 'Enterprise Python',
  'ci-cd-integration': 'CI/CD Integration',
  'team-sharing': 'Team Sharing',
};

async function loadStacks() {
  const entries = await readdir(TEMPLATES, { withFileTypes: true });
  const stacks = {};
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = join(TEMPLATES, e.name);
    let agents = null;
    try {
      agents = await readFile(join(dir, 'AGENTS.md'), 'utf-8');
    } catch {
      // backward compat: derive from CLAUDE.md (same logic as the CLI)
      try {
        let c = await readFile(join(dir, 'CLAUDE.md'), 'utf-8');
        c = c.replace(/^# CLAUDE\.md/m, '# AGENTS.md').replace(/CLAUDE\.md/g, 'AGENTS.md');
        agents = c;
      } catch { continue; }
    }
    stacks[e.name] = { label: STACK_LABELS[e.name] || e.name, agents };
  }
  return stacks;
}

const esc = (s) => s.replace(/<\/script>/gi, '<\\/script>');

function html(stacks) {
  const data = { stacks, shims: SHIMS };
  const ordered = Object.keys(STACK_LABELS).filter((k) => stacks[k]);
  for (const k of Object.keys(stacks)) if (!ordered.includes(k)) ordered.push(k);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>aicfg playground — generate AGENTS.md + agent config for 20+ AI coding tools</title>
<meta name="description" content="Pick your stack and instantly preview the AGENTS.md, CLAUDE.md, .cursorrules, GEMINI.md and Copilot config aicfg generates. One source of truth for Claude Code, Cursor, Copilot, Codex, Gemini CLI and 15+ tools. No install required.">
<link rel="canonical" href="https://ipythoning.github.io/aicfg/">
<meta property="og:title" content="aicfg playground — one AGENTS.md, every AI coding tool">
<meta property="og:description" content="Preview the AGENTS.md + shim files aicfg generates for your stack. No install. MIT, free forever.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ipythoning.github.io/aicfg/">
<style>
  :root{
    --bg:#0d1017; --panel:#141923; --panel-2:#1b2230; --line:#262e3d;
    --text:#e6edf3; --dim:#8b97a8; --faint:#5c6677;
    --accent:#6ee7b7; --accent-2:#38bdf8; --warn:#fbbf24;
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif;
    --r:10px;
  }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{background:var(--bg);color:var(--text);font-family:var(--sans);line-height:1.55;
    background-image:radial-gradient(60rem 40rem at 80% -10%,rgba(56,189,248,.07),transparent),
      radial-gradient(50rem 30rem at -10% 10%,rgba(110,231,183,.06),transparent);}
  a{color:var(--accent-2);text-decoration:none}
  a:hover{text-decoration:underline}
  .wrap{max-width:1080px;margin:0 auto;padding:0 20px}
  header{padding:56px 0 24px}
  .brand{display:flex;align-items:center;gap:12px;font-family:var(--mono);font-weight:600;font-size:15px;color:var(--dim)}
  .brand b{color:var(--accent)}
  h1{font-size:clamp(2rem,1.2rem+3.4vw,3.4rem);line-height:1.05;margin:18px 0 0;letter-spacing:-.02em}
  h1 em{font-style:normal;color:var(--accent)}
  .sub{margin:16px 0 0;max-width:60ch;color:var(--dim);font-size:clamp(1rem,.95rem+.3vw,1.18rem)}
  .cmd{margin-top:26px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .cmd code{font-family:var(--mono);background:var(--panel);border:1px solid var(--line);
    padding:11px 14px;border-radius:8px;font-size:14px;color:var(--text)}
  .cmd code b{color:var(--accent)}
  .ghost{color:var(--faint);font-size:13px;font-family:var(--mono)}
  .app{margin:40px 0 24px;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--panel);box-shadow:0 24px 60px -30px rgba(0,0,0,.8)}
  .toolbar{display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--panel-2);border-bottom:1px solid var(--line)}
  .dot{width:11px;height:11px;border-radius:50%}
  .dot.r{background:#ff5f57}.dot.y{background:#febc2e}.dot.g{background:#28c840}
  .toolbar .path{margin-left:10px;font-family:var(--mono);font-size:12px;color:var(--faint)}
  .picker{padding:18px 16px 6px}
  .picker .lbl{font-family:var(--mono);font-size:12px;color:var(--faint);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
  .chips{display:flex;flex-wrap:wrap;gap:8px}
  .chip{font-family:var(--mono);font-size:13px;color:var(--dim);background:var(--bg);
    border:1px solid var(--line);border-radius:999px;padding:7px 13px;cursor:pointer;transition:.12s}
  .chip:hover{border-color:var(--faint);color:var(--text)}
  .chip[aria-selected=true]{background:rgba(110,231,183,.12);border-color:var(--accent);color:var(--accent)}
  .tabs{display:flex;flex-wrap:wrap;gap:2px;padding:16px 16px 0;border-bottom:1px solid var(--line)}
  .tab{font-family:var(--mono);font-size:13px;color:var(--dim);background:transparent;border:1px solid transparent;
    border-bottom:none;padding:9px 13px;border-radius:8px 8px 0 0;cursor:pointer;position:relative;top:1px}
  .tab .src{color:var(--faint);font-size:11px;margin-left:6px}
  .tab[aria-selected=true]{background:var(--bg);color:var(--text);border-color:var(--line)}
  .tab[aria-selected=true] .src{color:var(--accent)}
  .editor{position:relative;background:var(--bg)}
  .editor .meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);flex-wrap:wrap}
  .editor .fname{font-family:var(--mono);font-size:12px;color:var(--dim)}
  .editor .acts{display:flex;gap:8px}
  .btn{font-family:var(--mono);font-size:12px;color:var(--dim);background:var(--panel-2);
    border:1px solid var(--line);border-radius:7px;padding:6px 11px;cursor:pointer;transition:.12s}
  .btn:hover{color:var(--text);border-color:var(--faint)}
  .btn.ok{color:var(--accent);border-color:var(--accent)}
  pre{margin:0;padding:18px 16px;overflow:auto;max-height:460px;font-family:var(--mono);
    font-size:12.5px;line-height:1.7;color:#c9d4e0;white-space:pre;tab-size:2}
  pre::-webkit-scrollbar{width:10px;height:10px}
  pre::-webkit-scrollbar-thumb{background:var(--line);border-radius:6px}
  .why{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin:36px 0}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:18px}
  .card h3{margin:0 0 6px;font-size:15px}
  .card p{margin:0;color:var(--dim);font-size:14px}
  .card .k{font-family:var(--mono);color:var(--accent);font-size:12px;display:block;margin-bottom:8px}
  .stat{font-family:var(--mono);font-size:13px;color:var(--dim);margin:8px 0 0}
  .stat b{color:var(--warn)}
  footer{padding:30px 0 60px;color:var(--faint);font-size:13px;border-top:1px solid var(--line);margin-top:30px}
  footer a{color:var(--dim)}
  @media(max-width:640px){pre{max-height:340px}header{padding:36px 0 12px}}
</style>
</head>
<body>
<div class="wrap">
<header>
  <div class="brand"><b>$</b> aicfg <span style="color:var(--faint)">// AGENTS.md ecosystem tool</span></div>
  <h1>One <em>AGENTS.md</em>.<br>Every AI coding tool.</h1>
  <p class="sub">Claude Code, Cursor, Copilot, Codex, Gemini CLI and 15+ tools each want their own config file. Write the rules once — every tool reads the same source of truth. Pick a stack below and see exactly what you get. No install.</p>
  <div class="cmd">
    <code>npx <b>aicfg</b> init</code>
    <span class="ghost">— or just preview it here ↓</span>
  </div>
</header>

<main class="app">
  <div class="toolbar">
    <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
    <span class="path">~/your-project — aicfg init</span>
  </div>
  <div class="picker">
    <div class="lbl">1 · choose your stack</div>
    <div class="chips" id="chips" role="listbox" aria-label="Project stack"></div>
  </div>
  <div class="tabs" id="tabs" role="tablist" aria-label="Generated files"></div>
  <div class="editor">
    <div class="meta">
      <span class="fname" id="fname"></span>
      <div class="acts">
        <button class="btn" id="copy">copy</button>
        <button class="btn" id="dl">download</button>
      </div>
    </div>
    <pre id="out" tabindex="0"></pre>
  </div>
</main>
<p class="stat">2 · <b>AGENTS.md</b> is the file you edit. Every other file is a 3-line shim that points back to it — they never drift out of sync.</p>

<section class="why">
  <div class="card"><span class="k">why bother</span><h3>Stop maintaining 5 config files</h3><p>CLAUDE.md, .cursorrules, copilot-instructions, GEMINI.md… edit one, the rest go stale. aicfg makes them shims.</p></div>
  <div class="card"><span class="k">measured</span><h3>Faster, cheaper agents</h3><p>A <a href="https://arxiv.org/pdf/2509.23586" rel="noopener">Princeton study</a> (Codex, 10 repos, 124 PRs) found a 28.6% median runtime and 16.6% median token reduction when AGENTS.md is present.</p></div>
  <div class="card"><span class="k">free forever</span><h3>MIT, zero lock-in</h3><p>It's a generator, not a platform. Output is plain markdown you own. Nothing phones home.</p></div>
</section>

<footer>
  <strong>aicfg</strong> — generate &amp; manage AGENTS.md across 20+ AI coding tools.
  <a href="https://github.com/ipythoning/aicfg" rel="noopener">GitHub ↗</a> ·
  <a href="https://agents.md" rel="noopener">AGENTS.md standard ↗</a> ·
  <code style="font-family:var(--mono);color:var(--dim)">npm i -g github:ipythoning/aicfg</code>
  <br><span style="color:#3a4150">This page mirrors the exact output of the CLI. MIT licensed.</span>
</footer>
</div>

<script id="data" type="application/json">${esc(JSON.stringify(data))}</script>
<script>
const DATA = JSON.parse(document.getElementById('data').textContent);
const ORDER = ${JSON.stringify(ordered)};
// shim path -> the agent tool it serves (for the "src" hint)
const TOOL = {'CLAUDE.md':'Claude Code','.cursorrules':'Cursor','GEMINI.md':'Gemini CLI','.github/copilot-instructions.md':'Copilot'};
let stack = ORDER[0];
let file = 'AGENTS.md';

function files(){
  return [['AGENTS.md', DATA.stacks[stack].agents, 'source of truth'],
    ...Object.entries(DATA.shims).map(([n,c])=>[n,c,TOOL[n]||'shim'])];
}
function current(){ return files().find(f=>f[0]===file) || files()[0]; }

const chips=document.getElementById('chips'), tabs=document.getElementById('tabs'),
  out=document.getElementById('out'), fname=document.getElementById('fname');

function renderChips(){
  chips.innerHTML='';
  for(const k of ORDER){
    const b=document.createElement('button');
    b.className='chip'; b.textContent=DATA.stacks[k].label; b.setAttribute('role','option');
    b.setAttribute('aria-selected', k===stack);
    b.onclick=()=>{stack=k; renderChips(); renderBody();};
    chips.appendChild(b);
  }
}
function renderTabs(){
  tabs.innerHTML='';
  for(const [n,,src] of files()){
    const b=document.createElement('button');
    b.className='tab'; b.setAttribute('role','tab'); b.setAttribute('aria-selected', n===file);
    b.innerHTML = n.split('/').pop()+' <span class="src">'+src+'</span>';
    b.onclick=()=>{file=n; renderTabs(); renderBody();};
    tabs.appendChild(b);
  }
}
function renderBody(){
  if(!files().some(f=>f[0]===file)) file='AGENTS.md';
  renderTabs();
  const [n,c]=current();
  fname.textContent=n;
  out.textContent=c;
  const cp=document.getElementById('copy'); cp.textContent='copy'; cp.className='btn';
}
document.getElementById('copy').onclick=async()=>{
  try{ await navigator.clipboard.writeText(current()[1]);
    const b=document.getElementById('copy'); b.textContent='copied ✓'; b.className='btn ok';
    setTimeout(()=>{b.textContent='copy'; b.className='btn';},1400);
  }catch{}
};
document.getElementById('dl').onclick=()=>{
  const [n,c]=current();
  const blob=new Blob([c],{type:'text/markdown'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=n.split('/').pop(); a.click(); URL.revokeObjectURL(a.href);
};
renderChips(); renderBody();
</script>
</body>
</html>
`;
}

async function main() {
  const stacks = await loadStacks();
  const count = Object.keys(stacks).length;
  if (!count) throw new Error('No templates found');
  await mkdir(OUT_DIR, { recursive: true });
  const page = html(stacks);
  await writeFile(join(OUT_DIR, 'index.html'), page);
  // .nojekyll so GitHub Pages serves files starting with _ or . untouched
  await writeFile(join(OUT_DIR, '.nojekyll'), '');
  const bytes = Buffer.byteLength(page);
  console.log(`✓ web/index.html — ${count} stacks, ${(bytes / 1024).toFixed(1)} kB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
