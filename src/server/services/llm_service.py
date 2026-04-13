import os,hashlib,asyncio
from openai import OpenAI
from jwt_auth.db.redis import cache

class LLMError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

ENVS = {
    "OPENAI_API_KEY":os.getenv("OPENAI_API_KEY")
}

if not all(ENVS.values()):

    raise RuntimeError("LLM configuration error")


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

        raise LLMError(status_code=500,message=str(e))