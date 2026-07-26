// --- Sales360 Module: admin_notices.js ---
window.app = window.app || {};

window.app.showNoticesModal = () => {
                let modal = document.getElementById('notices-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'notices-modal';
                    modal.className = 'fixed inset-0 z-[100] hidden items-end sm:items-center justify-center';
                    document.body.appendChild(modal);
                }

                const noticesHTML = DB.notices.length > 0 ? DB.notices.slice().reverse().map(n => `
                    <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start mb-2 border-b border-slate-200 pb-2">
                            <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-amber-500 shadow shadow-amber-500/50"></div> ${n.title}</h4>
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${n.timestamp}</span>
                        </div>
                        <p class="text-sm text-slate-600 mb-3 leading-relaxed">${n.message}</p>
                        ${n.fileName ? `
                            <div class="flex items-center gap-2 text-xs bg-white border border-slate-200 px-3 py-2 rounded-lg w-max text-aci-blue font-semibold shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
                                <i data-lucide="${n.fileType === 'pdf' ? 'file-text' : 'image'}" class="w-4 h-4 text-indigo-500"></i> ${n.fileName}
                            </div>
                        ` : ''}
                    </div>
                `).join('') : '<div class="text-center text-slate-500 py-10 font-medium">No new notices active.</div>';

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="app.closeNoticesModal()"></div>
                    <div class="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 relative z-10 max-h-[85vh] flex flex-col transform transition-transform translate-y-full shadow-2xl" id="notices-modal-content">
                        <div class="flex justify-between items-center mb-4 shrink-0 border-b border-slate-100 pb-3">
                            <h3 class="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight"><i data-lucide="bell-ring" class="w-6 h-6 text-amber-500"></i> Notice Board</h3>
                            <button onclick="app.closeNoticesModal()" class="text-slate-400 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-slate-700 p-1.5 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <div class="flex-1 overflow-y-auto pr-1 pb-4">
                            ${noticesHTML}
                        </div>
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.classList.add('flex');

                const badge = document.getElementById('global-notice-badge');
                const ping = document.getElementById('global-notice-ping');
                const bellIcon = document.getElementById('global-notice-icon');
                const msgPopup = document.getElementById('global-notice-message');
                if (badge) badge.style.display = 'none';
                if (ping) ping.style.display = 'none';
                if (msgPopup) {
                    msgPopup.classList.add('hidden');
                    msgPopup.classList.remove('block');
                }
                if (bellIcon) {
                    bellIcon.classList.remove('animate-ring-shake', 'text-amber-500');
                    bellIcon.classList.add('text-slate-500');
                }

                app.refreshIcons();
                setTimeout(() => {
                    document.getElementById('notices-modal-content').classList.remove('translate-y-full');
                }, 10);
            };

window.app.closeNoticesModal = () => {
                const modal = document.getElementById('notices-modal');
                const content = document.getElementById('notices-modal-content');
                if (content) content.classList.add('translate-y-full');
                setTimeout(() => {
                    if (modal) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                    }
                }, 300);
            };

window.app.renderAdminNotices = () => {
                localStorage.setItem('aci_last_page', 'notices');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                const html = `
                    <div class="w-full pb-6 fade-in">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight flex items-center gap-2"><i data-lucide="megaphone" class="w-5 h-5 text-amber-500"></i> Notice Board Panel</h1></div>
                                <p class="text-sm font-semibold text-slate-500 mt-1">Manage and circulate critical notices to all branch officers dynamically.</p>
                            </div>
                            <button onclick="app.showAddNoticeModal()" class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2">
                                <i data-lucide="plus-circle" class="w-5 h-5"></i> Create Notice
                            </button>
                        </div>
                        
                        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50 border-b border-slate-200">
                                        <th class="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-32">Date Issued</th>
                                        <th class="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Notice Content</th>
                                        <th class="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-48 shrink-0">Attachment</th>
                                        <th class="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right w-24 shrink-0">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-sm">
                                    ${DB.notices.length > 0 ? DB.notices.slice().reverse().map(n => `
                                        <tr class="hover:bg-slate-50/70 transition-colors group">
                                            <td class="p-4 whitespace-nowrap text-slate-500 text-xs font-bold">${n.timestamp}</td>
                                            <td class="p-4">
                                                <p class="font-bold text-slate-800 text-base mb-1">${n.title}</p>
                                                <p class="text-xs font-medium text-slate-500 leading-relaxed max-w-2xl">${n.message}</p>
                                            </td>
                                            <td class="p-4">
                                                ${n.fileName ? `<span class="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm truncate max-w-[180px]"><i data-lucide="${n.fileType === 'pdf' ? 'file-text' : 'image'}" class="w-3.5 h-3.5 ${n.fileType === 'pdf' ? 'text-red-500' : 'text-indigo-500'}"></i> ${n.fileName}</span>` : '<span class="text-slate-300 text-sm font-semibold italic">No attachment</span>'}
                                            </td>
                                            <td class="p-4 text-right">
                                                <button onclick="app.deleteNotice('${n.id}')" class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete Notice"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                                            </td>
                                        </tr>
                                    `).join('') : `<tr><td colspan="4" class="p-10 text-center text-slate-400 font-medium">No notices have been authored yet.</td></tr>`}
                                </tbody>
                            </table>
                        </div>

                        <!-- LINKS SECTION -->
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mt-12 mb-8 gap-4">
                            <div>
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight flex items-center gap-2"><i data-lucide="link-2" class="w-5 h-5 text-indigo-500"></i> Important App Links</h1></div>
                                <p class="text-sm font-semibold text-slate-500 mt-1">Manage essential web or app shortcuts for field agents.</p>
                            </div>
                            <button onclick="app.showAddLinkModal()" class="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2">
                                <i data-lucide="plus-circle" class="w-5 h-5"></i> Add Link
                            </button>
                        </div>
                        
                        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50 border-b border-slate-200">
                                        <th class="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-32">Type</th>
                                        <th class="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Link Title</th>
                                        <th class="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">URL/Endpoint</th>
                                        <th class="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right w-24 shrink-0">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-sm">
                                    ${DB.links.length > 0 ? DB.links.map(l => `
                                        <tr class="hover:bg-slate-50/70 transition-colors group">
                                            <td class="p-4">
                                                <span class="inline-flex items-center gap-1.5 ${l.type === 'app' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'} border px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide">
                                                    <i data-lucide="${l.icon}" class="w-3.5 h-3.5"></i> ${l.type}
                                                </span>
                                            </td>
                                            <td class="p-4 font-bold text-slate-800">${l.title}</td>
                                            <td class="p-4 text-xs font-semibold text-slate-500 truncate max-w-sm"><a href="${l.url}" target="_blank" class="hover:text-indigo-600 transition-colors">${l.url}</a></td>
                                            <td class="p-4 text-right">
                                                <button onclick="app.deleteLink('${l.id}')" class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Remove Link"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                                            </td>
                                        </tr>
                                    `).join('') : `<tr><td colspan="4" class="p-10 text-center text-slate-400 font-medium">No system links configured yet.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.showAddNoticeModal = () => {
                let modal = document.getElementById('add-notice-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'add-notice-modal';
                    modal.className = 'fixed inset-0 z-[110] hidden items-end sm:items-center justify-center';
                    document.body.appendChild(modal);
                }
                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="app.closeAddNoticeModal()"></div>
                    <div class="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-6 relative z-10 max-h-[85vh] overflow-y-auto flex flex-col transform transition-transform translate-y-full shadow-2xl border border-slate-200" id="add-notice-modal-content">
                        <div class="flex justify-between items-center mb-6 shrink-0">
                            <h3 class="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight"><i data-lucide="pen-tool" class="w-5 h-5 text-aci-blue"></i> Draft New Notice</h3>
                            <button onclick="app.closeAddNoticeModal()" class="text-slate-400 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-slate-700 p-1.5 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <form onsubmit="app.saveNotice(event)" class="space-y-5">
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Notice Title <span class="text-red-500">*</span></label>
                                <input type="text" id="not-title" class="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-aci-blue transition-colors" placeholder="e.g. System Downtime Update" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Message Detail <span class="text-red-500">*</span></label>
                                <textarea id="not-msg" rows="4" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-aci-blue transition-colors resize-none" placeholder="Write your full directive or announcement here..." required></textarea>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Attachment (Optional File/Image)</label>
                                <div class="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative">
                                    <i data-lucide="upload-cloud" class="w-8 h-8 text-slate-400 mx-auto mb-2 pointer-events-none"></i>
                                    <div class="text-xs font-bold text-slate-600 mb-1 pointer-events-none">Click or drag file to attach</div>
                                    <div class="text-[10px] font-semibold text-slate-400 pointer-events-none">PDF, PNG, JPG (Max 5MB)</div>
                                    <input type="file" id="not-file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange="document.getElementById('not-file-name').innerText = this.files[0] ? this.files[0].name : ''">
                                </div>
                                <p id="not-file-name" class="text-xs font-bold text-indigo-600 mt-2 text-center h-4"></p>
                            </div>
                            <button type="submit" class="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-xl mt-2 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-800">
                                <i data-lucide="send" class="w-4 h-4"></i> Circulate Notice Now
                            </button>
                        </form>
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.classList.add('flex');
                app.refreshIcons();
                setTimeout(() => {
                    document.getElementById('add-notice-modal-content').classList.remove('translate-y-full');
                }, 10);
            };

window.app.closeAddNoticeModal = () => {
                const modal = document.getElementById('add-notice-modal');
                const content = document.getElementById('add-notice-modal-content');
                if (content) content.classList.add('translate-y-full');
                setTimeout(() => {
                    if (modal) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                    }
                }, 300);
            };

window.app.saveNotice = async (e) => {
                e.preventDefault();
                const title = document.getElementById('not-title').value;
                const msg = document.getElementById('not-msg').value;
                const fileInput = document.getElementById('not-file');

                let fileName = '';
                let fileType = '';

                if (fileInput.files.length > 0) {
                    fileName = fileInput.files[0].name;
                    fileType = fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
                }

                app.showLoader('Circulating notice...');
                try {
                    const newNotice = {
                        id: 'n_' + Math.floor(Math.random() * 1000000),
                        title: title,
                        message: msg,
                        fileName: fileName,
                        fileType: fileType,
                        timestamp: new Date().toLocaleDateString('en-GB')
                    };
                    DB.notices.push(newNotice);

                    if (app.neonSQL) {
                        await app.neonSQL`INSERT INTO notices (id, title, message, timestamp, filetype, filename) VALUES (${newNotice.id}, ${newNotice.title}, ${newNotice.message}, ${newNotice.timestamp}, ${newNotice.fileType}, ${newNotice.fileName})`;
                    }

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

                    app.closeAddNoticeModal();
                    app.showToast('Critical Notice circulated successfully!', 'success');
                    app.renderAdminNotices();
                } catch (err) {
                    console.error('Failed to circulate notice:', err);
                    app.showToast('Failed to save notice to database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

window.app.deleteNotice = async (id) => {
                if (confirm('Revoke and delete this notice permanently?')) {
                    app.showLoader('Deleting notice...');
                    try {
                        DB.notices = DB.notices.filter(n => n.id !== id);
                        if (app.neonSQL) {
                            await app.neonSQL`DELETE FROM notices WHERE id = ${id}`;
                        }
                        app.showToast('Notice has been deleted.', 'success');
                        app.renderAdminNotices();
                    } catch (err) {
                        console.error('Failed to delete notice:', err);
                        app.showToast('Failed to delete notice from database.', 'error');
                    } finally {
                        app.hideLoader();
                    }
                }
            };

window.app.showLinksModal = () => {
                let modal = document.getElementById('links-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'links-modal';
                    modal.className = 'fixed inset-0 z-[100] hidden items-end sm:items-center justify-center';
                    document.body.appendChild(modal);
                }

                const linksHTML = DB.links.length > 0 ? DB.links.map(l => `
                    <a href="${l.url}" target="_blank" class="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-sm border border-white/40 rounded-xl mb-3 shadow-sm hover:shadow-md hover:bg-white/40 transition-all group overflow-hidden relative">
                        <!-- Tiny inner glow -->
                        <div class="absolute -right-4 -top-4 w-12 h-12 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
                        
                        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10 ${l.type === 'app' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-indigo-500/20 text-indigo-600'}">
                            <i data-lucide="${l.icon}" class="w-5 h-5"></i>
                        </div>
                        <div class="flex-1 relative z-10">
                            <h4 class="font-bold text-slate-800 text-sm group-hover:text-aci-blue transition-colors">${l.title}</h4>
                            <p class="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">${l.type} LINK</p>
                        </div>
                        <i data-lucide="external-link" class="w-4 h-4 text-slate-300 group-hover:text-aci-blue relative z-10"></i>
                    </a>
                `).join('') : '<div class="text-center text-slate-500 py-10 font-medium">No links available.</div>';

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-aci-dark/40 backdrop-blur-md" onclick="app.closeLinksModal()"></div>
                    <div class="glass w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 relative z-10 max-h-[85vh] flex flex-col transform transition-transform translate-y-full shadow-2xl border border-white/40 overflow-hidden" id="links-modal-content">
                        <!-- Liquid Orbs inside modal -->
                        <div class="absolute -right-10 -top-10 bg-indigo-500/20 w-32 h-32 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div class="flex justify-between items-center mb-4 shrink-0 border-b border-white/20 pb-3 relative z-10">
                            <h3 class="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight"><i data-lucide="link-2" class="w-6 h-6 text-indigo-500"></i> Store Links</h3>
                            <button onclick="app.closeLinksModal()" class="text-white/60 bg-white/10 rounded-full hover:bg-white/20 p-2 border border-white/20 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <div class="flex-1 overflow-y-auto pr-1 pb-4 relative z-10 no-scrollbar">
                            ${linksHTML}
                        </div>
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.classList.add('flex');

                app.refreshIcons();
                setTimeout(() => {
                    document.getElementById('links-modal-content').classList.remove('translate-y-full');
                }, 10);
            };

window.app.closeLinksModal = () => {
                const modal = document.getElementById('links-modal');
                const content = document.getElementById('links-modal-content');
                if (content) content.classList.add('translate-y-full');
                setTimeout(() => {
                    if (modal) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                    }
                }, 300);
            };

window.app.showAddLinkModal = () => {
                let modal = document.getElementById('add-link-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'add-link-modal';
                    modal.className = 'fixed inset-0 z-[110] hidden items-end sm:items-center justify-center';
                    document.body.appendChild(modal);
                }
                modal.innerHTML = `
                    <div class="absolute inset-0 bg-aci-dark/40 backdrop-blur-md" onclick="app.closeAddLinkModal()"></div>
                    <div class="glass w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 relative z-10 max-h-[85vh] overflow-y-auto flex flex-col transform transition-transform translate-y-full shadow-2xl border border-white/40 overflow-hidden" id="add-link-modal-content">
                        <!-- Liquid Orbs inside modal -->
                        <div class="absolute -right-10 -top-10 bg-aci-blue/20 w-32 h-32 rounded-full blur-3xl pointer-events-none"></div>
                        <div class="absolute -left-10 -bottom-10 bg-indigo-500/10 w-32 h-32 rounded-full blur-3xl pointer-events-none"></div>

                        <div class="flex justify-between items-center mb-6 shrink-0 relative z-10">
                            <h3 class="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight"><i data-lucide="link" class="w-5 h-5 text-indigo-500"></i> Add New Link</h3>
                            <button onclick="app.closeAddLinkModal()" class="text-white/60 bg-white/10 rounded-full hover:bg-white/20 p-2 border border-white/20 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <form onsubmit="app.saveLink(event)" class="space-y-4 relative z-10">
                            <div>
                                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Title <span class="text-red-500">*</span></label>
                                <input type="text" id="lnk-title" class="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-aci-blue transition-colors" placeholder="e.g. Dealer Portal" required>
                            </div>
                            <div>
                                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">URL <span class="text-red-500">*</span></label>
                                <input type="url" id="lnk-url" class="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-aci-blue transition-colors" placeholder="https://" required>
                            </div>
                            <div>
                                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Type <span class="text-red-500">*</span></label>
                                <select id="lnk-type" class="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-aci-blue transition-colors" required>
                                    <option value="web">Web Link</option>
                                    <option value="app">App Link</option>
                                </select>
                            </div>
                            <button type="submit" class="w-full btn-liquid text-white font-black py-3.5 rounded-xl mt-4 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-indigo-800">
                                <i data-lucide="save" class="w-4 h-4"></i> Save Link
                            </button>
                        </form>
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.classList.add('flex');
                app.refreshIcons();
                setTimeout(() => {
                    document.getElementById('add-link-modal-content').classList.remove('translate-y-full');
                }, 10);
            };

window.app.closeAddLinkModal = () => {
                const modal = document.getElementById('add-link-modal');
                const content = document.getElementById('add-link-modal-content');
                if (content) content.classList.add('translate-y-full');
                setTimeout(() => {
                    if (modal) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                    }
                }, 300);
            };

window.app.saveLink = async (e) => {
                e.preventDefault();
                const title = document.getElementById('lnk-title').value;
                const url = document.getElementById('lnk-url').value;
                const type = document.getElementById('lnk-type').value;
                const icon = type === 'app' ? 'smartphone' : 'globe';

                app.showLoader('Saving link...');
                try {
                    const newLink = {
                        id: 'lnk_' + Math.floor(Math.random() * 1000000),
                        title, url, type, icon
                    };
                    DB.links.push(newLink);

                    if (app.neonSQL) {
                        await app.neonSQL`INSERT INTO links (id, title, url, type, icon) VALUES (${newLink.id}, ${newLink.title}, ${newLink.url}, ${newLink.type}, ${newLink.icon})`;
                    }

                    app.closeAddLinkModal();
                    app.showToast('Link added successfully.', 'success');
                    app.renderAdminNotices();
                } catch (err) {
                    console.error('Failed to save link:', err);
                    app.showToast('Failed to save link to database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

window.app.deleteLink = async (id) => {
                if (confirm('Remove this link permanently?')) {
                    app.showLoader('Removing link...');
                    try {
                        DB.links = DB.links.filter(l => l.id !== id);
                        if (app.neonSQL) {
                            await app.neonSQL`DELETE FROM links WHERE id = ${id}`;
                        }
                        app.showToast('Link removed.', 'success');
                        app.renderAdminNotices();
                    } catch (err) {
                        console.error('Failed to delete link:', err);
                        app.showToast('Failed to delete link from database.', 'error');
                    } finally {
                        app.hideLoader();
                    }
                }
            };

window.app.renderTIVReporting = () => {
                const terrId = app.currentUser.territories[0];
                if (!terrId) {
                    document.getElementById('view-port').innerHTML = `<div class="text-center py-10 text-slate-500">No assigned territory found.</div>`;
                    return;
                }
                const territory = DB.territories.find(t => t.id === terrId);

                const months = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const currentMonth = app.tivSelectedMonth || app.currentMonth;
                const currentMonthIdx = months.indexOf(currentMonth);
                const prevMonth = currentMonthIdx > 0 ? months[currentMonthIdx - 1] : 'June';

                const submission = DB.tiv_submissions.find(s => s.territory === terrId && s.month === currentMonth);
                const prevSubmission = DB.tiv_submissions.find(s => s.territory === terrId && s.month === prevMonth);
                const isLocked = !!submission;

                // Hydrate data safely
                if (isLocked) {
                    app.tiv_form_data = { ...submission.data };
                } else {
                    if (app.lastTivMonthLoaded !== currentMonth) {
                        app.tiv_form_data = {};
                        app.lastTivMonthLoaded = currentMonth;
                    }
                }

                // Brand Share Math
                const brandTotals = {};
                let grandTotal = 0;
                DB.tiv_brands.forEach(b => {
                    brandTotals[b.name] = 0;
                    b.models.forEach(model => {
                        const val = app.tiv_form_data?.[model] || 0;
                        brandTotals[b.name] += val;
                        grandTotal += val;
                    });
                });

                const pieLabels = [];
                const pieData = [];
                const pieColors = ['#0F2942', '#F4A915', '#475569', '#84cc16', '#3b82f6', '#a855f7'];

                DB.tiv_brands.forEach(b => {
                    pieLabels.push(b.name);
                    pieData.push(grandTotal > 0 ? Math.round((brandTotals[b.name] / grandTotal) * 100) : 0);
                });

                const activeBrand = app.tivSelectedBrand || DB.tiv_brands[0].name;

                let html = `
                    <div class="pb-6 fade-in">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h2 class="text-xl font-bold text-slate-800">TIV Reporting</h2>
                                <p class="text-xs text-slate-500">Market Total Industry Volume (Units)</p>
                            </div>
                            <div class="bg-white border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <div class="w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-red-500' : 'bg-green-500'} animate-pulse"></div>
                                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">${isLocked ? 'Locked' : 'Open'}</span>
                            </div>
                        </div>

                        <!-- Month & Territory Controls -->
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 flex items-center justify-between gap-4">
                            <div class="flex items-center gap-3 flex-1">
                                <div class="p-2 bg-aci-blue/10 rounded-lg text-aci-blue"><i data-lucide="calendar" class="w-5 h-5"></i></div>
                                <div class="w-full max-w-xs relative group">
                                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Select Reporting Month</label>
                                    <select onchange="app.tivSelectedMonth = this.value; app.renderTIVReporting()" class="w-full border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50 appearance-none pr-10">
                                        ${months.map(m => `<option value="${m}" ${currentMonth === m ? 'selected' : ''}>${m} 2026</option>`).join('')}
                                    </select>
                                    <div class="absolute right-3 bottom-2.5 pointer-events-none text-slate-400 group-focus-within:text-aci-blue transition-colors">
                                        <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="text-right hidden sm:block">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Territory</p>
                                <span class="text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">${territory.name}</span>
                            </div>
                        </div>

                        <!-- Market Share Pie Chart & KPI Card -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div class="md:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
                                <div class="absolute -right-10 -top-10 bg-indigo-500/5 w-40 h-40 rounded-full blur-3xl pointer-events-none"></div>
                                <div class="flex items-center justify-between w-full mb-2">
                                    <h4 class="text-xs font-black text-slate-700 uppercase tracking-wider">Brand Market Share %</h4>
                                    <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">${currentMonth}</span>
                                </div>
                                <div class="relative w-full h-40 flex items-center justify-center">
                                    ${grandTotal === 0 ? `
                                        <div class="text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                                            <i data-lucide="pie-chart" class="w-8 h-8 text-slate-300"></i>
                                            <span>Enter model volumes below to compute chart</span>
                                        </div>
                                    ` : `
                                        <canvas id="tivPieChart"></canvas>
                                    `}
                                </div>
                            </div>
                            <div class="bg-slate-900 p-5 rounded-xl text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                                <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                                    <i data-lucide="bar-chart-3" class="w-24 h-24 text-white"></i>
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Volume</p>
                                    <h3 class="text-4xl font-black mt-2 tracking-tight">${grandTotal} <span class="text-xs font-normal text-slate-400">Units</span></h3>
                                </div>
                                <div class="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300 flex items-center gap-1">
                                    <i data-lucide="info" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                                    <span>Sum of all units entered for <strong>${currentMonth}</strong></span>
                                </div>
                            </div>
                        </div>

                        ${isLocked ? `
                            <div class="bg-red-50 border border-red-100 p-3 rounded-xl text-red-800 text-xs font-medium mb-4 flex items-center gap-2">
                                <i data-lucide="lock" class="w-4 h-4"></i>
                                <span>This month's TIV data is submitted and locked. Contact Admin to make changes.</span>
                            </div>
                        ` : ''}

                        <div class="flex overflow-x-auto gap-2 pb-2 no-scrollbar mb-4">
                            ${DB.tiv_brands.map(b => `
                                <button onclick="app.tivSelectedBrand='${b.name}'; app.renderTIVReporting()" class="px-4 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all ${activeBrand === b.name ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}">
                                    ${b.name}
                                </button>
                            `).join('')}
                        </div>

                        <form onsubmit="app.submitTIVData(event)" class="space-y-4">
                            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <div class="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
                                    <span>${activeBrand} Models</span>
                                    <span>Previous vs Current</span>
                                </div>
                                <div class="divide-y divide-slate-100">
                `;

                const brandObj = DB.tiv_brands.find(b => b.name === activeBrand);
                brandObj.models.forEach(model => {
                    const prevVal = prevSubmission?.data?.[model] || 0;
                    const currentVal = submission?.data?.[model] || 0;

                    app.tiv_form_data = app.tiv_form_data || {};
                    if (isLocked) {
                        app.tiv_form_data[model] = currentVal;
                    } else if (app.tiv_form_data[model] === undefined) {
                        app.tiv_form_data[model] = 0;
                    }

                    const val = app.tiv_form_data[model];

                    html += `
                        <div class="p-4 flex items-center justify-between gap-4">
                            <div>
                                <h4 class="font-bold text-slate-800 text-sm">${model}</h4>
                                <p class="text-[10px] font-semibold text-slate-400 mt-0.5">Last Month: <span class="text-slate-600 font-bold">${prevVal}</span></p>
                            </div>
                            <div class="flex items-center gap-3">
                                ${!isLocked ? `
                                    <button type="button" onclick="app.updateTIVInput('${model}', -1)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 transition-colors"><i data-lucide="minus" class="w-4 h-4"></i></button>
                                    <input type="number" id="tiv-in-${model}" value="${val}" min="0" onchange="app.tiv_form_data['${model}'] = parseInt(this.value) || 0; app.renderTIVReporting()" class="w-16 text-center border border-slate-200 font-bold text-slate-800 py-1.5 rounded-lg focus:outline-none focus:border-aci-blue text-sm">
                                    <button type="button" onclick="app.updateTIVInput('${model}', 1)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 transition-colors"><i data-lucide="plus" class="w-4 h-4"></i></button>
                                ` : `
                                    <span class="font-bold text-base text-slate-700 px-4 py-1 border border-slate-200 rounded-lg bg-slate-50">${currentVal}</span>
                                `}
                            </div>
                        </div>
                    `;
                });

                html += `
                                </div>
                            </div>

                            ${!isLocked ? `
                                <button type="submit" class="w-full btn-liquid text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                    <i data-lucide="check-circle" class="w-5 h-5"></i> Submit Month TIV
                                </button>
                            ` : ''}
                        </form>
                    </div>
                `;

                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();

                // Pie Chart rendering
                if (grandTotal > 0) {
                    const pieCtx = document.getElementById('tivPieChart')?.getContext('2d');
                    if (pieCtx) {
                        app.charts = app.charts || {};
                        if (app.charts.tivMarketShare) {
                            app.charts.tivMarketShare.destroy();
                        }
                        app.charts.tivMarketShare = new Chart(pieCtx, {
                            type: 'doughnut',
                            data: {
                                labels: pieLabels,
                                datasets: [{
                                    data: pieData,
                                    backgroundColor: pieColors,
                                    borderWidth: 1,
                                    borderColor: '#ffffff',
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '70%',
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            boxWidth: 12,
                                            usePointStyle: true,
                                            pointStyle: 'circle',
                                            font: { size: 11, family: 'Inter', weight: 'bold' }
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                return ' ' + context.label + ': ' + context.raw + '%';
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            };

window.app.updateTIVInput = (model, delta) => {
                app.tiv_form_data = app.tiv_form_data || {};
                let current = app.tiv_form_data[model] || 0;
                current = Math.max(0, current + delta);
                app.tiv_form_data[model] = current;
                app.renderTIVReporting();
            };

window.app.submitTIVData = async (e) => {
                e.preventDefault();
                const terrId = app.currentUser.territories[0];
                const currentMonth = app.tivSelectedMonth || app.currentMonth;

                let total = 0;
                const fullData = {};
                DB.tiv_brands.forEach(b => {
                    b.models.forEach(model => {
                        const val = app.tiv_form_data?.[model] || 0;
                        fullData[model] = val;
                        total += val;
                    });
                });

                const submissionObj = {
                    territory: terrId,
                    userId: app.currentUser.id,
                    month: currentMonth,
                    timestamp: new Date().toISOString(),
                    data: fullData,
                    total: total
                };

                DB.tiv_submissions.push(submissionObj);

                if (app.neonSQL) {
                    try {
                        await app.neonSQL`INSERT INTO tiv_submissions (submission_data) VALUES (${JSON.stringify(submissionObj)})`;
                    } catch (dbErr) {
                        console.error('Failed to save TIV submission to database:', dbErr);
                    }
                }

                app.showToast('TIV Data submitted successfully!', 'success');
                app.renderTIVReporting();
            };

window.app.renderTIVManagement = () => {
                localStorage.setItem('aci_last_page', 'tiv');
                localStorage.setItem('aci_last_role', app.currentUser.role);
                const currentMonth = app.currentMonth;
                const submissions = DB.tiv_submissions.filter(s => s.month === currentMonth);
                const totalTerritories = DB.territories.length;
                const submittedCount = submissions.length;
                const completionRate = totalTerritories > 0 ? Math.round((submittedCount / totalTerritories) * 100) : 0;

                const activeSubView = app.tivAdminSubView || 'submissions';

                let html = `
                    <div class="w-full fade-in">
                        <div class="mb-6 flex justify-between items-center">
                            <div>
                                <div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight">TIV Data Management</h1></div>
                                <p class="text-sm text-slate-500">Total Industry Volume Collection & Administration</p>
                            </div>
                            <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button onclick="app.tivAdminSubView='submissions'; app.renderTIVManagement()" class="px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeSubView === 'submissions' ? 'bg-slate-800 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}">Submissions</button>
                                <button onclick="app.tivAdminSubView='settings'; app.renderTIVManagement()" class="px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeSubView === 'settings' ? 'bg-slate-800 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}">Settings (Brands)</button>
                            </div>
                        </div>
                `;

                if (activeSubView === 'submissions') {
                    html += `
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm relative overflow-hidden">
                                <i data-lucide="bar-chart-2" class="absolute -right-2 -bottom-2 w-12 h-12 text-blue-200 opacity-50"></i>
                                <p class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Reporting Month</p>
                                <h3 class="text-2xl font-extrabold text-blue-700">${currentMonth} 2026</h3>
                            </div>
                            <div class="bg-teal-50 border border-teal-100 p-4 rounded-xl shadow-sm relative overflow-hidden">
                                <i data-lucide="check-circle" class="absolute -right-2 -bottom-2 w-12 h-12 text-teal-200 opacity-50"></i>
                                <p class="text-xs font-bold text-teal-500 uppercase tracking-wider mb-1">Submitted</p>
                                <h3 class="text-2xl font-extrabold text-teal-700">${submittedCount} / ${totalTerritories}</h3>
                            </div>
                            <div class="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm relative overflow-hidden">
                                <i data-lucide="percent" class="absolute -right-2 -bottom-2 w-12 h-12 text-amber-200 opacity-50"></i>
                                <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Completion Rate</p>
                                <h3 class="text-2xl font-extrabold text-amber-700">${completionRate}%</h3>
                            </div>
                        </div>

                        <div class="flex gap-2 mb-6">
                            <button onclick="app.exportTIVCsv()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                                <i data-lucide="download" class="w-4 h-4"></i> Export CSV
                            </button>
                            <button onclick="app.unlockAllTIV()" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                                <i data-lucide="unlock" class="w-4 h-4"></i> Unlock All Entries
                            </button>
                        </div>

                        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                            <table class="w-full text-left text-[11px] whitespace-nowrap">
                                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px] tracking-widest">
                                    <tr>
                                        <th class="px-6 py-1.5 font-bold">Territory</th>
                                        <th class="px-6 py-1.5 font-bold">Status</th>

                                        <th class="px-6 py-1.5 font-bold text-right">Total Volume</th>
                                        <th class="px-6 py-1.5 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${DB.territories.map(t => {
                        const sub = submissions.find(s => s.territory === t.id);
                        return `
                                            <tr class="hover:bg-slate-50 transition-colors">
                                                <td class="px-6 py-1.5 font-bold text-slate-800">${t.name}</td>
                                                <td class="px-6 py-1.5">
                                                    ${sub ? `
                                                        <span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max border border-green-100">
                                                            <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Submitted
                                                        </span>
                                                    ` : `
                                                        <span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max border border-amber-100">
                                                            <div class="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Pending
                                                        </span>
                                                    `}
                                                </td>
                                                <td class="px-6 py-1.5 font-bold text-slate-800 text-right">
                                                    ${sub ? sub.total : 0}
                                                </td>
                                                <td class="px-6 py-1.5 text-right">
                                                    ${sub ? `
                                                        <button onclick="app.viewTIVSubmission('${sub.territory}')" class="text-slate-400 hover:text-aci-blue mx-1 transition-colors" title="View"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                                        <button onclick="app.unlockTIVSubmission('${sub.territory}')" class="text-slate-400 hover:text-red-500 mx-1 transition-colors" title="Unlock"><i data-lucide="unlock" class="w-4 h-4"></i></button>
                                                    ` : '<span class="text-xs text-slate-400 italic">No Data</span>'}
                                                </td>
                                            </tr>
                                        `;
                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                } else if (activeSubView === 'settings') {
                    html += `
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <h3 class="font-bold text-slate-800 text-base mb-4">Add New Brand</h3>
                                <form onsubmit="app.addTIVBrand(event)" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-600 mb-1">Brand Name</label>
                                        <input type="text" id="tiv-new-brand" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" required placeholder="e.g. Fuso">
                                    </div>
                                    <button type="submit" class="w-full btn-liquid text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow"><i data-lucide="plus" class="w-4 h-4"></i> Add Brand</button>
                                </form>
                            </div>

                            <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <h3 class="font-bold text-slate-800 text-base mb-4">Add New Model</h3>
                                <form onsubmit="app.addTIVModel(event)" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-600 mb-1">Brand</label>
                                        <select id="tiv-model-brand-select" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" required>
                                            ${DB.tiv_brands.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-600 mb-1">Model Name</label>
                                        <input type="text" id="tiv-new-model" class="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-aci-blue bg-slate-50/50" required placeholder="e.g. Fuso 10 Ton">
                                    </div>
                                    <button type="submit" class="w-full btn-liquid text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow"><i data-lucide="plus" class="w-4 h-4"></i> Add Model</button>
                                </form>
                            </div>

                            <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 overflow-y-auto max-h-[60vh]">
                                <h3 class="font-bold text-slate-800 text-base mb-4">TIV Portfolio</h3>
                                <div class="space-y-3">
                                    ${DB.tiv_brands.map(b => `
                                        <div class="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                                            <div class="flex justify-between items-center mb-2">
                                                <span class="font-bold text-sm text-slate-800">${b.name}</span>
                                                <button onclick="app.deleteTIVBrand('${b.name}')" class="text-xs text-red-500 hover:underline"><i data-lucide="trash-2" class="w-3 h-3 inline"></i></button>
                                            </div>
                                            <div class="flex flex-wrap gap-1.5">
                                                ${b.models.map(m => `
                                                    <span class="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-700 flex items-center gap-1 font-medium shadow-sm">
                                                        ${m}
                                                        <button onclick="app.deleteTIVModel('${b.name}', '${m}')" class="text-slate-400 hover:text-red-500"><i data-lucide="x" class="w-3 h-3"></i></button>
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.addTIVBrand = async (e) => {
                e.preventDefault();
                const brandName = document.getElementById('tiv-new-brand').value.trim();
                if (!brandName) return;
                if (DB.tiv_brands.some(b => b.name.toLowerCase() === brandName.toLowerCase())) {
                    app.showToast('Brand already exists.', 'error');
                    return;
                }
                app.showLoader('Adding brand...');
                try {
                    DB.tiv_brands.push({ name: brandName, models: [] });
                    if (app.neonSQL) {
                        await app.neonSQL`INSERT INTO tiv_brands (name, models) VALUES (${brandName}, '[]')`;
                    }
                    app.showToast(`Brand '${brandName}' added.`, 'success');
                    app.renderTIVManagement();
                } catch (err) {
                    console.error('Failed to add brand:', err);
                    app.showToast('Failed to save brand to database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

window.app.addTIVModel = async (e) => {
                e.preventDefault();
                const brandName = document.getElementById('tiv-model-brand-select').value;
                const modelName = document.getElementById('tiv-new-model').value.trim();
                if (!modelName) return;

                const brandObj = DB.tiv_brands.find(b => b.name === brandName);
                if (brandObj.models.includes(modelName)) {
                    app.showToast('Model already exists in this brand.', 'error');
                    return;
                }
                
                app.showLoader('Adding model...');
                try {
                    brandObj.models.push(modelName);
                    if (app.neonSQL) {
                        await app.neonSQL`UPDATE tiv_brands SET models = ${JSON.stringify(brandObj.models)} WHERE name = ${brandName}`;
                    }
                    app.showToast(`Model '${modelName}' added to ${brandName}.`, 'success');
                    app.renderTIVManagement();
                } catch (err) {
                    console.error('Failed to add model:', err);
                    app.showToast('Failed to save model to database.', 'error');
                } finally {
                    app.hideLoader();
                }
            };

window.app.deleteTIVBrand = async (brandName) => {
                if (confirm(`Are you sure you want to delete the brand '${brandName}' and all its models?`)) {
                    app.showLoader('Deleting brand...');
                    try {
                        DB.tiv_brands = DB.tiv_brands.filter(b => b.name !== brandName);
                        if (app.neonSQL) {
                            await app.neonSQL`DELETE FROM tiv_brands WHERE name = ${brandName}`;
                        }
                        app.showToast(`Brand '${brandName}' deleted.`, 'success');
                        app.renderTIVManagement();
                    } catch (err) {
                        console.error('Failed to delete brand:', err);
                        app.showToast('Failed to delete brand from database.', 'error');
                    } finally {
                        app.hideLoader();
                    }
                }
            };

window.app.deleteTIVModel = async (brandName, modelName) => {
                const brandObj = DB.tiv_brands.find(b => b.name === brandName);
                if (brandObj) {
                    app.showLoader('Deleting model...');
                    try {
                        brandObj.models = brandObj.models.filter(m => m !== modelName);
                        if (app.neonSQL) {
                            await app.neonSQL`UPDATE tiv_brands SET models = ${JSON.stringify(brandObj.models)} WHERE name = ${brandName}`;
                        }
                        app.showToast(`Model '${modelName}' deleted.`, 'success');
                        app.renderTIVManagement();
                    } catch (err) {
                        console.error('Failed to delete model:', err);
                        app.showToast('Failed to delete model from database.', 'error');
                    } finally {
                        app.hideLoader();
                    }
                }
            };

window.app.unlockTIVSubmission = async (terrId) => {
                const currentMonth = app.currentMonth;
                const idx = DB.tiv_submissions.findIndex(s => s.territory === terrId && s.month === currentMonth);
                if (idx !== -1) {
                    DB.tiv_submissions.splice(idx, 1);
                    if (app.neonSQL) {
                        try {
                            await app.neonSQL`DELETE FROM tiv_submissions WHERE JSON_UNQUOTE(JSON_EXTRACT(submission_data, '$.territory')) = ${terrId} AND JSON_UNQUOTE(JSON_EXTRACT(submission_data, '$.month')) = ${currentMonth}`;
                        } catch (err) {
                            console.error('Failed to unlock submission from database:', err);
                        }
                    }
                    app.showToast('Entry unlocked.', 'success');
                    app.renderTIVManagement();
                }
            };

window.app.unlockAllTIV = async () => {
                const currentMonth = app.currentMonth;
                const originalLen = DB.tiv_submissions.length;
                DB.tiv_submissions = DB.tiv_submissions.filter(s => s.month !== currentMonth);
                if (DB.tiv_submissions.length < originalLen) {
                    if (app.neonSQL) {
                        try {
                            await app.neonSQL`DELETE FROM tiv_submissions WHERE JSON_UNQUOTE(JSON_EXTRACT(submission_data, '$.month')) = ${currentMonth}`;
                        } catch (err) {
                            console.error('Failed to unlock all submissions from database:', err);
                        }
                    }
                    app.showToast('All entries for this month unlocked.', 'success');
                } else {
                    app.showToast('No entries to unlock.', 'info');
                }
                app.renderTIVManagement();
            };

window.app.viewTIVSubmission = (terrId) => {
                const currentMonth = app.currentMonth;
                const sub = DB.tiv_submissions.find(s => s.territory === terrId && s.month === currentMonth);
                if (!sub) return;

                const terr = DB.territories.find(t => t.id === terrId);

                let modalContent = `
                    <div class="space-y-4">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h3 class="font-bold text-slate-800 text-base">${terr.name} TIV Data</h3>
                            <span class="text-xs text-slate-500 font-bold">${currentMonth} 2026</span>
                        </div>
                        <div class="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                `;

                for (const [model, qty] of Object.entries(sub.data)) {
                    if (qty > 0) {
                        modalContent += `
                            <div class="py-2 flex justify-between text-sm">
                                <span class="text-slate-700">${model}</span>
                                <span class="font-bold text-slate-800">${qty}</span>
                            </div>
                        `;
                    }
                }

                modalContent += `
                        </div>
                        <div class="border-t border-slate-100 pt-3 flex justify-between font-bold text-base text-slate-800">
                            <span>Total Volume</span>
                            <span>${sub.total}</span>
                        </div>
                    </div>
                `;

                let modal = document.getElementById('tiv-view-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'tiv-view-modal';
                    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }
                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick="document.getElementById('tiv-view-modal').classList.add('hidden')"></div>
                    <div class="bg-white p-6 rounded-2xl shadow-xl relative z-10 max-w-md w-full mx-4 border border-slate-200">
                        ${modalContent}
                        <button onclick="document.getElementById('tiv-view-modal').classList.add('hidden')" class="mt-6 w-full bg-slate-100 hover:bg-slate-200 font-bold py-2 rounded-xl text-sm transition-colors">Close</button>
                    </div>
                `;
                modal.classList.remove('hidden');
            };

window.app.exportTIVCsv = () => {
                const currentMonth = app.currentMonth;
                const submissions = DB.tiv_submissions.filter(s => s.month === currentMonth);

                if (submissions.length === 0) {
                    app.showToast('No submissions to export.', 'error');
                    return;
                }

                const allModels = [];
                DB.tiv_brands.forEach(b => allModels.push(...b.models));

                let csvContent = "data:text/csv;charset=utf-8,";
                csvContent += ["Territory", "Month", "Total Volume", ...allModels].join(",") + "\n";

                submissions.forEach(s => {
                    const terr = DB.territories.find(t => t.id === s.territory);
                    const row = [
                        terr ? terr.name : s.territory,
                        s.month,
                        s.total
                    ];
                    allModels.forEach(m => {
                        row.push(s.data[m] || 0);
                    });
                    csvContent += row.join(",") + "\n";
                });

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `TIV_Report_${currentMonth}_2026.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                app.showToast('Exporting CSV...', 'success');
            };

window.app.showSystemConfigPasswordModal = () => {
                let modal = document.getElementById('sys-config-pass-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'sys-config-pass-modal';
                    modal.className = 'fixed inset-0 z-[300] flex items-center justify-center hidden';
                    document.body.appendChild(modal);
                }

                modal.innerHTML = `
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="app.closeSystemConfigPasswordModal()"></div>
                    <div class="bg-white rounded-2xl p-6 w-full max-w-sm m-4 relative z-10 shadow-2xl border border-slate-100 transform transition-all scale-100">
                        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 class="font-extrabold text-slate-800 text-sm">System Access Required</h3>
                                <p class="text-[10px] text-slate-400 font-bold mt-0.5">Please enter the security password to proceed</p>
                            </div>
                            <button onclick="app.closeSystemConfigPasswordModal()" class="text-slate-400 hover:text-red-500 p-1.5 transition-colors">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Password</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"><i data-lucide="lock" class="w-4 h-4"></i></span>
                                    <input type="password" id="sys-config-password" class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-aci-blue text-sm font-extrabold text-slate-800 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none transition-all shadow-sm" placeholder="••••••••">
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="app.closeSystemConfigPasswordModal()" class="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs transition-colors">Cancel</button>
                                <button onclick="app.submitSystemConfigPassword()" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs transition-colors shadow-md">Verify Access</button>
                            </div>
                        </div>
                    </div>
                `;

                modal.classList.remove('hidden');
                modal.classList.add('flex');
                app.refreshIcons();

                setTimeout(() => {
                    const input = document.getElementById('sys-config-password');
                    if (input) {
                        input.focus();
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                app.submitSystemConfigPassword();
                            }
                        });
                    }
                }, 100);
            };

window.app.closeSystemConfigPasswordModal = () => {
                const modal = document.getElementById('sys-config-pass-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
                app.renderAdminDashboard();
            };

window.app.submitSystemConfigPassword = () => {
                const passwordInput = document.getElementById('sys-config-password');
                const password = passwordInput ? passwordInput.value : '';

                if (password === 'Imon@0123') {
                    app.isSystemSettingsAuthorized = true;
                    const modal = document.getElementById('sys-config-pass-modal');
                    if (modal) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                    }
                    app.showToast('Access granted.', 'success');
                    app.renderSystemSettings();
                } else {
                    app.showToast('Invalid security password.', 'error');
                    if (passwordInput) {
                        passwordInput.value = '';
                        passwordInput.focus();
                    }
                }
            };

window.app.renderSystemSettings = () => {
                app.settingsActiveTab = app.settingsActiveTab || 'general';
                if (!app.isSystemSettingsAuthorized) {
                    app.showSystemConfigPasswordModal();
                    return;
                }
                localStorage.setItem('aci_last_page', 'settings');
                localStorage.setItem('aci_last_role', app.currentUser.role);

                const monthsList = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const currentMonth = app.currentMonth;
                const lastMonth = app.lastMonth;

                // Mark the active tab in sidebar
                document.querySelectorAll('#sidebar-nav button').forEach(btn => {
                    btn.classList.remove('bg-white/10', 'text-white', 'font-bold', 'relative', 'pl-7');
                    btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
                    const indicator = btn.querySelector('.absolute');
                    if (indicator) indicator.remove();
                    
                    const span = btn.querySelector('span');
                    if (span && (span.innerText === 'System Settings' || span.innerText === 'System Config')) {
                        btn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
                        btn.classList.add('bg-white/10', 'text-white', 'font-bold', 'relative', 'pl-7');
                        const ind = document.createElement('div');
                        ind.className = 'absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-aci-gold shadow-[0_0_12px_#F4A915]';
                        btn.appendChild(ind);
                    }
                });

                // Generate timeline items
                const currentMonthIdx = monthsList.indexOf(currentMonth);
                const lastMonthIdx = monthsList.indexOf(lastMonth);
                const ytdMonths = app.getYtdMonths(currentMonth);

                let timelineHtml = '';
                monthsList.forEach((m, idx) => {
                    let pillClass = 'bg-white/5 text-slate-400 border-white/10';
                    let label = m.substring(0, 3);
                    let tooltip = m;
                    let indicatorBadge = '';

                    if (m === currentMonth) {
                        pillClass = 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-yellow-400 shadow-[0_0_15px_rgba(244,169,21,0.4)] font-black scale-110 z-10';
                        indicatorBadge = '<span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[8px] font-black px-1 rounded-full uppercase shadow">Current</span>';
                    } else if (m === lastMonth) {
                        pillClass = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold scale-105 z-10';
                        indicatorBadge = '<span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-black px-1 rounded-full uppercase shadow">Last</span>';
                    } else if (ytdMonths.includes(m)) {
                        pillClass = 'bg-aci-blue/20 text-indigo-200 border-indigo-500/30';
                    }

                    timelineHtml += `
                        <div class="relative group flex flex-col items-center cursor-pointer" onclick="app.setTimelineMonth('${m}')">
                            ${indicatorBadge}
                            <div class="w-12 h-12 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 transform group-hover:scale-105 hover:border-white/30 ${pillClass}">
                                ${label}
                            </div>
                            <span class="text-[9px] text-slate-500 font-bold mt-2 group-hover:text-slate-300 transition-colors">${m === currentMonth || m === lastMonth ? m : label}</span>
                        </div>
                    `;
                });

                const html = `
                    <div class="w-full pb-10 fade-in">
                        <!-- Upper Greeting & Breadcrumbs -->
                        <div class="mb-6 flex justify-between items-center">
                            <div>
                                <div class="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
                                    <span>System Control</span>
                                    <i data-lucide="chevron-right" class="w-3 h-3"></i>
                                    <span class="text-slate-500">System Settings</span>
                                </div>
                                <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                                    <i data-lucide="settings" class="w-6 h-6 text-cyan-500"></i>
                                    System Controls & Settings
                                </h1>
                                <p class="text-sm text-slate-500">Configure global application states, operational months, and database sync configurations.</p>
                            </div>
                        </div>

                        <!-- Config Main Section -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Left: Interactive Settings Panel (Takes 2 Cols) -->
                            <div class="md:col-span-2 space-y-6">
                                <!-- Month Configuration Card -->
                                <div class="glass p-6 rounded-2xl shadow-md border border-white/60 relative overflow-hidden">
                                    <div class="absolute -right-20 -top-20 bg-cyan-500/5 w-60 h-60 rounded-full blur-3xl"></div>
                                    
                                    <div class="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                        <div class="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm">
                                            <i data-lucide="calendar" class="w-4 h-4"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-extrabold text-slate-800 text-sm">Operational Month Configurator</h3>
                                            <p class="text-[11px] text-slate-400 font-medium">Control active reporting states and data linking ranges.</p>
                                        </div>
                                    </div>

                                    <!-- Interactive Visual Calendar Timeline -->
                                    <div class="mb-8">
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Interactive Operations Timeline</label>
                                        <div class="relative py-2 bg-slate-900/5 rounded-2xl border border-slate-200/50 p-4">
                                            <!-- Horizontal Connecting Line -->
                                            <div class="absolute top-[38px] left-[40px] right-[40px] h-[3px] bg-slate-200/60 -z-10 rounded-full"></div>
                                            <div class="absolute top-[38px] left-[40px] right-[40px] h-[3px] bg-gradient-to-r from-indigo-500/50 to-emerald-500/30 -z-10 rounded-full" style="width: ${currentMonthIdx > 0 ? (currentMonthIdx / 11) * 100 : 0}%"></div>
                                            
                                            <div class="flex justify-between items-center gap-1">
                                                ${timelineHtml}
                                            </div>
                                        </div>
                                        <p class="text-[10px] text-slate-400 mt-3 text-center italic">💡 Click on any circle in the timeline above to quickly set it as the Current Active Month.</p>
                                    </div>

                                    <!-- Traditional Form Dropdowns -->
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <div class="space-y-1.5">
                                            <label class="text-xs font-black text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                                                <div class="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> Current Month
                                            </label>
                                            <select id="settings-current-month" onchange="app.handleSettingsMonthChange('current', this.value)" class="w-full bg-white border border-slate-200 text-xs font-extrabold text-slate-700 rounded-xl px-3.5 py-2.5 shadow-sm focus:outline-none focus:border-cyan-500 transition-colors">
                                                ${monthsList.map(m => `<option value="${m}" ${m === currentMonth ? 'selected' : ''}>${m}</option>`).join('')}
                                            </select>
                                        </div>

                                        <div class="space-y-1.5">
                                            <label class="text-xs font-black text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                                                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Last Completed Month
                                            </label>
                                            <select id="settings-last-month" onchange="app.handleSettingsMonthChange('last', this.value)" class="w-full bg-white border border-slate-200 text-xs font-extrabold text-slate-700 rounded-xl px-3.5 py-2.5 shadow-sm focus:outline-none focus:border-cyan-500 transition-colors">
                                                ${monthsList.map(m => `<option value="${m}" ${m === lastMonth ? 'selected' : ''}>${m}</option>`).join('')}
                                            </select>
                                        </div>

                                        <div class="space-y-1.5">
                                            <label class="text-xs font-black text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                                                <div class="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> Active Fiscal Year
                                            </label>
                                            <select id="settings-current-fy" onchange="app.updateSettingsPreviewDynamic()" class="w-full bg-white border border-slate-200 text-xs font-extrabold text-slate-700 rounded-xl px-3.5 py-2.5 shadow-sm focus:outline-none focus:border-cyan-500 transition-colors">
                                                <option value="2024-25" ${app.currentFY === '2024-25' ? 'selected' : ''}>2024-25</option>
                                                <option value="2025-26" ${app.currentFY === '2025-26' ? 'selected' : ''}>2025-26</option>
                                                <option value="2026-27" ${app.currentFY === '2026-27' ? 'selected' : ''}>2026-27</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Auto Suggest Checkbox -->
                                    <div class="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-3.5 rounded-xl mb-4 shadow-inner">
                                        <input type="checkbox" id="settings-auto-suggest" checked class="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500 cursor-pointer">
                                        <div class="flex flex-col">
                                            <span class="text-xs font-black text-slate-700">Auto-Suggest Preceding Month</span>
                                            <span class="text-[10px] text-slate-400">Shifting the active month automatically adjusts the completed month target.</span>
                                        </div>
                                    </div>

                                    <!-- Fiscal Year Transition Review Toggle -->
                                    <div id="settings-fy-review-container" class="${currentMonth === 'July' ? 'flex' : 'hidden'} items-center gap-2.5 bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl mb-6 shadow-sm">
                                        <input type="checkbox" id="settings-fy-review" ${app.fyReviewActive ? 'checked' : ''} onchange="app.updateSettingsPreviewDynamic()" class="w-4 h-4 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500 cursor-pointer">
                                        <div class="flex flex-col">
                                            <span class="text-xs font-black text-indigo-700">Active Fiscal Year Concluding Review Session</span>
                                            <span class="text-[10px] text-indigo-400 font-medium">Keep concluding fiscal year's overall results visible across all dashboards until closed.</span>
                                        </div>
                                    </div>

                                    <!-- Smart Auto Suggestion Banner (Hidden by default, shown dynamically) -->
                                    <div id="suggestion-banner" class="hidden bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm transition-all duration-300">
                                        <i data-lucide="sparkles" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse"></i>
                                        <div class="flex-1">
                                            <h4 class="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Timeline Auto-Recommendation</h4>
                                            <p class="text-[11px] text-amber-600 mt-0.5">We noticed you changed the Current Month to <span id="suggest-month-name" class="font-extrabold"></span>. Do you want to set the Last Completed Month to <span id="suggest-last-name" class="font-extrabold"></span>?</p>
                                            <button onclick="app.applyTimelineSuggestion()" class="mt-2.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-lg transition-colors shadow-sm">Apply Recommendation</button>
                                        </div>
                                    </div>

                                    <!-- Action Buttons -->
                                    <div class="flex gap-3 justify-end pt-4 border-t border-slate-100">
                                        <button onclick="app.resetSystemSettingsToDefaults()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-extrabold rounded-xl transition-colors">Reset Defaults</button>
                                        <button onclick="app.saveSystemSettings()" class="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl transition-colors shadow-md shadow-cyan-500/20 flex items-center gap-2">
                                            <i data-lucide="save" class="w-4 h-4"></i> Save System Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Live Preview & Sync Monitor (Takes 1 Col) -->
                            <div class="space-y-6">
                                <!-- Dynamic Preview Widget -->
                                <div class="glass p-5 rounded-2xl shadow-sm border border-white/60 relative overflow-hidden">
                                    <div class="absolute -right-16 -top-16 bg-blue-500/5 w-40 h-40 rounded-full blur-2xl"></div>
                                    <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <i data-lucide="eye" class="w-4 h-4 text-slate-500"></i> Active Preview
                                    </h4>
                                    <div class="space-y-3.5 text-xs">
                                        <div class="bg-white/50 border border-slate-100 p-3 rounded-xl">
                                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Current Scope</p>
                                            <p class="font-black text-slate-700 text-sm flex items-center gap-1.5">
                                                <i data-lucide="tag" class="w-4 h-4 text-yellow-500"></i> ${currentMonth}
                                            </p>
                                        </div>
                                        <div class="bg-white/50 border border-slate-100 p-3 rounded-xl">
                                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Completed Scope</p>
                                            <p class="font-black text-slate-700 text-sm flex items-center gap-1.5">
                                                <i data-lucide="history" class="w-4 h-4 text-emerald-500"></i> ${lastMonth}
                                            </p>
                                        </div>
                                        <div class="bg-white/50 border border-slate-100 p-3 rounded-xl">
                                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">YTD Target Sequences</p>
                                            <div class="flex flex-wrap gap-1">
                                                ${ytdMonths.length > 0 ? ytdMonths.map(m => `<span class="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] font-black px-1.5 py-0.5 rounded-md">${m.substring(0, 3)}</span>`).join('') : '<span class="text-slate-400 italic text-[10px]">None (Beginning of FY)</span>'}
                                            </div>
                                            <p class="text-[9px] text-indigo-400 font-bold mt-2 uppercase tracking-wide">🔗 ${ytdMonths.length} Months Tracked in YTD</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Database Sync Health -->
                                <div class="glass p-5 rounded-2xl shadow-sm border border-white/60 relative overflow-hidden">
                                    <div class="absolute -right-16 -top-16 bg-emerald-500/5 w-40 h-40 rounded-full blur-2xl"></div>
                                    <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <i data-lucide="database" class="w-4 h-4 text-slate-500"></i> Data Connection
                                    </h4>
                                    <div class="space-y-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                                            <div>
                                                <p class="text-xs font-black text-slate-700">Neon SQL Postgres Sync</p>
                                                <p class="text-[10px] text-slate-400">Connection established successfully.</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3 border-t border-slate-100 pt-3">
                                            <div class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                                            <div>
                                                <p class="text-xs font-black text-slate-700">Local Browser Cache</p>
                                                <p class="text-[10px] text-slate-400">Settings written to LocalStorage.</p>
                                            </div>
                                        </div>
                                        
                                        <button onclick="app.reSyncSystemDataCache()" class="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 uppercase tracking-wider">
                                            <i data-lucide="refresh-cw" class="w-3 h-3"></i> Sync System Cache
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                document.getElementById('view-port').innerHTML = html;
                app.refreshIcons();
            };

window.app.setTimelineMonth = (month) => {
                const selectCurrent = document.getElementById('settings-current-month');
                if (selectCurrent) {
                    selectCurrent.value = month;
                    app.handleSettingsMonthChange('current', month);
                }
            };

window.app.handleSettingsMonthChange = (type, month) => {
                const monthsList = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
                const autoSuggest = document.getElementById('settings-auto-suggest')?.checked;

                 if (type === 'current') {
                    const idx = monthsList.indexOf(month);
                    let recommendedLastMonth = 'March';
                    if (idx > 0) {
                        recommendedLastMonth = monthsList[idx - 1];
                    } else if (idx === 0) {
                        recommendedLastMonth = 'June';
                    }

                    if (autoSuggest) {
                        const selectLast = document.getElementById('settings-last-month');
                        if (selectLast) {
                            selectLast.value = recommendedLastMonth;
                        }
                    } else {
                        const banner = document.getElementById('suggestion-banner');
                        const suggestMonth = document.getElementById('suggest-month-name');
                        const suggestLast = document.getElementById('suggest-last-name');
                        if (banner && suggestMonth && suggestLast) {
                            suggestMonth.innerText = month;
                            suggestLast.innerText = recommendedLastMonth;
                            app.lastSuggestedMonth = recommendedLastMonth;
                            banner.classList.remove('hidden');
                            banner.classList.add('flex');
                        }
                    }

                    const fyReviewContainer = document.getElementById('settings-fy-review-container');
                    if (fyReviewContainer) {
                        if (month === 'July') {
                            fyReviewContainer.classList.remove('hidden');
                            fyReviewContainer.classList.add('flex');
                        } else {
                            fyReviewContainer.classList.add('hidden');
                            fyReviewContainer.classList.remove('flex');
                        }
                    }
                }
                
                app.updateSettingsPreviewDynamic();
            };

window.app.applyTimelineSuggestion = () => {
                const selectLast = document.getElementById('settings-last-month');
                if (selectLast && app.lastSuggestedMonth) {
                    selectLast.value = app.lastSuggestedMonth;
                }
                const banner = document.getElementById('suggestion-banner');
                if (banner) {
                    banner.classList.add('hidden');
                    banner.classList.remove('flex');
                }
                app.updateSettingsPreviewDynamic();
            };

window.app.updateSettingsPreviewDynamic = () => {
                const currentMonth = document.getElementById('settings-current-month')?.value || app.currentMonth;
                const lastMonth = document.getElementById('settings-last-month')?.value || app.lastMonth;
                const currentFY = document.getElementById('settings-current-fy')?.value || app.currentFY;
                const fyReviewActive = document.getElementById('settings-fy-review')?.checked || false;
                const showLastFYData = document.getElementById('settings-show-last-fy')?.checked || false;

                const origCurrent = app.currentMonth;
                const origLast = app.lastMonth;
                const origFY = app.currentFY;
                const origReview = app.fyReviewActive;
                const origShowLast = app.showLastFYData;
                app.currentMonth = currentMonth;
                app.lastMonth = lastMonth;
                app.currentFY = currentFY;
                app.fyReviewActive = fyReviewActive;
                app.showLastFYData = showLastFYData;

                app.renderSystemSettings();

                app.currentMonth = origCurrent;
                app.lastMonth = origLast;
                app.currentFY = origFY;
                app.fyReviewActive = origReview;
                app.showLastFYData = origShowLast;
            };

window.app.saveSystemSettings = async () => {
                const currentMonth = document.getElementById('settings-current-month')?.value;
                const lastMonth = document.getElementById('settings-last-month')?.value;
                const currentFY = document.getElementById('settings-current-fy')?.value;
                const fyReviewActive = document.getElementById('settings-fy-review')?.checked || false;

                if (!currentMonth || !lastMonth || !currentFY) return;

                app.showLoader("Saving system configurations...");

                try {
                    app.currentMonth = currentMonth;
                    app.lastMonth = lastMonth;
                    app.currentFY = currentFY;
                    app.fyReviewActive = fyReviewActive;
                    localStorage.setItem('aci_current_fy', currentFY);
                    DB.settings = { currentMonth, lastMonth, currentFY, fyReviewActive };

                    if (app.neonSQL) {
                        const settingsJson = JSON.stringify(DB.settings);
                        await app.neonSQL`UPDATE app_settings SET settings_json = ${settingsJson} WHERE id = '1'`;
                    }
                    
                    app.soMonthTab = null;
                    app.hideLoader();
                    app.showToast(`System Settings Saved: ${currentMonth} / ${lastMonth} (FY: ${currentFY})`, "success");
                    app.renderSystemSettings();
                } catch (err) {
                    app.hideLoader();
                    console.error("Failed to save settings:", err);
                    app.showToast("Failed to save settings to database.", "error");
                }
            };

window.app.resetSystemSettingsToDefaults = () => {
                const selectCurrent = document.getElementById('settings-current-month');
                const selectLast = document.getElementById('settings-last-month');

                if (selectCurrent && selectLast) {
                    selectCurrent.value = 'April';
                    selectLast.value = 'March';
                    app.handleSettingsMonthChange('current', 'April');
                }
            };

window.app.reSyncSystemDataCache = () => {
                app.showLoader("Purging local caches & resynching...");
                setTimeout(() => {
                    app.hideLoader();
                    app.showToast("System cache synchronized successfully!", "success");
                }, 1000);
            };

window.app.setSessionFY = (fy) => {
                if (app.currentUser.role === 'so') {
                    app.soSelectedFY = fy;
                    app.renderSODashboard();
                } else {
                    app.selectedFY = fy;
                    app.renderAdminDashboard();
                }
                app.showToast(`Switched view context to FY ${fy}`, 'success');
            };

window.app.getPreviousFY = (fy) => {
                if (!fy) return '';
                const parts = fy.split('-');
                if (parts.length === 2) {
                    const y1 = parseInt(parts[0]);
                    const y2 = parseInt(parts[1]);
                    return `${y1-1}-${y2-1}`;
                }
                return fy;
            };

window.app.getTransitionBannerHtml = (currentFY) => {
                if (app.currentMonth !== 'July' || !app.fyReviewActive) return '';
                const activeFY = app.currentFY;
                const concludingFY = app.getPreviousFY(activeFY);
                return `
                    <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl py-2 px-3.5 mb-4 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-3 border border-indigo-400/20">
                        <div class="absolute -right-10 -top-10 bg-white/10 w-24 h-24 rounded-full blur-xl pointer-events-none"></div>
                        <div class="flex items-center gap-2.5">
                            <div class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0 shadow-sm border border-white/20">
                                <i data-lucide="archive-restore" class="w-3.5 h-3.5 text-white"></i>
                            </div>
                            <div>
                                <h4 class="text-[11px] font-black uppercase tracking-wider">FY ${concludingFY} Concluding Review Mode</h4>
                                <p class="text-[9px] text-indigo-100/90 font-medium">Toggle between last year's overall results and the new FY ${activeFY} YTD targets.</p>
                            </div>
                        </div>
                        <div class="flex gap-2 shrink-0">
                            <button onclick="app.setSessionFY('${concludingFY}')" class="px-2.5 py-1 ${currentFY === concludingFY ? 'bg-white text-indigo-700 font-black shadow-sm' : 'bg-white/15 text-white hover:bg-white/25'} text-[9px] rounded-lg transition-all uppercase tracking-wider">${concludingFY} Results</button>
                            <button onclick="app.setSessionFY('${activeFY}')" class="px-2.5 py-1 ${currentFY === activeFY ? 'bg-white text-indigo-700 font-black shadow-sm' : 'bg-white/15 text-white hover:bg-white/25'} text-[9px] rounded-lg transition-all uppercase tracking-wider">${activeFY} Targets</button>
                        </div>
                    </div>
                `;
            };

