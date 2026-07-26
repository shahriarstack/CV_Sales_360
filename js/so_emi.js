// --- Sales360 Module: so_emi.js ---
window.app = window.app || {};

window.app.renderSOFirstTwoEMI = () => {
                const soTerritories = app.currentUser.territories;
                // Filter only 1st and 2nd installments
                const targetEMI = DB.emi.filter(e => soTerritories.includes(e.territory_id) && (e.installment_no === 1 || e.installment_no === 2));

                const html = `
                    <div class="pb-6 fade-in">
                        <div class="mb-5">
                            <h2 class="text-xl font-bold text-slate-800">1st & 2nd EMI Data</h2>
                            <p class="text-xs text-slate-500">Early installment tracking to prevent default</p>
                        </div>

                        <!-- Summary Cards -->
                        <div class="grid grid-cols-2 gap-3 mb-5">
                            <div class="bg-indigo-50 border border-indigo-100 p-3 rounded-xl shadow-sm text-center relative overflow-hidden">
                                <div class="absolute -right-2 -top-2 opacity-10"><i data-lucide="alert-circle" class="w-12 h-12 text-indigo-700"></i></div>
                                <p class="text-[10px] text-indigo-500 font-bold uppercase mb-1">1st Inst. Pending</p>
                                <h3 class="text-2xl font-bold text-indigo-700">${targetEMI.filter(e => e.installment_no === 1).length}</h3>
                            </div>
                            <div class="bg-purple-50 border border-purple-100 p-3 rounded-xl shadow-sm text-center relative overflow-hidden">
                                <div class="absolute -right-2 -top-2 opacity-10"><i data-lucide="alert-triangle" class="w-12 h-12 text-purple-700"></i></div>
                                <p class="text-[10px] text-purple-500 font-bold uppercase mb-1">2nd Inst. Pending</p>
                                <h3 class="text-2xl font-bold text-purple-700">${targetEMI.filter(e => e.installment_no === 2).length}</h3>
                            </div>
                        </div>

                        <!-- List -->
                        <div class="space-y-3">
                            ${targetEMI.map(e => {
                    const themeClasses = e.installment_no === 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700';
                    return `
                                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <div class="flex items-center gap-2">
                                                <span class="${themeClasses} text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                    Inst. #${e.installment_no}
                                                </span>
                                                <h4 class="font-bold text-slate-800 text-sm">${e.customer}</h4>
                                            </div>
                                            <p class="text-[10px] text-slate-500 mt-1"><i data-lucide="phone" class="w-3 h-3 inline"></i> ${e.phone} | ${e.location}</p>
                                        </div>
                                    </div>
                                    
                                    <!-- Creative Dates Section -->
                                    <div class="grid grid-cols-2 gap-3 my-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px]">
                                        <div>
                                            <p class="text-[8px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-0.5">
                                                <i data-lucide="truck" class="w-3 h-3 text-slate-400"></i> Delivery Date
                                            </p>
                                            <p class="font-semibold text-slate-700">${app.formatDateCreative(e.delivery_date)}</p>
                                        </div>
                                        <div>
                                            <p class="text-[8px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-0.5">
                                                <i data-lucide="calendar" class="w-3 h-3 text-slate-400"></i> 1st Installment
                                            </p>
                                            <p class="font-semibold text-slate-700">${app.formatDateCreative(e.first_inst_date)}</p>
                                        </div>
                                    </div>

                                    <div class="flex justify-between items-end mt-3 pt-3 border-t border-slate-100">
                                        <div>
                                            <p class="text-[10px] text-slate-400 uppercase">Amount Due</p>
                                            <p class="text-sm font-bold text-red-600">${app.formatCurrency(e.installment)}</p>
                                        </div>
                                        <button onclick="app.showToast('Call initiated to ${e.customer}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                                            <i data-lucide="phone-call" class="w-3 h-3"></i> Call
                                        </button>
                                    </div>
                                </div>
                            `}).join('')}
                            ${targetEMI.length === 0 ? '<div class="text-center text-slate-500 py-10">No 1st or 2nd installments pending! Excellent job.</div>' : ''}
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.updateSOBadge = () => {
                if (app.currentUser.role !== 'so') return;
                const soEmi = DB.emi.filter(e => app.currentUser.territories.includes(e.territory_id));
                const overdueCount = soEmi.filter(e => e.installment > 0 && Number(e.collected || 0) <= 0).length;
                
                const badge = document.getElementById('so-overdue-badge');
                if (badge) {
                    badge.innerText = overdueCount;
                    badge.style.display = overdueCount > 0 ? 'block' : 'none';
                }
            };

window.app.renderSOEMI = () => {
                const soTerritories = app.currentUser.territories;
                const soEmi = DB.emi.filter(e => soTerritories.includes(e.territory_id));

                const totalInstallment = soEmi.reduce((sum, e) => sum + Number(e.installment || 0), 0);
                const totalCollected = soEmi.reduce((sum, e) => sum + Number(e.collected || 0), 0);
                const remaining = Math.max(0, totalInstallment - totalCollected);
                const advance = Math.max(0, totalCollected - totalInstallment);
                const colPercent = totalInstallment > 0 ? Math.round((totalCollected / totalInstallment) * 100) : 0;

                const totalCustomers = soEmi.length;
                // Partial payments are counted as Paid Count!
                const paidCustomers = soEmi.filter(e => Number(e.collected || 0) > 0).length;
                const fullyPaidCustomers = soEmi.filter(e => {
                    const col = Number(e.collected || 0);
                    const inst = Number(e.installment || 0);
                    const overdue = Number(e.overdue_total || 0);
                    const due = inst + overdue;
                    const target = due > 0 ? due : inst;
                    return target > 0 ? col >= target : col >= inst;
                }).length;

                const partialCustomers = soEmi.filter(e => {
                    const col = Number(e.collected || 0);
                    const inst = Number(e.installment || 0);
                    const overdue = Number(e.overdue_total || 0);
                    const due = inst + overdue;
                    const target = due > 0 ? due : inst;
                    return col > 0 && col < target;
                }).length;

                const unpaidCustomers = soEmi.filter(e => Number(e.collected || 0) <= 0).length;

                // Preserve search and filter states
                const searchQuery = document.getElementById('emi-search')?.value || '';
                const filterStatus = document.getElementById('emi-status-filter')?.value || 'all';

                const html = `
                    <div class="pb-6 fade-in">
                        <div class="mb-4">
                            <h2 class="text-xl font-bold text-slate-800">EMI Collection</h2>
                            <p class="text-xs text-slate-500">Manage overdue accounts & early installments</p>
                        </div>

                        <!-- Sticky Summary Card -->
                        <div class="sticky top-0 z-20 bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-4">
                            <div class="flex justify-between items-center mb-3">
                                <div>
                                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Installment</p>
                                    <h3 class="text-xl font-bold text-red-600">${app.formatCurrency(totalInstallment)}</h3>
                                </div>
                                <div class="text-right">
                                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Collected</p>
                                    <h3 class="text-xl font-bold text-green-600">${app.formatCurrency(totalCollected)}</h3>
                                </div>
                            </div>
                            
                            <div class="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                                <div class="bg-green-500 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(colPercent, 100)}%"></div>
                            </div>
                            
                            <div class="flex justify-between text-xs font-medium">
                                <span class="text-slate-500">${advance > 0 ? 'Advance' : 'Remaining'}: <span class="${advance > 0 ? 'text-green-600' : 'text-slate-800'} font-bold">${app.formatCurrency(advance > 0 ? advance : remaining)}</span></span>
                                <span class="text-aci-blue bg-blue-50 px-2 py-0.5 rounded">${colPercent}% Achieved</span>
                            </div>
                        </div>

                        <!-- Customer Status Summary Cards (3 Cards) -->
                        <div class="grid grid-cols-3 gap-3 mb-5">
                            <!-- 1. Total Customers -->
                            <div class="bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100 p-3 rounded-2xl shadow-sm text-center relative overflow-hidden group hover:shadow-md transition-all">
                                <div class="absolute -right-3 -top-3 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                                    <i data-lucide="users" class="w-16 h-16 text-blue-600"></i>
                                </div>
                                <p class="text-[9px] text-blue-600 font-bold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                                    <i data-lucide="users" class="w-3 h-3 text-blue-500"></i> Total Customers
                                </p>
                                <h3 class="text-2xl font-black text-blue-700">${totalCustomers}</h3>
                                <p class="text-[9px] text-slate-400 font-medium mt-0.5">Total Accounts</p>
                            </div>

                            <!-- 2. Paid Customers (Full + Partial) -->
                            <div class="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50/30 border border-emerald-200/80 p-3 rounded-2xl shadow-sm text-center relative overflow-hidden group hover:shadow-md transition-all">
                                <div class="absolute -right-3 -top-3 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                                    <i data-lucide="check-circle-2" class="w-16 h-16 text-emerald-600"></i>
                                </div>
                                <p class="text-[9px] text-emerald-700 font-bold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                                    <i data-lucide="check-circle-2" class="w-3 h-3 text-emerald-600"></i> Paid
                                </p>
                                <h3 class="text-2xl font-black text-emerald-700">${paidCustomers}</h3>
                                <p class="text-[8px] text-emerald-600 font-bold mt-0.5">Full: ${fullyPaidCustomers} • Part: ${partialCustomers}</p>
                            </div>

                            <!-- 3. Unpaid -->
                            <div class="bg-gradient-to-br from-rose-50 to-red-50/40 border border-rose-100 p-3 rounded-2xl shadow-sm text-center relative overflow-hidden group hover:shadow-md transition-all">
                                <div class="absolute -right-3 -top-3 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                                    <i data-lucide="clock" class="w-16 h-16 text-rose-600"></i>
                                </div>
                                <p class="text-[9px] text-rose-600 font-bold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                                    <i data-lucide="clock" class="w-3 h-3 text-rose-500"></i> Unpaid
                                </p>
                                <h3 class="text-2xl font-black text-rose-700">${unpaidCustomers}</h3>
                                <p class="text-[9px] text-slate-400 font-medium mt-0.5">Pending Collection</p>
                            </div>
                        </div>

                        <!-- Search/Filter -->
                        <div class="flex gap-2 mb-5">
                            <div class="relative flex-1">
                                <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"></i>
                                <input type="text" id="emi-search" placeholder="Search customer or code..." class="w-full bg-white border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-aci-blue shadow-sm" onkeyup="app.filterEMI()" value="${searchQuery}">
                            </div>
                            <select id="emi-status-filter" onchange="app.filterEMI()" class="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-aci-blue shadow-sm text-slate-700 cursor-pointer">
                                <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Status (${totalCustomers})</option>
                                <option value="paid_all" ${filterStatus === 'paid_all' ? 'selected' : ''}>Paid Customers (${paidCustomers})</option>
                                <option value="paid" ${filterStatus === 'paid' ? 'selected' : ''}>Fully Paid (${fullyPaidCustomers})</option>
                                <option value="partial" ${filterStatus === 'partial' ? 'selected' : ''}>Partial Payment (${partialCustomers})</option>
                                <option value="unpaid" ${filterStatus === 'unpaid' ? 'selected' : ''}>Unpaid (${unpaidCustomers})</option>
                            </select>
                        </div>

                        <!-- Customer Cards -->
                        <div class="space-y-3" id="emi-list">
                            ${soEmi.map((e, index) => app.generateEMICardHTML(e, index + 1)).join('')}
                            ${soEmi.length === 0 ? '<div class="text-center text-slate-500 text-sm py-10">No overdue accounts found.</div>' : ''}
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();

                // Re-apply searches and filters instantly
                if (searchQuery || filterStatus !== 'all') {
                    app.filterEMI();
                }
            };

window.app.getInstallmentNo = (firstInstDate) => {
                if (!firstInstDate || firstInstDate === '0000-00-00') return 1;
                try {
                    const normalized = app.normalizeDate(firstInstDate);
                    const firstDate = new Date(normalized);
                    if (isNaN(firstDate.getTime())) return 1;

                    const now = new Date();
                    const monthsElapsed =
                        (now.getFullYear() - firstDate.getFullYear()) * 12 +
                        (now.getMonth() - firstDate.getMonth());

                    const instNo = monthsElapsed >= 1 ? monthsElapsed + 1 : 1;
                    return Math.max(1, instNo);
                } catch(err) {
                    return 1;
                }
            };

window.app.generateEMICardHTML = (e, serial) => {
                const collected = parseFloat(e.collected) || 0;
                const installment = parseFloat(e.installment) || 0;
                const overdue_total = parseFloat(e.overdue_total) || 0;

                const hasOverdue = overdue_total > 0;
                const totalDue = installment + overdue_total;
                const targetAmount = totalDue > 0 ? totalDue : installment;
                
                const isFullyCleared = collected >= targetAmount && targetAmount > 0;
                const isPartialPayment = collected > 0 && !isFullyCleared;
                const isUnpaid = collected <= 0;

                const cardStatus = isFullyCleared ? 'paid' : (isPartialPayment ? 'partial' : 'unpaid');
                const progressPct = targetAmount > 0 ? Math.min(Math.round((collected / targetAmount) * 100), 100) : 0;

                // Dynamically compute installment number based on first_inst_date
                const instNo = app.getInstallmentNo(e.first_inst_date);

                let instBadgeColor = '';
                if (instNo === 1) instBadgeColor = 'bg-indigo-100 text-indigo-700 border-indigo-200';
                else if (instNo === 2) instBadgeColor = 'bg-purple-100 text-purple-700 border-purple-200';
                else if (instNo === 3) instBadgeColor = 'bg-amber-100 text-amber-700 border-amber-200';
                else instBadgeColor = 'bg-red-100 text-red-700 border-red-200';

                const instBadge = `<span class="${instBadgeColor} text-[8px] font-bold px-1 py-0.5 rounded ml-1.5 border">Inst. #${instNo}</span>`;

                // Creative Styling variations
                let cardStyle = 'border-slate-200/80 bg-white';
                let topAccentBar = '';
                let statusBadge = '';

                if (isFullyCleared) {
                    cardStyle = 'border-emerald-300 bg-emerald-50/20';
                    statusBadge = '<span class="bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[8px] font-bold ml-1.5 flex items-center gap-0.5"><i data-lucide="check-circle-2" class="w-2.5 h-2.5"></i> Paid</span>';
                } else if (isPartialPayment) {
                    cardStyle = 'border-slate-200/80 bg-white';
                    topAccentBar = '';
                    statusBadge = '<span class="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[8px] font-bold ml-1.5 flex items-center gap-0.5"><i data-lucide="pie-chart" class="w-2.5 h-2.5"></i> Partial (' + progressPct + '%)</span>';
                } else {
                    statusBadge = '<span class="bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded text-[8px] font-bold ml-1.5 flex items-center gap-0.5"><i data-lucide="clock" class="w-2.5 h-2.5"></i> Unpaid</span>';
                }

                return `
                    <div class="emi-card relative ${cardStyle} p-3.5 rounded-2xl shadow-sm transition-all overflow-hidden" data-customer="${e.customer.toLowerCase()}" data-code="${(e.customer_code || '').toLowerCase()}" data-status="${cardStatus}">
                        ${topAccentBar}
                        
                        <!-- Watermark -->
                        ${isFullyCleared ? '<div class="absolute -right-4 -top-4 opacity-5 pointer-events-none"><i data-lucide="check-circle" class="w-24 h-24 text-emerald-600"></i></div>' : ''}
                        ${isPartialPayment ? '<div class="absolute -right-4 -top-4 opacity-[0.07] pointer-events-none"><i data-lucide="pie-chart" class="w-24 h-24 text-amber-600"></i></div>' : ''}

                        <div class="flex justify-between items-start mb-1 relative z-10 ${isPartialPayment ? 'mt-1' : ''}">
                            <div class="flex items-start gap-1.5">
                                <span class="text-xs font-bold text-slate-400 mt-0.5">${serial}.</span>
                                <div>
                                    <h4 class="font-bold text-slate-800 text-xs flex items-center flex-wrap gap-y-1">
                                        ${e.customer}
                                        ${instBadge}
                                        ${statusBadge}
                                    </h4>
                                    <p class="text-xs font-semibold text-aci-blue mt-0">${e.customer_code || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-4 gap-2 mb-2 pb-2 border-b border-slate-100 mt-2 relative z-10 text-[10px]">
                            <div>
                                <p class="text-[8px] text-slate-400 uppercase font-bold">Delivery</p>
                                <p class="font-medium text-slate-700">${app.formatDateCreative(e.delivery_date)}</p>
                            </div>
                            <div>
                                <p class="text-[8px] text-slate-400 uppercase font-bold">1st Inst</p>
                                <p class="font-medium text-slate-700">${app.formatDateCreative(e.first_inst_date)}</p>
                            </div>
                            <div>
                                <p class="text-[8px] text-slate-400 uppercase font-bold">Brand</p>
                                <p class="font-semibold text-slate-700">${e.brand || 'N/A'}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[8px] text-slate-400 uppercase font-bold flex items-center justify-end gap-0.5">
                                    Overdue ${hasOverdue ? '<i data-lucide="alert-triangle" class="w-2.5 h-2.5 text-red-500"></i>' : ''}
                                </p>
                                <p class="font-bold ${hasOverdue ? 'text-red-600' : 'text-slate-700'}">${app.formatCurrency(overdue_total)}</p>
                            </div>
                        </div>



                        <div class="flex items-center justify-between gap-3 relative z-10">
                            <div>
                                <p class="text-[9px] text-slate-400 uppercase font-bold">Installment</p>
                                <div class="flex items-center gap-1 mt-0.5">
                                    <p class="text-xs font-bold ${isFullyCleared ? 'text-emerald-600' : (isPartialPayment ? 'text-amber-800 font-extrabold' : 'text-slate-800')}" >${app.formatCurrency(installment)}</p>
                                    ${isFullyCleared ? '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-500 drop-shadow-sm"></i>' : ''}
                                </div>
                            </div>
                            
                            <div class="flex-1 flex flex-col items-end gap-0.5">
                                <div class="text-[9px] text-slate-500 font-semibold uppercase flex flex-col items-end gap-0.5">
                                    <div class="flex items-center gap-1">
                                        Paid: <span class="${collected > 0 ? (isFullyCleared ? 'text-emerald-600 text-sm' : 'text-amber-700 text-sm') : 'text-slate-400 text-xs'} font-black">${app.formatCurrency(collected)}</span>
                                    </div>
                                    ${collected > targetAmount ? `<span class="bg-emerald-100 text-emerald-700 border border-emerald-200 px-1 py-0.5 rounded text-[8px] font-bold mt-0.5">Adv: ${app.formatCurrency(collected - targetAmount)}</span>` : ''}
                                </div>
                                <button onclick="app.openCollectEMIModal('${e.id}')"
                                        class="${isFullyCleared ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200' : (isPartialPayment ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md' : ((e.brand || '').toString().toLowerCase().includes('mahindra') ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-aci-blue hover:bg-blue-800 text-white'))} px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all shadow-sm flex items-center gap-1 mt-1">
                                    <i data-lucide="wallet" class="w-3.5 h-3.5"></i> ${isFullyCleared ? 'Details' : (isPartialPayment ? 'Add Collection' : 'Collect EMI')}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            };

window.app.filterEMI = () => {
                const query = (document.getElementById('emi-search')?.value || '').toLowerCase();
                const status = document.getElementById('emi-status-filter')?.value || 'all';

                document.querySelectorAll('.emi-card').forEach(card => {
                    const cust = card.dataset.customer || '';
                    const code = card.dataset.code || '';
                    const cardStatus = card.dataset.status || '';

                    const matchesSearch = cust.includes(query) || code.includes(query);
                    let matchesStatus = false;
                    if (status === 'all') {
                        matchesStatus = true;
                    } else if (status === 'paid_all') {
                        matchesStatus = cardStatus === 'paid' || cardStatus === 'partial';
                    } else {
                        matchesStatus = status === cardStatus;
                    }

                    if (matchesSearch && matchesStatus) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            };

window.app.openCollectEMIModal = (emiId) => {
                const emi = DB.emi.find(e => e.id === emiId);
                if (!emi) return;

                let modal = document.getElementById('collect-emi-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'collect-emi-modal';
                    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }

                const totalDue = emi.installment + emi.overdue_total;
                const isFullyCleared = emi.collected >= totalDue && totalDue > 0;

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick="app.closeCollectEMIModal()"></div>
                    <div class="bg-white rounded-2xl p-6 w-full max-w-sm m-4 relative z-10 shadow-2xl border border-slate-100 transform transition-all scale-100">
                        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 class="font-extrabold text-slate-800 text-sm">EMI Collection</h3>
                                <p class="text-[10px] text-slate-400 font-bold mt-0.5">${emi.customer_code} • ${emi.customer}</p>
                            </div>
                            <button onclick="app.closeCollectEMIModal()" class="text-slate-400 hover:text-red-500 p-1.5 transition-colors">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>

                        <div class="space-y-3 mb-5">
                            <div class="flex justify-between text-xs py-1 border-b border-slate-50">
                                <span class="text-slate-400">Installment Amount:</span>
                                <span class="font-extrabold text-slate-800">${app.formatCurrency(emi.installment)}</span>
                            </div>
                            <div class="flex justify-between text-xs py-1 border-b border-slate-50">
                                <span class="text-slate-400">Total Overdue:</span>
                                <span class="font-extrabold ${emi.overdue_total > 0 ? 'text-red-600' : 'text-slate-800'}">${app.formatCurrency(emi.overdue_total)}</span>
                            </div>
                            <div class="flex justify-between text-xs py-1 border-b border-slate-50">
                                <span class="text-slate-400">Total Outstanding Due:</span>
                                <span class="font-black text-slate-900">${app.formatCurrency(totalDue)}</span>
                            </div>
                            <div class="flex justify-between text-xs py-1 border-b border-slate-50">
                                <span class="text-slate-400">Total Already Collected:</span>
                                <span class="font-black text-green-600">${app.formatCurrency(emi.collected)}</span>
                            </div>
                        </div>

                        ${isFullyCleared ? `
                            <div class="bg-green-50 border border-green-100 rounded-xl p-3.5 text-center text-xs text-green-800 font-bold mb-4 flex flex-col items-center gap-1.5 shadow-sm">
                                <i data-lucide="check-circle" class="w-8 h-8 text-green-500"></i>
                                This account has been fully paid! No further collection is required.
                            </div>
                            <button onclick="app.closeCollectEMIModal()" class="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors">Close</button>
                        ` : `
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Enter Collection Amount (৳)</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-bold">৳</span>
                                        <input type="number" id="emi-collect-amount" class="w-full bg-white border border-slate-300 focus:border-aci-blue text-sm font-extrabold text-slate-800 rounded-xl pl-8 pr-4 py-2.5 focus:outline-none transition-colors text-right shadow-sm" placeholder="Enter amount to add">
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="app.closeCollectEMIModal()" class="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs transition-colors">Cancel</button>
                                    <button onclick="app.submitEMICollection('${emi.id}')" class="flex-1 py-3 rounded-xl bg-aci-blue hover:bg-blue-800 text-white font-extrabold text-xs transition-colors shadow-md">Submit Collection</button>
                                </div>
                            </div>
                        `}
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.classList.add('flex');
                app.refreshIcons();

                setTimeout(() => {
                    const input = document.getElementById('emi-collect-amount');
                    if (input) input.focus();
                }, 100);
            };

window.app.closeCollectEMIModal = () => {
                const modal = document.getElementById('collect-emi-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
            };

window.app.submitEMICollection = async (emiId) => {
                const inputEl = document.getElementById('emi-collect-amount');
                const amount = inputEl ? inputEl.value : 0;
                const val = parseFloat(amount) || 0;

                if (val <= 0) {
                    app.showToast('Please enter a valid amount to add.', 'error');
                    return;
                }

                const emiRecord = DB.emi.find(e => e.id === emiId);
                if (emiRecord) {
                    const currentCollected = parseFloat(emiRecord.collected) || 0;
                    emiRecord.collected = currentCollected + val; // Add the new amount mathematically
                    
                    if (app.neonSQL) {
                        try {
                            await app.neonSQL`UPDATE emi SET collected = ${emiRecord.collected} WHERE id = ${emiId}`;
                        } catch (dbErr) {
                            console.error('Failed to persist collection update to Postgres:', dbErr);
                        }
                    }

                    app.showToast(`Successfully added ${app.formatCurrency(val)} to collection.`, 'success');
                    app.closeCollectEMIModal();
                    app.renderSOEMI(); // Re-render instantly, preserving filter/search states
                    app.updateSOBadge();
                }
            };

window.app.openEditAdminEMIModal = (emiId) => {
                const emi = DB.emi.find(e => e.id === emiId);
                if (!emi) return;

                let modal = document.getElementById('edit-admin-emi-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'edit-admin-emi-modal';
                    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }

                // Get list of territories for the dropdown
                const territoryOptions = DB.territories.map(t => 
                    `<option value="${t.id}" ${t.id === emi.territory_id ? 'selected' : ''}>${t.name}</option>`
                ).join('');

                // Initial collection rate calculation
                const totalDue = Number(emi.installment || 0) + Number(emi.overdue_total || 0);
                const rate = totalDue > 0 ? Math.round((Number(emi.collected || 0) / totalDue) * 100) : 0;

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onclick="app.closeEditAdminEMIModal()"></div>
                    <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-6 w-full max-w-lg m-4 relative z-10 shadow-2xl border border-white/60 transform transition-all scale-100 flex flex-col max-h-[90vh]">
                        
                        <!-- Header -->
                        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <span class="bg-indigo-500/10 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-500/20">
                                    Account Configuration
                                </span>
                                <h3 class="font-black text-slate-800 text-base mt-1">Edit EMI Account Details</h3>
                            </div>
                            <button onclick="app.closeEditAdminEMIModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        </div>

                        <div class="overflow-y-auto pr-1 flex-1 custom-scrollbar space-y-4">
                            <!-- Info Bar -->
                            <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 flex justify-between items-center relative overflow-hidden shadow-md">
                                <div class="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl -mr-6 -mt-6"></div>
                                <div class="relative z-10">
                                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customer Details</div>
                                    <div class="font-black text-sm mt-0.5" id="lbl-cust-name">${emi.customer}</div>
                                    <div class="text-[10px] text-indigo-300 font-mono font-bold mt-0.5">CODE: ${emi.customer_code || 'N/A'}</div>
                                </div>
                                <div class="text-right relative z-10">
                                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Model Info</div>
                                    <div class="font-extrabold text-xs text-indigo-200 mt-0.5">${emi.brand} ${emi.model || ''}</div>
                                    <div class="text-[9px] text-emerald-400 font-bold mt-0.5">Inst. #${emi.installment_no || 1}</div>
                                </div>
                            </div>

                            <form id="edit-emi-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="md:col-span-2">
                                    <label class="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Customer Name</label>
                                    <input type="text" id="emi-edit-customer" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-sm" value="${emi.customer || ''}">
                                </div>

                                <div>
                                    <label class="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Customer Code</label>
                                    <input type="text" id="emi-edit-code" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-mono font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-sm" value="${emi.customer_code || ''}">
                                </div>

                                <div>
                                    <label class="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Phone Number</label>
                                    <input type="text" id="emi-edit-phone" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-sm" value="${emi.phone || ''}">
                                </div>

                                <div>
                                    <label class="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Location</label>
                                    <input type="text" id="emi-edit-location" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-sm" value="${emi.location || ''}">
                                </div>

                                <div>
                                    <label class="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Territory</label>
                                    <select id="emi-edit-territory" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-sm cursor-pointer">
                                        ${territoryOptions}
                                    </select>
                                </div>

                                <div class="border-t border-slate-100 pt-3 md:col-span-2 mt-2">
                                    <h4 class="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5"><i data-lucide="wallet" class="w-3.5 h-3.5 text-indigo-500"></i> Financial Breakdown</h4>
                                </div>

                                <div>
                                    <label class="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Installment Amount (৳)</label>
                                    <input type="number" id="emi-edit-installment" oninput="app.recalculateLiveEMIProgress()" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-extrabold text-slate-800 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-sm" value="${emi.installment || 0}">
                                </div>

                                <div>
                                    <label class="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Overdue Amount (৳)</label>
                                    <input type="number" id="emi-edit-overdue" oninput="app.recalculateLiveEMIProgress()" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-extrabold text-slate-800 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-sm" value="${emi.overdue_total || 0}">
                                </div>

                                <div class="md:col-span-2">
                                    <label class="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Collected Amount (৳)</label>
                                    <input type="number" id="emi-edit-collected" oninput="app.recalculateLiveEMIProgress()" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-extrabold text-slate-800 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-sm" value="${emi.collected || 0}">
                                </div>
                            </form>

                            <!-- Live Visual Progress Calculator -->
                            <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2">
                                <div class="flex justify-between items-center mb-2">
                                    <div class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Live Recovery Rate</div>
                                    <div class="text-right">
                                        <span id="emi-live-rate-badge" class="px-2 py-0.5 rounded text-[9px] font-black transition-all">
                                            ${rate}%
                                        </span>
                                    </div>
                                </div>
                                <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner relative">
                                    <div id="emi-live-progress-bar" class="h-full rounded-full transition-all duration-300 shadow bg-gradient-to-r" style="width: ${Math.min(rate, 100)}%;"></div>
                                </div>
                                <div class="flex justify-between text-[9px] text-slate-400 font-bold mt-1.5">
                                    <span>Collected: <b class="text-green-600 font-extrabold" id="emi-live-collected-lbl">${app.formatCurrency(emi.collected || 0)}</b></span>
                                    <span>Total Due: <b class="text-slate-700 font-extrabold" id="emi-live-due-lbl">${app.formatCurrency(totalDue)}</b></span>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Actions -->
                        <div class="flex gap-3 mt-5 pt-3 border-t border-slate-100">
                            <button onclick="app.closeEditAdminEMIModal()" class="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i> Cancel
                            </button>
                            <button onclick="app.saveAdminEMI('${emi.id}')" class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold text-xs hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-md">
                                <i data-lucide="check" class="w-3.5 h-3.5"></i> Save Changes
                            </button>
                        </div>
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.classList.add('flex');
                
                // Colorize the live rate badge on load
                app.recalculateLiveEMIProgress();
                app.refreshIcons();
            };

window.app.closeEditAdminEMIModal = () => {
                const modal = document.getElementById('edit-admin-emi-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
            };

window.app.recalculateLiveEMIProgress = () => {
                const instVal = parseFloat(document.getElementById('emi-edit-installment').value) || 0;
                const overdueVal = parseFloat(document.getElementById('emi-edit-overdue').value) || 0;
                const colVal = parseFloat(document.getElementById('emi-edit-collected').value) || 0;
                const custName = document.getElementById('emi-edit-customer').value;

                if (document.getElementById('lbl-cust-name') && custName) {
                    document.getElementById('lbl-cust-name').innerText = custName;
                }

                const totalDue = instVal + overdueVal;
                const rate = totalDue > 0 ? Math.round((colVal / totalDue) * 100) : 0;

                // Update labels
                document.getElementById('emi-live-collected-lbl').innerText = app.formatCurrency(colVal);
                document.getElementById('emi-live-due-lbl').innerText = app.formatCurrency(totalDue);
                
                // Update progress bar width
                const bar = document.getElementById('emi-live-progress-bar');
                if (bar) {
                    bar.style.width = `${Math.min(rate, 100)}%`;
                    // Visual color gradient updates
                    bar.className = 'h-full rounded-full transition-all duration-300 shadow';
                    if (rate >= 100) {
                        bar.classList.add('bg-gradient-to-r', 'from-emerald-500', 'to-teal-500');
                    } else if (rate >= 80) {
                        bar.classList.add('bg-gradient-to-r', 'from-lime-500', 'to-emerald-500');
                    } else if (rate >= 60) {
                        bar.classList.add('bg-gradient-to-r', 'from-amber-500', 'to-orange-500');
                    } else {
                        bar.classList.add('bg-gradient-to-r', 'from-rose-500', 'to-red-500');
                    }
                }

                // Update badge classes
                const badge = document.getElementById('emi-live-rate-badge');
                if (badge) {
                    badge.innerText = `${rate}% Recovery`;
                    badge.className = 'px-2 py-0.5 rounded text-[9px] font-black transition-all';
                    if (rate >= 100) {
                        badge.classList.add('bg-emerald-100', 'text-emerald-700', 'border', 'border-emerald-200');
                    } else if (rate >= 80) {
                        badge.classList.add('bg-lime-100', 'text-lime-700', 'border', 'border-lime-200');
                    } else if (rate >= 60) {
                        badge.classList.add('bg-amber-100', 'text-amber-700', 'border', 'border-amber-200');
                    } else {
                        badge.classList.add('bg-rose-100', 'text-rose-700', 'border', 'border-rose-200');
                    }
                }
            };

window.app.saveAdminEMI = async (emiId) => {
                const customer = document.getElementById('emi-edit-customer').value.trim();
                const code = document.getElementById('emi-edit-code').value.trim();
                const phone = document.getElementById('emi-edit-phone').value.trim();
                const location = document.getElementById('emi-edit-location').value.trim();
                const territoryId = document.getElementById('emi-edit-territory').value;
                const installment = parseFloat(document.getElementById('emi-edit-installment').value) || 0;
                const overdue = parseFloat(document.getElementById('emi-edit-overdue').value) || 0;
                const collected = parseFloat(document.getElementById('emi-edit-collected').value) || 0;

                if (!customer) {
                    app.showToast('Customer Name cannot be empty.', 'error');
                    return;
                }

                app.showLoader('Saving customer details...');
                try {
                    const emiRecord = DB.emi.find(e => e.id === emiId);
                    if (!emiRecord) {
                        app.showToast('EMI record not found.', 'error');
                        return;
                    }

                    // Update local DB safely
                    emiRecord.customer = customer;
                    emiRecord.customer_code = code;
                    emiRecord.phone = phone;
                    emiRecord.location = location;
                    emiRecord.territory_id = territoryId;
                    emiRecord.installment = installment;
                    emiRecord.overdue_total = overdue;
                    emiRecord.collected = collected;

                    // Update SQL Database if active
                    if (app.neonSQL) {
                        await app.neonSQL`UPDATE emi SET 
                            customer = ${customer}, 
                            customer_code = ${code}, 
                            phone = ${phone}, 
                            location = ${location}, 
                            territory_id = ${territoryId}, 
                            installment = ${installment}, 
                            overdue_total = ${overdue}, 
                            collected = ${collected}
                        WHERE id = ${emiId}`;
                    }

                    app.showToast('Account details saved successfully.', 'success');
                    app.closeEditAdminEMIModal();
                    
                    // Re-render
                    app.renderAdminEMI();
                } catch (err) {
                    console.error('Failed to save EMI updates:', err);
                    app.showToast('Failed to save updates to the database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

