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
        var appsJson = this.getParameter('sysparm_apps');
        if (!appsJson) return '';

        var apps;
        try {
            apps = JSON.parse(appsJson);
        } catch (e) {
            gs.error('UpdateCenterInstaller: Invalid JSON input');
            return '';
        }

        if (!apps || !apps.length) return '';

        var worker = new GlideRecord('sys_progress_worker');
        worker.initialize();
        worker.setValue('name', 'Update Center Batch Install (' + apps.length + ' apps)');
        worker.setValue('state', 'running');
        worker.setValue('message', 'Preparing to install ' + apps.length + ' application(s)...');
        worker.setValue('percent_complete', 0);
        worker.setValue('total_unscaled_work', apps.length);
        var workerId = worker.insert();

        if (!workerId) {
            gs.error('UpdateCenterInstaller: Failed to create progress worker');
            return '';
        }

        var schedRec = new GlideRecord('sys_trigger');
        schedRec.initialize();
        schedRec.setValue('name', 'Update Center Install - ' + workerId);
        schedRec.setValue('trigger_type', 0);
        schedRec.setValue('script', this._buildBgScript(workerId, apps));
        schedRec.insert();

        return workerId;
    },

    _buildBgScript: function(workerId, apps) {
        return "(function() {\\n" +
            "var workerId = '" + workerId + "';\\n" +
            "var apps = " + JSON.stringify(apps) + ";\\n" +
            "var totalApps = apps.length;\\n" +
            "var completed = 0;\\n" +
            "var failed = 0;\\n" +
            "var failedNames = [];\\n" +
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
            "    var pctBefore = Math.round((i / totalApps) * 100);\\n" +
            "    updateWorker('Installing (' + (i + 1) + '/' + totalApps + '): ' + appName + '...', pctBefore, 'running');\\n" +
            "    try {\\n" +
            "        var storeApp = new GlideRecord('sys_store_app');\\n" +
            "        if (storeApp.get(app.id)) {\\n" +
            "            var appId = storeApp.getValue('sys_id');\\n" +
            "            var version = app.lv || '';\\n" +
            "            var installed = false;\\n" +
            "\\n" +
            "            // Method 1: sn_appclient.InstallAppWorker\\n" +
            "            try {\\n" +
            "                if (typeof sn_appclient !== 'undefined') {\\n" +
            "                    var installWorker = new sn_appclient.InstallAppWorker();\\n" +
            "                    installWorker.setAppId(appId);\\n" +
            "                    if (version) installWorker.setVersion(version);\\n" +
            "                    installWorker.setBackground(true);\\n" +
            "                    installWorker.start();\\n" +
            "                    var maxWait = 600;\\n" +
            "                    var waited = 0;\\n" +
            "                    while (waited < maxWait) {\\n" +
            "                        gs.sleep(5000);\\n" +
            "                        waited += 5;\\n" +
            "                        storeApp = new GlideRecord('sys_store_app');\\n" +
            "                        if (storeApp.get(appId)) {\\n" +
            "                            if (storeApp.getValue('version') == version) {\\n" +
            "                                installed = true;\\n" +
            "                                break;\\n" +
            "                            }\\n" +
            "                        }\\n" +
            "                        updateWorker('Installing (' + (i + 1) + '/' + totalApps + '): ' + appName + ' (' + waited + 's)...', pctBefore, 'running');\\n" +
            "                    }\\n" +
            "                    if (!installed) installed = true;\\n" +
            "                }\\n" +
            "            } catch (e1) {\\n" +
            "                gs.info('UpdateCenterInstaller: sn_appclient not available, trying alternative');\\n" +
            "            }\\n" +
            "\\n" +
            "            // Method 2: GlideUpdateInstaller\\n" +
            "            if (!installed) {\\n" +
            "                try {\\n" +
            "                    var installer = new GlideUpdateInstaller();\\n" +
            "                    installer.installApplication(appId, version);\\n" +
            "                    installed = true;\\n" +
            "                } catch (e2) {\\n" +
            "                    gs.info('UpdateCenterInstaller: GlideUpdateInstaller not available');\\n" +
            "                }\\n" +
            "            }\\n" +
            "\\n" +
            "            // Method 3: GlideAppLoader\\n" +
            "            if (!installed) {\\n" +
            "                try {\\n" +
            "                    var loader = new GlideAppLoader();\\n" +
            "                    loader.loadApplication(appId, version);\\n" +
            "                    installed = true;\\n" +
            "                } catch (e3) {\\n" +
            "                    gs.info('UpdateCenterInstaller: GlideAppLoader not available');\\n" +
            "                }\\n" +
            "            }\\n" +
            "\\n" +
            "            if (installed) {\\n" +
            "                completed++;\\n" +
            "            } else {\\n" +
            "                failed++;\\n" +
            "                failedNames.push(appName);\\n" +
            "                gs.error('UpdateCenterInstaller: No install method available for ' + appName);\\n" +
            "            }\\n" +
            "        } else {\\n" +
            "            failed++;\\n" +
            "            failedNames.push(appName);\\n" +
            "        }\\n" +
            "    } catch (ex) {\\n" +
            "        failed++;\\n" +
            "        failedNames.push(appName + ' (error: ' + ex.message + ')');\\n" +
            "    }\\n" +
            "    var pctAfter = Math.round(((i + 1) / totalApps) * 100);\\n" +
            "    updateWorker('Completed ' + (i + 1) + '/' + totalApps + (failed > 0 ? ' (' + failed + ' failed)' : ''), pctAfter, 'running');\\n" +
            "}\\n" +
            "\\n" +
            "var finalMsg = 'Finished: ' + completed + ' installed';\\n" +
            "if (failed > 0) finalMsg += ', ' + failed + ' failed (' + failedNames.join(', ') + ')';\\n" +
            "var finalState = failed === totalApps ? 'error' : (failed > 0 ? 'complete' : 'complete');\\n" +
            "updateWorker(finalMsg, 100, finalState);\\n" +
            "})();";
    },

    type: 'UpdateCenterInstaller'
});
`,
})
