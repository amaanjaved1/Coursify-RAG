import json
from typing import Any


def build_context(
    *,
    user_query: str,
    intent: dict[str, Any],
    sql_data: object,
    vector_results: list[str],
) -> str:
    if sql_data is None:
        structured = "(No structured rows for this query.)"
    else:
        structured = json.dumps(sql_data, indent=2)

    if not vector_results:
        opinions = "(No student opinion snippets retrieved.)"
    else:
        opinions = "\n".join(f"{i + 1}. {s}" for i, s in enumerate(vector_results))

    ent = intent.get("entities", {})
    return f"""User Question:
{user_query}

Detected intent: {intent.get("intent")}
Entities: {json.dumps(ent)}
Data: SQL={intent.get("needsSQL")}, vector={intent.get("needsVector")}
Complexity: {intent.get("complexity")}

Structured Data:
{structured}

Student Opinions:
{opinions}

Instructions:
Answer using only the structured data and student opinions above when they are relevant. If data is missing, say so briefly and give general study advice without inventing statistics or ratings."""
