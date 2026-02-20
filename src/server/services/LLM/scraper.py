from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings
from bs4 import BeautifulSoup
from pathlib import Path
import requests
import os,re

BASE_DIR = Path(__file__).resolve().parents[2] 

DATA_PATH = BASE_DIR /"data/"

def scrape_from_site(url:str,output_path:Path):

    response = requests.get(url)

    html = response.text

    soup = BeautifulSoup(html, "html.parser")

    text = soup.get_text()

    # remove tabs
    text = text.replace("\t", "")

    # collapse multiple newlines into just one
    clean_text = re.sub(r'\n+', '\n', text)

    # remove trailing/leading whitespace
    clean_text = clean_text.strip()

    with open(output_path,"w") as f:
        f.write(clean_text)

    return f"Content from {url} scraped and saved to {output_path} ."

def chunk_data(data_path:Path):

    documents = []
    for filename in os.listdir(DATA_PATH):
        if filename.endswith(".txt"):
            loader = TextLoader(os.path.join(DATA_PATH, filename))
            documents.extend(loader.load())
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        length_function=len,
        add_start_index=True,
        separators = [
            "\n          ",
            "\n\n",
            "\n",
        ],
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

    scrape_from_site("some url",DATA_PATH)

    chunk_data(DATA_PATH)