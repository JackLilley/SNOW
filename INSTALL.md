# Batch Store Update Installer - Clean Install Guide

## Quick Start (Automated)

### Option 1: Via REST API (Recommended)
Once the app is deployed, run this command to install:

```bash
curl -X GET \
  'https://dev225880.service-now.com/api/now/x_g_s7s/batch-install?action=install' \
  -H 'Authorization: Basic <base64-encoded-credentials>'
```

**Actions available:**
- `?action=install` - Full installation (creates tables, indexes, defaults)
- `?action=verify` - Check installation status
- `?action=uninstall` - Remove tables and data

### Option 2: Via Script Console (Manual)
1. Open **System Diagnostic** → **Script Console**
2. Run:
```javascript
var installer = new BatchUpdateInstaller();
var result = installer.install();
gs.info(JSON.stringify(result));
```

## What Gets Created

The installer automatically creates:

- **x_g_s7s_batch_update** table
  - Fields: name, store_name, status, progress, total_items, processed_items, error_message, created_at, started_at, completed_at
  
- **x_g_s7s_update_log** table
  - Fields: batch_id, message, severity, logged_at

- **System Properties**
  - `x_g_s7s_batch_update.max_batch_size` (default: 100)

- **Choice Values**
  - Status: pending, in_progress, completed, failed

## Verification

After installation, verify everything is ready:

```javascript
var installer = new BatchUpdateInstaller();
var status = installer.verify();
gs.info(JSON.stringify(status));
```

Expected output:
```json
{
  "batchTableExists": true,
  "logTableExists": true,
  "ready": true
}
```

## First Run: Create a Batch

```javascript
var batchInstaller = new BatchStoreUpdateInstaller();
var batchId = batchInstaller.createBatch('Store-001', 50);
gs.info('Created batch: ' + batchId);
```

## Scheduled Job Setup

1. Go to **System Scheduler** → **Scheduled Jobs** → **New**
2. Fill in:
   - **Name:** `Batch Update Processor`
   - **Script:** `var installer = new BatchStoreUpdateInstaller(); installer.processPendingBatches();`
   - **Run:** Every 5 minutes (or your preference)
3. Save and activate

## Troubleshooting

**Tables already exist?**
```javascript
var installer = new BatchUpdateInstaller();
installer.createBatchTable(); // Will skip if exists
```

**Clear all data:**
```javascript
var installer = new BatchUpdateInstaller();
installer.uninstall();
```

**Check logs:**
- Search for `BatchUpdate` in System Logs
- View batch details in `x_g_s7s_batch_update` table
- View progress in `x_g_s7s_update_log` table

## API Reference

### Create Batch
```javascript
var batchInstaller = new BatchStoreUpdateInstaller();
var batchId = batchInstaller.createBatch('StoreName', 100); // Returns batch ID
```

### Get Batch Status
```javascript
var batchInstaller = new BatchStoreUpdateInstaller();
var status = batchInstaller.getBatchStatus(batchId);
// Returns: { id, storeName, status, progress, totalItems, processedItems, ... }
```

### Process Batches
```javascript
var batchInstaller = new BatchStoreUpdateInstaller();
batchInstaller.processPendingBatches(); // Processes all pending batches
```

## No Manual Setup Required!

The app now handles everything on first deployment. Just:
1. Deploy the app to ServiceNow
2. Call the REST endpoint or script console to install
3. Start creating batches!
