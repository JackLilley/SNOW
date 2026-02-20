import React from 'react'
import type { AvailableUpdate, AppView } from '../types'
import './Dashboard.css'

interface DashboardProps {
  updates: AvailableUpdate[]
  loading: boolean
  onNavigate: (view: AppView) => void
  onRefresh: () => void
  lastRefresh: Date | null
  installing: boolean
}

export default function Dashboard({ updates, loading, onNavigate, onRefresh, lastRefresh, installing }: DashboardProps) {
  const totalUpdates = updates.length
  const majorCount = updates.filter((u) => u.updateLevel === 'major').length
  const minorCount = updates.filter((u) => u.updateLevel === 'minor').length
  const patchCount = updates.filter((u) => u.updateLevel === 'patch').length
  const highRiskCount = updates.filter((u) => u.riskLevel === 'high' || u.riskLevel === 'critical').length
  const vendorCount = new Set(updates.map((u) => u.vendor)).size

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h2 className="dashboard-title">Update Center</h2>
          {lastRefresh && (
            <span className="last-refresh">
              Last checked: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
            {loading ? 'Scanning...' : 'Check for Updates'}
          </button>
          {installing && (
            <button className="btn btn-primary" onClick={() => onNavigate('progress')}>
              View Progress
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <button className="stat-card stat-total" onClick={() => onNavigate('updates')}>
          <div className="stat-value">{totalUpdates}</div>
          <div className="stat-label">Updates Available</div>
          <div className="stat-hint">Click to view all</div>
        </button>

        <div className="stat-card stat-major">
          <div className="stat-value">{majorCount}</div>
          <div className="stat-label">Major</div>
          <div className="stat-tag tag-major">Breaking changes possible</div>
        </div>

        <div className="stat-card stat-minor">
          <div className="stat-value">{minorCount}</div>
          <div className="stat-label">Minor</div>
          <div className="stat-tag tag-minor">New features</div>
        </div>

        <div className="stat-card stat-patch">
          <div className="stat-value">{patchCount}</div>
          <div className="stat-label">Patch</div>
          <div className="stat-tag tag-patch">Bug fixes</div>
        </div>
      </div>

      {highRiskCount > 0 && (
        <div className="risk-banner">
          <span className="risk-icon">⚠</span>
          <span>
            <strong>{highRiskCount}</strong> update{highRiskCount > 1 ? 's' : ''} flagged as elevated risk.
            Review before installing.
          </span>
        </div>
      )}

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-cards">
          <button className="action-card" onClick={() => onNavigate('updates')} disabled={totalUpdates === 0}>
            <div className="action-icon">📦</div>
            <div className="action-text">
              <div className="action-title">Install Updates</div>
              <div className="action-desc">Select and batch install store app updates</div>
            </div>
          </button>
          <button className="action-card" onClick={() => onNavigate('history')}>
            <div className="action-icon">📋</div>
            <div className="action-text">
              <div className="action-title">Installation History</div>
              <div className="action-desc">View past batch installation activity</div>
            </div>
          </button>
        </div>
      </div>

      {totalUpdates > 0 && (
        <div className="vendor-summary">
          <h3>By Vendor</h3>
          <div className="vendor-list">
            {Object.entries(
              updates.reduce<Record<string, number>>((acc, u) => {
                acc[u.vendor] = (acc[u.vendor] || 0) + 1
                return acc
              }, {})
            )
              .sort(([, a], [, b]) => b - a)
              .map(([vendor, count]) => (
                <div className="vendor-row" key={vendor}>
                  <span className="vendor-name">{vendor}</span>
                  <span className="vendor-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
