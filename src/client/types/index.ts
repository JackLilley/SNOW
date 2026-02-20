export interface StoreApp {
  sys_id: FieldValue
  name: FieldValue
  scope: FieldValue
  version: FieldValue
  update_available: FieldValue
  vendor: FieldValue
  active: FieldValue
}

export interface AppVersion {
  sys_id: FieldValue
  version: FieldValue
  source_app_id: FieldValue
  publish_date: FieldValue
}

export interface FieldValue {
  value: string
  display_value: string
}

export interface AvailableUpdate {
  appSysId: string
  appName: string
  scope: string
  installedVersion: string
  latestVersion: string
  latestVersionSysId: string
  updateLevel: 'major' | 'minor' | 'patch'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  vendor: string
  publishDate: string
  selected: boolean
}

export interface ProgressWorker {
  sys_id: string
  state: string
  percentComplete: number
  message: string
  errorMessage: string
  outputSummary: string
}

export interface BatchManifest {
  name: string
  notes: string
  packages: BatchPackage[]
}

export interface BatchPackage {
  id: string
  type: 'application'
  load_demo_data: boolean
  requested_version: string
  notes: string
}

export type UpdateLevel = 'major' | 'minor' | 'patch'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type AppView = 'dashboard' | 'updates' | 'progress' | 'history'
export type FilterLevel = 'all' | 'major' | 'minor' | 'patch'
