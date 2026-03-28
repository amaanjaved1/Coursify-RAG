from unittest.mock import patch

import pytest

from app import create_app


@pytest.fixture()
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_health(client) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.get_json() == {"status": "ok"}


def test_ask_missing_body(client) -> None:
    r = client.post("/ask", json=None)
    assert r.status_code == 400
    assert "error" in r.get_json()


def test_ask_invalid_query(client) -> None:
    r = client.post("/ask", json={})
    assert r.status_code == 400
    body = r.get_json()
    assert "error" in body
    assert "Missing" in body["error"] or "Invalid" in body["error"]


@patch("app.routes.ask.generate_answer", return_value="stubbed answer")
def test_ask_success(mock_gen, client) -> None:
    r = client.post("/ask", json={"query": "Is CISC 121 hard?"})
    assert r.status_code == 200
    data = r.get_json()
    assert data == {"answer": "stubbed answer"}
    mock_gen.assert_called_once()


@patch("app.routes.ask.generate_answer", return_value="ok")
def test_ask_debug_includes_intent(mock_gen, client) -> None:
    r = client.post("/ask?debug=1", json={"query": "Is CISC 121 hard?"})
    assert r.status_code == 200
    data = r.get_json()
    assert data["answer"] == "ok"
    assert "debug" in data
    dbg = data["debug"]
    assert dbg["intent"]["intent"] == "course_difficulty"
    assert "vectorPreview" in dbg
    assert isinstance(dbg["vectorPreview"], list)
    mock_gen.assert_called_once()


def test_ask_missing_gemini_key(client, monkeypatch) -> None:
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    r = client.post("/ask", json={"query": "Is CISC 121 hard?"})
    assert r.status_code == 500
    assert "GEMINI_API_KEY" in r.get_json()["error"]


@patch("app.routes.ask.generate_answer", return_value="x")
def test_grade_distribution_skips_vector(mock_gen, client) -> None:
    r = client.post("/ask?debug=1", json={"query": "Average grade for CISC 121"})
    assert r.status_code == 200
    dbg = r.get_json()["debug"]
    assert dbg["intent"]["needsVector"] is False
    assert dbg["vectorPreview"] == []
    mock_gen.assert_called_once()
