import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

Record({
  $id: Now.ID['update-center-page'],
  table: 'sys_ui_page',
  data: {
    name: 'update_center',
    description: 'Batch Store update installer with real-time progress monitoring',
    category: 'general',
    direct: true,
    html: Now.include('./update-center.html'),
    client_script: Now.include('./update-center.client.js'),
  },
})
