'''IMPLEMENT SERVICES HERE'''



class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

from dotenv import load_dotenv
import os
import hashlib
from langchain_community.document_loaders import DirectoryLoader, JSONLoader
import json
from langchain_community.vectorstores.upstash import UpstashVectorStore
import getpass
from langchain_openai import OpenAIEmbeddings
from langchain.tools import tool


ALLOWED_READ_COLUMNS = {  # {"table": [...], ...}
       #"users":["email","first_name","last_name","phone","major","graduation_date","resume","minor"]
} 

ALLOWED_WRITE_COLUMNS = { # {"ta": [...], ...}
        #"users":["email","phone","mbleajor","graduation_date","minor"]
}  

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



#input should be a folder with json
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
            "exam": raw_data.get("exam"),
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


def get_exam(exam: str, category: str = "") -> list[dict]:
    store = get_vector_store()
    formatted_results = []
    filter_string = f"exam = '{exam}' AND category = '{category}'"
    
    if category == "":
        filter_string = f"exam = '{exam}'"

    results = store.similarity_search(
        query="", 
        k=100, #max number set
        filter=filter_string
    )
    for doc in results:
        data = {
            "question": doc.page_content,
            "choices": doc.metadata.get("choices"),
            "answer": doc.metadata.get("answer"),
            "difficulty": doc.metadata.get("difficulty"),
            "category": doc.metadata.get("category")
        }
        formatted_results.append(data)
    return formatted_results
    

def get_vector_store()-> UpstashVectorStore: #returns upstash data
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



'''LLM TOOLs'''


async def sql_read_tool(table: str, columns: list, id: str) -> dict:
    if table not in ALLOWED_READ_COLUMNS:
        raise ToolError("Unauthorized table", 403)
    
    for col in columns:
        if col not in ALLOWED_READ_COLUMNS[table]:
            raise ToolError(f"Unauthorized column: {col}", 403)

    query = sql.SQL("SELECT {fields} FROM {table_name} WHERE id = %s").format(
        fields=sql.SQL(",").join(map(sql.Identifier, columns)),
        table_name=sql.Identifier(table)
    )

    try:
        results = await safe_query(query, (id,), fetch="one")
        if not results:
            return {"status": "nothing returned"}
        return {
            "status": "success",
            "result": {column: results[index] for index, column in enumerate(columns)}
        }
    except DBError as e:
        raise ToolError(f"Database error: {e.message}", 500)

async def sql_update_tool(table: str, columns: dict, id: str) -> dict:
    if table not in ALLOWED_WRITE_COLUMNS:
        raise ToolError("Unauthorized table", 403)

    set_parts = []
    values = []
    for col, val in columns.items():
        if col not in ALLOWED_WRITE_COLUMNS[table]:
            raise ToolError(f"Unauthorized column: {col}", 403)
        set_parts.append(sql.SQL("{} = %s").format(sql.Identifier(col)))
        values.append(val)
    
    values.append(id)
    query = sql.SQL("UPDATE {table_name} SET {sets} WHERE id = %s RETURNING id").format(
        table_name=sql.Identifier(table),
        sets=sql.SQL(", ").join(set_parts)
    )

    try:
        results = await safe_query(query, tuple(values), fetch="one")
        return {"status": "success" if results else "nothing updated"}
    except DBError as e:
        raise ToolError(f"Update error: {e.message}", 500)

async def query_vector_store_tool(query: str) -> dict:
    try:
        store = get_vector_store()
        results = store.similarity_search(query, k=5)
        context = "\n\n---\n\n".join([doc.page_content for doc in results])
        return {"status": "success", "context": context if results else "No matches found"}
    except Exception as e:
        raise ToolError(f"Vector search failed: {str(e)}", 500)

if __name__ == "__main__":
    initialize_config()
    exams = get_exam("cloud practitioner")
    for exam in exams:
        print("Question: " + str(exam["question"]) + "\n")
        print("Choices: " + str(exam["choices"]) + "\n")
        print("___________________________________________________________________") 