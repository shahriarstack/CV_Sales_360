const fs = require('fs');

function enlargeManualFilters(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Look for the switcher HTML in app.js
    let searchStart = content.indexOf("<!-- Beautiful & Creative Sale Type Switcher Pill -->");
    if (searchStart === -1) {
        console.log("Could not find old switcher switcher pill template");
        return;
    }

    let endIdx = content.indexOf("</div>", searchStart);
    if (endIdx === -1) {
        console.log("Could not find switcher pill container end");
        return;
    }

    // Capture the entire block from <!-- Beautiful & Creative ... to the end of the div
    let targetBlock = content.substring(searchStart, endIdx + "</div>".length);

    let replacementBlock = `<!-- Beautiful & Noticeable Sale Type Switcher Pill -->
                                <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-md mt-3.5 w-max">
                                    <button onclick="app.manualSaleTypeFilter='All'; app.renderAdminManualDeliveries()" 
                                            class="px-5 py-2.5 rounded-xl text-xs md:text-sm font-black tracking-wide transition-all duration-300 \${saleTypeFilter === 'All' ? 'bg-white text-slate-800 shadow-md scale-105 border border-slate-200/40' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}" style="min-height: 38px;">
                                        All
                                    </button>
                                    <button onclick="app.manualSaleTypeFilter='New Sale'; app.renderAdminManualDeliveries()" 
                                            class="px-5 py-2.5 rounded-xl text-xs md:text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 \${saleTypeFilter === 'New Sale' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}" style="min-height: 38px;">
                                        <span class="h-2 w-2 rounded-full relative flex">
                                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full \${saleTypeFilter === 'New Sale' ? 'bg-white' : 'bg-emerald-400'} opacity-75"></span>
                                            <span class="relative inline-flex rounded-full h-2 w-2 \${saleTypeFilter === 'New Sale' ? 'bg-white' : 'bg-emerald-500'}"></span>
                                        </span>
                                        New Sale
                                    </button>
                                    <button onclick="app.manualSaleTypeFilter='Resale'; app.renderAdminManualDeliveries()" 
                                            class="px-5 py-2.5 rounded-xl text-xs md:text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 \${saleTypeFilter === 'Resale' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}" style="min-height: 38px;">
                                        <span class="h-2 w-2 rounded-full relative flex">
                                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full \${saleTypeFilter === 'Resale' ? 'bg-white' : 'bg-amber-400'} opacity-75"></span>
                                            <span class="relative inline-flex rounded-full h-2 w-2 \${saleTypeFilter === 'Resale' ? 'bg-white' : 'bg-amber-500'}"></span>
                                        </span>
                                        Resale
                                    </button>
                                </div>`;

    content = content.replace(targetBlock, replacementBlock);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Manual Deliveries Tracker switcher buttons successfully enlarged and styled!");
}

enlargeManualFilters('app.js');
