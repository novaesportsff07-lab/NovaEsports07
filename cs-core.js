// Shared Clash Squad match logic. No Firebase imports, so it is easy to test.
// Data lives under /csTournament: {title, mode, teamA:{name,players[]}, teamB:{...}, rounds:{r1:"A", r2:"B", ...}}
export const WIN = 7, MAXR = 13, SIZE = {"1v1": 1, "2v2": 2, "4v4": 4};

export const pname = (team, i) => String(((team && team.players) || {})[i] || "").trim();

// Everything shown on screen is derived from the list of round winners, so undo/reset are trivial.
export function compute(t = {}) {
  const mode = SIZE[t.mode] ? t.mode : "4v4";
  const rs = t.rounds || {};
  const list = Object.keys(rs).filter(k => /^r\d+$/.test(k)).sort((x, y) => +x.slice(1) - +y.slice(1))
    .map(k => rs[k]).filter(v => v === "A" || v === "B");
  let a = 0, b = 0, played = 0;
  for (const w of list) {
    if (a >= WIN || b >= WIN || played >= MAXR) break;
    if (w === "A") a++; else b++;
    played++;
  }
  const done = a >= WIN || b >= WIN;
  return {
    mode, a, b, played, done,
    round: done ? played : played + 1,
    winner: done ? (a >= WIN ? "A" : "B") : null,
    history: list.slice(0, played),
    nameA: String((t.teamA && t.teamA.name) || "").trim() || "TEAM A",
    nameB: String((t.teamB && t.teamB.name) || "").trim() || "TEAM B"
  };
}
