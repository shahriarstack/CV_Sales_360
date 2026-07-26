// --- Sales360 Module: pulse.js ---
window.app = window.app || {};

window.app.renderUserProfile = () => {
                const roleName = app.currentUser.role === 'am' ? 'AM' : (app.currentUser.role === 'admin' ? 'System Admin' : (app.currentUser.role === 'subadmin' ? 'Sub Admin' : 'MO'));
                const territoriesText = app.currentUser.territories && app.currentUser.territories.length > 0 ? app.currentUser.territories.map(tId => { const t = DB.territories.find(ter => ter.id === tId); return t ? t.name : tId; }).join(', ') : 'All Territories';
                
                if (!document.getElementById('user-manual-modal')) {
                    const modalHtml = `
                        <div id="user-manual-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4 opacity-0 transition-opacity duration-300">
                            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transform scale-95 transition-transform duration-300" id="user-manual-content">
                                <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <i data-lucide="book-open" class="w-5 h-5 text-aci-blue"></i>
                                        ব্যবহার নির্দেশিকা (User Manual)
                                    </h3>
                                    <button onclick="document.getElementById('user-manual-modal').classList.add('hidden'); document.getElementById('user-manual-modal').classList.remove('opacity-100'); document.getElementById('user-manual-content').classList.remove('scale-100'); document.getElementById('user-manual-content').classList.add('scale-95');" class="text-slate-400 hover:text-red-500 transition-colors">
                                        <i data-lucide="x" class="w-6 h-6"></i>
                                    </button>
                                </div>
                                <div class="p-6 overflow-y-auto">
                                    <div class="space-y-6">
                                        <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <h4 class="text-blue-800 font-bold mb-2">Sales360 অ্যাপে স্বাগতম!</h4>
                                            <p class="text-slate-600 text-sm leading-relaxed">এই অ্যাপটি বিশেষভাবে আমাদের এমও (MO) এবং এএম (AM) ভাইদের জন্য তৈরি করা হয়েছে। এর মাধ্যমে আপনারা আপনাদের দৈনন্দিন কাজ, সেলস টার্গেট, এচিভমেন্ট এবং কালেকশন খুব সহজেই একটি জায়গা থেকে পরিচালনা করতে পারবেন।</p>
                                        </div>

                                        <div class="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                            <div class="bg-slate-50 px-4 py-3 border-b border-slate-100">
                                                <h4 class="font-bold text-slate-800 flex items-center gap-2">
                                                    <i data-lucide="user" class="w-4 h-4 text-emerald-500"></i>
                                                    এমও (MO) - ব্যবহার ও সুবিধা
                                                </h4>
                                            </div>
                                            <div class="p-4 space-y-4">
                                                <div class="flex gap-3">
                                                    <div class="mt-1"><div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div></div>
                                                    <div>
                                                        <p class="text-sm font-bold text-slate-800">সহজ ড্যাশবোর্ড</p>
                                                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">আপনার নিজস্ব টেরিটরির টার্গেট এবং বর্তমান সেলস এর আপডেট এক নজরে দেখতে পারবেন। কোথায় আরও ফোকাস করতে হবে তা দ্রুত সিদ্ধান্ত নিতে পারবেন।</p>
                                                    </div>
                                                </div>
                                                <div class="flex gap-3">
                                                    <div class="mt-1"><div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div></div>
                                                    <div>
                                                        <p class="text-sm font-bold text-slate-800">পারফরম্যান্স পালস (Pulse)</p>
                                                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">গত বছরের (SPLY) এবং এই বছরের সেলস এর তুলনা দেখতে পারবেন। গ্রোথ এবং এচিভমেন্টের বিস্তারিত ডাটা পাবেন।</p>
                                                    </div>
                                                </div>
                                                <div class="flex gap-3">
                                                    <div class="mt-1"><div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div></div>
                                                    <div>
                                                        <p class="text-sm font-bold text-slate-800">ইএমআই (EMI) কালেকশন</p>
                                                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">যাদের কিস্তি বাকি আছে তাদের নামের তালিকা এবং বকেয়া এমাউন্ট দেখতে পারবেন। কালেকশন এন্ট্রি করা এখন আরও সহজ।</p>
                                                    </div>
                                                </div>
                                                <div class="flex gap-3">
                                                    <div class="mt-1"><div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div></div>
                                                    <div>
                                                        <p class="text-sm font-bold text-slate-800">TIV রিপোর্টিং</p>
                                                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">লোকাল মার্কেটের টোটাল ইন্ডাস্ট্রি ভলিউম বা মার্কেট সাইজ রিপোর্ট সাবমিট করা যায়।</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                            <div class="bg-slate-50 px-4 py-3 border-b border-slate-100">
                                                <h4 class="font-bold text-slate-800 flex items-center gap-2">
                                                    <i data-lucide="users" class="w-4 h-4 text-aci-gold"></i>
                                                    এএম (AM) - ব্যবহার ও সুবিধা
                                                </h4>
                                            </div>
                                            <div class="p-4 space-y-4">
                                                <div class="flex gap-3">
                                                    <div class="mt-1"><div class="w-2 h-2 rounded-full bg-aci-gold shadow-[0_0_8px_rgba(244,169,21,0.5)]"></div></div>
                                                    <div>
                                                        <p class="text-sm font-bold text-slate-800">এরিয়া মনিটরিং</p>
                                                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">আপনার আন্ডারে থাকা সকল টেরিটরির সার্বিক সেলস পরিস্থিতি একটি ড্যাশবোর্ডে দেখতে পারবেন।</p>
                                                    </div>
                                                </div>
                                                <div class="flex gap-3">
                                                    <div class="mt-1"><div class="w-2 h-2 rounded-full bg-aci-gold shadow-[0_0_8px_rgba(244,169,21,0.5)]"></div></div>
                                                    <div>
                                                        <p class="text-sm font-bold text-slate-800">ম্যাট্রিক্স এনালাইসিস</p>
                                                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">ব্র্যান্ড এবং সেলস টাইপ অনুযায়ী প্রতিটি টেরিটরির গ্রোথ এবং এচিভমেন্ট চেক করতে পারবেন।</p>
                                                    </div>
                                                </div>
                                                <div class="flex gap-3">
                                                    <div class="mt-1"><div class="w-2 h-2 rounded-full bg-aci-gold shadow-[0_0_8px_rgba(244,169,21,0.5)]"></div></div>
                                                    <div>
                                                        <p class="text-sm font-bold text-slate-800">কালেকশন ট্র্যাকিং</p>
                                                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">পুরো এরিয়ার টোটাল ইএমআই এবং রিকভারি স্ট্যাটাস ট্র্যাক করতে পারবেন এবং অফিসারদের পারফরম্যান্স ইভ্যালুয়েট করতে পারবেন।</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="bg-slate-800 rounded-xl p-4 text-center shadow-lg relative overflow-hidden">
                                            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                            <p class="text-white font-bold text-sm tracking-wide relative z-10">"সঠিক তথ্য, দ্রুত সিদ্ধান্ত - সফলতার মূলমন্ত্র"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    document.body.insertAdjacentHTML('beforeend', modalHtml);
                    app.refreshIcons();
                }

                const html = `
                    <div class="text-center pt-8 pb-4">
                        <div class="w-24 h-24 bg-aci-blue rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white mb-4 relative">
                            ${app.currentUser.name.charAt(0)}
                            <div class="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                        </div>
                        <h2 class="text-xl font-bold text-slate-800">${app.currentUser.name}</h2>
                        <span class="inline-block mt-2 bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium border border-slate-200">${roleName}</span>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-6">
                        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onclick="const m = document.getElementById('user-manual-modal'); const c = document.getElementById('user-manual-content'); m.classList.remove('hidden'); setTimeout(() => { m.classList.add('opacity-100'); c.classList.remove('scale-95'); c.classList.add('scale-100'); }, 10);">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <i data-lucide="book-open" class="w-4 h-4 text-indigo-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-indigo-900">User Manual</p>
                                    <p class="text-xs text-indigo-600/70">Click to view complete guide</p>
                                </div>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 text-indigo-300"></i>
                        </div>
                        <div class="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                            <i data-lucide="map" class="w-5 h-5 text-aci-blue"></i>
                            <div>
                                <p class="text-sm font-semibold text-slate-800">Assigned Territories</p>
                                <p class="text-xs text-slate-500">${territoriesText}</p>
                            </div>
                        </div>
                        <div class="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                            <i data-lucide="shield" class="w-5 h-5 text-aci-blue"></i>
                            <div>
                                <p class="text-sm font-semibold text-slate-800">Account Security</p>
                                <p class="text-xs text-slate-500">Change Password</p>
                            </div>
                        </div>
                        <div class="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                            <i data-lucide="help-circle" class="w-5 h-5 text-aci-blue"></i>
                            <div>
                                <p class="text-sm font-semibold text-slate-800">Help & Support</p>
                                <p class="text-xs text-slate-500">Contact Admin HQ</p>
                            </div>
                        </div>
                    </div>

                    <button onclick="app.logout()" class="w-full mt-8 bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 active:bg-red-200 transition-colors">
                        <i data-lucide="log-out" class="w-5 h-5"></i> Sign Out
                    </button>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
             };

window.app._renderPulseMatrixHTML = (assignedTerritoryIds) => {
                const currentFY = app.currentFY;
                const lastFY = (() => {
                    const parts = currentFY.split('-');
                    if (parts.length === 2) {
                        const y1 = parseInt(parts[0]);
                        const y2 = parseInt(parts[1]);
                        if (!isNaN(y1) && !isNaN(y2)) return `${y1-1}-${y2-1}`;
                    }
                    return '2024-25';
                })();
                const brand     = app.pmBrandTab    || 'Foton';
                const saleType  = app.pmSaleTypeTab || 'New Sale';

                const territories = DB.territories.filter(t => assignedTerritoryIds.includes(t.id));

                const fiscalMonths = ['July','August','September','October','November','December','January','February','March','April','May','June'];
                const quarters = {
                    Q1: ['July','August','September'],
                    Q2: ['October','November','December'],
                    Q3: ['January','February','March'],
                    Q4: ['April','May','June']
                };
                const ach     = (s, b) => b > 0 ? Math.round((s / b) * 100) : 0;
                const calcGrw = (s, sp) => sp > 0 ? Math.round(((s - sp) / sp) * 100) : (s > 0 ? 100 : 0);
                const fmtGrw  = (g) => g > 0 ? `<span class="text-emerald-600 font-black">+${g}%</span>` : (g < 0 ? `<span class="text-rose-500 font-black">${g}%</span>` : `<span class="text-slate-400 font-medium">0%</span>`);
                const fmtGrwText = (g) => g > 0 ? `+${g}%` : `${g}%`;

                const activeMonths = [];
                let foundCurrent = false;
                const cMonth = app.currentMonth || 'April';
                for (const m of fiscalMonths) {
                    activeMonths.push(m);
                    if (m === cMonth) {
                        foundCurrent = true;
                        break;
                    }
                }
                if (!foundCurrent) activeMonths.push(...fiscalMonths);


                // ── Metric sub-headers row (Bgt / Sal / Ach% / SPLY / Gr% × 16 blocks) ──
                const borderMap   = { Q1:'border-l-2 border-violet-200', Q2:'border-l-2 border-amber-200', Q3:'border-l-2 border-emerald-200', Q4:'border-l-2 border-cyan-200' };
                const qtBorderMap = { Q1:'border-l-2 border-violet-300 bg-violet-500/5', Q2:'border-l-2 border-amber-300 bg-amber-500/5', Q3:'border-l-2 border-emerald-300 bg-emerald-500/5', Q4:'border-l-2 border-cyan-300 bg-cyan-500/5' };
                let metricHeadersHTML = '';
                for (let i = 0; i < 16; i++) {
                    const isQTot = (i + 1) % 4 === 0;
                    const qName  = i < 4 ? 'Q1' : i < 8 ? 'Q2' : i < 12 ? 'Q3' : 'Q4';
                    let qBorder  = 'border-l border-slate-100';
                    if (i % 4 === 0) qBorder = borderMap[qName];
                    else if (isQTot) qBorder = qtBorderMap[qName];
                    ['Bgt','Sal','Ach%','SPLY','Gr%'].forEach((m, mIdx) => {
                        metricHeadersHTML += `<th class="px-1.5 py-1 ${mIdx === 0 ? qBorder : ''} ${isQTot ? 'bg-slate-100/30 font-extrabold' : ''} text-center">${m}</th>`;
                    });
                }

                // ── Per-territory rows & mobile cards ──
                let grandFYBudget = 0;
                const grandMonth   = {};
                const grandQuarter = {};
                fiscalMonths.forEach(m => { grandMonth[m]   = { budget:0, sales:0, sply:0 }; });
                ['Q1','Q2','Q3','Q4'].forEach(q => { grandQuarter[q] = { budget:0, sales:0, sply:0 }; });
                const hues = ['indigo','emerald','violet','amber','cyan','rose','sky','teal'];

                let mobileCardsHTML = '';

                const rowsHTML = territories.map((t, idx) => {
                    const tTargets      = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brand && tg.sale_type === saleType && tg.fy === currentFY);
                    const totalFYBudget = tTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0);
                    grandFYBudget += totalFYBudget;

                    const hasMonthlyTargets = tTargets.some(tg => tg.month && fiscalMonths.includes(tg.month));

                    const monthlyPerf = {};
                    fiscalMonths.forEach(m => {
                        const mTgts   = tTargets.filter(tg => tg.month === m);
                        let mBudget = 0;
                        if (mTgts.length > 0) {
                            mBudget = mTgts.reduce((s, tg) => s + Number(tg.target_qty || 0), 0);
                        } else if (!hasMonthlyTargets && totalFYBudget > 0) {
                            const base = Math.floor(totalFYBudget / 12);
                            const remainder = totalFYBudget % 12;
                            const mIdx = fiscalMonths.indexOf(m);
                            mBudget = base + (mIdx < remainder ? 1 : 0);
                        }
                        const mSales  = DB.sales.filter(s => s.territory_id === t.id && s.brand === brand && s.sale_type === saleType && s.fy === currentFY && s.sales_month === m).reduce((s, r) => s + Number(r.unit_qty || 0), 0);
                        const mSply   = DB.sales.filter(s => s.territory_id === t.id && s.brand === brand && s.sale_type === saleType && s.fy === lastFY  && s.sales_month === m).reduce((s, r) => s + Number(r.unit_qty || 0), 0);
                        monthlyPerf[m] = { budget:mBudget, sales:mSales, sply:mSply, ach:ach(mSales,mBudget), growth:calcGrw(mSales,mSply) };
                        grandMonth[m].budget += mBudget; grandMonth[m].sales += mSales; grandMonth[m].sply += mSply;
                    });

                    const quarterPerf = {};
                    Object.entries(quarters).forEach(([qName, qMs]) => {
                        const activeMs = qMs.filter(m => activeMonths.includes(m));
                        const qBudget = activeMs.reduce((s, m) => s + monthlyPerf[m].budget, 0);
                        const qSales  = activeMs.reduce((s, m) => s + monthlyPerf[m].sales,  0);
                        const qSply   = activeMs.reduce((s, m) => s + monthlyPerf[m].sply,   0);
                        quarterPerf[qName] = { budget:qBudget, sales:qSales, sply:qSply, ach:ach(qSales,qBudget), growth:calcGrw(qSales,qSply) };
                        grandQuarter[qName].budget += qBudget; grandQuarter[qName].sales += qSales; grandQuarter[qName].sply += qSply;
                    });

                    const colors = {
                        Q1:{ bg:'bg-violet-500/[0.04]',  tx:'text-violet-800',  pill:'bg-violet-50 text-violet-600', mBg: 'bg-violet-50', mTx: 'text-violet-700', border: 'border-violet-100' },
                        Q2:{ bg:'bg-amber-500/[0.04]',   tx:'text-amber-800',   pill:'bg-amber-50 text-amber-600',   mBg: 'bg-amber-50',  mTx: 'text-amber-700',  border: 'border-amber-100' },
                        Q3:{ bg:'bg-emerald-500/[0.04]', tx:'text-emerald-800', pill:'bg-emerald-50 text-emerald-600',mBg: 'bg-emerald-50', mTx: 'text-emerald-700',border: 'border-emerald-100' },
                        Q4:{ bg:'bg-cyan-500/[0.04]',    tx:'text-cyan-800',    pill:'bg-cyan-50 text-cyan-600',     mBg: 'bg-cyan-50',   mTx: 'text-cyan-700',   border: 'border-cyan-100' }
                    };
                    const h = hues[idx % hues.length];

                    // Calculate Year Total / YTD performance
                    const activeYtdMonths = fiscalMonths.filter(m => activeMonths.includes(m));
                    const ytdBudget = activeYtdMonths.reduce((s, m) => s + monthlyPerf[m].budget, 0);
                    const ytdSales  = activeYtdMonths.reduce((s, m) => s + monthlyPerf[m].sales, 0);
                    const ytdSply   = activeYtdMonths.reduce((s, m) => s + monthlyPerf[m].sply, 0);
                    const ytdAch    = ach(ytdSales, ytdBudget);
                    const ytdGrowth = calcGrw(ytdSales, ytdSply);

                    // --- Desktop Table Row Cells ---
                    let cellsHTML = '';
                    Object.entries(quarters).forEach(([qName, qMs]) => {
                        qMs.forEach(m => {
                            const p = monthlyPerf[m];
                            cellsHTML += `<td class="px-2 py-1.5 text-slate-400 font-medium border-l border-slate-100">${p.budget}</td><td class="px-2 py-1.5 font-bold text-slate-700">${p.sales}</td><td class="px-2 py-1.5 font-black text-slate-800">${p.ach}%</td><td class="px-2 py-1.5 text-slate-400 font-medium">${p.sply}</td><td class="px-2 py-1.5 font-black text-[10px]">${fmtGrw(p.growth)}</td>`;
                        });
                        const q = quarterPerf[qName]; const c = colors[qName];
                        cellsHTML += `<td class="px-2 py-1.5 font-bold ${c.bg} ${c.tx} border-l-2 border-slate-200">${q.budget}</td><td class="px-2 py-1.5 font-black ${c.bg} ${c.tx}">${q.sales}</td><td class="px-2 py-1.5 ${c.bg}"><span class="px-1.5 py-0.5 rounded-lg ${c.pill} font-black">${q.ach}%</span></td><td class="px-2 py-1.5 font-bold ${c.bg} ${c.tx}">${q.sply}</td><td class="px-2 py-1.5 font-black ${c.bg} text-[10px] border-r border-slate-200">${fmtGrw(q.growth)}</td>`;
                    });

                    // Append YTD columns creatively (with premium highlight)
                    cellsHTML += `<td class="px-2 py-1.5 font-bold bg-slate-900/5 text-slate-900 border-l-4 border-slate-400/80">${ytdBudget}</td>`;
                    cellsHTML += `<td class="px-2 py-1.5 font-black bg-slate-900/5 text-slate-900">${ytdSales}</td>`;
                    cellsHTML += `<td class="px-2 py-1.5 bg-slate-900/5"><span class="px-1.5 py-0.5 rounded-lg bg-slate-900 text-white font-black">${ytdAch}%</span></td>`;
                    cellsHTML += `<td class="px-2 py-1.5 font-bold bg-slate-900/5 text-slate-900">${ytdSply}</td>`;
                    cellsHTML += `<td class="px-2 py-1.5 font-black bg-slate-900/5 text-[10px] border-r border-slate-300">${fmtGrw(ytdGrowth)}</td>`;

                    // --- Mobile Card ---
                    let mQuartersHTML = '';
                    Object.entries(quarters).forEach(([qName, qMs]) => {
                        const q = quarterPerf[qName];
                        const c = colors[qName];
                        
                        let mMonthsHTML = '';
                        qMs.forEach(m => {
                            const p = monthlyPerf[m];
                            mMonthsHTML += `
                                <div class="p-2 flex flex-col justify-center items-center bg-slate-50/45 rounded-xl border border-slate-100/40">
                                    <div class="text-[10px] font-black text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider mb-2">${m.substring(0,3)}</div>
                                    
                                    <div class="w-full space-y-1.5 text-center">
                                        <!-- Target -->
                                        <div class="flex justify-between items-center text-[10px] border-b border-slate-100/60 pb-1">
                                            <span class="text-[8px] text-slate-400 font-bold">BGT:</span>
                                            <span class="font-bold text-slate-600">${p.budget}</span>
                                        </div>
                                        
                                        <!-- Sales -->
                                        <div class="flex justify-between items-center text-[10px] border-b border-slate-100/60 pb-1">
                                            <span class="text-[8px] text-slate-400 font-bold">SAL:</span>
                                            <span class="font-black text-slate-800">${p.sales}</span>
                                        </div>
                                        
                                        <!-- SPLY -->
                                        <div class="flex justify-between items-center text-[10px] border-b border-slate-100/60 pb-1">
                                            <span class="text-[8px] text-slate-400 font-bold">SPLY:</span>
                                            <span class="font-bold text-slate-500/90">${p.sply}</span>
                                        </div>
                                        
                                        <!-- Growth and Ach -->
                                         <div class="pt-1.5 flex justify-between items-center text-[10px]">
                                             <div class="flex flex-col items-start">
                                                 <span class="text-[7px] text-slate-400 font-bold leading-none">ACH%</span>
                                                 <span class="font-extrabold ${p.ach >= 100 ? 'text-emerald-600' : (p.ach >= 80 ? 'text-amber-500' : 'text-rose-500')} mt-0.5">${p.ach}%</span>
                                             </div>
                                             <div class="flex flex-col items-end">
                                                 <span class="text-[7px] text-slate-400 font-bold leading-none">GROW%</span>
                                                 <span class="text-[9px] font-black mt-0.5">${fmtGrw(p.growth)}</span>
                                             </div>
                                         </div>
                                    </div>
                                </div>
                            `;
                        });

                        mQuartersHTML += `
                            <div class="border ${c.border} rounded-xl overflow-hidden shadow-sm bg-white">
                                <div class="${c.mBg} p-2 flex justify-between items-center border-b ${c.border}">
                                    <div class="font-black ${c.mTx} text-xs">${qName} <span class="font-bold opacity-75 text-[10px] ml-1">(${qMs[0].substring(0,3)} - ${qMs[2].substring(0,3)})</span></div>
                                    <div class="flex flex-wrap gap-1 text-[9px] justify-end">
                                        <div class="bg-white/70 px-1.5 py-0.5 rounded text-slate-600 font-bold"><span class="opacity-60 text-[8px]">B:</span>${q.budget}</div>
                                        <div class="bg-white/70 px-1.5 py-0.5 rounded text-slate-800 font-black"><span class="opacity-60 text-[8px]">S:</span>${q.sales}</div>
                                        <div class="bg-white/70 px-1.5 py-0.5 rounded text-slate-500 font-bold"><span class="opacity-60 text-[8px]">LY:</span>${q.sply}</div>
                                        <div class="bg-white shadow px-1.5 py-0.5 rounded ${c.mTx} font-black">${q.ach}%</div>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 gap-2 p-2">
                                    ${mMonthsHTML}
                                </div>
                            </div>
                        `;
                    });

                    mobileCardsHTML += `
                        <div class="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden relative">
                            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-${h}-500"></div>
                            <div class="bg-gradient-to-r from-slate-50 to-white p-3.5 border-b border-slate-100 flex justify-between items-center pl-4">
                                <div class="flex flex-col">
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Territory ${idx+1}</div>
                                    <div class="font-black text-slate-800 text-sm">${t.name}</div>
                                </div>
                                <div class="flex flex-col items-end">
                                    <div class="text-[9px] font-bold text-slate-400 uppercase">FY Budget</div>
                                    <div class="text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100 shadow-sm mt-0.5">${totalFYBudget}</div>
                                </div>
                            </div>
                            <div class="p-3 space-y-3 bg-slate-50/30">
                                ${mQuartersHTML}
                            </div>
                        </div>
                    `;

                    return `<tr class="text-center border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <td class="px-6 py-1.5 text-left sticky left-0 z-10 bg-white hover:bg-slate-50/60 border-r-2 border-slate-200/90 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                            <div class="flex items-center gap-2">
                                <span class="text-[9px] font-bold text-slate-400 w-4 text-right">${idx+1}.</span>
                                <div class="w-1.5 h-4 bg-${h}-500 rounded-full shadow-sm"></div>
                                <span class="font-black text-slate-700">${t.name}</span>
                            </div>
                        </td>
                        <td class="px-3 py-1.5 font-bold text-amber-800 bg-amber-500/[0.01] border-l-2 border-r-2 border-amber-500/10 text-center"><span class="px-2 py-0.5 rounded-lg text-amber-800 font-extrabold text-[10px]">${totalFYBudget}</span></td>
                        ${cellsHTML}
                    </tr>`;
                }).join('');

                // ── Grand Total row (Desktop) & Grand Total Card (Mobile) ──
                const qtBgMap   = { Q1:'bg-violet-500/10',  Q2:'bg-amber-500/10',  Q3:'bg-emerald-500/10',  Q4:'bg-cyan-500/10'  };
                const qtTxMap   = { Q1:'text-violet-900',   Q2:'text-amber-900',   Q3:'text-emerald-900',   Q4:'text-cyan-900'   };
                const qtPillMap = { Q1:'bg-violet-100 text-violet-700', Q2:'bg-amber-100 text-amber-700', Q3:'bg-emerald-100 text-emerald-700', Q4:'bg-cyan-100 text-cyan-700' };
                let grandCellsHTML = '';
                
                let mGrandQuartersHTML = '';

                Object.entries(quarters).forEach(([qName, qMs]) => {
                    qMs.forEach(m => {
                        const g = grandMonth[m];
                        grandCellsHTML += `<td class="px-2 py-2 text-slate-700 font-extrabold border-l border-slate-200/50 bg-slate-50/50">${g.budget}</td><td class="px-2 py-2 font-black text-slate-900 bg-slate-50/50">${g.sales}</td><td class="px-2 py-2 bg-slate-50/50 font-black text-slate-800">${ach(g.sales,g.budget)}%</td><td class="px-2 py-2 text-slate-700 font-extrabold bg-slate-50/50">${g.sply}</td><td class="px-2 py-2 font-black text-[10px] bg-slate-50/50">${fmtGrw(calcGrw(g.sales,g.sply))}</td>`;
                    });
                    const gq = grandQuarter[qName];
                    grandCellsHTML += `<td class="px-2 py-2 font-extrabold ${qtBgMap[qName]} ${qtTxMap[qName]} border-l-2 border-slate-300">${gq.budget}</td><td class="px-2 py-2 font-black ${qtBgMap[qName]} ${qtTxMap[qName]}">${gq.sales}</td><td class="px-2 py-2 ${qtBgMap[qName]}"><span class="px-1.5 py-0.5 rounded-lg ${qtPillMap[qName]} font-black">${ach(gq.sales,gq.budget)}%</span></td><td class="px-2 py-2 font-extrabold ${qtBgMap[qName]} ${qtTxMap[qName]}">${gq.sply}</td><td class="px-2 py-2 font-black ${qtBgMap[qName]} text-[10px] border-r border-slate-300">${fmtGrw(calcGrw(gq.sales,gq.sply))}</td>`;
                
                    // Mobile Grand Total Quarter Block
                    mGrandQuartersHTML += `
                        <div class="flex justify-between items-center p-2 border-b border-indigo-100/50 last:border-0">
                            <div class="font-black text-indigo-900 text-xs">${qName}</div>
                            <div class="flex gap-1.5 text-[9px]">
                                <div class="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-bold">B: ${gq.budget}</div>
                                <div class="bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-900 font-black">S: ${gq.sales}</div>
                                <div class="bg-indigo-50/50 px-1.5 py-0.5 rounded text-indigo-500 font-semibold">LY: ${gq.sply}</div>
                                <div class="bg-indigo-600 text-white shadow-sm px-1.5 py-0.5 rounded font-black">${ach(gq.sales,gq.budget)}%</div>
                            </div>
                        </div>
                    `;
                });

                // Calculate overall YTD / Year Total at Grand Total level
                const activeYtdMonths = fiscalMonths.filter(m => activeMonths.includes(m));
                const gYtdBudget = activeYtdMonths.reduce((s, m) => s + grandMonth[m].budget, 0);
                const gYtdSales  = activeYtdMonths.reduce((s, m) => s + grandMonth[m].sales, 0);
                const gYtdSply   = activeYtdMonths.reduce((s, m) => s + grandMonth[m].sply, 0);
                const gYtdAch    = ach(gYtdSales, gYtdBudget);
                const gYtdGrowth = calcGrw(gYtdSales, gYtdSply);

                // Append Grand Total YTD columns for Desktop Table
                grandCellsHTML += `<td class="px-2 py-2 font-black bg-slate-800 text-white border-l-4 border-slate-900">${gYtdBudget}</td>`;
                grandCellsHTML += `<td class="px-2 py-2 font-black bg-slate-800 text-white">${gYtdSales}</td>`;
                grandCellsHTML += `<td class="px-2 py-2 bg-slate-800"><span class="px-1.5 py-0.5 rounded-lg bg-white text-slate-900 font-black">${gYtdAch}%</span></td>`;
                grandCellsHTML += `<td class="px-2 py-2 font-black bg-slate-800 text-white">${gYtdSply}</td>`;
                grandCellsHTML += `<td class="px-2 py-2 font-black bg-slate-800 text-[10px] border-r border-slate-900">${fmtGrw(gYtdGrowth)}</td>`;

                const grandTotalRowHTML = `<tr class="bg-indigo-50/20 font-black text-slate-800 text-center border-t-2 border-indigo-200">
                    <td class="px-6 py-2 text-left sticky left-0 z-10 bg-indigo-50 border-r-2 border-indigo-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        <div class="flex items-center gap-2"><span class="w-4"></span><div class="w-1.5 h-4 bg-indigo-600 rounded-full shadow shadow-indigo-500/50"></div><span class="font-extrabold text-slate-800 text-[10px]">GRAND TOTAL</span></div>
                    </td>
                    <td class="px-3 py-2 font-black text-amber-700 bg-amber-500/10 border-l-2 border-r-2 border-amber-500/20 text-center"><span class="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md shadow-amber-500/20">${grandFYBudget}</span></td>
                    ${grandCellsHTML}
                </tr>`;

                // Mobile Grand Total card with YTD summary block
                const mobileGrandTotalHTML = `
                    <div class="bg-indigo-500 rounded-2xl shadow-lg border border-indigo-400 overflow-hidden relative mt-6 mb-8">
                        <div class="bg-indigo-600 p-4 border-b border-indigo-400/50 flex justify-between items-center text-white">
                            <div class="font-black text-sm flex items-center gap-2"><i data-lucide="sigma" class="w-4 h-4 opacity-80"></i> GRAND TOTAL</div>
                            <div class="flex flex-col items-end">
                                <div class="text-[9px] font-bold text-indigo-200 uppercase">FY Budget</div>
                                <div class="text-sm font-black bg-white/20 px-2 py-0.5 rounded shadow-inner mt-0.5">${grandFYBudget}</div>
                            </div>
                        </div>
                        <div class="p-2 bg-indigo-50/90">
                            <div class="bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm">
                                ${mGrandQuartersHTML}
                                <!-- YTD Year Total summary row for Mobile -->
                                <div class="flex justify-between items-center p-3 bg-slate-900 text-white rounded-b-xl border-t-2 border-slate-950">
                                    <div class="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1"><i data-lucide="globe" class="w-3.5 h-3.5"></i> YTD Total</div>
                                    <div class="flex gap-1.5 text-[10px] font-bold">
                                        <div><span class="opacity-70 text-[8px]">B:</span> ${gYtdBudget}</div>
                                        <div><span class="opacity-70 text-[8px]">S:</span> ${gYtdSales}</div>
                                        <div><span class="opacity-70 text-[8px]">LY:</span> ${gYtdSply}</div>
                                        <div class="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">${gYtdAch}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                return { rowsHTML, grandTotalRowHTML, metricHeadersHTML, mobileCardsHTML, mobileGrandTotalHTML };
            };

window.app._buildPulseMatrixPage = (reloadFn) => {
                const brand    = app.pmBrandTab    || 'Foton';
                const saleType = app.pmSaleTypeTab || 'New Sale';
                const { rowsHTML, grandTotalRowHTML, metricHeadersHTML, mobileCardsHTML, mobileGrandTotalHTML } = app._renderPulseMatrixHTML(app.currentUser.territories);

                return `
                <div class="pb-6 fade-in">
                    <div class="flex items-center justify-between mb-5">
                        <div>
                            <h2 class="text-lg font-black text-slate-800 flex items-center gap-2">
                                <div class="p-1.5 bg-violet-100 rounded-xl"><i data-lucide="calendar-range" class="w-5 h-5 text-violet-600"></i></div>
                                Performance Matrix
                            </h2>
                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 ml-10">12-Month Territory Breakdown &middot; FY ${app.currentFY}</p>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-5">
                        <div class="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl gap-0.5">
                            ${['Foton','Mahindra'].map(b => `<button onclick="app.pmBrandTab='${b}'; ${reloadFn}()" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${brand===b ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}">${b}</button>`).join('')}
                        </div>
                        <div class="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl gap-0.5">
                            ${['New Sale','Resale'].map(st => `<button onclick="app.pmSaleTypeTab='${st}'; ${reloadFn}()" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${saleType===st ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}">${st}</button>`).join('')}
                        </div>
                    </div>

                    <!-- DESKTOP / LARGE SCREEN VIEW -->
                    <div class="hidden xl:block glass rounded-[2rem] border border-white shadow-xl overflow-hidden">
                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full text-left text-[11px] whitespace-nowrap border-collapse">
                                <thead>
                                    <tr class="bg-slate-50/80 text-slate-500 uppercase tracking-widest text-[9px] border-b border-slate-200">
                                        <th class="px-6 py-2 font-black sticky left-0 z-10 bg-slate-50 border-r border-slate-200/80 shadow-[2px_0_5px_rgba(0,0,0,0.02)]" rowspan="3">Territory</th>
                                        <th class="px-3 py-2 text-center bg-gradient-to-b from-amber-500/10 to-amber-500/5 text-amber-700 font-extrabold border-l-2 border-r-2 border-t border-amber-500/20 shadow-sm" rowspan="3">Total FY Budget</th>
                                        <th class="px-3 py-2 text-center bg-gradient-to-r from-violet-600/10 via-violet-500/5 to-transparent text-violet-700 border-l-2 border-r-2 border-t border-violet-500/20 font-extrabold shadow-sm" colspan="20">Q1 (July &ndash; September)</th>
                                        <th class="px-3 py-2 text-center bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-transparent text-amber-700 border-l-2 border-r-2 border-t border-amber-500/20 font-extrabold shadow-sm" colspan="20">Q2 (October &ndash; December)</th>
                                        <th class="px-3 py-2 text-center bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent text-emerald-700 border-l-2 border-r-2 border-t border-emerald-500/20 font-extrabold shadow-sm" colspan="20">Q3 (January &ndash; March)</th>
                                        <th class="px-3 py-2 text-center bg-gradient-to-r from-cyan-600/10 via-cyan-500/5 to-transparent text-cyan-700 border-l-2 border-r-2 border-t border-cyan-500/20 font-extrabold shadow-sm" colspan="20">Q4 (April &ndash; June)</th>
                                        <th class="px-3 py-2 text-center bg-gradient-to-r from-slate-700/20 via-slate-600/10 to-slate-500/5 text-slate-800 border-l-4 border-r-2 border-t border-slate-700/30 font-black shadow-md" colspan="5">YTD Total (Year Total)</th>
                                    </tr>
                                    <tr class="bg-slate-50/40 text-slate-500 uppercase tracking-widest text-[9px] border-b border-slate-200 text-center">
                                        <th class="px-2 py-1.5 border-l-2 border-violet-200/60" colspan="5">July</th><th class="px-2 py-1.5 border-l border-slate-200" colspan="5">August</th><th class="px-2 py-1.5 border-l border-slate-200" colspan="5">September</th><th class="px-2 py-1.5 bg-violet-500/10 text-violet-800 font-extrabold border-l-2 border-violet-300" colspan="5">Q1 Total</th>
                                        <th class="px-2 py-1.5 border-l-2 border-amber-200/60" colspan="5">October</th><th class="px-2 py-1.5 border-l border-slate-200" colspan="5">November</th><th class="px-2 py-1.5 border-l border-slate-200" colspan="5">December</th><th class="px-2 py-1.5 bg-amber-500/10 text-amber-800 font-extrabold border-l-2 border-amber-300" colspan="5">Q2 Total</th>
                                        <th class="px-2 py-1.5 border-l-2 border-emerald-200/60" colspan="5">January</th><th class="px-2 py-1.5 border-l border-slate-200" colspan="5">February</th><th class="px-2 py-1.5 border-l border-slate-200" colspan="5">March</th><th class="px-2 py-1.5 bg-emerald-500/10 text-emerald-800 font-extrabold border-l-2 border-emerald-300" colspan="5">Q3 Total</th>
                                        <th class="px-2 py-1.5 border-l-2 border-cyan-200/60" colspan="5">April</th><th class="px-2 py-1.5 border-l border-slate-200" colspan="5">May</th><th class="px-2 py-1.5 border-l border-slate-200" colspan="5">June</th><th class="px-2 py-1.5 bg-cyan-500/10 text-cyan-800 font-extrabold border-l-2 border-cyan-300" colspan="5">Q4 Total</th>
                                        <th class="px-2 py-1.5 bg-slate-700/10 text-slate-800 font-black border-l-4 border-slate-400" colspan="5">YTD Total</th>
                                    </tr>
                                    <tr class="text-slate-400 uppercase tracking-tighter text-[8px] border-b border-slate-200/80 text-center font-bold">
                                        ${metricHeadersHTML}
                                        <th class="px-1.5 py-1 border-l-4 border-slate-400 bg-slate-100 font-black text-slate-800 text-center">Bgt</th>
                                        <th class="px-1.5 py-1 bg-slate-100 font-black text-slate-800 text-center">Sal</th>
                                        <th class="px-1.5 py-1 bg-slate-100 font-black text-slate-800 text-center">Ach%</th>
                                        <th class="px-1.5 py-1 bg-slate-100 font-black text-slate-800 text-center">SPLY</th>
                                        <th class="px-1.5 py-1 bg-slate-100 font-black text-slate-800 text-center">Gr%</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${rowsHTML}
                                    ${grandTotalRowHTML}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- MOBILE / SMALL SCREEN VIEW -->
                    <div class="block xl:hidden">
                        <div class="space-y-4">
                            ${mobileCardsHTML}
                        </div>
                        ${mobileGrandTotalHTML}
                    </div>
                </div>`;
            };

window.app.renderSOPulseMatrix = () => {
                localStorage.setItem('aci_last_page', 'pulse');
                localStorage.setItem('aci_last_role', 'so');
                document.getElementById('view-port').innerHTML = app._buildPulseMatrixPage('app.renderSOPulseMatrix');
                app.refreshIcons();
            };

window.app.renderAMPulseMatrix = () => {
                localStorage.setItem('aci_last_page', 'pulse');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                document.getElementById('view-port').innerHTML = app._buildPulseMatrixPage('app.renderAMPulseMatrix');
                app.refreshIcons();
            };

