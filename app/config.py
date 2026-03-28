import os

from dotenv import load_dotenv

load_dotenv()


def get_port() -> int:
    return int(os.environ.get("PORT", "3000"))


def get_gemini_api_key() -> str:
    return os.environ.get("GEMINI_API_KEY", "")
