/**
 * REST API: Batch Update Installer Setup
 * ServiceNow REST API endpoint for installing the app
 * Route: /api/now/x_g_s7s/batch-install
 */

(function processRequest() {
  // Check if this is a GET request for installation
  if (request.getMethod() !== 'GET' && request.getMethod() !== 'POST') {
    response.setStatus(405);
    response.setContentType('application/json');
    gs.info('[BatchUpdate] Invalid method: ' + request.getMethod());
    response.getStreamWriter().writeString(JSON.stringify({
      status: 'error',
      message: 'Method not allowed'
    }));
    return;
  }

  try {
    gs.info('[BatchUpdate] Installation endpoint called');

    // Verify admin access
    if (!gs.getUser().hasRole('admin') && !gs.getUser().hasRole('x_g_s7s.admin')) {
      response.setStatus(403);
      response.setContentType('application/json');
      response.getStreamWriter().writeString(JSON.stringify({
        status: 'error',
        message: 'Insufficient permissions'
      }));
      return;
    }

    // Get action parameter
    var action = request.getParameter('action') || 'install';

    var installer = new BatchUpdateInstaller();
    var result;

    switch (action) {
      case 'install':
        result = installer.install();
        break;
      case 'verify':
        result = installer.verify();
        break;
      case 'uninstall':
        result = installer.uninstall();
        break;
      default:
        result = { success: false, message: 'Unknown action: ' + action };
    }

    response.setStatus(result.success ? 200 : 500);
    response.setContentType('application/json');
    response.getStreamWriter().writeString(JSON.stringify(result));

  } catch (error) {
    gs.error('[BatchUpdate] REST API error: ' + error);
    response.setStatus(500);
    response.setContentType('application/json');
    response.getStreamWriter().writeString(JSON.stringify({
      status: 'error',
      message: 'Server error: ' + error
    }));
  }
})();
