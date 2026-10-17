const fs = require('fs');

const scrollbarCss = `
/* Global Dark Scrollbars */
* {
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255, 255, 255, 0.2) #0b0d12 !important;
}
::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}
::-webkit-scrollbar-track {
  background: #0b0d12 !important;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px !important;
}
::-webkit-scrollbar-thumb:hover {
  background: #F5C242 !important;
}
`;

function patchFile(file) {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('/* Global Dark Scrollbars */')) {
    console.log(`Already patched: ${file}`);
    return;
  }
  content += '\n' + scrollbarCss;
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Successfully patched dark scrollbars in: ${file}`);
}

const targetFiles = process.argv.slice(2);
for (const f of targetFiles) {
  patchFile(f);
}
