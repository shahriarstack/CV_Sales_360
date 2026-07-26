const fs = require('fs');

function redesignNoticesHeadings(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find renderAdminNotices start
    let startIdx = content.indexOf("renderAdminNotices: () => {");
    if (startIdx === -1) {
        console.log("Could not find renderAdminNotices");
        return;
    }

    // 1. Target Notice Board Panel heading
    content = content.replace(
        '<h2 class="text-3xl font-black text-slate-800 flex items-center gap-2"><i data-lucide="megaphone" class="w-8 h-8 text-amber-500 fill-amber-100"></i> Notice Board Panel</h2>',
        '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight flex items-center gap-2"><i data-lucide="megaphone" class="w-5 h-5 text-amber-500"></i> Notice Board Panel</h1></div>'
    );

    // 2. Target Important App Links heading
    content = content.replace(
        '<h2 class="text-3xl font-black text-slate-800 flex items-center gap-2"><i data-lucide="link-2" class="w-8 h-8 text-indigo-500 fill-indigo-100"></i> Important App Links</h2>',
        '<div class="flex items-center gap-2.5"><div class="h-5 w-1.5 bg-gradient-to-b ${headerAccent} rounded-full shadow-sm"></div><h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${headerTextGradient} tracking-tight flex items-center gap-2"><i data-lucide="link-2" class="w-5 h-5 text-indigo-500"></i> Important App Links</h1></div>'
    );

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Notices and Links Board Panel headings successfully redesigned!");
}

redesignNoticesHeadings('app.js');
