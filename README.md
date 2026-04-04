# 🤖 Coursify — RAG (Queen's Answers)

## 💡 What is Coursify?

**Coursify** is a course-insights platform for Queen's University students. It features course grade distributions, relevant Reddit and RateMyProfessors comments, and also an AI Chatbot.

**This repository** is the **Queen's Answers** backend: a Flask API with rule-based intent routing, structured data and vector snippets, and **Gemini** for the final answer. The Next.js app lives in **Coursify-WebApp**.

---

## 🔗 Related repositories

| Repository                                                           | Purpose                                                                                 |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [Coursify-WebApp](https://github.com/CoursifyQU/Coursify-WebApp)     | Full stack application                                                                  |
| [Coursify-Scrapers](https://github.com/CoursifyQU/Coursify-Scrapers) | Scheduled data scrapers for the Queen's academic calendar, Reddit, and RateMyProfessors |
| [Coursify-RAG](https://github.com/amaanjaved1/Coursify-RAG)          | Queen's Answers - Our chatbot                                                           |

🌐 [**Live site**](https://www.coursify.ca/)

---

## 🛠️ Tech stack

- **Python 3.11+**
- **Flask** — HTTP API (`app/`, `run.py`, `wsgi.py`)
- **Google Gemini** — answer generation (`GEMINI_API_KEY`)
- **pytest** — unit tests; optional **integration** marks for live Gemini calls

---

## 🚀 Setup & development

**Requirements:** Python 3.11+.

```bash
cd Coursify-RAG
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env    # set GEMINI_API_KEY
python run.py
```

**Endpoints**

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

---

## 🤝 Contributing

Contributions are welcome.

- 🐛 **Issues** — Open an issue for bugs, routing behavior, or Gemini integration questions before large changes.
- 🔀 **Pull requests** — Keep changes focused on the Flask app in `app/`.
- 🔐 **Security** — Do not commit API keys; use `.env.example` as a template only.
