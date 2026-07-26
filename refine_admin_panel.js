const fs = require('fs');

function refineAdminPanel(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let startIdx = content.indexOf("renderAdminDashboard: () => {");
    if (startIdx === -1) {
        console.log("Could not find renderAdminDashboard");
        return;
    }
    
    let endIdx = content.indexOf("renderDashboardMiniMap:", startIdx);
    if (endIdx === -1) {
        endIdx = content.length;
    }
    
    let adminCode = content.substring(startIdx, endIdx);

    // 1. Update Brand Switcher
    adminCode = adminCode.replace(
        /class="flex items-center gap-1\.5 px-3 py-1\.5 rounded-lg transition-all \$\{brandFilter === 'Foton' \? 'bg-white shadow-sm border border-slate-200\/60 text-aci-blue scale-105' : 'text-white\/40 hover:text-white\/70'\}" style="animation: [^"]+"/g,
        'class="flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${brandFilter === \'Foton\' ? \'bg-foton shadow-sm text-white\' : \'text-white/40 hover:text-white/70\'}"'
    );
    
    adminCode = adminCode.replace(
        /class="flex items-center gap-1\.5 px-3 py-1\.5 rounded-lg transition-all \$\{brandFilter === 'Mahindra' \? 'bg-white shadow-sm border border-slate-200\/60 text-aci-blue scale-105' : 'text-white\/40 hover:text-white\/70'\}" style="animation: [^"]+"/g,
        'class="flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${brandFilter === \'Mahindra\' ? \'bg-mahindra shadow-sm text-white\' : \'text-white/40 hover:text-white/70\'}"'
    );

    adminCode = adminCode.replace(
        /class="px-3 py-1\.5 rounded-lg text-\[10px\] font-bold transition-all \$\{brandFilter === 'Foton' \? 'bg-white shadow-sm text-aci-blue' : 'text-slate-500 hover:text-slate-800'\}"/g,
        'class="px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${brandFilter === \'Foton\' ? \'bg-foton shadow-sm text-white\' : \'text-slate-500 hover:text-slate-800\'}"'
    );
    
    adminCode = adminCode.replace(
        /class="px-3 py-1\.5 rounded-lg text-\[10px\] font-bold transition-all \$\{brandFilter === 'Mahindra' \? 'bg-white shadow-sm text-aci-blue' : 'text-slate-500 hover:text-slate-800'\}"/g,
        'class="px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${brandFilter === \'Mahindra\' ? \'bg-mahindra shadow-sm text-white\' : \'text-slate-500 hover:text-slate-800\'}"'
    );

    // 2. Update Sale Type Toggle
    adminCode = adminCode.replace(
        /class="flex-1 px-3 py-1\.5 rounded-lg text-xs font-bold transition-all \$\{currentSaleType === 'New Sale' \? 'bg-white shadow-sm text-aci-blue' : 'text-slate-500 hover:text-slate-800'\}"/g,
        'class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${currentSaleType === \'New Sale\' ? \'bg-white shadow-sm text-aci-blue\' : \'text-slate-500 hover:text-slate-800\'}"'
    );
    
    adminCode = adminCode.replace(
        /class="flex-1 px-3 py-1\.5 rounded-lg text-xs font-bold transition-all \$\{currentSaleType === 'Resale' \? 'bg-white shadow-sm text-aci-blue' : 'text-slate-500 hover:text-slate-800'\}"/g,
        'class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${currentSaleType === \'Resale\' ? \'bg-white shadow-sm text-aci-blue\' : \'text-slate-500 hover:text-slate-800\'}"'
    );

    // 3. Cards to glass/compact
    adminCode = adminCode.split('class="bg-white border border-slate-200/60 p-3 rounded-xl shadow-sm border border-white/60 mb-4 relative overflow-hidden"').join('class="glass p-2.5 rounded-xl shadow-sm border border-slate-100 mb-3 relative overflow-hidden"');
    
    // 4. YTD Overall headings
    adminCode = adminCode.split('class="font-bold text-slate-800 text-xs flex items-center gap-2"').join('class="font-bold text-slate-800 text-sm flex items-center gap-2"');

    // 5. Dynamic Branding Cards (Primary gradients)
    let oldGradient = "class=\"bg-gradient-to-br ${brandFilter === 'Foton' ? 'from-foton to-[#03133d]' : 'from-mahindra to-[#b81b31]'} rounded-xl p-3 mb-4 relative overflow-hidden shadow-sm border border-slate-200/60 text-white\"";
    let newGradient = "class=\"bg-gradient-to-br ${brandFilter === 'Foton' ? 'from-foton to-[#03133d] shadow-foton/20' : 'from-mahindra to-[#b81b31] shadow-mahindra/20'} rounded-xl p-2.5 mb-3 relative overflow-hidden shadow-sm text-white\"";
    adminCode = adminCode.split(oldGradient).join(newGradient);

    // 6. Denser tables
    adminCode = adminCode.split('px-2 py-1.5').join('px-1.5 py-1');
    adminCode = adminCode.split('px-2 py-1').join('px-1.5 py-0.5');
    adminCode = adminCode.split('px-3 py-2').join('px-2 py-1');
    adminCode = adminCode.split('mb-4').join('mb-3');
    
    // Compress headers
    adminCode = adminCode.split('text-[10px]').join('text-[9px]');
    adminCode = adminCode.split('text-xs').join('text-[10px]');
    
    // Combine back
    let newContent = content.substring(0, startIdx) + adminCode + content.substring(endIdx);

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log("Admin panel UI refined successfully.");
}

refineAdminPanel('index.html');
