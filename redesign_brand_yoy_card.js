const fs = require('fs');

function redesignBrandYoyAndHeadings(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Redesign YOY card background style to be dynamic based on brandFilter
    // Define a variable inside renderAdminDashboard before returning HTML:
    // Let's insert the dynamic style variable.
    let startIdx = content.indexOf("renderAdminDashboard: () => {");
    if (startIdx === -1) {
        console.log("Could not find renderAdminDashboard");
        return;
    }
    
    // Find where the html is defined
    let htmlStartIdx = content.indexOf("const html = `", startIdx);
    if (htmlStartIdx === -1) {
        console.log("Could not find HTML template start");
        return;
    }

    // Insert yoyCardBgStyle helper variable
    let insertion = `
                const yoyCardBgStyle = brandFilter === 'Mahindra' 
                    ? 'style="background: linear-gradient(90deg, #991b1b 0%, #e5223e 50%, #f43f5e 100%);"' 
                    : 'style="background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%);"';
    `;
    
    content = content.substring(0, htmlStartIdx) + insertion + content.substring(htmlStartIdx);

    // Now let's replace the hardcoded style inside the Performance vs Budget & YOY card
    content = content.replace(
        'class="border border-white/20 p-3 rounded-xl shadow-lg mb-3 relative overflow-hidden text-white" style="background: linear-gradient(90deg, #d946ef 0%, #4f46e5 50%, #06b6d4 100%);"',
        'class="border border-white/20 p-3 rounded-xl shadow-lg mb-3 relative overflow-hidden text-white" ${yoyCardBgStyle}'
    );


    // 2. Adjust chart line animation loop to match the brand selected
    // Let's check the animation loop in app.js and make it dynamic to the active brand!
    // In Mahindra: colorHighlight2 can be rose-300 or amber-300, and highlight1 can be white.
    // In Foton: colorHighlight2 can be cyan-300, and highlight1 can be white.
    content = content.replace(
        `const colorBase = '#ffffff';
                            const colorHighlight1 = '#06b6d4';
                            const colorHighlight2 = '#f472b6';`,
        `const colorBase = '#ffffff';
                            const colorHighlight1 = brandFilter === 'Mahindra' ? '#f43f5e' : '#06b6d4';
                            const colorHighlight2 = brandFilter === 'Mahindra' ? '#fbbf24' : '#a5b4fc';`
    );


    // 3. Make all admin tab main headings font size slightly larger but minimal and creative
    // Upgrade: 'text-xs font-extrabold uppercase tracking-widest text-slate-700'
    // To: 'text-sm font-black tracking-[0.2em] text-slate-800 uppercase'
    content = content.split('text-xs font-extrabold uppercase tracking-widest text-slate-700').join('text-sm font-black tracking-[0.2em] text-slate-800 uppercase');
    content = content.split('text-xs font-extrabold text-slate-700 tracking-widest uppercase').join('text-sm font-black tracking-[0.2em] text-slate-800 uppercase');

    // Also let's check for any remaining small titles like in renderAdminEMI (Area EMI Summary)
    content = content.split('text-xs font-extrabold uppercase text-slate-700').join('text-sm font-black tracking-[0.2em] text-slate-800 uppercase');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Redesigned YOY card brand switcher background and expanded heading typography successfully!");
}

redesignBrandYoyAndHeadings('app.js');
