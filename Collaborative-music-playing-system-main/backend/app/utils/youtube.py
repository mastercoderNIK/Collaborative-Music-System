import os
import requests

YT_API_KEY = os.environ.get('YOUTUBE_API_KEY', '')
YT_BASE = 'https://www.googleapis.com/youtube/v3'


def _get(endpoint, params):
    params['key'] = YT_API_KEY
    resp = requests.get(f'{YT_BASE}/{endpoint}', params=params, timeout=8)
    resp.raise_for_status()
    return resp.json()


def _format_item(item):
    snippet = item.get('snippet', {})
    vid_id = item.get('id', {})
    if isinstance(vid_id, dict):
        vid_id = vid_id.get('videoId', '')
    thumbnails = snippet.get('thumbnails', {})
    thumb = thumbnails.get('medium', thumbnails.get('default', {})).get('url', '')
    return {
        'videoId': vid_id,
        'title': snippet.get('title', ''),
        'channel': snippet.get('channelTitle', ''),
        'thumbnail': thumb,
        'publishedAt': snippet.get('publishedAt', ''),
    }


def search_videos(query, max_results=10):
    data = _get('search', {
        'part': 'snippet',
        'q': query,
        'type': 'video',
        'maxResults': max_results,
        'videoCategoryId': '10',
        'safeSearch': 'none',
    })
    return [_format_item(item) for item in data.get('items', [])]


def get_video_title(video_id):
    """Fetch the title of a video by its ID."""
    data = _get('videos', {
        'part': 'snippet',
        'id': video_id,
    })
    items = data.get('items', [])
    if not items:
        return None
    snippet = items[0].get('snippet', {})
    return snippet.get('title', ''), snippet.get('channelTitle', '')


def get_recommendations(video_id, max_results=5):
    """
    Get recommendations by fetching the current video's title/artist
    and searching for similar content — works around YouTube's
    deprecated relatedToVideoId parameter.
    """
    try:
        result = get_video_title(video_id)
        if not result:
            return []
        title, channel = result

        # Extract a clean search query from the title
        # Remove common suffixes like "(Official Video)", "| Lyrics", etc.
        import re
        clean = re.sub(r'\(.*?\)|\[.*?\]|\|.*$', '', title).strip()

        # Use artist name + cleaned title for better recommendations
        query = f"{channel} {clean}".strip() if channel else clean

        data = _get('search', {
            'part': 'snippet',
            'q': query,
            'type': 'video',
            'maxResults': max_results + 2,  # fetch extra to filter out the current video
            'videoCategoryId': '10',
        })

        results = []
        for item in data.get('items', []):
            formatted = _format_item(item)
            # Skip the current video itself
            if formatted['videoId'] and formatted['videoId'] != video_id:
                results.append(formatted)
            if len(results) >= max_results:
                break

        return results

    except Exception as e:
        print(f"Recommendations error: {e}")
        return []


def get_trending(max_results=10):
    data = _get('videos', {
        'part': 'snippet',
        'chart': 'mostPopular',
        'videoCategoryId': '10',
        'regionCode': 'IN',
        'maxResults': max_results,
    })
    items = []
    for item in data.get('items', []):
        snippet = item.get('snippet', {})
        thumbnails = snippet.get('thumbnails', {})
        thumb = thumbnails.get('medium', thumbnails.get('default', {})).get('url', '')
        items.append({
            'videoId': item.get('id', ''),
            'title': snippet.get('title', ''),
            'channel': snippet.get('channelTitle', ''),
            'thumbnail': thumb,
            'publishedAt': snippet.get('publishedAt', ''),
        })
    return items