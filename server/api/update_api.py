import os
import sys
from pathlib import Path
from server.utils import json_response
from server.updater import update_from_github_releases


def update_api(payload, query):
	releases_url = payload.get("releasesUrl")
	current_version = payload.get("currentVersion")
	if not releases_url or not current_version:
		return json_response(400, error="Missing required parameters: releasesUrl and currentVersion are required.")

	success, err_or_ver = update_from_github_releases(releases_url, current_version)
	if not success:
		return json_response(500, error=err_or_ver)

	return json_response(200, data={"newVersion": err_or_ver})


def restart_script(payload, query):
	print("Restarting script...")
	sys.stdout.flush()
	sys.stderr.flush()

	script_path = str(Path(sys.argv[0]).resolve())
	restart_args = [sys.executable, script_path] + sys.argv[1:]

	try:
		os.execv(sys.executable, restart_args)
	except Exception:
		# Fallback for environments where execv is unsupported
		import subprocess
		subprocess.Popen(restart_args)
		sys.exit(0)

	return None