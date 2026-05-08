<div align="center">

```
██████╗  ██████╗ ████████╗██╗  ██╗ ██████╗ ██╗     ███████╗
██╔══██╗██╔═══██╗╚══██╔══╝██║  ██║██╔═══██╗██║     ██╔════╝
██████╔╝██║   ██║   ██║   ███████║██║   ██║██║     █████╗  
██╔═══╝ ██║   ██║   ██║   ██╔══██║██║   ██║██║     ██╔══╝  
██║     ╚██████╔╝   ██║   ██║  ██║╚██████╔╝███████╗███████╗
╚═╝      ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝
                                                           
██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗                
██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║                
██║ █╗ ██║███████║   ██║   ██║     ███████║                
██║███╗██║██╔══██║   ██║   ██║     ██╔══██║                
╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║                
 ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝                
```

# 🛣️ AI-Powered Road Maintenance & Pothole Detection System

### *Automating Road Safety with Computer Vision — Faster, Smarter, Safer Roads*

<br/>

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6600?style=for-the-badge&logo=python&logoColor=white)](https://github.com/ultralytics/ultralytics)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.x-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> **🏆 Advanced Computer Vision · Zero Config Setup · Automated Reporting**  
> *Transforming how municipalities monitor and maintain infrastructure.*

<br/>

---

</div>

## 📋 Table of Contents

| Section | Description |
|---------|-------------|
| [🎯 Problem Statement](#-problem-statement) | The infrastructure crisis we solve |
| [💡 Solution Overview](#-solution-overview) | How PotholeWatch works |
| [🏗️ System Architecture](#-system-architecture) | Full system design |
| [🔄 Data Flow Diagrams](#-data-flow-diagrams) | Image processing & detection pipeline |
| [🤖 AI Models](#-ai-models--algorithms) | YOLOv8 object detection |
| [✨ Features](#-complete-feature-set) | Dashboards & capabilities explained |
| [🛠️ Tech Stack](#-technology-stack) | Full stack breakdown |
| [🗃️ Database Schema](#-database-schema) | JSON structure |
| [⚡ Quick Start](#-quick-start) | Get running in 2 minutes |
| [🔑 API Reference](#-api-reference) | Key endpoints |
| [🗺️ Mapping Strategy](#-mapping--gps-strategy) | Geographic plotting |
| [👥 Dashboards](#-role-based-dashboards) | User & Admin UI |

---

## 🎯 Problem Statement

Poor road maintenance and undetected potholes cause millions in vehicle damage and severely impact road safety:

```
⏱️  Manual road surveys take weeks and are prone to human error.
💔  Road hazards lead to severe accidents and costly vehicle repairs.
🚧  Root causes: Lack of real-time data, inefficient reporting, disconnected systems.
📡  Current gap: Authorities don't know where potholes are until citizens complain.
```

> *"Proactive road maintenance prevents accidents and saves municipal funds."*

**PotholeWatch** solves this by automating the detection and reporting pipeline using state-of-the-art computer vision.

---

## 💡 Solution Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   User uploads Image/Video  →  AI Detects Potholes  →  Severity        │
│   Calculated automatically  →  GPS Mapped  →  Report generated          │
│                                                                         │
│   Manual Survey Time reduced from Weeks  →  to Seconds (Real-time)    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

PotholeWatch is a **full-stack, AI-powered infrastructure monitoring platform** with:

- 🧠 **YOLOv8 Computer Vision** (real-time object detection)
- 🗺️ **GPS Coordinate Extraction & Mapping**
- 🏥 **Role-specific dashboards** for Users and Administrators
- 📋 **Automated PDF Report Generation** via ReportLab
- 🚑 **SendGrid Email Integration** for instant municipal alerts

---

## 🏗️ System Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         POTHOLEWATCH SYSTEM ARCHITECTURE                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                        CLIENT LAYER (React 18)                       │    ║
║  │                                                                      │    ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    ║
║  │  │   User       │  │   Admin      │  │  Interactive │              │    ║
║  │  │  Dashboard   │  │   Portal     │  │     Map      │              │    ║
║  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │    ║
║  │         │                 │                  │                       │    ║
║  │         └────────────────────────┬───────────┘                       │    ║
║  │                                  │  REST API (Axios)                 │    ║
║  └──────────────────────────────────┼──────────────────────────────────┘    ║
║                                     │                                        ║
║  ┌──────────────────────────────────▼──────────────────────────────────┐    ║
║  │                      API GATEWAY (Flask)                             │    ║
║  │                                                                      │    ║
║  │  /detect/image     /detect/video   /detections/map/pins              │    ║
║  │  /reports/generate /reports/send   /health                           │    ║
║  └──────────────────────────────────┬──────────────────────────────────┘    ║
║                                     │                                        ║
║  ┌──────────────────────────────────▼──────────────────────────────────┐    ║
║  │                         SERVICE LAYER                                │    ║
║  │                                                                      │    ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │    ║
║  │  │  CV Inference   │  │ Data Processing  │  │   Communications     │ │    ║
║  │  │                 │  │                  │  │                      │ │    ║
║  │  │  • YOLOv8 Model │  │  Area Heuristics │  │  ReportLab PDF Gen   │ │    ║
║  │  │  • OpenCV Drawn │  │  Severity Calc   │  │  SendGrid API Emails │ │    ║
║  │  └─────────────────┘  └─────────────────┘  └──────────────────────┘ │    ║
║  └──────────────────────────────────┬──────────────────────────────────┘    ║
║                                     │                                        ║
║  ┌──────────────────────────────────▼──────────────────────────────────┐    ║
║  │                         DATA LAYER                                   │    ║
║  │                                                                      │    ║
║  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │    ║
║  │  │    Local JSON Database      │  │   Local File System          │   │    ║
║  │  │    Zero-Setup Storage       │  │   Annotated Images/Videos    │   │    ║
║  │  └─────────────────────────────┘  └─────────────────────────────┘   │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🔄 Data Flow Diagrams

### Detection Lifecycle — From Upload to Resolution

```
═══════════════════════════════════════════════════════════════════════════════
                      COMPLETE DETECTION LIFECYCLE
═══════════════════════════════════════════════════════════════════════════════

  👤 USER / FIELD WORKER        🧠 AI BACKEND                   ⚙️ ADMIN / SYSTEM
  ──────────────────────        ─────────────                   ─────────────────

  [Upload Image/Video] ────────► [YOLOv8 Inference]
       (with GPS)                     │
                                      │ Finds Bounding Boxes
                                      │ Calculates Conf. Score
                                      ▼
                             [Severity Calculation]
                                      │
                         Heuristic (Box Area vs Frame)
                         → Low / Medium / High Severity
                                      │
                                      ▼
                             [OpenCV Annotation]
                                      │
                         Draws boxes & labels on image
                         Saves to `/backend/data/results`
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
         [Update DB]                                   [Return JSON]
              │                                               │
    Saves metadata to                             Sends data + image URL
    `local_db.json`                               back to Frontend
              │                                               │
              │                                               ▼
              │                                      [Map & Dashboard UI]
              │                                               │
              │                                       Renders new pins
              │                                       Updates charts
              │                                               │
              ▼                                               │
     [Admin Dashboard] ◄──────────────────────────────────────┘
              │
    Generates PDF Report
    Sends Email via SendGrid
              │
              ▼
       [CASE RECORDED ✅]

═══════════════════════════════════════════════════════════════════════════════
```

---

## 🤖 AI Models & Algorithms

### Model Architecture Overview

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    YOLOv8 CV PIPELINE                                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────┐     ║
║  │  MODEL: OBJECT DETECTOR (YOLOv8)                                 │     ║
║  │                                                                  │     ║
║  │  Input: BGR Image Arrays (via OpenCV)                            │     ║
║  │  Architecture: CSPDarknet53 Backbone + Path Aggregation Network  │     ║
║  │  Output: Bounding box coordinates (x1,y1,x2,y2) + Confidence     │     ║
║  │  Weights: Pre-trained `best.pt` on road hazard datasets          │     ║
║  └─────────────────────────────────────────────────────────────────┘     ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────┐     ║
║  │  ALGORITHM: SEVERITY HEURISTIC                                   │     ║
║  │                                                                  │     ║
║  │  Input: Box Coordinates, Total Image Area                        │     ║
║  │  Process: (Box Width * Box Height) / (Image Width * Image Height)│     ║
║  │  Output: Severity Level (Low, Medium, High)                      │     ║
║  │  Rationale: 2D area approximation serves as depth proxy          │     ║
║  └─────────────────────────────────────────────────────────────────┘     ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## ✨ Complete Feature Set

### 📊 Role-Based Dashboards

```
┌────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD ECOSYSTEM                             │
├──────────────────┬─────────────────┬───────────────────────────────────┤
│  👤 USER DASH     │  ⚙️ ADMIN DASH   │  🗺️ INTERACTIVE MAP                │
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ • Upload Media   │ • System KPIs   │ • Leaflet Integration             │
│ • View Results   │ • Report Gen    │ • Pin Clusters by Severity        │
│ • GPS Tagging    │ • Email Alerts  │ • Heatmap Visualizations          │
│ • AI Analytics   │ • Settings Mgmt │ • Clickable popups with data      │
└──────────────────┴─────────────────┴───────────────────────────────────┘
```

### Detection & AI Features
- ✅ **Real-Time YOLOv8 Inference** — Fast, accurate object detection for images and videos.
- ✅ **Automated Severity Ranking** — Heuristics to determine hazard priority.
- ✅ **OpenCV Image Annotation** — Dynamically draws colored bounding boxes and labels on detected images.
- ✅ **Confidence Thresholding** — Filters out false positives below a set confidence level.

### Mapping & Routing
- ✅ **React Leaflet** — High-performance map rendering.
- ✅ **Geographic Heatmaps** — Visualizes pothole density across city sectors.
- ✅ **EXIF Data Extraction** — Automatically extracts GPS coords from uploaded photos (if available).

### Reporting & Admin
- ✅ **ReportLab PDF Generation** — Creates professional municipal reports with tables and annotated images.
- ✅ **SendGrid Integration** — One-click email dispatch to city officials.
- ✅ **Zero-Config Database** — Utilizes a local JSON file (`local_db.json`) for immediate plug-and-play development.

---

## 🛠️ Technology Stack

```
╔══════════════════════════════════════════════════════════════════════╗
║                        TECHNOLOGY STACK                               ║
╠══════════════════════╦═══════════════════════════════════════════════╣
║  LAYER               ║  TECHNOLOGIES                                  ║
╠══════════════════════╬═══════════════════════════════════════════════╣
║  Frontend            ║  React 18 · Vite · Tailwind CSS · Recharts    ║
║                      ║  React Router DOM · React Leaflet · Axios     ║
╠══════════════════════╬═══════════════════════════════════════════════╣
║  Backend             ║  Python 3 · Flask · Werkzeug                  ║
║                      ║  ReportLab · SendGrid API                     ║
╠══════════════════════╬═══════════════════════════════════════════════╣
║  AI / ML             ║  Ultralytics (YOLOv8) · OpenCV (cv2)          ║
║                      ║  NumPy · Pillow (PIL)                         ║
╠══════════════════════╬═══════════════════════════════════════════════╣
║  Database            ║  Local JSON (`local_db.json`)                 ║
║                      ║  Python Dictionary Serialization              ║
╚══════════════════════╩═══════════════════════════════════════════════╝
```

---

## 🗃️ Database Schema

```
═══════════════════════════════════════════════════════════════════════════
                        JSON DATABASE STRUCTURE
═══════════════════════════════════════════════════════════════════════════

  {
    "detections": [
      {
        "id": "uuid-string",
        "timestamp": "2026-05-08T10:00:00Z",
        "location": { "lat": 19.876, "lng": 75.343 },
        "severity": "High",
        "image_url": "/api/images/results/uuid.jpg",
        "boxes": [ [x1, y1, x2, y2] ],
        "confidence": 0.89
      }
    ],
    "alert_log": [
      {
        "alert_id": "alert-123",
        "detection_id": "uuid-string",
        "sent_to": "municipal@city.gov",
        "status": "Delivered"
      }
    ],
    "municipality_contacts": [
      {
        "name": "Zone A Maintenance",
        "email": "zoneA@city.gov"
      }
    ]
  }

═══════════════════════════════════════════════════════════════════════════
```

---

## ⚡ Quick Start

### Option A — One-Click Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd pothole-watch

# Run the automated setup script
python setup.py

# Windows: Start both servers instantly
start.bat

# Linux/Mac: Start both servers instantly
bash start.sh
```

### Option B — Manual Setup

```bash
# 1. Install Backend Dependencies
cd backend
pip install -r requirements.txt
cp .env.example .env

# 2. Place YOLOv8 Model
# Ensure `best.pt` is inside `backend/models/`

# 3. Start Backend
python main.py

# 4. Install & Start Frontend (new terminal)
cd frontend
npm install
npm run dev
```

> **Note:** Access the frontend at `http://localhost:5173` and backend API at `http://localhost:8000`.

---

## 🔑 API Reference

### Core Endpoints

```
═══════════════════════════════════════════════════════════════
  BASE URL: http://localhost:8000
═══════════════════════════════════════════════════════════════

  DETECTION
  ─────────
  POST   /detect/image                    Upload image for YOLOv8 inference
  POST   /detect/video                    Upload video for frame processing

  MAPPING & DATA
  ──────────────
  GET    /detections/map/pins             Fetch all geolocated pothole pins
  GET    /detections/stats                Fetch severity and count statistics

  REPORTS & ALERTS
  ────────────────
  POST   /reports/generate                Generate PDF report from selected pins
  POST   /reports/send                    Dispatch email via SendGrid

  SYSTEM
  ──────
  GET    /health                          Check backend and model status
═══════════════════════════════════════════════════════════════
```

---

## 🗺️ Mapping & GPS Strategy

```
╔══════════════════════════════════════════════════════════════╗
║                 GEOGRAPHIC PLOTTING & UI                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Map Provider: Leaflet.js with OpenStreetMap                 ║
║  ─────────────────────────────────────                       ║
║  ✅ 100% Free and Open Source                                ║
║  ✅ No API Keys Required                                     ║
║  ✅ Custom HTML Markers based on Severity                    ║
║                                                              ║
║  GPS Acquisition:                                            ║
║  ─────────────────────────────────────                       ║
║  ✅ HTML5 Geolocation API (Browser)                          ║
║  ✅ EXIF Metadata Extraction (Image Uploads)                 ║
║  ✅ Manual Map Pin Drop (Fallback)                           ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 📁 Project Structure

```
pothole-watch/
│
├── 🖥️ backend/
│   ├── main.py                        ← Flask REST API
│   ├── requirements.txt               ← Python dependencies
│   ├── data/                          
│   │   ├── local_db.json              ← JSON Database
│   │   ├── uploads/                   ← Raw media storage
│   │   └── results/                   ← Annotated media storage
│   ├── models/                        
│   │   └── best.pt                    ← YOLOv8 trained weights
│   └── services/
│       ├── detector.py                ← YOLOv8 inference wrapper
│       ├── database.py                ← JSON DB operations
│       ├── report_generator.py        ← ReportLab PDF builder
│       └── email_sender.py            ← SendGrid integration
│
├── ⚛️ frontend/
│   ├── package.json                   ← Node dependencies
│   ├── vite.config.js                 ← Vite configuration
│   └── src/
│       ├── App.jsx                    ← React Router setup
│       ├── components/                ← Shared UI components
│       ├── pages/
│       │   ├── user/                  ← User upload & dashboard
│       │   └── admin/                 ← Admin settings & reports
│       └── context/                   ← React Context state management
│
├── setup.py                           ← Dependency & environment initializer
├── start.bat                          ← Windows dual-server launcher
└── start.sh                           ← Linux/Mac dual-server launcher
```

---

## 📄 License

```
MIT License

Copyright (c) 2026 PotholeWatch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software, to deal in the Software without restriction, including
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

<div align="center">

## 🏅 Built for Infrastructure Excellence

```
██████╗  ██████╗ ████████╗██╗  ██╗ ██████╗ ██╗     ███████╗
██╔══██╗██╔═══██╗╚══██╔══╝██║  ██║██╔═══██╗██║     ██╔════╝
██████╔╝██║   ██║   ██║   ███████║██║   ██║██║     █████╗  
██╔═══╝ ██║   ██║   ██║   ██╔══██║██║   ██║██║     ██╔══╝  
██║     ╚██████╔╝   ██║   ██║  ██║╚██████╔╝███████╗███████╗
╚═╝      ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝
```

**🚨 Every Pothole Detected is an Accident Prevented 🚨**

*AI · React · Flask · YOLOv8 · Leaflet · SendGrid · Tailwind CSS*

---

*Made with ❤️ to transform urban road maintenance.*  
*Faster Repairs · Smarter Infrastructure · Safer Roads*

</div>
