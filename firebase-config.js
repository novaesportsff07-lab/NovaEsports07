// Firebase web config is NOT secret (it only identifies your project). Security comes from Database Rules + Auth.
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getDatabase} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const cfg = {
  apiKey: "AIzaSyBo0cDCnUiBAwItf2FnAhY89BVcYTvBqdU",
  authDomain: "nova-esports-scoreboard.firebaseapp.com",
  databaseURL: "https://nova-esports-scoreboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nova-esports-scoreboard",
  storageBucket: "nova-esports-scoreboard.firebasestorage.app",
  messagingSenderId: "789480527680",
  appId: "1:789480527680:web:0daac0fdb8b533b5a0cca5"
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
