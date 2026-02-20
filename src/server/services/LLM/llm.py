from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings
import os

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

if __name__ == "__main__":

    query_db("what is a VPC?")