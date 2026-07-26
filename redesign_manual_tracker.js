const fs = require('fs');

function redesignManualTracker(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Add app helper methods (approveSelectedManualDeliveries, toggleAllManualDeliveries, updateManualBatchButtonState)
    // We can insert them after approveManualDelivery method in app.js
    let searchMarker = "approveManualDelivery: async (id) => {";
    let insertIdx = content.indexOf(searchMarker);
    if (insertIdx === -1) {
        console.log("Could not find approveManualDelivery method");
        return;
    }

    let helpersCode = `
            approveSelectedManualDeliveries: async () => {
                const checkedCheckboxes = document.querySelectorAll('.manual-row-select:checked');
                if (checkedCheckboxes.length === 0) {
                    app.showToast('No entries selected', 'error');
                    return;
                }
                
                const ids = Array.from(checkedCheckboxes).map(cb => cb.dataset.id);
                if (confirm(\`Are you sure you want to approve \${ids.length} selected manual deliveries?\`)) {
                    if (app.neonSQL) {
                        try {
                            for (const id of ids) {
                                await app.neonSQL\`UPDATE sales SET approval_status = 'Done' WHERE id = \${id}\`;
                            }
                        } catch (err) {
                            console.error("Failed to approve manual deliveries in database", err);
                            app.showToast('Database update failed', 'error');
                            return;
                        }
                    }
                    
                    ids.forEach(id => {
                        const idx = DB.sales.findIndex(s => s.id === id);
                        if (idx > -1) {
                            DB.sales[idx].approval_status = 'Done';
                        }
                    });
                    
                    app.showToast(\`Successfully approved \${ids.length} deliveries.\`, 'success');
                    app.renderAdminManualDeliveries();
                }
            },

            toggleAllManualDeliveries: (isChecked) => {
                const checkboxes = document.querySelectorAll('.manual-row-select');
                checkboxes.forEach(cb => {
                    cb.checked = isChecked;
                });
                app.updateManualBatchButtonState();
            },
            
            updateManualBatchButtonState: () => {
                const checkedCheckboxes = document.querySelectorAll('.manual-row-select:checked');
                const btnApprove = document.getElementById('btn-batch-approve');
                const countSpan = document.getElementById('batch-select-count');
                const selectAllCheckbox = document.getElementById('manual-select-all');
                
                if (btnApprove && countSpan) {
                    countSpan.textContent = checkedCheckboxes.length;
                    if (checkedCheckboxes.length > 0) {
                        btnApprove.classList.remove('hidden');
                    } else {
                        btnApprove.classList.add('hidden');
                    }
                }
                
                const totalCheckboxes = document.querySelectorAll('.manual-row-select');
                if (selectAllCheckbox && totalCheckboxes.length > 0) {
                    selectAllCheckbox.checked = checkedCheckboxes.length === totalCheckboxes.length;
                }
            },
    `;

    // Insert helpersCode right before approveManualDelivery
    content = content.substring(0, insertIdx) + helpersCode.trim() + '\n\n' + content.substring(insertIdx);


    // 2. Redesign the renderAdminManualDeliveries view template
    // Find the renderAdminManualDeliveries function range
    let startIdx = content.indexOf("renderAdminManualDeliveries: (startDate = null, endDate = null) => {");
    let endIdx = content.indexOf("filterManualDeliveriesByDate: () => {", startIdx);
    
    if (startIdx === -1 || endIdx === -1) {
        console.log("Could not find renderAdminManualDeliveries boundaries");
        return;
    }

    let manualFunctionCode = content.substring(startIdx, endIdx);

    // Modify the header to include the Batch Approve Button
    manualFunctionCode = manualFunctionCode.replace(
        '<button onclick="app.downloadManualCSV()" class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 px-4 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5">',
        `<!-- Batch Approve Button -->
                                <button id="btn-batch-approve" onclick="app.approveSelectedManualDeliveries()" class="hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 animate-pulse">
                                    <i data-lucide="check-square" class="w-4 h-4"></i> Approve Selected (<span id="batch-select-count">0</span>)
                                </button>
                                
                                <button onclick="app.downloadManualCSV()" class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 px-4 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5">`
    );

    // Redesign the KPI cards to look premium
    // Card 1: Total Logged
    manualFunctionCode = manualFunctionCode.replace(
        'class="bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-indigo-100 rounded-xl p-3.5 shadow-sm hover:shadow transition-all duration-300"',
        'class="bg-gradient-to-br from-indigo-500/10 to-indigo-50/30 border border-indigo-100/80 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300"'
    );
    manualFunctionCode = manualFunctionCode.replace(
        'class="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"',
        'class="p-2 bg-indigo-500/15 text-indigo-600 rounded-xl shadow-inner"'
    );

    // Card 2: Pending Sync
    manualFunctionCode = manualFunctionCode.replace(
        'class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow transition-all duration-300"',
        'class="bg-gradient-to-br from-amber-500/10 to-amber-50/30 border border-amber-100/80 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300"'
    );
    manualFunctionCode = manualFunctionCode.replace(
        'class="p-1.5 bg-amber-50 text-amber-600 rounded-lg relative flex items-center justify-center"',
        'class="p-2 bg-amber-500/15 text-amber-600 rounded-xl relative flex items-center justify-center shadow-inner"'
    );

    // Card 3: Brand Share (Replace with beautiful progress split bar)
    let card3Start = manualFunctionCode.indexOf('<!-- Brand Share -->');
    let card3End = manualFunctionCode.indexOf('<!-- Combined Trade Value -->');
    if (card3Start !== -1 && card3End !== -1) {
        let card3Replacement = `<!-- Brand Share Ratio Bar -->
                            <div class="bg-gradient-to-br from-emerald-500/10 to-emerald-50/30 border border-emerald-100/80 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300">
                                <div class="flex items-center justify-between">
                                    <span class="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider">Brand Share Split</span>
                                    <span class="p-2 bg-emerald-500/15 text-emerald-600 rounded-xl shadow-inner"><i data-lucide="percent" class="w-3.5 h-3.5"></i></span>
                                </div>
                                <div class="mt-2.5">
                                    <div class="flex justify-between text-xs font-black text-slate-800 mb-1.5">
                                        <span>Foton: \${manualSales.filter(s => s.brand === 'Foton').length}</span>
                                        <span>Mahindra: \${manualSales.filter(s => s.brand === 'Mahindra').length}</span>
                                    </div>
                                    \${(() => {
                                        const fotonCount = manualSales.filter(s => s.brand === 'Foton').length;
                                        const mahindraCount = manualSales.filter(s => s.brand === 'Mahindra').length;
                                        const total = fotonCount + mahindraCount;
                                        const fotonPct = total > 0 ? Math.round((fotonCount / total) * 100) : 50;
                                        return \`
                                        <div class="w-full bg-rose-500 rounded-full h-2 overflow-hidden flex shadow-inner">
                                            <div class="bg-blue-600 h-full rounded-l-full transition-all duration-300" style="width: \${fotonPct}%" title="Foton: \${fotonPct}%"></div>
                                            <div class="bg-rose-500 h-full rounded-r-full transition-all duration-300" style="width: \${100 - fotonPct}%" title="Mahindra: \${100 - fotonPct}%"></div>
                                        </div>
                                        \`;
                                    })()}
                                </div>
                            </div>
                            `;
        manualFunctionCode = manualFunctionCode.substring(0, card3Start) + card3Replacement + manualFunctionCode.substring(card3End);
    }

    // Card 4: Total Value
    manualFunctionCode = manualFunctionCode.replace(
        'class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow transition-all duration-300"',
        'class="bg-gradient-to-br from-cyan-500/10 to-cyan-50/30 border border-cyan-100/80 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300"'
    );
    manualFunctionCode = manualFunctionCode.replace(
        'class="p-1.5 bg-slate-50 text-slate-600 rounded-lg"',
        'class="p-2 bg-cyan-500/15 text-cyan-600 rounded-xl shadow-inner"'
    );

    // Table Header additions: Select All checkbox column
    manualFunctionCode = manualFunctionCode.replace(
        '<table class="w-full text-left text-[11px] whitespace-nowrap min-w-[1000px]">\n                                <thead class="border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-widest bg-slate-100/50">\n                                    <tr>\n                                        <th class="px-3 py-1.5 font-bold text-center w-12">S/N</th>',
        `<table class="w-full text-left text-[11px] whitespace-nowrap min-w-[1050px]">
                                <thead class="border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-widest bg-slate-100/50">
                                    <tr>
                                        <th class="px-3 py-1.5 font-bold text-center w-10"><input type="checkbox" id="manual-select-all" onchange="app.toggleAllManualDeliveries(this.checked)" class="rounded border-slate-300 text-aci-blue focus:ring-aci-blue w-3.5 h-3.5 cursor-pointer shadow-sm"></th>
                                        <th class="px-3 py-1.5 font-bold text-center w-12">S/N</th>`
    );

    // Second header row (Filter row)
    manualFunctionCode = manualFunctionCode.replace(
        '<tr class="bg-slate-50/80">\n                                        <th class="px-3 py-1 border-b border-slate-200 text-center"><span class="text-[8px] text-slate-400 font-normal">#</span></th>',
        `<tr class="bg-slate-50/80">
                                        <th class="px-3 py-1 border-b border-slate-200 text-center"><span class="text-[8px] text-slate-400 font-bold uppercase">All</span></th>
                                        <th class="px-3 py-1 border-b border-slate-200 text-center"><span class="text-[8px] text-slate-400 font-normal">#</span></th>`
    );

    // Table Body additions: Row Checkbox & Dynamic Row Hover Tinting based on Brand
    manualFunctionCode = manualFunctionCode.replace(
        '<tr class="hover:bg-slate-50 transition-colors group">\n                                            <td class="px-3 py-1.5 border-b border-slate-100 text-center font-bold text-slate-400">',
        `\${(() => {
                                                const rowHoverColor = s.brand === 'Foton' ? 'hover:bg-foton-light/10 hover:shadow-[inset_3px_0_0_#041A54]' : 'hover:bg-mahindra-light/10 hover:shadow-[inset_3px_0_0_#E5223E]';
                                                return \`
                                                <tr class="transition-all duration-150 group border-b border-slate-100/60 \${rowHoverColor}">
                                                    <td class="px-3 py-1.5 text-center"><input type="checkbox" class="manual-row-select rounded border-slate-300 text-aci-blue focus:ring-aci-blue w-3.5 h-3.5 cursor-pointer" data-id="\${s.id}" onchange="app.updateManualBatchButtonState()"></td>
                                                    <td class="px-3 py-1.5 text-center font-bold text-slate-400">
                                                \`;
                                            })()}`
    );

    // Re-insert table closing mapping bracket
    manualFunctionCode = manualFunctionCode.replace(
        '</tr>\n                                    `}).join(\'\')}',
        `</tr>\n                                    \`}).join('')}`
    );

    content = content.substring(0, startIdx) + manualFunctionCode + content.substring(endIdx);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Manual Deliveries Tracker successfully upgraded with batch approval checkboxes, premium KPI cards, and brand dynamic hover effects!");
}

redesignManualTracker('app.js');
