from jwt_auth.db.db import safe_query,DBError
from services.question_formatting import parse_answer_field, parse_choices_field

class FlashcardError(Exception):
   def __init__(self, message: str, status_code: int = 400):
       self.message = message
       self.status_code = status_code
       super().__init__(message)

async def get_5_flaschards_service(exam_name:str,domain:str,subdomain:str=None,limit: int = 10):
    if limit < 1 or limit > 50:
        raise FlashcardError(message="limit must be between 1 and 50", status_code=400)

    limit_placeholder = "$4" if subdomain else "$3"
    query = f"""
            SELECT question, choices, answer, explanation
            FROM questions q
            JOIN exam_info ei ON ei.exam_id = q.exam_id
            WHERE ei.exam_name = $1
            AND q.domain = $2
            {"AND q.subdomain = $3" if subdomain else ""}
            ORDER BY RANDOM()
            LIMIT {limit_placeholder}
            """
    if subdomain:
        params = (exam_name,domain,subdomain,limit)
    else:
        params = (exam_name,domain,limit)

    try:
        results = await safe_query(query,params,fetch="all")

        res = [
            {
                "question": result[0],
                "choices": parse_choices_field(result[1]),
                "answer": parse_answer_field(result[2]),
                "explanation": result[3],
                "domain": domain,
                "subdomain": subdomain,
                "exam_name": exam_name,
            }
            for result in results
        ]

        return res

    except DBError:
        raise FlashcardError(message="Error getting flashcards.",status_code = 500)
