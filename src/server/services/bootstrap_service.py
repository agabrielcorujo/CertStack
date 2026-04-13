from jwt_auth.db.db import DBError, safe_query


class BootstrapError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def ensure_app_schema():
    queries = [
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS certs jsonb[] NOT NULL DEFAULT ARRAY[]::jsonb[];
        """,
    ]

    try:
        for query in queries:
            await safe_query(query)
    except DBError as error:
        raise BootstrapError(message=error.message, status_code=error.status_code)
