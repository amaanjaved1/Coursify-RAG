# Coursify-RAG

Course insights API: rule-based intent routing, mock structured data and vector snippets, and Gemini for the final answer.

## Python (Flask) — maintained server

Requirements: Python 3.11+.

```bash
cd Coursify-RAG
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env    # set GEMINI_API_KEY
python run.py
```

- Health: `GET http://localhost:3000/health`
- Ask: `POST http://localhost:3000/ask` with JSON `{"query":"Is CISC 121 hard?"}`  
  Optional: `?debug=1` adds `intent`, `sqlSnippet`, and `vectorPreview` to the response.

Alternatively: `flask --app wsgi run --port 3000`

### Tests

```bash
python -m pytest -q
```

Integration tests (live Gemini; requires `GEMINI_API_KEY`):

```bash
python -m pytest -m integration -q
```

## Legacy TypeScript

The previous Express implementation remains under `src/` for reference. New work should target the Flask app in `app/`.
