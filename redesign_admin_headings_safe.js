const fs = require('fs');

function redesignAdminHeadingsSafe(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Accent pill template
    const pill = `<div class="h-5 w-1.5 bg-gradient-to-b \${app.adminBrandTab === 'Mahindra' ? 'from-mahindra to-rose-500 shadow-mahindra/20' : 'from-foton to-sky-500 shadow-foton/20'} rounded-full shadow-sm"></div>`;
    // Text class template
    const textClass = `text-lg font-black text-transparent bg-clip-text bg-gradient-to-r \${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight`;

    const replacements = [
        {
            target: '<h1 class="text-lg font-bold text-slate-800">Vehicle Models</h1>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass}">Vehicle Models</h1></div>`
        },
        {
            target: '<h1 class="text-lg font-bold text-slate-800">User Management</h1>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass}">User Management</h1></div>`
        },
        {
            target: '<h1 class="text-lg font-bold text-slate-800">${isAM ? \'Area EMI Summary\' : \'Global EMI Analytics\'}</h1>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass}">\${isAM ? 'Area EMI Summary' : 'Global EMI Analytics'}</h1></div>`
        },
        {
            target: '<h1 class="text-lg font-bold text-slate-800">Manual Deliveries Tracker</h1>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass}">Manual Deliveries Tracker</h1></div>`
        },
        {
            target: '<h1 class="text-xl font-black text-slate-900 tracking-tight">${isAM ? \'Area Analytics\' : \'Executive Core\'}</h1>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r \${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight">\${isAM ? 'Area Analytics' : 'Executive Core'}</h1></div>`
        },
        {
            target: '<h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight flex items-center gap-3">',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r \${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight flex items-center gap-3">`
        },
        {
            target: '<h1 class="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-3">',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass} flex items-center gap-3">`
        },
        {
            target: '<h1 class="text-lg font-bold text-slate-800 flex items-center gap-2">',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass} flex items-center gap-2">`
        },
        {
            target: '<h1 class="text-lg font-bold text-slate-800">Bulk Data Upload</h1>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass}">Bulk Data Upload</h1></div>`
        },
        {
            target: '<h1 class="text-lg font-bold text-slate-800 flex items-center gap-2">',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass} flex items-center gap-2">`
        },
        {
            target: '<h1 class="text-lg font-bold text-slate-800">TIV Data Management</h1>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="${textClass}">TIV Data Management</h1></div>`
        },
        {
            target: '<h2 class="text-3xl font-black text-slate-800 flex items-center gap-2"><i data-lucide="megaphone" class="w-8 h-8 text-amber-500 fill-amber-100"></i> Notice Board Panel</h2>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r \${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight flex items-center gap-2"><i data-lucide="megaphone" class="w-5 h-5 text-amber-500"></i> Notice Board Panel</h1></div>`
        },
        {
            target: '<h2 class="text-3xl font-black text-slate-800 flex items-center gap-2"><i data-lucide="link-2" class="w-8 h-8 text-indigo-500 fill-indigo-100"></i> Important App Links</h2>',
            replacement: `<div class="flex items-center gap-2.5">${pill}<h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r \${app.adminBrandTab === 'Mahindra' ? 'from-[#991b1b] to-slate-800' : 'from-[#0f2942] to-slate-800'} tracking-tight flex items-center gap-2"><i data-lucide="link-2" class="w-5 h-5 text-indigo-500"></i> Important App Links</h1></div>`
        }
    ];

    replacements.forEach(r => {
        let occCount = 0;
        let idx = content.indexOf(r.target);
        while (idx !== -1) {
            occCount++;
            idx = content.indexOf(r.target, idx + 1);
        }
        console.log(`Target: "${r.target.substring(0, 40)}..." found ${occCount} times`);
        content = content.split(r.target).join(r.replacement);
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Admin page headings successfully upgraded with zero local variable footprint!");
}

redesignAdminHeadingsSafe('app.js');
