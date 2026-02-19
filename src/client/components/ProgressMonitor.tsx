import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { AvailableUpdate, AppView } from '../types'
import { UpdateService } from '../services/UpdateService'
import './ProgressMonitor.css'

interface ProgressMonitorProps {
  batchId: string | null
  updates: AvailableUpdate[]
  service: UpdateService
  onComplete: () => void
  onNavigate: (view: AppView) => void
}

interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

export default function ProgressMonitor({ batchId, updates, service, onComplete, onNavigate }: ProgressMonitorProps) {
  const [percent, setPercent] = useState(0)
  const [state, setState] = useState('Preparing...')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const startTime = useRef(Date.now())
  const logEndRef = useRef<HTMLDivElement>(null)

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message: msg, type }])
  }, [])

  useEffect(() => {
    if (!batchId) return

    addLog(`Batch installation started (${updates.length} app${updates.length > 1 ? 's' : ''})`)

    const poll = setInterval(async () => {
      try {
        const progress = await service.getBatchProgress(batchId)
        const pct = parseInt(progress.percent_complete) || 0
        setPercent(pct)
        setState(progress.state)

        if (progress.state !== state) {
          addLog(`Status: ${progress.state}`)
        }

        if (progress.state === 'Successful' || progress.state === 'Complete') {
          clearInterval(poll)
          setPercent(100)
          setFinished(true)
          addLog('Batch installation completed successfully!', 'success')
          onComplete()
        } else if (progress.state === 'Failed' || progress.state === 'Error') {
          clearInterval(poll)
          setFinished(true)
          setError('Installation failed. Check output for details.')
          addLog('Installation failed', 'error')
        }
      } catch (err) {
        addLog(`Polling error: ${(err as Error).message}`, 'warning')
      }
    }, 3000)

    return () => clearInterval(poll)
  }, [batchId])

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    if (finished) clearInterval(timer)
    return () => clearInterval(timer)
  }, [finished])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const statusColor = finished
    ? error ? 'var(--risk-high)' : 'var(--level-patch)'
    : 'var(--accent)'

  return (
    <div className="progress-monitor">
      <div className="progress-header">
        <button className="btn btn-ghost" onClick={() => onNavigate('dashboard')}>← Back</button>
        <h2>Installation Progress</h2>
        <div className="progress-timer">{service.formatDuration(elapsed)}</div>
      </div>

      <div className="progress-card">
        <div className="progress-status-row">
          <div className="progress-state" style={{ color: statusColor }}>
            {finished ? (error ? '✗ Failed' : '✓ Complete') : state}
          </div>
          <div className="progress-pct">{percent}%</div>
        </div>
        <div className="progress-bar-track">
          <div
            className={`progress-bar-fill ${finished && !error ? 'bar-done' : ''} ${error ? 'bar-error' : ''}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        {message && <div className="progress-message">{message}</div>}
        {error && <div className="progress-error">{error}</div>}
      </div>

      <div className="progress-apps">
        <h3>Applications ({updates.length})</h3>
        <div className="app-pill-list">
          {updates.map((u) => (
            <div className="app-pill" key={u.appSysId}>
              <span className="pill-name">{u.appName}</span>
              <span className="pill-ver">{u.installedVersion} → {u.latestVersion}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="activity-log">
        <h3>Activity Log</h3>
        <div className="log-container">
          {logs.length === 0 ? (
            <div className="log-empty">Waiting for activity...</div>
          ) : (
            logs.map((entry, i) => (
              <div className={`log-entry log-${entry.type}`} key={i}>
                <span className="log-time">{entry.time}</span>
                <span className="log-msg">{entry.message}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {finished && (
        <div className="progress-done-actions">
          <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
            Return to Dashboard
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('updates')}>
            Check for More Updates
          </button>
        </div>
      )}
    </div>
  )
}
