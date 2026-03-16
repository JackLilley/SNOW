import keytar from 'keytar';
import fs from 'fs';
import path from 'path';

const CLIENT_ID = '543e5655f77746a28228c6009a599dfb';

async function getStoredCreds() {
  const raw = await keytar.getPassword('ServiceNow', 'now-sdk');
  if (!raw) throw new Error('No credentials found in keychain (service=ServiceNow, account=now-sdk)');
  const keyStore = JSON.parse(raw);
  const defaultEntry = Object.values(keyStore).find(e => e.isDefault);
  if (!defaultEntry) throw new Error('No default credential set');
  console.log('Using alias:', defaultEntry.alias);
  console.log('Instance:', defaultEntry.creds.instanceUrl);
  return defaultEntry.creds;
}

async function refreshToken(creds) {
  if (creds.type !== 'oauth') {
    throw new Error('Basic auth not supported — needs OAuth credentials');
  }
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    refresh_token: creds.refresh_token,
  });
  const resp = await fetch(`${creds.instanceUrl}/oauth_token.do`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!resp.ok) throw new Error(`Token refresh failed (${resp.status})`);
  const data = await resp.json();
  console.log('Token refreshed');
  return data.access_token;
}

async function apiFetch(instanceUrl, token, path, options = {}) {
  const url = `${instanceUrl}${path}`;
  const resp = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
  });
  return resp;
}

async function findPage(instanceUrl, token) {
  const searches = [
    { q: 'name=update_center', label: 'name=update_center' },
    { q: 'name=update-center', label: 'name=update-center' },
    { q: 'nameSTARTSWITHupdate_center', label: 'name starts with update_center' },
    { q: 'nameSTARTSWITHupdate-center', label: 'name starts with update-center' },
    { q: 'nameCONTAINSupdate%20center', label: 'name contains update center' },
  ];

  for (const s of searches) {
    const resp = await apiFetch(instanceUrl, token,
      `/api/now/table/sys_ui_page?sysparm_query=${s.q}&sysparm_fields=sys_id,name,sys_scope,client_script,html&sysparm_limit=5`
    );
    if (resp.ok) {
      const data = await resp.json();
      if (data.result && data.result.length > 0) {
        console.log(`  Found ${data.result.length} page(s) matching "${s.label}":`);
        for (const p of data.result) {
          console.log(`    - sys_id: ${p.sys_id}, name: "${p.name}", scope: ${p.sys_scope}`);
          console.log(`      client_script: ${p.client_script?.length || 0} chars, html: ${p.html?.length || 0} chars`);
        }
        return data.result;
      }
    }
  }

  console.log('\n  Searching for ALL UI pages in x_g_s7s_updater scope...');
  const resp = await apiFetch(instanceUrl, token,
    `/api/now/table/sys_ui_page?sysparm_query=sys_scope.scope=x_g_s7s_updater&sysparm_fields=sys_id,name,sys_scope&sysparm_limit=20`
  );
  if (resp.ok) {
    const data = await resp.json();
    if (data.result && data.result.length > 0) {
      console.log(`  Found ${data.result.length} page(s) in scope:`);
      for (const p of data.result) {
        console.log(`    - sys_id: ${p.sys_id}, name: "${p.name}"`);
      }
      return data.result;
    }
  }

  return [];
}

async function updatePage(instanceUrl, token, sysId, html, clientScript) {
  const resp = await apiFetch(instanceUrl, token,
    `/api/now/table/sys_ui_page/${sysId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ html, client_script: clientScript }),
    }
  );
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`PATCH failed (${resp.status}): ${txt}`);
  }
  const data = await resp.json();
  console.log('  Updated:', data.result.sys_updated_on);
  return data.result;
}

async function main() {
  console.log('=== Direct Deploy to ServiceNow ===\n');

  const htmlContent = fs.readFileSync(path.resolve('src/fluent/ui-pages/update-center.html'), 'utf8');
  const clientScript = fs.readFileSync(path.resolve('src/fluent/ui-pages/update-center.client.js'), 'utf8');
  console.log(`Local files: HTML=${htmlContent.length} chars, JS=${clientScript.length} chars\n`);

  const creds = await getStoredCreds();
  console.log('');
  const token = await refreshToken(creds);

  console.log('\nSearching for update_center page...');
  const pages = await findPage(creds.instanceUrl, token);

  if (pages.length === 0) {
    console.log('\nNo matching UI page found. Cannot deploy.');
    return;
  }

  const targetPage = pages.find(p => p.name === 'update_center') || pages[0];
  console.log(`\nTarget: sys_id=${targetPage.sys_id}, name="${targetPage.name}"`);

  const scriptChanged = targetPage.client_script !== clientScript;
  const htmlChanged = targetPage.html !== htmlContent;
  console.log(`Script changed: ${scriptChanged}, HTML changed: ${htmlChanged}`);

  if (!scriptChanged && !htmlChanged) {
    console.log('\nNo changes needed — already up to date.');
    return;
  }

  console.log('\nPATCHing page...');
  await updatePage(creds.instanceUrl, token, targetPage.sys_id, htmlContent, clientScript);

  console.log('\nVerifying...');
  const resp = await apiFetch(creds.instanceUrl, token,
    `/api/now/table/sys_ui_page/${targetPage.sys_id}?sysparm_fields=client_script,html`
  );
  const verified = await resp.json();
  const ok = verified.result.client_script === clientScript && verified.result.html === htmlContent;
  console.log(`Verification: ${ok ? 'PASSED' : 'FAILED'}`);

  if (ok) {
    console.log('\n=== Deploy successful! Hard-refresh the page (Ctrl+Shift+R). ===');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
