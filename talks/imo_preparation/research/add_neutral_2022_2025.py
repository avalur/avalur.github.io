#!/usr/bin/env python3
"""Add the 2022-2025 Russian "neutral/independent" IMO participants to participants.csv.

Russia's team was suspended from competing under its flag from 2022 onward
(after the invasion of Ukraine); a capped number of individual Russian
students still competed as unaffiliated/neutral contestants. imo-official.org
lists them with no country code at all, so they were absent from the
original per-country scrape. Country field here uses "RUS-neutral" to
distinguish from flagged "RUS" participation.
"""
import csv

ALIASES = {
    "Dmitry Grishko": "Dmitrii Grishko",  # same person as 2026 RUS entry, spelling variant
}

RAW = """
2022 | Galiia Sharafetdinova | 42 | G
2022 | Ivan Bakharev | 39 | G
2022 | Maksim Turevskii | 39 | G
2022 | Taisiia Korotchenko | 33 | S
2022 | Roman Kuznetsov | 33 | S
2022 | Denis Mustafin | 31 | S
2023 | Aleksandr Gnusov | 37 | G
2023 | Alisa Volkova | 37 | G
2023 | Ratibor Koptilin | 36 | G
2023 | Roman Kuznetsov | 36 | G
2023 | Eldar Khisamutdinov | 35 | G
2023 | Pavel Prozorov | 28 | S
2024 | Ivan Chasovskikh | 40 | G
2024 | Egor Saprunov | 31 | G
2024 | Ratibor Koptilin | 30 | G
2024 | Tseren Frantsuzov | 29 | G
2024 | Mikhail Iugov | 28 | S
2024 | Ilya Zamotorin | 27 | S
2025 | Ivan Chasovskikh | 42 | G
2025 | Dmitry Grishko | 36 | G
2025 | Vasilii Patrushev | 35 | G
2025 | Artem Sadykov | 35 | G
2025 | Ilya Zamotorin | 35 | G
2025 | Ivan Kokarev | 33 | S
"""

new_appearances = []
for line in RAW.strip().splitlines():
    year, name, score, medal = [p.strip() for p in line.split("|")]
    name = ALIASES.get(name, name)
    new_appearances.append((int(year), name, medal))

rows = list(csv.DictReader(open("participants.csv", encoding="utf-8")))
by_name = {r["name"]: r for r in rows}

from collections import defaultdict
per_person = defaultdict(list)
for year, name, medal in new_appearances:
    per_person[name].append((year, medal))

added, extended = 0, 0
for name, apps in per_person.items():
    apps.sort()
    years_str = ", ".join(str(y) for y, _ in apps)
    medals_str = ", ".join(m for _, m in apps)
    if name in by_name:
        r = by_name[name]
        existing_years = [int(y) for y in r["years"].split(",")]
        existing_medals = [m.strip() for m in r["medals"].split(",")]
        all_years = existing_years + [y for y, _ in apps]
        all_medals = existing_medals + [m for _, m in apps]
        order = sorted(range(len(all_years)), key=lambda i: all_years[i])
        r["years"] = ", ".join(str(all_years[i]) for i in order)
        r["medals"] = ", ".join(all_medals[i] for i in order)
        r["n_participations"] = str(len(all_years))
        if "RUS-neutral" not in r["country"]:
            r["country"] = r["country"] + "/RUS-neutral"
        extended += 1
    else:
        rows.append({
            "name": name,
            "country": "RUS-neutral",
            "years": years_str,
            "n_participations": str(len(apps)),
            "medals": medals_str,
            "birth_year": "",
            "birth_place": "",
            "school_at_time": "",
            "later_career": "",
            "source": "",
        })
        added += 1

with open("participants.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys())
    w.writeheader()
    w.writerows(rows)

print(f"Added {added} new rows, extended {extended} existing rows.")
