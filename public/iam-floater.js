/*!
 * IAM Network Three-Pack Floater — universal loader (CSP-friendly)
 *
 * Drop-in: <script src="/iam-floater.js" defer></script>
 *
 * Standardised tracking schema — fired to gtag / plausible / dataLayer:
 *   event names:  iam_floater_open, iam_floater_close, iam_floater_click
 *   payload:      { event, network:'iam', site, host, partner, partner_url,
 *                   placement:'floater', campaign:'iam_three_pack',
 *                   session_id, ts }
 *
 * Disable globally without editing pages:
 *   window.IAM_FLOATER_DISABLED = true                   (before this script)
 *   <meta name="iam-floater" content="disabled">         (in <head>)
 *   <html data-iam-floater="off">                        (or on <body>)
 *   URL:  ?iam_floater=off        localStorage.iamFloater = 'off'
 *   CSS:  html.no-iam-floater     (matched at load time)
 *
 * CSP: script/style loaded as external files. If a nonce is required,
 *  set <script src="/iam-floater.js" defer data-nonce="{NONCE}">
 *  the loader propagates that nonce to the injected <link>.
 */
(function () {
  'use strict';

  // ── Disable checks ─────────────────────────────────────────────
  var doc = document;
  var html = doc.documentElement;
  var body = doc.body;
  function disabled() {
    if (window.IAM_FLOATER_DISABLED === true) return true;
    if (html && (html.dataset.iamFloater === 'off' || html.classList.contains('no-iam-floater'))) return true;
    if (body && body.dataset && body.dataset.iamFloater === 'off') return true;
    var meta = doc.querySelector('meta[name="iam-floater"]');
    if (meta && /^(off|disabled|false|0)$/i.test(meta.getAttribute('content') || '')) return true;
    try {
      if (/[?&]iam_floater=off\b/i.test(location.search)) return true;
      if (typeof localStorage !== 'undefined' && localStorage.getItem('iamFloater') === 'off') return true;
    } catch (e) {}
    return false;
  }
  if (disabled()) return;
  if (doc.getElementById('iamf-root')) return; // already rendered

  // ── Locate own script + nonce ──────────────────────────────────
  var selfScript = doc.currentScript || (function () {
    var s = doc.querySelectorAll('script[src*="iam-floater.js"]');
    return s[s.length - 1] || null;
  })();
  var nonce = (selfScript && (selfScript.nonce || selfScript.getAttribute('data-nonce'))) || '';
  var base  = (selfScript && selfScript.getAttribute('data-base')) ||
              (selfScript && selfScript.src ? selfScript.src.replace(/iam-floater\.js.*$/, '') : '/');

  // ── Inject stylesheet (external — CSP safe) ────────────────────
  if (!doc.querySelector('link[data-iamf-css]')) {
    var link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + 'iam-floater.css';
    link.setAttribute('data-iamf-css', '1');
    if (nonce) link.setAttribute('nonce', nonce);
    doc.head.appendChild(link);
  }

  // ── Site / session identity for tracking ───────────────────────
  var host = (location.hostname || '').replace(/^www\./, '');
  var site = host.split('.')[0] || 'iam-network';
  var sessionId = (function () {
    try {
      var k = 'iamf_sid';
      var v = sessionStorage.getItem(k);
      if (!v) { v = host + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem(k, v); }
      return v;
    } catch (e) { return host + '-' + Date.now().toString(36); }
  })();

  var PARTNERS = [
    { key: 'eyespyr', name: 'EyeSpyR',  domain: 'eyespyr.com',                url: 'https://eyespyr.com/',
      brandClass: 'iamf-brand--eyespyr', iconClass: '',                icon: '\uD83D\uDC41',
      tag: 'Verification',
      desc: 'AI business verification and live reputation scoring — every listing checked before it appears, watched every day after.' },
    { key: 'talctv',  name: 'Talc.tv',  domain: 'talc.tv',                    url: 'https://talc.tv/',
      brandClass: 'iamf-brand--talc',    iconClass: 'iamf-icon--talc', icon: 'Talc',
      tag: 'Distribution',
      desc: 'AI content distribution from a verified source. One post, rewritten for six platforms. $10 per post.' },
    { key: 'iam',     name: 'IAM',      domain: 'industryarmymarketing.com',  url: 'https://industryarmymarketing.com/',
      brandClass: 'iamf-brand--iam',     iconClass: 'iamf-icon--iam',  icon: 'I AM',
      tag: 'Source of Truth',
      desc: 'The source-of-truth AI monitoring 100+ industry categories. Routes leads, flags talent, powers the network.' }
  ];

  // ── Build DOM (no innerHTML with untrusted data) ───────────────
  function el(tag, attrs, kids) {
    var e = doc.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k]; // static strings only
      else if (k.slice(0, 5) === 'data-' || k.slice(0, 5) === 'aria-' || k === 'role') e.setAttribute(k, attrs[k]);
      else e[k] = attrs[k];
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  var root = el('aside', { id: 'iamf-root', 'aria-label': 'IAM Network partnerships' });

  var tab = el('button', {
    id: 'iamf-tab', type: 'button',
    'aria-controls': 'iamf-panel', 'aria-expanded': 'false', 'aria-haspopup': 'dialog',
    'aria-describedby': 'iamf-tip'
  }, [
    el('span', { className: 'iamf-tab-brand iamf-tab-eyespyr', text: 'EYESPYR', title: 'EyeSpyR — AI verification & live reputation', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-sep', text: '\u00B7', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-brand iamf-tab-talc', text: 'TALC', title: 'TALC.tv — AI content distribution', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-sep', text: '\u00B7', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-brand iamf-tab-iam', text: 'IAM', title: 'IAM — Source-of-truth industry AI', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-sr', text: 'Open EyeSpyR · TALC · IAM Network three-pack panel' }),
    el('span', { className: 'iamf-dot', 'aria-hidden': 'true' })
  ]);

  var tip = el('div', { id: 'iamf-tip', className: 'iamf-tip', role: 'tooltip' }, [
    el('div', { className: 'iamf-tip-row' }, [
      el('strong', { text: 'EYESPYR' }),
      el('span', { text: 'AI verification & live reputation' })
    ]),
    el('div', { className: 'iamf-tip-row' }, [
      el('strong', { text: 'TALC.tv' }),
      el('span', { text: 'AI content distribution' })
    ]),
    el('div', { className: 'iamf-tip-row' }, [
      el('strong', { text: 'IAM' }),
      el('span', { text: 'Source-of-truth industry AI' })
    ])
  ]);

  // Top strip: PARTNERSHIPS eyebrow + close
  var eyebrow = el('div', { className: 'iamf-eyebrow' }, [
    el('span', { id: 'iamf-title', className: 'iamf-eyebrow-label', text: 'PARTNERSHIPS' }),
    el('button', { className: 'iamf-close', type: 'button', 'aria-label': 'Close partnerships panel', text: '\u00D7' })
  ]);

  // Brand row: EYESPYR • TALC.tv • IAM  +  Coming Soon pill
  var brandRow = el('div', { className: 'iamf-brandrow' }, [
    el('div', { className: 'iamf-brandnames' }, [
      el('span', { className: 'iamf-bn iamf-bn-eyespyr', text: 'EYESPYR' }),
      el('span', { className: 'iamf-bn-dot', text: '\u2022', 'aria-hidden': 'true' }),
      el('span', { className: 'iamf-bn iamf-bn-talc', text: 'TALC.tv' }),
      el('span', { className: 'iamf-bn-dot', text: '\u2022', 'aria-hidden': 'true' }),
      el('span', { className: 'iamf-bn iamf-bn-iam', text: 'IAM' })
    ]),
    el('span', { className: 'iamf-pill', text: 'Coming Soon' })
  ]);

  var headline = el('h2', { className: 'iamf-headline', text: 'Secure Your Exclusive Territory Alliance' });
  var lede = el('p', { className: 'iamf-lede', text: "The decoupled content syndication network and AI visual intelligence framework is actively locking down regional trade sectors. Don't get frozen out of your market." });

  // Partnership desk block
  var partnershipsEmail = 'partnerships@industryarmymarketing.com';
  var mailSubject = 'Weddings.io Technologies Ecosystem — Territory Alliance Inquiry';
  var mailBody = "Hi Industry Army Marketing,\n\nI'd like to learn more about the EyeSpyR / TALC.tv / IAM ecosystem and secure a territory.\n\n\u2022 Who I am:\n\u2022 What I do:\n\u2022 Territory / market:\n\nWhy I'd be a fit:\n\nThanks!";
  var deskBlock = el('div', { className: 'iamf-desk' }, [
    el('p', { className: 'iamf-desk-org', text: 'INDUSTRY ARMY MARKETING' }),
    el('p', { className: 'iamf-desk-label', text: 'Partnership Desk' }),
    el('a', {
      className: 'iamf-mailto',
      href: 'mailto:' + partnershipsEmail + '?subject=' + encodeURIComponent(mailSubject) + '&body=' + encodeURIComponent(mailBody),
      'data-iamf-link': '1', 'data-iamf-partner': 'partnerships-email',
      'data-iamf-partner-url': 'mailto:' + partnershipsEmail,
      'data-iamf-partner-domain': 'industryarmymarketing.com',
      text: partnershipsEmail
    })
  ]);

  var fineprint = el('p', { className: 'iamf-fineprint', text: 'Strictly limited to 3 non-competing trade leaders per zone.' });

  var panel = el('div', {
    id: 'iamf-panel', role: 'dialog', 'aria-modal': 'false',
    'aria-labelledby': 'iamf-title', hidden: true
  }, [eyebrow, brandRow, headline, lede, deskBlock, fineprint]);


  root.appendChild(tab);
  root.appendChild(tip);
  root.appendChild(panel);

  function mount() {
    if (disabled()) return;
    (doc.body || doc.documentElement).appendChild(root);
    wire();
  }
  if (doc.body) mount(); else doc.addEventListener('DOMContentLoaded', mount);

  // ── Tracking (standardised schema) ─────────────────────────────
  function baseEvent() {
    return {
      network: 'iam', placement: 'floater', campaign: 'iam_three_pack',
      site: site, host: host, session_id: sessionId, ts: Date.now()
    };
  }
  function emit(name, extra) {
    var payload = baseEvent();
    payload.event = name;
    if (extra) for (var k in extra) payload[k] = extra[k];
    try { if (window.gtag)      window.gtag('event', name, payload); } catch (e) {}
    try { if (window.plausible) window.plausible(name, { props: payload }); } catch (e) {}
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, payload)); } catch (e) {}
    // Public hook for custom handlers
    try { doc.dispatchEvent(new CustomEvent('iamf:' + name.replace(/^iam_floater_/, ''), { detail: payload })); } catch (e) {}
  }
  function decorate(a) {
    if (a.dataset.iamfDecorated) return;
    try {
      var u = new URL(a.href);
      u.searchParams.set('utm_source', site);
      u.searchParams.set('utm_medium', 'iam_floater');
      u.searchParams.set('utm_campaign', 'iam_three_pack');
      u.searchParams.set('utm_content', a.dataset.iamfPartner || 'link');
      u.searchParams.set('iamref', host + '|' + (a.dataset.iamfPartner || '') + '|' + sessionId);
      a.href = u.toString();
      a.dataset.iamfDecorated = '1';
    } catch (e) {}
  }

  // ── Behaviour: open/close/keyboard/focus-trap ──────────────────
  var lastFocus = null;
  function getFocusables() {
    var closeBtn = panel.querySelector('.iamf-close');
    var links = panel.querySelectorAll('[data-iamf-link]');
    return [closeBtn].concat(Array.prototype.slice.call(links)).filter(Boolean);
  }

  function wire() {
    var closeBtn = panel.querySelector('.iamf-close');
    var links = panel.querySelectorAll('[data-iamf-link]');

    Array.prototype.forEach.call(links, function (a) {
      decorate(a);
      a.addEventListener('click', function () {
        emit('iam_floater_click', {
          partner: a.dataset.iamfPartner,
          partner_url: a.dataset.iamfPartnerUrl,
          partner_domain: a.dataset.iamfPartnerDomain,
          href: a.href
        });
      });
    });

    tab.addEventListener('click', toggle);
    closeBtn.addEventListener('click', close);

    doc.addEventListener('keydown', function (e) {
      if (!root.classList.contains('iamf-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      var f = getFocusables();
      if (!f.length) return;
      if (e.key === 'Tab') {
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        var idx = f.indexOf(doc.activeElement);
        if (idx < 0) return;
        e.preventDefault();
        var next = e.key === 'ArrowDown'
          ? (idx + 1) % f.length
          : (idx - 1 + f.length) % f.length;
        f[next].focus();
      }
    });

    doc.addEventListener('click', function (e) {
      if (root.classList.contains('iamf-open') && !root.contains(e.target)) close();
    });
  }


  function open() {
    if (root.classList.contains('iamf-open')) return;
    lastFocus = doc.activeElement;
    root.classList.add('iamf-open');
    panel.hidden = false;
    tab.setAttribute('aria-expanded', 'true');
    emit('iam_floater_open');
    setTimeout(function () { var c = panel.querySelector('.iamf-close'); if (c) c.focus(); }, 60);
  }
  function close() {
    if (!root.classList.contains('iamf-open')) return;
    root.classList.remove('iamf-open');
    tab.setAttribute('aria-expanded', 'false');
    emit('iam_floater_close');
    setTimeout(function () { if (!root.classList.contains('iamf-open')) panel.hidden = true; }, 240);
    if (lastFocus && lastFocus.focus) lastFocus.focus(); else tab.focus();
  }
  function toggle() { root.classList.contains('iamf-open') ? close() : open(); }

  // Public API
  window.IAMFloater = {
    open: open, close: close, toggle: toggle,
    disable: function () { window.IAM_FLOATER_DISABLED = true; if (root.parentNode) root.parentNode.removeChild(root); },
    on: function (name, cb) { doc.addEventListener('iamf:' + name, cb); }
  };
})();
