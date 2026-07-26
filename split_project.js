const fs = require('fs');

function splitProject() {
    const htmlPath = 'index.html';
    let content = fs.readFileSync(htmlPath, 'utf-8');

    // 1. Extract CSS
    // Let's find the main <style> tag.
    // In index.html, it starts at line 71
    const styleStartMarker = '<style>';
    const styleStartIdx = content.indexOf(styleStartMarker, 100); // look after header setup
    if (styleStartIdx === -1) {
        console.error("Could not find <style> tag after index 100");
        return;
    }
    const styleEndIdx = content.indexOf('</style>', styleStartIdx);
    if (styleEndIdx === -1) {
        console.error("Could not find closing </style> tag");
        return;
    }
    const cssContent = content.substring(styleStartIdx + styleStartMarker.length, styleEndIdx);

    // 2. Extract JS
    // The main script tag starts around line 1030 and contains "const DB ="
    const scriptStartMarker = '<script>';
    let scriptStartIdx = -1;
    let searchStart = 1000;
    while (true) {
        const idx = content.indexOf(scriptStartMarker, searchStart);
        if (idx === -1) break;
        const testSnippet = content.substring(idx, idx + 200);
        if (testSnippet.includes('const DB =') || testSnippet.includes('// --- 1. MOCK DATABASE & STATE ---')) {
            scriptStartIdx = idx;
            break;
        }
        searchStart = idx + 1;
    }

    if (scriptStartIdx === -1) {
        console.error("Could not find the main <script> tag");
        return;
    }

    const scriptEndIdx = content.indexOf('</script>', scriptStartIdx);
    if (scriptEndIdx === -1) {
        console.error("Could not find closing </script> tag for main script");
        return;
    }

    const jsContent = content.substring(scriptStartIdx + scriptStartMarker.length, scriptEndIdx);

    // 3. Write external files
    fs.writeFileSync('style.css', cssContent.trim() + '\n', 'utf-8');
    fs.writeFileSync('app.js', jsContent.trim() + '\n', 'utf-8');

    // 4. Update index.html
    // Replace CSS
    let updatedContent = content.substring(0, styleStartIdx) + 
                         '<link rel="stylesheet" href="style.css">' + 
                         content.substring(styleEndIdx + '</style>'.length);

    // Recalculate script start because content length changed
    scriptStartIdx = updatedContent.indexOf(scriptStartMarker, 1000);
    while (true) {
        const idx = updatedContent.indexOf(scriptStartMarker, scriptStartIdx);
        if (idx === -1) break;
        const testSnippet = updatedContent.substring(idx, idx + 200);
        if (testSnippet.includes('const DB =') || testSnippet.includes('// --- 1. MOCK DATABASE & STATE ---')) {
            scriptStartIdx = idx;
            break;
        }
        scriptStartIdx = idx + 1;
    }

    const updatedScriptEndIdx = updatedContent.indexOf('</script>', scriptStartIdx);

    updatedContent = updatedContent.substring(0, scriptStartIdx) + 
                     '<script src="app.js"></script>' + 
                     updatedContent.substring(updatedScriptEndIdx + '</script>'.length);

    fs.writeFileSync('index.html', updatedContent, 'utf-8');
    console.log("Successfully split index.html into style.css and app.js!");
}

splitProject();
