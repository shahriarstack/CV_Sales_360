const fs = require('fs');

function reduceAdminHeadings(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Executive Core / Area Analytics (Dashboard)
    content = content.replace(
        '<h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">${isAM ? \'Area Analytics\' : \'Executive Core\'}</h1>',
        '<h1 class="text-xl font-black text-slate-900 tracking-tight">${isAM ? \'Area Analytics\' : \'Executive Core\'}</h1>'
    );

    // 2. EMI Analytics
    content = content.replace(
        '<h1 class="text-2xl font-bold text-slate-800">${isAM ? \'Area EMI Summary\' : \'Global EMI Analytics\'}</h1>',
        '<h1 class="text-lg font-bold text-slate-800">${isAM ? \'Area EMI Summary\' : \'Global EMI Analytics\'}</h1>'
    );

    // 3. Manual Deliveries Tracker
    content = content.replace(
        '<h1 class="text-2xl font-bold text-slate-800">Manual Deliveries Tracker</h1>',
        '<h1 class="text-lg font-bold text-slate-800">Manual Deliveries Tracker</h1>'
    );

    // 4. Vehicle Models
    content = content.replace(
        '<h1 class="text-2xl font-bold text-slate-800">Vehicle Models</h1>',
        '<h1 class="text-lg font-bold text-slate-800">Vehicle Models</h1>'
    );

    // 5. User Management
    content = content.replace(
        '<h1 class="text-2xl font-bold text-slate-800">User Management</h1>',
        '<h1 class="text-lg font-bold text-slate-800">User Management</h1>'
    );

    // 6. Bulk Data Upload
    content = content.replace(
        '<h1 class="text-2xl font-bold text-slate-800">Bulk Data Upload</h1>',
        '<h1 class="text-lg font-bold text-slate-800">Bulk Data Upload</h1>'
    );

    // 7. TIV Data Management
    content = content.replace(
        '<h1 class="text-2xl font-bold text-slate-800">TIV Data Management</h1>',
        '<h1 class="text-lg font-bold text-slate-800">TIV Data Management</h1>'
    );

    // 8. Notice & Links Board
    // Let's inspect notice board heading: <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
    content = content.replace(
        '<h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">',
        '<h1 class="text-lg font-bold text-slate-800 flex items-center gap-2">'
    );

    // 9. AI Insights & Analytics
    content = content.replace(
        '<h1 class="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">',
        '<h1 class="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-3">'
    );

    // 10. Historical Analytics
    content = content.replace(
        '<h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight flex items-center gap-3">',
        '<h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight flex items-center gap-3">'
    );

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Admin Panel main tab headings successfully reduced!");
}

reduceAdminHeadings('app.js');
