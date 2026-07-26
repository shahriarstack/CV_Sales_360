const fs = require('fs');

function redesignTables(filePath) {
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

    // 1. Redesign Table 1: Brand Summary Matrix Table
    // Redesign the table container wrapper with a premium top indicator line
    adminCode = adminCode.replace(
        'class="glass border border-slate-100 rounded-xl border border-white shadow-sm overflow-hidden mb-3"',
        'class="glass border border-slate-100 border-t-4 border-t-${brandFilter === \'Mahindra\' ? \'mahindra\' : \'foton\'} rounded-xl shadow-sm overflow-hidden mb-3 transition-all duration-300 hover:shadow-md"'
    );

    // Redesign headers with soft gradients
    adminCode = adminCode.replace(
        'bg-violet-500/10 text-violet-800 border-r border-slate-200/60 font-bold',
        'bg-gradient-to-b from-violet-500/15 to-transparent text-violet-800 border-r ${brandBorderLight} font-extrabold'
    );
    adminCode = adminCode.replace(
        'bg-amber-500/10 text-amber-800 border-r border-slate-200/60 font-bold',
        'bg-gradient-to-b from-amber-500/15 to-transparent text-amber-800 border-r ${brandBorderLight} font-extrabold'
    );
    adminCode = adminCode.replace(
        'bg-emerald-500/10 text-emerald-800 font-bold',
        'bg-gradient-to-b from-emerald-500/15 to-transparent text-emerald-800 font-extrabold'
    );

    // Apply custom brand hover effects to static Brand Summary rows
    adminCode = adminCode.replace(
        '<tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors text-center">\n                                    <td class="px-2 py-0.5 text-left font-bold text-slate-800 border-r border-slate-100 font-bold">\n                                        <div class="flex items-center gap-2">\n                                            <div class="w-1.5 h-4 ${b === \'Foton\' ? \'bg-foton\' : \'bg-mahindra\'} rounded-full"></div>\n                                            ${b}\n                                        </div>\n                                    </td>',
        '<tr class="border-b border-slate-100/60 text-center group transition-all duration-150 ${b === \'Foton\' ? \'hover:bg-foton-light/15 hover:shadow-[inset_3px_0_0_#041A54]\' : \'hover:bg-mahindra-light/15 hover:shadow-[inset_3px_0_0_#E5223E]\'}">\n                                    <td class="px-2 py-0.5 text-left font-bold text-slate-800 border-r ${brandBorderLight} sticky left-0 z-10 bg-white ${b === \'Foton\' ? \'group-hover:bg-foton-light/10\' : \'group-hover:bg-mahindra-light/10\'} transition-colors">\n                                        <div class="flex items-center gap-2">\n                                            <div class="w-1.5 h-4 ${b === \'Foton\' ? \'bg-foton shadow-sm shadow-foton/30\' : \'bg-mahindra shadow-sm shadow-mahindra/30\'} rounded-full"></div>\n                                            <span class="font-extrabold">${b}</span>\n                                        </div>\n                                    </td>'
    );

    // Redesign Grand Total row for Brand Summary
    adminCode = adminCode.replace(
        'class="bg-slate-100/50 font-bold text-slate-800 text-center border-t-2 border-slate-200/60"',
        'class="${brandDark} font-bold text-white text-center border-t-2 ${brandBorderLight} shadow-md relative z-20"'
    );
    adminCode = adminCode.replace(
        'class="px-2 py-0.5 text-left border-r border-slate-200/60 sticky left-0 z-10 bg-slate-100 font-bold">GRAND TOTAL',
        'class="px-2 py-0.5 text-left border-r ${brandBorderLight} sticky left-0 z-10 ${brandDark} font-extrabold text-white">GRAND TOTAL'
    );
    adminCode = adminCode.replace(
        'border-r border-slate-200/60">${gTot.fyBgt}',
        'border-r ${brandBorderLight} bg-white/5">${gTot.fyBgt}'
    );
    adminCode = adminCode.replace(
        'bg-slate-50/30">${isFirstMonth ? \'-\' : gTot.lBgt}',
        'bg-white/5">${isFirstMonth ? \'-\' : gTot.lBgt}'
    );
    adminCode = adminCode.replace(
        'bg-slate-50/30">${isFirstMonth ? \'-\' : gTot.lAct}',
        'bg-white/5">${isFirstMonth ? \'-\' : gTot.lAct}'
    );
    adminCode = adminCode.replace(
        'bg-slate-50/30 border-r border-slate-200/60">${isFirstMonth ? \'-\' : `${gLAch}%`}',
        'border-r ${brandBorderLight} bg-white/5">${isFirstMonth ? \'-\' : `${gLAch}%`}'
    );
    adminCode = adminCode.replace(
        'class="px-2 py-0.5 font-bold ${brandText} ${brandBgLightHalf} font-extrabold">${gTot.cAct}',
        'class="px-2 py-0.5 font-extrabold text-yellow-300 bg-white/10">${gTot.cAct}'
    );


    // 2. Redesign Table 2: Detailed Table (Quarterly View)
    // Dynamic left stripe hover effect
    adminCode = adminCode.replace(
        'class="pulse-tr-premium text-center border-b border-slate-100 group"',
        'class="pulse-tr-premium text-center border-b border-slate-100/60 group transition-all duration-150 ${brandFilter === \'Mahindra\' ? \'hover:bg-mahindra-light/10 hover:shadow-[inset_3px_0_0_#E5223E]\' : \'hover:bg-foton-light/10 hover:shadow-[inset_3px_0_0_#041A54]\'}"'
    );
    adminCode = adminCode.replace(
        'class="px-2 py-0.5 text-left sticky left-0 z-10 bg-white border-r-2 border-slate-200/60/90 shadow-[2px_0_5px_rgba(0,0,0,0.02)] sticky-left"',
        'class="px-2 py-0.5 text-left sticky left-0 z-10 border-r-2 ${brandBorderLight} shadow-sm transition-colors ${brandFilter === \'Mahindra\' ? \'bg-white group-hover:bg-mahindra-light/10\' : \'bg-white group-hover:bg-foton-light/10\'}"'
    );


    // 3. Redesign Table 3: Standard Territory Pulse Table
    adminCode = adminCode.replace(
        'class="hidden md:block overflow-x-auto rounded-xl shadow-sm border border-slate-200/60 border ${brandBorderLight} ring-1 ring-slate-200/50"',
        'class="hidden md:block overflow-x-auto rounded-xl shadow-sm border border-t-4 border-t-${brandFilter === \'Mahindra\' ? \'mahindra\' : \'foton\'} ${brandBorderLight} ring-1 ring-slate-200/50 transition-all duration-300 hover:shadow-md"'
    );
    // Row hovers
    adminCode = adminCode.replace(
        'class="hover:bg-slate-50/80 group transition-all duration-150 group text-center border-b border-slate-100"',
        'class="group transition-all duration-150 text-center border-b border-slate-100/60 ${brandFilter === \'Mahindra\' ? \'hover:bg-mahindra-light/10 hover:shadow-[inset_3px_0_0_#E5223E]\' : \'hover:bg-foton-light/10 hover:shadow-[inset_3px_0_0_#041A54]\'}"'
    );
    adminCode = adminCode.replace(
        'class="px-4 py-0.5 text-left sticky left-0 z-10 bg-white border-r border-slate-200/60/85 shadow-[2px_0_5px_rgba(0,0,0,0.02)] font-medium"',
        'class="px-4 py-0.5 text-left sticky left-0 z-10 border-r ${brandBorderLight} shadow-sm transition-colors ${brandFilter === \'Mahindra\' ? \'bg-white group-hover:bg-mahindra-light/10\' : \'bg-white group-hover:bg-foton-light/10\'} font-bold text-slate-700"'
    );
    // Grand Total Row in standard table
    adminCode = adminCode.replace(
        'class="px-2 py-0.5 text-left sticky left-0 z-10 bg-indigo-950 border-r border-indigo-800 shadow-[2px_0_5px_rgba(0,0,0,0.2)]"',
        'class="px-2 py-0.5 text-left sticky left-0 z-10 ${brandDark} border-r ${brandBorderLight} shadow-sm"'
    );
    adminCode = adminCode.replace(
        'class="px-2 py-0.5 font-bold text-amber-200 bg-gradient-to-b from-amber-900/40 to-amber-900/10 border-l border-r border-amber-900/30 text-center text-[10px] shadow-inner"',
        'class="px-2 py-0.5 font-bold text-amber-200 bg-gradient-to-b from-amber-900/30 to-transparent border-l border-r border-amber-900/20 text-center text-[10px] shadow-inner"'
    );


    // 4. Redesign Table 4: AM Territory Performance Analytics Table
    // Container
    adminCode = adminCode.replace(
        'class="glass border border-slate-100 rounded-xl border border-white shadow-sm overflow-hidden mb-3 relative"',
        'class="glass border border-slate-100 border-t-4 border-t-${brandFilter === \'Mahindra\' ? \'mahindra\' : \'foton\'} rounded-xl shadow-sm overflow-hidden mb-3 relative transition-all duration-300 hover:shadow-md"'
    );
    // Rows
    adminCode = adminCode.replace(
        'class="hover:bg-slate-50/80 group transition-colors group text-center border-b border-slate-100/50"',
        'class="group transition-all duration-150 text-center border-b border-slate-100/50 ${brandFilter === \'Mahindra\' ? \'hover:bg-mahindra-light/10 hover:shadow-[inset_3px_0_0_#E5223E]\' : \'hover:bg-foton-light/10 hover:shadow-[inset_3px_0_0_#041A54]\'}"'
    );
    adminCode = adminCode.replace(
        'class="px-5 py-1 text-left sticky left-0 z-10 bg-white border-r border-slate-50 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]"',
        'class="px-5 py-1 text-left sticky left-0 z-10 border-r ${brandBorderLight} shadow-sm transition-colors ${brandFilter === \'Mahindra\' ? \'bg-white group-hover:bg-mahindra-light/10\' : \'bg-white group-hover:bg-foton-light/10\'}"'
    );

    let newContent = content.substring(0, startIdx) + adminCode + content.substring(endIdx);

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log("Admin Panel tables redesigned with premium styles and dynamic hover effects!");
}

redesignTables('app.js');
