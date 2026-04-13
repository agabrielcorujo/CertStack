from jwt_auth.db.db import safe_query,DBError
from jwt_auth.db.redis import cache
from openai import OpenAI
import asyncio
import os
import hashlib

class FlashcardError(Exception):
   def __init__(self, message: str, status_code: int = 400):
       self.message = message
       self.status_code = status_code
       super().__init__(message)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_5_flaschards_service(exam_name:str,domain:str,subdomain:str=None):
    
    query = """
            SELECT question, choices, answer, explanation
            FROM questions q
            JOIN exam_info ei ON ei.exam_id = q.exam_id
            WHERE ei.exam_name = $1
            AND q.domain = $2
            """ + ("AND q.subdomain = $3\n" if subdomain else "") + """
            ORDER BY RANDOM()
            LIMIT 5
            """
    if subdomain:
        params = (exam_name,domain,subdomain,)
    else:
        params = (exam_name,domain)

    try:
        results = await safe_query(query,params,fetch="all")

        res = [{"question":result[0],"choices":result[1],"answer":result[2]} for result in results]

        return res

    except DBError as e:
        print(e)
        raise FlashcardError(message="Error getting flashcards.",status_code = 500)
    


    

