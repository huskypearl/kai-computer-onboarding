#!/usr/bin/env node
// Run PowerShell on the connected customer PC through ScreenConnect (as SYSTEM, hidden from
// the customer). Prints RAW stdout/stderr — no summarizing, translating, or filtering.
// Usage: node sc-run.mjs '<PowerShell>'        session id from KAI_SC_SESSION or ./session.txt
import { readFileSync } from 'node:fs';
import { manifest, sc } from './broker.mjs';

const here = new URL('.', import.meta.url).pathname;
let sessionId = process.env.KAI_SC_SESSION || '';
if (!sessionId) { try { sessionId = readFileSync(here + 'session.txt', 'utf8').trim(); } catch {} }
if (!sessionId) { console.error('No session. Set KAI_SC_SESSION or write session.txt.'); process.exit(2); }

const command = process.argv.slice(2).join(' ') || readFileSync(0, 'utf8');
const id = Date.now().toString(36);
const begin = `KAI_BEGIN_${id}`, end = `KAI_END_${id}`;
const script = [
  '#!ps', '#timeout=300000', '#maxlength=1000000',
  `Write-Output '${begin}'`,
  `try { & { ${command} } 2>&1 | Out-String -Width 240 | Write-Output } catch { Write-Output ("ERROR: " + $_) }`,
  `Write-Output '${end}'`,
].join('\n');

const m = await manifest();
await sc(m, 'SendCommandToSession', [sessionId, script]);
const deadline = Date.now() + 300000;
const marker = new RegExp(`${begin}\\r?\\n([\\s\\S]*?)${end}(?!')`);
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 1200));
  const details = await sc(m, 'GetSessionDetailsBySessionID', [sessionId]).catch(() => null);
  for (const event of details?.Events ?? []) {
    const found = String(event.Data ?? '').match(marker);
    if (found) { process.stdout.write(found[1].trimEnd() + '\n'); process.exit(0); }
  }
}
console.error('Timed out waiting for ScreenConnect command output.');
process.exit(1);
