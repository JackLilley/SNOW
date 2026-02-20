(function () {
  'use strict';

  /* ── SVG Icon System (Jelly-safe: no angle brackets in strings) ── */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var ICONS = {
    'layers':        [['polygon',{points:'12 2 2 7 12 12 22 7 12 2'}],['polyline',{points:'2 17 12 22 22 17'}],['polyline',{points:'2 12 12 17 22 12'}]],
    'trending-up':   [['polyline',{points:'23 6 13.5 15.5 8.5 10.5 1 18'}],['polyline',{points:'17 6 23 6 23 12'}]],
    'zap':           [['polygon',{points:'13 2 3 14 12 14 11 22 21 10 12 10 13 2'}]],
    'check-circle':  [['path',{d:'M22 11.08V12a10 10 0 1 1-5.93-9.14'}],['polyline',{points:'22 4 12 14.01 9 11.01'}]],
    'arrow-left':    [['line',{x1:'19',y1:'12',x2:'5',y2:'12'}],['polyline',{points:'12 19 5 12 12 5'}]],
    'arrow-right':   [['line',{x1:'5',y1:'12',x2:'19',y2:'12'}],['polyline',{points:'12 5 19 12 12 19'}]],
    'refresh-cw':    [['polyline',{points:'23 4 23 10 17 10'}],['polyline',{points:'1 20 1 14 7 14'}],['path',{d:'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15'}]],
    'download':      [['path',{d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}],['polyline',{points:'7 10 12 15 17 10'}],['line',{x1:'12',y1:'15',x2:'12',y2:'3'}]],
    'package':       [['line',{x1:'16.5',y1:'9.4',x2:'7.5',y2:'4.21'}],['path',{d:'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'}],['polyline',{points:'3.27 6.96 12 12.01 20.73 6.96'}],['line',{x1:'12',y1:'22.08',x2:'12',y2:'12'}]],
    'clock':         [['circle',{cx:'12',cy:'12',r:'10'}],['polyline',{points:'12 6 12 12 16 14'}]],
    'calendar':      [['rect',{x:'3',y:'4',width:'18',height:'18',rx:'2',ry:'2'}],['line',{x1:'16',y1:'2',x2:'16',y2:'6'}],['line',{x1:'8',y1:'2',x2:'8',y2:'6'}],['line',{x1:'3',y1:'10',x2:'21',y2:'10'}]],
    'list':          [['line',{x1:'8',y1:'6',x2:'21',y2:'6'}],['line',{x1:'8',y1:'12',x2:'21',y2:'12'}],['line',{x1:'8',y1:'18',x2:'21',y2:'18'}],['line',{x1:'3',y1:'6',x2:'3.01',y2:'6'}],['line',{x1:'3',y1:'12',x2:'3.01',y2:'12'}],['line',{x1:'3',y1:'18',x2:'3.01',y2:'18'}]],
    'check':         [['polyline',{points:'20 6 9 17 4 12'}]],
    'x':             [['line',{x1:'18',y1:'6',x2:'6',y2:'18'}],['line',{x1:'6',y1:'6',x2:'18',y2:'18'}]],
    'x-circle':      [['circle',{cx:'12',cy:'12',r:'10'}],['line',{x1:'15',y1:'9',x2:'9',y2:'15'}],['line',{x1:'9',y1:'9',x2:'15',y2:'15'}]],
    'alert-triangle':[['path',{d:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'}],['line',{x1:'12',y1:'9',x2:'12',y2:'13'}],['line',{x1:'12',y1:'17',x2:'12.01',y2:'17'}]],
    'shield':        [['path',{d:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'}]],
    'loader':        [['line',{x1:'12',y1:'2',x2:'12',y2:'6'}],['line',{x1:'12',y1:'18',x2:'12',y2:'22'}],['line',{x1:'4.93',y1:'4.93',x2:'7.76',y2:'7.76'}],['line',{x1:'16.24',y1:'16.24',x2:'19.07',y2:'19.07'}],['line',{x1:'2',y1:'12',x2:'6',y2:'12'}],['line',{x1:'18',y1:'12',x2:'22',y2:'12'}],['line',{x1:'4.93',y1:'19.07',x2:'7.76',y2:'16.24'}],['line',{x1:'16.24',y1:'7.76',x2:'19.07',y2:'4.93'}]],
    'search':        [['circle',{cx:'11',cy:'11',r:'8'}],['line',{x1:'21',y1:'21',x2:'16.65',y2:'16.65'}]],
    'clipboard':     [['path',{d:'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'}],['rect',{x:'8',y:'2',width:'8',height:'4',rx:'1',ry:'1'}]],
    'play':          [['polygon',{points:'5 3 19 12 5 21 5 3'}]],
    'activity':      [['polyline',{points:'22 12 18 12 15 21 9 3 6 12 2 12'}]],
    'bar-chart':     [['line',{x1:'12',y1:'20',x2:'12',y2:'10'}],['line',{x1:'18',y1:'20',x2:'18',y2:'4'}],['line',{x1:'6',y1:'20',x2:'6',y2:'16'}]],
    'ban':           [['circle',{cx:'12',cy:'12',r:'10'}],['line',{x1:'4.93',y1:'4.93',x2:'19.07',y2:'19.07'}]],
    'info':          [['circle',{cx:'12',cy:'12',r:'10'}],['line',{x1:'12',y1:'16',x2:'12',y2:'12'}],['line',{x1:'12',y1:'8',x2:'12.01',y2:'8'}]],
    'inbox':         [['polyline',{points:'22 12 16 12 14 15 10 15 8 12 2 12'}],['path',{d:'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'}]],
    'file-text':     [['path',{d:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'}],['polyline',{points:'14 2 14 8 20 8'}],['line',{x1:'16',y1:'13',x2:'8',y2:'13'}],['line',{x1:'16',y1:'17',x2:'8',y2:'17'}],['polyline',{points:'10 9 9 9 8 9'}]],
    'settings':      [['circle',{cx:'12',cy:'12',r:'3'}],['path',{d:'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'}]],
    'bell':          [['path',{d:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'}],['path',{d:'M13.73 21a2 2 0 0 1-3.46 0'}]],
    'toggle-left':   [['rect',{x:'1',y:'5',width:'22',height:'14',rx:'7',ry:'7'}],['circle',{cx:'8',cy:'12',r:'3'}]],
    'toggle-right':  [['rect',{x:'1',y:'5',width:'22',height:'14',rx:'7',ry:'7'}],['circle',{cx:'16',cy:'12',r:'3'}]],
    'sun':           [['circle',{cx:'12',cy:'12',r:'5'}],['line',{x1:'12',y1:'1',x2:'12',y2:'3'}],['line',{x1:'12',y1:'21',x2:'12',y2:'23'}],['line',{x1:'4.22',y1:'4.22',x2:'5.64',y2:'5.64'}],['line',{x1:'18.36',y1:'18.36',x2:'19.78',y2:'19.78'}],['line',{x1:'1',y1:'12',x2:'3',y2:'12'}],['line',{x1:'21',y1:'12',x2:'23',y2:'12'}],['line',{x1:'4.22',y1:'19.78',x2:'5.64',y2:'18.36'}],['line',{x1:'18.36',y1:'5.64',x2:'19.78',y2:'4.22'}]],
    'moon':          [['path',{d:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'}]],
    'chevron-down':  [['polyline',{points:'6 9 12 15 18 9'}]],
    'save':          [['path',{d:'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'}],['polyline',{points:'17 21 17 13 7 13 7 21'}],['polyline',{points:'7 3 7 8 15 8'}]]
  };

  function ic(name, size) {
    size = size || 16;
    var span = document.createElement('span');
    span.className = 'uc-icon';
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    (ICONS[name] || []).forEach(function(p) {
      var svgEl = document.createElementNS(SVG_NS, p[0]);
      var attrs = p[1];
      Object.keys(attrs).forEach(function(k) { svgEl.setAttribute(k, attrs[k]); });
      svg.appendChild(svgEl);
    });
    span.appendChild(svg);
    return span;
  }

  /* ── State ────────────────────────────────────────────────────────── */
  var BANNER_DEFAULTS = {
    enableInstalling: true,
    installingMsg: 'System maintenance in progress \u2014 application updates are being installed. Some apps may be temporarily unavailable.',
    enableComplete: true,
    completeMsg: 'System maintenance complete \u2014 all updates installed successfully.',
    completeDurationHrs: 2,
    enableScheduled: true,
    scheduledMsg: 'Scheduled maintenance \u2014 application updates will be installed on {time}.',
    scheduledLeadHrs: 24
  };
  var S = {
    view: 'dashboard', updates: [], loading: true, error: null, lastRefresh: null,
    installing: false, batchId: null, installQueue: [], selected: {},
    filter: 'all', search: '', pPct: 0, pState: 'Preparing...', pErr: '', pDone: false, logs: [], elapsed: 0,
    serverStart: null,
    bannerSettings: null
  };

  function loadBannerSettings() {
    try {
      var raw = localStorage.getItem('uc_banner_settings');
      if (raw) { S.bannerSettings = JSON.parse(raw); return; }
    } catch(e) {}
    S.bannerSettings = JSON.parse(JSON.stringify(BANNER_DEFAULTS));
  }
  function saveBannerSettings() {
    try { localStorage.setItem('uc_banner_settings', JSON.stringify(S.bannerSettings)); } catch(e) {}
  }
  var clientStart = 0, pollT = null, tickT = null, searchTimer = null;

  /* ── API Helpers ──────────────────────────────────────────────────── */
  var _cachedToken = '';
  function getToken() {
    if (_cachedToken) return _cachedToken;
    var root = document.getElementById('ucRoot');
    if (root && root.getAttribute('data-ck')) { _cachedToken = root.getAttribute('data-ck'); return _cachedToken; }
    if (window.g_ck) { _cachedToken = window.g_ck; return _cachedToken; }
    if (window.NOW && window.NOW.g_ck) { _cachedToken = window.NOW.g_ck; return _cachedToken; }
    try { var m = document.cookie.match(/g_ck=([^;]+)/); if (m) { _cachedToken = m[1]; return _cachedToken; } } catch(e){}
    return '';
  }
  function hdrs() {
    var t = getToken();
    var h = { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
    if (t) h['X-UserToken'] = t;
    return h;
  }
  function api(url, opts) {
    return fetch(url, Object.assign({ headers: hdrs(), credentials: 'same-origin' }, opts || {}))
      .then(function(r) {
        if (r.status === 401) throw new Error('Session expired. Please refresh the page.');
        if (!r.ok) return r.json().catch(function(){return{};}).then(function(e){throw new Error((e.error&&e.error.message)||'HTTP '+r.status);});
        return r.json();
      });
  }
  function fv(f) { return f && (f.value !== undefined ? f.value : f); }
  function fd(f) { return f && (f.display_value !== undefined ? f.display_value : fv(f)); }
  function cmpVer(a, b) { var f = (a || '0.0.0').split('.'), t = (b || '0.0.0').split('.'); if (f[0] !== t[0]) return 'major'; if (f[1] !== t[1]) return 'minor'; return 'patch'; }
  function risk(l) { return l === 'major' ? 'high' : l === 'minor' ? 'medium' : 'low'; }
  function fmtDur(s) { if (60 > s) return s + 's'; var m = Math.floor(s / 60), r = s % 60; if (60 > m) return m + 'm ' + r + 's'; return Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  /* ── Data Fetching ────────────────────────────────────────────────── */
  function getUpdates() {
    return api('/api/now/table/sys_store_app?sysparm_display_value=all&sysparm_fields=sys_id,name,scope,version,vendor,active&sysparm_query=active=true^update_available=true^ORDERBYname')
      .then(function(d) {
        var apps = d.result || [];
        return Promise.all(apps.map(function(app) {
          return api('/api/now/table/sys_app_version?sysparm_display_value=all&sysparm_fields=sys_id,version,source_app_id,publish_date&sysparm_query=source_app_id=' + fv(app.sys_id) + '^ORDERBYversion')
            .then(function(v) { return { app: app, ver: v.result || [] }; }).catch(function() { return { app: app, ver: [] }; });
        }));
      }).then(function(res) {
        return res.filter(function(r) { return r.ver.length > 0; }).map(function(r) {
          var a = r.app, l = r.ver[r.ver.length - 1], iv = fv(a.version), lv = fv(l.version), lev = cmpVer(iv, lv);
          return { id: fv(a.sys_id), name: fd(a.name), scope: fv(a.scope), iv: iv, lv: lv, lvId: fv(l.sys_id), level: lev, risk: risk(lev), vendor: fd(a.vendor) || 'ServiceNow', date: fd(l.publish_date) || '' };
        });
      });
  }

  /* ── Server Calls (via fetch to avoid XMLHttpRequest auth popups) ── */
  function callScriptInclude(method, params) {
    var qs = 'sysparm_name=' + encodeURIComponent(method);
    Object.keys(params).forEach(function(k) { qs += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); });
    return api('/api/now/sp/widget/widget_rq?id=x_g_s7s_updater.UpdateCenterInstaller&' + qs)
      .then(function(d) { return d.result || null; })
      .catch(function() { return null; });
  }

  function fireInstallAjax(apps) {
    var payload = JSON.stringify(apps.map(function(a) { return { id: a.id, name: a.name, lv: a.lv, iv: a.iv }; }));
    var bs = S.bannerSettings || BANNER_DEFAULTS;
    if (typeof GlideAjax !== 'undefined') {
      try {
        var ga = new GlideAjax('x_g_s7s_updater.UpdateCenterInstaller');
        ga.addParam('sysparm_name', 'installBatch');
        ga.addParam('sysparm_apps', payload);
        ga.addParam('sysparm_banner_settings', JSON.stringify(bs));
        ga.getXMLAnswer(function(answer) { if (answer && answer.length > 10 && !S.batchId) { S.batchId = answer; addLog('GlideAjax returned worker ID', 'success'); } });
      } catch (e) { console.error('[UC] GlideAjax error:', e); }
    }
  }

  function fireScheduleAjax(apps, schedTime, cb) {
    var bs = S.bannerSettings || BANNER_DEFAULTS;
    if (typeof GlideAjax !== 'undefined') {
      try {
        var ga = new GlideAjax('x_g_s7s_updater.UpdateCenterInstaller');
        ga.addParam('sysparm_name', 'scheduleInstall');
        ga.addParam('sysparm_apps', JSON.stringify(apps.map(function(a) { return { id: a.id, name: a.name, lv: a.lv, iv: a.iv }; })));
        ga.addParam('sysparm_schedule_time', schedTime);
        ga.addParam('sysparm_banner_settings', JSON.stringify(bs));
        ga.getXMLAnswer(function(answer) { cb(answer); });
      } catch (e) { cb(null); }
    } else { cb(null); }
  }

  function fireCancelAjax(workerId, cb) {
    if (typeof GlideAjax !== 'undefined') {
      try {
        var ga = new GlideAjax('x_g_s7s_updater.UpdateCenterInstaller');
        ga.addParam('sysparm_name', 'cancelScheduled');
        ga.addParam('sysparm_worker_id', workerId);
        ga.getXMLAnswer(function(answer) { cb(answer === 'cancelled'); });
      } catch (e) { cb(false); }
    } else { cb(false); }
  }

  function findRecentWorker() {
    var q = 'nameSTARTSWITHUpdate Center^ORDERBYDESCsys_created_on';
    return api('/api/now/table/sys_progress_worker?sysparm_display_value=all&sysparm_fields=sys_id,state,name,sys_created_on&sysparm_query=' + encodeURIComponent(q) + '&sysparm_limit=1')
      .then(function(d) { var r = (d.result || [])[0]; return r ? fv(r.sys_id) : null; }).catch(function() { return null; });
  }

  function pollWorker(id) {
    return api('/api/now/table/sys_progress_worker/' + id + '?sysparm_display_value=all&sysparm_fields=sys_id,state,percent_complete,message,error_message,output_summary,sys_created_on')
      .then(function(d) { return d.result; });
  }

  /* ── DOM Helpers ──────────────────────────────────────────────────── */
  function el(t, a, c) {
    var e = document.createElement(t);
    if (a) Object.keys(a).forEach(function(k) {
      if (k === 'className') e.className = a[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.substring(2), a[k]);
      else if (k === 'disabled') { e.disabled = !!a[k]; }
      else if (k === 'checked') e.checked = a[k];
      else if (k === 'type' || k === 'placeholder' || k === 'value') e[k] = a[k];
      else e.setAttribute(k, a[k]);
    });
    if (c != null) {
      if (Array.isArray(c)) c.forEach(function(x) { if (x != null) e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
      else if (typeof c === 'string') e.textContent = c;
      else e.appendChild(c);
    }
    return e;
  }

  function backBtn(view) {
    return el('button', { className: 'uc-btn uc-btn-g', onclick: function() { nav(view || 'dashboard'); } }, [ic('arrow-left', 16), document.createTextNode(' Back')]);
  }

  /* ── Toast Notifications ─────────────────────────────────────────── */
  function toast(msg, type) {
    var container = document.getElementById('ucToasts');
    if (!container) return;
    type = type || 'info';
    var iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'info';
    var t = el('div', { className: 'uc-toast uc-toast-' + type }, [ic(iconName, 18), el('span', null, msg)]);
    container.appendChild(t);
    setTimeout(function() { t.classList.add('out'); setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }, 4000);
  }

  /* ── Nav ──────────────────────────────────────────────────────────── */
  function renderNav() {
    var n = document.getElementById('ucNav');
    if (!n) return;
    n.innerHTML = '';
    var brand = document.getElementById('ucBrand');
    if (brand && !brand._icSet) { brand.insertBefore(ic('layers', 18), brand.firstChild); brand._icSet = true; }
    var tabs = [
      ['dashboard', 'Dashboard', 'bar-chart'],
      ['updates', 'Updates', 'download'],
      ['scheduled', 'Scheduled', 'calendar'],
      ['history', 'History', 'clock'],
      ['settings', 'Settings', 'settings']
    ];
    tabs.forEach(function(t) {
      n.appendChild(el('button', {
        className: 'uc-nav-link' + (S.view === t[0] ? ' active' : ''),
        role: 'tab', 'aria-selected': S.view === t[0] ? 'true' : 'false',
        onclick: function() { nav(t[0]); }
      }, [ic(t[2], 14), document.createTextNode(t[1])]));
    });
    if (S.installing) {
      var spin = ic('loader', 14); spin.classList.add('uc-spin');
      n.appendChild(el('button', {
        className: 'uc-nav-link uc-nav-pulse', role: 'tab',
        'aria-selected': S.view === 'progress' ? 'true' : 'false',
        onclick: function() { nav('progress'); }
      }, [spin, document.createTextNode('Installing\u2026')]));
    }
  }

  function renderErr() {
    var e = document.getElementById('ucError');
    if (!e) return;
    if (S.error) { e.classList.remove('uc-hidden'); document.getElementById('ucErrTxt').textContent = S.error; }
    else e.classList.add('uc-hidden');
  }

  /* ── Dashboard ───────────────────────────────────────────────────── */
  function renderDash() {
    var u = S.updates, tot = u.length;
    var maj = u.filter(function(x) { return x.level === 'major'; }).length;
    var min = u.filter(function(x) { return x.level === 'minor'; }).length;
    var pat = u.filter(function(x) { return x.level === 'patch'; }).length;
    var hi = u.filter(function(x) { return x.risk === 'high' || x.risk === 'critical'; }).length;
    var vd = {}; u.forEach(function(x) { vd[x.vendor] = (vd[x.vendor] || 0) + 1; });
    var ve = Object.keys(vd).map(function(k) { return [k, vd[k]]; }).sort(function(a, b) { return b[1] - a[1]; });

    var refreshBtn = el('button', { className: 'uc-btn uc-btn-s', disabled: S.loading, onclick: refresh }, S.loading
      ? [ic('loader', 14), document.createTextNode(' Scanning\u2026')]
      : [ic('refresh-cw', 14), document.createTextNode(' Check for Updates')]);

    if (S.loading) refreshBtn.querySelector('.uc-icon').classList.add('uc-spin');

    return el('div', { className: 'uc-dash' }, [
      el('div', { className: 'uc-dash-hdr' }, [
        el('div', null, [
          el('h2', { className: 'uc-dash-title' }, 'Update Center'),
          S.lastRefresh ? el('span', { className: 'uc-dash-sub' }, [ic('clock', 12), document.createTextNode(' Last checked: ' + S.lastRefresh.toLocaleTimeString())]) : null
        ]),
        el('div', { className: 'uc-dash-acts' }, [
          refreshBtn,
          S.installing ? el('button', { className: 'uc-btn uc-btn-p', onclick: function() { nav('progress'); } }, [ic('activity', 14), document.createTextNode(' View Progress')]) : null
        ])
      ]),

      S.loading ? el('div', { className: 'uc-stats' }, [
        el('div', { className: 'uc-skel', style: 'height:140px' }),
        el('div', { className: 'uc-skel', style: 'height:140px' }),
        el('div', { className: 'uc-skel', style: 'height:140px' }),
        el('div', { className: 'uc-skel', style: 'height:140px' })
      ]) :
      el('div', { className: 'uc-stats' }, [
        el('button', { className: 'uc-stat uc-c-accent', onclick: function() { nav('updates'); } }, [
          el('div', { className: 'uc-stat-ic' }, ic('layers', 26)),
          el('div', { className: 'uc-stat-val' }, '' + tot),
          el('div', { className: 'uc-stat-lbl' }, 'Updates Available'),
          el('div', { className: 'uc-stat-hint' }, 'Click to view all')
        ]),
        el('div', { className: 'uc-stat uc-c-red' }, [
          el('div', { className: 'uc-stat-ic' }, ic('trending-up', 26)),
          el('div', { className: 'uc-stat-val' }, '' + maj),
          el('div', { className: 'uc-stat-lbl' }, 'Major'),
          el('div', { className: 'uc-stat-tag uc-tag-r' }, 'Breaking changes possible')
        ]),
        el('div', { className: 'uc-stat uc-c-blue' }, [
          el('div', { className: 'uc-stat-ic' }, ic('zap', 26)),
          el('div', { className: 'uc-stat-val' }, '' + min),
          el('div', { className: 'uc-stat-lbl' }, 'Minor'),
          el('div', { className: 'uc-stat-tag uc-tag-b' }, 'New features')
        ]),
        el('div', { className: 'uc-stat uc-c-green' }, [
          el('div', { className: 'uc-stat-ic' }, ic('check-circle', 26)),
          el('div', { className: 'uc-stat-val' }, '' + pat),
          el('div', { className: 'uc-stat-lbl' }, 'Patch'),
          el('div', { className: 'uc-stat-tag uc-tag-g' }, 'Bug fixes')
        ])
      ]),

      hi > 0 ? el('div', { className: 'uc-risk-ban' }, [
        ic('alert-triangle', 18),
        el('span', null, [el('strong', null, '' + hi), document.createTextNode(' update' + (hi > 1 ? 's' : '') + ' flagged as elevated risk.')])
      ]) : null,

      el('div', { className: 'uc-qa' }, [
        el('h3', null, 'Quick Actions'),
        el('div', { className: 'uc-qa-grid' }, [
          el('button', { className: 'uc-qa-card', disabled: tot === 0, onclick: function() { nav('updates'); } }, [
            el('div', { className: 'uc-qa-ic uc-qa-ic-blue' }, ic('package', 24)),
            el('div', null, [el('div', { className: 'uc-qa-title' }, 'Install Updates'), el('div', { className: 'uc-qa-desc' }, 'Select and batch install store app updates')])
          ]),
          el('button', { className: 'uc-qa-card', onclick: function() { nav('scheduled'); } }, [
            el('div', { className: 'uc-qa-ic uc-qa-ic-orange' }, ic('calendar', 24)),
            el('div', null, [el('div', { className: 'uc-qa-title' }, 'Scheduled Updates'), el('div', { className: 'uc-qa-desc' }, 'View and manage scheduled installations')])
          ]),
          el('button', { className: 'uc-qa-card', onclick: function() { nav('history'); } }, [
            el('div', { className: 'uc-qa-ic uc-qa-ic-green' }, ic('list', 24)),
            el('div', null, [el('div', { className: 'uc-qa-title' }, 'Installation History'), el('div', { className: 'uc-qa-desc' }, 'View past activity and release notes')])
          ])
        ])
      ]),

      ve.length > 0 ? el('div', { className: 'uc-vs' }, [
        el('h3', null, 'By Vendor'),
        el('div', { className: 'uc-vl' }, ve.map(function(v) {
          return el('div', { className: 'uc-vr' }, [el('span', { className: 'uc-vn' }, v[0]), el('span', { className: 'uc-vc' }, '' + v[1])]);
        }))
      ]) : null
    ]);
  }

  /* ── Update List ─────────────────────────────────────────────────── */
  function renderList() {
    var fl = S.updates.filter(function(u) {
      if (S.filter !== 'all' && u.level !== S.filter) return false;
      if (S.search) { var q = S.search.toLowerCase(); if (u.name.toLowerCase().indexOf(q) === -1 && u.scope.toLowerCase().indexOf(q) === -1) return false; }
      return true;
    });
    var sc = Object.keys(S.selected).filter(function(k) { return S.selected[k]; }).length;
    var allSel = fl.length > 0 && fl.every(function(u) { return S.selected[u.id]; });

    function levelDot(l) {
      return el('span', { className: 'uc-level-dot' }, [
        el('span', { className: 'uc-dot uc-dot-' + l }),
        document.createTextNode(l)
      ]);
    }

    return el('div', { className: 'uc-ul' }, [
      el('div', { className: 'uc-ul-hdr' }, [backBtn(), el('h2', null, 'Available Updates'), el('div', { style: 'width:60px' })]),
      el('div', { className: 'uc-toolbar' }, [
        el('div', { className: 'uc-search-wrap' }, [
          ic('search', 16),
          el('input', { type: 'text', className: 'uc-search', placeholder: 'Search apps\u2026', value: S.search, oninput: function(e) { S.search = e.target.value; clearTimeout(searchTimer); searchTimer = setTimeout(render, 150); } })
        ]),
        el('div', { className: 'uc-fg' }, ['all', 'major', 'minor', 'patch'].map(function(f) {
          return el('button', { className: 'uc-fb' + (S.filter === f ? ' active' : ''), onclick: function() { S.filter = f; render(); } },
            f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1));
        }))
      ]),
      el('div', { className: 'uc-sel-bar' }, [
        el('label', { className: 'uc-sel-lbl' }, [
          el('input', { type: 'checkbox', className: 'uc-check', checked: allSel, onchange: function() { fl.forEach(function(u) { S.selected[u.id] = !allSel; }); render(); } }),
          el('span', null, sc + ' of ' + S.updates.length + ' selected')
        ]),
        el('button', { className: 'uc-btn uc-btn-p', disabled: sc === 0 || S.loading, onclick: showDlg }, [ic('play', 14), document.createTextNode(' Install Selected (' + sc + ')')])
      ]),

      S.loading ? el('div', null, [0,1,2].map(function() { return el('div', { className: 'uc-skel', style: 'height:48px;margin-bottom:8px' }); }))
      : fl.length === 0 ? el('div', { className: 'uc-empty' }, [ic('inbox', 48), el('div', null, S.updates.length === 0 ? 'All apps are up to date!' : 'No updates match your filter.')])
      : el('div', { className: 'uc-tbl' }, [
          el('div', { className: 'uc-th' }, [
            el('div', { className: 'uc-cc' }), el('div', null, 'Application'), el('div', null, 'Installed'),
            el('div'), el('div', null, 'Available'), el('div', null, 'Type'), el('div', null, 'Risk'), el('div', null, 'Vendor')
          ])
        ].concat(fl.map(function(u) {
          return el('div', { className: 'uc-tr' + (S.selected[u.id] ? ' uc-sel' : '') }, [
            el('div', { className: 'uc-cc' }, el('input', { type: 'checkbox', className: 'uc-check', checked: !!S.selected[u.id], onchange: function() { S.selected[u.id] = !S.selected[u.id]; render(); } })),
            el('div', { className: 'uc-cn' }, [el('span', { className: 'uc-an' }, u.name), el('span', { className: 'uc-as' }, u.scope)]),
            el('div', { className: 'uc-mono' }, u.iv),
            el('div', { className: 'uc-ar' }, ic('arrow-right', 14)),
            el('div', { className: 'uc-mono' }, u.lv),
            el('div', null, levelDot(u.level)),
            el('div', null, el('span', { className: 'uc-rb uc-rb-' + u.risk }, u.risk)),
            el('div', { className: 'uc-cv' }, u.vendor)
          ]);
        })))
    ]);
  }

  /* ── Confirm Dialog ──────────────────────────────────────────────── */
  function showDlg() {
    var sel = S.updates.filter(function(u) { return S.selected[u.id]; });
    if (!sel.length) return;
    var mc = sel.filter(function(u) { return u.level === 'major'; }).length;
    var c = document.getElementById('ucDialog');
    c.innerHTML = '';
    var showSched = false;

    function rebuildDlg() {
      c.innerHTML = '';
      var dtInput;

      function presetBtn(label, hours) {
        var target = new Date(Date.now() + hours * 3600000);
        target.setMinutes(0, 0, 0);
        var iso = new Date(target.getTime() - target.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        var timeStr = target.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        return el('button', { className: 'uc-preset-btn', onclick: function() { if (dtInput) dtInput.value = iso; } }, [
          el('div', { className: 'uc-preset-lbl' }, label),
          el('div', { className: 'uc-preset-time' }, timeStr)
        ]);
      }

      var now = new Date();
      var tonight = new Date(now); tonight.setHours(22, 0, 0, 0);
      if (tonight.getTime() - Date.now() < 1800000) tonight.setDate(tonight.getDate() + 1);
      var tonightHrs = Math.max(1, Math.round((tonight.getTime() - Date.now()) / 3600000));

      var tomorrow6 = new Date(now); tomorrow6.setDate(tomorrow6.getDate() + 1); tomorrow6.setHours(6, 0, 0, 0);
      var tom6Hrs = Math.max(1, Math.round((tomorrow6.getTime() - Date.now()) / 3600000));

      var presets = el('div', { className: 'uc-presets' }, [
        el('div', { className: 'uc-presets-title' }, 'Quick schedule:'),
        el('div', { className: 'uc-presets-grid' }, [
          presetBtn('In 2 Hours', 2),
          presetBtn('In 4 Hours', 4),
          presetBtn('Tonight 10 PM', tonightHrs),
          presetBtn('Tomorrow 6 AM', tom6Hrs),
          presetBtn('In 12 Hours', 12),
          presetBtn('In 24 Hours', 24)
        ])
      ]);

      var schedSection = el('div', { className: 'uc-dlg-sched', style: showSched ? '' : 'display:none' }, [
        presets,
        el('div', { className: 'uc-presets-divider' }, [el('span', null, 'or pick a specific time')]),
        el('label', null, 'Date & time:'),
        dtInput = el('input', { type: 'datetime-local', className: 'uc-dt-input' })
      ]);
      var minDt = new Date(Date.now() + 300000).toISOString().slice(0, 16);
      setTimeout(function() { if (dtInput) dtInput.min = minDt; }, 0);

      c.appendChild(el('div', { className: 'uc-overlay', role: 'dialog', 'aria-modal': 'true', onclick: function() { c.innerHTML = ''; } },
        el('div', { className: 'uc-dlg', onclick: function(e) { e.stopPropagation(); } }, [
          el('h3', { className: 'uc-dlg-title' }, showSched ? 'Schedule Installation' : 'Confirm Batch Installation'),
          el('p', { className: 'uc-dlg-sub' }, [
            document.createTextNode(showSched ? 'Schedule ' : 'Install '),
            el('strong', null, '' + sel.length),
            document.createTextNode(' update' + (sel.length > 1 ? 's' : '') + (showSched ? ' for a future date/time.' : ' now.'))
          ]),
          mc > 0 ? el('div', { className: 'uc-dlg-warn' }, [ic('alert-triangle', 16), el('span', null, mc + ' major update' + (mc > 1 ? 's' : '') + '. May contain breaking changes.')]) : null,
          el('div', { className: 'uc-dlg-list' }, sel.map(function(u) {
            return el('div', { className: 'uc-dlg-item' }, [
              el('span', { className: 'uc-dlg-name' }, u.name),
              el('span', { className: 'uc-dlg-ver' }, [document.createTextNode(u.iv + ' '), ic('arrow-right', 12), document.createTextNode(' ' + u.lv)]),
              el('span', { className: 'uc-dlg-lvl uc-lv-' + u.level }, u.level)
            ]);
          })),
          schedSection,
          el('div', { className: 'uc-dlg-acts' }, [
            el('button', { className: 'uc-btn uc-btn-s', onclick: function() { c.innerHTML = ''; } }, 'Cancel'),
            showSched
              ? el('button', { className: 'uc-btn uc-btn-s', onclick: function() { showSched = false; rebuildDlg(); } }, [ic('arrow-left', 14), document.createTextNode(' Back')])
              : el('button', { className: 'uc-btn uc-btn-s', onclick: function() { showSched = true; rebuildDlg(); } }, [ic('calendar', 14), document.createTextNode(' Schedule for Later')]),
            showSched
              ? el('button', { className: 'uc-btn uc-btn-p', onclick: function() {
                  var v = dtInput ? dtInput.value : '';
                  if (!v) { toast('Please select a date and time.', 'warning'); return; }
                  var dt = new Date(v);
                  var snDt = dt.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/(\d+)\/(\d+)\/(\d+),\s*/, '$3-$1-$2 ');
                  c.innerHTML = '';
                  doSchedule(sel, snDt, v);
                } }, [ic('calendar', 14), document.createTextNode(' Confirm Schedule')])
              : el('button', { className: 'uc-btn uc-btn-p', onclick: function() { c.innerHTML = ''; doInstall(sel); } }, [ic('play', 14), document.createTextNode(' Install Now')])
          ])
        ])
      ));
    }
    rebuildDlg();
  }

  function doSchedule(sel, snDt, localDt) {
    addLog('Scheduling ' + sel.length + ' update' + (sel.length > 1 ? 's' : '') + ' for ' + localDt + '...');
    fireScheduleAjax(sel, snDt, function(answer) {
      if (answer && answer.length > 2) {
        S.error = null;
        addLog('Updates scheduled successfully!', 'success');
        toast('Updates scheduled successfully!', 'success');
        nav('scheduled');
      } else {
        S.error = 'Failed to schedule updates.';
        toast('Failed to schedule updates.', 'error');
        render();
      }
    });
  }

  /* ── Progress Monitor ────────────────────────────────────────────── */
  function renderProg() {
    var f = S.pDone, e = S.pErr;
    var sc = f ? (e ? 'var(--uc-red)' : 'var(--uc-green)') : 'var(--uc-accent)';
    var stateIcon = f ? (e ? ic('x-circle', 20) : ic('check-circle', 20)) : ic('loader', 20);
    if (!f) stateIcon.classList.add('uc-spin');

    return el('div', { className: 'uc-pm' }, [
      el('div', { className: 'uc-pm-hdr' }, [
        backBtn(), el('h2', null, 'Installation Progress'),
        el('div', { className: 'uc-timer' }, [ic('clock', 14), document.createTextNode(' ' + fmtDur(S.elapsed))])
      ]),
      el('div', { className: 'uc-pcard' }, [
        el('div', { className: 'uc-prow' }, [
          el('div', { className: 'uc-pstate', style: 'color:' + sc }, [stateIcon, document.createTextNode(' ' + (f ? (e ? 'Failed' : 'Complete') : S.pState))]),
          el('div', { className: 'uc-ppct' }, S.pPct + '%')
        ]),
        el('div', { className: 'uc-ptrack' }, el('div', { className: 'uc-pfill' + (f && !e ? ' done' : '') + (e ? ' err' : ''), style: 'width:' + S.pPct + '%' })),
        e ? el('div', { className: 'uc-perr' }, [ic('alert-triangle', 16), el('span', null, e)]) : null
      ]),
      el('div', null, [
        el('h3', { className: 'uc-sec' }, 'Applications (' + S.installQueue.length + ')'),
        el('div', { className: 'uc-pills' }, S.installQueue.map(function(u) {
          return el('div', { className: 'uc-pill' }, [el('b', null, u.name), el('span', null, u.iv + ' \u2192 ' + u.lv)]);
        }))
      ]),
      el('div', null, [
        el('h3', { className: 'uc-sec' }, 'Activity Log'),
        el('div', { className: 'uc-log', id: 'ucLog' },
          S.logs.length === 0 ? [el('div', { className: 'uc-log-empty' }, 'Waiting for activity\u2026')]
          : S.logs.map(function(l) { return el('div', { className: 'uc-le uc-le-' + l.type }, [el('span', { className: 'uc-le-t' }, l.time), el('span', { className: 'uc-le-m' }, l.message)]); })
        )
      ]),
      f ? el('div', { className: 'uc-pdone' }, [
        el('button', { className: 'uc-btn uc-btn-s', onclick: function() { nav('dashboard'); } }, [ic('bar-chart', 14), document.createTextNode(' Return to Dashboard')]),
        el('button', { className: 'uc-btn uc-btn-p', onclick: function() { nav('updates'); } }, [ic('refresh-cw', 14), document.createTextNode(' Check for More Updates')])
      ]) : null
    ]);
  }

  /* ── History ─────────────────────────────────────────────────────── */
  function renderHist() {
    var c = el('div', null, [
      el('div', { className: 'uc-fhdr' }, [backBtn(), el('h2', null, 'Installation History'), el('button', { className: 'uc-btn uc-btn-s', onclick: loadHist }, [ic('refresh-cw', 14), document.createTextNode(' Refresh')])]),
      el('div', { id: 'ucHist' }, el('div', null, [0, 1, 2].map(function() { return el('div', { className: 'uc-skel', style: 'height:64px;margin-bottom:8px' }); })))
    ]);
    loadHist(); return c;
  }

  function loadHist() {
    var q = 'nameSTARTSWITHUpdate Center^ORDERBYDESCsys_created_on';
    api('/api/now/table/sys_progress_worker?sysparm_display_value=all&sysparm_fields=sys_id,name,state,percent_complete,message,output_summary,sys_created_on&sysparm_query=' + encodeURIComponent(q) + '&sysparm_limit=50')
      .then(function(d) {
        var es = (d.result || []).map(function(r) {
          var stRaw = ('' + (fv(r.state) || '')).toLowerCase();
          var stDisp = ('' + (fd(r.state) || '')).toLowerCase();
          var sLabel = fd(r.state) || fv(r.state) || 'Unknown';
          var cls = (stRaw === '2' || stDisp.indexOf('complete') > -1 || stDisp.indexOf('success') > -1) ? 'uc-s-ok'
            : (stRaw === '3' || stRaw === '4' || stDisp.indexOf('fail') > -1 || stDisp.indexOf('error') > -1) ? 'uc-s-err'
            : (stRaw === '1' || stDisp.indexOf('running') > -1) ? 'uc-s-run' : 'uc-s-oth';
          var summary = fv(r.output_summary) || '';
          var hasNotes = false;
          try { var p = JSON.parse(summary); hasNotes = p && p.type === 'release_notes' && p.apps; } catch(e) {}
          return { id: fv(r.sys_id), name: fd(r.name) || 'Unknown', state: sLabel, cls: cls, msg: fd(r.message) || '', created: fd(r.sys_created_on) || '', hasNotes: hasNotes, summary: summary };
        });
        var h = document.getElementById('ucHist');
        if (!h) return;
        h.innerHTML = '';
        if (!es.length) { h.appendChild(el('div', { className: 'uc-empty' }, [ic('inbox', 48), el('div', null, 'No installation history found.')])); return; }
        h.appendChild(el('div', { className: 'uc-fl' }, es.map(function(e) {
          var iconName = e.cls === 'uc-s-ok' ? 'check' : e.cls === 'uc-s-err' ? 'x' : e.cls === 'uc-s-run' ? 'loader' : 'clock';
          return el('div', { className: 'uc-fi ' + e.cls }, [
            el('div', { className: 'uc-fi-icon' }, ic(iconName, 16)),
            el('div', { className: 'uc-fi-body' }, [
              el('div', { className: 'uc-fi-name' }, e.name),
              el('div', { className: 'uc-fi-meta' }, [e.created ? el('span', null, e.created) : null, el('span', { className: 'uc-fi-st' }, e.state)]),
              e.msg ? el('div', { className: 'uc-fi-msg' }, e.msg) : null,
              e.hasNotes ? el('div', { className: 'uc-fi-acts' }, [
                el('button', { className: 'uc-btn uc-btn-xs uc-btn-s', onclick: (function(sum) { return function() { showReleaseNotes(sum); }; })(e.summary) }, [ic('file-text', 12), document.createTextNode(' Release Notes')])
              ]) : null
            ])
          ]);
        })));
      }).catch(function() {
        var h = document.getElementById('ucHist');
        if (h) { h.innerHTML = ''; h.appendChild(el('div', { className: 'uc-empty' }, [ic('x-circle', 48), el('div', null, 'Failed to load history.')])); }
      });
  }

  /* ── Scheduled ───────────────────────────────────────────────────── */
  function renderScheduled() {
    var c = el('div', null, [
      el('div', { className: 'uc-fhdr' }, [backBtn(), el('h2', null, 'Scheduled Updates'), el('button', { className: 'uc-btn uc-btn-s', onclick: function() { loadScheduledView(); } }, [ic('refresh-cw', 14), document.createTextNode(' Refresh')])]),
      el('div', { id: 'ucSched' }, el('div', null, [0, 1].map(function() { return el('div', { className: 'uc-skel', style: 'height:80px;margin-bottom:12px' }); })))
    ]);
    loadScheduledView(); return c;
  }

  function loadScheduledView() {
    var q = 'nameSTARTSWITHUpdate Center Scheduled^ORDERBYDESCsys_created_on';
    api('/api/now/table/sys_progress_worker?sysparm_display_value=all&sysparm_fields=sys_id,name,state,message,output_summary,sys_created_on&sysparm_query=' + encodeURIComponent(q) + '&sysparm_limit=50')
      .then(function(d) {
        var items = (d.result || []).map(function(r) {
          var stRaw = ('' + (fv(r.state) || '')).toLowerCase(), stDisp = ('' + (fd(r.state) || '')).toLowerCase();
          var isCancelled = stRaw === 'cancelled' || stRaw === '4' || stDisp.indexOf('cancel') > -1;
          var isDone = stRaw === '2' || stRaw === 'complete' || stDisp.indexOf('complete') > -1 || stDisp.indexOf('success') > -1;
          var isRunning = stRaw === '1' || stRaw === 'running' || stDisp.indexOf('running') > -1;
          var isPending = !isCancelled && !isDone && !isRunning;
          var meta = null; try { meta = JSON.parse(fv(r.output_summary) || ''); } catch(e) {}
          var apps = meta && meta.apps ? meta.apps : [];
          var schedTime = meta && meta.scheduled_time ? meta.scheduled_time : (fd(r.message) || '');
          var schedBy = meta && meta.scheduled_by ? meta.scheduled_by : '';
          return { id: fv(r.sys_id), name: fd(r.name) || 'Scheduled Install', schedTime: schedTime, schedBy: schedBy, apps: apps, isPending: isPending, isCancelled: isCancelled, isDone: isDone, isRunning: isRunning, state: fd(r.state) || fv(r.state) || '', created: fd(r.sys_created_on) || '' };
        });
        var h = document.getElementById('ucSched');
        if (!h) return;
        h.innerHTML = '';
        if (!items.length) { h.appendChild(el('div', { className: 'uc-empty' }, [ic('calendar', 48), el('div', null, 'No scheduled updates. Select updates and choose "Schedule for Later" to create one.')])); return; }
        items.forEach(function(it) {
          var statusTxt = it.isPending ? 'Pending' : it.isRunning ? 'Running' : it.isDone ? 'Completed' : it.isCancelled ? 'Cancelled' : it.state;
          var iconName = it.isPending ? 'clock' : it.isRunning ? 'loader' : it.isDone ? 'check' : 'x';
          var appList = it.apps.map(function(a) { return (a.name || a.id) + ' ' + a.iv + ' \u2192 ' + a.lv; }).join(', ');
          h.appendChild(el('div', { className: 'uc-sched-item' + (it.isCancelled ? ' uc-sched-cancelled' : '') }, [
            el('div', { className: 'uc-sched-icon' }, ic(iconName, 22)),
            el('div', { className: 'uc-sched-body' }, [
              el('div', { className: 'uc-sched-title' }, it.name),
              el('div', { className: 'uc-sched-time' }, [ic('calendar', 13), document.createTextNode(' ' + it.schedTime.replace('Scheduled for ', ''))]),
              it.apps.length ? el('div', { className: 'uc-sched-apps' }, appList) : null,
              it.schedBy ? el('div', { className: 'uc-sched-apps' }, 'Scheduled by: ' + it.schedBy) : null,
              el('div', { className: 'uc-sched-apps' }, 'Status: ' + statusTxt),
              it.isPending ? el('div', { className: 'uc-sched-acts' }, [
                el('button', { className: 'uc-btn uc-btn-xs uc-btn-r', onclick: (function(wid) { return function() {
                  if (!confirm('Cancel this scheduled install?')) return;
                  fireCancelAjax(wid, function(ok) {
                    if (ok) { addLog('Scheduled install cancelled.', 'success'); toast('Scheduled install cancelled.', 'success'); }
                    else { addLog('Failed to cancel.', 'warning'); toast('Failed to cancel scheduled install.', 'error'); }
                    loadScheduledView();
                  });
                }; })(it.id) }, [ic('ban', 12), document.createTextNode(' Cancel')])
              ]) : null
            ])
          ]));
        });
      }).catch(function() {
        var h = document.getElementById('ucSched');
        if (h) { h.innerHTML = ''; h.appendChild(el('div', { className: 'uc-empty' }, [ic('x-circle', 48), el('div', null, 'Failed to load scheduled updates.')])); }
      });
  }

  /* ── Release Notes Modal ─────────────────────────────────────────── */
  function showReleaseNotes(summaryJson) {
    var data; try { data = JSON.parse(summaryJson); } catch(e) { toast('No release notes data available.', 'warning'); return; }
    if (!data || !data.apps) { toast('No release notes data available.', 'warning'); return; }
    var c = document.getElementById('ucDialog');
    c.innerHTML = '';

    var succeeded = data.apps.filter(function(a) { return a.status === 'success'; });
    var failures = data.apps.filter(function(a) { return a.status !== 'success'; });
    var duration = '';
    if (data.startTime && data.endTime) {
      try { var ms = new Date(data.endTime).getTime() - new Date(data.startTime).getTime(); if (ms > 0) duration = fmtDur(Math.round(ms / 1000)); } catch(e) {}
    }

    function appDetailCard(a) {
      var ok = a.status === 'success';
      var expanded = { v: false };
      var detailEl = el('div', { className: 'uc-rn-detail', style: 'display:none' });
      var items = [];
      if (a.method) items.push(['Install method', a.method]);
      if (a.error) items.push(['Error', a.error]);
      items.push(['Version change', (a.from || '?') + ' \u2192 ' + (a.to || '?')]);
      items.forEach(function(pair) {
        detailEl.appendChild(el('div', { className: 'uc-rn-detail-row' }, [
          el('span', { className: 'uc-rn-detail-lbl' }, pair[0] + ':'),
          el('span', null, pair[1])
        ]));
      });

      var chevron = ic('chevron-down', 14);
      var card = el('div', { className: 'uc-rn-app-card' + (ok ? '' : ' uc-rn-app-fail') }, [
        el('button', { className: 'uc-rn-app-row', onclick: function() {
          expanded.v = !expanded.v;
          detailEl.style.display = expanded.v ? '' : 'none';
          chevron.style.transform = expanded.v ? 'rotate(180deg)' : '';
          card.classList.toggle('uc-rn-expanded', expanded.v);
        } }, [
          el('span', { className: ok ? 'uc-rn-ok' : 'uc-rn-fail', style: 'font-size:16px' }, ok ? '\u2713' : '\u2717'),
          el('span', { className: 'uc-rn-app-name' }, a.name),
          el('span', { className: 'uc-mono uc-rn-app-ver' }, (a.from || '') + ' \u2192 ' + (a.to || '')),
          chevron
        ]),
        detailEl
      ]);
      return card;
    }

    var copiedEl = el('span', { className: 'uc-rn-copied', style: 'visibility:hidden' }, [ic('check', 12), document.createTextNode(' Copied!')]);
    var sumText = data.completed + ' of ' + data.total + ' installed successfully' + (data.failed > 0 ? ', ' + data.failed + ' failed' : '');

    c.appendChild(el('div', { className: 'uc-overlay', role: 'dialog', 'aria-modal': 'true', onclick: function() { c.innerHTML = ''; } },
      el('div', { className: 'uc-rn-modal', onclick: function(e) { e.stopPropagation(); } }, [
        el('div', { className: 'uc-rn-hdr' }, [el('h3', null, 'Batch Release Notes'), el('button', { className: 'uc-btn uc-btn-g', onclick: function() { c.innerHTML = ''; } }, ic('x', 18))]),
        el('div', { className: 'uc-rn-stats' }, [
          el('div', { className: 'uc-rn-stat uc-rn-stat-total' }, [el('div', { className: 'uc-rn-stat-val' }, '' + data.total), el('div', { className: 'uc-rn-stat-lbl' }, 'Total')]),
          el('div', { className: 'uc-rn-stat uc-rn-stat-ok' }, [el('div', { className: 'uc-rn-stat-val' }, '' + data.completed), el('div', { className: 'uc-rn-stat-lbl' }, 'Succeeded')]),
          el('div', { className: 'uc-rn-stat uc-rn-stat-fail' }, [el('div', { className: 'uc-rn-stat-val' }, '' + data.failed), el('div', { className: 'uc-rn-stat-lbl' }, 'Failed')]),
          duration ? el('div', { className: 'uc-rn-stat uc-rn-stat-time' }, [el('div', { className: 'uc-rn-stat-val' }, duration), el('div', { className: 'uc-rn-stat-lbl' }, 'Duration')]) : null
        ]),
        el('div', { className: 'uc-rn-meta' }, [
          data.startTime ? el('span', null, [ic('clock', 13), document.createTextNode(' Started: ' + data.startTime)]) : null,
          data.endTime ? el('span', null, [ic('check-circle', 13), document.createTextNode(' Ended: ' + data.endTime)]) : null
        ]),
        el('div', { className: 'uc-rn-pre' }, [
          failures.length > 0 ? el('div', { className: 'uc-rn-group' }, [
            el('div', { className: 'uc-rn-group-hdr uc-rn-group-fail' }, [ic('x-circle', 14), el('span', null, 'Failed (' + failures.length + ')')]),
            el('div', null, failures.map(appDetailCard))
          ]) : null,
          succeeded.length > 0 ? el('div', { className: 'uc-rn-group' }, [
            el('div', { className: 'uc-rn-group-hdr uc-rn-group-ok' }, [ic('check-circle', 14), el('span', null, 'Succeeded (' + succeeded.length + ')')]),
            el('div', null, succeeded.map(appDetailCard))
          ]) : null
        ]),
        el('div', { className: 'uc-rn-summary' }, sumText),
        el('div', { className: 'uc-rn-acts' }, [
          copiedEl,
          el('button', { className: 'uc-btn uc-btn-s', onclick: function() {
            var txt = 'RELEASE NOTES\n' + (data.startTime ? 'Date: ' + data.startTime + '\n' : '') + '\n';
            data.apps.forEach(function(a) { txt += (a.status === 'success' ? '[OK] ' : '[FAIL] ') + a.name + ' ' + a.from + ' -> ' + a.to + (a.error ? ' (' + a.error + ')' : '') + '\n'; });
            txt += '\nSummary: ' + sumText;
            try { navigator.clipboard.writeText(txt); copiedEl.style.visibility = 'visible'; setTimeout(function() { copiedEl.style.visibility = 'hidden'; }, 2000); } catch(e) { prompt('Copy:', txt); }
          } }, [ic('clipboard', 14), document.createTextNode(' Copy to Clipboard')]),
          el('button', { className: 'uc-btn uc-btn-p', onclick: function() { c.innerHTML = ''; } }, 'Close')
        ])
      ])
    ));
  }

  /* ── Settings View ───────────────────────────────────────────────── */
  function renderSettings() {
    if (!S.bannerSettings) loadBannerSettings();
    var bs = S.bannerSettings;

    function toggleRow(label, desc, iconName, enabled, onToggle) {
      return el('div', { className: 'uc-set-row' }, [
        el('div', { className: 'uc-set-row-info' }, [
          el('div', { className: 'uc-set-row-ic' }, ic(iconName, 18)),
          el('div', null, [
            el('div', { className: 'uc-set-lbl' }, label),
            el('div', { className: 'uc-set-desc' }, desc)
          ])
        ]),
        el('button', { className: 'uc-toggle' + (enabled ? ' active' : ''), 'aria-pressed': enabled ? 'true' : 'false', onclick: onToggle },
          ic(enabled ? 'toggle-right' : 'toggle-left', 22))
      ]);
    }

    function fieldRow(label, value, onChange, opts) {
      opts = opts || {};
      if (opts.type === 'number') {
        return el('div', { className: 'uc-set-field' }, [
          el('label', null, label),
          el('div', { className: 'uc-set-num-wrap' }, [
            el('input', { type: 'number', className: 'uc-set-input uc-set-num', value: '' + value, oninput: function(e) { onChange(parseInt(e.target.value) || 1); } }),
            el('span', { className: 'uc-set-unit' }, opts.unit || '')
          ])
        ]);
      }
      return el('div', { className: 'uc-set-field' }, [
        el('label', null, label),
        el('textarea', { className: 'uc-set-input uc-set-textarea', value: value, oninput: function(e) { onChange(e.target.value); } }, value)
      ]);
    }

    return el('div', { className: 'uc-settings' }, [
      el('div', { className: 'uc-fhdr' }, [
        backBtn(),
        el('h2', null, 'Banner & Notification Settings'),
        el('button', { className: 'uc-btn uc-btn-p', onclick: function() { saveBannerSettings(); toast('Settings saved!', 'success'); } }, [ic('save', 14), document.createTextNode(' Save Settings')])
      ]),

      el('div', { className: 'uc-set-section' }, [
        el('div', { className: 'uc-set-section-hdr' }, [ic('bell', 18), el('h3', null, 'System Banners'), el('span', { className: 'uc-set-badge' }, 'sys_ui_announcement')]),
        el('p', { className: 'uc-set-section-desc' }, 'Configure banners that display across the top of ServiceNow for all logged-in users during update operations.'),

        el('div', { className: 'uc-set-card' }, [
          el('div', { className: 'uc-set-card-hdr uc-set-card-hdr-orange' }, [ic('activity', 16), el('span', null, 'Installing Banner')]),
          toggleRow('Show during installation', 'Display a warning banner while updates are being installed.', 'alert-triangle', bs.enableInstalling, function() { bs.enableInstalling = !bs.enableInstalling; render(); }),
          bs.enableInstalling ? fieldRow('Banner message:', bs.installingMsg, function(v) { bs.installingMsg = v; }) : null
        ]),

        el('div', { className: 'uc-set-card' }, [
          el('div', { className: 'uc-set-card-hdr uc-set-card-hdr-green' }, [ic('check-circle', 16), el('span', null, 'Completion Banner')]),
          toggleRow('Show after completion', 'Display a success banner after updates finish installing.', 'check-circle', bs.enableComplete, function() { bs.enableComplete = !bs.enableComplete; render(); }),
          bs.enableComplete ? fieldRow('Banner message:', bs.completeMsg, function(v) { bs.completeMsg = v; }) : null,
          bs.enableComplete ? fieldRow('Auto-dismiss after:', bs.completeDurationHrs, function(v) { bs.completeDurationHrs = v; }, { type: 'number', unit: 'hours' }) : null
        ]),

        el('div', { className: 'uc-set-card' }, [
          el('div', { className: 'uc-set-card-hdr uc-set-card-hdr-blue' }, [ic('calendar', 16), el('span', null, 'Scheduled Maintenance Banner')]),
          toggleRow('Show before scheduled install', 'Display an info banner before a scheduled maintenance window.', 'calendar', bs.enableScheduled, function() { bs.enableScheduled = !bs.enableScheduled; render(); }),
          bs.enableScheduled ? fieldRow('Banner message:', bs.scheduledMsg, function(v) { bs.scheduledMsg = v; }) : null,
          bs.enableScheduled ? fieldRow('Show banner this many hours before:', bs.scheduledLeadHrs, function(v) { bs.scheduledLeadHrs = v; }, { type: 'number', unit: 'hours before' }) : null
        ]),

        el('div', { className: 'uc-set-hint' }, [
          ic('info', 14),
          el('span', null, 'Use {count} for number of apps, {time} for scheduled time, and {user} for who triggered the action in banner messages.')
        ])
      ])
    ]);
  }

  /* ── Navigation & State ──────────────────────────────────────────── */
  function nav(v) { S.view = v; render(); }

  function refresh() {
    S.loading = true; S.error = null; render();
    getUpdates().then(function(d) { S.updates = d; S.lastRefresh = new Date(); }).catch(function(e) {
      S.error = 'Failed to load updates: ' + (e.message || 'Unknown');
      toast('Failed to load updates.', 'error');
    }).finally(function() { S.loading = false; render(); });
  }

  function saveSession() { try { sessionStorage.setItem('uc_session', JSON.stringify({ batchId: S.batchId, installQueue: S.installQueue, clientStart: clientStart })); } catch(e) {} }
  function clearSession() { try { sessionStorage.removeItem('uc_session'); } catch(e) {} }

  function addLog(m, t) {
    S.logs.push({ time: new Date().toLocaleTimeString(), message: m, type: t || 'info' });
    var logEl = document.getElementById('ucLog');
    if (logEl) {
      var entry = S.logs[S.logs.length - 1];
      if (S.logs.length === 1) logEl.innerHTML = '';
      logEl.appendChild(el('div', { className: 'uc-le uc-le-' + entry.type }, [el('span', { className: 'uc-le-t' }, entry.time), el('span', { className: 'uc-le-m' }, entry.message)]));
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  function isStateDone(p) {
    var raw = ('' + (fv(p.state) || '')).toLowerCase(), disp = ('' + (fd(p.state) || '')).toLowerCase();
    return raw === '2' || raw === 'complete' || raw === 'successful' || disp.indexOf('complete') > -1 || disp.indexOf('success') > -1;
  }
  function isStateFailed(p) {
    var raw = ('' + (fv(p.state) || '')).toLowerCase(), disp = ('' + (fd(p.state) || '')).toLowerCase();
    return raw === '3' || raw === '4' || raw === 'error' || raw === 'failed' || raw === 'cancelled' || disp.indexOf('error') > -1 || disp.indexOf('fail') > -1 || disp.indexOf('cancel') > -1;
  }

  /* ── Installation Flow ───────────────────────────────────────────── */
  function doInstall(sel) {
    S.installQueue = sel; S.installing = true; S.view = 'progress';
    S.pPct = 0; S.pState = 'Preparing\u2026'; S.pErr = ''; S.pDone = false; S.logs = [];
    S.elapsed = 0; S.serverStart = null; S.batchId = null;
    clientStart = Date.now();
    if (tickT) clearInterval(tickT);
    if (pollT) clearInterval(pollT);
    startTick(); render();
    toast('Starting batch installation (' + sel.length + ' app' + (sel.length > 1 ? 's' : '') + ')\u2026', 'info');

    setTimeout(function() {
      addLog('Triggering batch installation (' + sel.length + ' app' + (sel.length > 1 ? 's' : '') + ')\u2026');
      fireInstallAjax(sel);
      addLog('Install request sent to server');
      addLog('Searching for progress worker\u2026', 'info');
      searchForWorker(0);
    }, 100);
  }

  function startTick() {
    if (tickT) clearInterval(tickT);
    tickT = setInterval(function() {
      if (S.serverStart) S.elapsed = Math.floor((Date.now() - S.serverStart.getTime()) / 1000);
      else S.elapsed = Math.floor((Date.now() - clientStart) / 1000);
      var t = document.querySelector('.uc-timer');
      if (t) { t.innerHTML = ''; t.appendChild(ic('clock', 14)); t.appendChild(document.createTextNode(' ' + fmtDur(S.elapsed))); }
    }, 1000);
  }

  function searchForWorker(attempt) {
    if (S.batchId) { saveSession(); startPoll(); return; }
    findRecentWorker().then(function(id) {
      if (id) {
        S.batchId = id; saveSession();
        addLog('Found progress worker: ' + id.substring(0, 8) + '\u2026', 'success');
        startPoll();
      } else if (10 > attempt) {
        var delay = 3 > attempt ? 2000 : 3000;
        if (attempt > 0) addLog('Worker not found yet, retrying\u2026 (' + (attempt + 1) + '/10)', 'info');
        setTimeout(function() { searchForWorker(attempt + 1); }, delay);
      } else {
        addLog('Could not locate progress worker.', 'error');
        addLog('The install may have completed. Check History tab.', 'warning');
        S.pDone = true; S.pState = 'Unknown';
        if (tickT) clearInterval(tickT);
        clearSession(); render();
      }
    }).catch(function(e) {
      addLog('Search error: ' + e.message, 'warning');
      if (10 > attempt) setTimeout(function() { searchForWorker(attempt + 1); }, 3000);
    });
  }

  function startPoll() {
    var lastMsg = '';
    addLog('Monitoring installation progress\u2026', 'info');
    function doPoll() {
      if (!S.batchId) return;
      pollWorker(S.batchId).then(function(p) {
        var pct = parseInt(fv(p.percent_complete)) || 0;
        S.pPct = pct;
        var created = fd(p.sys_created_on);
        if (created && !S.serverStart) { try { S.serverStart = new Date(created); } catch(e) {} }
        var stateDisplay = fd(p.state) || fv(p.state) || 'Running';
        var msg = fd(p.message) || fv(p.message) || '';
        if (msg && msg !== lastMsg) { lastMsg = msg; addLog(msg); }
        S.pState = stateDisplay;
        if (isStateDone(p)) {
          clearInterval(pollT); if (tickT) clearInterval(tickT);
          S.pPct = 100; S.pDone = true;
          addLog('Batch installation completed!', 'success');
          toast('Installation completed successfully!', 'success');
          S.installing = false; S.batchId = null;
          clearSession(); render(); refresh();
        } else if (isStateFailed(p)) {
          clearInterval(pollT); if (tickT) clearInterval(tickT);
          S.pDone = true;
          var errMsg = fd(p.error_message) || fv(p.error_message) || 'Installation encountered an issue.';
          S.pErr = errMsg;
          addLog('Installation issue: ' + errMsg, 'error');
          toast('Installation failed: ' + errMsg, 'error');
          clearSession(); render();
        } else {
          updateProgressUI();
        }
      }).catch(function(e) { addLog('Poll error: ' + e.message, 'warning'); });
    }
    doPoll();
    pollT = setInterval(doPoll, 2500);
  }

  function updateProgressUI() {
    var pctEl = document.querySelector('.uc-ppct');
    if (pctEl) pctEl.textContent = S.pPct + '%';
    var fillEl = document.querySelector('.uc-pfill');
    if (fillEl) fillEl.style.width = S.pPct + '%';
    var stateEl = document.querySelector('.uc-pstate');
    if (stateEl) {
      stateEl.innerHTML = '';
      var si = ic('loader', 20); si.classList.add('uc-spin');
      stateEl.appendChild(si);
      stateEl.appendChild(document.createTextNode(' ' + S.pState));
    }
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  function render() {
    renderNav(); renderErr();
    var c = document.getElementById('ucContent');
    if (!c) return;
    c.innerHTML = '';
    if (S.view === 'dashboard') c.appendChild(renderDash());
    else if (S.view === 'updates') c.appendChild(renderList());
    else if (S.view === 'progress') c.appendChild(renderProg());
    else if (S.view === 'scheduled') c.appendChild(renderScheduled());
    else if (S.view === 'history') c.appendChild(renderHist());
    else if (S.view === 'settings') c.appendChild(renderSettings());
  }

  /* ── Session Resume ──────────────────────────────────────────────── */
  function resumeSession() {
    try {
      var raw = sessionStorage.getItem('uc_session');
      if (!raw) return false;
      var sess = JSON.parse(raw);
      if (!sess || typeof sess.batchId !== 'string' || !sess.batchId) return false;
      S.batchId = sess.batchId;
      S.installQueue = Array.isArray(sess.installQueue) ? sess.installQueue : [];
      S.installing = true; S.view = 'progress';
      S.pPct = 0; S.pState = 'Resuming\u2026'; S.pDone = false; S.pErr = ''; S.logs = [];
      clientStart = sess.clientStart || Date.now();
      startTick(); render();
      addLog('Resuming monitoring of active installation\u2026', 'info');
      startPoll();
      return true;
    } catch(e) { return false; }
  }

  /* ── Init ────────────────────────────────────────────────────────── */
  function init() {
    loadBannerSettings();
    var dismissBtn = document.getElementById('ucErrDismiss');
    if (dismissBtn) dismissBtn.addEventListener('click', function() { S.error = null; renderErr(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { var d = document.getElementById('ucDialog'); if (d && d.innerHTML) d.innerHTML = ''; } });
    if (!resumeSession()) { render(); refresh(); } else { refresh(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
