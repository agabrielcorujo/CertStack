from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings
import os
from dotenv import load_dotenv


#only call setup() with local data, not in docker. pls dont load data into docker container


DATA_PATH = "some path to data to be chunked"

PROMPT_TEMPLATE="""
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {query}

"""

ENVS = {
    "OPENAI_API_KEY":os.getenv("OPENAI_API_KEY"),
    "UPSTASH_VECTOR_REST_URL":os.getenv("UPSTASH_VECTOR_REST_URL"),
    "UPSTASH_VECTOR_REST_TOKEN":os.getenv("UPSTASH_VECTOR_REST_TOKEN")
}

if not all(ENVS.values()):

    raise RuntimeError("LLM configuration error")

def load_docs():
    documents = []
    for filename in os.listdir(DATA_PATH):
        if filename.endswith(".txt"):
            loader = TextLoader(os.path.join(DATA_PATH, filename))
            documents.extend(loader.load())
    return documents

def split_text(documents:list):

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

def query_db(query: str):

    vector_store = UpstashVectorStore(
        embedding=OpenAIEmbeddings(),
        index_url=os.getenv("UPSTASH_VECTOR_REST_URL"),
        index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN"),
    )

    results = vector_store.similarity_search(query, k=5)

    if not results:
        print("No results found.")
        return

    context = "\n\n---\n\n".join([doc.page_content for doc in results])

    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    model = ChatOpenAI()
    chain = prompt_template | model

    response = chain.invoke({
        "context": context,
        "query": query
    })

    print(response.content)

def setup():
    chunks = split_text(load_docs())
    save_to_upstash(chunks)

if __name__ == "__main__":

    query_db("what is a VPC?")