// Local structural lint of edit.jsx (no renderer here): stubs the builders and checks the node tree
// against the Higgsedit v0.14 rules we hit (unknown fields, undefined values, duplicate tracks, keyframe order, lifetimes).
import fs from "node:fs";
const src = fs.readFileSync(new URL("../edit.jsx", import.meta.url), "utf8")
  .replace(/const require = createRequire[\s\S]*?const tw = [^\n]*\n/, "const tw = (s, size) => Math.ceil(s.length * size * 0.66) + 10;\n")
  .replace(/^import .*$/m, "");
fs.writeFileSync("/tmp/lint_edit.mjs", src);
const { default: build } = await import("/tmp/lint_edit.mjs?" + Date.now());
const COMMON = ["mask", "shadow", "effects", "motionBlur", "blendMode", "z", "matte", "transition", "at", "duration", "animate"];
const F = {
  text: [...COMMON, "typography", "motion", "x", "y", "width", "height", "fontFamily", "fontSize", "fontWeight", "italic", "letterSpacing", "lineHeight", "align", "color", "strokeColor", "strokeWidth"],
  rect: [...COMMON, "x", "y", "width", "height", "fill", "color", "radius", "strokeColor", "strokeWidth", "opacity"],
  media: [...COMMON, "file", "x", "y", "width", "height", "fit", "radius", "trimStart", "muted", "volume"],
  path: [...COMMON, "d", "morphTo", "x", "y", "width", "height", "fill", "stroke", "dash"],
  frame: [...COMMON.filter((k) => k !== "mask"), "name", "motion", "x", "y", "width", "height", "origin", "layout", "columns", "wrap", "gap", "rowGap", "padding", "align", "justify", "background", "radius", "clip", "reveal"],
  icon: [...COMMON, "x", "y", "size", "color", "strokeWidth"],
};
const STACK = new Set(["offsetX", "offsetY", "scale"]);
let errs = 0, nodes = 0;
const err = (m) => { if (errs++ < 40) console.log("ERR", m); };
const mk = (kind) => (a, b) => {
  const o = kind === "text" || kind === "icon" ? { ...(b || {}), __content: a } : { ...(a || {}) };
  return { __kind: kind, ...o, __kids: kind === "frame" ? (b || []) : [] };
};
const hasScale = (n) => n.__kind === "frame" && ((n.animate || []).some((a) => a.property === "scale") ||
  ["enter", "exit", "settle"].some((ph) => n.motion?.[ph] && ["from", "to"].some((k) => typeof n.motion[ph][k] === "object" && "scale" in n.motion[ph][k])));
const motionScale = (n) => ["enter", "exit", "settle"].some((ph) => n.motion?.[ph] && ["from", "to"].some((k) => typeof n.motion[ph][k] === "object" && ("scale" in n.motion[ph][k] || "scaleX" in n.motion[ph][k] || "scaleY" in n.motion[ph][k])));
function walk(n, life, where, scaledAncestor = false, base = 0) {
  nodes++;
  const k = n.__kind;
  for (const [key, v] of Object.entries(n)) {
    if (key.startsWith("__")) continue;
    if (!F[k].includes(key)) err(`${where}: ${k}.${key} not a field`);
    if (v === undefined || v === null) err(`${where}: ${k}.${key} is ${v}`);
  }
  const at = (n.at ?? base) - base, dur = n.duration ?? (life - at);
  if (at < 0 || at > life + 1e-6) err(`${where}: at ${at} outside parent life ${life}`);
  if (at + dur > life + 1e-3) err(`${where}: ends ${(at + dur).toFixed(3)} after parent life ${life.toFixed(3)}`);
  const seen = new Set();
  for (const a of n.animate || []) {
    if (seen.has(a.property) && !STACK.has(a.property)) err(`${where}: two ${a.property} tracks`);
    seen.add(a.property);
    if (a.repeat !== undefined && !(Number.isInteger(a.repeat) && a.repeat >= 2)) err(`${where}: repeat ${a.repeat}`);
    if (a.keyframes) {
      if (a.keyframes.length < 2) err(`${where}: ${a.property} < 2 keys`);
      const reps = a.repeat || 1, span = a.keyframes[a.keyframes.length - 1].at - a.keyframes[0].at;
      a.keyframes.forEach((kf, i) => {
        if (kf.value === undefined || Number.isNaN(kf.value)) err(`${where}: ${a.property} key ${i} value ${kf.value}`);
        if (i && !(kf.at > a.keyframes[i - 1].at)) err(`${where}: ${a.property} keys not increasing at ${i} (${a.keyframes[i - 1].at} -> ${kf.at})`);
      });
      const last = a.keyframes[0].at + span * reps + (reps - 1) * 0;
      if (last > dur + 1e-3) err(`${where}: ${a.property} last key ${last.toFixed(3)} > life ${dur.toFixed(3)}`);
    }
  }
  const m = n.motion;
  if (m && k === "frame") {
    for (const ph of ["enter", "exit"]) if (m[ph] && m[ph].duration > dur + 1e-3) err(`${where}: motion.${ph} longer than life`);
    if (m.timeline && (m.timeline.at || 0) + m.timeline.duration > dur + 1e-3) err(`${where}: timeline longer than life ${dur}`);
  }
  if (n.__kind === "frame" && motionScale(n) && (n.animate || []).some((a) => a.property === "scale")) err(`${where}: motion scale + animate scale on one frame`);
  if (n.__kind === "frame" && hasScale(n) && scaledAncestor) err(`${where}: scale under a scaled ancestor frame`);
  (n.__kids || []).forEach((c, i) => walk(c, dur, `${where}>${c.__kind}[${i}]`, scaledAncestor || hasScale(n)));
}
const composes = [];
const p = { add: async (f) => ({ id: f, name: f }), cut() {}, compose(nodes, o) { composes.push([nodes, o]); }, frame: async () => {}, render: async () => {} };
process.env.REEL_MODE = "none";
await build({ project: async () => p, text: mk("text"), rect: mk("rect"), media: mk("media"), path: mk("path"), frame: mk("frame"), icon: mk("icon") });
for (const [ns, o] of composes) {
  if (!(o.dur > 0)) err(`${o.name}: dur ${o.dur}`);
  (Array.isArray(ns) ? ns : [ns]).forEach((n, i) => walk(n, o.dur, `${o.name}@${o.at?.toFixed?.(2)}[${i}]`, false, o.at ?? 0));   // top-level at is absolute
}
console.log(`composes ${composes.length}, nodes ${nodes}, errors ${errs}`);
process.exit(errs ? 1 : 0);
