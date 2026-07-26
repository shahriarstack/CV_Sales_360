const fs = require('fs');

function redesignAdminHeadings(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // List of functions to modify, along with their heading HTML replacement patterns
    const headerConfigs = [
        {
            funcName: 'renderModelManagement',
            targetHeading: '<h1 class="text-lg font-bold text-slate-800">Vehicle Models</h1>',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight">Vehicle Models</h1></div>'
        },
        {
            funcName: 'renderUserManagement',
            targetHeading: '<h1 class="text-lg font-bold text-slate-800">User Management</h1>',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight">User Management</h1></div>'
        },
        {
            funcName: 'renderAdminEMI',
            targetHeading: '<h1 class="text-lg font-bold text-slate-800">${isAM ? \'Area EMI Summary\' : \'Global EMI Analytics\'}</h1>',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight">${isAM ? \'Area EMI Summary\' : \'Global EMI Analytics\'}</h1></div>'
        },
        {
            funcName: 'renderAdminManualDeliveries',
            targetHeading: '<h1 class="text-lg font-bold text-slate-800">Manual Deliveries Tracker</h1>',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight">Manual Deliveries Tracker</h1></div>'
        },
        {
            funcName: 'renderAdminDashboard',
            targetHeading: '<h1 class="text-xl font-black text-slate-900 tracking-tight">${isAM ? \'Area Analytics\' : \'Executive Core\'}</h1>',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight">${isAM ? \'Area Analytics\' : \'Executive Core\'}</h1></div>'
        },
        {
            funcName: 'renderAdminAnalytics',
            targetHeading: '<h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight flex items-center gap-3">',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight flex items-center gap-3">'
        },
        {
            funcName: 'renderAdminAIInsights',
            targetHeading: '<h1 class="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-3">',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight flex items-center gap-3">'
        },
        {
            funcName: 'renderAdminSalesMap',
            targetHeading: '<h1 class="text-lg font-bold text-slate-800 flex items-center gap-2">',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight flex items-center gap-2">'
        },
        {
            funcName: 'renderDataUpload',
            targetHeading: '<h1 class="text-lg font-bold text-slate-800">Bulk Data Upload</h1>',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight">Bulk Data Upload</h1></div>'
        },
        {
            funcName: 'renderAdminNotices',
            targetHeading: '<h1 class="text-lg font-bold text-slate-800 flex items-center gap-2">',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight flex items-center gap-2">'
        },
        {
            funcName: 'renderTIVManagement',
            targetHeading: '<h1 class="text-lg font-bold text-slate-800">TIV Data Management</h1>',
            newHeading: '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight">TIV Data Management</h1></div>'
        }
    ];

    headerConfigs.forEach(cfg => {
        let funcStart = `${cfg.funcName}:`;
        let startIdx = content.indexOf(funcStart);
        if (startIdx === -1) {
            console.log(`Could not find ${cfg.funcName}`);
            return;
        }

        // 1. Inject helper variables at the beginning of the function
        // Find where the function template starts (typically after const html = ` or similar)
        let htmlStartIdx = content.indexOf('const html = `', startIdx);
        if (htmlStartIdx === -1) {
            htmlStartIdx = content.indexOf('const html = \`', startIdx);
        }
        if (htmlStartIdx === -1) {
            console.log(`Could not find template start in ${cfg.funcName}`);
            return;
        }

        let variablesDeclaration = `
                const brandFilter = app.adminBrandTab || 'Foton';
                const headerAccent = brandFilter === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20';
                const headerTextGradient = brandFilter === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800';
        `;

        // Check if brandFilter is already declared in renderAdminDashboard
        if (cfg.funcName === 'renderAdminDashboard') {
            variablesDeclaration = `
                const headerAccent = brandFilter === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20';
                const headerTextGradient = brandFilter === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800';
            `;
        }

        content = content.substring(0, htmlStartIdx) + variablesDeclaration.trim() + '\n                ' + content.substring(htmlStartIdx);

        // Update the indices because content length changed
        let updatedStartIdx = content.indexOf(funcStart);
        let headingIdx = content.indexOf(cfg.targetHeading, updatedStartIdx);
        if (headingIdx === -1) {
            console.log(`Could not find heading for ${cfg.funcName}`);
            return;
        }

        // 2. Replace the target heading with the new premium design
        content = content.substring(0, headingIdx) + cfg.newHeading + content.substring(headingIdx + cfg.targetHeading.length);
        console.log(`Successfully redesigned heading for ${cfg.funcName}`);
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Admin headings visual overhaul finished successfully!");
}

redesignAdminHeadings('app.js');
