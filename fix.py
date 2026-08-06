import sys

with open('js/admin_users.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_admin = 'ID: ${u.employee_id || u.password || "N/A"}'
new_admin = 'ID: ${u.employee_id || "N/A"} &bull; Pass: ${u.password || "N/A"}'

old_mo = '${so.employee_id || so.password || "N/A"}</div>'
new_mo = '${so.employee_id || "N/A"} <span class="text-[10px] text-slate-400 font-normal ml-1 border-l border-slate-200 pl-1">(Pass: ${so.password || "N/A"})</span></div>'

content = content.replace(old_admin, new_admin)
content = content.replace(old_mo, new_mo)

with open('js/admin_users.js', 'w', encoding='utf-8') as f:
    f.write(content)
