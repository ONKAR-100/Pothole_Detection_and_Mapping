"""
PotholeWatch v3 configuration.
"""
import os
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH = os.getenv("MODEL_PATH", "models/best.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.40"))

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
ALERT_FROM_EMAIL = os.getenv("ALERT_FROM_EMAIL", "alerts@potholewatch.com")
ALERT_FROM_NAME = os.getenv("ALERT_FROM_NAME", "PotholeWatch")

APP_NAME = os.getenv("APP_NAME", "PotholeWatch")
APP_VERSION = os.getenv("APP_VERSION", "3.0")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")

DATA_DIR = os.getenv("DATA_DIR", "data")
UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")
RESULT_DIR = os.path.join(DATA_DIR, "results")
DB_PATH = os.path.join(DATA_DIR, "local_db.json")


def validate_config():
  warnings = []
  if not SENDGRID_API_KEY:
    warnings.append("SENDGRID_API_KEY is not set (email features disabled)")
  for warning in warnings:
    print(f"[CONFIG WARNING] {warning}")
  return len(warnings) == 0
