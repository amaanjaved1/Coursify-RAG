"""Rule-based intent resolution."""

from __future__ import annotations

import re
from typing import Literal, TypedDict

Intent = Literal[
    "course_difficulty",
    "grade_distribution",
    "professor_rating",
    "course_reviews",
    "comparison",
    "general_advice",
]

Complexity = Literal["simple", "complex"]


class DataRequirements(TypedDict):
    needsSQL: bool
    needsVector: bool


INTENT_DATA_MAP: dict[Intent, DataRequirements] = {
    "course_difficulty": {"needsSQL": True, "needsVector": True},
    "grade_distribution": {"needsSQL": True, "needsVector": False},
    "professor_rating": {"needsSQL": False, "needsVector": True},
    "course_reviews": {"needsSQL": False, "needsVector": True},
    "comparison": {"needsSQL": True, "needsVector": True},
    "general_advice": {"needsSQL": False, "needsVector": True},
}

STANDARD_CODE_RE = re.compile(r"\b([A-Z]{3,4})\s?(\d{3})\b")


def extract_course_codes(query: str) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    upper = query.upper()

    def push(dept: str, num: str) -> None:
        code = f"{dept.upper()} {num}"
        if code not in seen:
            seen.add(code)
            ordered.append(code)

    for m in STANDARD_CODE_RE.finditer(upper):
        push(m.group(1), m.group(2))
    return ordered


def extract_professor_name(query: str) -> str | None:
    prof = re.search(
        r"\b(?:[Pp]rof(?:essor)?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b",
        query,
    )
    if prof:
        return prof.group(1).strip()
    titled = re.search(r"\b(?:[Dd]r\.?)\s+([A-Z][a-z]+)\b", query)
    if titled:
        return titled.group(1).strip()
    return None


def classify_intent(normalized_lower: str, course_code_count: int) -> Intent:
    has_vs = bool(re.search(r"\bvs\.?\b|\bversus\b", normalized_lower, re.I))
    has_compare_word = bool(
        re.search(r"\bcompare\b|\bcomparison\b|\bcomparing\b", normalized_lower, re.I)
    )
    or_as_comparison = bool(re.search(r"\bor\b", normalized_lower, re.I)) and course_code_count >= 2

    if has_vs or has_compare_word or or_as_comparison:
        return "comparison"

    if course_code_count == 0 and (
        re.search(r"\belectives?\b", normalized_lower, re.I)
        or re.search(r"\bfirst\s+year\b", normalized_lower, re.I)
        or re.search(r"\bwhat\s+courses\b", normalized_lower, re.I)
    ):
        return "general_advice"

    if re.search(r"\b(average|grade|gpa|mark)\b", normalized_lower) or re.search(
        r"\bfail\s+rate\b", normalized_lower, re.I
    ):
        return "grade_distribution"
    if re.search(r"\b(hard|difficulty|easy|manageable)\b", normalized_lower):
        return "course_difficulty"
    if re.search(r"\b(prof|professor|teaching)\b", normalized_lower):
        return "professor_rating"
    if re.search(r"\b(reviews?|opinions?|think|say)\b", normalized_lower):
        return "course_reviews"

    return "general_advice"


def detect_complexity(trimmed_query: str) -> Complexity:
    words = [w for w in trimmed_query.strip().split() if w]
    if len(words) > 12:
        return "complex"
    if re.search(r"\band\b", trimmed_query, re.I) or re.search(r"\bor\b", trimmed_query, re.I):
        return "complex"
    return "simple"


def _build_entities(trimmed: str, codes: list[str]) -> dict[str, object]:
    entities: dict[str, object] = {}
    prof = extract_professor_name(trimmed)

    if len(codes) == 1:
        entities["course_code"] = codes[0]
    elif len(codes) >= 2:
        entities["course_codes"] = list(codes)

    if prof:
        entities["professor_name"] = prof
    else:
        name_only = re.search(r"\b(?:[Ii]s|[Ww]as)\s+([A-Z][a-z]+)\s+good\b", trimmed)
        if name_only:
            entities["professor_name"] = name_only.group(1)

    return entities


def resolve_intent(query: str) -> dict[str, object]:
    trimmed = query.strip()
    normalized_lower = trimmed.lower()
    codes = extract_course_codes(trimmed)
    intent = classify_intent(normalized_lower, len(codes))
    entities = _build_entities(trimmed, codes)
    flags = INTENT_DATA_MAP[intent]

    return {
        "intent": intent,
        "entities": entities,
        "needsSQL": flags["needsSQL"],
        "needsVector": flags["needsVector"],
        "complexity": detect_complexity(trimmed),
    }
