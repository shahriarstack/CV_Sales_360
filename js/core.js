// --- Sales360 Module: core.js ---
window.app = window.app || {};

window.app.downloadRawCSV = () => {
                if (!DB || !DB.sales || DB.sales.length === 0) return;
                const headers = Object.keys(DB.sales[0]).join(',');
                const rows = DB.sales.map(s => Object.values(s).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
                const csvStr = headers + '\n' + rows;
                const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                    a.download = `Raw_Sales_Data_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };

window.app.downloadPulseCSV = () => {
                const brandFilter = app.adminBrandTab || 'Foton';
                const currentSaleType = app.adminSaleTypeTab || 'New Sale';
                const currentFY = app.selectedFY || app.currentFY || '2025-26';
                const concludingFY = app.getPreviousFY(app.currentFY);
                const defaultFY = (app.currentMonth === 'July' && app.fyReviewActive) ? concludingFY : app.currentFY;
                const activeFY = app.selectedFY || defaultFY;
                const performanceMonth = app.performanceFilterMonth || app.currentMonth;
                
                const isAM = app.currentUser.role === 'am';
                const baseTerritories = isAM ? DB.territories.filter(t => app.currentUser.territories.includes(t.id)) : DB.territories;
                
                let pulseTerritories = [...baseTerritories];
                if (app.adminTerritoryFilter && app.adminTerritoryFilter !== 'All') {
                    pulseTerritories = pulseTerritories.filter(t => t.id === app.adminTerritoryFilter);
                }
                if (app.pulseFilterTerritories && app.pulseFilterTerritories.length > 0) {
                    pulseTerritories = pulseTerritories.filter(t => app.pulseFilterTerritories.includes(t.id));
                }

                const mapped = pulseTerritories.map(t => {
                    const perf = app.getPerformance(t.id, brandFilter, currentSaleType);
                    const tTargets = DB.targets.filter(tg => tg.territory_id === t.id && tg.brand === brandFilter && tg.sale_type === currentSaleType && tg.fy === activeFY);
                    const totalFYBudget = tTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0);

                    const currBudgetTgts = tTargets.filter(tg => tg.month === performanceMonth);
                    const currBudget = currBudgetTgts.length > 0 ? currBudgetTgts.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) : Math.round(tTargets.reduce((sum, tg) => sum + Number(tg.target_qty || 0), 0) / 12);

                    const tProjs = DB.projections.filter(p => p.territory_id === t.id && p.brand === brandFilter && p.month === performanceMonth && p.sale_type === currentSaleType);
                    const currProj = tProjs.reduce((sum, p) => sum + Number(p.projection_qty || 0), 0);

                    const currSalesRecords = DB.sales.filter(s => s.territory_id === t.id && s.brand === brandFilter && s.sales_month === performanceMonth && s.fy === activeFY && s.sale_type === currentSaleType);
                    const currSalesUnits = currSalesRecords.reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);

                    const ytdAchVal = perf.ytd.budget > 0 ? Math.round((perf.ytd.sales / perf.ytd.budget) * 100) : 0;
                    const currAchVal = currBudget > 0 ? Math.round((currSalesUnits / currBudget) * 100) : 0;
                    const lmAchVal = perf.lastMonth.budget > 0 ? Math.round((perf.lastMonth.sales / perf.lastMonth.budget) * 100) : 0;

                    return {
                        name: t.name,
                        totalFYBudget,
                        ytdBudget: perf.ytd.budget,
                        ytdSales: perf.ytd.sales,
                        ytdAch: ytdAchVal,
                        lmBudget: perf.lastMonth.budget,
                        lmSales: perf.lastMonth.sales,
                        lmAch: lmAchVal,
                        currBudget,
                        currProj,
                        currSalesUnits,
                        currAch: currAchVal
                    };
                });

                if (mapped.length === 0) {
                    return app.showToast('No pulse data available to download.', 'error');
                }

                let csv = 'Territory,Brand,Sale Type,Total FY Budget,YTD Budget,YTD Actual,YTD Ach %,Last Month Budget,Last Month Actual,Last Month Ach %,Current Month Budget,Current Month Projection,Current Month Actual,Current Month Ach %\n';

                mapped.forEach(row => {
                    const csvRow = [
                        `"${row.name}"`,
                        `"${brandFilter}"`,
                        `"${currentSaleType}"`,
                        row.totalFYBudget,
                        row.ytdBudget,
                        row.ytdSales,
                        `"${row.ytdAch}%"`,
                        row.lmBudget,
                        row.lmSales,
                        `"${row.lmAch}%"`,
                        row.currBudget,
                        row.currProj,
                        row.currSalesUnits,
                        `"${row.currAch}%"`
                    ];
                    csv += csvRow.join(',') + '\n';
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `Territory_Pulse_${brandFilter}_${currentSaleType}_${performanceMonth}_${activeFY}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                app.showToast('Territory Pulse CSV downloaded successfully!', 'success');
            };

window.app.saveDBState = () => {
                // Deprecated: All data is now persisted directly to Neon DB.
            };

window.app.initNeonDB = async () => {
                // Keep the app.neonSQL reference name to avoid changing 50+ database calls in the code
                app.neonSQL = async (strings, ...values) => {
                    let query = '';
                    let params = [];
                    
                    for (let i = 0; i < strings.length; i++) {
                        query += strings[i];
                        if (i < values.length) {
                            const val = values[i];
                            
                            // Translate PostgreSQL array-based deletes (e.g. id = ANY(${selected}))
                            // to standard SQL IN (?, ?, ...) syntax
                            const currentQueryState = query.trim();
                            const match = currentQueryState.match(/(id\s*=\s*ANY\s*\()$/i);
                            if (match) {
                                if (Array.isArray(val)) {
                                    if (val.length === 0) {
                                        query = query.substring(0, query.length - match[0].length) + 'id IN (NULL';
                                    } else {
                                        const placeholders = val.map(() => '?').join(',');
                                        query = query.substring(0, query.length - match[0].length) + `id IN (${placeholders}`;
                                        params.push(...val);
                                    }
                                } else {
                                    query += '?';
                                    params.push(val);
                                }
                            } else {
                                query += '?';
                                params.push(val);
                            }
                        }
                    }
                    
                    // Translate PG SQL features to MySQL syntax
                    query = query.replace(/\bJSONB\b/gi, 'JSON');
                    query = query.replace(/ON CONFLICT\s*\(\s*\w+\s*\)\s*DO NOTHING/gi, 'ON DUPLICATE KEY UPDATE id=id');
                    
                    // Send to cPanel local PHP bridge
                    const response = await fetch('api.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query, params })
                    });
                    
                    if (response.status === 401) {
                        console.warn("Session expired or unauthorized. Logging out...");
                        app.currentUser = null;
                        localStorage.removeItem('aci_user');
                        localStorage.removeItem('aci_last_page');
                        localStorage.removeItem('aci_last_role');
                        location.reload();
                        return [];
                    }

                    if (!response.ok) {
                        const errText = await response.text();
                        throw new Error(errText || 'Database query error');
                    }
                    
                    const result = await response.json();
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    
                    return result.data;
                };

                try {
                    console.log("Connecting to cPanel MySQL database via api.php...");
                    
                    // Check authentication state to determine loading strategy
                    let targets = [], projections = [], emi = [], sales = [], recovery_od = [], users = [], territories = [], models = [], notices = [], links = [], tiv_brands = [], app_settings = [], tiv_submissions = [];

                    if (app.currentUser) {
                        // Load all data tables concurrently for authenticated users
                        const results = await Promise.all([
                            app.neonSQL`SELECT * FROM targets`,
                            app.neonSQL`SELECT * FROM projections`,
                            app.neonSQL`SELECT * FROM emi`,
                            app.neonSQL`SELECT * FROM sales`,
                            app.neonSQL`SELECT * FROM recovery_od`,
                            app.neonSQL`SELECT * FROM users`,
                            app.neonSQL`SELECT * FROM territories`,
                            app.neonSQL`SELECT * FROM models`,
                            app.neonSQL`SELECT * FROM notices`,
                            app.neonSQL`SELECT * FROM links`,
                            app.neonSQL`SELECT * FROM tiv_brands`,
                            app.neonSQL`SELECT * FROM app_settings`,
                            app.neonSQL`SELECT * FROM tiv_submissions`
                        ]);
                        targets = results[0];
                        projections = results[1];
                        emi = results[2];
                        sales = results[3];
                        recovery_od = results[4];
                        users = results[5];
                        territories = results[6];
                        models = results[7];
                        notices = results[8];
                        links = results[9];
                        tiv_brands = results[10];
                        app_settings = results[11];
                        tiv_submissions = results[12];
                    } else {
                        // Pre-authentication: Only load sanitized users and territories for login dropdown
                        const results = await Promise.all([
                            app.neonSQL`SELECT * FROM users`,
                            app.neonSQL`SELECT * FROM territories`
                        ]);
                        users = results[0];
                        territories = results[1];
                    }
                    
                    let manual_deliveries = [];
                    if (app.currentUser) {
                        try {
                            manual_deliveries = await app.neonSQL`SELECT * FROM manual_deliveries`;
                        } catch (e) {}
                    }

                    DB.targets = targets;
                    DB.projections = projections;
                    DB.emi = emi;
                    DB.sales = sales.map(s => {
                        return {
                            ...s,
                            is_manual: s.is_manual === 1 || s.is_manual === true || s.is_manual === '1',
                            is_carried_forward: s.is_carried_forward === 1 || s.is_carried_forward === true || s.is_carried_forward === '1',
                            financials: typeof s.financials === 'string' ? JSON.parse(s.financials) : s.financials,
                            discounts: typeof s.discounts === 'string' ? JSON.parse(s.discounts) : s.discounts
                        };
                    });

                    // Merge dedicated manual_deliveries table records with rich fields
                    if (Array.isArray(manual_deliveries)) {
                        manual_deliveries.forEach(m => {
                            const formatted = {
                                ...m,
                                is_manual: true,
                                is_carried_forward: m.is_carried_forward === 1 || m.is_carried_forward === true || m.is_carried_forward === '1',
                                financials: typeof m.financials === 'string' ? JSON.parse(m.financials) : m.financials,
                                discounts: typeof m.discounts === 'string' ? JSON.parse(m.discounts) : m.discounts
                            };
                            const existingIdx = DB.sales.findIndex(s => s.id === m.id);
                            if (existingIdx > -1) {
                                DB.sales[existingIdx] = { ...DB.sales[existingIdx], ...formatted };
                            } else {
                                DB.sales.push(formatted);
                            }
                        });
                    }
                    DB.recovery_od = recovery_od;
                    
                    // Parse JSON fields where necessary
                    DB.users = users.map(u => ({ ...u, territories: typeof u.territories === 'string' ? JSON.parse(u.territories) : u.territories }));
                    DB.territories = territories.map(t => ({ ...t, upazilas: typeof t.upazilas === 'string' ? JSON.parse(t.upazilas) : t.upazilas }));
                    
                    // Dynamic construction of Upazilas from data uploaded Yearly Targets (Set once per year by Upazila)
                    DB.territories.forEach(t => {
                        const upazilaSet = new Set();
                        
                        // Scan targets table
                        DB.targets.forEach(tg => {
                            if (tg.territory_id === t.id && tg.upazila) {
                                const cleanUpa = tg.upazila.trim();
                                if (cleanUpa && cleanUpa.toLowerCase() !== 'null' && cleanUpa.toLowerCase() !== 'undefined') {
                                    upazilaSet.add(cleanUpa);
                                }
                            }
                        });

                        // If upazilas found in active targets data, override the empty seeded array
                        if (upazilaSet.size > 0) {
                            t.upazilas = Array.from(upazilaSet).sort();
                        } else if (!t.upazilas || t.upazilas.length === 0) {
                            t.upazilas = [];
                        }
                    });

                    DB.models = models;
                    DB.notices = notices;
                    DB.links = links;
                    DB.tiv_brands = tiv_brands.map(b => ({ ...b, models: typeof b.models === 'string' ? JSON.parse(b.models) : b.models }));
                    DB.tiv_submissions = (tiv_submissions || []).map(s => {
                        return typeof s.submission_data === 'string' ? JSON.parse(s.submission_data) : s.submission_data;
                    });
                    
                    if (app_settings.length > 0) {
                        DB.settings = typeof app_settings[0].settings_json === 'string' ? JSON.parse(app_settings[0].settings_json) : app_settings[0].settings_json;
                        app.currentMonth = DB.settings.currentMonth || 'April';
                        app.lastMonth = DB.settings.lastMonth || 'March';
                        app.currentFY = DB.settings.currentFY || '2025-26';
                        app.fyReviewActive = DB.settings.fyReviewActive !== undefined ? DB.settings.fyReviewActive : true;
                        app.showLastFYData = DB.settings.showLastFYData !== undefined ? DB.settings.showLastFYData : false;
                        
                        // Set default selected FY in transition review mode
                        const activeFY = app.currentFY;
                        const concludingFY = (() => {
                            const parts = activeFY.split('-');
                            if (parts.length === 2) {
                                const y1 = parseInt(parts[0]);
                                const y2 = parseInt(parts[1]);
                                if (!isNaN(y1) && !isNaN(y2)) return `${y1-1}-${y2-1}`;
                            }
                            return '2025-26';
                        })();
                        
                        if (app.currentMonth === 'July' && app.fyReviewActive) {
                            app.selectedFY = concludingFY;
                            app.soSelectedFY = concludingFY;
                        }
                    } else {
                        app.fyReviewActive = true;
                        app.showLastFYData = false;
                    }

                    console.log("Data successfully loaded from cPanel MySQL Database.");
                } catch (e) {
                    console.error("Failed to connect to MySQL DB via api.php:", e);
                }
            };

window.app.updateViewport = () => {
                const meta = document.querySelector('meta[name="viewport"]');
                if (meta) {
                    if (app.currentUser && (app.currentUser.role === 'admin' || app.currentUser.role === 'subadmin')) {
                        // Desktop mode viewport width 1280px with scale control and zoom enabled
                        meta.setAttribute('content', 'width=1280, initial-scale=0.35, minimum-scale=0.1, maximum-scale=5.0, user-scalable=yes');
                    } else {
                        // Standard mobile responsive viewport
                        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
                    }
                }
            };

window.app.initLoginParticles = () => {
                const canvas = document.getElementById('login-particles');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                
                if (canvas.cleanupParticles) {
                    canvas.cleanupParticles();
                }
                
                let width = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
                let height = canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
                
                const particles = [];
                // Adaptive count: fewer particles for premium minimal aesthetic
                const numParticles = Math.min(Math.floor(width / 18), width < 640 ? 25 : 60);
                
                const colors = [
                    'rgba(71, 85, 105, 0.45)',    // Slate 600
                    'rgba(99, 102, 241, 0.50)',   // Indigo 500
                    'rgba(14, 165, 233, 0.40)'    // Sky 500
                ];
                
                for (let i = 0; i < numParticles; i++) {
                    particles.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        vx: (Math.random() - 0.5) * 0.22, // Slower drifting speed
                        vy: (Math.random() - 0.5) * 0.22,
                        radius: Math.random() * 1.4 + 0.6, // Smaller elegant dots (0.6px to 2.0px)
                        color: colors[Math.floor(Math.random() * colors.length)]
                    });
                }
                
                const mouse = { x: null, y: null, radius: 140 }; // Refined interaction range
                const loginView = document.getElementById('login-view');
                
                const handleMouseMove = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    mouse.x = e.clientX - rect.left;
                    mouse.y = e.clientY - rect.top;
                };
                
                const handleMouseLeave = () => {
                    mouse.x = null;
                    mouse.y = null;
                };
                
                if (loginView) {
                    loginView.addEventListener('mousemove', handleMouseMove);
                    loginView.addEventListener('mouseleave', handleMouseLeave);
                }
                
                let animFrame;
                function draw() {
                    ctx.clearRect(0, 0, width, height);
                    
                    for (let i = 0; i < particles.length; i++) {
                        let p = particles[i];
                        
                        // Physics update
                        p.x += p.vx;
                        p.y += p.vy;
                        
                        // Antigravity (Repulsion from cursor)
                        if (mouse.x !== null && mouse.y !== null) {
                            const dx = p.x - mouse.x;
                            const dy = p.y - mouse.y;
                            const dist = Math.hypot(dx, dy);
                            if (dist < mouse.radius) {
                                const force = (mouse.radius - dist) / mouse.radius;
                                const angle = Math.atan2(dy, dx);
                                // Push away smoothly
                                p.x += Math.cos(angle) * force * 1.8;
                                p.y += Math.sin(angle) * force * 1.8;
                            }
                        }
                        
                        // Wall bounds bounce
                        if (p.x < 0) { p.x = 0; p.vx *= -1; }
                        else if (p.x > width) { p.x = width; p.vx *= -1; }
                        
                        // Height bound bounce
                        if (p.y < 0) { p.y = 0; p.vy *= -1; }
                        else if (p.y > height) { p.y = height; p.vy *= -1; }
                        
                        // Draw dot with premium glow
                        ctx.beginPath();
                        ctx.fillStyle = p.color;
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = p.color;
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0; // Reset shadow
                        
                        // Connect to mouse cursor
                        if (mouse.x !== null && mouse.y !== null) {
                            const dx = p.x - mouse.x;
                            const dy = p.y - mouse.y;
                            const dist = Math.hypot(dx, dy);
                            if (dist < 150) {
                                ctx.beginPath();
                                ctx.strokeStyle = `rgba(14, 165, 233, ${0.18 * (1 - dist / 150)})`;
                                ctx.lineWidth = 0.6;
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(mouse.x, mouse.y);
                                ctx.stroke();
                            }
                        }
                        
                        // Connect to other dots (interconnected silver web)
                        for (let j = i + 1; j < particles.length; j++) {
                            let p2 = particles[j];
                            let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                            if (dist < 110) { // Minimal connection distance
                                ctx.beginPath();
                                ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 110)})`;
                                ctx.lineWidth = 0.5;
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.stroke();
                            }
                        }
                    }
                    animFrame = requestAnimationFrame(draw);
                }

                draw();

                
                app.loginParticleAnimFrame = animFrame;
                
                const handleResize = () => {
                    width = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
                    height = canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
                };
                
                window.addEventListener('resize', handleResize);
                
                // Cleanup method to stop loops and clear event handlers
                canvas.cleanupParticles = () => {
                    window.removeEventListener('resize', handleResize);
                    if (loginView) {
                        loginView.removeEventListener('mousemove', handleMouseMove);
                        loginView.removeEventListener('mouseleave', handleMouseLeave);
                    }
                    if (app.loginParticleAnimFrame) {
                        cancelAnimationFrame(app.loginParticleAnimFrame);
                        app.loginParticleAnimFrame = null;
                    }
                };
            };

window.app.init = async () => {
                app.updateViewport();

                // Restore session from localStorage before calling initNeonDB
                const storedUser = localStorage.getItem('aci_user');
                if (storedUser) {
                    try {
                        app.currentUser = JSON.parse(storedUser);
                    } catch (e) {
                        localStorage.removeItem('aci_user');
                    }
                }

                // Intercept localStorage.setItem to auto-update sidebar highlighted active states
                const originalSetItem = localStorage.setItem;
                localStorage.setItem = function(key, value) {
                    originalSetItem.apply(localStorage, arguments);
                    if (key === 'aci_last_page' && app.currentUser) {
                        app.setupSidebar();
                        if (typeof app.initCopyrightFooterHandler === 'function') {
                            app.initCopyrightFooterHandler();
                        }
                    }
                };

                await app.initNeonDB(); // Connect to Neon DB and fetch data
                app.populateLoginDropdown(); // Setup Login Select Options
                app.initLoginParticles(); // Initialize background web animation
                document.getElementById('login-form').addEventListener('submit', app.handleLogin);
                document.addEventListener('click', (e) => {
                    const container = document.getElementById('login-select-container');
                    if (container && !container.contains(e.target)) {
                        app.closeLoginSelectDropdown();
                    }
                });

                // Password visibility toggle handler
                const pwToggle = document.getElementById('password-toggle');
                if (pwToggle) {
                    pwToggle.addEventListener('click', () => {
                        const pwInput = document.getElementById('password');
                        if (pwInput.type === 'password') {
                            pwInput.type = 'text';
                            pwToggle.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
                        } else {
                            pwInput.type = 'password';
                            pwToggle.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
                        }
                        app.refreshIcons();
                    });
                }


                // Check session with Pre-render Guard
                const splash = document.getElementById('app-splash');

                if (storedUser) {
                    try {
                        app.currentUser = JSON.parse(storedUser);
                        // session found, go straight to dashboard
                        app.loadAppLayout();

                        // Smoothly lift the splash screen curtain
                        setTimeout(() => {
                            splash.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
                            setTimeout(() => splash.remove(), 700);
                        }, 800);
                    } catch (e) {
                        localStorage.removeItem('aci_user');
                        app.showLoginScreen();
                    }
                } else {
                    app.showLoginScreen();
                }

                // Security Access Guard for Sub Admin
                const restrictViews = [
                    'renderAdminDashboard', 'renderAdminSalesMap', 'renderAdminManualDeliveries',
                    'renderTIVManagement', 'renderAdminAIInsights', 'renderAdminAnalytics',
                    'renderAdminNotices', 'renderDataUpload', 'renderUserManagement',
                    'renderModelManagement', 'renderSystemSettings', 'renderAMPulseMatrix'
                ];
                restrictViews.forEach(fnName => {
                    if (typeof app[fnName] === 'function') {
                        const originalFn = app[fnName];
                        app[fnName] = function() {
                            if (app.currentUser && app.currentUser.role === 'subadmin') {
                                console.warn(`Access Denied: Sub Admin is restricted from ${fnName}. Redirecting...`);
                                app.renderAdminEMI();
                                return;
                            }
                            return originalFn.apply(app, arguments);
                        };
                    }
                });
            };

window.app.showLoginScreen = () => {
                const splash = document.getElementById('app-splash');
                const loginView = document.getElementById('login-view');

                loginView.classList.remove('hidden');
                loginView.classList.add('flex');

                if (splash) {
                    setTimeout(() => {
                        splash.classList.add('opacity-0', 'pointer-events-none');
                        setTimeout(() => splash.remove(), 700);
                    }, 500);
                }
            };

window.app.getAchBadge = (val) => {
                let badgeClass = '';
                if (val >= 100) {
                    badgeClass = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
                } else if (val >= 80) {
                    badgeClass = 'bg-lime-500/10 text-lime-700 border-lime-500/20';
                } else if (val >= 60) {
                    badgeClass = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
                } else {
                    badgeClass = 'bg-rose-500/10 text-rose-700 border-rose-500/20';
                }
                return `<span class="px-2 py-0.5 rounded-lg border font-black text-[10px] shadow-sm ${badgeClass}">${val}%</span>`;
            };

window.app.updateAuroraColors = () => {
                const body = document.body;
                if (body) {
                    if (app.currentUser && (app.currentUser.role === 'admin' || app.currentUser.role === 'subadmin')) {
                        body.classList.add('aurora-active');
                    } else {
                        body.classList.remove('aurora-active');
                    }
                }
            };

window.app.refreshIcons = () => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                app.updateAuroraColors();
            };

window.app.showLoader = (msg = 'Processing...') => {
                const loader = document.getElementById('global-loader');
                const card = document.getElementById('loader-card');
                document.getElementById('loader-text').innerText = msg;
                loader.classList.remove('opacity-0', 'pointer-events-none');
                card.classList.remove('scale-95');
                card.classList.add('scale-100');
            };

window.app.hideLoader = () => {
                const loader = document.getElementById('global-loader');
                const card = document.getElementById('loader-card');
                loader.classList.add('opacity-0', 'pointer-events-none');
                card.classList.remove('scale-100');
                card.classList.add('scale-95');
            };

window.app.showToast = (msg, type = 'success') => {
                const container = document.getElementById('toast-container');
                const toast = document.createElement('div');
                const colors = type === 'success' ? 'bg-green-100 border-green-500 text-green-800' :
                    type === 'error' ? 'bg-red-100 border-red-500 text-red-800' : 'bg-blue-100 border-blue-500 text-blue-800';

                toast.className = `flex items-center gap-2 p-4 border-l-4 rounded shadow-lg transition-all duration-300 transform translate-x-full opacity-0 ${colors}`;
                toast.innerHTML = `
                    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-5 h-5"></i>
                    <span class="font-medium text-sm">${msg}</span>
                `;
                container.appendChild(toast);
                app.refreshIcons();

                // Animate in
                setTimeout(() => { toast.classList.remove('translate-x-full', 'opacity-0'); }, 10);
                // Remove
                setTimeout(() => {
                    toast.classList.add('translate-x-full', 'opacity-0');
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            };

window.app.formatCurrency = (amount) => {
                return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(amount).replace('BDT', '৳');
            };

window.app.normalizeDate = (dateInput) => {
                if (!dateInput) return '';
                let str = String(dateInput).trim();
                if (str === '' || str === '0000-00-00') return '';

                // Try checking if it's an Excel serial date
                const serial = parseFloat(str);
                if (!isNaN(serial) && serial > 30000 && serial < 60000) {
                    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }

                // Clean separators
                let cleanStr = str.replace(/[\.\/]/g, '-');

                // Match DD-MM-YYYY or DD-MM-YY
                const dmyMatch = cleanStr.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
                if (dmyMatch) {
                    let day = parseInt(dmyMatch[1], 10);
                    let month = parseInt(dmyMatch[2], 10);
                    let year = parseInt(dmyMatch[3], 10);
                    if (year < 100) {
                        year += (year < 50 ? 2000 : 1900);
                    }
                    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const testDate = new Date(formattedDate);
                    if (!isNaN(testDate.getTime())) {
                        return formattedDate;
                    }
                }

                // Match YYYY-MM-DD
                const ymdMatch = cleanStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
                if (ymdMatch) {
                    let year = parseInt(ymdMatch[1], 10);
                    let month = parseInt(ymdMatch[2], 10);
                    let day = parseInt(ymdMatch[3], 10);
                    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const testDate = new Date(formattedDate);
                    if (!isNaN(testDate.getTime())) {
                        return formattedDate;
                    }
                }

                // Try standard JS date parsing
                const date = new Date(str);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }

                return str;
            };

window.app.formatDateCreative = (dateStr) => {
                if (!dateStr || dateStr === '0000-00-00' || String(dateStr).trim() === '') {
                    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-bold"><i data-lucide="help-circle" class="w-2.5 h-2.5"></i> Pending Sync</span>`;
                }
                try {
                    const normalized = app.normalizeDate(dateStr);
                    const date = new Date(normalized);
                    if (isNaN(date.getTime())) {
                        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-bold"><i data-lucide="help-circle" class="w-2.5 h-2.5"></i> Pending Sync</span>`;
                    }
                    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // e.g., "12 Apr 2025"
                } catch (e) {
                    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-bold"><i data-lucide="help-circle" class="w-2.5 h-2.5"></i> Pending Sync</span>`;
                }
            };

window.app.populateLoginDropdown = () => {
                const select = document.getElementById('login-user-select');
                if (!select) return;

                let optionsHtml = '';

                const admins = DB.users.filter(u => u.role === 'admin' || u.role === 'subadmin');
                if (admins.length > 0) {
                    optionsHtml += `<optgroup label="System Administration">`;
                    admins.forEach(u => optionsHtml += `<option value="${u.id}">${u.role === 'subadmin' ? 'Sub Admin' : 'Global'} - ${u.name}</option>`);
                    optionsHtml += `</optgroup>`;
                }

                const ams = DB.users.filter(u => u.role === 'am');
                if (ams.length > 0) {
                    optionsHtml += `<optgroup label="Area">`;
                    ams.forEach(u => {
                        const areaNames = u.territories.map(tId => DB.territories.find(t => t.id === tId)?.name).filter(Boolean).join(', ') || 'No Area';
                        const cleanName = u.name.replace(/\s*\(\s*(AM|MO)\s*\)/i, '').replace(/\s*(AM|MO)$/i, '').trim();
                        optionsHtml += `<option value="${u.id}">${areaNames} - ${cleanName}</option>`;
                    });
                    optionsHtml += `</optgroup>`;
                }

                const sos = DB.users.filter(u => u.role === 'so');
                if (sos.length > 0) {
                    optionsHtml += `<optgroup label="Territory">`;
                    sos.forEach(u => {
                        const areaName = DB.territories.find(t => t.id === u.territories[0])?.name || 'Unknown';
                        const cleanName = u.name.replace(/\s*\(\s*(AM|MO)\s*\)/i, '').replace(/\s*(AM|MO)$/i, '').trim();
                        optionsHtml += `<option value="${u.id}">${areaName} - ${cleanName}</option>`;
                    });
                    optionsHtml += `</optgroup>`;
                }

                select.innerHTML = optionsHtml;

                // Sync custom searchable dropdown
                app.buildCustomLoginSelect();
            };

window.app.loadAppLayout = () => {
                const canvas = document.getElementById('login-particles');
                if (canvas && typeof canvas.cleanupParticles === 'function') {
                    canvas.cleanupParticles();
                }
                document.getElementById('login-view').classList.add('opacity-0', 'pointer-events-none');
                app.updateViewport();
                setTimeout(() => {
                    document.getElementById('app-container').classList.remove('hidden');
                    app.setupSidebar();

                    const lastPage = localStorage.getItem('aci_last_page');
                    const lastRole = localStorage.getItem('aci_last_role');
                    const sameRole = lastRole === app.currentUser.role;

                    if (app.currentUser.role === 'so') {
                        const notifContainer = document.getElementById('officer-notifications-container');
                        if (notifContainer) {
                            notifContainer.classList.remove('hidden');
                            notifContainer.classList.add('flex');
                        }
                        const targetPage = (sameRole && lastPage) ? lastPage : 'dashboard';
                        app.navigateSO(targetPage);
                        app.updateSOBadge();
                    } else if (app.currentUser.role === 'subadmin') {
                        const notifContainer = document.getElementById('officer-notifications-container');
                        if (notifContainer) {
                            notifContainer.classList.add('hidden');
                            notifContainer.classList.remove('flex');
                        }
                        app.renderAdminEMI();
                    } else {
                        const notifContainer = document.getElementById('officer-notifications-container');
                        if (notifContainer) {
                            notifContainer.classList.add('hidden');
                            notifContainer.classList.remove('flex');
                        }

                        if (sameRole && lastPage) {
                            switch (lastPage) {
                                case 'map': app.renderAdminSalesMap(); break;
                                case 'analytics': app.renderAdminAnalytics(); break;
                                case 'ai': app.renderAdminAIInsights(); break;
                                case 'users': app.renderUserManagement(); break;
                                case 'models': app.renderModelManagement(); break;
                                case 'upload': app.renderDataUpload(); break;
                                case 'emi': app.renderAdminEMI(); break;
                                case 'manual': app.renderAdminManualDeliveries(); break;
                                case 'notices': app.renderAdminNotices(); break;
                                case 'tiv': app.renderTIVManagement(); break;
                                case 'settings': app.renderSystemSettings(); break;
                                case 'pulse': app.renderAMPulseMatrix(); break;
                                case 'incentive': app.renderIncentiveCalculation(); break;
                                default: app.renderAdminDashboard();
                            }
                        } else {
                            app.renderAdminDashboard();
                        }
                    }
                }, 300);
            };

window.app.toggleSidebar = () => {
                const sidebar = document.getElementById('desktop-sidebar');
                const overlay = document.getElementById('sidebar-overlay');
                if (sidebar.classList.contains('-translate-x-full')) {
                    sidebar.classList.remove('-translate-x-full');
                    overlay.classList.remove('hidden');
                    setTimeout(() => overlay.classList.remove('opacity-0'), 10);
                } else {
                    app.closeSidebar();
                }
            };

window.app.closeSidebar = () => {
                const sidebar = document.getElementById('desktop-sidebar');
                const overlay = document.getElementById('sidebar-overlay');
                if (!sidebar.classList.contains('-translate-x-full')) {
                    sidebar.classList.add('-translate-x-full');
                    overlay.classList.add('opacity-0');
                    setTimeout(() => overlay.classList.add('hidden'), 300);
                }
            };

window.app.updateAiWidgetVisibility = () => {
                const widget = document.getElementById('ai-chat-widget');
                if (!widget) return;

                const isAdmin = app.currentUser && (app.currentUser.role === 'admin' || app.currentUser.role === 'subadmin');

                if (isAdmin) {
                    widget.classList.remove('hidden');
                } else {
                    widget.classList.add('hidden');
                    if (app.aiAssistant && app.aiAssistant.isOpen) {
                        const panel = document.getElementById('ai-chat-panel');
                        if (panel) {
                            panel.classList.remove('scale-100', 'opacity-100');
                            panel.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
                        }
                        app.aiAssistant.isOpen = false;
                    }
                }
            };

window.app.setupSidebar = () => {
                document.getElementById('sidebar-user-name').innerText = app.currentUser.name;
                let roleText = app.currentUser.role.toUpperCase();
                if (app.currentUser.role === 'am' && app.currentUser.area_name) {
                    roleText += ` - ${app.currentUser.area_name.toUpperCase()}`;
                }
                document.getElementById('sidebar-user-role').innerText = roleText;
                document.getElementById('sidebar-user-initial').innerText = app.currentUser.name.charAt(0);

                const nav = document.getElementById('sidebar-nav');
                const activePage = localStorage.getItem('aci_last_page') || 'dashboard';

                const renderSidebarBtn = (page, label, iconName, defaultIconColorClass, onClickAction, badgeHtml = '', specialClass = '') => {
                    const isActive = activePage === page;
                    
                    let btnClass = '';
                    let indicator = '';
                    let iconBox = '';

                    if (isActive) {
                        btnClass = `w-full flex items-center justify-between px-3.5 py-2.5 my-1 text-xs font-black rounded-xl text-white bg-gradient-to-r from-slate-800/90 via-slate-800/70 to-slate-900/90 shadow-[0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] border border-white/15 backdrop-blur-xl relative pl-4 transition-all duration-300 group`;
                        indicator = `<div class="absolute left-0 top-1/2 -translate-y-1/2 w-1.2 h-5 rounded-r-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]"></div>`;
                        iconBox = `<div class="p-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 shadow-inner flex items-center justify-center shrink-0"><i data-lucide="${iconName}" class="w-4 h-4 text-amber-400"></i></div>`;
                    } else {
                        btnClass = `w-full flex items-center justify-between px-3.5 py-2.5 my-0.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 hover:border-slate-700/60 border border-transparent transition-all duration-300 group ${specialClass || ''}`;
                        iconBox = `<div class="p-1.5 rounded-lg bg-slate-800/40 group-hover:bg-white/10 group-hover:scale-105 border border-slate-700/30 group-hover:border-white/10 transition-all duration-300 flex items-center justify-center shrink-0"><i data-lucide="${iconName}" class="w-4 h-4 ${defaultIconColorClass} group-hover:text-amber-300 transition-colors"></i></div>`;
                    }

                    return `
                        <button onclick="app.closeSidebar(); ${onClickAction}" class="${btnClass}">
                            ${indicator}
                            <div class="flex items-center gap-3">
                                ${iconBox}
                                <span class="tracking-wide">${label}</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                ${badgeHtml}
                                ${isActive ? '<i data-lucide="chevron-right" class="w-3.5 h-3.5 text-amber-400/80"></i>' : ''}
                            </div>
                        </button>
                    `;
                };

                let links = '';

                   if (app.currentUser.role === 'admin') {
                    links = [
                        renderSidebarBtn('dashboard', 'Dashboard', 'pie-chart', 'text-aci-gold', 'app.renderAdminDashboard()'),
                        renderSidebarBtn('map', 'Upazila Sales Map', 'map', 'text-emerald-400', 'app.renderAdminSalesMap()'),
                        renderSidebarBtn('emi', 'EMI Analytics', 'banknote', 'text-slate-400', 'app.renderAdminEMI()'),
                        renderSidebarBtn('manual', 'Manual Deliveries', 'clipboard-list', 'text-indigo-400', 'app.renderAdminManualDeliveries()'),
                        renderSidebarBtn('tiv', 'TIV Management', 'bar-chart', 'text-amber-400', 'app.renderTIVManagement()'),
                        renderSidebarBtn('ai', 'AI Insights & Analytics', 'brain-circuit', 'text-purple-400', 'app.renderAdminAIInsights()'),
                        renderSidebarBtn('incentive', 'Incentive Calculation', 'calculator', 'text-teal-400', 'app.renderIncentiveCalculation()'),
                        renderSidebarBtn('analytics', 'Historical Analytics', 'bar-chart-2', 'text-sky-400', 'app.renderAdminAnalytics()'),
                        renderSidebarBtn('notices', 'Notices & Links', 'megaphone', 'text-amber-500', 'app.renderAdminNotices()', '', 'border border-amber-600/20 bg-amber-600/10 text-slate-200'),
                        renderSidebarBtn('upload', 'Data Upload (Bulk)', 'upload-cloud', 'text-slate-400', 'app.renderDataUpload()'),
                        renderSidebarBtn('users', 'User Management', 'users', 'text-slate-400', 'app.renderUserManagement()'),
                        renderSidebarBtn('models', 'Manage Models', 'box', 'text-slate-400', 'app.renderModelManagement()'),
                        renderSidebarBtn('settings', 'System Config', 'settings', 'text-cyan-400', 'app.renderSystemSettings()', '', 'border border-cyan-500/20 bg-cyan-500/10 text-slate-200 hover:bg-cyan-500/20')
                    ].join('');
                } else if (app.currentUser.role === 'subadmin') {
                    links = [
                        renderSidebarBtn('emi', 'Global EMI Analytics', 'banknote', 'text-slate-400', 'app.renderAdminEMI()')
                    ].join('');
                } else if (app.currentUser.role === 'am') {
                    links = [
                        renderSidebarBtn('dashboard', 'My Territories', 'layout-dashboard', 'text-aci-gold', 'app.renderAdminDashboard()'),
                        renderSidebarBtn('pulse', 'Performance Matrix', 'calendar-range', 'text-violet-400', 'app.renderAMPulseMatrix()'),
                        renderSidebarBtn('emi', 'Area EMI Summary', 'banknote', 'text-slate-400', 'app.renderAdminEMI()'),
                        renderSidebarBtn('incentive', 'Incentive Calculation', 'calculator', 'text-teal-400', 'app.renderIncentiveCalculation()'),
                        renderSidebarBtn('profile', 'Profile', 'user', 'text-slate-400', 'app.renderUserProfile()')
                    ].join('');
                    
                } else if (app.currentUser.role === 'so') {
                    links = [
                        renderSidebarBtn('dashboard', 'Sales Dashboard', 'layout-dashboard', 'text-slate-400', "app.navigateSO('dashboard')"),
                        renderSidebarBtn('pulse', 'Performance Matrix', 'calendar-range', 'text-violet-400', "app.navigateSO('pulse')"),
                        renderSidebarBtn('credit_note', 'Credit Notes', 'file-minus', 'text-rose-400', "app.navigateSO('credit_note')"),
                        renderSidebarBtn('emi', 'EMI Collection', 'wallet', 'text-slate-400', "app.navigateSO('emi')", '<span id="so-overdue-badge" class="hidden bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0</span>'),
                        renderSidebarBtn('tiv', 'TIV Reporting', 'bar-chart-3', 'text-slate-400', "app.navigateSO('tiv')"),
                        renderSidebarBtn('incentive', 'Incentive Calculation', 'calculator', 'text-teal-400', "app.navigateSO('incentive')"),
                        renderSidebarBtn('profile', 'Profile', 'user', 'text-slate-400', "app.navigateSO('profile')")
                    ].join('');
                }
                nav.innerHTML = links;
                app.refreshIcons();
                app.updateAiWidgetVisibility();
            };



window.app.renderIncentiveCalculation = () => {
    localStorage.setItem('aci_last_page', 'incentive');
    localStorage.setItem('aci_last_role', app.currentUser.role);
    
    // Clear active states in navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-aci-blue');
        btn.classList.add('text-slate-400');
        if (btn.dataset.target === 'incentive') {
            btn.classList.add('text-aci-blue');
            btn.classList.remove('text-slate-400');
        }
    });

    const html = `
        <div class="w-full min-h-[75vh] flex items-center justify-center fade-in p-4">
            <div class="relative w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_50px_rgba(99,102,241,0.15)] flex flex-col items-center text-center overflow-hidden">
                <!-- Decorative background gradients -->
                <div class="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <!-- Rotating/pulsing badge -->
                <div class="relative flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-6 group hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 animate-ping opacity-25"></div>
                    <i data-lucide="calculator" class="w-10 h-10 text-white animate-pulse"></i>
                </div>
                
                <!-- Title & Subtitle -->
                <h1 class="text-2xl font-black text-slate-800 tracking-tight">Incentive Calculation</h1>
                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100/50 mt-2.5 flex items-center gap-1.5">
                    <span class="relative flex h-1.5 w-1.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                    </span>
                    Module under development
                </span>
                
                <!-- Content description -->
                <p class="text-xs text-slate-500 font-medium max-w-sm mt-5 leading-relaxed">
                    We are building an advanced real-time incentive tracker. This module will automatically compute slab-wise sales commissions, recovery bonuses, and target achievements.
                </p>
                
                <!-- Progress indicator -->
                <div class="w-full bg-slate-100 rounded-full h-2 mt-8 overflow-hidden relative shadow-inner">
                    <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 h-full rounded-full w-2/3 animate-pulse"></div>
                </div>
                <div class="flex justify-between w-full text-[10px] text-slate-400 font-extrabold uppercase mt-2">
                    <span>Designing UI/UX</span>
                    <span class="text-indigo-600 animate-pulse">Working on Progress...</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('view-port').innerHTML = html;
    app.refreshIcons();
};


window.app.initCopyrightFooterHandler = () => {
    const viewPort = document.getElementById('view-port');
    const footer = document.getElementById('copyright-footer');
    if (!viewPort || !footer) return;

    const updateFooterVisibility = () => {
        const isMobile = window.innerWidth < 768;
        if (app.currentUser && app.currentUser.role === 'so') {
            if (isMobile) {
                const hasScrollbar = viewPort.scrollHeight > viewPort.clientHeight;
                if (!hasScrollbar) {
                    footer.style.opacity = '0';
                    footer.style.pointerEvents = 'none';
                } else {
                    const isAtBottom = viewPort.scrollHeight - viewPort.scrollTop - viewPort.clientHeight < 20;
                    if (isAtBottom) {
                        footer.style.opacity = '1';
                        footer.style.pointerEvents = 'auto';
                    } else {
                        footer.style.opacity = '0';
                        footer.style.pointerEvents = 'none';
                    }
                }
            } else {
                const hasScrollbar = viewPort.scrollHeight > viewPort.clientHeight;
                if (!hasScrollbar) {
                    footer.style.opacity = '1';
                    footer.style.pointerEvents = 'auto';
                } else {
                    const isAtBottom = viewPort.scrollHeight - viewPort.scrollTop - viewPort.clientHeight < 20;
                    if (isAtBottom) {
                        footer.style.opacity = '1';
                        footer.style.pointerEvents = 'auto';
                    } else {
                        footer.style.opacity = '0';
                        footer.style.pointerEvents = 'none';
                    }
                }
            }
        } else {
            footer.style.opacity = '1';
            footer.style.pointerEvents = 'auto';
        }
    };

    if (app._updateFooterVisibility) {
        viewPort.removeEventListener('scroll', app._updateFooterVisibility);
        window.removeEventListener('resize', app._updateFooterVisibility);
    }

    app._updateFooterVisibility = updateFooterVisibility;
    viewPort.addEventListener('scroll', updateFooterVisibility);
    window.addEventListener('resize', updateFooterVisibility);

    const observer = new MutationObserver(() => {
        setTimeout(updateFooterVisibility, 100);
    });
    observer.observe(viewPort, { childList: true, subtree: true });

};

// Security Feature: Admin Password Prompt
window.app.promptAdminPassword = (callback) => {
    if (sessionStorage.getItem('aci_admin_unlocked') === 'true') {
        callback();
        return;
    }
    
    const modalHtml = `
        <div id="admin-pass-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                <div class="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                        <i data-lucide="lock" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800">Restricted Access</h3>
                        <p class="text-[11px] text-slate-500">Admin authorization required</p>
                    </div>
                </div>
                <div class="p-6">
                    <input type="password" id="admin-pass-input" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" placeholder="Enter PIN/Password">
                    <div id="admin-pass-error" class="text-red-500 text-[11px] mt-2 hidden font-medium">Incorrect password. Please try again.</div>
                </div>
                <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button id="admin-pass-cancel" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
                    <button id="admin-pass-submit" class="px-5 py-2 text-sm font-bold bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors">Unlock</button>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('admin-pass-modal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) window.lucide.createIcons();
    
    const input = document.getElementById('admin-pass-input');
    const submitBtn = document.getElementById('admin-pass-submit');
    const cancelBtn = document.getElementById('admin-pass-cancel');
    const errorMsg = document.getElementById('admin-pass-error');
    
    input.focus();
    
    const verify = () => {
        if (input.value === 'Imon@0123') {
            sessionStorage.setItem('aci_admin_unlocked', 'true');
            document.getElementById('admin-pass-modal').remove();
            callback();
        } else {
            errorMsg.classList.remove('hidden');
            input.classList.add('border-red-500', 'bg-red-50');
            setTimeout(() => {
                input.classList.remove('border-red-500', 'bg-red-50');
            }, 1000);
        }
    };
    
    submitBtn.addEventListener('click', verify);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') verify(); });
    cancelBtn.addEventListener('click', () => {
        document.getElementById('admin-pass-modal').remove();
        if (window.app.renderAdminManual) {
            window.app.renderAdminManual();
        }
    });
};
