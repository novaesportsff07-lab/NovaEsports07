import {db} from "./firebase-config.js";
import {compute, pname, SIZE, MAXR} from "./cs-core.js";
import {ref, onValue} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const $ = id => document.getElementById(id), pips = $("pips");
for (let i = 0; i < MAXR; i++) pips.appendChild(document.createElement("i"));

function players(box, team, n) {
  box.replaceChildren(...Array.from({length: n}, (_, i) => {
    const s = document.createElement("span"); s.textContent = pname(team, i) || "PLAYER " + (i + 1); return s;
  }));
}
onValue(ref(db, "csTournament"), s => {
  const t = s.val() || {}, c = compute(t), n = SIZE[c.mode];
  $("ttl").textContent = String(t.title || "CLASH SQUAD").toUpperCase();
  $("mode").textContent = c.mode.toUpperCase();
  $("an").textContent = c.nameA; $("bn").textContent = c.nameB;
  players($("ap"), t.teamA, n); players($("bp"), t.teamB, n);
  $("as").textContent = c.a; $("bs").textContent = c.b;
  $("rd").textContent = c.done ? "FINAL" : "ROUND " + c.round + " / " + MAXR;
  [...pips.children].forEach((e, i) => e.className = c.history[i] ? "w" + c.history[i] : (i === c.played && !c.done ? "cur" : ""));
  $("win").hidden = !c.done;
  if (c.done) {
    $("wn").textContent = c.winner === "A" ? c.nameA : c.nameB;
    $("ws").textContent = c.a + " – " + c.b;
  }
});
onValue(ref(db, ".info/connected"), s => {
  const c = $("conn");
  c.className = s.val() ? "on" : "off"; c.textContent = s.val() ? "● ONLINE" : "RECONNECTING…";
});
