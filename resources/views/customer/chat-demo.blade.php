<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Customer Chat Preview · Naheed</title>
    @vite(['resources/css/app.css'])
</head>
<body class="customer-demo-body">
    <div class="demo-top"><a href="/agent" class="back-link">← Agent workspace</a><div class="demo-store"><span class="brand-mark small">N</span><strong>naheed.pk</strong></div><span class="demo-tag">Customer chat preview</span></div>
    <main class="demo-content"><div class="demo-copy"><p class="eyebrow">NAHEED CUSTOMER CARE</p><h1>How can we help you today?</h1><p>Use this preview to test the customer experience. Start a conversation, send a message, then open the agent workspace in another tab to take it over.</p><div class="demo-note"><strong>Testing tip</strong><span>Open <a href="/agent">/agent</a> in another tab and sign in as a demo agent.</span></div></div>
    <section class="customer-widget"><header class="widget-header"><div class="widget-brand"><div class="brand-mark small">N</div><div><strong>Naheed Support</strong><small><i class="live-dot"></i> We’re here to help</small></div></div><span class="widget-more">•••</span></header><div id="customer-chat-messages" class="widget-messages"><div class="welcome-card"><div class="welcome-icon">✦</div><h2>Hi there! 👋</h2><p>Welcome to Naheed. How can we make your day easier?</p></div></div><div id="customer-typing" class="typing-line hidden">Naheed Support is typing…</div><form id="customer-start-form" class="customer-start-form"><label for="customer-name">Your name</label><input id="customer-name" placeholder="e.g. Ayesha Khan" required><label for="customer-email">Email <span>(optional)</span></label><input id="customer-email" type="email" placeholder="you@example.com"><button class="primary-btn full-btn" type="submit">Start chatting <span>→</span></button></form><form id="customer-message-form" class="widget-composer hidden"><textarea id="customer-message-input" rows="1" placeholder="Type your message…"></textarea><button type="submit" aria-label="Send message">↑</button></form><footer class="widget-footer">Powered by Naheed Support</footer></section></main>
    <script>window.__NAHEED_REVERB__ = { key: @json(config('broadcasting.connections.reverb.key')), host: @json(config('broadcasting.connections.reverb.options.host')), port: @json(config('broadcasting.connections.reverb.options.port')), scheme: @json(config('broadcasting.connections.reverb.options.scheme')) };</script>
    @vite(['resources/js/customer-chat.js'])
</body>
</html>
