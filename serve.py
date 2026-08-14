import http.server
import json
import socketserver
import os
import sys
import threading
from time import time
from typing import Any
import urllib.request
import urllib.error
from http.cookiejar import CookieJar
from urllib.request import Request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class SPAServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Enforce BASE_DIR as the root directory for serving files
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Disable browser caching
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_json(self, status_code: int, data: Any):
        """Helper method to send JSON responses."""
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))


    def do_GET(self):
        # Extract path without query parameters (e.g., /dist/main.js?v=1 -> /dist/main.js)
        clean_path = self.path.split('?')[0]

        if clean_path.startswith('/api/'):
            self.handle_api()
            return

        # Check if requested file exists inside BASE_DIR
        # lstrip('/') prevents os.path.join from treating it as an absolute path
        local_file_path = os.path.join(BASE_DIR, clean_path.lstrip('/'))

        if os.path.isfile(local_file_path):
            # Serves requested file (works for /dist/*, /main.js, favicon.ico, etc.)
            super().do_GET()
        else:
            # SPA Fallback: Serve index.html for non-file/SPA routes
            self.path = '/index.html'
            super().do_GET()

    def handle_api(self):
        """Your single hosted API logic."""
        clean_path = self.path.split('?')[0]

        if clean_path == '/api/anonymous-token':
            try:
                access_token = get_access_token()
                self.send_json(200, {
                    "error": None,
                    "data": access_token
                })
            except Exception as e:
                print("Error getting access token:", e)
                self.send_json(500, {
                    "error": str(e),
                    "data": None
                })
        else:
            self.send_json(404, {
                "error": "Not Found",
                "data": None
            })

cached_token = None
_token_lock = threading.Lock()
_token_fetch_in_progress = False
_token_fetch_event = threading.Event()

def get_access_token():
    global cached_token, _token_fetch_in_progress, _token_fetch_event

    while True:
        now_ms = int(time() * 1000)
        with _token_lock:
            if cached_token and cached_token['expiresAt'] > now_ms:
                return cached_token

            if _token_fetch_in_progress:
                event = _token_fetch_event
            else:
                _token_fetch_in_progress = True
                _token_fetch_event.clear()
                event = None
                break

        event.wait()
        continue

    try:
        # May be blocked in the future
        try:
            print("Fetching embed.reddit.com")
            cookie_jar = CookieJar()
            opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

            request = Request(
                url="https://embed.reddit.com/r/reddit.com/comments/87/abcd",
                method='HEAD',
                headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0"}
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


# Allow address reuse so restart doesn't get "Address already in use" errors
socketserver.TCPServer.allow_reuse_address = True
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 1264

with socketserver.TCPServer(("", PORT), SPAServer) as httpd:
    print(f"=> new.reddit.com Server Active")
    print(f"  URL: http://localhost:{PORT}")
    print(f"  Serving from: {BASE_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
