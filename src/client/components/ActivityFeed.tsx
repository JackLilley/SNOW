import React, { useState, useEffect } from 'react'
import type { AppView } from '../types'
import { UpdateService } from '../services/UpdateService'
import './ActivityFeed.css'

interface ActivityFeedProps {
  service: UpdateService
  onNavigate: (view: AppView) => void
}

interface HistoryEntry {
  sys_id: string
  name: string
  state: string
  percentComplete: number
  message: string
  createdOn: string
}

export default function ActivityFeed({ service, onNavigate }: ActivityFeedProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        sysparm_display_value: 'all',
        sysparm_fields: 'sys_id,name,state,percent_complete,message,sys_created_on',
        sysparm_query: 'nameSTARTSWITHBatch^ORnameSTARTSWITHUpdate Center^ORDERBYDESCsys_created_on',
        sysparm_limit: '50',
      })

      const response = await fetch(`/api/now/table/sys_progress_worker?${params}`, {
        headers: {
          Accept: 'application/json',
          'X-UserToken': window.g_ck,
        },
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const { result } = await response.json()

      setEntries(
        (result || []).map((r: any) => ({
          sys_id: r.sys_id?.value || '',
          name: r.name?.display_value || r.name?.value || 'Unknown',
          state: r.state?.display_value || r.state?.value || '',
          percentComplete: parseInt(r.percent_complete?.value) || 0,
          message: r.message?.display_value || r.message?.value || '',
          createdOn: r.sys_created_on?.display_value || '',
        }))
      )
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const stateIcon = (state: string) => {
    const s = state.toLowerCase()
    if (s.includes('success') || s.includes('complete')) return '✓'
    if (s.includes('fail') || s.includes('error')) return '✗'
    if (s.includes('running') || s.includes('progress')) return '⟳'
    return '•'
  }

  const stateClass = (state: string) => {
    const s = state.toLowerCase()
    if (s.includes('success') || s.includes('complete')) return 'state-success'
    if (s.includes('fail') || s.includes('error')) return 'state-error'
    if (s.includes('running') || s.includes('progress')) return 'state-running'
    return 'state-other'
  }

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <button className="btn btn-ghost" onClick={() => onNavigate('dashboard')}>← Back</button>
        <h2>Installation History</h2>
        <button className="btn btn-secondary" onClick={loadHistory} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="feed-loading">Loading history...</div>
      ) : entries.length === 0 ? (
        <div className="feed-empty">No installation history found.</div>
      ) : (
        <div className="feed-list">
          {entries.map((entry) => (
            <div className={`feed-item ${stateClass(entry.state)}`} key={entry.sys_id}>
              <div className="feed-icon">{stateIcon(entry.state)}</div>
              <div className="feed-content">
                <div className="feed-item-name">{entry.name}</div>
                <div className="feed-item-meta">
                  {entry.createdOn && <span>{entry.createdOn}</span>}
                  <span className="feed-state">{entry.state}</span>
                  {entry.percentComplete > 0 && <span>{entry.percentComplete}%</span>}
                </div>
                {entry.message && <div className="feed-item-message">{entry.message}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
