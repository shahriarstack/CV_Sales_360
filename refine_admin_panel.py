import re

def refine_admin_panel(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    start_idx = content.find("renderAdminDashboard: () => {")
    if start_idx == -1:
        print("Could not find renderAdminDashboard")
        return
    
    end_idx = content.find("renderDashboardMiniMap:", start_idx)
    if end_idx == -1:
        end_idx = len(content)
        
    admin_code = content[start_idx:end_idx]

    # 1. Update Brand Switcher
    # Foton Button with animation
    admin_code = re.sub(
        r'class="flex items-center gap-1\.5 px-3 py-1\.5 rounded-lg transition-all \$\{brandFilter === \'Foton\' \? \'bg-white shadow-sm border border-slate-200/60 text-aci-blue scale-105\' : \'text-white/40 hover:text-white/70\'\}" style="animation: [^"]+"',
        r'class="flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${brandFilter === \'Foton\' ? \'bg-foton shadow-sm text-white\' : \'text-white/40 hover:text-white/70\'}"',
        admin_code
    )
    # Mahindra Button with animation
    admin_code = re.sub(
        r'class="flex items-center gap-1\.5 px-3 py-1\.5 rounded-lg transition-all \$\{brandFilter === \'Mahindra\' \? \'bg-white shadow-sm border border-slate-200/60 text-aci-blue scale-105\' : \'text-white/40 hover:text-white/70\'\}" style="animation: [^"]+"',
        r'class="flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${brandFilter === \'Mahindra\' ? \'bg-mahindra shadow-sm text-white\' : \'text-white/40 hover:text-white/70\'}"',
        admin_code
    )

    # Secondary Foton button
    admin_code = re.sub(
        r'class="px-3 py-1\.5 rounded-lg text-\[10px\] font-bold transition-all \$\{brandFilter === \'Foton\' \? \'bg-white shadow-sm text-aci-blue\' : \'text-slate-500 hover:text-slate-800\'\}"',
        r'class="px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${brandFilter === \'Foton\' ? \'bg-foton shadow-sm text-white\' : \'text-slate-500 hover:text-slate-800\'}"',
        admin_code
    )
    # Secondary Mahindra button
    admin_code = re.sub(
        r'class="px-3 py-1\.5 rounded-lg text-\[10px\] font-bold transition-all \$\{brandFilter === \'Mahindra\' \? \'bg-white shadow-sm text-aci-blue\' : \'text-slate-500 hover:text-slate-800\'\}"',
        r'class="px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${brandFilter === \'Mahindra\' ? \'bg-mahindra shadow-sm text-white\' : \'text-slate-500 hover:text-slate-800\'}"',
        admin_code
    )

    # 2. Update Sale Type Toggle
    admin_code = re.sub(
        r'class="flex-1 px-3 py-1\.5 rounded-lg text-xs font-bold transition-all \$\{currentSaleType === \'New Sale\' \? \'bg-white shadow-sm text-aci-blue\' : \'text-slate-500 hover:text-slate-800\'\}"',
        r'class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${currentSaleType === \'New Sale\' ? \'bg-white shadow-sm text-aci-blue\' : \'text-slate-500 hover:text-slate-800\'}"',
        admin_code
    )
    admin_code = re.sub(
        r'class="flex-1 px-3 py-1\.5 rounded-lg text-xs font-bold transition-all \$\{currentSaleType === \'Resale\' \? \'bg-white shadow-sm text-aci-blue\' : \'text-slate-500 hover:text-slate-800\'\}"',
        r'class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${currentSaleType === \'Resale\' ? \'bg-white shadow-sm text-aci-blue\' : \'text-slate-500 hover:text-slate-800\'}"',
        admin_code
    )

    # 3. Cards to glass/compact
    admin_code = admin_code.replace(
        'class="bg-white border border-slate-200/60 p-3 rounded-xl shadow-sm border border-white/60 mb-4 relative overflow-hidden"',
        'class="glass p-2.5 rounded-xl shadow-sm border border-slate-100 mb-3 relative overflow-hidden"'
    )
    
    # 4. YTD Overall headings to be slightly smaller and matching Officer Panel style
    admin_code = admin_code.replace(
        'class="font-bold text-slate-800 text-xs flex items-center gap-2"',
        'class="font-bold text-slate-800 text-sm flex items-center gap-2"' # Make heading text-sm like Officer Panel
    )

    # 5. Dynamic Branding Cards (Primary gradients)
    admin_code = admin_code.replace(
        "class=\"bg-gradient-to-br ${brandFilter === 'Foton' ? 'from-foton to-[#03133d]' : 'from-mahindra to-[#b81b31]'} rounded-xl p-3 mb-4 relative overflow-hidden shadow-sm border border-slate-200/60 text-white\"",
        "class=\"bg-gradient-to-br ${brandFilter === 'Foton' ? 'from-foton to-[#03133d] shadow-foton/20' : 'from-mahindra to-[#b81b31] shadow-mahindra/20'} rounded-xl p-2.5 mb-3 relative overflow-hidden shadow-sm text-white\""
    )

    # 6. Denser tables
    # Reduce row padding
    admin_code = admin_code.replace('px-2 py-1.5', 'px-1.5 py-1')
    admin_code = admin_code.replace('px-2 py-1', 'px-1.5 py-0.5')
    admin_code = admin_code.replace('px-3 py-2', 'px-2 py-1')
    admin_code = admin_code.replace('mb-4', 'mb-3') # tighter spacing
    
    # Compress headers
    admin_code = admin_code.replace('text-[10px]', 'text-[9px]') # Denser text
    admin_code = admin_code.replace('text-xs', 'text-[10px]') # Sub-headers smaller
    
    # Combine back
    new_content = content[:start_idx] + admin_code + content[end_idx:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Admin panel UI refined successfully.")

if __name__ == "__main__":
    refine_admin_panel('index.html')
