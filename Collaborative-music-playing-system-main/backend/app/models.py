from datetime import datetime
import uuid
from app import db


def gen_uuid():
    return str(uuid.uuid4())


def gen_token():
    return str(uuid.uuid4()).replace('-', '')[:12].upper()


# ── User ─────────────────────────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(64), primary_key=True, default=gen_uuid)
    cognito_sub = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owned_groups = db.relationship('Group', backref='leader', lazy='dynamic',
                                   foreign_keys='Group.leader_id')
    memberships = db.relationship('GroupMember', backref='user', lazy='dynamic',
                                  cascade='all, delete-orphan')
    messages = db.relationship('ChatMessage', backref='user', lazy='dynamic',
                                cascade='all, delete-orphan')
    votes = db.relationship('Vote', backref='user', lazy='dynamic',
                             cascade='all, delete-orphan')
    feedback = db.relationship('Feedback', backref='user', lazy='dynamic',
                                cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ── Group ─────────────────────────────────────────────────────────────────────
class Group(db.Model):
    __tablename__ = 'groups'

    id = db.Column(db.String(64), primary_key=True, default=gen_uuid)
    name = db.Column(db.String(255), nullable=False)
    token = db.Column(db.String(16), unique=True, default=gen_token)
    leader_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False)
    current_track = db.Column(db.JSON)  # {videoId, title, channel, thumbnail}
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    members = db.relationship('GroupMember', backref='group', lazy='dynamic',
                               cascade='all, delete-orphan')
    messages = db.relationship('ChatMessage', backref='group', lazy='dynamic',
                                cascade='all, delete-orphan')
    votes = db.relationship('Vote', backref='group', lazy='dynamic',
                             cascade='all, delete-orphan')

    @property
    def member_count(self):
        return self.members.count() + 1  # +1 for leader

    def to_dict(self, include_members=False):
        d = {
            'id': self.id,
            'name': self.name,
            'token': self.token,
            'leader_id': self.leader_id,
            'leader_name': self.leader.name if self.leader else None,
            'leader_email': self.leader.email if self.leader else None,
            'member_count': self.member_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_members:
            members = [self.leader.to_dict()] if self.leader else []
            members += [m.user.to_dict() for m in self.members.all() if m.user]
            d['members'] = members
        return d


# ── GroupMember ───────────────────────────────────────────────────────────────
class GroupMember(db.Model):
    __tablename__ = 'group_members'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_id = db.Column(db.String(64), db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('group_id', 'user_id'),)


# ── ChatMessage ───────────────────────────────────────────────────────────────
class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_id = db.Column(db.String(64), db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'user_id': self.user_id,
            'username': self.user.name if self.user else 'Unknown',
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ── Vote ──────────────────────────────────────────────────────────────────────
class Vote(db.Model):
    __tablename__ = 'votes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_id = db.Column(db.String(64), db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False)
    vote_type = db.Column(db.String(16), nullable=False)  # skip | like | dislike | replay
    track_id = db.Column(db.String(32))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('group_id', 'user_id', 'track_id'),)


# ── Feedback ──────────────────────────────────────────────────────────────────
class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.name if self.user else 'Unknown',
            'email': self.user.email if self.user else None,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
