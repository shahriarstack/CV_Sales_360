const fs = require('fs');

function addManualFilters(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find renderAdminManualDeliveries start
    let startIdx = content.indexOf("renderAdminManualDeliveries: (startDate = null, endDate = null) => {");
    if (startIdx === -1) {
        console.log("Could not find renderAdminManualDeliveries function start");
        return;
    }

    // Insert sale_type filtering logic right after initial definition of manualSales
    let insertFilterLogicIdx = content.indexOf("let manualSales = DB.sales.filter(s => s.is_manual);", startIdx);
    if (insertFilterLogicIdx === -1) {
        console.log("Could not find manualSales initialization");
        return;
    }

    let filterLogic = `
                let manualSales = DB.sales.filter(s => s.is_manual);
                const saleTypeFilter = app.manualSaleTypeFilter || 'All';
                if (saleTypeFilter !== 'All') {
                    manualSales = manualSales.filter(s => s.sale_type === saleTypeFilter);
                }
    `;

    // Replace the single manualSales definition with our filtered one
    content = content.substring(0, insertFilterLogicIdx) + filterLogic.trim() + content.substring(insertFilterLogicIdx + "let manualSales = DB.sales.filter(s => s.is_manual);".length);

    // Now insert the HTML buttons into the template
    let h1Idx = content.indexOf('<p class="text-sm text-slate-500">Unsynced sales logged manually by Field Officers</p>', startIdx);
    if (h1Idx === -1) {
        console.log("Could not find header subtitle paragraph");
        return;
    }

    let buttonsHtml = `
                                <p class="text-sm text-slate-500">Unsynced sales logged manually by Field Officers</p>
                                
                                <!-- Beautiful & Creative Sale Type Switcher Pill -->
                                <div class="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-inner mt-2.5 w-max">
                                    <button onclick="app.manualSaleTypeFilter='All'; app.renderAdminManualDeliveries()" 
                                            class="px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 \${saleTypeFilter === 'All' ? 'bg-white text-slate-800 shadow-sm scale-102' : 'text-slate-400 hover:text-slate-600'}" style="min-height: 30px;">
                                        All
                                    </button>
                                    <button onclick="app.manualSaleTypeFilter='New Sale'; app.renderAdminManualDeliveries()" 
                                            class="px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 \${saleTypeFilter === 'New Sale' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm scale-102' : 'text-slate-400 hover:text-slate-600'}" style="min-height: 30px;">
                                        <span class="h-1.5 w-1.5 rounded-full \${saleTypeFilter === 'New Sale' ? 'bg-white' : 'bg-emerald-500'}"></span>
                                        New Sale
                                    </button>
                                    <button onclick="app.manualSaleTypeFilter='Resale'; app.renderAdminManualDeliveries()" 
                                            class="px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 \${saleTypeFilter === 'Resale' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm scale-102' : 'text-slate-400 hover:text-slate-600'}" style="min-height: 30px;">
                                        <span class="h-1.5 w-1.5 rounded-full \${saleTypeFilter === 'Resale' ? 'bg-white' : 'bg-amber-500'}"></span>
                                        Resale
                                    </button>
                                </div>
    `;

    content = content.substring(0, h1Idx) + buttonsHtml.trim() + content.substring(h1Idx + '<p class="text-sm text-slate-500">Unsynced sales logged manually by Field Officers</p>'.length);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("New Sale and Resale filter buttons successfully added to Manual Deliveries Tracker!");
}

addManualFilters('app.js');
