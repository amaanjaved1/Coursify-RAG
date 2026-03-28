def parse_ask_body(body: object) -> dict[str, str]:
    if not body or not isinstance(body, dict):
        raise ValueError("Invalid JSON body")
    q = body.get("query")
    if not isinstance(q, str) or not q.strip():
        raise ValueError('Missing or invalid "query" string')
    return {"query": q.strip()}
