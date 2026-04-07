import os
import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")
migrate = Migrate()


def create_app():
    app = Flask(__name__)

    # ── Config ───────────────────────────────────────────────────────────
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'change-me')

    # ── Extensions ───────────────────────────────────────────────────────
    db.init_app(app)
    socketio.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=['https://music.iamshadow.link'], supports_credentials=True)

    # ── Blueprints ───────────────────────────────────────────────────────
    from app.routes.auth import auth_bp
    from app.routes.music import music_bp
    from app.routes.groups import groups_bp
    from app.routes.chat import chat_bp
    from app.routes.votes import votes_bp
    from app.routes.feedback import feedback_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(music_bp, url_prefix='/api/music')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(votes_bp, url_prefix='/api/votes')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # ── Socket events ────────────────────────────────────────────────────
    from app import sockets  # noqa: F401

    return app
