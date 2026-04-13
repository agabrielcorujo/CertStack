from jwt_auth.db.db import safe_query,DBError
import json

class ProfileError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def _normalize_cert_name(cert: str) -> str:
    return cert.strip().lower()


def _deserialize_certs(raw_certs) -> list[dict]:
    if not raw_certs:
        return []

    formatted = []
    for cert in raw_certs:
        if isinstance(cert, str):
            cert = json.loads(cert)

        formatted.append(
            {
                "cert": _normalize_cert_name(cert.get("cert", "")),
                "correctqnum": int(cert.get("correctqnum", 0)),
                "incorrectqnum": int(cert.get("incorrectqnum", 0)),
            }
        )

    return formatted


def _serialize_certs(certs: list[dict]) -> list[str]:
    return [json.dumps(cert) for cert in certs]


def _build_cert_payload(cert: str, correct: int = 0, incorrect: int = 0) -> dict:
    return {
        "cert": _normalize_cert_name(cert),
        "correctqnum": correct,
        "incorrectqnum": incorrect,
    }


def _summarize_certs(certs: list[dict]) -> tuple[list[dict], dict]:
    total_correct = 0
    total_incorrect = 0
    summarized = []

    for cert in certs:
        correct = int(cert.get("correctqnum", 0))
        incorrect = int(cert.get("incorrectqnum", 0))
        attempts = correct + incorrect

        total_correct += correct
        total_incorrect += incorrect
        summarized.append(
            {
                **cert,
                "accuracy": round((correct / attempts) * 100, 1) if attempts else 0.0,
                "attempts": attempts,
            }
        )

    totals = {
        "correct": total_correct,
        "incorrect": total_incorrect,
        "attempts": total_correct + total_incorrect,
        "accuracy": round((total_correct / (total_correct + total_incorrect)) * 100, 1)
        if (total_correct + total_incorrect)
        else 0.0,
    }

    return summarized, totals


async def _fetch_user_certs(user_id: str) -> tuple[str, list[dict]]:
    query = "SELECT first_name, certs FROM users WHERE id = $1"

    try:
        result = await safe_query(query, (user_id,), fetch="one")
    except DBError:
        raise ProfileError("error fetching profile", 500)

    if not result:
        raise ProfileError("user not found", 404)

    return result[0], _deserialize_certs(result[1])


async def create_profile(user_id:str,certs:list[str] | None = None):
    certs = certs or []
    unique_certs = []
    seen = set()

    for cert in certs:
        normalized = _normalize_cert_name(cert)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        unique_certs.append(_build_cert_payload(normalized))

    try:
        res = await safe_query(
            "UPDATE users SET certs = $1::jsonb[] WHERE id = $2 RETURNING id",
            (_serialize_certs(unique_certs), user_id),
            fetch="one"
        )

    except DBError as error:

        raise ProfileError(status_code=error.status_code,message=error.message)
    
    if not res: 
    
        raise ProfileError(status_code=400,message="error creating profile")
    
    return {"status":"success"}
    
async def update_profile(user_id:str,cert:str):
    _, current_certs = await _fetch_user_certs(user_id)
    normalized = _normalize_cert_name(cert)

    if any(existing["cert"] == normalized for existing in current_certs):
        return {"status":"success"}

    current_certs.append(_build_cert_payload(normalized))

    try:
        res = await safe_query(
            "UPDATE users SET certs = $1::jsonb[] WHERE id = $2 RETURNING id",
            (_serialize_certs(current_certs), user_id),
            fetch="one"
        )

    except DBError as error:
        
        raise ProfileError(status_code=error.status_code,message=error.message)
    
    if not res: 
    
        raise ProfileError(status_code=400,message="error updating profile")
    
    return {"status":"success"}

async def get_profile(user_id:str):
    name, certs = await _fetch_user_certs(user_id)
    summarized_certs, totals = _summarize_certs(certs)
    
    return {
        "name":name,
        "certs":summarized_certs,
        "totals": totals,
    }

async def record_progress(user_id: str, exam_name: str, correct: int = 0, incorrect: int = 0):
    if correct < 0 or incorrect < 0:
        raise ProfileError("progress values must be positive", 400)

    if correct == 0 and incorrect == 0:
        raise ProfileError("at least one progress value must be provided", 400)

    name, certs = await _fetch_user_certs(user_id)
    normalized = _normalize_cert_name(exam_name)

    target = None
    for cert in certs:
        if cert["cert"] == normalized:
            target = cert
            break

    if target is None:
        target = _build_cert_payload(normalized)
        certs.append(target)

    target["correctqnum"] += correct
    target["incorrectqnum"] += incorrect

    try:
        await safe_query(
            "UPDATE users SET certs = $1::jsonb[] WHERE id = $2",
            (_serialize_certs(certs), user_id),
        )
    except DBError as error:
        raise ProfileError(status_code=error.status_code, message=error.message)

    summarized_certs, totals = _summarize_certs(certs)

    return {
        "status": "success",
        "name": name,
        "certs": summarized_certs,
        "totals": totals,
    }



