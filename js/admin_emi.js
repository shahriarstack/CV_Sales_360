// --- Sales360 Module: admin_emi.js ---
window.app = window.app || {};

window.app.openCaptureEMIModal = () => {
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm';
                modal.innerHTML = `
                    <div class="bg-white rounded-2xl shadow-2xl p-6 w-[350px] animate-fade-in-up">
                        <h3 class="text-lg font-black text-slate-800 mb-4">Export EMI Report</h3>
                        <p class="text-xs text-slate-500 mb-4">Select the brand data you want to capture.</p>
                        <div class="space-y-3">
                            <button onclick="app.captureEMIReport('ALL'); this.closest('.fixed').remove()" class="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition-colors">All Brands</button>
                            <button onclick="app.captureEMIReport('Foton'); this.closest('.fixed').remove()" class="w-full px-4 py-3 bg-sky-50 hover:bg-sky-100 text-sky-700 text-sm font-bold rounded-xl transition-colors border border-sky-200">Only Foton</button>
                            <button onclick="app.captureEMIReport('Mahindra'); this.closest('.fixed').remove()" class="w-full px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold rounded-xl transition-colors border border-rose-200">Only Mahindra</button>
                            <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 mt-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">Cancel</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            };

window.app.captureEMIReport = async (brandFilter = 'ALL') => {
                app.showLoader('Generating EMI Report...');

                try {
                    // 1. Await document.fonts.ready before html2canvas render
                    if (document.fonts && document.fonts.ready) {
                        await document.fonts.ready;
                    }

                    const emiData = (DB.emi || []).filter(e => {
                        const instNo = e.installment_no;
                        const matchInst = instNo === null || instNo === undefined || instNo === '' || Number(instNo) === 1 || Number(instNo) === 2;
                        if (!matchInst) return false;
                        if (brandFilter !== 'ALL' && e.brand !== brandFilter) return false;
                        return true;
                    });

                    const territorySummary = (DB.territories || []).map(t => {
                        const tEmi = emiData.filter(e => e.territory_id === t.id);
                        const totalCust = tEmi.length;
                        const payingCust = tEmi.filter(e => Number(e.collected || 0) > 0).length;
                        const nonPayingCust = totalCust - payingCust;
                        const tTotalDue = tEmi.reduce((sum, e) => sum + Number(e.installment || 0), 0);
                        const tAmountCol = tEmi.reduce((sum, e) => sum + Number(e.collected || 0), 0);
                        const tColRate = tTotalDue > 0 ? Math.round((tAmountCol / tTotalDue) * 100) : 0;
                        return { name: t.name, totalCust, payingCust, nonPayingCust, tTotalDue, tAmountCol, tColRate };
                    }).filter(t => t.totalCust > 0).sort((a, b) => b.tColRate - a.tColRate || a.name.localeCompare(b.name));

                    const grandCust = territorySummary.reduce((s, t) => s + t.totalCust, 0);
                    const grandPaying = territorySummary.reduce((s, t) => s + t.payingCust, 0);
                    const grandNonPaying = territorySummary.reduce((s, t) => s + t.nonPayingCust, 0);
                    const grandDue = territorySummary.reduce((s, t) => s + t.tTotalDue, 0);
                    const grandCol = territorySummary.reduce((s, t) => s + t.tAmountCol, 0);
                    const grandRate = grandDue > 0 ? Math.round((grandCol / grandDue) * 100) : 0;

                    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

                    // Print/Export Page Styles: padding: 6px; line-height: 1.2; font-size: 11px
                    const cs = (clr, align, extra) =>
                        `font-size:12px;line-height:1.2;color:${clr};padding:10px 8px;vertical-align:middle;text-align:${align||'center'};border-bottom:1px solid #e2e8f0;${extra||''}`;

                    const tableRowsHTML = territorySummary.map((t, i) => {
                        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
                        const rc = t.tColRate >= 80 ? '#15803d' : (t.tColRate >= 50 ? '#b45309' : '#b91c1c');
                        const rBg = t.tColRate >= 80 ? '#dcfce7' : (t.tColRate >= 50 ? '#fef3c7' : '#fee2e2');
                        return `<tr style="background:${bg};">
                            <td style="${cs('#0f172a','left','padding-left:10px;font-weight:700;')}"><span style="color:#94a3b8;font-weight:500;font-size:11px;">${(i+1).toString().padStart(2,'0')}. </span>${t.name}</td>
                            <td style="${cs('#334155','center','font-weight:600;')}">${t.totalCust}</td>
                            <td style="${cs('#15803d','center','font-weight:700;')}">${t.payingCust}</td>
                            <td style="${cs('#dc2626','center','font-weight:700;')}">${t.nonPayingCust}</td>
                            <td style="${cs('#475569','right','padding-right:10px;font-weight:600;')}">${app.formatCurrency(t.tTotalDue).replace('৳','')}</td>
                            <td style="${cs('#2563eb','right','padding-right:10px;font-weight:700;')}">${app.formatCurrency(t.tAmountCol).replace('৳','')}</td>
                            <td style="${cs('#0f172a','center','font-weight:800;')}">
                                <span style="display:inline-block;background:${rBg};color:${rc};padding:2px 6px;border-radius:4px;font-size:10.5px;line-height:1.2;font-weight:800;">${t.tColRate}%</span>
                            </td>
                        </tr>`;
                    }).join('');

                    const totalRowHTML = `<tr style="background:#0f172a;">
                        <td style="${cs('#ffffff','left','padding-left:10px;font-weight:800;letter-spacing:0.5px;')}">GRAND TOTAL</td>
                        <td style="${cs('#f1f5f9','center','font-weight:700;')}">${grandCust}</td>
                        <td style="${cs('#4ade80','center','font-weight:800;')}">${grandPaying}</td>
                        <td style="${cs('#f87171','center','font-weight:800;')}">${grandNonPaying}</td>
                        <td style="${cs('#f1f5f9','right','padding-right:10px;font-weight:700;')}">${app.formatCurrency(grandDue).replace('৳','')}</td>
                        <td style="${cs('#60a5fa','right','padding-right:10px;font-weight:800;')}">${app.formatCurrency(grandCol).replace('৳','')}</td>
                        <td style="${cs('#fbbf24','center','font-weight:900;')}">${grandRate}%</td>
                    </tr>`;

                    // Off-screen container without fixed height or CSS transform scaling (height: auto)
                    const container = document.createElement('div');
                    container.id = 'emi-report-capture';
                    container.style.cssText = "position:absolute;left:-9999px;top:0;width:794px;min-height:1123px;height:auto;transform:none;zoom:1;z-index:99999;background:#ffffff;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;";

                    container.innerHTML = `
                    <div style="width:794px;height:auto;background:#ffffff;padding:24px 28px;box-sizing:border-box;display:flex;flex-direction:column;position:relative;">
                        <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg, #0f172a, #2563eb, #06b6d4, #10b981);"></div>

                        <!-- Header Row -->
                        <table style="width:100%; margin-bottom:14px; border:none; table-layout:fixed;">
                            <tr>
                                <td style="text-align:left; vertical-align:top; border:none; padding:0;">
                                    <div style="display:inline-block; vertical-align:middle; background:#0f172a; color:#ffffff; font-size:8.5px; font-weight:900; padding:3px 8px; border-radius:4px; letter-spacing:1px; text-transform:uppercase; margin-right:6px; margin-bottom:4px;">ACI MOTORS</div>
                                    <div style="display:inline-block; vertical-align:middle; color:#64748b; font-size:8.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px;">Commercial Vehicle Division</div>
                                    <h1 style="font-size:17px; font-weight:900; color:#0f172a; letter-spacing:-0.4px; margin:0; line-height:1.2;">1st &amp; 2nd EMI Collection Performance</h1>
                                    <div style="font-size:9px; color:#64748b; margin-top:3px; font-weight:600;">Report Generated On: <b style="color:#1e293b;">${today}</b></div>
                                </td>
                                <td style="text-align:right; vertical-align:top; border:none; padding:0; width:220px;">
                                    <div style="background:#f1f5f9; border:1px solid #cbd5e1; padding:6px 12px; border-radius:6px; display:inline-block; text-align:right;">
                                        <div style="font-size:9.5px; font-weight:900; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">Global Analytics<br>${brandFilter === 'ALL' ? 'Foton + Mahindra' : 'Only ' + brandFilter}</div>
                                        <div style="font-size:8px; color:#64748b; font-weight:700;">Executive Performance Summary</div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        </div>
                        <!-- Table Label -->
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:5px;margin-bottom:8px;border-bottom:1.5px solid #cbd5e1;">
                            <span style="font-size:9px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">Territory Performance Ranking</span>
                            <span style="font-size:8.5px;font-weight:700;color:#64748b;">Currency in BDT (৳)</span>
                        </div>

                        <!-- Table Content -->
                        <div>
                            <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
                                <thead>
                                    <tr style="background:#0f172a;color:#ffffff;">
                                        <th style="font-size:12px;font-weight:800;padding:10px 12px;text-align:left;vertical-align:middle;text-transform:uppercase;letter-spacing:0.4px;line-height:1.2;">Sales Territory</th>
                                        <th style="font-size:12px;font-weight:800;padding:10px 8px;text-align:center;vertical-align:middle;text-transform:uppercase;letter-spacing:0.4px;line-height:1.2;">Total</th>
                                        <th style="font-size:12px;font-weight:800;padding:10px 8px;text-align:center;vertical-align:middle;text-transform:uppercase;letter-spacing:0.4px;color:#4ade80;line-height:1.2;">Paying</th>
                                        <th style="font-size:12px;font-weight:800;padding:10px 8px;text-align:center;vertical-align:middle;text-transform:uppercase;letter-spacing:0.4px;color:#f87171;line-height:1.2;">Unpaid</th>
                                        <th style="font-size:12px;font-weight:800;padding:10px 12px;text-align:right;vertical-align:middle;text-transform:uppercase;letter-spacing:0.4px;line-height:1.2;">Due (Inst)</th>
                                        <th style="font-size:12px;font-weight:800;padding:10px 12px;text-align:right;vertical-align:middle;text-transform:uppercase;letter-spacing:0.4px;color:#60a5fa;line-height:1.2;">Collected</th>
                                        <th style="font-size:12px;font-weight:800;padding:10px 8px;text-align:center;vertical-align:middle;text-transform:uppercase;letter-spacing:0.4px;line-height:1.2;">Rate %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRowsHTML}
                                    ${totalRowHTML}
                                </tbody>
                            </table>
                        </div>

                        <!-- Footer -->
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:8px;color:#94a3b8;font-weight:600;line-height:1.2;">
                            <span>Sales360 System | ACI Motors Limited © ${new Date().getFullYear()}</span>
                            <span>Executive Performance Report</span>
                        </div>
                    </div>
                    `;

                    document.body.appendChild(container);

                    await new Promise(r => setTimeout(r, 250));

                    // Scale Canvas via Options (Not CSS)
                    const scale = Math.max(2, window.devicePixelRatio || 2);
                    const canvas = await html2canvas(container, {
                        scale: scale,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        width: 794, height: container.scrollHeight, windowHeight: container.scrollHeight,
                        windowWidth: 794
                    });

                    const link = document.createElement('a');
                    link.download = `EMI_Collection_Status_${new Date().toISOString().slice(0,10)}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    app.showToast('EMI report captured successfully!', 'success');
                } catch (err) {
                    console.error('EMI report capture failed:', err);
                    app.showToast('Failed to capture report. Please try again.', 'error');
                } finally {
                    const c = document.getElementById('emi-report-capture');
                    if (c && c.parentNode) c.parentNode.removeChild(c);
                    app.hideLoader();
                }
            };

window.app.renderAdminEMI = () => {
                localStorage.setItem('aci_last_page', 'emi');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                const isAM = app.currentUser.role === 'am';
                app.adminEMIBrandFilter = app.adminEMIBrandFilter || 'Total';
                app.adminEMITerritoryFilter = app.adminEMITerritoryFilter || 'All';

                let emiData = DB.emi;
                if (isAM) {
                    emiData = DB.emi.filter(e => app.currentUser.territories.includes(e.territory_id));
                }

                // Apply Brand Filter
                if (app.adminEMIBrandFilter !== 'Total') {
                    emiData = emiData.filter(e => e.brand === app.adminEMIBrandFilter);
                }

                // Apply Territory Filter
                if (app.adminEMITerritoryFilter !== 'All') {
                    emiData = emiData.filter(e => e.territory_id === app.adminEMITerritoryFilter);
                }

                // --- Dashboard KPI Calculations ---
                const totalCust = emiData.length;
                const paidCust = emiData.filter(e => Number(e.collected || 0) > 0).length;
                const unpaidCust = totalCust - paidCust;
                const paidCustPercent = totalCust > 0 ? Math.round((paidCust / totalCust) * 100) : 0;

                const totalInstallment = emiData.reduce((sum, e) => sum + Number(e.installment || 0), 0);
                const totalCol = emiData.reduce((sum, e) => sum + Number(e.collected || 0), 0);
                const collectionRate = totalInstallment > 0 ? Math.round((totalCol / totalInstallment) * 100) : 0;

                // Progress Bar Calculations
                const overallTotalDue = emiData.reduce((sum, e) => sum + (Number(e.installment || 0) + Number(e.overdue_total || 0)), 0);
                const overallTotalCollected = totalCol;
                const collectionProgressPercent = overallTotalDue > 0 ? Math.round((overallTotalCollected / overallTotalDue) * 100) : 0;

                const collectedCust = paidCust; // Since any payment counts as collected
                const custProgressPercent = totalCust > 0 ? Math.round((collectedCust / totalCust) * 100) : 0;
                const partialPaidCust = emiData.filter(e => Number(e.collected || 0) > 0 && Number(e.collected || 0) < Number(e.installment || 0)).length;

                // Aggregate Territory Summary Table
                const territorySummary = DB.territories.map(t => {
                    const tEmi = emiData.filter(e => e.territory_id === t.id);
                    if (tEmi.length === 0) return null;
                    const totalCust = tEmi.length;
                    const payingCust = tEmi.filter(e => Number(e.collected || 0) > 0).length;
                    const nonPayingCust = totalCust - payingCust;
                    const tTotalDue = tEmi.reduce((sum, e) => sum + Number(e.installment || 0), 0); // Amount Due (inst)
                    const tAmountCol = tEmi.reduce((sum, e) => sum + Number(e.collected || 0), 0);
                    const tColRate = tTotalDue > 0 ? Math.round((tAmountCol / tTotalDue) * 100) : 0;
                    return { name: t.name, totalCust, payingCust, nonPayingCust, tTotalDue, tAmountCol, tColRate };
                }).filter(Boolean).sort((a, b) => b.tColRate - a.tColRate);

                // Populate active territories dropdown
                const activeTerritories = DB.territories.filter(t => {
                    if (isAM) return app.currentUser.territories.includes(t.id);
                    return DB.emi.some(e => e.territory_id === t.id);
                });

                const activeBrand = app.adminEMIBrandFilter || 'Total';
                const html = `
                    <div class="w-full fade-in">
                        <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight">${isAM ? 'Area EMI Summary' : 'Global EMI Analytics'}</h1></div>
                                <p class="text-sm text-slate-500">Overdue collection monitoring and performance tracking</p>
                            </div>
                            
                            <div class="flex flex-wrap items-center gap-3">
                                <!-- Territory Dropdown Filter -->
                                <div class="relative group">
                                    <select onchange="app.setAdminEMITerritoryFilter(this.value)" class="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-black focus:outline-none focus:border-aci-blue appearance-none pr-8 cursor-pointer shadow-sm text-slate-700" style="min-height: 38px;">
                                        <option value="All" ${app.adminEMITerritoryFilter === 'All' ? 'selected' : ''}>All Territories</option>
                                        ${activeTerritories.map(t => `<option value="${t.id}" ${app.adminEMITerritoryFilter === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                                    </select>
                                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-aci-blue transition-colors">
                                        <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
                                    </div>
                                </div>

                                <!-- Premium Brand Selection Pill -->
                                <div class="flex items-center gap-1.5 bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
                                    <button onclick="app.setAdminEMIBrandFilter('Total')" class="px-4 py-2 rounded-xl text-xs font-black transition-all ${activeBrand === 'Total' ? 'bg-white text-slate-800 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}" style="min-height: 38px;">
                                        Total
                                    </button>
                                    <button onclick="app.setAdminEMIBrandFilter('Foton')" class="px-4 py-2 rounded-xl transition-all flex items-center justify-center border-2 ${activeBrand === 'Foton' ? 'bg-blue-50/80 border-aci-blue shadow-md scale-[1.02] bg-white' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'}" title="Foton Analytics" style="min-height: 38px;">
                                        <img src="https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png" class="h-4 object-contain">
                                    </button>
                                    <button onclick="app.setAdminEMIBrandFilter('Mahindra')" class="px-4 py-2 rounded-xl transition-all flex items-center justify-center border-2 ${activeBrand === 'Mahindra' ? 'bg-rose-50/80 border-red-500 shadow-md scale-[1.02] bg-white' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'}" title="Mahindra Analytics" style="min-height: 38px;">
                                        <img src="https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png" class="h-4 object-contain">
                                    </button>
                                </div>

                                <!-- Capture Report Button -->
                                <button onclick="app.openCaptureEMIModal()" class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-black hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95" style="min-height: 38px;" title="Capture EMI Report as PNG">
                                    <i data-lucide="camera" class="w-3.5 h-3.5"></i>
                                    Capture
                                </button>
                            </div>
                        </div>

                        <!-- Progress Analytics Panel (Compact & Sleek) -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <!-- Card 1: Credit Collection Progress -->
                            <div class="bg-white/90 backdrop-blur-md rounded-xl shadow-xs border border-slate-200 p-3.5 relative overflow-hidden">
                                <div class="flex justify-between items-center mb-2">
                                    <div class="flex items-center gap-2">
                                        <div class="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><i data-lucide="wallet" class="w-3.5 h-3.5"></i></div>
                                        <div>
                                            <h4 class="text-xs font-black uppercase text-slate-700 tracking-wider">Credit Collection</h4>
                                            <p class="text-[9.5px] text-slate-400 font-medium">Total Due vs Collection</p>
                                        </div>
                                    </div>
                                    <span class="text-xs font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">${collectionProgressPercent}%</span>
                                </div>
                                
                                <div class="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
                                    <div class="bg-gradient-to-r from-indigo-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out" style="width: ${collectionProgressPercent}%"></div>
                                </div>
                                
                                <div class="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                                    <span>Collected: <span class="text-emerald-600 font-black">${app.formatCurrency(overallTotalCollected)}</span></span>
                                    <span>Total Due: <span class="text-slate-800 font-black">${app.formatCurrency(overallTotalDue)}</span></span>
                                </div>
                            </div>
                            
                            <!-- Card 2: File Coverage Progress -->
                            <div class="bg-white/90 backdrop-blur-md rounded-xl shadow-xs border border-slate-200 p-3.5 relative overflow-hidden">
                                <div class="flex justify-between items-center mb-2">
                                    <div class="flex items-center gap-2">
                                        <div class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><i data-lucide="users" class="w-3.5 h-3.5"></i></div>
                                        <div>
                                            <h4 class="text-xs font-black uppercase text-slate-700 tracking-wider">File Coverage</h4>
                                            <p class="text-[9.5px] text-slate-400 font-medium">Total vs Paying Accounts</p>
                                        </div>
                                    </div>
                                    <span class="text-xs font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">${custProgressPercent}%</span>
                                </div>
                                
                                <div class="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
                                    <div class="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500 ease-out" style="width: ${custProgressPercent}%"></div>
                                </div>
                                
                                <div class="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                                    <span>Collected Files: <span class="text-slate-800 font-black">${collectedCust}</span> / <span class="text-slate-600 font-bold">${totalCust}</span></span>
                                    ${partialPaidCust > 0 ? `<span class="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[9.5px] font-extrabold border border-amber-100 flex items-center gap-1"><span class="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse"></span> Partial: ${partialPaidCust}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Ultra Compact Creative KPI Cards Grid -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
                            <!-- Total Cust -->
                            <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-xl shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                                <div class="h-0.5 w-full bg-blue-500 absolute top-0 left-0"></div>
                                <div class="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                    <span>Total Cust</span>
                                    <i data-lucide="users" class="w-3.5 h-3.5 text-blue-500"></i>
                                </div>
                                <div class="text-base font-black text-slate-800 tracking-tight">${totalCust}</div>
                            </div>

                            <!-- Paid Cust -->
                            <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-xl shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                                <div class="h-0.5 w-full bg-emerald-500 absolute top-0 left-0"></div>
                                <div class="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                    <span>Paid Cust</span>
                                    <i data-lucide="user-check" class="w-3.5 h-3.5 text-emerald-500"></i>
                                </div>
                                <div class="text-base font-black text-emerald-700 tracking-tight">${paidCust}</div>
                            </div>

                            <!-- Unpaid Cust -->
                            <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-xl shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                                <div class="h-0.5 w-full bg-rose-500 absolute top-0 left-0"></div>
                                <div class="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                    <span>Unpaid Cust</span>
                                    <i data-lucide="user-x" class="w-3.5 h-3.5 text-rose-500"></i>
                                </div>
                                <div class="text-base font-black text-rose-700 tracking-tight">${unpaidCust}</div>
                            </div>

                            <!-- Paid % -->
                            <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-xl shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                                <div class="h-0.5 w-full bg-teal-500 absolute top-0 left-0"></div>
                                <div class="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                    <span>Paid %</span>
                                    <i data-lucide="pie-chart" class="w-3.5 h-3.5 text-teal-500"></i>
                                </div>
                                <div class="text-base font-black text-teal-700 tracking-tight">${paidCustPercent}%</div>
                            </div>

                            <!-- Inst Amt -->
                            <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-xl shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                                <div class="h-0.5 w-full bg-indigo-500 absolute top-0 left-0"></div>
                                <div class="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                    <span>Inst Amt</span>
                                    <i data-lucide="wallet" class="w-3.5 h-3.5 text-indigo-500"></i>
                                </div>
                                <div class="text-sm font-black text-indigo-700 tracking-tight truncate" title="${app.formatCurrency(totalInstallment)}">${app.formatCurrency(totalInstallment)}</div>
                            </div>

                            <!-- Collected -->
                            <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-xl shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                                <div class="h-0.5 w-full bg-cyan-500 absolute top-0 left-0"></div>
                                <div class="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                    <span>Collected</span>
                                    <i data-lucide="coins" class="w-3.5 h-3.5 text-cyan-500"></i>
                                </div>
                                <div class="text-sm font-black text-cyan-700 tracking-tight truncate" title="${app.formatCurrency(totalCol)}">${app.formatCurrency(totalCol)}</div>
                            </div>

                            <!-- Collect % -->
                            <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-xl shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                                <div class="h-0.5 w-full bg-amber-500 absolute top-0 left-0"></div>
                                <div class="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                    <span>Collect %</span>
                                    <i data-lucide="trending-up" class="w-3.5 h-3.5 text-amber-500"></i>
                                </div>
                                <div class="text-base font-black text-amber-700 tracking-tight">${collectionRate}%</div>
                            </div>
                        </div>

                        <!-- Territory Summary Table -->
                        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto mb-6">
                            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 class="font-bold text-slate-800 text-sm">Territory Wise EMI Summary</h3>
                            </div>
                            <table class="w-full text-left text-[11px] whitespace-nowrap">
                                <thead class="border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-widest bg-slate-100/50">
                                    <tr>
                                        <th class="px-6 py-1.5 font-bold">Sales Territory</th>
                                        <th class="px-4 py-1.5 font-bold text-center">Total Customers</th>
                                        <th class="px-4 py-1.5 font-bold text-center text-green-600">Paying Customers</th>
                                        <th class="px-4 py-1.5 font-bold text-center text-red-500">Non-Paying Customers</th>
                                        <th class="px-4 py-1.5 font-bold text-right">Total Due (Inst)</th>
                                        <th class="px-4 py-1.5 font-bold text-right">Amount Collected</th>
                                        <th class="px-6 py-1.5 font-bold text-center">Collection Rate %</th>
                                    </tr>
                                    <tr class="bg-slate-50/80">
                                        <th class="px-6 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Filter Territory..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-4 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Total Cust..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal text-center shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-4 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Paying..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal text-center shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-4 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Unpaid..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal text-center shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-4 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Due Amt..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal text-right shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-4 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Collected..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal text-right shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-6 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Rate..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal text-center shadow-inner placeholder-slate-300 transition-all"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${territorySummary.map(t => `
                                        <tr class="hover:bg-slate-50 transition-colors">
                                            <td class="px-6 py-1.5 font-bold text-slate-800">${t.name}</td>
                                            <td class="px-4 py-1.5 text-center font-semibold text-slate-700">${t.totalCust}</td>
                                            <td class="px-4 py-1.5 text-center font-bold text-green-600">${t.payingCust}</td>
                                            <td class="px-4 py-1.5 text-center font-bold text-red-500">${t.nonPayingCust}</td>
                                            <td class="px-4 py-1.5 text-right font-semibold text-slate-700">${app.formatCurrency(t.tTotalDue)}</td>
                                            <td class="px-4 py-1.5 text-right font-semibold text-aci-blue">${app.formatCurrency(t.tAmountCol)}</td>
                                            <td class="px-6 py-1.5 text-center">
                                                <span class="px-2 py-0.5 rounded text-[9px] font-bold ${t.tColRate >= 80 ? 'bg-green-100 text-green-700 border border-green-200' : (t.tColRate >= 50 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-red-100 text-red-700 border border-red-200')}">
                                                    ${t.tColRate}%
                                                </span>
                                            </td>
                                        </tr>
                                     `).join('')}
                                     ${territorySummary.length === 0 ? '<tr><td colspan="7" class="px-6 py-4 text-center text-slate-500">No territory data available.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>

                        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 class="font-bold text-slate-800 text-sm">Account Level Breakdown</h3>
                            </div>
                            <table class="w-full text-left text-[11px] whitespace-nowrap">
                                <thead class="border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-widest bg-slate-100/50">
                                    <tr>
                                        <th class="px-6 py-1.5 font-bold">Customer</th>
                                        <th class="px-6 py-1.5 font-bold">Territory</th>
                                        <th class="px-6 py-1.5 font-bold">EMI Size</th>
                                        <th class="px-6 py-1.5 font-bold">Total Due (EMI+Overdue)</th>
                                        <th class="px-6 py-1.5 font-bold">Collected</th>
                                        <th class="px-6 py-1.5 font-bold">Status</th>
                                        ${!isAM ? '<th class="px-6 py-1.5 font-bold text-right">Actions</th>' : ''}
                                    </tr>
                                    <tr class="bg-slate-50/80">
                                        <th class="px-6 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Filter Customer..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-6 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Filter Territory..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-6 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Filter EMI..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-6 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Filter Total Due..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-6 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Filter Collected..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        <th class="px-6 py-1.5"><input type="text" onkeyup="app.filterTableGroup(this)" placeholder="Filter Status..." class="w-full text-[10px] px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue bg-white font-normal shadow-inner placeholder-slate-300 transition-all"></th>
                                        ${!isAM ? '<th class="px-6 py-1.5"></th>' : ''}
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${emiData.map(e => {
                    const totalDue = Number(e.installment || 0) + Number(e.overdue_total || 0);
                    const isCleared = e.collected >= totalDue;
                    return `
                                        <tr class="hover:bg-slate-50 transition-colors">
                                            <td class="px-6 py-1.5">
                                                <div class="font-bold text-slate-800">${e.customer}</div>
                                                <div class="text-[10px] text-slate-500">${e.customer_code || 'N/A'}</div>
                                            </td>
                                            <td class="px-6 py-1.5 text-slate-600 text-xs">${DB.territories.find(t => t.id === e.territory_id)?.name || 'Unknown'}</td>
                                            <td class="px-6 py-1.5 text-slate-700 font-semibold">${app.formatCurrency(e.installment)}</td>
                                            <td class="px-6 py-1.5 text-red-600 font-semibold">${app.formatCurrency(totalDue)}</td>
                                            <td class="px-6 py-1.5 text-green-600 font-semibold">${app.formatCurrency(e.collected)}</td>
                                            <td class="px-6 py-1.5">
                                                ${isCleared
                            ? '<span class="text-green-600 text-[10px] font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded w-max border border-green-100"><i data-lucide="check-circle-2" class="w-3 h-3"></i> Cleared</span>'
                            : '<span class="text-amber-600 text-[10px] font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded w-max border border-amber-100"><i data-lucide="clock" class="w-3 h-3"></i> Pending</span>'
                        }
                                            </td>
                                            ${!isAM ? `
                                            <td class="px-6 py-1.5 text-right">
                                                <button onclick="app.openEditAdminEMIModal('${e.id}')" class="text-slate-400 hover:text-aci-blue hover:scale-110 active:scale-95 transition-all p-1 rounded-lg inline-flex items-center justify-center bg-slate-50 border border-slate-100 hover:border-aci-blue/20 hover:bg-aci-blue/5 tooltip" title="Edit Customer Details">
                                                    <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                                                </button>
                                            </td>
                                            ` : ''}
                                        </tr>
                                    `}).join('')}
                                    ${emiData.length === 0 ? `<tr><td colspan="${!isAM ? 7 : 6}" class="px-6 py-4 text-center text-slate-500">No EMI data found.</td></tr>` : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

