from flask import Blueprint, request, jsonify, g
from app import db
from app.models import Group, GroupMember, User
from app.utils.auth import require_auth

groups_bp = Blueprint('groups', __name__)


@groups_bp.route('/create', methods=['POST'])
@require_auth
def create():
    if g.user.is_admin:
        return jsonify({'error': 'Admins cannot create groups'}), 403
    name = request.json.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Name required'}), 400
    group = Group(name=name, leader_id=g.user.id)
    db.session.add(group)
    db.session.commit()
    return jsonify({'group': group.to_dict()}), 201


@groups_bp.route('/join', methods=['POST'])
@require_auth
def join():
    if g.user.is_admin:
        return jsonify({'error': 'Admins cannot join groups'}), 403
    token = request.json.get('token', '').strip().upper()
    if not token:
        return jsonify({'error': 'Token required'}), 400
    group = Group.query.filter_by(token=token).first()
    if not group:
        return jsonify({'error': 'Invalid token'}), 404
    if group.leader_id == g.user.id:
        return jsonify({'error': 'You are the leader of this group'}), 400
    existing = GroupMember.query.filter_by(group_id=group.id, user_id=g.user.id).first()
    if not existing:
        db.session.add(GroupMember(group_id=group.id, user_id=g.user.id))
        db.session.commit()
    return jsonify({'group': group.to_dict()}), 200


@groups_bp.route('/mine', methods=['GET'])
@require_auth
def mine():
    owned = Group.query.filter_by(leader_id=g.user.id).all()
    memberships = GroupMember.query.filter_by(user_id=g.user.id).all()
    joined = [Group.query.get(m.group_id) for m in memberships]
    joined = [gp for gp in joined if gp]
    all_groups = {gp.id: gp for gp in owned + joined}
    return jsonify({'groups': [gp.to_dict() for gp in all_groups.values()]})


@groups_bp.route('/<group_id>/leave', methods=['POST'])
@require_auth
def leave(group_id):
    group = Group.query.get_or_404(group_id)
    if group.leader_id == g.user.id:
        return jsonify({'error': 'Leader cannot leave — delete the group instead'}), 400
    member = GroupMember.query.filter_by(group_id=group_id, user_id=g.user.id).first()
    if member:
        db.session.delete(member)
        db.session.commit()
    return jsonify({'message': 'Left group'})


@groups_bp.route('/<group_id>/members', methods=['GET'])
@require_auth
def members(group_id):
    group = Group.query.get_or_404(group_id)
    is_leader = group.leader_id == g.user.id
    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=g.user.id).first()
    if not is_leader and not is_member:
        return jsonify({'error': 'Forbidden'}), 403
    return jsonify({'members': group.to_dict(include_members=True)['members']})


@groups_bp.route('/<group_id>/sync', methods=['POST'])
@require_auth
def sync(group_id):
    """Leader syncs the current track + playback position."""
    group = Group.query.get_or_404(group_id)
    if group.leader_id != g.user.id:
        return jsonify({'error': 'Only leader can sync track'}), 403
    track = request.json.get('track')
    position = request.json.get('position', 0)
    # Store track with current position so late-joining members can catch up
    group.current_track = {**(track or {}), 'position': position}
    db.session.commit()
    return jsonify({'message': 'Synced'})


@groups_bp.route('/<group_id>/current', methods=['GET'])
@require_auth
def current(group_id):
    """Members call this on joining to get the current track + position."""
    group = Group.query.get_or_404(group_id)
    is_leader = group.leader_id == g.user.id
    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=g.user.id).first()
    if not is_leader and not is_member:
        return jsonify({'error': 'Forbidden'}), 403
    return jsonify({
        'track': group.current_track,
        'is_leader': is_leader,
    })

@groups_bp.route('/<group_id>', methods=['DELETE'])
@require_auth
def delete(group_id):
    """Only the leader can delete the group."""
    group = Group.query.get_or_404(group_id)
    if group.leader_id != g.user.id:
        return jsonify({'error': 'Only the leader can delete this group'}), 403
    # Remove all members first, then the group
    GroupMember.query.filter_by(group_id=group_id).delete()
    db.session.delete(group)
    db.session.commit()
    return jsonify({'message': 'Group deleted'})