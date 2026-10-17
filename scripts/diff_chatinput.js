const fs = require('fs');

const spa = fs.readFileSync('/app/public/_spa/assets/ChatInput-BO6gAidK.js', 'utf8');
const dsk = fs.readFileSync('/app/dist/desktop/assets/ChatInput-BO6gAidK.js', 'utf8');

// Check what differs:
let i = 0, j = 0;
let diffs = 0;
while (i < spa.length && j < dsk.length) {
  if (spa[i] !== dsk[j]) {
    diffs++;
    console.log(`Diff #${diffs}:`);
    console.log('SPA:    ', JSON.stringify(spa.substring(i - 10, i + 30)));
    console.log('Desktop:', JSON.stringify(dsk.substring(j - 10, j + 30)));
    // skip ahead
    i += 20;
    j += 20;
    if (diffs > 10) break;
  } else {
    i++;
    j++;
  }
}
console.log('Total diffs found in sample:', diffs);
