# NOVA ESPORTS – CS 2v2 Registration

Files: `cs-2v2.html`, `cs-2v2.js` (public registration), `cs-2v2-admin.html`, `cs-2v2-admin.js` (admin dashboard), `cs-2v2.css`. Uses the shared `firebase-config.js`.

URLs (GitHub Pages):
- Registration: `https://novaesportsff07-lab.github.io/NovaEsports07/cs-2v2.html`
- Admin:        `https://novaesportsff07-lab.github.io/NovaEsports07/cs-2v2-admin.html`

## How it works
- A team registers with Team Name + Player 1/2 IGN and UID. Data is saved under `/csRegistrations/<id>`.
- Each UID is also locked under `/csUids/<uid>` in the same atomic write, so a UID cannot be registered twice.
- After saving, the page shows two WhatsApp buttons (Admin 1: +91 9911811998, Admin 2: +91 9274296501) that open a pre-filled message. **The message is only sent when the player presses Send in WhatsApp.** This is not automatic delivery (that needs the WhatsApp Business Cloud API plus a backend).
- Admin dashboard: log in with the admin account, search, delete a team (frees its UIDs), download CSV.

## Firebase rules (replace everything in Realtime Database → Rules, then Publish)
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
    },
    "csRegistrations": {
      ".read": "auth != null && auth.uid === 'BPFUMUiQ4NMCDDDlWnBI7CbSpxI2'",
      ".write": "auth != null && auth.uid === 'BPFUMUiQ4NMCDDDlWnBI7CbSpxI2'",
      "$id": {
        ".write": "!data.exists() && newData.exists()",
        ".validate": "newData.hasChildren(['team','p1ign','p1uid','p2ign','p2uid','createdAt']) && newData.child('p1uid').val() !== newData.child('p2uid').val()",
        "team": {".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 30"},
        "p1ign": {".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 24"},
        "p2ign": {".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 24"},
        "p1uid": {".validate": "newData.isString() && newData.val().matches(/^[0-9]{8,12}$/)"},
        "p2uid": {".validate": "newData.isString() && newData.val().matches(/^[0-9]{8,12}$/)"},
        "createdAt": {".validate": "newData.isNumber() && newData.val() <= now"},
        "$other": {".validate": false}
      }
    },
    "csUids": {
      ".write": "auth != null && auth.uid === 'BPFUMUiQ4NMCDDDlWnBI7CbSpxI2'",
      "$uid": {
        ".write": "!data.exists() && newData.exists() && $uid.matches(/^[0-9]{8,12}$/)",
        ".validate": "newData.val() === true"
      }
    }
  }
}
```
Public visitors can only **create** a new registration (never read, edit or delete one). Only the admin UID can read the list or delete.
