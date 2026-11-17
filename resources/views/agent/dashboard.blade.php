<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Support Desk · Agent Workspace</title>
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/agent-dashboard.js'])
</head>
<body class="crm-body">
<div id="login-screen" class="login-screen">
    <form id="login-form" class="login-card">
        <div class="brand-mark">N</div>
        <p class="eyebrow">NAHEED CUSTOMER CARE</p>
        <h1>Welcome back</h1>
        <p class="muted">Sign in to your support workspace.</p>
        <label>Email address</label>
        <input id="login-email" type="email" value="sarah@support.com" required autocomplete="username">
        <label>Password</label>
        <input id="login-password" type="password" value="password" required autocomplete="current-password">
        <button class="primary-btn full-btn" type="submit">Sign in to workspace <span>→</span></button>
        <p id="login-error" class="error-text"></p>
        <p class="login-hint">Local demo account: sarah@support.com / password</p>
    </form>
</div>
<div id="crm-app" class="crm-shell hidden">
    <aside class="sidebar">
        <div class="sidebar-brand"><div class="brand-mark small">N</div><div><strong>naheed</strong><small>SUPPORT DESK</small></div></div>
        <div class="workspace-label">WORKSPACE</div>
        <a class="side-link active" href="#inbox" data-filter="all"><span>▤</span> Inbox <b id="nav-total">0</b></a>
        <a class="side-link" href="#inbox" data-filter="pending_handover"><span>◷</span> Waiting for agent <b id="nav-pending">0</b></a>
        <a class="side-link" href="#inbox" data-filter="open"><span>▣</span> Open conversations</a>
        <a class="side-link" href="#inbox" data-filter="closed"><span>✓</span> Resolved</a>
        <div class="sidebar-bottom">
            <div class="agent-profile"><div class="avatar avatar-agent" id="agent-avatar">S</div><div class="agent-meta"><strong id="agent-name">Support Agent</strong><small>Available</small></div><button id="logout-btn" class="icon-btn" title="Sign out">↪</button></div>
        </div>
    </aside>
    <main class="main-area">
        <header class="topbar"><div><p class="eyebrow">CUSTOMER SERVICE</p><h1 id="page-title">Inbox</h1></div><div class="topbar-actions"><span class="live-dot"></span><span class="muted">Live updates</span><button class="icon-btn" id="refresh-btn" title="Refresh">↻</button></div></header>
        <section class="stats-grid">
            <article class="stat-card"><span class="stat-icon violet">▤</span><div><small>Total conversations</small><strong id="stat-total">—</strong></div></article>
            <article class="stat-card"><span class="stat-icon amber">◷</span><div><small>Waiting for agent</small><strong id="stat-pending">—</strong></div></article>
            <article class="stat-card"><span class="stat-icon blue">◉</span><div><small>AI handled</small><strong id="stat-ai">—</strong></div></article>
            <article class="stat-card"><span class="stat-icon green">✓</span><div><small>Human handled</small><strong id="stat-human">—</strong></div></article>
        </section>
        <section class="inbox-layout" id="inbox">
            <div class="conversation-panel">
                <div class="panel-heading"><div><h2>Conversations</h2><span id="conversation-count" class="muted tiny">Loading…</span></div><button class="icon-btn" id="list-refresh" title="Refresh conversations">↻</button></div>
                <div class="search-wrap"><span>⌕</span><input id="conversation-search" placeholder="Search customers…"></div>
                <div class="filter-tabs"><button class="filter-tab active" data-status="all">All</button><button class="filter-tab" data-status="pending_handover">Waiting</button><button class="filter-tab" data-status="open">Open</button><button class="filter-tab" data-status="closed">Closed</button></div>
                <div id="conversation-list" class="conversation-list"><div class="empty-state">Loading conversations…</div></div>
            </div>
            <div class="chat-panel">
                <div id="chat-empty" class="chat-empty"><div class="empty-illustration">✉</div><h2>Your inbox, in sync</h2><p>Select a conversation to read messages and respond to customers.</p></div>
                <div id="active-chat" class="active-chat hidden">
                    <div class="chat-header"><div class="customer-heading"><div id="chat-avatar" class="avatar">C</div><div><h2 id="chat-customer">Customer</h2><p id="chat-email" class="muted tiny">Customer conversation</p></div></div><div class="chat-header-actions"><span id="mode-pill" class="mode-pill ai">✦ AI handling</span><button id="takeover-btn" class="primary-btn">Take over</button><button id="release-btn" class="secondary-btn hidden">Return to AI</button></div></div>
                    <div id="chat-banner" class="chat-banner hidden"></div>
                    <div id="message-list" class="message-list"></div>
                    <div class="composer"><div class="composer-tools"><span>Reply to customer</span><span id="composer-hint" class="muted tiny">Enter to send · Shift + Enter for new line</span></div><textarea id="reply-input" rows="2" placeholder="Write a reply…" disabled></textarea><div class="composer-footer"><span class="muted tiny" id="reply-state">Take over this conversation to reply.</span><button id="send-reply" class="primary-btn" disabled>Send reply ↑</button></div></div>
                </div>
            </div>
            <aside class="details-panel"><div class="panel-heading"><h2>Customer details</h2></div><div id="customer-details" class="details-content"><div class="details-placeholder">Customer information will appear here when you select a conversation.</div></div></aside>
        </section>
    </main>
</div>
</body>
</html>
