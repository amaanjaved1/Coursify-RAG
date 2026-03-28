import os

import pytest

from app import create_app
from app.services.llm_service import generate_answer


pytestmark = pytest.mark.integration


@pytest.fixture()
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_gemini_key_present() -> None:
    if not os.environ.get("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY not set")


def test_generate_answer_live() -> None:
    if not os.environ.get("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY not set")
    out = generate_answer("Reply with exactly: OK")
    assert isinstance(out, str)
    assert len(out) > 0


def test_ask_end_to_end_live(client) -> None:
    if not os.environ.get("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY not set")
    r = client.post("/ask", json={"query": "Is CISC 121 hard?"})
    assert r.status_code == 200
    data = r.get_json()
    assert "answer" in data
    assert len(data["answer"]) > 0
