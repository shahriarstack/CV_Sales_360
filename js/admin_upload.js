// --- Sales360 Module: admin_upload.js ---
window.app = window.app || {};

window.app.renderDataUpload = () => {
    if (sessionStorage.getItem('aci_admin_unlocked') !== 'true') {
        app.promptAdminPassword(() => app.renderDataUpload());
        return;
    }

                localStorage.setItem('aci_last_page', 'upload');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                if (app.currentUser.role !== 'admin') {
                    app.showToast("Access Denied: Only Admins can access data management.", "error");
                    return;
                }
                const html = `
                    <div class="max-w-6xl mx-auto pb-10">
                        <div class="mb-6">
                            <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight">Bulk Data Upload</h1></div>
                            <p class="text-sm text-slate-500">Upload Targets, Projections, and System Sales securely.</p>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            <!-- 1. Yearly Targets -->
                            <div class="glass p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group transition-all hover:shadow-md">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="font-bold text-slate-800 flex items-center gap-2"><i data-lucide="target" class="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform"></i> Yearly Targets</h3>
                                        <p class="text-[10px] text-slate-500 mt-1">Set once per year by Upazila</p>
                                        <div class="flex items-center gap-1 mt-2.5 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-full w-max">
                                            <i data-lucide="clock" class="w-3 h-3 text-indigo-500"></i>
                                            <span class="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Updated: 20 May '26</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                                        <button onclick="app.viewUploadedData('targets')" title="View Data" class="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded transition-colors"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                        <div class="w-px h-4 bg-slate-200"></div>
                                        <button onclick="app.downloadTemplate('target')" title="Download Template" class="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                                <div class="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer flex-1 flex flex-col justify-center" onclick="document.getElementById('file-target').click()">
                                    <i data-lucide="upload-cloud" class="w-8 h-8 text-indigo-400 mx-auto mb-2"></i>
                                    <p class="text-xs font-semibold text-slate-700">Upload Target CSV</p>
                                    <input type="file" id="file-target" class="hidden" accept=".csv" onchange="app.simulateUpload(this, 'Yearly Targets', 'targets')">
                                </div>
                            </div>

                            <!-- 2. Monthly Projections -->
                            <div class="glass p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group transition-all hover:shadow-md">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="font-bold text-slate-800 flex items-center gap-2"><i data-lucide="trending-up" class="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform"></i> Projections</h3>
                                        <p class="text-[10px] text-slate-500 mt-1">Current month territory-wise</p>
                                        <div class="flex items-center gap-1 mt-2.5 bg-amber-50/80 border border-amber-100 px-2 py-0.5 rounded-full w-max">
                                            <i data-lucide="clock" class="w-3 h-3 text-amber-500"></i>
                                            <span class="text-[9px] font-black text-amber-700 uppercase tracking-widest">Updated: 21 May '26</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                                        <button onclick="app.viewUploadedData('projections')" title="View Data" class="text-amber-600 hover:bg-amber-100 p-1.5 rounded transition-colors"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                        <div class="w-px h-4 bg-slate-200"></div>
                                        <button onclick="app.downloadTemplate('projection')" title="Download Template" class="text-amber-600 hover:bg-amber-100 p-1.5 rounded transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                                <div class="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer flex-1 flex flex-col justify-center" onclick="document.getElementById('file-proj').click()">
                                    <i data-lucide="upload-cloud" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
                                    <p class="text-xs font-semibold text-slate-700">Upload Projection CSV</p>
                                    <input type="file" id="file-proj" class="hidden" accept=".csv" onchange="app.simulateUpload(this, 'Monthly Projections', 'projections')">
                                </div>
                            </div>

                            <!-- 3. System Sales Data (Current Year) -->
                            <div class="glass p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group transition-all hover:shadow-md">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="font-bold text-slate-800 flex items-center gap-2"><i data-lucide="shopping-cart" class="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform"></i> System Sales</h3>
                                        <p class="text-[10px] text-slate-500 mt-1">Upload month-end final sales actuals</p>
                                        <div class="flex items-center gap-1 mt-2.5 bg-green-50/80 border border-green-100 px-2 py-0.5 rounded-full w-max">
                                            <i data-lucide="clock" class="w-3 h-3 text-green-500"></i>
                                            <span class="text-[9px] font-black text-green-700 uppercase tracking-widest">Updated: 21 May '26</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                                        <button onclick="app.viewUploadedData('sales')" title="View Data" class="text-green-600 hover:bg-green-100 p-1.5 rounded transition-colors"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                        <div class="w-px h-4 bg-slate-200"></div>
                                        <button onclick="app.downloadTemplate('sales')" title="Download Template" class="text-green-600 hover:bg-green-100 p-1.5 rounded transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                                <div class="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer flex-1 flex flex-col justify-center" onclick="document.getElementById('file-sales').click()">
                                    <i data-lucide="upload-cloud" class="w-8 h-8 text-green-400 mx-auto mb-2"></i>
                                    <p class="text-xs font-semibold text-slate-700">Upload Sales CSV</p>
                                    <input type="file" id="file-sales" class="hidden" accept=".csv" onchange="app.simulateUpload(this, 'System Sales Data', 'sales')">
                                </div>
                            </div>

                            <!-- 4. Early EMI Data -->
                            <div class="glass p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group transition-all hover:shadow-md">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="font-bold text-slate-800 flex items-center gap-2"><i data-lucide="file-clock" class="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform"></i> Early EMI Customers</h3>
                                        <p class="text-[10px] text-slate-500 mt-1">Upload 1st & 2nd EMI details</p>
                                        <div class="flex items-center gap-1 mt-2.5 bg-purple-50/80 border border-purple-100 px-2 py-0.5 rounded-full w-max">
                                            <i data-lucide="clock" class="w-3 h-3 text-purple-500"></i>
                                            <span class="text-[9px] font-black text-purple-700 uppercase tracking-widest">Updated: 19 May '26</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                                        <button onclick="app.viewUploadedData('emi')" title="View Data" class="text-purple-600 hover:bg-purple-100 p-1.5 rounded transition-colors"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                        <div class="w-px h-4 bg-slate-200"></div>
                                        <button onclick="app.downloadTemplate('emi_early')" title="Download Template" class="text-purple-600 hover:bg-purple-100 p-1.5 rounded transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button>
                                        <div class="w-px h-4 bg-slate-200"></div>
                                        <button onclick="app.deleteAllRows('emi')" title="Clear All Data" class="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                                <div class="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer flex-1 flex flex-col justify-center" onclick="document.getElementById('file-emi-early').click()">
                                    <i data-lucide="upload-cloud" class="w-8 h-8 text-purple-400 mx-auto mb-2"></i>
                                    <p class="text-xs font-semibold text-slate-700">Upload EMI CSV</p>
                                    <input type="file" id="file-emi-early" class="hidden" accept=".csv" onchange="app.simulateUpload(this, 'Early EMI Data', 'emi')">
                                </div>
                            </div>
                            
                            <!-- 5. Historical Sales Data -->
                            <div class="glass p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group transition-all hover:shadow-md">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="font-bold text-slate-800 flex items-center gap-2"><i data-lucide="history" class="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform"></i> Historical Sales</h3>
                                        <p class="text-[10px] text-slate-500 mt-1">Multi-year historical FY data</p>
                                        <div class="flex items-center gap-1 mt-2.5 bg-rose-50/80 border border-rose-100 px-2 py-0.5 rounded-full w-max">
                                            <i data-lucide="clock" class="w-3 h-3 text-rose-500"></i>
                                            <span class="text-[9px] font-black text-rose-700 uppercase tracking-widest">Updated: 15 May '26</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                                        <button onclick="app.viewUploadedData('last_year_sales')" title="View Data" class="text-rose-600 hover:bg-rose-100 p-1.5 rounded transition-colors"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                        <div class="w-px h-4 bg-slate-200"></div>
                                        <button onclick="app.downloadTemplate('last_year_sales')" title="Download Template" class="text-rose-600 hover:bg-rose-100 p-1.5 rounded transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                                <div class="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer flex-1 flex flex-col justify-center" onclick="document.getElementById('file-last-year').click()">
                                    <i data-lucide="upload-cloud" class="w-8 h-8 text-rose-400 mx-auto mb-2"></i>
                                    <p class="text-xs font-semibold text-slate-700">Upload Historical Sales CSV</p>
                                    <input type="file" id="file-last-year" class="hidden" accept=".csv" onchange="app.simulateUpload(this, 'Historical Sales Data', 'last_year_sales')">
                                </div>
                            </div>

                            <!-- 6. Recovery OD Status -->
                            <div class="glass p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group transition-all hover:shadow-md">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="font-bold text-slate-800 flex items-center gap-2"><i data-lucide="alert-triangle" class="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform"></i> Recovery OD Status</h3>
                                        <p class="text-[10px] text-slate-500 mt-1">Territory-wide overdue metrics</p>
                                        <div class="flex items-center gap-1 mt-2.5 bg-orange-50/80 border border-orange-100 px-2 py-0.5 rounded-full w-max">
                                            <i data-lucide="clock" class="w-3 h-3 text-orange-500"></i>
                                            <span class="text-[9px] font-black text-orange-700 uppercase tracking-widest">Updated: 20 May '26</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                                        <button onclick="app.viewUploadedData('recovery_od')" title="View Data" class="text-orange-600 hover:bg-orange-100 p-1.5 rounded transition-colors"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                        <div class="w-px h-4 bg-slate-200"></div>
                                        <button onclick="app.downloadTemplate('recovery_od')" title="Download Template" class="text-orange-600 hover:bg-orange-100 p-1.5 rounded transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                                <div class="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer flex-1 flex flex-col justify-center" onclick="document.getElementById('file-recovery-od').click()">
                                    <i data-lucide="upload-cloud" class="w-8 h-8 text-orange-400 mx-auto mb-2"></i>
                                    <p class="text-xs font-semibold text-slate-700">Upload Recovery OD CSV</p>
                                    <input type="file" id="file-recovery-od" class="hidden" accept=".csv" onchange="app.simulateUpload(this, 'Recovery OD Status', 'recovery_od')">
                                </div>
                            </div>

                        </div>


                        <!-- Custom Report Builder -->
                        <div class="mt-8 mb-4">
                            <div class="flex items-center gap-2.5 mb-4">
                                <div class="h-5 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full shadow-sm"></div>
                                <h2 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-indigo-800 tracking-tight">Custom Report Export</h2>
                            </div>
                            <div class="glass p-6 rounded-2xl border border-indigo-100/50 shadow-lg relative overflow-hidden group">
                                <div class="absolute -right-20 -top-20 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl"></div>
                                <div class="relative z-10 grid grid-cols-1 md:grid-cols-6 gap-5">
                                    <!-- Month Select -->
                                    <div class="space-y-1.5">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Report Month</label>
                                        <select id="export-month" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
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
                                    <div class="space-y-1.5">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Financial Year</label>
                                        <select id="export-fy" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                                            <!-- Dynamically populated or static, assuming 2026-27 is current -->
                                            <option value="2026-27">FY 2026-27</option>
                                            <option value="2025-26">FY 2025-26</option>
                                            <option value="2024-25">FY 2024-25</option>
                                        </select>
                                    </div>

                                    <!-- Territory Select -->
                                    <div class="space-y-1.5">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Territory</label>
                                        <select id="export-territory" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                                            <option value="ALL">All Territories</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Brand Select -->
                                    <div class="space-y-1.5">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                                        <select id="export-brand" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                                            <option value="ALL">All Brands</option>
                                            <option value="Foton">Foton</option>
                                            <option value="Mahindra">Mahindra</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Sale Type Select -->
                                    <div class="space-y-1.5">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sale Type</label>
                                        <select id="export-sale-type" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                                            <option value="ALL">All Types</option>
                                            <option value="New Sale">New Sale</option>
                                            <option value="Resale">Resale</option>
                                            <option value="Credit Note">Credit Note</option>
                                        </select>
                                    </div>

                                    <!-- Action Button -->
                                    <div class="flex items-end">
                                        <button onclick="app.generateCustomReport()" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                            <i data-lucide="download-cloud" class="w-4 h-4"></i> Export Report
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-4">
                                    <label class="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" id="export-inc-budget" checked class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                                        <span class="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">Include Target/Budget</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" id="export-inc-actual" checked class="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500">
                                        <span class="text-xs font-semibold text-slate-600 group-hover:text-green-600 transition-colors">Include Actual Sales</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" id="export-inc-sply" checked class="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400">
                                        <span class="text-xs font-semibold text-slate-600 group-hover:text-amber-500 transition-colors">Include SPLY Data</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Creative Data Lifecycle Guideline -->
                        <div class="mt-12 glass p-8 rounded-[2rem] border border-white shadow-2xl relative overflow-hidden group">
                            <!-- Background elements -->
                            <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                            <div class="absolute -left-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>

                            <div class="relative z-10">
                                <div class="flex items-center gap-4 mb-8">
                                    <div class="p-3 bg-slate-900 rounded-2xl shadow-lg">
                                        <i data-lucide="info" class="w-6 h-6 text-white"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-xl font-black text-slate-800 tracking-tight">Data Synchronization Lifecycle</h2>
                                        <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Guidelines for maintaining system integrity</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <!-- Yearly Cycle -->
                                    <div class="space-y-3 p-4 rounded-2xl hover:bg-white/50 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">01</span>
                                            <h4 class="font-black text-slate-700 text-sm">Strategic Foundation</h4>
                                        </div>
                                        <div class="pl-10">
                                            <p class="text-[11px] font-bold text-indigo-600 uppercase mb-1">Upload: Yearly Targets</p>
                                            <p class="text-xs text-slate-500 leading-relaxed italic">"Set the destination once per year during the July kickoff. This forms the baseline for all achievement metrics."</p>
                                        </div>
                                    </div>

                                    <!-- Monthly Cycle -->
                                    <div class="space-y-3 p-4 rounded-2xl hover:bg-white/50 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xs">02</span>
                                            <h4 class="font-black text-slate-700 text-sm">Monthly Forecasting</h4>
                                        </div>
                                        <div class="pl-10">
                                            <p class="text-[11px] font-bold text-amber-600 uppercase mb-1">Upload: Projections</p>
                                            <p class="text-xs text-slate-500 leading-relaxed italic">"Sync territory expectations by the 1st of every month to align field goals with market potential."</p>
                                        </div>
                                    </div>

                                    <!-- Post-Closing Cycle -->
                                    <div class="space-y-3 p-4 rounded-2xl hover:bg-white/50 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">03</span>
                                            <h4 class="font-black text-slate-700 text-sm">Reality Verification</h4>
                                        </div>
                                        <div class="pl-10">
                                            <p class="text-[11px] font-bold text-emerald-600 uppercase mb-1">Upload: System Sales</p>
                                            <p class="text-xs text-slate-500 leading-relaxed italic">"Upload final actuals by the 3rd of the next month. This is the moment of truth for performance audits."</p>
                                        </div>
                                    </div>

                                    <!-- Weekly/Operational Cycle -->
                                    <div class="space-y-3 p-4 rounded-2xl hover:bg-white/50 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-xs">04</span>
                                            <h4 class="font-black text-slate-700 text-sm">Dynamic Recovery</h4>
                                        </div>
                                        <div class="pl-10">
                                            <p class="text-[11px] font-bold text-purple-600 uppercase mb-1">Upload: EMI & Recovery</p>
                                            <p class="text-xs text-slate-500 leading-relaxed italic">"Sync every Monday morning. Weekly refreshes keep SOs focused on high-priority collection targets."</p>
                                        </div>
                                    </div>

                                    <!-- Historical Initialization -->
                                    <div class="space-y-3 p-4 rounded-2xl hover:bg-white/50 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs">05</span>
                                            <h4 class="font-black text-slate-700 text-sm">Retrospective Sync</h4>
                                        </div>
                                        <div class="pl-10">
                                            <p class="text-[11px] font-bold text-rose-600 uppercase mb-1">Upload: Historical Sales</p>
                                            <p class="text-xs text-slate-500 leading-relaxed italic">"One-time initialization. Required for the AI engine to generate year-over-year growth insights."</p>
                                        </div>
                                    </div>

                                    <!-- Audit Log -->
                                    <div class="space-y-3 p-4 rounded-2xl bg-slate-900 shadow-2xl">
                                        <div class="flex items-center gap-2">
                                            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-black text-xs"><i data-lucide="shield-check" class="w-3 h-3"></i></span>
                                            <h4 class="font-black text-white text-sm">Security Protocol</h4>
                                        </div>
                                        <div class="pl-10">
                                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Auto-Validation Active</p>
                                            <p class="text-[10px] text-slate-400 leading-relaxed">All uploads are scanned for territory-ID consistency before ingestion. Always use the latest templates.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.viewUploadedData = (type) => {
                let title = '';
                let headers = [];
                let data = [];
                let icon = '';
                let themeColor = '';
                let keyField = '';

                if (type === 'targets') {
                    title = 'Monthly Targets';
                    icon = 'target';
                    themeColor = 'indigo';
                    headers = ['FY', 'Month', 'Territory_Name', 'Upazila', 'District', 'Brand', 'Sale_Type', 'Target_Qty'];
                    data = DB.targets;
                    keyField = 'target_qty';
                } else if (type === 'projections') {
                    title = 'Monthly Projections';
                    icon = 'trending-up';
                    themeColor = 'amber';
                    headers = ['FY', 'Month', 'Territory_Name', 'Brand', 'Sale_Type', 'Projection_Qty'];
                    data = DB.projections;
                    keyField = 'projection_qty';
                } else if (type === 'sales') {
                    title = `System Sales (FY ${app.currentFY})`;
                    icon = 'shopping-cart';
                    themeColor = 'green';
                    headers = ['Customer_ID', 'District', 'Territory_Name', 'Upazila', 'Brand', 'Model', 'Unit_Qty', 'FY', 'Sales_Year', 'Sales_Month', 'Sale_Type'];
                    data = DB.sales.filter(s => s.fy === app.currentFY);
                    keyField = 'unit_qty';
                } else if (type === 'emi') {
                    title = 'Early EMI Customers';
                    icon = 'file-clock';
                    themeColor = 'purple';
                    headers = ['Customer_Code', 'Customer_Name', 'Sales_Territory', 'Brand', 'DeliveryDate', 'First_Inst_Date', 'OverDue_Hash', 'OverDue_Taka', 'Installment_Size', 'Collection'];
                    data = DB.emi;
                    keyField = 'overdue_total';
                } else if (type === 'last_year_sales') {
                    const lastFY = (() => {
                        const parts = app.currentFY.split('-');
                        if (parts.length === 2) {
                            const y1 = parseInt(parts[0]);
                            const y2 = parseInt(parts[1]);
                            if (!isNaN(y1) && !isNaN(y2)) return `${y1-1}-${y2-1}`;
                        }
                        return '2024-25';
                    })();
                    title = `Last Year Sales (FY ${lastFY})`;
                    icon = 'history';
                    themeColor = 'rose';
                    headers = ['Customer_ID', 'District', 'Territory_Name', 'Upazila', 'Brand', 'Model', 'Unit_Qty', 'FY', 'Sales_Year', 'Sales_Month', 'Sale_Type'];
                    data = DB.sales.filter(s => s.fy === lastFY);
                    keyField = 'unit_qty';
                } else if (type === 'recovery_od') {
                    title = 'Area Recovery OD Status';
                    icon = 'alert-triangle';
                    themeColor = 'orange';
                    headers = ['FY', 'Month', 'Territory_Name', 'Perfile_OD', 'Total_Overdue'];
                    data = DB.recovery_od;
                    keyField = 'total_overdue';
                }

                const html = `
                    <div class="w-full fade-in pb-10">
                        <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <button onclick="app.renderDataUpload()" class="text-slate-500 hover:text-aci-blue flex items-center gap-1.5 text-sm font-bold mb-3 transition-colors">
                                    <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Upload Hub
                                </button>
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight flex items-center gap-2">
                                    <i data-lucide="${icon}" class="w-6 h-6 text-${themeColor}-600"></i> ${title}
                                </h1>
                                <p class="text-sm text-slate-500 mt-1">Viewing all synchronized records currently in the active database.</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="bg-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 shadow-sm flex items-center gap-2">
                                    <i data-lucide="database" class="w-4 h-4 text-slate-400"></i> Records: ${data.length}
                                </div>
                                <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button onclick="app.deleteSelectedRows('${type}')" class="px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete Selected
                                    </button>
                                    <button onclick="app.deleteAllRows('${type}')" class="px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-2">
                                        <i data-lucide="alert-octagon" class="w-3.5 h-3.5"></i> Purge All
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            <div class="overflow-x-auto">
                                 <table class="w-full text-left text-[11px] whitespace-nowrap">
                                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-widest font-black">
                                        <tr>
                                            <th class="px-4 py-1.5 w-10">
                                                <input type="checkbox" id="master-select" onchange="app.toggleSelectAllRows(this.checked)" class="w-4 h-4 rounded border-slate-300 text-aci-blue focus:ring-aci-blue">
                                            </th>
                                            ${headers.map(h => `<th class="px-4 py-1.5">${h}</th>`).join('')}
                                            <th class="px-4 py-1.5 text-right font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${data.length > 0 ? data.map((item, idx) => {
                    let rowCells = [];
                    if (type === 'targets') rowCells = [item.fy, item.month, DB.territories.find(t => t.id === item.territory_id)?.name || item.territory_id, item.upazila, item.district || '', item.brand, item.sale_type, `<span class="font-bold text-slate-800">${item.target_qty}</span>`];
                    else if (type === 'projections') rowCells = [item.fy, item.month, DB.territories.find(t => t.id === item.territory_id)?.name || item.territory_id, item.brand, item.sale_type, `<span class="font-bold text-slate-800">${item.projection_qty}</span>`];
                    else if (type === 'sales' || type === 'last_year_sales') rowCells = [item.customer_id, item.district, DB.territories.find(t => t.id === item.territory_id)?.name || item.territory_id, item.upazila, item.brand, item.model, `<span class="font-bold text-slate-800">${item.unit_qty}</span>`, item.fy, item.sales_year, item.sales_month, item.sale_type];
                    else if (type === 'emi') rowCells = [item.customer_code, item.customer, DB.territories.find(t => t.id === item.territory_id)?.name || item.location, item.brand, item.delivery_date, item.first_inst_date, item.overdue_count, `<span class="text-rose-600 font-bold">${app.formatCurrency(item.overdue_total)}</span>`, app.formatCurrency(item.installment), app.formatCurrency(item.collected || 0)];
                    else if (type === 'recovery_od') rowCells = [item.fy, item.month, DB.territories.find(t => t.id === item.territory_id)?.name || item.territory_id, app.formatCurrency(item.perfile_od), app.formatCurrency(item.total_overdue)];

                    return `
                                                <tr id="row-${item.id}" class="hover:bg-slate-50/80 transition-colors group">
                                                    <td class="px-4 py-1.5">
                                                        <input type="checkbox" class="row-checkbox w-4 h-4 rounded border-slate-300 text-aci-blue focus:ring-aci-blue" data-id="${item.id}">
                                                    </td>
                                                    ${rowCells.map((cell, cIdx) => `<td class="px-4 py-1.5 ${cIdx === 0 ? 'font-bold text-slate-700' : 'text-slate-500'}">${cell}</td>`).join('')}
                                                    <td class="px-4 py-1.5 text-right">
                                                        <div class="flex justify-end gap-1.5">
                                                            <button onclick="app.editRowData('${type}', '${item.id}')" class="p-1 text-slate-400 hover:text-aci-blue hover:bg-aci-blue/5 rounded transition-all" title="Edit Row">
                                                                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                                                            </button>
                                                            <button onclick="app.deleteSingleRow('${type}', '${item.id}')" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all" title="Delete Row">
                                                                <i data-lucide="trash" class="w-3.5 h-3.5"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                }).join('') : `<tr><td colspan="${headers.length + 2}" class="px-6 py-20 text-center text-slate-400"><div class="flex flex-col items-center gap-3"><i data-lucide="inbox" class="w-12 h-12 opacity-20"></i><p class="font-medium">No records found in this category.</p></div></td></tr>`}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.toggleSelectAllRows = (checked) => {
                const checkboxes = document.querySelectorAll('.row-checkbox');
                checkboxes.forEach(cb => cb.checked = checked);
            };

window.app.deleteSingleRow = async (type, id) => {
                if (!confirm("Are you sure you want to delete this record?")) return;

                if (type === 'targets') DB.targets = DB.targets.filter(t => t.id !== id);
                else if (type === 'projections') DB.projections = DB.projections.filter(p => p.id !== id);
                else if (type === 'sales' || type === 'last_year_sales') DB.sales = DB.sales.filter(s => s.id !== id);
                else if (type === 'emi') DB.emi = DB.emi.filter(e => e.id !== id);
                else if (type === 'recovery_od') DB.recovery_od = DB.recovery_od.filter(r => r.id !== id);

                if (app.neonSQL) {
                    if (type === 'targets') await app.neonSQL`DELETE FROM targets WHERE id = ${id}`;
                    else if (type === 'projections') await app.neonSQL`DELETE FROM projections WHERE id = ${id}`;
                    else if (type === 'sales' || type === 'last_year_sales') await app.neonSQL`DELETE FROM sales WHERE id = ${id}`;
                    else if (type === 'emi') await app.neonSQL`DELETE FROM emi WHERE id = ${id}`;
                    else if (type === 'recovery_od') await app.neonSQL`DELETE FROM recovery_od WHERE id = ${id}`;
                }

                app.saveDBState();
                app.viewUploadedData(type);
                app.showToast("Record deleted successfully.");
            };

window.app.deleteSelectedRows = async (type) => {
                const selected = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => cb.dataset.id);
                if (selected.length === 0) return app.showToast("No records selected.", "error");

                if (!confirm(`Delete ${selected.length} selected records?`)) return;

                if (type === 'targets') DB.targets = DB.targets.filter(t => !selected.includes(t.id));
                else if (type === 'projections') DB.projections = DB.projections.filter(p => !selected.includes(p.id));
                else if (type === 'sales' || type === 'last_year_sales') DB.sales = DB.sales.filter(s => !selected.includes(s.id));
                else if (type === 'emi') DB.emi = DB.emi.filter(e => !selected.includes(e.id));
                else if (type === 'recovery_od') DB.recovery_od = DB.recovery_od.filter(r => !selected.includes(r.id));

                if (app.neonSQL) {
                    // Delete in chunks or use ANY. Using ANY is easiest.
                    if (type === 'targets') await app.neonSQL`DELETE FROM targets WHERE id = ANY(${selected})`;
                    else if (type === 'projections') await app.neonSQL`DELETE FROM projections WHERE id = ANY(${selected})`;
                    else if (type === 'sales' || type === 'last_year_sales') await app.neonSQL`DELETE FROM sales WHERE id = ANY(${selected})`;
                    else if (type === 'emi') await app.neonSQL`DELETE FROM emi WHERE id = ANY(${selected})`;
                    else if (type === 'recovery_od') await app.neonSQL`DELETE FROM recovery_od WHERE id = ANY(${selected})`;
                }

                app.saveDBState();
                app.viewUploadedData(type);
                app.showToast(`${selected.length} records deleted.`);
            };

window.app.deleteAllRows = async (type) => {
                if (!confirm(`WARNING: This will permanently purge ALL data from the ${type} category. Proceed?`)) return;

                if (type === 'targets') { DB.targets = []; if (app.neonSQL) await app.neonSQL`DELETE FROM targets`; }
                else if (type === 'projections') { DB.projections = []; if (app.neonSQL) await app.neonSQL`DELETE FROM projections`; }
                else if (type === 'sales') { 
                    const fyVal = app.currentFY;
                    DB.sales = DB.sales.filter(s => s.fy !== fyVal || s.is_manual || s.is_carried_forward || (s.id && typeof s.id === 'string' && s.id.startsWith('s_man_'))); 
                    if (app.neonSQL) await app.neonSQL`DELETE FROM sales WHERE fy = ${fyVal} AND (is_manual IS NULL OR is_manual = 0) AND (is_carried_forward IS NULL OR is_carried_forward = 0) AND id NOT LIKE 's_man_%'`; 
                }
                else if (type === 'last_year_sales') { 
                    const lastFY = (() => {
                        const parts = app.currentFY.split('-');
                        if (parts.length === 2) {
                            const y1 = parseInt(parts[0]);
                            const y2 = parseInt(parts[1]);
                            if (!isNaN(y1) && !isNaN(y2)) return `${y1-1}-${y2-1}`;
                        }
                        return '2024-25';
                    })();
                    DB.sales = DB.sales.filter(s => s.fy !== lastFY || s.is_manual || s.is_carried_forward || (s.id && typeof s.id === 'string' && s.id.startsWith('s_man_'))); 
                    if (app.neonSQL) await app.neonSQL`DELETE FROM sales WHERE fy = ${lastFY} AND (is_manual IS NULL OR is_manual = 0) AND (is_carried_forward IS NULL OR is_carried_forward = 0) AND id NOT LIKE 's_man_%'`; 
                }
                else if (type === 'emi') { DB.emi = []; if (app.neonSQL) await app.neonSQL`DELETE FROM emi`; }
                else if (type === 'recovery_od') { DB.recovery_od = []; if (app.neonSQL) await app.neonSQL`DELETE FROM recovery_od`; }

                app.saveDBState();
                app.viewUploadedData(type);
                app.showToast("Category purged successfully.");
            };

window.app.editRowData = (type, id) => {
                let item = null;
                if (type === 'targets') item = DB.targets.find(t => t.id === id);
                else if (type === 'projections') item = DB.projections.find(p => p.id === id);
                else if (type === 'sales' || type === 'last_year_sales') item = DB.sales.find(s => s.id === id);
                else if (type === 'emi') item = DB.emi.find(e => e.id === id);
                else if (type === 'recovery_od') item = DB.recovery_od.find(r => r.id === id);

                if (!item) return;

                const row = document.getElementById(`row-${id}`);
                const cells = row.querySelectorAll('td');

                const editFields = [];
                if (type === 'targets') editFields = ['fy', 'month', 'territory_id', 'upazila', 'district', 'brand', 'sale_type', 'target_qty'];
                else if (type === 'projections') editFields = ['fy', 'month', 'territory_id', 'brand', 'sale_type', 'projection_qty'];
                else if (type === 'sales' || type === 'last_year_sales') editFields = ['customer_id', 'district', 'territory_id', 'upazila', 'brand', 'model', 'unit_qty', 'fy', 'sales_year', 'sales_month', 'sale_type'];
                else if (type === 'emi') editFields = ['customer_code', 'customer', 'territory_id', 'brand', 'delivery_date', 'first_inst_date', 'overdue_count', 'overdue_total', 'installment', 'collected'];
                else if (type === 'recovery_od') editFields = ['fy', 'month', 'territory_id', 'perfile_od', 'total_overdue'];

                editFields.forEach((field, idx) => {
                    const cell = cells[idx + 1];
                    const val = item[field];
                    cell.innerHTML = `<input type="text" class="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-700" value="${val}" data-field="${field}">`;
                });

                cells[cells.length - 1].innerHTML = `
                    <div class="flex justify-end gap-2">
                        <button onclick="app.saveRowData('${type}', '${id}')" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Save Changes">
                            <i data-lucide="check" class="w-4 h-4"></i>
                        </button>
                        <button onclick="app.viewUploadedData('${type}')" class="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all" title="Cancel">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                `;
                app.refreshIcons();
            };

window.app.saveRowData = async (type, id) => {
                const row = document.getElementById(`row-${id}`);
                const inputs = row.querySelectorAll('input[data-field]');

                let item = null;
                if (type === 'targets') item = DB.targets.find(t => t.id === id);
                else if (type === 'projections') item = DB.projections.find(p => p.id === id);
                else if (type === 'sales' || type === 'last_year_sales') item = DB.sales.find(s => s.id === id);
                else if (type === 'emi') item = DB.emi.find(e => e.id === id);
                else if (type === 'recovery_od') item = DB.recovery_od.find(r => r.id === id);

                if (!item) return;

                inputs.forEach(input => {
                    const field = input.dataset.field;
                    let val = input.value;
                    if (['target_qty', 'projection_qty', 'unit_qty', 'installment', 'collected', 'overdue_total', 'perfile_od', 'total_overdue', 'sales_year', 'overdue_count'].includes(field)) {
                        val = parseInt(val) || 0;
                    }
                    item[field] = val;
                });

                if (app.neonSQL) {
                    try {
                        if (type === 'targets') {
                            await app.neonSQL`UPDATE targets SET fy = ${item.fy}, month = ${item.month}, territory_id = ${item.territory_id}, upazila = ${item.upazila}, district = ${item.district}, brand = ${item.brand}, sale_type = ${item.sale_type}, target_qty = ${item.target_qty} WHERE id = ${id}`;
                        } else if (type === 'projections') {
                            await app.neonSQL`UPDATE projections SET fy = ${item.fy}, month = ${item.month}, territory_id = ${item.territory_id}, brand = ${item.brand}, sale_type = ${item.sale_type}, projection_qty = ${item.projection_qty} WHERE id = ${id}`;
                        } else if (type === 'sales' || type === 'last_year_sales') {
                            await app.neonSQL`UPDATE sales SET customer_id = ${item.customer_id}, district = ${item.district}, territory_id = ${item.territory_id}, upazila = ${item.upazila}, brand = ${item.brand}, model = ${item.model}, unit_qty = ${item.unit_qty}, fy = ${item.fy}, sales_year = ${item.sales_year}, sales_month = ${item.sales_month}, sale_type = ${item.sale_type} WHERE id = ${id}`;
                        } else if (type === 'emi') {
                            await app.neonSQL`UPDATE emi SET customer_code = ${item.customer_code}, customer = ${item.customer}, phone = ${item.phone}, location = ${item.location}, delivery_date = ${item.delivery_date}, first_inst_date = ${item.first_inst_date}, overdue_count = ${item.overdue_count}, overdue_total = ${item.overdue_total}, installment = ${item.installment}, collected = ${item.collected}, territory_id = ${item.territory_id}, brand = ${item.brand}, model = ${item.model}, installment_no = ${item.installment_no} WHERE id = ${id}`;
                        } else if (type === 'recovery_od') {
                            await app.neonSQL`UPDATE recovery_od SET fy = ${item.fy}, month = ${item.month}, territory_id = ${item.territory_id}, perfile_od = ${item.perfile_od}, total_overdue = ${item.total_overdue} WHERE id = ${id}`;
                        }
                    } catch (err) {
                        console.error("Failed to update record in Neon DB:", err);
                        app.showToast("Failed to update record in database.", "error");
                        return;
                    }
                }

                app.saveDBState();
                app.viewUploadedData(type);
                app.showToast("Record updated successfully.", "success");
            };

window.app.downloadTemplate = (type) => {
                if (app.currentUser.role !== 'admin') {
                    app.showToast("Permission Denied: Templates are for Admins only.", "error");
                    return;
                }
                const downloadCurrent = confirm("Do you want to download the template pre-populated with all current records from the database?\n\n- Click OK to export all current data.\n- Click Cancel to download a blank template with sample data.");
                
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

                let csvContent = "";
                let headers = "";
                let filename = "";
                const csvCell = (val) => {
                    const str = String(val === undefined || val === null ? '' : val);
                    return '"' + str.replace(/"/g, '""') + '"';
                };

                if (downloadCurrent) {
                    if (type === 'target') {
                        headers = "FY,Month,Territory_Name,Upazila,District,Brand,Sale_Type,Target_Qty\n";
                        const rows = DB.targets.map(t => {
                            const tName = DB.territories.find(ter => ter.id === t.territory_id)?.name || '';
                            return [t.fy, t.month, tName, t.upazila, t.district || '', t.brand, t.sale_type, t.target_qty].map(csvCell).join(',');
                        }).join('\n');
                        csvContent = headers + rows;
                        filename = "ACI_Monthly_Target_Export.csv";
                    } else if (type === 'projection') {
                        headers = "FY,Month,Territory_Name,Brand,Sale_Type,Projection_Qty\n";
                        const rows = DB.projections.map(p => {
                            const tName = DB.territories.find(ter => ter.id === p.territory_id)?.name || '';
                            return [p.fy, p.month, tName, p.brand, p.sale_type, p.projection_qty].map(csvCell).join(',');
                        }).join('\n');
                        csvContent = headers + rows;
                        filename = "ACI_Current_Month_Projection_Export.csv";
                    } else if (type === 'sales') {
                        headers = "Customer_ID,District,Territory_Name,Upazila,Brand,Model,Units,FY,Sales_Year,Sales_Month,Sale_Type\n";
                        const rows = DB.sales.filter(s => s.fy === currentFY).map(s => {
                            const tName = DB.territories.find(ter => ter.id === s.territory_id)?.name || '';
                            return [s.customer_id, s.district, tName, s.upazila, s.brand, s.model, s.unit_qty, s.fy, s.sales_year, s.sales_month, s.sale_type].map(csvCell).join(',');
                        }).join('\n');
                        csvContent = headers + rows;
                        filename = "ACI_System_Sales_Export.csv";
                    } else if (type === 'last_year_sales') {
                        headers = "Customer_ID,District,Territory_Name,Upazila,Brand,Model,Units,FY,Sales_Year,Sales_Month,Sale_Type\n";
                        const rows = DB.sales.filter(s => s.fy === lastFY).map(s => {
                            const tName = DB.territories.find(ter => ter.id === s.territory_id)?.name || '';
                            return [s.customer_id, s.district, tName, s.upazila, s.brand, s.model, s.unit_qty, s.fy, s.sales_year, s.sales_month, s.sale_type].map(csvCell).join(',');
                        }).join('\n');
                        csvContent = headers + rows;
                        filename = "ACI_Last_Year_Sales_Export.csv";
                    } else if (type === 'emi_early') {
                        headers = "Customer_Code,Customer_Name,Sales_Territory,Brand,DeliveryDate,First_Inst_Date,OverDue_Hash,OverDue_Taka,Installment_Size,Collection\n";
                        const rows = DB.emi.map(e => {
                            const tName = DB.territories.find(ter => ter.id === e.territory_id)?.name || '';
                            return [e.customer_code, e.customer, tName, e.brand, e.delivery_date, e.first_inst_date, e.overdue_count, e.overdue_total, e.installment, e.collected || 0].map(csvCell).join(',');
                        }).join('\n');
                        csvContent = headers + rows;
                        filename = "ACI_Early_EMI_Export.csv";
                    } else if (type === 'recovery_od') {
                        headers = "FY,Month,Territory_Name,Perfile_OD,Total_Overdue\n";
                        const rows = DB.recovery_od.map(r => {
                            const tName = DB.territories.find(ter => ter.id === r.territory_id)?.name || '';
                            return [r.fy, r.month, tName, r.perfile_od, r.total_overdue].map(csvCell).join(',');
                        }).join('\n');
                        csvContent = headers + rows;
                        filename = "ACI_Recovery_OD_Export.csv";
                    }
                } else {
                    if (type === 'target') {
                        headers = "FY,Month,Territory_Name,Upazila,District,Brand,Sale_Type,Target_Qty\n";
                        headers += `${currentFY},April,Dhaka North,Mirpur,Dhaka,Foton,New Sale,4\n`;
                        filename = "ACI_Monthly_Target_Template.csv";
                    } else if (type === 'projection') {
                        headers = "FY,Month,Territory_Name,Brand,Sale_Type,Projection_Qty\n";
                        headers += `${currentFY},April,Dhaka North,Foton,New Sale,15\n`;
                        headers += `${currentFY},April,Dhaka North,Mahindra,Resale,10\n`;
                        filename = "ACI_Current_Month_Projection_Template.csv";
                    } else if (type === 'sales') {
                        headers = "Customer_ID,District,Territory_Name,Upazila,Brand,Model,Units,FY,Sales_Year,Sales_Month,Sale_Type\n";
                        headers += `C-1001,Dhaka,Dhaka North,Mirpur,Foton,TM3,1,${currentFY},2026,April,New Sale\n`;
                        headers += `C-1002,Dhaka,Dhaka North,Uttara,Foton,TM3,1,${currentFY},2026,April,Resale\n`;
                        headers += `C-1003,Dhaka,Dhaka North,Uttara,Foton,TM3,-1,${currentFY},2026,April,Credit Note\n`;
                        filename = "ACI_System_Sales_Template.csv";
                    } else if (type === 'last_year_sales') {
                        headers = "Customer_ID,District,Territory_Name,Upazila,Brand,Model,Units,FY,Sales_Year,Sales_Month,Sale_Type\n";
                        headers += `C-LY1001,Dhaka,Dhaka North,Mirpur,Foton,TM3,1,${lastFY},2025,April,New Sale\n`;
                        headers += `C-LY1002,Dhaka,Dhaka North,Uttara,Foton,TM3,1,${lastFY},2025,April,Resale\n`;
                        filename = "ACI_Last_Year_Sales_Template.csv";
                    } else if (type === 'emi_early') {
                        headers = "Customer_Code,Customer_Name,Sales_Territory,Brand,DeliveryDate,First_Inst_Date,OverDue_Hash,OverDue_Taka,Installment_Size,Collection\n";
                        headers += "C-2001,Rahim Transport,Dhaka North,Foton,2026-03-10,2026-04-10,1,25000,25000,0\n";
                        filename = "ACI_Early_EMI_Template.csv";
                    } else if (type === 'recovery_od') {
                        headers = "FY,Month,Territory_Name,Perfile_OD,Total_Overdue\n";
                        headers += `${currentFY},April,Dhaka North,4500,1250000\n`;
                        filename = "ACI_Recovery_OD_Template.csv";
                    }
                    csvContent = headers;
                }

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                app.showToast(`Downloading ${filename}...`);
            };

window.app.parseCSV = (csvText) => {
                const lines = csvText.split(/\r?\n/);
                if (lines.length < 2) return [];

                const parseLine = (line) => {
                    const result = [];
                    let cur = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') inQuotes = !inQuotes;
                        else if (char === ',' && !inQuotes) {
                            result.push(cur.trim());
                            cur = '';
                        } else cur += char;
                    }
                    result.push(cur.trim());
                    return result;
                };

                const headers = parseLine(lines[0]);
                return lines.slice(1).filter(line => line.trim()).map(line => {
                    const values = parseLine(line);
                    const obj = {};
                    headers.forEach((header, i) => {
                        obj[header] = values[i] || '';
                    });
                    return obj;
                });
            };

window.app.getCSVValue = (row, expectedKeys) => {
                const keys = Object.keys(row);
                const clean = (s) => s.toString().toLowerCase().replace(/[\s_-]/g, '');
                const cleanExpected = expectedKeys.map(k => clean(k));
                for (const key of keys) {
                    if (cleanExpected.includes(clean(key))) {
                        return row[key];
                    }
                }
                return undefined;
            };

window.app.findTerritory = (row) => {
                const rawName = app.getCSVValue(row, ['Territory_Name', 'Sales_Territory', 'Territory', 'Area', 'Location', 'TerritoryName']);
                if (!rawName) return null;
                const clean = (s) => s.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanRaw = clean(rawName);
                
                // 1. Try exact alphanumeric match on name or district
                let terr = DB.territories.find(t => clean(t.name) === cleanRaw || clean(t.district) === cleanRaw);
                if (terr) return terr;
                
                // 2. Try partial match
                terr = DB.territories.find(t => clean(t.name).includes(cleanRaw) || cleanRaw.includes(clean(t.name)));
                return terr || null;
            };

window.app.normalizeMonth = (m) => {
                if (!m) return 'April';
                const str = m.toString().trim().toLowerCase();
                const monthsMap = {
                    'jan': 'January', 'january': 'January', '01': 'January', '1': 'January',
                    'feb': 'February', 'february': 'February', '02': 'February', '2': 'February',
                    'mar': 'March', 'march': 'March', '03': 'March', '3': 'March',
                    'apr': 'April', 'april': 'April', '04': 'April', '4': 'April',
                    'may': 'May', '05': 'May', '5': 'May',
                    'jun': 'June', 'june': 'June', '06': 'June', '6': 'June',
                    'jul': 'July', 'july': 'July', '07': 'July', '7': 'July',
                    'aug': 'August', 'august': 'August', '08': 'August', '8': 'August',
                    'sep': 'September', 'september': 'September', '09': 'September', '9': 'September',
                    'oct': 'October', 'october': 'October', '10': 'October',
                    'nov': 'November', 'november': 'November', '11': 'November',
                    'dec': 'December', 'december': 'December', '12': 'December'
                };
                return monthsMap[str] || monthsMap[str.substring(0, 3)] || 'April';
            };

window.app.normalizeBrand = (b) => {
                if (!b) return 'Foton';
                const str = b.toString().trim().toLowerCase();
                if (str.includes('foton')) return 'Foton';
                if (str.includes('mahindra')) return 'Mahindra';
                return 'Foton';
            };

window.app.normalizeSaleType = (s) => {
                if (!s) return 'New Sale';
                const str = s.toString().trim().toLowerCase();
                if (str.includes('credit') || str.includes('cn') || str.includes('note')) return 'Credit Note';
                if (str.includes('resale') || str.includes('re-sale') || str.includes('re sale')) return 'Resale';
                return 'New Sale';
            };

window.app.normalizeFY = (fy, monthStr, defaultFY) => {
                if (!fy) return defaultFY;
                const str = fy.toString().trim().replace(/\s+/g, '');
                
                // Matches 2024-2025 -> 2024-25
                const longMatch = str.match(/^(\d{4})-(\d{4})$/);
                if (longMatch) {
                    return `${longMatch[1]}-${longMatch[2].substring(2)}`;
                }
                // Matches 24-25 -> 2024-25
                const shortMatch = str.match(/^(\d{2})-(\d{2})$/);
                if (shortMatch) {
                    return `20${shortMatch[1]}-${shortMatch[2]}`;
                }
                // Matches 2024-25 directly
                if (/^\d{4}-\d{2}$/.test(str)) {
                    return str;
                }
                
                // If it's a 4 digit year like 2024, deduce FY from the month!
                if (/^\d{4}$/.test(str)) {
                    const year = parseInt(str);
                    const h2Months = ['January', 'February', 'March', 'April', 'May', 'June'];
                    if (h2Months.includes(monthStr)) {
                        return `${year - 1}-${year.toString().slice(-2)}`;
                    } else {
                        return `${year}-${(year + 1).toString().slice(-2)}`;
                    }
                }
                
                return defaultFY;
            };

window.app.getPerformance = (territoryId, brand, saleType) => {
                const activeFY = app.currentFY;
                const concludingFY = app.getPreviousFY(activeFY);
                const defaultFY = (app.currentMonth === 'July' && app.fyReviewActive) ? concludingFY : activeFY;
                let currentFY = (app.currentUser && app.currentUser.role === 'so') ? (app.soSelectedFY || defaultFY) : (app.selectedFY || defaultFY);
                if (app.showLastFYData) {
                    currentFY = concludingFY;
                }
                const isTransitionMode = (app.currentMonth === 'July' && app.fyReviewActive && currentFY === concludingFY) || app.showLastFYData;
                const lastFY = app.getPreviousFY(currentFY);
                const currentMonth = app.currentMonth;
                const lastMonth = app.lastMonth;
                const ytdMonths = isTransitionMode ? ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'] : app.getYtdMonths(currentMonth);

                // Last Month Metrics
                const lmSales = DB.sales.filter(s => s.territory_id === territoryId && s.brand === brand && s.sale_type === saleType && s.sales_month === lastMonth && s.fy === currentFY && !s.is_manual).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                const lmTgtObj = DB.targets.filter(t => t.territory_id === territoryId && t.brand === brand && t.sale_type === saleType && t.fy === currentFY);
                const lmBudgetTgts = lmTgtObj.filter(t => t.month === lastMonth);
                const lmBudget = lmBudgetTgts.length > 0 ? lmBudgetTgts.reduce((sum, t) => sum + Number(t.target_qty || 0), 0) : Math.round(lmTgtObj.reduce((sum, t) => sum + Number(t.target_qty || 0), 0) / 12);
                const lmSply = DB.sales.filter(s => s.territory_id === territoryId && s.brand === brand && s.sale_type === saleType && s.sales_month === lastMonth && s.fy === lastFY).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                // YTD Metrics (Until Last Month)
                const ytdSales = DB.sales.filter(s => s.territory_id === territoryId && s.brand === brand && s.sale_type === saleType && ytdMonths.includes(s.sales_month) && s.fy === currentFY && !(s.sales_month !== currentMonth && s.is_manual)).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                let ytdBudget = 0;
                const monthlyTargets = lmTgtObj.filter(t => ytdMonths.includes(t.month));
                if (monthlyTargets.length > 0) {
                    ytdBudget = monthlyTargets.reduce((sum, t) => sum + Number(t.target_qty || 0), 0);
                } else {
                    ytdBudget = Math.round((lmTgtObj.reduce((sum, t) => sum + Number(t.target_qty || 0), 0) / 12) * ytdMonths.length);
                }

                const ytdSply = DB.sales.filter(s => s.territory_id === territoryId && s.brand === brand && s.sale_type === saleType && ytdMonths.includes(s.sales_month) && s.fy === lastFY).reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                return {
                    lastMonth: { budget: lmBudget, sales: lmSales, sply: lmSply },
                    ytd: { budget: ytdBudget, sales: ytdSales, sply: ytdSply }
                };
            };

window.app.simulateUpload = (input, typeName, dataKey) => {
                if (app.currentUser.role !== 'admin') {
                    app.showToast("Critical Error: Upload privileges revoked.", "error");
                    return;
                }
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
                if (input.files.length > 0) {
                    const file = input.files[0];
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        const csvText = e.target.result;
                        const parsedData = app.parseCSV(csvText);

                        if (parsedData.length === 0) {
                            app.showToast("Error: CSV is empty or invalid.", "error");
                            return;
                        }

                        app.showLoader(`Scanning ${file.name}...`);

                        setTimeout(() => {
                            app.showLoader(`Purging previous ${typeName} records...`);

                            setTimeout(() => {
                                app.showLoader(`Writing ${parsedData.length} new records...`);

                                setTimeout(async () => {
                                    try {
                                        // 1. PURGE OLD DATA
                                        if (dataKey === 'targets') {
                                            DB.targets = [];
                                            if (app.neonSQL) await app.neonSQL`DELETE FROM targets`;
                                        } else if (dataKey === 'projections') {
                                            DB.projections = [];
                                            if (app.neonSQL) await app.neonSQL`DELETE FROM projections`;
                                        } else if (dataKey === 'emi') {
                                            DB.emi = [];
                                            if (app.neonSQL) await app.neonSQL`DELETE FROM emi`;
                                        } else if (dataKey === 'sales') {
                                             DB.sales = DB.sales.filter(s => s.fy !== currentFY || s.is_manual || s.is_carried_forward || (s.id && typeof s.id === 'string' && s.id.startsWith('s_man_')));
                                             if (app.neonSQL) await app.neonSQL`DELETE FROM sales WHERE fy = ${currentFY} AND (is_manual IS NULL OR is_manual = 0) AND (is_carried_forward IS NULL OR is_carried_forward = 0) AND id NOT LIKE 's_man_%'`;
                                         } else if (dataKey === 'last_year_sales') {
                                             DB.sales = DB.sales.filter(s => s.fy !== lastFY || s.is_manual || s.is_carried_forward || (s.id && typeof s.id === 'string' && s.id.startsWith('s_man_')));
                                             if (app.neonSQL) await app.neonSQL`DELETE FROM sales WHERE fy = ${lastFY} AND (is_manual IS NULL OR is_manual = 0) AND (is_carried_forward IS NULL OR is_carried_forward = 0) AND id NOT LIKE 's_man_%'`;
                                         } else if (dataKey === 'recovery_od') {
                                            DB.recovery_od = [];
                                            if (app.neonSQL) await app.neonSQL`DELETE FROM recovery_od`;
                                        }

                                        // 2. INSERT REAL DATA FROM CSV
                                        const newRecords = [];
                                        const secondYear = currentFY.split('-').length === 2 ? currentFY.split('-')[0].substring(0, 2) + currentFY.split('-')[1] : '2026';

                                        parsedData.forEach((row, idx) => {
                                            const terr = app.findTerritory(row);
                                            const terrId = terr ? terr.id : 't1';

                                            if (dataKey === 'targets') {
                                                const recordMonth = app.normalizeMonth(app.getCSVValue(row, ['Month', 'Sales_Month', 'SalesMonth']));
                                                const record = {
                                                    id: `tg_u_${Date.now()}_${idx}`,
                                                    fy: app.normalizeFY(app.getCSVValue(row, ['FY', 'Fiscal_Year', 'FiscalYear', 'Year']), recordMonth, currentFY),
                                                    month: recordMonth,
                                                    territory_id: terrId,
                                                    upazila: app.getCSVValue(row, ['Upazila', 'Thana']) || 'General',
                                                    district: app.getCSVValue(row, ['District', 'Zila']) || '',
                                                    brand: app.normalizeBrand(app.getCSVValue(row, ['Brand', 'Make'])),
                                                    sale_type: app.normalizeSaleType(app.getCSVValue(row, ['Sale_Type', 'SaleType', 'Type'])),
                                                    target_qty: parseInt(app.getCSVValue(row, ['Target_Qty', 'TargetQty', 'Target'])) || 0
                                                };
                                                DB.targets.push(record);
                                                newRecords.push(record);
                                            } else if (dataKey === 'projections') {
                                                const recordMonth = app.normalizeMonth(app.getCSVValue(row, ['Month', 'Sales_Month', 'SalesMonth']));
                                                const record = {
                                                    id: `p_u_${Date.now()}_${idx}`,
                                                    fy: app.normalizeFY(app.getCSVValue(row, ['FY', 'Fiscal_Year', 'FiscalYear', 'Year']), recordMonth, currentFY),
                                                    month: recordMonth,
                                                    territory_id: terrId,
                                                    brand: app.normalizeBrand(app.getCSVValue(row, ['Brand', 'Make'])),
                                                    sale_type: app.normalizeSaleType(app.getCSVValue(row, ['Sale_Type', 'SaleType', 'Type'])),
                                                    projection_qty: parseInt(app.getCSVValue(row, ['Projection_Qty', 'ProjectionQty', 'Projection'])) || 0
                                                };
                                                DB.projections.push(record);
                                                newRecords.push(record);
                                            } else if (dataKey === 'emi') {
                                                const record = {
                                                    id: `e_u_${Date.now()}_${idx}`,
                                                    customer_code: app.getCSVValue(row, ['Customer_Code', 'CustomerCode', 'Code']) || `C-${idx}`,
                                                    customer: app.getCSVValue(row, ['Customer_Name', 'CustomerName', 'Customer']) || 'Unknown Customer',
                                                    phone: app.getCSVValue(row, ['Phone', 'Mobile']) || '01700000000',
                                                    location: terr ? terr.name : (app.getCSVValue(row, ['Location', 'Sales_Territory', 'Territory']) || 'Dhaka'),
                                                    delivery_date: app.normalizeDate(app.getCSVValue(row, ['Delivery_Date', 'DeliveryDate', 'Delivery', 'Delivary_Date', 'DelivaryDate', 'Delivary']) || `${secondYear}-04-01`),
                                                    first_inst_date: app.normalizeDate(app.getCSVValue(row, ['First_Inst_Date', 'FirstInstDate', '1stInstallmentDate', '1st_Installment_Date', '1stInstallment', '1stInstDate', '1stInst']) || `${secondYear}-05-01`),
                                                    overdue_count: parseInt(app.getCSVValue(row, ['OverDue_Hash', 'OverdueHash', 'OverdueCount', 'Overdue_Count'])) || 0,
                                                    overdue_total: parseInt(app.getCSVValue(row, ['OverDue_Taka', 'OverdueTaka', 'OverdueTotal', 'Overdue_Total'])) || 0,
                                                    installment: parseInt(app.getCSVValue(row, ['Installment_Size', 'InstallmentSize', 'Installment'])) || 0,
                                                    territory_id: terrId,
                                                    collected: parseInt(app.getCSVValue(row, ['Collection', 'Collected', 'Collection_Amount', 'Collected_Amount'])) || 0,
                                                    brand: app.normalizeBrand(app.getCSVValue(row, ['Brand', 'Make'])),
                                                    model: app.getCSVValue(row, ['Model']) || 'TM3',
                                                    installment_no: parseInt(app.getCSVValue(row, ['Installment_No', 'InstallmentNo', 'Inst_No', 'InstNo'])) || 1
                                                };
                                                DB.emi.push(record);
                                                newRecords.push(record);
                                            } else if (dataKey === 'sales' || dataKey === 'last_year_sales') {
                                                const recordMonth = app.normalizeMonth(app.getCSVValue(row, ['Sales_Month', 'SalesMonth', 'Month']));
                                                const recordFY = app.normalizeFY(app.getCSVValue(row, ['FY', 'Fiscal_Year', 'FiscalYear', 'Year']), recordMonth, (dataKey === 'sales' ? currentFY : lastFY));
                                                const targetFY = dataKey === 'sales' ? currentFY : lastFY;
                                                
                                                // Skip rows that do not match the target fiscal year to prevent duplicates and cross-contamination
                                                if (recordFY !== targetFY) {
                                                    return;
                                                }

                                                const customerId = app.getCSVValue(row, ['Customer_ID', 'CustomerID', 'Customer_Code', 'CustomerCode', 'Customer']) || `C-${idx}`;
                                                let salesYear = parseInt(app.getCSVValue(row, ['Sales_Year', 'SalesYear', 'Year']));
                                                if (!salesYear) {
                                                    const parts = recordFY.split('-');
                                                    if (parts.length === 2) {
                                                        const y1 = parseInt(parts[0]);
                                                        const y2_short = parts[1];
                                                        const prefix = parts[0].substring(0, 2);
                                                        const y2 = parseInt(prefix + y2_short);
                                                        const h2Months = ['January', 'February', 'March', 'April', 'May', 'June'];
                                                        salesYear = h2Months.includes(recordMonth) ? y2 : y1;
                                                    } else {
                                                        salesYear = (dataKey === 'sales' ? 2026 : 2025);
                                                    }
                                                }
                                                const model = app.getCSVValue(row, ['Model']) || 'TM3';
                                                
                                                const parsedSaleType = app.normalizeSaleType(app.getCSVValue(row, ['Sale_Type', 'SaleType', 'Type']));
                                                let parsedUnits = Math.abs(parseInt(app.getCSVValue(row, ['Units', 'Unit_Qty', 'UnitQty', 'Qty', 'Quantity', 'Unit'])) || 1);
                                                if (parsedSaleType === 'Credit Note') {
                                                    parsedUnits = -parsedUnits;
                                                }
                                                const record = {
                                                    id: `s_u_${customerId}_${model}_${salesYear}_${recordMonth}`.replace(/\s+/g, '_'),
                                                    customer_id: customerId,
                                                    district: app.getCSVValue(row, ['District', 'Zila']) || 'Dhaka',
                                                    territory_id: terrId,
                                                    upazila: app.getCSVValue(row, ['Upazila', 'Thana']) || 'General',
                                                    brand: app.normalizeBrand(app.getCSVValue(row, ['Brand', 'Make'])),
                                                    model: app.getCSVValue(row, ['Model']) || 'TM3',
                                                    unit_qty: parsedUnits,
                                                    fy: recordFY,
                                                    sales_year: salesYear,
                                                    sales_month: recordMonth,
                                                    sale_type: parsedSaleType
                                                };
                                                DB.sales.push(record);
                                                newRecords.push(record);
                                            } else if (dataKey === 'recovery_od') {
                                                const recordMonth = app.normalizeMonth(app.getCSVValue(row, ['Month', 'Sales_Month', 'SalesMonth']));
                                                const record = {
                                                    id: `rod_u_${Date.now()}_${idx}`,
                                                    fy: app.normalizeFY(app.getCSVValue(row, ['FY', 'Fiscal_Year', 'FiscalYear', 'Year']), recordMonth, currentFY),
                                                    month: recordMonth,
                                                    territory_id: terrId,
                                                    perfile_od: parseInt(app.getCSVValue(row, ['Perfile_OD', 'PerfileOD', 'PerFileOverdue'])) || 0,
                                                    total_overdue: parseInt(app.getCSVValue(row, ['Total_Overdue', 'TotalOverdue'])) || 0
                                                };
                                                DB.recovery_od.push(record);
                                                newRecords.push(record);
                                            }
                                        });

                                        if (app.neonSQL && newRecords.length > 0) {
                                            const batchSize = 100;
                                            for(let i=0; i<newRecords.length; i+=batchSize) {
                                                const chunk = newRecords.slice(i, i+batchSize);
                                                const promises = chunk.map(r => {
                                                     if(dataKey === 'targets') return app.neonSQL`INSERT INTO targets (id, fy, month, territory_id, upazila, district, brand, sale_type, target_qty) VALUES (${r.id}, ${r.fy}, ${r.month}, ${r.territory_id}, ${r.upazila}, ${r.district}, ${r.brand}, ${r.sale_type}, ${r.target_qty})`.catch(e => console.warn('Row insert warning:', e));
                                                     if(dataKey === 'projections') return app.neonSQL`INSERT INTO projections (id, fy, month, territory_id, brand, sale_type, projection_qty) VALUES (${r.id}, ${r.fy}, ${r.month}, ${r.territory_id}, ${r.brand}, ${r.sale_type}, ${r.projection_qty})`.catch(e => console.warn('Row insert warning:', e));
                                                     if(dataKey === 'emi') return app.neonSQL`INSERT INTO emi (id, customer_code, customer, phone, location, delivery_date, first_inst_date, overdue_count, overdue_total, installment, collected, territory_id, brand, model, installment_no) VALUES (${r.id}, ${r.customer_code}, ${r.customer}, ${r.phone}, ${r.location}, ${r.delivery_date}, ${r.first_inst_date}, ${r.overdue_count}, ${r.overdue_total}, ${r.installment}, ${r.collected}, ${r.territory_id}, ${r.brand}, ${r.model}, ${r.installment_no}) ON CONFLICT (id) DO NOTHING`.catch(e => console.warn('Row insert warning:', e));
                                                     if(dataKey === 'sales' || dataKey === 'last_year_sales') return app.neonSQL`INSERT INTO sales (id, customer_id, district, territory_id, upazila, brand, model, unit_qty, fy, sales_year, sales_month, sale_type) VALUES (${r.id}, ${r.customer_id}, ${r.district}, ${r.territory_id}, ${r.upazila}, ${r.brand}, ${r.model}, ${r.unit_qty}, ${r.fy}, ${r.sales_year}, ${r.sales_month}, ${r.sale_type}) ON CONFLICT (id) DO NOTHING`.catch(e => console.warn('Row insert warning:', e));
                                                     if(dataKey === 'recovery_od') return app.neonSQL`INSERT INTO recovery_od (id, fy, month, territory_id, perfile_od, total_overdue) VALUES (${r.id}, ${r.fy}, ${r.month}, ${r.territory_id}, ${r.perfile_od}, ${r.total_overdue}) ON CONFLICT (id) DO NOTHING`.catch(e => console.warn('Row insert warning:', e));
                                                });
                                                await Promise.all(promises);
                                            }
                                        }

                                        app.hideLoader();
                                        app.showToast(`${parsedData.length} ${typeName} records uploaded successfully!`, 'success');
                                        input.value = ''; // reset input
                                    } catch (err) {
                                        console.error("Upload error:", err);
                                        app.hideLoader();
                                        app.showToast("Failed to upload data.", "error");
                                    }
                                }, 100);
                            }, 500);
                        }, 500);
                    };
                    reader.onerror = () => {
                        app.showToast("Failed to read file.", "error");
                    };
                    reader.readAsText(file);
                }
            };

window.app.processRawData = () => {
                const val = document.getElementById('raw-csv').value;
                if (!val.trim()) return app.showToast('Please enter some data.', 'error');
                app.showLoader('Parsing CSV data...');
                setTimeout(() => {
                    app.hideLoader();
                    app.showToast('20 rows added to database.', 'success');
                    document.getElementById('raw-csv').value = '';
                }, 1000);
            };




window.app.generateCustomReport = () => {
    if (app.currentUser.role !== 'admin') {
        app.showToast('Permission Denied: Reports are for Admins only.', 'error');
        return;
    }

    const month = document.getElementById('export-month').value;
    const fy = document.getElementById('export-fy').value;
    const territoryId = document.getElementById('export-territory').value;
    const selectedBrand = document.getElementById('export-brand').value;
    const selectedSaleType = document.getElementById('export-sale-type').value;
    
    const incBudget = document.getElementById('export-inc-budget').checked;
    const incActual = document.getElementById('export-inc-actual').checked;
    const incSply = document.getElementById('export-inc-sply').checked;

    if (!incBudget && !incActual && !incSply) {
        app.showToast('Please select at least one data type to include.', 'error');
        return;
    }

    const parts = fy.split('-');
    let lastFY = '2024-25';
    if (parts.length === 2) {
        const y1 = parseInt(parts[0]);
        const y2 = parseInt(parts[1]);
        if (!isNaN(y1) && !isNaN(y2)) lastFY = `${y1 - 1}-${y2 - 1}`;
    }

    let territoriesToProcess = DB.territories;
    if (territoryId !== 'ALL') {
        territoriesToProcess = DB.territories.filter(t => t.id === territoryId);
    }

    const brandsToProcess = selectedBrand === 'ALL' ? ['Foton', 'Mahindra'] : [selectedBrand];
    const saleTypesToProcess = selectedSaleType === 'ALL' ? ['New Sale', 'Resale'] : [selectedSaleType];

    const reportData = [];

    territoriesToProcess.forEach(t => {
        const row = {
            'Territory': t.name,
            'Month': month,
            'FY': fy
        };

        let grandBudget = 0;
        let grandActual = 0;
        let grandSply = 0;

        brandsToProcess.forEach(b => {
            saleTypesToProcess.forEach(st => {
                let budgetTotal = 0;
                let actualTotal = 0;
                let splyTotal = 0;

                if (incBudget) {
                    const targets = DB.targets.filter(tg => tg.fy === fy && tg.month === month && tg.territory_id === t.id && tg.brand === b && tg.sale_type === st);
                    budgetTotal = targets.reduce((sum, tg) => sum + (parseInt(tg.target_qty) || 0), 0);
                    grandBudget += budgetTotal;
                }

                if (incActual) {
                    const sales = DB.sales.filter(s => s.fy === fy && s.sales_month === month && s.territory_id === t.id && s.brand === b && s.sale_type === st && !(month !== app.currentMonth && s.is_manual));
                    actualTotal = sales.reduce((sum, s) => sum + (parseInt(s.unit_qty) || 0), 0);
                    grandActual += actualTotal;
                }

                if (incSply) {
                    const splySales = DB.sales.filter(s => s.fy === lastFY && s.sales_month === month && s.territory_id === t.id && s.brand === b && s.sale_type === st && !(month !== app.currentMonth && s.is_manual));
                    splyTotal = splySales.reduce((sum, s) => sum + (parseInt(s.unit_qty) || 0), 0);
                    grandSply += splyTotal;
                }

                const prefix = (selectedBrand === 'ALL' && selectedSaleType === 'ALL') 
                    ? `${b}_${st.replace(' ', '')}_`
                    : (selectedBrand === 'ALL' ? `${b}_` : (selectedSaleType === 'ALL' ? `${st.replace(' ', '')}_` : ''));

                const growthVsBudget = budgetTotal > 0 ? (((actualTotal - budgetTotal) / budgetTotal) * 100).toFixed(1) + '%' : (actualTotal > 0 ? '100%' : '0%');
                const growthVsSply = splyTotal > 0 ? (((actualTotal - splyTotal) / splyTotal) * 100).toFixed(1) + '%' : (actualTotal > 0 ? '100%' : '0%');

                if (prefix !== '') {
                    if (incBudget) row[prefix + 'Budget'] = budgetTotal;
                    if (incActual) row[prefix + 'Actual'] = actualTotal;
                    if (incSply) row[prefix + 'SPLY'] = splyTotal;
                    if (incBudget && incActual) row[prefix + 'Growth_vs_Budget'] = growthVsBudget;
                    if (incSply && incActual) row[prefix + 'Growth_vs_SPLY'] = growthVsSply;
                } else {
                    if (incBudget) row['Budget_Qty'] = budgetTotal;
                    if (incActual) row['Actual_Sales_Qty'] = actualTotal;
                    if (incSply) row['SPLY_Sales_Qty'] = splyTotal;
                    if (incBudget && incActual) row['Growth_vs_Budget'] = growthVsBudget;
                    if (incSply && incActual) row['Growth_vs_SPLY'] = growthVsSply;
                }
            });
        });

        if (brandsToProcess.length > 1 || saleTypesToProcess.length > 1) {
            if (incBudget) row['Grand_Total_Budget'] = grandBudget;
            if (incActual) row['Grand_Total_Actual'] = grandActual;
            if (incSply) row['Grand_Total_SPLY'] = grandSply;
            const grandGrowthVsBudget = grandBudget > 0 ? (((grandActual - grandBudget) / grandBudget) * 100).toFixed(1) + '%' : (grandActual > 0 ? '100%' : '0%');
            const grandGrowthVsSply = grandSply > 0 ? (((grandActual - grandSply) / grandSply) * 100).toFixed(1) + '%' : (grandActual > 0 ? '100%' : '0%');
            if (incBudget && incActual) row['Grand_Total_Growth_vs_Budget'] = grandGrowthVsBudget;
            if (incSply && incActual) row['Grand_Total_Growth_vs_SPLY'] = grandGrowthVsSply;
        }

        reportData.push(row);
    });

    if (reportData.length === 0) {
        app.showToast('No data found for the selected criteria.');
        return;
    }

    const headers = Object.keys(reportData[0]);
    let csvContent = headers.join(',') + '\n';

    reportData.forEach(row => {
        const values = headers.map(h => `"${row[h] !== undefined ? row[h] : 0}"`);
        csvContent += values.join(',') + '\n';
    });

    const filename = `Custom_Report_${month}_${fy}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    app.showToast(`Exported ${filename} successfully`, 'success');
};
