from jwt_auth.db.db import safe_query, DBError

class ExamError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def get_exam_questions(exam_id: str):
    query = """
            WITH topics AS (
            SELECT jsonb_object_keys(exam_topics) AS topic
            FROM exam_info
            )
            SELECT question,choices,answer
            FROM (
            SELECT q.*,
                    ROW_NUMBER() OVER (PARTITION BY q.domain ORDER BY RANDOM()) AS rn
            FROM questions q
            JOIN topics t ON q.domain = t.topic
            ) sub
            WHERE rn <= 17
            AND sub.exam_id = $1;
            """

    try:
        results = await safe_query(query, (exam_id,), fetch="all")

        res = [{"question": result[0], "choices": result[1], "answer": result[2]} for result in results]

        return res

    except DBError as e:
        raise ExamError(
            message=f"error fetching questions for exam:{exam_id}",
            status_code=e.status_code,
        )
