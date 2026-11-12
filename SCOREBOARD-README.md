# NOVA ESPORTS – Free Fire Solo BR Live Scoreboard (48 players)
Static site (HTML/CSS/JS) + Firebase Realtime Database + Firebase Auth. Works on GitHub Pages.
Files: `admin.html` (admin), `scoreboard.html` (OBS), `style.css`, `admin.js`, `scoreboard.js`, `firebase-config.js`. The existing site pages (`index.html`, `cs.html`) are separate and unchanged.

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com → **Add project** (Analytics not needed).
2. **Build → Realtime Database → Create database** → pick a region → start in **locked mode**.
3. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.
4. **Authentication → Users → Add user**: enter YOUR admin email + strong password. Copy the user's **UID**.
   (Optionally disable new sign-ups in Authentication → Settings → User actions.)
5. **Project settings (gear) → Your apps → Web (`</>`)** → register app → copy the `firebaseConfig` values into `firebase-config.js`.
   These values are not secrets; the rules below are what protect your data. Never put a service-account key or your password in the code.
6. **Realtime Database → Rules** → paste (replace `ADMIN_UID`) → **Publish**:
```json
{
  "rules": {
    "tournament": {
      ".read": true,
      ".write": "auth != null && auth.uid === 'ADMIN_UID'"
    }
  }
}
```
Anyone can *view* scores (needed for OBS); only your admin account can *change* them.

## 2. Deploy on GitHub Pages
1. Create a GitHub repo and upload all files to the root.
2. **Settings → Pages → Deploy from branch → main / (root)** → Save.
3. Wait ~1 minute. Your URLs: `https://USER.github.io/REPO/admin.html` (admin) and `https://USER.github.io/REPO/scoreboard.html` (OBS).
4. Firebase Console → Authentication → Settings → **Authorized domains** → add `USER.github.io`.
(You can also test locally: `python3 -m http.server` then open `http://localhost:8000` – ES modules need http, not file://.)

## 3. First run
1. Open the admin URL, sign in. Status pill shows ONLINE.
2. **Scoring & Event**: set the title, points per kill (default 1), and the **placement points** for ranks 1–48 (defaults are 0 – enter your own rules). Save.
3. **Players**: enter the 48 names → Save.
4. **Match Results**: enter kills + placement for each player → **Save Match**. Use **+ Add Match** for more rounds and **Set as live match** to change the match number on stream.
5. **Standings** shows totals. Total = kills × kill points + placement points; ties → more kills first.
6. **Load Test Data** fills fake players/results for testing only – use **Reset Scores** (type RESET) before the real event.

## 4. OBS Studio
1. Sources → **+ → Browser**, name it "NOVA Scoreboard".
2. URL: your `.../scoreboard.html`. Width **1920**, Height **1080**.
3. Leave **Custom CSS** empty (the page is already transparent), tick **Shutdown source when not visible** (optional) and **Refresh browser when scene becomes active**. FPS 30 or 60.
4. Do NOT tick "Local file". Resize to fill the canvas (Ctrl+F). Base canvas should be 1920×1080.
The scoreboard updates instantly when you save in the admin panel. A small "RECONNECTING…" tag appears if the internet drops; it keeps showing the last data and resyncs automatically. Admin changes made offline are sent once reconnected (keep the admin tab open).

## Notes
- Scoreboard shows the top 10; the "THIS M" column shows kills in the live match.
- No official Free Fire scoring is assumed – you define placement points.
