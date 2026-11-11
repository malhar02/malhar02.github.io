#!/usr/bin/env python3
"""Build a source-linked, facts-only Rabindra Sangeet catalogue."""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
import time
import urllib.robotparser
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

import requests
from bs4 import BeautifulSoup, NavigableString
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://www.geetabitan.com"
ROBOTS_URL = BASE_URL + "/robots.txt"
USER_AGENT = "TagoreGPTCatalogue/1.0 (educational Rabindra Sangeet index)"
REQUEST_DELAY_SECONDS = 0.2

FIELD_ALIASES = {
    "parjaay": "parjaay",
    "parjay": "parjaay",
    "taal": "taal",
    "tal": "taal",
    "raag": "raag",
    "raga": "raag",
    "ritu": "ritu",
    "rhitu": "ritu",
    "season": "ritu",
    "written on": "written_on",
    "written": "written_on",
    "year": "written_on",
    "collection": "collection",
    "swarabitan": "swarabitan",
    "notation by": "notation_by",
}

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS songs (
    source_url TEXT PRIMARY KEY,
    title_roman TEXT NOT NULL,
    parjaay TEXT,
    taal TEXT,
    raag TEXT,
    ritu TEXT,
    written_on TEXT,
    collection TEXT,
    swarabitan TEXT,
    notation_by TEXT,
    extra_metadata_json TEXT NOT NULL,
    search_terms_json TEXT NOT NULL DEFAULT '[]',
    scraped_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title_roman);
CREATE INDEX IF NOT EXISTS idx_songs_taal ON songs(taal);
CREATE INDEX IF NOT EXISTS idx_songs_parjaay ON songs(parjaay);
CREATE INDEX IF NOT EXISTS idx_songs_raag ON songs(raag);
CREATE INDEX IF NOT EXISTS idx_songs_ritu ON songs(ritu);

CREATE TABLE IF NOT EXISTS scrape_log (
    source_url TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    http_status INTEGER,
    error TEXT,
    attempted_at TEXT NOT NULL
);
"""

INSERT_SQL = """
INSERT INTO songs (
    source_url, title_roman, parjaay, taal, raag, ritu, written_on,
    collection, swarabitan, notation_by, extra_metadata_json,
    search_terms_json, scraped_at
) VALUES (
    :source_url, :title_roman, :parjaay, :taal, :raag, :ritu, :written_on,
    :collection, :swarabitan, :notation_by, :extra_metadata_json,
    :search_terms_json, :scraped_at
)
ON CONFLICT(source_url) DO UPDATE SET
    title_roman=excluded.title_roman,
    parjaay=excluded.parjaay,
    taal=excluded.taal,
    raag=excluded.raag,
    ritu=excluded.ritu,
    written_on=excluded.written_on,
    collection=excluded.collection,
    swarabitan=excluded.swarabitan,
    notation_by=excluded.notation_by,
    extra_metadata_json=excluded.extra_metadata_json,
    search_terms_json=excluded.search_terms_json,
    scraped_at=excluded.scraped_at
"""


def make_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1.0,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    session.headers.update({"User-Agent": USER_AGENT})
    return session


def canonical_url(url: str) -> str:
    parts = urlsplit(url)
    path = parts.path or "/"
    return urlunsplit(("https", "www.geetabitan.com", path, "", ""))


def permitted_urls(session: requests.Session) -> list[str]:
    response = session.get(ROBOTS_URL, timeout=30)
    response.raise_for_status()
    robots = urllib.robotparser.RobotFileParser()
    robots.set_url(ROBOTS_URL)
    robots.parse(response.text.splitlines())

    sitemap_match = re.search(r"(?im)^Sitemap:\s*(\S+)", response.text)
    sitemap_url = sitemap_match.group(1) if sitemap_match else "https://geetabitan.com/sitemap.xml"
    sitemap_response = session.get(sitemap_url, timeout=60)
    sitemap_response.raise_for_status()
    root = ET.fromstring(sitemap_response.content)

    candidates = set()
    for node in root.iter():
        if not node.tag.lower().endswith("loc") or not node.text:
            continue
        url = canonical_url(node.text.strip())
        path = urlsplit(url).path.lower()
        if path.startswith("/lyrics/") and path.endswith("-lyric.html"):
            if not robots.can_fetch(USER_AGENT, url):
                raise RuntimeError("robots.txt disallows a song URL: " + url)
            candidates.add(url)

    urls = sorted(candidates)
    if not urls:
        raise RuntimeError("No song URLs found in " + sitemap_url)
    print(f"Sitemap {sitemap_url}: {len(urls):,} unique song URLs")
    return urls


def normalize_lines(text: str) -> str:
    return "\n".join(line.strip() for line in text.splitlines() if line.strip())


def parse_page(html: str, source_url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    welcome = soup.select_one(".welcome")
    title = None
    if welcome:
        direct_text = "".join(
            str(child)
            for child in welcome.contents
            if isinstance(child, NavigableString)
        ).strip()
        title = re.sub(r"\s+", " ", direct_text)

    if not title:
        title_tag = soup.find("title")
        title = normalize_lines(title_tag.get_text(" ", strip=True)) if title_tag else ""
        title = re.sub(r"(?i)^song\s+", "", title).split("|")[0].strip()
    if not title:
        slug = Path(urlsplit(source_url).path).stem
        title = slug.removesuffix("-lyric").replace("-", " ")

    metadata = {}
    for paragraph in soup.select("div.marginbottom20.fontengsize16 p"):
        line = normalize_lines(paragraph.get_text("\n", strip=True))
        match = re.match(r"^([^:]{1,50})\s*:\s*(.*)$", line)
        if not match:
            continue
        label = match.group(1).strip().lower()
        value = match.group(2).strip()
        if not value:
            continue
        key = FIELD_ALIASES.get(label)
        metadata[key or label] = value

    known_fields = set(FIELD_ALIASES.values())
    extra = {key: value for key, value in metadata.items() if key not in known_fields}
    transliteration_node = soup.select_one("#copy pre")
    transliteration = transliteration_node.get_text(" ", strip=True) if transliteration_node else ""
    search_terms = sorted({
        token.lower()
        for token in re.findall(r"[A-Za-z]{2,}", transliteration)
    })
    return {
        "source_url": source_url,
        "title_roman": title,
        "parjaay": metadata.get("parjaay"),
        "taal": metadata.get("taal"),
        "raag": metadata.get("raag"),
        "ritu": metadata.get("ritu"),
        "written_on": metadata.get("written_on"),
        "collection": metadata.get("collection"),
        "swarabitan": metadata.get("swarabitan"),
        "notation_by": metadata.get("notation_by"),
        "extra_metadata_json": json.dumps(extra, ensure_ascii=False, sort_keys=True),
        "search_terms_json": json.dumps(search_terms, ensure_ascii=False),
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def write_database(session: requests.Session, urls: list[str], db_path: Path) -> tuple[int, int]:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.executescript(CREATE_SQL)
    columns = {row["name"] for row in conn.execute("PRAGMA table_info(songs)")}
    if "search_terms_json" not in columns:
        conn.execute(
            "ALTER TABLE songs ADD COLUMN search_terms_json TEXT NOT NULL DEFAULT '[]'"
        )
    conn.execute("DELETE FROM songs")
    conn.execute("DELETE FROM scrape_log")
    conn.commit()

    successes = 0
    failures = 0
    for index, url in enumerate(urls, start=1):
        attempted_at = datetime.now(timezone.utc).isoformat()
        http_status = None
        try:
            response = session.get(url, timeout=30)
            http_status = response.status_code
            response.raise_for_status()
            record = parse_page(response.text, url)
            if not record["title_roman"]:
                raise ValueError("Could not extract a song title")
            conn.execute(INSERT_SQL, record)
            conn.execute(
                """INSERT INTO scrape_log(source_url, status, http_status, error, attempted_at)
                   VALUES (?, 'ok', ?, NULL, ?)
                   ON CONFLICT(source_url) DO UPDATE SET
                     status='ok', http_status=excluded.http_status,
                     error=NULL, attempted_at=excluded.attempted_at""",
                (url, http_status, attempted_at),
            )
            successes += 1
        except Exception as error:
            failures += 1
            conn.execute(
                """INSERT INTO scrape_log(source_url, status, http_status, error, attempted_at)
                   VALUES (?, 'error', ?, ?, ?)
                   ON CONFLICT(source_url) DO UPDATE SET
                     status='error', http_status=excluded.http_status,
                     error=excluded.error, attempted_at=excluded.attempted_at""",
                (url, http_status, str(error)[:1000], attempted_at),
            )

        if index % 50 == 0 or index == len(urls):
            conn.commit()
            print(f"{index:,}/{len(urls):,} pages; {successes:,} saved; {failures:,} errors")
        time.sleep(REQUEST_DELAY_SECONDS)

    conn.commit()
    conn.close()
    if successes < int(len(urls) * 0.9):
        raise RuntimeError(
            f"Only {successes:,}/{len(urls):,} pages were collected. "
            "Refusing to publish an incomplete catalogue."
        )
    return successes, failures


def export_json(db_path: Path, json_path: Path) -> int:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = []
    for row in conn.execute(
        """SELECT source_url, title_roman, parjaay, taal, raag, ritu,
                  written_on, collection, swarabitan, notation_by,
                  extra_metadata_json, search_terms_json
           FROM songs ORDER BY title_roman COLLATE NOCASE"""
    ):
        record = dict(row)
        raw_terms = record.pop("search_terms_json", "[]")
        try:
            record["search_terms"] = json.loads(raw_terms or "[]")
        except json.JSONDecodeError:
            record["search_terms"] = []
        rows.append(record)
    conn.close()
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="data", type=Path)
    args = parser.parse_args()

    session = make_session()
    urls = permitted_urls(session)
    db_path = args.output_dir / "tagore_songs.sqlite"
    json_path = args.output_dir / "songs.json"
    successes, failures = write_database(session, urls, db_path)
    rows = export_json(db_path, json_path)
    print(f"Finished: {successes:,} pages, {failures:,} errors, {rows:,} database records")
    print(f"SQLite: {db_path}")
    print(f"JSON: {json_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

