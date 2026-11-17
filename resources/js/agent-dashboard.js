const API = '/api/v1';
const $ = (id) => document.getElementById(id);
const state = { token: localStorage.getItem('support_agent_token'), user: JSON.parse(localStorage.getItem('support_agent_user') || 'null'), conversations: [], selected: null, status: 'all', messages: [], channel: null };

async function api(path, options = {}) {
    const headers = { Accept: 'application/json', ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}), ...options.headers };
    const response = await fetch(`${API}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`);
    return payload;
}
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function initials(name = 'C') { return name.trim().split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase(); }
function dateLabel(value) { if (!value) return ''; const d = new Date(value); return Number.isNaN(+d) ? '' : d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }
function dateLong(value) { if (!value) return '—'; const d = new Date(value); return Number.isNaN(+d) ? '—' : d.toLocaleString([], {dateStyle:'medium',timeStyle:'short'}); }
function showLogin() { $('login-screen').classList.remove('hidden'); $('crm-app').classList.add('hidden'); }
function showApp() { $('login-screen').classList.add('hidden'); $('crm-app').classList.remove('hidden'); $('agent-name').textContent = state.user?.name || 'Support Agent'; $('agent-avatar').textContent = initials(state.user?.name); }

$('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); $('login-error').textContent = '';
    const button = $('login-form').querySelector('button'); button.disabled = true; button.textContent = 'Signing in…';
    try {
        const result = await api('/auth/login', { method:'POST', body: JSON.stringify({ email:$('login-email').value, password:$('login-password').value }) });
        state.token = result.data.token; state.user = result.data.user;
        localStorage.setItem('support_agent_token', state.token); localStorage.setItem('support_agent_user', JSON.stringify(state.user));
        showApp(); await loadConversations(); connectRealtime();
    } catch (error) { $('login-error').textContent = error.message; }
    finally { button.disabled = false; button.innerHTML = 'Sign in to workspace <span>→</span>'; }
});
$('logout-btn').addEventListener('click', async () => { try { await api('/auth/logout', {method:'POST'}); } catch (_) {} localStorage.removeItem('support_agent_token'); localStorage.removeItem('support_agent_user'); state.token = null; state.user = null; if (state.channel && window.Echo) window.Echo.leave('agent.dashboard'); showLogin(); });

async function loadConversations() {
    $('conversation-list').innerHTML = '<div class="empty-state">Loading conversations…</div>';
    try {
        const query = new URLSearchParams({ per_page:'100' }); if (state.status !== 'all') query.set('status', state.status);
        const result = await api(`/agent/conversations?${query}`);
        state.conversations = result.data || []; renderConversations(); updateStats();
    } catch (error) { $('conversation-list').innerHTML = `<div class="empty-state error-text">${escapeHtml(error.message)}</div>`; if (/unauthenticated/i.test(error.message)) { localStorage.removeItem('support_agent_token'); state.token = null; showLogin(); } }
}
function updateStats() {
    const all = state.conversations; $('conversation-count').textContent = `${all.length} loaded`;
    $('nav-total').textContent = all.length; const pending = all.filter(c=>c.status==='pending_handover').length; $('nav-pending').textContent = pending;
    $('stat-total').textContent = all.length; $('stat-pending').textContent = pending; $('stat-ai').textContent = all.filter(c=>c.mode==='ai').length; $('stat-human').textContent = all.filter(c=>c.mode==='human').length;
}
function lastPreview(c) { return c.last_message?.body || (c.mode === 'ai' ? 'AI conversation' : 'Conversation started'); }
function renderConversations() {
    const search = $('conversation-search').value.trim().toLowerCase();
    const items = state.conversations.filter(c => `${c.customer_name} ${c.customer_email || ''}`.toLowerCase().includes(search));
    if (!items.length) { $('conversation-list').innerHTML = '<div class="empty-state"><div class="empty-icon">⌕</div>No conversations found.</div>'; return; }
    $('conversation-list').innerHTML = items.map(c => `<button class="conversation-item ${state.selected?.uuid===c.uuid?'selected':''}" data-uuid="${escapeHtml(c.uuid)}"><span class="avatar">${escapeHtml(initials(c.customer_name))}</span><span class="conversation-summary"><span class="conversation-name">${escapeHtml(c.customer_name)}</span><span class="conversation-preview">${escapeHtml(lastPreview(c))}</span><span class="conversation-tags"><i class="tag ${c.mode==='human'?'human':'ai'}">${c.mode==='human'?'Human':'AI'}</i><i class="tag ${c.status==='pending_handover'?'waiting':c.status==='closed'?'closed':'open'}">${c.status==='pending_handover'?'Waiting':c.status==='closed'?'Closed':'Open'}</i></span></span><span class="conversation-time">${dateLabel(c.created_at)}</span></button>`).join('');
    document.querySelectorAll('.conversation-item').forEach(el => el.addEventListener('click', () => selectConversation(el.dataset.uuid)));
}
async function selectConversation(uuid) {
    const conversation = state.conversations.find(c=>c.uuid===uuid); if (!conversation) return;
    state.selected = conversation; $('chat-empty').classList.add('hidden'); $('active-chat').classList.remove('hidden'); renderConversations(); renderHeader();
    $('message-list').innerHTML = '<div class="empty-state">Loading messages…</div>';
    try { const result = await api(`/agent/conversations/${uuid}/messages`); state.messages = result.data || []; renderMessages(); connectConversation(uuid); }
    catch (error) { $('message-list').innerHTML = `<div class="empty-state error-text">${escapeHtml(error.message)}</div>`; }
}
function renderHeader() {
    const c = state.selected; $('chat-customer').textContent = c.customer_name; $('chat-email').textContent = c.customer_email || 'Customer conversation'; $('chat-avatar').textContent = initials(c.customer_name);
    const human = c.mode === 'human'; $('mode-pill').textContent = human ? '● Human handling' : '✦ AI handling'; $('mode-pill').className = `mode-pill ${human?'human':'ai'}`;
    $('takeover-btn').classList.toggle('hidden', human || c.status==='closed'); $('release-btn').classList.toggle('hidden', !human); $('reply-input').disabled = !human || c.status==='closed'; $('send-reply').disabled = !human || c.status==='closed';
    $('reply-state').textContent = c.status==='closed' ? 'This conversation is closed.' : human ? `Assigned to ${c.assigned_agent?.name || state.user?.name || 'you'}.` : 'Take over this conversation to reply.';
    $('chat-banner').classList.toggle('hidden', c.status!=='pending_handover'); $('chat-banner').textContent = 'This conversation needs human attention. Take it over to reply to the customer.';
    $('customer-details').innerHTML = `<div class="detail-person"><div class="avatar large">${escapeHtml(initials(c.customer_name))}</div><h3>${escapeHtml(c.customer_name)}</h3><p>${escapeHtml(c.customer_email || 'No email provided')}</p></div><div class="detail-row"><span>Conversation status</span><strong>${escapeHtml(c.status.replace('_',' '))}</strong></div><div class="detail-row"><span>Handling mode</span><strong>${human?'Human agent':'AI assistant'}</strong></div><div class="detail-row"><span>Assigned agent</span><strong>${escapeHtml(c.assigned_agent?.name || 'Unassigned')}</strong></div><div class="detail-row"><span>Started</span><strong>${escapeHtml(dateLong(c.created_at))}</strong></div><div class="detail-row"><span>Conversation ID</span><strong class="uuid-text">${escapeHtml(c.uuid)}</strong></div>`;
}
function renderMessages() {
    const box = $('message-list'); if (!state.messages.length) { box.innerHTML = '<div class="empty-state">No messages yet. Say hello to the customer.</div>'; return; }
    box.innerHTML = state.messages.map(m => messageHtml(m)).join(''); box.scrollTop = box.scrollHeight;
}
function messageHtml(m) {
    const own = m.sender_type === 'agent'; const sender = m.sender_type === 'customer' ? 'Customer' : m.sender_type === 'ai' ? 'NiaBot AI' : (state.user?.name || 'Agent');
    const attachments = (m.attachments || []).map(a => `<a class="attachment-link" href="${escapeHtml(a.file_url)}" target="_blank" rel="noopener">↗ ${escapeHtml(a.file_name || 'Attachment')}</a>`).join('');
    return `<div class="message-row ${own?'outgoing':'incoming'}"><div class="message-content"><div class="message-sender">${escapeHtml(sender)} <time>${dateLabel(m.created_at)}</time></div><div class="bubble ${m.sender_type==='ai'?'ai-bubble':''}">${escapeHtml(m.body || '').replace(/\n/g,'<br>')}${attachments}</div></div></div>`;
}
function addMessage(m) { if (!m) return; if (m.id != null && state.messages.some(x => x.id === m.id)) return; state.messages.push(m); renderMessages(); }
async function action(path, label) {
    const btn = label==='takeover' ? $('takeover-btn') : $('release-btn'); btn.disabled = true;
    try { const result = await api(`/agent/conversations/${state.selected.uuid}/${path}`, {method:'POST', body:JSON.stringify({})}); state.selected = {...state.selected, ...result.data}; const i=state.conversations.findIndex(c=>c.uuid===state.selected.uuid); if(i>=0) state.conversations[i]=state.selected; renderHeader(); renderConversations(); await loadConversations(); await selectConversation(state.selected.uuid); }
    catch(error) { alert(error.message); } finally { btn.disabled=false; }
}
$('takeover-btn').addEventListener('click', ()=>action('takeover','takeover'));
$('release-btn').addEventListener('click', ()=>action('release','release'));
$('send-reply').addEventListener('click', sendReply);
$('reply-input').addEventListener('keydown', e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendReply();} });
async function sendReply() {
    const body=$('reply-input').value.trim(); if(!body||!state.selected) return;
    $('send-reply').disabled=true;
    try { const result=await api(`/agent/conversations/${state.selected.uuid}/reply`,{method:'POST',body:JSON.stringify({body})}); addMessage(result.data); $('reply-input').value=''; }
    catch(error){alert(error.message);} finally{$('send-reply').disabled=false;}
}
$('conversation-search').addEventListener('input',renderConversations);
const FILTER_TITLES = { all: 'Inbox', pending_handover: 'Waiting for agent', open: 'Open conversations', closed: 'Resolved' };
function setFilter(status) {
    state.status = status;
    // Keep the top filter tabs, the sidebar links and the page heading in sync
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('active', b.dataset.status === status));
    document.querySelectorAll('.side-link[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === status));
    $('page-title').textContent = FILTER_TITLES[status] || 'Inbox';
    document.title = `${FILTER_TITLES[status] || 'Inbox'} · Support Desk`;
    loadConversations();
}
document.querySelectorAll('.filter-tab').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.status)));
document.querySelectorAll('.side-link[data-filter]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();setFilter(b.dataset.filter);}));
$('refresh-btn').addEventListener('click',loadConversations); $('list-refresh').addEventListener('click',loadConversations);
function connectRealtime() {
    if (!window.Echo || state.channel) return;
    state.channel=window.Echo.channel('agent.dashboard')
        .listen('.message.sent', event=>{ loadConversations(); if(state.selected?.uuid===event.conversation_uuid){ addMessage(event.message); } })
        .listen('.conversation.taken_over', event=>{ loadConversations(); if(state.selected?.uuid===event.conversation_uuid){state.selected.mode=event.mode;state.selected.status=event.status;state.selected.assigned_agent=event.assigned_agent;renderHeader();} })
        .listen('.conversation.released', event=>{ loadConversations(); if(state.selected?.uuid===event.conversation_uuid){state.selected.mode=event.mode;state.selected.status=event.status;state.selected.assigned_agent=null;renderHeader();} })
        .listen('.user.typing', event=>{ if(state.selected?.uuid===event.conversation_uuid && event.sender_type==='customer') $('reply-state').textContent=event.is_typing?'Customer is typing…':(state.selected.mode==='human'?'Conversation assigned to you.':'Take over this conversation to reply.'); });
}
function connectConversation(uuid) { if(!window.Echo)return; if(window.__activeConversationChannel) window.Echo.leave(`conversation.${window.__activeConversationChannel}`); window.__activeConversationChannel=uuid; window.Echo.channel(`conversation.${uuid}`).listen('.message.sent',event=>{if(event.conversation_uuid===state.selected?.uuid){addMessage(event.message);}}); }
if (state.token && state.user) { showApp(); loadConversations().then(connectRealtime); } else showLogin();
