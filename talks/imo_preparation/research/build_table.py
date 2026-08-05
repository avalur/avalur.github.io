#!/usr/bin/env python3
"""Parse raw IMO roster dumps (imo-official.org) into a deduplicated participant table.

Input: raw_rus.txt, raw_uss.txt  (lines: YEAR | Name | Score | Award)
Output: participants.csv          (one row per unique person)
        possible_duplicates.txt   (near-identical names across years, for manual review)
"""
import csv
import difflib
from collections import defaultdict

def parse(path, country):
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = [p.strip() for p in line.split("|")]
            if len(parts) != 4:
                continue
            year, name, score, award = parts
            if name.startswith("*"):
                continue
            rows.append((int(year), name, score, award, country))
    return rows

rows = parse("raw_rus.txt", "RUS") + parse("raw_uss.txt", "USS")

# Manually confirmed transliteration duplicates (same person, spelled differently
# across years on imo-official.org). Canonical name is the dict value.
ALIASES = {
    "Aleksey Lvov": "Alexey Lvov",
}

by_name = defaultdict(list)
for year, name, score, award, country in rows:
    name = ALIASES.get(name, name)
    by_name[name].append((year, score, award, country))

# A student competes in at most ~5 consecutive years (last years of school).
# If the same name reappears after a longer gap, treat it as a namesake
# (a different person), not a returning participant -- split into a new cluster.
MAX_CAREER_GAP = 5

def cluster_by_gap(appearances):
    appearances = sorted(appearances, key=lambda a: a[0])
    clusters = [[appearances[0]]]
    for a in appearances[1:]:
        if a[0] - clusters[-1][-1][0] > MAX_CAREER_GAP:
            clusters.append([a])
        else:
            clusters[-1].append(a)
    return clusters

records = []
for name, appearances in by_name.items():
    for cluster in cluster_by_gap(appearances):
        years = [a[0] for a in cluster]
        countries = sorted(set(a[3] for a in cluster))
        medals = [a[2] for a in cluster]
        records.append({
            "name": name,
            "country": "/".join(countries),
            "years": ", ".join(str(y) for y in years),
            "n_participations": len(years),
            "medals": ", ".join(medals),
            "birth_year": "",
            "birth_place": "",
            "school_at_time": "",
            "source": "",
        })

records.sort(key=lambda r: (r["years"].split(",")[0], r["name"]))

with open("participants.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=[
        "name", "country", "years", "n_participations", "medals",
        "birth_year", "birth_place", "school_at_time", "source",
    ])
    w.writeheader()
    w.writerows(records)

print(f"Unique participants: {len(records)}")
print(f"Total appearances parsed: {len(rows)}")

# Flag likely duplicate spellings (same country pool, similar name, non-overlapping years)
names = list(by_name.keys())
with open("possible_duplicates.txt", "w", encoding="utf-8") as f:
    seen_pairs = set()
    for i, n1 in enumerate(names):
        for n2 in names[i+1:]:
            ratio = difflib.SequenceMatcher(None, n1.lower(), n2.lower()).ratio()
            if ratio > 0.72:
                y1 = set(a[0] for a in by_name[n1])
                y2 = set(a[0] for a in by_name[n2])
                if y1 & y2:
                    continue  # same year -> definitely different people
                pair = tuple(sorted([n1, n2]))
                if pair in seen_pairs:
                    continue
                seen_pairs.add(pair)
                f.write(f"{ratio:.2f}  {n1} ({sorted(y1)})  <->  {n2} ({sorted(y2)})\n")

print("Wrote participants.csv and possible_duplicates.txt")
