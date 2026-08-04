// --- Sales360 Module: admin_manual.js ---
window.app = window.app || {};

window.app.renderAdminManualDeliveries = (startDate = null, endDate = null) => {
                localStorage.setItem('aci_last_page', 'manual');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                
                // Preserve existing date filters from DOM if not explicitly overridden
                const domStart = document.getElementById('manual-start-date')?.value;
                const domEnd = document.getElementById('manual-end-date')?.value;
                const actualStart = startDate !== null ? startDate : (domStart || null);
                const actualEnd = endDate !== null ? endDate : (domEnd || null);
                
                let summarySales = DB.sales.filter(s => s.is_manual || (s.id && typeof s.id === 'string' && s.id.startsWith('s_man_')));
                if ((actualStart && actualStart !== "") || (actualEnd && actualEnd !== "")) {
                    const startMs = actualStart ? new Date(actualStart + 'T00:00:00').getTime() : 0;
                    const endMs = actualEnd ? new Date(actualEnd + 'T23:59:59.999').getTime() : Infinity;
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                    summarySales = summarySales.filter(s => {
                        // Carried forward entries should always be preserved
                        if (s.is_carried_forward) return true;

                        // 1. Try parsing s.timestamp
                        if (s.timestamp && s.timestamp !== 'Recent') {
                            const d = new Date(s.timestamp);
                            const t = d.getTime();
                            if (!isNaN(t)) {
                                return t >= startMs && t <= endMs;
                            }
                        }

                        // 2. Fallback: match by sales_month & sales_year
                        if (s.sales_month) {
                            const mIdx = monthNames.indexOf(s.sales_month);
                            if (mIdx !== -1) {
                                const yr = Number(s.sales_year) || 2026;
                                const mStartMs = new Date(yr, mIdx, 1, 0, 0, 0).getTime();
                                const mEndMs = new Date(yr, mIdx + 1, 0, 23, 59, 59, 999).getTime();
                                return mStartMs <= endMs && mEndMs >= startMs;
                            }
                        }

                        return true;
                    });
                }
                
                let manualSales = [...summarySales];
                const saleTypeFilter = app.manualSaleTypeFilter || 'All';
                if (saleTypeFilter !== 'All') {
                    manualSales = manualSales.filter(s => s.sale_type === saleTypeFilter);
                }
                app.currentManualSales = manualSales;

                const html = `
                    <div class="w-full fade-in space-y-4">
                        <!-- Top Header & Action Controls Bar -->
                        <div class="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <div class="h-4.5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500' : 'from-foton to-sky-500'} rounded-full shadow-xs"></div>
                                        <h1 class="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                                            <i data-lucide="clipboard-check" class="w-4.5 h-4.5 text-indigo-600"></i>
                                            Manual Deliveries Tracker
                                        </h1>
                                    </div>
                                    <p class="text-[11px] text-slate-500 font-medium pl-3.5 mt-0.5">Unsynced sales logged manually by Field Officers</p>
                                </div>

                                <!-- Compact Sale Type Switcher Pill -->
                                <div class="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-inner">
                                    <button onclick="app.manualSaleTypeFilter='All'; app.renderAdminManualDeliveries()" 
                                            class="px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all duration-200 ${saleTypeFilter === 'All' ? 'bg-white text-slate-800 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}">
                                        All
                                    </button>
                                    <button onclick="app.manualSaleTypeFilter='New Sale'; app.renderAdminManualDeliveries()" 
                                            class="px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all duration-200 flex items-center gap-1.5 ${saleTypeFilter === 'New Sale' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}">
                                        <span class="h-1.5 w-1.5 rounded-full relative flex">
                                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${saleTypeFilter === 'New Sale' ? 'bg-white' : 'bg-emerald-400'} opacity-75"></span>
                                            <span class="relative inline-flex rounded-full h-1.5 w-1.5 ${saleTypeFilter === 'New Sale' ? 'bg-white' : 'bg-emerald-500'}"></span>
                                        </span>
                                        New Sale
                                    </button>
                                    <button onclick="app.manualSaleTypeFilter='Resale'; app.renderAdminManualDeliveries()" 
                                            class="px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all duration-200 flex items-center gap-1.5 ${saleTypeFilter === 'Resale' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}">
                                        <span class="h-1.5 w-1.5 rounded-full relative flex">
                                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${saleTypeFilter === 'Resale' ? 'bg-white' : 'bg-amber-400'} opacity-75"></span>
                                            <span class="relative inline-flex rounded-full h-1.5 w-1.5 ${saleTypeFilter === 'Resale' ? 'bg-white' : 'bg-amber-500'}"></span>
                                        </span>
                                        Resale
                                    </button>
                                </div>
                            </div>

                            <!-- Right Controls: Date Range & Action Buttons -->
                            <div class="flex flex-wrap items-center gap-2.5">
                                <!-- Date Range Selector -->
                                <div class="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-400 transition-all">
                                    <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i>
                                    <div class="flex items-center gap-1 text-[11px]">
                                        <input type="date" id="manual-start-date" onchange="app.filterManualDeliveriesByDate()" class="focus:outline-none text-slate-700 bg-transparent cursor-pointer font-semibold" title="Start Date">
                                        <span class="text-slate-300 font-bold">-</span>
                                        <input type="date" id="manual-end-date" onchange="app.filterManualDeliveriesByDate()" class="focus:outline-none text-slate-700 bg-transparent cursor-pointer font-semibold" title="End Date">
                                    </div>
                                </div>
                                
                                <!-- Batch Approve Button -->
                                <button id="btn-batch-approve" onclick="app.approveSelectedManualDeliveries()" class="hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow flex items-center gap-1.5 transition-all transform active:scale-95 animate-pulse">
                                    <i data-lucide="check-square" class="w-3.5 h-3.5"></i> Approve Selected (<span id="batch-select-count">0</span>)
                                </button>

                                <button onclick="app.openBatchCFModal()" class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow flex items-center gap-1.5 transition-all transform active:scale-95">
                                    <i data-lucide="fast-forward" class="w-3.5 h-3.5"></i> Batch Carry Forward
                                </button>
                                
                                <button onclick="app.downloadManualCSV()" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow flex items-center gap-1.5 transition-all transform active:scale-95">
                                    <i data-lucide="download" class="w-3.5 h-3.5"></i> Export CSV
                                </button>
                            </div>
                        </div>

                        <!-- Compact & Modern Glassmorphic Summary KPI Cards -->
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <!-- Card 1: Total Logged -->
                            <div class="bg-white/80 backdrop-blur-md border border-indigo-100/80 rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
                                <div class="flex items-center justify-between">
                                    <span class="text-[9px] font-black text-indigo-600 uppercase tracking-wider">Total Logged</span>
                                    <span class="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-lg shadow-inner"><i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i></span>
                                </div>
                                <div class="mt-2 flex items-baseline gap-1.5">
                                    <span class="text-lg font-black text-slate-800">${manualSales.length}</span>
                                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Deliveries</span>
                                </div>
                            </div>

                            <!-- Card 2: Pending Sync -->
                            <div class="bg-white/80 backdrop-blur-md border border-amber-100/80 rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
                                <div class="flex items-center justify-between">
                                    <span class="text-[9px] font-black text-amber-600 uppercase tracking-wider">Pending Sync</span>
                                    <span class="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg relative flex items-center justify-center shadow-inner">
                                        <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                                        <i data-lucide="clock" class="w-3.5 h-3.5 relative"></i>
                                    </span>
                                </div>
                                <div class="mt-2 flex items-baseline gap-1.5">
                                    <span class="text-lg font-black text-amber-600">${manualSales.filter(s => s.approval_status !== 'Done').length}</span>
                                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending</span>
                                </div>
                            </div>

                            <!-- Card 3: Brand Share Split (New Sales) -->
                            <div class="bg-white/80 backdrop-blur-md border border-emerald-100/80 rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Brand Share (New)</span>
                                    <span class="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg shadow-inner"><i data-lucide="percent" class="w-3.5 h-3.5"></i></span>
                                </div>
                                <div>
                                    <div class="flex justify-between text-[11px] font-black text-slate-700 mb-1">
                                        <span>Foton: ${manualSales.filter(s => s.brand === 'Foton' && s.sale_type !== 'Resale' && s.sale_type !== 'resale').length}</span>
                                        <span>Mahindra: ${manualSales.filter(s => s.brand === 'Mahindra' && s.sale_type !== 'Resale' && s.sale_type !== 'resale').length}</span>
                                    </div>
                                    ${(() => {
                                        const fotonCount = manualSales.filter(s => s.brand === 'Foton' && s.sale_type !== 'Resale' && s.sale_type !== 'resale').length;
                                        const mahindraCount = manualSales.filter(s => s.brand === 'Mahindra' && s.sale_type !== 'Resale' && s.sale_type !== 'resale').length;
                                        const total = fotonCount + mahindraCount;
                                        const fotonPct = total > 0 ? Math.round((fotonCount / total) * 100) : 50;
                                        return `
                                        <div class="w-full bg-rose-500 rounded-full h-1.5 overflow-hidden flex shadow-inner">
                                            <div class="bg-blue-600 h-full rounded-l-full transition-all duration-300" style="width: ${fotonPct}%" title="Foton (New): ${fotonPct}%"></div>
                                            <div class="bg-rose-500 h-full rounded-r-full transition-all duration-300" style="width: ${100 - fotonPct}%" title="Mahindra (New): ${100 - fotonPct}%"></div>
                                        </div>
                                        `;
                                    })()}
                                </div>
                            </div>

                            <!-- Card 4: Total Value (TP) -->
                            <div class="bg-white/80 backdrop-blur-md border border-cyan-100/80 rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
                                <div class="flex items-center justify-between">
                                    <span class="text-[9px] font-black text-cyan-600 uppercase tracking-wider">Total Value (TP)</span>
                                    <span class="p-1.5 bg-cyan-500/10 text-cyan-600 rounded-lg shadow-inner"><i data-lucide="coins" class="w-3.5 h-3.5"></i></span>
                                </div>
                                <div class="mt-2 flex flex-col">
                                    <span class="text-base font-black text-slate-800 truncate" title="${app.formatCurrency(manualSales.reduce((sum, s) => sum + Number(s.financials?.tp || 0), 0))}">${app.formatCurrency(manualSales.reduce((sum, s) => sum + Number(s.financials?.tp || 0), 0))}</span>
                                    <span class="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Est. Trade Value</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 class="font-bold text-slate-800 text-sm">Pending Actuals Integration <span class="bg-aci-blue text-white px-2 py-0.5 rounded-full text-xs ml-2">${manualSales.length} Entries</span></h3>
                            </div>
                            <table class="w-full text-left text-[11px] whitespace-nowrap min-w-[1000px]">
                                <thead class="border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-widest bg-slate-100/50">
                                    <tr>
                                        <th class="px-3 py-1.5 font-bold text-center w-12">S/N</th>
                                        <th class="px-4 py-1.5 font-bold">Territory & Area</th>
                                        <th class="px-4 py-1.5 font-bold">Customer Details</th>
                                        <th class="px-4 py-1.5 font-bold">Product Info</th>
                                        <th class="px-4 py-1.5 font-bold text-right">Financials (BDT)</th>
                                        <th class="px-4 py-1.5 font-bold">Offers & Gifts</th>
                                        <th class="px-4 py-1.5 font-bold">Logged On</th>
                                        <th class="px-4 py-1.5 font-bold text-center">Status</th>
                                        <th class="px-4 py-1.5 font-bold text-right">Actions</th>
                                    </tr>
                                    <tr class="bg-slate-50/80">
                                        <th class="px-3 py-1 border-b border-slate-200 text-center"><span class="text-[8px] text-slate-400 font-normal">#</span></th>
                                        <th class="px-4 py-1 border-b border-slate-200"><input type="text" id="manual-filter-area" onkeyup="app.manualAreaFilter=this.value; app.filterTableGroup(this)" value="${app.manualAreaFilter || ''}" placeholder="Filter Area..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-4 py-1 border-b border-slate-200"><input type="text" id="manual-filter-customer" onkeyup="app.manualCustomerFilter=this.value; app.filterTableGroup(this)" value="${app.manualCustomerFilter || ''}" placeholder="Filter Customer..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-4 py-1 border-b border-slate-200">
                                            <select id="manual-filter-brand" onchange="app.manualBrandFilter=this.value; app.filterTableGroup(this)" class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner text-slate-600 transition-all cursor-pointer">
                                                <option value="" ${!app.manualBrandFilter ? 'selected' : ''}>All Brands</option>
                                                <option value="foton" ${app.manualBrandFilter === 'foton' ? 'selected' : ''}>Foton</option>
                                                <option value="mahindra" ${app.manualBrandFilter === 'mahindra' ? 'selected' : ''}>Mahindra</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-1 border-b border-slate-200 text-right"><span class="text-[9px] text-slate-400 font-normal">No filter</span></th>
                                        <th class="px-4 py-1 border-b border-slate-200"><span class="text-[9px] text-slate-400 font-normal">No filter</span></th>
                                        <th class="px-4 py-1 border-b border-slate-200"><span class="text-[9px] text-slate-400 font-normal">Use top filter</span></th>
                                        <th class="px-4 py-1 border-b border-slate-200 text-center">
                                            <select id="manual-filter-status" onchange="app.manualStatusFilter=this.value; app.filterTableGroup(this)" class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner text-slate-600 transition-all cursor-pointer">
                                                <option value="" ${!app.manualStatusFilter ? 'selected' : ''}>All Status</option>
                                                <option value="pending approval" ${app.manualStatusFilter === 'pending approval' ? 'selected' : ''}>Pending</option>
                                                <option value="done" ${app.manualStatusFilter === 'done' ? 'selected' : ''}>Done</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-1 border-b border-slate-200 text-right"><span class="text-[9px] text-slate-400 font-normal">-</span></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${manualSales.map((s, idx) => {
                    const terrName = DB.territories.find(t => t.id === s.territory_id)?.name || 'Unknown';
                    return `
                                        <tr class="hover:bg-slate-50 transition-colors group">
                                            <td class="px-3 py-1.5 border-b border-slate-100 text-center font-bold text-slate-400">
                                                ${idx + 1}
                                            </td>
                                            <td class="px-4 py-1.5 border-b border-slate-100">
                                                <div class="font-bold text-slate-800 flex items-center gap-2">
                                                    ${terrName}
                                                </div>
                                                <div class="text-[9px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                                                    <i data-lucide="map-pin" class="w-2.5 h-2.5 text-slate-400"></i>
                                                    ${s.upazila || 'N/A'} ${s.district ? `(${s.district})` : ''}
                                                </div>
                                            </td>
                                            <td class="px-4 py-1.5 border-b border-slate-100">
                                                <div class="font-bold text-slate-800 text-[11px] truncate max-w-[150px]" title="${s.customer_name || 'N/A'}">${s.customer_name || 'N/A'}</div>
                                                <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                    <span class="text-[9px] font-bold text-aci-blue bg-blue-50 px-1 py-0.2 rounded">ID: ${s.customer_id}</span>
                                                    ${s.chassis_no ? `<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded" title="Chassis No">Chassis: ${s.chassis_no}</span>` : ''}
                                                    ${s.old_customer_id ? `<span class="text-[8px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.2 rounded" title="Old Customer ID">Old: ${s.old_customer_id}</span>` : ''}
                                                    ${s.purpose_of_use ? `<span class="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded flex items-center gap-0.5" title="Purpose of Use"><i data-lucide="briefcase" class="w-2.5 h-2.5"></i> ${s.purpose_of_use}</span>` : ''}
                                                </div>
                                            </td>
                                            <td class="px-4 py-1.5 border-b border-slate-100">
                                                <div class="font-bold text-slate-700 text-[11px]">${s.model}</div>
                                                <div class="flex items-center gap-1 mt-0.5">
                                                    <img src="${s.brand === 'Foton' ? 'https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png' : 'https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png'}" class="h-2.5 object-contain">
                                                    <span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">${s.brand}</span>
                                                    <span class="px-1 py-0.2 rounded-full text-[8px] font-bold ml-1 ${s.sale_type === 'New Sale' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">${s.sale_type}</span>
                                                </div>
                                            </td>
                                            <td class="px-4 py-1.5 border-b border-slate-100 text-right">
                                                <div class="text-[11px] font-bold text-slate-800">TP: ${app.formatCurrency(s.financials?.tp || 0)}</div>
                                                <div class="text-[10px] text-slate-600 font-medium mt-0.2">DP: ${app.formatCurrency(s.financials?.dp || 0)}</div>
                                                <div class="text-[9px] text-slate-400 font-medium mt-0.2">Tenure: ${s.financials?.tenure || 0} Mos</div>
                                            </td>
                                            <td class="px-4 py-1.5 border-b border-slate-100">
                                                ${s.discounts?.amount > 0 ? `<div class="text-[10px] font-bold text-rose-600 flex items-center gap-0.5"><i data-lucide="tags" class="w-2.5 h-2.5"></i> -${app.formatCurrency(s.discounts.amount)} (${s.discounts.type})</div>` : '<div class="text-[10px] text-slate-400 italic">No Discount</div>'}
                                                ${s.discounts?.gift ? `<div class="text-[9px] text-indigo-600 font-bold mt-0.5 flex items-center gap-0.5"><i data-lucide="gift" class="w-2.5 h-2.5"></i> ${s.discounts.gift}</div>` : ''}
                                            </td>
                                            <td class="px-4 py-1.5 border-b border-slate-100 text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                                <div class="flex flex-col gap-0.5">
                                                    <div class="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded w-max">
                                                        <i data-lucide="calendar-clock" class="w-3 h-3 text-slate-400"></i>
                                                        ${s.timestamp || 'Recent'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-4 py-1.5 border-b border-slate-100 text-center">
                                                <span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${s.approval_status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                                                    ${s.approval_status || 'Pending Approval'}
                                                </span>
                                                ${(s.is_carried_forward === true || s.is_carried_forward == 1 || s.is_carried_forward === '1') ? '<div class="mt-1"><span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 flex items-center justify-center gap-0.5 w-max mx-auto"><i data-lucide="forward" class="w-2.5 h-2.5"></i> C/F</span></div>' : ''}
                                                ${s.admin_comments ? `<div class="text-[8px] text-slate-400 mt-0.5 truncate max-w-[100px] mx-auto" title="${s.admin_comments}">Note: ${s.admin_comments}</div>` : ''}
                                            </td>
                                            <td class="px-4 py-1.5 border-b border-slate-100 text-right">
                                                <div class="flex items-center justify-end gap-1.5">
                                                    ${s.approval_status !== 'Done' ? `
                                                        <button onclick="app.approveManualDelivery('${s.id}')" title="Approve" class="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded transition-colors shadow-sm">
                                                            <i data-lucide="check" class="w-3.5 h-3.5"></i>
                                                        </button>
                                                    ` : ''}
                                                    <button onclick="app.editManualDeliveryModal('${s.id}')" title="Edit/Comment" class="p-1 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded transition-colors shadow-sm">
                                                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                                                    </button>
                                                    <button onclick="app.deleteManualDelivery('${s.id}')" title="Delete" class="p-1 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded transition-colors shadow-sm">
                                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                    ${manualSales.length === 0 ? '<tr><td colspan="9" class="px-6 py-12 text-center text-slate-500"><div class="flex flex-col items-center gap-3"><i data-lucide="inbox" class="w-8 h-8 text-slate-300"></i><p>No manual deliveries found matching criteria.</p></div></td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();

                // Restore date inputs
                if (actualStart) document.getElementById('manual-start-date').value = actualStart;
                if (actualEnd) document.getElementById('manual-end-date').value = actualEnd;

                // Automatically re-apply saved table filters
                const activeFilterTrigger = document.getElementById('manual-filter-status') || document.getElementById('manual-filter-area') || document.getElementById('manual-filter-customer') || document.getElementById('manual-filter-brand');
                if (activeFilterTrigger) {
                    app.filterTableGroup(activeFilterTrigger);
                }
            };

window.app.filterManualDeliveriesByDate = () => {
                const start = document.getElementById('manual-start-date').value;
                const end = document.getElementById('manual-end-date').value;
                app.renderAdminManualDeliveries(start, end);
            };

window.app.downloadManualCSV = () => {
                const sales = app.currentManualSales || DB.sales.filter(s => s.is_manual);
                if (sales.length === 0) return app.showToast('No data to export', 'error');

                let csv = 'Territory,District,Upazila,Customer ID,Customer Name,Chassis Number,Old Customer ID,Purpose of Use,Brand,Model,Sale Type,TP,DP,Tenure,Discount Type,Discount Amount,Gift Item,Logged On\n';
                
                sales.forEach(s => {
                    const terrName = DB.territories.find(t => t.id === s.territory_id)?.name || 'Unknown';
                    const row = [
                        `"${terrName}"`,
                        `"${s.district || ''}"`,
                        `"${s.upazila || ''}"`,
                        `"${s.customer_id || ''}"`,
                        `"${s.customer_name || ''}"`,
                        `"${s.chassis_no || ''}"`,
                        `"${s.old_customer_id || ''}"`,
                        `"${s.purpose_of_use || ''}"`,
                        `"${s.brand || ''}"`,
                        `"${s.model || ''}"`,
                        `"${s.sale_type || ''}"`,
                        s.financials?.tp || 0,
                        s.financials?.dp || 0,
                        s.financials?.tenure || 0,
                        `"${s.discounts?.type || ''}"`,
                        s.discounts?.amount || 0,
                        `"${s.discounts?.gift || ''}"`,
                        `"${s.timestamp || ''}"`
                    ];
                    csv += row.join(',') + '\n';
                });

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Manual_Deliveries_Export_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            };

window.app.saveManualDeliveriesToBackend = async () => {
                // Deprecated: manual deliveries are now updated directly in database rows.
            };

window.app.clearManualDeliveries = async () => {
                if (confirm('Are you sure you want to clear all manual deliveries? This will delete all pending and approved manual entries from the database.')) {
                    if (app.neonSQL) {
                        try {
                            await app.neonSQL`DELETE FROM sales WHERE is_manual = 1`;
                        } catch (err) {
                            console.error("Failed to clear manual deliveries from database", err);
                            app.showToast('Database delete failed', 'error');
                            return;
                        }
                    }
                    DB.sales = DB.sales.filter(s => !s.is_manual);
                    app.showToast('All manual deliveries cleared successfully for month-end!', 'success');
                    app.renderAdminManualDeliveries();
                }
            };

window.app.approveSelectedManualDeliveries = async () => {
                const checkedCheckboxes = document.querySelectorAll('.manual-row-select:checked');
                if (checkedCheckboxes.length === 0) {
                    app.showToast('No entries selected', 'error');
                    return;
                }
                
                const ids = Array.from(checkedCheckboxes).map(cb => cb.dataset.id);
                if (confirm(`Are you sure you want to approve ${ids.length} selected manual deliveries?`)) {
                    if (app.neonSQL) {
                        try {
                            for (const id of ids) {
                                await app.neonSQL`UPDATE sales SET approval_status = 'Done' WHERE id = ${id}`;
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
                    
                    app.showToast(`Successfully approved ${ids.length} deliveries.`, 'success');
                    app.renderAdminManualDeliveries();
                }
            };

window.app.toggleAllManualDeliveries = (isChecked) => {
                const checkboxes = document.querySelectorAll('.manual-row-select');
                checkboxes.forEach(cb => {
                    cb.checked = isChecked;
                });
                app.updateManualBatchButtonState();
            };

window.app.updateManualBatchButtonState = () => {
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
            };

window.app.approveManualDelivery = async (id) => {
                const idx = DB.sales.findIndex(s => s.id === id);
                if (idx > -1) {
                    if (app.neonSQL) {
                        try {
                            await app.neonSQL`UPDATE sales SET approval_status = 'Done' WHERE id = ${id}`;
                        } catch (err) {
                            console.error("Failed to approve manual delivery in database", err);
                            app.showToast('Database update failed', 'error');
                            return;
                        }
                    }
                    DB.sales[idx].approval_status = 'Done';
                    app.showToast('Manual delivery approved.', 'success');
                    app.renderAdminManualDeliveries();
                }
            };

window.app.openBatchCFModal = () => {
    const modalHtml = `
        <div id="batch-cf-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200">
                <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <h2 class="text-lg font-black tracking-tight flex items-center gap-2">
                        <i data-lucide="fast-forward" class="w-5 h-5"></i>
                        Batch Carry Forward
                    </h2>
                    <button onclick="document.getElementById('batch-cf-modal').remove()" class="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                
                <div class="p-5 flex-1 overflow-y-auto max-h-[70vh]">
                    <div class="mb-4">
                        <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Customer IDs</label>
                        <textarea id="batch-cf-input" rows="4" placeholder="e.g. C-1001, C-1002, C-1005" class="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-slate-50 transition-all placeholder-slate-300"></textarea>
                        <p class="text-[10px] text-slate-500 mt-1.5"><i data-lucide="info" class="w-3 h-3 inline-block -mt-0.5"></i> Enter multiple Customer IDs separated by commas, spaces, or new lines.</p>
                    </div>
                    
                    <div class="flex justify-end mb-4">
                        <button onclick="app.previewBatchCF()" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5">
                            <i data-lucide="search" class="w-4 h-4"></i>
                            Preview Matches
                        </button>
                    </div>
                    
                    <div id="batch-cf-preview-container" class="hidden">
                        <h3 class="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider border-b border-slate-100 pb-1">Preview Results</h3>
                        <div class="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mb-4">
                            <div class="overflow-x-auto max-h-[30vh]">
                                <table class="w-full text-left text-[11px] whitespace-nowrap">
                                    <thead class="border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-widest bg-slate-100/80 sticky top-0">
                                        <tr>
                                            <th class="px-3 py-2 font-bold">Status</th>
                                            <th class="px-3 py-2 font-bold">Customer ID</th>
                                            <th class="px-3 py-2 font-bold">Customer Name</th>
                                            <th class="px-3 py-2 font-bold">Model</th>
                                        </tr>
                                    </thead>
                                    <tbody id="batch-cf-preview-body" class="divide-y divide-slate-100">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between border-t border-slate-100 pt-4">
                            <div class="text-xs text-slate-600 font-medium" id="batch-cf-summary"></div>
                            <button id="btn-batch-cf-execute" onclick="app.executeBatchCF()" class="hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2">
                                <i data-lucide="zap" class="w-4 h-4"></i>
                                Carry Forward All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    app.refreshIcons();
    document.getElementById('batch-cf-input').focus();
};

window.app._batchCFValidIds = [];

window.app.previewBatchCF = () => {
    const input = document.getElementById('batch-cf-input').value;
    if (!input.trim()) return;
    
    // Parse input (split by commas, newlines, or spaces)
    const rawIds = input.split(/[\s,]+/).map(id => id.trim()).filter(id => id);
    const uniqueIds = [...new Set(rawIds)];
    
    const tbody = document.getElementById('batch-cf-preview-body');
    const container = document.getElementById('batch-cf-preview-container');
    const btnExecute = document.getElementById('btn-batch-cf-execute');
    const summary = document.getElementById('batch-cf-summary');
    
    tbody.innerHTML = '';
    app._batchCFValidIds = [];
    
    let html = '';
    let validCount = 0;
    
    uniqueIds.forEach(cid => {
        const matches = DB.sales.filter(s => s.is_manual && s.customer_id && s.customer_id.toUpperCase() === cid.toUpperCase());
        
        if (matches.length === 0) {
            html += `
                <tr class="bg-rose-50/30">
                    <td class="px-3 py-1.5"><span class="px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold text-[9px] rounded uppercase">Not Found</span></td>
                    <td class="px-3 py-1.5 font-mono font-bold text-slate-700">${cid}</td>
                    <td class="px-3 py-1.5 text-slate-400 italic" colspan="2">No manual delivery found</td>
                </tr>
            `;
        } else {
            matches.forEach(m => {
                const isCF = m.is_carried_forward === true || m.is_carried_forward == 1 || m.is_carried_forward === '1';
                if (isCF) {
                    html += `
                        <tr class="bg-slate-50">
                            <td class="px-3 py-1.5"><span class="px-1.5 py-0.5 bg-slate-200 text-slate-600 font-bold text-[9px] rounded uppercase">Already C/F</span></td>
                            <td class="px-3 py-1.5 font-mono font-bold text-slate-700">${m.customer_id}</td>
                            <td class="px-3 py-1.5 font-bold text-slate-700">${m.customer_name || 'N/A'}</td>
                            <td class="px-3 py-1.5 font-bold text-slate-600">${m.model}</td>
                        </tr>
                    `;
                } else {
                    app._batchCFValidIds.push(m.id);
                    validCount++;
                    html += `
                        <tr class="bg-emerald-50/30">
                            <td class="px-3 py-1.5"><span class="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[9px] rounded uppercase">Ready</span></td>
                            <td class="px-3 py-1.5 font-mono font-black text-indigo-700">${m.customer_id}</td>
                            <td class="px-3 py-1.5 font-bold text-slate-800">${m.customer_name || 'N/A'}</td>
                            <td class="px-3 py-1.5 font-bold text-slate-700">${m.model} <span class="text-[8px] text-slate-400 uppercase">(${m.brand})</span></td>
                        </tr>
                    `;
                }
            });
        }
    });
    
    tbody.innerHTML = html;
    container.classList.remove('hidden');
    
    if (validCount > 0) {
        summary.innerHTML = `Found <strong class="text-indigo-600">${validCount}</strong> valid entries to carry forward.`;
        btnExecute.classList.remove('hidden');
    } else {
        summary.innerHTML = `<span class="text-rose-600">No new valid entries found to process.</span>`;
        btnExecute.classList.add('hidden');
    }
    app.refreshIcons();
};

window.app.executeBatchCF = async () => {
    const ids = app._batchCFValidIds;
    if (!ids || ids.length === 0) return;
    
    const btnExecute = document.getElementById('btn-batch-cf-execute');
    btnExecute.disabled = true;
    btnExecute.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Processing...';
    app.refreshIcons();
    
    const activeFY = app.currentFY;
    const targetMonth = app.currentMonth;
    const parts = activeFY.split('-');
    let targetYear = new Date().getFullYear();
    if (parts.length === 2) {
        const y1 = parseInt(parts[0]);
        const h2Months = ['January', 'February', 'March', 'April', 'May', 'June'];
        targetYear = h2Months.includes(targetMonth) ? (y1 + 1) : y1;
    }
    
    if (app.neonSQL) {
        try {
            const idListStr = ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
            await app.neonSQL([`UPDATE sales SET is_carried_forward = 1, sales_month = '${targetMonth.replace(/'/g, "''")}', fy = '${activeFY.replace(/'/g, "''")}', sales_year = ${targetYear} WHERE id IN (${idListStr})`]);
        } catch (err) {
            console.error("Failed to execute batch carry forward", err);
            app.showToast('Database update failed', 'error');
            btnExecute.disabled = false;
            btnExecute.innerHTML = '<i data-lucide="zap" class="w-4 h-4"></i> Carry Forward All';
            app.refreshIcons();
            return;
        }
    }
    
    ids.forEach(id => {
        const idx = DB.sales.findIndex(s => s.id === id);
        if (idx > -1) {
            DB.sales[idx].is_carried_forward = true;
            DB.sales[idx].sales_month = targetMonth;
            DB.sales[idx].fy = activeFY;
            DB.sales[idx].sales_year = targetYear;
        }
    });
    
    app.showToast(`Successfully carried forward ${ids.length} entries.`, 'success');
    document.getElementById('batch-cf-modal').remove();
    app.renderAdminManualDeliveries();
};

window.app.deleteManualDelivery = async (id) => {
                if (confirm('Are you sure you want to delete this manual delivery?')) {
                    if (app.neonSQL) {
                        try {
                            await app.neonSQL`DELETE FROM sales WHERE id = ${id}`;
                        } catch (err) {
                            console.error("Failed to delete manual delivery from database", err);
                            app.showToast('Database delete failed', 'error');
                            return;
                        }
                    }
                    DB.sales = DB.sales.filter(s => s.id !== id);
                    app.showToast('Manual delivery deleted.', 'success');
                    app.renderAdminManualDeliveries();
                }
            };

window.app.closeEditManualDeliveryModal = () => {
                const m = document.getElementById('edit-manual-modal');
                if (m) {
                    m.classList.add('hidden');
                    m.classList.remove('opacity-100');
                    document.getElementById('edit-manual-content').classList.remove('scale-100');
                    document.getElementById('edit-manual-content').classList.add('scale-95');
                }
            };

window.app.editManualDeliveryModal = (id) => {
                const s = DB.sales.find(x => x.id === id);
                if (!s) return;
                
                let modal = document.getElementById('edit-manual-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'edit-manual-modal';
                    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
                    document.body.appendChild(modal);
                }
                
                modal.innerHTML = `
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform scale-95 transition-transform duration-300" id="edit-manual-content">
                        <div class="bg-gradient-to-r from-blue-900 to-indigo-800 p-5 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                            <div class="absolute inset-0 bg-pattern opacity-10"></div>
                            <div class="relative z-10">
                                <h2 class="text-xl font-black tracking-tight">Edit Manual Delivery</h2>
                                <p class="text-xs text-blue-200 mt-1">Review and update delivery details for ID: ${s.id}</p>
                            </div>
                            <button onclick="app.closeEditManualDeliveryModal()" class="relative z-10 text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                            <form id="edit-manual-form" onsubmit="app.saveEditedManualDelivery(event, '${s.id}')" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="space-y-4">
                                        <h3 class="font-bold text-slate-800 text-sm border-b pb-2">Customer & Identity</h3>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer ID</label>
                                                <input type="text" id="em-customer-id" value="${s.customer_id || ''}" required class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Name</label>
                                                <input type="text" id="em-customer-name" value="${s.customer_name || ''}" required class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Chassis Number</label>
                                            <input type="text" id="em-chassis" value="${s.chassis_no || ''}" required class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Brand</label>
                                                <select id="em-brand" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                                    <option value="Foton" ${s.brand === 'Foton' ? 'selected' : ''}>Foton</option>
                                                    <option value="Mahindra" ${s.brand === 'Mahindra' ? 'selected' : ''}>Mahindra</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Model</label>
                                                <input type="text" id="em-model" value="${s.model || ''}" required class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sale Type</label>
                                                <select id="em-type" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                                    <option value="New Sale" ${s.sale_type === 'New Sale' ? 'selected' : ''}>New Sale</option>
                                                    <option value="Resale" ${s.sale_type === 'Resale' ? 'selected' : ''}>Resale</option>
                                                    <option value="Credit Note" ${s.sale_type === 'Credit Note' ? 'selected' : ''}>Credit Note</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Purpose of Use</label>
                                                <select id="em-purpose" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                                    <option value="Poultry Firm use" ${s.purpose_of_use === 'Poultry Firm use' ? 'selected' : ''}>Poultry Firm use</option>
                                                    <option value="Cow carry" ${s.purpose_of_use === 'Cow carry' ? 'selected' : ''}>Cow carry</option>
                                                    <option value="Fish carry" ${s.purpose_of_use === 'Fish carry' ? 'selected' : ''}>Fish carry</option>
                                                    <option value="Food carry" ${s.purpose_of_use === 'Food carry' ? 'selected' : ''}>Food carry</option>
                                                    <option value="Vegetable carry" ${s.purpose_of_use === 'Vegetable carry' ? 'selected' : ''}>Vegetable carry</option>
                                                    <option value="Construction equipment carry" ${s.purpose_of_use === 'Construction equipment carry' ? 'selected' : ''}>Construction equipment carry</option>
                                                    <option value="Industrial material carry" ${s.purpose_of_use === 'Industrial material carry' ? 'selected' : ''}>Industrial material carry</option>
                                                    <option value="Grocery store item carry" ${s.purpose_of_use === 'Grocery store item carry' ? 'selected' : ''}>Grocery store item carry</option>
                                                    <option value="Egg carry" ${s.purpose_of_use === 'Egg carry' ? 'selected' : ''}>Egg carry</option>
                                                    <option value="Garments items" ${s.purpose_of_use === 'Garments items' ? 'selected' : ''}>Garments items</option>
                                                    <option value="Oil transport" ${s.purpose_of_use === 'Oil transport' ? 'selected' : ''}>Oil transport</option>
                                                    <option value="Industrial purpose" ${s.purpose_of_use === 'Industrial purpose' ? 'selected' : ''}>Industrial purpose</option>
                                                    <option value="Commercial transport" ${s.purpose_of_use === 'Commercial transport' ? 'selected' : ''}>Commercial transport</option>
                                                    <option value="Gas cylinder carry" ${s.purpose_of_use === 'Gas cylinder carry' ? 'selected' : ''}>Gas cylinder carry</option>
                                                    <option value="Scrap business purpose" ${s.purpose_of_use === 'Scrap business purpose' ? 'selected' : ''}>Scrap business purpose</option>
                                                    <option value="Water bottle" ${s.purpose_of_use === 'Water bottle' ? 'selected' : ''}>Water bottle</option>
                                                    <option value="Agriculture" ${s.purpose_of_use === 'Agriculture' ? 'selected' : ''}>Agriculture</option>
                                                    <option value="Personal Use" ${s.purpose_of_use === 'Personal Use' ? 'selected' : ''}>Personal Use</option>
                                                    <option value="Public Transport" ${s.purpose_of_use === 'Public Transport' ? 'selected' : ''}>Public Transport</option>
                                                    <option value="Others" ${s.purpose_of_use === 'Others' ? 'selected' : ''}>Others</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Old Customer ID (Resale)</label>
                                            <input type="text" id="em-old-customer-id" value="${s.old_customer_id || ''}" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white" placeholder="Previous owner code (if resale)">
                                        </div>
                                    </div>
                                    <div class="space-y-4">
                                        <h3 class="font-bold text-slate-800 text-sm border-b pb-2">Location & Period</h3>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">District</label>
                                                <input type="text" id="em-district" value="${s.district || ''}" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Upazila</label>
                                                <input type="text" id="em-upazila" value="${s.upazila || ''}" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Territory</label>
                                                <select id="em-territory" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                                    ${DB.territories.map(t => '<option value="' + t.id + '"' + (s.territory_id === t.id ? ' selected' : '') + '>' + t.name + '</option>').join('')}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">FY</label>
                                                <input type="text" id="em-fy" value="${s.fy || ''}" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white" placeholder="e.g. 2025-26">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sales Month</label>
                                            <select id="em-sales-month" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                                <option value="July" ${s.sales_month === 'July' ? 'selected' : ''}>July</option>
                                                <option value="August" ${s.sales_month === 'August' ? 'selected' : ''}>August</option>
                                                <option value="September" ${s.sales_month === 'September' ? 'selected' : ''}>September</option>
                                                <option value="October" ${s.sales_month === 'October' ? 'selected' : ''}>October</option>
                                                <option value="November" ${s.sales_month === 'November' ? 'selected' : ''}>November</option>
                                                <option value="December" ${s.sales_month === 'December' ? 'selected' : ''}>December</option>
                                                <option value="January" ${s.sales_month === 'January' ? 'selected' : ''}>January</option>
                                                <option value="February" ${s.sales_month === 'February' ? 'selected' : ''}>February</option>
                                                <option value="March" ${s.sales_month === 'March' ? 'selected' : ''}>March</option>
                                                <option value="April" ${s.sales_month === 'April' ? 'selected' : ''}>April</option>
                                                <option value="May" ${s.sales_month === 'May' ? 'selected' : ''}>May</option>
                                                <option value="June" ${s.sales_month === 'June' ? 'selected' : ''}>June</option>
                                            </select>
                                        </div>
                                        <h3 class="font-bold text-slate-800 text-sm border-b pb-2 mt-2">Financials & Comments</h3>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Trade Price (TP)</label>
                                                <input type="number" id="em-tp" value="${s.financials?.tp || 0}" required min="0" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Down Payment (DP)</label>
                                                <input type="number" id="em-dp" value="${s.financials?.dp || 0}" required min="0" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tenure (Months)</label>
                                                <input type="number" id="em-tenure" value="${s.financials?.tenure || 0}" required min="0" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Discount Amount</label>
                                                <input type="number" id="em-disc-amt" value="${s.discounts?.amount || 0}" min="0" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Admin Comments</label>
                                            <textarea id="em-comments" rows="3" class="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white" placeholder="Add note for Sales Officer...">${s.admin_comments || ''}</textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onclick="app.closeEditManualDeliveryModal()" class="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button type="submit" class="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.add('opacity-100');
                    document.getElementById('edit-manual-content').classList.remove('scale-95');
                    document.getElementById('edit-manual-content').classList.add('scale-100');
                }, 10);
                app.refreshIcons();
            };

window.app.saveEditedManualDelivery = async (e, id) => {
                e.preventDefault();
                const idx = DB.sales.findIndex(s => s.id === id);
                if (idx > -1) {
                    const s = DB.sales[idx];
                    s.customer_id = document.getElementById('em-customer-id').value;
                    s.customer_name = document.getElementById('em-customer-name').value;
                    s.chassis_no = document.getElementById('em-chassis').value;
                    s.brand = document.getElementById('em-brand').value;
                    s.model = document.getElementById('em-model').value;
                    let editUnits = Math.abs(parseInt(document.getElementById('em-units')?.value) || 1);
                    if (s.sale_type === 'Credit Note') {
                        editUnits = -editUnits;
                    }
                    s.unit_qty = editUnits;
                    s.sale_type = document.getElementById('em-type').value;
                    s.purpose_of_use = document.getElementById('em-purpose').value;
                    s.district = document.getElementById('em-district').value;
                    s.upazila = document.getElementById('em-upazila').value;
                    s.territory_id = document.getElementById('em-territory').value;
                    s.fy = document.getElementById('em-fy').value;
                    s.sales_month = document.getElementById('em-sales-month').value;
                    s.old_customer_id = document.getElementById('em-old-customer-id').value;
                    s.admin_comments = document.getElementById('em-comments').value;
                    
                    if (!s.financials) s.financials = {};
                    s.financials.tp = document.getElementById('em-tp').value;
                    s.financials.dp = document.getElementById('em-dp').value;
                    s.financials.tenure = document.getElementById('em-tenure').value;
                    
                    if (!s.discounts) s.discounts = { type: 'Cash', amount: 0, gift: '' };
                    s.discounts.amount = document.getElementById('em-disc-amt').value;
                    
                    if (app.neonSQL) {
                        try {
                            await app.neonSQL`UPDATE sales SET customer_id = ${s.customer_id}, customer_name = ${s.customer_name}, chassis_no = ${s.chassis_no}, brand = ${s.brand}, model = ${s.model}, unit_qty = ${s.unit_qty}, sale_type = ${s.sale_type}, purpose_of_use = ${s.purpose_of_use}, district = ${s.district}, upazila = ${s.upazila}, territory_id = ${s.territory_id}, fy = ${s.fy}, sales_month = ${s.sales_month}, old_customer_id = ${s.old_customer_id}, admin_comments = ${s.admin_comments}, financials = ${JSON.stringify(s.financials)}, discounts = ${JSON.stringify(s.discounts)} WHERE id = ${id}`;
                        } catch (err) {
                            console.error("Failed to update manual delivery in database", err);
                            app.showToast('Database update failed', 'error');
                            return;
                        }
                    }

                    app.showToast('Delivery updated successfully.', 'success');
                    app.closeEditManualDeliveryModal();
                    app.renderAdminManualDeliveries();
                }
            };

