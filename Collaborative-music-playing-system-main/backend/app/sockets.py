from app import socketio, db
from app.models import ChatMessage, Group, GroupMember, Vote
from app.utils.auth import verify_token, get_or_create_user
from flask_socketio import emit, join_room, leave_room
from flask import request


def _get_user():
    token = request.args.get('token', '')
    if not token:
        return None
    try:
        claims = verify_token(token)
        return get_or_create_user(claims)
    except Exception:
        return None


@socketio.on('connect')
def on_connect(auth):
    token = (auth or {}).get('token', '')
    if not token:
        return False
    try:
        claims = verify_token(token)
        user = get_or_create_user(claims)
        owned = Group.query.filter_by(leader_id=user.id).all()
        memberships = GroupMember.query.filter_by(user_id=user.id).all()
        for group in owned:
            join_room(f'group_{group.id}')
        for m in memberships:
            join_room(f'group_{m.group_id}')
    except Exception:
        return False


@socketio.on('disconnect')
def on_disconnect():
    pass


@socketio.on('chat_message')
def on_chat(data):
    user = _get_user()
    if not user:
        return
    group_id = data.get('group_id')
    message = data.get('message', '').strip()
    if not group_id or not message:
        return
    group = Group.query.get(group_id)
    if not group:
        return
    is_leader = group.leader_id == user.id
    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=user.id).first()
    if not is_leader and not is_member:
        return
    msg = ChatMessage(group_id=group_id, user_id=user.id, message=message)
    db.session.add(msg)
    db.session.commit()
    emit('chat_message', msg.to_dict(), to=f'group_{group_id}')


@socketio.on('track_change')
def on_track_change(data):
    user = _get_user()
    if not user:
        return
    group_id = data.get('group_id')
    track = data.get('track')
    position = data.get('position', 0)
    if not group_id or not track:
        return
    group = Group.query.get(group_id)
    if not group or group.leader_id != user.id:
        return
    group.current_track = {**(track or {}), 'position': position}
    db.session.commit()
    # Broadcast track + position to all members
    emit('track_change', {'track': track, 'position': position},
         to=f'group_{group_id}', include_self=False)


@socketio.on('position_sync')
def on_position_sync(data):
    """Leader periodically broadcasts current playback position."""
    user = _get_user()
    if not user:
        return
    group_id = data.get('group_id')
    position = data.get('position', 0)
    if not group_id:
        return
    group = Group.query.get(group_id)
    if not group or group.leader_id != user.id:
        return
    # Broadcast to members only (not back to leader)
    emit('position_sync', {'position': position},
         to=f'group_{group_id}', include_self=False)


@socketio.on('vote_cast')
def on_vote(data):
    user = _get_user()
    if not user:
        return
    group_id = data.get('group_id')
    if not group_id:
        return
    group = Group.query.get(group_id)
    if not group:
        return
    total = group.member_count
    votes = Vote.query.filter_by(group_id=group_id, track_id='current').all()
    counts = {'skip': 0, 'like': 0, 'dislike': 0, 'replay': 0, 'total': total}
    for v in votes:
        if v.vote_type in counts:
            counts[v.vote_type] += 1
    emit('vote_update', counts, to=f'group_{group_id}')


@socketio.on('join_group')
def on_join_group(data):
    group_id = data.get('group_id')
    if group_id:
        join_room(f'group_{group_id}')


@socketio.on('leave_group')
def on_leave_group(data):
    group_id = data.get('group_id')
    if group_id:
        leave_room(f'group_{group_id}')