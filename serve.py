#!/usr/bin/env python3

import sys
import os

from flask import Flask, send_file, jsonify
import werkzeug
from server.api import api_bp
from server.prefs import prefs_bp
from server.database import db as db
from server.utils import json_response


def create_app(base_dir: str = None):
    """Create and configure the Flask app with SPA support and API routes"""

    if base_dir is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    app = Flask(__name__, static_folder=None)
    app.register_blueprint(api_bp)
    app.register_blueprint(prefs_bp)

    # Cache control headers for development
    @app.after_request
    def add_cache_headers(response):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response


    # SPA fallback: serve index.html for non-API, non-file routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>', methods=['GET'], strict_slashes=False, merge_slashes=True)
    def serve_spa(path):
        """Serve static files with SPA fallback to index.html"""

        # Don't intercept API routes (handled by blueprint)
        if path.startswith('api/'):
            return json_response(404, error='Not Found')

        # Check if file exists
        file_path = os.path.join(base_dir, path)

        if os.path.isfile(file_path):
            return send_file(file_path)

        # SPA fallback: serve index.html
        index_path = os.path.join(base_dir, 'index.html')
        if os.path.isfile(index_path):
            return send_file(index_path)

        return json_response(404, error='Not Found')

    return app


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 1264
    base_dir = os.path.dirname(os.path.abspath(__file__))

    app = create_app(base_dir=base_dir)

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.remove()

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        if isinstance(error, werkzeug.exceptions.HTTPException):
            return json_response(error.code, error=str(error))
        return json_response(500, error=str(error))


    print(f"=> new.reddit.com Server Active")
    print(f"  URL: http://localhost:{port}")
    print(f"  Serving from: {base_dir}")

    try:
        app.run(host="127.0.0.1", port=port, debug=False)
    except KeyboardInterrupt:
        print("\nServer stopped.")
