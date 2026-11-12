import {db, auth} from "./firebase-config.js";
import {compute, SIZE, MAXR} from "./cs-core.js";
import {ref, onValue, set, update, remove} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const R = p => ref(db, "csTournament" + (p ? "/" + p : ""));
let T = {}, started = false, busy = false, lastSig = null;
const guard = p => p.catch(e => alert("Save failed: " + e.message));
const pn = (t, i) => (((T["team" + t] || {}).players) || {})[i] || "";

// build 4 player inputs per team once; extra slots are hidden depending on mode
for (const t of ["A", "B"])
  $("#p" + t).innerHTML = [0, 1, 2, 3].map(i => `<label>Player ${i + 1}<input maxlength="24" data-t="${t}" data-i="${i}" placeholder="Player ${i + 1}"></label>`).join("");
const slot = (t, i) => $(`input[data-t="${t}"][data-i="${i}"]`);
function showSlots() {
  const n = SIZE[$("#mode").value] || 4;
  $$("input[data-i]").forEach(e => e.parentElement.hidden = +e.dataset.i >= n);
}
$("#mode").onchange = showSlots;

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
    live();
    // refill the setup form only when setup data changed, and never while the admin is typing in it
    const sig = JSON.stringify([T.mode, T.title, T.teamA, T.teamB]);
    if (sig !== lastSig && !(document.activeElement && document.activeElement.closest("#setup"))) { lastSig = sig; fill(); }
  });
  onValue(ref(db, ".info/connected"), s => {
    const c = $("#conn"); c.className = "pill " + (s.val() ? "on" : "off"); c.textContent = s.val() ? "ONLINE" : "OFFLINE – changes sync on reconnect";
  });
}
function fill() {
  const c = compute(T);
  $("#mode").value = c.mode; $("#title").value = T.title || "";
  $("#nA").value = (T.teamA || {}).name || ""; $("#nB").value = (T.teamB || {}).name || "";
  for (const t of ["A", "B"]) for (let i = 0; i < 4; i++) slot(t, i).value = pn(t, i);
  showSlots();
}
function live() {
  const c = compute(T), win = c.winner === "A" ? c.nameA : c.nameB;
  $("#la").textContent = c.nameA; $("#lb").textContent = c.nameB;
  $("#scA").textContent = c.a; $("#scB").textContent = c.b; $("#md").textContent = c.mode.toUpperCase();
  $("#rd").textContent = c.done ? "MATCH OVER" : "ROUND " + c.round + " / " + MAXR;
  $("#status").textContent = c.done ? "WINNER: " + win + " (" + c.a + "–" + c.b + ")" : "LIVE • " + c.nameA + " " + c.a + " – " + c.b + " " + c.nameB;
  $("#wa").textContent = c.nameA + " WINS ROUND " + c.round; $("#wb").textContent = c.nameB + " WINS ROUND " + c.round;
  $("#wa").disabled = $("#wb").disabled = c.done;
  $("#undo").disabled = !c.played;
  $("#hist").innerHTML = c.history.map((w, i) => `<i class="${w}">${i + 1}</i>`).join("");
}

const win = w => {
  const c = compute(T);
  if (c.done || busy) return;
  busy = true; setTimeout(() => busy = false, 350);
  guard(set(R("rounds/r" + (c.played + 1)), w));
};
$("#wa").onclick = () => win("A");
$("#wb").onclick = () => win("B");
$("#undo").onclick = () => { const c = compute(T); if (c.played) guard(remove(R("rounds/r" + c.played))); };
$("#reset").onclick = () => { if (confirm("Reset match? All round results will be cleared.")) guard(remove(R("rounds"))); };

$("#save").onclick = () => {
  const mode = $("#mode").value, n = SIZE[mode];
  if (compute(T).played && compute(T).mode !== mode && !confirm("A match is in progress. Change mode anyway? (Round results are kept.)")) return;
  const team = t => ({
    name: $("#n" + t).value.trim().slice(0, 24),
    players: Array.from({length: n}, (_, i) => slot(t, i).value.trim().slice(0, 24))
  });
  guard(update(R(), {mode, title: $("#title").value.trim().slice(0, 40), teamA: team("A"), teamB: team("B")}));
  document.activeElement.blur();
};
$("#sample").onclick = () => {
  $("#nA").value = "NOVA RED"; $("#nB").value = "NOVA GOLD";
  for (const t of ["A", "B"]) for (let i = 0; i < 4; i++) slot(t, i).value = "Test " + t + (i + 1);
};
