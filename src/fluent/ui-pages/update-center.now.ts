import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

Record({
  $id: Now.ID['update-center-page'],
  table: 'sys_ui_page',
  data: {
    name: 'x_g_s7s_updater_update_center',
    description: 'Batch Store update installer with real-time progress monitoring',
    category: 'general',
    direct: false,
    html: Now.include('./update-center.html'),
  },
})
