// ═══════════════════════════════════════════════════════════════════════
// ANALYTICS LAB — Multi-Year Intelligence Platform
// Paste this block inside the `const app = { ... }` object as properties
// ═══════════════════════════════════════════════════════════════════════

// ── State variables (safe-init) ──────────────────────────────────────
analyticsLabFY: [],
analyticsLabBrand: 'All',
analyticsLabTerritory: 'All',
analyticsLabSaleType: 'All',
analyticsLabModel: 'All',
analyticsLabChartMode: 'monthly',
analyticsLabTab: 'overview',
_analyticsLabCharts: {},

// ── FY toggle helper ─────────────────────────────────────────────────
toggleAnalyticsLabFY: (fy) => {
    const idx = app.analyticsLabFY.indexOf(fy);
    if (idx === -1) {
        app.analyticsLabFY.push(fy);
    } else {
        app.analyticsLabFY.splice(idx, 1);
    }
    app.renderAnalyticsLab();
},

// ── Color palette constant ───────────────────────────────────────────
_alColors: ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1', '#14b8a6'],

// ══════════════════════════════════════════════════════════════════════
// MAIN RENDER
// ══════════════════════════════════════════════════════════════════════
renderAnalyticsLab: () => {
    localStorage.setItem('aci_last_page', 'analytics');
    app.setupSidebar();

    const MONTHS = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
    const SHORT  = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const colors = app._alColors;

    // ── 1. Auto-detect FYs ───────────────────────────────────────────
    const allFYs = [...new Set(DB.sales.map(s => s.fy))].sort();
    if (!app.analyticsLabFY || app.analyticsLabFY.length === 0) {
        app.analyticsLabFY = [...allFYs];
    }
    const selectedFYs = app.analyticsLabFY.filter(f => allFYs.includes(f)).sort();

    // ── 2. Apply global filters ──────────────────────────────────────
    let filtered = DB.sales.filter(s => selectedFYs.includes(s.fy));
    if (app.analyticsLabBrand !== 'All') filtered = filtered.filter(s => s.brand === app.analyticsLabBrand);
    if (app.analyticsLabTerritory !== 'All') filtered = filtered.filter(s => s.territory_id === app.analyticsLabTerritory);
    if (app.analyticsLabSaleType !== 'All') filtered = filtered.filter(s => s.sale_type === app.analyticsLabSaleType);
    if (app.analyticsLabModel !== 'All') filtered = filtered.filter(s => s.model === app.analyticsLabModel);

    // ── 3. KPI data ──────────────────────────────────────────────────
    const kpiCards = selectedFYs.map((fy, i) => {
        const total = filtered.filter(s => s.fy === fy).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
        const prevFY = app.getPreviousFY(fy);
        const prevTotal = DB.sales.filter(s => s.fy === prevFY).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
        const growth = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : null;
        const color = colors[i % colors.length];
        return { fy, total, growth, color };
    });

    // ── 4. Territories list & Models list ────────────────────────────
    const territories = DB.territories || [];
    const allModels = [...new Set(DB.sales.map(s => s.model))].filter(Boolean).sort();
    const allBrands = [...new Set(DB.sales.map(s => s.brand))].filter(Boolean).sort();

    // ── 5. Tab state ─────────────────────────────────────────────────
    const tab = app.analyticsLabTab || 'overview';
    const tabItems = [
        { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
        { key: 'territory', label: 'Territory', icon: 'map-pin' },
        { key: 'models', label: 'Models', icon: 'boxes' },
        { key: 'seasonality', label: 'Seasonality', icon: 'sun-snow' }
    ];

    // ── Active filter pill helper ────────────────────────────────────
    const pill = (label, isActive, onclick) =>
        `<button onclick="${onclick}" class="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-white text-violet-900 shadow-lg shadow-violet-500/20 scale-105' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}">${label}</button>`;

    // ══════════════════════════════════════════════════════════════════
    // BUILD HTML
    // ══════════════════════════════════════════════════════════════════
    let html = '';

    // ── HEADER ────────────────────────────────────────────────────────
    html += `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 pb-28">
        <!-- Hero Header -->
        <div class="bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 rounded-b-[2.5rem] shadow-2xl shadow-violet-950/30 px-4 pt-6 pb-5 mb-6 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(circle at 20% 50%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.2) 0%, transparent 50%)"></div>
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <i data-lucide="flask-conical" class="w-4 h-4 text-white"></i>
                            </div>
                            <h1 class="text-xl font-black text-white tracking-tight">Analytics Lab</h1>
                        </div>
                        <p class="text-[10px] font-medium text-violet-300/80 tracking-wider uppercase">Multi-Year Intelligence Platform</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-bold text-violet-400/60 uppercase tracking-widest">${selectedFYs.length} FY</span>
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                </div>

                <!-- FY Multi-Select Chips -->
                <div class="mb-3">
                    <p class="text-[9px] font-black uppercase tracking-widest text-violet-400/60 mb-1.5">Fiscal Years</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${allFYs.map((fy, i) => {
                            const isOn = selectedFYs.includes(fy);
                            return `<button onclick="app.toggleAnalyticsLabFY('${fy}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all duration-300 border ${isOn ? 'bg-white text-violet-900 border-white shadow-lg shadow-violet-400/20' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80'}">
                                <span class="inline-block w-1.5 h-1.5 rounded-full mr-1 ${isOn ? 'bg-violet-500' : 'bg-white/20'}"></span>FY ${fy}
                            </button>`;
                        }).join('')}
                    </div>
                </div>

                <!-- Filter Row 1: Brand & Sale Type -->
                <div class="flex flex-wrap gap-1.5 mb-3">
                    <div class="flex items-center gap-1">
                        <span class="text-[8px] font-black uppercase tracking-widest text-violet-400/50 mr-1">Brand</span>
                        ${['All', ...allBrands].map(b => pill(b, app.analyticsLabBrand === b, `app.analyticsLabBrand='${b}';app.renderAnalyticsLab()`)).join('')}
                    </div>
                    <div class="w-px h-5 bg-white/10 mx-1 self-center"></div>
                    <div class="flex items-center gap-1">
                        <span class="text-[8px] font-black uppercase tracking-widest text-violet-400/50 mr-1">Type</span>
                        ${['All', 'New Sale', 'Resale'].map(t => pill(t, app.analyticsLabSaleType === t, `app.analyticsLabSaleType='${t}';app.renderAnalyticsLab()`)).join('')}
                    </div>
                </div>

                <!-- Filter Row 2: Territory & Model Dropdowns -->
                <div class="flex gap-2 mb-4">
                    <select onchange="app.analyticsLabTerritory=this.value;app.renderAnalyticsLab()" class="flex-1 text-[10px] font-bold rounded-xl px-3 py-1.5 bg-white/10 !border-white/10 !text-white/80 !shadow-none" style="background:rgba(255,255,255,0.08)!important;color:rgba(255,255,255,0.85)!important;border:1px solid rgba(255,255,255,0.12)!important">
                        <option value="All" ${app.analyticsLabTerritory === 'All' ? 'selected' : ''}>All Territories</option>
                        ${territories.map(t => `<option value="${t.id}" ${app.analyticsLabTerritory === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                    <select onchange="app.analyticsLabModel=this.value;app.renderAnalyticsLab()" class="flex-1 text-[10px] font-bold rounded-xl px-3 py-1.5 bg-white/10 !border-white/10 !text-white/80 !shadow-none" style="background:rgba(255,255,255,0.08)!important;color:rgba(255,255,255,0.85)!important;border:1px solid rgba(255,255,255,0.12)!important">
                        <option value="All" ${app.analyticsLabModel === 'All' ? 'selected' : ''}>All Models</option>
                        ${allModels.map(m => `<option value="${m}" ${app.analyticsLabModel === m ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>

                <!-- Tab Navigation -->
                <div class="flex gap-1 bg-white/5 rounded-2xl p-1 border border-white/5">
                    ${tabItems.map(t => `
                        <button onclick="app.analyticsLabTab='${t.key}';app.renderAnalyticsLab()" class="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${tab === t.key ? 'bg-white text-violet-900 shadow-lg shadow-violet-500/20' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}">
                            <i data-lucide="${t.icon}" class="w-3 h-3"></i>${t.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Content Area -->
        <div class="px-4 space-y-4">`;

    // ── KPI CARDS ─────────────────────────────────────────────────────
    html += `<div class="grid grid-cols-${Math.min(selectedFYs.length, 3)} gap-3">`;
    kpiCards.forEach((k, i) => {
        const growthStr = k.growth !== null ? (k.growth >= 0 ? `+${k.growth.toFixed(1)}%` : `${k.growth.toFixed(1)}%`) : 'N/A';
        const growthColor = k.growth !== null ? (k.growth >= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-slate-400';
        const growthBg = k.growth !== null ? (k.growth >= 0 ? 'bg-emerald-50' : 'bg-red-50') : 'bg-slate-50';
        const growthIcon = k.growth !== null ? (k.growth >= 0 ? 'trending-up' : 'trending-down') : 'minus';
        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10" style="background:${k.color};filter:blur(25px)"></div>
            <div class="relative z-10">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">FY ${k.fy}</p>
                <p class="text-2xl font-black text-slate-800 leading-none mb-1.5" style="color:${k.color}">${k.total.toLocaleString()}</p>
                <div class="flex items-center gap-1">
                    <span class="${growthBg} ${growthColor} text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <i data-lucide="${growthIcon}" class="w-2.5 h-2.5"></i>${growthStr}
                    </span>
                    <span class="text-[8px] text-slate-400">vs prev</span>
                </div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 rounded-b-[1.75rem]" style="background:linear-gradient(90deg,${k.color},transparent)"></div>
        </div>`;
    });
    html += `</div>`;

    // ══════════════════════════════════════════════════════════════════
    // TAB: OVERVIEW
    // ══════════════════════════════════════════════════════════════════
    if (tab === 'overview') {
        // ── Multi-Year Trend Chart ───────────────────────────────────
        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Multi-Year Trend</p>
                    <p class="text-xs font-bold text-slate-700">Monthly Sales Comparison</p>
                </div>
                <div class="flex gap-1 bg-slate-100 rounded-xl p-0.5">
                    <button onclick="app.analyticsLabChartMode='monthly';app.renderAnalyticsLab()" class="px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${app.analyticsLabChartMode === 'monthly' ? 'bg-white text-violet-700 shadow' : 'text-slate-500'}">Monthly</button>
                    <button onclick="app.analyticsLabChartMode='cumulative';app.renderAnalyticsLab()" class="px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${app.analyticsLabChartMode === 'cumulative' ? 'bg-white text-violet-700 shadow' : 'text-slate-500'}">Cumulative</button>
                </div>
            </div>
            <div class="relative" style="height:280px"><canvas id="analyticsLabTrendChart"></canvas></div>
        </div>`;

        // ── Brand Comparison Chart ───────────────────────────────────
        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4">
            <div class="mb-3">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Brand Showdown</p>
                <p class="text-xs font-bold text-slate-700">Foton vs Mahindra per FY</p>
            </div>
            <div class="relative" style="height:260px"><canvas id="analyticsLabBrandChart"></canvas></div>
        </div>`;

        // ── FY Comparison Heatmap Table ──────────────────────────────
        // Collect monthly data per FY
        const monthlyData = {};
        selectedFYs.forEach(fy => {
            monthlyData[fy] = {};
            MONTHS.forEach(m => { monthlyData[fy][m] = 0; });
            filtered.filter(s => s.fy === fy).forEach(s => {
                if (monthlyData[fy][s.sales_month] !== undefined) monthlyData[fy][s.sales_month] += (Number(s.unit_qty) || 0);
            });
        });
        // Find max value for heatmap
        let maxVal = 1;
        selectedFYs.forEach(fy => { MONTHS.forEach(m => { if (monthlyData[fy][m] > maxVal) maxVal = monthlyData[fy][m]; }); });

        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4 overflow-x-auto">
            <div class="mb-3">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">FY Comparison Matrix</p>
                <p class="text-xs font-bold text-slate-700">Monthly Heat Map</p>
            </div>
            <table class="w-full text-[10px]">
                <thead>
                    <tr>
                        <th class="text-left text-[9px] font-black uppercase tracking-widest text-slate-400 py-2 px-2 sticky left-0 bg-white/80 backdrop-blur z-10">Month</th>
                        ${selectedFYs.map((fy, i) => `<th class="text-center font-black text-[9px] uppercase tracking-wider py-2 px-3" style="color:${colors[i % colors.length]}">FY ${fy}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${MONTHS.map((m, mi) => {
                        const row = selectedFYs.map((fy, i) => {
                            const val = monthlyData[fy][m];
                            const intensity = Math.round((val / maxVal) * 100);
                            const bgColor = `rgba(139,92,246,${(intensity / 100 * 0.25).toFixed(2)})`;
                            return `<td class="text-center font-bold py-2 px-3 rounded-lg" style="background:${bgColor}">${val}</td>`;
                        }).join('');
                        return `<tr class="hover:bg-violet-50/50 transition-colors">
                            <td class="text-left font-bold text-slate-600 py-2 px-2 sticky left-0 bg-white/80 backdrop-blur">${SHORT[mi]}</td>
                            ${row}
                        </tr>`;
                    }).join('')}
                    <tr class="border-t-2 border-violet-200 bg-violet-50/50 font-black">
                        <td class="py-2 px-2 text-slate-800 sticky left-0 bg-violet-50/80 backdrop-blur">TOTAL</td>
                        ${selectedFYs.map((fy, i) => {
                            const total = MONTHS.reduce((a, m) => a + monthlyData[fy][m], 0);
                            return `<td class="text-center py-2 px-3" style="color:${colors[i % colors.length]}">${total.toLocaleString()}</td>`;
                        }).join('')}
                    </tr>
                </tbody>
            </table>
        </div>`;
    }

    // ══════════════════════════════════════════════════════════════════
    // TAB: TERRITORY
    // ══════════════════════════════════════════════════════════════════
    if (tab === 'territory') {
        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4">
            <div class="mb-3">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Territory Rankings</p>
                <p class="text-xs font-bold text-slate-700">Performance by Region</p>
            </div>
            <div class="relative" style="height:${Math.max(280, territories.length * 40)}px"><canvas id="analyticsLabTerrChart"></canvas></div>
        </div>`;

        // ── Territory Growth Heatmap ─────────────────────────────────
        const terrData = {};
        let terrMax = 1;
        territories.forEach(t => {
            terrData[t.id] = { name: t.name };
            selectedFYs.forEach(fy => {
                const val = filtered.filter(s => s.fy === fy && s.territory_id === t.id).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                terrData[t.id][fy] = val;
                if (val > terrMax) terrMax = val;
            });
        });

        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4 overflow-x-auto">
            <div class="mb-3">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Territory Growth Heatmap</p>
                <p class="text-xs font-bold text-slate-700">Units Sold by Territory & Year</p>
            </div>
            <table class="w-full text-[10px]">
                <thead>
                    <tr>
                        <th class="text-left text-[9px] font-black uppercase tracking-widest text-slate-400 py-2 px-2">Territory</th>
                        ${selectedFYs.map((fy, i) => `<th class="text-center font-black text-[9px] uppercase tracking-wider py-2 px-3" style="color:${colors[i % colors.length]}">FY ${fy}</th>`).join('')}
                        <th class="text-center text-[9px] font-black uppercase tracking-widest text-slate-400 py-2 px-3">Trend</th>
                    </tr>
                </thead>
                <tbody>
                    ${territories.map(t => {
                        const vals = selectedFYs.map(fy => terrData[t.id][fy]);
                        const trend = vals.length >= 2 ? (vals[vals.length - 1] - vals[vals.length - 2]) : 0;
                        const trendIcon = trend > 0 ? 'trending-up' : trend < 0 ? 'trending-down' : 'minus';
                        const trendColor = trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-slate-400';
                        return `<tr class="hover:bg-violet-50/50 transition-colors border-b border-slate-100">
                            <td class="text-left font-bold text-slate-700 py-2.5 px-2">${t.name}</td>
                            ${selectedFYs.map((fy, i) => {
                                const val = terrData[t.id][fy];
                                const intensity = terrMax > 0 ? (val / terrMax) : 0;
                                const bg = `rgba(139,92,246,${(intensity * 0.3).toFixed(2)})`;
                                return `<td class="text-center font-bold py-2.5 px-3 rounded-lg" style="background:${bg}">${val}</td>`;
                            }).join('')}
                            <td class="text-center py-2.5 px-3 ${trendColor}"><i data-lucide="${trendIcon}" class="w-3.5 h-3.5 inline-block"></i></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;

        // ── Upazila drill-down (when territory filter is active) ─────
        if (app.analyticsLabTerritory !== 'All') {
            const selTerr = territories.find(t => t.id === app.analyticsLabTerritory);
            if (selTerr) {
                const upazilas = selTerr.upazilas || [...new Set(filtered.map(s => s.upazila))].filter(Boolean).sort();
                const upData = {};
                upazilas.forEach(u => {
                    upData[u] = {};
                    selectedFYs.forEach(fy => {
                        upData[u][fy] = filtered.filter(s => s.fy === fy && s.upazila === u).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                    });
                });
                html += `
                <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4 overflow-x-auto">
                    <div class="mb-3">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center"><i data-lucide="map-pin" class="w-3 h-3 text-white"></i></div>
                            <div>
                                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Upazila Breakdown</p>
                                <p class="text-xs font-bold text-slate-700">${selTerr.name} — Drill Down</p>
                            </div>
                        </div>
                    </div>
                    <table class="w-full text-[10px]">
                        <thead>
                            <tr>
                                <th class="text-left text-[9px] font-black uppercase tracking-widest text-slate-400 py-2 px-2">Upazila</th>
                                ${selectedFYs.map((fy, i) => `<th class="text-center font-black text-[9px] uppercase tracking-wider py-2 px-3" style="color:${colors[i % colors.length]}">FY ${fy}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${upazilas.map(u => `
                                <tr class="hover:bg-violet-50/50 transition-colors border-b border-slate-100">
                                    <td class="text-left font-bold text-slate-600 py-2 px-2">${u}</td>
                                    ${selectedFYs.map((fy, i) => `<td class="text-center font-bold py-2 px-3">${upData[u][fy]}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // TAB: MODELS
    // ══════════════════════════════════════════════════════════════════
    if (tab === 'models') {
        // ── Donut Charts Row ─────────────────────────────────────────
        html += `<div class="grid grid-cols-${Math.min(selectedFYs.length, 3)} gap-3">`;
        selectedFYs.forEach((fy, i) => {
            html += `
            <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4">
                <div class="mb-2">
                    <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Model Mix</p>
                    <p class="text-xs font-bold" style="color:${colors[i % colors.length]}">FY ${fy}</p>
                </div>
                <div class="relative" style="height:200px"><canvas id="analyticsLabModelChart_${i}"></canvas></div>
            </div>`;
        });
        html += `</div>`;

        // ── Model Trend Table ────────────────────────────────────────
        const modelData = {};
        allModels.forEach(m => {
            modelData[m] = {};
            selectedFYs.forEach(fy => {
                modelData[m][fy] = filtered.filter(s => s.fy === fy && s.model === m).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
            });
        });
        // Sort models by total descending
        const sortedModels = allModels.slice().sort((a, b) => {
            const ta = selectedFYs.reduce((s, fy) => s + (modelData[a][fy] || 0), 0);
            const tb = selectedFYs.reduce((s, fy) => s + (modelData[b][fy] || 0), 0);
            return tb - ta;
        });

        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4 overflow-x-auto">
            <div class="mb-3">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Model Performance Matrix</p>
                <p class="text-xs font-bold text-slate-700">All Models Across Fiscal Years</p>
            </div>
            <table class="w-full text-[10px]">
                <thead>
                    <tr>
                        <th class="text-left text-[9px] font-black uppercase tracking-widest text-slate-400 py-2 px-2">Model</th>
                        ${selectedFYs.map((fy, i) => `<th class="text-center font-black text-[9px] uppercase tracking-wider py-2 px-3" style="color:${colors[i % colors.length]}">FY ${fy}</th>`).join('')}
                        <th class="text-center text-[9px] font-black uppercase tracking-widest text-slate-400 py-2 px-3">YOY</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedModels.map(m => {
                        const vals = selectedFYs.map(fy => modelData[m][fy] || 0);
                        const totalAcrossFY = vals.reduce((a, v) => a + v, 0);
                        if (totalAcrossFY === 0) return '';
                        const lastTwo = vals.slice(-2);
                        let yoy = '';
                        let yoyColor = 'text-slate-400';
                        let yoyIcon = 'minus';
                        if (lastTwo.length === 2 && lastTwo[0] > 0) {
                            const pct = ((lastTwo[1] - lastTwo[0]) / lastTwo[0] * 100).toFixed(1);
                            yoy = (pct >= 0 ? '+' : '') + pct + '%';
                            yoyColor = pct >= 0 ? 'text-emerald-600' : 'text-red-500';
                            yoyIcon = pct >= 0 ? 'trending-up' : 'trending-down';
                        } else if (lastTwo.length === 2 && lastTwo[0] === 0 && lastTwo[1] > 0) {
                            yoy = 'New';
                            yoyColor = 'text-blue-500';
                            yoyIcon = 'sparkles';
                        }
                        return `<tr class="hover:bg-violet-50/50 transition-colors border-b border-slate-100">
                            <td class="text-left font-bold text-slate-700 py-2.5 px-2">${m}</td>
                            ${vals.map(v => `<td class="text-center font-bold py-2.5 px-3">${v}</td>`).join('')}
                            <td class="text-center py-2.5 px-3 ${yoyColor} font-bold"><span class="flex items-center justify-center gap-0.5"><i data-lucide="${yoyIcon}" class="w-3 h-3"></i>${yoy}</span></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;
    }

    // ══════════════════════════════════════════════════════════════════
    // TAB: SEASONALITY
    // ══════════════════════════════════════════════════════════════════
    if (tab === 'seasonality') {
        // ── Radar Chart ──────────────────────────────────────────────
        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4">
            <div class="mb-3">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Seasonal Fingerprint</p>
                <p class="text-xs font-bold text-slate-700">Monthly Sales Patterns Overlay</p>
            </div>
            <div class="relative" style="height:300px"><canvas id="analyticsLabRadarChart"></canvas></div>
        </div>`;

        // ── Monthly Velocity Table ───────────────────────────────────
        const velData = {};
        const fyPeaks = {};
        selectedFYs.forEach(fy => {
            velData[fy] = {};
            let peak = { m: '', v: 0 };
            MONTHS.forEach(m => {
                const val = filtered.filter(s => s.fy === fy && s.sales_month === m).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                velData[fy][m] = val;
                if (val > peak.v) peak = { m, v: val };
            });
            fyPeaks[fy] = peak.m;
        });

        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4 overflow-x-auto">
            <div class="mb-3">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Monthly Velocity</p>
                <p class="text-xs font-bold text-slate-700">Peak Months Highlighted</p>
            </div>
            <table class="w-full text-[10px]">
                <thead>
                    <tr>
                        <th class="text-left text-[9px] font-black uppercase tracking-widest text-slate-400 py-2 px-2">Month</th>
                        ${selectedFYs.map((fy, i) => `<th class="text-center font-black text-[9px] uppercase tracking-wider py-2 px-3" style="color:${colors[i % colors.length]}">FY ${fy}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${MONTHS.map((m, mi) => `
                        <tr class="hover:bg-violet-50/50 transition-colors border-b border-slate-100">
                            <td class="text-left font-bold text-slate-600 py-2 px-2">${SHORT[mi]}</td>
                            ${selectedFYs.map((fy, i) => {
                                const val = velData[fy][m];
                                const isPeak = fyPeaks[fy] === m;
                                return `<td class="text-center font-bold py-2 px-3 ${isPeak ? 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 rounded-lg' : ''}">${val}${isPeak ? ' <i data-lucide="crown" class="w-2.5 h-2.5 inline-block text-amber-500"></i>' : ''}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;

        // ── Automated Insights Panel ─────────────────────────────────
        const insights = [];

        // 1. Peak sales month historically
        const monthTotals = {};
        MONTHS.forEach(m => {
            monthTotals[m] = filtered.reduce((a, s) => a + (s.sales_month === m ? (Number(s.unit_qty) || 0) : 0), 0);
        });
        const peakMonth = Object.entries(monthTotals).sort((a, b) => b[1] - a[1])[0];
        if (peakMonth) {
            insights.push({ icon: 'crown', color: 'amber', title: 'Historical Peak Month', text: `<strong>${peakMonth[0]}</strong> is the all-time highest sales month with <strong>${peakMonth[1].toLocaleString()}</strong> total units across selected FYs.` });
        }

        // 2. Top growing territory YOY (use last 2 FYs)
        if (selectedFYs.length >= 2) {
            const lastFY = selectedFYs[selectedFYs.length - 1];
            const prevFY = selectedFYs[selectedFYs.length - 2];
            let bestGrowthTerr = { name: '', pct: -Infinity };
            territories.forEach(t => {
                const curr = filtered.filter(s => s.fy === lastFY && s.territory_id === t.id).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                const prev = filtered.filter(s => s.fy === prevFY && s.territory_id === t.id).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                const pct = prev > 0 ? ((curr - prev) / prev * 100) : (curr > 0 ? 100 : 0);
                if (pct > bestGrowthTerr.pct) bestGrowthTerr = { name: t.name, pct, curr, prev };
            });
            if (bestGrowthTerr.name) {
                insights.push({ icon: 'rocket', color: 'emerald', title: 'Top Growing Territory', text: `<strong>${bestGrowthTerr.name}</strong> leads YOY growth at <strong>+${bestGrowthTerr.pct.toFixed(1)}%</strong> (FY ${prevFY} → ${lastFY}).` });
            }

            // 3. Declining territories warning
            let decliningTerrs = [];
            territories.forEach(t => {
                const curr = filtered.filter(s => s.fy === lastFY && s.territory_id === t.id).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                const prev = filtered.filter(s => s.fy === prevFY && s.territory_id === t.id).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                if (prev > 0 && curr < prev) decliningTerrs.push({ name: t.name, pct: ((curr - prev) / prev * 100).toFixed(1) });
            });
            decliningTerrs.sort((a, b) => Number(a.pct) - Number(b.pct));
            if (decliningTerrs.length > 0) {
                const topDecline = decliningTerrs.slice(0, 3).map(d => `${d.name} (${d.pct}%)`).join(', ');
                insights.push({ icon: 'alert-triangle', color: 'red', title: 'Declining Trends', text: `Watch list: <strong>${topDecline}</strong> show negative growth from FY ${prevFY} to ${lastFY}.` });
            }
        }

        // 4. Best performing model across years
        const modelTotals = {};
        allModels.forEach(m => {
            modelTotals[m] = filtered.filter(s => s.model === m).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
        });
        const bestModel = Object.entries(modelTotals).sort((a, b) => b[1] - a[1])[0];
        if (bestModel) {
            insights.push({ icon: 'trophy', color: 'violet', title: 'Top Model Overall', text: `<strong>${bestModel[0]}</strong> dominates with <strong>${bestModel[1].toLocaleString()}</strong> units sold across all selected FYs.` });
        }

        // 5. Brand momentum analysis
        if (selectedFYs.length >= 2 && app.analyticsLabBrand === 'All') {
            const lastFY = selectedFYs[selectedFYs.length - 1];
            const prevFY = selectedFYs[selectedFYs.length - 2];
            allBrands.forEach(brand => {
                const curr = filtered.filter(s => s.fy === lastFY && s.brand === brand).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                const prev = filtered.filter(s => s.fy === prevFY && s.brand === brand).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0);
                const pct = prev > 0 ? ((curr - prev) / prev * 100).toFixed(1) : 'N/A';
                const direction = curr >= prev ? 'gaining' : 'losing';
                const ic = curr >= prev ? 'zap' : 'battery-low';
                const co = curr >= prev ? 'cyan' : 'orange';
                insights.push({ icon: ic, color: co, title: `${brand} Momentum`, text: `<strong>${brand}</strong> is ${direction} momentum: ${pct !== 'N/A' ? (pct >= 0 ? '+' + pct : pct) + '%' : 'N/A'} change (FY ${prevFY} → ${lastFY}). Current: <strong>${curr.toLocaleString()}</strong> units.` });
            });
        }

        // 6. Slowest month
        const slowMonth = Object.entries(monthTotals).sort((a, b) => a[1] - b[1])[0];
        if (slowMonth) {
            insights.push({ icon: 'moon', color: 'slate', title: 'Slowest Month', text: `<strong>${slowMonth[0]}</strong> is historically the slowest with <strong>${slowMonth[1].toLocaleString()}</strong> units. Consider targeted campaigns.` });
        }

        const colorMap = { amber: 'from-amber-500 to-yellow-500', emerald: 'from-emerald-500 to-teal-500', red: 'from-red-500 to-rose-500', violet: 'from-violet-500 to-purple-500', cyan: 'from-cyan-500 to-blue-500', orange: 'from-orange-500 to-amber-500', slate: 'from-slate-500 to-gray-500' };

        html += `
        <div class="glass rounded-[1.75rem] border border-white shadow-lg p-4">
            <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <i data-lucide="brain" class="w-3.5 h-3.5 text-white"></i>
                </div>
                <div>
                    <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Auto-Generated Insights</p>
                    <p class="text-xs font-bold text-slate-700">Intelligence Engine</p>
                </div>
            </div>
            <div class="space-y-2.5">
                ${insights.map(ins => `
                <div class="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:shadow-md transition-all duration-300 group">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br ${colorMap[ins.color] || colorMap.violet} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <i data-lucide="${ins.icon}" class="w-4 h-4 text-white"></i>
                    </div>
                    <div>
                        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">${ins.title}</p>
                        <p class="text-[11px] text-slate-600 leading-relaxed">${ins.text}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>`;
    }

    // ── Close wrappers ───────────────────────────────────────────────
    html += `</div></div>`;

    // ── Inject into viewport ─────────────────────────────────────────
    document.getElementById('view-port').innerHTML = html;
    app.refreshIcons();

    // ── Render charts ────────────────────────────────────────────────
    if (tab === 'overview') {
        setTimeout(() => {
            app.renderAnalyticsLabTrendChart(filtered, selectedFYs);
            app.renderAnalyticsLabBrandChart(filtered, selectedFYs);
        }, 50);
    } else if (tab === 'territory') {
        setTimeout(() => {
            app.renderAnalyticsLabTerrChart(filtered, selectedFYs);
        }, 50);
    } else if (tab === 'models') {
        setTimeout(() => {
            app.renderAnalyticsLabModelCharts(filtered, selectedFYs);
        }, 50);
    } else if (tab === 'seasonality') {
        setTimeout(() => {
            app.renderAnalyticsLabRadarChart(filtered, selectedFYs);
        }, 50);
    }
},

// ══════════════════════════════════════════════════════════════════════
// CHART: Multi-Year Trend (Line)
// ══════════════════════════════════════════════════════════════════════
renderAnalyticsLabTrendChart: (filteredSales, selectedFYs) => {
    const canvas = document.getElementById('analyticsLabTrendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    app._analyticsLabCharts = app._analyticsLabCharts || {};
    if (app._analyticsLabCharts.trend) { app._analyticsLabCharts.trend.destroy(); app._analyticsLabCharts.trend = null; }

    const MONTHS = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
    const SHORT  = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const colors = app._alColors;
    const isCumulative = app.analyticsLabChartMode === 'cumulative';

    const datasets = selectedFYs.map((fy, i) => {
        const monthlyVals = MONTHS.map(m =>
            filteredSales.filter(s => s.fy === fy && s.sales_month === m).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0)
        );
        const data = isCumulative ? monthlyVals.reduce((acc, v) => { acc.push((acc.length ? acc[acc.length - 1] : 0) + v); return acc; }, []) : monthlyVals;
        const color = colors[i % colors.length];

        return {
            label: `FY ${fy}`,
            data: data,
            borderColor: color,
            backgroundColor: color + '18',
            borderWidth: 2.5,
            tension: 0.4,
            fill: i === 0,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBorderWidth: 3
        };
    });

    app._analyticsLabCharts.trend = new Chart(ctx, {
        type: 'line',
        data: { labels: SHORT, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            animation: { duration: 900, easing: 'easeOutQuart' },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 16, font: { family: 'Inter', size: 10, weight: '600' } } },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Inter', weight: '700', size: 11 }, bodyFont: { family: 'Inter', size: 11 },
                    padding: 12, cornerRadius: 12, borderColor: 'rgba(139,92,246,0.3)', borderWidth: 1,
                    callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} units` }
                }
            },
            scales: {
                y: { border: { display: false }, grid: { color: 'rgba(148,163,184,0.1)', borderDash: [4, 4] }, beginAtZero: true, ticks: { font: { family: 'Inter', size: 9, weight: '600' }, color: '#94a3b8' } },
                x: { border: { display: false }, grid: { display: false }, ticks: { font: { family: 'Inter', size: 9, weight: '600' }, color: '#94a3b8' } }
            }
        }
    });
},

// ══════════════════════════════════════════════════════════════════════
// CHART: Brand Comparison (Grouped Bar)
// ══════════════════════════════════════════════════════════════════════
renderAnalyticsLabBrandChart: (filteredSales, selectedFYs) => {
    const canvas = document.getElementById('analyticsLabBrandChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    app._analyticsLabCharts = app._analyticsLabCharts || {};
    if (app._analyticsLabCharts.brand) { app._analyticsLabCharts.brand.destroy(); app._analyticsLabCharts.brand = null; }

    const brands = [...new Set(DB.sales.map(s => s.brand))].filter(Boolean).sort();
    const brandColors = { 'Foton': '#041A54', 'Mahindra': '#E5223E' };
    const brandColorsLight = { 'Foton': 'rgba(4,26,84,0.75)', 'Mahindra': 'rgba(229,34,62,0.75)' };

    const datasets = brands.map((brand, bi) => ({
        label: brand,
        data: selectedFYs.map(fy =>
            filteredSales.filter(s => s.fy === fy && s.brand === brand).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0)
        ),
        backgroundColor: brandColors[brand] || app._alColors[bi % app._alColors.length],
        hoverBackgroundColor: brandColorsLight[brand] || app._alColors[bi % app._alColors.length] + 'cc',
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7
    }));

    app._analyticsLabCharts.brand = new Chart(ctx, {
        type: 'bar',
        data: { labels: selectedFYs.map(f => `FY ${f}`), datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, padding: 16, font: { family: 'Inter', size: 10, weight: '600' } } },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Inter', weight: '700', size: 11 }, bodyFont: { family: 'Inter', size: 11 },
                    padding: 12, cornerRadius: 12,
                    callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} units` }
                }
            },
            scales: {
                y: { border: { display: false }, grid: { color: 'rgba(148,163,184,0.1)', borderDash: [4, 4] }, beginAtZero: true, ticks: { font: { family: 'Inter', size: 9, weight: '600' }, color: '#94a3b8' } },
                x: { border: { display: false }, grid: { display: false }, ticks: { font: { family: 'Inter', size: 9, weight: '600' }, color: '#94a3b8' } }
            }
        }
    });
},

// ══════════════════════════════════════════════════════════════════════
// CHART: Territory Rankings (Horizontal Bar)
// ══════════════════════════════════════════════════════════════════════
renderAnalyticsLabTerrChart: (filteredSales, selectedFYs) => {
    const canvas = document.getElementById('analyticsLabTerrChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    app._analyticsLabCharts = app._analyticsLabCharts || {};
    if (app._analyticsLabCharts.territory) { app._analyticsLabCharts.territory.destroy(); app._analyticsLabCharts.territory = null; }

    const territories = DB.territories || [];
    const colors = app._alColors;

    // Sort territories by total across all selected FYs (descending)
    const terrTotals = territories.map(t => ({
        ...t,
        total: filteredSales.filter(s => selectedFYs.includes(s.fy) && s.territory_id === t.id).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0)
    })).sort((a, b) => b.total - a.total);

    const datasets = selectedFYs.map((fy, i) => ({
        label: `FY ${fy}`,
        data: terrTotals.map(t =>
            filteredSales.filter(s => s.fy === fy && s.territory_id === t.id).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0)
        ),
        backgroundColor: colors[i % colors.length] + 'cc',
        hoverBackgroundColor: colors[i % colors.length],
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8
    }));

    app._analyticsLabCharts.territory = new Chart(ctx, {
        type: 'bar',
        data: { labels: terrTotals.map(t => t.name), datasets },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeOutQuart' },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, padding: 16, font: { family: 'Inter', size: 10, weight: '600' } } },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Inter', weight: '700', size: 11 }, bodyFont: { family: 'Inter', size: 11 },
                    padding: 12, cornerRadius: 12,
                    callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.x.toLocaleString()} units` }
                }
            },
            scales: {
                x: { border: { display: false }, grid: { color: 'rgba(148,163,184,0.08)', borderDash: [4, 4] }, beginAtZero: true, ticks: { font: { family: 'Inter', size: 9, weight: '600' }, color: '#94a3b8' } },
                y: { border: { display: false }, grid: { display: false }, ticks: { font: { family: 'Inter', size: 10, weight: '600' }, color: '#334155' } }
            }
        }
    });
},

// ══════════════════════════════════════════════════════════════════════
// CHART: Model Mix Donuts
// ══════════════════════════════════════════════════════════════════════
renderAnalyticsLabModelCharts: (filteredSales, selectedFYs) => {
    app._analyticsLabCharts = app._analyticsLabCharts || {};
    // Destroy previous donut chart instances
    selectedFYs.forEach((fy, i) => {
        const key = `model_${i}`;
        if (app._analyticsLabCharts[key]) { app._analyticsLabCharts[key].destroy(); app._analyticsLabCharts[key] = null; }
    });
    // Also clean up any extra old instances beyond current count
    Object.keys(app._analyticsLabCharts).forEach(k => {
        if (k.startsWith('model_')) {
            const idx = parseInt(k.split('_')[1]);
            if (idx >= selectedFYs.length && app._analyticsLabCharts[k]) {
                app._analyticsLabCharts[k].destroy();
                delete app._analyticsLabCharts[k];
            }
        }
    });

    const donutColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#a855f7', '#22d3ee'];

    selectedFYs.forEach((fy, i) => {
        const canvas = document.getElementById(`analyticsLabModelChart_${i}`);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const fyData = filteredSales.filter(s => s.fy === fy);
        const modelMap = {};
        fyData.forEach(s => {
            if (!s.model) return;
            modelMap[s.model] = (modelMap[s.model] || 0) + (Number(s.unit_qty) || 0);
        });

        const sortedEntries = Object.entries(modelMap).sort((a, b) => b[1] - a[1]);
        const labels = sortedEntries.map(e => e[0]);
        const data = sortedEntries.map(e => e[1]);
        const bgColors = labels.map((_, idx) => donutColors[idx % donutColors.length]);

        app._analyticsLabCharts[`model_${i}`] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: bgColors,
                    hoverBackgroundColor: bgColors.map(c => c + 'dd'),
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '62%',
                animation: { animateRotate: true, duration: 900, easing: 'easeOutQuart' },
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 8, font: { family: 'Inter', size: 9, weight: '600' }, color: '#64748b' } },
                    tooltip: {
                        backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Inter', weight: '700', size: 11 }, bodyFont: { family: 'Inter', size: 11 },
                        padding: 12, cornerRadius: 12,
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, v) => a + v, 0);
                                const pct = total > 0 ? (ctx.parsed / total * 100).toFixed(1) : 0;
                                return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    });
},

// ══════════════════════════════════════════════════════════════════════
// CHART: Radar — Seasonal Fingerprint
// ══════════════════════════════════════════════════════════════════════
renderAnalyticsLabRadarChart: (filteredSales, selectedFYs) => {
    const canvas = document.getElementById('analyticsLabRadarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    app._analyticsLabCharts = app._analyticsLabCharts || {};
    if (app._analyticsLabCharts.radar) { app._analyticsLabCharts.radar.destroy(); app._analyticsLabCharts.radar = null; }

    const MONTHS = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
    const SHORT  = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const colors = app._alColors;

    const datasets = selectedFYs.map((fy, i) => {
        const data = MONTHS.map(m =>
            filteredSales.filter(s => s.fy === fy && s.sales_month === m).reduce((a, s) => a + (Number(s.unit_qty) || 0), 0)
        );
        const color = colors[i % colors.length];
        return {
            label: `FY ${fy}`,
            data,
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointBorderWidth: 1.5,
            pointRadius: 3.5,
            pointHoverRadius: 6,
            fill: true
        };
    });

    app._analyticsLabCharts.radar = new Chart(ctx, {
        type: 'radar',
        data: { labels: SHORT, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeOutQuart' },
            scales: {
                r: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148,163,184,0.12)' },
                    angleLines: { color: 'rgba(148,163,184,0.12)' },
                    pointLabels: { font: { family: 'Inter', size: 10, weight: '600' }, color: '#475569' },
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 16, font: { family: 'Inter', size: 10, weight: '600' } } },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Inter', weight: '700', size: 11 }, bodyFont: { family: 'Inter', size: 11 },
                    padding: 12, cornerRadius: 12,
                    callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.r.toLocaleString()} units` }
                }
            }
        }
    });
},
