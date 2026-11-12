import {db, auth} from "./firebase-config.js";
import {ref, onValue, update} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const $ = id => document.getElementById(id);
let rows = [], started = false;
const when = t => t ? new Date(t).toLocaleString("en-IN", {timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short"}) + " IST" : "";

$("lf").onsubmit = async e => {
  e.preventDefault(); $("err").textContent = "";
  try { await signInWithEmailAndPassword(auth, $("em").value, $("pw").value); }
  catch (x) { $("err").textContent = "Login failed: " + x.code; }
};
$("out").onclick = () => signOut(auth);
onAuthStateChanged(auth, u => { $("login").hidden = !!u; $("app").hidden = !u; if (u && !started) start(); });

function start() {
  started = true;
  onValue(ref(db, "csRegistrations"), s => {
    const v = s.val() || {};
    rows = Object.keys(v).map(id => ({id, ...v[id]})).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    render();
  }, err => alert("Registrations nahi khul rahi (admin login / rules check karo): " + err.message));
  onValue(ref(db, ".info/connected"), s => {
    const c = $("conn"); c.className = "pill " + (s.val() ? "on" : "off"); c.textContent = s.val() ? "ONLINE" : "OFFLINE";
  });
}
const hit = (r, q) => [r.team, r.p1ign, r.p1uid, r.p2ign, r.p2uid].some(x => String(x || "").toLowerCase().includes(q));
function render() {
  const q = $("q").value.trim().toLowerCase(), shown = rows.filter(r => !q || hit(r, q));
  $("count").textContent = "(" + rows.length + ")";
  $("empty").hidden = rows.length > 0;
  $("list").replaceChildren(...shown.map(r => {
    const d = document.createElement("div"); d.className = "row";
    const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; e.textContent = txt; return e; };
    const del = mk("button", "danger", "DELETE");
    del.onclick = () => {
      if (!confirm("Delete team '" + r.team + "'? Dono UIDs dobara register ho sakenge.")) return;
      update(ref(db), {["csRegistrations/" + r.id]: null, ["csUids/" + r.p1uid]: null, ["csUids/" + r.p2uid]: null})
        .catch(e => alert("Delete failed: " + e.message));
    };
    d.append(mk("b", "", r.team), mk("div", "d", "P1: " + r.p1ign + " • " + r.p1uid), mk("div", "d", "P2: " + r.p2ign + " • " + r.p2uid), mk("div", "t", when(r.createdAt)), del);
    return d;
  }));
}
$("q").oninput = render;

// CSV: quote every cell; neutralise spreadsheet formulas (= + - @ at start)
const cell = x => { let s = String(x ?? ""); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
$("csv").onclick = () => {
  const head = ["Team Name", "Player 1 IGN", "Player 1 UID", "Player 2 IGN", "Player 2 UID", "Registered (IST)"];
  const body = rows.map(r => [r.team, r.p1ign, r.p1uid, r.p2ign, r.p2uid, when(r.createdAt)]);
  const text = "﻿" + [head, ...body].map(l => l.map(cell).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], {type: "text/csv;charset=utf-8"}));
  a.download = "cs-2v2-registrations.csv"; document.body.appendChild(a); a.click(); a.remove();
};
