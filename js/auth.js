// --- Sales360 Module: auth.js ---
window.app = window.app || {};

window.app.buildCustomLoginSelect = () => {
                const select = document.getElementById('login-user-select');
                if (!select) return;

                app.loginSelectItems = [];

                // Admins
                const admins = DB.users.filter(u => u.role === 'admin' || u.role === 'subadmin');
                admins.forEach(u => {
                    app.loginSelectItems.push({
                        id: u.id,
                        role: u.role,
                        category: 'admin',
                        categoryLabel: 'System Administration',
                        title: u.role === 'subadmin' ? 'Sub Admin' : 'Global Admin',
                        subtitle: u.name,
                        icon: 'shield',
                        iconBg: 'bg-rose-50 text-rose-600',
                        badgeClass: 'bg-rose-100 text-rose-700 border-rose-200'
                    });
                });

                // Area Managers (AM)
                const ams = DB.users.filter(u => u.role === 'am');
                ams.forEach(u => {
                    const areaNames = u.territories.map(tId => DB.territories.find(t => t.id === tId)?.name).filter(Boolean).join(', ') || 'No Area';
                    const cleanName = u.name.replace(/\s*\(\s*(AM|MO)\s*\)/i, '').replace(/\s*(AM|MO)$/i, '').trim();
                    app.loginSelectItems.push({
                        id: u.id,
                        role: 'am',
                        category: 'am',
                        categoryLabel: 'Area Manager',
                        title: areaNames,
                        subtitle: `${cleanName} (AM)`,
                        icon: 'briefcase',
                        iconBg: 'bg-indigo-50 text-indigo-600',
                        badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    });
                });

                // Territory Officers (SO/MO)
                const sos = DB.users.filter(u => u.role === 'so');
                sos.forEach(u => {
                    const areaName = DB.territories.find(t => t.id === u.territories[0])?.name || 'Unknown';
                    const cleanName = u.name.replace(/\s*\(\s*(AM|MO)\s*\)/i, '').replace(/\s*(AM|MO)$/i, '').trim();
                    app.loginSelectItems.push({
                        id: u.id,
                        role: 'so',
                        category: 'so',
                        categoryLabel: 'Territory Officer',
                        title: areaName,
                        subtitle: `${cleanName} (MO)`,
                        icon: 'map-pin',
                        iconBg: 'bg-emerald-50 text-emerald-600',
                        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    });
                });

                app.loginSelectCategory = app.loginSelectCategory || 'all';
                app.loginSelectSearchQuery = '';

                // Ensure initial selection in hidden select
                if (!select.value && app.loginSelectItems.length > 0) {
                    select.value = app.loginSelectItems[0].id;
                }

                const currentSelected = app.loginSelectItems.find(i => i.id === select.value) || app.loginSelectItems[0];
                if (currentSelected) {
                    app.updateLoginSelectTrigger(currentSelected);
                }

                app.renderLoginSelectOptions();
            };

window.app.updateLoginSelectTrigger = (item) => {
                const label = document.getElementById('login-select-label');
                const badge = document.getElementById('login-select-badge');
                const iconBox = document.getElementById('login-select-icon-box');

                if (label) label.innerText = `${item.title} — ${item.subtitle}`;
                if (badge) badge.innerText = item.categoryLabel;
                if (iconBox) {
                    iconBox.className = `w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0 transition-all shadow-sm`;
                    iconBox.innerHTML = `<i data-lucide="${item.icon}" class="w-4 h-4"></i>`;
                }
                app.refreshIcons();
            };

window.app.renderLoginSelectOptions = () => {
                const listEl = document.getElementById('login-select-options-list');
                const emptyEl = document.getElementById('login-select-empty');
                if (!listEl) return;

                const query = (app.loginSelectSearchQuery || '').toLowerCase().trim();
                const category = app.loginSelectCategory || 'all';
                const selectVal = document.getElementById('login-user-select')?.value;

                let filtered = app.loginSelectItems || [];

                if (category !== 'all') {
                    filtered = filtered.filter(i => i.category === category);
                }

                if (query) {
                    filtered = filtered.filter(i => 
                        i.title.toLowerCase().includes(query) || 
                        i.subtitle.toLowerCase().includes(query) || 
                        i.categoryLabel.toLowerCase().includes(query)
                    );
                }

                if (filtered.length === 0) {
                    listEl.innerHTML = '';
                    if (emptyEl) emptyEl.classList.remove('hidden');
                    return;
                }

                if (emptyEl) emptyEl.classList.add('hidden');

                let html = filtered.map(item => {
                    const isSelected = item.id === selectVal;
                    return `
                        <button type="button" 
                            onclick="app.selectLoginUserItem('${item.id}')"
                            class="w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${isSelected ? 'bg-aci-blue/10 border border-aci-blue/30 text-aci-blue shadow-sm' : 'hover:bg-slate-50 border border-transparent text-slate-700'}">
                            <div class="flex items-center gap-3 overflow-hidden pr-2">
                                <div class="w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                                </div>
                                <div class="truncate">
                                    <div class="flex items-center gap-2">
                                        <span class="font-extrabold text-xs tracking-tight ${isSelected ? 'text-aci-blue' : 'text-slate-800'} truncate">${item.title}</span>
                                    </div>
                                    <div class="text-[10px] font-medium text-slate-500 truncate mt-0.5">${item.subtitle}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${item.badgeClass}">
                                    ${item.category === 'admin' ? 'Admin' : (item.category === 'am' ? 'Area' : 'Territory')}
                                </span>
                                ${isSelected ? '<i data-lucide="check-circle-2" class="w-4 h-4 text-aci-blue"></i>' : ''}
                            </div>
                        </button>
                    `;
                }).join('');

                listEl.innerHTML = html;
                app.refreshIcons();
            };

window.app.toggleLoginSelectDropdown = (forceState = null) => {
                const dropdown = document.getElementById('login-select-dropdown');
                const chevron = document.getElementById('login-select-chevron');
                if (!dropdown) return;

                const isHidden = dropdown.classList.contains('hidden');
                const show = forceState !== null ? forceState : isHidden;

                if (show) {
                    dropdown.classList.remove('hidden');
                    setTimeout(() => {
                        dropdown.classList.remove('scale-95', 'opacity-0');
                        dropdown.classList.add('scale-100', 'opacity-100');
                    }, 10);
                    if (chevron) chevron.classList.add('rotate-180');

                    const searchInput = document.getElementById('login-select-search');
                    if (searchInput) {
                        searchInput.focus();
                    }
                } else {
                    dropdown.classList.remove('scale-100', 'opacity-100');
                    dropdown.classList.add('scale-95', 'opacity-0');
                    if (chevron) chevron.classList.remove('rotate-180');
                    setTimeout(() => {
                        dropdown.classList.add('hidden');
                    }, 200);
                }
            };

window.app.closeLoginSelectDropdown = () => {
                app.toggleLoginSelectDropdown(false);
            };

window.app.filterLoginSelectOptions = (val) => {
                app.loginSelectSearchQuery = val;
                const clearBtn = document.getElementById('login-select-clear-btn');
                if (clearBtn) {
                    if (val) clearBtn.classList.remove('hidden');
                    else clearBtn.classList.add('hidden');
                }
                app.renderLoginSelectOptions();
            };

window.app.clearLoginSelectSearch = () => {
                const searchInput = document.getElementById('login-select-search');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                app.filterLoginSelectOptions('');
            };

window.app.setLoginSelectCategory = (category) => {
                app.loginSelectCategory = category;

                const tabs = ['all', 'admin', 'am', 'so'];
                tabs.forEach(t => {
                    const btn = document.getElementById(`login-tab-${t}`);
                    if (!btn) return;
                    if (t === category) {
                        btn.className = 'flex-1 py-1 px-2 rounded-lg text-center transition-all bg-white text-slate-800 shadow-sm font-extrabold';
                    } else {
                        btn.className = 'flex-1 py-1 px-2 rounded-lg text-center transition-all text-slate-500 hover:text-slate-700';
                    }
                });

                app.renderLoginSelectOptions();
            };

window.app.selectLoginUserItem = (userId) => {
                const select = document.getElementById('login-user-select');
                if (select) {
                    select.value = userId;
                    select.dispatchEvent(new Event('change'));
                }

                const item = (app.loginSelectItems || []).find(i => i.id === userId);
                if (item) {
                    app.updateLoginSelectTrigger(item);
                }

                app.renderLoginSelectOptions();
                app.closeLoginSelectDropdown();

                const pwdInput = document.getElementById('password');
                if (pwdInput) pwdInput.focus();
            };

window.app.handleLoginSelectKeydown = (e) => {
                if (e.key === 'Escape') {
                    app.closeLoginSelectDropdown();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const listEl = document.getElementById('login-select-options-list');
                    const firstBtn = listEl ? listEl.querySelector('button') : null;
                    if (firstBtn) {
                        firstBtn.click();
                    }
                }
            };

window.app.handleLogin = async (e) => {
                e.preventDefault();
                const userId = document.getElementById('login-user-select').value;
                const empId = document.getElementById('password').value;

                app.showLoader('Authenticating...');

                let result = null;
                try {
                    const response = await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'login',
                            userId: userId,
                            employeeId: empId
                        })
                    });
                    
                    result = await response.json();
                } catch (err) {
                    console.error("Login authentication network error:", err);
                    app.hideLoader();
                    app.showToast('Failed to authenticate with security server.', 'error');
                    return;
                }

                app.hideLoader();

                if (result && result.success && result.user) {
                    app.currentUser = result.user;
                    localStorage.setItem('aci_user', JSON.stringify(result.user));
                    app.showToast('Login successful!');
                    
                    try {
                        // Re-fetch data tables now that we are authenticated
                        await app.init();
                    } catch (initErr) {
                        console.warn("Post-login data initialization warning:", initErr);
                    }
                    
                    app.loadAppLayout();
                } else {
                    app.showToast((result && result.error) ? result.error : 'Invalid Employee ID for the selected Area/User.', 'error');
                }
            };

window.app.logout = async () => {
                app.closeSidebar();
                try {
                    await fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'logout' })
                    });
                } catch (err) {
                    console.error("Logout API request error:", err);
                }
                app.currentUser = null;
                localStorage.removeItem('aci_user');
                localStorage.removeItem('aci_last_page');
                localStorage.removeItem('aci_last_role');
                location.reload();
                document.getElementById('app-container').classList.add('hidden');
                document.getElementById('login-view').classList.remove('opacity-0', 'pointer-events-none');

                // Destroy charts to prevent memory leaks
                if (app.charts.yoyTrendAnimFrame) {
                    cancelAnimationFrame(app.charts.yoyTrendAnimFrame);
                    app.charts.yoyTrendAnimFrame = null;
                }
                Object.values(app.charts).forEach(c => {
                    if (c && typeof c.destroy === 'function') c.destroy();
                });
                app.charts = {};
            };

