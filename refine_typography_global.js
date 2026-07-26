const fs = require('fs');

function refineTypographyGlobal(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // We want to process these functions specifically:
    const functionsToProcess = [
        { name: 'renderUserManagement', endTag: 'renderAdminEMI:' },
        { name: 'renderAdminEMI', endTag: 'renderAdminManualDeliveries:' },
        { name: 'renderAdminManualDeliveries', endTag: 'renderAdminDashboard:' },
        { name: 'renderAdminAnalytics', endTag: 'renderAdminAIInsights:' },
        { name: 'renderAdminAIInsights', endTag: 'renderAdminSalesMap:' },
        { name: 'renderAdminSalesMap', endTag: 'renderDataUpload:' },
        { name: 'renderDataUpload', endTag: 'renderAdminNotices:' },
        { name: 'renderAdminNotices', endTag: 'renderTIVManagement:' },
        { name: 'renderTIVManagement', endTag: 'renderSOEMI:' }
    ];

    functionsToProcess.forEach(fn => {
        let startMarker = `${fn.name}:`;
        let startIdx = content.indexOf(startMarker);
        if (startIdx === -1) {
            console.log(`Could not find ${fn.name}`);
            return;
        }
        
        let endIdx = content.indexOf(fn.endTag, startIdx);
        if (endIdx === -1) {
            endIdx = content.length;
        }
        
        let code = content.substring(startIdx, endIdx);
        let originalCode = code;

        // Apply visual improvements to font hierarchy:
        
        // Micro text fixes
        code = code.split('text-[7px]').join('text-[9px]');
        code = code.split('text-[8px]').join('text-[10px]');
        code = code.split('text-[9px]').join('text-[10px]');
        
        // Upgrade headers
        code = code.split('text-[10px] font-extrabold').join('text-xs font-extrabold');
        code = code.split('text-[10px] font-bold').join('text-xs font-bold');
        code = code.split('text-[10px] font-semibold').join('text-xs font-semibold');
        code = code.split('text-[10px] text-slate-500').join('text-xs text-slate-500');
        code = code.split('text-[10px] text-slate-400').join('text-xs text-slate-400');
        
        // Upgrade KPI numbers/large badges
        code = code.split('text-[11px] font-bold').join('text-xs font-bold');
        code = code.split('text-[11px] font-extrabold').join('text-sm font-extrabold');
        code = code.split('text-[11px] whitespace-nowrap').join('text-xs whitespace-nowrap');
        
        // Map, Analytics, Map options specific size adjustments
        code = code.split('text-[11px] uppercase').join('text-xs uppercase');
        code = code.split('text-[11px] font-mono').join('text-xs font-mono');
        
        // Specific class fixes for map select filters
        code = code.split('px-2 py-1 text-xs font-bold').join('px-3 py-1.5 text-xs font-bold');
        code = code.split('px-2.5 py-1.5 rounded-lg text-xs font-bold').join('px-3.5 py-2 rounded-xl text-xs font-bold');

        content = content.substring(0, startIdx) + code + content.substring(endIdx);
        console.log(`Refined typography for ${fn.name}`);
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Global Admin Typography refined successfully!");
}

refineTypographyGlobal('app.js');
