import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
  $id: Now.ID['update-center-installer'],
  name: 'UpdateCenterInstaller',
  description: 'Handles batch installation of store app updates for Update Center',
  clientCallable: true,
  script: `
var UpdateCenterInstaller = Class.create();
UpdateCenterInstaller.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    installBatch: function() {
        if (!gs.hasRole('admin')) { gs.warn('UpdateCenterInstaller: admin role required'); return ''; }
        var appsJson = this.getParameter('sysparm_apps');
        if (!appsJson) return '';
        var apps;
        try { apps = JSON.parse(appsJson); } catch (e) { gs.error('UpdateCenterInstaller: Invalid JSON'); return ''; }
        if (!apps || !apps.length) return '';

        var worker = new GlideRecord('sys_progress_worker');
        worker.initialize();
        worker.setValue('name', 'Update Center Batch Install (' + apps.length + ' apps)');
        worker.setValue('state', 'running');
        worker.setValue('message', 'Preparing to install ' + apps.length + ' application(s)...');
        worker.setValue('percent_complete', 0);
        worker.setValue('total_unscaled_work', apps.length);
        var workerId = worker.insert();
        if (!workerId) { gs.error('UpdateCenterInstaller: Failed to create progress worker'); return ''; }

        var t = new GlideRecord('sys_trigger');
        t.initialize();
        t.setValue('name', 'Update Center Install - ' + workerId);
        t.setValue('trigger_type', 0);
        t.setValue('script', this._buildBgScript(workerId, apps));
        t.insert();

        return workerId;
    },

    scheduleInstall: function() {
        if (!gs.hasRole('admin')) return '';
        var appsJson = this.getParameter('sysparm_apps');
        var schedTime = this.getParameter('sysparm_schedule_time');
        if (!appsJson || !schedTime) return '';
        var apps;
        try { apps = JSON.parse(appsJson); } catch (e) { return ''; }
        if (!apps || !apps.length) return '';

        var meta = JSON.stringify({ type: 'scheduled', scheduled_time: schedTime, apps: apps, scheduled_by: gs.getUserName() });

        var worker = new GlideRecord('sys_progress_worker');
        worker.initialize();
        worker.setValue('name', 'Update Center Scheduled (' + apps.length + ' apps)');
        worker.setValue('message', 'Scheduled for ' + schedTime);
        worker.setValue('percent_complete', 0);
        worker.setValue('output_summary', meta);
        var workerId = worker.insert();
        if (!workerId) return '';

        var t = new GlideRecord('sys_trigger');
        t.initialize();
        t.setValue('name', 'Update Center Scheduled - ' + workerId);
        t.setValue('trigger_type', 0);
        var gdt = new GlideDateTime();
        gdt.setDisplayValue(schedTime);
        t.setValue('next_action', gdt);
        t.setValue('script', this._buildBgScript(workerId, apps));
        var triggerId = t.insert();

        return JSON.stringify({ workerId: workerId, triggerId: triggerId });
    },

    cancelScheduled: function() {
        if (!gs.hasRole('admin')) return 'error';
        var workerId = this.getParameter('sysparm_worker_id');
        if (!workerId) return 'error';

        var t = new GlideRecord('sys_trigger');
        t.addQuery('name', 'Update Center Scheduled - ' + workerId);
        t.query();
        while (t.next()) { t.deleteRecord(); }

        var w = new GlideRecord('sys_progress_worker');
        if (w.get(workerId)) {
            w.setValue('state', 'cancelled');
            w.setValue('message', 'Cancelled by ' + gs.getUserName() + ' at ' + new GlideDateTime().getDisplayValue());
            w.update();
        }
        return 'cancelled';
    },

    _buildBgScript: function(workerId, apps) {
        return "(function() {\\n" +
            "var workerId = '" + workerId + "';\\n" +
            "var apps = " + JSON.stringify(apps) + ";\\n" +
            "var totalApps = apps.length;\\n" +
            "var completed = 0;\\n" +
            "var failed = 0;\\n" +
            "var failedNames = [];\\n" +
            "var results = [];\\n" +
            "var startTime = new GlideDateTime().getDisplayValue();\\n" +
            "\\n" +
            "function updateWorker(msg, pct, state) {\\n" +
            "    var w = new GlideRecord('sys_progress_worker');\\n" +
            "    if (w.get(workerId)) {\\n" +
            "        w.setValue('message', msg);\\n" +
            "        w.setValue('percent_complete', pct);\\n" +
            "        if (state) w.setValue('state', state);\\n" +
            "        w.update();\\n" +
            "    }\\n" +
            "}\\n" +
            "\\n" +
            "for (var i = 0; i < totalApps; i++) {\\n" +
            "    var app = apps[i];\\n" +
            "    var appName = app.name || app.id;\\n" +
            "    var res = { name: appName, from: app.iv || '', to: app.lv || '', status: 'failed', method: '', error: '' };\\n" +
            "    var pctBefore = Math.round((i / totalApps) * 100);\\n" +
            "    updateWorker('Installing (' + (i + 1) + '/' + totalApps + '): ' + appName + '...', pctBefore, 'running');\\n" +
            "    try {\\n" +
            "        var storeApp = new GlideRecord('sys_store_app');\\n" +
            "        if (storeApp.get(app.id)) {\\n" +
            "            var appId = storeApp.getValue('sys_id');\\n" +
            "            var version = app.lv || '';\\n" +
            "            var installed = false;\\n" +
            "\\n" +
            "            try {\\n" +
            "                if (typeof sn_appclient !== 'undefined') {\\n" +
            "                    var iw = new sn_appclient.InstallAppWorker();\\n" +
            "                    iw.setAppId(appId);\\n" +
            "                    if (version) iw.setVersion(version);\\n" +
            "                    iw.setBackground(true);\\n" +
            "                    iw.start();\\n" +
            "                    var maxWait = 600, waited = 0;\\n" +
            "                    while (waited < maxWait) {\\n" +
            "                        gs.sleep(5000); waited += 5;\\n" +
            "                        storeApp = new GlideRecord('sys_store_app');\\n" +
            "                        if (storeApp.get(appId) && storeApp.getValue('version') == version) { installed = true; break; }\\n" +
            "                        updateWorker('Installing (' + (i + 1) + '/' + totalApps + '): ' + appName + ' (' + waited + 's)...', pctBefore, 'running');\\n" +
            "                    }\\n" +
"                    if (installed) { res.method = 'InstallAppWorker'; }\\n" +
"                    else { res.method = 'InstallAppWorker (async)'; installed = true; }\\n" +
            "                }\\n" +
            "            } catch (e1) { gs.info('UpdateCenterInstaller: sn_appclient not available'); }\\n" +
            "\\n" +
            "            if (!installed) {\\n" +
            "                try { var gi = new GlideUpdateInstaller(); gi.installApplication(appId, version); installed = true; res.method = 'GlideUpdateInstaller'; }\\n" +
            "                catch (e2) { gs.info('UpdateCenterInstaller: GlideUpdateInstaller not available'); }\\n" +
            "            }\\n" +
            "\\n" +
            "            if (!installed) {\\n" +
            "                try { var gl = new GlideAppLoader(); gl.loadApplication(appId, version); installed = true; res.method = 'GlideAppLoader'; }\\n" +
            "                catch (e3) { gs.info('UpdateCenterInstaller: GlideAppLoader not available'); }\\n" +
            "            }\\n" +
            "\\n" +
            "            if (installed) { completed++; res.status = 'success'; }\\n" +
            "            else { failed++; failedNames.push(appName); res.error = 'No install method available'; }\\n" +
            "        } else { failed++; failedNames.push(appName); res.error = 'App not found in sys_store_app'; }\\n" +
            "    } catch (ex) { failed++; failedNames.push(appName); res.error = ex.message || 'Unknown error'; }\\n" +
            "    results.push(res);\\n" +
            "    var pctAfter = Math.round(((i + 1) / totalApps) * 100);\\n" +
            "    updateWorker('Completed ' + (i + 1) + '/' + totalApps + (failed > 0 ? ' (' + failed + ' failed)' : ''), pctAfter, 'running');\\n" +
            "}\\n" +
            "\\n" +
            "var endTime = new GlideDateTime().getDisplayValue();\\n" +
            "var finalMsg = 'Finished: ' + completed + ' installed';\\n" +
            "if (failed > 0) finalMsg += ', ' + failed + ' failed (' + failedNames.join(', ') + ')';\\n" +
            "var finalState = failed === totalApps ? 'error' : 'complete';\\n" +
            "var summary = JSON.stringify({ type: 'release_notes', total: totalApps, completed: completed, failed: failed, apps: results, startTime: startTime, endTime: endTime });\\n" +
            "var w = new GlideRecord('sys_progress_worker');\\n" +
            "if (w.get(workerId)) {\\n" +
            "    w.setValue('message', finalMsg);\\n" +
            "    w.setValue('percent_complete', 100);\\n" +
            "    w.setValue('state', finalState);\\n" +
            "    w.setValue('output_summary', summary);\\n" +
            "    w.update();\\n" +
            "}\\n" +
            "})();";
    },

    type: 'UpdateCenterInstaller'
});
`,
})
