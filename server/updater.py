import json
import os
import shutil
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from typing import Optional

USER_AGENT = 'Littux-Dustux/new-reddit-com Update Checker (Server)'
headers = {
    "User-Agent": USER_AGENT,
    "Accept": "application/vnd.github.v3+json",
}

def update_from_github_releases(releases_url: str, current_version: str) -> tuple[bool, str]:
    """
    Fetches the latest GitHub release, downloads and extracts 'release.zip' and 'assets.zip'
    """

    try:
        target_dir = Path(__file__).resolve().parent.parent
    except NameError:
        target_dir = Path(sys.argv[0]).resolve().parent.parent
    except Exception as e:
        return False, "Error getting target_dir"

    if target_dir.name not in ("release", "new-reddit-com"):
        return False, "Name of the new reddit directory must be either 'release' or 'new-reddit-com'"

    print(f"Fetching release information from: {releases_url}")
    req = urllib.request.Request(releases_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return False, f"Error connecting to GitHub API: {e}"


    if isinstance(data, list) and len(data) > 0:
        latest_release = data[0]
    elif isinstance(data, dict):
        latest_release = data
    else:
        return False, "Unexpected response structure from GitHub API."

    tag_name = latest_release["tag_name"].strip()
    print(f"Latest release found: {tag_name}")

    if current_version and tag_name and current_version.strip() == tag_name:
        return False, f"Already up to date ({current_version})."


    assets = latest_release.get("assets", [])
    asset_map = {}
    for asset in assets:
        name = asset.get("name", "").strip().lower()
        download_url = asset.get("browser_download_url")
        if name and download_url:
            asset_map[name] = download_url

    release_url = asset_map.get("release.zip")
    assets_url = asset_map.get("assets.zip")

    if not release_url and not assets_url:
        return False, "Neither 'release.zip' nor 'assets.zip' was found in this release."


    if release_url:
        print("Downloading 'release.zip'...")
        tmp_release = download_to_temp_file(release_url)
        try:
            print(f"Extracting 'release.zip' to {target_dir} (excluding 'bundles/')...")
            safe_extract(tmp_release, destination_dir=target_dir, exclude_prefix="bundles")
        finally:
            tmp_release.unlink(missing_ok=True)

    if assets_url:
        print("Downloading 'assets.zip'...")
        tmp_assets = download_to_temp_file(assets_url)
        try:
            cached_dir = target_dir / "bundles" / "cached"
            print(f"Extracting 'assets.zip' to {cached_dir}...")
            safe_extract(tmp_assets, destination_dir=cached_dir)
        finally:
            tmp_assets.unlink(missing_ok=True)


    return True, tag_name



def download_to_temp_file(url: str) -> Path:
    """Stream download directly to disk to prevent high memory usage."""
    dl_req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
    try:
        with urllib.request.urlopen(dl_req) as resp, open(tmp.name, "wb") as out_file:
            shutil.copyfileobj(resp, out_file)
        return Path(tmp.name)
    finally:
        tmp.close()


def safe_extract(zip_path: Path, destination_dir: Path, exclude_prefix: Optional[str] = None):
    destination_dir.mkdir(parents=True, exist_ok=True)
    resolved_dest = destination_dir.resolve()
    if exclude_prefix:
        exclude_prefix = exclude_prefix.strip("/\\").replace("\\", "").lower()

    with zipfile.ZipFile(zip_path) as zf:
        for member in zf.infolist():
            # Strip leading slashes to prevent root escapes
            clean_name = member.filename.lstrip(r"\/")
            norm_name = os.path.normpath(clean_name).replace("\\", "/")

            if norm_name in (".", ""):
                continue

            # Exclude specified prefix (case-insensitive check)
            if exclude_prefix:
                norm_lower = norm_name.lower()
                if norm_lower == exclude_prefix or norm_lower.startswith(exclude_prefix + "/"):
                    continue

            target_path = (resolved_dest / norm_name).resolve()

            # Prevent Zip-Slip directory traversal
            try:
                target_path.relative_to(resolved_dest)
            except ValueError:
                print(f"Skipping potentially malicious path: {member.filename}")
                continue

            # Replace existing files/directories
            if member.is_dir():
                if target_path.is_file():
                    target_path.unlink()
                target_path.mkdir(parents=True, exist_ok=True)
            else:
                if target_path.is_dir():
                    shutil.rmtree(target_path)
                target_path.parent.mkdir(parents=True, exist_ok=True)

                with zf.open(member) as src, open(target_path, "wb") as dst:
                    shutil.copyfileobj(src, dst)