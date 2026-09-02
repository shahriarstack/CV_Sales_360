// --- Sales360 Module: so_dashboard.js ---
window.app = window.app || {};

window.app.navigateSO = (view) => {
                localStorage.setItem('aci_last_page', view);
                localStorage.setItem('aci_last_role', 'so');
                app.currentSOView = view;
                // Update Nav UI
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('text-aci-blue');
                    btn.classList.add('text-slate-400');
                    if (btn.dataset.target === view) {
                        btn.classList.add('text-aci-blue');
                        btn.classList.remove('text-slate-400');
                    }
                });

                if (view === 'dashboard') app.renderSODashboard();
                else if (view === 'pulse') app.renderSOPulseMatrix();
                else if (view === 'credit_note') app.renderSOCreditNotes();
                else if (view === 'emi') app.renderSOEMI();
                else if (view === 'profile') app.renderUserProfile();
                else if (view === 'tiv') app.renderTIVReporting();
                else if (view === 'incentive') app.renderIncentiveCalculation();
            };

window.app.renderSODashboard = () => {
                const brand = app.soBrandTab || 'Foton';
                const saleType = app.soSaleTypeTab || 'New Sale';
                const activeFY = app.currentFY;
                const concludingFY = app.getPreviousFY(activeFY);
                const defaultFY = (app.currentMonth === 'July' && app.fyReviewActive) ? concludingFY : activeFY;
                const currentFY = app.soSelectedFY || defaultFY; // Use dynamic current active FY
                const isTransitionMode = (app.currentMonth === 'July' && app.fyReviewActive && currentFY === concludingFY) || app.showLastFYData;
                const splyFY = app.getPreviousFY(currentFY);
                const targetFY = isTransitionMode ? concludingFY : currentFY;
                const terrId = app.currentUser.territories[0]; // Assuming 1 primary territory for demo
                const territory = DB.territories.find(t => t.id === terrId);

                // Define Context
                const currentMonth = app.currentMonth;

                // --- 1. Filter Sales Data (Filtered by Brand AND Sale Type) ---
                const brandSales = DB.sales.filter(s => s.territory_id === terrId && s.brand === brand && s.sale_type === saleType);

                // Current Month Sales
                const currentSalesRecords = brandSales.filter(s => s.sales_month === currentMonth && s.fy === currentFY);
                const currentSalesUnits = currentSalesRecords.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                // YTD Sales (Assuming YTD is all sales in FY)
                const ytdSalesRecords = brandSales.filter(s => s.fy === targetFY);
                const ytdSalesUnits = ytdSalesRecords.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                // --- 2. Filter Targets (Yearly) & Projections (Monthly) ---
                const yearlyTargets = DB.targets.filter(t => t.territory_id === terrId && t.brand === brand && t.fy === targetFY && t.sale_type === saleType);
                const totalYearlyTarget = yearlyTargets.reduce((sum, t) => sum + Number(t.target_qty || 0), 0);
                const monthlyBudgetTgts = yearlyTargets.filter(t => t.month === currentMonth);
                const monthlyBudget = monthlyBudgetTgts.length > 0 ? monthlyBudgetTgts.reduce((sum, t) => sum + Number(t.target_qty || 0), 0) : Math.round(totalYearlyTarget / 12); // Use monthly or derived budget

                const monthlyProjections = DB.projections.filter(p => p.territory_id === terrId && p.brand === brand && p.month === currentMonth && p.fy === currentFY && p.sale_type === saleType);
                const totalMonthlyProjection = monthlyProjections.reduce((sum, p) => sum + Number(p.projection_qty || 0), 0);

                // --- 3. Dynamic Performance Sync ---
                const perf = app.getPerformance(terrId, brand, saleType);
                const mockSply = perf.lastMonth; // Use real calculated last month data
                const ytdSply = perf.ytd.sply;
                const currentSply = DB.sales.filter(s => s.territory_id === terrId && s.brand === brand && s.sale_type === saleType && s.sales_month === currentMonth && s.fy === splyFY).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                // Helpers
                const ach = (s, b) => b > 0 ? Math.round((s / b) * 100) : 0;
                const grw = (s, sp) => sp > 0 ? Math.round(((s - sp) / sp) * 100) : 0;
                const formatGrw = (g) => g > 0 ? `<span class="text-green-500 font-bold">+${g}%</span>` : (g < 0 ? `<span class="text-red-500 font-bold">${g}%</span>` : `<span class="text-slate-500 font-bold">0%</span>`);

                // --- 4. Upazila Wise Aggregation (YTD / This FY) ---
                const upaSelectedMonth = app.soUpazilaMonthFilter || 'All'; 
                const upaStats = {};
                territory.upazilas.forEach(u => {
                    upaStats[u] = { ytdSales: 0, filteredMonthSales: 0, lastFYSales: 0, lastFYSameMonthSales: 0 };
                });

                // Calculate cumulative YTD sales
                ytdSalesRecords.forEach(s => {
                    if (upaStats[s.upazila]) {
                        upaStats[s.upazila].ytdSales += Number(s.unit_qty || 0);
                    }
                });

                // Calculate last fiscal year sales (FY 2024-25 / splyFY)
                const lastFYSalesRecords = brandSales.filter(s => s.fy === splyFY);
                lastFYSalesRecords.forEach(s => {
                    if (upaStats[s.upazila]) {
                        upaStats[s.upazila].lastFYSales += Number(s.unit_qty || 0);
                        if (s.sales_month === upaSelectedMonth) {
                            upaStats[s.upazila].lastFYSameMonthSales += Number(s.unit_qty || 0);
                        }
                    }
                });

                // Calculate filtered month sales (Only for specific months)
                ytdSalesRecords.forEach(s => {
                    if (upaStats[s.upazila]) {
                        if (s.sales_month === upaSelectedMonth) {
                            upaStats[s.upazila].filteredMonthSales += Number(s.unit_qty || 0);
                        }
                    }
                });

                // Successful manual deliveries logged by this MO (always visible, not filtered by active brand/type tabs)
                const myManualDeliveries = [...DB.sales, ...(DB.historical_manual_sales || [])]
                    .filter(s => s.territory_id === terrId && s.is_manual)
                    .sort((a, b) => {
                        const tA = Number(a.id.replace('s_man_', '')) || 0;
                        const tB = Number(b.id.replace('s_man_', '')) || 0;
                        return tB - tA; // Newest first
                    });

                // --- 5. Selected Month Performance (For new dynamic table) ---
                const monthsList = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const ytdMonths = isTransitionMode ? ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'] : app.getYtdMonths(currentMonth);
                const passedMonths = ytdMonths.length;

                let ytdTargetTillLastMonth = 0;
                if (isTransitionMode) {
                    ytdTargetTillLastMonth = totalYearlyTarget;
                } else {
                    if (yearlyTargets.some(t => t.month)) {
                        ytdTargetTillLastMonth = yearlyTargets.filter(t => ytdMonths.includes(t.month)).reduce((sum, t) => sum + Number(t.target_qty || 0), 0);
                    } else {
                        ytdTargetTillLastMonth = Math.round((totalYearlyTarget / 12) * passedMonths);
                    }
                }

                const tillLastMonthSalesUnits = isTransitionMode ? ytdSalesUnits : brandSales.filter(s => s.fy === currentFY && ytdMonths.includes(s.sales_month)).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                const selMonth = app.soMonthTab || app.lastMonth;
                const selMonthSalesRecords = brandSales.filter(s => s.sales_month === selMonth && s.fy === currentFY);
                const selMonthSalesUnits = selMonthSalesRecords.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                // Exact SPLY calculation for the selected month using actual historical data
                const selMonthSply = DB.sales.filter(s => s.territory_id === terrId && s.brand === brand && s.sale_type === saleType && s.sales_month === selMonth && s.fy === '2024-25').reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                // Fetch Recovery OD Data (Territory specific, applies to all brands)
                const recoveryData = DB.recovery_od.find(r => r.territory_id === terrId && r.fy === currentFY && r.month === currentMonth) || { perfile_od: 0, total_overdue: 0 };

                // Calculate EMI collections for SO's territory
                const soEmi = DB.emi.filter(e => e.territory_id === terrId);
                const totalEmiInstallment = soEmi.reduce((sum, e) => sum + Number(e.installment || 0), 0);
                const totalEmiCollected = soEmi.reduce((sum, e) => sum + Number(e.collected || 0), 0);

                const totalEmiCust = soEmi.length;
                const paidEmiCust = soEmi.filter(e => Number(e.collected || 0) > 0).length; // Full Pay + Partial Pay
                const unpaidEmiCust = Math.max(0, totalEmiCust - paidEmiCust); // Total - (Full Pay + Partial Pay)

                // Calculate 1st & 2nd EMI details
                const soEmiFirstTwo = soEmi.filter(e => Number(e.installment_no) === 1 || Number(e.installment_no) === 2);
                const totalFirstTwoCust = soEmiFirstTwo.length;
                const paidFirstTwoCust = soEmiFirstTwo.filter(e => Number(e.collected || 0) > 0).length;
                const unpaidFirstTwoCust = Math.max(0, totalFirstTwoCust - paidFirstTwoCust); // Total - (Full Pay + Partial Pay)
                const totalFirstTwoInstallment = soEmiFirstTwo.reduce((sum, e) => sum + Number(e.installment || 0), 0);
                const totalFirstTwoCollected = soEmiFirstTwo.reduce((sum, e) => sum + Number(e.collected || 0), 0);

                const html = `
                    <div class="pb-4 fade-in">
                        ${app.getTransitionBannerHtml(currentFY)}
                        <div class="flex justify-between items-center mb-6">
                            <div class="flex items-baseline gap-1.5">
                                <p class="text-[11px] text-slate-400 font-medium uppercase tracking-tight">Hi,</p>
                                <h2 class="text-base font-bold text-slate-800 tracking-tight">${app.currentUser.name.replace(/\s*\(.*?\)\s*$/, '')}</h2>
                            </div>
                            <div class="bg-white/40 backdrop-blur-md border border-white/60 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                <div class="w-1.5 h-1.5 rounded-full bg-aci-blue animate-pulse"></div>
                                <span class="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">${territory.name || territory.id}</span>
                            </div>
                        </div>

                        <!-- Brand Toggle -->
                        <div class="flex bg-slate-100 border border-slate-200 p-1 rounded-lg mb-2">
                            <button onclick="app.soBrandTab='Foton'; app.renderSODashboard()" class="flex-1 py-2 rounded-md text-sm font-bold transition-all ${brand === 'Foton' ? 'bg-foton shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}">
                                <div class="flex items-center justify-center gap-2">
                                    <div class="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm p-0.5"><img src="https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png" class="h-full object-contain"></div>
                                    Foton
                                </div>
                            </button>
                            <button onclick="app.soBrandTab='Mahindra'; app.renderSODashboard()" class="flex-1 py-2 rounded-md text-sm font-bold transition-all ${brand === 'Mahindra' ? 'bg-mahindra shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}">
                                <div class="flex items-center justify-center gap-2">
                                    <div class="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm p-0.5"><img src="https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png" class="h-full object-contain"></div>
                                    Mahindra
                                </div>
                            </button>
                        </div>
                        
                        <!-- Sale Type Toggle (Compact Left-Aligned) -->
                        <div class="flex justify-start mb-4">
                            <div class="inline-flex bg-slate-200/60 p-1 rounded-full border border-slate-200 shadow-inner">
                                <button onclick="app.soSaleTypeTab='New Sale'; app.renderSODashboard()" class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${saleType === 'New Sale' ? 'bg-white shadow-sm text-aci-blue' : 'text-slate-500 hover:text-slate-800'}">
                                    <i data-lucide="tag" class="w-3 h-3 ${saleType === 'New Sale' ? 'text-aci-blue' : 'text-slate-400'}"></i> New Sale
                                </button>
                                <button onclick="app.soSaleTypeTab='Resale'; app.renderSODashboard()" class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${saleType === 'Resale' ? 'bg-white shadow-sm text-aci-blue' : 'text-slate-500 hover:text-slate-800'}">
                                    <i data-lucide="refresh-cw" class="w-3 h-3 ${saleType === 'Resale' ? 'text-aci-blue' : 'text-slate-400'}"></i> Resale
                                </button>
                            </div>
                        </div>

                        <!-- YTD Overall (Minimal Modern) -->
                        <div class="glass p-4 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
                            <div class="absolute -right-10 -top-10 bg-aci-blue/5 w-32 h-32 rounded-full blur-2xl"></div>
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <!-- Minimal Floating Icon -->
                                    <i data-lucide="bar-chart-2" class="w-4 h-4 text-aci-blue/80 animate-[bounce_6s_ease-in-out_infinite]"></i>
                                    ${isTransitionMode ? `Last Fiscal Year Overall (${concludingFY})` : `YTD Overall (${currentFY})`}
                                </h3>
                                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${isTransitionMode ? 'Full Year Concluding' : `Till ${app.lastMonth}`}</span>
                            </div>
                            <div class="grid grid-cols-6 text-center divide-x divide-slate-100">
                                <div class="px-1 flex flex-col justify-center">
                                    <p class="text-[9px] text-slate-400 uppercase font-semibold">${isTransitionMode ? 'FY Target' : 'YTD Target'}</p>
                                    <p class="font-bold text-slate-800 text-sm">${ytdTargetTillLastMonth}</p>
                                    <p class="text-[8px] text-slate-400 font-semibold mt-0.5">${isTransitionMode ? `FY: ${concludingFY}` : `FY: ${currentFY}`}</p>
                                </div>
                                <div class="px-1 flex flex-col justify-center">
                                    <p class="text-[9px] text-slate-400 uppercase font-semibold">Sales</p>
                                    <p class="font-bold text-aci-blue text-sm">${tillLastMonthSalesUnits}</p>
                                </div>
                                <div class="px-1 flex flex-col justify-center">
                                    <p class="text-[9px] text-slate-400 uppercase font-semibold">Ach%</p>
                                    <p class="font-bold text-slate-800 text-sm">${ach(tillLastMonthSalesUnits, ytdTargetTillLastMonth)}%</p>
                                </div>
                                <div class="px-1 flex flex-col justify-center">
                                    <p class="text-[9px] text-slate-400 uppercase font-semibold">Shortfall</p>
                                    <p class="font-bold text-red-500 text-sm">${Math.max(0, ytdTargetTillLastMonth - tillLastMonthSalesUnits)}</p>
                                </div>
                                <div class="px-1 flex flex-col justify-center">
                                    <p class="text-[9px] text-slate-400 uppercase font-semibold">SPLY</p>
                                    <p class="font-bold text-slate-800 text-sm">${ytdSply}</p>
                                </div>
                                <div class="px-1 flex flex-col justify-center">
                                    <p class="text-[9px] text-slate-400 uppercase font-semibold">Grw%</p>
                                    <p class="text-sm">${formatGrw(grw(tillLastMonthSalesUnits, ytdSply))}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Current Month (Solid Modern Minimalist) -->
                        <div class="bg-gradient-to-br ${brand === 'Foton' ? 'from-foton to-[#03133d] shadow-foton/20' : 'from-mahindra to-[#b81b31] shadow-mahindra/20'} rounded-2xl p-4 mb-4 relative overflow-hidden shadow-lg text-white">
                            <img src="${brand === 'Foton' ? 'https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png' : 'https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png'}" class="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 object-contain grayscale mix-blend-overlay">
                            <div class="flex justify-between items-center mb-3 border-b border-white/20 pb-2 relative z-10">
                                <h3 class="font-bold text-sm">Current Month (${currentMonth})</h3>
                                <span class="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold text-white">System + Manual</span>
                            </div>
                            
                            <div class="grid grid-cols-4 gap-y-4 gap-x-2 text-center mb-3 relative z-10">
                                <div><p class="text-[9px] text-white/70 uppercase font-semibold">Budget</p><p class="font-bold text-lg text-white">${monthlyBudget}</p></div>
                                <div><p class="text-[9px] text-white/70 uppercase font-semibold">Projection</p><p class="font-bold text-lg text-white">${totalMonthlyProjection}</p></div>
                                <div class="col-span-2 border-l border-white/20"><p class="text-[9px] text-white/70 uppercase font-semibold">Sales Till Now</p><p class="font-bold text-2xl text-yellow-300">${currentSalesUnits}</p></div>
                                
                                <div class="col-span-2 bg-black/20 rounded-lg py-1"><p class="text-[9px] text-white/70 uppercase font-semibold">Ach% (Budget)</p><p class="font-bold text-sm text-green-300">${ach(currentSalesUnits, monthlyBudget)}%</p></div>
                                <div class="col-span-2 bg-black/20 rounded-lg py-1"><p class="text-[9px] text-white/70 uppercase font-semibold">Ach% (Proj)</p><p class="font-bold text-sm text-amber-300">${ach(currentSalesUnits, totalMonthlyProjection)}%</p></div>

                                <div><p class="text-[9px] text-white/70 uppercase font-semibold">Sale Type</p><p class="font-bold text-[10px] mt-1 text-white/90">${saleType}</p></div>
                                <div><p class="text-[9px] text-white/70 uppercase font-semibold">SPLY</p><p class="font-bold text-sm mt-1 text-white">${currentSply}</p></div>
                                <div class="col-span-2"><p class="text-[9px] text-white/70 uppercase font-semibold">Growth (SPLY)</p><p class="font-bold text-sm mt-1 text-yellow-300">${formatGrw(grw(currentSalesUnits, currentSply))}</p></div>
                            </div>
                            
                            <!-- Area Recovery OD Status (Territory specific, applies across all brands) -->
                            <div class="mt-3 pt-3 border-t border-white/20 relative z-10">
                                <div class="flex items-center justify-between mb-2">
                                    <p class="text-[9px] text-white/90 font-bold uppercase tracking-widest flex items-center gap-1"><i data-lucide="shield-alert" class="w-3 h-3 text-rose-300"></i> Area Recovery OD Status</p>
                                    <span class="text-[8px] bg-white/20 px-1.5 py-0.5 rounded text-white/90 uppercase font-bold tracking-wider">All Brands</span>
                                </div>
                                <div class="flex justify-between items-center bg-black/20 rounded-lg p-2.5 border border-white/5">
                                    <div class="text-left">
                                        <p class="text-[9px] text-white/70 uppercase font-semibold mb-0.5">Perfile Overdue</p>
                                        <p class="font-black text-sm text-rose-300">${app.formatCurrency(recoveryData.perfile_od)}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-[9px] text-white/70 uppercase font-semibold mb-0.5">Total Overdue</p>
                                        <p class="font-black text-sm text-rose-300">${app.formatCurrency(recoveryData.total_overdue)}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- EMI COLLECTION SUMMARY -->
                            <div class="mt-3 relative z-10 cursor-pointer group" onclick="app.renderSOEMI()">
                                <div class="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-white/20 rounded-xl p-3 hover:bg-white/20 transition-all backdrop-blur-sm shadow-inner group-hover:shadow-lg">
                                    <div class="flex items-center justify-between mb-2">
                                        <div class="flex items-center gap-2">
                                            <div class="bg-white/10 p-1.5 rounded-lg text-indigo-200">
                                                <i data-lucide="wallet" class="w-4 h-4 text-indigo-300"></i>
                                            </div>
                                            <span class="text-[9px] text-white/90 font-bold uppercase tracking-widest">EMI Collection Summary</span>
                                        </div>
                                        <span class="text-indigo-200 group-hover:translate-x-1.5 group-hover:text-white transition-all"><i data-lucide="chevron-right" class="w-4 h-4"></i></span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 text-center bg-black/20 rounded-lg p-2 border border-white/5">
                                        <div class="text-left">
                                            <p class="text-[8px] text-white/70 uppercase font-semibold">Total Installment</p>
                                            <p class="font-black text-xs text-white">${app.formatCurrency(totalEmiInstallment)}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-[8px] text-white/70 uppercase font-semibold">Collected Amount</p>
                                            <p class="font-black text-xs text-green-300">${app.formatCurrency(totalEmiCollected)}</p>
                                        </div>
                                    </div>
                                    <div class="mt-2 flex items-center justify-between text-[9px] text-white/90 border-t border-white/10 pt-1.5">
                                        <span>Accounts: <strong class="text-indigo-100">${totalEmiCust} Total</strong> (${paidEmiCust} Paid)</span>
                                        <span class="text-rose-300 font-bold">${unpaidEmiCust} Unpaid</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Add Manual Delivery Button -->
                        <button onclick="app.showAddDeliveryModal()" class="w-full relative group overflow-hidden p-[1px] rounded-2xl transition-all active:scale-[0.98] mb-6 shadow-xl shadow-blue-500/10">
                            <!-- Thin Running Border -->
                            <div class="absolute inset-[-500%] bg-[conic-gradient(from_0deg,transparent_48%,#2563eb_50%,transparent_52%)] animate-[spin_4s_linear_infinite] opacity-60"></div>
                            
                            <!-- Animated Cloud Glass Surface -->
                            <div class="relative w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(239,246,255,0.95),rgba(255,255,255,0.95))] bg-[length:400%_400%] animate-[mesh_8s_ease_infinite] backdrop-blur-md rounded-[15px] py-4 flex items-center justify-center gap-3 text-aci-blue font-black border border-white/80">
                                <div class="flex items-center justify-center h-6 w-6 bg-aci-blue/10 rounded-full group-hover:scale-110 transition-transform">
                                    <i data-lucide="plus" class="w-4 h-4 text-aci-blue animate-pulse"></i>
                                </div>
                                <span class="tracking-tight text-sm uppercase font-black">Enter Successful Delivery</span>
                            </div>
                        </button>

                        <!-- Successful Deliveries Log History (Unified Style) -->
                        ${myManualDeliveries.length > 0 ? `
                            <div class="mb-6">
                                <h3 class="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between flex-wrap gap-2">
                                    <div class="flex items-center gap-2">
                                        <div class="p-1.5 bg-indigo-100 rounded-lg"><i data-lucide="clipboard-list" class="w-4 h-4 text-indigo-600"></i></div>
                                        <span>Manual Field Deliveries Log History</span>
                                    </div>
                                    <div class="flex items-center gap-1.5">
                                        <span class="px-2 py-0.5 text-[9px] font-black rounded-full bg-slate-100 text-slate-600 border border-slate-200" title="Total manual logs entered">Total: ${myManualDeliveries.length}</span>
                                        <span class="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200" title="Approved and synced to cPanel">Synced: ${myManualDeliveries.filter(s => s.approval_status === 'Done').length}</span>
                                        <span class="px-2 py-0.5 text-[9px] font-black rounded-full bg-amber-50 text-amber-600 border border-amber-200 animate-pulse" title="Pending admin approval">Pending: ${myManualDeliveries.filter(s => s.approval_status !== 'Done').length}</span>
                                    </div>
                                </h3>
                                <div class="glass overflow-hidden rounded-2xl border border-white/40 shadow-xl overflow-x-auto no-scrollbar">
                                    <table class="w-full text-left text-[11px] whitespace-nowrap">
                                        <thead class="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white/90 uppercase tracking-[0.1em] text-[9px] font-black border-b border-white/20">
                                            <tr>
                                                <th class="px-4 py-3 text-center">SL</th>
                                                <th class="px-4 py-3">Customer Information</th>
                                                <th class="px-4 py-3">Vehicle Details</th>
                                                <th class="px-4 py-3">Location</th>
                                                <th class="px-4 py-3">Sale Type</th>
                                                <th class="px-4 py-3 text-right">Sync Status</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-white/20">
                                            ${myManualDeliveries.map((m, idx) => `
                                                <tr class="hover:bg-white/20 transition-colors group">
                                                    <td class="px-4 py-3 text-center font-bold text-slate-400 group-hover:text-aci-blue transition-colors">${idx + 1}</td>
                                                    <td class="px-4 py-3">
                                                        <div class="font-black text-slate-800">${m.customer_name || 'Walk-in'}</div>
                                                        <div class="text-[9px] font-bold text-slate-400 mt-0.5">${m.customer_id}</div>
                                                    </td>
                                                    <td class="px-4 py-3">
                                                        <div class="font-bold text-slate-700">${m.model}</div>
                                                        <div class="flex items-center gap-1 mt-0.5">
                                                            <div class="w-1 h-1 rounded-full ${m.brand === 'Foton' ? 'bg-foton' : 'bg-mahindra'}"></div>
                                                            <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">${m.brand}</span>
                                                        </div>
                                                    </td>
                                                    <td class="px-4 py-3">
                                                        <div class="font-bold text-slate-600">${m.upazila}</div>
                                                        <div class="text-[9px] text-slate-400 font-medium">Recorded: ${m.timestamp || 'Today'}</div>
                                                    </td>
                                                    <td class="px-4 py-3">
                                                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${m.sale_type === 'New Sale' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'} border">
                                                            ${m.sale_type}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-3 text-right">
                                                        <div class="flex flex-col items-end justify-center gap-1 text-right">
                                                            ${m.approval_status === 'Done' ? 
                                                                `<div class="flex items-center justify-end gap-1.5 text-emerald-600">
                                                                    <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                                                                    <span class="text-[10px] font-black uppercase tracking-tight">Done</span>
                                                                 </div>` 
                                                            : 
                                                                `<div class="flex items-center justify-end gap-1.5 text-amber-500">
                                                                    <span class="relative flex h-2 w-2">
                                                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                        <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                                    </span>
                                                                    <span class="text-[10px] font-black uppercase tracking-tight">${m.approval_status || 'Pending Approval'}</span>
                                                                 </div>`
                                                            }
                                                            ${m.admin_comments ? `<div class="text-[9px] text-slate-500 italic max-w-[150px] truncate" title="${m.admin_comments}">Note: ${m.admin_comments}</div>` : ''}
                                                        </div>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Performance Trend Graph (Jul-Jun) -->
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                            <h3 class="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                                <i data-lucide="trending-up" class="w-4 h-4 text-aci-blue"></i> 
                                Performance Trend (${currentFY})
                            </h3>
                            <div class="h-48 relative w-full">
                                <canvas id="soTrendChart"></canvas>
                            </div>
                        </div>

                        <!-- Monthly Performance Table (Filterable) -->
                        <div class="glass rounded-xl shadow-sm border border-slate-100 mb-4 overflow-hidden relative">
                            <div class="absolute -left-10 -bottom-10 bg-indigo-500/5 w-32 h-32 rounded-full blur-2xl"></div>
                            <div class="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h3 class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                    <i data-lucide="calendar-days" class="w-4 h-4 text-aci-blue"></i> 
                                    Monthly Perf.
                                </h3>
                                <select onchange="app.soMonthTab=this.value; app.renderSODashboard()" class="bg-white border border-slate-200 text-[11px] font-bold rounded px-2 py-1 text-slate-600 shadow-sm focus:outline-none focus:border-aci-blue">
                                    <option value="July" ${selMonth === 'July' ? 'selected' : ''}>July</option>
                                    <option value="August" ${selMonth === 'August' ? 'selected' : ''}>August</option>
                                    <option value="September" ${selMonth === 'September' ? 'selected' : ''}>September</option>
                                    <option value="October" ${selMonth === 'October' ? 'selected' : ''}>October</option>
                                    <option value="November" ${selMonth === 'November' ? 'selected' : ''}>November</option>
                                    <option value="December" ${selMonth === 'December' ? 'selected' : ''}>December</option>
                                    <option value="January" ${selMonth === 'January' ? 'selected' : ''}>January</option>
                                    <option value="February" ${selMonth === 'February' ? 'selected' : ''}>February</option>
                                    <option value="March" ${selMonth === 'March' ? 'selected' : ''}>March</option>
                                    <option value="April" ${selMonth === 'April' ? 'selected' : ''}>April</option>
                                    <option value="May" ${selMonth === 'May' ? 'selected' : ''}>May</option>
                                    <option value="June" ${selMonth === 'June' ? 'selected' : ''}>June</option>
                                </select>
                            </div>
                            <div class="p-4 grid grid-cols-5 text-center divide-x divide-slate-100">
                                <div class="px-1"><p class="text-[9px] text-slate-400 uppercase font-semibold">Budget</p><p class="font-bold text-slate-800 text-sm">${monthlyBudget}</p></div>
                                <div class="px-1"><p class="text-[9px] text-slate-400 uppercase font-semibold">Sales</p><p class="font-bold text-aci-blue text-sm">${selMonthSalesUnits}</p></div>
                                <div class="px-1"><p class="text-[9px] text-slate-400 uppercase font-semibold">ACH%</p><p class="font-bold text-slate-800 text-sm">${ach(selMonthSalesUnits, monthlyBudget)}%</p></div>
                                <div class="px-1"><p class="text-[9px] text-slate-400 uppercase font-semibold">SPLY</p><p class="font-bold text-slate-800 text-sm">${selMonthSply}</p></div>
                                <div class="px-1"><p class="text-[9px] text-slate-400 uppercase font-semibold">Grw%</p><p class="text-sm">${formatGrw(grw(selMonthSalesUnits, selMonthSply))}</p></div>
                            </div>
                        </div>

                        <!-- Upazila Wise Breakdown (Filterable, Interactive Table) -->
                        <div class="bg-white rounded-xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
                            <div class="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="map" class="w-4 h-4 text-aci-blue animate-pulse"></i>
                                    <h3 class="font-bold text-slate-800 text-sm">Upazila Wise Performance</h3>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-[9px] font-bold text-slate-400 uppercase">Month Filter:</span>
                                    <select onchange="app.soUpazilaMonthFilter=this.value; app.renderSODashboard()" class="bg-white border border-slate-200 text-[10px] font-bold rounded px-1.5 py-0.5 text-slate-600 shadow-sm focus:outline-none focus:border-aci-blue">
                                        <option value="All" ${upaSelectedMonth === 'All' ? 'selected' : ''}>YTD (All Months)</option>
                                        <option value="July" ${upaSelectedMonth === 'July' ? 'selected' : ''}>July</option>
                                        <option value="August" ${upaSelectedMonth === 'August' ? 'selected' : ''}>August</option>
                                        <option value="September" ${upaSelectedMonth === 'September' ? 'selected' : ''}>September</option>
                                        <option value="October" ${upaSelectedMonth === 'October' ? 'selected' : ''}>October</option>
                                        <option value="November" ${upaSelectedMonth === 'November' ? 'selected' : ''}>November</option>
                                        <option value="December" ${upaSelectedMonth === 'December' ? 'selected' : ''}>December</option>
                                        <option value="January" ${upaSelectedMonth === 'January' ? 'selected' : ''}>January</option>
                                        <option value="February" ${upaSelectedMonth === 'February' ? 'selected' : ''}>February</option>
                                        <option value="March" ${upaSelectedMonth === 'March' ? 'selected' : ''}>March</option>
                                        <option value="April" ${upaSelectedMonth === 'April' ? 'selected' : ''}>April</option>
                                        <option value="May" ${upaSelectedMonth === 'May' ? 'selected' : ''}>May</option>
                                        <option value="June" ${upaSelectedMonth === 'June' ? 'selected' : ''}>June</option>
                                    </select>
                                </div>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-xs">
                                    <thead>
                                        <tr class="bg-slate-50/65 text-slate-500 uppercase tracking-widest text-[9px] border-b border-slate-100 font-black">
                                            <th class="px-4 py-2.5">Upazila Name</th>
                                            <th class="px-4 py-2.5 text-center">
                                                ${upaSelectedMonth === 'All' ? 'SPLY Sales (Last FY)' : `Month Sales (${upaSelectedMonth})`}
                                            </th>
                                            <th class="px-4 py-2.5 text-center">YTD Sales (FY)</th>
                                            <th class="px-4 py-2.5 text-center">Growth %</th>
                                            <th class="px-4 py-2.5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${Object.keys(upaStats).map(k => {
                                            const ySales = upaStats[k].ytdSales;
                                            const mSales = upaSelectedMonth === 'All' ? upaStats[k].lastFYSales : upaStats[k].filteredMonthSales;
                                            
                                            // Dynamic Growth Comparison logic
                                            const currentVal = upaSelectedMonth === 'All' ? ySales : mSales;
                                            const priorVal = upaSelectedMonth === 'All' ? upaStats[k].lastFYSales : upaStats[k].lastFYSameMonthSales;
                                            const growthVal = grw(currentVal, priorVal);

                                            return {
                                                name: k,
                                                mSales: mSales,
                                                ySales: ySales,
                                                growth: growthVal
                                            };
                                        })
                                            .sort((a, b) => b.ySales - a.ySales)
                                            .map(u => {
                                                const isZeroMonth = u.mSales === 0;
                                                const isZeroYtd = u.ySales === 0;
                                                
                                                // Highlight rules: Red border alerts for zero sales
                                                return `
                                                <tr class="transition-colors hover:bg-slate-50/50 ${isZeroMonth ? 'bg-rose-50/20' : ''}">
                                                    <td class="px-4 py-2.5 font-bold ${isZeroYtd ? 'text-red-500 font-extrabold' : 'text-slate-700'}">
                                                        <div class="flex items-center gap-1.5">
                                                            <div class="w-1.5 h-1.5 rounded-full ${isZeroYtd ? 'bg-red-500 animate-ping' : 'bg-slate-300'}"></div>
                                                            ${u.name}
                                                        </div>
                                                    </td>
                                                    <td class="px-4 py-2.5 text-center font-black ${isZeroMonth ? 'text-rose-500 bg-rose-500/5' : 'text-slate-800'}">
                                                        ${u.mSales}
                                                    </td>
                                                    <td class="px-4 py-2.5 text-center font-black ${isZeroYtd ? 'text-red-600 bg-red-500/5' : 'text-slate-800'}">
                                                        ${u.ySales}
                                                    </td>
                                                    <td class="px-4 py-2.5 text-center font-black">
                                                        ${formatGrw(u.growth)}
                                                    </td>
                                                    <td class="px-4 py-2.5 text-right">
                                                        ${isZeroYtd 
                                                            ? '<span class="bg-red-100 text-red-600 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-red-200 tracking-wider">Zero YTD</span>' 
                                                            : (isZeroMonth 
                                                                ? '<span class="bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-200 tracking-wider">Zero Month</span>' 
                                                                : '<span class="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-200 tracking-wider">Active</span>'
                                                            )
                                                        }
                                                    </td>
                                                </tr>
                                                `;
                                            }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- MO ACTIONABLE INTELLIGENCE SECTION -->
                        ${(() => {
                        // Practical Data Crunching for Field Officer
                        const zeroSalesUpazilas = [];
                        const ytdSalesRecords = brandSales.filter(s => s.fy === currentFY);

                        let topGapUpazila = null;
                        let maxMonthGap = 0;

                        territory.upazilas.forEach(u => {
                            // Fiscal Year Targets & Sales for Zero-Zone check
                            const uTgts = DB.targets.filter(t => t.territory_id === terrId && t.upazila === u && t.brand === brand && t.fy === currentFY && t.sale_type === saleType);
                            const uTargetYTD = uTgts.reduce((sum, t) => sum + Number(t.target_qty || 0), 0);
                            const uSalesYTD = ytdSalesRecords.filter(s => s.upazila === u).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                            // Flag zero sales upazilas that have a YTD budget
                            if (uSalesYTD === 0 && uTargetYTD > 0) zeroSalesUpazilas.push(u);

                            // Calculate top gap for current month (AI Directive)
                            const uMonthTgtObj = uTgts.find(t => t.month === currentMonth);
                            const uMonthTarget = uMonthTgtObj ? uMonthTgtObj.target_qty : Math.round(uTargetYTD / 12);
                            const uMonthSales = currentSalesRecords.filter(s => s.upazila === u).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                            const monthGap = uMonthTarget - uMonthSales;

                            if (monthGap > maxMonthGap) {
                                maxMonthGap = monthGap;
                                topGapUpazila = u;
                            }
                        });

                        const remainingTarget = Math.max(0, monthlyBudget - currentSalesUnits);

                        // Mocking remaining days (Assuming today is 14th of a 30 day month)
                        const daysInMonth = 30;
                        const currentDay = 14;
                        const daysLeft = daysInMonth - currentDay;
                        const weeksLeft = Math.max(1, Math.round(daysLeft / 7));
                        const requiredRunRate = Math.ceil(remainingTarget / weeksLeft);

                        // AI Month-End Prediction
                        const currentRunRateDaily = currentSalesUnits / currentDay;
                        const predictedClose = Math.round(currentRunRateDaily * daysInMonth);
                        const predictedShortfall = Math.max(0, monthlyBudget - predictedClose);
                        const isPacingWell = predictedClose >= monthlyBudget;

                        const splyGrowth = currentSply > 0 ? Math.round(((currentSalesUnits - currentSply) / currentSply) * 100) : 0;

                        return `
                            <div class="mt-8 mb-6 fade-in">
                                <div class="flex items-center justify-between mb-4 pl-1">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-xl border border-indigo-400 shadow-md animate-pulse">
                                            <i data-lucide="sparkles" class="w-5 h-5 text-white"></i>
                                        </div>
                                        <div>
                                            <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 tracking-tight">AI Field Sales Copilot</h3>
                                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Real-time Field Analytics & Prediction</p>
                                        </div>
                                    </div>
                                    <span class="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest">Active Copilot</span>
                                </div>
                                
                                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <!-- Card 1: AI Smart Pacing & Recovery Planner -->
                                    <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-lg border border-slate-750 text-white relative overflow-hidden flex flex-col justify-between">
                                        <div class="absolute -right-6 -top-6 opacity-10"><i data-lucide="trending-up" class="w-24 h-24 text-indigo-400"></i></div>
                                        <div>
                                            <div class="flex items-center justify-between mb-3 relative z-10">
                                                <h4 class="text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="target" class="w-3.5 h-3.5"></i> Sales Pacing Planner</h4>
                                                <span class="text-[9px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.2 rounded">${daysLeft} Days Left</span>
                                            </div>
                                            <p class="text-slate-300 text-xs mb-4">Target: <strong class="text-white">${monthlyBudget}</strong> | Sold: <strong class="text-white">${currentSalesUnits}</strong> | Gap: <strong class="text-amber-400 font-bold">${remainingTarget}</strong></p>
                                            
                                            <div class="bg-slate-800/80 rounded-xl p-3 border border-slate-700 mb-3 relative z-10">
                                                <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Required Field Run-Rate</p>
                                                <p class="text-xl font-black text-amber-400 mt-1">${requiredRunRate} <span class="text-xs text-slate-300 font-medium">units / week</span></p>
                                                <p class="text-[8.5px] text-slate-400 mt-1">* Trajectory is currently tracking ${splyGrowth >= 0 ? '+' : ''}${splyGrowth}% vs SPLY.</p>
                                            </div>
                                        </div>
                                        
                                        <div class="mt-2 border-t border-slate-700/50 pt-3">
                                            <span class="text-[9px] text-indigo-300 font-black uppercase tracking-wider block mb-1">Copilot Strategy:</span>
                                            <p class="text-[11px] text-slate-300 leading-relaxed">
                                                ${topGapUpazila 
                                                    ? `Focus dealer network drives in <strong class="text-white">${topGapUpazila}</strong>. This Upazila holds the largest unfulfilled gap of <strong class="text-amber-400">${maxMonthGap} units</strong>.`
                                                    : `Pacing is fully optimized across all Upazilas. Keep maintaining active customer connections!`
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Card 2: AI Month-End Close Forecast -->
                                    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between">
                                        <div class="absolute -right-6 -bottom-6 opacity-5"><i data-lucide="brain-circuit" class="w-24 h-24 text-purple-600"></i></div>
                                        <div>
                                            <h4 class="text-slate-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-3"><i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-purple-500"></i> Month-End Forecast</h4>
                                            <p class="text-slate-500 text-xs mb-4">Copilot projections based on current velocity of <strong class="text-slate-800 font-bold">${currentRunRateDaily.toFixed(2)} units/day</strong>:</p>
                                            
                                            <div class="grid grid-cols-2 gap-3 mb-4">
                                                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                                                    <span class="text-[9px] text-slate-400 uppercase font-black">Projected Close</span>
                                                    <p class="text-2xl font-black text-slate-800 mt-1">${predictedClose}</p>
                                                </div>
                                                <div class="rounded-xl p-3 text-center ${isPacingWell ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}">
                                                    <span class="text-[9px] ${isPacingWell ? 'text-green-600' : 'text-red-500'} uppercase font-black">${isPacingWell ? 'Surplus' : 'Est. Shortfall'}</span>
                                                    <p class="text-2xl font-black ${isPacingWell ? 'text-green-700' : 'text-red-600'} mt-1">${isPacingWell ? '+' + (predictedClose - monthlyBudget) : predictedShortfall}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div class="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                                                <div class="h-1.5 rounded-full ${isPacingWell ? 'bg-green-500' : 'bg-amber-500'}" style="width: ${Math.min(100, (predictedClose / Math.max(1, monthlyBudget)) * 100)}%"></div>
                                            </div>
                                            <div class="flex justify-between text-[9px] font-bold">
                                                <span class="text-slate-400">${Math.round((predictedClose / Math.max(1, monthlyBudget)) * 100)}% of target</span>
                                                <span class="${isPacingWell ? 'text-green-600' : 'text-amber-600'}">${isPacingWell ? 'Pacing Ahead' : 'Pacing Behind'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Card 3: Collection Risk Radar (Early EMI Protection) -->
                                    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between">
                                        <div class="absolute -right-6 -top-6 opacity-5"><i data-lucide="shield-alert" class="w-24 h-24 text-red-500"></i></div>
                                        <div>
                                            <div class="flex items-center justify-between mb-3">
                                                <h4 class="text-slate-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="shield-check" class="w-3.5 h-3.5 text-indigo-500"></i> Collection Risk Radar</h4>
                                                <span class="text-[8px] font-black uppercase px-2 py-0.5 rounded ${unpaidFirstTwoCust > 0 ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-green-100 text-green-700'}">
                                                    ${unpaidFirstTwoCust > 0 ? 'Risk Alert' : 'Healthy'}
                                                </span>
                                            </div>
                                            <p class="text-slate-500 text-xs mb-3">Installment collections monitoring (Early 1st & 2nd EMIs):</p>
                                            
                                            <div class="grid grid-cols-2 gap-2 text-center mb-4">
                                                <div class="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50">
                                                    <span class="text-[9px] text-indigo-400 font-bold block">Active EMI Accounts</span>
                                                    <span class="text-lg font-black text-indigo-950">${totalFirstTwoCust}</span>
                                                    <span class="text-[9px] font-bold text-slate-500 block mt-1">Due: ${app.formatCurrency(totalFirstTwoInstallment)}</span>
                                                </div>
                                                <div class="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                                                    <span class="text-[9px] text-rose-400 font-bold block">Uncollected EMIs</span>
                                                    <span class="text-lg font-black text-rose-600">${unpaidFirstTwoCust}</span>
                                                    <span class="text-[9px] font-bold text-slate-500 block mt-1">Col: ${app.formatCurrency(totalFirstTwoCollected)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="border-t border-slate-100 pt-3">
                                            <span class="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Risk Recovery Tip:</span>
                                            <p class="text-[11px] text-slate-600 leading-normal">
                                                ${unpaidFirstTwoCust > 0 
                                                    ? `Prioritize field collection visits to the <strong class="text-rose-600">${unpaidFirstTwoCust} uncollected EMI accounts</strong> this week to prevent early defaults.` 
                                                    : `100% early EMI collections achieved. Excellent work maintaining portfolio hygiene!`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <!-- AI Opportunity Predictor -->
                                    <div class="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-5 shadow-lg border border-indigo-700 text-white relative overflow-hidden flex flex-col justify-between">
                                        <div class="absolute -right-6 -bottom-6 opacity-10">
                                            <i data-lucide="radar" class="w-32 h-32 text-indigo-300"></i>
                                        </div>
                                        <h4 class="text-indigo-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-4 relative z-10">
                                            <i data-lucide="crosshair" class="w-3.5 h-3.5 text-emerald-400"></i> Sales Opportunity Predictor
                                        </h4>
                                        
                                        <div class="space-y-3 relative z-10">
                                            ${(() => {
                                                let topMomentum = null;
                                                let maxGrowth = -Infinity;
                                                let rescueUpazila = null;
                                                
                                                Object.keys(upaStats).forEach(k => {
                                                    const ySales = upaStats[k].ytdSales;
                                                    const lastYSales = upaStats[k].lastFYSales;
                                                    if(lastYSales > 0) {
                                                        const gr = ((ySales - lastYSales) / lastYSales) * 100;
                                                        if(gr > maxGrowth) {
                                                            maxGrowth = gr;
                                                            topMomentum = {name: k, growth: gr, sales: ySales};
                                                        }
                                                    }
                                                    if(ySales === 0 && DB.targets.some(t => t.territory_id === terrId && t.upazila === k && t.brand === brand && t.fy === currentFY && t.target_qty > 0)) {
                                                        rescueUpazila = k;
                                                    }
                                                });

                                                let html = '';
                                                if(topMomentum) {
                                                    html += `
                                                    <div class="bg-indigo-950/50 rounded-xl p-3.5 border border-indigo-500/30">
                                                        <div class="flex items-center justify-between mb-2">
                                                            <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1"><i data-lucide="flame" class="w-3 h-3"></i> High Momentum Zone</span>
                                                            <span class="text-xs font-black text-white bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">+${maxGrowth.toFixed(1)}% Growth</span>
                                                        </div>
                                                        <p class="text-[11px] text-indigo-100 leading-relaxed">
                                                            <strong>${topMomentum.name}</strong> is showing the strongest conversion rate. Deploy additional field activities here to maximize your closing ratio this week.
                                                        </p>
                                                    </div>`;
                                                }

                                                if(rescueUpazila) {
                                                    html += `
                                                    <div class="bg-rose-950/40 rounded-xl p-3.5 border border-rose-500/30 mt-3">
                                                        <div class="flex items-center justify-between mb-2">
                                                            <span class="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1"><i data-lucide="siren" class="w-3 h-3"></i> Critical Rescue</span>
                                                            <span class="text-xs font-black text-rose-200 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">0 YTD Sales</span>
                                                        </div>
                                                        <p class="text-[11px] text-indigo-100 leading-relaxed">
                                                            <strong>${rescueUpazila}</strong> has budget but no sales yet. Initiate a root-cause analysis visit and meet local influencers to unblock this market immediately.
                                                        </p>
                                                    </div>`;
                                                }
                                                
                                                if(!topMomentum && !rescueUpazila) {
                                                    html += `<p class="text-xs text-indigo-200">No critical anomalies detected. Standard pacing applies.</p>`;
                                                }
                                                return html;
                                            })()}
                                        </div>
                                    </div>

                                    <!-- AI Tactical Briefing -->
                                    <div class="bg-gradient-to-br from-violet-900 to-purple-900 rounded-2xl p-5 shadow-lg border border-purple-700 text-white relative overflow-hidden flex flex-col justify-between">
                                        <div class="absolute -right-6 -bottom-6 opacity-10">
                                            <i data-lucide="zap" class="w-32 h-32 text-purple-300"></i>
                                        </div>
                                        <h4 class="text-purple-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-4 relative z-10">
                                            <i data-lucide="cpu" class="w-3.5 h-3.5 text-amber-400"></i> AI Tactical Briefing
                                        </h4>
                                        
                                        <div class="relative z-10 space-y-3">
                                            <div class="flex gap-3 items-start bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
                                                <div class="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                                                    <span class="text-amber-400 text-[10px] font-black">1</span>
                                                </div>
                                                <div>
                                                    <p class="text-[11px] text-purple-50 leading-relaxed">Prioritize visits to customers whose 1st and 2nd EMIs are due within the next 5 days to prevent early-stage defaults.</p>
                                                </div>
                                            </div>
                                            <div class="flex gap-3 items-start bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
                                                <div class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                                                    <span class="text-emerald-400 text-[10px] font-black">2</span>
                                                </div>
                                                <div>
                                                    <p class="text-[11px] text-purple-50 leading-relaxed"><strong>Cross-sell opportunity:</strong> Customers who recently paid off their previous vehicle loans are high-probability prospects for new ${brand} units.</p>
                                                </div>
                                            </div>
                                            <div class="flex gap-3 items-start bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
                                                <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30 mt-0.5">
                                                    <span class="text-blue-400 text-[10px] font-black">3</span>
                                                </div>
                                                <div>
                                                    <p class="text-[11px] text-purple-50 leading-relaxed">Current run-rate is <strong class="text-white">${currentRunRateDaily.toFixed(1)} units/day</strong>. You need to increase this by <strong class="text-amber-300">${Math.max(0, (requiredRunRate/7) - currentRunRateDaily).toFixed(1)} units/day</strong> to hit the monthly budget.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `;
                    })()}
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();

                // Render the new Trend Line Chart, passing currentMonth to halt the line
                app.renderSOTrendChart(terrId, brand, currentFY, saleType, currentMonth);
                app.renderSOAICharts(territory, brand, currentFY, brandSales, monthlyBudget, currentSalesUnits);
            };

window.app.renderSOAICharts = (territory, brand, fy, brandSales, monthlyBudget, currentSalesUnits) => {
                // Removed Sub-Territory shortfall chart as requested.
                // Cleanup chart instance if it existed previously
                if (app.charts.soGapChart) {
                    app.charts.soGapChart.destroy();
                    delete app.charts.soGapChart;
                }
            };

window.app.renderSOTrendChart = (terrId, brand, fy, saleType, currentMonth) => {
                if (app.charts.soTrend) app.charts.soTrend.destroy();
                const ctx = document.getElementById('soTrendChart').getContext('2d');

                const months = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const shortMonths = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

                // Calculate Monthly Budget (Variable or Fixed)
                const yearlyTargets = DB.targets.filter(t => t.territory_id === terrId && t.brand === brand && t.fy === fy && t.sale_type === saleType);
                const totalTarget = yearlyTargets.reduce((sum, t) => sum + Number(t.target_qty || 0), 0);
                const budgetData = months.map(m => {
                    const mtFiltered = yearlyTargets.filter(tg => tg.month === m);
                    return mtFiltered.length > 0 ? mtFiltered.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(totalTarget / 12);
                });
                const monthlyBudgetTgts = yearlyTargets.filter(t => t.month === currentMonth);
                const monthlyBudget = monthlyBudgetTgts.length > 0 ? monthlyBudgetTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(totalTarget / 12) || 0;

                // Calculate Monthly Sales (Only up to the current month to create a month-to-month growth line)
                const currentMonthIdx = months.indexOf(currentMonth);
                const salesData = months.map((m, idx) => idx <= currentMonthIdx ? 0 : null);

                const records = DB.sales.filter(s => s.territory_id === terrId && s.brand === brand && s.fy === fy && s.sale_type === saleType);
                records.forEach(r => {
                    const idx = months.indexOf(r.sales_month);
                    if (idx !== -1 && idx <= currentMonthIdx) {
                        salesData[idx] += Number(r.unit_qty || 0);
                    }
                });

                // Style based on brand
                const brandColor = brand === 'Foton' ? '#041A54' : '#E5223E';

                app.charts.soTrend = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: shortMonths,
                        datasets: [
                            {
                                label: 'Actual Sales',
                                data: salesData,
                                borderColor: brandColor,
                                backgroundColor: brandColor + '15', // Minimal transparent fill
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: brandColor,
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6
                            },
                            {
                                label: 'Monthly Budget',
                                data: budgetData,
                                borderColor: '#cbd5e1', // slate-300
                                borderWidth: 2,
                                borderDash: [5, 5],
                                tension: 0,
                                fill: false,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                suggestedMax: monthlyBudget > 0 ? monthlyBudget * 1.5 : 10,
                                grid: { color: '#f1f5f9', drawBorder: false }, // Very soft minimal grid
                                border: { display: false },
                                ticks: { stepSize: 2, color: '#94a3b8', font: { size: 10 } }
                            },
                            x: {
                                grid: { display: false },
                                border: { display: false },
                                ticks: { color: '#64748b', font: { size: 10 } }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                align: 'end',
                                labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 10, family: 'Inter' } }
                            },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                titleFont: { family: 'Inter', size: 12 },
                                bodyFont: { family: 'Inter', size: 11 },
                                padding: 10,
                                cornerRadius: 8,
                                displayColors: true,
                                mode: 'index',
                                intersect: false
                            }
                        },
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        }
                    }
                });
            };

window.app.showAddDeliveryModal = () => {
                const terrId = app.currentUser.territories[0];
                const territory = DB.territories.find(t => t.id === terrId);

                let modal = document.getElementById('add-delivery-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'add-delivery-modal';
                    modal.className = 'fixed inset-0 z-[100] hidden items-end sm:items-center justify-center';
                    document.body.appendChild(modal);
                }

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-aci-blue/20 backdrop-blur-md" onclick="app.closeDeliveryModal()"></div>
                    <div class="glass w-full sm:max-w-xl sm:rounded-2xl rounded-t-[2.5rem] p-6 relative z-10 transform transition-transform translate-y-full max-h-[95vh] overflow-y-auto shadow-2xl no-scrollbar border border-white/40 overflow-hidden" id="delivery-modal-content">
                        <!-- Liquid Orbs inside modal -->
                        <div class="absolute -right-20 -top-20 bg-aci-blue/20 w-64 h-64 rounded-full blur-[80px] pointer-events-none"></div>
                        <div class="absolute -left-20 -bottom-20 bg-indigo-500/10 w-64 h-64 rounded-full blur-[80px] pointer-events-none"></div>
                        
                        <!-- Pull Handle for Mobile -->
                        <div class="w-12 h-1 bg-white/30 rounded-full mx-auto mb-6 sm:hidden"></div>
                        
                        <div class="flex justify-between items-center mb-6 relative z-10">
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 tracking-tight">Log New Delivery</h3>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Record successful sales data</p>
                            </div>
                            <button onclick="app.closeDeliveryModal()" class="text-white/60 bg-white/10 rounded-full hover:bg-white/20 p-2 transition-colors border border-white/20"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>

                        <form id="add-delivery-form" onsubmit="app.saveManualDelivery(event)" class="space-y-5 pb-4 relative z-10">
                            <!-- Sale Type & Region -->
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sale Type</label>
                                    <div class="relative group">
                                        <select id="del-type" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50 appearance-none pr-10" required onchange="
                                            const isResale = this.value === 'Resale';
                                            const isNewSale = this.value === 'New Sale';
                                            document.getElementById('old-cust-container').style.display = isResale ? 'block' : 'none';
                                            document.getElementById('del-old-customer-id').required = isResale;
                                            document.getElementById('del-customer-code').required = !isNewSale;
                                        ">
                                            <option value="New Sale">New Sale</option>
                                            <option value="Resale">Resale</option>
                                            <option value="Credit Note">Credit Note</option>
                                        </select>
                                        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-aci-blue transition-colors">
                                            <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-1.5 relative">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Upazila</label>
                                    <div class="relative group">
                                        <select id="del-upazila" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50 appearance-none pr-10" required onchange="
                                            const otherContainer = document.getElementById('other-upazila-container');
                                            const customInput = document.getElementById('del-upazila-custom');
                                            if (this.value === 'Other') {
                                                otherContainer.style.display = 'block';
                                                customInput.required = true;
                                                setTimeout(() => {
                                                    otherContainer.style.opacity = '1';
                                                    otherContainer.style.maxHeight = '100px';
                                                    customInput.focus();
                                                }, 10);
                                            } else {
                                                otherContainer.style.opacity = '0';
                                                otherContainer.style.maxHeight = '0px';
                                                customInput.required = false;
                                                setTimeout(() => {
                                                    otherContainer.style.display = 'none';
                                                }, 300);
                                            }
                                        ">
                                            <option value="">Select Upazila</option>
                                            ${territory.upazilas.map(u => `<option value="${u}">${u}</option>`).join('')}
                                            <option value="Other">+ Write Custom Upazila...</option>
                                        </select>
                                        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-aci-blue transition-colors">
                                            <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                        </div>
                                    </div>
                                    <!-- Creative Custom Upazila Entry -->
                                    <div id="other-upazila-container" class="mt-2 transition-all duration-300 ease-out opacity-0 overflow-hidden" style="max-height: 0px; display: none;">
                                        <div class="relative group">
                                            <input type="text" id="del-upazila-custom" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 bg-indigo-50/20 text-indigo-900 placeholder-indigo-300" placeholder="Type custom Upazila name...">
                                            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Customer Info -->
                            <div class="space-y-1.5">
                                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
                                <input type="text" id="del-customer-name" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" required placeholder="Full Name or Business Name">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-aci-blue/70">Vehicle Chassis Number</label>
                                <input type="text" id="del-chassis" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" required placeholder="Enter Chassis Number (e.g. 17 characters)">
                            </div>
                            
                            <div class="space-y-1.5">
                                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-emerald-600/70">Dealer / Showroom Name</label>
                                <select id="del-dealer-code" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-400 bg-slate-50/50 appearance-none" required>
                                    <option value="">Select Dealer...</option>
                                    ${(DB.dealers || []).filter(d => app.currentUser.territories.includes(d.territory_id)).map(d => `<option value="${d.code}">${d.name} (${d.code})</option>`).join('')}
                                    <option value="direct_sales">Direct Sales / No Dealer</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-aci-blue/70">Customer ID</label>
                                    <input type="text" id="del-customer-code" maxlength="6" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" placeholder="ID: C34222 (6 chars)">
                                </div>
                                <div class="space-y-1.5 relative">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-indigo-600/70">Purpose of Use</label>
                                    <div class="relative group">
                                        <input type="text" id="del-purpose" autocomplete="off" onfocus="app.showPurposeSuggestions()" onblur="app.hidePurposeSuggestions()" onkeyup="app.filterPurposeSuggestions(this.value)" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-400 bg-slate-50/50 pr-10 transition-colors placeholder-slate-400 text-indigo-900" placeholder="e.g. Cow carry, Poultry firm use..." required>
                                        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <i data-lucide="briefcase" class="w-4 h-4"></i>
                                        </div>
                                    </div>
                                    <!-- Creative Suggestion Dropdown -->
                                    <div id="purpose-suggestions-dropdown" class="absolute left-0 right-0 top-[105%] z-50 bg-white/95 backdrop-blur-md border border-indigo-100 rounded-xl shadow-xl overflow-hidden hidden flex-col max-h-[220px] overflow-y-auto custom-scrollbar opacity-0 translate-y-2 transition-all duration-200">
                                    </div>
                                </div>
                                <div id="old-cust-container" style="display: none;" class="space-y-1.5 col-span-2">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-amber-600">Old Cust. ID (Mandatory)</label>
                                    <input type="text" id="del-old-customer-id" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" placeholder="System ID: O-9922">
                                </div>
                            </div>
                            
                            <!-- Product Selection -->
                            <div class="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Vehicle Portfolio Details</p>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div class="space-y-1.5">
                                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Brand</label>
                                        <div class="relative group">
                                            <select id="del-brand" onchange="app.updateModelDropdown(this.value)" class="w-full border-2 border-white rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-white shadow-sm appearance-none pr-8" required>
                                                <option value="">Select Brand</option>
                                                <option value="Foton">Foton</option>
                                                <option value="Mahindra">Mahindra</option>
                                            </select>
                                            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-aci-blue transition-colors">
                                                <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="space-y-1.5">
                                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Model</label>
                                        <div class="relative group">
                                            <select id="del-model" class="w-full border-2 border-white rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-white shadow-sm disabled:opacity-50 appearance-none pr-8" required disabled>
                                                <option value="">Pick Model</option>
                                            </select>
                                            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-aci-blue transition-colors">
                                                <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="space-y-1.5">
                                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Units (Qty)</label>
                                        <div class="relative">
                                            <input type="number" id="del-units" min="1" value="1" class="w-full border-2 border-white rounded-xl px-3 py-3 text-sm font-extrabold focus:outline-none focus:border-aci-blue bg-white shadow-sm text-center" required placeholder="1">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Financial Details -->
                            <div class="grid grid-cols-3 gap-3">
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trade Price</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">৳</span>
                                        <input type="number" id="del-tp" oninput="app.calculateDPPercentage()" class="w-full border-2 border-slate-100 rounded-xl pl-7 pr-3 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" required placeholder="0">
                                    </div>
                                </div>
                                <div class="space-y-1.5 relative">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Downpayment</label>
                                    <div class="absolute right-1 top-0">
                                        <span id="del-dp-perc" class="text-[9px] font-black text-white bg-slate-300 px-1.5 py-0.5 rounded transition-all duration-300">0%</span>
                                    </div>
                                    <div class="relative">
                                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">৳</span>
                                        <input type="number" id="del-dp" oninput="app.calculateDPPercentage()" class="w-full border-2 border-slate-100 rounded-xl pl-7 pr-3 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" required placeholder="0">
                                    </div>
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tenure</label>
                                    <div class="relative group">
                                        <select id="del-tenure" class="w-full border-2 border-slate-100 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50 appearance-none pr-10" required>
                                            <option value="">Select</option>
                                            <option value="Cash">Cash Sale</option>
                                            <option value="18">18 Months</option>
                                            <option value="36">36 Months</option>
                                            <option value="48">48 Months</option>
                                        </select>
                                        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-aci-blue transition-colors">
                                            <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Incentives -->
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Discount Offer</label>
                                    <div class="relative group">
                                        <select id="del-discount-type" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50 appearance-none pr-10" required onchange="
                                            document.getElementById('disc-amt-container-new').style.display = this.value === 'Amount' ? 'block' : 'none';
                                            document.getElementById('disc-gift-container-new').style.display = this.value === 'Gift' ? 'block' : 'none';
                                            document.getElementById('del-discount-amount').required = this.value === 'Amount';
                                            document.getElementById('del-gift-item').required = this.value === 'Gift';
                                        ">
                                            <option value="">Select Discount</option>
                                            <option value="Nothing">No Discount</option>
                                            <option value="Gift">Gift Pack</option>
                                            <option value="Amount">Cash Discount</option>
                                        </select>
                                        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-aci-blue transition-colors">
                                            <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                        </div>
                                    </div>
                                </div>
                                <div id="disc-amt-container-new" style="display: none;" class="space-y-1.5">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Disc. Amount</label>
                                    <input type="number" id="del-discount-amount" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" placeholder="৳ TK" min="1">
                                </div>
                                <div id="disc-gift-container-new" style="display: none;" class="space-y-1.5">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gift Item Name</label>
                                    <input type="text" id="del-gift-item" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" placeholder="e.g. Smart Watch">
                                </div>
                            </div>
                            
                            <div class="pt-2">
                                <button type="submit" class="w-full btn-liquid text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all transform flex items-center justify-center gap-3">
                                    <i data-lucide="check-circle-2" class="w-5 h-5"></i> CONFIRM & LOG DELIVERY
                                </button>
                            </div>
                        </form>
                    </div>
                `;

                const content = document.getElementById('delivery-modal-content');
                modal.classList.remove('hidden');
                modal.classList.add('flex');

                app.refreshIcons();

                // Trigger animation
                setTimeout(() => {
                    content.classList.remove('translate-y-full');
                }, 10);
            };

window.app.closeDeliveryModal = () => {
                const modal = document.getElementById('add-delivery-modal');
                const content = document.getElementById('delivery-modal-content');
                content.classList.add('translate-y-full');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }, 300);
            };

window.app.updateModelDropdown = (brand) => {
                const modelSelect = document.getElementById('del-model');
                modelSelect.innerHTML = '<option value="">Select Model</option>';

                if (!brand) {
                    modelSelect.disabled = true;
                    return;
                }

                const filteredModels = DB.models.filter(m => m.brand === brand);
                filteredModels.forEach(m => {
                    modelSelect.innerHTML += `<option value="${m.name}">${m.name}</option>`;
                });
                modelSelect.disabled = false;
            };

window.app.purposeSuggestions = [
                "Poultry Firm use", "Cow carry", "Fish carry", "Food carry", "Vegetable carry", 
                "Construction equipment carry", "Industrial material carry", "Grocery store item carry", 
                "Egg carry", "Garments items", "Oil transport", "Industrial purpose", 
                "Commercial transport", "Gas cylinder carry", "Scrap business purpose", 
                "Water bottle", "Agriculture", "Personal Use", "Public Transport", "Others"
            ];

window.app.showPurposeSuggestions = () => {
                app.filterPurposeSuggestions(document.getElementById('del-purpose').value);
                const dropdown = document.getElementById('purpose-suggestions-dropdown');
                dropdown.classList.remove('hidden');
                setTimeout(() => {
                    dropdown.classList.remove('opacity-0', 'translate-y-2');
                }, 10);
            };

window.app.hidePurposeSuggestions = () => {
                const dropdown = document.getElementById('purpose-suggestions-dropdown');
                setTimeout(() => {
                    dropdown.classList.add('opacity-0', 'translate-y-2');
                    setTimeout(() => {
                        dropdown.classList.add('hidden');
                    }, 200);
                }, 150); // Delay allows clicking a suggestion
            };

window.app.filterPurposeSuggestions = (val) => {
                const dropdown = document.getElementById('purpose-suggestions-dropdown');
                const filter = val.toLowerCase().trim();
                let matched = app.purposeSuggestions;
                if (filter) {
                    matched = app.purposeSuggestions.filter(p => p.toLowerCase().includes(filter));
                }
                
                if (matched.length === 0) {
                    dropdown.innerHTML = `
                        <div class="px-4 py-3 text-xs text-slate-500 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                            <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-400"></i>
                            New purpose: "${val}". Press Enter or click outside to save.
                        </div>
                    `;
                } else {
                    dropdown.innerHTML = matched.map(p => `
                        <div onmousedown="document.getElementById('del-purpose').value = '${p}'; app.hidePurposeSuggestions();" class="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors border-b border-slate-50 last:border-0 flex items-center gap-2 group">
                            <i data-lucide="chevron-right" class="w-3 h-3 text-indigo-200 group-hover:text-indigo-500 transition-colors"></i> ${p}
                        </div>
                    `).join('');
                }
                app.refreshIcons();
            };

window.app.showDuplicateWarning = (customerCode, duplicate) => {
                let modal = document.getElementById('duplicate-warning-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'duplicate-warning-modal';
                    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] hidden flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
                    document.body.appendChild(modal);
                }

                modal.innerHTML = `
                    <div class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 transform scale-95 opacity-0 transition-all duration-300 flex flex-col" id="duplicate-warning-content">
                        <!-- Top Banner / Header -->
                        <div class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-8 text-center text-white relative">
                            <div class="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                            
                            <!-- Animated Pulse Warning Icon -->
                            <div class="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce mb-4 border-2 border-white/30">
                                <i data-lucide="alert-triangle" class="w-8 h-8 text-white"></i>
                            </div>
                            
                            <h3 class="text-xl font-black tracking-tight">Duplicate Customer ID!</h3>
                            <p class="text-amber-100 text-xs font-semibold mt-1">This Customer ID is already registered in the system.</p>
                        </div>
                        
                        <!-- Content Details -->
                        <div class="p-6 space-y-4">
                            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                <div class="flex justify-between items-center border-b border-slate-200/60 pb-2">
                                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer ID</span>
                                    <span class="text-sm font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50">${customerCode}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span class="block text-slate-400 font-bold mb-0.5">Customer Name</span>
                                        <span class="font-extrabold text-slate-800">${duplicate.customer_name || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span class="block text-slate-400 font-bold mb-0.5">Brand / Model</span>
                                        <span class="font-extrabold text-slate-800">${duplicate.brand || ''} ${duplicate.model || ''}</span>
                                    </div>
                                    <div>
                                        <span class="block text-slate-400 font-bold mb-0.5">Region / Upazila</span>
                                        <span class="font-extrabold text-slate-800">${duplicate.district || ''} - ${duplicate.upazila || ''}</span>
                                    </div>
                                    <div>
                                        <span class="block text-slate-400 font-bold mb-0.5">Submission Date</span>
                                        <span class="font-extrabold text-slate-800">${duplicate.timestamp || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p class="text-xs font-medium text-slate-500 leading-relaxed text-center">
                                To prevent duplicate logs, please verify the Customer ID. If this is a new sale, ensure a unique Customer ID is assigned.
                            </p>
                        </div>
                        
                        <!-- Action Footer -->
                        <div class="px-6 pb-6 pt-2 flex justify-center">
                            <button onclick="app.closeDuplicateWarning()" class="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                                <i data-lucide="corner-up-left" class="w-4 h-4"></i>
                                Go Back & Edit ID
                            </button>
                        </div>
                    </div>
                `;

                // Show modal
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                app.refreshIcons();

                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    const content = document.getElementById('duplicate-warning-content');
                    content.classList.remove('scale-95', 'opacity-0');
                }, 50);
            };

window.app.closeDuplicateWarning = () => {
                const modal = document.getElementById('duplicate-warning-modal');
                if (!modal) return;
                const content = document.getElementById('duplicate-warning-content');
                content.classList.add('scale-95', 'opacity-0');
                modal.classList.add('opacity-0');
                setTimeout(() => {
                    modal.classList.remove('flex');
                    modal.classList.add('hidden');
                }, 300);
            };

window.app.saveManualDelivery = (e) => {
                e.preventDefault();

                const type = document.getElementById('del-type').value;
                let upazila = document.getElementById('del-upazila').value;
                if (upazila === 'Other') {
                    upazila = document.getElementById('del-upazila-custom').value.trim();
                    if (!upazila) {
                        app.showToast('Please type custom Upazila', 'error');
                        return;
                    }
                }
                const customerName = document.getElementById('del-customer-name').value;
                const customerCode = document.getElementById('del-customer-code').value;
                const dealerCode = document.getElementById('del-dealer-code').value;
                const chassisNo = document.getElementById('del-chassis').value;
                const purpose = document.getElementById('del-purpose')?.value || '';
                const oldCustomerId = document.getElementById('del-old-customer-id')?.value || '';
                const brand = document.getElementById('del-brand').value;
                const model = document.getElementById('del-model').value;
                let unitQty = Math.abs(parseInt(document.getElementById('del-units')?.value) || 1);
                if (type === 'Credit Note') {
                    unitQty = -unitQty;
                }
                const tp = document.getElementById('del-tp').value;
                const dp = document.getElementById('del-dp').value;
                const tenure = document.getElementById('del-tenure').value;
                const discType = document.getElementById('del-discount-type').value;
                const discAmt = document.getElementById('del-discount-amount')?.value || 0;
                const giftItem = document.getElementById('del-gift-item')?.value || '';

                // Customer ID Validation & Duplicate Check
                const customerCodeTrimmed = (customerCode || '').trim();
                
                if (customerCodeTrimmed) {
                    if (customerCodeTrimmed.length !== 6) {
                        app.showToast('Customer ID must be exactly 6 characters.', 'error');
                        return;
                    }
                    if (customerCodeTrimmed.includes(' ') || customerCodeTrimmed.includes('-')) {
                        app.showToast('Customer ID cannot contain spaces or dashes.', 'error');
                        return;
                    }
                    
                    const duplicate = DB.sales.find(s => s.customer_id && s.customer_id.trim().toLowerCase() === customerCodeTrimmed.toLowerCase());
                    if (duplicate) {
                        app.showDuplicateWarning(customerCodeTrimmed, duplicate);
                        return;
                    }
                }

                app.showLoader('Logging delivery data...');

                setTimeout(async () => {
                    const terrId = app.currentUser.territories[0];
                    const territory = DB.territories.find(t => t.id === terrId);

                    const parts = app.currentFY.split('-');
                    let currentYear = 2026;
                    if (parts.length === 2) {
                        const y1 = parseInt(parts[0]);
                        const y2_short = parts[1];
                        const prefix = parts[0].substring(0, 2);
                        const y2 = parseInt(prefix + y2_short);
                        const h2Months = ['January', 'February', 'March', 'April', 'May', 'June'];
                        currentYear = h2Months.includes(app.currentMonth) ? y2 : y1;
                    }

                    const newDelivery = {
                        id: 's_man_' + Date.now(),
                        customer_id: customerCode || ('NEW_' + Math.floor(Math.random() * 1000)),
                        customer_name: customerName,
                        chassis_no: chassisNo,
                        district: territory ? territory.district : '',
                        territory_id: terrId,
                        upazila: upazila,
                        brand: brand,
                        model: model,
                        purpose_of_use: purpose,
                        unit_qty: unitQty,
                        fy: app.currentFY,
                        sales_year: currentYear,
                        sales_month: app.currentMonth,
                        sale_type: type,
                        financials: JSON.stringify({ tp, dp, tenure }),
                        discounts: JSON.stringify({ type: discType, amount: discAmt, gift: giftItem }),
                        old_customer_id: oldCustomerId,
                        is_manual: true,
                        approval_status: 'Pending Approval',
                        admin_comments: '',
                        dealer_code: dealerCode,
                        timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    };

                    // Attempt to send via dedicated action (bypasses WAF whitelist)
                    try {
                        const response = await fetch('api.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'add_manual_delivery', delivery: newDelivery })
                        });

                        if (response.status === 401) {
                            app.hideLoader();
                            app.showToast('Session expired. Please log in again.', 'error');
                            return;
                        }

                        const result = await response.json();
                        if (response.ok && result.success) {
                            // Push to local DB with parsed financials/discounts for UI rendering
                            const localDelivery = { ...newDelivery, financials: { tp, dp, tenure }, discounts: { type: discType, amount: discAmt, gift: giftItem } };
                            DB.sales.push(localDelivery);
                            app.hideLoader();
                            app.closeDeliveryModal();
                            
                            // Achievement Calculation for Celebration
                            const b_sales = DB.sales.filter(s => s.territory_id === terrId && s.sales_month === app.currentMonth && s.fy === app.currentFY && s.brand === brand && s.sale_type === type);
                            const currentUnits = b_sales.reduce((sum, s) => sum + Number(s.unit_qty || 1), 0);
                            
                            const yrTgts = DB.targets.filter(t => t.territory_id === terrId && t.brand === brand && t.fy === app.currentFY && t.sale_type === type);
                            const tTgt = yrTgts.reduce((sum, t) => sum + Number(t.target_qty || 0), 0);
                            const mTgts = yrTgts.filter(t => t.month === app.currentMonth);
                            const monthlyBudget = mTgts.length > 0 ? mTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(tTgt / 12) || 0;
                            
                            const mProjs = DB.projections.filter(p => p.territory_id === terrId && p.brand === brand && p.fy === app.currentFY && p.month === app.currentMonth && p.sale_type === type);
                            const monthlyProj = mProjs.reduce((sum, p) => sum + Number(p.proj_qty || 0), 0);
                            
                            const achBudget = monthlyBudget > 0 ? (currentUnits / monthlyBudget) * 100 : 0;
                            const achProj = monthlyProj > 0 ? (currentUnits / monthlyProj) * 100 : 0;
                            
                            // Only trigger milestone if this exact delivery pushed them over 100%
                            const unitsAdded = Number(localDelivery.unit_qty || 1);
                            const previousUnits = currentUnits - unitsAdded;
                            const prevAchBudget = monthlyBudget > 0 ? (previousUnits / monthlyBudget) * 100 : 0;
                            const prevAchProj = monthlyProj > 0 ? (previousUnits / monthlyProj) * 100 : 0;
                            
                            let milestoneType = null;
                            if (achBudget >= 100 && prevAchBudget < 100) milestoneType = 'budget';
                            else if (achProj >= 100 && prevAchProj < 100) milestoneType = 'projection';
                            else if (achBudget >= 100) milestoneType = 'budget_maintained';
                            else if (achProj >= 100) milestoneType = 'projection_maintained';
                            
                            app.showDeliveryCelebration(brand, unitsAdded, milestoneType);
                            
                            app.renderSODashboard();
                        } else {
                            throw new Error(result.error || 'Server returned an error');
                        }
                    } catch (err) {
                        console.error('Delivery save failed:', err);
                        app.hideLoader();
                        app.showToast(`❌ Failed to save: ${err.message || 'Network issue. Please try again.'}`, 'error');
                    }
                }, 800);
            };


window.app.renderSOCreditNotes = (selectedMonth = null) => {
    localStorage.setItem('aci_last_page', 'credit_note');
    localStorage.setItem('aci_last_role', 'so');

    const terrId = app.currentUser ? app.currentUser.territories[0] : 't1';
    const territory = DB.territories.find(t => t.id === terrId);
    const activeFY = app.currentFY;
    const currentMonth = selectedMonth !== null ? selectedMonth : (app.soCreditNoteMonthFilter || app.currentMonth);
    app.soCreditNoteMonthFilter = currentMonth;

    // Filter Credit Note sales for SO territory & active FY
    let territorySales = DB.sales.filter(s => s.territory_id === terrId && s.fy === activeFY);
    let creditNotes = territorySales.filter(s => s.sale_type === 'Credit Note' || (s.unit_qty && Number(s.unit_qty) < 0));

    let filteredCN = [...creditNotes];
    if (currentMonth && currentMonth !== 'All') {
        filteredCN = filteredCN.filter(s => s.sales_month === currentMonth);
    }

    // Filter search text
    const searchFilter = (document.getElementById('cn-search-input')?.value || '').toLowerCase().trim();
    if (searchFilter) {
        filteredCN = filteredCN.filter(s => 
            (s.customer_name || '').toLowerCase().includes(searchFilter) ||
            (s.customer_id || '').toLowerCase().includes(searchFilter) ||
            (s.model || '').toLowerCase().includes(searchFilter) ||
            (s.chassis_no || '').toLowerCase().includes(searchFilter)
        );
    }

    const totalCNCount = filteredCN.length;
    const totalUnitsDeducted = Math.abs(filteredCN.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0));
    const fotonCNCount = filteredCN.filter(s => s.brand === 'Foton').length;
    const mahindraCNCount = filteredCN.filter(s => s.brand === 'Mahindra').length;

    const months = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];

    const html = `
        <div class="w-full fade-in space-y-5 pb-10">
            <!-- Top Banner Header -->
            <div class="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-rose-900/30">
                <div class="absolute right-0 top-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
                                Officer Intelligence
                            </span>
                            <span class="text-xs text-slate-300 font-bold">${territory ? territory.name : 'Territory'}</span>
                        </div>
                        <h1 class="text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2.5">
                            <i data-lucide="file-minus" class="w-7 h-7 text-rose-400"></i>
                            Credit Notes & Sales Adjustments
                        </h1>
                        <p class="text-xs text-rose-200/80 font-medium mt-1">Track vehicle credit notes, sales deductions, and returned units for your territory.</p>
                    </div>

                    <!-- Month Filter Dropdown -->
                    <div class="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-inner">
                        <span class="text-[10px] uppercase font-black text-rose-200 pl-2">Filter Month:</span>
                        <select onchange="app.renderSOCreditNotes(this.value)" class="bg-slate-900 text-white border border-rose-500/40 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-rose-400 cursor-pointer shadow-sm">
                            <option value="All" ${currentMonth === 'All' ? 'selected' : ''}>All Months (${activeFY})</option>
                            ${months.map(m => `<option value="${m}" ${currentMonth === m ? 'selected' : ''}>${m}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- KPI Metric Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-rose-300 transition-all">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] uppercase font-black tracking-wider text-slate-400">Credit Note Files</span>
                        <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <i data-lucide="file-text" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-slate-800 mt-2">${totalCNCount} <span class="text-xs text-slate-400 font-bold">Files</span></div>
                    <p class="text-[10px] text-slate-500 font-medium mt-1">Period: <strong class="text-rose-600">${currentMonth}</strong></p>
                </div>

                <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-rose-300 transition-all">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Deducted Units</span>
                        <div class="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                            <i data-lucide="minus-circle" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-rose-600 mt-2">-${totalUnitsDeducted} <span class="text-xs text-rose-400 font-bold">Units</span></div>
                    <p class="text-[10px] text-slate-500 font-medium mt-1">Deducted from gross total</p>
                </div>

                <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-foton/30 transition-all">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] uppercase font-black tracking-wider text-slate-400">Foton Credit Notes</span>
                        <div class="w-8 h-8 rounded-xl bg-sky-50 text-foton flex items-center justify-center font-bold">
                            <i data-lucide="truck" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-slate-800 mt-2">${fotonCNCount} <span class="text-xs text-slate-400 font-bold">Records</span></div>
                    <p class="text-[10px] text-slate-500 font-medium mt-1">Foton commercial vehicles</p>
                </div>

                <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-mahindra/30 transition-all">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] uppercase font-black tracking-wider text-slate-400">Mahindra Credit Notes</span>
                        <div class="w-8 h-8 rounded-xl bg-rose-50 text-mahindra flex items-center justify-center font-bold">
                            <i data-lucide="truck" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-slate-800 mt-2">${mahindraCNCount} <span class="text-xs text-slate-400 font-bold">Records</span></div>
                    <p class="text-[10px] text-slate-500 font-medium mt-1">Mahindra commercial vehicles</p>
                </div>
            </div>

            <!-- Quick Month Selector Pills -->
            <div class="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                <span class="text-[10px] uppercase font-black text-slate-400 px-2 shrink-0">Month Quick Toggle:</span>
                <button onclick="app.renderSOCreditNotes('All')" class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${currentMonth === 'All' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    All Months
                </button>
                ${months.map(m => `
                    <button onclick="app.renderSOCreditNotes('${m}')" class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${currentMonth === m ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                        ${m}
                    </button>
                `).join('')}
            </div>

            <!-- Search & Actions Bar -->
            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
                <div class="relative w-full sm:w-72">
                    <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="cn-search-input" onkeyup="app.renderSOCreditNotes('${currentMonth}')" value="${searchFilter}" placeholder="Search customer, ID, or model..." class="w-full text-xs font-bold pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 transition-all">
                </div>
                <div class="text-xs text-slate-500 font-bold">
                    Showing <strong class="text-rose-600">${filteredCN.length}</strong> Credit Note file(s) for <strong class="text-slate-800">${currentMonth} (${activeFY})</strong>
                </div>
            </div>

            <!-- Credit Note Files Table / List -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200/80 text-[10px] uppercase font-black tracking-wider text-slate-400">
                                <th class="px-4 py-3">Customer & Code</th>
                                <th class="px-4 py-3">Brand & Model</th>
                                <th class="px-4 py-3 text-center">Deducted Units</th>
                                <th class="px-4 py-3">Location / Region</th>
                                <th class="px-4 py-3">Month & FY</th>
                                <th class="px-4 py-3">Chassis / Reason</th>
                                <th class="px-4 py-3 text-right">Date Logged</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs">
                            ${filteredCN.length > 0 ? filteredCN.map(s => `
                                <tr class="hover:bg-rose-50/20 transition-colors">
                                    <td class="px-4 py-3">
                                        <div class="font-extrabold text-slate-800">${s.customer_name || s.customer || 'Unknown Customer'}</div>
                                        <div class="text-[10px] font-mono text-rose-600 font-bold mt-0.5">${s.customer_id || s.customer_code || 'N/A'}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="font-bold text-slate-800">${s.model || 'N/A'}</div>
                                        <span class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${s.brand === 'Foton' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'}">${s.brand}</span>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <span class="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black">
                                            ${s.unit_qty || -1} Units
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="font-bold text-slate-700">${s.district || 'Dhaka'}</div>
                                        <div class="text-[10px] text-slate-400 font-medium">${s.upazila || 'General'}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="font-extrabold text-slate-800">${s.sales_month}</span>
                                        <div class="text-[10px] text-slate-400 font-mono font-bold">${s.fy}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="text-[11px] font-mono font-bold text-slate-700">${s.chassis_no || 'N/A'}</div>
                                        <div class="text-[10px] text-slate-500 italic mt-0.5">${s.purpose_of_use || 'Credit Note Return'}</div>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <div class="text-[11px] font-bold text-slate-600">${s.timestamp || 'Recorded'}</div>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                                        <div class="flex flex-col items-center gap-3">
                                            <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center">
                                                <i data-lucide="file-check-2" class="w-6 h-6"></i>
                                            </div>
                                            <div>
                                                <p class="font-bold text-slate-700 text-sm">No Credit Notes found for ${currentMonth}.</p>
                                                <p class="text-xs text-slate-400 mt-0.5">No vehicle deductions or credit note records logged for this period.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById('view-port').innerHTML = html;
    app.refreshIcons();
};

window.app.showDeliveryCelebration = (brand, units, milestoneType) => {
    // milestoneType: null, 'budget', 'projection', 'budget_maintained', 'projection_maintained'
    
    const existing = document.getElementById('celebration-modal');
    if (existing) existing.remove();
    
    let isMilestone = milestoneType !== null;
    let title = "Thank You! 🙌";
    let subtitle = `You have successfully logged ${units} unit(s) of ${brand}.`;
    
    let milestoneHtml = '';
    let bgGradient = "from-emerald-500/10 to-teal-500/10";
    
    if (milestoneType === 'budget') {
        milestoneHtml = `
            <div class="mt-5 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
                <div class="flex items-center gap-3 mb-1">
                    <i data-lucide="award" class="w-6 h-6 text-amber-500"></i>
                    <h3 class="font-black text-amber-600 text-sm">Target Achieved!</h3>
                </div>
                <p class="text-xs text-amber-700/80 text-left font-medium">Congratulations! You have reached 100% of your Budget. Outstanding performance!</p>
            </div>
        `;
        bgGradient = "from-amber-500/10 to-yellow-500/10";
    } else if (milestoneType === 'projection') {
        milestoneHtml = `
            <div class="mt-5 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                <div class="flex items-center gap-3 mb-1">
                    <i data-lucide="trending-up" class="w-6 h-6 text-indigo-500"></i>
                    <h3 class="font-black text-indigo-600 text-sm">Projection Achieved!</h3>
                </div>
                <p class="text-xs text-indigo-700/80 text-left font-medium">Congratulations! You have reached 100% of your Projection. Keep up the momentum!</p>
            </div>
        `;
        bgGradient = "from-indigo-500/10 to-purple-500/10";
    } else if (milestoneType === 'budget_maintained' || milestoneType === 'projection_maintained') {
        milestoneHtml = `
            <div class="mt-5 p-4 bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl border border-rose-200">
                <div class="flex items-center gap-3 mb-1">
                    <i data-lucide="flame" class="w-6 h-6 text-rose-500"></i>
                    <h3 class="font-black text-rose-600 text-sm">Crushing It! 🔥</h3>
                </div>
                <p class="text-xs text-rose-700/80 text-left font-medium">You are going above and beyond your goals! Incredible work.</p>
            </div>
        `;
        bgGradient = "from-rose-500/10 to-orange-500/10";
    }

    const modalHtml = `
        <div id="celebration-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="document.getElementById('celebration-modal').remove()"></div>
            
            <div class="bg-white rounded-3xl p-7 max-w-sm w-full relative z-10 shadow-2xl overflow-hidden text-center border border-slate-100 flex flex-col" style="animation: modalPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
                <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br ${bgGradient} rounded-full blur-3xl opacity-50"></div>
                
                <div class="relative flex-1">
                    <div class="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-emerald-100 rotate-3 transition-transform hover:rotate-6">
                        <i data-lucide="check-circle" class="w-8 h-8 text-emerald-500"></i>
                    </div>
                    
                    <h2 class="text-2xl font-black text-slate-800 mb-2">${title}</h2>
                    <p class="text-slate-500 text-sm font-medium leading-relaxed px-1">${subtitle}</p>
                    
                    ${milestoneHtml}
                </div>
                
                <div class="relative mt-6 pt-2">
                    <button onclick="document.getElementById('celebration-modal').remove()" class="w-full py-3.5 px-6 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/10">
                        Continue
                    </button>
                </div>
            </div>
        </div>
        <style>
            @keyframes modalPopIn {
                0% { transform: scale(0.6); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
    
    // Auto-remove after 5 seconds if just a thank you
    if (!isMilestone) {
        setTimeout(() => {
            const el = document.getElementById('celebration-modal');
            if (el) el.remove();
        }, 5000);
    }
};

window.app.calculateDPPercentage = () => {
    const tpInput = document.getElementById('del-tp');
    const dpInput = document.getElementById('del-dp');
    const badge = document.getElementById('del-dp-perc');
    
    if (!tpInput || !dpInput || !badge) return;
    
    const tp = parseFloat(tpInput.value);
    const dp = parseFloat(dpInput.value);
    
    if (isNaN(tp) || isNaN(dp) || tp <= 0) {
        badge.textContent = '0%';
        badge.className = 'text-[9px] font-black text-white bg-slate-300 px-1.5 py-0.5 rounded transition-all duration-300';
        return;
    }
    
    const perc = Math.round((dp / tp) * 100);
    badge.textContent = `${perc}%`;
    
    if (perc >= 25) {
        badge.className = 'text-[9px] font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded transition-all duration-300';
    } else if (perc >= 10) {
        badge.className = 'text-[9px] font-black text-white bg-amber-500 px-1.5 py-0.5 rounded transition-all duration-300';
    } else {
        badge.className = 'text-[9px] font-black text-white bg-rose-500 px-1.5 py-0.5 rounded transition-all duration-300';
    }
};
