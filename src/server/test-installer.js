// Test script for Batch Store Update Installer
// Run in ServiceNow Script Console or as an Automated Test

(function() {
  var installer = new BatchUpdateInstaller();
  var installResult = installer.install();
  gs.info('Install result: ' + JSON.stringify(installResult));

  var verifyResult = installer.verify();
  gs.info('Verify result: ' + JSON.stringify(verifyResult));

  var batchInstaller = new BatchStoreUpdateInstaller();
  var batchId = batchInstaller.createBatch('TestStore', 5);
  gs.info('Created batch: ' + batchId);

  batchInstaller.processPendingBatches();
  var status = batchInstaller.getBatchStatus(batchId);
  gs.info('Batch status: ' + JSON.stringify(status));
})();
