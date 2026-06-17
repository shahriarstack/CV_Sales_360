const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace standard unit_qty reduction
content = content.replace(/\(sum, ([a-zA-Z0-9_]+)\) => sum \+ \1\.unit_qty/g, "(sum, $1) => sum + Number($1.unit_qty || 0)");

// Replace target_qty reduction just in case
content = content.replace(/\(sum, ([a-zA-Z0-9_]+)\) => sum \+ \1\.target_qty/g, "(sum, $1) => sum + Number($1.target_qty || 0)");

// Replace projection_qty reduction just in case
content = content.replace(/\(sum, ([a-zA-Z0-9_]+)\) => sum \+ \1\.projection_qty/g, "(sum, $1) => sum + Number($1.projection_qty || 0)");

// There are also places where it might be `currAgg[idx] += s.unit_qty;`
content = content.replace(/ \+= ([a-zA-Z0-9_]+)\.unit_qty/g, " += Number($1.unit_qty || 0)");

fs.writeFileSync('index.html', content);
console.log('Fixed unit_qty summations globally.');
