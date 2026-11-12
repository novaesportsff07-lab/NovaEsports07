// Firebase web config is NOT secret (it only identifies your project). Security comes from Database Rules + Auth.
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getDatabase} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const cfg = { // <-- paste YOUR values from Firebase Console > Project settings > Your apps
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(cfg);
export const db = getDatabase(app), auth = getAuth(app);
export const SLOTS = 48;

// Shared scoring: total = kills*killPoints + placementPoints[placement-1]; tiebreak = kills, then slot number
export function compute(t = {}) {
  const pl = t.players || {}, res = t.results || {}, kp = +(t.killPoints ?? 1), pp = t.placementPoints || [];
  const cur = "m" + (t.currentMatch || 1), rows = [];
  for (let n = 1; n <= SLOTS; n++) {
    const id = "p" + n; let k = 0, p = 0, c = 0;
    for (const m in res) {
      const r = res[m] && res[m][id]; if (!r) continue;
      const kk = +r.k || 0; k += kk;
      if (+r.r > 0) p += +pp[r.r - 1] || 0;
      if (m === cur) c = kk;
    }
    rows.push({id, n, name: ((pl[id] && pl[id].name) || "").trim(), kills: k, pp: p, total: k * kp + p, cur: c});
  }
  return rows.sort((a, b) => b.total - a.total || b.kills - a.kills || a.n - b.n);
}
