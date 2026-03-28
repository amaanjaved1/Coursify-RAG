from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from typing import Any

from flask import Blueprint, jsonify, request

from app.services.context_builder import build_context
from app.services.intent import resolve_intent
from app.services.llm_service import generate_answer
from app.services.sql_service import get_course_stats
from app.services.vector_service import search_similar
from app.utils.validation import parse_ask_body

ask_bp = Blueprint("ask", __name__)


def _course_codes_for_sql(resolved: dict[str, Any]) -> list[str]:
    entities = resolved.get("entities") or {}
    if isinstance(entities, dict):
        codes = entities.get("course_codes")
        if isinstance(codes, list) and codes:
            return [str(c) for c in codes]
        one = entities.get("course_code")
        if isinstance(one, str) and one:
            return [one]
    return []


def _fetch_structured_data(resolved: dict[str, Any]) -> dict[str, Any] | None:
    if not resolved.get("needsSQL"):
        return None
    codes = _course_codes_for_sql(resolved)
    if not codes:
        return None
    stats_list = [get_course_stats(c) for c in codes]
    if len(codes) == 1:
        return {"courseStats": stats_list[0]}
    return {"courseStatsByCourse": dict(zip(codes, stats_list, strict=True))}


@ask_bp.route("/health", methods=["GET"])
def health() -> tuple[Any, int]:
    return jsonify({"status": "ok"}), 200


@ask_bp.route("/ask", methods=["POST"])
def ask() -> tuple[Any, int]:
    try:
        body = request.get_json(silent=True)
        parsed = parse_ask_body(body)
        user_query = parsed["query"]
        intent = resolve_intent(user_query)

        def sql_task() -> dict[str, Any] | None:
            return _fetch_structured_data(intent)

        def vector_task() -> list[str]:
            if intent.get("needsVector"):
                return search_similar(user_query)
            return []

        with ThreadPoolExecutor(max_workers=2) as pool:
            sql_future = pool.submit(sql_task)
            vec_future = pool.submit(vector_task)
            sql_data = sql_future.result()
            vector_results = vec_future.result()

        prompt = build_context(
            user_query=user_query,
            intent=intent,
            sql_data=sql_data,
            vector_results=vector_results,
        )
        answer = generate_answer(prompt)

        payload: dict[str, Any] = {"answer": answer}
        if request.args.get("debug") == "1":
            payload["debug"] = {
                "intent": intent,
                "sqlSnippet": sql_data,
                "vectorPreview": vector_results,
            }
        return jsonify(payload), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        message = str(e) if e else "Unexpected error"
        status = 400 if ("Invalid" in message or "Missing" in message) else 500
        return jsonify({"error": message}), status
