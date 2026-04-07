from flask import Blueprint, request, jsonify, g
from app import db
from app.models import Feedback
from app.utils.auth import require_auth

feedback_bp = Blueprint('feedback', __name__)


@feedback_bp.route('/submit', methods=['POST'])
@require_auth
def submit():
    message = (request.json or {}).get('message', '').strip()
    if not message:
        return jsonify({'error': 'Message required'}), 400
    fb = Feedback(user_id=g.user.id, message=message)
    db.session.add(fb)
    db.session.commit()
    return jsonify({'message': 'Feedback submitted', 'id': fb.id}), 201
