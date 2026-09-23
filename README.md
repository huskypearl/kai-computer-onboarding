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
Do these steps in order, confirming each before moving on. Only stop to ask me if a step truly fails.

1. Make sure the Codex "Computer Use" plugin is installed and enabled
   (Settings → Plugins → Computer Use → Install, then restart if needed).
   Set this thread to model gpt-6-astra, Fast mode, reasoning Extra High.

2. Install the Kai Computer app:
   - Download the Windows installer from https://mlabs.life/kai  (password: ask Joe).
   - Run the installer, then launch "Kai Computer" once. On first launch it enrolls with the
     Kai broker and writes a toolkit to your home folder at  %USERPROFILE%\kai-service .

3. Clone this onboarding repo (so you can pull updates and suggest changes):
   git clone https://github.com/huskypearl/kai-computer-onboarding

4. Verify the toolkit is connected. In a terminal:
   cd %USERPROFILE%\kai-service
   node kai-session.mjs list
   It should print connected ScreenConnect sessions with no error.

5. You're ready. Tell me you're done and I'll summarize how to run a support session.
```

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
