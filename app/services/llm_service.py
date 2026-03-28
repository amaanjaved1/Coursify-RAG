import warnings

with warnings.catch_warnings():
    warnings.simplefilter("ignore", category=FutureWarning)
    import google.generativeai as genai

from app.config import get_gemini_api_key

SYSTEM_PROMPT = (
    "You are a helpful academic assistant. Use provided data. Do not hallucinate."
)

MODEL_NAME = "gemini-1.5-flash"


def generate_answer(prompt: str) -> str:
    key = get_gemini_api_key()
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    genai.configure(api_key=key)
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=SYSTEM_PROMPT,
    )
    result = model.generate_content(prompt)
    text = result.text or ""
    return text.strip()
