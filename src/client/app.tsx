import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { UpdateService } from './services/UpdateService'
import Dashboard from './components/Dashboard'
import UpdateList from './components/UpdateList'
import ProgressMonitor from './components/ProgressMonitor'
import ActivityFeed from './components/ActivityFeed'
import type { AvailableUpdate, AppView } from './types'
import './app.css'

export default function App() {
  const [view, setView] = useState<AppView>('dashboard')
  const [updates, setUpdates] = useState<AvailableUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [batchId, setBatchId] = useState<string | null>(null)
  const [installing, setInstalling] = useState(false)
  const [installQueue, setInstallQueue] = useState<AvailableUpdate[]>([])

  const service = useMemo(() => new UpdateService(), [])

  const refreshUpdates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await service.getAvailableUpdates()
      setUpdates(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Failed to load updates: ' + ((err as Error).message || 'Unknown error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    void refreshUpdates()
  }, [refreshUpdates])

  const handleInstall = async (selected: AvailableUpdate[]) => {
    try {
      setInstallQueue(selected)
      setInstalling(true)
      setView('progress')
      setError(null)

      const manifest = service.buildManifest(selected)
      const progressId = await service.startBatchInstall(manifest)
      setBatchId(progressId)
    } catch (err) {
      setError('Failed to start batch install: ' + ((err as Error).message || 'Unknown error'))
      setInstalling(false)
      setView('updates')
    }
  }

  const handleInstallComplete = () => {
    setInstalling(false)
    setBatchId(null)
    void refreshUpdates()
  }

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="nav-brand">Update Center</div>
        <div className="nav-links">
          {(['dashboard', 'updates', 'history'] as AppView[]).map((v) => (
            <button
              key={v}
              className={`nav-link ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)}
            >
              {v === 'dashboard' ? 'Dashboard' : v === 'updates' ? 'Updates' : 'History'}
            </button>
          ))}
          {installing && (
            <button className="nav-link nav-progress active-pulse" onClick={() => setView('progress')}>
              Installing...
            </button>
          )}
        </div>
      </nav>

      {error && (
        <div className="app-error">
          <span>{error}</span>
          <button className="btn btn-ghost" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <main className="app-content">
        {view === 'dashboard' && (
          <Dashboard
            updates={updates}
            loading={loading}
            onNavigate={setView}
            onRefresh={refreshUpdates}
            lastRefresh={lastRefresh}
            installing={installing}
          />
        )}
        {view === 'updates' && (
          <UpdateList
            updates={updates}
            loading={loading}
            onInstall={handleInstall}
            onNavigate={setView}
          />
        )}
        {view === 'progress' && (
          <ProgressMonitor
            batchId={batchId}
            updates={installQueue}
            service={service}
            onComplete={handleInstallComplete}
            onNavigate={setView}
          />
        )}
        {view === 'history' && (
          <ActivityFeed
            service={service}
            onNavigate={setView}
          />
        )}
      </main>
    </div>
  )
}
