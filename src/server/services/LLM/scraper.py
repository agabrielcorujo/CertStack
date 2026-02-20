from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import MarkdownTextSplitter
from langchain_community.vectorstores import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings
from bs4 import BeautifulSoup
from pathlib import Path
import requests
import os, re

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_PATH = BASE_DIR / "data/"


def scrape_from_site(url: str, output_path: Path, content_type: str = "html"):
    """download content from a URL and persist it to disk

    args:
        url: source URL to fetch
        output_path: destination file path for the scraped content
        content_type: "html" to parse with BeautifulSoup, "markdown" to save raw text
    """

    response = requests.get(url, timeout=30)
    response.raise_for_status()

    if content_type == "markdown":
        output_path.write_text(response.text, encoding="utf-8")
        return f"Markdown from {url} saved to {output_path}"

    html = response.text
    soup = BeautifulSoup(html, "html.parser")

    #strip non-content elements
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    text = soup.get_text()

    # remove tabs
    text = text.replace("\t", "")

    # collapse multiple newlines into just one
    clean_text = re.sub(r"\n+", "\n", text)

    # remove trailing/leading whitespace
    clean_text = clean_text.strip()

    output_path.write_text(clean_text, encoding="utf-8")

    return f"Content from {url} scraped and saved to {output_path}"

def chunk_data(data_path: Path):
    """Load and chunk all .txt and .md files in a directory."""

    documents = []
    for filename in os.listdir(data_path):
        if filename.endswith((".txt", ".md")):
            loader = TextLoader(os.path.join(data_path, filename), encoding="utf-8")
            documents.extend(loader.load())

    #use markdown-aware splitter; falls back cleanly for plain text
    text_splitter = MarkdownTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        add_start_index=True,
    )

    chunks = text_splitter.split_documents(documents)

    return chunks

def save_to_upstash(chunks):
    vector_store = UpstashVectorStore.from_documents(
        documents=chunks,
        embedding=OpenAIEmbeddings(),
        index_url=os.getenv("UPSTASH_VECTOR_REST_URL"),
        index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN"),
    )

if __name__ == "__main__":
    print("Use run_scrape.py to execute scraping via configuration.")