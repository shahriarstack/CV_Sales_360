const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace standard unit_qty addition
content = content.replace(/\+ ([a-zA-Z0-9_]+)\.unit_qty/g, "+ Number($1.unit_qty || 0)");

fs.writeFileSync('index.html', content);
console.log('Fixed ALL remaining unit_qty summations globally.');
