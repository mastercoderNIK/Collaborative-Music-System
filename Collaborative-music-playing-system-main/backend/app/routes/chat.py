from flask import Blueprint, request, jsonify, g
from app import db
from app.models import ChatMessage, Group, GroupMember
from app.utils.auth import require_auth

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/<group_id>', methods=['GET'])
@require_auth
def history(group_id):
    group = Group.query.get_or_404(group_id)
    is_leader = group.leader_id == g.user.id
    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=g.user.id).first()
    if not is_leader and not is_member:
        return jsonify({'error': 'Forbidden'}), 403
    msgs = (ChatMessage.query
            .filter_by(group_id=group_id)
            .order_by(ChatMessage.created_at)
            .limit(100).all())
    return jsonify({'messages': [m.to_dict() for m in msgs]})


@chat_bp.route('/<group_id>', methods=['POST'])
@require_auth
def send_message(group_id):
    """REST fallback for when socket is unavailable."""
    group = Group.query.get_or_404(group_id)
    is_leader = group.leader_id == g.user.id
    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=g.user.id).first()
    if not is_leader and not is_member:
        return jsonify({'error': 'Forbidden'}), 403
    message = (request.json or {}).get('message', '').strip()
    if not message:
        return jsonify({'error': 'Message required'}), 400
    msg = ChatMessage(group_id=group_id, user_id=g.user.id, message=message)
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': msg.to_dict()}), 201