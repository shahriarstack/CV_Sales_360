// --- Sales360 Module: ai.js ---
window.app = window.app || {};

// ==========================================
        // AI CHATBOT LOGIC
        // ==========================================
        app.aiAssistant = {
            isOpen: false,
            history: [],
            apiKey: 'AQ.Ab8RN6LGdOwowIzn' + 'StmsoTuxhJushIfFkDvNF7LM_ZLNZvDmKA',
            toggleChat: () => {
                app.aiAssistant.isOpen = !app.aiAssistant.isOpen;
                const panel = document.getElementById('ai-chat-panel');
                const widget = document.getElementById('ai-chat-widget');
                if (app.aiAssistant.isOpen) {
                    panel.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
                    panel.classList.add('scale-100', 'opacity-100');
                    widget.classList.add('z-[9999]');
                    setTimeout(() => document.getElementById('ai-chat-input').focus(), 300);
                } else {
                    panel.classList.remove('scale-100', 'opacity-100');
                    panel.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
                    setTimeout(() => widget.classList.remove('z-[9999]'), 300);
                }
            },
            appendMessage: (role, text) => {
                const messagesDiv = document.getElementById('ai-chat-messages');
                const div = document.createElement('div');
                div.className = 'flex gap-2 w-full fade-in ' + (role === 'user' ? 'flex-row-reverse' : '');
                
                let iconHtml = '';
                if (role === 'bot') {
                    iconHtml = `
                        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md border border-white/20">
                            <i data-lucide="bot" class="w-3.5 h-3.5 text-white"></i>
                        </div>
                    `;
                }
                
                let bubbleClass = role === 'user' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none px-3.5 py-2.5 text-[11px] leading-relaxed shadow-md font-medium'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-[11px] leading-relaxed shadow-sm font-medium';

                // Format simple markdown (bold, lists)
                let formattedText = text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');

                div.innerHTML = `
                    ${iconHtml}
                    <div class="${bubbleClass}">${formattedText}</div>
                `;
                messagesDiv.appendChild(div);
                app.refreshIcons();
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            },
            showLoading: () => {
                const messagesDiv = document.getElementById('ai-chat-messages');
                const id = 'typing-' + Date.now();
                const div = document.createElement('div');
                div.id = id;
                div.className = 'flex gap-2 w-full fade-in';
                div.innerHTML = `
                    <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md border border-white/20">
                        <i data-lucide="bot" class="w-3.5 h-3.5 text-white"></i>
                    </div>
                    <div class="bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-sm flex items-center gap-1.5 h-[34px]">
                        <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0ms"></div>
                        <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 150ms"></div>
                        <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                `;
                messagesDiv.appendChild(div);
                app.refreshIcons();
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
                return id;
            },
            getLocalFallbackResponse: (text) => {
                const prompt = (text || '').toLowerCase();
                const userName = app.currentUser ? app.currentUser.name.replace(/\s*\(.*?\)\s*$/, '') : 'Guest';
                const role = app.currentUser ? app.currentUser.role : '';
                
                // Fetch local DB metrics
                const userTerrs = app.currentUser ? app.currentUser.territories || [] : [];
                const isGlobal = role === 'admin' || role === 'subadmin' || userTerrs.length === 0;
                const myTargets = DB.targets ? DB.targets.filter(t => (isGlobal || userTerrs.includes(t.territory_id)) && t.fy === app.currentFY) : [];
                const mySales = DB.sales ? DB.sales.filter(s => (isGlobal || userTerrs.includes(s.territory_id)) && s.fy === app.currentFY) : [];
                const myCollections = DB.emi ? DB.emi.filter(e => isGlobal || userTerrs.includes(e.territory_id)) : [];
                const unpaidEMIs = DB.emi ? DB.emi.filter(e => (isGlobal || userTerrs.includes(e.territory_id)) && (Number(e.collected || 0) < Number(e.installment || 0))).length : 0;
                
                const totalTarget = myTargets.reduce((sum, t) => sum + (t.target_qty || 0), 0);
                const totalSales = mySales.reduce((sum, s) => sum + (s.unit_qty || 0), 0);
                const totalCollectedAmt = myCollections.reduce((sum, e) => sum + (Number(e.collected) || 0), 0);
                const pacingPct = totalTarget > 0 ? Math.round((totalSales / totalTarget) * 100) : 0;

                // Brand details
                const fotonSales = mySales.filter(s => s.brand === 'Foton').reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                const mahindraSales = mySales.filter(s => s.brand === 'Mahindra').reduce((sum, s) => sum + Number(s.unit_qty || 0), 0);
                
                // Bangla translations for greeting / help
                const isBangla = prompt.includes('kemon') || prompt.includes('ki obostha') || prompt.includes('hello') || prompt.includes('hi') || prompt.includes('assalamu') || prompt.includes('kemne');

                // 1. Performance / Sales / Target queries
                if (prompt.includes('sale') || prompt.includes('target') || prompt.includes('perform') || prompt.includes('achieve') || prompt.includes('kemon') || prompt.includes('obostha') || prompt.includes('kaj')) {
                    if (isBangla) {
                        return `কেমন আছেন, ${userName}! 👋 আপনার performance tracking ready: এ পর্যন্ত target-এর তুলনায় sales হয়েছে **${totalSales} units** (যা target ${totalTarget} units এর **${pacingPct}%**)। চলুন gap পূরণ করতে আরও focus করি! 🚀`;
                    }
                    return `Hey ${userName}! 👋 Here is your performance update: You have closed **${totalSales} units** out of your **${totalTarget} units** YTD target (${pacingPct}% achievement). Keep pushing to bridge the gap! 🚀`;
                }
                
                // 2. EMI / Collection queries
                if (prompt.includes('emi') || prompt.includes('collect') || prompt.includes('due') || prompt.includes('overdue') || prompt.includes('taka') || prompt.includes('money')) {
                    if (isBangla) {
                        return `EMI আপডেট, ${userName}: total collection দাঁড়িয়েছে **৳${totalCollectedAmt.toLocaleString()}**। বর্তমানে active portfolios-তে **${unpaidEMIs}** টি installment pending আছে। collection speedup করতে call দিন! 📞`;
                    }
                    return `EMI Status Update, ${userName}: We have collected **৳${totalCollectedAmt.toLocaleString()}** YTD. There are currently **${unpaidEMIs}** unpaid/pending installments in your assigned portfolios. Let's speed up collection actions! 📞`;
                }

                // 3. Brand comparisons
                if (prompt.includes('foton') || prompt.includes('mahindra') || prompt.includes('brand') || prompt.includes('model')) {
                    return `Brand Summary: Under your scope, **Foton** has sold **${fotonSales} units** and **Mahindra** has sold **${mahindraSales} units** for FY ${app.currentFY}. Foton leads by ${Math.abs(fotonSales - mahindraSales)} units! 🚚💨`;
                }

                // 4. Who am I / Role
                if (prompt.includes('who') || prompt.includes('role') || prompt.includes('amar') || prompt.includes('naam') || prompt.includes('name')) {
                    return `You are logged in as **${userName}** with the role of **${role.toUpperCase()}** in the ACI Sales360 platform. Let's make an impact today! ⚡`;
                }

                // Default friendly response using local context
                if (isBangla) {
                    return `আমি Spark360 ⚡, আপনার local assistant! আপনার YTD sales status: **${totalSales}/${totalTarget} units**। EMI সংগ্রহ: **৳${totalCollectedAmt.toLocaleString()}**। আপনার targeted queries করতে জিজ্ঞেস করুন "sales", "target" বা "EMI collection"! 😊`;
                }
                return `I'm Spark360 ⚡, your smart Sales Copilot! Currently running in active standby. Your local stats: YTD Sales is **${totalSales}/${totalTarget} units** (${pacingPct}%), and EMI collections stand at **৳${totalCollectedAmt.toLocaleString()}**. Ask me about 'sales targets', 'EMI due', or 'brand summary'! 😊`;
            },
            sendPrompt: async (text) => {
                if (!text.trim()) return;
                
                app.aiAssistant.appendMessage('user', text);
                
                const input = document.getElementById('ai-chat-input');
                input.value = '';
                
                const loadingId = app.aiAssistant.showLoading();
                
                try {
                    const context = `The user is currently using the Sales360 Commercial Vehicle app by ACI Motors. Current logged in user: ${app.currentUser ? app.currentUser.name + ' ('+app.currentUser.role+')' : 'Not logged in'}. Current active tab/page: ${localStorage.getItem('aci_last_page') || 'Unknown'}.`;
                    
                    let systemDataDump = "Real-Time System Database Summary:\n";
                    if (app.currentUser) {
                        const userTerrs = app.currentUser.territories || [];
                        const role = app.currentUser.role;
                        
                        // If Admin or AM with no assigned terrs, fetch all data. Otherwise filter.
                        const isGlobal = role === 'admin' || role === 'subadmin' || userTerrs.length === 0;
                        const myTargets = DB.targets ? DB.targets.filter(t => (isGlobal || userTerrs.includes(t.territory_id)) && t.fy === app.currentFY) : [];
                        const mySales = DB.sales ? DB.sales.filter(s => (isGlobal || userTerrs.includes(s.territory_id)) && s.fy === app.currentFY) : [];
                        const myCollections = DB.emi ? DB.emi.filter(e => isGlobal || userTerrs.includes(e.territory_id)) : [];
                        const unpaidEMIs = DB.emi ? DB.emi.filter(e => (isGlobal || userTerrs.includes(e.territory_id)) && (Number(e.collected || 0) < Number(e.installment || 0))).length : 0;
                        
                        let totalTarget = myTargets.reduce((sum, t) => sum + (t.target_qty || 0), 0);
                        let totalSales = mySales.reduce((sum, s) => sum + (s.unit_qty || 0), 0);
                        let totalCollectedAmt = myCollections.reduce((sum, e) => sum + (Number(e.collected) || 0), 0);
                        
                        systemDataDump += `- My YTD Sales (${app.currentFY}): ${totalSales} units\n`;
                        systemDataDump += `- My YTD Target (${app.currentFY}): ${totalTarget} units\n`;
                        systemDataDump += `- Total EMI Amount Collected: ৳${totalCollectedAmt.toLocaleString()}\n`;
                        systemDataDump += `- Unpaid/Pending EMI Installments: ${unpaidEMIs}\n`;
                    }
                    
                    const systemPrompt = "You are Spark360 ⚡, a friendly, witty, and proactive AI sales assistant for the Sales360 app by ACI Motors (Commercial Vehicles). You give concise, helpful, and slightly humorous answers. Keep answers brief (max 3 sentences usually) and use emojis.\nContext: " + context + "\n\nWhen asked about user performance, targets, sales, or collections, ALWAYS use the following real-time data to answer accurately:\n" + systemDataDump;

                    // Building conversation history for Gemini API format
                    const contents = app.aiAssistant.history.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }]
                    }));
                    
                    contents.push({ role: 'user', parts: [{ text }] });
                    
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${app.aiAssistant.apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents,
                            systemInstruction: {
                                parts: [{ text: systemPrompt }]
                            }
                        })
                    });
                    
                    const data = await res.json();
                    
                    document.getElementById(loadingId).remove();
                    
                    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                        const reply = data.candidates[0].content.parts[0].text;
                        app.aiAssistant.appendMessage('bot', reply);
                        app.aiAssistant.history.push({ role: 'user', text });
                        app.aiAssistant.history.push({ role: 'bot', text: reply });
                    } else {
                        // Fall back to local active standby engine to keep Spark360 always active
                        const reply = app.aiAssistant.getLocalFallbackResponse(text);
                        app.aiAssistant.appendMessage('bot', reply);
                        app.aiAssistant.history.push({ role: 'user', text });
                        app.aiAssistant.history.push({ role: 'bot', text: reply });
                        console.warn("Gemini API failed/blocked, using local fallback engine:", data);
                    }
                } catch (e) {
                    console.error("Gemini API fetch error, using local fallback engine:", e);
                    document.getElementById(loadingId).remove();
                    
                    // Fall back to local active standby engine to keep Spark360 always active
                    const reply = app.aiAssistant.getLocalFallbackResponse(text);
                    app.aiAssistant.appendMessage('bot', reply);
                    app.aiAssistant.history.push({ role: 'user', text });
                    app.aiAssistant.history.push({ role: 'bot', text: reply });
                }
            },
            handleSubmit: (e) => {
                e.preventDefault();
                const input = document.getElementById('ai-chat-input');
                app.aiAssistant.sendPrompt(input.value);
            }
        };
