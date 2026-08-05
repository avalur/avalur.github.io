#!/usr/bin/env python3
"""Скачивает крупные снимки для глубокого зума (patch_*.jpg) из NASA GIBS.

GIBS — публичный WMS без ключей и лимитов, снимки в public domain.
Проблема одна: Сибирь почти всегда под облаками, поэтому для дневных снимков
скрипт перебирает летние даты и выбирает самую безоблачную (облака = яркие и
однородные, так что берём кадр с минимальной средней яркостью среди «живых»).

    python3 assets/fetch_patches.py            # оба патча
    python3 assets/fetch_patches.py siberia    # только один

Геометрия bbox повторяет makePatchGeometry() из src/scenes/earth.js:
квадратный патч spanKm × spanKm с центром в (lat, lon).

Требуется Pillow (только для выбора даты):  pip install pillow
"""

from __future__ import annotations

import io
import math
import sys
import urllib.parse
import urllib.request
from pathlib import Path

DEST = Path(__file__).parent / "textures" / "earth"
WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
KM_PER_DEG = 6371 * math.pi / 180  # 111.19

# Патчи должны совпадать с EARTH_PATCHES в src/config.js
PATCHES = {
    "siberia": dict(
        out="patch_siberia.jpg",
        lat=56.0, lon=84.0, span_km=1400, size=2048,
        # Blue Marble Next Generation: 500 м, уже собран без облаков.
        layer="BlueMarble_NextGeneration", time="2004-08-01", pick_date=False,
    ),
    "novosibirsk": dict(
        out="patch_novosibirsk.jpg",
        lat=54.95, lon=83.0, span_km=300, size=1536,
        # MODIS Terra true color: 250 м, но ежедневный — дату подбираем.
        layer="MODIS_Terra_CorrectedReflectance_TrueColor", time=None, pick_date=True,
    ),
}

# Кандидаты: разгар лета, несколько лет — чтобы найти чистое небо.
CANDIDATE_DATES = [
    f"{year}-{md}"
    for year in (2019, 2020, 2021, 2022, 2023, 2024)
    for md in ("06-20", "07-05", "07-20", "08-05", "08-20")
]


def bbox(lat: float, lon: float, span_km: float) -> str:
    half = (span_km / 2) / KM_PER_DEG
    dlon = half / max(0.15, math.cos(math.radians(lat)))
    return f"{lon - dlon},{lat - half},{lon + dlon},{lat + half}"


def url(layer: str, box: str, size: int, time: str | None) -> str:
    q = {
        "version": "1.3.0", "service": "WMS", "request": "GetMap",
        "format": "image/jpeg", "STYLE": "default", "CRS": "CRS:84",
        "bbox": box, "width": size, "height": size, "layers": layer,
    }
    if time:
        q["TIME"] = time
    return f"{WMS}?{urllib.parse.urlencode(q)}"


def fetch(u: str, timeout: int = 120) -> bytes:
    with urllib.request.urlopen(u, timeout=timeout) as r:
        return r.read()


def cloudiness(data: bytes) -> float | None:
    """Средняя яркость: облака яркие, «нет данных» — почти чёрный кадр."""
    from PIL import Image, ImageStat
    im = Image.open(io.BytesIO(data)).convert("L")
    mean = ImageStat.Stat(im).mean[0]
    return None if mean < 18 else mean  # чёрный кадр = нет покрытия


def best_date(cfg: dict) -> str:
    box = bbox(cfg["lat"], cfg["lon"], cfg["span_km"])
    scored: list[tuple[float, str]] = []
    for date in CANDIDATE_DATES:
        try:
            score = cloudiness(fetch(url(cfg["layer"], box, 256, date), timeout=60))
        except Exception as exc:  # noqa: BLE001 — сеть, что угодно
            print(f"  {date}: ошибка ({exc})")
            continue
        if score is None:
            print(f"  {date}: нет данных")
            continue
        print(f"  {date}: яркость {score:5.1f}")
        scored.append((score, date))
    if not scored:
        raise SystemExit("Ни одна дата не отдала снимок — проверьте сеть.")
    scored.sort()
    print(f"  → выбрано {scored[0][1]} (самое чистое небо)")
    return scored[0][1]


def build(name: str) -> None:
    cfg = PATCHES[name]
    DEST.mkdir(parents=True, exist_ok=True)
    out = DEST / cfg["out"]
    print(f"\n[{name}] {cfg['span_km']} км, слой {cfg['layer']}")
    time = best_date(cfg) if cfg["pick_date"] else cfg["time"]
    box = bbox(cfg["lat"], cfg["lon"], cfg["span_km"])
    data = fetch(url(cfg["layer"], box, cfg["size"], time))
    out.write_bytes(data)
    print(f"  сохранено: {out.relative_to(Path(__file__).parent.parent)} ({len(data) // 1024} КБ)")


if __name__ == "__main__":
    names = sys.argv[1:] or list(PATCHES)
    for n in names:
        if n not in PATCHES:
            raise SystemExit(f"Неизвестный патч: {n}. Есть: {', '.join(PATCHES)}")
        build(n)
