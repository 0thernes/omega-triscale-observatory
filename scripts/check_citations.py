#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2026 Alexander Stephen Donahue
"""Live Citation Reachability, Crossref/DataCite Title+Author Match & Retraction Verifier.

Parses every BibTeX entry in `paper/refs.bib` and verifies:
  1. Every `doi = {...}` via DOI Handle REST API + Crossref (and DataCite fallback for arXiv DOIs),
     asserting BOTH live reachability AND title/author metadata agreement (plus zero retractions).
  2. Every `url = {...}` via live HTTP GET reachability (2xx-3xx) AND HTML `<title>` topic match.
  3. Print-only entries without a DOI/URL (e.g. MIT Press Artificial Life VI proceedings) for
     complete bibliographic metadata (author, title, booktitle, publisher, pages, year, isbn).

Usage:
  python scripts/check_citations.py           # Live verification (read-only)
  python scripts/check_citations.py --write   # Live verification + write results/citation-audit.json
  python scripts/check_citations.py --offline # Offline BibTeX syntax & completeness check (CI)
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIB_PATH = ROOT / "paper" / "refs.bib"
OUT_PATH = ROOT / "results" / "citation-audit.json"
VERSION = (ROOT / "VERSION").read_text(encoding="utf-8").strip() if (ROOT / "VERSION").exists() else "6.8.0"
UA = f"0thernes-CitationVerifier/{VERSION} (mailto:0_0@0thernes.art; +https://github.com/0thernes/omega-triscale-observatory)"

STOPWORDS = {
    "a", "an", "and", "as", "at", "by", "for", "from", "in", "its", "of", "on",
    "or", "the", "to", "with", "proceedings", "international", "conference"
}


def strip_braces(s: str) -> str:
    return re.sub(r"[{}]", "", s or "").strip()


def norm_tokens(s: str) -> set[str]:
    clean = strip_braces(html.unescape(s or "")).lower()
    clean = clean.replace("--", " ").replace("-", " ")
    tokens = re.findall(r"[a-z0-9]+", clean)
    return {t for t in tokens if len(t) >= 2 and t not in STOPWORDS}


def extract_bib_surnames(author_field: str) -> list[str]:
    raw = (author_field or "").strip()
    if raw.startswith("{") and raw.endswith("}"):
        # Institutional author like {{WHATWG}} or {{Khronos WebGL Working Group}}
        return []
    surnames: list[str] = []
    for part in re.split(r"\s+and\s+", raw):
        part = strip_braces(part)
        if not part:
            continue
        if "," in part:
            fam = part.split(",", 1)[0].strip()
        else:
            fam = part.split()[-1].strip()
        # Handle prefixes like "de Moura" -> match last token "moura"
        fam_toks = re.findall(r"[a-z]+", fam.lower())
        if fam_toks:
            surnames.append(fam_toks[-1])
    return surnames


def parse_bibtex(raw: str) -> list[dict]:
    entries: list[dict] = []
    blocks = re.split(r"\n(?=@)", raw.strip())
    for blk in blocks:
        m = re.match(r"@(\w+)\s*\{\s*([^,\s]+)\s*,([\s\S]*)\}\s*$", blk.strip())
        if not m:
            continue
        etype, key, body = m.group(1).lower(), m.group(2).strip(), m.group(3)
        fields: dict[str, str] = {}
        for line in body.splitlines():
            fm = re.match(r"\s*([A-Za-z0-9_]+)\s*=\s*\{(.*)\}\s*,?\s*$", line)
            if fm:
                fields[fm.group(1).lower()] = fm.group(2).strip()
        entries.append({"key": key, "type": etype, "fields": fields})
    return entries


def fetch_json(url: str, timeout: int = 20) -> tuple[int, dict | None, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.getcode(), json.loads(resp.read().decode("utf-8")), "OK"
    except urllib.error.HTTPError as e:
        return e.code, None, f"HTTP {e.code}"
    except Exception as exc:
        return 0, None, str(exc)


def verify_doi_entry(entry: dict) -> dict:
    doi = entry["fields"]["doi"].strip()
    bib_title = strip_braces(entry["fields"].get("title", ""))
    bib_surnames = extract_bib_surnames(entry["fields"].get("author", ""))

    # 1. Handle API reachability
    h_url = f"https://doi.org/api/handles/{urllib.parse.quote(doi, safe='/')}"
    h_code, h_data, h_msg = fetch_json(h_url)
    handle_ok = h_code == 200 and isinstance(h_data, dict) and h_data.get("responseCode") == 1

    # 2. Crossref metadata (with DataCite fallback for arXiv/DataCite DOIs)
    enc = urllib.parse.quote(doi, safe="/")
    registry = "crossref"
    c_code, c_data, c_msg = fetch_json(f"https://api.crossref.org/works/{enc}")
    remote_title = ""
    remote_surnames: list[str] = []
    retracted = False

    if c_code == 200 and isinstance(c_data, dict) and "message" in c_data:
        msg = c_data["message"]
        titles = list(msg.get("title") or []) + list(msg.get("subtitle") or [])
        remote_title = " ".join(str(t) for t in titles if t).strip()
        people = list(msg.get("author") or []) + list(msg.get("editor") or [])
        for p in people:
            fam = str(p.get("family") or p.get("name") or "")
            toks = re.findall(r"[a-z]+", fam.lower())
            if toks:
                remote_surnames.append(toks[-1])
        for upd in (msg.get("update-to") or []):
            if "retract" in str(upd.get("type", "")).lower():
                retracted = True
    else:
        registry = "datacite"
        d_code, d_data, d_msg = fetch_json(f"https://api.datacite.org/dois/{enc}")
        if d_code == 200 and isinstance(d_data, dict) and "data" in d_data:
            attrs = d_data["data"].get("attributes", {})
            titles = [t.get("title", "") for t in (attrs.get("titles") or []) if isinstance(t, dict)]
            remote_title = " ".join(t for t in titles if t).strip()
            for cr in (attrs.get("creators") or []):
                fam = str(cr.get("familyName") or cr.get("name") or "")
                toks = re.findall(r"[a-z]+", fam.lower())
                if toks:
                    remote_surnames.append(toks[-1])
        else:
            return {
                "doi": doi,
                "handle_ok": handle_ok,
                "registry": registry,
                "metadata_ok": False,
                "error": f"Crossref ({c_msg}) and DataCite ({d_msg}) lookup failed",
            }

    # 3. Title token agreement
    b_toks = norm_tokens(bib_title)
    r_toks = norm_tokens(remote_title)
    overlap = len(b_toks & r_toks) / max(1, min(len(b_toks), len(r_toks)))
    title_match = overlap >= 0.70 and len(b_toks & r_toks) >= min(2, len(b_toks))

    # 4. Author surname agreement (when both BibTeX and registry provide personal authors)
    if bib_surnames and remote_surnames:
        author_match = any(s in remote_surnames for s in bib_surnames[:3])
    else:
        author_match = True  # Institutional / RFC metadata without Crossref author array

    ok = bool(handle_ok and title_match and author_match and not retracted)
    return {
        "doi": doi,
        "handle_ok": handle_ok,
        "registry": registry,
        "remote_title": remote_title,
        "title_overlap": round(overlap, 3),
        "title_match": title_match,
        "author_match": author_match,
        "retracted": retracted,
        "ok": ok,
    }


def verify_url_entry(entry: dict) -> dict:
    url = entry["fields"]["url"].strip()
    bib_title = strip_braces(entry["fields"].get("title", ""))
    req = urllib.request.Request(url, headers={"User-Agent": UA}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            code = resp.getcode()
            raw = resp.read(65536).decode("utf-8", errors="replace")
            tm = re.search(r"<title[^>]*>([\s\S]*?)</title>", raw, re.I)
            page_title = re.sub(r"\s+", " ", html.unescape(tm.group(1))).strip() if tm else ""
            b_toks = norm_tokens(bib_title)
            p_toks = norm_tokens(page_title + " " + url)
            matched_tokens = sorted(b_toks & p_toks)
            # Also check eprint/RFC number if present
            eprint = entry["fields"].get("eprint", "").strip()
            number = entry["fields"].get("number", "").strip()
            id_hit = bool((eprint and eprint in raw) or (number and number in page_title))
            content_match = len(matched_tokens) >= 1 or id_hit
            return {
                "url": url,
                "http_status": code,
                "page_title": page_title[:160],
                "matched_tokens": matched_tokens,
                "content_match": content_match,
                "ok": (200 <= code < 400) and content_match,
            }
    except urllib.error.HTTPError as e:
        return {"url": url, "http_status": e.code, "ok": False, "error": f"HTTP {e.code}"}
    except Exception as exc:
        return {"url": url, "http_status": 0, "ok": False, "error": str(exc)}


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify citations in paper/refs.bib.")
    parser.add_argument("--offline", action="store_true", help="Offline BibTeX syntax & field audit without network calls")
    parser.add_argument("--write", action="store_true", help="Write results/citation-audit.json after live verification")
    args = parser.parse_args()

    if not BIB_PATH.exists():
        print(f"FAIL: {BIB_PATH} not found", file=sys.stderr)
        sys.exit(1)

    raw = BIB_PATH.read_text(encoding="utf-8")
    entries = parse_bibtex(raw)
    keys = [e["key"] for e in entries]
    if len(entries) < 10:
        print(f"FAIL: expected >=10 BibTeX entries, got {len(entries)}", file=sys.stderr)
        sys.exit(1)
    if len(keys) != len(set(keys)):
        print("FAIL: duplicate BibTeX keys detected", file=sys.stderr)
        sys.exit(1)

    doi_count = sum(1 for e in entries if "doi" in e["fields"])
    url_count = sum(1 for e in entries if "url" in e["fields"])
    print(f"Parsed {len(entries)} BibTeX entries ({doi_count} DOIs + {url_count} URLs) from {BIB_PATH.name}.")

    for e in entries:
        f = e["fields"]
        if not f.get("title") or not f.get("author") or not f.get("year"):
            print(f"FAIL: entry '{e['key']}' missing required author/title/year field", file=sys.stderr)
            sys.exit(1)

    if args.offline:
        print(f"PASS (offline BibTeX syntax & completeness check: {len(entries)} entries, {doi_count} DOIs, {url_count} URLs).")
        return

    results = []
    failures = []
    for e in entries:
        f = e["fields"]
        rec: dict = {
            "key": e["key"],
            "type": e["type"],
            "bib_title": strip_braces(f.get("title", "")),
            "year": f.get("year", ""),
        }
        entry_ok = True
        if "doi" in f:
            d_res = verify_doi_entry(e)
            rec["doi_check"] = d_res
            ok = bool(d_res.get("ok"))
            entry_ok = entry_ok and ok
            print(
                f"  [{'OK  ' if ok else 'FAIL'}] DOI ({d_res.get('registry', '?')}, "
                f"title={d_res.get('title_overlap', 0):.2f}, auth={d_res.get('author_match')}) "
                f"{e['key']}: {d_res.get('doi')} -> {d_res.get('remote_title', d_res.get('error', ''))[:64]}"
            )
            if not ok:
                failures.append((e["key"], "doi", d_res))

        if "url" in f:
            u_res = verify_url_entry(e)
            rec["url_check"] = u_res
            ok = bool(u_res.get("ok"))
            entry_ok = entry_ok and ok
            print(
                f"  [{'OK  ' if ok else 'FAIL'}] URL (HTTP {u_res.get('http_status')}, "
                f"match={u_res.get('content_match')}) {e['key']}: {u_res.get('url')}"
            )
            if not ok:
                failures.append((e["key"], "url", u_res))

        if "doi" not in f and "url" not in f:
            has_print = all(f.get(k) for k in ("booktitle", "publisher", "pages", "isbn"))
            rec["print_check"] = {
                "verification_mode": "print-proceedings-no-crossref-doi",
                "publisher": f.get("publisher", ""),
                "pages": f.get("pages", ""),
                "isbn": f.get("isbn", ""),
                "ok": has_print,
            }
            entry_ok = entry_ok and has_print
            print(
                f"  [{'OK  ' if has_print else 'FAIL'}] PRINT (no Crossref chapter DOI; "
                f"MIT Press ISBN {f.get('isbn', '?')}, pp. {f.get('pages', '?')}) {e['key']}"
            )
            if not has_print:
                failures.append((e["key"], "print", rec["print_check"]))

        rec["status"] = "verified" if entry_ok else "failed"
        results.append(rec)

    retracted_count = sum(1 for r in results if r.get("doi_check", {}).get("retracted"))
    report = {
        "version": VERSION,
        "bib_file": "paper/refs.bib",
        "total_entries": len(entries),
        "doi_targets_verified": sum(1 for r in results if r.get("doi_check", {}).get("ok")),
        "doi_targets_total": doi_count,
        "url_targets_verified": sum(1 for r in results if r.get("url_check", {}).get("ok")),
        "url_targets_total": url_count,
        "print_entries_verified": sum(1 for r in results if r.get("print_check", {}).get("ok")),
        "retracted_count": retracted_count,
        "entries": results,
    }

    if args.write:
        OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        OUT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
        print(f"Wrote {OUT_PATH.relative_to(ROOT)}.")

    if failures:
        print(f"\nFAIL: {len(failures)} citation check(s) failed live verification!", file=sys.stderr)
        sys.exit(1)

    print(
        f"\nPASS: All {len(entries)}/{len(entries)} BibTeX entries verified "
        f"({doi_count}/{doi_count} DOIs reachability + Crossref/DataCite title/author match, "
        f"{url_count}/{url_count} URLs reachability + page-title match, "
        f"{report['print_entries_verified']} print proceedings entry with no wrong DOI, 0 retractions)!"
    )


if __name__ == "__main__":
    main()
