# XPERTS Backend Core - Milestone 2

Welcome to the technical core of the **XPERTS SME Marketplace**. This repository contains the industrial-grade API foundation designed to connect Small and Medium Enterprises (SMEs) with niche industry experts.

## 🚀 Overview
Milestone 2 focuses on establishing a secure, scalable, and resilient backend architecture. This platform is built using **FastAPI** (Python) and follows clean architecture principles to ensure long-term maintainability and high performance.

## 🛠️ Tech Stack
- **Framework:** FastAPI (Asynchronous Python)
- **Database:** SQLAlchemy 2.0 (PostgreSQL compatible, currently configured with SQLite for local dev).
- **Security:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
- **Migrations:** Alembic for versioned database evolution.
- **Testing:** Pytest for automated quality assurance.
- **Logging:** Structured logging middleware for production monitoring.

## ✨ Features (M2)
- **Unified Authentication:** Secure login and registration for both `SME` and `EXPERT` roles.
- **Profile Management:** Dynamic profile creation and retrieval.
- **Standardized Error Handling:** Consistent API response format for all success and error states.
- **Industrial Hardening:** Integrated logging, security headers, and environment variable support.

## 📦 Setup & Installation

### 1. Requirements
Ensure you have **Python 3.9+** installed.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialize Database
Create the initial tables and schema:
```bash
export PYTHONPATH=$PYTHONPATH:.
python3 app/init_db.py
```

### 4. Run the API
Start the development server:
```bash
python3 -m uvicorn app.main:app --reload
```
Access the interactive documentation (Swagger UI) at: **`http://localhost:8000/docs`**

## 🧪 Testing & Quality
Run the automated test suite to verify the authentication flow:
```bash
pytest
```

---
*Developed by the XPERTS Engineering Team*
