import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import updateCenterPage from '../../client/index.html'

UiPage({
  $id: Now.ID['update-center-page'],
  endpoint: 'x_g_s7s_updater_update_center.do',
  description: 'Batch Store update installer with real-time progress monitoring',
  category: 'general',
  html: updateCenterPage,
  direct: true,
})
