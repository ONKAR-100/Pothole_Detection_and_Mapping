"""
Local JSON database operations for PotholeWatch.
"""
import datetime
import json
import os
import uuid
from copy import deepcopy

from config import DB_PATH

LOCAL_USER = {
    "id": "local-admin",
    "email": "admin@potholewatch.local",
    "role": "admin",
    "full_name": "Local Admin",
}

DEFAULT_CONTACTS = [
    {
        "id": "local-municipality",
        "name": "Municipality Office",
        "email": "municipality@example.com",
        "phone": "",
        "region": "Local",
        "is_active": True,
    }
]

DEFAULT_DB = {
    "detections": [],
    "alert_log": [],
    "municipality_contacts": DEFAULT_CONTACTS,
    "reports": [],
}


def _ensure_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    if not os.path.exists(DB_PATH):
        _write_db(DEFAULT_DB)


def _read_db():
    _ensure_db()
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    merged = deepcopy(DEFAULT_DB)
    merged.update(data)
    return merged


def _write_db(data):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def _now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def _with_profile(row):
    item = dict(row)
    item["profiles"] = {
        "email": LOCAL_USER["email"],
        "full_name": LOCAL_USER["full_name"],
    }
    return item


def save_detection(
    user_id, input_type, source_name, severity, confidence,
    bbox, bbox_area_pct, frame_number=0,
    latitude=None, longitude=None,
    image_url=None, image_path=None, notes=""
) -> str:
    x1, y1, x2, y2 = bbox
    data = _read_db()
    row = {
        "id": str(uuid.uuid4()),
        "created_at": _now(),
        "user_id": user_id,
        "input_type": input_type,
        "source_name": source_name,
        "severity": severity,
        "confidence": confidence,
        "bbox_x1": x1,
        "bbox_y1": y1,
        "bbox_x2": x2,
        "bbox_y2": y2,
        "bbox_area_pct": bbox_area_pct,
        "frame_number": frame_number,
        "latitude": latitude,
        "longitude": longitude,
        "image_url": image_url,
        "image_path": image_path,
        "notes": notes,
    }
    data["detections"].append(row)
    _write_db(data)
    return row["id"]


def log_alert(detection_id: str, severity: str, message: str):
    data = _read_db()
    data["alert_log"].append({
        "id": str(uuid.uuid4()),
        "created_at": _now(),
        "detection_id": detection_id,
        "severity": severity,
        "message": message,
        "is_read": False,
    })
    _write_db(data)


def get_my_detections(user_id: str) -> list:
    return [
        _with_profile(d)
        for d in sorted(_read_db()["detections"], key=lambda x: x.get("created_at", ""), reverse=True)
        if d.get("user_id") == user_id
    ]


def get_all_detections(filters: dict = None) -> list:
    filters = filters or {}
    rows = _read_db()["detections"]
    if filters.get("severity"):
        rows = [d for d in rows if d.get("severity") == filters["severity"]]
    if filters.get("input_type"):
        rows = [d for d in rows if d.get("input_type") == filters["input_type"]]
    if filters.get("date_from"):
        rows = [d for d in rows if d.get("created_at", "")[:10] >= filters["date_from"]]
    if filters.get("date_to"):
        rows = [d for d in rows if d.get("created_at", "")[:10] <= filters["date_to"]]
    if filters.get("user_id"):
        rows = [d for d in rows if d.get("user_id") == filters["user_id"]]
    rows = sorted(rows, key=lambda x: x.get("created_at", ""), reverse=True)
    return [_with_profile(d) for d in rows]


def get_detection_by_id(detection_id: str) -> dict:
    for row in _read_db()["detections"]:
        if row.get("id") == detection_id:
            return _with_profile(row)
    return None


def get_detections_for_map() -> list:
    return [
        _with_profile(d)
        for d in get_all_detections()
        if d.get("latitude") is not None and d.get("longitude") is not None
    ]


def get_summary_stats() -> dict:
    rows = _read_db()["detections"]
    today = datetime.date.today().isoformat()
    week_ago = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
    total = len(rows)
    return {
        "total": total,
        "high": sum(1 for d in rows if d.get("severity") == "high"),
        "medium": sum(1 for d in rows if d.get("severity") == "medium"),
        "low": sum(1 for d in rows if d.get("severity") == "low"),
        "today": sum(1 for d in rows if d.get("created_at", "").startswith(today)),
        "this_week": sum(1 for d in rows if d.get("created_at", "")[:10] >= week_ago),
        "with_gps": sum(1 for d in rows if d.get("latitude") is not None),
        "avg_confidence": round(sum(d.get("confidence", 0) for d in rows) / total, 3) if total else 0,
        "total_users": 1,
    }


def get_timeline_data() -> list:
    thirty_ago = (datetime.date.today() - datetime.timedelta(days=30)).isoformat()
    daily = {}
    for d in _read_db()["detections"]:
        day = d.get("created_at", "")[:10]
        if day < thirty_ago:
            continue
        daily.setdefault(day, {"high": 0, "medium": 0, "low": 0})
        severity = d.get("severity")
        if severity in daily[day]:
            daily[day][severity] += 1
    return [{"date": day, **counts} for day, counts in sorted(daily.items())]


def get_recent_alerts(limit: int = 20) -> list:
    data = _read_db()
    detections = {d["id"]: d for d in data["detections"]}
    alerts = sorted(data["alert_log"], key=lambda x: x.get("created_at", ""), reverse=True)[:limit]
    return [{**a, "detections": detections.get(a.get("detection_id"))} for a in alerts]


def mark_alerts_read():
    data = _read_db()
    for alert in data["alert_log"]:
        alert["is_read"] = True
    _write_db(data)


def get_municipality_contacts() -> list:
    return [c for c in _read_db()["municipality_contacts"] if c.get("is_active", True)]


def save_municipality_contact(name: str, email: str, phone: str, region: str) -> str:
    data = _read_db()
    contact = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "phone": phone,
        "region": region,
        "is_active": True,
    }
    data["municipality_contacts"].append(contact)
    _write_db(data)
    return contact["id"]


def delete_municipality_contact(contact_id: str):
    data = _read_db()
    for contact in data["municipality_contacts"]:
        if contact.get("id") == contact_id:
            contact["is_active"] = False
    _write_db(data)


def save_report(
    generated_by, date_from, date_to,
    total, high, medium, low,
    pdf_url, sent_to_emails, status
) -> str:
    data = _read_db()
    report = {
        "id": str(uuid.uuid4()),
        "generated_at": _now(),
        "generated_by": generated_by,
        "date_from": str(date_from),
        "date_to": str(date_to),
        "total_detections": total,
        "high_count": high,
        "medium_count": medium,
        "low_count": low,
        "pdf_url": pdf_url,
        "sent_to_emails": sent_to_emails,
        "status": status,
        "profiles": {"email": LOCAL_USER["email"]},
    }
    data["reports"].append(report)
    _write_db(data)
    return report["id"]


def get_all_reports() -> list:
    return sorted(_read_db()["reports"], key=lambda x: x.get("generated_at", ""), reverse=True)


def get_profile(user_id: str) -> dict:
    return LOCAL_USER if user_id == LOCAL_USER["id"] else None
