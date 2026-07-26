renderAdminSalesMap: (keepDropdownOpen = false) => {
                localStorage.setItem('aci_last_page', 'map');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                app.setupSidebar();

                if (typeof app.mapMonths === 'undefined') app.mapMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const brandTab = app.mapBrandTab || 'Foton';
                const modelTab = app.mapModelTab || 'All';
                const districtTab = app.mapDistrictTab || 'All';
                const viewMode = app.mapViewMode || 'district';
                if (typeof app.mapSaleType === 'undefined') app.mapSaleType = 'New Sale';
                const saleTypeTab = app.mapSaleType;
                const currentFY = app.selectedFY || app.currentFY;

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
                
                // Get unique districts from actual imported sales data instead of the territory mapping
                const allDistricts = [...new Set(DB.sales.map(s => s.district).filter(Boolean))].sort();
                const allUpazilas = [...new Set(DB.sales.filter(s => s.fy === currentFY && (districtTab === 'All' || s.district === districtTab)).map(s => s.upazila).filter(Boolean))].sort();

                // Rank areas for side panel
                const rankedAreas = Object.entries(dataAgg).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);

                const allMonths = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];

                const html = `
                    <div class="w-full fade-in pb-10 h-full flex flex-col">
                        
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
                                
                                <!-- Model Filter -->
                                <div class="flex items-center gap-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Model</label>
                                    <select onchange="app.mapModelTab=this.value; app.renderAdminSalesMap()" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors">
                                        <option value="All">All Models</option>
                                        ${activeModels.map(m => `<option value="${m.name}" ${modelTab === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                                    </select>
                                </div>
                                
                                <!-- Month Multi-Select -->
                                <div class="flex items-center gap-2 relative">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Month</label>
                                    <button onclick="document.getElementById('map-month-dropdown').classList.toggle('hidden')" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors flex items-center justify-between min-w-[100px]">
                                        <span>${app.mapMonths.length === 12 ? 'All FY' : app.mapMonths.length + ' Selected'}</span>
                                        <i data-lucide="chevron-down" class="w-4 h-4 ml-2"></i>
                                    </button>
                                    <div id="map-month-dropdown" onmouseleave="this.classList.add('hidden')" class="${keepDropdownOpen === true ? '' : 'hidden'} absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto">
                                        <div class="p-2 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                            <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-bold text-slate-700 transition-colors">
                                                <input type="checkbox" onchange="app.mapMonths = this.checked ? ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'] : []; app.renderAdminSalesMap(true)" ${app.mapMonths.length === 12 ? 'checked' : ''} class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4">
                                                Select All FY
                                            </label>
                                        </div>
                                        <div class="p-2 space-y-0.5">
                                            ${allMonths.map(m => `
                                                <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-600 transition-colors">
                                                    <input type="checkbox" onchange="app.toggleMapMonth('${m}')" ${app.mapMonths.includes(m) ? 'checked' : ''} class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4">
                                                    ${m}
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Map & Insights Layout (Fits screen by default) -->
                        <div class="flex flex-col lg:flex-row gap-6 h-[950px] lg:h-[530px] relative z-10">
                            
                            <!-- Leaflet Map Container (Fits remaining height) -->
                            <div class="flex-1 glass rounded-2xl relative overflow-hidden bg-slate-50 border border-slate-200 shadow-inner flex flex-col h-[500px] lg:h-full">
                                
                                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-sm z-20">
                                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Sales Density (${viewMode})</p>
                                    <div class="flex items-center gap-2">
                                        <span class="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span><span class="text-xs font-semibold text-slate-600 mr-2">Low</span>
                                        <span class="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span><span class="text-xs font-semibold text-slate-600 mr-2">Med</span>
                                        <span class="w-3 h-3 rounded-full bg-rose-600 shadow-sm"></span><span class="text-xs font-semibold text-slate-600">High</span>
                                    </div>
                                </div>

                                <!-- Real Interactive BD Map -->
                                <div id="real-bd-map" style="min-height:480px; height:100%; width:100%; position:relative; z-index:1;" class="w-full h-full rounded-2xl overflow-hidden shadow-inner bg-slate-100"></div>
                            </div>

                            <!-- Right Sidebar List (Scrollable Districts/Upazilas) -->
                            <div class="w-full lg:w-80 shrink-0 h-[400px] lg:h-full">
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
                                            const listItems = (viewMode === 'district' ? allDistricts : allUpazilas).map(name => {
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

                const mapCoords = {
                    // Upazilas
                    'Mirpur': [23.8223, 90.3654], 'Uttara': [23.8759, 90.3976], 'Savar': [23.8583, 90.2667], 'Ashulia': [23.8819, 90.3275],
                    'Motijheel': [23.7330, 90.4172], 'Jatrabari': [23.7104, 90.4344], 'Keraniganj': [23.6980, 90.3575], 'Demra': [23.7073, 90.4497],
                    'Pahartali': [22.3600, 91.7800], 'Sitakunda': [22.6200, 91.6500], 'Hathazari': [22.4500, 91.8000], 'Coxs Bazar': [21.4333, 91.9833],
                    'Bogura Sadar': [24.8500, 89.3667], 'Rajshahi Sadar': [24.3667, 88.6000], 'Khulna Sadar': [22.8167, 89.5500], 'Jashore Sadar': [23.1667, 89.2000],
                    'Sylhet Sadar': [24.8833, 91.8667], 'Habiganj Sadar': [24.3833, 91.4167], 'Barishal Sadar': [22.7000, 90.3667], 'Rangpur Sadar': [25.7500, 89.2500], 'Dinajpur Sadar': [25.6333, 88.6333],
                    // Districts
                    'Dhaka': [23.8103, 90.4125], 'Chattogram': [22.3569, 91.7832], 'Rajshahi': [24.3636, 88.6241], 'Khulna': [22.8456, 89.5403],
                    'Sylhet': [24.8949, 91.8687], 'Barishal': [22.7010, 90.3535], 'Rangpur': [25.7439, 89.2752], 'Bogura': [24.8465, 89.3778],
                    'Jashore': [23.1664, 89.2081], 'Habiganj': [24.3749, 91.4114], 'Dinajpur': [25.6217, 88.6355]
                };

                // Initialize Leaflet Map & Load Choropleth Data After DOM Update
                setTimeout(async () => {
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

                    // Add standard, highly reliable OpenStreetMap tile layer
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(app.salesMap);

                    // Force Leaflet to recalculate container size
                    app.salesMap.invalidateSize();
                    setTimeout(() => { if (app.salesMap) app.salesMap.invalidateSize(); }, 200);
                    setTimeout(() => { if (app.salesMap) app.salesMap.invalidateSize(); }, 600);

                    // Render heatmap markers immediately so data is ALWAYS visible even before polygon fetch
                    const markersList = [];
                    Object.entries(dataAgg).forEach(([name, sales]) => {
                        const coords = mapCoords[name] || mapCoords[Object.keys(mapCoords).find(k => k.toLowerCase() === name.toLowerCase())];
                        if (!coords) return;

                        const intensity = maxSales > 0 ? (sales / maxSales) : 0;
                        let bgClass = 'bg-blue-600 text-white';
                        let glowClass = 'bg-blue-400';
                        if (intensity > 0.6) { bgClass = 'bg-rose-600 text-white'; glowClass = 'bg-rose-500'; }
                        else if (intensity > 0.3) { bgClass = 'bg-amber-500 text-white'; glowClass = 'bg-amber-400'; }

                        const size = 26 + (intensity * 32);

                        const iconHtml = `
                        <div class="relative group transition-transform hover:scale-110 flex items-center justify-center h-full w-full">
                            <div class="absolute inset-0 ${glowClass} rounded-full animate-ping opacity-[0.5] scale-125" style="animation-duration: 2.5s;"></div>
                            <div class="relative rounded-full ${bgClass} shadow-[0_4px_12px_rgba(0,0,0,0.3)] border-2 border-white flex items-center justify-center font-black transition-all" style="width: ${size}px; height: ${size}px; font-size: ${Math.max(10, size / 2.6)}px;">
                                ${sales}
                            </div>
                        </div>
                        `;

                        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
                        const marker = L.marker(coords, { icon: icon });

                        const tooltipHtml = `
                            <div class="bg-slate-900 text-white text-xs rounded-xl py-2 px-3 shadow-2xl border border-slate-700 min-w-[120px]">
                                <div class="flex items-center gap-2 mb-1">
                                    <p class="font-black text-sm text-slate-50 tracking-wide">${name}</p>
                                </div>
                                <p class="text-slate-300 font-medium"><span class="text-amber-400 font-black text-base">${sales}</span> Units Plotted</p>
                            </div>
                        `;
                        marker.bindTooltip(tooltipHtml, { direction: 'top', offset: [0, -size / 2 - 5], className: 'custom-leaflet-tooltip', opacity: 1 });
                        markersList.push(marker);
                    });

                    const markerGroup = L.featureGroup(markersList).addTo(app.salesMap);
                    if (markersList.length > 0) {
                        app.salesMap.fitBounds(markerGroup.getBounds(), { padding: [40, 40], maxZoom: 10 });
                    }

                    // Asynchronously fetch GeoJSON polygons to overlay boundaries seamlessly
                    try {
                        if (!app.geoJsonCache) app.geoJsonCache = {};

                        const primaryGeoUrl = viewMode === 'district'
                            ? 'https://cdn.jsdelivr.net/gh/ahnaf-tahmid-chowdhury/Choropleth-Bangladesh@master/bangladesh_geojson_adm2_64_districts_zillas.json'
                            : 'https://cdn.jsdelivr.net/gh/ahnaf-tahmid-chowdhury/Choropleth-Bangladesh@master/bangladesh_geojson_adm3_492_upozila.json';
                        
                        const fallbackGeoUrl = viewMode === 'district'
                            ? 'https://raw.githubusercontent.com/ahnaf-tahmid-chowdhury/Choropleth-Bangladesh/master/bangladesh_geojson_adm2_64_districts_zillas.json'
                            : 'https://raw.githubusercontent.com/ahnaf-tahmid-chowdhury/Choropleth-Bangladesh/master/bangladesh_geojson_adm3_492_upozila.json';

                        if (!app.geoJsonCache[viewMode]) {
                            try {
                                const res = await fetch(primaryGeoUrl);
                                if (!res.ok) throw new Error('Primary CDN fetch failed');
                                app.geoJsonCache[viewMode] = await res.json();
                            } catch (e1) {
                                console.warn('Primary GeoJSON fetch failed, trying fallback:', e1);
                                const res2 = await fetch(fallbackGeoUrl);
                                if (!res2.ok) throw new Error('Fallback GeoJSON fetch failed');
                                app.geoJsonCache[viewMode] = await res2.json();
                            }
                        }

                        let geoData = app.geoJsonCache[viewMode];

                        // SMART ZOOM FILTER: If a specific district is selected, isolate only those polygons to fitBounds accurately
                        if (districtTab !== 'All') {
                            const normSelectedDist = app.getNormalizedKey(districtTab);
                            const filteredFeatures = geoData.features.filter(f => {
                                const fDist = f.properties.ADM2_EN || f.properties.NAME_2 || f.properties.district || '';
                                return app.getNormalizedKey(fDist) === normSelectedDist;
                            });

                            // Safety check: if our name mapping failed, default back to whole map to prevent breaking
                            if (filteredFeatures.length > 0) {
                                geoData = { ...geoData, features: filteredFeatures };
                            }
                        }

                        // Heatmap Style Logic
                        const getPolygonColor = (d) => {
                            if (!d || d === 0) return 'transparent';
                            const pct = d / maxSales;
                            if (pct > 0.66) return '#e11d48'; // rose-600
                            if (pct > 0.33) return '#f59e0b'; // amber-500
                            return '#3b82f6'; // blue-500
                        };

                        const style = (feature) => {
                            const propName = viewMode === 'district'
                                ? (feature.properties.ADM2_EN || feature.properties.name || feature.properties.NAME_2 || '')
                                : (feature.properties.ADM3_EN || feature.properties.name || feature.properties.NAME_3 || '');
                            const normProp = app.getNormalizedKey(propName);
                            const sales = normalizedAgg[normProp] || 0;
                            return {
                                fillColor: getPolygonColor(sales),
                                weight: sales > 0 ? 2 : 1,
                                opacity: 1,
                                color: sales > 0 ? '#ffffff' : '#cbd5e1', // white border if has sales, slate border if empty
                                fillOpacity: sales > 0 ? 0.7 : 0.1
                            };
                        };

                        const highlightFeature = (e) => {
                            var layer = e.target;
                            layer.setStyle({ weight: 3, color: '#10b981', fillOpacity: 0.85 });
                            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) { layer.bringToFront(); }

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
                            app.geoLayer.resetStyle(e.target);
                            const propName = viewMode === 'district'
                                ? (e.target.feature.properties.ADM2_EN || e.target.feature.properties.name || '')
                                : (e.target.feature.properties.ADM3_EN || e.target.feature.properties.name || '');
                            const listEl = document.querySelector(`[data-area-name="${app.getNormalizedKey(propName)}"]`);
                            if (listEl) {
                                const isActive = (viewMode === 'district' && districtTab === propName);
                                if (!isActive) {
                                    listEl.classList.remove('bg-emerald-50', 'border-emerald-300');
                                    listEl.classList.add('border-slate-100', 'bg-white');
                                }
                            }
                        };

                        const onEachFeature = (feature, layer) => {
                            layer.on({
                                mouseover: highlightFeature,
                                mouseout: resetHighlight
                            });

                            const propName = viewMode === 'district'
                                ? (feature.properties.ADM2_EN || feature.properties.name || feature.properties.NAME_2 || 'Unknown District')
                                : (feature.properties.ADM3_EN || feature.properties.name || feature.properties.NAME_3 || 'Unknown Upazila');
                            const normProp = app.getNormalizedKey(propName);
                            const sales = normalizedAgg[normProp] || 0;

                            let colorName = 'slate';
                            if (sales > 0) {
                                const pct = sales / maxSales;
                                colorName = pct > 0.66 ? 'rose' : (pct > 0.33 ? 'amber' : 'blue');
                            }

                            const tooltipHtml = `
                                <div class="bg-slate-900 text-white text-xs rounded-xl py-2 px-3 shadow-2xl border border-slate-700 min-w-[120px]">
                                    <div class="flex items-center gap-2 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                        <p class="font-black text-sm text-slate-50 tracking-wide">${propName}</p>
                                    </div>
                                    <p class="text-slate-300 font-medium pl-5"><span class="text-${colorName}-400 font-black text-base">${sales}</span> Units Plotted</p>
                                </div>
                            `;
                            layer.bindTooltip(tooltipHtml, {
                                direction: 'auto', className: 'custom-leaflet-tooltip', opacity: 1, sticky: true
                            });
                        };

                        app.geoLayer = L.geoJSON(geoData, { style: style, onEachFeature: onEachFeature }).addTo(app.salesMap);

                        // Auto-focus map to center and scale Bangladesh to perfectly fit the screen container
                        if (app.geoLayer) {
                            app.salesMap.fitBounds(app.geoLayer.getBounds(), { padding: [10, 10] });
                        }

                    } catch (err) {
                        console.warn('Boundary load blocked. Activating visual radar fallback:', err);
                        app.showToast(`Optimizing for speed: Activated Quantum Radar View`, 'info');

                        const markersList = [];

                        Object.entries(dataAgg).forEach(([name, sales]) => {
                            const coords = mapCoords[name];
                            if (!coords) return;

                            const intensity = maxSales > 0 ? (sales / maxSales) : 0;
                            let bgClass = 'bg-blue-500 text-white';
                            let glowClass = 'bg-blue-400';
                            let borderClass = 'border-blue-300';

                            if (intensity > 0.6) { bgClass = 'bg-rose-600 text-white'; glowClass = 'bg-rose-500'; borderClass = 'border-rose-400'; }
                            else if (intensity > 0.3) { bgClass = 'bg-amber-500 text-white'; glowClass = 'bg-amber-400'; borderClass = 'border-amber-300'; }

                            const size = 26 + (intensity * 34);

                            const iconHtml = `
                            <div class="relative group transition-transform hover:scale-110 flex items-center justify-center h-full w-full">
                                <div class="absolute inset-0 ${glowClass} rounded-full animate-ping opacity-[0.6] scale-150" style="animation-duration: 2s;"></div>
                                <div class="relative rounded-full ${bgClass} shadow-[0_0_20px_rgba(0,0,0,0.4)] border border-white/50 flex items-center justify-center font-black transition-all backdrop-blur-md" style="width: ${size}px; height: ${size}px; font-size: ${Math.max(11, size / 2.5)}px;">
                                    ${sales}
                                </div>
                            </div>
                            `;

                            const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
                            const marker = L.marker(coords, { icon: icon });

                            const colorName = bgClass.split('-')[1];

                            const tooltipHtml = `
                                <div class="bg-slate-900/90 backdrop-blur-md text-white text-xs rounded-xl py-2 px-3 shadow-2xl border border-slate-700 min-w-[120px]">
                                    <div class="flex items-center gap-2 mb-1">
                                        <i data-lucide="crosshairs" class="w-3 h-3 text-${colorName}-400"></i>
                                        <p class="font-black text-sm text-slate-50 tracking-wide">${name}</p>
                                    </div>
                                    <p class="text-slate-300 font-medium pl-5"><span class="text-${colorName}-400 font-black text-base">${sales}</span> Units Plotted</p>
                                </div>
                            `;
                            marker.bindTooltip(tooltipHtml, { direction: 'top', offset: [0, -size / 2 - 5], className: 'custom-leaflet-tooltip', opacity: 1 });
                            markersList.push(marker);
                        });

                        // Add markers to a group to calculate bounds for Fallback Zooming
                        const markerGroup = L.featureGroup(markersList).addTo(app.salesMap);
                        if (markersList.length > 0) {
                            app.salesMap.fitBounds(markerGroup.getBounds(), { padding: [50, 50], maxZoom: 10 });
                        }

                        app.refreshIcons();
                    } finally {
                        app.hideLoader();
                    }
                }, 100);
            },

            
