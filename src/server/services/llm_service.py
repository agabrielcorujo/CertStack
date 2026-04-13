import asyncio
import hashlib
import json
import os
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


def _serialize_context(value) -> str:
    if value is None:
        return ""

    if isinstance(value, str):
        return value

    try:
        return json.dumps(value, ensure_ascii=True)
    except TypeError:
        return str(value)


async def ask_ai_about_question_service(
    userid: str,
    question: str,
    exam: str,
    user_question: str,
    choices=None,
    answer=None,
    explanation: str | None = None,
):

    try: 

        q_hash = hashlib.md5(question.encode()).hexdigest()

        chat_history = await cache.get(f"{userid}:{q_hash}") 
        chat_history = chat_history or ""

        serialized_choices = _serialize_context(choices)
        serialized_answer = _serialize_context(answer)
        serialized_explanation = _serialize_context(explanation)

        query = f"""You are a socratic tutor for CertStack, a platform for studying for certifications.
        Answer the user's question in plain text only. Do not use markdown or bullet formatting.
        Use the provided question context, answer key, and explanation when helpful.
        If the user asks why an answer is right or wrong, explain the reasoning clearly.

        exam: {exam}
        question: {question}
        choices: {serialized_choices}
        correct_answer: {serialized_answer}
        explanation: {serialized_explanation}
        user_question: {user_question}
        chat_history: {chat_history or ""}"""

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
