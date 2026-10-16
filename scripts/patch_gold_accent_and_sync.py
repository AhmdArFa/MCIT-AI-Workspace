import subprocess

def run_in_mcit(cmd):
    p = subprocess.run(f"docker exec mcit-ai-mcit-ai-1 {cmd}", shell=True, capture_output=True, text=True)
    if p.returncode != 0:
        print(f"Error in mcit: {p.stderr}")
    else:
        print(f"OK mcit: {cmd[:60]}")

def run_in_agent(cmd):
    p = subprocess.run(f"docker exec mcit-ai-tut-agent-1 {cmd}", shell=True, capture_output=True, text=True)
    if p.returncode != 0:
        print(f"Error in agent: {p.stderr}")
    else:
        print(f"OK agent: {cmd[:60]}")

# 1. Patch Notebooks chunks
patch_nb_script = """
const fs = require('fs');

const files = [
  '/app/frontend/.next/static/chunks/0ia9f5xzckr26.js',
  '/app/frontend/.next/server/chunks/ssr/_1md1ks3._.js'
];

const oldPresets = '[{name:"Lapis Blue",gold:"#4B7BFF",gold2:"#A9C1FF",deep:"#1F3FB8",rgb:"75,123,255",on:"#ffffff"},{name:"Emerald",gold:"#2FD08C",gold2:"#A4F2CF",deep:"#0B8A5C",rgb:"47,208,140",on:"#03140c"},{name:"Amethyst",gold:"#A47CF5",gold2:"#DCCBFF",deep:"#5E34C4",rgb:"164,124,245",on:"#ffffff"},{name:"Crimson",gold:"#F0506E",gold2:"#FFADBD",deep:"#A8123A",rgb:"240,80,110",on:"#ffffff"},{name:"Aqua",gold:"#22C7E8",gold2:"#A6EEFB",deep:"#0A7C98",rgb:"34,199,232",on:"#02161b"},{name:"Gold",gold:"#F5C242",gold2:"#FFEDB9",deep:"#B97D0C",rgb:"245,194,66",on:"#1a1204"}]';

const newPresets = '[{name:"Royal Gold",gold:"#F5C242",gold2:"#FFEDB9",deep:"#B97D0C",rgb:"245,194,66",on:"#1a1204"},{name:"Lapis Blue",gold:"#4B7BFF",gold2:"#A9C1FF",deep:"#1F3FB8",rgb:"75,123,255",on:"#ffffff"},{name:"Emerald",gold:"#2FD08C",gold2:"#A4F2CF",deep:"#0B8A5C",rgb:"47,208,140",on:"#03140c"},{name:"Amethyst",gold:"#A47CF5",gold2:"#DCCBFF",deep:"#5E34C4",rgb:"164,124,245",on:"#ffffff"},{name:"Crimson",gold:"#F0506E",gold2:"#FFADBD",deep:"#A8123A",rgb:"240,80,110",on:"#ffffff"},{name:"Aqua",gold:"#22C7E8",gold2:"#A6EEFB",deep:"#0A7C98",rgb:"34,199,232",on:"#02161b"}]';

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(oldPresets)) {
    content = content.replace(oldPresets, newPresets);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Reordered ACCENT_PRESETS in ${file}`);
  } else {
    console.log(`Presets pattern not found in ${file}`);
  }
}
"""

with open('scripts/patch_nb_accent.js', 'w', encoding='utf-8') as f:
    f.write(patch_nb_script)

subprocess.run("docker cp scripts/patch_nb_accent.js mcit-ai-mcit-ai-1:/app/patch_nb_accent.js", shell=True)
run_in_mcit("node /app/patch_nb_accent.js")

# 2. Patch TuT Agent HTMLs with dynamic accent listener and default Gold
patch_agent_script = """
const fs = require('fs');

const htmlFiles = [
  '/app/dist/desktop/index.html',
  '/app/dist/mobile/index.mobile.html',
  '/app/public/_spa/index.html'
];

const accentSyncScript = `
<script id="tut-accent-sync">
(function() {
  function applyAccent(color) {
    if (!color) return;
    try {
      localStorage.setItem('mcit-accent-color', color);
    } catch(e) {}
    var el = document.getElementById('tut-injected-accent-style');
    if (!el) {
      el = document.createElement('style');
      el.id = 'tut-injected-accent-style';
      document.head.appendChild(el);
    }
    el.innerHTML = \`
      :root {
        --ant-color-primary: \${color} !important;
        --ant-color-primary-hover: \${color} !important;
        --ant-color-primary-active: \${color} !important;
        --ant-color-link: \${color} !important;
        --ant-color-link-hover: \${color} !important;
        --primary-color: \${color} !important;
      }
      .ant-btn-primary, button[type="submit"].ant-btn {
        background-color: \${color} !important;
        border-color: \${color} !important;
        color: #1a1204 !important;
      }
    \`;
  }

  var initialAccent = '#F5C242';
  try {
    initialAccent = localStorage.getItem('mcit-accent-color') || '#F5C242';
  } catch(e) {}
  applyAccent(initialAccent);

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'MCIT_ACCENT_CHANGE' && e.data.accent) {
      applyAccent(e.data.accent);
    }
  });
})();
</script>
`;

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('id="tut-accent-sync"')) {
    content = content.replace('<head>', '<head>' + accentSyncScript);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Injected accent-sync into ${file}`);
  } else {
    console.log(`Accent-sync already present in ${file}`);
  }
}
"""

with open('scripts/patch_agent_accent.js', 'w', encoding='utf-8') as f:
    f.write(patch_agent_script)

subprocess.run("docker cp scripts/patch_agent_accent.js mcit-ai-tut-agent-1:/app/patch_agent_accent.js", shell=True)
run_in_agent("node /app/patch_agent_accent.js")

print("Gold accent and two-way sync patch complete!")
