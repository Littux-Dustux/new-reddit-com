from .utils import json_response
from .api.anonymous_token import token_response
from .api.update_api import update_api, restart_script


def process_api(method: str, path: str, payload: dict | None, search_params: dict | None = None):
	if method in endpoints and path in endpoints[method]:
		return endpoints[method][path](payload, search_params)
	else:
		return json_response(404, error=f"API endpoint {method} {path} not found.")


endpoints = {
	"GET": {
		"/api/anonymous-token": token_response
	},
	"POST": {
		"/api/update": update_api,
		"/api/restart": restart_script
	}
}