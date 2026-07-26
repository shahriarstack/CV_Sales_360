const fs = require('fs');

function makeAdminFullWidth(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    const replacements = [
        {
            target: 'class="max-w-6xl mx-auto fade-in"',
            replacement: 'class="w-full fade-in"'
        },
        {
            target: 'class="max-w-6xl mx-auto fade-in pb-12"',
            replacement: 'class="w-full fade-in pb-12"'
        },
        {
            target: 'class="max-w-7xl mx-auto fade-in"',
            replacement: 'class="w-full fade-in"'
        },
        {
            target: 'class="max-w-7xl mx-auto fade-in pb-12"',
            replacement: 'class="w-full fade-in pb-12"'
        },
        {
            target: 'class="max-w-7xl mx-auto fade-in pb-10 h-full flex flex-col"',
            replacement: 'class="w-full fade-in pb-10 h-full flex flex-col"'
        },
        {
            target: 'class="max-w-7xl mx-auto fade-in pb-10"',
            replacement: 'class="w-full fade-in pb-10"'
        },
        {
            target: 'class="pb-6 fade-in max-w-5xl mx-auto"',
            replacement: 'class="w-full pb-6 fade-in"'
        },
        {
            target: 'class="max-w-4xl mx-auto pb-10 fade-in"',
            replacement: 'class="w-full pb-10 fade-in"'
        }
    ];

    replacements.forEach(r => {
        let count = 0;
        let idx = content.indexOf(r.target);
        while (idx !== -1) {
            count++;
            idx = content.indexOf(r.target, idx + 1);
        }
        console.log(`Target "${r.target}" found ${count} times.`);
        content = content.split(r.target).join(r.replacement);
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("All admin panels successfully updated to full screen width!");
}

makeAdminFullWidth('app.js');
