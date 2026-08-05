#!/usr/bin/env python3
"""Merge a pipe-delimited findings file into participants.csv, matching by name.

Findings file format (one person per line):
NAME | YEAR(S) | BIRTH | PLACE | SCHOOL | CAREER | CONFIDENCE | SOURCES

Fields that are exactly "?" become empty. Everything else (including
"not found ..." explanations) is kept verbatim, since the caveats are useful.
Confidence is appended to later_career / source so nothing is lost.
"""
import csv
import sys

def load_findings(path):
    findings = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line.strip():
                continue
            parts = [p.strip() for p in line.split(" | ")]
            if len(parts) != 8:
                print(f"SKIP (bad field count {len(parts)}): {line[:80]}", file=sys.stderr)
                continue
            name, years, birth, place, school, career, confidence, source = parts
            findings[name] = dict(
                birth=birth, place=place, school=school, career=career,
                confidence=confidence, source=source, years=years,
            )
    return findings

def clean(v):
    return "" if v == "?" else v

def main():
    findings_path = sys.argv[1]
    findings = load_findings(findings_path)

    rows = list(csv.DictReader(open("participants.csv", encoding="utf-8")))
    matched = set()
    for r in rows:
        f = findings.get(r["name"])
        if not f:
            continue
        matched.add(r["name"])
        if clean(f["birth"]):
            r["birth_year"] = clean(f["birth"])
        if clean(f["place"]):
            r["birth_place"] = clean(f["place"])
        if clean(f["school"]):
            r["school_at_time"] = clean(f["school"])
        if clean(f["career"]):
            r["later_career"] = clean(f["career"])
        conf = f["confidence"]
        src = f["source"]
        r["source"] = f"[{conf}] {src}" if src else f"[{conf}]"

    missing = set(findings) - matched
    if missing:
        print(f"WARNING: names in findings but not in participants.csv: {missing}", file=sys.stderr)

    with open("participants.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)

    print(f"Merged {len(matched)} / {len(findings)} findings.")

if __name__ == "__main__":
    main()
