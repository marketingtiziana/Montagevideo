# SCRIPT <-> FACTS automatic diff: every number shown on screen (edit.jsx data) must appear in FACTS.md (validated) or be an editorial score.
# usage: python3 tests/facts_diff.py  -> tests/facts_diff.json
import json, re
T = open("edit.jsx").read()
D = json.loads(T[T.index("const D = ") + 10: T.index(";\nconst W")])
facts = open("FACTS.md").read()
norm = lambda x: x.replace(" ", " ").replace("\xa0", " ")
F = norm(facts)
shown = []
def texts(c):
    for k in ("lines",): 
        for ln in c.get(k, []): yield "".join(g["t"] for g in ln)
    for k in ("big", "note", "label", "con", "name"):
        if c.get(k): yield c[k]
    if c.get("pro"): yield "".join(g["t"] for g in c["pro"])
    for cd in c.get("cards", []): yield " ".join(x for x in cd if x)
    for ch in c.get("chips", []): yield ch[0]
for s in D["screens"]:
    for t in texts(s["c"]):
        for m in re.finditer(r"\d[\d  ,.]*\s?(?:%|h|M HK\$|\$|°)?", norm(t)):
            v = m.group().strip()
            if v.rstrip(" ,.") in ("2026",): continue
            shown.append({"screen": s["n"], "value": v, "text": t, "fact": s["fact"]})
rows, bad = [], 0
for x in shown:
    core = x["value"].rstrip(" ,.")
    variants = {core, core.replace(" ", " "), core.replace(",", "."), core.replace(" %", "%"), core.replace(" ", "")}
    found = any(v in F for v in variants)
    # numbers that are part of a sourced phrase in FACTS (e.g. "Form 5472", "2 M HK$" written "2 M HK$")
    ok = found or (core in ("5", "4", "3", "2", "1") and x["fact"] == "")
    rows.append({**x, "in_FACTS": found, "ok": ok}); bad += not ok
scores = {k: sum(v) / 4 for k, v in D["scores"].items()}
json.dump({"numbers_on_screen": rows, "editorial_scores_labelled_NOTRE_NOTE": scores, "unsourced": bad}, open("tests/facts_diff.json", "w"), ensure_ascii=False, indent=1)
for r in rows:
    if not r["ok"]: print("UNSOURCED", r)
print(len(rows), "numbers on screen,", bad, "unsourced")
