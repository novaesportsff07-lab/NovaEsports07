# NOVA ESPORTS – Clash Squad (CS) Live Scoreboard

Separate from the Battle Royale scoreboard. Uses the same Firebase project and the same admin login.

Files: `cs-admin.html`, `cs-admin.js` (admin), `cs-scoreboard.html`, `cs-scoreboard.js` (OBS), `cs-core.js` (scoring logic), `cs-style.css`. Shared: `firebase-config.js` (unchanged).

URLs (GitHub Pages):
- Admin: `https://novaesportsff07-lab.github.io/NovaEsports07/cs-admin.html`
- OBS:   `https://novaesportsff07-lab.github.io/NovaEsports07/cs-scoreboard.html`

## Firebase rules (publish once)
Realtime Database → Rules → replace with the rules below → Publish. The `tournament` block is the existing BR scoreboard; `csTournament` is new.

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "tournament": {
      ".read": true,
      ".write": "auth != null && auth.uid === 'BPFUMUiQ4NMCDDDlWnBI7CbSpxI2'"
    },
    "csTournament": {
      ".read": true,
      ".write": "auth != null && auth.uid === 'BPFUMUiQ4NMCDDDlWnBI7CbSpxI2'"
    }
  }
}
```

## Using it
1. Open the CS admin URL and sign in (same email/password as the BR admin).
2. **Match setup**: pick 1v1 / 2v2 / 4v4, enter team names and player names → **Save setup**.
3. After every round tap **Team A wins round** or **Team B wins round**. The OBS scoreboard updates instantly.
4. First team to 7 round wins ends the match; the winner banner appears automatically.
5. Wrong tap? **Undo last round**. New match? **Reset match** (team names are kept).

## OBS
Sources → + → Browser, URL = the CS OBS URL, Width 1920, Height 1080. Leave Custom CSS empty (page is transparent).

Data is stored under `/csTournament` only. Anyone can read it (needed for OBS); only the admin UID can write.
