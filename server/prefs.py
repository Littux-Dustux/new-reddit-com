from flask import Blueprint, render_template, request
from .utils import ErrorDetails, json_response
from .database import db
from sqlalchemy import select
from .models import Subreddit, SubredditPref

prefs_bp = Blueprint('prefs', __name__, url_prefix='/api/prefs')

def pref_to_dict(pref: SubredditPref, sr: Subreddit = None) -> dict:
    return {
        "id": pref.id,
        "userId": pref.user_id,
        "subreddit": {
            "id": sr.id,
            "name": sr.name,
            "icon": sr.icon
        },
        "prefs": {
            k: v.value if hasattr(v, 'value') else v
            for k, v in {
                "sort": pref.sort,
                "layout": pref.layout,
                "styles_enabled": pref.styles_enabled
            }.items() if v is not None
        }
    }


@prefs_bp.route('/subreddit', methods=['GET'], strict_slashes=False)
def get_user_all_prefs():
    """Retrieve all subreddit preferences for the current user (JSON or HTML UI)."""
    user_id = request.cookies.get('user_id', 0, type=int)

    sel = (
        select(SubredditPref, Subreddit)
        .join(Subreddit, SubredditPref.sr_id == Subreddit.id)
        .where(SubredditPref.user_id == user_id)
    )
    prefs_raw = db.execute(sel).all()
    prefs_data = [pref_to_dict(p, s) for p, s in prefs_raw]

    # Content Negotiation: Check if browser/client requests HTML
    accept_header = request.headers.get('Accept', '')
    if 'text/html' in accept_header:
        return render_template(
            'subreddit_prefs.html', 
            prefs=prefs_data, 
            user_id=user_id
        )

    return json_response(200, data=prefs_data)

@prefs_bp.route('/subreddit_v2', methods=['GET'], strict_slashes=False)
def get_user_all_prefs2():
    """Retrieve all subreddit preferences for a specific user or serve configuration UI."""
    user_id = request.cookies.get('user_id', 0, type=int)

    sel = (
        select(SubredditPref, Subreddit)
        .join(Subreddit, SubredditPref.sr_id == Subreddit.id)
        .where(SubredditPref.user_id == user_id)
    )
    prefs = db.execute(sel).all()
    prefs_data = [pref_to_dict(p, s) for p, s in prefs]

    # Content Negotiation: Render HTML UI if requested by browser
    if request.accept_mimetypes.accept_html:
        return render_template('prefs_ui.html', initial_prefs=prefs_data)

    # Otherwise return JSON API response
    return json_response(200, data=prefs_data)


@prefs_bp.route('/subreddit/<string:subreddit>', methods=['GET'])
def get_user_subreddit_pref(subreddit: str):
    """Retrieve preferences for a specific user and subreddit combination."""
    user_id = request.cookies.get('user_id', 0, type=int)

    result = db.execute(
        select(SubredditPref, Subreddit)
            .join(Subreddit, SubredditPref.sr_id == Subreddit.id)
            .where(
                SubredditPref.user_id == user_id,
                Subreddit.name_lower == subreddit.lower()
            )
    ).first()

    pref, sr = result if result else (None, None)
    return (
        json_response(200, pref_to_dict(pref, sr))
        if pref else
        json_response(404, error=f"No preferences found for user {user_id} on subreddit {subreddit}")
    )


allowed_fields = {'sort', 'layout', 'styles_enabled'}
allowed_pref_values = {
    'sort': {'best', 'hot', 'new', 'rising', 'gilded',
             'controversial_hour', 'controversial_day', 'controversial_week', 'controversial_month', 'controversial_year', 'controversial_all',
             'top_hour', 'top_day', 'top_week', 'top_month', 'top_year', 'top_all'},
    'layout': {'card', 'classic', 'compact', 'search'},
    'styles_enabled': {True, False}
}

@prefs_bp.route('/subreddit/<string:subreddit>', methods=['PATCH'])
def upsert_user_subreddit_pref(subreddit: str):
    """
    Update or create (upsert) preference fields for a specific user and subreddit.
    Payload: JSON body containing any subset of {'sort', 'layout', 'styles_enabled'}
    """
    user_id = request.cookies.get('user_id', 0, type=int)

    data = request.get_json()
    if type(data) != dict:
        return json_response(400, error={
            "message": "Invalid JSON payload",
            "code": "INVALID_PAYLOAD"
        })

    subreddit_lower = subreddit.lower()

    sr_input = data.get("subreddit")
    if not sr_input:
        return json_response(400, error={
            "message": "Missing required field 'subreddit'",
            "code": "MISSING_FIELD",
            "field": "subreddit"
        })


    sr = db.scalar(select(Subreddit).where(Subreddit.name_lower == subreddit_lower))
    if not sr:
        sr = Subreddit(
            id=sr_input["id"],
            name=subreddit,
            name_lower=subreddit_lower,
            icon=sr_input["icon"]
        )
        db.add(sr)
        db.flush()
    elif sr.icon != sr_input["icon"] or sr.name != sr_input["name"]:
        sr.name = subreddit
        sr.name_lower = subreddit_lower
        sr.icon = sr_input["icon"]


    prefs: dict = data.get("preferences")
    if not prefs:
        return json_response(400, error={
            "message": "Missing required field 'preferences'",
            "code": "MISSING_FIELD",
            "field": "preferences"
        })

    created = False
    pref = db.scalar(
        select(SubredditPref).where(
            SubredditPref.user_id == user_id,
            SubredditPref.sr_id == sr.id
        )
    )
    if not pref:
        pref = SubredditPref(
            user_id=user_id,
            sr_id=sr.id,
        )
        created = True

    errors: list[ErrorDetails] = []
    for key, value in prefs.items():
        if allowed_values := allowed_pref_values.get(key):
            if value not in allowed_values:
                errors.append({
                    "message": f"Invalid value '{value}' for field '{key}'. Allowed values are: {allowed_values}",
                    "code": "INVALID_VALUE",
                    "field": key
                })
            else:
               setattr(pref, key, value)
        else:
            errors.append({
                "message": f"Unknown field '{key}'",
                "code": "UNKNOWN_FIELD",
                "field": key
            })

    if errors:
        return json_response(400, error=errors)

    if created:
        db.add(pref)

    db.commit()
    return json_response(201 if created else 200, data=pref_to_dict(pref, sr))


@prefs_bp.route('/subreddit/<string:subreddit>', methods=['DELETE'])
def delete_user_subreddit_pref(subreddit: str):
    """Delete a user's preference record for a given subreddit."""
    user_id = request.cookies.get('user_id', 0, type=int)

    pref = db.scalar(
        select(SubredditPref)
            .join(Subreddit, SubredditPref.sr_id == Subreddit.id)
            .where(
                SubredditPref.user_id == user_id,
                Subreddit.name_lower == subreddit.lower()
            )
    )

    if not pref:
        return json_response(404, error=f"No preferences found for user id '{user_id}' on subreddit '{subreddit}'")

    db.delete(pref)
    db.commit()
    return json_response(200, data=None)