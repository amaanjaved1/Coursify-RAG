from app import create_app
from app.config import get_port

if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=get_port(), debug=False)
