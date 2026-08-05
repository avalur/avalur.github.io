#!/usr/bin/env python3
"""Classify each IMO participant's home city (Moscow / SPb / Regions / Unknown)
from school_at_time (preferred) or birth_place (fallback), then aggregate
per-year team composition for the stacked chart.

Heuristic: text before an em-dash in our research fields is the researched
fact; text after is almost always a "— NOT X" caveat the research agents
added, so it's discarded for classification purposes.
"""
import csv
import json
import re

NOT_FOUND_MARKERS = (
    "not found", "not confirmed", "not identified", "not specified", "no reliable",
    "не найдено", "не установлено", "не найден", "неизвестно", "не идентифиц", "не найдена",
)
MSU_BOARDING_MARKERS = (
    "сунц мгу", "sunc msu", "suncs mgu", "sunts mgu", "kolmogorov boarding school",
    "школа-интернат при мгу", "интернат при мгу", "boarding school at msu",
    "boarding school (интернат) at msu", "at msu (future sunc msu)",
)


def primary_location(school, birth):
    for field in (school, birth):
        if not field:
            continue
        head = field.split(" — ")[0].split(" -- ")[0].strip()
        low = head.lower()
        if not head or head == "?" or any(low.startswith(m) or low == m for m in NOT_FOUND_MARKERS):
            continue
        return head
    return None


def classify(school, birth):
    loc = primary_location(school, birth)
    if loc is None:
        return "Unknown", None
    low = loc.lower()
    if any(m in low for m in MSU_BOARDING_MARKERS):
        return "Moscow", loc
    if re.search(r"moscow\s*(oblast|region)|подмосков", low):
        return "Regions", loc
    if "petersburg" in low or "петербург" in low or "leningrad" in low or "ленинград" in low:
        return "SPb", loc
    if "moscow" in low or "москв" in low or "московск" in low:
        return "Moscow", loc
    return "Regions", loc


rows = list(csv.DictReader(open("participants.csv", encoding="utf-8")))

per_year = {}
for r in rows:
    cat, _ = classify(r["school_at_time"], r["birth_place"])
    for y in (int(y.strip()) for y in r["years"].split(",")):
        bucket = per_year.setdefault(y, {"Moscow": 0, "SPb": 0, "Regions": 0, "Unknown": 0})
        bucket[cat] += 1

years = sorted(per_year)
data = []
for y in years:
    b = per_year[y]
    total = sum(b.values())
    data.append({"year": y, "total": total, **b})

with open("chart_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"{'Year':6}{'N':4}{'Moscow':8}{'SPb':6}{'Regions':9}{'Unknown':8}")
for d in data:
    print(f"{d['year']:<6}{d['total']:<4}{d['Moscow']:<8}{d['SPb']:<6}{d['Regions']:<9}{d['Unknown']:<8}")
print(f"\nWrote chart_data.json ({len(data)} years)")
