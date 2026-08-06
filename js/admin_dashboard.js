// --- Sales360 Module: admin_dashboard.js ---
window.app = window.app || {};

window.app.getBrandTheme = (brand) => {
    if (brand === 'Mahindra') {
        return {
            primaryHex: '#E5223E',
            lightHex: '#fde9ec',
            textClass: 'text-mahindra',
            bgClass: 'bg-mahindra',
            bgLightClass: 'bg-mahindra-light',
            borderClass: 'border-mahindra/20',
            borderSolidClass: 'border-mahindra',
            gradientClass: 'from-mahindra to-[#b81b31]',
            textTitleClass: 'from-[#E5223E] to-slate-800',
            shadowClass: 'shadow-mahindra/10',
            badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
            btnGradient: 'from-mahindra to-rose-600 hover:from-rose-600 hover:to-red-700',
            chartGradFrom: 'rgba(229, 34, 62, 0.35)',
            chartGradTo: 'rgba(229, 34, 62, 0)'
        };
    } else {
        return {
            primaryHex: '#041A54',
            lightHex: '#eaf0f8',
            textClass: 'text-foton',
            bgClass: 'bg-foton',
            bgLightClass: 'bg-foton-light',
            borderClass: 'border-foton/20',
            borderSolidClass: 'border-foton',
            gradientClass: 'from-foton to-[#03133d]',
            textTitleClass: 'from-[#0F2942] to-slate-800',
            shadowClass: 'shadow-foton/10',
            badgeClass: 'bg-blue-50 text-indigo-700 border-blue-200',
            btnGradient: 'from-foton to-indigo-800 hover:from-indigo-800 hover:to-slate-900',
            chartGradFrom: 'rgba(4, 26, 84, 0.35)',
            chartGradTo: 'rgba(4, 26, 84, 0)'
        };
    }
};

window.app.renderAdminDashboard = () => {
                localStorage.setItem('aci_last_page', 'dashboard');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                app.setupSidebar();
                const isAM = app.currentUser.role === 'am';
                const currentSaleType = app.adminSaleTypeTab || 'New Sale';
                const activeFY = app.currentFY;
                const concludingFY = app.getPreviousFY(activeFY);
                const defaultFY = (app.currentMonth === 'July' && app.fyReviewActive) ? concludingFY : activeFY;
                const currentFY = app.selectedFY || defaultFY;
                const splyFY = (() => {
                    const parts = concludingFY.split('-');
                    if (parts.length === 2) {
                        const y1 = parseInt(parts[0]);
                        const y2 = parseInt(parts[1]);
                        if (!isNaN(y1) && !isNaN(y2)) return `${y1-1}-${y2-1}`;
                    }
                    return '2024-25';
                })();
                const lastFY = concludingFY;

                // Filter data based on role AND Sale Type Tab
                let salesData = DB.sales.filter(s => s.sale_type === currentSaleType);
                const baseTerritories = isAM ? DB.territories.filter(t => app.currentUser.territories.includes(t.id)) : DB.territories;
                let activeTerritories = [...baseTerritories];

                if (app.adminTerritoryFilter && app.adminTerritoryFilter !== 'All') {
                    activeTerritories = activeTerritories.filter(t => t.id === app.adminTerritoryFilter);
                    salesData = salesData.filter(s => s.territory_id === app.adminTerritoryFilter);
                }

                if (isAM) {
                    salesData = salesData.filter(s => app.currentUser.territories.includes(s.territory_id));
                }

                const currFYSales = salesData.filter(s => s.fy === currentFY && s.sale_type === currentSaleType);
                const lastFYSales = salesData.filter(s => s.fy === lastFY && s.sale_type === currentSaleType);

                const totalUnits = currFYSales.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                const lastYearUnits = lastFYSales.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                // YOY Math
                const yoyGrowthPct = lastYearUnits > 0 ? Math.round(((totalUnits - lastYearUnits) / lastYearUnits) * 100) : 0;
                const yoyColor = yoyGrowthPct >= 0 ? 'text-green-600' : 'text-red-600';
                const yoyIcon = yoyGrowthPct >= 0 ? 'trending-up' : 'trending-down';
                const yoySign = yoyGrowthPct > 0 ? '+' : '';

                const fotonUnits = currFYSales.filter(s => s.brand === 'Foton').reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                const mahindraUnits = currFYSales.filter(s => s.brand === 'Mahindra').reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                const brandFilter = app.adminBrandTab || 'Foton';
                const theme = app.getBrandTheme(brandFilter);
                const activeModels = DB.models.filter(m => m.brand === brandFilter).map(m => m.name);

                // Dynamically assign theme to app-container
                const appContainer = document.getElementById('app-container');
                if (appContainer) {
                    appContainer.classList.remove('theme-foton', 'theme-mahindra');
                    appContainer.classList.add(`theme-${brandFilter.toLowerCase()}`);
                }

                // Calculate Monthly Budget for the current view
                let activeTgts = DB.targets.filter(tg => tg.fy === currentFY && tg.brand === brandFilter && tg.sale_type === currentSaleType);
                if (isAM) {
                    activeTgts = activeTgts.filter(tg => app.currentUser.territories.includes(tg.territory_id));
                }
                if (app.adminTerritoryFilter && app.adminTerritoryFilter !== 'All') {
                    activeTgts = activeTgts.filter(tg => tg.territory_id === app.adminTerritoryFilter);
                }
                const totalYearlyTarget = activeTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0);
                const currentActiveTgts = activeTgts.filter(tg => tg.month === app.currentMonth);
                const monthlyBudget = currentActiveTgts.length > 0 ? currentActiveTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : (Math.round(totalYearlyTarget / 12) || 0);

                // Helpers for table
                const ach = (s, b) => b > 0 ? Math.round((s / b) * 100) : 0;
                const grw = (s, sp) => sp > 0 ? Math.round(((s - sp) / sp) * 100) : 0;
                const formatGrw = (g) => g > 0 ? `<span class="text-green-600 font-bold">+${g}%</span>` : (g < 0 ? `<span class="text-red-600 font-bold">${g}%</span>` : `<span class="text-slate-500">0%</span>`);

                // Precompute and Sort Territories for the Pulse Table
                let pulseTerritories = [...baseTerritories];
                if (app.adminTerritoryFilter && app.adminTerritoryFilter !== 'All') {
                    pulseTerritories = pulseTerritories.filter(t => t.id === app.adminTerritoryFilter);
                }
                if (app.pulseFilterTerritories && app.pulseFilterTerritories.length > 0) {
                    pulseTerritories = pulseTerritories.filter(t => app.pulseFilterTerritories.includes(t.id));
                }

                let mappedTerritories = pulseTerritories.map(t => {
                    const perf = app.getPerformance(t.id, brandFilter, currentSaleType);
                    const tTargets = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY);
                    const totalFYBudget = tTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0);

                    const currBudgetTgts = tTargets.filter(tg => tg.month === app.currentMonth);
                    const currBudget = currBudgetTgts.length > 0 ? currBudgetTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(tTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12);

                    const tProjs = DB.projections.filter(p => p.territory_id === t.id && p.brand === brandFilter && p.month === app.currentMonth && p.sale_type === currentSaleType);
                    const currProj = tProjs.reduce((sum, p) => sum + Number(p.projection_qty || 0), 0);

                    const currSalesRecords = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === app.currentMonth);
                    const currSalesUnits = currSalesRecords.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                    const modelMap = {};
                    currSalesRecords.forEach(s => { modelMap[s.model] = (modelMap[s.model] || 0) + Number(s.unit_qty || 0); });

                    const ytdAchVal = ach(perf.ytd.sales, perf.ytd.budget);
                    const h = ytdAchVal >= 90 ? 'emerald' : (ytdAchVal >= 70 ? 'blue' : 'rose');
                    const currAchVal = ach(currSalesUnits, currBudget);
                    const ytdShortVal = Math.max(0, perf.ytd.budget - perf.ytd.sales);
                    const lmAchVal = ach(perf.lastMonth.sales, perf.lastMonth.budget);

                    return {
                        t,
                        id: t.id,
                        name: t.name,
                        totalFYBudget,
                        perf,
                        ytdAchVal,
                        h,
                        currBudget,
                        currProj,
                        currSalesUnits,
                        modelMap,
                        currAchVal,
                        ytdShortVal,
                        lmAchVal,
                        sortVal_fy_budget: totalFYBudget,
                        sortVal_ytd_budget: perf.ytd.budget,
                        sortVal_ytd_actual: perf.ytd.sales,
                        sortVal_ytd_ach: ytdAchVal,
                        sortVal_ytd_short: ytdShortVal,
                        sortVal_lm_budget: perf.lastMonth.budget,
                        sortVal_lm_actual: perf.lastMonth.sales,
                        sortVal_lm_ach: lmAchVal,
                        sortVal_curr_budget: currBudget,
                        sortVal_curr_proj: currProj,
                        sortVal_curr_actual: currSalesUnits,
                        sortVal_curr_ach: currAchVal
                    };
                });

                const dynamicActiveModels = activeModels.filter(m => 
                    mappedTerritories.some(mt => mt.modelMap[m] > 0)
                );

                // Apply Sorting
                const sortCol = app.pulseSortCol || 'sortVal_curr_ach';
                const sortDir = app.pulseSortDir || 'desc';
                mappedTerritories.sort((a, b) => {
                    let valA = a[sortCol];
                    let valB = b[sortCol];

                    if (sortCol === 'name') {
                        valA = String(a.name).toLowerCase();
                        valB = String(b.name).toLowerCase();
                        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                        return 0;
                    }

                    valA = valA || 0;
                    valB = valB || 0;
                    return sortDir === 'asc' ? valA - valB : valB - valA;
                });

                // Area (AM) Aggregation
                const amUsers = DB.users.filter(u => u.role === 'am' || u.role === 'admin');

                const areaStatsMap = {};
                activeTerritories.forEach(t => {
                    const amUser = amUsers.find(u => Array.isArray(u.territories) && u.territories.includes(t.id));
                    const amName = amUser ? amUser.name.split(' (')[0] : 'Unassigned';
                    const areaName = amUser?.area_name || 'Unassigned Area';

                    if (!areaStatsMap[areaName]) {
                        areaStatsMap[areaName] = {
                            name: areaName,          // Main Title
                            areaName: amName,        // Subtitle (AM Name)
                            ytd: { budget: 0, sales: 0, sply: 0 },
                            lastMonth: { budget: 0, sales: 0, sply: 0 },
                            currBudget: 0, currProj: 0, currSales: 0,
                            mockCurrSply: 0,
                            modelSales: {}
                        };
                    }
                    const aStat = areaStatsMap[areaName];
                    const perf = app.getPerformance(t.id, brandFilter, currentSaleType);
                    aStat.ytd.budget += perf.ytd.budget;
                    aStat.ytd.sales += perf.ytd.sales;
                    aStat.ytd.sply += perf.ytd.sply;
                    aStat.lastMonth.budget += perf.lastMonth.budget;
                    aStat.lastMonth.sales += perf.lastMonth.sales;
                    aStat.lastMonth.sply += perf.lastMonth.sply;

                    const tTargets = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY);
                    const currentTgtsStats = tTargets.filter(tg => tg.month === app.currentMonth);
                    const tBudgetStats = currentTgtsStats.length > 0 ? currentTgtsStats.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(tTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12);
                    aStat.currBudget += tBudgetStats;

                    const tProjs = DB.projections.filter(p => p.territory_id === t.id && p.brand === brandFilter && p.month === app.currentMonth && p.sale_type === currentSaleType);
                    aStat.currProj += tProjs.reduce((sum, p) => sum + Number(p.projection_qty || 0), 0);

                    const tSalesRecords = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === app.currentMonth);
                    const tSales = tSalesRecords.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                    aStat.currSales += tSales;
                    tSalesRecords.forEach(s => { aStat.modelSales[s.model] = (aStat.modelSales[s.model] || 0) + Number(s.unit_qty || 0); });

                    const tCurrSply = DB.sales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sale_type === currentSaleType && s.sales_month === app.currentMonth && s.fy === lastFY).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                    aStat.mockCurrSply += tCurrSply;
                });
                let areaStats = Object.values(areaStatsMap).sort((a, b) => b.currSales - a.currSales);

                // Excel-Like Area Name Filter
                if (app.areaFilterList && app.areaFilterList.length > 0) {
                    areaStats = areaStats.filter(area => app.areaFilterList.includes(area.areaName));
                }

                const pendingManualCount = DB.sales.filter(s => s.is_manual && (s.approval_status === 'Pending Approval' || !s.approval_status)).length;

                const html = `
                    <div class="fade-in pb-12">
                        ${app.getTransitionBannerHtml(currentFY)}
                        <!-- AM / Executive Header -->
                        <div class="mb-4">
                            ${isAM ? `
                            <div class="bg-gradient-to-br from-aci-blue to-indigo-900 p-3 rounded-[1.25rem] shadow-lg border border-white/10 relative overflow-hidden mb-4">
                                <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div class="relative z-10 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                                    
                                    <!-- Left Section: Welcome Info & Mobile-only Sync Badge -->
                                    <div class="flex justify-between items-start w-full md:w-auto">
                                        <div>
                                            <p class="text-[8px] font-black text-indigo-300 uppercase tracking-[0.2em]">${app.currentUser.area_name ? `${app.currentUser.area_name} | ` : ''}AM Pulse: ${activeTerritories.map(t => t.name).join(' & ')}</p>
                                            <h2 class="text-base font-black text-white leading-tight">Welcome, ${app.currentUser.name.split(' ')[0]}</h2>
                                        </div>
                                        
                                        <!-- Mobile-only Live Sync Badge -->
                                        <div class="flex md:hidden items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[8px] font-black text-green-400">
                                            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                            <span>Sync</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Right Section: Switchers & Stats -->
                                    <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                                        <!-- Switchers Group -->
                                        <div class="flex items-center gap-2 flex-grow sm:flex-grow-0 justify-between sm:justify-start">
                                            <!-- Territory Switcher -->
                                            <div class="relative flex-grow sm:flex-grow-0">
                                                <select onchange="app.adminTerritoryFilter=this.value; app.renderAdminDashboard()" 
                                                        class="w-full sm:w-auto appearance-none bg-black/20 border border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-[9px] font-black uppercase tracking-wider text-white focus:outline-none focus:border-white/40 shadow-sm backdrop-blur-md min-w-[110px]">
                                                    <option value="All">All Territories</option>
                                                    ${baseTerritories.map(t => `<option value="${t.id}" ${app.adminTerritoryFilter === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                                                </select>
                                                <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                                    <i data-lucide="chevron-down" class="w-3 h-3"></i>
                                                </div>
                                            </div>

                                            <!-- Brand Switcher -->
                                            <div class="flex bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                                                <button onclick="app.adminBrandTab='Foton'; app.renderAdminDashboard()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${brandFilter === 'Foton' ? 'bg-white shadow-lg text-aci-blue scale-105' : 'text-white/40 hover:text-white/70'}" style="animation: ${brandFilter === 'Foton' ? 'brandActiveGlow 2.5s ease-in-out' : 'brandInactivePulse 2.5s ease-in-out'} infinite;">
                                                    <div class="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm"><img src="https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png" class="h-full object-contain"></div>
                                                    <span class="text-[9px] font-black uppercase tracking-wider">Foton</span>
                                                </button>
                                                <button onclick="app.adminBrandTab='Mahindra'; app.renderAdminDashboard()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${brandFilter === 'Mahindra' ? 'bg-white shadow-lg text-aci-blue scale-105' : 'text-white/40 hover:text-white/70'}" style="animation: ${brandFilter === 'Mahindra' ? 'brandActiveGlow 2.5s ease-in-out' : 'brandInactivePulse 2.5s ease-in-out'} infinite;">
                                                    <div class="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm"><img src="https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png" class="h-full object-contain"></div>
                                                    <span class="text-[9px] font-black uppercase tracking-wider">Mahindra</span>
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Target & Desktop-only Sync Stats -->
                                        <div class="flex items-center gap-3 justify-end ml-auto md:ml-0">
                                            <div class="flex flex-col items-end">
                                                <span class="text-[7px] font-bold text-indigo-200 uppercase">Target</span>
                                                <span class="text-xs font-black text-white">${totalYearlyTarget} Units</span>
                                            </div>
                                            <!-- Desktop-only Sync Indicator -->
                                            <div class="hidden md:flex items-center gap-3">
                                                <div class="w-px h-4 bg-white/20"></div>
                                                <div class="flex flex-col items-end">
                                                    <span class="text-[7px] font-bold text-indigo-200 uppercase">Live</span>
                                                    <span class="text-[10px] font-black text-green-400 flex items-center gap-1"><i data-lucide="activity" class="w-2.5 h-2.5"></i> Sync</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>


                            <!-- AM Style MO-Dashboard Blocks -->
                            ${(() => {
                             const isTransitionMode = (app.currentMonth === 'July' && app.fyReviewActive && currentFY === concludingFY) || app.showLastFYData;
                             const ytdMonths = isTransitionMode ? ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'] : app.getYtdMonths(app.currentMonth);
                             const passedMonths = ytdMonths.length;
                             const monthlyTargets = activeTgts.filter(tg => tg.fy === (isTransitionMode ? concludingFY : currentFY) && ytdMonths.includes(tg.month));
                             const ytdTargetTillLastMonth = isTransitionMode ? monthlyTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : (monthlyTargets.length > 0 ? monthlyTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round((totalYearlyTarget / 12) * passedMonths));
                             const tillLastMonthSalesUnits = salesData.filter(s => s.brand === brandFilter && s.fy === (isTransitionMode ? concludingFY : currentFY) && (isTransitionMode ? true : ytdMonths.includes(s.sales_month))).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                             const totalMonthlyProjection = DB.projections.filter(p => activeTerritories.some(t => t.id === p.territory_id) && p.brand === brandFilter && p.month === app.currentMonth && p.fy === currentFY && p.sale_type === currentSaleType).reduce((sum, p) => sum + Number(p.projection_qty || 0), 0);
                             const currMonthSalesTotal = currFYSales.filter(s => s.brand === brandFilter && s.sales_month === app.currentMonth).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                             const amSplyYtd = activeTerritories.reduce((sum, t) => sum + app.getPerformance(t.id, brandFilter, currentSaleType).ytd.sply, 0);
                             const amSplyMonth = activeTerritories.reduce((sum, t) => sum + DB.sales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sale_type === currentSaleType && s.sales_month === app.currentMonth && s.fy === lastFY).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0), 0);

                             return `
                                 <!-- YTD Overall -->
                                 <div class="glass p-4 rounded-xl shadow-sm border border-white/60 mb-4 relative overflow-hidden">
                                     <div class="absolute -right-10 -top-10 bg-aci-blue/5 w-32 h-32 rounded-full blur-2xl"></div>
                                     <div class="flex justify-between items-center mb-3">
                                         <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                                             <i data-lucide="bar-chart-2" class="w-4 h-4 text-aci-blue/80 animate-[bounce_6s_ease-in-out_infinite]"></i>
                                             ${isTransitionMode ? `Last Fiscal Year Overall Area (${concludingFY})` : `YTD Overall Area (${currentFY})`}
                                         </h3>
                                         <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${isTransitionMode ? 'Full Year Concluding' : `Till ${app.lastMonth}`}</span>
                                     </div>
                                    <div class="grid grid-cols-6 text-center divide-x divide-slate-100 mb-4">
                                        <div class="px-1 flex flex-col justify-center">
                                            <p class="text-[9px] text-slate-400 uppercase font-semibold">${isTransitionMode ? 'FY Target' : 'YTD Target'}</p>
                                            <p class="font-bold text-slate-800 text-sm">${ytdTargetTillLastMonth}</p>
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
                                            <p class="font-bold text-slate-800 text-sm">${amSplyYtd}</p>
                                        </div>
                                        <div class="px-1 flex flex-col justify-center">
                                            <p class="text-[9px] text-slate-400 uppercase font-semibold">Grw%</p>
                                            <p class="text-sm font-bold text-emerald-600">${grw(tillLastMonthSalesUnits, amSplyYtd)}%</p>
                                        </div>
                                    </div>

                                    <!-- Territory YTD Drill-down Rows -->
                                    <div class="mt-4 border-t border-slate-100 pt-3">
                                        <div class="grid grid-cols-7 gap-1 px-2 mb-2">
                                            <div class="text-[8px] font-black text-slate-400 uppercase">Territory</div>
                                            <div class="text-[8px] font-black text-slate-400 uppercase text-center">Target</div>
                                            <div class="text-[8px] font-black text-slate-400 uppercase text-center">Sales</div>
                                            <div class="text-[8px] font-black text-slate-400 uppercase text-center">Ach%</div>
                                            <div class="text-[8px] font-black text-slate-400 uppercase text-center">Gap</div>
                                            <div class="text-[8px] font-black text-slate-400 uppercase text-center">SPLY</div>
                                            <div class="text-[8px] font-black text-slate-400 uppercase text-center">Grw%</div>
                                        </div>
                                        <div class="space-y-1">
                                            ${activeTerritories.map(t => {
                                const tTgtObj = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === (isTransitionMode ? concludingFY : currentFY));
                                const tBudgetYTD = isTransitionMode ? tTgtObj.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round((tTgtObj.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12) * passedMonths);
                                const tSalesYTD = salesData.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.fy === (isTransitionMode ? concludingFY : currentFY) && (isTransitionMode ? true : ytdMonths.includes(s.sales_month))).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                const tAch = ach(tSalesYTD, tBudgetYTD);
                                const tSply = app.getPerformance(t.id, brandFilter, currentSaleType).ytd.sply;
                                const tGrw = grw(tSalesYTD, tSply);

                                return `
                                                    <div class="grid grid-cols-7 gap-1 px-2 py-1.5 bg-slate-50/50 rounded-lg border border-slate-100 items-center hover:bg-slate-100/50 transition-colors">
                                                        <div class="text-[9px] font-black text-slate-700 truncate">${t.name}</div>
                                                        <div class="text-[10px] font-bold text-slate-600 text-center">${tBudgetYTD}</div>
                                                        <div class="text-[10px] font-black text-aci-blue text-center">${tSalesYTD}</div>
                                                        <div class="text-[10px] font-black ${tAch >= 100 ? 'text-emerald-600' : 'text-amber-500'} text-center">${tAch}%</div>
                                                        <div class="text-[10px] font-bold text-red-500 text-center">${Math.max(0, tBudgetYTD - tSalesYTD)}</div>
                                                        <div class="text-[10px] font-bold text-slate-400 text-center">${tSply}</div>
                                                        <div class="text-[10px] font-black ${tGrw >= 0 ? 'text-emerald-600' : 'text-rose-500'} text-center">${tGrw}%</div>
                                                    </div>
                                                `;
                            }).join('')}
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-gradient-to-br ${brandFilter === 'Foton' ? 'from-foton to-[#03133d]' : 'from-mahindra to-[#b81b31]'} rounded-2xl p-4 mb-4 relative overflow-hidden shadow-lg text-white">
                                    <img src="${brandFilter === 'Foton' ? 'https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png' : 'https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png'}" class="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 object-contain grayscale mix-blend-overlay">
                                    <div class="flex justify-between items-center mb-3 border-b border-white/20 pb-2 relative z-10">
                                        <h3 class="font-bold text-sm">Current Month (${app.currentMonth}) - Area Total</h3>
                                        <span class="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold text-white">${currentSaleType}</span>
                                    </div>
                                    
                                    <div class="grid grid-cols-4 gap-y-4 gap-x-2 text-center mb-4 relative z-10">
                                        <div><p class="text-[9px] text-white/70 uppercase font-semibold">Budget</p><p class="font-bold text-lg text-white">${monthlyBudget}</p></div>
                                        <div><p class="text-[9px] text-white/70 uppercase font-semibold">Projection</p><p class="font-bold text-lg text-white">${totalMonthlyProjection}</p></div>
                                        <div class="col-span-2 border-l border-white/20"><p class="text-[9px] text-white/70 uppercase font-semibold">Sales Till Now</p><p class="font-bold text-2xl text-yellow-300">${currMonthSalesTotal}</p></div>
                                        
                                        <div class="col-span-2 bg-black/20 rounded-lg py-1"><p class="text-[9px] text-white/70 uppercase font-semibold">Ach% (Budget)</p><p class="font-bold text-sm text-green-300">${ach(currMonthSalesTotal, monthlyBudget)}%</p></div>
                                        <div class="col-span-2 bg-black/20 rounded-lg py-1"><p class="text-[9px] text-white/70 uppercase font-semibold">Ach% (Proj)</p><p class="font-bold text-sm text-amber-300">${ach(currMonthSalesTotal, totalMonthlyProjection)}%</p></div>
                                    </div>

                                    <div class="mt-4 border-t border-white/20 pt-3 relative z-10">
                                        <div class="grid grid-cols-6 gap-1 px-2 mb-2">
                                            <div class="text-[8px] font-bold text-white/50 uppercase">Territory</div>
                                            <div class="text-[8px] font-bold text-white/50 uppercase text-center">Budget</div>
                                            <div class="text-[8px] font-bold text-white/50 uppercase text-center">Proj</div>
                                            <div class="text-[8px] font-bold text-white/50 uppercase text-center">Sales</div>
                                            <div class="text-[8px] font-bold text-white/50 uppercase text-center">Ach(B)</div>
                                            <div class="text-[8px] font-bold text-white/50 uppercase text-center">Ach(P)</div>
                                        </div>
                                        <div class="space-y-1">
                                            ${activeTerritories.map(t => {
                                const tTgtObj = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY);
                                const currentTgtsM = tTgtObj.filter(tg => tg.month === app.currentMonth);
                                const tBudgetM = currentTgtsM.length > 0 ? currentTgtsM.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(tTgtObj.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12);
                                const tProjM = DB.projections.filter(p => p.territory_id === t.id && p.brand === brandFilter && p.month === app.currentMonth && p.sale_type === currentSaleType).reduce((sum, p) => sum + Number(p.projection_qty || 0), 0);
                                const tSalesM = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === app.currentMonth).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                const tAchB = ach(tSalesM, tBudgetM);
                                const tAchP = ach(tSalesM, tProjM);

                                return `
                                                    <div class="grid grid-cols-6 gap-1 px-2 py-1 bg-black/10 rounded border border-white/5 items-center">
                                                        <div class="text-[9px] font-bold text-white/90 truncate">${t.name}</div>
                                                        <div class="text-[10px] font-medium text-white/80 text-center">${tBudgetM}</div>
                                                        <div class="text-[10px] font-medium text-white/80 text-center">${tProjM}</div>
                                                        <div class="text-[10px] font-black text-yellow-300 text-center">${tSalesM}</div>
                                                        <div class="text-[9px] font-black ${tAchB >= 100 ? 'text-green-400' : 'text-amber-300'} text-center">${tAchB}%</div>
                                                        <div class="text-[9px] font-black ${tAchP >= 100 ? 'text-green-400' : 'text-amber-300'} text-center">${tAchP}%</div>
                                                    </div>
                                                `;
                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                                `;
                        })()}

                            <!-- AM: Current Month Performance Dashboard (Creative pacing) -->
                            ${(() => {
                            const currMonthSalesPacing = currFYSales.filter(s => s.brand === brandFilter && s.sales_month === app.currentMonth).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                            const currMonthBudget = monthlyBudget;
                            const monthAch = ach(currMonthSalesPacing, currMonthBudget);
                            const daysInMonth = 30;
                            const currentDay = 14;
                            const monthProgress = Math.round((currentDay / daysInMonth) * 100);
                            const isAhead = monthAch >= monthProgress;
                            const dailyRunRate = currMonthSalesPacing / currentDay;
                            const predictedFinish = Math.round(dailyRunRate * daysInMonth);
                            const predictedAch = ach(predictedFinish, currMonthBudget);

                            return `
                                <div class="glass p-4 rounded-[1.5rem] border border-white shadow-xl mb-6 relative overflow-hidden">
                                    <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <div class="flex items-center gap-2 mb-4">
                                        <div class="p-2 bg-indigo-100 rounded-lg text-indigo-600"><i data-lucide="zap" class="w-4 h-4"></i></div>
                                        <h3 class="font-black text-slate-800 text-sm tracking-tight">${app.currentMonth} Pacing Monitor</h3>
                                        <span class="ml-auto bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-slate-200 uppercase">Day ${currentDay} of ${daysInMonth}</span>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div class="flex flex-col gap-1">
                                            <div class="flex justify-between items-end mb-1">
                                                <span class="text-[10px] font-black text-slate-400 uppercase">Month Achievement</span>
                                                <span class="text-sm font-black ${isAhead ? 'text-emerald-600' : 'text-amber-500'}">${monthAch}%</span>
                                            </div>
                                            <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                                <div class="h-full bg-indigo-600 rounded-full" style="width: ${monthAch}%"></div>
                                            </div>
                                            <div class="flex justify-between mt-1">
                                                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Budget: ${currMonthBudget}</span>
                                                <span class="text-[8px] font-bold text-indigo-500 uppercase tracking-tighter">${monthProgress}% Time Elapsed</span>
                                            </div>
                                        </div>

                                        <div class="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <p class="text-[9px] font-black text-slate-400 uppercase mb-0.5">Predicted Finish</p>
                                                <h4 class="text-lg font-black text-slate-800">${predictedFinish} <span class="text-[10px] text-slate-400">Units</span></h4>
                                            </div>
                                            <div class="text-right">
                                                <p class="text-[14px] font-black ${predictedAch >= 100 ? 'text-emerald-600' : 'text-rose-500'}">${predictedAch}%</p>
                                                <p class="text-[7px] font-bold text-slate-400 uppercase leading-none">Est. Ach</p>
                                            </div>
                                        </div>

                                        <div class="bg-indigo-900 rounded-2xl p-3 shadow-lg flex items-center justify-between text-white border border-white/10">
                                            <div>
                                                <p class="text-[9px] font-black text-indigo-300 uppercase mb-0.5">Req. Daily Rate</p>
                                                <h4 class="text-lg font-black">${Math.max(0, Math.ceil((currMonthBudget - currMonthSalesPacing) / (daysInMonth - currentDay)))}</h4>
                                            </div>
                                            <div class="p-2 bg-white/10 rounded-xl"><i data-lucide="trending-up" class="w-5 h-5 text-indigo-200"></i></div>
                                        </div>
                                    </div>

                                    <div class="mt-6 pt-4 border-t border-slate-100">
                                        <div class="flex items-center gap-2 mb-3">
                                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Territory Drill-down</p>
                                            <div class="h-px flex-1 bg-slate-50"></div>
                                        </div>
                                        <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                            ${activeTerritories.map(t => {
                                const tTgtObj = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY);
                                const currTgtsT = tTgtObj.filter(tg => tg.month === app.currentMonth);
                                const tBudget = currTgtsT.length > 0 ? currTgtsT.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(tTgtObj.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12);
                                const tSales = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === app.currentMonth).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                const tAch = ach(tSales, tBudget);
                                const tIsAhead = tAch >= monthProgress;

                                return `
                                                    <div class="shrink-0 flex items-center gap-3 bg-white border border-slate-100 p-2 rounded-xl shadow-sm min-w-[140px]">
                                                        <div class="w-1.5 h-6 rounded-full ${tIsAhead ? 'bg-emerald-500' : 'bg-rose-400'}"></div>
                                                        <div>
                                                            <h5 class="text-[10px] font-black text-slate-800 leading-none mb-1 truncate w-24">${t.name}</h5>
                                                            <div class="flex items-center gap-2">
                                                                 <span class="text-[12px] font-black text-slate-700">${tSales}/${tBudget}</span>
                                                                 <span class="text-[9px] font-black ${tIsAhead ? 'text-emerald-600' : 'text-rose-500'}">${tAch}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                                `;
                        })()}

                            ` : ''}

                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                <div>
                                    <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 ${theme.bgClass} rounded-full ${theme.shadowClass}"></div><h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.textTitleClass} tracking-tight">${isAM ? 'Area Analytics' : 'Executive Core'}</h1></div>
                                    <p class="text-sm font-medium text-slate-500">Live performance tracking for ${app.currentMonth} 2026</p>
                                </div>
                                <div class="flex items-center gap-2 w-full sm:w-auto">
                                    <!-- Dynamic Fiscal Year Selector -->
                                    <div class="relative">
                                        <select onchange="app.selectedFY = this.value; app.renderAdminDashboard()" 
                                                class="appearance-none bg-white border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-700 rounded-xl pl-3 pr-8 py-2.5 shadow-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer min-w-[95px]">
                                            ${[...new Set([...DB.sales.map(s => s.fy), ...DB.targets.map(t => t.fy), app.currentFY])].filter(Boolean).sort().reverse().map(fy => `<option value="${fy}" ${fy === currentFY ? 'selected' : ''}>FY ${fy}</option>`).join('')}
                                        </select>
                                        <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
                                        </div>
                                    </div>

                                    <button onclick="app.renderAdminEMI()" class="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r ${theme.btnGradient} text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all duration-300 font-black text-[10px] uppercase tracking-wider group relative overflow-hidden">
                                        <span class="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                                        <i data-lucide="banknote" class="w-3.5 h-3.5 transition-transform group-hover:rotate-12 group-hover:scale-110"></i>
                                        <span>EMI Analytics</span>
                                    </button>

                                    ${!isAM ? `
                                    <button onclick="app.renderAdminManualDeliveries()" class="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r ${theme.btnGradient} text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all duration-300 font-black text-[10px] uppercase tracking-wider group relative overflow-hidden">
                                        <span class="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                                        <i data-lucide="clipboard-list" class="w-3.5 h-3.5 transition-transform group-hover:rotate-12 group-hover:scale-110"></i>
                                        <span>Manual Deliveries</span>
                                        ${pendingManualCount > 0 ? `<span class="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white border-2 border-white animate-pulse shadow-sm">${pendingManualCount}</span>` : ''}
                                    </button>
                                    ` : ''}

                                    <div class="flex bg-slate-200/50 p-1 rounded-xl flex-1 sm:flex-none border border-slate-200">
                                        <button onclick="app.adminSaleTypeTab='New Sale'; app.renderAdminDashboard()" class="flex-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${currentSaleType === 'New Sale' ? 'bg-white shadow-md text-aci-blue' : 'text-slate-500 hover:text-slate-800'}">NEW</button>
                                        <button onclick="app.adminSaleTypeTab='Resale'; app.renderAdminDashboard()" class="flex-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${currentSaleType === 'Resale' ? 'bg-white shadow-md text-aci-blue' : 'text-slate-500 hover:text-slate-800'}">RESALE</button>
                                    </div>
                                    ${!isAM ? `
                                    <button onclick="app.downloadRawCSV()" class="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                                        <i data-lucide="download" class="w-5 h-5"></i>
                                    </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                    <!-- YOY Trajectory Chart -->
                    <div class="glass p-5 rounded-[2rem] border border-white shadow-xl mb-8 relative overflow-hidden">
                        <div class="absolute -right-20 -top-20 bg-indigo-500/5 w-64 h-64 rounded-full blur-3xl pointer-events-none"></div>
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                            <!-- Left: Chart & Controls (Col span 2) -->
                            <div class="lg:col-span-2 flex flex-col justify-between">
                                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                    <div>
                                        <h3 class="font-bold text-slate-800 flex items-center gap-2"><i data-lucide="git-compare" class="w-4 h-4 text-indigo-500"></i> Performance vs Budget & YOY</h3>
                                        <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Month by Month Comparative Velocity & Pacing</p>
                                    </div>
                                    <div class="flex items-center gap-3 flex-wrap">
                                        <label class="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                                            <input type="checkbox" onchange="app.yoyShowLY = this.checked; app.renderAdminDashboard()" ${app.yoyShowLY ? 'checked' : ''} class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3">
                                            <span class="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Vs Last Year</span>
                                        </label>

                                        <!-- Territory Filter Dropdown -->
                                        <div class="relative">
                                            <select onchange="app.yoyTerritoryFilter = this.value; app.renderAdminDashboard()" 
                                                    class="appearance-none bg-white/80 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm min-w-[120px]">
                                                <option value="All">All Territories</option>
                                                ${activeTerritories.map(t => `<option value="${t.id}" ${app.yoyTerritoryFilter === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                                            </select>
                                            <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <i data-lucide="chevron-down" class="w-3 h-3"></i>
                                            </div>
                                        </div>
                                        
                                        <!-- Creative Brand Logo Toggle -->
                                        <div class="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200 shadow-inner">
                                            <button onclick="app.yoyBrandTab='Foton'; app.renderAdminDashboard()" 
                                                    class="relative flex items-center justify-center px-4 py-2 rounded-md transition-all duration-300 ${app.yoyBrandTab === 'Foton' ? 'bg-white shadow-sm border border-slate-200/50 scale-105 z-10' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}">
                                                <img src="https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png" class="h-6 object-contain" alt="Foton">
                                            </button>
                                            <div class="w-px h-5 bg-slate-300 mx-1"></div>
                                            <button onclick="app.yoyBrandTab='Mahindra'; app.renderAdminDashboard()" 
                                                    class="relative flex items-center justify-center px-4 py-2 rounded-md transition-all duration-300 ${app.yoyBrandTab === 'Mahindra' ? 'bg-white shadow-sm border border-slate-200/50 scale-105 z-10' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}">
                                                <img src="https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png" class="h-5 object-contain" alt="Mahindra">
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="h-64 relative w-full mb-3">
                                    <canvas id="chartYoyTrend"></canvas>
                                </div>
                                <!-- Creative Month-by-Month Performance Ribbon -->
                                <div id="yoy-monthly-ribbon" class="w-full flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 custom-scrollbar"></div>
                            </div>
                            
                            <!-- Right: Bangladesh Sales Heatmap (Col span 1) -->
                            <div class="lg:col-span-1 flex flex-col bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative min-h-[300px]">
                                <div class="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <i data-lucide="map" class="w-3.5 h-3.5 text-indigo-500"></i> ${app.currentMonth} Sales Map
                                        </h4>
                                        <p class="text-[9px] text-slate-400 font-medium mt-0.5">District wise actual units</p>
                                    </div>
                                    <span id="minimap-sales-total" class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-full border border-indigo-100">0 Units</span>
                                </div>
                                <div id="dashboard-mini-map" class="w-full rounded-xl overflow-hidden border border-slate-200/60 shadow-inner h-[250px]" style="height: 250px; min-height: 250px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- =====================================
                    // BRAND SUMMARY MATRIX
                    // ===================================== -->
                    ${(() => {
                        const brands = ['Foton', 'Mahindra'];
                        const ytdMonths = app.getYtdMonths(app.currentMonth);
                        const isFirstMonth = ytdMonths.length === 0;
                        const ytdMonthsForCalc = isFirstMonth ? ['July'] : ytdMonths;
                        const lastMonth = app.lastMonth;
                        const currMonth = app.currentMonth;
                        
                        let brandSummaryRowsHTML = '';
                        let gTot = { fyBgt: 0, yBgt: 0, yAct: 0, ySht: 0, lBgt: 0, lAct: 0, cBgt: 0, cAct: 0 };
                        
                        brands.forEach(b => {
                            let bSales = currFYSales.filter(s => s.brand === b);
                            let bTgts = DB.targets.filter(t => t.fy === currentFY && t.brand === b && t.sale_type === currentSaleType);
                            
                            if (isAM) {
                                bSales = bSales.filter(s => app.currentUser.territories.includes(s.territory_id));
                                bTgts = bTgts.filter(t => app.currentUser.territories.includes(t.territory_id));
                            }
                            if (app.adminTerritoryFilter && app.adminTerritoryFilter !== 'All') {
                                bSales = bSales.filter(s => s.territory_id === app.adminTerritoryFilter);
                                bTgts = bTgts.filter(t => t.territory_id === app.adminTerritoryFilter);
                            }

                            const fyBgt = bTgts.reduce((sum, t) => sum + Number(t.target_qty || 0), 0);
                            const yBgt = bTgts.filter(t => ytdMonthsForCalc.includes(t.month)).reduce((sum, t) => sum + Number(t.target_qty || 0), 0) || Math.round((fyBgt / 12) * ytdMonthsForCalc.length);
                            const yAct = bSales.filter(s => ytdMonthsForCalc.includes(s.sales_month)).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                            const yAch = yBgt > 0 ? Math.round((yAct/yBgt)*100) : 0;
                            const ySht = yBgt - yAct;

                            const lBgt = bTgts.filter(t => t.month === lastMonth).reduce((sum, t) => sum + Number(t.target_qty || 0), 0) || Math.round(fyBgt / 12);
                            const lAct = bSales.filter(s => s.sales_month === lastMonth).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                            const lAch = lBgt > 0 ? Math.round((lAct/lBgt)*100) : 0;

                            const cBgt = bTgts.filter(t => t.month === currMonth).reduce((sum, t) => sum + Number(t.target_qty || 0), 0) || Math.round(fyBgt / 12);
                            const cAct = bSales.filter(s => s.sales_month === currMonth).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                            const cAch = cBgt > 0 ? Math.round((cAct/cBgt)*100) : 0;

                            gTot.fyBgt += fyBgt; gTot.yBgt += yBgt; gTot.yAct += yAct; gTot.ySht += ySht;
                            gTot.lBgt += lBgt; gTot.lAct += lAct; gTot.cBgt += cBgt; gTot.cAct += cAct;

                            const achColor = (a) => a >= 100 ? 'text-emerald-600' : (a >= 80 ? 'text-amber-500' : 'text-rose-500');

                            brandSummaryRowsHTML += `
                                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors text-center">
                                    <td class="px-4 py-2 text-left font-black text-slate-800 border-r border-slate-100 font-bold">
                                        <div class="flex items-center gap-2">
                                            <div class="w-1.5 h-4 ${b === 'Foton' ? 'bg-foton' : 'bg-mahindra'} rounded-full"></div>
                                            ${b}
                                        </div>
                                    </td>
                                    <td class="px-3 py-2 font-bold text-slate-600 bg-slate-50/50 border-r border-slate-100">${fyBgt}</td>
                                          <td class="px-3 py-2 font-medium text-slate-500">${isFirstMonth ? '-' : yBgt}</td>
                                    <td class="px-3 py-2 font-bold text-slate-800">${isFirstMonth ? '-' : yAct}</td>
                                    <td class="px-3 py-2 font-black ${isFirstMonth ? 'text-slate-400' : achColor(yAch)}">${isFirstMonth ? '-' : `${yAch}%`}</td>
                                    <td class="px-3 py-2 font-bold text-rose-500 border-r border-slate-100">${isFirstMonth ? '-' : ySht}</td>

                                    <td class="px-3 py-2 font-medium text-slate-500 bg-slate-50/30">${isFirstMonth ? '-' : lBgt}</td>
                                    <td class="px-3 py-2 font-bold text-slate-800 bg-slate-50/30">${isFirstMonth ? '-' : lAct}</td>
                                    <td class="px-3 py-2 font-black ${isFirstMonth ? 'text-slate-400' : achColor(lAch)} bg-slate-50/30 border-r border-slate-100">${isFirstMonth ? '-' : `${lAch}%`}</td>

                                    <td class="px-3 py-2 font-medium text-slate-500">${cBgt}</td>
                                    <td class="px-3 py-2 font-black text-indigo-900 bg-indigo-100/50">${cAct}</td>
                                    <td class="px-3 py-2 font-black ${achColor(cAch)}">${cAch}%</td>
                                </tr>
                            `;
                        });

                        const gYAch = gTot.yBgt > 0 ? Math.round((gTot.yAct/gTot.yBgt)*100) : 0;
                        const gLAch = gTot.lBgt > 0 ? Math.round((gTot.lAct/gTot.lBgt)*100) : 0;
                        const gCAch = gTot.cBgt > 0 ? Math.round((gTot.cAct/gTot.cBgt)*100) : 0;
                        const achColor = (a) => a >= 100 ? 'text-emerald-600' : (a >= 80 ? 'text-amber-500' : 'text-rose-500');

                        return `
                            <div class="glass rounded-[2rem] border border-white shadow-xl overflow-hidden mb-8">
                                <div class="overflow-x-auto custom-scrollbar">
                                    <table class="w-full text-left text-[11px] whitespace-nowrap border-collapse">
                                        <thead>
                                            <tr class="bg-slate-100/80 text-slate-600 uppercase tracking-widest text-[9px] border-b border-slate-200">
                                                <th class="px-4 py-3 font-black border-r border-slate-200 sticky left-0 z-10 bg-slate-100" rowspan="2">Brand</th>
                                                <th class="px-3 py-3 font-extrabold text-center border-r border-slate-200" rowspan="2">Total FY Budget</th>
                                                <th class="px-3 py-2 text-center bg-violet-500/10 text-violet-800 border-r border-slate-200 font-black" colspan="4">YTD (${isFirstMonth ? 'N/A' : `Jul-${lastMonth.substring(0,3)}`})</th>
                                                <th class="px-3 py-2 text-center bg-amber-500/10 text-amber-800 border-r border-slate-200 font-black" colspan="3">Last Month (${isFirstMonth ? 'N/A' : lastMonth.substring(0,3)})</th>
                                                <th class="px-3 py-2 text-center bg-emerald-500/10 text-emerald-800 font-black" colspan="3">Current Month (${currMonth.substring(0,3)})</th>
                                            </tr>
                                            <tr class="bg-slate-50/80 text-slate-500 uppercase tracking-widest text-[9px] border-b border-slate-200 text-center">
                                                <!-- YTD -->
                                                <th class="px-3 py-1.5 border-t border-slate-200">Budget</th>
                                                <th class="px-3 py-1.5 border-t border-slate-200">Actual</th>
                                                <th class="px-3 py-1.5 border-t border-slate-200">Ach%</th>
                                                <th class="px-3 py-1.5 border-t border-slate-200 border-r border-slate-200">Short</th>
                                                <!-- Last Month -->
                                                <th class="px-3 py-1.5 border-t border-slate-200">Budget</th>
                                                <th class="px-3 py-1.5 border-t border-slate-200">Actual</th>
                                                <th class="px-3 py-1.5 border-t border-slate-200 border-r border-slate-200">Ach%</th>
                                                <!-- Current Month -->
                                                <th class="px-3 py-1.5 border-t border-slate-200">Budget</th>
                                                <th class="px-3 py-1.5 border-t border-indigo-200 bg-indigo-100 text-indigo-900 font-extrabold">Total Delivered</th>
                                                <th class="px-3 py-1.5 border-t border-slate-200">Ach%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${brandSummaryRowsHTML}
                                            <tr class="bg-slate-100/50 font-black text-slate-800 text-center border-t-2 border-slate-200">
                                                <td class="px-4 py-2 text-left border-r border-slate-200 sticky left-0 z-10 bg-slate-100 font-bold">GRAND TOTAL</td>
                                                <td class="px-3 py-2 border-r border-slate-200">${gTot.fyBgt}</td>
                                                
                                                <td class="px-3 py-2">${isFirstMonth ? '-' : gTot.yBgt}</td>
                                                <td class="px-3 py-2">${isFirstMonth ? '-' : gTot.yAct}</td>
                                                <td class="px-3 py-2 ${isFirstMonth ? 'text-slate-400' : achColor(gYAch)}">${isFirstMonth ? '-' : `${gYAch}%`}</td>
                                                <td class="px-3 py-2 text-rose-600 border-r border-slate-200">${isFirstMonth ? '-' : gTot.ySht}</td>

                                                <td class="px-3 py-2 bg-slate-50/30">${isFirstMonth ? '-' : gTot.lBgt}</td>
                                                <td class="px-3 py-2 bg-slate-50/30">${isFirstMonth ? '-' : gTot.lAct}</td>
                                                <td class="px-3 py-2 ${isFirstMonth ? 'text-slate-400' : achColor(gLAch)} bg-slate-50/30 border-r border-slate-200">${isFirstMonth ? '-' : `${gLAch}%`}</td>

                                                <td class="px-3 py-2">${gTot.cBgt}</td>
                                                <td class="px-3 py-2 text-indigo-900 bg-indigo-200/50 font-extrabold">${gTot.cAct}</td>
                                                <td class="px-3 py-2 ${achColor(gCAch)}">${gCAch}%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    })()}

                    <!-- Charts -->
                    <div class="grid grid-cols-1 ${isAM ? 'md:grid-cols-2' : 'lg:grid-cols-3'} gap-4 mb-6">
                        <div class="${isAM ? '' : 'lg:col-span-2'} glass p-3 rounded-xl border border-slate-200 shadow-sm">
                            <h3 class="font-bold text-slate-800 mb-2 text-[10px] flex items-center gap-1.5 uppercase tracking-wider">
                                <i data-lucide="bar-chart-2" class="w-3 h-3 text-aci-blue"></i> Territory Performance
                            </h3>
                            <div class="${isAM ? 'h-36' : 'h-64'} relative w-full">
                                <canvas id="chartTerritory"></canvas>
                            </div>
                        </div>
                        <div class="glass p-3 rounded-xl border border-slate-200 shadow-sm">
                            <h3 class="font-bold text-slate-800 mb-2 text-[10px] flex items-center gap-1.5 uppercase tracking-wider">
                                <i data-lucide="pie-chart" class="w-3 h-3 text-aci-blue"></i> Brand Split
                            </h3>
                            <div class="${isAM ? 'h-36' : 'h-64'} relative w-full flex justify-center">
                                <canvas id="chartBrand"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- AM: Territory Performance Analytics Table (Admin Parity) -->
                    ${isAM ? `
                    <div class="glass rounded-[2rem] border border-white shadow-xl overflow-hidden mb-8 relative">
                        <div class="absolute -right-20 -top-20 bg-emerald-500/5 w-64 h-64 rounded-full blur-3xl pointer-events-none"></div>
                        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
                            <div>
                                <h3 class="font-black text-slate-800 flex items-center gap-2">
                                    <div class="p-1.5 bg-white rounded-lg shadow-sm border border-emerald-100">
                                        <i data-lucide="bar-chart-horizontal" class="w-5 h-5 text-emerald-600"></i>
                                    </div>
                                    Territory Performance Analytics
                                </h3>
                                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Full Performance Breakdown for Assigned Territories</p>
                            </div>
                            <div class="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                                <!-- Territory Filter -->
                                <div class="relative shrink-0">
                                    <select onchange="app.adminTerritoryFilter=this.value; app.renderAdminDashboard()" 
                                            class="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm min-w-[140px]">
                                        <option value="All">All Territories</option>
                                        ${baseTerritories.map(t => `<option value="${t.id}" ${app.adminTerritoryFilter === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                                    </select>
                                    <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <i data-lucide="chevron-down" class="w-3 h-3"></i>
                                    </div>
                                </div>

                                <div class="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                                    <button onclick="app.adminBrandTab='Foton'; app.renderAdminDashboard()" class="px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${brandFilter === 'Foton' ? 'bg-white shadow-md text-aci-blue' : 'text-slate-500 hover:text-slate-800'}">FOTON</button>
                                    <button onclick="app.adminBrandTab='Mahindra'; app.renderAdminDashboard()" class="px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${brandFilter === 'Mahindra' ? 'bg-white shadow-md text-aci-blue' : 'text-slate-500 hover:text-slate-800'}">MAHINDRA</button>
                                </div>

                                <button onclick="app.adminShowYTD = !app.adminShowYTD; app.renderAdminDashboard()" 
                                        class="shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${app.adminShowYTD ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-200'}">
                                    <i data-lucide="${app.adminShowYTD ? 'eye' : 'eye-off'}" class="w-3 h-3"></i> YTD
                                </button>
                                <button onclick="app.adminShowLastMonth = !app.adminShowLastMonth; app.renderAdminDashboard()" 
                                        class="shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${app.adminShowLastMonth ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-200'}">
                                    <i data-lucide="${app.adminShowLastMonth ? 'eye' : 'eye-off'}" class="w-3 h-3"></i> L.Month
                                </button>
                                <button onclick="app.downloadPulseCSV()" 
                                        class="shrink-0 p-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-sm hover:shadow hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5"
                                        title="Download Territory Pulse CSV">
                                    <i data-lucide="download" class="w-3.5 h-3.5"></i>
                                    <span class="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Export</span>
                                </button>
                            </div>
                        </div>

                        <!-- Creative Month Filter Pill Bar -->
                        <div class="px-5 py-3.5 bg-slate-50/40 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                            <div class="flex items-center gap-2 relative z-10">
                                <span class="flex h-2 w-2 relative">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">Performance Focus:</span>
                                <span class="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/50">${app.performanceFilterMonth || app.currentMonth} ${currentFY}</span>
                            </div>
                            
                            <!-- Scrollable Months container -->
                            <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 custom-scrollbar select-none relative z-10">
                                ${['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => {
                                    const isActive = (app.performanceFilterMonth || app.currentMonth) === m;
                                    const isCurrentSetting = app.currentMonth === m;
                                    const shortName = m.substring(0, 3).toUpperCase();
                                    return `
                                        <button onclick="app.performanceFilterMonth='${m}'; app.renderAdminDashboard()" 
                                                class="px-3.5 py-1.5 rounded-xl text-[9px] font-black tracking-wider transition-all duration-300 shrink-0 relative flex items-center gap-1.5 ${
                                                    isActive 
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 scale-105 border border-emerald-400/30' 
                                                    : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/60 shadow-sm'
                                                }">
                                            ${isCurrentSetting ? `<span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-500'}"></span>` : ''}
                                            ${shortName}
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        ${(() => {
                            const performanceMonth = app.performanceFilterMonth || app.currentMonth;
                            const activeTerrs = activeTerritories.filter(t => !app.adminTerritoryFilter || app.adminTerritoryFilter === 'All' || t.id === app.adminTerritoryFilter);
                            const activeTerrIds = activeTerrs.map(t => t.id);

                            const currentSales = currFYSales.filter(s => activeTerrIds.includes(s.territory_id) && s.brand === brandFilter && s.sales_month === performanceMonth && Number(s.unit_qty) > 0);
                            const modelsWithSales = new Set(currentSales.map(s => s.model));
                            const dynamicModels = activeModels.filter(m => modelsWithSales.has(m));

                            let totalYtdBudget = 0;
                            let totalYtdSales = 0;
                            let totalYtdShort = 0;
                            let totalLastMonthBudget = 0;
                            let totalLastMonthSales = 0;
                            let totalCurrBudget = 0;
                            let totalCurrProj = 0;
                            const totalModelMap = {};
                            let totalCurrSalesUnits = 0;

                            const rowsHTML = activeTerrs.map(t => {
                                const _tTargets = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY);
                                const _currTgts = _tTargets.filter(tg => tg.month === performanceMonth);
                                const _currBudget = _currTgts.length > 0 ? _currTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(_tTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12);
                                const _currSales = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === performanceMonth).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                t._sortAch = ach(_currSales, _currBudget);
                                return t;
                            }).sort((a, b) => b._sortAch - a._sortAch).map(t => {
                                const perf = app.getPerformance(t.id, brandFilter, currentSaleType);
                                const tTargets = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY);
                                const currTgts = tTargets.filter(tg => tg.month === performanceMonth);
                                const currBudget = currTgts.length > 0 ? currTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(tTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12);
                                const tProjs = DB.projections.filter(p => p.territory_id === t.id && p.brand === brandFilter && p.month === performanceMonth && p.sale_type === currentSaleType);
                                const currProj = tProjs.reduce((sum, p) => sum + Number(p.projection_qty || 0), 0);
                                const currSalesRecords = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === performanceMonth);
                                const currSalesUnits = currSalesRecords.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                const modelMap = {};
                                currSalesRecords.forEach(s => { modelMap[s.model] = (modelMap[s.model] || 0) + Number(s.unit_qty || 0); });
                                const ytdAchVal = ach(perf.ytd.sales, perf.ytd.budget);
                                const h = ytdAchVal >= 90 ? 'emerald' : (ytdAchVal >= 70 ? 'blue' : 'rose');

                                totalYtdBudget += perf.ytd.budget;
                                totalYtdSales += perf.ytd.sales;
                                totalYtdShort += Math.max(0, perf.ytd.budget - perf.ytd.sales);
                                totalLastMonthBudget += perf.lastMonth.budget;
                                totalLastMonthSales += perf.lastMonth.sales;
                                totalCurrBudget += currBudget;
                                totalCurrProj += currProj;
                                dynamicModels.forEach(m => {
                                    totalModelMap[m] = (totalModelMap[m] || 0) + (modelMap[m] || 0);
                                });
                                totalCurrSalesUnits += currSalesUnits;

                                const currAchVal = ach(currSalesUnits, currBudget);
                                let achBg, achText;
                                if (currAchVal >= 100) { achBg = 'bg-emerald-100'; achText = 'text-emerald-700'; }
                                else if (currAchVal >= 80) { achBg = 'bg-lime-100'; achText = 'text-lime-700'; }
                                else if (currAchVal >= 60) { achBg = 'bg-amber-100'; achText = 'text-amber-700'; }
                                else { achBg = 'bg-rose-100'; achText = 'text-rose-700'; }

                                return `
                                                <tr class="hover:bg-slate-50/50 transition-colors group text-center border-b border-slate-100/50">
                                                    <td class="px-5 py-1 text-left sticky left-0 z-10 bg-white border-r border-slate-50 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                                        <div class="flex items-center gap-1.5">
                                                            <div class="w-1 h-3.5 bg-${h}-500 rounded-full"></div>
                                                            <span class="font-black text-slate-700 text-[11px]">${t.name}</span>
                                                        </div>
                                                    </td>
                                                    ${app.adminShowYTD ? `
                                                        <td class="px-2 py-1 text-slate-400 font-medium text-center">${perf.ytd.budget}</td>
                                                        <td class="px-2 py-1 font-black text-slate-700 text-center">${perf.ytd.sales}</td>
                                                        <td class="px-2 py-1 text-center"><span class="px-1.5 py-0.5 rounded-lg bg-${h}-50 text-${h}-600 font-black">${ytdAchVal}%</span></td>
                                                        <td class="px-2 py-1 font-bold text-rose-500 text-center">${Math.max(0, perf.ytd.budget - perf.ytd.sales)}</td>
                                                    ` : ''}
                                                    ${app.adminShowLastMonth ? `
                                                        <td class="px-2 py-1 text-slate-400 font-medium text-center">${perf.lastMonth.budget}</td>
                                                        <td class="px-2 py-1 font-black text-slate-700 text-center">${perf.lastMonth.sales}</td>
                                                        <td class="px-2 py-1 font-black text-slate-600 text-center">${ach(perf.lastMonth.sales, perf.lastMonth.budget)}%</td>
                                                    ` : ''}
                                                    <td class="px-2 py-1 bg-slate-50/50 text-slate-400 font-medium text-center">${currBudget}</td>
                                                    <td class="px-2 py-1 bg-slate-50/50 font-black text-slate-700 text-center">${currProj}</td>
                                                    ${dynamicModels.map(m => `<td class="px-2 py-1 bg-slate-50/50 font-bold text-center ${modelMap[m] ? 'text-indigo-600' : 'text-slate-300'}">${modelMap[m] || '-'}</td>`).join('')}
                                                    <td class="px-2 py-1 bg-indigo-50/30 font-black text-indigo-700 text-sm text-center">${currSalesUnits}</td>
                                                    <td class="px-2 py-1 text-center ${achBg}"><span class="px-2 py-0.5 rounded-md text-[10px] font-black inline-block min-w-[38px] ${achText}">${currAchVal}%</span></td>
                                                </tr>
                                            `;
                            }).join('');

                            const totalYtdAchVal = ach(totalYtdSales, totalYtdBudget);
                            const totalH = totalYtdAchVal >= 90 ? 'emerald' : (totalYtdAchVal >= 70 ? 'blue' : 'rose');

                            const totalCurrAchVal = ach(totalCurrSalesUnits, totalCurrBudget);
                            let tAchBg, tAchText;
                            if (totalCurrAchVal >= 100) { tAchBg = 'bg-emerald-100'; tAchText = 'text-emerald-700'; }
                            else if (totalCurrAchVal >= 80) { tAchBg = 'bg-lime-100'; tAchText = 'text-lime-700'; }
                            else if (totalCurrAchVal >= 60) { tAchBg = 'bg-amber-100'; tAchText = 'text-amber-700'; }
                            else { tAchBg = 'bg-rose-100'; tAchText = 'text-rose-700'; }

                            const totalRowHTML = `
                                            <tr class="bg-indigo-50/20 font-black text-slate-800 text-center border-t border-indigo-100/55">
                                                <td class="px-6 py-1.5 text-left sticky left-0 z-10 bg-indigo-50 border-r border-indigo-100 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                                    <div class="flex items-center gap-2">
                                                        <div class="w-1.5 h-4.5 bg-indigo-600 rounded-full shadow shadow-indigo-500/50"></div>
                                                        <span class="font-extrabold text-slate-800 text-[10px]">GRAND TOTAL</span>
                                                    </div>
                                                </td>
                                                ${app.adminShowYTD ? `
                                                    <td class="px-2 py-1.5 text-slate-700 font-extrabold bg-indigo-50/10 text-center">${totalYtdBudget}</td>
                                                    <td class="px-2 py-1.5 font-black text-slate-900 bg-indigo-50/10 text-center">${totalYtdSales}</td>
                                                    <td class="px-2 py-1.5 bg-indigo-50/10 text-center"><span class="px-1.5 py-0.5 rounded-lg bg-${totalH}-50 text-${totalH}-600 font-black">${totalYtdAchVal}%</span></td>
                                                    <td class="px-2 py-1.5 font-bold text-rose-600 bg-indigo-50/10 text-center">${totalYtdShort}</td>
                                                ` : ''}
                                                ${app.adminShowLastMonth ? `
                                                    <td class="px-2 py-1.5 text-slate-700 font-extrabold text-center">${totalLastMonthBudget}</td>
                                                    <td class="px-2 py-1.5 font-black text-slate-900 text-center">${totalLastMonthSales}</td>
                                                    <td class="px-2 py-1.5 font-black text-slate-800 text-center">${ach(totalLastMonthSales, totalLastMonthBudget)}%</td>
                                                ` : ''}
                                                <td class="px-2 py-1.5 bg-slate-100/50 text-slate-700 font-extrabold text-center">${totalCurrBudget}</td>
                                                <td class="px-2 py-1.5 bg-slate-100/50 font-black text-slate-900 text-center">${totalCurrProj}</td>
                                                ${dynamicModels.map(m => `<td class="px-2 py-1.5 bg-slate-100/50 font-bold text-indigo-700 text-center">${totalModelMap[m] || 0}</td>`).join('')}
                                                <td class="px-2 py-1.5 bg-indigo-100/50 font-black text-indigo-700 text-sm text-center">${totalCurrSalesUnits}</td>
                                                <td class="px-2 py-1.5 text-center ${tAchBg}"><span class="px-2 py-0.5 rounded-md text-[10px] font-black inline-block min-w-[38px] ${tAchText}">${totalCurrAchVal}%</span></td>
                                            </tr>
                                        `;

                            return `
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-[11px] whitespace-nowrap">
                                        <thead>
                                            <tr class="bg-slate-50/80 text-slate-500 uppercase tracking-widest text-[9px] border-b border-slate-100">
                                                <th class="px-5 py-2.5 font-black sticky left-0 z-10 bg-slate-50">Territory</th>
                                                ${app.adminShowYTD ? `<th class="px-3 py-4 text-center border-l border-slate-100" colspan="4">YTD (${app.lastMonth.substring(0, 3)})</th>` : ''}
                                                ${app.adminShowLastMonth ? `<th class="px-3 py-4 text-center border-l border-slate-100" colspan="3">Last Month (${app.lastMonth.substring(0, 3)})</th>` : ''}
                                                <th class="px-3 py-4 text-center border-l border-slate-100 font-extrabold" colspan="${4 + dynamicModels.length}">
                                                    ${(app.performanceFilterMonth || app.currentMonth) === app.currentMonth ? 'Current' : 'Selected'} Month (${(app.performanceFilterMonth || app.currentMonth).substring(0, 3)})
                                                </th>
                                            </tr>
                                            <tr class="text-slate-400 uppercase tracking-tighter text-[9px] border-b border-slate-100 text-center">
                                                <th class="px-5 py-2 sticky left-0 z-10 bg-white"></th>
                                                ${app.adminShowYTD ? `
                                                    <th class="px-2 py-3 bg-slate-50">Budget</th>
                                                    <th class="px-2 py-3 bg-slate-50 font-bold text-slate-600">Actual</th>
                                                    <th class="px-2 py-3 bg-slate-50">Ach%</th>
                                                    <th class="px-2 py-3 bg-slate-50">Short</th>
                                                ` : ''}
                                                ${app.adminShowLastMonth ? `
                                                    <th class="px-2 py-3">Budget</th>
                                                    <th class="px-2 py-3 font-bold text-slate-600">Actual</th>
                                                    <th class="px-2 py-3">Ach%</th>
                                                ` : ''}
                                                <th class="px-2 py-3 bg-slate-50">Budget</th>
                                                <th class="px-2 py-3 bg-slate-50 font-bold text-slate-600">Proj</th>
                                                ${dynamicModels.map(m => `<th class="px-2 py-3 bg-slate-50">${m}</th>`).join('')}
                                                <th class="px-2 py-3 bg-indigo-50 font-black text-indigo-700">Total</th>
                                                <th class="px-2 py-3 bg-indigo-50 font-black text-indigo-700">Ach%</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-50 bg-white">
                                            ${rowsHTML}
                                            ${totalRowHTML}
                                        </tbody>
                                    </table>
                                </div>
                            `;
                        })()}
                    </div>
                    ` : ''}

                    ${!isAM ? `
                    <!-- Comprehensive Data Table & Mobile Cards -->
                    <div class="mb-8">
                        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                            <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/90">
                                <div>
                                    <h3 class="font-black text-slate-900 flex items-center gap-2 text-base">
                                        <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                                            <img src="${brandFilter === 'Foton' ? 'https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png' : 'https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png'}" class="h-5 object-contain">
                                        </div>
                                        Territory Pulse
                                        <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase tracking-wider">Live Matrix</span>
                                    </h3>
                                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">${app.currentMonth} Analytics & Territory Performance</p>
                                </div>
                                <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                                    <div class="flex items-center gap-2">
                                        <button onclick="app.adminShowYTD = !app.adminShowYTD; app.renderAdminDashboard()" 
                                                class="shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${app.adminShowYTD ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-300 hover:bg-slate-50'}">
                                            <i data-lucide="${app.adminShowYTD ? 'eye' : 'eye-off'}" class="w-3 h-3"></i> YTD
                                        </button>
                                        <button onclick="app.adminShowLastMonth = !app.adminShowLastMonth; app.renderAdminDashboard()" 
                                                class="shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${app.adminShowLastMonth ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-300 hover:bg-slate-50'}">
                                            <i data-lucide="${app.adminShowLastMonth ? 'eye' : 'eye-off'}" class="w-3 h-3"></i> L.Month
                                        </button>
                                        <button onclick="app.pulseDetailedView = !app.pulseDetailedView; app.renderAdminDashboard()" 
                                                class="shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${app.pulseDetailedView ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-500/20' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}">
                                            <i data-lucide="${app.pulseDetailedView ? 'layout-grid' : 'list'}" class="w-3.5 h-3.5"></i>
                                            Detailed View
                                        </button>
                                        <select onchange="app.adminBrandTab=this.value; app.renderAdminDashboard()" class="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm">
                                            <option value="Foton" ${brandFilter === 'Foton' ? 'selected' : ''}>Foton</option>
                                            <option value="Mahindra" ${brandFilter === 'Mahindra' ? 'selected' : ''}>Mahindra</option>
                                        </select>
                                        <button onclick="app.downloadPulseCSV()" 
                                                class="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5"
                                                title="Download Territory Pulse CSV">
                                            <i data-lucide="download" class="w-3.5 h-3.5"></i>
                                            <span class="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Export</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <!-- DESKTOP TABLE VIEW -->
                            ${app.pulseDetailedView ? `
                            <div class="hidden md:block overflow-x-auto custom-scrollbar border-t border-slate-200">
                                <table class="w-full text-left text-[11px] whitespace-nowrap border-collapse border border-slate-200">
                                    <thead>
                                        <!-- Row 1: Quarters -->
                                        <tr class="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px] border-b-2 border-slate-300">
                                            <th class="px-6 py-2.5 font-black sticky left-0 z-10 bg-slate-100 border-r-2 border-slate-300 shadow-[3px_0_8px_rgba(0,0,0,0.05)]" rowspan="3">
                                                <div class="flex items-center justify-between gap-2">
                                                    <div class="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" onclick="app.setPulseSort('name')">
                                                        Territory ${app.getSortIcon('name')}
                                                    </div>
                                                    <button onclick="app.showPulseFilterModal()" class="p-1 rounded-md transition-colors tooltip ${app.pulseFilterTerritories && app.pulseFilterTerritories.length > 0 ? 'bg-indigo-100 text-indigo-700 shadow-inner scale-110' : 'hover:bg-slate-200 text-slate-500'}" title="Filter Territories">
                                                        <i data-lucide="filter" class="w-3.5 h-3.5"></i>
                                                    </button>
                                                </div>
                                            </th>
                                            <th class="px-3 py-2.5 text-center bg-amber-100/80 text-amber-900 font-black border-r-2 border-slate-300 shadow-sm" rowspan="3">Total FY Budget</th>
                                            <th class="px-3 py-2.5 text-center bg-violet-100/70 text-violet-950 font-black border-r-2 border-slate-300 shadow-sm" colspan="20">Q1 (July - September)</th>
                                            <th class="px-3 py-2.5 text-center bg-amber-100/70 text-amber-950 font-black border-r-2 border-slate-300 shadow-sm" colspan="20">Q2 (October - December)</th>
                                            <th class="px-3 py-2.5 text-center bg-emerald-100/70 text-emerald-950 font-black border-r-2 border-slate-300 shadow-sm" colspan="20">Q3 (January - March)</th>
                                            <th class="px-3 py-2.5 text-center bg-cyan-100/70 text-cyan-950 font-black border-r-2 border-slate-300 shadow-sm" colspan="20">Q4 (April - June)</th>
                                            <th class="px-3 py-2.5 text-center bg-slate-800 text-white font-black border-r-2 border-slate-900 shadow-sm" colspan="5">FY Total (July - June)</th>
                                        </tr>
                                        <!-- Row 2: Months & Quarter Totals -->
                                        <tr class="bg-slate-50 text-slate-600 uppercase tracking-wider text-[9px] border-b-2 border-slate-300 text-center font-bold">
                                            <!-- Q1 Months -->
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">July</th>
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">August</th>
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">September</th>
                                            <th class="px-2 py-1.5 bg-violet-100 text-violet-900 font-black border-r-2 border-slate-300" colspan="5">Q1 Total</th>
                                            <!-- Q2 Months -->
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">October</th>
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">November</th>
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">December</th>
                                            <th class="px-2 py-1.5 bg-amber-100 text-amber-900 font-black border-r-2 border-slate-300" colspan="5">Q2 Total</th>
                                            <!-- Q3 Months -->
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">January</th>
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">February</th>
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">March</th>
                                            <th class="px-2 py-1.5 bg-emerald-100 text-emerald-900 font-black border-r-2 border-slate-300" colspan="5">Q3 Total</th>
                                            <!-- Q4 Months -->
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">April</th>
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">May</th>
                                            <th class="px-2 py-1.5 border-r border-slate-200" colspan="5">June</th>
                                            <th class="px-2 py-1.5 bg-cyan-100 text-cyan-900 font-black border-r-2 border-slate-300" colspan="5">Q4 Total</th>
                                            <!-- FY Total -->
                                            <th class="px-2 py-1.5 bg-slate-800 text-white font-black border-r-2 border-slate-900" colspan="5">FY Total</th>
                                        </tr>
                                        <!-- Row 3: Metrics -->
                                        <tr class="text-slate-500 uppercase tracking-tighter text-[8.5px] border-b-2 border-slate-300 text-center font-black">
                                            ${(() => {
                                                let result = '';
                                                for (let i = 0; i < 17; i++) {
                                                    const isQuarterTotal = i < 16 ? (i + 1) % 4 === 0 : false;
                                                    const isFYTotal = i === 16;
                                                    let qBorder = 'border-r border-slate-200';
                                                    if (isQuarterTotal || isFYTotal) {
                                                        qBorder = 'border-r-2 border-slate-300';
                                                    }
                                                    const metrics = ['Bgt', 'Sal', 'Ach%', 'SPLY', 'Gr%'];
                                                    result += metrics.map((m, mIdx) => `
                                                         <th class="px-1.5 py-1 ${mIdx === 4 ? qBorder : 'border-r border-slate-200'} ${(isQuarterTotal || isFYTotal) ? 'bg-slate-200/60 font-black text-slate-800' : 'bg-slate-50'} text-center">${m}</th>
                                                    `).join('');
                                                }
                                                return result;
                                            })()}
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-200 bg-white">
                                        ${(() => {
                                            const fiscalMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                                            const quarters = {
                                                Q1: ['July', 'August', 'September'],
                                                Q2: ['October', 'November', 'December'],
                                                Q3: ['January', 'February', 'March'],
                                                Q4: ['April', 'May', 'June']
                                            };

                                            const calcGrw = (s, sp) => sp > 0 ? Math.round(((s - sp) / sp) * 100) : (s > 0 ? 100 : 0);
                                            const formatDetailedGrw = (g) => g > 0 ? `<span class="text-emerald-600 font-black">+${g}%</span>` : (g < 0 ? `<span class="text-rose-500 font-black">${g}%</span>` : `<span class="text-slate-400 font-medium">0%</span>`);

                                            const detailedRowsHTML = mappedTerritories.map((mt, idx) => {
                                                const t = mt.t;
                                                const tTargets = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY);
                                                const totalFYBudget = mt.totalFYBudget;

                                                const monthlyPerf = {};
                                                fiscalMonths.forEach(m => {
                                                    const monthTgts = tTargets.filter(tg => tg.month === m);
                                                    const mBudget = monthTgts.length > 0 ? monthTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(totalFYBudget / 12);
                                                    const mSales = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === m).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                                    const mSply = lastFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === m).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                                    monthlyPerf[m] = {
                                                        budget: mBudget,
                                                        sales: mSales,
                                                        sply: mSply,
                                                        ach: ach(mSales, mBudget),
                                                        growth: calcGrw(mSales, mSply)
                                                    };
                                                });

                                                const quarterPerf = {};
                                                Object.entries(quarters).forEach(([qName, qMonths]) => {
                                                    const qBudget = qMonths.reduce((sum, m) => sum + monthlyPerf[m].budget, 0);
                                                    const qSales = qMonths.reduce((sum, m) => sum + monthlyPerf[m].sales, 0);
                                                    const qSply = qMonths.reduce((sum, m) => sum + monthlyPerf[m].sply, 0);
                                                    quarterPerf[qName] = {
                                                        budget: qBudget,
                                                        sales: qSales,
                                                        sply: qSply,
                                                        ach: ach(qSales, qBudget),
                                                        growth: calcGrw(qSales, qSply)
                                                    };
                                                });

                                                let cellsHTML = '';
                                                Object.entries(quarters).forEach(([qName, qMonths]) => {
                                                    qMonths.forEach(m => {
                                                        const p = monthlyPerf[m];
                                                        cellsHTML += `
                                                            <td class="px-2 py-1.5 text-slate-500 font-medium border-r border-slate-200 bg-slate-50/40">${p.budget}</td>
                                                            <td class="px-2 py-1.5 font-bold text-slate-700 border-r border-slate-200 bg-white">${p.sales}</td>
                                                            <td class="px-2 py-1.5 font-black text-slate-800 border-r border-slate-200 bg-slate-50/40">${p.ach}%</td>
                                                            <td class="px-2 py-1.5 text-slate-500 font-medium border-r border-slate-200 bg-white">${p.sply}</td>
                                                            <td class="px-2 py-1.5 font-black text-[10px] border-r border-slate-200 bg-slate-50/40">${formatDetailedGrw(p.growth)}</td>
                                                        `;
                                                    });
                                                    const q = quarterPerf[qName];
                                                    let qBg = '';
                                                    let qText = '';
                                                    let qPill = '';
                                                    if (qName === 'Q1') { qBg = 'bg-violet-500/10'; qText = 'text-violet-900'; qPill = 'bg-violet-100 text-violet-700'; }
                                                    else if (qName === 'Q2') { qBg = 'bg-amber-500/10'; qText = 'text-amber-900'; qPill = 'bg-amber-100 text-amber-700'; }
                                                    else if (qName === 'Q3') { qBg = 'bg-emerald-500/10'; qText = 'text-emerald-900'; qPill = 'bg-emerald-100 text-emerald-700'; }
                                                    else if (qName === 'Q4') { qBg = 'bg-cyan-500/10'; qText = 'text-cyan-900'; qPill = 'bg-cyan-100 text-cyan-700'; }

                                                    cellsHTML += `
                                                        <td class="px-2 py-1.5 font-bold ${qBg} ${qText} border-r border-slate-200">${q.budget}</td>
                                                        <td class="px-2 py-1.5 font-black ${qBg} ${qText} border-r border-slate-200">${q.sales}</td>
                                                        <td class="px-2 py-1.5 font-black ${qBg} border-r border-slate-200"><span class="px-1.5 py-0.5 rounded-lg ${qPill} font-black">${q.ach}%</span></td>
                                                        <td class="px-2 py-1.5 font-bold ${qBg} ${qText} border-r border-slate-200">${q.sply}</td>
                                                        <td class="px-2 py-1.5 font-black ${qBg} text-[10px] border-r-2 border-slate-300">${formatDetailedGrw(q.growth)}</td>
                                                    `;
                                                });

                                                // Append Fiscal Year Total cells for this row
                                                const fyBudget = Object.values(quarterPerf).reduce((sum, q) => sum + q.budget, 0);
                                                const fySales = Object.values(quarterPerf).reduce((sum, q) => sum + q.sales, 0);
                                                const fySply = Object.values(quarterPerf).reduce((sum, q) => sum + q.sply, 0);
                                                const fyAch = ach(fySales, fyBudget);
                                                const fyGrowth = calcGrw(fySales, fySply);

                                                cellsHTML += `
                                                    <td class="px-2 py-1.5 font-extrabold bg-slate-100 text-slate-900 border-r border-slate-200">${fyBudget}</td>
                                                    <td class="px-2 py-1.5 font-black bg-slate-100 text-slate-900 border-r border-slate-200">${fySales}</td>
                                                    <td class="px-2 py-1.5 bg-slate-100 border-r border-slate-200"><span class="px-1.5 py-0.5 rounded-lg bg-slate-800 text-white font-black">${fyAch}%</span></td>
                                                    <td class="px-2 py-1.5 font-extrabold bg-slate-100 text-slate-900 border-r border-slate-200">${fySply}</td>
                                                    <td class="px-2 py-1.5 font-black bg-slate-100 text-[10px] border-r-2 border-slate-400">${formatDetailedGrw(fyGrowth)}</td>
                                                `;

                                                return `
                                                    <tr class="pulse-tr-premium text-center border-b border-slate-200 hover:bg-indigo-50/40 transition-colors group">
                                                        <td class="px-6 py-1.5 text-left sticky left-0 z-10 bg-white border-r-2 border-slate-300 shadow-[3px_0_8px_rgba(0,0,0,0.05)] sticky-left">
                                                            <div class="flex items-center gap-2">
                                                                <span class="text-[9px] font-bold text-slate-400 w-4 text-right">${idx + 1}.</span>
                                                                <div class="w-1.5 h-4.5 bg-${mt.h}-500 rounded-full shadow-sm"></div>
                                                                <span class="font-black text-slate-800">${mt.name}</span>
                                                            </div>
                                                        </td>
                                                        <td class="px-3 py-1.5 font-bold text-amber-800 bg-amber-500/[0.04] border-r-2 border-slate-300 text-center"><span class="px-2 py-0.5 rounded-lg text-amber-900 font-black bg-amber-100 border border-amber-200 text-[10px]">${totalFYBudget}</span></td>
                                                        ${cellsHTML}
                                                    </tr>
                                                `;
                                            }).join('');

                                            const grandMonth = {};
                                            fiscalMonths.forEach(m => {
                                                grandMonth[m] = { budget: 0, sales: 0, sply: 0 };
                                            });
                                            const grandQuarter = {};
                                            Object.keys(quarters).forEach(qName => {
                                                grandQuarter[qName] = { budget: 0, sales: 0, sply: 0 };
                                            });
                                            let grandFYBudget = 0;

                                            mappedTerritories.forEach(mt => {
                                                const t = mt.t;
                                                const tTargets = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY);
                                                const totalFYBudget = mt.totalFYBudget;
                                                grandFYBudget += totalFYBudget;

                                                fiscalMonths.forEach(m => {
                                                    const monthTgts = tTargets.filter(tg => tg.month === m);
                                                    const mBudget = monthTgts.length > 0 ? monthTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(totalFYBudget / 12);
                                                    const mSales = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === m).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                                    const mSply = lastFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === m).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                                    
                                                    grandMonth[m].budget += mBudget;
                                                    grandMonth[m].sales += mSales;
                                                    grandMonth[m].sply += mSply;
                                                });
                                            });

                                            Object.entries(quarters).forEach(([qName, qMonths]) => {
                                                qMonths.forEach(m => {
                                                    grandQuarter[qName].budget += grandMonth[m].budget;
                                                    grandQuarter[qName].sales += grandMonth[m].sales;
                                                    grandQuarter[qName].sply += grandMonth[m].sply;
                                                });
                                            });

                                            let grandCellsHTML = '';
                                            Object.entries(quarters).forEach(([qName, qMonths]) => {
                                                qMonths.forEach(m => {
                                                    const g = grandMonth[m];
                                                    const gAch = ach(g.sales, g.budget);
                                                    const gGrw = calcGrw(g.sales, g.sply);
                                                    grandCellsHTML += `
                                                        <td class="px-2 py-2 text-slate-800 font-extrabold border-r border-slate-700 bg-slate-800/90">${g.budget}</td>
                                                        <td class="px-2 py-2 font-black text-white border-r border-slate-700 bg-slate-900">${g.sales}</td>
                                                        <td class="px-2 py-2 border-r border-slate-700 bg-slate-800/90 font-black text-amber-300">${gAch}%</td>
                                                        <td class="px-2 py-2 text-slate-300 font-bold border-r border-slate-700 bg-slate-900">${g.sply}</td>
                                                        <td class="px-2 py-2 font-black text-[10px] border-r border-slate-700 bg-slate-800/90">${formatDetailedGrw(gGrw)}</td>
                                                    `;
                                                });
                                                const gq = grandQuarter[qName];
                                                const gqAch = ach(gq.sales, gq.budget);
                                                const gqGrw = calcGrw(gq.sales, gq.sply);
                                                
                                                let pillBg = '';
                                                if (qName === 'Q1') { pillBg = 'bg-violet-600 text-white'; }
                                                else if (qName === 'Q2') { pillBg = 'bg-amber-600 text-white'; }
                                                else if (qName === 'Q3') { pillBg = 'bg-emerald-600 text-white'; }
                                                else if (qName === 'Q4') { pillBg = 'bg-cyan-600 text-white'; }

                                                grandCellsHTML += `
                                                    <td class="px-2 py-2 font-extrabold text-white border-r border-slate-700 bg-slate-800/95">${gq.budget}</td>
                                                    <td class="px-2 py-2 font-black text-white border-r border-slate-700 bg-slate-900">${gq.sales}</td>
                                                    <td class="px-2 py-2 border-r border-slate-700 bg-slate-800/95"><span class="px-1.5 py-0.5 rounded-lg ${pillBg} font-black">${gqAch}%</span></td>
                                                    <td class="px-2 py-2 font-extrabold text-white border-r border-slate-700 bg-slate-900">${gq.sply}</td>
                                                    <td class="px-2 py-2 font-black text-[10px] border-r-2 border-slate-600 bg-slate-800/95">${formatDetailedGrw(gqGrw)}</td>
                                                `;
                                            });

                                            // Append Fiscal Year Grand Total cells
                                            let grandFYTotalBudget = 0;
                                            let grandFYTotalSales = 0;
                                            let grandFYTotalSply = 0;
                                            Object.keys(quarters).forEach(qName => {
                                                grandFYTotalBudget += grandQuarter[qName].budget;
                                                grandFYTotalSales += grandQuarter[qName].sales;
                                                grandFYTotalSply += grandQuarter[qName].sply;
                                            });
                                            const grandFYAch = ach(grandFYTotalSales, grandFYTotalBudget);
                                            const grandFYGrowth = calcGrw(grandFYTotalSales, grandFYTotalSply);

                                            grandCellsHTML += `
                                                <td class="px-2 py-2 font-black bg-slate-950 text-white border-r border-slate-700">${grandFYTotalBudget}</td>
                                                <td class="px-2 py-2 font-black bg-slate-950 text-emerald-400 border-r border-slate-700">${grandFYTotalSales}</td>
                                                <td class="px-2 py-2 bg-slate-950 border-r border-slate-700"><span class="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-black">${grandFYAch}%</span></td>
                                                <td class="px-2 py-2 font-black bg-slate-950 text-slate-300 border-r border-slate-700">${grandFYTotalSply}</td>
                                                <td class="px-2 py-2 font-black bg-slate-950 text-[10px] border-r-2 border-slate-600">${formatDetailedGrw(grandFYGrowth)}</td>
                                            `;

                                            const grandTotalRowHTML = `
                                                <tr class="bg-slate-900 text-white font-black text-center border-t-2 border-slate-900 shadow-lg">
                                                    <td class="px-6 py-2 text-left sticky left-0 z-10 bg-slate-900 border-r-2 border-slate-700 shadow-[3px_0_8px_rgba(0,0,0,0.3)]">
                                                        <div class="flex items-center gap-2">
                                                            <span class="w-4"></span>
                                                            <div class="w-1.5 h-4.5 bg-indigo-500 rounded-full shadow shadow-indigo-400/50"></div>
                                                            <span class="font-black text-white text-[10px] uppercase tracking-wider">GRAND TOTAL</span>
                                                        </div>
                                                    </td>
                                                    <td class="px-3 py-2 font-black text-amber-300 bg-slate-900 border-r-2 border-slate-700 text-center text-xs"><span class="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">${grandFYBudget}</span></td>
                                                    ${grandCellsHTML}
                                                </tr>
                                            `;

                                            return detailedRowsHTML + grandTotalRowHTML;
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                            ` : `
                            <div class="hidden md:block overflow-x-auto">
                                <table class="w-full text-left text-[11px] whitespace-nowrap border-collapse border border-slate-200">
                                    <thead>
                                        <tr class="bg-slate-100 text-slate-700 uppercase tracking-widest text-[9px] border-b-2 border-slate-300">
                                            <th class="px-6 py-2.5 font-black sticky left-0 z-10 bg-slate-100 border-r-2 border-slate-300 shadow-[3px_0_8px_rgba(0,0,0,0.05)]">Territory</th>
                                            <th class="px-3 py-2.5 text-center bg-amber-100/80 text-amber-900 font-black border-r-2 border-slate-300 shadow-sm" colspan="1">Total FY Budget</th>
                                            ${app.adminShowYTD ? `<th class="px-3 py-2.5 text-center bg-indigo-100/80 text-indigo-950 border-r-2 border-slate-300 font-black shadow-sm" colspan="4">YTD (${app.currentMonth === 'July' ? 'N/A' : app.lastMonth.substring(0, 3)})</th>` : ''}
                                            ${app.adminShowLastMonth ? `<th class="px-3 py-2.5 text-center bg-emerald-100/80 text-emerald-950 border-r-2 border-slate-300 font-black shadow-sm" colspan="3">Last Month (${app.currentMonth === 'July' ? 'N/A' : app.lastMonth.substring(0, 3)})</th>` : ''}
                                            <th class="px-3 py-2.5 text-center bg-cyan-100/80 text-cyan-950 border-r-2 border-slate-300 font-black shadow-sm" colspan="${4 + dynamicActiveModels.length}">Current Month (${app.currentMonth.substring(0, 3)})</th>
                                        </tr>
                                        <tr class="bg-slate-50 text-slate-600 uppercase tracking-wider text-[9px] border-b-2 border-slate-300 text-center font-bold">
                                            <th class="px-6 py-1.5 sticky left-0 z-10 bg-white border-r-2 border-slate-300 shadow-[3px_0_8px_rgba(0,0,0,0.05)]">
                                                <div class="flex items-center justify-between gap-2">
                                                    <div class="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" onclick="app.setPulseSort('name')">
                                                        <span class="w-4 text-right text-slate-400">#</span> Territory ${app.getSortIcon('name')}
                                                    </div>
                                                    <button onclick="app.showPulseFilterModal()" class="p-1 rounded-md transition-colors tooltip ${app.pulseFilterTerritories && app.pulseFilterTerritories.length > 0 ? 'bg-indigo-100 text-indigo-700 shadow-inner scale-110' : 'hover:bg-slate-200 text-slate-500'}" title="Filter Territories">
                                                        <i data-lucide="filter" class="w-3.5 h-3.5"></i>
                                                    </button>
                                                </div>
                                            </th>
                                            <th class="px-3 py-1.5 bg-amber-50 border-r-2 border-slate-300 cursor-pointer hover:bg-amber-100 transition-colors text-center font-black text-amber-900" onclick="app.setPulseSort('sortVal_fy_budget')">
                                                <div class="flex items-center justify-center gap-1 font-black">
                                                    Total ${app.getSortIcon('sortVal_fy_budget')}
                                                </div>
                                            </th>
                                            ${app.adminShowYTD ? `
                                                <th class="px-2 py-1.5 bg-indigo-50/80 cursor-pointer hover:bg-indigo-100 transition-colors border-r border-slate-200 font-bold" onclick="app.setPulseSort('sortVal_ytd_budget')"><div class="flex items-center justify-center gap-1">Budget ${app.getSortIcon('sortVal_ytd_budget')}</div></th>
                                                <th class="px-2 py-1.5 bg-indigo-50/80 cursor-pointer hover:bg-indigo-100 transition-colors border-r border-slate-200 font-black text-slate-700" onclick="app.setPulseSort('sortVal_ytd_actual')"><div class="flex items-center justify-center gap-1">Actual ${app.getSortIcon('sortVal_ytd_actual')}</div></th>
                                                <th class="px-2 py-1.5 bg-indigo-50/80 cursor-pointer hover:bg-indigo-100 transition-colors border-r border-slate-200 font-black" onclick="app.setPulseSort('sortVal_ytd_ach')"><div class="flex items-center justify-center gap-1">Ach% ${app.getSortIcon('sortVal_ytd_ach')}</div></th>
                                                <th class="px-2 py-1.5 bg-indigo-50/80 cursor-pointer hover:bg-indigo-100 transition-colors border-r-2 border-slate-300 font-bold text-rose-600" onclick="app.setPulseSort('sortVal_ytd_short')"><div class="flex items-center justify-center gap-1">Short ${app.getSortIcon('sortVal_ytd_short')}</div></th>
                                            ` : ''}
                                            ${app.adminShowLastMonth ? `
                                                <th class="px-2 py-1.5 bg-emerald-50/80 cursor-pointer hover:bg-emerald-100 transition-colors border-r border-slate-200 font-bold" onclick="app.setPulseSort('sortVal_lm_budget')"><div class="flex items-center justify-center gap-1">Budget ${app.getSortIcon('sortVal_lm_budget')}</div></th>
                                                <th class="px-2 py-1.5 bg-emerald-50/80 font-black text-slate-700 cursor-pointer hover:bg-emerald-100 transition-colors border-r border-slate-200" onclick="app.setPulseSort('sortVal_lm_actual')"><div class="flex items-center justify-center gap-1">Actual ${app.getSortIcon('sortVal_lm_actual')}</div></th>
                                                <th class="px-2 py-1.5 bg-emerald-50/80 cursor-pointer hover:bg-emerald-100 transition-colors border-r-2 border-slate-300 font-black" onclick="app.setPulseSort('sortVal_lm_ach')"><div class="flex items-center justify-center gap-1">Ach% ${app.getSortIcon('sortVal_lm_ach')}</div></th>
                                            ` : ''}
                                            <th class="px-2 py-1.5 bg-cyan-50/80 cursor-pointer hover:bg-cyan-100 transition-colors border-r border-slate-200 font-bold" onclick="app.setPulseSort('sortVal_curr_budget')"><div class="flex items-center justify-center gap-1">Budget ${app.getSortIcon('sortVal_curr_budget')}</div></th>
                                            <th class="px-2 py-1.5 bg-cyan-50/80 font-black text-slate-700 cursor-pointer hover:bg-cyan-100 transition-colors border-r border-slate-200" onclick="app.setPulseSort('sortVal_curr_proj')"><div class="flex items-center justify-center gap-1">Proj ${app.getSortIcon('sortVal_curr_proj')}</div></th>
                                            ${dynamicActiveModels.map(m => `<th class="px-2 py-1.5 bg-cyan-50/80 text-slate-700 font-bold border-r border-slate-200">${m}</th>`).join('')}
                                            <th class="px-2 py-1.5 bg-indigo-100 text-indigo-900 font-black cursor-pointer hover:bg-indigo-200 transition-colors border-r border-indigo-200" onclick="app.setPulseSort('sortVal_curr_actual')"><div class="flex items-center justify-center gap-1">Total ${app.getSortIcon('sortVal_curr_actual')}</div></th>
                                            <th class="px-2 py-1.5 bg-indigo-100 text-indigo-900 font-black cursor-pointer hover:bg-indigo-200 transition-colors border-r-2 border-slate-300" onclick="app.setPulseSort('sortVal_curr_ach')"><div class="flex items-center justify-center gap-1">Ach% ${app.getSortIcon('sortVal_curr_ach')}</div></th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-200 bg-white">
                                        ${(() => {
                                            let totalFYBudget = 0;
                                            let totalYtdBudget = 0;
                                            let totalYtdSales = 0;
                                            let totalYtdShort = 0;
                                            let totalLastMonthBudget = 0;
                                            let totalLastMonthSales = 0;
                                            let totalCurrBudget = 0;
                                            let totalCurrProj = 0;
                                            const totalModelMap = {};
                                            let totalCurrSalesUnits = 0;

                                            const rowsHTML = mappedTerritories.map((mt, idx) => {
                                                totalFYBudget += mt.totalFYBudget;
                                                totalYtdBudget += mt.perf.ytd.budget;
                                                totalYtdSales += mt.perf.ytd.sales;
                                                totalYtdShort += mt.ytdShortVal;
                                                totalLastMonthBudget += mt.perf.lastMonth.budget;
                                                totalLastMonthSales += mt.perf.lastMonth.sales;
                                                totalCurrBudget += mt.currBudget;
                                                totalCurrProj += mt.currProj;
                                                dynamicActiveModels.forEach(m => {
                                                    totalModelMap[m] = (totalModelMap[m] || 0) + (mt.modelMap[m] || 0);
                                                });
                                                totalCurrSalesUnits += mt.currSalesUnits;

                                                return `
                                                    <tr class="hover:bg-indigo-50/40 transition-colors group text-center border-b border-slate-200">
                                                        <td class="px-6 py-1.5 text-left sticky left-0 z-10 bg-white border-r-2 border-slate-300 shadow-[3px_0_8px_rgba(0,0,0,0.05)] font-bold">
                                                            <div class="flex items-center justify-between gap-2">
                                                                <div class="flex items-center gap-1.5">
                                                                    <span class="text-[9px] font-bold text-slate-400 w-4 text-right">${idx + 1}.</span>
                                                                    <div class="w-1.5 h-4.5 bg-${mt.h}-500 rounded-full shadow-xs"></div>
                                                                    <span class="font-black text-slate-800">${mt.name}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td class="px-3 py-1.5 font-bold text-amber-900 bg-amber-500/[0.04] border-r-2 border-slate-300 text-center"><span class="px-2 py-0.5 rounded-lg text-amber-900 font-black bg-amber-100 border border-amber-200 text-[10px]">${mt.totalFYBudget}</span></td>
                                                        ${app.adminShowYTD ? `
                                                            <td class="px-2 py-1.5 text-slate-500 font-medium text-center border-r border-slate-200 bg-slate-50/40">${app.currentMonth === 'July' ? '-' : mt.perf.ytd.budget}</td>
                                                            <td class="px-2 py-1.5 font-black text-slate-800 text-center border-r border-slate-200">${app.currentMonth === 'July' ? '-' : mt.perf.ytd.sales}</td>
                                                            <td class="px-2 py-1.5 text-center border-r border-slate-200 bg-slate-50/40">${app.currentMonth === 'July' ? '-' : `<span class="px-1.5 py-0.5 rounded-lg bg-${mt.h}-50 text-${mt.h}-700 font-black">${mt.ytdAchVal}%</span>`}</td>
                                                            <td class="px-2 py-1.5 font-bold text-rose-600 text-center border-r-2 border-slate-300 bg-slate-50/40">${app.currentMonth === 'July' ? '-' : mt.ytdShortVal}</td>
                                                        ` : ''}
                                                        ${app.adminShowLastMonth ? `
                                                            <td class="px-2 py-1.5 text-slate-500 font-medium text-center border-r border-slate-200 bg-slate-50/40">${app.currentMonth === 'July' ? '-' : mt.perf.lastMonth.budget}</td>
                                                            <td class="px-2 py-1.5 font-black text-slate-800 text-center border-r border-slate-200">${app.currentMonth === 'July' ? '-' : mt.perf.lastMonth.sales}</td>
                                                            <td class="px-2 py-1.5 font-black text-slate-700 text-center border-r-2 border-slate-300 bg-slate-50/40">${app.currentMonth === 'July' ? '-' : `${mt.lmAchVal}%`}</td>
                                                        ` : ''}
                                                        <td class="px-2 py-1.5 bg-slate-50/50 text-slate-500 font-medium text-center border-r border-slate-200">${mt.currBudget}</td>
                                                        <td class="px-2 py-1.5 bg-slate-50/50 font-black text-slate-800 text-center border-r border-slate-200">${mt.currProj}</td>
                                                        ${dynamicActiveModels.map(m => `<td class="px-2 py-1.5 bg-slate-50/50 font-bold text-center border-r border-slate-200 ${mt.modelMap[m] ? 'text-indigo-700 font-black' : 'text-slate-300'}">${mt.modelMap[m] || '-'}</td>`).join('')}
                                                        <td class="px-2 py-1.5 bg-indigo-50/60 font-black text-indigo-900 text-center border-r border-indigo-200">${mt.currSalesUnits}</td>
                                                        <td class="px-2 py-1.5 bg-indigo-50/60 text-center border-r-2 border-slate-300">${app.getAchBadge(mt.currAchVal)}</td>
                                                    </tr>
                                                `;
                                            }).join('');

                                            const totalYtdAchVal = ach(totalYtdSales, totalYtdBudget);
                                            const totalH = totalYtdAchVal >= 90 ? 'emerald' : (totalYtdAchVal >= 70 ? 'blue' : 'rose');

                                            const totalRowHTML = `
                                                <tr class="bg-slate-900 text-white font-black text-center border-t-2 border-slate-900 shadow-lg">
                                                    <td class="px-6 py-2 text-left sticky left-0 z-10 bg-slate-900 border-r-2 border-slate-700 shadow-[3px_0_8px_rgba(0,0,0,0.3)]">
                                                        <div class="flex items-center gap-2">
                                                            <span class="w-4"></span>
                                                            <div class="w-1.5 h-4.5 bg-indigo-500 rounded-full shadow shadow-indigo-400/50"></div>
                                                            <span class="font-black text-white text-[10px] uppercase tracking-wider">GRAND TOTAL</span>
                                                        </div>
                                                    </td>
                                                    <td class="px-3 py-2 font-black text-amber-300 bg-slate-900 border-r-2 border-slate-700 text-center text-xs"><span class="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">${totalFYBudget}</span></td>
                                                    ${app.adminShowYTD ? `
                                                        <td class="px-2 py-2 text-slate-200 font-extrabold bg-slate-900 text-center border-r border-slate-700">${app.currentMonth === 'July' ? '-' : totalYtdBudget}</td>
                                                        <td class="px-2 py-2 font-black text-white bg-slate-950 text-center border-r border-slate-700">${app.currentMonth === 'July' ? '-' : totalYtdSales}</td>
                                                        <td class="px-2 py-2 bg-slate-900 text-center border-r border-slate-700">${app.currentMonth === 'July' ? '-' : `<span class="px-1.5 py-0.5 rounded-lg bg-${totalH}-500 text-slate-950 font-black">${totalYtdAchVal}%</span>`}</td>
                                                        <td class="px-2 py-2 font-bold text-rose-400 bg-slate-900 text-center border-r-2 border-slate-700">${app.currentMonth === 'July' ? '-' : totalYtdShort}</td>
                                                    ` : ''}
                                                    ${app.adminShowLastMonth ? `
                                                        <td class="px-2 py-2 text-slate-200 font-extrabold text-center border-r border-slate-700 bg-slate-900">${app.currentMonth === 'July' ? '-' : totalLastMonthBudget}</td>
                                                        <td class="px-2 py-2 font-black text-white text-center border-r border-slate-700 bg-slate-950">${app.currentMonth === 'July' ? '-' : totalLastMonthSales}</td>
                                                        <td class="px-2 py-2 font-black text-amber-300 text-center border-r-2 border-slate-700 bg-slate-900">${app.currentMonth === 'July' ? '-' : `${ach(totalLastMonthSales, totalLastMonthBudget)}%`}</td>
                                                    ` : ''}
                                                    <td class="px-2 py-2 bg-slate-900 text-slate-200 font-extrabold text-center border-r border-slate-700">${totalCurrBudget}</td>
                                                    <td class="px-2 py-2 bg-slate-950 font-black text-white text-center border-r border-slate-700">${totalCurrProj}</td>
                                                    ${dynamicActiveModels.map(m => `<td class="px-2 py-2 bg-slate-900 font-bold text-indigo-300 text-center border-r border-slate-700">${totalModelMap[m] || 0}</td>`).join('')}
                                                    <td class="px-2 py-2 bg-indigo-950 font-black text-emerald-400 text-sm text-center border-r border-slate-700">${totalCurrSalesUnits}</td>
                                                    <td class="px-2 py-2 bg-indigo-950 text-center border-r-2 border-slate-700">${app.getAchBadge(ach(totalCurrSalesUnits, totalCurrBudget))}</td>
                                                </tr>
                                            `;

                                            return rowsHTML + totalRowHTML;
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                            `}

                            <!-- MOBILE CARD VIEW -->
                            ${app.pulseDetailedView ? `
                            <div class="md:hidden">
                                <div class="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider font-bold">Select Quarter:</span>
                                    <div class="flex bg-slate-200/50 p-0.5 rounded-xl border border-slate-200 shadow-inner">
                                        ${['Q1', 'Q2', 'Q3', 'Q4'].map(q => `
                                            <button onclick="app.pulseMobileQuarter = '${q}'; app.renderAdminDashboard()" 
                                                    class="px-3 py-1 text-[9px] font-black transition-all ${app.pulseMobileQuarter === q ? 'bg-white shadow-sm text-indigo-700 scale-105 rounded-lg' : 'text-slate-500 hover:text-slate-800 rounded-lg'}">
                                                ${q}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="divide-y divide-slate-100">
                                    ${mappedTerritories.map((mt, idx) => {
                                        const t = mt.t;
                                        const perf = mt.perf;
                                        const totalFYBudget = mt.totalFYBudget;
                                        const ytdAchVal = mt.ytdAchVal;
                                        const h = mt.h;

                                        const fiscalMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                                        const quarters = {
                                            Q1: ['July', 'August', 'September'],
                                            Q2: ['October', 'November', 'December'],
                                            Q3: ['January', 'February', 'March'],
                                            Q4: ['April', 'May', 'June']
                                        };

                                        const calcGrw = (s, sp) => sp > 0 ? Math.round(((s - sp) / sp) * 100) : (s > 0 ? 100 : 0);
                                        const formatDetailedGrw = (g) => g > 0 ? `<span class="text-emerald-600 font-black">+${g}%</span>` : (g < 0 ? `<span class="text-rose-500 font-black">${g}%</span>` : `<span class="text-slate-400 font-medium">0%</span>`);

                                        const monthlyPerf = {};
                                        fiscalMonths.forEach(m => {
                                            const monthTgts = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === currentFY && tg.month === m);
                                            const mBudget = monthTgts.length > 0 ? monthTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(totalFYBudget / 12);
                                            const mSales = currFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === m).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                            const mSply = lastFYSales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === m).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                                            monthlyPerf[m] = {
                                                budget: mBudget,
                                                sales: mSales,
                                                sply: mSply,
                                                ach: ach(mSales, mBudget),
                                                growth: calcGrw(mSales, mSply)
                                            };
                                        });

                                        const qMonths = quarters[app.pulseMobileQuarter];
                                        const qBudget = qMonths.reduce((sum, m) => sum + monthlyPerf[m].budget, 0);
                                        const qSales = qMonths.reduce((sum, m) => sum + monthlyPerf[m].sales, 0);
                                        const qSply = qMonths.reduce((sum, m) => sum + monthlyPerf[m].sply, 0);
                                        const qPerf = {
                                            budget: qBudget,
                                            sales: qSales,
                                            sply: qSply,
                                            ach: ach(qSales, qBudget),
                                            growth: calcGrw(qSales, qSply)
                                        };

                                        let qRowsHTML = qMonths.map(m => {
                                            const p = monthlyPerf[m];
                                            return `
                                                <tr class="text-center hover:bg-slate-50 transition-colors">
                                                    <td class="py-2 text-left font-black text-slate-700 text-[10px]">${m.substring(0, 3)}</td>
                                                    <td class="py-2 text-slate-500 font-medium">${p.budget}</td>
                                                    <td class="py-2 font-bold text-slate-800">${p.sales}</td>
                                                    <td class="py-2 font-black text-slate-800">${p.ach}%</td>
                                                    <td class="py-2 text-slate-500 font-medium">${p.sply}</td>
                                                    <td class="py-2 text-[9px] font-black">${formatDetailedGrw(p.growth)}</td>
                                                </tr>
                                            `;
                                        }).join('');

                                        let qTotalColor = '';
                                        if (app.pulseMobileQuarter === 'Q1') qTotalColor = 'bg-violet-50 text-violet-800';
                                        else if (app.pulseMobileQuarter === 'Q2') qTotalColor = 'bg-amber-50 text-amber-800';
                                        else if (app.pulseMobileQuarter === 'Q3') qTotalColor = 'bg-emerald-50 text-emerald-800';
                                        else if (app.pulseMobileQuarter === 'Q4') qTotalColor = 'bg-cyan-50 text-cyan-800';

                                        let qTotalRowHTML = `
                                            <tr class="text-center font-black ${qTotalColor}">
                                                <td class="py-2 text-left font-black text-[10px]">${app.pulseMobileQuarter} TOT</td>
                                                <td class="py-2">${qPerf.budget}</td>
                                                <td class="py-2">${qPerf.sales}</td>
                                                <td class="py-2"><span class="px-1.5 py-0.5 rounded bg-white font-black">${qPerf.ach}%</span></td>
                                                <td class="py-2">${qPerf.sply}</td>
                                                <td class="py-2 text-[9px] font-black">${formatDetailedGrw(qPerf.growth)}</td>
                                            </tr>
                                        `;

                                        return `
                                            <div class="p-5 bg-white active:bg-slate-50 transition-colors">
                                                <div class="flex justify-between items-start mb-3">
                                                    <div class="flex items-center gap-3">
                                                        <div class="w-10 h-10 rounded-2xl bg-${h}-50 border border-${h}-100 flex items-center justify-center text-${h}-600 font-black shadow-sm">
                                                            ${t.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 class="font-black text-slate-800 leading-tight">${t.name}</h4>
                                                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Detailed Performance Matrix</p>
                                                        </div>
                                                    </div>
                                                    <div class="text-right">
                                                        <span class="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 shadow-sm">FY Bgt: ${totalFYBudget}</span>
                                                    </div>
                                                </div>
                                                
                                                <div class="mt-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 shadow-inner">
                                                    <table class="w-full text-[9px] text-center border-collapse">
                                                        <thead>
                                                            <tr class="text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bold">
                                                                <th class="py-1 text-left">Period</th>
                                                                <th class="py-1">Bgt</th>
                                                                <th class="py-1">Sal</th>
                                                                <th class="py-1 text-indigo-600 font-bold">Ach%</th>
                                                                <th class="py-1">SPLY</th>
                                                                <th class="py-1">Growth</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody class="divide-y divide-slate-50 font-medium">
                                                            ${qRowsHTML + qTotalRowHTML}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            ` : `
                            <div class="md:hidden divide-y divide-slate-100">
                                ${mappedTerritories.map((mt, idx) => {
                                    const t = mt.t;
                                    const perf = mt.perf;
                                    const currBudget = mt.currBudget;
                                    const currSalesUnits = mt.currSalesUnits;
                                    const ytdAchVal = mt.ytdAchVal;
                                    const h = mt.h;

                                    return `
                                        <div class="p-5 bg-white active:bg-slate-50 transition-colors">
                                            <div class="flex justify-between items-start mb-4">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 rounded-2xl bg-${h}-50 border border-${h}-100 flex items-center justify-center text-${h}-600 font-black">
                                                        ${t.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 class="font-black text-slate-800">${t.name}</h4>
                                                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Pulse</p>
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <span class="text-xl font-black text-indigo-700">${currSalesUnits}</span>
                                                    <p class="text-[9px] font-black text-slate-400 uppercase">${app.currentMonth} Units</p>
                                                </div>
                                            </div>
                                            
                                            <div class="grid grid-cols-3 gap-2">
                                                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                    <p class="text-[8px] font-bold text-slate-400 uppercase mb-1">Budget</p>
                                                    <p class="text-sm font-black text-slate-700">${currBudget}</p>
                                                </div>
                                                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                    <p class="text-[8px] font-bold text-slate-400 uppercase mb-1">YTD Ach</p>
                                                    <p class="text-sm font-black text-${app.currentMonth === 'July' ? 'slate-400' : `${h}-600`}">${app.currentMonth === 'July' ? '-' : `${ytdAchVal}%`}</p>
                                                </div>
                                                <div class="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                                                    <p class="text-[8px] font-bold text-indigo-400 uppercase mb-1">M.Ach</p>
                                                    <p class="text-sm font-black text-indigo-700">${ach(currSalesUnits, currBudget)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            `}</div>
                        </div>
                    </div>
                    ` : ''}

                    ${!isAM ? `
                    <!-- Area (AM) Performance Analytics & Mobile Cards -->
                    <div class="bg-white rounded-2xl border border-indigo-200/90 shadow-xl overflow-hidden mb-8">
                        <div class="p-5 border-b border-indigo-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-purple-50/90">
                            <div>
                                <h3 class="font-black text-indigo-950 flex items-center gap-2 text-base">
                                    <div class="p-1.5 bg-white rounded-lg shadow-sm border border-indigo-200">
                                        <i data-lucide="users" class="w-5 h-5 text-indigo-600"></i>
                                    </div>
                                    AM Sync
                                    <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">Area Matrix</span>
                                </h3>
                                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Aggregated Area Manager Insights & Performance</p>
                            </div>
                        </div>
                        
                        <!-- DESKTOP TABLE VIEW -->
                        <div class="hidden md:block overflow-x-auto border-t border-indigo-200">
                            <table class="w-full text-left text-[11px] whitespace-nowrap border-collapse border border-indigo-200">
                                <thead>
                                    <tr class="bg-indigo-100/90 text-indigo-950 uppercase tracking-wider text-[9.5px] border-b-2 border-indigo-300 font-black">
                                        <th class="px-6 py-2.5 font-black sticky left-0 z-10 bg-indigo-100 border-r-2 border-indigo-300 shadow-[3px_0_8px_rgba(0,0,0,0.06)]">Area Name</th>
                                        <th class="px-6 py-2.5 font-black bg-indigo-100 border-r-2 border-indigo-300">AM Name</th>
                                        ${app.adminShowYTD ? `<th class="px-3 py-2.5 text-center bg-indigo-200/60 text-indigo-950 border-r-2 border-indigo-300 font-black" colspan="3">YTD (${app.currentMonth === 'July' ? 'N/A' : app.lastMonth.substring(0, 3)})</th>` : ''}
                                        ${app.adminShowLastMonth ? `<th class="px-3 py-2.5 text-center bg-emerald-100 text-emerald-950 border-r-2 border-indigo-300 font-black" colspan="2">Last Month (${app.currentMonth === 'July' ? 'N/A' : app.lastMonth.substring(0, 3)})</th>` : ''}
                                        <th class="px-3 py-2.5 text-center bg-cyan-100 text-cyan-950 border-r-2 border-indigo-300 font-black" colspan="${4 + activeModels.length}">Current Month (${app.currentMonth.substring(0, 3)})</th>
                                    </tr>
                                    <tr class="bg-indigo-50 text-indigo-900 uppercase tracking-wider text-[9px] border-b-2 border-indigo-300 text-center font-bold">
                                        <th class="px-6 py-1.5 sticky left-0 z-10 bg-white border-r-2 border-indigo-300 shadow-[3px_0_8px_rgba(0,0,0,0.06)]">
                                            <div class="flex items-center justify-between gap-2">
                                                <span class="font-black">Area</span>
                                                <button onclick="app.showAreaFilterModal()" class="p-1 rounded-md transition-colors tooltip ${app.areaFilterList && app.areaFilterList.length > 0 ? 'bg-indigo-200 text-indigo-800 shadow-inner scale-110' : 'hover:bg-indigo-100 text-indigo-500'}" title="Filter Area Names">
                                                    <i data-lucide="filter" class="w-3.5 h-3.5"></i>
                                                </button>
                                            </div>
                                        </th>
                                        <th class="px-6 py-1.5 bg-white border-r-2 border-indigo-300 text-left">
                                            <span class="font-black text-indigo-900">AM Name</span>
                                        </th>
                                        ${app.adminShowYTD ? `
                                            <th class="px-2 py-1.5 border-r border-slate-200 font-bold">Budget</th>
                                            <th class="px-2 py-1.5 font-black text-slate-800 border-r border-slate-200">Actual</th>
                                            <th class="px-2 py-1.5 font-black border-r-2 border-indigo-300 text-indigo-900">Ach%</th>
                                        ` : ''}
                                        ${app.adminShowLastMonth ? `
                                            <th class="px-2 py-1.5 border-r border-slate-200 font-bold">Budget</th>
                                            <th class="px-2 py-1.5 font-black text-slate-800 border-r-2 border-indigo-300">Actual</th>
                                        ` : ''}
                                        <th class="px-2 py-1.5 bg-indigo-50/80 border-r border-slate-200 font-bold">Budget</th>
                                        <th class="px-2 py-1.5 bg-indigo-50/80 font-black text-slate-800 border-r border-slate-200">Proj</th>
                                        ${activeModels.map(m => `<th class="px-2 py-1.5 bg-indigo-50/80 text-slate-700 font-bold border-r border-slate-200">${m}</th>`).join('')}
                                        <th class="px-2 py-1.5 bg-indigo-100 text-indigo-950 font-black border-r border-indigo-200">Total</th>
                                        <th class="px-2 py-1.5 bg-indigo-100 text-indigo-950 font-black border-r-2 border-indigo-300">Ach%</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200 bg-white">
                                    ${areaStats.map(area => {
                            const modelCells = activeModels.map(mName => {
                                const qty = area.modelSales[mName] || 0;
                                return `<td class="px-2 py-1.5 bg-slate-50/40 ${qty > 0 ? 'font-black text-indigo-700' : 'text-slate-300'} border-r border-slate-200 text-center">${qty > 0 ? qty : '-'}</td>`;
                            }).join('');
                            const totalSalesDisplay = area.currSales > 0 ? `<div class="font-black text-[11px] text-indigo-950">${area.currSales}</div>` : '<span class="text-slate-400">0</span>';
                            const amAchVal = ach(area.currSales, area.currBudget);

                            return `
                                            <tr class="hover:bg-indigo-50/40 transition-colors text-center border-b border-slate-200">
                                                <td class="px-6 py-1.5 text-left sticky left-0 z-10 bg-white border-r-2 border-indigo-300 shadow-[3px_0_8px_rgba(0,0,0,0.06)] font-bold">
                                                    <div class="flex items-center gap-2">
                                                        <div class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm">${area.name.charAt(0)}</div>
                                                        <span class="font-black text-slate-800">${area.name}</span>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-1.5 text-left font-bold text-indigo-700 border-r-2 border-indigo-300 bg-indigo-50/30 whitespace-nowrap">
                                                    ${area.areaName}
                                                </td>
                                                ${app.adminShowYTD ? `
                                                    <td class="px-2 py-1.5 text-slate-500 font-medium border-r border-slate-200 bg-slate-50/40">${app.currentMonth === 'July' ? '-' : area.ytd.budget}</td>
                                                    <td class="px-2 py-1.5 font-black text-slate-800 border-r border-slate-200">${app.currentMonth === 'July' ? '-' : area.ytd.sales}</td>
                                                    <td class="px-2 py-1.5 font-black text-indigo-700 border-r-2 border-indigo-300 bg-indigo-50/40">${app.currentMonth === 'July' ? '-' : `${ach(area.ytd.sales, area.ytd.budget)}%`}</td>
                                                ` : ''}
                                                ${app.adminShowLastMonth ? `
                                                    <td class="px-2 py-1.5 text-slate-500 font-medium border-r border-slate-200 bg-slate-50/40">${app.currentMonth === 'July' ? '-' : area.lastMonth.budget}</td>
                                                    <td class="px-2 py-1.5 font-black text-slate-800 border-r-2 border-indigo-300">${app.currentMonth === 'July' ? '-' : area.lastMonth.sales}</td>
                                                ` : ''}
                                                <td class="px-2 py-1.5 bg-slate-50/40 text-slate-500 font-medium border-r border-slate-200">${area.currBudget}</td>
                                                <td class="px-2 py-1.5 bg-slate-50/40 font-black text-slate-800 border-r border-slate-200">${area.currProj}</td>
                                                ${modelCells}
                                                <td class="px-2 py-1.5 bg-indigo-50/80 font-black text-indigo-950 border-r border-indigo-200">${totalSalesDisplay}</td>
                                                <td class="px-2 py-1.5 bg-indigo-50/80 border-r-2 border-indigo-300">${app.getAchBadge(amAchVal)}</td>
                                            </tr>
                                        `;
                        }).join('')}
                                </tbody>
                            </table>
                        </div>

                        <!-- MOBILE CARD VIEW -->
                        <div class="md:hidden divide-y divide-slate-100">
                            ${areaStats.map(area => {
                            const ytdAchVal = ach(area.ytd.sales, area.ytd.budget);
                            const mAchVal = ach(area.currSales, area.currBudget);

                            return `
                                    <div class="p-5 bg-white active:bg-slate-50 transition-colors">
                                        <div class="flex justify-between items-center mb-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-black text-lg">
                                                    ${area.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 class="font-black text-slate-800">${area.name}</h4>
                                                    <div class="flex items-center gap-1.5 mt-0.5">
                                                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${area.areaName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <span class="text-2xl font-black text-indigo-700">${area.currSales}</span>
                                                <p class="text-[9px] font-black text-slate-400 uppercase">Sales Units</p>
                                            </div>
                                        </div>
                                        
                                        <div class="grid grid-cols-2 gap-3">
                                            <div class="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
                                                <div class="flex justify-between items-center mb-1">
                                                    <p class="text-[8px] font-black text-indigo-400 uppercase">M-Target Ach</p>
                                                    <span class="text-[10px] font-black text-indigo-700">${mAchVal}%</span>
                                                </div>
                                                <div class="w-full bg-white h-1.5 rounded-full overflow-hidden border border-indigo-100">
                                                    <div class="h-full bg-indigo-600 rounded-full" style="width: ${Math.min(100, mAchVal)}%"></div>
                                                </div>
                                            </div>
                                            <div class="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                                                <div class="flex justify-between items-center mb-1">
                                                    <p class="text-[8px] font-black text-emerald-500 uppercase">YTD Target</p>
                                                    <span class="text-[10px] font-black text-emerald-700">${app.currentMonth === 'July' ? '-' : `${ytdAchVal}%`}</span>
                                                </div>
                                                <div class="w-full bg-white h-1.5 rounded-full overflow-hidden border border-emerald-100">
                                                    <div class="h-full bg-emerald-500 rounded-full" style="width: ${app.currentMonth === 'July' ? 0 : Math.min(100, ytdAchVal)}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                        }).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Detailed Sales Data Table (Like Admin Panel) -->
                    ${isAM ? `
                    <div class="glass rounded-[2rem] border border-white shadow-xl overflow-hidden mb-8">
                        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                            <div>
                                <h3 class="font-black text-slate-800 flex items-center gap-2">
                                    <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                                        <i data-lucide="clipboard-list" class="w-5 h-5 text-emerald-600"></i>
                                    </div>
                                    Detailed Performance Data
                                </h3>
                                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Raw Sales Records for Assigned Territories</p>
                            </div>
                            <div class="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-100 shadow-sm flex items-center gap-2">
                                <i data-lucide="database" class="w-4 h-4"></i> Total Records: ${currFYSales.filter(s => s.brand === brandFilter).length}
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-[11px] whitespace-nowrap">
                                <thead>
                                    <tr class="bg-slate-50/80 text-slate-500 uppercase tracking-widest text-[9px] border-b border-slate-100">
                                        <th class="px-6 py-4 font-black sticky left-0 z-10 bg-slate-50">Customer Details</th>
                                        <th class="px-3 py-4">Location</th>
                                        <th class="px-3 py-4">Vehicle</th>
                                        <th class="px-3 py-4">Sale Type</th>
                                        <th class="px-3 py-4 text-center">Units</th>
                                        <th class="px-3 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-50 bg-white">
                                    ${currFYSales.filter(s => s.brand === brandFilter).map(s => `
                                        <tr class="hover:bg-slate-50/50 transition-colors group">
                                            <td class="px-6 py-4 text-left sticky left-0 z-10 bg-white border-r border-slate-50 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                                <div class="font-bold text-slate-700">${s.customer_name || s.customer_id || 'Unknown'}</div>
                                                <div class="text-[9px] text-slate-400 mt-0.5">${s.phone || 'No phone'}</div>
                                            </td>
                                            <td class="px-3 py-4 text-slate-600">
                                                <div class="font-bold text-slate-800">${DB.territories.find(t => t.id === s.territory_id)?.name || 'Unknown'}</div>
                                                <div class="font-medium text-slate-700 mt-0.5">${s.upazila}</div>
                                                <div class="text-[9px] text-slate-400 mt-0.5">${s.district}</div>
                                            </td>
                                            <td class="px-3 py-4">
                                                <div class="flex items-center gap-1.5">
                                                    <span class="px-1.5 py-0.5 rounded text-[8px] font-bold border ${s.brand === 'Foton' ? 'bg-foton-light text-foton border-foton/30' : 'bg-mahindra-light text-mahindra border-mahindra/30'}">${s.brand}</span>
                                                    <span class="font-black text-slate-800">${s.model}</span>
                                                </div>
                                            </td>
                                            <td class="px-3 py-4 text-slate-500">${s.sale_type}</td>
                                            <td class="px-3 py-4 font-black text-indigo-600 text-center">${s.unit_qty}</td>
                                            <td class="px-3 py-4"><span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[9px] font-bold uppercase">Delivered</span></td>
                                        </tr>
                                    `).join('')}
                                    ${currFYSales.filter(s => s.brand === brandFilter).length === 0 ? '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400 font-medium">No sales data found for the selected criteria.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}

                        <!-- Custom Report Engine -->
                        <div class="mt-5 mb-2">
                            <div class="glass p-5 rounded-2xl border border-slate-200/80 shadow-md relative overflow-hidden bg-white/90 backdrop-blur-md">
                                <div class="relative z-10">
                                    <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100">
                                        <div class="flex items-center gap-2.5">
                                            <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center">
                                                <i data-lucide="download-cloud" class="w-4 h-4 text-white"></i>
                                            </div>
                                            <div>
                                                <h2 class="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                                                    Custom Report Engine
                                                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">Enterprise Export</span>
                                                </h2>
                                                <p class="text-[10px] text-slate-500 font-medium mt-0.5">Generate tailored territory, target, actual & SPLY data reports</p>
                                            </div>
                                        </div>

                                        <!-- Filter Toggles Inline -->
                                        <div class="flex items-center gap-3 bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200/60 text-[10px]">
                                            <label class="flex items-center gap-1.5 cursor-pointer group">
                                                <input type="checkbox" id="export-inc-budget" checked class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20">
                                                <span class="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Target/Budget</span>
                                            </label>
                                            <div class="w-px h-3.5 bg-slate-200"></div>
                                            <label class="flex items-center gap-1.5 cursor-pointer group">
                                                <input type="checkbox" id="export-inc-actual" checked class="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20">
                                                <span class="font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">Actual Sales</span>
                                            </label>
                                            <div class="w-px h-3.5 bg-slate-200"></div>
                                            <label class="flex items-center gap-1.5 cursor-pointer group">
                                                <input type="checkbox" id="export-inc-sply" checked class="w-3.5 h-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20">
                                                <span class="font-bold text-slate-600 group-hover:text-amber-600 transition-colors">SPLY Data</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                        <!-- Month Select -->
                                        <div class="space-y-1">
                                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Month</label>
                                            <select id="export-month" class="w-full bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August" selected>August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                        </div>

                                        <!-- FY Select -->
                                        <div class="space-y-1">
                                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Financial Year</label>
                                            <select id="export-fy" class="w-full bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                                                <option value="2026-27">FY 2026-27</option>
                                                <option value="2025-26">FY 2025-26</option>
                                                <option value="2024-25">FY 2024-25</option>
                                            </select>
                                        </div>

                                        <!-- Territory Select -->
                                        <div class="space-y-1">
                                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Territory</label>
                                            <select id="export-territory" class="w-full bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                                                <option value="ALL">All Territories</option>
                                            </select>
                                        </div>
                                        
                                        <!-- Brand Select -->
                                        <div class="space-y-1">
                                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Brand</label>
                                            <select id="export-brand" class="w-full bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                                                <option value="ALL">All Brands</option>
                                                <option value="Foton">Foton</option>
                                                <option value="Mahindra">Mahindra</option>
                                            </select>
                                        </div>
                                        
                                        <!-- Sale Type Select -->
                                        <div class="space-y-1">
                                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sale Type</label>
                                            <select id="export-sale-type" class="w-full bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                                                <option value="ALL">All Types</option>
                                                <option value="New Sale">New Sale</option>
                                                <option value="Resale">Resale</option>
                                                <option value="Credit Note">Credit Note</option>
                                            </select>
                                        </div>

                                        <!-- Action Button -->
                                        <div class="flex items-end">
                                            <button onclick="app.generateCustomReport()" class="w-full h-[32px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-lg shadow-md shadow-indigo-200/50 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5">
                                                <i data-lucide="download" class="w-3.5 h-3.5"></i> Export CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                
                setTimeout(() => {
                    const terrSelect = document.getElementById('export-territory');
                    if(terrSelect && DB.territories && terrSelect.options.length <= 1) {
                        DB.territories.forEach(t => {
                            const opt = document.createElement('option');
                            opt.value = t.id;
                            opt.textContent = t.name;
                            terrSelect.appendChild(opt);
                        });
                    }
                    const fySelect = document.getElementById('export-fy');
                    if(fySelect && app.currentFY) {
                        fySelect.value = app.currentFY;
                    }
                }, 100);

                // Highlight active mobile nav tab
                ['nav-dashboard', 'nav-map', 'nav-ai', 'nav-emi', 'nav-notices'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.remove('nav-tab-active', 'text-aci-blue');
                });
                const activeNav = document.getElementById('nav-dashboard');
                if (activeNav) activeNav.classList.add('nav-tab-active', 'text-aci-blue');

                // Calculate YOY Chart specific data based on local YOY Brand Tab
                let yoyTgts = DB.targets.filter(tg => tg.fy === currentFY && tg.sale_type === currentSaleType);
                if (app.yoyBrandTab !== 'All') yoyTgts = yoyTgts.filter(tg => tg.brand === app.yoyBrandTab);
                if (isAM) yoyTgts = yoyTgts.filter(tg => app.currentUser.territories.includes(tg.territory_id));
                if (app.yoyTerritoryFilter !== 'All') yoyTgts = yoyTgts.filter(tg => tg.territory_id === app.yoyTerritoryFilter);
                
                const yoyMonthsList = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const yoyMonthlyBudgets = yoyMonthsList.map(m => {
                    const monthTgts = yoyTgts.filter(tg => tg.month === m);
                    return monthTgts.length > 0 ? monthTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : (Math.round(yoyTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12) || 0);
                });

                let yoyCurrSales = currFYSales;
                let yoyLastSales = lastFYSales;
                if (app.yoyBrandTab !== 'All') {
                    yoyCurrSales = yoyCurrSales.filter(s => s.brand === app.yoyBrandTab);
                    yoyLastSales = yoyLastSales.filter(s => s.brand === app.yoyBrandTab);
                }
                if (app.yoyTerritoryFilter !== 'All') {
                    yoyCurrSales = yoyCurrSales.filter(s => s.territory_id === app.yoyTerritoryFilter);
                    yoyLastSales = yoyLastSales.filter(s => s.territory_id === app.yoyTerritoryFilter);
                }

                // Render Charts
                const chartTheme = app.getBrandTheme(app.yoyBrandTab || 'Foton');
                app.renderChartYoyTrend(yoyCurrSales, yoyLastSales, yoyMonthlyBudgets, chartTheme);
                app.renderDashboardMiniMap(yoyCurrSales);
                app.renderChartTerritory(currFYSales);
                app.renderChartBrand(fotonUnits, mahindraUnits);
            };

window.app.renderDashboardMiniMap = async (yoyCurrSales) => {
                const monthSales = yoyCurrSales.filter(s => s.sales_month === app.currentMonth);
                const totalMonthSales = monthSales.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                
                const badgeEl = document.getElementById('minimap-sales-total');
                if (badgeEl) badgeEl.innerText = totalMonthSales + ' Units';

                // Aggregate District Sales
                const districtAgg = {};
                monthSales.forEach(s => {
                    if (s.district) {
                        districtAgg[s.district] = (districtAgg[s.district] || 0) + Number(s.unit_qty || 0);
                    }
                });

                const maxSales = Math.max(...Object.values(districtAgg), 1);
                const normalizedAgg = {};
                Object.entries(districtAgg).forEach(([k, v]) => {
                    normalizedAgg[app.getNormalizedKey(k)] = v;
                });

                setTimeout(async () => {
                    // Clear existing map instance
                    if (app.dashboardMiniMap) {
                        try {
                            app.dashboardMiniMap.remove();
                        } catch (e) {
                            console.error('Failed to remove mini map:', e);
                        }
                        app.dashboardMiniMap = null;
                    }

                    // Check if element exists in DOM
                    const mapContainer = document.getElementById('dashboard-mini-map');
                    if (!mapContainer) return;

                    // Initialize Leaflet mini map
                    app.dashboardMiniMap = L.map('dashboard-mini-map', {
                        zoomControl: false,
                        attributionControl: false,
                        maxBounds: [[20.0, 87.5], [27.0, 93.0]],
                        minZoom: 5.5,
                        maxZoom: 9,
                        zoomSnap: 0.05,
                        zoomDelta: 0.5
                    }).setView([23.75, 90.25], 6.05);

                    try {
                        const geoUrl = 'https://cdn.jsdelivr.net/gh/ahnaf-tahmid-chowdhury/Choropleth-Bangladesh@master/bangladesh_geojson_adm2_64_districts_zillas.json';
                        if (!app.geoJsonCache) app.geoJsonCache = {};
                        if (!app.geoJsonCache['district']) {
                            const res = await fetch(geoUrl);
                            if (!res.ok) throw new Error('Failed to fetch mini-map boundaries');
                            app.geoJsonCache['district'] = await res.json();
                        }

                        const geoData = app.geoJsonCache['district'];

                        // Color palette logic matching high/med/low density
                        const getPolygonColor = (d) => {
                            if (!d || d === 0) return '#f8fafc'; // light slate-50 background for 0 sales
                            const pct = d / maxSales;
                            if (pct > 0.66) return '#e11d48'; // rose-600 (High sales)
                            if (pct > 0.33) return '#f59e0b'; // amber-500 (Med sales)
                            return '#3b82f6'; // blue-500 (Low sales)
                        };

                        const style = (feature) => {
                            const propName = feature.properties.ADM2_EN || feature.properties.name || feature.properties.NAME_2 || '';
                            const normProp = app.getNormalizedKey(propName);
                            const sales = normalizedAgg[normProp] || 0;
                            return {
                                fillColor: getPolygonColor(sales),
                                weight: sales > 0 ? 1.5 : 0.8,
                                opacity: 1,
                                color: sales > 0 ? '#ffffff' : '#cbd5e1', // white border if has sales, light slate border if empty
                                fillOpacity: sales > 0 ? 0.75 : 0.25
                            };
                        };

                        const onEachFeature = (feature, layer) => {
                            const propName = feature.properties.ADM2_EN || feature.properties.name || feature.properties.NAME_2 || '';
                            const normProp = app.getNormalizedKey(propName);
                            const sales = normalizedAgg[normProp] || 0;
                            
                            layer.bindTooltip(`
                                <div class="px-2 py-1 text-slate-800 font-bold font-sans text-xs bg-white rounded-lg shadow border border-slate-100">
                                    <div class="text-[10px] text-slate-500 font-medium">${propName}</div>
                                    <div class="text-indigo-600 font-extrabold mt-0.5">${sales} Units</div>
                                </div>
                            `, {
                                permanent: false,
                                sticky: true,
                                opacity: 0.95,
                                className: 'custom-leaflet-tooltip'
                            });

                            layer.on({
                                mouseover: (e) => {
                                    const l = e.target;
                                    l.setStyle({
                                        weight: 2,
                                        color: '#10b981', // Emerald green border on hover
                                        fillOpacity: 0.9
                                    });
                                },
                                mouseout: (e) => {
                                    geojsonLayer.resetStyle(e.target);
                                }
                            });
                        };

                        const geojsonLayer = L.geoJSON(geoData, {
                            style: style,
                            onEachFeature: onEachFeature
                        }).addTo(app.dashboardMiniMap);

                        // Enforce Leaflet layout recalculation
                        app.dashboardMiniMap.invalidateSize();

                    } catch (err) {
                        console.error('Failed to load dashboard mini map:', err);
                    }
                }, 100);
            };

window.app.renderChartYoyTrend = (currData, lastData, monthlyBudget, theme = null) => {
                // Clear any existing animation frame to prevent duplicate loops
                if (app.charts.yoyTrendAnimFrame) {
                    cancelAnimationFrame(app.charts.yoyTrendAnimFrame);
                    app.charts.yoyTrendAnimFrame = null;
                }
                if (app.charts.yoyTrend) app.charts.yoyTrend.destroy();

                const ctx = document.getElementById('chartYoyTrend').getContext('2d');

                const fullMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const shortMonths = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

                const currAgg = Array(12).fill(0);
                const lastAgg = Array(12).fill(0);
                const budgetAgg = Array.isArray(monthlyBudget) ? monthlyBudget : Array(12).fill(monthlyBudget || 0);

                currData.forEach(s => {
                    const idx = fullMonths.indexOf(s.sales_month);
                    if (idx > -1) currAgg[idx] += Number(s.unit_qty || 0);
                });

                lastData.forEach(s => {
                    const idx = fullMonths.indexOf(s.sales_month);
                    if (idx > -1) lastAgg[idx] += Number(s.unit_qty || 0);
                });

                // Truncate future months based on selected current reporting month
                const currentMonthIdx = fullMonths.indexOf(app.currentMonth);
                const displayCurrAgg = currAgg.map((val, idx) => idx <= currentMonthIdx ? val : null);

                const defaultGradFrom = theme ? theme.chartGradFrom : 'rgba(15, 41, 66, 0.4)';
                const defaultGradTo = theme ? theme.chartGradTo : 'rgba(15, 41, 66, 0.0)';
                const defaultLineColor = theme ? theme.primaryHex : '#0F2942';

                const currGrad = ctx.createLinearGradient(0, 0, 0, 300);
                currGrad.addColorStop(0, defaultGradFrom);
                currGrad.addColorStop(1, defaultGradTo);

                const datasets = [];

                // 1. Current Year Line (Will be actively animated via loop)
                datasets.push({
                    label: 'Current FY (25-26)',
                    data: displayCurrAgg,
                    borderColor: defaultLineColor, // Base color, overridden by animation loop
                    backgroundColor: currGrad,
                    borderWidth: 4,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#06b6d4',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                });

                // 2. Last Year Line (Toggleable & Distinct Color)
                if (app.yoyShowLY) {
                    datasets.push({
                        label: 'Last FY (24-25)',
                        data: lastAgg,
                        borderColor: '#f59e0b', // Distinct Amber/Orange
                        borderWidth: 2,
                        borderDash: [6, 4],
                        tension: 0.4,
                        fill: false,
                        pointBackgroundColor: '#f59e0b',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    });
                }

                // 3. Monthly Budget Line (Animated Marching Ants)
                datasets.push({
                    label: 'Monthly Budget',
                    data: budgetAgg,
                    borderColor: '#94a3b8', // Slate 400
                    borderWidth: 2,
                    borderDash: [8, 6],
                    tension: 0,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0
                });

                // Custom Creative DataLabels Plugin
                const creativeYoyDataLabels = {
                    id: 'creativeYoyDataLabels',
                    afterDatasetsDraw(chart) {
                        const { ctx } = chart;
                        ctx.save();

                        const drawPill = (x, y, text, bgStyle, borderStyle, textStyle, isAbove = true, offset = 26) => {
                            ctx.font = 'bold 10px Inter, sans-serif';
                            const textWidth = ctx.measureText(text).width;
                            const paddingX = 6;
                            const paddingY = 3;
                            const boxWidth = textWidth + paddingX * 2;
                            const boxHeight = 15;
                            const boxX = x - boxWidth / 2;
                            const boxY = isAbove ? y - offset : y + (offset - boxHeight);

                            // Connecting stem line
                            ctx.beginPath();
                            ctx.moveTo(x, isAbove ? y - 5 : y + 5);
                            ctx.lineTo(x, isAbove ? boxY + boxHeight : boxY);
                            ctx.strokeStyle = borderStyle || 'rgba(15, 41, 66, 0.2)';
                            ctx.lineWidth = 1;
                            ctx.stroke();

                            // Pill Background
                            ctx.fillStyle = bgStyle;
                            ctx.beginPath();
                            if (ctx.roundRect) {
                                ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 7);
                            } else {
                                ctx.rect(boxX, boxY, boxWidth, boxHeight);
                            }
                            ctx.fill();

                            if (borderStyle) {
                                ctx.strokeStyle = borderStyle;
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            }

                            // Number text
                            ctx.fillStyle = textStyle;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(text, x, boxY + boxHeight / 2 + 0.5);
                        };

                        chart.data.datasets.forEach((dataset, datasetIndex) => {
                            const meta = chart.getDatasetMeta(datasetIndex);
                            if (meta.hidden) return;

                            const isCurrentFY = dataset.label && dataset.label.includes('Current FY');
                            const isLastFY = dataset.label && dataset.label.includes('Last FY');
                            const isBudget = dataset.label && dataset.label.includes('Budget');

                            meta.data.forEach((element, index) => {
                                const val = dataset.data[index];
                                if (val === null || val === undefined) return;

                                const x = element.x;
                                const y = element.y;

                                if (isCurrentFY) {
                                    drawPill(x, y, String(val), defaultLineColor, '#06b6d4', '#ffffff', true, 26);
                                } else if (isLastFY) {
                                    drawPill(x, y, String(val), '#fff7ed', '#f59e0b', '#b45309', false, 24);
                                } else if (isBudget) {
                                    drawPill(x, y, `B:${val}`, '#f8fafc', '#cbd5e1', '#475569', false, 18);
                                }
                            });
                        });

                        ctx.restore();
                    }
                };

                app.charts.yoyTrend = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: shortMonths,
                        datasets: datasets
                    },
                    plugins: [creativeYoyDataLabels],
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: {
                            legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 10 } } },
                            tooltip: { titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } }
                        },
                        scales: {
                            y: { border: { display: false }, grid: { borderDash: [4, 4], color: '#f1f5f9' }, beginAtZero: true },
                            x: { border: { display: false }, grid: { display: false } }
                        }
                    }
                });

                // Populate Creative Month-by-Month Performance Ribbon
                const ribbonEl = document.getElementById('yoy-monthly-ribbon');
                if (ribbonEl) {
                    ribbonEl.innerHTML = shortMonths.map((m, idx) => {
                        const isPastOrCurr = idx <= currentMonthIdx;
                        const actual = currAgg[idx];
                        const budget = budgetAgg[idx] || 0;
                        const ly = lastAgg[idx] || 0;
                        const ach = budget > 0 ? Math.round((actual / budget) * 100) : 0;
                        const isCurrMonth = idx === currentMonthIdx;

                        if (!isPastOrCurr) {
                            return `
                                <div class="flex-1 min-w-[70px] bg-slate-50/50 rounded-xl p-2 border border-slate-100 text-center opacity-60">
                                    <span class="text-[9px] font-black uppercase text-slate-400 block">${m}</span>
                                    <span class="text-xs font-bold text-slate-300 block mt-1">-</span>
                                    <span class="text-[9px] text-slate-400 font-mono block mt-1">B:${budget}</span>
                                </div>
                            `;
                        }

                        return `
                            <div class="flex-1 min-w-[75px] ${isCurrMonth ? 'bg-indigo-50/90 border-indigo-200 ring-2 ring-indigo-500/20 shadow-xs' : 'bg-white border-slate-200/80'} rounded-xl p-2 border text-center transition-all hover:scale-105">
                                <div class="flex items-center justify-center gap-1">
                                    <span class="text-[9px] font-black uppercase ${isCurrMonth ? 'text-indigo-700' : 'text-slate-500'}">${m}</span>
                                    ${isCurrMonth ? '<span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>' : ''}
                                </div>
                                <div class="text-sm font-black ${ach >= 100 ? 'text-emerald-600' : ach >= 80 ? 'text-indigo-600' : 'text-slate-800'} mt-0.5">${actual}</div>
                                <div class="flex items-center justify-between text-[8px] font-bold text-slate-400 mt-1 pt-1 border-t border-slate-100">
                                    <span>B:${budget}</span>
                                    ${app.yoyShowLY ? `<span class="text-amber-600 font-extrabold">LY:${ly}</span>` : `<span class="${ach >= 100 ? 'text-emerald-600' : 'text-slate-500'} font-extrabold">${ach}%</span>`}
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                // --- CREATIVE LIVE ANIMATION ENGINE ---
                let startTime = Date.now();
                const animateLine = () => {
                    if (!app.charts.yoyTrend) return;

                    const now = Date.now();
                    const elapsed = now - startTime;
                    let needsUpdate = false;
                    const canvasWidth = ctx.canvas.width;

                    if (canvasWidth > 0) {
                        // 1. Animate Current FY Gradient Color
                        const currData = app.charts.yoyTrend.data.datasets.find(d => d.label === 'Current FY (25-26)');
                        if (currData) {
                            const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);

                            // Calculate a smooth shifting phase
                            const pos = (elapsed % 3000) / 3000;

                            const colorBase = '#0F2942'; // ACI Blue
                            const colorHighlight1 = '#06b6d4'; // Cyan
                            const colorHighlight2 = '#6366f1'; // Indigo

                            gradient.addColorStop(0, colorBase);

                            // Moving bright spots along the line
                            let stops = [
                                { o: pos, c: colorHighlight1 },
                                { o: (pos + 0.3) % 1, c: colorHighlight2 }
                            ].sort((a, b) => a.o - b.o);

                            stops.forEach(s => {
                                if (s.o > 0 && s.o < 1) gradient.addColorStop(s.o, s.c);
                            });

                            gradient.addColorStop(1, colorBase);
                            currData.borderColor = gradient;
                            needsUpdate = true;
                        }

                        // 2. Animate Budget Line (Marching Ants)
                        const budgetData = app.charts.yoyTrend.data.datasets.find(d => d.label === 'Monthly Budget');
                        if (budgetData) {
                            budgetData.borderDashOffset = -(elapsed / 30); // Continuous scrolling dashes
                            needsUpdate = true;
                        }
                    }

                    // Only update the canvas without triggering massive layout redraws
                    if (needsUpdate) {
                        app.charts.yoyTrend.update('none');
                    }

                    // Request next frame
                    app.charts.yoyTrendAnimFrame = requestAnimationFrame(animateLine);
                };

                // Start the animation loop
                app.charts.yoyTrendAnimFrame = requestAnimationFrame(animateLine);
            };

window.app.toggleMapMonth = (month) => {
                if (!app.mapMonths) app.mapMonths = [];
                const idx = app.mapMonths.indexOf(month);
                if (idx > -1) {
                    app.mapMonths.splice(idx, 1);
                } else {
                    app.mapMonths.push(month);
                }
                app.renderAdminSalesMap(true);
            };

window.app.toggleAIMonth = (month) => {
                if (!app.aiMonths) app.aiMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const idx = app.aiMonths.indexOf(month);
                if (idx > -1) {
                    app.aiMonths.splice(idx, 1);
                } else {
                    app.aiMonths.push(month);
                }
                app.renderAdminAIInsights(true);
            };

window.app.showAIModal = (htmlContent) => {
                let modal = document.getElementById('ai-action-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'ai-action-modal';
                    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center';
                    document.body.appendChild(modal);
                } else {
                    modal.classList.remove('hidden');
                }
                modal.innerHTML = htmlContent;
                if (typeof app.refreshIcons === 'function') app.refreshIcons();
            };

window.app.closeAIModal = () => {
                const modal = document.getElementById('ai-action-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.innerHTML = '';
                }
            };

window.app.executeBudgetShiftModal = (sourceName, destName, amount, key) => {
                const html = `
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onclick="app.closeAIModal()"></div>
                    <div class="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 relative z-10 shadow-2xl flex flex-col border border-slate-100 transform scale-95 md:scale-100 transition-all duration-300">
                        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i data-lucide="arrow-left-right" class="w-4 h-4 text-purple-600"></i>
                                Optimize Budget Allocation
                            </h3>
                            <button onclick="app.closeAIModal()" class="text-slate-400 bg-slate-100 rounded-full hover:bg-slate-200 p-1.5 transition-colors">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                        <div class="space-y-4">
                            <p class="text-xs font-semibold text-slate-500 leading-relaxed">
                                AI has detected a conversion risk in <span class="text-slate-800 font-extrabold">${destName}</span>. Shifting surplus marketing budget from <span class="text-slate-800 font-extrabold">${sourceName}</span> can boost conversion rates in the target area without hurting the donor region.
                            </p>
                            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <div class="flex justify-between items-center text-xs">
                                    <span class="font-bold text-slate-400 uppercase tracking-wider">Source (Surplus)</span>
                                    <span class="font-black text-slate-700">${sourceName}</span>
                                </div>
                                <div class="flex justify-between items-center text-xs">
                                    <span class="font-bold text-slate-400 uppercase tracking-wider">Destination (Deficit)</span>
                                    <span class="font-black text-slate-700">${destName}</span>
                                </div>
                                <div class="flex justify-between items-center text-xs">
                                    <span class="font-bold text-slate-400 uppercase tracking-wider">Reallocation Pct</span>
                                    <span class="font-black text-purple-600">${amount}% of Promo Budget</span>
                                </div>
                            </div>
                            <div class="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[10px] text-purple-700 font-semibold leading-relaxed flex gap-2">
                                <i data-lucide="sparkles" class="w-3.5 h-3.5 shrink-0 text-purple-500"></i>
                                <span>Estimated Impact: Surplus region is projected to maintain target easily. Target region is projected to gain <strong class="font-extrabold text-purple-800">+8 to +12 sales units</strong>.</span>
                            </div>
                        </div>
                        <div class="flex gap-3 mt-6 pt-3 border-t border-slate-100">
                            <button onclick="app.closeAIModal()" class="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 text-[10px] uppercase tracking-wider transition-colors">Cancel</button>
                            <button onclick="app.confirmBudgetShift('${sourceName}', '${destName}', ${amount}, '${key}')" class="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-wider shadow-lg shadow-purple-200 transition-colors">Confirm Shift</button>
                        </div>
                    </div>
                `;
                app.showAIModal(html);
            };

window.app.confirmBudgetShift = (sourceName, destName, amount, key) => {
                if (typeof app.aiActionsState === 'undefined') app.aiActionsState = {};
                app.aiActionsState[key] = 'Executed';
                localStorage.setItem('aci_ai_actions_state', JSON.stringify(app.aiActionsState));
                app.closeAIModal();
                app.showToast(`Budget successfully shifted from ${sourceName} to ${destName}!`, 'success');
                app.renderAdminAIInsights(true);
            };

window.app.dispatchAINoticeModal = (territoryName, achVal, key) => {
                const defaultTitle = `Action Required: Performance Acceleration in ${territoryName}`;
                const defaultMsg = `Dear Area Manager & Branch Officers in ${territoryName},\n\nAI analysis of sales targets for the current period indicates that ${territoryName} is currently pacing at only ${achVal}% achievement. This is below the required conversion threshold.\n\nPlease mobilize all MOs to accelerate customer follow-ups and prioritize under-negotiated deals immediately to secure our target for the month.\n\nBest Regards,\nSales360 Strategic Operations Center`;

                const html = `
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onclick="app.closeAIModal()"></div>
                    <div class="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 relative z-10 shadow-2xl flex flex-col border border-slate-100 transform scale-95 md:scale-100 transition-all duration-300">
                        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i data-lucide="megaphone" class="w-4 h-4 text-indigo-600"></i>
                                Dispatch AI Target Notice
                            </h3>
                            <button onclick="app.closeAIModal()" class="text-slate-400 bg-slate-100 rounded-full hover:bg-slate-200 p-1.5 transition-colors">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                        <div class="space-y-4">
                            <p class="text-xs font-semibold text-slate-500 leading-relaxed">
                                Send a target acceleration directive to all branch officers in <span class="text-slate-800 font-extrabold">${territoryName}</span>. This will be posted to the global Notices Board immediately.
                            </p>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Notice Title</label>
                                    <input type="text" id="ai-notice-title" value="${defaultTitle}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Notice Message</label>
                                    <textarea id="ai-notice-msg" rows="5" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed">${defaultMsg}</textarea>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-3 mt-6 pt-3 border-t border-slate-100">
                            <button onclick="app.closeAIModal()" class="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 text-[10px] uppercase tracking-wider transition-colors">Cancel</button>
                            <button onclick="app.confirmDispatchNotice('${key}')" class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider shadow-lg shadow-indigo-200 transition-colors">Publish Notice</button>
                        </div>
                    </div>
                `;
                app.showAIModal(html);
            };

window.app.confirmDispatchNotice = async (key) => {
                const title = document.getElementById('ai-notice-title').value;
                const msg = document.getElementById('ai-notice-msg').value;

                if (!title || !msg) {
                    app.showToast('Notice Title and Message cannot be empty.', 'warning');
                    return;
                }

                app.showLoader('Circulating Notice...');
                try {
                    const newNotice = {
                        id: 'n_' + Math.floor(Math.random() * 1000000),
                        title: title,
                        message: msg,
                        fileName: null,
                        fileType: null,
                        timestamp: new Date().toLocaleDateString('en-GB')
                    };
                    DB.notices.push(newNotice);

                    if (app.neonSQL) {
                        await app.neonSQL`INSERT INTO notices (id, title, message, timestamp, filetype, filename) VALUES (${newNotice.id}, ${newNotice.title}, ${newNotice.message}, ${newNotice.timestamp}, ${newNotice.fileType}, ${newNotice.fileName})`;
                    }

                    // Trigger notification bell/badge update
                    const badge = document.getElementById('global-notice-badge');
                    const ping = document.getElementById('global-notice-ping');
                    const bellIcon = document.getElementById('global-notice-icon');
                    const msgPopup = document.getElementById('global-notice-message');
                    if (badge) badge.style.display = 'block';
                    if (ping) ping.style.display = 'block';
                    if (msgPopup) {
                        msgPopup.classList.remove('hidden');
                        msgPopup.classList.add('block');
                    }
                    if (bellIcon) {
                        bellIcon.classList.remove('text-slate-500');
                        bellIcon.classList.add('animate-ring-shake', 'text-amber-500');
                    }

                    if (typeof app.aiActionsState === 'undefined') app.aiActionsState = {};
                    app.aiActionsState[key] = 'Executed';
                    localStorage.setItem('aci_ai_actions_state', JSON.stringify(app.aiActionsState));

                    app.closeAIModal();
                    app.showToast('Strategic notice circulated globally!', 'success');
                    app.renderAdminAIInsights(true);
                } catch (err) {
                    console.error('Failed to circulate AI notice:', err);
                    app.showToast('Failed to save notice to database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

window.app.transferInventoryModal = (modelName, upazilaName, qty, key) => {
                const html = `
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onclick="app.closeAIModal()"></div>
                    <div class="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 relative z-10 shadow-2xl flex flex-col border border-slate-100 transform scale-95 md:scale-100 transition-all duration-300">
                        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <i data-lucide="package" class="w-4 h-4 text-amber-600"></i>
                                Pre-position Inventory
                            </h3>
                            <button onclick="app.closeAIModal()" class="text-slate-400 bg-slate-100 rounded-full hover:bg-slate-200 p-1.5 transition-colors">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                        <div class="space-y-4">
                            <p class="text-xs font-semibold text-slate-500 leading-relaxed">
                                Demand trends identify highly accelerated velocity for <span class="text-slate-800 font-extrabold">${modelName}</span> in <span class="text-slate-800 font-extrabold">${upazilaName}</span>. AI recommends pre-allocating inventory to local dealer warehouse to avoid stockouts.
                            </p>
                            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <div class="flex justify-between items-center text-xs">
                                    <span class="font-bold text-slate-400 uppercase tracking-wider">Model Name</span>
                                    <span class="font-black text-slate-700">${modelName}</span>
                                </div>
                                <div class="flex justify-between items-center text-xs">
                                    <span class="font-bold text-slate-400 uppercase tracking-wider">Target Upazila</span>
                                    <span class="font-black text-slate-700">${upazilaName}</span>
                                </div>
                                <div class="flex justify-between items-center text-xs">
                                    <span class="font-bold text-slate-400 uppercase tracking-wider">Reallocation Volume</span>
                                    <span class="font-black text-amber-600">${qty} Units</span>
                                </div>
                            </div>
                            <div class="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 font-semibold leading-relaxed flex gap-2">
                                <i data-lucide="info" class="w-3.5 h-3.5 shrink-0 text-amber-500"></i>
                                <span>Estimated Transit: 2 working days. Pre-allocation secures supply-chain lead time, mitigating loss-of-sales risk.</span>
                            </div>
                        </div>
                        <div class="flex gap-3 mt-6 pt-3 border-t border-slate-100">
                            <button onclick="app.closeAIModal()" class="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 text-[10px] uppercase tracking-wider transition-colors">Cancel</button>
                            <button onclick="app.confirmTransferInventory('${modelName}', '${upazilaName}', ${qty}, '${key}')" class="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-wider shadow-lg shadow-amber-200 transition-colors">Confirm Transfer</button>
                        </div>
                    </div>
                `;
                app.showAIModal(html);
            };

window.app.confirmTransferInventory = (modelName, upazilaName, qty, key) => {
                if (typeof app.aiActionsState === 'undefined') app.aiActionsState = {};
                app.aiActionsState[key] = 'Executed';
                localStorage.setItem('aci_ai_actions_state', JSON.stringify(app.aiActionsState));
                app.closeAIModal();
                app.showToast(`${qty} units of ${modelName} pre-positioned to ${upazilaName}!`, 'success');
                app.renderAdminAIInsights(true);
            };

window.app.getNormalizedKey = (name) => {
                if (!name) return '';
                const aliases = { 'chittagong': 'chattogram', 'barisal': 'barishal', 'jessore': 'jashore', 'bogra': 'bogura', 'comilla': 'cumilla' };
                let clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                clean = clean.replace(/sadar$/, '');
                return aliases[clean] || clean;
            };

window.app.selectMapArea = (name) => {
                if (app.mapViewMode === 'district') {
                    app.mapDistrictTab = name;
                    app.mapViewMode = 'upazila';
                    app.renderAdminSalesMap();
                } else {
                    if (app.geoLayer) {
                        let found = false;
                        app.geoLayer.eachLayer(layer => {
                            const propName = layer.feature.properties.ADM3_EN || layer.feature.properties.name || '';
                            if (app.getNormalizedKey(propName) === app.getNormalizedKey(name)) {
                                found = true;
                                layer.fire('mouseover');
                                app.salesMap.fitBounds(layer.getBounds(), { padding: [40, 40] });
                            }
                        });
                        if (!found) {
                            app.showToast(`Upazila boundary for ${name} not found on map.`, 'info');
                        }
                    }
                }
            };

window.app.filterMapList = (val) => {
                const query = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                const items = document.querySelectorAll('#map-area-list > div');
                items.forEach(item => {
                    const name = item.getAttribute('data-name');
                    if (name.includes(query)) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            };

window.app.hoverMapArea = (name) => {
                if (!app.geoLayer) return;
                app.geoLayer.eachLayer(layer => {
                    const propName = app.mapViewMode === 'district'
                        ? (layer.feature.properties.ADM2_EN || layer.feature.properties.name || '')
                        : (layer.feature.properties.ADM3_EN || layer.feature.properties.name || '');
                    
                    if (name && app.getNormalizedKey(propName) === app.getNormalizedKey(name)) {
                        layer.setStyle({ weight: 3, color: '#10b981', fillOpacity: 0.85 });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) { layer.bringToFront(); }
                    } else {
                        app.geoLayer.resetStyle(layer);
                    }
                });
            };

window.app.renderAdminAnalytics = (keepDropdownOpen = false) => {
                try {
                    localStorage.setItem('aci_last_page', 'analytics');
                    app.setupSidebar();
                    app.closeSidebar();

                    const monthsList = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                    const passedMonthsCount = app.getYtdMonths(app.currentMonth).length || 1; // Avoid division by zero

                    // Helper to filter sales
                    const filterSales = (fy) => {
                        return DB.sales.filter(s => {
                            let match = s.fy === fy && String(s.unit_qty) !== '0';
                            if (app.analyticsBrand !== 'All') match = match && s.brand === app.analyticsBrand;
                            if (app.analyticsModel !== 'All') match = match && s.model === app.analyticsModel;
                            if (app.analyticsTerritory !== 'All') match = match && s.territory_id === app.analyticsTerritory;
                            if (app.analyticsUpazila !== 'All') match = match && s.upazila === app.analyticsUpazila;
                            return match;
                        });
                    };

                    const salesFY1 = filterSales(app.analyticsFY1);
                    const salesFY2 = filterSales(app.analyticsFY2);

                    const totalFY1 = salesFY1.reduce((sum, s) => sum + Number(s.unit_qty), 0);
                    const totalFY2 = salesFY2.reduce((sum, s) => sum + Number(s.unit_qty), 0);
                    
                    // For prediction, check if the FY is the current one. If not, prediction = actual.
                    const predictFY1 = app.analyticsFY1 === app.currentFY ? Math.round((totalFY1 / passedMonthsCount) * 12) : totalFY1;
                    const predictFY2 = app.analyticsFY2 === app.currentFY ? Math.round((totalFY2 / passedMonthsCount) * 12) : totalFY2;

                    const growthStr = totalFY1 > 0 ? (((totalFY2 - totalFY1) / totalFY1) * 100).toFixed(1) + '%' : 'N/A';
                    const isPositive = totalFY2 >= totalFY1;

                    // Unique dropdown values
                    const allFys = [...new Set(DB.sales.map(s => s.fy))].filter(Boolean).sort().reverse();
                    if(allFys.length === 0) allFys.push(app.currentFY);
                    
                    const allBrands = [...new Set(DB.sales.map(s => s.brand))].filter(Boolean).sort();
                    const allModels = [...new Set(DB.sales.map(s => s.model))].filter(Boolean).sort();
                    const allTerritories = DB.territories.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
                    const allUpazilas = [...new Set(DB.sales.map(s => s.upazila))].filter(Boolean).sort();

                    let html = `
                        <div class="animate-fade-in pb-20">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h2 class="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                        <i data-lucide="bar-chart-2" class="w-6 h-6 text-sky-500"></i> Historical Analytics
                                    </h2>
                                    <p class="text-xs text-slate-500 font-medium">Power BI style multi-dimensional comparison</p>
                                </div>
                            </div>

                            <!-- Filter Bar -->
                            <div class="glass p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end sticky top-16 z-20">
                                <div class="flex-1 min-w-[120px]">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Baseline FY</label>
                                    <select onchange="app.analyticsFY1 = this.value; app.renderAdminAnalytics(true)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500">
                                        ${allFys.map(f => `<option value="${f}" ${app.analyticsFY1 === f ? 'selected' : ''}>${f}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="flex-1 min-w-[120px]">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Compare FY</label>
                                    <select onchange="app.analyticsFY2 = this.value; app.renderAdminAnalytics(true)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500">
                                        ${allFys.map(f => `<option value="${f}" ${app.analyticsFY2 === f ? 'selected' : ''}>${f}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="flex-1 min-w-[120px]">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Brand</label>
                                    <select onchange="app.analyticsBrand = this.value; app.renderAdminAnalytics(true)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500">
                                        <option value="All" ${app.analyticsBrand === 'All' ? 'selected' : ''}>All Brands</option>
                                        ${allBrands.map(b => `<option value="${b}" ${app.analyticsBrand === b ? 'selected' : ''}>${b}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="flex-1 min-w-[120px]">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Model</label>
                                    <select onchange="app.analyticsModel = this.value; app.renderAdminAnalytics(true)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500">
                                        <option value="All" ${app.analyticsModel === 'All' ? 'selected' : ''}>All Models</option>
                                        ${allModels.map(m => `<option value="${m}" ${app.analyticsModel === m ? 'selected' : ''}>${m}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="flex-1 min-w-[120px]">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Territory</label>
                                    <select onchange="app.analyticsTerritory = this.value; app.analyticsUpazila = 'All'; app.renderAdminAnalytics(true)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500">
                                        <option value="All" ${app.analyticsTerritory === 'All' ? 'selected' : ''}>All Territories</option>
                                        ${allTerritories.map(t => `<option value="${t.id}" ${app.analyticsTerritory === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="flex-1 min-w-[120px]">
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upazila</label>
                                    <select onchange="app.analyticsUpazila = this.value; app.renderAdminAnalytics(true)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500">
                                        <option value="All" ${app.analyticsUpazila === 'All' ? 'selected' : ''}>All Upazilas</option>
                                        ${allUpazilas.map(u => `<option value="${u}" ${app.analyticsUpazila === u ? 'selected' : ''}>${u}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <!-- KPI Overview -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                <div class="glass p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between min-h-[95px]">
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Baseline (${app.analyticsFY1})</p>
                                        <h4 class="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">${totalFY1.toLocaleString()} <span class="text-[10px] font-medium text-slate-500">Units</span></h4>
                                    </div>
                                    <div class="text-[10px] text-slate-400 font-medium">YTD Forecast Close: <strong class="text-slate-600">${predictFY1.toLocaleString()}</strong></div>
                                </div>
                                
                                <div class="glass p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between min-h-[95px]">
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Compare (${app.analyticsFY2})</p>
                                        <h4 class="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">${totalFY2.toLocaleString()} <span class="text-[10px] font-medium text-slate-500">Units</span></h4>
                                    </div>
                                    <div class="text-[10px] text-slate-400 font-medium">YTD Forecast Close: <strong class="text-slate-600">${predictFY2.toLocaleString()}</strong></div>
                                </div>

                                <div class="glass p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between min-h-[95px]">
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">YOY Growth</p>
                                        <div class="flex items-center gap-1.5 mt-0.5">
                                            <span class="text-2xl font-black tracking-tight ${isPositive ? 'text-emerald-600' : 'text-rose-600'}">${growthStr}</span>
                                            <i data-lucide="${isPositive ? 'arrow-up-right' : 'arrow-down-right'}" class="w-5 h-5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}"></i>
                                        </div>
                                    </div>
                                    <div class="text-[10px] text-slate-400 font-medium">Compared to ${app.analyticsFY1} baseline</div>
                                </div>
                            </div>

                            <!-- Charts Section -->
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <!-- Line Chart -->
                                <div class="glass p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col">
                                    <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <i data-lucide="activity" class="w-4 h-4 text-sky-500"></i> Monthly Trend Analysis
                                    </h3>
                                    <div class="flex-1 relative min-h-[300px]">
                                        <canvas id="chartAnalyticsTrend"></canvas>
                                    </div>
                                </div>
                                
                                <!-- Brand Share -->
                                <div class="glass p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                                    <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <i data-lucide="pie-chart" class="w-4 h-4 text-purple-500"></i> Brand Share (${app.analyticsFY2})
                                    </h3>
                                    <div class="flex-1 relative min-h-[300px] flex items-center justify-center">
                                        <canvas id="chartAnalyticsBrand"></canvas>
                                    </div>
                                </div>
                                
                                <!-- Territory Bar Chart -->
                                <div class="glass p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-3 flex flex-col">
                                    <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <i data-lucide="bar-chart-horizontal" class="w-4 h-4 text-amber-500"></i> Regional Comparison (${app.analyticsFY1} vs ${app.analyticsFY2})
                                    </h3>
                                    <div class="flex-1 relative min-h-[400px]">
                                        <canvas id="chartAnalyticsRegion"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    document.getElementById('view-port').innerHTML = html;
                    lucide.createIcons();

                    // Prepare data for charts
                    const monthlyDataFY1 = new Array(12).fill(0);
                    const monthlyDataFY2 = new Array(12).fill(0);
                    
                    salesFY1.forEach(s => {
                        const idx = monthsList.indexOf(s.sales_month);
                        if (idx !== -1) monthlyDataFY1[idx] += Number(s.unit_qty);
                    });
                    
                    salesFY2.forEach(s => {
                        const idx = monthsList.indexOf(s.sales_month);
                        if (idx !== -1) monthlyDataFY2[idx] += Number(s.unit_qty);
                    });

                    // Prepare Brand Data for FY2
                    const brandMap = {};
                    salesFY2.forEach(s => {
                        const b = s.brand || 'Unknown';
                        brandMap[b] = (brandMap[b] || 0) + Number(s.unit_qty);
                    });
                    
                    // Prepare Regional Data (Territory)
                    const regionMap = {};
                    salesFY1.forEach(s => {
                        const tName = DB.territories.find(t => t.id === s.territory_id)?.name || s.territory_id;
                        if(!regionMap[tName]) regionMap[tName] = { fy1: 0, fy2: 0 };
                        regionMap[tName].fy1 += Number(s.unit_qty);
                    });
                    salesFY2.forEach(s => {
                        const tName = DB.territories.find(t => t.id === s.territory_id)?.name || s.territory_id;
                        if(!regionMap[tName]) regionMap[tName] = { fy1: 0, fy2: 0 };
                        regionMap[tName].fy2 += Number(s.unit_qty);
                    });

                    const sortedRegions = Object.keys(regionMap).sort((a,b) => regionMap[b].fy2 - regionMap[a].fy2); // Sort by FY2 descending

                    // Render Charts
                    app.renderChartAnalyticsTrend(monthsList, monthlyDataFY1, monthlyDataFY2, app.analyticsFY1, app.analyticsFY2);
                    app.renderChartAnalyticsBrand(Object.keys(brandMap), Object.values(brandMap));
                    app.renderChartAnalyticsRegion(sortedRegions, sortedRegions.map(r => regionMap[r].fy1), sortedRegions.map(r => regionMap[r].fy2), app.analyticsFY1, app.analyticsFY2);
                } catch (e) {
                    console.error("Historical Analytics Error:", e);
                    document.getElementById('view-port').innerHTML = `
                        <div class="p-6 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                            <div class="flex gap-3 items-start">
                                <div class="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                </div>
                                <div class="flex-1">
                                    <h3 class="text-sm font-bold text-red-800">Historical Analytics Failed to Load</h3>
                                    <p class="text-xs text-red-600 mt-1">${e.message}</p>
                                    <div class="mt-4 bg-slate-900 text-slate-300 p-3 rounded-lg text-[10px] font-mono overflow-auto max-h-48 leading-relaxed">
                                        ${e.stack}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            };

window.app.renderChartAnalyticsTrend = (labels, data1, data2, label1, label2) => {
                if (app.charts.analyticsTrend) app.charts.analyticsTrend.destroy();
                const ctx = document.getElementById('chartAnalyticsTrend').getContext('2d');
                
                // Gradients
                const grad1 = ctx.createLinearGradient(0, 0, 0, 400);
                grad1.addColorStop(0, 'rgba(148, 163, 184, 0.5)'); // Slate 400
                grad1.addColorStop(1, 'rgba(148, 163, 184, 0.0)');
                
                const grad2 = ctx.createLinearGradient(0, 0, 0, 400);
                grad2.addColorStop(0, 'rgba(14, 165, 233, 0.5)'); // Sky 500
                grad2.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

                app.charts.analyticsTrend = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: label1,
                                data: data1,
                                borderColor: '#94a3b8',
                                backgroundColor: grad1,
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointBackgroundColor: '#fff',
                                pointBorderColor: '#94a3b8',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6
                            },
                            {
                                label: label2,
                                data: data2,
                                borderColor: '#0ea5e9',
                                backgroundColor: grad2,
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointBackgroundColor: '#fff',
                                pointBorderColor: '#0ea5e9',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11, family: "'Inter', sans-serif", weight: 'bold' } } },
                            tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                titleColor: '#1e293b',
                                bodyColor: '#334155',
                                borderColor: '#e2e8f0',
                                borderWidth: 1,
                                padding: 12,
                                boxPadding: 6,
                                usePointStyle: true,
                                titleFont: { size: 13, family: "'Inter', sans-serif" },
                                bodyFont: { size: 12, family: "'Inter', sans-serif", weight: 'bold' }
                            }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#64748b' } },
                            y: { grid: { color: '#f1f5f9', borderDash: [4, 4] }, ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#64748b' }, beginAtZero: true }
                        }
                    }
                });
            };

window.app.renderChartAnalyticsBrand = (labels, data) => {
                if (app.charts.analyticsBrand) app.charts.analyticsBrand.destroy();
                const ctx = document.getElementById('chartAnalyticsBrand').getContext('2d');
                
                const bgColors = [
                    '#8b5cf6', // Violet
                    '#3b82f6', // Blue
                    '#10b981', // Emerald
                    '#f59e0b', // Amber
                    '#f43f5e', // Rose
                    '#64748b'  // Slate
                ];

                app.charts.analyticsBrand = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: bgColors,
                            borderWidth: 2,
                            borderColor: '#ffffff',
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11, family: "'Inter', sans-serif", weight: 'bold' } } },
                            tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                titleColor: '#1e293b',
                                bodyColor: '#334155',
                                borderColor: '#e2e8f0',
                                borderWidth: 1,
                                padding: 12,
                                boxPadding: 6,
                                usePointStyle: true,
                                titleFont: { size: 13, family: "'Inter', sans-serif" },
                                bodyFont: { size: 12, family: "'Inter', sans-serif", weight: 'bold' },
                                callbacks: {
                                    label: function(context) {
                                        let label = context.label || '';
                                        if (label) label += ': ';
                                        if (context.parsed !== null) {
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = Math.round((context.parsed / total) * 100);
                                            label += `${context.parsed} Units (${percentage}%)`;
                                        }
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                });
            };

window.app.renderChartAnalyticsRegion = (labels, data1, data2, label1, label2) => {
                if (app.charts.analyticsRegion) app.charts.analyticsRegion.destroy();
                const ctx = document.getElementById('chartAnalyticsRegion').getContext('2d');

                app.charts.analyticsRegion = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: label1,
                                data: data1,
                                backgroundColor: '#94a3b8',
                                borderRadius: 4,
                                borderSkipped: false,
                            },
                            {
                                label: label2,
                                data: data2,
                                backgroundColor: '#0ea5e9',
                                borderRadius: 4,
                                borderSkipped: false,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11, family: "'Inter', sans-serif", weight: 'bold' } } },
                            tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                titleColor: '#1e293b',
                                bodyColor: '#334155',
                                borderColor: '#e2e8f0',
                                borderWidth: 1,
                                padding: 12,
                                boxPadding: 6,
                                usePointStyle: true,
                                titleFont: { size: 13, family: "'Inter', sans-serif" },
                                bodyFont: { size: 12, family: "'Inter', sans-serif", weight: 'bold' }
                            }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#64748b' } },
                            y: { grid: { color: '#f1f5f9', borderDash: [4, 4] }, ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#64748b' }, beginAtZero: true }
                        }
                    }
                });
            };

window.app.renderAdminAIInsights = (keepDropdownOpen = false) => {
                localStorage.setItem('aci_last_page', 'ai');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                app.setupSidebar();
                const currentFY = app.selectedFY || app.currentFY;
                const currentMonth = app.currentMonth;
                const currentDay = 14; // Mocking mid-month
                const daysInMonth = 30;

                // State Initialization
                if (typeof app.aiMonths === 'undefined' || (!keepDropdownOpen && app.aiMonths.length === 0)) {
                    app.aiMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                }
                const activeMonthsInSelection = app.aiMonths;

                if (typeof app.aiActionsState === 'undefined') {
                    app.aiActionsState = JSON.parse(localStorage.getItem('aci_ai_actions_state')) || {};
                }
                if (typeof app.aiTerrPerformanceFilter === 'undefined' || !keepDropdownOpen) {
                    app.aiTerrPerformanceFilter = 'all';
                }

                // 1. National Aggregation
                let totalActual = 0;
                let totalTarget = 0;
                let totalProjection = 0;

                const brandStats = {
                    Foton: { actual: 0, target: 0, projection: 0, lyActual: 0 },
                    Mahindra: { actual: 0, target: 0, projection: 0, lyActual: 0 }
                };

                const currentSales = DB.sales.filter(s => s.fy === currentFY && activeMonthsInSelection.includes(s.sales_month));

                currentSales.forEach(s => {
                    totalActual += Number(s.unit_qty || 0);
                    if (brandStats[s.brand]) brandStats[s.brand].actual += Number(s.unit_qty || 0);
                });

                DB.targets.filter(t => t.fy === currentFY).forEach(t => {
                    let monthlyTarget = 0;
                    if (t.month) {
                        if (activeMonthsInSelection.includes(t.month)) {
                            monthlyTarget = Number(t.target_qty || 0);
                        }
                    } else {
                        // Annual target: distribute proportionally to number of selected months
                        monthlyTarget = Math.round((Number(t.target_qty || 0) / 12) * activeMonthsInSelection.length);
                    }
                    totalTarget += monthlyTarget;
                    if (brandStats[t.brand]) brandStats[t.brand].target += monthlyTarget;
                });

                DB.projections.filter(p => p.fy === currentFY && activeMonthsInSelection.includes(p.month)).forEach(p => {
                    totalProjection += Number(p.projection_qty || 0);
                    if (brandStats[p.brand]) brandStats[p.brand].projection += Number(p.projection_qty || 0);
                });

                // LY Stats for Growth Analysis
                DB.sales.filter(s => s.fy === '2024-25' && activeMonthsInSelection.includes(s.sales_month)).forEach(s => {
                    if (brandStats[s.brand]) brandStats[s.brand].lyActual += Number(s.unit_qty || 0);
                });

                // Calculate elapsed days for pacing calculations based on selected months
                const hasCurrentMonth = activeMonthsInSelection.includes(currentMonth);
                const elapsedDays = hasCurrentMonth 
                    ? ((activeMonthsInSelection.length - 1) * 30 + currentDay) 
                    : (activeMonthsInSelection.length * 30);
                const totalDays = activeMonthsInSelection.length * 30;

                // AI Predictions
                const dailyRate = totalActual / Math.max(elapsedDays, 1);
                const predictedClose = Math.round(dailyRate * totalDays);
                const predictionConfidence = 85;
                const isPacingWell = predictedClose >= totalTarget;
                
                // Advanced pacing parameters
                const remainingDays = Math.max(1, totalDays - elapsedDays);
                const pacingGap = totalTarget - totalActual;
                const dailyGapNeeded = pacingGap > 0 ? Math.ceil(pacingGap / remainingDays) : 0;
                const currentDailyAvg = (totalActual / Math.max(1, elapsedDays)).toFixed(1);
                const requiredDailyAvg = pacingGap > 0 ? (pacingGap / remainingDays).toFixed(1) : '0.0';

                // Territory Heat Analysis
                const terrPerformance = DB.territories.map(t => {
                    const tActual = currentSales.filter(s => s.territory_id === t.id).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                    const tTarget = DB.targets.filter(tg => tg.territory_id === t.id && tg.fy === currentFY).reduce((sum, tg) => {
                        let mTarget = 0;
                        if (tg.month) {
                            if (activeMonthsInSelection.includes(tg.month)) {
                                mTarget = Number(tg.target_qty || 0);
                            }
                        } else {
                            mTarget = Math.round((Number(tg.target_qty || 0) / 12) * activeMonthsInSelection.length);
                        }
                        return sum + mTarget;
                    }, 0);
                    const ach = tTarget > 0 ? Math.round((tActual / tTarget) * 100) : 0;
                    return { ...t, actual: tActual, target: tTarget, ach };
                }).sort((a, b) => b.ach - a.ach);

                const topTerritories = terrPerformance.slice(0, 3);
                const atRiskTerritories = terrPerformance.filter(t => t.ach < 40).sort((a, b) => a.ach - b.ach).slice(0, 3);

                // --- NEW ADVANCED ANALYTICS ---
                const ytdSales = DB.sales.filter(s => s.fy === currentFY && activeMonthsInSelection.includes(s.sales_month));

                // 1. Model-Upazila Affinity (Champion Models)
                const modelUpazilaMap = {};
                ytdSales.forEach(s => {
                    const key = `${s.model}|${s.upazila}`;
                    modelUpazilaMap[key] = (modelUpazilaMap[key] || 0) + Number(s.unit_qty || 0);
                });

                const upazilaAffinities = [];
                const upazilasSeen = new Set();
                Object.entries(modelUpazilaMap)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([key, qty]) => {
                        const [model, upazila] = key.split('|');
                        if (!upazilasSeen.has(upazila) && upazilaAffinities.length < 6) {
                            upazilaAffinities.push({ model, upazila, qty });
                            upazilasSeen.add(upazila);
                        }
                    });

                // 2. Underperforming Models (Bottom 3 by Volume)
                const modelTotalSales = {};
                DB.models.forEach(m => modelTotalSales[m.name] = 0);
                ytdSales.forEach(s => { modelTotalSales[s.model] += Number(s.unit_qty || 0); });

                const modelInsights = DB.models.map(m => ({
                    ...m,
                    sales: modelTotalSales[m.name],
                    performance: modelTotalSales[m.name] > 20 ? 'High' : (modelTotalSales[m.name] > 10 ? 'Medium' : 'Low')
                })).sort((a, b) => a.sales - b.sales);

                const underperformers = modelInsights.filter(m => m.performance === 'Low').slice(0, 3);

                // 3. Brand Dominance Battleground
                const brandDominance = DB.territories.map(t => {
                    const tSales = ytdSales.filter(s => s.territory_id === t.id);
                    const f = tSales.filter(s => s.brand === 'Foton').reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                    const m = tSales.filter(s => s.brand === 'Mahindra').reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                    const leader = f > m ? 'Foton' : (m > f ? 'Mahindra' : 'Contested');
                    const leaderColor = leader === 'Foton' ? 'indigo' : (leader === 'Mahindra' ? 'rose' : 'slate');
                    return { name: t.name, f, m, leader, leaderColor, total: f + m };
                }).filter(t => t.total > 0).sort((a, b) => b.total - a.total).slice(0, 4);

                // Prepare Dynamic Interventions based on calculated data
                const highestTerr = terrPerformance.length > 0 ? terrPerformance[0] : null;
                const lowestTerr = terrPerformance.length > 0 ? terrPerformance[terrPerformance.length - 1] : null;

                const html = `
                    <div class="w-full fade-in pb-12">
                        <!-- AI Header Section -->
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-2 md:px-0">
                            <div class="w-full md:w-auto">
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight flex items-center gap-3">
                                    <div class="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-md shadow-purple-200">
                                        <i data-lucide="brain-circuit" class="w-6 h-6 text-white animate-pulse"></i>
                                    </div>
                                    <span>AI Strategic <span class="text-purple-600 font-black">Insights</span></span>
                                </h1>
                                <p class="text-slate-400 font-semibold text-[10px] mt-1 flex items-center gap-1.5">
                                    <span class="flex h-2.5 w-2.5 relative">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                    <span>DYNAMIC DIAGNOSTICS ACTIVE</span>
                                </p>
                            </div>
                            <div class="flex items-center gap-3 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-100 w-full md:w-auto">
                                <div class="px-3 py-1 flex-1 md:flex-none text-center">
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Confidence Level</p>
                                    <p class="text-xs font-black text-purple-600 flex items-center justify-center gap-1">
                                        ${predictionConfidence}%
                                        <span class="group relative inline-block cursor-pointer">
                                            <i data-lucide="info" class="w-3 h-3 text-slate-400 hover:text-slate-600"></i>
                                            <span class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] p-2 rounded-lg w-40 shadow-xl pointer-events-none z-[110] leading-normal font-medium text-center">
                                                Statistical confidence interval based on current run-rate variance vs targets.
                                            </span>
                                        </span>
                                    </p>
                                </div>
                                <div class="w-px h-6 bg-slate-200"></div>
                                
                                <!-- Month Multi-Select for AI Insights -->
                                <div class="flex items-center gap-2 relative">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Month</label>
                                    <button onclick="document.getElementById('ai-month-dropdown').classList.toggle('hidden')" class="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500 transition-colors flex items-center justify-between min-w-[120px]">
                                        <span>${activeMonthsInSelection.length === 12 ? 'All FY (YTD)' : activeMonthsInSelection.length + ' Selected'}</span>
                                        <i data-lucide="chevron-down" class="w-3.5 h-3.5 ml-1 text-slate-400"></i>
                                    </button>
                                    <div id="ai-month-dropdown" onmouseleave="this.classList.add('hidden')" class="${keepDropdownOpen === true ? '' : 'hidden'} absolute top-full mt-1.5 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto">
                                        <div class="p-2 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                            <label class="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded-lg cursor-pointer text-[10px] font-black text-slate-700 transition-colors">
                                                <input type="checkbox" onchange="app.aiMonths = this.checked ? ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'] : [app.currentMonth]; app.renderAdminAIInsights(true)" ${activeMonthsInSelection.length === 12 ? 'checked' : ''} class="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5">
                                                Select All FY (YTD)
                                            </label>
                                        </div>
                                        <div class="p-2 space-y-0.5">
                                            ${['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => `
                                                <label class="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded-lg cursor-pointer text-[10px] font-semibold text-slate-600 transition-colors">
                                                    <input type="checkbox" onchange="app.toggleAIMonth('${m}')" ${activeMonthsInSelection.includes(m) ? 'checked' : ''} class="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5">
                                                    ${m}
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Top Level AI Summary Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <!-- Prediction Card -->
                            <div class="glass p-5 rounded-[1.75rem] border border-white shadow-lg relative overflow-hidden group">
                                <div class="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-500"></div>
                                <h3 class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <i data-lucide="trending-up" class="w-3.5 h-3.5 text-purple-500"></i>
                                    AI Forecast Closing
                                    <span class="group relative inline-block cursor-pointer">
                                        <i data-lucide="info" class="w-3 h-3 text-slate-300 hover:text-slate-500"></i>
                                        <span class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-955 text-white text-[9px] p-2 rounded-lg w-48 shadow-xl pointer-events-none z-[110] leading-normal font-medium text-center normal-case">
                                            Calculated by extrapolating YTD average daily run-rate over the total selected months (30 days/month).
                                        </span>
                                    </span>
                                </h3>
                                
                                <div class="flex items-baseline gap-1 mb-3">
                                    <span class="text-3xl font-extrabold text-slate-900 tracking-tight">${predictedClose}</span>
                                    <span class="text-xs font-bold text-slate-400 uppercase">Units</span>
                                </div>

                                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200 mb-2 relative">
                                    <div class="bg-purple-600 h-full rounded-full transition-all duration-1000 shadow-sm" style="width: ${Math.min(100, Math.round((totalActual / (totalTarget || 1)) * 100))}%"></div>
                                    <div class="absolute top-0 bottom-0 w-0.5 bg-slate-400" style="left: ${Math.min(99, Math.round((totalActual / (totalTarget || 1)) * 100))}%"></div>
                                </div>

                                <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-4">
                                    <span>YTD Actual: ${totalActual}</span>
                                    <span>Target: ${totalTarget}</span>
                                </div>

                                <div class="border-t border-slate-100/60 pt-3 flex items-center justify-between">
                                    <div class="flex flex-col">
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-wide">Pace Status</span>
                                        <span class="text-xs font-extrabold ${isPacingWell ? 'text-green-600' : 'text-amber-600'}">
                                            ${isPacingWell ? 'Ahead of Schedule' : 'Behind Target'}
                                        </span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-wide">Pacing Rate</span>
                                        <span class="text-xs font-black text-slate-700 block">${currentDailyAvg} vs req. ${requiredDailyAvg} / day</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Brand Momentum Card -->
                            <div class="glass p-5 rounded-[1.75rem] border border-white shadow-lg relative overflow-hidden group">
                                <div class="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-500"></div>
                                <h3 class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                    <i data-lucide="zap" class="w-3.5 h-3.5 text-blue-500"></i>
                                    Strategic Brand Momentum
                                    <span class="group relative inline-block cursor-pointer">
                                        <i data-lucide="info" class="w-3 h-3 text-slate-300 hover:text-slate-500"></i>
                                        <span class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-955 text-white text-[9px] p-2 rounded-lg w-48 shadow-xl pointer-events-none z-[110] leading-normal font-medium text-center normal-case">
                                            Measures YTD sales achievement percentage against proportional budget target per brand.
                                        </span>
                                    </span>
                                </h3>
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between text-[9px] font-black mb-1 uppercase tracking-tighter">
                                            <span class="text-indigo-600">Foton Velocity</span>
                                            <span class="text-slate-500">${Math.round((brandStats.Foton.actual / (brandStats.Foton.target || 1)) * 100)}% of Goal</span>
                                        </div>
                                        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                            <div class="bg-indigo-600 h-full rounded-full transition-all duration-1000 shadow-sm" style="width: ${Math.round((brandStats.Foton.actual / (brandStats.Foton.target || 1)) * 100)}%"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="flex justify-between text-[9px] font-black mb-1 uppercase tracking-tighter">
                                            <span class="text-rose-600">Mahindra Velocity</span>
                                            <span class="text-slate-500">${Math.round((brandStats.Mahindra.actual / (brandStats.Mahindra.target || 1)) * 100)}% of Goal</span>
                                        </div>
                                        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                            <div class="bg-rose-600 h-full rounded-full transition-all duration-1000 shadow-sm" style="width: ${Math.round((brandStats.Mahindra.actual / (brandStats.Mahindra.target || 1)) * 100)}%"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Quick Insight Card -->
                            <div class="bg-slate-900 p-5 rounded-[1.75rem] border border-slate-800 shadow-lg relative overflow-hidden group text-white">
                                <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <i data-lucide="cpu" class="w-24 h-24 text-purple-400"></i>
                                </div>
                                <h3 class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
                                    Deep Data Synthesis
                                    <span class="group relative inline-block cursor-pointer">
                                        <i data-lucide="info" class="w-3 h-3 text-slate-500 hover:text-slate-400"></i>
                                        <span class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-955 text-white text-[9px] p-2 rounded-lg w-48 shadow-xl pointer-events-none z-[110] leading-normal font-medium text-center normal-case">
                                            Compares current financial year performance with Same Period Last Year (SPLY) and tracks volume gap.
                                        </span>
                                    </span>
                                </h3>
                                <p class="text-xs font-semibold leading-relaxed text-slate-300 mb-3.5">
                                    National growth is <strong class="text-white font-extrabold">${Math.round(((totalActual - (brandStats.Foton.lyActual + brandStats.Mahindra.lyActual)) / (brandStats.Foton.lyActual + brandStats.Mahindra.lyActual || 1)) * 100)}%</strong> vs SPLY. ${predictedClose > totalTarget ? 'Target surplus projected. Maintaining positive momentum.' : 'Daily volume gap identified: +' + dailyGapNeeded + ' units/day needed to recover.'}
                                </p>
                                <div class="flex items-center gap-3 pt-2 border-t border-slate-800">
                                    <div class="flex -space-x-1.5">
                                        <div class="w-5.5 h-5.5 rounded-full bg-purple-500 border border-slate-900 flex items-center justify-center text-[7px] font-bold">AI</div>
                                        <div class="w-5.5 h-5.5 rounded-full bg-indigo-500 border border-slate-900 flex items-center justify-center text-[7px] font-bold">BI</div>
                                    </div>
                                    <span class="text-[8px] font-black uppercase tracking-widest text-slate-500">Real-Time Forecast Optimization</span>
                                </div>
                            </div>
                        </div>

                        <!-- NEW: AI INTERVENTION CONSOLE (Action Hub) -->
                        <div class="mb-8 bg-white p-6 rounded-[1.75rem] border border-slate-100 shadow-md">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <h2 class="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                    <i data-lucide="shield-alert" class="w-4 h-4 text-purple-600"></i>
                                    AI Intervention Console
                                </h2>
                                <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-purple-200">Decision Center</span>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <!-- Action Card 1: Budget Reallocation -->
                                ${lowestTerr && highestTerr ? (() => {
                                    const actionKey = `budget_shift_${lowestTerr.id}`;
                                    const isExecuted = app.aiActionsState[actionKey] === 'Executed';
                                    return `
                                    <div class="flex flex-col justify-between p-4 rounded-2xl border ${isExecuted ? 'border-green-100 bg-green-50/20' : 'border-purple-100 bg-purple-50/10'} hover:shadow-md transition-all duration-300 relative">
                                        <div>
                                            <div class="flex justify-between items-start mb-2">
                                                <span class="px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase ${isExecuted ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}">
                                                    ${isExecuted ? 'Executed' : 'High Priority'}
                                                </span>
                                                <span class="text-[8px] font-bold text-slate-400">Budget Shift</span>
                                            </div>
                                            <h4 class="font-bold text-slate-800 text-xs mb-1.5 flex items-center gap-1">
                                                Shift Promo Budget to ${lowestTerr.name}
                                            </h4>
                                            <p class="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                                                Shift 15% promotional budget from high-surplus <strong class="text-slate-800 font-bold">${highestTerr.name}</strong> to support conversion rates in struggling <strong class="text-slate-800 font-bold">${lowestTerr.name}</strong> (${lowestTerr.ach}% ach).
                                            </p>
                                        </div>
                                        <div>
                                            ${isExecuted ? `
                                                <button disabled class="w-full flex items-center justify-center gap-1 bg-green-100 text-green-700 border border-green-200 py-2 rounded-xl text-xs font-bold transition-all"><i data-lucide="check" class="w-3.5 h-3.5"></i> Reallocated</button>
                                            ` : `
                                                <button onclick="app.executeBudgetShiftModal('${highestTerr.name}', '${lowestTerr.name}', 15, '${actionKey}')" class="w-full flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-black shadow-md shadow-purple-100 transition-all active:scale-98"><i data-lucide="zap" class="w-3.5 h-3.5 animate-pulse"></i> Optimize Budget</button>
                                            `}
                                        </div>
                                    </div>
                                    `;
                                })() : ''}

                                <!-- Action Card 2: Send notice -->
                                ${lowestTerr ? (() => {
                                    const actionKey = `notice_${lowestTerr.id}`;
                                    const isExecuted = app.aiActionsState[actionKey] === 'Executed';
                                    return `
                                    <div class="flex flex-col justify-between p-4 rounded-2xl border ${isExecuted ? 'border-green-100 bg-green-50/20' : 'border-indigo-100 bg-indigo-50/10'} hover:shadow-md transition-all duration-300">
                                        <div>
                                            <div class="flex justify-between items-start mb-2">
                                                <span class="px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase ${isExecuted ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}">
                                                    ${isExecuted ? 'Circulated' : 'Action Required'}
                                                </span>
                                                <span class="text-[8px] font-bold text-slate-400">Direct Message</span>
                                            </div>
                                            <h4 class="font-bold text-slate-800 text-xs mb-1.5 flex items-center gap-1">
                                                Issue Target Directive in ${lowestTerr.name}
                                            </h4>
                                            <p class="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                                                Current achievement of <strong class="text-slate-800 font-bold">${lowestTerr.ach}%</strong> is below pacing baseline. Dispatch an AI-generated notice to push local MOs to prioritize key conversions.
                                            </p>
                                        </div>
                                        <div>
                                            ${isExecuted ? `
                                                <button disabled class="w-full flex items-center justify-center gap-1 bg-green-100 text-green-700 border border-green-200 py-2 rounded-xl text-xs font-bold transition-all"><i data-lucide="check" class="w-3.5 h-3.5"></i> Notice Circulated</button>
                                            ` : `
                                                <button onclick="app.dispatchAINoticeModal('${lowestTerr.name}', ${lowestTerr.ach}, '${actionKey}')" class="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-black shadow-md shadow-indigo-100 transition-all active:scale-98"><i data-lucide="megaphone" class="w-3.5 h-3.5"></i> Dispatch Directive</button>
                                            `}
                                        </div>
                                    </div>
                                    `;
                                })() : ''}

                                <!-- Action Card 3: Stock Pre-positioning -->
                                ${upazilaAffinities.length > 0 ? (() => {
                                    const aff = upazilaAffinities[0];
                                    const actionKey = `stock_${aff.upazila}`;
                                    const isExecuted = app.aiActionsState[actionKey] === 'Executed';
                                    return `
                                    <div class="flex flex-col justify-between p-4 rounded-2xl border ${isExecuted ? 'border-green-100 bg-green-50/20' : 'border-amber-100 bg-amber-50/10'} hover:shadow-md transition-all duration-300">
                                        <div>
                                            <div class="flex justify-between items-start mb-2">
                                                <span class="px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase ${isExecuted ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}">
                                                    ${isExecuted ? 'Dispatched' : 'Supply Risk'}
                                                </span>
                                                <span class="text-[8px] font-bold text-slate-400">Inventory Alert</span>
                                            </div>
                                            <h4 class="font-bold text-slate-800 text-xs mb-1.5 flex items-center gap-1">
                                                Pre-position ${aff.model} to ${aff.upazila}
                                            </h4>
                                            <p class="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                                                High demand affinity detected in <strong class="text-slate-800 font-bold">${aff.upazila}</strong> (${aff.qty} units). Pre-position 10 buffer stock units to secure market availability.
                                            </p>
                                        </div>
                                        <div>
                                            ${isExecuted ? `
                                                <button disabled class="w-full flex items-center justify-center gap-1 bg-green-100 text-green-700 border border-green-200 py-2 rounded-xl text-xs font-bold transition-all"><i data-lucide="check" class="w-3.5 h-3.5"></i> Stock Pre-positioned</button>
                                            ` : `
                                                <button onclick="app.transferInventoryModal('${aff.model}', '${aff.upazila}', 10, '${actionKey}')" class="w-full flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-xs font-black shadow-md shadow-amber-100 transition-all active:scale-98"><i data-lucide="package" class="w-3.5 h-3.5"></i> Pre-position Inventory</button>
                                            `}
                                        </div>
                                    </div>
                                    `;
                                })() : ''}
                            </div>
                        </div>

                        <!-- NEW: Advanced Model & Market Affinity Section -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <!-- Column 1: Product-Market Fit (Upazila Wise) -->
                            <div class="glass p-5 rounded-[1.75rem] border border-white shadow-md flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                                            <i data-lucide="map-pin" class="w-4 h-4 text-indigo-500"></i>
                                            Upazila Champion Models
                                        </h3>
                                        <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 tracking-wider">FIT INDEX</span>
                                    </div>
                                    <div class="space-y-2.5">
                                        ${upazilaAffinities.map(a => `
                                            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-white transition-all shadow-sm">
                                                <div>
                                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${a.upazila}</p>
                                                    <p class="font-extrabold text-slate-700 text-xs">${a.model}</p>
                                                </div>
                                                <div class="text-right">
                                                    <span class="px-2 py-0.5 bg-white rounded-lg border border-slate-200 text-[10px] font-black text-indigo-600 shadow-sm">${a.qty} Units</span>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                <p class="text-[8px] text-slate-400 font-bold mt-4 uppercase tracking-widest text-center italic">High-affinity model-regional correlation</p>
                            </div>

                            <!-- Column 2: Brand Dominance Battleground -->
                            <div class="glass p-5 rounded-[1.75rem] border border-white shadow-md flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                                            <i data-lucide="swords" class="w-4 h-4 text-rose-500"></i>
                                            Regional Brand Dominance
                                        </h3>
                                        <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 tracking-wider">MARKET SHARE</span>
                                    </div>
                                    <div class="space-y-4">
                                        ${brandDominance.map(t => `
                                            <div>
                                                <div class="flex justify-between items-end mb-1">
                                                    <span class="text-[10px] font-bold text-slate-600">${t.name}</span>
                                                    <span class="text-[8px] font-black text-${t.leaderColor}-600 uppercase tracking-wider">Leading: ${t.leader}</span>
                                                </div>
                                                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
                                                    <div class="bg-indigo-500 h-full transition-all duration-700" style="width: ${(t.f / t.total) * 100}%"></div>
                                                    <div class="bg-rose-500 h-full transition-all duration-700" style="width: ${(t.m / t.total) * 100}%"></div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="mt-4 flex items-center justify-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                    <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span><span>Foton</span></div>
                                    <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span><span>Mahindra</span></div>
                                </div>
                            </div>

                            <!-- Column 3: Risk & Underperforming Assets -->
                            <div class="glass p-5 rounded-[1.75rem] border border-white shadow-md flex flex-col justify-between bg-slate-50/30">
                                <div>
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-sm font-bold text-rose-700 tracking-tight flex items-center gap-1.5">
                                            <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-500"></i>
                                            Model Performance Risks
                                        </h3>
                                        <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 tracking-wider">WARN</span>
                                    </div>
                                    <div class="space-y-2.5">
                                        ${underperformers.map(m => `
                                            <div class="p-3 rounded-xl bg-white border border-rose-100 shadow-sm relative overflow-hidden group">
                                                <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${m.brand}</p>
                                                <div class="flex justify-between items-center relative z-10">
                                                    <span class="font-extrabold text-slate-700 text-xs">${m.name}</span>
                                                    <div class="text-right">
                                                        <span class="text-rose-600 font-extrabold text-xs">${m.sales} Sales</span>
                                                        <p class="text-[7px] font-bold text-rose-400 uppercase tracking-tighter">Underperforming</p>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                        ${underperformers.length === 0 ? '<p class="text-center text-slate-400 font-bold py-6 text-xs">All models performing within threshold.</p>' : ''}
                                    </div>
                                </div>
                                <div class="mt-4 p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 font-semibold italic leading-normal">
                                    "Low velocity in models suggests stock saturation or price friction. Re-assess dealer discounts."
                                </div>
                            </div>
                        </div>

                        <!-- NEW: Quantum Market Intelligence & Predictive Forecasting -->
                        <div class="mb-8">
                            <div class="flex items-center gap-2 mb-4">
                                <h2 class="text-base font-bold text-slate-800 tracking-tight">Quantum Market Intelligence</h2>
                                <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-purple-200">Experimental Model</span>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <!-- Predictive Seasonal Shift -->
                                <div class="bg-gradient-to-br from-indigo-950 to-slate-900 p-5 rounded-[1.75rem] text-white shadow-md relative overflow-hidden group">
                                    <div class="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                                    <h4 class="text-[9px] font-black text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <i data-lucide="calendar-days" class="w-3.5 h-3.5"></i>
                                        Next Period Forecast (May)
                                    </h4>
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center text-xs">
                                            <span class="font-medium text-slate-300">Projected Demand</span>
                                            <span class="font-black text-indigo-400">+12.4%</span>
                                        </div>
                                        <div class="p-2 bg-white/5 rounded-lg border border-white/10">
                                            <p class="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Trending Model</p>
                                            <p class="text-xs font-black text-white">Mahindra Bolero Pick-up</p>
                                        </div>
                                    </div>
                                    <div class="mt-4 pt-3 border-t border-white/10 text-[9px] text-slate-400 leading-relaxed italic">
                                        "Seasonal uptick in rural agricultural harvest transportation expected."
                                    </div>
                                </div>

                                <!-- Territory Growth Clustering -->
                                <div class="glass p-5 rounded-[1.75rem] border border-white shadow-md relative overflow-hidden flex flex-col justify-between">
                                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <i data-lucide="layers" class="w-3.5 h-3.5 text-emerald-500"></i>
                                        Growth Clusters
                                    </h4>
                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px]">
                                            <span class="font-bold text-emerald-700 uppercase">Hyper-Growth</span>
                                            <span class="font-extrabold text-emerald-800">2 Regions</span>
                                        </div>
                                        <div class="flex items-center justify-between p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[10px]">
                                            <span class="font-bold text-blue-700 uppercase">Steady State</span>
                                            <span class="font-extrabold text-blue-800">5 Regions</span>
                                        </div>
                                        <div class="flex items-center justify-between p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-[10px]">
                                            <span class="font-bold text-rose-700 uppercase">Reactivation</span>
                                            <span class="font-extrabold text-rose-800">1 Region</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- AI Sales Probability Index -->
                                <div class="glass p-5 rounded-[1.75rem] border border-white shadow-md relative overflow-hidden flex flex-col justify-between">
                                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <i data-lucide="target" class="w-3.5 h-3.5 text-purple-500"></i>
                                        FY Target Probability
                                    </h4>
                                    <div class="flex flex-col items-center justify-center py-1">
                                        <div class="relative w-16 h-16 flex items-center justify-center">
                                            <svg class="w-full h-full transform -rotate-90">
                                                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" stroke-width="6"/>
                                                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#8b5cf6" stroke-width="6" stroke-dasharray="176" stroke-dashoffset="${176 * (1 - 0.92)}"/>
                                            </svg>
                                            <span class="absolute text-sm font-extrabold text-slate-800">92%</span>
                                        </div>
                                        <p class="text-[9px] font-extrabold text-purple-600 uppercase mt-2 tracking-tighter">Very High Confidence</p>
                                    </div>
                                </div>

                                <!-- Inventory Run-Rate Predictor -->
                                <div class="glass p-5 rounded-[1.75rem] border border-white shadow-md relative overflow-hidden flex flex-col justify-between">
                                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <i data-lucide="box" class="w-3.5 h-3.5 text-amber-500"></i>
                                        Stock Depletion Alert
                                    </h4>
                                    <div class="space-y-2.5">
                                        <div class="flex justify-between text-[11px] font-bold">
                                            <span class="text-slate-500">Buffer Depot Exhaustion:</span>
                                            <span class="text-rose-600 font-extrabold">18 Days</span>
                                        </div>
                                        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div class="bg-rose-500 h-full rounded-full" style="width: 75%"></div>
                                        </div>
                                        <p class="text-[8px] text-slate-400 font-bold uppercase tracking-wider text-center">Based on 14-day trailing run-rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Main AI Content Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <!-- Left: Recommendations & Heatmap Matrix -->
                            <div class="lg:col-span-2 space-y-6">
                                <!-- Dynamic Market Heatmap Visualization -->
                                <div class="glass p-6 rounded-[1.75rem] border border-white shadow-md">
                                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                                        <h2 class="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                                            <i data-lucide="layout-grid" class="w-4 h-4 text-indigo-500"></i>
                                            Territory Performance Matrix
                                        </h2>
                                        
                                        <!-- Matrix Filter Tabs -->
                                        <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[10px] font-bold">
                                            <button onclick="app.aiTerrPerformanceFilter='all'; app.renderAdminAIInsights(true)" class="px-2.5 py-1 rounded-lg transition-all ${app.aiTerrPerformanceFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">All</button>
                                            <button onclick="app.aiTerrPerformanceFilter='risk'; app.renderAdminAIInsights(true)" class="px-2.5 py-1 rounded-lg transition-all ${app.aiTerrPerformanceFilter === 'risk' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">At Risk (<60%)</button>
                                            <button onclick="app.aiTerrPerformanceFilter='strong'; app.renderAdminAIInsights(true)" class="px-2.5 py-1 rounded-lg transition-all ${app.aiTerrPerformanceFilter === 'strong' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">Strong (>=80%)</button>
                                        </div>
                                    </div>

                                    ${(() => {
                                        let filteredTerrPerformance = [...terrPerformance];
                                        if (app.aiTerrPerformanceFilter === 'risk') {
                                            filteredTerrPerformance = filteredTerrPerformance.filter(t => t.ach < 60);
                                        } else if (app.aiTerrPerformanceFilter === 'strong') {
                                            filteredTerrPerformance = filteredTerrPerformance.filter(t => t.ach >= 80);
                                        }

                                        if (filteredTerrPerformance.length === 0) {
                                            return `<div class="text-center text-slate-400 py-10 font-bold text-xs">No territories match the selected filter.</div>`;
                                        }

                                        return `
                                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            ${filteredTerrPerformance.map(t => `
                                                <div class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                                                    <div>
                                                        <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">${t.name}</p>
                                                        <div class="flex justify-between items-end">
                                                            <span class="text-base font-extrabold text-slate-700">${t.ach}%</span>
                                                            <div class="w-6.5 h-6.5 rounded-full flex items-center justify-center ${t.ach > 70 ? 'bg-green-100 text-green-600' : (t.ach > 40 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600')}">
                                                                <i data-lucide="${t.ach > 70 ? 'smile' : (t.ach > 40 ? 'smile' : 'frown')}" class="w-3.5 h-3.5"></i>
                                                            </div>
                                                        </div>
                                                        <p class="text-[8px] text-slate-400 mt-1">Act: ${t.actual} / Tgt: ${t.target}</p>
                                                    </div>
                                                    <div class="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                                                        <div class="${t.ach > 70 ? 'bg-green-500' : (t.ach > 40 ? 'bg-amber-500' : 'bg-red-500')} h-full rounded-full" style="width: ${Math.min(t.ach, 100)}%"></div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                        `;
                                    })()}
                                </div>
                            </div>

                            <!-- Right: Leaders & Risk Zones -->
                            <div class="space-y-6">
                                <!-- Top Performers -->
                                <div class="bg-white p-5 rounded-[1.75rem] border border-slate-100 shadow-md">
                                    <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-4">
                                        <i data-lucide="trophy" class="w-4 h-4 text-amber-500"></i>
                                        Top Performers
                                    </h3>
                                    <div class="space-y-3">
                                        ${topTerritories.map((t, idx) => `
                                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div class="flex items-center gap-2">
                                                    <div class="w-6.5 h-6.5 rounded-lg bg-amber-500 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">${idx + 1}</div>
                                                    <div>
                                                        <p class="font-extrabold text-slate-700 text-xs">${t.name}</p>
                                                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">${t.actual} Units Sold</p>
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <p class="text-xs font-extrabold text-green-600">${t.ach}%</p>
                                                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Achieved</p>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Risk Monitor -->
                                <div class="bg-rose-50/50 p-5 rounded-[1.75rem] border border-rose-100 shadow-md flex flex-col justify-between">
                                    <div>
                                        <h3 class="text-sm font-bold text-rose-800 flex items-center gap-1.5 mb-4">
                                            <i data-lucide="activity" class="w-4 h-4 text-rose-600"></i>
                                            Risk Monitor
                                        </h3>
                                        <div class="space-y-3">
                                            ${atRiskTerritories.length > 0 ? atRiskTerritories.map(t => `
                                                <div class="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-rose-100">
                                                    <div>
                                                        <p class="font-extrabold text-rose-900 text-xs">${t.name}</p>
                                                        <p class="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Gap: ${t.target - t.actual} Units</p>
                                                    </div>
                                                    <div class="text-right">
                                                        <p class="text-xs font-extrabold text-rose-600">${t.ach}%</p>
                                                        <p class="text-[8px] font-bold text-rose-400 uppercase tracking-wider">Critical</p>
                                                    </div>
                                                </div>
                                            `).join('') : '<p class="text-center text-[10px] font-bold text-slate-400 py-3">No territories under 40% achievement.</p>'}
                                        </div>
                                    </div>
                                    <button onclick="app.renderAdminDashboard()" class="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl shadow-md shadow-rose-200 transition-all active:scale-95 text-[10px] uppercase tracking-wider">
                                        Review All Regions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.renderAdminSalesMap = (keepDropdownOpen = false) => {
                localStorage.setItem('aci_last_page', 'map');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                app.setupSidebar();

                if (typeof app.mapMonths === 'undefined') app.mapMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const brandTab = app.mapBrandTab || 'All';
                const modelTab = app.mapModelTab || 'All';
                const districtTab = app.mapDistrictTab || 'All';
                const viewMode = app.mapViewMode || 'district';
                if (typeof app.mapSaleType === 'undefined') app.mapSaleType = 'All';
                const saleTypeTab = app.mapSaleType;
                const currentFY = app.selectedFY || app.currentFY || '2025-26';

                // Filter Data (Actual Sales Only)
                let filteredSales = DB.sales.filter(s => s.fy === currentFY && app.mapMonths.includes(s.sales_month));
                if (brandTab !== 'All') filteredSales = filteredSales.filter(s => s.brand === brandTab);
                if (modelTab !== 'All') filteredSales = filteredSales.filter(s => s.model === modelTab);
                if (districtTab !== 'All') filteredSales = filteredSales.filter(s => s.district === districtTab);
                if (saleTypeTab !== 'All') filteredSales = filteredSales.filter(s => s.sale_type === saleTypeTab);

                // Aggregate Data based on View Mode
                const dataAgg = {};
                filteredSales.forEach(s => {
                    const key = viewMode === 'district' ? s.district : s.upazila;
                    if (key) dataAgg[key] = (dataAgg[key] || 0) + Number(s.unit_qty || 0);
                });

                const maxSales = Math.max(...Object.values(dataAgg), 1);
                const totalPlotted = Object.values(dataAgg).reduce((a, b) => a + b, 0);

                const normalizedAgg = {};
                Object.entries(dataAgg).forEach(([k, v]) => {
                    normalizedAgg[app.getNormalizedKey(k)] = v;
                });

                const activeModels = brandTab === 'All' ? DB.models : DB.models.filter(m => m.brand === brandTab);
                
                const allDistricts = [...new Set(DB.sales.map(s => s.district).filter(Boolean))].sort();
                const allUpazilas = [...new Set(DB.sales.filter(s => s.fy === currentFY && (districtTab === 'All' || s.district === districtTab)).map(s => s.upazila).filter(Boolean))].sort();

                const rankedAreas = Object.entries(dataAgg).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
                const allMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];

                const mapCoords = {
                    // 64 Districts of Bangladesh
                    'Dhaka': [23.8103, 90.4125], 'Faridpur': [23.6071, 89.8429], 'Gazipur': [24.0023, 90.4264], 'Gopalganj': [23.0051, 89.8266],
                    'Jamalpur': [24.9375, 89.9378], 'Kishoreganj': [24.4449, 90.7765], 'Madaripur': [23.1641, 90.1897], 'Manikganj': [23.8644, 90.0047],
                    'Munshiganj': [23.5422, 90.5305], 'Mymensingh': [24.7471, 90.4203], 'Narayanganj': [23.6238, 90.5000], 'Narsingdi': [23.9193, 90.7206],
                    'Netrokona': [24.8803, 90.7279], 'Rajbari': [23.7574, 89.6444], 'Shariatpur': [23.2423, 90.4348], 'Sherpur': [25.0205, 90.0153],
                    'Tangail': [24.2513, 89.9167], 'Bogra': [24.8465, 89.3778], 'Joypurhat': [25.1018, 89.0270],
                    'Naogaon': [24.8103, 88.9414], 'Natore': [24.4102, 88.9834], 'Chapai Nawabganj': [24.5965, 88.2775], 'Pabna': [24.0064, 89.2493],
                    'Rajshahi': [24.3636, 88.6241], 'Sirajganj': [24.4534, 89.7008], 'Dinajpur': [25.6217, 88.6355], 'Gaibandha': [25.3288, 89.5404],
                    'Kurigram': [25.8054, 89.6361], 'Lalmonirhat': [25.9166, 89.4532], 'Nilphamari': [25.9318, 88.8560], 'Panchagarh': [26.3411, 88.5541],
                    'Rangpur': [25.7439, 89.2752], 'Thakurgaon': [26.0332, 88.4616], 'Barguna': [22.1570, 90.1259], 'Barisal': [22.7010, 90.3535],
                    'Bhola': [22.6859, 90.6482], 'Jhalokati': [22.6406, 90.1987], 'Patuakhali': [22.3596, 90.3299],
                    'Pirojpur': [22.5841, 89.9720], 'Bandarban': [21.8311, 92.3686], 'Brahmanbaria': [23.9571, 91.1119], 'Chandpur': [23.2333, 90.6667],
                    'Chattogram': [22.3569, 91.7832], 'Comilla': [23.4607, 91.1809],
                    'Coxs Bazar': [21.4333, 91.9833], 'Feni': [23.0159, 91.3976], 'Khagrachhari': [23.1193, 91.9847], 'Lakshmipur': [22.9447, 90.8282],
                    'Noakhali': [22.8696, 91.0994], 'Rangamati': [22.6533, 92.1789], 'Habiganj': [24.3749, 91.4114], 'Moulvibazar': [24.4829, 91.7774],
                    'Sunamganj': [25.0658, 91.3950], 'Sylhet': [24.8949, 91.8687], 'Bagerhat': [22.6516, 89.7859], 'Chuadanga': [23.6402, 88.8418],
                    'Jashore': [23.1664, 89.2081], 'Jhenaidah': [23.5448, 89.1539], 'Khulna': [22.8456, 89.5403],
                    'Kushtia': [23.9013, 89.1204], 'Magura': [23.4873, 89.4199], 'Meherpur': [23.7622, 88.6318], 'Narail': [23.1725, 89.5127],
                    'Satkhira': [22.7185, 89.0705],
                    // Upazilas
                    'Mirpur': [23.8223, 90.3654], 'Uttara': [23.8759, 90.3976], 'Savar': [23.8583, 90.2667], 'Ashulia': [23.8819, 90.3275],
                    'Motijheel': [23.7330, 90.4172], 'Jatrabari': [23.7104, 90.4344], 'Keraniganj': [23.6980, 90.3575], 'Demra': [23.7073, 90.4497],
                    'Pahartali': [22.3600, 91.7800], 'Sitakunda': [22.6200, 91.6500], 'Hathazari': [22.4500, 91.8000],
                    'Bogura Sadar': [24.8500, 89.3667], 'Rajshahi Sadar': [24.3667, 88.6000], 'Khulna Sadar': [22.8167, 89.5500], 'Jashore Sadar': [23.1667, 89.2000],
                    'Sylhet Sadar': [24.8833, 91.8667], 'Habiganj Sadar': [24.3833, 91.4167], 'Barishal Sadar': [22.7000, 90.3667], 'Rangpur Sadar': [25.7500, 89.2500], 'Dinajpur Sadar': [25.6333, 88.6333]
                };

                // Determine display list of locations to guarantee map is ALWAYS populated with all 64 districts
                const displayLocations = viewMode === 'district'
                    ? Object.keys(mapCoords).filter(k => !k.includes('Sadar') && !['Mirpur', 'Uttara', 'Savar', 'Ashulia', 'Motijheel', 'Jatrabari', 'Keraniganj', 'Demra', 'Pahartali', 'Sitakunda', 'Hathazari'].includes(k))
                    : [...new Set([...Object.keys(dataAgg), ...allUpazilas])];

                // Build rich interactive vector map elements
                const vectorNodesHTML = displayLocations.map(name => {
                    const coords = mapCoords[name];
                    if (!coords) return '';

                    const lat = coords[0];
                    const lng = coords[1];

                    // 2D Projection for Bangladesh Map Canvas
                    const xPct = ((lng - 88.0) / (92.7 - 88.0)) * 74 + 13;
                    const yPct = ((26.8 - lat) / (26.8 - 20.5)) * 74 + 13;

                    const sales = normalizedAgg[app.getNormalizedKey(name)] || 0;
                    const pct = maxSales > 0 ? (sales / maxSales) : 0;

                    if (sales > 0) {
                        const color = pct > 0.6 ? '#e11d48' : (pct > 0.3 ? '#f59e0b' : '#3b82f6');
                        const glowColor = pct > 0.6 ? 'rgba(225,29,72,0.4)' : (pct > 0.3 ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.4)');
                        const size = Math.max(24, 20 + pct * 26);

                        return `
                            <div onclick="app.selectMapArea('${name}')" style="position:absolute; left:${xPct}%; top:${yPct}%; transform:translate(-50%,-50%); cursor:pointer; z-index:40;" class="group" title="${name}: ${sales} Units">
                                <div style="position:absolute; inset:-8px; background:${glowColor}; border-radius:9999px; animation:ping 2.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                                <div style="width:${size}px; height:${size}px; background:${color}; box-shadow:0 0 15px ${glowColor};" class="relative rounded-full border-2 border-white flex items-center justify-center font-black text-white text-[11px] transform transition-transform group-hover:scale-125 z-10">
                                    ${sales}
                                </div>
                                <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-2xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
                                    <p class="font-extrabold text-slate-100">${name}</p>
                                    <p class="text-[10px] text-amber-400 font-bold">${sales} Units Plotted</p>
                                </div>
                            </div>
                        `;
                    } else {
                        // Empty district marker dot (Guarantees map outline of Bangladesh is visible even with 0 sales)
                        return `
                            <div onclick="app.selectMapArea('${name}')" style="position:absolute; left:${xPct}%; top:${yPct}%; transform:translate(-50%,-50%); cursor:pointer; z-index:30;" class="group" title="${name}">
                                <div class="w-3 h-3 rounded-full bg-slate-700/80 border border-slate-500/50 transform transition-transform group-hover:scale-150 group-hover:bg-emerald-400"></div>
                                <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/90 text-white text-[10px] font-semibold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                                    ${name} (0 Sales)
                                </div>
                            </div>
                        `;
                    }
                }).join('');

                // High-precision Bangladesh Outline SVG Path
                const bdMapSvgPath = `
                    <svg viewBox="0 0 800 1000" class="w-full h-full opacity-25 text-emerald-500 fill-current stroke-emerald-400 stroke-2" style="position:absolute; inset:0; pointer-events:none;">
                        <path d="M 280 40 L 320 30 L 380 45 L 430 70 L 410 120 L 460 160 L 520 180 L 570 230 L 530 280 L 580 320 L 640 310 L 710 350 L 730 420 L 690 480 L 740 550 L 720 630 L 660 690 L 680 770 L 630 830 L 570 880 L 500 850 L 460 890 L 410 860 L 370 910 L 310 880 L 260 820 L 280 750 L 220 710 L 190 640 L 140 610 L 110 530 L 80 470 L 120 410 L 100 340 L 150 280 L 130 210 L 180 160 L 220 170 L 240 110 Z" />
                    </svg>
                `;

                const html = `
                    <div class="w-full fade-in pb-10 flex flex-col">
                        
                        <!-- Header & Dynamic Filters -->
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0 relative z-50">
                            <div>
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight flex items-center gap-3">
                                    <div class="p-2 bg-emerald-100 rounded-xl"><i data-lucide="map-pinned" class="w-6 h-6 text-emerald-600"></i></div> 
                                    Geospatial Sales Heatmap
                                </h1>
                                <p class="text-sm text-slate-500 font-medium mt-2">Visualizing actual sales distribution across Bangladesh (FY ${currentFY})</p>
                            </div>
                            
                            <div class="flex flex-col sm:flex-row items-center gap-3 bg-white border border-slate-200 p-2 rounded-xl shadow-sm flex-wrap justify-end">
                                <!-- View Toggle -->
                                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                    <button onclick="app.mapViewMode='district'; app.renderAdminSalesMap()" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'district' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}">District View</button>
                                    <button onclick="app.mapViewMode='upazila'; app.renderAdminSalesMap()" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'upazila' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}">Upazila View</button>
                                </div>
                                <div class="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>
                                
                                <!-- District Filter -->
                                <div class="flex items-center gap-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">District</label>
                                    <select onchange="app.mapDistrictTab=this.value; if(this.value !== 'All') app.mapViewMode='upazila'; app.renderAdminSalesMap()" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold ${districtTab !== 'All' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-700'} focus:outline-none focus:border-emerald-500 transition-colors">
                                        <option value="All" ${districtTab === 'All' ? 'selected' : ''}>All BD</option>
                                        ${allDistricts.map(d => `<option value="${d}" ${districtTab === d ? 'selected' : ''}>${d}</option>`).join('')}
                                    </select>
                                </div>

                                <!-- Brand Filter -->
                                <div class="flex items-center gap-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Brand</label>
                                    <select onchange="app.mapBrandTab=this.value; app.mapModelTab='All'; app.renderAdminSalesMap()" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors">
                                        <option value="All" ${brandTab === 'All' ? 'selected' : ''}>All Brands</option>
                                        <option value="Foton" ${brandTab === 'Foton' ? 'selected' : ''}>Foton</option>
                                        <option value="Mahindra" ${brandTab === 'Mahindra' ? 'selected' : ''}>Mahindra</option>
                                    </select>
                                </div>

                                <!-- Sale Type Filter -->
                                <div class="flex items-center gap-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Type</label>
                                    <select onchange="app.mapSaleType=this.value; app.renderAdminSalesMap()" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors">
                                        <option value="All" ${saleTypeTab === 'All' ? 'selected' : ''}>All Types</option>
                                        <option value="New Sale" ${saleTypeTab === 'New Sale' ? 'selected' : ''}>New</option>
                                        <option value="Resale" ${saleTypeTab === 'Resale' ? 'selected' : ''}>Resale</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Map & Insights Layout -->
                        <div class="flex flex-col lg:flex-row gap-6 min-h-[450px] h-[480px] relative z-10">
                            
                            <!-- Guaranteed Vector Map Container -->
                            <div style="height:480px !important; min-height:450px;" class="flex-1 rounded-2xl relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col min-h-[450px] h-[480px]">
                                
                                <div class="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-lg z-50">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Sales Density (${viewMode})</p>
                                    <div class="flex items-center gap-2">
                                        <span class="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span><span class="text-xs font-bold text-slate-300 mr-2">Low</span>
                                        <span class="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span><span class="text-xs font-bold text-slate-300 mr-2">Med</span>
                                        <span class="w-3 h-3 rounded-full bg-rose-600 shadow-sm"></span><span class="text-xs font-bold text-slate-300">High</span>
                                    </div>
                                </div>

                                <!-- Base Vector SVG Layer (Guaranteed 100% visible with all 64 districts) -->
                                <div id="vector-bd-map" style="position:absolute; inset:0; z-index:10; height:100%; width:100%;" class="w-full h-full rounded-2xl overflow-hidden shadow-inner bg-slate-900">
                                    ${bdMapSvgPath}
                                    ${vectorNodesHTML}
                                </div>

                                <!-- Leaflet Polygon Overlay Layer -->
                                <div id="real-bd-map" style="position:absolute; inset:0; z-index:20; height:100%; width:100%; background:transparent !important; pointer-events:auto;"></div>
                            </div>

                            <!-- Right Sidebar List (Scrollable Districts/Upazilas) -->
                            <div class="w-full lg:w-80 shrink-0 min-h-[450px] h-[480px]">
                                <div class="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <!-- Sidebar Header & KPI -->
                                    <div class="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Sales</span>
                                            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">${totalPlotted} Units</span>
                                        </div>
                                        
                                        <!-- Search Bar -->
                                        <div class="relative">
                                            <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"></i>
                                            <input type="text" id="map-search" oninput="app.filterMapList(this.value)" placeholder="Search ${viewMode}..." class="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                                        </div>
                                    </div>

                                    <!-- Scrollable List of Areas -->
                                    <div id="map-area-list" class="flex-1 overflow-y-auto p-2 space-y-2">
                                        ${(() => {
                                            const listItems = (viewMode === 'district' ? (allDistricts.length > 0 ? allDistricts : displayLocations) : allUpazilas).map(name => {
                                                const norm = app.getNormalizedKey(name);
                                                const sales = normalizedAgg[norm] || 0;
                                                return { name, sales };
                                            }).sort((a, b) => b.sales - a.sales);

                                            if (listItems.length === 0) {
                                                return `<p class="text-center text-slate-400 text-xs py-8 font-medium">No areas matching filters</p>`;
                                            }

                                            return listItems.map((item, idx) => {
                                                const isActive = (viewMode === 'district' && districtTab === item.name);
                                                const pctContribution = totalPlotted > 0 ? ((item.sales / totalPlotted) * 100).toFixed(1) : 0;
                                                return `
                                                    <div onclick="app.selectMapArea('${item.name}')" 
                                                         onmouseenter="app.hoverMapArea('${item.name}')" 
                                                         onmouseleave="app.hoverMapArea(null)" 
                                                         data-name="${item.name.toLowerCase()}" 
                                                         data-area-name="${app.getNormalizedKey(item.name)}" 
                                                         class="flex flex-col gap-2 p-3 rounded-xl cursor-pointer transition-all border ${isActive ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm' : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-200'}">
                                                        <div class="flex items-center justify-between gap-2.5">
                                                            <div class="flex items-center gap-2 min-w-0">
                                                                <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0">${idx + 1}</span>
                                                                <span class="truncate text-xs font-black text-slate-800">${item.name}</span>
                                                            </div>
                                                            <span class="px-2 py-0.5 rounded-md text-[10px] font-black ${item.sales > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}">${item.sales} Units</span>
                                                        </div>
                                                        <div class="flex items-center gap-2">
                                                            <div class="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                <div class="h-full rounded-full bg-gradient-to-r ${item.sales > 0 ? 'from-emerald-500 to-teal-600' : 'from-slate-300 to-slate-400'}" style="width: ${pctContribution}%"></div>
                                                            </div>
                                                            <span class="text-[9px] font-bold text-slate-400 shrink-0">${pctContribution}%</span>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('');
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();

                // Initialize Leaflet GeoJSON layer if Leaflet is present
                setTimeout(async () => {
                    if (typeof L === 'undefined') return;
                    if (app.salesMap) {
                        try { app.salesMap.remove(); } catch(e){}
                        app.salesMap = null;
                    }

                    const mapElem = document.getElementById('real-bd-map');
                    if (!mapElem) return;

                    app.salesMap = L.map('real-bd-map', {
                        zoomControl: false,
                        attributionControl: false
                    }).setView([23.8103, 90.4125], 7);

                    L.control.zoom({ position: 'bottomright' }).addTo(app.salesMap);

                    // Add OpenStreetMap Tile Layer
                    try {
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            maxZoom: 19,
                            opacity: 0.7
                        }).addTo(app.salesMap);
                    } catch(e) {
                        console.warn('Tile layer optional:', e);
                    }

                    app.salesMap.invalidateSize();
                    setTimeout(() => { if (app.salesMap) app.salesMap.invalidateSize(); }, 200);

                    // Fetch local GeoJSON boundaries
                    try {
                        if (!app.geoJsonCache) app.geoJsonCache = {};

                        const localGeoUrl = viewMode === 'district'
                            ? 'assets/geo/bd-districts.json'
                            : 'assets/geo/bd-upazilas.json';

                        if (!app.geoJsonCache[viewMode]) {
                            const res = await fetch(localGeoUrl);
                            if (!res.ok) throw new Error('Local GeoJSON fetch failed');
                            app.geoJsonCache[viewMode] = await res.json();
                        }

                        let geoData = app.geoJsonCache[viewMode];

                        if (districtTab !== 'All') {
                            const normSelectedDist = app.getNormalizedKey(districtTab);
                            const filteredFeatures = geoData.features.filter(f => {
                                const fDist = f.properties.ADM2_EN || f.properties.NAME_2 || f.properties.district || '';
                                return app.getNormalizedKey(fDist) === normSelectedDist;
                            });
                            if (filteredFeatures.length > 0) {
                                geoData = { ...geoData, features: filteredFeatures };
                            }
                        }

                        const getPolygonColor = (d) => {
                            if (!d || d === 0) return 'transparent';
                            const pct = d / maxSales;
                            if (pct > 0.66) return '#e11d48';
                            if (pct > 0.33) return '#f59e0b';
                            return '#3b82f6';
                        };

                        const style = (feature) => {
                            const propName = viewMode === 'district'
                                ? (feature.properties.ADM2_EN || feature.properties.name || feature.properties.NAME_2 || '')
                                : (feature.properties.ADM3_EN || feature.properties.name || feature.properties.NAME_3 || '');
                            const normProp = app.getNormalizedKey(propName);
                            const sales = normalizedAgg[normProp] || 0;
                            return {
                                fillColor: getPolygonColor(sales),
                                weight: sales > 0 ? 1.5 : 0.8,
                                opacity: 0.8,
                                color: sales > 0 ? '#ffffff' : '#475569',
                                fillOpacity: sales > 0 ? 0.45 : 0.05
                            };
                        };

                        const highlightFeature = (e) => {
                            var layer = e.target;
                            layer.setStyle({ weight: 2.5, color: '#10b981', fillOpacity: 0.75 });
                            const propName = viewMode === 'district'
                                ? (layer.feature.properties.ADM2_EN || layer.feature.properties.name || layer.feature.properties.NAME_2 || '')
                                : (layer.feature.properties.ADM3_EN || layer.feature.properties.name || layer.feature.properties.NAME_3 || '');
                            
                            const listEl = document.querySelector(`[data-area-name="${app.getNormalizedKey(propName)}"]`);
                            if (listEl) {
                                document.querySelectorAll('#map-area-list > div').forEach(el => {
                                    el.classList.remove('bg-emerald-50', 'border-emerald-300');
                                    el.classList.add('border-slate-100', 'bg-white');
                                });
                                listEl.classList.remove('border-slate-100', 'bg-white');
                                listEl.classList.add('bg-emerald-50', 'border-emerald-300');
                                listEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                        };

                        const resetHighlight = (e) => {
                            if (app.geoLayer) app.geoLayer.resetStyle(e.target);
                        };

                        const onEachFeature = (feature, layer) => {
                            layer.on({ mouseover: highlightFeature, mouseout: resetHighlight });
                        };

                        app.geoLayer = L.geoJSON(geoData, { style: style, onEachFeature: onEachFeature }).addTo(app.salesMap);

                    } catch (err) {
                        console.warn('Leaflet GeoJSON overlay optional:', err);
                    }
                }, 100);
            };

window.app.renderChartTerritory = (salesData) => {
                if (app.charts.territory) app.charts.territory.destroy();
                const ctx = document.getElementById('chartTerritory').getContext('2d');

                // Glassmorphic Gradients for Bars
                const fotonGrad = ctx.createLinearGradient(0, 0, 0, 300);
                fotonGrad.addColorStop(0, 'rgba(4, 26, 84, 0.85)'); // Foton brand base
                fotonGrad.addColorStop(1, 'rgba(4, 26, 84, 0.15)'); // Foton transparent

                const mahindraGrad = ctx.createLinearGradient(0, 0, 0, 300);
                mahindraGrad.addColorStop(0, 'rgba(229, 34, 62, 0.85)'); // Mahindra brand base
                mahindraGrad.addColorStop(1, 'rgba(229, 34, 62, 0.15)'); // Mahindra transparent

                // Aggregate by territory
                const terrData = {};
                salesData.forEach(s => {
                    const tName = DB.territories.find(t => t.id === s.territory_id)?.name || 'Unknown';
                    if (!terrData[tName]) terrData[tName] = { foton: 0, mahindra: 0 };
                    if (s.brand === 'Foton') terrData[tName].foton += Number(s.unit_qty || 0);
                    if (s.brand === 'Mahindra') terrData[tName].mahindra += Number(s.unit_qty || 0);
                });

                const labels = Object.keys(terrData);
                const fotonSet = labels.map(l => terrData[l].foton);
                const mahindraSet = labels.map(l => terrData[l].mahindra);

                app.charts.territory = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Foton',
                                data: fotonSet,
                                backgroundColor: fotonGrad,
                                borderColor: 'rgba(4, 26, 84, 0.4)',
                                borderWidth: 1.5,
                                borderRadius: 6
                            },
                            {
                                label: 'Mahindra',
                                data: mahindraSet,
                                backgroundColor: mahindraGrad,
                                borderColor: 'rgba(229, 34, 62, 0.4)',
                                borderWidth: 1.5,
                                borderRadius: 6
                            }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { legend: { position: 'bottom' } } }
                });
            };

window.app.renderChartBrand = (f, m) => {
                if (app.charts.brand) app.charts.brand.destroy();
                const ctx = document.getElementById('chartBrand').getContext('2d');

                // Glassmorphic Gradients for Doughnut
                const fotonGrad = ctx.createLinearGradient(0, 0, 0, 300);
                fotonGrad.addColorStop(0, 'rgba(4, 26, 84, 0.9)');
                fotonGrad.addColorStop(1, 'rgba(4, 26, 84, 0.3)');

                const mahindraGrad = ctx.createLinearGradient(0, 0, 0, 300);
                mahindraGrad.addColorStop(0, 'rgba(229, 34, 62, 0.9)');
                mahindraGrad.addColorStop(1, 'rgba(229, 34, 62, 0.3)');

                app.charts.brand = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Foton', 'Mahindra'],
                        datasets: [{
                            data: [f, m],
                            backgroundColor: [fotonGrad, mahindraGrad],
                            borderColor: '#ffffff',
                            borderWidth: 3,
                            hoverOffset: 4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
                });
            };

