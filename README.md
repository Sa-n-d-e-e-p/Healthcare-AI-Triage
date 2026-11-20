# 🩺 OmniHealth AI — Intelligent Clinical Triage & Care Management Platform

![Architecture: Microservices + AI](https://img.shields.io/badge/Architecture-Polyglot%20Microservices-blue.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-6DB33F?logo=springboot&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Google Gemini 2.5](https://img.shields.io/badge/AI%20Engine-Gemini%202.5%20Flash-8E75B2?logo=google&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%207-47A248?logo=mongodb&logoColor=white)
![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-61DAFB?logo=react&logoColor=white)

---

## 🌟 Executive Overview

**OmniHealth** is an enterprise-grade healthcare platform combining:
1. **Google Gemini 2.5 AI Clinical Triage**: Demographic-aware symptom assessment, condition probability ranking, emergency triage flagging, and automatic specialist matching.
2. **Spring Boot 3 Enterprise Microservices**: High-throughput distributed services for Authentication (RBAC), Profiles, Appointment Scheduling with conflict detection, and Event Notifications.
3. **Closed-Loop Doctor Pre-Intake**: When patients book appointments from their AI triage results, the clinical intake dossier (symptoms, probable conditions, risk rating) is automatically linked to the appointment for the attending physician to review before the consultation.

```
[ Patient describes symptoms ] 
              │
              ▼
[ Gemini 2.5 AI Triage Engine analyzes severity & recommends specialties ]
              │
       ┌──────┴───────────────────────────────────────┐
       ▼                                              ▼
[ Emergency detected? ]                     [ Non-emergency: e.g. "Dermatology" ]
  🚨 Red-alert triage banner                  📋 Educational Condition Breakdown
  Directs to 911 / ER                         🎯 1-Click "Book Recommended Specialist"
                                                      │
                                                      ▼
[ Pre-populates appointment with AI Intake Summary & books matching Doctor ]
                                                      │
                                                      ▼
[ Doctor reviews patient's AI pre-intake triage note on their consultation dashboard ]
```

---

## 🏛️ System Architecture

```
                                ┌───────────────────────────────────────┐
                                │          Modern Unified Web UI        │
                                │   (React + Vite + Tailwind CSS + Lucide)
                                └───────────────────┬───────────────────┘
                                                    │ HTTP / JSON (JWT)
                                                    ▼
                                ┌───────────────────────────────────────┐
                                │      Spring Cloud Gateway (8080)      │
                                │         Reverse Proxy & CORS          │
                                └─┬──────────────┬───────────────┬──────┘
                                  │              │               │
            ┌─────────────────────┼──────────────┼───────────────┼────────────────────┐
            │                     │              │               │                    │
            ▼                     ▼              ▼               ▼                    ▼
    ┌───────────────┐     ┌───────────────┐ ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Auth Service │     │Profile Service│ │ Appt Service  │ │Notification  │ │  AI Triage   │
    │  Spring Boot  │     │  Spring Boot  │ │  Spring Boot  │ │  Spring Boot │ │   FastAPI    │
    │    (8081)     │     │    (8083)     │ │    (8082)     │ │    (8084)    │ │    (8085)    │
    └───────┬───────┘     └───────┬───────┘ └───────┬───────┘ └──────┬───────┘ └──────┬───────┘
            │                     │                 │                │                │
            └─────────────────────┼─────────────────┴────────────────┘                │
                                  ▼                                                   ▼
                        ┌───────────────────┐                               ┌───────────────────┐
                        │ PostgreSQL 16 DB  │                               │    MongoDB 7 DB   │
                        │ (Users, Doctors,  │                               │(Symptom Histories,│
                        │  Patients, Appts, │                               │ LLM Logs, Triage  │
                        │  Notifications)   │                               │    Documents)     │
                        └───────────────────┘                               └───────────────────┘
```

---

## 📦 Services Topology

| Service | Port | Technology | Primary Responsibilities |
|---|---|---|---|
| **`gateway`** | **8080** | Spring Cloud Gateway | Unified API endpoint, CORS handling, routing downstream |
| **`auth-service`** | **8081** | Spring Boot 3, Spring Security | Single Sign-On JWT issuance, RBAC (`PATIENT`, `DOCTOR`, `ADMIN`) |
| **`appointment-service`** | **8082** | Spring Boot 3, Spring Data JPA | Scheduling engine, time conflict validation, AI dossier linkage |
| **`profile-service`** | **8083** | Spring Boot 3, Spring Data JPA | Doctor directory, medical specializations, patient demographics |
| **`notification-service`**| **8084** | Spring Boot 3, Spring Data JPA | Event ingestion for booked appointments and audit trails |
| **`ai-triage-service`** | **8085** | FastAPI, Gemini 2.5 Flash, Groq | Clinical triage, demographic calibration, emergency detection |
| **`frontend`** | **3000** | React 18, Vite, Tailwind | Responsive role-based portals (Patient, Doctor, Admin) |
| **`postgres`** | **5432** | PostgreSQL 16 | Relational store for users, profiles, appointments |
| **`mongodb`** | **27017** | MongoDB 7 | Document store for unstructured AI checks and LLM triage logs |
| **`pgadmin`** | **8088** | pgAdmin 4 | Relational database administration GUI (optional) |

---

## 🚀 Quickstart (Run with Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.

### 1. Boot the Entire Platform
From the `OmniHealth` directory:
```bash
# 1. Configure environment (optional: add GEMINI_API_KEY if available)
cp .env.example .env

# 2. Build and boot all containers
docker compose up --build -d
```

### 2. Access the Application
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)
- **pgAdmin**: [http://localhost:8088](http://localhost:8088) (`admin@example.com` / `admin`)

---

## 🔑 Pre-Seeded Demo Accounts

The database is automatically bootstrapped with test accounts:

| Role | Email | Password | What You Can Do |
|---|---|---|---|
| **Patient** | `patient@example.com` | `Patient@123` | Check symptoms, view AI history, book appointments with specialists |
| **Doctor** | `doc1@clinic.org` | `DocPass@123` | Dermatology queue, view patient AI triage dossiers |
| **Doctor** | `doc2@clinic.org` | `DocPass@123` | Cardiology queue, review cardiovascular consultations |
| **Admin** | `admin@example.com` | `Admin@123` | Onboard new specialist doctors, oversee clinic metrics |

*Note: You can also self-register any new patient account directly from the **Register** page!*

---

## 🧪 Testing the End-to-End Workflow

1. **Patient AI Triage**:
   - Go to [http://localhost:3000/symptoms](http://localhost:3000/symptoms).
   - Click the test example: *"Red itchy rash with raised bumps on forearms for 3 days"*.
   - Click **Analyze Symptoms**.
   - Notice:
     - The AI identifies **Dermatology** as the recommended specialty.
     - The conditions show **Contact Dermatitis** (High likelihood).
     - Prominent button appears: **"Book Dermatology Specialist"**.
2. **1-Click Specialist Booking**:
   - Click **"Book Dermatology Specialist"**.
   - Notice the form pre-selects **Dr. Meera Iyer (Dermatology)** and pre-fills the consultation reason with the AI diagnosis!
   - Pick date/time and click **Confirm Appointment**.
3. **Doctor Review**:
   - Log out, then log in as `doc1@clinic.org` (`DocPass@123`).
   - Navigate to **Doctor Console**.
   - Notice the scheduled appointment from the patient.
   - Click **"Review AI Triage Dossier"** to view the patient's symptoms, evaluated conditions, and severity rating before the visit!

---

## 🛠️ Hybrid Local Development (Without Docker for Services)

If you wish to run the databases in Docker but run services locally in your terminal or IDE:
```bash
# Start Postgres and Mongo only:
docker compose -f docker-compose.dev.yml up -d

# Terminal 1: Auth Service
cd auth-service && mvn spring-boot:run

# Terminal 2: Profile Service
cd profile-service && mvn spring-boot:run

# Terminal 3: Appointment Service
cd appointment-service && mvn spring-boot:run

# Terminal 4: Notification Service
cd notification-service && mvn spring-boot:run

# Terminal 5: AI Triage Service
cd ai-triage-service && uvicorn server:app --port 8085 --reload

# Terminal 6: API Gateway
cd gateway && mvn spring-boot:run

# Terminal 7: Frontend
cd frontend && npm install && npm run dev
```

---

## 🛡️ Resilience & Failover Strategy

- **LLM Failover**: Automatically calls **Google Gemini 2.5 Flash**, falls back to **Groq (`llama-3.1-8b-instant`)** on rate limits, and uses an internal **Clinical Heuristic Engine** if API keys are omitted. The app **never crashes or blocks**.
- **Polyglot Security**: Spring Security issues HMAC-SHA256 JWT tokens. FastAPI validates the exact same signature using the shared secret, ensuring zero authentication drift across Python and Java.
- **Conflict Prevention**: The appointment engine checks time bounds ($[start, start + duration]$) to guarantee no overlapping double-bookings for any physician.
