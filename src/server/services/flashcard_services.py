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

async def get_5_flaschards_service(exam_id:str,domain:str,subdomain:str=None):
    
    query =  f"""
            SELECT question, choices, answer, explanation
            FROM questions
            WHERE exam_id = $1 AND domain = $2
            {'AND subdomain = $3 ' if subdomain else ''}
            ORDER BY RANDOM()
            LIMIT 5
            """
    if subdomain:
        params = (exam_id,domain,subdomain,)
    else:
        params = (exam_id,domain)

    try:
        results = await safe_query(query,params,fetch="all")

        res = [{"question":result[0],"choices":result[1],"answer":result[2]} for result in results]

        return res

    except DBError as e:
        print(e)
        raise FlashcardError(message="Error getting flashcards.",status_code = 500)
    
async def ask_ai_about_question_service(userid:str,question:str,exam:str,user_question:str):

    try: 

        q_hash = hashlib.md5(question.encode()).hexdigest()

        chat_history = await cache.get(f"{userid}:{q_hash}") 
        chat_history = chat_history or ""

        query = f"""You are a socratic tutor for CertStack, a platform for studying for certifications. 
        Answer the following users doubt about this question in plain text. no markdown or any formatting. just your
        response to their question:
        
        exam:{exam}
        question:{question}
        doubt:{user_question} 
        chat history:{chat_history or ""}"""

        response = await asyncio.to_thread(
            client.responses.create,
            model="gpt-5.4",
            input=query
        )

        res = response.output_text

        formatted_res = "\n\t".join(res.splitlines())

        chat_history += f"\n\nuser:\n\t{user_question}\n\nLLM:\n\t{formatted_res}"

        await cache.setex(f"{userid}:{q_hash}",120,chat_history)

        return res
    
    except Exception as e:

        raise FlashcardError(status_code=500,message=str(e))


    

