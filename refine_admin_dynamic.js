const fs = require('fs');

function refineAdminDynamic(filePath) {
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

    // 1. Inject more helper variables at the beginning of renderAdminDashboard
    const varInsertionIdx = adminCode.indexOf("const brandBgHoverHalf =");
    if (varInsertionIdx === -1) {
        console.log("Could not find brandBgHoverHalf to insert new variables");
        return;
    }
    
    const varEndLineIdx = adminCode.indexOf("\n", varInsertionIdx);
    const newVars = `
                const brandDark = brandFilter === 'Mahindra' ? 'bg-[#5e0d18]' : 'bg-[#020e2e]';
                const brandTextLight = brandFilter === 'Mahindra' ? 'text-rose-200' : 'text-sky-200';
                const brandTextMedium = brandFilter === 'Mahindra' ? 'text-rose-300' : 'text-sky-300';
                const brandBorderMedium = brandFilter === 'Mahindra' ? 'border-mahindra/30' : 'border-foton/30';
                const brandBorderDark = brandFilter === 'Mahindra' ? 'border-[#5e0d18]/50' : 'border-[#020e2e]/50';
                const brandShadow = brandFilter === 'Mahindra' ? 'shadow-mahindra/40' : 'shadow-foton/40';
                const brandBgPillActive = brandFilter === 'Mahindra' ? 'bg-gradient-to-r from-mahindra to-rose-700' : 'bg-gradient-to-r from-foton to-indigo-900';
    `;
    
    adminCode = adminCode.substring(0, varEndLineIdx + 1) + newVars + adminCode.substring(varEndLineIdx + 1);

    // 2. Replacements inside adminCode
    
    // AM Header Gradient Card
    adminCode = adminCode.replace(
        'bg-gradient-to-br from-aci-blue to-indigo-900',
        'bg-gradient-to-br ${brandGradient}'
    );
    adminCode = adminCode.replace(
        'text-indigo-300 uppercase tracking-[0.2em]',
        '${brandTextMedium} uppercase tracking-[0.2em]'
    );
    adminCode = adminCode.replace(
        'text-indigo-200 uppercase">Target',
        '${brandTextLight} uppercase">Target'
    );
    adminCode = adminCode.replace(
        'text-indigo-200 uppercase">Live',
        '${brandTextLight} uppercase">Live'
    );

    // Pacing Monitor Card icon container and styling
    adminCode = adminCode.replace(
        'p-2 bg-indigo-100 rounded-lg ${brandText}',
        'p-2 ${brandBgLight} rounded-lg ${brandText}'
    );
    adminCode = adminCode.replace(
        'bg-indigo-900 rounded-xl p-3 shadow-sm border border-slate-200/60 flex items-center justify-between text-white border border-white/10',
        'bg-gradient-to-br ${brandFilter === \'Mahindra\' ? \'from-mahindra to-[#8a1426]\' : \'from-foton to-[#052269]\'} rounded-xl p-2.5 shadow-sm border border-white/10 flex items-center justify-between text-white'
    );
    adminCode = adminCode.replace(
        'text-indigo-300 uppercase mb-0.5">Req. Daily Rate',
        '${brandTextMedium} uppercase mb-0.5">Req. Daily Rate'
    );
    adminCode = adminCode.replace(
        'text-indigo-200"></i>',
        '${brandTextLight}"></i>'
    );

    // Month button active style
    adminCode = adminCode.replace(
        "isActive \n                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20 scale-105 border border-emerald-400/30' \n                                                    : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/60 shadow-sm'",
        "isActive \n                                                    ? 'bg-gradient-to-r ' + (brandFilter === 'Mahindra' ? 'from-mahindra to-rose-700' : 'from-foton to-indigo-900') + ' text-white shadow-sm border border-white/20 scale-105' \n                                                    : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/60 shadow-sm'"
    );

    // Detailed View active tab button style
    adminCode = adminCode.replace(
        "app.pulseDetailedView ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm border border-slate-200/60 ${brandGlow} border border-indigo-500/20' : 'bg-white text-slate-500 border border-slate-200/60 hover:bg-slate-50'",
        "app.pulseDetailedView ? 'bg-gradient-to-r ' + (brandFilter === 'Mahindra' ? 'from-mahindra to-rose-700' : 'from-foton to-indigo-900') + ' text-white shadow-sm border border-slate-200/60 ' + brandGlow : 'bg-white text-slate-500 border border-slate-200/60 hover:bg-slate-50'"
    );

    // Filter active background
    adminCode = adminCode.replace(
        "app.pulseFilterTerritories.length > 0 ? 'bg-indigo-100 ${brandText} shadow-inner scale-110' : 'hover:bg-slate-100 text-slate-400'",
        "app.pulseFilterTerritories.length > 0 ? brandBgLight + ' ' + brandText + ' shadow-inner scale-110' : 'hover:bg-slate-100 text-slate-400'"
    );

    // Brand Summary Matrix cells
    adminCode = adminCode.replace(
        'text-indigo-900 bg-indigo-100/50',
        '${brandText} ${brandBgLightHalf}'
    );
    adminCode = adminCode.replace(
        'border-t border-indigo-200 bg-indigo-100 text-indigo-900 font-extrabold',
        'border-t ${brandBorderLight} ${brandBgLight} ${brandText} font-extrabold'
    );
    adminCode = adminCode.replace(
        'text-indigo-900 bg-indigo-200/50 font-extrabold',
        '${brandText} ${brandBgLightHalf} font-extrabold'
    );
    adminCode = adminCode.replace(
        'bg-indigo-100/50 font-bold ${brandText} text-[10px] text-center',
        '${brandBgLightHalf} font-bold ${brandText} text-[10px] text-center'
    );

    // Detailed table headers (Lines 4492 to 4533 in index.html, matching app.js coordinates)
    adminCode = adminCode.replace(
        'border border-indigo-900/10 ring-1 ring-slate-200/50',
        'border ${brandBorderLight} ring-1 ring-slate-200/50'
    );
    adminCode = adminCode.replace(
        'bg-indigo-950 text-indigo-200 uppercase tracking-widest text-[9px] border-b border-indigo-900/50',
        '${brandDark} ${brandTextLight} uppercase tracking-widest text-[9px] border-b ${brandBorderLight}'
    );
    adminCode = adminCode.replace(
        'bg-indigo-950 border-r border-indigo-900/80 shadow-[2px_0_5px_rgba(0,0,0,0.2)] text-indigo-50',
        '${brandDark} border-r ${brandBorderLight} shadow-sm ${brandTextLight}'
    );
    adminCode = adminCode.replace(
        'bg-indigo-900 text-indigo-300 uppercase tracking-tighter text-[9px] border-b-2 border-indigo-950 text-center',
        '${brandBg} ${brandTextMedium} uppercase tracking-tighter text-[9px] border-b-2 ${brandBorderDark} text-center'
    );
    adminCode = adminCode.replace(
        'bg-indigo-900 border-r border-indigo-800 shadow-[2px_0_5px_rgba(0,0,0,0.1)]',
        '${brandBg} border-r ${brandBorderLight} shadow-sm'
    );
    adminCode = adminCode.replace(
        'text-indigo-200 cursor-pointer ${brandBgHoverHalf} transition-colors border-l ${brandBorder}/50',
        '${brandTextLight} cursor-pointer ${brandBgHoverHalf} transition-colors border-l ${brandBorder}/50'
    );
    adminCode = adminCode.replace(
        'text-indigo-200 cursor-pointer ${brandBgHoverHalf} transition-colors border-r ${brandBorder}/50',
        '${brandTextLight} cursor-pointer ${brandBgHoverHalf} transition-colors border-r ${brandBorder}/50'
    );

    // Detailed table footer / grand total
    adminCode = adminCode.replace(
        'border-t-2 border-indigo-200',
        'border-t-2 ${brandBorderLight}'
    );
    adminCode = adminCode.replace(
        'border-r-2 border-indigo-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]',
        'border-r-2 ${brandBorderLight} shadow-sm'
    );
    adminCode = adminCode.replace(
        'bg-indigo-950 font-bold text-indigo-100 text-center border-t-[3px] border-indigo-900/80 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] relative z-20',
        '${brandDark} font-bold ${brandTextLight} text-center border-t-[3px] ${brandBorderLight} shadow-md relative z-20'
    );
    adminCode = adminCode.replace(
        'bg-indigo-950 border-r border-indigo-800 shadow-[2px_0_5px_rgba(0,0,0,0.2)]',
        '${brandDark} border-r ${brandBorderLight} shadow-sm'
    );
    adminCode = adminCode.replace(
        'bg-indigo-400 rounded-full shadow shadow-indigo-400/50',
        '${brandBg} rounded-full shadow ${brandShadow}'
    );
    adminCode = adminCode.replace(
        'bg-indigo-900/40 font-bold text-white text-[10px] text-center border-l border-indigo-800/50',
        '${brandBgLightHalf} font-bold text-white text-[10px] text-center border-l ${brandBorderLight}'
    );
    adminCode = adminCode.replace(
        'border-r border-indigo-800/50 bg-indigo-900/40 ${tAchBg}',
        'border-r ${brandBorderLight} ${brandBgLightHalf} ${tAchBg}'
    );
    adminCode = adminCode.replace(
        'border-r-2 border-indigo-500/20',
        'border-r-2 ${brandBorderLight}'
    );

    // Combine back
    let newContent = content.substring(0, startIdx) + adminCode + content.substring(endIdx);

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log("Admin Panel UI is now completely dynamic based on brand selection!");
}

refineAdminDynamic('app.js');
