import React from 'react'
import type { AvailableUpdate } from '../types'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  updates: AvailableUpdate[]
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ updates, onConfirm, onCancel }: ConfirmDialogProps) {
  const majorCount = updates.filter((u) => u.updateLevel === 'major').length
  const hasMajor = majorCount > 0

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">Confirm Batch Installation</h3>
        <p className="dialog-subtitle">
          You are about to install <strong>{updates.length}</strong> update{updates.length > 1 ? 's' : ''}.
        </p>

        {hasMajor && (
          <div className="dialog-warning">
            ⚠ {majorCount} major version update{majorCount > 1 ? 's' : ''} included.
            Major updates may contain breaking changes.
          </div>
        )}

        <div className="dialog-list">
          {updates.map((u) => (
            <div className="dialog-item" key={u.appSysId}>
              <span className="dialog-app-name">{u.appName}</span>
              <span className="dialog-version">
                {u.installedVersion} → {u.latestVersion}
              </span>
              <span className={`dialog-level level-${u.updateLevel}`}>
                {u.updateLevel}
              </span>
            </div>
          ))}
        </div>

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Install {updates.length} Update{updates.length > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
