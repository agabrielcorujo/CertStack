import json
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

import requests
from langchain_community.document_loaders import PyPDFLoader

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data" / "aws_notes"

REPO_OWNER = "kennethleungty"
REPO_NAME = "AWS-Certified-Cloud-Practitioner-Notes"
REPO_BRANCH = "main"


def fetch_pdf_paths() -> List[str]:
    """Return list of PDF file paths from the target GitHub repository."""
    tree_url = (
        f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"
        f"/git/trees/{REPO_BRANCH}?recursive=1"
    )
    response = requests.get(tree_url, timeout=30)
    response.raise_for_status()

    tree = response.json().get("tree", [])
    pdf_paths = [
        item.get("path", "")
        for item in tree
        if item.get("type") == "blob" and item.get("path", "").lower().endswith(".pdf")
    ]
    return pdf_paths


def build_raw_url(repo_path: str) -> str:
    """Construct raw GitHub URL for a given repo path."""
    return (
        f"https://raw.githubusercontent.com/{REPO_OWNER}/"
        f"{REPO_NAME}/{REPO_BRANCH}/{repo_path}"
    )


def download_pdf(raw_url: str, destination: Path) -> None:
    """Download a PDF from a raw GitHub URL to destination path."""
    response = requests.get(raw_url, stream=True, timeout=60)
    response.raise_for_status()

    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)


def extract_pdf_text(pdf_path: Path) -> Tuple[str, int]:
    """Extract text and page count from a PDF using LangChain's PyPDFLoader."""
    loader = PyPDFLoader(str(pdf_path))
    documents = loader.load()

    page_count = len(documents)
    content = "\n\n".join(doc.page_content.strip() for doc in documents)
    return content, page_count


def sanitize_slug(repo_path: str) -> str:
    """Create a filesystem-safe slug from a repository path."""
    slug = repo_path.replace("/", "__")
    slug = re.sub(r"[^A-Za-z0-9_.-]+", "_", slug)
    return slug.strip("._") or "pdf"


def save_pdf_json(
    repo_path: str, content: str, page_count: int, extracted_at: str
) -> Path:
    """Save extracted PDF data to a JSON file with metadata."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    slug = sanitize_slug(repo_path)
    output_path = DATA_DIR / f"{slug}_content.json"

    payload: Dict[str, object] = {
        "filename": Path(repo_path).name,
        "repo_path": repo_path,
        "page_count": page_count,
        "extracted_at": extracted_at,
        "content": content,
    }

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return output_path


def process_repository() -> Dict[str, object]:
    """Fetch PDFs from the repo, extract text, and persist as JSON files."""
    pdf_paths = fetch_pdf_paths()
    print(f"Found {len(pdf_paths)} PDF file(s) in the repository.")

    results: Dict[str, object] = {"processed": 0, "failed": []}

    if not pdf_paths:
        return results

    with tempfile.TemporaryDirectory() as tmpdir:
        for repo_path in pdf_paths:
            raw_url = build_raw_url(repo_path)
            temp_pdf = Path(tmpdir) / Path(repo_path).name

            try:
                download_pdf(raw_url, temp_pdf)
                content, page_count = extract_pdf_text(temp_pdf)
                extracted_at = datetime.now(timezone.utc).isoformat()
                output_path = save_pdf_json(repo_path, content, page_count, extracted_at)
                results["processed"] += 1
                print(f"Saved {repo_path} -> {output_path}")
            except Exception as exc:  # noqa: BLE001
                results["failed"].append({"path": repo_path, "error": str(exc)})
                print(f"Failed {repo_path}: {exc}")

    return results


if __name__ == "__main__":
    summary = process_repository()
    print(
        f"Done. Processed: {summary.get('processed', 0)}, "
        f"Failed: {len(summary.get('failed', []))}"
    )
