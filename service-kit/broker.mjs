// Kai broker client. Enrolls with the hosted control plane using the Retain enrollment
// token, then exposes ScreenConnect + OpenAI proxy calls. No raw provider keys needed.
import { readFileSync, existsSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

const CONTROL_URL = process.env.KAI_CONTROL_URL || 'https://control-plane-rho.vercel.app';
const APP_ID = process.env.KAI_RETAIN_APP_ID || 'kai-computer-retain-team';

function readTokenFromFile(file) {
  if (!existsSync(file)) return '';
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0 || line.slice(0, eq).trim() !== 'KAI_RETAIN_ENROLLMENT_TOKEN') continue;
    return line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

function discoverEnrollmentToken() {
  if (process.env.KAI_RETAIN_ENROLLMENT_TOKEN) return process.env.KAI_RETAIN_ENROLLMENT_TOKEN.trim();
  const home = homedir();
  const candidates = [
    join(home, '.kai-computer-retain', '.env.local'),
    join(home, '.kai-computer-retain', '.env'),
  ];
  if (platform() === 'darwin') {
    candidates.push(join(home, 'Library', 'Application Support', 'kai-computer-retain', '.env.local'));
    for (const app of ['Kai Computer.app', 'Kai Computer Canary.app']) {
      candidates.push(join('/Applications', app, 'Contents', 'Resources', 'app', 'config', 'retain-enrollment.env'));
    }
  } else if (platform() === 'win32') {
    const appdata = process.env.APPDATA || join(home, 'AppData', 'Roaming');
    const local = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');
    candidates.push(join(appdata, 'kai-computer-retain', '.env.local'));
    candidates.push(join(local, 'Programs', 'Kai Computer', 'resources', 'app', 'config', 'retain-enrollment.env'));
    candidates.push(join(local, 'Programs', 'Kai Computer Canary', 'resources', 'app', 'config', 'retain-enrollment.env'));
  }
  for (const file of candidates) {
    const token = readTokenFromFile(file);
    if (token) return token;
  }
  return '';
}

let cached;
export async function manifest() {
  if (cached) return cached;
  const token = discoverEnrollmentToken();
  if (!token) throw new Error('Kai enrollment token not found. Install and open the Kai Computer app first.');
  const deviceId = process.env.KAI_DEVICE_ID || `kai-service-${process.env.USER || process.env.USERNAME || 'tech'}`;
  const response = await fetch(`${CONTROL_URL}/v1/retain/manifest`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-kai-retain-enrollment': token },
    body: JSON.stringify({ deviceId, appId: APP_ID, channel: 'canary', version: '0.3.0' }),
  });
  const body = await response.json();
  if (!body?.runtime?.retainBrokerToken) throw new Error('Broker did not return runtime config.');
  cached = { ...body, deviceId };
  return cached;
}

function headers(m) {
  return {
    'content-type': 'application/json',
    authorization: `Bearer ${m.runtime.retainBrokerToken}`,
    'x-kai-retain-device': m.deviceId,
  };
}

export async function sc(m, method, args) {
  const response = await fetch(m.runtime.screenConnectRestProxyUrl, {
    method: 'POST', headers: headers(m),
    body: JSON.stringify({ deviceId: m.deviceId, method, args }),
  });
  const text = await response.text();
  try { return JSON.parse(text); } catch { return text; }
}
