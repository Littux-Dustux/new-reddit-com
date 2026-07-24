import http.server
import socketserver
import os
from sys import argv

# Get the absolute directory where serve.py actually lives
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class SPAServer(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = super().translate_path(path)
        rel_path = os.path.relpath(path, os.getcwd())
        return os.path.join(BASE_DIR, rel_path)

    def do_GET(self):
        local_path = os.path.join(BASE_DIR, self.path.lstrip('/').split('?')[0])

        if os.path.isfile(local_path):
            return super().do_GET()
        else:
            self.path = '/index.html'
            return super().do_GET()

PORT = int(argv[1]) if len(argv) > 1 else 1264
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), SPAServer) as httpd:
    print(f"New Reddit Revival Server Active")
    print(f"  URL: http://localhost:{PORT}")
    print(f"  Serving from: {BASE_DIR}")
    httpd.serve_forever()
