"""
API routes for the development server
Handles API endpoints and proxying
"""

from server.utils import json_response
from flask import Blueprint
from http.cookiejar import CookieJar
from time import time
from urllib.request import Request

import threading
import urllib

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/anonymous-token', methods=['GET'])
def anonymous_token():
    """Get anonymous access token for Reddit API"""
    try:
        access_token = get_access_token()
        return json_response(200, data=access_token)
    except Exception as e:
        print(f"Error getting access token: {e}")
        return json_response(500, error=str(e))


cached_token = None
_token_lock = threading.Lock()
_token_fetch_in_progress = False
_token_fetch_event = threading.Event()


def get_access_token():
    """
    Fetch or return cached anonymous access token from Reddit.
    Handles token expiration and concurrent requests.
    """
    global cached_token, _token_fetch_in_progress, _token_fetch_event

    while True:
        now_ms = int(time() * 1000)
        with _token_lock:
            # Return cached token if still valid
            if cached_token and cached_token['expiresAt'] > now_ms:
                return cached_token

            # Wait for another thread to fetch the token
            if _token_fetch_in_progress:
                event = _token_fetch_event
            else:
                _token_fetch_in_progress = True
                _token_fetch_event.clear()
                event = None
                break

        if event:
            event.wait()
    
    try:
        # May be blocked in the future
        try:
            print("Fetching embed.reddit.com")
            cookie_jar = CookieJar()
            opener = urllib.request.build_opener(
                urllib.request.HTTPCookieProcessor(cookie_jar)
            )

            request = Request(
                url="https://embed.reddit.com/r/reddit.com/comments/87/abcd",
                method='HEAD',
                headers={
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0"
                }
            )
            opener.open(request)
            print("Fetched embed.reddit.com")
        except urllib.error.HTTPError as e:
            raise Exception(f"Got status code {e.code} when fetching webpage.")
        except Exception as e:
            raise Exception(f"Error fetching webpage: {e}")

        # Extract cookies from the jar
        cookies = {cookie.name: cookie for cookie in cookie_jar}
        token_v2 = cookies.get('token_v2')
        if not token_v2:
            raise Exception("token_v2 cookie not found in response.")

        cached_token = {
            "accessToken": token_v2.value,
            "expiresAt": token_v2.expires * 1000,
            "loid": cookies.get('loid').value if cookies.get('loid') else None,
            "sessionTracker": cookies.get('session_tracker').value if cookies.get('session_tracker') else None,
        }
        print("Got new anonymous access token:", cached_token)
        return cached_token
    finally:
        with _token_lock:
            _token_fetch_in_progress = False
            _token_fetch_event.set()