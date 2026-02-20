from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings
from psycopg2 import sql
import os
from dotenv import load_dotenv
load_dotenv(".env.llm")

from jwt_auth.db.db import safe_query,DBError


class LLMError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

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

def query_embeddings(query: str):

    vector_store = UpstashVectorStore(
        embedding=OpenAIEmbeddings(),
        index_url=os.getenv("UPSTASH_VECTOR_REST_URL"),
        index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN"),
    )

    results = vector_store.similarity_search(query, k=5)

    if not results:

        return "No results found"

    context = "\n\n---\n\n".join([doc.page_content for doc in results])

    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    model = ChatOpenAI()
    chain = prompt_template | model

    response = chain.invoke({
        "context": context,
        "query": query
    })

    return response.content

def exam_context(exam:str,params:list=None)->dict:

    if not params:
        raise LLMError(status_code=400,message="no parameters given to extract")
    
    params.append("answering_rules_for_llm")

    fields = [sql.Identifier(field) for field in params]

    query = sql.SQL("""
            SELECT {fields}
            FROM exam_info
            WHERE exam_name = %s
        """).format(
            fields=sql.SQL(",").join(fields)
        )
    
    try:

        res = safe_query(query,(exam,),fetch="one")

    except DBError as error:
        raise LLMError(message=error.message,status_code=error.status_code)

    if not res:
        raise LLMError(message="error fetching exam context",status_code=500)
    
    result = {}

    for index,entry in enumerate(params):
        result[entry] = res[index]
    
    return result



if __name__ == "__main__":

    print(exam_context("AWS Certified Cloud Practitioner",["exam_topics"]))