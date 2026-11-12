import {db, compute} from "./firebase-config.js";
import {ref, onValue} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const H = 76, box = document.getElementById("rows"), els = {};
for (let i = 1; i <= 48; i++) {
  const d = document.createElement("div"); d.className = "row hide";
  d.innerHTML = '<b></b><span></span><i class="cu"></i><i></i><i></i><b class="tt"></b>';
  box.appendChild(d); els["p" + i] = d;
}
onValue(ref(db, "tournament"), s => {
  const t = s.val() || {};
  document.getElementById("title").textContent = (t.title || "SOLO BATTLE ROYALE").toUpperCase();
  document.getElementById("match").textContent = "MATCH " + (t.currentMatch || 1);
  compute(t).forEach((r, i) => {
    const d = els[r.id], c = d.children;
    d.style.transform = `translateY(${Math.min(i, 10) * H}px)`;
    d.classList.toggle("hide", i >= 10); d.classList.toggle("top3", i < 3);
    c[0].textContent = i + 1; c[1].textContent = r.name || "PLAYER " + r.n;
    c[2].textContent = r.cur ? "+" + r.cur : "–"; c[3].textContent = r.kills;
    c[4].textContent = r.pp; c[5].textContent = r.total;
  });
});
onValue(ref(db, ".info/connected"), s => {
  const c = document.getElementById("conn");
  c.className = s.val() ? "on" : "off"; c.textContent = s.val() ? "● ONLINE" : "RECONNECTING…";
});
