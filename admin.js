import {db, auth, compute, SLOTS} from "./firebase-config.js";
import {ref, onValue, set, update, remove} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const R = p => ref(db, "tournament" + (p ? "/" + p : ""));
let T = {}, match = 1, started = false, built = false;
const nm = i => ((T.players || {})["p" + i] || {}).name || "";
const guard = p => p.catch(e => alert("Save failed: " + e.message));

$("#lf").onsubmit = async e => {
  e.preventDefault(); $("#err").textContent = "";
  try { await signInWithEmailAndPassword(auth, $("#em").value, $("#pw").value); }
  catch (x) { $("#err").textContent = "Login failed: " + x.code; }
};
$("#out").onclick = () => signOut(auth);
onAuthStateChanged(auth, u => { $("#login").hidden = !!u; $("#app").hidden = !u; if (u && !started) start(); });

function start() {
  started = true;
  onValue(R(), s => {
    T = s.val() || {};
    standings();
    if (!built || !document.activeElement.closest("#tab-players,#tab-match,#tab-settings")) buildForms();
  });
  onValue(ref(db, ".info/connected"), s => {
    const c = $("#conn"); c.className = "pill " + (s.val() ? "on" : "off"); c.textContent = s.val() ? "ONLINE" : "OFFLINE – changes will sync on reconnect";
  });
}
function standings() {
  const kp = +(T.killPoints ?? 1);
  $("#sbody").innerHTML = compute(T).map((r, i) => `<tr data-name="${(r.name || "player " + r.n).toLowerCase()}"><td>${i + 1}</td><td>${esc(r.name || "Player " + r.n)}</td><td>${r.kills}</td><td>${r.kills * kp}</td><td>${r.pp}</td><td><b>${r.total}</b></td></tr>`).join("");
  filter();
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
function buildForms() {
  built = true;
  const mc = T.matchCount || 1; if (match > mc) match = mc;
  $("#msel").innerHTML = Array.from({length: mc}, (_, i) => `<option value="${i + 1}"${i + 1 === match ? " selected" : ""}>Match ${i + 1}${(T.currentMatch || 1) === i + 1 ? " (LIVE)" : ""}</option>`).join("");
  const res = ((T.results || {})["m" + match]) || {};
  let h = "<table><thead><tr><th>#</th><th>Player</th><th>Kills</th><th>Placement</th></tr></thead><tbody>", p = "";
  for (let i = 1; i <= SLOTS; i++) {
    const r = res["p" + i] || {};
    h += `<tr data-name="${esc((nm(i) || "player " + i).toLowerCase())}"><td>${i}</td><td>${esc(nm(i) || "Player " + i)}</td><td><input type="number" min="0" data-id="p${i}" data-f="k" value="${r.k ?? ""}"></td><td><input type="number" min="1" max="${SLOTS}" data-id="p${i}" data-f="r" value="${r.r ?? ""}"></td></tr>`;
    p += `<label data-name="${esc((nm(i) || "player " + i).toLowerCase())}">#${i}<input data-p="p${i}" maxlength="24" value="${esc(nm(i))}"></label>`;
  }
  $("#mbody").innerHTML = h + "</tbody></table>"; $("#pbody").innerHTML = p;
  $("#ppbody").innerHTML = Array.from({length: SLOTS}, (_, i) => `<label>#${i + 1}<input type="number" step="any" data-pp="${i}" value="${(T.placementPoints || [])[i] ?? 0}"></label>`).join("");
  $("#stitle").value = T.title || "SOLO BATTLE ROYALE"; $("#skp").value = T.killPoints ?? 1;
  filter();
}
function filter() {
  const q = $("#q").value.toLowerCase();
  $$("[data-name]").forEach(e => e.hidden = !e.dataset.name.includes(q));
}
$("#q").oninput = filter;
$$("nav button").forEach(b => b.onclick = () => {
  $$("nav button").forEach(x => x.classList.toggle("on", x === b));
  $$(".tab").forEach(t => t.hidden = t.id !== "tab-" + b.dataset.t);
});
$("#msel").onchange = e => { match = +e.target.value; buildForms(); };
$("#madd").onclick = () => { match = (T.matchCount || 1) + 1; guard(update(R(), {matchCount: match})); };
$("#mlive").onclick = () => guard(update(R(), {currentMatch: match}));
$("#msave").onclick = () => {
  const o = {}, seen = {}; let dup = false;
  $$("#mbody tr[data-name]").forEach(tr => {
    const [k, r] = tr.querySelectorAll("input");
    if (k.value === "" && r.value === "") return;
    o[k.dataset.id] = {k: +k.value || 0, r: +r.value || 0};
    if (+r.value) { if (seen[r.value]) dup = true; seen[r.value] = 1; }
  });
  if (dup && !confirm("Duplicate placements found. Save anyway?")) return;
  guard(Object.keys(o).length ? set(R("results/m" + match), o) : remove(R("results/m" + match)));
  document.activeElement.blur();
};
$("#psave").onclick = () => {
  const o = {}; $$("[data-p]").forEach(i => o[i.dataset.p] = {name: i.value.trim()});
  guard(set(R("players"), o)); document.activeElement.blur();
};
$("#ssave").onclick = () => {
  const pp = Array.from({length: SLOTS}, (_, i) => +$(`[data-pp="${i}"]`).value || 0);
  guard(update(R(), {title: $("#stitle").value.trim(), killPoints: +$("#skp").value || 0, placementPoints: pp}));
  document.activeElement.blur();
};
$("#sample").onclick = () => {
  if (!confirm("Overwrite names, settings and Match 1 with TEST data?")) return;
  const pl = {}, rs = {}, ord = [...Array(SLOTS).keys()].sort(() => Math.random() - .5);
  for (let i = 1; i <= SLOTS; i++) { pl["p" + i] = {name: "Test Player " + i}; rs["p" + i] = {k: Math.floor(Math.random() * 9), r: ord[i - 1] + 1}; }
  guard(update(R(), {players: pl, results: {m1: rs}, matchCount: 1, currentMatch: 1, killPoints: 1,
    placementPoints: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, ...Array(38).fill(0)]})); match = 1;
};
$("#reset").onclick = () => {
  if (prompt("This deletes ALL match results. Type RESET to confirm:") !== "RESET") return;
  match = 1; guard(Promise.all([remove(R("results")), update(R(), {matchCount: 1, currentMatch: 1})]));
};
