const fs = require('fs');

const files = [
  '/app/public/_spa/assets/_layout-M7AKyzf6.js',
  '/app/dist/desktop/assets/_layout-M7AKyzf6.js'
];

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.log('Not found:', filePath);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('transform: translateY(22px);')) {
    console.log('Already patched:', filePath);
    continue;
  }

  const p1 = 'height: 160px;';
  const p2 = 'margin-block-end: -6px;';
  const idx1 = content.indexOf(p1);
  const idx2 = content.indexOf(p2, idx1);

  if (idx1 !== -1 && idx2 !== -1) {
    const oldSlice = content.slice(idx1, idx2 + p2.length);
    const newSlice = 'height: 195px;\n    max-width: 220px;\n    border-radius: 0;\n    overflow: visible;\n    border: none;\n    background: transparent;\n    box-shadow: none;\n    filter: drop-shadow(0 14px 24px rgba(0,0,0,0.65)) drop-shadow(0 4px 10px rgba(247,239,138,0.25));\n    object-fit: contain;\n    object-position: bottom right;\n    margin-inline-start: auto;\n    margin-block-end: -28px;\n    transform: translateY(22px);';
    
    // Also patch hover transform
    const oldHover = 'transform: translateY(-6px) scale(1.06);';
    const newHover = 'transform: translateY(18px) scale(1.04);';

    content = content.replace(oldSlice, newSlice);
    content = content.replace(oldHover, newHover);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully repositioned portrait in:', filePath);
  } else {
    console.error('Could not find slice in:', filePath);
  }
}
