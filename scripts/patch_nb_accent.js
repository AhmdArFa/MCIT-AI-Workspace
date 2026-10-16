
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
