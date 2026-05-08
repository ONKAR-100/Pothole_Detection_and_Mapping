"""
Local filesystem storage for generated detection media.
"""
import os

from config import PUBLIC_BASE_URL, RESULT_DIR


def _safe_name(filename: str) -> str:
    return os.path.basename(filename).replace(" ", "_")


def upload_annotated_image(pil_image, filename: str) -> tuple:
    os.makedirs(RESULT_DIR, exist_ok=True)
    safe_name = _safe_name(filename)
    path = os.path.join(RESULT_DIR, safe_name)
    pil_image.save(path, format="JPEG", quality=90)
    return f"{PUBLIC_BASE_URL}/static/results/{safe_name}", path


def upload_video(video_bytes: bytes, filename: str) -> tuple:
    os.makedirs(RESULT_DIR, exist_ok=True)
    safe_name = _safe_name(filename)
    path = os.path.join(RESULT_DIR, safe_name)
    with open(path, "wb") as f:
        f.write(video_bytes)
    return f"{PUBLIC_BASE_URL}/static/results/{safe_name}", path


def delete_file(path: str):
    if path and os.path.exists(path):
        os.remove(path)
