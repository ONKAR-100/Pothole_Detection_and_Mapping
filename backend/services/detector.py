"""
PotholeWatch v3 — YOLOv8 Detection Engine
Loads best.pt once as a singleton, detects potholes, draws bounding boxes.
"""
import os
import cv2
import numpy as np
from config import MODEL_PATH, CONFIDENCE_THRESHOLD

SEVERITY_COLORS_BGR = {
    "low":    (0, 255, 0),      # green
    "medium": (0, 165, 255),    # orange
    "high":   (0, 0, 255)       # red
}

# bbox_area_pct → severity classification thresholds
SEVERITY_THRESHOLDS = {
    "low":    (0.0,  0.05),
    "medium": (0.05, 0.20),
    "high":   (0.20, 1.0)
}

_model = None


def get_model():
    """Load YOLO model once as singleton."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                f"Place your best.pt file at backend/models/best.pt"
            )
        from ultralytics import YOLO
        _model = YOLO(MODEL_PATH)
        print(f"[detector] Loaded model: {MODEL_PATH}")
    return _model


def get_severity(bbox_area_pct: float) -> str:
    """Classify severity based on bounding box area percentage."""
    for severity, (lo, hi) in SEVERITY_THRESHOLDS.items():
        if lo <= bbox_area_pct < hi:
            return severity
    return "high"


def draw_bbox(
    frame: np.ndarray,
    x1: int, y1: int, x2: int, y2: int,
    severity: str, confidence: float
) -> np.ndarray:
    """Draw annotated bounding box with semi-transparent fill, border, corner markers, and label."""
    color = SEVERITY_COLORS_BGR[severity]

    # 1. Semi-transparent fill (25% opacity)
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
    frame = cv2.addWeighted(overlay, 0.25, frame, 0.75, 0)

    # 2. Solid border
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)

    # 3. Corner L-markers (white, 18px arms, thickness 3)
    arm = 18
    corners = [
        (x1, y1,  1,  1),
        (x2, y1, -1,  1),
        (x1, y2,  1, -1),
        (x2, y2, -1, -1),
    ]
    for cx, cy, dx, dy in corners:
        cv2.line(frame, (cx, cy), (cx + dx * arm, cy), (255, 255, 255), 3)
        cv2.line(frame, (cx, cy), (cx, cy + dy * arm), (255, 255, 255), 3)

    # 4. Label pill
    label = f"Pothole  {severity.upper()}  {confidence:.0%}"
    font = cv2.FONT_HERSHEY_SIMPLEX
    (tw, th), baseline = cv2.getTextSize(label, font, 0.55, 2)
    label_y = max(y1 - th - 10, 0)
    cv2.rectangle(frame, (x1, label_y), (x1 + tw + 10, label_y + th + 8), color, -1)
    cv2.putText(frame, label, (x1 + 5, label_y + th + 2), font, 0.55, (255, 255, 255), 2)

    return frame


def detect_frame(
    frame_bgr: np.ndarray,
    confidence_threshold: float = None
) -> tuple:
    """Run YOLOv8 inference on a single BGR frame. Returns (annotated_frame, detections_list)."""
    model = get_model()
    threshold = confidence_threshold if confidence_threshold is not None else CONFIDENCE_THRESHOLD
    h, w = frame_bgr.shape[:2]

    results = model(frame_bgr, verbose=False)
    detections = []

    for box in results[0].boxes:
        conf = float(box.conf[0])
        if conf < threshold:
            continue
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        bbox_area_pct = ((x2 - x1) * (y2 - y1)) / (w * h)
        severity = get_severity(bbox_area_pct)
        frame_bgr = draw_bbox(frame_bgr, x1, y1, x2, y2, severity, conf)
        detections.append({
            "x1": x1,
            "y1": y1,
            "x2": x2,
            "y2": y2,
            "confidence": round(conf, 4),
            "severity": severity,
            "bbox_area_pct": round(bbox_area_pct, 4),
        })

    return frame_bgr, detections


def detect_image_pil(pil_image, confidence_threshold: float = None) -> tuple:
    """Run detection on a PIL Image. Returns (annotated_PIL_image, detections)."""
    from PIL import Image
    frame_bgr = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    annotated_bgr, detections = detect_frame(frame_bgr, confidence_threshold)
    annotated_rgb = cv2.cvtColor(annotated_bgr, cv2.COLOR_BGR2RGB)
    annotated_pil = Image.fromarray(annotated_rgb)
    return annotated_pil, detections


def detect_video_file(
    input_path: str,
    output_path: str,
    confidence_threshold: float = None
) -> list:
    """Process an entire video file frame by frame. Returns list of all detections."""
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))

    all_detections = []
    frame_num = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        annotated, frame_detections = detect_frame(frame, confidence_threshold)
        writer.write(annotated)
        for d in frame_detections:
            d["frame_number"] = frame_num
        all_detections.extend(frame_detections)
        frame_num += 1

    cap.release()
    writer.release()
    return all_detections
