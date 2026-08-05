#!/usr/bin/env python3
"""Apply manually-verified biographical findings for the 1959 and 1962 USSR cohorts
to participants.csv. Run after build_table.py.
"""
import csv

UPDATES = {
    ("Andrei Tom", "1959"): dict(
        birth_year="1942",
        birth_place="Ташкент, Узбекская ССР",
        school_at_time="не установлено",
        source=(
            "Andrei Toom (наст. Андрей Львович Тоом), опечатка транслитерации на "
            "imo-official.org (Tom вместо Toom). "
            "https://en.wikipedia.org/wiki/Andrei_Toom ; "
            "упоминание бронзы 1959: https://habr.com/ru/companies/timeweb/articles/646349/"
        ),
    ),
    ("Grigori Margulis", "1962"): dict(
        birth_year="1946-02-24",
        birth_place="Москва, РСФСР, СССР",
        school_at_time=(
            "обычная (неспециализированная) школа в Москве, номер не установлен; "
            "с 7-го класса — кружки при мехмате МГУ"
        ),
        source=(
            "https://ru.wikipedia.org/wiki/Маргулис,_Григорий_Александрович ; "
            "https://mathshistory.st-andrews.ac.uk/Biographies/Margulis/"
        ),
    ),
    ("Iosif Bernstein", "1962"): dict(
        birth_year="1945-04-18",
        birth_place="Москва, СССР",
        school_at_time="московская школа, номер не установлен",
        source=(
            "https://ru.wikipedia.org/wiki/Бернштейн,_Иосиф_Наумович ; "
            "https://olimpiada.ru/article/950"
        ),
    ),
    ("Lidia Goncarova", "1962"): dict(
        birth_year="",
        birth_place="Москва, СССР",
        school_at_time="не установлено",
        source="https://olimpiada.ru/article/950 (город указан, школа не названа)",
    ),
    ("Aleksei Potepun", "1962"): dict(
        birth_year="",
        birth_place="Ленинград, СССР",
        school_at_time="кружок при Ленинградском Дворце пионеров (школа не названа)",
        source="https://olimpiada.ru/article/950",
    ),
    ("Daniar Mustari", "1962"): dict(
        birth_year="1945-04-10",
        birth_place="Казань, РСФСР, СССР",
        school_at_time="не установлено (в 1962 поступил на мех-мат Казанского университета)",
        source=(
            "Вероятно = Данияр Хамидович Муштари (транслитерация Mustari/Муштари). "
            "https://ru.wikipedia.org/wiki/Муштари,_Данияр_Хамидович — категоризирован "
            "как победитель IMO, но год не указан явно; год рождения и возраст совпадают "
            "с версией 1962 года. НЕ стопроцентно подтверждено."
        ),
    ),
    ("Genadi Kuranov", "1962"): dict(
        birth_year="",
        birth_place="не найдено",
        school_at_time="не найдено",
        source="поиск не дал результатов (однофамилец-экономист не подходит по годам)",
    ),
    ("Valeriy Frolov", "1959"): dict(
        birth_year="",
        birth_place="не найдено",
        school_at_time="не найдено",
        source="поиск не дал результатов",
    ),
    ("Viktor Fedorev", "1959"): dict(
        birth_year="",
        birth_place="не найдено",
        school_at_time="не найдено",
        source="поиск не дал результатов",
    ),
    ("Aleksander Chetajev", "1959"): dict(
        birth_year="",
        birth_place="не найдено",
        school_at_time="не найдено",
        source="поиск не дал результатов; возможна связь с фамилией Четаев (см. примечание)",
    ),
}

rows = list(csv.DictReader(open("participants.csv", encoding="utf-8")))
matched = set()
for r in rows:
    key = (r["name"], r["years"])
    if key in UPDATES:
        r.update(UPDATES[key])
        matched.add(key)

missing = set(UPDATES) - matched
if missing:
    raise SystemExit(f"UPDATES keys not found in participants.csv: {missing}")

with open("participants.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys())
    w.writeheader()
    w.writerows(rows)

print(f"Patched {len(matched)} rows.")
