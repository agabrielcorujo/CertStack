from jwt_auth.db.db import safe_query, DBError
from services.question_formatting import (
    parse_answer_field,
    parse_choices_field,
    parse_json_field,
)

class ExamError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def _normalize_exam_name(exam_name: str) -> str:
    return exam_name.strip().lower()


def _slugify(value: str) -> str:
    return "-".join(value.lower().split())


def _build_exam_payload(exam_name: str, metadata: dict, domain_counts: dict[str, int]) -> dict:
    normalized = _normalize_exam_name(exam_name)
    total_questions = sum(domain_counts.values())

    return {
        "exam_name": exam_name,
        "slug": _slugify(normalized),
        "normalized_name": normalized,
        "display_name": metadata.get("display_name", exam_name.title()),
        "description": metadata.get("description", ""),
        "focus": metadata.get("focus", ""),
        "question_count": total_questions,
        "domains": [
            {
                "name": domain,
                "question_count": count,
            }
            for domain, count in sorted(domain_counts.items())
        ],
        "domain_weights": metadata.get("domain_weights", []),
        "topic_outline": metadata.get("topic_outline", []),
    }


async def list_exams():
    metadata_query = """
                     SELECT exam_name, description, exam_focus, domain_weights, exam_topics
                     FROM exam_info
                     ORDER BY exam_name
                     """

    counts_query = """
                   SELECT ei.exam_name, q.domain, COUNT(*)::int
                   FROM questions q
                   JOIN exam_info ei ON ei.exam_id = q.exam_id
                   GROUP BY ei.exam_name, q.domain
                   ORDER BY ei.exam_name, q.domain
                   """

    try:
        metadata_results = await safe_query(metadata_query, fetch="all",cache_aside=False)
        count_results = await safe_query(counts_query, fetch="all",cache_aside=False)
    except DBError as error:
        raise ExamError(message=error.message, status_code=error.status_code)

    exams: dict[str, dict] = {}

    for exam_name, description, exam_focus, domain_weights, exam_topics in metadata_results:
        exams[exam_name] = {
            "metadata": {
                "display_name": exam_name,
                "description": description or "",
                "focus": exam_focus or "",
                "domain_weights": parse_json_field(domain_weights, []),
                "topic_outline": parse_json_field(exam_topics, []),
            },
            "domains": {},
        }

    for exam_name, domain, count in count_results:
        exams.setdefault(
            exam_name,
            {
                "metadata": {
                    "display_name": exam_name,
                    "description": "",
                    "focus": "",
                    "domain_weights": [],
                    "topic_outline": [],
                },
                "domains": {},
            },
        )
        exams[exam_name]["domains"][domain] = count

    return [
        _build_exam_payload(exam_name, payload["metadata"], payload["domains"])
        for exam_name, payload in sorted(exams.items())
    ]


async def get_exam_questions(exam_name: str, limit_per_domain: int = 17):
    if limit_per_domain < 1 or limit_per_domain > 100:
        raise ExamError(message="limit_per_domain must be between 1 and 100", status_code=400)

    query = """
            SELECT question, choices, answer, explanation, domain, subdomain
            FROM (
                SELECT 
                    q.*,
                    ROW_NUMBER() OVER (PARTITION BY q.domain ORDER BY RANDOM()) AS rn
                FROM questions q
                JOIN exam_info ei ON ei.exam_id = q.exam_id
                WHERE ei.exam_name = $1
            ) sub
            WHERE rn <= $2
            ORDER BY domain, subdomain, question;
            """

    try:
        results = await safe_query(query, (exam_name, limit_per_domain), fetch="all",cache_aside=False)

        res = [
            {
                "question": result[0],
                "choices": parse_choices_field(result[1]),
                "answer": parse_answer_field(result[2]),
                "explanation": result[3],
                "domain": result[4],
                "subdomain": result[5],
                "exam_name": exam_name,
            }
            for result in results
        ]

        return res

    except DBError as error:
        raise ExamError(
            message=f"error fetching questions for exam:{exam_name}",
            status_code=error.status_code,
        )
