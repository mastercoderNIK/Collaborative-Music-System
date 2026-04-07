import os
import requests
from flask import Blueprint, request, jsonify
from app.utils.auth import get_or_create_user, verify_token

auth_bp = Blueprint('auth', __name__)

COGNITO_DOMAIN = os.environ.get('COGNITO_DOMAIN', '')
CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID', '')
REDIRECT_URI = os.environ.get('COGNITO_REDIRECT_URI', 'https://music.iamshadow.link')


@auth_bp.route('/callback', methods=['POST'])
def callback():
    code = request.json.get('code')
    if not code:
        return jsonify({'error': 'Missing code'}), 400

    token_url = f'{COGNITO_DOMAIN}/oauth2/token'
    resp = requests.post(token_url, data={
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'code': code,
        'redirect_uri': REDIRECT_URI,
    }, headers={'Content-Type': 'application/x-www-form-urlencoded'}, timeout=10)

    if not resp.ok:
        return jsonify({'error': 'Token exchange failed', 'detail': resp.text}), 400

    tokens = resp.json()
    id_token = tokens.get('id_token')

    if not id_token:
        return jsonify({'error': 'No id_token received'}), 400

    try:
        claims = verify_token(id_token)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    user = get_or_create_user(claims)

    # Return id_token as the bearer token — it has aud=CLIENT_ID so backend can verify it
    return jsonify({
        'access_token': id_token,
        'user': user.to_dict(),
    })


@auth_bp.route('/me', methods=['GET'])
def me():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        claims = verify_token(auth[7:])
        user = get_or_create_user(claims)
        return jsonify({'user': user.to_dict()})
    except Exception as e:
        return jsonify({'error': str(e)}), 401