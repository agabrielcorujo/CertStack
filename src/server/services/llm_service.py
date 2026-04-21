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


DEFAULT_FLASHCARD_AI_RESPONSE = {
    "answer": "I can help explain this card, but I could not produce a structured tutoring response just now.",
    "hint": "Focus on the key AWS concept this question is testing and compare each option against that concept.",
    "why_correct": "The correct choice should be the option that best matches the exam objective and the explanation attached to this card.",
    "why_wrong": "The other choices are likely either incomplete, too broad, or describing a different AWS service or responsibility.",
    "confidence": 0.25,
}


def _serialize_context(value) -> str:
    if value is None:
        return ""

    if isinstance(value, str):
        return value

    try:
        return json.dumps(value, ensure_ascii=True)
    except TypeError:
        return str(value)


def _coerce_confidence(value) -> float:
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return DEFAULT_FLASHCARD_AI_RESPONSE["confidence"]

    return max(0.0, min(1.0, confidence))


def _build_default_structured_response() -> dict:
    return dict(DEFAULT_FLASHCARD_AI_RESPONSE)


def _parse_structured_response(raw_text: str) -> dict:
    try:
        payload = json.loads(raw_text)
    except json.JSONDecodeError:
        payload = {}

    if not isinstance(payload, dict):
        payload = {}

    merged = _build_default_structured_response()
    merged.update(
        {
            "answer": str(payload.get("answer") or merged["answer"]),
            "hint": str(payload.get("hint") or merged["hint"]),
            "why_correct": str(payload.get("why_correct") or merged["why_correct"]),
            "why_wrong": str(payload.get("why_wrong") or merged["why_wrong"]),
            "confidence": _coerce_confidence(payload.get("confidence")),
        }
    )

    return {
        "answer": merged["answer"],
        "hint": merged["hint"],
        "why_correct": merged["why_correct"],
        "why_wrong": merged["why_wrong"],
        "confidence": merged["confidence"],
    }


def _format_structured_response(payload: dict) -> str:
    confidence = int(round(payload["confidence"] * 100))

    return (
        f"Answer: {payload['answer']}\n\n"
        f"Hint: {payload['hint']}\n\n"
        f"Why this is correct: {payload['why_correct']}\n\n"
        f"Why the other options are wrong: {payload['why_wrong']}\n\n"
        f"Confidence: {confidence}%"
    )


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
        Return ONLY a valid JSON with exactly these keys:
        answer, hint, why_correct, why_wrong, confidence

        Field rules:
        - answer: 2 to 4 sentences answering the user's question directly.
        - hint: 1 short sentence that points the learner in the right direction without repeating the full answer.
        - why_correct: 1 to 3 sentences explaining why the correct answer is correct.
        - why_wrong: 1 to 3 sentences explaining the main reason the other options are wrong or less correct.
        - confidence: a number from 0 to 1.

        Use the provided question context, answer key, explanation, and chat history when helpful.
        Do not use markdown. Do not wrap the JSON in code fences. Do not include extra keys.

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

        structured_res = _parse_structured_response(response.output_text)
        res = _format_structured_response(structured_res)

        formatted_res = "\n\t".join(
            res.splitlines()
        )

        chat_history += f"\n\nuser:\n\t{user_question}\n\nLLM:\n\t{formatted_res}"

        await cache.setex(f"{userid}:{q_hash}",120,chat_history)

        return res
    
    except Exception as e:

        raise LLMError(status_code=500,message=str(e))
