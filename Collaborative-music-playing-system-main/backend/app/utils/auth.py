import os
import json
import requests
from functools import wraps
from flask import request, jsonify, g
from jose import jwt, JWTError
from app.models import User
from app import db

REGION = os.environ.get('COGNITO_REGION', 'ap-south-1')
POOL_ID = os.environ.get('COGNITO_USER_POOL_ID', 'ap-south-1_3riYJHFmu')
CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID', '1papbh7lig8dd7kka4gk99ngru')

_JWKS = None


def get_jwks():
    global _JWKS
    if _JWKS is None:
        url = f'https://cognito-idp.{REGION}.amazonaws.com/{POOL_ID}/.well-known/jwks.json'
        _JWKS = requests.get(url, timeout=5).json()
    return _JWKS


def verify_token(token):
    """Verify Cognito JWT and return claims dict."""
    try:
        jwks = get_jwks()
        headers = jwt.get_unverified_headers(token)
        kid = headers.get('kid')
        key = next((k for k in jwks['keys'] if k['kid'] == kid), None)
        if not key:
            raise ValueError('Key not found')
        claims = jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience=CLIENT_ID,
            options={'verify_at_hash': False},
        )
        return claims
    except JWTError as e:
        raise ValueError(f'JWT invalid: {e}')


def get_or_create_user(claims):
    """Find or create a User from Cognito claims."""
    sub = claims.get('sub')
    email = claims.get('email', '')
    name = claims.get('name') or claims.get('cognito:username') or email.split('@')[0]

    admin_emails = [e.strip() for e in os.environ.get('ADMIN_EMAILS', '').split(',') if e.strip()]

    user = User.query.filter_by(cognito_sub=sub).first()
    if not user:
        user = User(
            cognito_sub=sub,
            email=email,
            name=name,
            is_admin=email in admin_emails,
        )
        db.session.add(user)
        db.session.commit()
    else:
        # Update name/email if changed
        changed = False
        if user.email != email:
            user.email = email; changed = True
        if user.name != name:
            user.name = name; changed = True
        if email in admin_emails and not user.is_admin:
            user.is_admin = True; changed = True
        if changed:
            db.session.commit()
    return user


def require_auth(f):
    """Decorator: validates Bearer token and sets g.user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'Missing token'}), 401
        token = auth[7:]
        try:
            claims = verify_token(token)
            g.user = get_or_create_user(claims)
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'detail': str(e)}), 401
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    """Decorator: validates admin role."""
    @wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        if not g.user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated
