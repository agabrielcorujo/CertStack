from jwt_auth.db import safe_query #syntax: result = safe_query(query,(param1,param2...),fetch="one/all",insert=True/False)
import boto3 as aws
from dotenv import load_dotenv
import os

class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def sample_function(userid:str,param:type)->type:

    if ... : #something goes wrong

        raise AppError(message="something went wrong",status_code="some status code")

    return ...


import hashlib
from langchain_community.document_loaders import DirectoryLoader, JSONLoader
import json
from langchain_community.vectorstores.upstash import UpstashVectorStore
import getpass
from langchain_openai import OpenAIEmbeddings

#input should be a folder with json or a singular json file
def update_Database(path:str)->str: #return number of added docs

    os.environ["UPSTASH_VECTOR_REST_URL"] = "https://loving-kingfish-56853-us1-vector.upstash.io"
    if not os.environ.get("UPSTASH_VECTOR_REST_TOKEN"):
        os.environ["UPSTASH_VECTOR_REST_TOKEN"] = getpass.getpass("Enter API key for Upstash: ")

    if not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")
    loader_kwargs = {
        "jq_schema": ".[]", #iterate over question objects.
        "text_content": False
    }
    loader = DirectoryLoader(
        path=path, 
        glob="**/*.json", #ensures json
        loader_cls=JSONLoader,
        loader_kwargs=loader_kwargs
    )
    docs = loader.load()
    sanitized_docs = []
    doc_ids = [] # Standardized name
    
    for doc in docs:
        raw_data = json.loads(doc.page_content)
        question_text = raw_data.get("question")
        unique_id = hashlib.md5(question_text.encode('utf-8')).hexdigest()
        
        doc.metadata = {
            "choices": raw_data.get("choices"),
            "category": raw_data.get("category"),
            "answer": raw_data.get("answer"),
            "difficulty": raw_data.get("difficulty"),
        }
        doc.page_content = question_text
        doc_ids.append(unique_id)
        sanitized_docs.append(doc)

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    store = UpstashVectorStore(
        embedding=embeddings
    )
    store.add_documents(documents=sanitized_docs, ids=doc_ids)
    return f"Successfully processed {len(sanitized_docs)} documents."



