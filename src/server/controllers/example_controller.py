<<<<<<< HEAD
#from jwt_auth.db import safe_query #syntax: result = safe_query(query,(param1,param2...),fetch="one/all",insert=True/False)
import boto3 as aws
from dotenv import load_dotenv
import os
=======
from schemas.schema import SampleRequest
from services.example_service import sample_service,AppError
from fastapi import HTTPException
>>>>>>> 7f4566eef0d6d3ebf339f6d0fabbe67e01db43fa

class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def sample_function(userid:str,param:type)->type:

    if ... : #something goes wrong

        raise AppError(message="something went wrong",status_code="some status code")

    return ...

<<<<<<< HEAD
import hashlib
from langchain_community.document_loaders import DirectoryLoader, JSONLoader
import json
from langchain_community.vectorstores.upstash import UpstashVectorStore
import getpass
from langchain_openai import OpenAIEmbeddings
from langchain.tools import tool


def initialize_config():
    load_dotenv()
    os.environ["UPSTASH_VECTOR_REST_URL"] = "https://loving-kingfish-56853-us1-vector.upstash.io"
    # Required keys
    keys = [
        "UPSTASH_VECTOR_REST_URL",
        "UPSTASH_VECTOR_REST_TOKEN",
        "OPENAI_API_KEY"
    ]
    for key in keys:
        if not os.environ.get(key):
            os.environ[key] = getpass.getpass(f"Enter {key}: ")


            
#input should be a folder with json or a singular json file
def Update_Database(path:str)->str: #return number of added docs

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


def Similarity_Search(query: str, k: int = 3) -> list[str]:
    store = get_vector_store()
    results = store.similarity_search(query, k=k)
    return [doc.page_content for doc in results]



#Helper Functions

@tool(response_format="content_and_artifact")
def retrieve_context(query: str):
    
    store = get_vector_store()
    retrieved_docs = store.similarity_search(query, k=2)
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\n Content: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs



def get_vector_store()-> UpstashVectorStore:
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    return UpstashVectorStore(embedding=embeddings)



def get_metadata(query: str, k: int = 1)->list[dict]:
    store = get_vector_store()
    results = store.similarity_search(query, k=k)
    
    formatted_results = []
    
    for doc in results:
        data = {
            "question": doc.page_content,
            "choices": doc.metadata.get("choices"),
            "answer": doc.metadata.get("answer"),
            "difficulty": doc.metadata.get("difficulty")
        }
        formatted_results.append(data)
        
    return formatted_results

=======
>>>>>>> 7f4566eef0d6d3ebf339f6d0fabbe67e01db43fa
