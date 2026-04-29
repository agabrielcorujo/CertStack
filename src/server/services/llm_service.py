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

LLM_MODEL = "gpt-5.4"
CACHE_TTL_SECONDS = 120
MAX_CHAT_HISTORY_MESSAGES = 8

SYSTEM_PROMPT = """You are a socratic tutor for CertStack, a platform for studying for certifications.
Return ONLY a valid JSON object with exactly these keys:
answer, hint, why_correct, why_wrong, confidence

Field rules:
- answer: 2 to 4 sentences answering the user's question directly.
- hint: 1 short sentence that points the learner in the right direction without repeating the full answer.
- why_correct: 1 to 3 sentences explaining why the correct answer is correct.
- why_wrong: 1 to 3 sentences explaining the main reason the other options are wrong or less correct.
- confidence: a number from 0 to 1.

Use the provided question context, answer key, explanation, and chat history when helpful.
Do not use markdown. Do not wrap the JSON in code fences. Do not include extra keys."""


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


def _decode_cached_value(value) -> str:
    if value is None:
        return ""

    if isinstance(value, bytes):
        return value.decode("utf-8", errors="ignore")

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


def _history_key(user_id: str, question: str) -> str:
    q_hash = hashlib.md5(question.encode()).hexdigest()
    return f"{user_id}:{q_hash}"


def _normalize_chat_history(raw_history: str) -> list[dict[str, str]]:
    if not raw_history:
        return []

    try:
        parsed = json.loads(raw_history)
    except json.JSONDecodeError:
        parsed = None

    if isinstance(parsed, list):
        normalized = []
        for entry in parsed:
            if not isinstance(entry, dict):
                continue

            role = str(entry.get("role") or "").strip().lower()
            content = str(entry.get("content") or "").strip()
            if role not in {"user", "assistant"} or not content:
                continue

            normalized.append({"role": role, "content": content})

        return normalized[-MAX_CHAT_HISTORY_MESSAGES:]

    legacy_history = raw_history.strip()
    if not legacy_history:
        return []

    return [{"role": "assistant", "content": legacy_history}]


def _format_chat_history_for_prompt(chat_history: list[dict[str, str]]) -> str:
    if not chat_history:
        return "No previous chat history for this card."

    return "\n".join(
        f"{entry['role']}: {entry['content']}"
        for entry in chat_history[-MAX_CHAT_HISTORY_MESSAGES:]
    )


def _append_chat_history(
    chat_history: list[dict[str, str]],
    user_question: str,
    assistant_response: str,
) -> list[dict[str, str]]:
    updated_history = [
        *chat_history,
        {"role": "user", "content": user_question.strip()},
        {"role": "assistant", "content": assistant_response.strip()},
    ]

    return updated_history[-MAX_CHAT_HISTORY_MESSAGES:]


def _build_flashcard_prompt(
    exam: str,
    question: str,
    choices,
    answer,
    explanation: str | None,
    user_question: str,
    chat_history: list[dict[str, str]],
) -> str:
    payload = {
        "exam": exam,
        "question": question,
        "choices": _serialize_context(choices),
        "correct_answer": _serialize_context(answer),
        "explanation": _serialize_context(explanation),
        "user_question": user_question,
        "chat_history": _format_chat_history_for_prompt(chat_history),
    }

    return "\n".join(f"{key}: {value}" for key, value in payload.items())


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
        history_key = _history_key(userid, question)
        raw_history = _decode_cached_value(await cache.get(history_key))
        chat_history = _normalize_chat_history(raw_history)
        query = _build_flashcard_prompt(
            exam,
            question,
            choices,
            answer,
            explanation,
            user_question,
            chat_history,
        )

        response = await asyncio.to_thread(
            client.responses.create,
            model=LLM_MODEL,
            input=f"{SYSTEM_PROMPT}\n\n{query}"
        )

        structured_res = _parse_structured_response(response.output_text)
        res = _format_structured_response(structured_res)
        updated_chat_history = _append_chat_history(chat_history, user_question, res)

        await cache.setex(
            history_key,
            CACHE_TTL_SECONDS,
            json.dumps(updated_chat_history, ensure_ascii=True),
        )

        return res
    
    except Exception as e:

        raise LLMError(status_code=500,message=str(e))
