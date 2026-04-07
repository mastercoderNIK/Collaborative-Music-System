from flask import Blueprint, request, jsonify
from app.utils.auth import require_auth
from app.utils.youtube import search_videos, get_recommendations, get_trending

music_bp = Blueprint('music', __name__)


@music_bp.route('/search', methods=['GET'])
@require_auth
def search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'error': 'Query required'}), 400
    try:
        results = search_videos(q, max_results=10)
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@music_bp.route('/recommendations', methods=['GET'])
@require_auth
def recommendations():
    video_id = request.args.get('video_id', '').strip()
    if not video_id:
        return jsonify({'error': 'video_id required'}), 400
    try:
        recs = get_recommendations(video_id, max_results=5)
        return jsonify({'recommendations': recs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@music_bp.route('/trending', methods=['GET'])
@require_auth
def trending():
    try:
        results = get_trending(max_results=10)
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
