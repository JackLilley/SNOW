import React, { useState, useMemo } from 'react'
import type { AvailableUpdate, FilterLevel, AppView } from '../types'
import ConfirmDialog from './ConfirmDialog'
import './UpdateList.css'

interface UpdateListProps {
  updates: AvailableUpdate[]
  loading: boolean
  onInstall: (selected: AvailableUpdate[]) => void
  onNavigate: (view: AppView) => void
}

export default function UpdateList({ updates, loading, onInstall, onNavigate }: UpdateListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FilterLevel>('all')
  const [search, setSearch] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const filtered = useMemo(() => {
    let list = updates
    if (filter !== 'all') list = list.filter((u) => u.updateLevel === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((u) => u.appName.toLowerCase().includes(q) || u.scope.toLowerCase().includes(q))
    }
    return list
  }, [updates, filter, search])

  const allVisibleSelected = filtered.length > 0 && filtered.every((u) => selected.has(u.appSysId))

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((u) => next.delete(u.appSysId))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((u) => next.add(u.appSysId))
        return next
      })
    }
  }

  const selectedUpdates = updates.filter((u) => selected.has(u.appSysId))

  const handleInstallClick = () => {
    if (selectedUpdates.length > 0) setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    onInstall(selectedUpdates)
  }

  const levelIcon = (level: string) => {
    switch (level) {
      case 'major': return '🔴'
      case 'minor': return '🟡'
      case 'patch': return '🟢'
      default: return '⚪'
    }
  }

  const riskBadge = (risk: string) => {
    const cls = `risk-badge risk-${risk}`
    return <span className={cls}>{risk}</span>
  }

  return (
    <div className="update-list">
      <div className="update-list-header">
        <button className="btn btn-ghost" onClick={() => onNavigate('dashboard')}>← Back</button>
        <h2>Available Updates</h2>
        <div className="header-spacer" />
      </div>

      <div className="update-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-group">
          {(['all', 'major', 'minor', 'patch'] as FilterLevel[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="selection-bar">
        <label className="select-all-label">
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} />
          <span>{selected.size} of {updates.length} selected</span>
        </label>
        <button
          className="btn btn-primary"
          disabled={selected.size === 0 || loading}
          onClick={handleInstallClick}
        >
          Install Selected ({selected.size})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Scanning for updates...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {updates.length === 0 ? 'All apps are up to date!' : 'No updates match your filter.'}
        </div>
      ) : (
        <div className="update-table">
          <div className="table-header">
            <div className="col-check" />
            <div className="col-name">Application</div>
            <div className="col-version">Installed</div>
            <div className="col-arrow" />
            <div className="col-version">Available</div>
            <div className="col-level">Type</div>
            <div className="col-risk">Risk</div>
            <div className="col-vendor">Vendor</div>
          </div>
          {filtered.map((u) => (
            <div className={`table-row ${selected.has(u.appSysId) ? 'row-selected' : ''}`} key={u.appSysId}>
              <div className="col-check">
                <input
                  type="checkbox"
                  checked={selected.has(u.appSysId)}
                  onChange={() => toggleOne(u.appSysId)}
                />
              </div>
              <div className="col-name">
                <span className="app-name">{u.appName}</span>
                <span className="app-scope">{u.scope}</span>
              </div>
              <div className="col-version mono">{u.installedVersion}</div>
              <div className="col-arrow">→</div>
              <div className="col-version mono">{u.latestVersion}</div>
              <div className="col-level">{levelIcon(u.updateLevel)} {u.updateLevel}</div>
              <div className="col-risk">{riskBadge(u.riskLevel)}</div>
              <div className="col-vendor">{u.vendor}</div>
            </div>
          ))}
        </div>
      )}

      {showConfirm && (
        <ConfirmDialog
          updates={selectedUpdates}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
