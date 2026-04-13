from jwt_auth.db.db import safe_query, DBError

class ExamError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def get_exam_questions(exam_name: str):
    query = """
            WITH topics AS (
                SELECT exam_name, jsonb_object_keys(exam_topics) AS topic
                FROM exam_info
            )
            SELECT question, choices, answer
            FROM (
                SELECT 
                    q.*,
                    t.exam_name,
                    ROW_NUMBER() OVER (PARTITION BY q.domain ORDER BY RANDOM()) AS rn
                FROM questions q
                JOIN topics t ON q.domain = t.topic
            ) sub
            WHERE rn <= 17
            AND sub.exam_name = $1;
            """

    try:
        results = await safe_query(query, (exam_name,), fetch="all")

        res = [{"question": result[0], "choices": result[1], "answer": result[2]} for result in results]

        return res

    except DBError as e:
        raise ExamError(
            message=f"error fetching questions for exam:{exam_name}",
            status_code=e.status_code,
        )
