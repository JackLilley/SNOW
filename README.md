# SNOW Update Center

Batch Store update installer for ServiceNow with real-time progress monitoring. Built as a NowSDK application with React/TypeScript.

## What it does

- Scans your instance for store apps with available updates
- Displays updates categorized by type (major/minor/patch) with risk assessment
- Lets you select multiple apps and batch install them via the CI/CD API
- Shows real-time installation progress with an activity log
- Tracks installation history

## Project Structure

```
src/
  client/              # React UI (TypeScript + CSS)
    app.tsx            # Main app with view routing
    components/
      Dashboard.tsx    # Overview with stats and quick actions
      UpdateList.tsx   # Filterable update list with batch select
      ConfirmDialog.tsx# Pre-install confirmation
      ProgressMonitor.tsx # Real-time install progress + activity log
      ActivityFeed.tsx # Installation history from sys_progress_worker
    services/
      UpdateService.ts # API layer (Table API + CI/CD batch install)
    types/
      index.ts         # TypeScript interfaces
  fluent/              # NowSDK fluent API definitions
    ui-pages/
      update-center.now.ts  # Registers the UI Page
  server/              # Server-side TypeScript
```

## Prerequisites

- ServiceNow instance with the **CI/CD Spoke** plugin (`sn_cicd`) active
- NowSDK CLI installed (`npm i -g @servicenow/sdk`)
- App linked to instance via `now-sdk configure`

## Development

```bash
npm install
now-sdk build     # Build for deployment
now-sdk install   # Deploy to instance
```

After deployment, navigate to:
`https://<instance>.service-now.com/x_g_s7s_updater_update_center.do`

## API Dependencies

The app calls these ServiceNow APIs from the client:

| API | Purpose |
|-----|---------|
| `GET /api/now/table/sys_store_app` | List apps with available updates |
| `GET /api/now/table/sys_app_version` | Get available versions per app |
| `POST /api/sn_cicd/app/batch/install` | Trigger batch installation |
| `GET /api/sn_cicd/progress/{id}` | Poll installation progress |
| `GET /api/now/table/sys_progress_worker` | Installation history |

## Scope

- **Scope**: `x_g_s7s_updater`
- **Scope ID**: `67d384af87c7b610375662060cbb35be`
