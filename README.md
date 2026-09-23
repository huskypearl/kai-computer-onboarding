# Kai Computer — Onboarding

Kai Computer lets an IT professional service a customer's Windows PC over ScreenConnect by simply
**telling Kai what to do**. Kai drives the ScreenConnect viewer with computer use (the same way you
would with a mouse and keyboard) and uses a hidden admin terminal only when it's faster. You prompt
it right inside the Kai Computer app, or from Codex — same result.

## One-time setup (paste this into Codex)

Open Codex on your Windows PC, start a new thread, and paste the prompt below. It walks you through
everything and checks each step.

```text
You are helping me set up "Kai Computer" for remote IT support on THIS Windows PC.
Do these steps in order, confirm each with the check shown, and only stop if a step truly fails.

1. Prerequisites (install silently with winget if missing, then verify):
   - Node.js LTS:  winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
   - Codex CLI:    npm install -g @openai/codex
   Verify:  node -v   and   codex --version   both print a version.

2. Codex computer use + model:
   - In the Codex desktop app: Settings → Plugins → Computer Use → Install, then restart and sign in.
   - This thread must run model gpt-6-astra, Fast mode, reasoning Extra High.

3. Install the Kai Computer app:
   - Download the latest zip from Releases:
     https://github.com/huskypearl/kai-computer-onboarding/releases/latest
   - Unzip it and run "Kai Computer.exe" (if SmartScreen warns: More info → Run anyway).
   - On first launch it enrolls with the Kai broker and writes a toolkit to  %USERPROFILE%\kai-service .

4. Sign your support emails. Create/append this file:  %USERPROFILE%\.kai-computer-retain\.env.local
       KAI_TECH_NAME=Steve Hamrell
       KAI_TECH_ID=steve
   Then restart the Kai Computer app.

5. Verify the toolkit is connected:
   cd %USERPROFILE%\kai-service
   node kai-session.mjs list
   It should print connected ScreenConnect sessions with no error.

6. Done. Tell me you're ready and I'll summarize how to run a support session.
```

> Clone this repo too if you want to pull updates or suggest changes:
> `git clone https://github.com/huskypearl/kai-computer-onboarding`

## Before your first session: sign into ScreenConnect

Kai creates sessions and runs the hidden terminal through a built-in broker (no login needed for
that). But **opening the remote viewer** loads the ScreenConnect web console, which needs you signed
in. Do this once, first:

1. Go to **https://justanswer.screenconnect.com** and sign in with the account provided to you.
2. Leave that signed in. Now "Open remote viewer" in Kai will show the customer's screen instead of a
   login page.

## Running a support session (day to day)

1. Open **Kai Computer**.
2. **Invite by email** (enter the customer's name + email — the support email is pre-written and
   editable, expand it to tweak) or **Connect by code** if they already have one.
3. When the customer connects, the workspace opens with a screenshot confirming you're on their PC.
4. Click **Open remote viewer** so the ScreenConnect window is up, then just **tell Kai what to do**
   in the prompt box — e.g. *"Uninstall and reinstall NordVPN, then show me disk space."*
5. Kai works on their screen (you can watch the viewer) and reports back. Keep prompting to steer.
6. Click **End & clean up** when you're done.

Everything Kai puts on the customer's machine is removed when the session ends.

## How it works (the short version)

- **Kai Computer app** — your console: invites/connects over ScreenConnect through a hosted broker
  (no keys to manage), shows the one proof screenshot, and hosts the promptable Kai thread.
- **`~/kai-service`** — the toolkit the app writes for you:
  - `AGENTS.md` — how Kai operates the computer (viewer first, terminal as last resort).
  - `sc-run.mjs` — runs admin PowerShell on the customer PC in the background (raw output).
  - `kai-session.mjs` — list/select the connected customer.
  - `kai` — prompt Kai from the terminal instead of the app, same thread.
- Kai runs on **gpt-6-astra**, Fast mode, Extra High reasoning.

## Contributing

This repo is yours to improve. Tweak the operator guide in `service-kit/AGENTS.md`, adjust helpers,
and open a pull request — updates flow back into the toolkit.
