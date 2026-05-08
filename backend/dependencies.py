"""
Local user helpers kept for compatibility with older modules.
"""
from services.database import LOCAL_USER


def get_current_user() -> dict:
    return LOCAL_USER.copy()


def require_admin() -> dict:
    return get_current_user()
