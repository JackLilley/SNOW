import type { StoreApp, AppVersion, AvailableUpdate, ProgressWorker, BatchManifest, UpdateLevel, RiskLevel } from '../types'

declare global {
  interface Window {
    g_ck: string
  }
}

export class UpdateService {
  private headers(): HeadersInit {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-UserToken': window.g_ck,
    }
  }

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, { headers: this.headers(), ...options })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err?.error?.message || `HTTP ${response.status}`)
    }
    return response.json()
  }

  async getAvailableUpdates(): Promise<AvailableUpdate[]> {
    const params = new URLSearchParams({
      sysparm_display_value: 'all',
      sysparm_fields: 'sys_id,name,scope,version,vendor,active',
      sysparm_query: 'active=true^update_available=true^ORDERBYname',
    })

    const { result: apps } = await this.fetchJson<{ result: StoreApp[] }>(
      `/api/now/table/sys_store_app?${params}`
    )

    const updates: AvailableUpdate[] = []

    for (const app of apps) {
      const appId = app.sys_id.value
      const versions = await this.getVersionsForApp(appId)
      if (versions.length === 0) continue

      const latest = versions[versions.length - 1]
      const installedVer = app.version.value
      const latestVer = latest.version.value
      const level = this.compareVersions(installedVer, latestVer)
      const risk = this.assessRisk(level, versions.length)

      updates.push({
        appSysId: appId,
        appName: app.name.display_value || app.name.value,
        scope: app.scope.value,
        installedVersion: installedVer,
        latestVersion: latestVer,
        latestVersionSysId: latest.sys_id.value,
        updateLevel: level,
        riskLevel: risk,
        vendor: app.vendor?.display_value || app.vendor?.value || 'ServiceNow',
        publishDate: latest.publish_date?.display_value || '',
        selected: false,
      })
    }

    return updates
  }

  async getVersionsForApp(appSysId: string): Promise<AppVersion[]> {
    const params = new URLSearchParams({
      sysparm_display_value: 'all',
      sysparm_fields: 'sys_id,version,source_app_id,publish_date',
      sysparm_query: `source_app_id=${appSysId}^ORDERBYversion`,
    })

    const { result } = await this.fetchJson<{ result: AppVersion[] }>(
      `/api/now/table/sys_app_version?${params}`
    )
    return result || []
  }

  async startBatchInstall(manifest: BatchManifest): Promise<string> {
    const { result } = await this.fetchJson<{ result: { id: string } }>(
      '/api/sn_cicd/app/batch/install',
      {
        method: 'POST',
        body: JSON.stringify(manifest),
      }
    )
    return result?.id || ''
  }

  async getProgressStatus(progressId: string): Promise<ProgressWorker> {
    const params = new URLSearchParams({
      sysparm_display_value: 'all',
      sysparm_fields: 'sys_id,state,percent_complete,message,error_message,output_summary',
    })

    const { result } = await this.fetchJson<{ result: Record<string, any> }>(
      `/api/now/table/sys_progress_worker/${progressId}?${params}`
    )

    return {
      sys_id: progressId,
      state: result.state?.value || '',
      percentComplete: parseInt(result.percent_complete?.value) || 0,
      message: result.message?.display_value || result.message?.value || '',
      errorMessage: result.error_message?.display_value || result.error_message?.value || '',
      outputSummary: result.output_summary?.display_value || result.output_summary?.value || '',
    }
  }

  async getBatchProgress(batchId: string): Promise<{ state: string; percent_complete: string; result_id: string }> {
    const { result } = await this.fetchJson<{ result: any }>(
      `/api/sn_cicd/progress/${batchId}`
    )
    return result
  }

  buildManifest(updates: AvailableUpdate[]): BatchManifest {
    return {
      name: 'Update Center Batch Install',
      notes: `Batch installation of ${updates.length} app(s) via Update Center`,
      packages: updates.map((u) => ({
        id: u.appSysId,
        type: 'application' as const,
        load_demo_data: false,
        requested_version: u.latestVersion,
        notes: `${u.appName} ${u.installedVersion} → ${u.latestVersion}`,
      })),
    }
  }

  compareVersions(installed: string, available: string): UpdateLevel {
    const from = (installed || '0.0.0').split('.')
    const to = (available || '0.0.0').split('.')
    if (from[0] !== to[0]) return 'major'
    if (from[1] !== to[1]) return 'minor'
    return 'patch'
  }

  assessRisk(level: UpdateLevel, versionCount: number): RiskLevel {
    if (level === 'major') return 'high'
    if (level === 'minor' && versionCount > 3) return 'medium'
    if (level === 'minor') return 'medium'
    return 'low'
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    if (min < 60) return `${min}m ${sec}s`
    const hr = Math.floor(min / 60)
    return `${hr}h ${min % 60}m`
  }
}
