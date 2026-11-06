import http.server
import json
import socketserver
import os
import sys
from server.api_index import json_response, process_api
from urllib.parse import parse_qsl

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

    def send_json(self, status_code: int, data: str):
        """Helper method to send JSON responses."""
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(data.encode('utf-8'))


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

    def do_POST(self):
        return self.handle_api()
    def do_PUT(self):
        return self.handle_api()
    def do_DELETE(self):
        return self.handle_api()
    def do_PATCH(self):
        return self.handle_api()
    def do_OPTIONS(self):
        return self.handle_api()

    def handle_api(self):
        origin = self.headers.get('origin')
        if origin is not None and origin != f"http://localhost:{PORT}":
            return self.send_json(*json_response(403, error="Forbidden: Only accessible from localhost"))

        payload: dict = None
        if self.command in ("POST", "PUT", "DELETE", "PATCH"):
            if self.headers.get('content-type') != 'application/json':
                return self.send_json(*json_response(400, error="Invalid Content-Type. Expected application/json."))
            if self.headers.get('content-length') is None:
                return self.send_json(*json_response(411, error="Content-Length header is required."))
            try:
                payload = json.loads(self.rfile.read(int(self.headers.get('content-length'))).decode('utf-8'))
            except Exception as e:
                return self.send_json(*json_response(400, error=f"Invalid JSON payload: {e}"))
            if not isinstance(payload, dict):
                return self.send_json(*json_response(400, error="Invalid JSON payload. Expected a JSON object."))

        try:
            split = self.path.split('?')
            qs = ""
            if len(split) == 2:
                clean_path, qs = split
            else:
                clean_path, = split
            search_params = dict(parse_qsl(qs))

            status, data = process_api(self.command, clean_path, payload, search_params)
            self.send_json(status, data)
        except Exception as e:
            self.send_json(*json_response(500, error=f"Internal Server Error: {e}"))



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
