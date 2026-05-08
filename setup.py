#!/usr/bin/env python3
"""
PotholeWatch v3 one-click setup.
"""
import os
import shutil
import subprocess
import sys


def banner():
    print("\n" + "=" * 44)
    print("  PotholeWatch Setup v3.0")
    print("=" * 44 + "\n")


def check_python():
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print(f"Python 3.10+ required. Found {version.major}.{version.minor}.{version.micro}")
        sys.exit(1)
    print(f"Python {version.major}.{version.minor}.{version.micro}")


def check_node():
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True, check=False)
        if result.returncode == 0:
            print(f"Node.js {result.stdout.strip()}")
        else:
            print("Node.js not found. Install it from https://nodejs.org")
    except FileNotFoundError:
        print("Node.js not found. Install it from https://nodejs.org")


def create_dirs():
    for directory in [
        os.path.join("backend", "data", "uploads"),
        os.path.join("backend", "data", "results"),
    ]:
        os.makedirs(directory, exist_ok=True)
    print("Created data directories")


def setup_env(src, dst):
    if not os.path.exists(dst) and os.path.exists(src):
        shutil.copy(src, dst)
        print(f"Created {dst} from example")
    elif os.path.exists(dst):
        print(f"{dst} already exists")


def check_model():
    model_path = os.path.join("backend", "models", "best.pt")
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        print(f"Model found: {model_path} ({size_mb:.1f} MB)")
    else:
        print(f"Model missing: {model_path}")


def install_backend():
    print("\nInstalling backend packages...")
    subprocess.check_call([
        sys.executable, "-m", "pip", "install", "-r",
        os.path.join("backend", "requirements.txt"),
    ])


def install_frontend():
    print("\nInstalling frontend packages...")
    subprocess.check_call(["npm", "install"], cwd="frontend")


def main():
    banner()
    check_python()
    check_node()
    create_dirs()
    setup_env(os.path.join("backend", ".env.example"), os.path.join("backend", ".env"))
    setup_env(os.path.join("frontend", ".env.example"), os.path.join("frontend", ".env"))
    check_model()

    try:
        install_backend()
        print("Backend packages installed")
    except Exception as exc:
        print(f"Backend install failed: {exc}")

    try:
        install_frontend()
        print("Frontend packages installed")
    except Exception as exc:
        print(f"Frontend install failed: {exc}")

    print("\nSetup complete.")
    print("Start the app with:")
    print("  Windows: start.bat")
    print("  Mac/Linux: bash start.sh")
    print("Open http://localhost:5173")


if __name__ == "__main__":
    main()
