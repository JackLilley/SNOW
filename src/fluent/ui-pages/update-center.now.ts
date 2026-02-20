import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

UiPage({
  $id: Now.ID['update-center-page'],
  category: 'general',
  endpoint: 'x_g_s7s_updater_update_center.do',
  description: 'Batch Store update installer with real-time progress monitoring',
  html: Now.include('./update-center.html'),
  clientScript: Now.include('./update-center.client.js'),
})
