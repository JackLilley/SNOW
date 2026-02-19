// @ts-nocheck
(function () {
  'use strict';

  function detectTheme() {
    var root = document.querySelector('.uc-root');
    if (!root) return;
    var cs = getComputedStyle(document.documentElement);
    var hasPrimary = cs.getPropertyValue('--now-color--primary-1').trim();
    if (hasPrimary) return;

    var accent = null;
    try {
      var header = document.querySelector('.navbar-header,.navpage-header,.sn-polaris-header,[data-testid="chrome-header"]');
      if (header) {
        var bg = getComputedStyle(header).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') accent = bg;
      }
    } catch (e) {}

    if (!accent && window.NOW && window.NOW.brand_color) accent = window.NOW.brand_color;

    if (!accent) {
      try {
        var x = new XMLHttpRequest();
        x.open('GET', '/api/now/table/sys_properties?sysparm_query=name=css.base.color&sysparm_fields=value&sysparm_limit=1', false);
        var tk = (window.g_ck || (window.NOW && window.NOW.g_ck) || '');
        x.setRequestHeader('Accept', 'application/json');
        if (tk) x.setRequestHeader('X-UserToken', tk);
        x.send();
        if (x.status === 200) {
          var d = JSON.parse(x.responseText);
          if (d.result && d.result[0] && d.result[0].value) accent = d.result[0].value;
        }
      } catch (e) {}
    }

    if (accent) {
      root.style.setProperty('--uc-accent', accent);
      root.style.setProperty('--uc-blue', accent);
      try {
        var temp = document.createElement('div');
        temp.style.color = accent;
        document.body.appendChild(temp);
        var rgb = getComputedStyle(temp).color.match(/(\d+)/g);
        document.body.removeChild(temp);
        if (rgb && rgb.length >= 3) {
          var r = Math.max(0, parseInt(rgb[0]) - 20), g = Math.max(0, parseInt(rgb[1]) - 20), b = Math.max(0, parseInt(rgb[2]) - 20);
          root.style.setProperty('--uc-accent-h', 'rgb(' + r + ',' + g + ',' + b + ')');
        }
      } catch (e) {}
    }
  }

  var S = {
    view: 'dashboard', updates: [], loading: true, error: null, lastRefresh: null,
    installing: false, batchId: null, installQueue: [], selected: {},
    filter: 'all', search: '', pPct: 0, pState: 'Preparing...', pErr: '', pDone: false, logs: [], elapsed: 0,
    serverStart: null
  };
  var clientStart = 0, pollT = null, tickT = null, searchTimer = null;

  function getToken() {
    if (window.g_ck) return window.g_ck;
    if (window.NOW && window.NOW.g_ck) return window.NOW.g_ck;
    try { var m = document.cookie.match(/g_ck=([^;]+)/); if (m) return m[1]; } catch(e){}
    return '';
  }

  function hdrs() {
    var h = { Accept: 'application/json', 'Content-Type': 'application/json' };
    var t = getToken(); if (t) h['X-UserToken'] = t;
    return h;
  }

  function api(url, opts) {
    return fetch(url, Object.assign({ headers: hdrs(), credentials: 'same-origin' }, opts || {}))
      .then(function(r) {
        if (!r.ok) return r.json().catch(function(){return{};}).then(function(e){throw new Error((e.error&&e.error.message)||'HTTP '+r.status);});
        return r.json();
      });
  }

  function fv(f){return f&&(f.value!==undefined?f.value:f);}
  function fd(f){return f&&(f.display_value!==undefined?f.display_value:fv(f));}
  function cmpVer(a,b){var f=(a||'0.0.0').split('.'),t=(b||'0.0.0').split('.');if(f[0]!==t[0])return'major';if(f[1]!==t[1])return'minor';return'patch';}
  function risk(l){return l==='major'?'high':l==='minor'?'medium':'low';}
  function fmtDur(s){if(s<60)return s+'s';var m=Math.floor(s/60),r=s%60;if(m<60)return m+'m '+r+'s';return Math.floor(m/60)+'h '+(m%60)+'m';}

  function getUpdates() {
    return api('/api/now/table/sys_store_app?sysparm_display_value=all&sysparm_fields=sys_id,name,scope,version,vendor,active&sysparm_query=active=true^update_available=true^ORDERBYname')
      .then(function(d){
        var apps=d.result||[];
        return Promise.all(apps.map(function(app){
          return api('/api/now/table/sys_app_version?sysparm_display_value=all&sysparm_fields=sys_id,version,source_app_id,publish_date&sysparm_query=source_app_id='+fv(app.sys_id)+'^ORDERBYversion')
            .then(function(v){return{app:app,ver:v.result||[]};}).catch(function(){return{app:app,ver:[]};});
        }));
      }).then(function(res){
        return res.filter(function(r){return r.ver.length>0;}).map(function(r){
          var a=r.app,l=r.ver[r.ver.length-1],iv=fv(a.version),lv=fv(l.version),lev=cmpVer(iv,lv);
          return{id:fv(a.sys_id),name:fd(a.name),scope:fv(a.scope),iv:iv,lv:lv,lvId:fv(l.sys_id),level:lev,risk:risk(lev),vendor:fd(a.vendor)||'ServiceNow',date:fd(l.publish_date)||''};
        });
      });
  }

  function fireInstallAjax(apps) {
    if (typeof GlideAjax === 'undefined') {
      console.warn('[UC] GlideAjax not available');
      return;
    }
    var payload = JSON.stringify(apps.map(function(a) {
      return { id: a.id, name: a.name, lv: a.lv, iv: a.iv };
    }));
    console.log('[UC] Firing installBatch with', payload);
    try {
      var ga = new GlideAjax('x_g_s7s_updater.UpdateCenterInstaller');
      ga.addParam('sysparm_name', 'installBatch');
      ga.addParam('sysparm_apps', payload);
      ga.getXMLAnswer(function(answer) {
        console.log('[UC] GlideAjax callback answer:', answer);
        if (answer && answer.length > 10 && !S.batchId) {
          S.batchId = answer;
          addLog('GlideAjax returned worker ID', 'success');
        }
      });
    } catch (e) {
      console.error('[UC] GlideAjax error:', e);
    }
  }

  function fireScheduleAjax(apps, schedTime, cb) {
    if (typeof GlideAjax === 'undefined') { cb(null); return; }
    try {
      var ga = new GlideAjax('x_g_s7s_updater.UpdateCenterInstaller');
      ga.addParam('sysparm_name', 'scheduleInstall');
      ga.addParam('sysparm_apps', JSON.stringify(apps.map(function(a) { return { id: a.id, name: a.name, lv: a.lv, iv: a.iv }; })));
      ga.addParam('sysparm_schedule_time', schedTime);
      ga.getXMLAnswer(function(answer) { console.log('[UC] Schedule response:', answer); cb(answer); });
    } catch (e) { console.error('[UC] Schedule error:', e); cb(null); }
  }

  function fireCancelAjax(workerId, cb) {
    if (typeof GlideAjax === 'undefined') { cb(false); return; }
    try {
      var ga = new GlideAjax('x_g_s7s_updater.UpdateCenterInstaller');
      ga.addParam('sysparm_name', 'cancelScheduled');
      ga.addParam('sysparm_worker_id', workerId);
      ga.getXMLAnswer(function(answer) { console.log('[UC] Cancel response:', answer); cb(answer === 'cancelled'); });
    } catch (e) { console.error('[UC] Cancel error:', e); cb(false); }
  }

  function findRecentWorker() {
    var q = 'nameSTARTSWITHUpdate Center^ORDERBYDESCsys_created_on';
    return api('/api/now/table/sys_progress_worker?sysparm_display_value=all&sysparm_fields=sys_id,state,name,sys_created_on&sysparm_query=' + encodeURIComponent(q) + '&sysparm_limit=1')
      .then(function(d) {
        var r = (d.result || [])[0];
        return r ? fv(r.sys_id) : null;
      }).catch(function() { return null; });
  }

  function pollWorker(id) {
    return api('/api/now/table/sys_progress_worker/' + id + '?sysparm_display_value=all&sysparm_fields=sys_id,state,percent_complete,message,error_message,output_summary,sys_created_on')
      .then(function(d) { return d.result; });
  }

  function el(t,a,c){var e=document.createElement(t);if(a)Object.keys(a).forEach(function(k){if(k==='className')e.className=a[k];else if(k.indexOf('on')===0)e.addEventListener(k.substring(2),a[k]);else if(k==='disabled'&&a[k])e.disabled=true;else if(k==='checked')e.checked=a[k];else if(k==='type'||k==='placeholder'||k==='value')e[k]=a[k];else e.setAttribute(k,a[k]);});if(c!=null){if(Array.isArray(c))c.forEach(function(x){if(x!=null)e.appendChild(typeof x==='string'?document.createTextNode(x):x);});else if(typeof c==='string')e.textContent=c;else e.appendChild(c);}return e;}

  function renderNav(){
    var n=document.getElementById('ucNav');n.innerHTML='';
    [['dashboard','Dashboard'],['updates','Updates'],['scheduled','Scheduled'],['history','History']].forEach(function(t){
      n.appendChild(el('button',{className:'uc-nav-link'+(S.view===t[0]?' active':''),role:'tab','aria-selected':S.view===t[0]?'true':'false',onclick:function(){nav(t[0]);}},t[1]));
    });
    if(S.installing)n.appendChild(el('button',{className:'uc-nav-link uc-nav-pulse',role:'tab','aria-selected':S.view==='progress'?'true':'false',onclick:function(){nav('progress');}},'Installing...'));
  }

  function renderErr(){
    var e=document.getElementById('ucError');
    if(S.error){e.classList.remove('uc-hidden');document.getElementById('ucErrTxt').textContent=S.error;}else e.classList.add('uc-hidden');
  }

  function renderDash(){
    var u=S.updates,tot=u.length,maj=u.filter(function(x){return x.level==='major';}).length;
    var min=u.filter(function(x){return x.level==='minor';}).length,pat=u.filter(function(x){return x.level==='patch';}).length;
    var hi=u.filter(function(x){return x.risk==='high'||x.risk==='critical';}).length;
    var vd={};u.forEach(function(x){vd[x.vendor]=(vd[x.vendor]||0)+1;});
    var ve=Object.keys(vd).map(function(k){return[k,vd[k]];}).sort(function(a,b){return b[1]-a[1];});
    return el('div',{className:'uc-dash'},[
      el('div',{className:'uc-dash-hdr'},[
        el('div',null,[el('h2',{className:'uc-dash-title'},'Update Center'),S.lastRefresh?el('span',{className:'uc-dash-sub'},'Last checked: '+S.lastRefresh.toLocaleTimeString()):null]),
        el('div',{className:'uc-dash-acts'},[
          el('button',{className:'uc-btn uc-btn-s',disabled:S.loading,onclick:refresh},S.loading?'Scanning...':'Check for Updates'),
          S.installing?el('button',{className:'uc-btn uc-btn-p',onclick:function(){nav('progress');}},'View Progress'):null])]),
      el('div',{className:'uc-stats'},[
        el('button',{className:'uc-stat uc-c-accent',onclick:function(){nav('updates');}},[el('div',{className:'uc-stat-val'},''+tot),el('div',{className:'uc-stat-lbl'},'Updates Available'),el('div',{className:'uc-stat-hint'},'Click to view all')]),
        el('div',{className:'uc-stat uc-c-red'},[el('div',{className:'uc-stat-val'},''+maj),el('div',{className:'uc-stat-lbl'},'Major'),el('div',{className:'uc-stat-tag uc-tag-r'},'Breaking changes possible')]),
        el('div',{className:'uc-stat uc-c-blue'},[el('div',{className:'uc-stat-val'},''+min),el('div',{className:'uc-stat-lbl'},'Minor'),el('div',{className:'uc-stat-tag uc-tag-b'},'New features')]),
        el('div',{className:'uc-stat uc-c-green'},[el('div',{className:'uc-stat-val'},''+pat),el('div',{className:'uc-stat-lbl'},'Patch'),el('div',{className:'uc-stat-tag uc-tag-g'},'Bug fixes')])]),
      hi>0?el('div',{className:'uc-risk-ban'},[el('span',null,'\u26A0'),el('span',null,[el('strong',null,''+hi),document.createTextNode(' update'+(hi>1?'s':'')+' flagged as elevated risk.')])]):null,
      el('div',{className:'uc-qa'},[el('h3',null,'Quick Actions'),el('div',{className:'uc-qa-grid'},[
        el('button',{className:'uc-qa-card',disabled:tot===0,onclick:function(){nav('updates');}},[el('div',{className:'uc-qa-icon'},'\uD83D\uDCE6'),el('div',null,[el('div',{className:'uc-qa-title'},'Install Updates'),el('div',{className:'uc-qa-desc'},'Select and batch install store app updates')])]),
        el('button',{className:'uc-qa-card',onclick:function(){nav('scheduled');}},[el('div',{className:'uc-qa-icon'},'\uD83D\uDD52'),el('div',null,[el('div',{className:'uc-qa-title'},'Scheduled Updates'),el('div',{className:'uc-qa-desc'},'View and manage scheduled installations')])]),
        el('button',{className:'uc-qa-card',onclick:function(){nav('history');}},[el('div',{className:'uc-qa-icon'},'\uD83D\uDCCB'),el('div',null,[el('div',{className:'uc-qa-title'},'Installation History'),el('div',{className:'uc-qa-desc'},'View past activity and release notes')])])])]),
      ve.length>0?el('div',{className:'uc-vs'},[el('h3',null,'By Vendor'),el('div',{className:'uc-vl'},ve.map(function(v){return el('div',{className:'uc-vr'},[el('span',{className:'uc-vn'},v[0]),el('span',{className:'uc-vc'},''+v[1])]);}))])  :null
    ]);
  }

  function renderList(){
    var fl=S.updates.filter(function(u){if(S.filter!=='all'&&u.level!==S.filter)return false;if(S.search){var q=S.search.toLowerCase();if(u.name.toLowerCase().indexOf(q)===-1&&u.scope.toLowerCase().indexOf(q)===-1)return false;}return true;});
    var sc=Object.keys(S.selected).filter(function(k){return S.selected[k];}).length;
    var allSel=fl.length>0&&fl.every(function(u){return S.selected[u.id];});
    function li(l){return l==='major'?'\uD83D\uDD34':l==='minor'?'\uD83D\uDFE1':'\uD83D\uDFE2';}
    return el('div',{className:'uc-ul'},[
      el('div',{className:'uc-ul-hdr'},[el('button',{className:'uc-btn uc-btn-g',onclick:function(){nav('dashboard');'}},'\u2190 Back'),el('h2',null,'Available Updates'),el('div',{style:'width:60px'})]),
      el('div',{className:'uc-toolbar'},[
        el('input',{type:'text',className:'uc-search',placeholder:'Search apps...',value:S.search,oninput:function(e){S.search=e.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(render,150);}}),
        el('div',{className:'uc-fg'},['all','major','minor','patch'].map(function(f){return el('button',{className:'uc-fb'+(S.filter===f?' active':''),onclick:function(){S.filter=f;render();}},f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1));}))]),
      el('div',{className:'uc-sel-bar'},[
        el('label',{className:'uc-sel-lbl'},[el('input',{type:'checkbox',checked:allSel,onchange:function(){fl.forEach(function(u){S.selected[u.id]=!allSel;});render();}}),el('span',null,sc+' of '+S.updates.length+' selected')]),
        el('button',{className:'uc-btn uc-btn-p',disabled:sc===0||S.loading,onclick:showDlg},'Install Selected ('+sc+')')]),
      S.loading?el('div',{className:'uc-empty'},'Scanning for updates...'):
      fl.length===0?el('div',{className:'uc-empty'},S.updates.length===0?'All apps are up to date!':'No updates match your filter.'):
      el('div',{className:'uc-tbl'},[
        el('div',{className:'uc-th'},[el('div',{className:'uc-cc'}),el('div',null,'Application'),el('div',null,'Installed'),el('div'),el('div',null,'Available'),el('div',null,'Type'),el('div',null,'Risk'),el('div',null,'Vendor')])
      ].concat(fl.map(function(u){
        return el('div',{className:'uc-tr'+(S.selected[u.id]?' uc-sel':'')},[
          el('div',{className:'uc-cc'},el('input',{type:'checkbox',checked:!!S.selected[u.id],onchange:function(){S.selected[u.id]=!S.selected[u.id];render();}})),
          el('div',{className:'uc-cn'},[el('span',{className:'uc-an'},u.name),el('span',{className:'uc-as'},u.scope)]),
          el('div',{className:'uc-mono'},u.iv),el('div',{className:'uc-ar'},'\u2192'),el('div',{className:'uc-mono'},u.lv),
          el('div',null,li(u.level)+' '+u.level),
          el('div',null,el('span',{className:'uc-rb uc-rb-'+u.risk},u.risk)),
          el('div',{className:'uc-cv'},u.vendor)]);
      })))
    ]);
  }

  function showDlg(){
    var sel=S.updates.filter(function(u){return S.selected[u.id];});if(!sel.length)return;
    var mc=sel.filter(function(u){return u.level==='major';}).length,c=document.getElementById('ucDialog');c.innerHTML='';
    var showSched=false;
    function rebuildDlg(){
      c.innerHTML='';
      var dtInput;
      var schedSection=el('div',{className:'uc-dlg-sched',style:showSched?'':'display:none'},[
        el('label',null,'Schedule date & time:'),
        dtInput=el('input',{type:'datetime-local',className:'uc-dt-input'})
      ]);
      var minDt=new Date(Date.now()+300000).toISOString().slice(0,16);
      setTimeout(function(){if(dtInput)dtInput.min=minDt;},0);
      c.appendChild(el('div',{className:'uc-overlay',role:'dialog','aria-modal':'true',onclick:function(){c.innerHTML='';}},
        el('div',{className:'uc-dlg',onclick:function(e){e.stopPropagation();}},[
          el('h3',{className:'uc-dlg-title'},showSched?'Schedule Installation':'Confirm Batch Installation'),
          el('p',{className:'uc-dlg-sub'},[document.createTextNode(showSched?'Schedule ':'Install '),el('strong',null,''+sel.length),document.createTextNode(' update'+(sel.length>1?'s':'')+(showSched?' for a future date/time.':' now.'))]),
          mc>0?el('div',{className:'uc-dlg-warn'},'\u26A0 '+mc+' major update'+(mc>1?'s':'')+'. May contain breaking changes.'):null,
          el('div',{className:'uc-dlg-list'},sel.map(function(u){return el('div',{className:'uc-dlg-item'},[el('span',{className:'uc-dlg-name'},u.name),el('span',{className:'uc-dlg-ver'},u.iv+' \u2192 '+u.lv),el('span',{className:'uc-dlg-lvl uc-lv-'+u.level},u.level)]);})),
          schedSection,
          el('div',{className:'uc-dlg-acts'},[
            el('button',{className:'uc-btn uc-btn-s',onclick:function(){c.innerHTML='';}},'Cancel'),
            showSched
              ?el('button',{className:'uc-btn uc-btn-s',onclick:function(){showSched=false;rebuildDlg();}},'Back')
              :el('button',{className:'uc-btn uc-btn-s',onclick:function(){showSched=true;rebuildDlg();}},'Schedule for Later'),
            showSched
              ?el('button',{className:'uc-btn uc-btn-p',onclick:function(){
                  var v=dtInput?dtInput.value:'';
                  if(!v){alert('Please select a date and time.');return;}
                  var dt=new Date(v);
                  var snDt=dt.toLocaleString('en-US',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).replace(/(\d+)\/(\d+)\/(\d+),\s*/,'$3-$1-$2 ');
                  c.innerHTML='';
                  doSchedule(sel,snDt,v);
                }},'Confirm Schedule')
              :el('button',{className:'uc-btn uc-btn-p',onclick:function(){c.innerHTML='';doInstall(sel);}},'Install Now')
          ])])));
    }
    rebuildDlg();
  }

  function doSchedule(sel,snDt,localDt){
    addLog('Scheduling '+sel.length+' update'+(sel.length>1?'s':'')+' for '+localDt+'...');
    fireScheduleAjax(sel,snDt,function(answer){
      if(answer&&answer.length>2){
        S.error=null;
        addLog('Updates scheduled successfully!','success');
        nav('scheduled');
      } else {
        S.error='Failed to schedule updates. Check that the Script Include is deployed.';
        render();
      }
    });
  }

  function renderProg(){
    var f=S.pDone,e=S.pErr,sc=f?(e?'var(--uc-red)':'var(--uc-green)'):'var(--uc-accent)';
    return el('div',{className:'uc-pm'},[
      el('div',{className:'uc-pm-hdr'},[el('button',{className:'uc-btn uc-btn-g',onclick:function(){nav('dashboard');'}},'\u2190 Back'),el('h2',null,'Installation Progress'),el('div',{className:'uc-timer'},fmtDur(S.elapsed))]),
      el('div',{className:'uc-pcard'},[
        el('div',{className:'uc-prow'},[el('div',{className:'uc-pstate',style:'color:'+sc},f?(e?'\u2717 Failed':'\u2713 Complete'):S.pState),el('div',{className:'uc-ppct'},S.pPct+'%')]),
        el('div',{className:'uc-ptrack'},el('div',{className:'uc-pfill'+(f&&!e?' done':'')+(e?' err':''),style:'width:'+S.pPct+'%'})),
        e?el('div',{className:'uc-perr'},e):null]),
      el('div',null,[el('h3',{className:'uc-sec'},'Applications ('+S.installQueue.length+')'),
        el('div',{className:'uc-pills'},S.installQueue.map(function(u){return el('div',{className:'uc-pill'},[el('b',null,u.name),el('span',null,u.iv+' \u2192 '+u.lv)]);}))]),
      el('div',null,[el('h3',{className:'uc-sec'},'Activity Log'),
        el('div',{className:'uc-log',id:'ucLog'},S.logs.length===0?[el('div',{className:'uc-log-empty'},'Waiting for activity...')]
          :S.logs.map(function(l){return el('div',{className:'uc-le uc-le-'+l.type},[el('span',{className:'uc-le-t'},l.time),el('span',{className:'uc-le-m'},l.message)]);}))]),
      f?el('div',{className:'uc-pdone'},[el('button',{className:'uc-btn uc-btn-s',onclick:function(){nav('dashboard');}},'Return to Dashboard'),el('button',{className:'uc-btn uc-btn-p',onclick:function(){nav('updates');}},'Check for More Updates')]):null
    ]);
  }

  function renderHist(){
    var c=el('div',null,[el('div',{className:'uc-fhdr'},[el('button',{className:'uc-btn uc-btn-g',onclick:function(){nav('dashboard');'}},'\u2190 Back'),el('h2',null,'Installation History'),el('button',{className:'uc-btn uc-btn-s',onclick:loadHist},'Refresh')]),el('div',{id:'ucHist'},el('div',{className:'uc-empty'},'Loading history...'))]);
    loadHist();return c;
  }

  function loadHist(){
    var q='nameSTARTSWITHUpdate Center^ORDERBYDESCsys_created_on';
    api('/api/now/table/sys_progress_worker?sysparm_display_value=all&sysparm_fields=sys_id,name,state,percent_complete,message,output_summary,sys_created_on&sysparm_query='+encodeURIComponent(q)+'&sysparm_limit=50')
      .then(function(d){
        var es=(d.result||[]).map(function(r){
          var stRaw=(''+(fv(r.state)||'')).toLowerCase();
          var stDisp=(''+(fd(r.state)||'')).toLowerCase();
          var sLabel=fd(r.state)||fv(r.state)||'Unknown';
          var cls=(stRaw==='2'||stDisp.indexOf('complete')>-1||stDisp.indexOf('success')>-1)?'uc-s-ok'
            :(stRaw==='3'||stRaw==='4'||stDisp.indexOf('fail')>-1||stDisp.indexOf('error')>-1)?'uc-s-err'
            :(stRaw==='1'||stDisp.indexOf('running')>-1)?'uc-s-run':'uc-s-oth';
          var summary=fv(r.output_summary)||'';
          var hasNotes=false;
          try{var p=JSON.parse(summary);hasNotes=p&&p.type==='release_notes'&&p.apps;}catch(e){}
          return{id:fv(r.sys_id),name:fd(r.name)||'Unknown',state:sLabel,cls:cls,msg:fd(r.message)||'',created:fd(r.sys_created_on)||'',hasNotes:hasNotes,summary:summary};
        });
        var h=document.getElementById('ucHist');if(!h)return;
        if(!es.length){h.innerHTML='<div class="uc-empty">No installation history found.</div>';return;}
        h.innerHTML='';
        h.appendChild(el('div',{className:'uc-fl'},es.map(function(e){
          var ic=e.cls==='uc-s-ok'?'\u2713':e.cls==='uc-s-err'?'\u2717':e.cls==='uc-s-run'?'\u27F3':'\u2022';
          return el('div',{className:'uc-fi '+e.cls},[
            el('div',{className:'uc-fi-icon'},ic),
            el('div',{className:'uc-fi-body'},[
              el('div',{className:'uc-fi-name'},e.name),
              el('div',{className:'uc-fi-meta'},[e.created?el('span',null,e.created):null,el('span',{className:'uc-fi-st'},e.state)]),
              e.msg?el('div',{className:'uc-fi-msg'},e.msg):null,
              e.hasNotes?el('div',{className:'uc-fi-acts'},[el('button',{className:'uc-btn uc-btn-xs uc-btn-s',onclick:(function(sum){return function(){showReleaseNotes(sum);};})(e.summary)},'Release Notes')]):null
            ])
          ]);
        })));
      }).catch(function(err){console.error('[UC] History load error:',err);var h=document.getElementById('ucHist');if(h)h.innerHTML='<div class="uc-empty">Failed to load history.</div>';});
  }

  function renderScheduled(){
    var c=el('div',null,[
      el('div',{className:'uc-fhdr'},[el('button',{className:'uc-btn uc-btn-g',onclick:function(){nav('dashboard');'}},'\u2190 Back'),el('h2',null,'Scheduled Updates'),el('button',{className:'uc-btn uc-btn-s',onclick:function(){loadScheduledView();}},'Refresh')]),
      el('div',{id:'ucSched'},el('div',{className:'uc-empty'},'Loading scheduled updates...'))
    ]);
    loadScheduledView();return c;
  }

  function loadScheduledView(){
    var q='nameSTARTSWITHUpdate Center Scheduled^ORDERBYDESCsys_created_on';
    api('/api/now/table/sys_progress_worker?sysparm_display_value=all&sysparm_fields=sys_id,name,state,message,output_summary,sys_created_on&sysparm_query='+encodeURIComponent(q)+'&sysparm_limit=50')
      .then(function(d){
        var items=(d.result||[]).map(function(r){
          var stRaw=(''+(fv(r.state)||'')).toLowerCase();
          var stDisp=(''+(fd(r.state)||'')).toLowerCase();
          var isCancelled=stRaw==='cancelled'||stRaw==='4'||stDisp.indexOf('cancel')>-1;
          var isDone=stRaw==='2'||stRaw==='complete'||stDisp.indexOf('complete')>-1||stDisp.indexOf('success')>-1;
          var isRunning=stRaw==='1'||stRaw==='running'||stDisp.indexOf('running')>-1;
          var isPending=!isCancelled&&!isDone&&!isRunning;
          var meta=null;
          try{meta=JSON.parse(fv(r.output_summary)||'');}catch(e){}
          var apps=meta&&meta.apps?meta.apps:[];
          var schedTime=meta&&meta.scheduled_time?meta.scheduled_time:(fd(r.message)||'');
          var schedBy=meta&&meta.scheduled_by?meta.scheduled_by:'';
          return{id:fv(r.sys_id),name:fd(r.name)||'Scheduled Install',schedTime:schedTime,schedBy:schedBy,apps:apps,isPending:isPending,isCancelled:isCancelled,isDone:isDone,isRunning:isRunning,state:fd(r.state)||fv(r.state)||'',created:fd(r.sys_created_on)||''};
        });
        var h=document.getElementById('ucSched');if(!h)return;
        if(!items.length){h.innerHTML='<div class="uc-empty">No scheduled updates. Select updates and choose "Schedule for Later" to create one.</div>';return;}
        h.innerHTML='';
        items.forEach(function(it){
          var statusTxt=it.isPending?'Pending':it.isRunning?'Running':it.isDone?'Completed':it.isCancelled?'Cancelled':it.state;
          var ic=it.isPending?'\uD83D\uDD52':it.isRunning?'\u27F3':it.isDone?'\u2713':'\u2717';
          var appList=it.apps.map(function(a){return(a.name||a.id)+' '+a.iv+' \u2192 '+a.lv;}).join(', ');
          h.appendChild(el('div',{className:'uc-sched-item'+(it.isCancelled?' uc-sched-cancelled':'')},[
            el('div',{className:'uc-sched-icon'},ic),
            el('div',{className:'uc-sched-body'},[
              el('div',{className:'uc-sched-title'},it.name),
              el('div',{className:'uc-sched-time'},it.schedTime.replace('Scheduled for ','')),
              it.apps.length?el('div',{className:'uc-sched-apps'},appList):null,
              it.schedBy?el('div',{className:'uc-sched-apps'},'Scheduled by: '+it.schedBy):null,
              el('div',{className:'uc-sched-apps'},'Status: '+statusTxt),
              it.isPending?el('div',{className:'uc-sched-acts'},[
                el('button',{className:'uc-btn uc-btn-xs uc-btn-r',onclick:(function(wid){return function(){
                  if(!confirm('Cancel this scheduled install?'))return;
                  fireCancelAjax(wid,function(ok){
                    if(ok) addLog('Scheduled install cancelled.','success');
                    else addLog('Failed to cancel scheduled install.','warning');
                    loadScheduledView();
                  });
                };})(it.id)},'Cancel')
              ]):null
            ])
          ]));
        });
      }).catch(function(err){console.error('[UC] Scheduled load error:',err);var h=document.getElementById('ucSched');if(h)h.innerHTML='<div class="uc-empty">Failed to load scheduled updates.</div>';});
  }

  function showReleaseNotes(summaryJson){
    var data;
    try{data=JSON.parse(summaryJson);}catch(e){alert('No release notes data available.');return;}
    if(!data||!data.apps){alert('No release notes data available.');return;}
    var c=document.getElementById('ucDialog');c.innerHTML='';
    var tblRows=data.apps.map(function(a){
      var tr=document.createElement('tr');
      var ok=a.status==='success';
      tr.innerHTML='<td>'+(ok?'\u2713':'\u2717')+'</td><td><b>'+esc(a.name)+'</b></td><td class="uc-mono">'+esc(a.from)+'</td><td>\u2192</td><td class="uc-mono">'+esc(a.to)+'</td><td class="'+(ok?'uc-rn-ok':'uc-rn-fail')+'">'+esc(a.status)+'</td>'+(a.error?'<td style="color:var(--uc-red);font-size:12px">'+esc(a.error)+'</td>':'<td></td>');
      return tr;
    });
    var tbl=document.createElement('table');
    tbl.className='uc-rn-tbl';
    var thead=document.createElement('thead');
    thead.innerHTML='<tr><th></th><th>Application</th><th>From</th><th></th><th>To</th><th>Status</th><th>Notes</th></tr>';
    tbl.appendChild(thead);
    var tbody=document.createElement('tbody');
    tblRows.forEach(function(tr){tbody.appendChild(tr);});
    tbl.appendChild(tbody);

    var copiedEl=el('span',{className:'uc-rn-copied',style:'visibility:hidden'},'Copied!');
    var sumText=data.completed+' of '+data.total+' installed successfully'+(data.failed>0?', '+data.failed+' failed':'');

    c.appendChild(el('div',{className:'uc-overlay',role:'dialog','aria-modal':'true',onclick:function(){c.innerHTML='';}},
      el('div',{className:'uc-rn-modal',onclick:function(e){e.stopPropagation();}},[
        el('div',{className:'uc-rn-hdr'},[el('h3',null,'Release Notes'),el('button',{className:'uc-btn uc-btn-g',onclick:function(){c.innerHTML='';'}},'\u2715')]),
        el('div',{className:'uc-rn-meta'},[
          data.startTime?el('span',null,'Started: '+data.startTime):null,
          data.endTime?el('span',null,'Ended: '+data.endTime):null
        ]),
        el('div',{className:'uc-rn-pre'},[tbl]),
        el('div',{className:'uc-rn-summary'},sumText),
        el('div',{className:'uc-rn-acts'},[
          copiedEl,
          el('button',{className:'uc-btn uc-btn-s',onclick:function(){
            var txt='RELEASE NOTES\n'+(data.startTime?'Date: '+data.startTime+'\n':'')+'\n';
            data.apps.forEach(function(a){txt+=(a.status==='success'?'[OK] ':'[FAIL] ')+a.name+' '+a.from+' -> '+a.to+(a.error?' ('+a.error+')':'')+'\n';});
            txt+='\nSummary: '+sumText;
            try{navigator.clipboard.writeText(txt);copiedEl.style.visibility='visible';setTimeout(function(){copiedEl.style.visibility='hidden';},2000);}catch(e){prompt('Copy:',txt);}
          }},'Copy to Clipboard'),
          el('button',{className:'uc-btn uc-btn-p',onclick:function(){c.innerHTML='';}},'Close')
        ])
      ])));
  }
  function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML;}

  function nav(v){S.view=v;render();}
  function refresh(){S.loading=true;S.error=null;render();getUpdates().then(function(d){S.updates=d;S.lastRefresh=new Date();}).catch(function(e){S.error='Failed to load updates: '+(e.message||'Unknown');}).finally(function(){S.loading=false;render();});}

  function saveSession(){
    try{sessionStorage.setItem('uc_session',JSON.stringify({
      batchId:S.batchId,installQueue:S.installQueue,clientStart:clientStart
    }));}catch(e){}
  }
  function clearSession(){try{sessionStorage.removeItem('uc_session');}catch(e){}}

  function addLog(m,t){
    S.logs.push({time:new Date().toLocaleTimeString(),message:m,type:t||'info'});
    var logEl=document.getElementById('ucLog');
    if(logEl){
      var entry=S.logs[S.logs.length-1];
      if(S.logs.length===1) logEl.innerHTML='';
      logEl.appendChild(el('div',{className:'uc-le uc-le-'+entry.type},[el('span',{className:'uc-le-t'},entry.time),el('span',{className:'uc-le-m'},entry.message)]));
      logEl.scrollTop=logEl.scrollHeight;
    }
  }

  function isStateDone(p){
    var raw=(''+(fv(p.state)||'')).toLowerCase();
    var disp=(''+(fd(p.state)||'')).toLowerCase();
    return raw==='2'||raw==='complete'||raw==='successful'||disp.indexOf('complete')>-1||disp.indexOf('success')>-1;
  }
  function isStateFailed(p){
    var raw=(''+(fv(p.state)||'')).toLowerCase();
    var disp=(''+(fd(p.state)||'')).toLowerCase();
    return raw==='3'||raw==='4'||raw==='error'||raw==='failed'||raw==='cancelled'
      ||disp.indexOf('error')>-1||disp.indexOf('fail')>-1||disp.indexOf('cancel')>-1;
  }

  function doInstall(sel){
    S.installQueue=sel;S.installing=true;S.view='progress';
    S.pPct=0;S.pState='Preparing...';S.pErr='';S.pDone=false;S.logs=[];
    S.elapsed=0;S.serverStart=null;S.batchId=null;
    clientStart=Date.now();
    if(tickT)clearInterval(tickT);
    if(pollT)clearInterval(pollT);
    startTick();
    render();

    setTimeout(function(){
      addLog('Triggering batch installation ('+sel.length+' app'+(sel.length>1?'s':'')+')...');
      fireInstallAjax(sel);
      addLog('Install request sent to server');
      addLog('Searching for progress worker...','info');
      searchForWorker(0);
    },100);
  }

  function startTick(){
    if(tickT)clearInterval(tickT);
    tickT=setInterval(function(){
      if(S.serverStart) S.elapsed=Math.floor((Date.now()-S.serverStart.getTime())/1000);
      else S.elapsed=Math.floor((Date.now()-clientStart)/1000);
      var t=document.querySelector('.uc-timer');
      if(t)t.textContent=fmtDur(S.elapsed);
    },1000);
  }

  function searchForWorker(attempt){
    if(S.batchId){saveSession();startPoll();return;}
    findRecentWorker().then(function(id){
      if(id){
        S.batchId=id;
        saveSession();
        addLog('Found progress worker: '+id.substring(0,8)+'...','success');
        startPoll();
      } else if(attempt<10){
        var delay=attempt<3?2000:3000;
        if(attempt>0) addLog('Worker not found yet, retrying... ('+(attempt+1)+'/10)','info');
        setTimeout(function(){searchForWorker(attempt+1);},delay);
      } else {
        addLog('Could not locate progress worker.','error');
        addLog('The install may have completed. Check History tab.','warning');
        S.pDone=true;S.pState='Unknown';
        if(tickT)clearInterval(tickT);
        clearSession();
        render();
      }
    }).catch(function(e){
      addLog('Search error: '+e.message,'warning');
      if(attempt<10) setTimeout(function(){searchForWorker(attempt+1);},3000);
    });
  }

  function startPoll(){
    var lastMsg='';
    console.log('[UC] Polling worker:', S.batchId);
    addLog('Monitoring installation progress...','info');
    function doPoll(){
      if(!S.batchId)return;
      pollWorker(S.batchId).then(function(p){
        var pct=parseInt(fv(p.percent_complete))||0;
        S.pPct=pct;

        var created=fd(p.sys_created_on);
        if(created&&!S.serverStart){
          try{S.serverStart=new Date(created);}catch(e){}
        }

        var stateDisplay=fd(p.state)||fv(p.state)||'Running';
        var msg=fd(p.message)||fv(p.message)||'';

        if(msg&&msg!==lastMsg){lastMsg=msg;addLog(msg);}
        S.pState=stateDisplay;

        if(isStateDone(p)){
          clearInterval(pollT);if(tickT)clearInterval(tickT);
          S.pPct=100;S.pDone=true;
          addLog('Batch installation completed!','success');
          S.installing=false;S.batchId=null;
          clearSession();
          render();refresh();
        } else if(isStateFailed(p)){
          clearInterval(pollT);if(tickT)clearInterval(tickT);
          S.pDone=true;
          var errMsg=fd(p.error_message)||fv(p.error_message)||'Installation encountered an issue.';
          S.pErr=errMsg;
          addLog('Installation issue: '+errMsg,'error');
          clearSession();
          render();
        } else {
          updateProgressUI();
        }
      }).catch(function(e){
        console.error('[UC] Poll error:', e);
        addLog('Poll error: '+e.message,'warning');
      });
    }
    doPoll();
    pollT=setInterval(doPoll,2500);
  }

  function updateProgressUI(){
    var pctEl=document.querySelector('.uc-ppct');
    if(pctEl)pctEl.textContent=S.pPct+'%';
    var fillEl=document.querySelector('.uc-pfill');
    if(fillEl)fillEl.style.width=S.pPct+'%';
    var stateEl=document.querySelector('.uc-pstate');
    if(stateEl)stateEl.textContent=S.pState;
  }

  function render(){renderNav();renderErr();var c=document.getElementById('ucContent');
    if(S.view==='dashboard'){c.innerHTML='';c.appendChild(renderDash());}
    else if(S.view==='updates'){c.innerHTML='';c.appendChild(renderList());}
    else if(S.view==='progress'){c.innerHTML='';c.appendChild(renderProg());}
    else if(S.view==='scheduled'){c.innerHTML='';c.appendChild(renderScheduled());}
    else if(S.view==='history'){c.innerHTML='';c.appendChild(renderHist());}
  }

  function resumeSession(){
    try{
      var raw=sessionStorage.getItem('uc_session');
      if(!raw) return false;
      var sess=JSON.parse(raw);
      if(!sess||typeof sess.batchId!=='string'||!sess.batchId) return false;
      S.batchId=sess.batchId;
      S.installQueue=Array.isArray(sess.installQueue)?sess.installQueue:[];
      S.installing=true;
      S.view='progress';
      S.pPct=0;S.pState='Resuming...';S.pDone=false;S.pErr='';S.logs=[];
      clientStart=sess.clientStart||Date.now();
      startTick();
      render();
      addLog('Resuming monitoring of active installation...','info');
      startPoll();
      return true;
    }catch(e){return false;}
  }

  document.getElementById('ucErrDismiss').addEventListener('click',function(){S.error=null;renderErr();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){var d=document.getElementById('ucDialog');if(d&&d.innerHTML)d.innerHTML='';}});
  detectTheme();
  if(!resumeSession()){render();refresh();}else{refresh();}
})();
