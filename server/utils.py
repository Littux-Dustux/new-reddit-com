from flask import jsonify
from typing import Any, TypedDict

class ErrorDetails(TypedDict):
	message: str
	code: str | None
	field: str | None


def json_response(status: int, data: Any = None, error: str | ErrorDetails | list[ErrorDetails] | None = None):
	data = {
		"ok": error is None,
		"status": status,
		"data": data,
	}

	if type(error) == str:
		data["errors"] = [{
			"message": error
		}]
	elif type(error) == dict:
		data["errors"] = [error]
	elif type(error) == list:
		data["errors"] = error

	return jsonify(data), status