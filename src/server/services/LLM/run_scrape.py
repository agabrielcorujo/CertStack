import json
import time
from pathlib import Path

from scraper import scrape_from_site

BASE_DIR = Path(__file__).resolve().parents[2]
OUTPUT_DIR = BASE_DIR / "data" / "cloudpractitioner" / "study_materials"
COMBINED_JSON_PATH = OUTPUT_DIR / "study_materials.json"
CONFIG_PATH = Path(__file__).with_name("scrape_urls.json")
WRITE_RAW_FILES = False  # set True to keep the .md/.txt outputs; False writes JSON only

#if you want to add more sources later, append them to scrape_urls.json and run this file

def run():
    #always ensure the output directory exists; it will hold the combined JSON and (optionally) raw files.
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    sources = config.get("sources", [])

    records = []

    for entry in sources:
        url = entry.get("url")
        content_type = entry.get("content_type", "html")
        output_name = entry.get("output") or f"{entry.get('topic', 'source')}.txt"
        output_path = OUTPUT_DIR / output_name

        if not url:
            print(f"! Skipping entry with no URL: {entry}")
            continue

        try:
            message = scrape_from_site(url, output_path, content_type=content_type)
            topic = entry.get("topic", "unknown")
            source = entry.get("source", "")
            print(f"\u2713 {topic} ({source}) -> {output_path.name}")
            print(f"    {message}")

            #load the scraped content and emit a structured JSON alongside the raw file
            scraped_text = output_path.read_text(encoding="utf-8")
            record = {
                "topic": topic,
                "domain": entry.get("domain", ""),
                "source": source,
                "url": url,
                "content_type": content_type,
                "output_file": output_path.name,
                "scraped_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "content": scraped_text,
            }
            records.append(record)

            if not WRITE_RAW_FILES:
                try:
                    output_path.unlink(missing_ok=True)
                except Exception:
                    pass
        except Exception as exc:
            print(f"! Failed to scrape {url}: {exc}")

        time.sleep(1)

    if records:
        COMBINED_JSON_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nSaved combined JSON with {len(records)} entries -> {COMBINED_JSON_PATH}")
    else:
        print("No records scraped; combined JSON not written.")


if __name__ == "__main__":
    run()
