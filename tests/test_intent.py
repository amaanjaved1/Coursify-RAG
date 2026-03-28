"""Parity checks against TypeScript resolveIntent (testIntent.ts)."""

import pytest

from app.services.intent import resolve_intent

TEST_CASES: list[tuple[str, dict]] = [
    (
        "Is CISC 121 hard?",
        {
            "intent": "course_difficulty",
            "entities": {"course_code": "CISC 121"},
            "needsSQL": True,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "Average grade for CISC 121",
        {
            "intent": "grade_distribution",
            "entities": {"course_code": "CISC 121"},
            "needsSQL": True,
            "needsVector": False,
            "complexity": "simple",
        },
    ),
    (
        "What do people think about CISC 121?",
        {
            "intent": "course_reviews",
            "entities": {"course_code": "CISC 121"},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "Is Prof Smith good?",
        {
            "intent": "professor_rating",
            "entities": {"professor_name": "Smith"},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "CISC 121 vs CISC 124",
        {
            "intent": "comparison",
            "entities": {"course_codes": ["CISC 121", "CISC 124"]},
            "needsSQL": True,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "Easy electives at Queen's?",
        {
            "intent": "general_advice",
            "entities": {},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "Fail rate for CHEM 112?",
        {
            "intent": "grade_distribution",
            "entities": {"course_code": "CHEM 112"},
            "needsSQL": True,
            "needsVector": False,
            "complexity": "simple",
        },
    ),
    (
        "What is the GPA breakdown in PHYS 104?",
        {
            "intent": "grade_distribution",
            "entities": {"course_code": "PHYS 104"},
            "needsSQL": True,
            "needsVector": False,
            "complexity": "simple",
        },
    ),
    (
        "Is this course manageable if I work part time?",
        {
            "intent": "course_difficulty",
            "entities": {},
            "needsSQL": True,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "Professor Lee teaching quality for MATH 110",
        {
            "intent": "professor_rating",
            "entities": {"course_code": "MATH 110", "professor_name": "Lee"},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "Student reviews and opinions on cisc121",
        {
            "intent": "course_reviews",
            "entities": {"course_code": "CISC 121"},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "complex",
        },
    ),
    (
        "Which is easier, CHEM 112 or PHYS 104?",
        {
            "intent": "comparison",
            "entities": {"course_codes": ["CHEM 112", "PHYS 104"]},
            "needsSQL": True,
            "needsVector": True,
            "complexity": "complex",
        },
    ),
    (
        "Compare CISC121 and CISC 124 workload",
        {
            "intent": "comparison",
            "entities": {"course_codes": ["CISC 121", "CISC 124"]},
            "needsSQL": True,
            "needsVector": True,
            "complexity": "complex",
        },
    ),
    (
        "What courses should I take first year?",
        {
            "intent": "general_advice",
            "entities": {},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "Is the teaching style harsh in this department?",
        {
            "intent": "professor_rating",
            "entities": {},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "What do students say about the midterm?",
        {
            "intent": "course_reviews",
            "entities": {},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "I need general advice picking electives",
        {
            "intent": "general_advice",
            "entities": {},
            "needsSQL": False,
            "needsVector": True,
            "complexity": "simple",
        },
    ),
    (
        "MARK distribution for ECON 110 last year",
        {
            "intent": "grade_distribution",
            "entities": {"course_code": "ECON 110"},
            "needsSQL": True,
            "needsVector": False,
            "complexity": "simple",
        },
    ),
]


@pytest.mark.parametrize("query,expected", TEST_CASES)
def test_resolve_intent_parity(query: str, expected: dict) -> None:
    assert resolve_intent(query) == expected
