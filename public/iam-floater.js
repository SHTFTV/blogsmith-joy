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
    el('span', { className: 'iamf-tab-kicker', text: 'PARTNERSHIPS', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-brand iamf-tab-eyespyr', text: 'EYESPYR', title: 'EyeSpyR — AI verification & live reputation', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-sep', text: '\u00B7', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-brand iamf-tab-talc', text: 'TALC.tv', title: 'TALC.tv — AI content distribution', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-sep', text: '\u00B7', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-brand iamf-tab-iam', text: 'IAM', title: 'IAM — Source-of-truth industry AI', 'aria-hidden': 'true' }),
    el('span', { className: 'iamf-tab-cta', text: 'Learn more', 'aria-hidden': 'true' }),
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

  // Top strip: ecosystem eyebrow + close
  var eyebrow = el('div', { className: 'iamf-eyebrow' }, [
    el('div', { className: 'iamf-eyebrow-copy' }, [
      el('span', { id: 'iamf-title', className: 'iamf-eyebrow-label', text: 'IAM ECO System' }),
      el('span', { className: 'iamf-eyebrow-sub', text: 'PARTNERSHIPS' })
    ]),
    el('button', { className: 'iamf-close', type: 'button', 'aria-label': 'Close partnerships panel', text: '\u00D7' })
  ]);

  // Brand data (long descriptions + address for modal)
  var BRANDS = {
    eyespyr: {
      cls: 'iamf-logo-eyespyr', mark: '\u25C9', word: 'EYESPYR', tag: 'Verification',
      short: 'AI business verification and live reputation scoring — every listing checked before it appears, watched every day after.',
      long: 'EyeSpyR is the verification engine behind the network. Every business is screened against public records, review signals, licensing databases and social footprint before it ever appears on a listing. After launch, EyeSpyR keeps watching — scoring reputation in real time, flagging fake reviews, and revoking trust badges automatically when standards slip. That means partners you contact through this network have been checked, and stay checked.',
      url: 'https://eyespyr.com',
      addr: 'EyeSpyR · Verification Desk\nIndustry Army Marketing Ecosystem\nweb: eyespyr.com'
    },
    talctv: {
      cls: 'iamf-logo-talc', mark: 'tv', word: 'TALC.tv', tag: 'Distribution',
      short: 'AI content distribution from a verified source. One post, rewritten for six platforms. $10 per post.',
      long: 'TALC.tv is the distribution layer. Write once and TALC rewrites, reformats and schedules the post across six platforms — each version tuned to the tone, length and format of its channel, and stamped with the verified source. It plugs directly into IAM territory listings so every post is credited to a real, verified operator. Flat rate: $10 per post, no seat fees, no lock-in.',
      url: 'https://talc.tv',
      addr: 'TALC.tv · Distribution Desk\nIndustry Army Marketing Ecosystem\nweb: talc.tv'
    },
    iam: {
      cls: 'iamf-logo-iam', mark: 'IA', word: 'IAM', tag: 'Source of Truth',
      short: 'The source-of-truth AI monitoring 100+ industry categories. Routes leads, flags talent, powers the network.',
      long: 'Industry Army Marketing (IAM) is the source-of-truth AI sitting behind every network property. It monitors 100+ industry categories, matches inbound demand to verified operators inside each territory, flags standout talent for the partnership desk, and powers the underlying data that EyeSpyR verifies and TALC.tv distributes. Territory alliances are issued through IAM and strictly limited per zone.',
      url: 'https://industryarmymarketing.com',
      addr: 'Industry Army Marketing · Partnership Desk\npartnerships@industryarmymarketing.com\nweb: industryarmymarketing.com'
    }
  };

  // Brand row: logo-style brand tiles + Coming Soon pill
  function brandTile(key) {
    var b = BRANDS[key];
    var hostname = b.url.replace(/^https?:\/\//, '');
    return el('button', {
      type: 'button', className: 'iamf-logo ' + b.cls,
      'data-iamf-brand': key, 'aria-expanded': 'false', 'aria-haspopup': 'true',
      'aria-label': b.word + ' — ' + b.tag + '. Tap for quick info, then View details.'
    }, [
      el('span', { className: 'iamf-logo-mark', text: b.mark, 'aria-hidden': 'true' }),
      el('span', { className: 'iamf-logo-word', text: b.word }),
      el('span', { className: 'iamf-logo-tip', role: 'tooltip' }, [
        el('span', { className: 'iamf-logo-tip-tag', text: b.tag }),
        el('span', { className: 'iamf-logo-tip-desc', text: b.short }),
        el('a', {
          className: 'iamf-logo-tip-addr',
          href: b.url, target: '_blank', rel: 'noopener noreferrer',
          'data-iamf-link': '1', 'data-iamf-partner': key,
          'data-iamf-partner-url': b.url,
          'data-iamf-partner-domain': hostname,
          text: hostname + ' \u2197'
        }),
        el('div', { className: 'iamf-logo-tip-actions' }, [
          el('button', {
            type: 'button', className: 'iamf-tip-copy',
            'data-iamf-copy': b.url, 'aria-label': 'Copy ' + hostname + ' to clipboard',
            text: 'Copy address'
          }),
          el('button', {
            type: 'button', className: 'iamf-tip-details',
            'data-iamf-open-modal': key,
            text: 'View details \u2192'
          })
        ])
      ])
    ]);
  }
  var brandRow = el('div', { className: 'iamf-brandrow' }, [
    el('div', { className: 'iamf-brandnames' }, [
      brandTile('eyespyr'),
      el('span', { className: 'iamf-bn-dot', text: '\u2022', 'aria-hidden': 'true' }),
      brandTile('talctv'),
      el('span', { className: 'iamf-bn-dot', text: '\u2022', 'aria-hidden': 'true' }),
      brandTile('iam')
    ]),
    el('span', { className: 'iamf-pill iamf-pill--blink' }, [
      el('span', { className: 'iamf-pill-dot', 'aria-hidden': 'true' }),
      el('span', { text: 'Coming Soon' })
    ])
  ]);

  // Brand details modal (overlays the panel)
  var modal = el('div', { className: 'iamf-modal', id: 'iamf-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'iamf-modal-title', 'aria-describedby': 'iamf-modal-body', hidden: true }, [
    el('div', { className: 'iamf-modal-inner' }, [
      el('button', { className: 'iamf-modal-close', type: 'button', 'aria-label': 'Close brand details', text: '\u00D7' }),
      el('span', { className: 'iamf-modal-tag', id: 'iamf-modal-tag' }),
      el('h3', { className: 'iamf-modal-title', id: 'iamf-modal-title' }),
      el('p', { className: 'iamf-modal-body', id: 'iamf-modal-body' }),
      el('div', { className: 'iamf-modal-addr' }, [
        el('span', { className: 'iamf-modal-addr-label', text: 'Address' }),
        el('pre', { className: 'iamf-modal-addr-text', id: 'iamf-modal-addr' })
      ]),
      el('div', { className: 'iamf-modal-actions' }, [
        el('button', {
          type: 'button', className: 'iamf-modal-copy', id: 'iamf-modal-copy',
          'aria-label': 'Copy address to clipboard', text: 'Copy address'
        }),
        el('a', {
          className: 'iamf-modal-link', id: 'iamf-modal-link',
          target: '_blank', rel: 'noopener noreferrer',
          'data-iamf-link': '1', 'data-iamf-partner': 'brand-modal',
          text: 'Visit site \u2197'
        })
      ])
    ])
  ]);

  var headline = el('h2', { className: 'iamf-headline', text: 'Secure Your Exclusive Territory Alliance' });
  var lede = el('p', { className: 'iamf-lede', text: "Want to find out more? Be creative and tell us why you think you might like to participate and learn more. The decoupled content syndication network and AI visual intelligence framework is actively locking down regional trade sectors — don't get frozen out of your market." });

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
  }, [eyebrow, brandRow, headline, lede, deskBlock, fineprint, modal]);


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

    // Brand tiles: tap to toggle tooltip open (works on touch + desktop)
    var tiles = panel.querySelectorAll('[data-iamf-brand]');
    function closeAllTips(except) {
      Array.prototype.forEach.call(tiles, function (t) {
        if (t !== except) { t.classList.remove('iamf-tip-open'); t.setAttribute('aria-expanded', 'false'); }
      });
    }
    Array.prototype.forEach.call(tiles, function (btn) {
      btn.addEventListener('click', function (e) {
        // Let inner interactive elements (link, copy, view-details) handle themselves
        if (e.target.closest && e.target.closest('a,button[data-iamf-open-modal],button[data-iamf-copy]')) return;
        var open = btn.classList.toggle('iamf-tip-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) { closeAllTips(btn); btn.focus(); }
      });
    });

    // View details buttons inside tooltip
    var detailBtns = panel.querySelectorAll('[data-iamf-open-modal]');
    Array.prototype.forEach.call(detailBtns, function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var key = b.getAttribute('data-iamf-open-modal');
        var tile = b.closest('[data-iamf-brand]');
        openBrandModal(key, tile);
      });
    });

    // Copy address buttons (tooltip + modal)
    function wireCopy(btn, getValue) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var value = getValue();
        var done = function () {
          var original = btn.textContent;
          btn.textContent = 'Copied \u2713';
          btn.classList.add('iamf-copied');
          setTimeout(function () { btn.textContent = original; btn.classList.remove('iamf-copied'); }, 1600);
          emit('iam_floater_click', { partner: 'copy', action: 'copy_address', value: value });
        };
        var fallback = function () {
          try {
            var ta = doc.createElement('textarea');
            ta.value = value; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
            doc.body.appendChild(ta); ta.select(); doc.execCommand('copy'); doc.body.removeChild(ta);
            done();
          } catch (err) {}
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done, fallback);
        } else fallback();
      });
    }
    Array.prototype.forEach.call(panel.querySelectorAll('[data-iamf-copy]'), function (b) {
      wireCopy(b, function () { return b.getAttribute('data-iamf-copy'); });
    });
    var modalCopy = modal.querySelector('#iamf-modal-copy');
    wireCopy(modalCopy, function () { return modalCopy.getAttribute('data-iamf-copy-value') || ''; });

    // Modal close
    var modalClose = modal.querySelector('.iamf-modal-close');
    modalClose.addEventListener('click', closeBrandModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeBrandModal(); });

    doc.addEventListener('keydown', function (e) {
      if (!root.classList.contains('iamf-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!modal.hidden) { closeBrandModal(); return; }
        // If a tile tooltip is open, close that first
        var openTile = panel.querySelector('.iamf-logo.iamf-tip-open');
        if (openTile) { openTile.classList.remove('iamf-tip-open'); openTile.setAttribute('aria-expanded','false'); openTile.focus(); return; }
        close();
        return;
      }
      // Modal-scoped focus trap when modal is open
      if (!modal.hidden) {
        if (e.key === 'Tab') {
          var mf = Array.prototype.slice.call(modal.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])'))
            .filter(function (n) { return !n.disabled && n.offsetParent !== null; });
          if (!mf.length) return;
          var mFirst = mf[0], mLast = mf[mf.length - 1];
          if (e.shiftKey && doc.activeElement === mFirst) { e.preventDefault(); mLast.focus(); }
          else if (!e.shiftKey && doc.activeElement === mLast) { e.preventDefault(); mFirst.focus(); }
        }
        return; // don't run panel-level tab/arrow logic when modal is up
      }
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
        var next = e.key === 'ArrowDown' ? (idx + 1) % f.length : (idx - 1 + f.length) % f.length;
        f[next].focus();
      }
    });

    doc.addEventListener('click', function (e) {
      if (root.classList.contains('iamf-open') && !root.contains(e.target)) close();
      // Close any open tile tooltip when clicking elsewhere inside the panel
      if (root.contains(e.target) && !e.target.closest('[data-iamf-brand]')) closeAllTips(null);
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

  var modalLastFocus = null;
  function openBrandModal(key, returnFocusEl) {
    var b = BRANDS[key]; if (!b) return;
    modal.querySelector('#iamf-modal-tag').textContent = b.tag;
    modal.querySelector('#iamf-modal-title').textContent = b.word;
    modal.querySelector('#iamf-modal-body').textContent = b.long;
    modal.querySelector('#iamf-modal-addr').textContent = b.addr;
    var link = modal.querySelector('#iamf-modal-link');
    link.href = b.url;
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('target', '_blank');
    link.setAttribute('data-iamf-partner', key);
    link.setAttribute('data-iamf-partner-url', b.url);
    link.setAttribute('data-iamf-partner-domain', b.url.replace(/^https?:\/\//, ''));
    delete link.dataset.iamfDecorated;
    decorate(link);
    var copyBtn = modal.querySelector('#iamf-modal-copy');
    copyBtn.setAttribute('data-iamf-copy-value', b.url);
    copyBtn.setAttribute('aria-label', 'Copy ' + b.url.replace(/^https?:\/\//, '') + ' to clipboard');
    copyBtn.textContent = 'Copy address';
    copyBtn.classList.remove('iamf-copied');
    modal.className = 'iamf-modal iamf-modal--' + key;
    // Return-focus target: the clicked brand tile (preferred) or previously focused element
    modalLastFocus = returnFocusEl || doc.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('iamf-modal-open'); });
    setTimeout(function () { modal.querySelector('.iamf-modal-close').focus(); }, 40);
    emit('iam_floater_click', { partner: key, partner_url: b.url, partner_domain: b.url.replace(/^https?:\/\//, ''), action: 'open_details' });
  }
  function closeBrandModal() {
    if (modal.hidden) return;
    modal.classList.remove('iamf-modal-open');
    setTimeout(function () { modal.hidden = true; }, 200);
    if (modalLastFocus && modalLastFocus.focus) modalLastFocus.focus();
  }


  // Public API
  window.IAMFloater = {
    open: open, close: close, toggle: toggle,
    disable: function () { window.IAM_FLOATER_DISABLED = true; if (root.parentNode) root.parentNode.removeChild(root); },
    on: function (name, cb) { doc.addEventListener('iamf:' + name, cb); }
  };
})();
