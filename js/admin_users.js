// --- Sales360 Module: admin_users.js ---
window.app = window.app || {};

window.app.renderModelManagement = () => {
                localStorage.setItem('aci_last_page', 'models');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                const html = `
                    <div class="w-full fade-in">
                        <div class="mb-6 flex justify-between items-center">
                            <div>
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight">Vehicle Models</h1></div>
                                <p class="text-sm text-slate-500">Manage brands and model names for MO delivery entry</p>
                            </div>
                            <button onclick="app.showAddEditModelModal()" class="btn-liquid text-white px-4 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-2 transition-colors">
                                <i data-lucide="plus" class="w-4 h-4"></i> Add Model
                            </button>
                        </div>
                        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table class="w-full text-left text-sm whitespace-nowrap">
                                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                                    <tr>
                                        <th class="px-6 py-4 font-semibold">Brand</th>
                                        <th class="px-6 py-4 font-semibold">Model Name</th>
                                        <th class="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${DB.models.map(m => `
                                        <tr class="hover:bg-slate-50 transition-colors">
                                            <td class="px-6 py-4">
                                                <span class="px-2 py-1 rounded text-xs font-bold border flex items-center gap-1.5 w-max ${m.brand === 'Foton' ? 'bg-foton-light text-foton border-foton/30' : 'bg-mahindra-light text-mahindra border-mahindra/30'}">
                                                    <img src="${m.brand === 'Foton' ? 'https://i.ibb.co.com/k6Bbdprf/Foton-emblem.png' : 'https://i.ibb.co.com/qLR0vjHR/Mahindra-simbol.png'}" class="h-3 w-3 object-contain">
                                                    ${m.brand}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 font-semibold text-slate-800">${m.name}</td>
                                            <td class="px-6 py-4 text-right">
                                                <button onclick="app.showAddEditModelModal('${m.id}')" class="text-slate-400 hover:text-aci-blue mx-1 transition-colors tooltip" title="Edit Model"><i data-lucide="edit" class="w-4 h-4"></i></button>
                                                <button onclick="app.deleteModel('${m.id}')" class="text-slate-400 hover:text-red-500 mx-1 transition-colors tooltip" title="Delete Model"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.showAddEditModelModal = (modelId = null) => {
                let modal = document.getElementById('add-model-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'add-model-modal';
                    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }

                const model = modelId ? DB.models.find(m => m.id === modelId) : null;

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick="app.closeAddEditModelModal()"></div>
                    <div class="bg-white p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-md mx-4 border border-white">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-aci-blue/10 flex items-center justify-center text-aci-blue">
                                    <i data-lucide="${model ? 'edit' : 'plus-circle'}" class="w-5 h-5"></i>
                                </div>
                                ${model ? 'Edit Vehicle Model' : 'Add Vehicle Model'}
                            </h2>
                            <button type="button" onclick="app.closeAddEditModelModal()" class="text-slate-400 hover:text-red-500 p-2 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <form id="add-model-form" onsubmit="app.handleAddEditModel(event, ${model ? `'${model.id}'` : 'null'})" class="space-y-4">
                            <div>
                                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Brand</label>
                                <div class="relative">
                                    <select id="model-brand" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue transition-all appearance-none" required>
                                        <option value="Foton" ${model && model.brand === 'Foton' ? 'selected' : ''}>Foton</option>
                                        <option value="Mahindra" ${model && model.brand === 'Mahindra' ? 'selected' : ''}>Mahindra</option>
                                    </select>
                                    <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Model Name</label>
                                <input type="text" id="model-name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue transition-all" required placeholder="e.g. TM3" value="${model ? model.name.replace(/"/g, '&quot;') : ''}">
                            </div>
                            <div class="pt-4 mt-2 border-t border-slate-100 flex gap-3">
                                <button type="button" onclick="app.closeAddEditModelModal()" class="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" class="flex-1 btn-liquid text-white px-4 py-3 rounded-xl font-black shadow-lg flex items-center justify-center gap-2">
                                    <i data-lucide="check" class="w-5 h-5"></i> ${model ? 'Save Changes' : 'Add Model'}
                                </button>
                            </div>
                        </form>
                    </div>
                `;
                modal.classList.remove('hidden');
                app.refreshIcons();
                setTimeout(() => document.getElementById('model-name').focus(), 100);
            };

window.app.closeAddEditModelModal = () => {
                const modal = document.getElementById('add-model-modal');
                if (modal) modal.classList.add('hidden');
            };

window.app.handleAddEditModel = async (e, modelId = null) => {
                e.preventDefault();
                const brand = document.getElementById('model-brand').value;
                const name = document.getElementById('model-name').value.trim();

                if (!name) {
                    app.showToast('Model name is required.', 'error');
                    return;
                }

                app.showLoader('Saving model...');
                try {
                    if (modelId) {
                        const model = DB.models.find(m => m.id === modelId);
                        if (model) {
                            model.brand = brand;
                            model.name = name;
                            if (app.neonSQL) {
                                await app.neonSQL`UPDATE models SET brand = ${brand}, name = ${name} WHERE id = ${modelId}`;
                            }
                            app.showToast('Model updated successfully.', 'success');
                        }
                    } else {
                        const newId = 'm' + (DB.models.length > 0 ? Math.max(...DB.models.map(m => parseInt(m.id.substring(1)))) + 1 : 1);
                        const newModel = {
                            id: newId,
                            brand: brand,
                            name: name
                        };
                        DB.models.push(newModel);
                        if (app.neonSQL) {
                            await app.neonSQL`INSERT INTO models (id, brand, name) VALUES (${newId}, ${brand}, ${name})`;
                        }
                        app.showToast('Model added successfully.', 'success');
                    }

                    app.closeAddEditModelModal();
                    app.renderModelManagement();
                } catch (err) {
                    console.error('Failed to save model:', err);
                    app.showToast('Failed to save model to database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

window.app.deleteModel = async (modelId) => {
                if (confirm('Are you sure you want to delete this vehicle model?')) {
                    app.showLoader('Deleting model...');
                    try {
                        const index = DB.models.findIndex(m => m.id === modelId);
                        if (index !== -1) {
                            DB.models.splice(index, 1);
                            if (app.neonSQL) {
                                await app.neonSQL`DELETE FROM models WHERE id = ${modelId}`;
                            }
                            app.showToast('Model deleted successfully.', 'success');
                            app.renderModelManagement();
                        }
                    } catch (err) {
                        console.error('Failed to delete model:', err);
                        app.showToast('Failed to delete model from database.', 'error');
                    } finally {
                        app.hideLoader();
                    }
                }
            };

window.app.exportUsersToCSV = () => {
                try {
                    const headers = ["Territory Name", "Employee Name", "Staff ID", "Area Name", "Supervisor Name", "Supervisor Staff ID"];
                    const rows = [];

                    // Process all users in DB.users
                    DB.users.forEach(u => {
                        const empName = u.name || '';
                        const staffId = u.employee_id || u.id || '';
                        let terrName = 'N/A';
                        let areaName = u.area_name || 'N/A';
                        let supervisorName = 'N/A';
                        let supervisorStaffId = 'N/A';

                        if (u.role === 'admin' || u.role === 'subadmin') {
                            terrName = 'Global / Head Office';
                            areaName = u.role === 'subadmin' ? 'Sub Administration' : 'Global Administration';
                            supervisorName = 'System Management';
                            supervisorStaffId = 'ADMIN';
                        } else if (u.role === 'am') {
                            const assignedTerritories = (u.territories || [])
                                .map(tId => DB.territories.find(t => t.id === tId)?.name)
                                .filter(Boolean);
                            terrName = assignedTerritories.length > 0 ? assignedTerritories.join('; ') : 'All Area Territories';
                            areaName = u.area_name || 'Area Management';

                            const sysAdmin = DB.users.find(adm => adm.role === 'admin');
                            supervisorName = sysAdmin ? sysAdmin.name : 'System Management';
                            supervisorStaffId = sysAdmin ? sysAdmin.employee_id : 'ADMIN';
                        } else if (u.role === 'so') {
                            const primaryTerrId = (u.territories && u.territories.length > 0) ? u.territories[0] : null;
                            const terrObj = DB.territories.find(t => t.id === primaryTerrId);
                            terrName = terrObj ? terrObj.name : 'Unassigned Territory';

                            const amSupervisor = DB.users.find(am => am.role === 'am' && primaryTerrId && am.territories.includes(primaryTerrId));
                            if (amSupervisor) {
                                supervisorName = amSupervisor.name;
                                supervisorStaffId = amSupervisor.employee_id;
                                areaName = amSupervisor.area_name || terrName || 'Area';
                            } else {
                                const defaultAM = DB.users.find(am => am.role === 'am');
                                supervisorName = defaultAM ? defaultAM.name : 'Area Manager';
                                supervisorStaffId = defaultAM ? defaultAM.employee_id : 'N/A';
                                areaName = terrName || 'Territory Area';
                            }
                        }

                        rows.push([
                            `"${terrName.replace(/"/g, '""')}"`,
                            `"${empName.replace(/"/g, '""')}"`,
                            `"${staffId.replace(/"/g, '""')}"`,
                            `"${areaName.replace(/"/g, '""')}"`,
                            `"${supervisorName.replace(/"/g, '""')}"`,
                            `"${supervisorStaffId.replace(/"/g, '""')}"`
                        ]);
                    });

                    // Check for unassigned territories
                    DB.territories.forEach(t => {
                        const hasUser = DB.users.some(u => u.role === 'so' && u.territories.includes(t.id));
                        if (!hasUser) {
                            const amSupervisor = DB.users.find(am => am.role === 'am' && am.territories.includes(t.id));
                            rows.push([
                                `"${t.name.replace(/"/g, '""')}"`,
                                `"Unassigned Officer"`,
                                `"UNASSIGNED"`,
                                `"${(amSupervisor?.area_name || t.name).replace(/"/g, '""')}"`,
                                `"${(amSupervisor?.name || 'Area Manager').replace(/"/g, '""')}"`,
                                `"${(amSupervisor?.employee_id || 'N/A').replace(/"/g, '""')}"`
                            ]);
                        }
                    });

                    const csvString = "\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
                    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `Sales360_User_List_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    app.showToast('User list exported as CSV successfully!', 'success');
                } catch(err) {
                    console.error('CSV Export Error:', err);
                    app.showToast('Failed to export CSV.', 'error');
                }
            };

window.app.renderUserManagement = () => {
                if (sessionStorage.getItem('aci_admin_unlocked') !== 'true') {
                    app.promptAdminPassword(() => app.renderUserManagement());
                    return;
                }
                localStorage.setItem('aci_last_page', 'users');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                const admins = DB.users.filter(u => u.role === 'admin' || u.role === 'subadmin');
                const ams = DB.users.filter(u => u.role === 'am');

                const html = `
                    <div class="w-full fade-in pb-12">
                        <div class="mb-6 flex justify-between items-center">
                            <div>
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight">User Management</h1></div>
                                <p class="text-sm text-slate-500">Manage System Administrators, AMs, and MOs</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="app.exportUsersToCSV()" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 transition-all hover:border-emerald-500 hover:text-emerald-700 active:scale-95">
                                    <i data-lucide="download" class="w-4 h-4 text-emerald-600"></i> Download CSV
                                </button>
                                <button onclick="app.showAddUserModal()" class="btn-liquid text-white px-4 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-2 transition-colors">
                                    <i data-lucide="plus" class="w-4 h-4"></i> Add User
                                </button>
                            </div>
                        </div>

                        <!-- System Admin Section -->
                        <div class="mb-8">
                            <h2 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><i data-lucide="shield" class="w-4 h-4"></i></div>
                                Administrator Management
                            </h2>
                            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                                <table class="w-full text-left text-sm whitespace-nowrap">
                                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                                        <tr>
                                            <th class="px-6 py-4 font-semibold">User</th>
                                            <th class="px-6 py-4 font-semibold">Role</th>
                                            <th class="px-6 py-4 font-semibold">Status</th>
                                            <th class="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${admins.map(u => `
                                            <tr class="hover:bg-slate-50 transition-colors">
                                                <td class="px-6 py-4">
                                                    <div class="font-bold text-slate-800">${u.name}</div>
                                                    <div class="text-[10px] text-slate-500 font-mono font-bold tracking-widest mt-0.5">ID: ${u.employee_id || u.password || "N/A"}</div>
                                                </td>
                                                <td class="px-6 py-4">
                                                    ${u.role === 'subadmin' 
                                                        ? `<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-purple-200">Sub Admin</span>`
                                                        : `<span class="bg-rose-100 text-rose-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-rose-200">Admin</span>`
                                                    }
                                                </td>
                                                <td class="px-6 py-4">
                                                    <span class="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max border border-green-100">
                                                        <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Active
                                                    </span>
                                                </td>
                                                <td class="px-6 py-4 text-right">
                                                    <button onclick="app.showAddUserModal('${u.id}')" class="text-slate-400 hover:text-aci-blue mx-1 transition-colors tooltip" title="Edit Admin"><i data-lucide="edit" class="w-4 h-4"></i></button>
                                                    ${u.id === app.currentUser.id ? `
                                                        <button class="text-slate-200 cursor-not-allowed mx-1" title="You cannot delete yourself" disabled><i data-lucide="trash-2" class="w-4 h-4 text-slate-200"></i></button>
                                                    ` : `
                                                        <button onclick="app.deleteUser('${u.id}')" class="text-slate-400 hover:text-red-500 mx-1 transition-colors tooltip" title="Delete Admin"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                                    `}
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- AM Section -->
                        <div class="mb-8">
                            <h2 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><i data-lucide="briefcase" class="w-4 h-4"></i></div>
                                AM Management
                            </h2>
                            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                                <table class="w-full text-left text-sm whitespace-nowrap">
                                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                                        <tr>
                                            <th class="px-6 py-4 font-semibold">User</th>
                                            <th class="px-6 py-4 font-semibold">Role & Area</th>
                                            <th class="px-6 py-4 font-semibold">Territories</th>
                                            <th class="px-6 py-4 font-semibold">Status</th>
                                            <th class="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${ams.map(u => `
                                            <tr class="hover:bg-slate-50 transition-colors">
                                                <td class="px-6 py-4">
                                                    <div class="font-bold text-slate-800">${u.name}</div>
                                                    <div class="text-[10px] text-slate-500 font-mono font-bold tracking-widest mt-0.5">ID: ${u.employee_id || u.password || "N/A"}</div>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <span class="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-slate-200">${u.role}</span>
                                                    ${u.area_name ? `<div class="text-xs text-slate-500 mt-1 font-semibold">${u.area_name}</div>` : ''}
                                                </td>
                                                <td class="px-6 py-4 text-slate-600 text-xs">
                                                    ${u.territories.map(tId => DB.territories.find(t => t.id === tId)?.name).join(', ') || '<span class="text-slate-400 italic">Global</span>'}
                                                </td>
                                                <td class="px-6 py-4">
                                                    <span class="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max border border-green-100">
                                                        <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Active
                                                    </span>
                                                </td>
                                                <td class="px-6 py-4 text-right">
                                                    <button onclick="app.showAddUserModal('${u.id}')" class="text-slate-400 hover:text-aci-blue mx-1 transition-colors tooltip" title="Edit AM"><i data-lucide="edit" class="w-4 h-4"></i></button>
                                                    <button onclick="app.deleteUser('${u.id}')" class="text-slate-400 hover:text-red-500 mx-1 transition-colors tooltip" title="Delete AM"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- MO / Territory Section -->
                        <div>
                            <div class="mb-3 flex justify-between items-center">
                                <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><i data-lucide="map-pin" class="w-4 h-4"></i></div>
                                    MO Management
                                </h2>
                                <button onclick="app.showAddTerritoryModal()" class="btn-liquid text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors">
                                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Territory
                                </button>
                            </div>
                            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                                <table class="w-full text-left text-sm whitespace-nowrap">
                                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                                        <tr>
                                            <th class="px-6 py-4 font-semibold w-16">#</th>
                                            <th class="px-6 py-4 font-semibold">Territory Name (Username)</th>
                                            <th class="px-6 py-4 font-semibold">Officer Name</th>
                                            <th class="px-6 py-4 font-semibold">Employee ID (Password)</th>
                                            <th class="px-6 py-4 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${DB.territories.map((t, index) => {
                    const so = DB.users.find(u => u.role === 'so' && u.territories.includes(t.id));
                    return `
                                                <tr class="hover:bg-slate-50 transition-colors">
                                                    <td class="px-6 py-4 font-semibold text-slate-400">${index + 1}</td>
                                                    <td class="px-6 py-4">
                                                        <div class="font-bold text-slate-800">${t.name}</div>
                                                        <div class="text-[10px] text-slate-500 font-mono font-bold tracking-widest mt-0.5 uppercase">ID: ${t.id}</div>
                                                    </td>
                                                    <td class="px-6 py-4">
                                                        ${so ? `<div class="font-bold text-slate-700">${so.name}</div>` : `<span class="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[10px] font-bold uppercase tracking-wider">Unassigned</span>`}
                                                    </td>
                                                    <td class="px-6 py-4">
                                                        ${so ? `<div class="font-mono text-xs font-semibold text-slate-600">${so.employee_id || so.password || "N/A"}</div>` : `<span class="text-slate-300">-</span>`}
                                                    </td>
                                                    <td class="px-6 py-4">
                                                        <div class="flex items-center justify-end gap-1">
                                                            ${so ? `
                                                                <button onclick="app.showAddUserModal('${so.id}')" class="text-slate-400 hover:text-aci-blue p-1.5 rounded hover:bg-slate-50 transition-colors tooltip" title="Edit MO"><i data-lucide="edit" class="w-4 h-4"></i></button>
                                                                <button onclick="app.deleteUser('${so.id}')" class="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors tooltip" title="Delete MO"><i data-lucide="user-x" class="w-4 h-4"></i></button>
                                                            ` : `
                                                                <button onclick="app.showAddUserModal(null, '${t.id}')" class="text-aci-blue hover:text-indigo-600 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors">
                                                                    <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> Assign MO
                                                                </button>
                                                            `}
                                                            <div class="w-px h-5 bg-slate-200 mx-1.5"></div>
                                                            <button onclick="app.deleteTerritory('${t.id}')" class="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors tooltip" title="Delete Territory"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.showAddUserModal = (userId = null, defaultTerritoryId = null) => {
                let modal = document.getElementById('add-user-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'add-user-modal';
                    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }

                const user = userId ? DB.users.find(u => u.id === userId) : null;
                const territoryOptions = DB.territories.map(t => {
                    let isSelected = false;
                    if (user && user.territories.includes(t.id)) isSelected = true;
                    else if (!user && defaultTerritoryId === t.id) isSelected = true;
                    return `<option value="${t.id}" ${isSelected ? 'selected' : ''}>${t.name} (${t.district})</option>`;
                }).join('');

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick="app.closeAddUserModal()"></div>
                    <div class="bg-white p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-lg mx-4 border border-white">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-aci-blue/10 flex items-center justify-center text-aci-blue">
                                    <i data-lucide="${user ? 'edit' : 'user-plus'}" class="w-5 h-5"></i>
                                </div>
                                ${user ? 'Edit User Profile' : 'Create User Profile'}
                            </h2>
                            <button onclick="app.closeAddUserModal()" class="text-slate-400 hover:text-red-500 p-2"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <form id="add-user-form" onsubmit="app.handleAddUser(event, ${user ? `'${user.id}'` : 'null'})" class="space-y-4">
                            <div>
                                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input type="text" id="new-user-name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue transition-all" required placeholder="e.g. Shakil Ahmed" value="${user ? user.name.replace(/\s\((AM|MO|Sub Admin)\)$/, '') : ''}">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Employee ID</label>
                                    <input type="text" id="new-user-empid" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue transition-all" required placeholder="e.g. EMP1050" value="${user ? user.employee_id : ''}">
                                </div>
                                <div>
                                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">System Role</label>
                                    <select id="new-user-role" onchange="app.handleRoleChange()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue transition-all appearance-none" required>
                                        <option value="so" ${(user && user.role === 'so') || defaultTerritoryId ? 'selected' : ''}>MO</option>
                                        <option value="am" ${user && user.role === 'am' ? 'selected' : ''}>AM</option>
                                        <option value="subadmin" ${user && user.role === 'subadmin' && !defaultTerritoryId ? 'selected' : ''}>Sub Admin</option>
                                        <option value="admin" ${user && user.role === 'admin' && !defaultTerritoryId ? 'selected' : ''}>System Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div id="area-name-selection-container" class="hidden">
                                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Area Name</label>
                                <input type="text" id="new-user-areaname" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue transition-all" placeholder="e.g. Dhaka Area" value="${user ? (user.area_name || '') : ''}">
                            </div>
                            <div id="territory-selection-container">
                                <div class="flex justify-between items-end mb-1.5 ml-1">
                                    <label class="block text-xs font-black text-slate-500 uppercase tracking-widest">Assigned Territory</label>
                                    <span class="text-[9px] font-bold text-slate-400" id="terr-hint">Select one area</span>
                                </div>
                                <select id="new-user-territories" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue focus:ring-1 focus:ring-aci-blue transition-all" ${user && user.role === 'am' ? 'multiple' : ''} required>
                                    ${territoryOptions}
                                </select>
                            </div>
                            <div class="pt-4 mt-2 border-t border-slate-100 flex gap-3">
                                <button type="button" onclick="app.closeAddUserModal()" class="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" class="flex-1 btn-liquid text-white px-4 py-3 rounded-xl font-black shadow-lg flex items-center justify-center gap-2"><i data-lucide="check" class="w-5 h-5"></i> ${user ? 'Update User' : 'Provision User'}</button>
                            </div>
                        </form>
                    </div>
                `;
                modal.classList.remove('hidden');
                app.refreshIcons();
                app.handleRoleChange(); // init state
            };

window.app.closeAddUserModal = () => {
                const modal = document.getElementById('add-user-modal');
                if (modal) modal.classList.add('hidden');
            };

window.app.handleRoleChange = () => {
                const role = document.getElementById('new-user-role').value;
                const terrContainer = document.getElementById('territory-selection-container');
                const terrSelect = document.getElementById('new-user-territories');
                const terrHint = document.getElementById('terr-hint');
                const areaContainer = document.getElementById('area-name-selection-container');
                const areaInput = document.getElementById('new-user-areaname');

                if (role === 'am') {
                    if (areaContainer) areaContainer.classList.remove('hidden');
                    if (areaInput) areaInput.setAttribute('required', 'true');
                } else {
                    if (areaContainer) areaContainer.classList.add('hidden');
                    if (areaInput) areaInput.removeAttribute('required');
                }

                if (role === 'admin' || role === 'subadmin') {
                    terrContainer.classList.add('hidden');
                    terrSelect.removeAttribute('required');
                } else if (role === 'so') {
                    terrContainer.classList.remove('hidden');
                    terrSelect.removeAttribute('multiple');
                    terrSelect.setAttribute('required', 'true');
                    terrSelect.size = 1;
                    terrSelect.classList.remove('py-2');
                    terrSelect.classList.add('py-3');
                    if (terrHint) terrHint.innerText = 'Select one area';
                } else if (role === 'am') {
                    terrContainer.classList.remove('hidden');
                    terrSelect.setAttribute('multiple', 'true');
                    terrSelect.setAttribute('required', 'true');
                    terrSelect.size = 5;
                    terrSelect.classList.remove('py-3');
                    terrSelect.classList.add('py-2');
                    if (terrHint) terrHint.innerText = 'Hold Ctrl/Cmd to select multiple';
                }
            };

window.app.handleAddUser = async (e, userId = null) => {
                e.preventDefault();
                const name = document.getElementById('new-user-name').value;
                const empId = document.getElementById('new-user-empid').value;
                const role = document.getElementById('new-user-role').value;
                const terrSelect = document.getElementById('new-user-territories');
                const areaName = role === 'am' ? document.getElementById('new-user-areaname').value : '';

                let territories = [];
                if (role !== 'admin' && role !== 'subadmin') {
                    territories = Array.from(terrSelect.selectedOptions).map(opt => opt.value);
                    if (territories.length === 0) {
                        app.showToast('Please assign at least one territory.', 'error');
                        return;
                    }
                }

                const appendedName = name + (role === 'am' ? ' (AM)' : role === 'so' ? ' (MO)' : role === 'subadmin' ? ' (Sub Admin)' : '');

                app.showLoader('Saving user...');

                try {
                    if (userId) {
                        const user = DB.users.find(u => u.id === userId);
                        if (user) {
                            user.name = appendedName;
                            user.employee_id = empId;
                            user.role = role;
                            user.email = `${empId}.${role}.${userId}@acimotors.com`;
                            user.territories = territories;
                            user.area_name = areaName;
                            
                            if (app.neonSQL) {
                                await app.neonSQL`UPDATE users SET name = ${appendedName}, role = ${role}, employee_id = ${empId}, email = ${user.email}, territories = ${JSON.stringify(territories)}, area_name = ${areaName} WHERE id = ${userId}`;
                            }
                            app.showToast('User updated successfully.', 'success');
                        }
                    } else {
                        const newId = 'u' + (DB.users.length + 1) + Date.now();
                        const newUser = {
                            id: newId,
                            name: appendedName,
                            role: role,
                            employee_id: empId,
                            territories: territories,
                            area_name: areaName,
                            email: `${empId}.${role}.${newId}@acimotors.com`, // unique email structure
                            password: 'password' // dummy password
                        };
                        DB.users.push(newUser);
                        
                        if (app.neonSQL) {
                            await app.neonSQL`INSERT INTO users (id, name, role, email, password, employee_id, territories, area_name) VALUES (${newUser.id}, ${newUser.name}, ${newUser.role}, ${newUser.email}, ${newUser.password}, ${newUser.employee_id}, ${JSON.stringify(newUser.territories)}, ${newUser.area_name})`;
                        }
                        app.showToast('User provisioned successfully.', 'success');
                    }

                    app.closeAddUserModal();
                    app.renderUserManagement();
                    app.populateLoginDropdown(); // Update the login screen dropdown
                } catch (err) {
                    console.error('Failed to save user:', err);
                    app.showToast('Failed to save user to database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

window.app.deleteUser = async (userId) => {
                if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                    app.showLoader('Deleting user...');
                    try {
                        const index = DB.users.findIndex(u => u.id === userId);
                        if (index !== -1) {
                            DB.users.splice(index, 1);
                            
                            if (app.neonSQL) {
                                await app.neonSQL`DELETE FROM users WHERE id = ${userId}`;
                            }
                            
                            app.showToast('User deleted successfully.', 'success');
                            app.renderUserManagement();
                            app.populateLoginDropdown();
                        }
                    } catch (err) {
                        console.error('Failed to delete user:', err);
                        app.showToast('Failed to delete user from database.', 'error');
                    } finally {
                        app.hideLoader();
                    }
                }
            };

window.app.showAddTerritoryModal = () => {
                let modal = document.getElementById('add-territory-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'add-territory-modal';
                    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick="app.closeAddTerritoryModal()"></div>
                    <div class="bg-white p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-sm mx-4 border border-white">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-black text-slate-800 flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <i data-lucide="map-pin" class="w-5 h-5"></i>
                                </div>
                                Add Territory
                            </h2>
                            <button onclick="app.closeAddTerritoryModal()" class="text-slate-400 hover:text-red-500 p-2"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <form id="add-territory-form" onsubmit="app.handleAddTerritory(event)" class="space-y-4">
                            <div>
                                <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Territory Name</label>
                                <input type="text" id="new-territory-name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" required placeholder="e.g. Dhaka East">
                            </div>
                            <div class="pt-4 mt-2 border-t border-slate-100 flex gap-3">
                                <button type="button" onclick="app.closeAddTerritoryModal()" class="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-colors"><i data-lucide="check" class="w-5 h-5"></i> Create</button>
                            </div>
                        </form>
                    </div>
                `;
                modal.classList.remove('hidden');
                app.refreshIcons();
                // Ensure focus on input
                setTimeout(() => document.getElementById('new-territory-name').focus(), 100);
            };

window.app.closeAddTerritoryModal = () => {
                const modal = document.getElementById('add-territory-modal');
                if (modal) modal.classList.add('hidden');
            };

window.app.handleAddTerritory = async (e) => {
                e.preventDefault();
                const name = document.getElementById('new-territory-name').value.trim();
                if (!name) return;

                app.showLoader('Adding territory...');
                try {
                    const newId = 't' + (DB.territories.length > 0 ? Math.max(...DB.territories.map(t => parseInt(t.id.substring(1)))) + 1 : 1);
                    const newTerritory = {
                        id: newId,
                        name: name,
                        district: name,
                        upazilas: []
                    };
                    DB.territories.push(newTerritory);

                    if (app.neonSQL) {
                        await app.neonSQL`INSERT INTO territories (id, name, district, upazilas) VALUES (${newId}, ${name}, ${name}, ${JSON.stringify(newTerritory.upazilas)})`;
                    }

                    app.showToast('Territory added successfully.', 'success');
                    app.closeAddTerritoryModal();
                    app.renderUserManagement();
                } catch (err) {
                    console.error('Failed to add territory:', err);
                    app.showToast('Failed to save territory to database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

window.app.getSortIcon = (col) => {
                if (app.pulseSortCol !== col) return '<i data-lucide="arrow-up-down" class="w-3 h-3 text-slate-300"></i>';
                return app.pulseSortDir === 'asc' ? '<i data-lucide="arrow-up" class="w-3 h-3 text-aci-blue"></i>' : '<i data-lucide="arrow-down" class="w-3 h-3 text-aci-blue"></i>';
            };

window.app.setPulseSort = (col) => {
                if (app.pulseSortCol === col) {
                    app.pulseSortDir = app.pulseSortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    app.pulseSortCol = col;
                    app.pulseSortDir = 'desc'; // Default to descending for numbers and stats
                }
                app.renderAdminDashboard();
            };

window.app.deleteTerritory = async (territoryId) => {
                const soAssigned = DB.users.some(u => u.role === 'so' && u.territories.includes(territoryId));
                if (soAssigned) {
                    app.showToast('Cannot delete territory. Unassign the active MO first.', 'error');
                    return;
                }

                if (confirm('Are you sure you want to delete this territory? This action cannot be undone.')) {
                    app.showLoader('Deleting territory...');
                    try {
                        const index = DB.territories.findIndex(t => t.id === territoryId);
                        if (index !== -1) {
                            DB.territories.splice(index, 1);
                            
                            // We must await AM territory removal logic in SQL since AM's territory list is a JSON column.
                            for (let u of DB.users) {
                                if (u.role === 'am' && u.territories.includes(territoryId)) {
                                    u.territories = u.territories.filter(id => id !== territoryId);
                                    if (app.neonSQL) {
                                        await app.neonSQL`UPDATE users SET territories = ${JSON.stringify(u.territories)} WHERE id = ${u.id}`;
                                    }
                                }
                            }
                            
                            if (app.neonSQL) {
                                await app.neonSQL`DELETE FROM territories WHERE id = ${territoryId}`;
                            }
                            
                            app.showToast('Territory deleted successfully.', 'success');
                            app.renderUserManagement();
                        }
                    } catch (err) {
                        console.error('Failed to delete territory:', err);
                        app.showToast('Failed to delete territory from database. Please check if sales exist for this territory.', 'error');
                    } finally {
                        app.hideLoader();
                    }
                }
            };

window.app.showPulseFilterModal = () => {
                let modal = document.getElementById('pulse-filter-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'pulse-filter-modal';
                    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }

                if (!app.pulseFilterTerritories) app.pulseFilterTerritories = [];

                const isAM = app.currentUser.role === 'am' || app.currentUser.role === 'so';
                const activeTerritories = isAM
                    ? DB.territories.filter(t => app.currentUser.territories.includes(t.id))
                    : DB.territories;

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick="app.closePulseFilterModal()"></div>
                    <div class="bg-white p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-sm mx-4 border border-white flex flex-col max-h-[85vh] fade-in">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-black text-slate-800 flex items-center gap-2">
                                <div class="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><i data-lucide="filter" class="w-4 h-4"></i></div>
                                Filter Territories
                            </h2>
                            <button type="button" onclick="app.closePulseFilterModal()" class="text-slate-400 hover:text-red-500 p-2 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        
                        <div class="mb-3">
                            <div class="relative">
                                <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                                <input type="text" id="pulse-filter-search" onkeyup="app.searchPulseFilterList(this.value)" placeholder="Search..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                            </div>
                        </div>

                        <div class="flex justify-between items-center mb-2 px-1">
                            <button onclick="app.pulseFilterSelectAll(true)" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors">Select All</button>
                            <button onclick="app.pulseFilterSelectAll(false)" class="text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors">Clear</button>
                        </div>

                        <div class="flex-1 overflow-y-auto min-h-[250px] border border-slate-100 bg-slate-50/50 rounded-xl p-2 space-y-1 custom-scrollbar" id="pulse-filter-list">
                            ${activeTerritories.map(t => `
                                <label class="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm pulse-filter-item" data-name="${t.name.toLowerCase()}">
                                    <input type="checkbox" value="${t.id}" class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" ${app.pulseFilterTerritories.length === 0 || app.pulseFilterTerritories.includes(t.id) ? 'checked' : ''}>
                                    <span class="text-xs font-bold text-slate-700">${t.name}</span>
                                </label>
                            `).join('')}
                        </div>

                        <div class="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                            <button onclick="app.closePulseFilterModal()" class="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onclick="app.applyPulseFilter()" class="flex-[2] btn-liquid text-white py-3 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2">
                                <i data-lucide="check" class="w-4 h-4"></i> Apply Filter
                            </button>
                        </div>
                    </div>
                `;
                modal.classList.remove('hidden');
                app.refreshIcons();
                setTimeout(() => document.getElementById('pulse-filter-search')?.focus(), 100);
            };

window.app.closePulseFilterModal = () => {
                const modal = document.getElementById('pulse-filter-modal');
                if (modal) modal.classList.add('hidden');
            };

window.app.searchPulseFilterList = (val) => {
                const term = val.toLowerCase();
                document.querySelectorAll('.pulse-filter-item').forEach(item => {
                    item.style.display = item.dataset.name.includes(term) ? 'flex' : 'none';
                });
            };

window.app.pulseFilterSelectAll = (select) => {
                document.querySelectorAll('.pulse-filter-item input[type="checkbox"]').forEach(cb => {
                    if (cb.closest('.pulse-filter-item').style.display !== 'none') {
                        cb.checked = select;
                    }
                });
            };

window.app.applyPulseFilter = () => {
                const checkboxes = Array.from(document.querySelectorAll('.pulse-filter-item input[type="checkbox"]'));
                const checked = checkboxes.filter(cb => cb.checked).map(cb => cb.value);

                if (checked.length === checkboxes.length) {
                    app.pulseFilterTerritories = []; // Empty array signifies "All"
                } else {
                    app.pulseFilterTerritories = checked;
                }

                app.closePulseFilterModal();
                app.renderAdminDashboard();
            };

window.app.showAreaFilterModal = () => {
                let modal = document.getElementById('area-filter-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'area-filter-modal';
                    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }

                if (!app.areaFilterList) app.areaFilterList = [];

                // Extract unique Area Names directly from AM users in DB
                const uniqueAreas = [...new Set(DB.users.filter(u => u.role === 'am' && u.area_name).map(u => u.area_name))].sort();

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick="app.closeAreaFilterModal()"></div>
                    <div class="bg-white p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-sm mx-4 border border-white flex flex-col max-h-[85vh] fade-in">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-black text-slate-800 flex items-center gap-2">
                                <div class="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><i data-lucide="filter" class="w-4 h-4"></i></div>
                                Filter Area Names
                            </h2>
                            <button type="button" onclick="app.closeAreaFilterModal()" class="text-slate-400 hover:text-red-500 p-2 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        
                        <div class="mb-3">
                            <div class="relative">
                                <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                                <input type="text" id="area-filter-search" onkeyup="app.searchAreaFilterList(this.value)" placeholder="Search..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                            </div>
                        </div>

                        <div class="flex justify-between items-center mb-2 px-1">
                            <button onclick="app.areaFilterSelectAll(true)" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors">Select All</button>
                            <button onclick="app.areaFilterSelectAll(false)" class="text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors">Clear</button>
                        </div>

                        <div class="flex-1 overflow-y-auto min-h-[200px] border border-slate-100 bg-slate-50/50 rounded-xl p-2 space-y-1 custom-scrollbar" id="area-filter-list">
                            ${uniqueAreas.map(a => `
                                <label class="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm area-filter-item" data-name="${a.toLowerCase()}">
                                    <input type="checkbox" value="${a}" class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" ${app.areaFilterList.length === 0 || app.areaFilterList.includes(a) ? 'checked' : ''}>
                                    <span class="text-xs font-bold text-slate-700">${a}</span>
                                </label>
                            `).join('')}
                            ${uniqueAreas.length === 0 ? '<div class="p-4 text-center text-slate-400 text-xs">No areas defined.</div>' : ''}
                        </div>

                        <div class="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                            <button onclick="app.closeAreaFilterModal()" class="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onclick="app.applyAreaFilter()" class="flex-[2] btn-liquid text-white py-3 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2">
                                <i data-lucide="check" class="w-4 h-4"></i> Apply Filter
                            </button>
                        </div>
                    </div>
                `;
                modal.classList.remove('hidden');
                app.refreshIcons();
                setTimeout(() => document.getElementById('area-filter-search')?.focus(), 100);
            };

window.app.closeAreaFilterModal = () => {
                const modal = document.getElementById('area-filter-modal');
                if (modal) modal.classList.add('hidden');
            };

window.app.searchAreaFilterList = (val) => {
                const term = val.toLowerCase();
                document.querySelectorAll('.area-filter-item').forEach(item => {
                    item.style.display = item.dataset.name.includes(term) ? 'flex' : 'none';
                });
            };

window.app.areaFilterSelectAll = (select) => {
                document.querySelectorAll('.area-filter-item input[type="checkbox"]').forEach(cb => {
                    if (cb.closest('.area-filter-item').style.display !== 'none') {
                        cb.checked = select;
                    }
                });
            };

window.app.applyAreaFilter = () => {
                const checkboxes = Array.from(document.querySelectorAll('.area-filter-item input[type="checkbox"]'));
                const checked = checkboxes.filter(cb => cb.checked).map(cb => cb.value);

                if (checked.length === checkboxes.length) {
                    app.areaFilterList = []; // Empty array signifies "All"
                } else {
                    app.areaFilterList = checked;
                }

                app.closeAreaFilterModal();
                app.renderAdminDashboard();
            };

window.app.filterTableGroup = (triggerElem) => {
                const thead = triggerElem.closest('thead');
                const tbody = thead.nextElementSibling;
                const filterRow = triggerElem.closest('tr');
                const ths = Array.from(filterRow.children);
                const rows = tbody.querySelectorAll('tr');

                rows.forEach(row => {
                    if (row.children.length === 1 && row.children[0].colSpan > 1) return;
                    let show = true;
                    ths.forEach((th, index) => {
                        const cell = row.children[index];
                        if (!cell) return;

                        const text = cell.textContent.trim();
                        const inputs = Array.from(th.querySelectorAll('input, select'));

                        if (inputs.length === 1 && inputs[0].type !== 'date') {
                            const filterVal = inputs[0].value.toLowerCase().trim();
                            if (filterVal && !text.toLowerCase().includes(filterVal)) show = false;
                        }
                        else if (inputs.length === 2 && inputs[0].type === 'date' && inputs[1].type === 'date') {
                            const startStr = inputs[0].value;
                            const endStr = inputs[1].value;
                            if (startStr || endStr) {
                                let cellDate = new Date(text);
                                if (isNaN(cellDate.getTime()) && text.includes('/')) {
                                    const parts = text.split('/');
                                    if (parts.length === 3) cellDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                }
                                if (text.toLowerCase() === 'recent' || text.toLowerCase() === 'today') cellDate = new Date();

                                if (!isNaN(cellDate.getTime())) {
                                    if (startStr) {
                                        const startDate = new Date(startStr);
                                        startDate.setHours(0, 0, 0, 0);
                                        if (cellDate < startDate) show = false;
                                    }
                                    if (endStr) {
                                        const endDate = new Date(endStr);
                                        endDate.setHours(23, 59, 59, 999);
                                        if (cellDate > endDate) show = false;
                                    }
                                } else {
                                    if (startStr || endStr) show = false;
                                }
                            }
                        }
                    });
                    row.style.display = show ? '' : 'none';
                });
            };

window.app.setAdminEMIBrandFilter = (brand) => {
                app.adminEMIBrandFilter = brand;
                app.renderAdminEMI();
            };

window.app.setAdminEMITerritoryFilter = (terrId) => {
                app.adminEMITerritoryFilter = terrId;
                app.renderAdminEMI();
            };

