from flask import Blueprint, request, jsonify, g
from app import db
from app.models import User, Group, GroupMember, Feedback
from app.utils.auth import require_admin

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/users', methods=['GET'])
@require_admin
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]})


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.is_admin:
        return jsonify({'error': 'Cannot delete admin'}), 403
    # Remove from groups as member
    GroupMember.query.filter_by(user_id=user_id).delete()
    # Groups they lead — transfer or delete
    led = Group.query.filter_by(leader_id=user_id).all()
    for group in led:
        # Promote first member or delete group
        first_member = GroupMember.query.filter_by(group_id=group.id).first()
        if first_member:
            group.leader_id = first_member.user_id
            db.session.delete(first_member)
        else:
            db.session.delete(group)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User removed'})


@admin_bp.route('/groups', methods=['GET'])
@require_admin
def list_groups():
    groups = Group.query.order_by(Group.created_at.desc()).all()
    return jsonify({'groups': [g.to_dict() for g in groups]})


@admin_bp.route('/groups/<group_id>', methods=['DELETE'])
@require_admin
def delete_group(group_id):
    group = Group.query.get_or_404(group_id)
    db.session.delete(group)
    db.session.commit()
    return jsonify({'message': 'Group dissolved'})


@admin_bp.route('/feedback', methods=['GET'])
@require_admin
def list_feedback():
    items = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify({'feedback': [f.to_dict() for f in items]})
