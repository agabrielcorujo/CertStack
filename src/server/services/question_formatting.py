import json


def parse_json_field(value, default):
    if value is None:
        return default

    if isinstance(value, (list, dict)):
        return value

    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return default

    return default


def parse_answer_field(value):
    if value is None:
        return []

    if isinstance(value, list):
        return [str(item) for item in value]

    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return [str(item) for item in parsed]
            if isinstance(parsed, str):
                return [parsed]
        except json.JSONDecodeError:
            pass

        if value.startswith("{") and value.endswith("}"):
            inner = value[1:-1].strip()
            if not inner:
                return []

            return [item.strip().strip('"') for item in inner.split(",") if item.strip()]

        return [value]

    return [str(value)]


def parse_choices_field(value):
    parsed = parse_json_field(value, {})

    if isinstance(parsed, dict):
        return {str(key): str(choice) for key, choice in parsed.items()}

    if isinstance(parsed, list):
        return [str(choice) for choice in parsed]

    return {}
