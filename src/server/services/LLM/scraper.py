from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings
from pathlib import Path
import os, re,json
from langchain_core.documents import Document

from dotenv import load_dotenv

load_dotenv(".env.llm")

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_PATH = BASE_DIR / "data/"


def load_vectors_from_json(json_path: Path, exam_name: str):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    documents = []

    for domain_name, content_list in data.items():
        for idx, item in enumerate(content_list):

            clean_item = hardcore_clean(item)

            chunks = splitter.split_text(clean_item)

            for chunk_idx, chunk in enumerate(chunks):
                documents.append(
                    Document(
                        page_content=chunk,
                        metadata={
                            "exam": exam_name,
                            "domain": domain_name,
                            "domain_item_index": idx,
                            "chunk_index": chunk_idx
                        }
                    )
                )

    return documents

def save_to_upstash(documents):

    vector_store = UpstashVectorStore.from_documents(
        documents=documents,
        embedding=OpenAIEmbeddings(),
        index_url=os.getenv("UPSTASH_VECTOR_REST_URL"),
        index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN"),
    )


def hardcore_clean(text: str) -> str:
    # Keep only allowed characters
    text = re.sub(r'[^a-zA-Z0-9\s\.,:;?!\-\(\)]', '', text)

    # collapse extra spaces
    text = re.sub(r'\s+', ' ', text)

    text = re.sub(r'-{3,}', '', text)

    return text.strip()


if __name__ == "__main__":

    documents = load_vectors_from_json(
    DATA_PATH/"cloudpractitioner/study_materials/study_materials.json",
    exam_name="AWS Certified Cloud Practitioner"
)
    save_to_upstash(documents)
        