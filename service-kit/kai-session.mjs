#!/usr/bin/env node
// List/select the connected customer session for this technician.
//   node kai-session.mjs list          → show connected sessions
//   node kai-session.mjs use <code>    → pin a session (by code or id) to session.txt
import { writeFileSync } from 'node:fs';
import { manifest, sc } from './broker.mjs';
const here = new URL('.', import.meta.url).pathname;
const [cmd, arg] = process.argv.slice(2);
const m = await manifest();
if (cmd === 'use' && arg) {
  const list = await sc(m, 'GetSessionsByFilter', ["GuestConnectedCount > 0"]);
  const hit = (Array.isArray(list) ? list : []).find(
    (s) => s.Code === arg || s.SessionID === arg || String(s.Name || '').includes(arg));
  const id = hit?.SessionID || arg;
  writeFileSync(here + 'session.txt', id + '\n');
  console.log(`Pinned session ${id}${hit ? ` (${hit.Name})` : ''}`);
} else {
  const list = await sc(m, 'GetSessionsByFilter', ["GuestConnectedCount > 0"]);
  for (const s of (Array.isArray(list) ? list : []))
    console.log(`${s.Code ?? '-----'}  ${s.SessionID}  ${s.GuestInfo?.MachineName ?? s.Name}  ${s.GuestInfo?.OperatingSystemName ?? ''}`);
}
