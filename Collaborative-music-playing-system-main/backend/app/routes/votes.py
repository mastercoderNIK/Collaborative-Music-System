from flask import Blueprint, request, jsonify, g
from app import db
from app.models import Vote, Group, GroupMember
from app.utils.auth import require_auth

votes_bp = Blueprint('votes', __name__)
VALID_VOTES = {'skip', 'like', 'dislike', 'replay'}


@votes_bp.route('/cast', methods=['POST'])
@require_auth
def cast():
    if g.user.is_admin:
        return jsonify({'error': 'Admins cannot vote'}), 403
    data = request.json or {}
    group_id = data.get('group_id')
    vote_type = data.get('vote_type')
    track_id = data.get('track_id', 'current')
    if not group_id or vote_type not in VALID_VOTES:
        return jsonify({'error': 'Invalid request'}), 400
    group = Group.query.get_or_404(group_id)
    is_leader = group.leader_id == g.user.id
    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=g.user.id).first()
    if not is_leader and not is_member:
        return jsonify({'error': 'Forbidden'}), 403
    existing = Vote.query.filter_by(group_id=group_id, user_id=g.user.id, track_id=track_id).first()
    if existing:
        existing.vote_type = vote_type
    else:
        db.session.add(Vote(group_id=group_id, user_id=g.user.id, vote_type=vote_type, track_id=track_id))
    db.session.commit()
    return jsonify({'message': 'Vote cast'})


@votes_bp.route('/tally', methods=['GET'])
@require_auth
def tally():
    group_id = request.args.get('group_id')
    track_id = request.args.get('track_id', 'current')
    if not group_id:
        return jsonify({'error': 'group_id required'}), 400
    group = Group.query.get_or_404(group_id)
    total_members = group.member_count
    votes = Vote.query.filter_by(group_id=group_id, track_id=track_id).all()
    counts = {'skip': 0, 'like': 0, 'dislike': 0, 'replay': 0, 'total': total_members}
    for v in votes:
        if v.vote_type in counts:
            counts[v.vote_type] += 1
    return jsonify(counts)
