const fs = require('fs');

const files = [
  '/app/dist/desktop/assets/_layout-M7AKyzf6.js',
  '/app/public/_spa/assets/_layout-M7AKyzf6.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing:', file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  const startMarker = 'mx=cr(({css:e})=>({image:e`';
  const endMarker = '`}))';
  
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    console.log('Start marker not found in:', file);
    continue;
  }
  
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    console.log('End marker not found in:', file);
    continue;
  }
  
  const replacement = `mx=cr(({css:e})=>({image:e\`
    display: block;
    width: auto;
    height: 160px;
    max-width: 180px;
    border-radius: 0;
    overflow: visible;
    border: none;
    background: transparent;
    box-shadow: none;
    filter: drop-shadow(0 14px 24px rgba(0,0,0,0.65)) drop-shadow(0 4px 10px rgba(247,239,138,0.25));
    object-fit: contain;
    object-position: bottom right;
    margin-inline-start: auto;
    margin-block-end: -6px;
    user-select: none;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
    pointer-events: auto;
    &:hover {
      transform: translateY(-6px) scale(1.06);
      filter: drop-shadow(0 20px 32px rgba(0,0,0,0.75)) drop-shadow(0 8px 18px rgba(247,239,138,0.38));
    }
    @media (max-width: 576px) {
      height: 110px;
      max-width: 120px;
    }
  \`,root:e\`
    position: relative;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    overflow: visible;
    pointer-events: none;
  \`}))`;

  const fullTarget = content.slice(startIdx, endIdx + endMarker.length);
  content = content.replace(fullTarget, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully applied 3D transparent portrait in:', file);
}
