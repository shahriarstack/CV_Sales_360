const fs = require('fs');

function refineTypography(filePath) {
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

    // Apply structured font size improvements
    
    // Breadcrumbs/micro labels
    adminCode = adminCode.split("text-[8px] font-bold ${brandTextMedium} uppercase tracking-[0.2em]").join("text-[10px] font-bold ${brandTextMedium} uppercase tracking-[0.2em]");
    adminCode = adminCode.split("text-[8px] font-bold text-green-400").join("text-[10px] font-bold text-green-400");
    adminCode = adminCode.split("text-[7px] font-bold ${brandTextLight} uppercase").join("text-[9px] font-bold ${brandTextLight} uppercase");
    adminCode = adminCode.split("text-[7px] font-bold text-indigo-200 uppercase").join("text-[9px] font-bold ${brandTextLight} uppercase");
    
    // Card Title sizes
    adminCode = adminCode.split("text-[11px] flex items-center gap-2").join("text-xs font-bold uppercase tracking-wider flex items-center gap-2");
    adminCode = adminCode.split("text-[10px] tracking-tight").join("text-xs font-bold uppercase tracking-wider");
    
    // Card Metric Labels
    adminCode = adminCode.split("text-[9px] text-slate-400 uppercase font-semibold").join("text-[10px] text-slate-400 uppercase font-semibold");
    adminCode = adminCode.split("text-[9px] text-white/70 uppercase font-semibold").join("text-[10px] text-white/70 uppercase font-semibold");
    
    // Card Metric Values
    adminCode = adminCode.split("text-lg text-white").join("text-xl font-bold text-white");
    adminCode = adminCode.split("text-[11px] font-bold tracking-tight text-yellow-300").join("text-xl font-bold tracking-tight text-yellow-300");
    
    // Tiny table headers
    adminCode = adminCode.split("text-[8px] font-bold text-white/50 uppercase").join("text-[9px] font-bold text-white/50 uppercase");
    adminCode = adminCode.split("text-[8px] font-bold text-slate-400 uppercase").join("text-[9px] font-bold text-slate-400 uppercase");
    
    // AM drill-down rows
    adminCode = adminCode.split("text-[9px] font-bold text-slate-700 truncate").join("text-[10px] font-bold text-slate-700 truncate");
    adminCode = adminCode.split("text-[9px] font-bold text-slate-600").join("text-[10px] font-bold text-slate-600");
    adminCode = adminCode.split("text-[9px] font-bold text-white/90 truncate").join("text-[10px] font-bold text-white/90 truncate");
    adminCode = adminCode.split("text-[9px] font-medium text-white/80").join("text-[10px] font-medium text-white/80");
    
    // Main Headers
    adminCode = adminCode.split("text-[10px] font-extrabold text-slate-700 tracking-widest uppercase").join("text-xs font-extrabold text-slate-700 tracking-widest uppercase");
    adminCode = adminCode.split("text-[10px] font-medium text-slate-500").join("text-xs font-medium text-slate-500");
    
    // Switchers / buttons
    adminCode = adminCode.split("text-[9px] font-bold uppercase tracking-wider text-white").join("text-[10px] font-bold uppercase tracking-wider text-white");
    adminCode = adminCode.split("text-[9px] font-bold uppercase tracking-wider").join("text-[10px] font-bold uppercase tracking-wider");
    adminCode = adminCode.split("text-[9px] font-bold uppercase transition-all").join("text-[10px] font-bold uppercase transition-all");
    adminCode = adminCode.split("text-[9px] font-bold").join("text-[10px] font-bold");
    
    // Table values and headers
    adminCode = adminCode.split("text-[9px] border-b").join("text-[10px] border-b");
    adminCode = adminCode.split("text-[8px] border-b").join("text-[9px] border-b");
    adminCode = adminCode.split("text-[9px] font-bold text-slate-800 uppercase tracking-widest").join("text-xs font-bold text-slate-800 uppercase tracking-widest");
    adminCode = adminCode.split("text-[9px] text-slate-500 font-bold uppercase tracking-widest").join("text-[10px] text-slate-500 font-bold uppercase tracking-widest");
    adminCode = adminCode.split("text-[11px] whitespace-nowrap").join("text-xs whitespace-nowrap");
    
    // detailed table text
    adminCode = adminCode.split("text-[11px] font-bold text-slate-700").join("text-xs font-bold text-slate-700");
    
    // Detailed total row
    adminCode = adminCode.split("text-[10.5px] uppercase tracking-widest").join("text-xs font-bold uppercase tracking-widest");
    
    // Pacing drill-down items
    adminCode = adminCode.split("text-[9px] font-bold text-slate-800 leading-none mb-1").join("text-xs font-bold text-slate-800 leading-none mb-1");
    adminCode = adminCode.split("text-[12px] font-bold text-slate-700").join("text-xs font-bold text-slate-700");
    adminCode = adminCode.split("text-[9px] font-bold ${tIsAhead ? 'text-emerald-600' : 'text-rose-500'}").join("text-[10px] font-bold ${tIsAhead ? 'text-emerald-600' : 'text-rose-500'}");

    let newContent = content.substring(0, startIdx) + adminCode + content.substring(endIdx);

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log("Admin Panel typography and font sizing hierarchy refined successfully!");
}

refineTypography('app.js');
