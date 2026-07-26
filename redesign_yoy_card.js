const fs = require('fs');

function redesignYOYCard(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Target the YOY Trajectory Chart HTML wrapper
    let startMarker = '<!-- YOY Trajectory Chart -->';
    let startIdx = content.indexOf(startMarker);
    if (startIdx === -1) {
        console.log("Could not find YOY Trajectory Chart section");
        return;
    }
    
    let endIdx = content.indexOf('<!-- =====================================\n                    // BRAND SUMMARY MATRIX', startIdx);
    if (endIdx === -1) {
        endIdx = content.indexOf('<!-- Brand Summary Matrix -->', startIdx);
    }
    if (endIdx === -1) {
        console.log("Could not find end of YOY Trajectory Chart section");
        return;
    }

    let yoyHtml = content.substring(startIdx, endIdx);
    
    // Redesign the parent container card with horizontal gradient
    yoyHtml = yoyHtml.replace(
        'class="bg-white border border-slate-200/60 p-3 rounded-xl border border-white shadow-sm mb-3 relative overflow-hidden"',
        'class="border border-white/20 p-3 rounded-xl shadow-lg mb-3 relative overflow-hidden text-white" style="background: linear-gradient(90deg, #d946ef 0%, #4f46e5 50%, #06b6d4 100%);"'
    );
    yoyHtml = yoyHtml.replace(
        'class="absolute -right-20 -top-20 ${brandBg}/5 w-64 h-64 rounded-full blur-3xl pointer-events-none"',
        'class="absolute -right-20 -top-20 bg-white/5 w-64 h-64 rounded-full blur-3xl pointer-events-none"'
    );

    // Title and subtitle to high contrast white/cyan
    yoyHtml = yoyHtml.replace(
        'class="font-bold text-slate-800 flex items-center gap-2"><i data-lucide="git-compare" class="w-4 h-4 ${brandText}"></i> Performance vs Budget & YOY</h3>',
        'class="font-bold text-white flex items-center gap-2"><i data-lucide="git-compare" class="w-4 h-4 text-cyan-300"></i> Performance vs Budget & YOY</h3>'
    );
    yoyHtml = yoyHtml.replace(
        'class="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5"',
        'class="text-[9px] text-white/80 uppercase tracking-widest mt-0.5"'
    );

    // UI Control: checkbox label glassmorphic style
    yoyHtml = yoyHtml.replace(
        'class="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"',
        'class="flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/20 shadow-sm cursor-pointer transition-all ${app.yoyShowLY ? \'bg-white text-indigo-950 border-white\' : \'bg-white/10 text-white hover:bg-white/20\'}"'
    );
    yoyHtml = yoyHtml.replace(
        'class="rounded border-slate-300 ${brandText} focus:ring-indigo-500 w-3 h-3"',
        'class="rounded border-white/30 text-indigo-600 focus:ring-white w-3 h-3 bg-white/20"'
    );
    yoyHtml = yoyHtml.replace(
        'class="text-[10px] font-bold text-slate-600 uppercase tracking-wider"',
        'class="text-[10px] font-bold uppercase tracking-wider"'
    );

    // UI Control: select box glassmorphic style
    yoyHtml = yoyHtml.replace(
        'class="appearance-none bg-white/80 border border-slate-200/60 rounded-lg pl-3 pr-8 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm min-w-[120px]"',
        'class="appearance-none backdrop-blur-md border border-white/20 rounded-lg pl-3 pr-8 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm min-w-[120px] ${app.yoyTerritoryFilter !== \'All\' ? \'bg-white text-indigo-950 border-white\' : \'bg-white/10 text-white hover:bg-white/20\'}"'
    );
    yoyHtml = yoyHtml.replace(
        'class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"',
        'class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${app.yoyTerritoryFilter !== \'All\' ? \'text-indigo-950\' : \'text-white/60\'}"'
    );

    // UI Control: brand logos pill container
    yoyHtml = yoyHtml.replace(
        'class="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 shadow-inner"',
        'class="flex items-center bg-white/10 p-1 rounded-lg border border-white/10 shadow-inner backdrop-blur-md"'
    );
    yoyHtml = yoyHtml.replace(
        'class="relative flex items-center justify-center px-2 py-1 rounded-md transition-all duration-300 ${app.yoyBrandTab === \'Foton\' ? \'bg-white shadow-sm border border-slate-200/60 scale-105 z-10\' : \'opacity-50 hover:opacity-100 grayscale hover:grayscale-0\'}"',
        'class="relative flex items-center justify-center px-2 py-1 rounded-md transition-all duration-300 ${app.yoyBrandTab === \'Foton\' ? \'bg-white shadow-sm border-white scale-105 z-10\' : \'opacity-60 hover:opacity-100 hover:bg-white/5 grayscale-0\'}"'
    );
    yoyHtml = yoyHtml.replace(
        'class="w-px h-5 bg-slate-300 mx-1"',
        'class="w-px h-5 bg-white/20 mx-1"'
    );
    yoyHtml = yoyHtml.replace(
        'class="relative flex items-center justify-center px-2 py-1 rounded-md transition-all duration-300 ${app.yoyBrandTab === \'Mahindra\' ? \'bg-white shadow-sm border border-slate-200/60 scale-105 z-10\' : \'opacity-50 hover:opacity-100 grayscale hover:grayscale-0\'}"',
        'class="relative flex items-center justify-center px-2 py-1 rounded-md transition-all duration-300 ${app.yoyBrandTab === \'Mahindra\' ? \'bg-white shadow-sm border-white scale-105 z-10\' : \'opacity-60 hover:opacity-100 hover:bg-white/5 grayscale-0\'}"'
    );

    // Nested Heatmap Card glassmorphism
    yoyHtml = yoyHtml.replace(
        'class="lg:col-span-1 flex flex-col bg-slate-50/50 rounded-xl p-3 border border-slate-100 relative min-h-[300px]"',
        'class="lg:col-span-1 flex flex-col bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 relative min-h-[300px]"'
    );
    yoyHtml = yoyHtml.replace(
        'class="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"',
        'class="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5"'
    );
    yoyHtml = yoyHtml.replace(
        'class="w-3.5 h-3.5 ${brandText}"',
        'class="w-3.5 h-3.5 text-cyan-300"'
    );
    yoyHtml = yoyHtml.replace(
        'class="text-[9px] text-slate-400 font-medium mt-0.5"',
        'class="text-[9px] text-white/70 font-medium mt-0.5"'
    );
    yoyHtml = yoyHtml.replace(
        'class="px-2 py-0.5 ${brandBgLight} ${brandText} text-[10px] font-bold rounded-full border ${brandBorderLight}"',
        'class="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full border border-white/20"'
    );
    yoyHtml = yoyHtml.replace(
        'class="w-full rounded-xl overflow-hidden border border-slate-200/60 shadow-inner h-[250px]"',
        'class="w-full rounded-xl overflow-hidden border border-white/15 shadow-inner h-[250px] bg-white/5"'
    );

    content = content.substring(0, startIdx) + yoyHtml + content.substring(endIdx);


    // 2. Adjust chartYoyTrend options in app.js (scales and legend)
    let chartInitIdx = content.indexOf("app.charts.yoyTrend = new Chart(");
    if (chartInitIdx !== -1) {
        let chartEndIdx = content.indexOf("});", chartInitIdx);
        let chartCode = content.substring(chartInitIdx, chartEndIdx + 3);

        // Customize legend options for dark theme
        chartCode = chartCode.replace(
            "legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 10 } } }",
            "legend: { position: 'top', align: 'end', labels: { color: '#ffffff', usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 10 } } }"
        );

        // Customize grid lines and axis ticks for high contrast dark gradient background
        chartCode = chartCode.replace(
            "scales: {\n                            y: { border: { display: false }, grid: { borderDash: [4, 4], color: '#f1f5f9' }, beginAtZero: true },\n                            x: { border: { display: false }, grid: { display: false } }\n                        }",
            "scales: {\n                            y: {\n                                border: { display: false },\n                                grid: { borderDash: [4, 4], color: 'rgba(255, 255, 255, 0.15)' },\n                                ticks: { color: '#ffffff', font: { family: 'Inter', size: 9 } },\n                                beginAtZero: true\n                            },\n                            x: {\n                                border: { display: false },\n                                grid: { display: false },\n                                ticks: { color: '#ffffff', font: { family: 'Inter', size: 9 } }\n                            }\n                        }"
        );
        
        // Add dark style tooltip
        chartCode = chartCode.replace(
            "tooltip: { titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } }",
            "tooltip: { titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }, backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#ffffff', bodyColor: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1 }"
        );

        content = content.substring(0, chartInitIdx) + chartCode + content.substring(chartEndIdx + 3);
    }


    // 3. Adjust Chart.js Line Dataset and Animation colors
    let datasetInitIdx = content.indexOf("const currGrad = ctx.createLinearGradient(");
    if (datasetInitIdx !== -1) {
        let datasetEndIdx = content.indexOf("// Start the animation loop", datasetInitIdx);
        let datasetCode = content.substring(datasetInitIdx, datasetEndIdx);

        // Replace datasets base colors and line gradient to match neon teal / white / pink
        datasetCode = datasetCode.replace(
            "currGrad.addColorStop(0, 'rgba(15, 41, 66, 0.4)');\n                currGrad.addColorStop(1, 'rgba(15, 41, 66, 0.0)');",
            "currGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');\n                currGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');"
        );
        datasetCode = datasetCode.replace(
            "pointBorderColor: '#06b6d4',",
            "pointBorderColor: '#22d3ee',"
        );
        
        // Update Last Year line to stand out on purple
        datasetCode = datasetCode.replace(
            "borderColor: '#f59e0b',",
            "borderColor: '#fb7185',"
        );
        datasetCode = datasetCode.replace(
            "pointBackgroundColor: '#f59e0b',",
            "pointBackgroundColor: '#fb7185',"
        );

        // Update Budget Line to white/transparent
        datasetCode = datasetCode.replace(
            "borderColor: '#94a3b8',",
            "borderColor: 'rgba(255, 255, 255, 0.65)',"
        );

        // Update animation engine color variables
        datasetCode = datasetCode.replace(
            "const colorBase = '#0F2942';\n                            const colorHighlight1 = '#06b6d4';\n                            const colorHighlight2 = '#6366f1';",
            "const colorBase = '#ffffff';\n                            const colorHighlight1 = '#06b6d4';\n                            const colorHighlight2 = '#f472b6';"
        );

        content = content.substring(0, datasetInitIdx) + datasetCode + content.substring(datasetEndIdx);
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Performance vs Budget & YOY card successfully redesigned with horizontal gradient, glassmorphic elements, and inverted chart styling!");
}

redesignYOYCard('app.js');
