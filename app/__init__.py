from flask import Flask
from flask_cors import CORS

from app.routes.ask import ask_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(ask_bp)
    return app
