"""
PotholeWatch v3 Flask application.
"""
from dotenv import load_dotenv
load_dotenv()

import base64
import io
import os
import uuid
from datetime import datetime

from flask import Flask, jsonify, request, send_file
from PIL import Image

from config import (
    APP_VERSION, FRONTEND_URL, MODEL_PATH, RESULT_DIR, UPLOAD_DIR,
    validate_config,
)
from services import detector, database, storage
from services.database import LOCAL_USER
from services.email_sender import send_report_email
from services.report_generator import generate_pdf_report

app = Flask(__name__, static_folder="data", static_url_path="/static")


@app.after_request
def add_cors_headers(response):
    allowed_origins = {FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"}
    origin = request.headers.get("Origin")
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers["Access-Control-Allow-Origin"] = FRONTEND_URL
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    return response


def current_user():
    return LOCAL_USER.copy()


def form_float(name):
    value = request.form.get(name)
    return float(value) if value not in (None, "") else None


def form_bool(name, default=True):
    value = request.form.get(name)
    if value is None:
        return default
    return str(value).lower() in {"1", "true", "yes", "on"}


def detection_stats(detections):
    total = len(detections)
    return {
        "total": total,
        "high": sum(1 for d in detections if d.get("severity") == "high"),
        "medium": sum(1 for d in detections if d.get("severity") == "medium"),
        "low": sum(1 for d in detections if d.get("severity") == "low"),
        "avg_confidence": (
            sum(d.get("confidence", 0) for d in detections) / total
            if total else 0
        ),
        "with_gps": sum(1 for d in detections if d.get("latitude")),
    }


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "version": APP_VERSION,
        "model_path": MODEL_PATH,
        "model_ok": os.path.exists(MODEL_PATH),
        "backend": "flask",
    })


@app.get("/auth/me")
def me():
    return jsonify(current_user())


@app.post("/detect/image")
def detect_image():
    file = request.files.get("file")
    if not file:
        return jsonify({"detail": "No file uploaded"}), 400

    pil_image = Image.open(io.BytesIO(file.read())).convert("RGB")
    annotated_pil, detections = detector.detect_image_pil(
        pil_image,
        form_float("confidence_threshold"),
    )

    result = {
        "detections": detections,
        "detection_count": len(detections),
        "image_url": None,
        "detection_ids": [],
    }

    lat = form_float("latitude")
    lng = form_float("longitude")
    if detections and form_bool("auto_save", True):
        ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{current_user()['id']}_{ts}.jpg"
        image_url, image_path = storage.upload_annotated_image(annotated_pil, filename)
        result["image_url"] = image_url

        for item in detections:
            det_id = database.save_detection(
                user_id=current_user()["id"],
                input_type="image",
                source_name=file.filename,
                severity=item["severity"],
                confidence=item["confidence"],
                bbox=(item["x1"], item["y1"], item["x2"], item["y2"]),
                bbox_area_pct=item["bbox_area_pct"],
                latitude=lat,
                longitude=lng,
                image_url=image_url,
                image_path=image_path,
            )
            result["detection_ids"].append(det_id)
            if item["severity"] == "high":
                database.log_alert(det_id, "high", f"High severity pothole detected in {file.filename}")

    buf = io.BytesIO()
    annotated_pil.save(buf, format="JPEG", quality=90)
    result["annotated_image_b64"] = base64.b64encode(buf.getvalue()).decode()
    return jsonify(result)


@app.post("/detect/video")
def detect_video():
    file = request.files.get("file")
    if not file:
        return jsonify({"detail": "No file uploaded"}), 400

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(RESULT_DIR, exist_ok=True)

    safe_name = file.filename.replace(" ", "_")
    input_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{safe_name}")
    output_path = os.path.join(RESULT_DIR, f"annotated_{uuid.uuid4()}.mp4")
    file.save(input_path)

    try:
        all_detections = detector.detect_video_file(
            input_path,
            output_path,
            form_float("confidence_threshold"),
        )
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)

    detection_ids = []
    video_url = None
    lat = form_float("latitude")
    lng = form_float("longitude")

    if all_detections and os.path.exists(output_path):
        with open(output_path, "rb") as f:
            video_url, video_path = storage.upload_video(f.read(), f"video_{uuid.uuid4()}.mp4")

        for item in all_detections:
            det_id = database.save_detection(
                user_id=current_user()["id"],
                input_type="video",
                source_name=file.filename,
                severity=item["severity"],
                confidence=item["confidence"],
                bbox=(item["x1"], item["y1"], item["x2"], item["y2"]),
                bbox_area_pct=item["bbox_area_pct"],
                frame_number=item.get("frame_number", 0),
                latitude=lat,
                longitude=lng,
                image_url=video_url,
                image_path=video_path,
            )
            detection_ids.append(det_id)
            if item["severity"] == "high":
                database.log_alert(det_id, "high", f"High severity pothole in video {file.filename}")

    return jsonify({
        "detections": all_detections,
        "detection_count": len(all_detections),
        "detection_ids": detection_ids,
        "output_video_path": output_path,
        "video_url": video_url,
    })


@app.get("/detect/video/download")
def download_annotated_video():
    path = request.args.get("path", "")
    abs_path = os.path.abspath(path)
    result_root = os.path.abspath(RESULT_DIR)
    if not abs_path.startswith(result_root) or not os.path.exists(abs_path):
        return jsonify({"detail": "Video file not found"}), 404
    return send_file(abs_path, mimetype="video/mp4", as_attachment=True, download_name="annotated.mp4")


@app.post("/detect/frame")
def detect_single_frame():
    file = request.files.get("file")
    if not file:
        return jsonify({"detail": "No file uploaded"}), 400

    pil_image = Image.open(io.BytesIO(file.read())).convert("RGB")
    annotated_pil, detections = detector.detect_image_pil(
        pil_image,
        form_float("confidence_threshold"),
    )

    buf = io.BytesIO()
    annotated_pil.save(buf, format="JPEG", quality=85)
    return jsonify({
        "detections": detections,
        "annotated_image_b64": base64.b64encode(buf.getvalue()).decode(),
    })


@app.get("/detections/my")
def my_detections():
    return jsonify(database.get_my_detections(current_user()["id"]))


@app.get("/detections/map/pins")
def map_pins():
    return jsonify(database.get_detections_for_map())


@app.get("/detections/stats")
@app.get("/dashboard/stats")
def summary_stats():
    return jsonify(database.get_summary_stats())


@app.get("/detections/<detection_id>")
def detection_by_id(detection_id):
    item = database.get_detection_by_id(detection_id)
    if not item:
        return jsonify({"detail": "Detection not found"}), 404
    return jsonify(item)


@app.get("/detections")
def list_detections():
    filters = {
        key: request.args.get(key)
        for key in ("severity", "input_type", "date_from", "date_to")
        if request.args.get(key)
    }
    return jsonify(database.get_all_detections(filters))


@app.get("/dashboard/alerts")
def recent_alerts():
    return jsonify(database.get_recent_alerts(int(request.args.get("limit", 20))))


@app.post("/dashboard/alerts/read")
def mark_read():
    database.mark_alerts_read()
    return jsonify({"message": "All alerts marked as read"})


@app.get("/dashboard/timeline")
def timeline():
    return jsonify(database.get_timeline_data())


@app.post("/reports/generate")
def generate_report():
    body = request.get_json(force=True) or {}
    filters = {
        "date_from": body.get("date_from"),
        "date_to": body.get("date_to"),
    }
    if body.get("severity_filter"):
        filters["severity"] = body["severity_filter"]

    detections = database.get_all_detections(filters)
    stats = detection_stats(detections)
    pdf_buffer = generate_pdf_report(
        detections=detections,
        stats=stats,
        date_from=body.get("date_from"),
        date_to=body.get("date_to"),
        generated_by_name=current_user()["full_name"],
    )
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"pothole_report_{body.get('date_from')}_{body.get('date_to')}.pdf",
    )


@app.post("/reports/send")
def send_report():
    body = request.get_json(force=True) or {}
    all_contacts = database.get_municipality_contacts()
    contact_ids = body.get("contact_ids") or []
    contacts = [c for c in all_contacts if c["id"] in contact_ids] if contact_ids else all_contacts
    if not contacts:
        return jsonify({"detail": "No valid contacts selected"}), 400

    detections = database.get_all_detections({
        "date_from": body.get("date_from"),
        "date_to": body.get("date_to"),
    })
    stats = detection_stats(detections)
    pdf_buffer = generate_pdf_report(
        detections=detections,
        stats=stats,
        date_from=body.get("date_from"),
        date_to=body.get("date_to"),
        generated_by_name=current_user()["full_name"],
    )

    to_emails = [c["email"] for c in contacts]
    result = send_report_email(to_emails, pdf_buffer, f"{body.get('date_from')} to {body.get('date_to')}", stats)
    status = "sent" if result.get("success") else "failed"
    report_id = database.save_report(
        generated_by=current_user()["id"],
        date_from=body.get("date_from"),
        date_to=body.get("date_to"),
        total=stats["total"],
        high=stats["high"],
        medium=stats["medium"],
        low=stats["low"],
        pdf_url=None,
        sent_to_emails=to_emails,
        status=status,
    )
    return jsonify({
        "success": result.get("success"),
        "report_id": report_id,
        "sent_to": to_emails,
        "error": result.get("error"),
    })


@app.get("/reports")
def list_reports():
    return jsonify(database.get_all_reports())


@app.get("/municipality/contacts")
def list_contacts():
    return jsonify(database.get_municipality_contacts())


@app.post("/municipality/contacts")
def create_contact():
    body = request.get_json(force=True) or {}
    contact_id = database.save_municipality_contact(
        body.get("name", ""),
        body.get("email", ""),
        body.get("phone", ""),
        body.get("region", ""),
    )
    return jsonify({"id": contact_id, "message": "Contact created"})


@app.delete("/municipality/contacts/<contact_id>")
def delete_contact(contact_id):
    database.delete_municipality_contact(contact_id)
    return jsonify({"message": "Contact deleted"})


if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("  PotholeWatch API v3.0 - Flask")
    print("=" * 55)
    validate_config()
    app.run(host="127.0.0.1", port=8000, debug=True)
