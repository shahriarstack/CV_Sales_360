const fs = require('fs');

function compactManualDashboard(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Locate the renderAdminManualDeliveries function start
    let startIdx = content.indexOf("renderAdminManualDeliveries: (startDate = null, endDate = null) => {");
    if (startIdx === -1) {
        console.log("Could not find renderAdminManualDeliveries");
        return;
    }

    // 2. Rewrite the filtering logic to use summarySales for cards and manualSales for table
    let filterStartMarker = "let manualSales = DB.sales.filter(s => s.is_manual);";
    let filterStartIdx = content.indexOf(filterStartMarker, startIdx);
    if (filterStartIdx === -1) {
        console.log("Could not find manualSales definition");
        return;
    }

    let filterEndIdx = content.indexOf("app.currentManualSales = manualSales;", filterStartIdx);
    if (filterEndIdx === -1) {
        console.log("Could not find currentManualSales assignment");
        return;
    }

    let newFilterLogic = `
                let summarySales = DB.sales.filter(s => s.is_manual);
                if (startDate || endDate) {
                    summarySales = summarySales.filter(s => {
                        if (!s.timestamp || s.timestamp === 'Recent') return true;
                        const d = new Date(s.timestamp);
                        if (isNaN(d.getTime())) return true;
                        if (startDate && new Date(startDate) > d) return false;
                        if (endDate && new Date(endDate) < d) return false;
                        return true;
                    });
                }
                
                let manualSales = [...summarySales];
                const saleTypeFilter = app.manualSaleTypeFilter || 'All';
                if (saleTypeFilter !== 'All') {
                    manualSales = manualSales.filter(s => s.sale_type === saleTypeFilter);
                }
                app.currentManualSales = manualSales;
    `;

    // Replace old filter block with newFilterLogic
    content = content.substring(0, filterStartIdx) + newFilterLogic.trim() + content.substring(filterEndIdx + "app.currentManualSales = manualSales;".length);

    // 3. Make switcher pill more compact
    // Find the switcher container block
    let switcherStart = content.indexOf("<!-- Beautiful & Noticeable Sale Type Switcher Pill -->");
    if (switcherStart === -1) {
        console.log("Could not find switcher pill comment");
        return;
    }
    let switcherEnd = content.indexOf("</div>", switcherStart);
    if (switcherEnd === -1) {
        console.log("Could not find switcher pill closing div");
        return;
    }

    let compactSwitcher = `<!-- Beautiful & Noticeable Sale Type Switcher Pill (Compact) -->
                                <div class="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner mt-2 w-max">
                                    <button onclick="app.manualSaleTypeFilter='All'; app.renderAdminManualDeliveries()" 
                                            class="px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-300 \${saleTypeFilter === 'All' ? 'bg-white text-slate-800 shadow-sm scale-102 border border-slate-200/20' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}" style="min-height: 30px;">
                                        All
                                    </button>
                                    <button onclick="app.manualSaleTypeFilter='New Sale'; app.renderAdminManualDeliveries()" 
                                            class="px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 \${saleTypeFilter === 'New Sale' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-102' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}" style="min-height: 30px;">
                                        <span class="h-1.5 w-1.5 rounded-full relative flex">
                                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full \${saleTypeFilter === 'New Sale' ? 'bg-white' : 'bg-emerald-400'} opacity-75"></span>
                                            <span class="relative inline-flex rounded-full h-1.5 w-1.5 \${saleTypeFilter === 'New Sale' ? 'bg-white' : 'bg-emerald-500'}"></span>
                                        </span>
                                        New Sale
                                    </button>
                                    <button onclick="app.manualSaleTypeFilter='Resale'; app.renderAdminManualDeliveries()" 
                                            class="px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 \${saleTypeFilter === 'Resale' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md scale-102' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}" style="min-height: 30px;">
                                        <span class="h-1.5 w-1.5 rounded-full relative flex">
                                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full \${saleTypeFilter === 'Resale' ? 'bg-white' : 'bg-amber-400'} opacity-75"></span>
                                            <span class="relative inline-flex rounded-full h-1.5 w-1.5 \${saleTypeFilter === 'Resale' ? 'bg-white' : 'bg-amber-500'}"></span>
                                        </span>
                                        Resale
                                    </button>
                                </div>`;

    content = content.substring(0, switcherStart) + compactSwitcher + content.substring(switcherEnd + "</div>".length);


    // 4. Redesign summary cards to be smaller, compact and contain Foton, Mahindra, Resale counts (no %)
    let cardsStart = content.indexOf("<!-- Minimal & Creative Summary Section -->");
    if (cardsStart === -1) {
        console.log("Could not find cards section start");
        return;
    }
    let cardsEnd = content.indexOf('<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">');
    if (cardsEnd === -1) {
        console.log("Could not find table card start boundary");
        return;
    }

    let compactCardsHtml = `<!-- Minimal & Compact Summary Section -->
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            <!-- Total Entries -->
                            <div class="bg-gradient-to-br from-indigo-500/5 to-indigo-50/20 border border-indigo-100/60 rounded-xl p-2.5 shadow-sm hover:shadow transition-all duration-200">
                                <div class="flex items-center justify-between">
                                    <span class="text-[8px] font-black text-indigo-500 uppercase tracking-wider">Total Logged</span>
                                    <span class="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-lg"><i data-lucide="clipboard-list" class="w-3 h-3"></i></span>
                                </div>
                                <div class="mt-1 flex items-baseline gap-1">
                                    <span class="text-lg font-black text-slate-800">\${summarySales.length}</span>
                                    <span class="text-[8px] font-bold text-slate-400">entries</span>
                                </div>
                            </div>

                            <!-- Pending Sync -->
                            <div class="bg-gradient-to-br from-amber-500/5 to-amber-50/20 border border-amber-100/60 rounded-xl p-2.5 shadow-sm hover:shadow transition-all duration-200">
                                <div class="flex items-center justify-between">
                                    <span class="text-[8px] font-black text-amber-500 uppercase tracking-wider">Pending Sync</span>
                                    <span class="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg relative flex items-center justify-center">
                                        <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                                        <i data-lucide="clock" class="w-3 h-3 relative"></i>
                                    </span>
                                </div>
                                <div class="mt-1 flex items-baseline gap-1">
                                    <span class="text-lg font-black text-amber-600">\${summarySales.filter(s => s.approval_status !== 'Done').length}</span>
                                    <span class="text-[8px] font-bold text-slate-400">pending</span>
                                </div>
                            </div>

                            <!-- Brand & Resale Share Split -->
                            <div class="bg-gradient-to-br from-emerald-500/5 to-emerald-50/20 border border-emerald-100/60 rounded-xl p-2.5 shadow-sm hover:shadow transition-all duration-200 col-span-1">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="text-[8px] font-black text-emerald-600 uppercase tracking-wider">Brand & Sale Split</span>
                                    <span class="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg"><i data-lucide="tag" class="w-3 h-3"></i></span>
                                </div>
                                \${(() => {
                                    const fCount = summarySales.filter(s => s.brand === 'Foton').length;
                                    const mCount = summarySales.filter(s => s.brand === 'Mahindra').length;
                                    const rCount = summarySales.filter(s => s.sale_type === 'Resale').length;
                                    return \`
                                    <div class="flex items-center justify-between gap-1">
                                        <div class="flex flex-col items-center flex-1 bg-blue-500/5 p-1 rounded-md border border-blue-500/10">
                                            <span class="text-[7px] font-bold text-blue-600 uppercase tracking-tighter">FOTON</span>
                                            <span class="text-xs font-black text-slate-800">\${fCount}</span>
                                        </div>
                                        <div class="flex flex-col items-center flex-1 bg-rose-500/5 p-1 rounded-md border border-rose-500/10">
                                            <span class="text-[7px] font-bold text-rose-600 uppercase tracking-tighter">MAHINDRA</span>
                                            <span class="text-xs font-black text-slate-800">\${mCount}</span>
                                        </div>
                                        <div class="flex flex-col items-center flex-1 bg-amber-500/5 p-1 rounded-md border border-amber-500/10">
                                            <span class="text-[7px] font-bold text-amber-600 uppercase tracking-tighter">RESALE</span>
                                            <span class="text-xs font-black text-slate-800">\${rCount}</span>
                                        </div>
                                    </div>
                                    \`;
                                })()}
                            </div>

                            <!-- Combined Trade Value -->
                            <div class="bg-gradient-to-br from-cyan-500/5 to-cyan-50/20 border border-cyan-100/60 rounded-xl p-2.5 shadow-sm hover:shadow transition-all duration-200">
                                <div class="flex items-center justify-between">
                                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-wider">Total Value (TP)</span>
                                    <span class="p-1.5 bg-cyan-500/10 text-cyan-600 rounded-lg"><i data-lucide="coins" class="w-3 h-3"></i></span>
                                </div>
                                <div class="mt-1 flex flex-col">
                                    <span class="text-sm font-black text-slate-800 truncate" title="\${app.formatCurrency(summarySales.reduce((sum, s) => sum + Number(s.financials?.tp || 0), 0))}">\${app.formatCurrency(summarySales.reduce((sum, s) => sum + Number(s.financials?.tp || 0), 0))}</span>
                                    <span class="text-[7px] font-medium text-slate-400 uppercase tracking-wider">Est. Trade Value</span>
                                </div>
                            </div>
                        </div>

                        `;

    content = content.substring(0, cardsStart) + compactCardsHtml + content.substring(cardsEnd);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Manual Deliveries summary cards and switcher button card successfully compacted!");
}

compactManualDashboard('app.js');
