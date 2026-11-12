import {db} from "./firebase-config.js";
import {ref, push, update, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const $ = id => document.getElementById(id);
// WhatsApp numbers in international format without "+": +91 9911811998 and +91 9274296501
const ADMINS = {w1: "919911811998", w2: "919274296501"};
const clean = s => s.replace(/\s+/g, " ").trim();
const UID = /^\d{8,12}$/;
let sending = false, text = "";
const say = m => $("msg").textContent = m;

$("f").onsubmit = async e => {
  e.preventDefault(); if (sending) return; say("");
  const v = {team: clean($("team").value), p1ign: clean($("p1ign").value), p1uid: $("p1uid").value.trim(),
             p2ign: clean($("p2ign").value), p2uid: $("p2uid").value.trim()};
  if (v.team.length < 2) return say("Team Name kam se kam 2 letters ka likho.");
  if (!v.p1ign || !v.p2ign) return say("Dono players ka IGN likho.");
  if (!UID.test(v.p1uid) || !UID.test(v.p2uid)) return say("Free Fire UID 8 se 12 digits ka hona chahiye (sirf numbers).");
  if (v.p1uid === v.p2uid) return say("Dono players ka UID alag hona chahiye.");
  sending = true; $("go").disabled = true; $("go").textContent = "SAVING…";
  try {
    const key = push(ref(db, "csRegistrations")).key;
    // one atomic write: the registration + a UID lock for each player (blocks duplicate UIDs)
    const save = update(ref(db), {
      ["csRegistrations/" + key]: {...v, createdAt: serverTimestamp()},
      ["csUids/" + v.p1uid]: true,
      ["csUids/" + v.p2uid]: true
    });
    await Promise.race([save, new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 15000))]);
    done(v);
  } catch (err) {
    const m = String(err && err.message || err);
    say(m.includes("PERMISSION_DENIED") ? "Registration nahi hui: inme se koi UID pehle se registered hai (ya registration band hai). UID dobara check karo, ya admin se contact karo."
      : m === "TIMEOUT" ? "Server se confirmation nahi mila. Internet check karke thodi der baad dobara try karo. Agar 'pehle se registered' dikhe, to pehli registration ho chuki hai."
      : "Kuch gadbad hui: " + m);
  } finally { sending = false; $("go").disabled = false; $("go").textContent = "REGISTER TEAM"; }
};

function done(v) {
  const when = new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short"}) + " IST";
  const lines = [["Team Name", v.team], ["Player 1 IGN", v.p1ign], ["Player 1 UID", v.p1uid],
                 ["Player 2 IGN", v.p2ign], ["Player 2 UID", v.p2uid], ["Registration Date & Time", when]];
  text = "NOVA ESPORTS – CS 2v2 Registration\n" + lines.map(l => l[0] + ": " + l[1]).join("\n");
  $("det").replaceChildren(...lines.map(([k, val]) => {
    const d = document.createElement("div"), s = document.createElement("span"), b = document.createElement("b");
    s.textContent = k + ": "; b.textContent = val; d.append(s, b); return d;
  }));
  for (const id in ADMINS) $(id).href = "https://wa.me/" + ADMINS[id] + "?text=" + encodeURIComponent(text);
  $("f").hidden = true; $("ok").hidden = false;
  window.scrollTo(0, 0);
}
$("copy").onclick = async () => {
  try { await navigator.clipboard.writeText(text); $("copy").textContent = "COPIED ✔"; }
  catch (e) { $("copy").textContent = "COPY NAHI HUA – manually select karo"; }
};
