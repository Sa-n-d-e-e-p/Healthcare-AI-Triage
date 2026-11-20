# 🏛️ OmniHealth Architecture & Engineering Blueprint

This document details the architectural decisions, trade-offs, and technical specifications behind the merged **OmniHealth** platform.

---

## 1. Architectural Philosophy

The merger of a **Spring Boot microservices ecosystem** (`Healthcare_microservice`) with an **AI-powered symptom checker** (`Healthcare_symptom`) transforms an administrative scheduling portal and an isolated diagnostic demo into a **closed-loop clinical decision support platform**.

### Core Tenets
1. **Clinical Front-Door**: AI symptom checking is not a toy; it is the triage intake mechanism that routes patients to the correct specialty care.
2. **Polyglot Harmony**: Leverage the right tool for the job. Java / Spring Boot for strongly-typed ACID transactional scheduling; Python / FastAPI for asynchronous GenAI and LLM streaming; React + Vite for snappy UI.
3. **Decoupled Yet Integrated**: The AI service does not write directly to the Appointment database. Instead, it issues a reference token (`symptomCheckId`) that downstream clinical workflows consume via secure microservice endpoints.

---

## 2. C4 Model Overview

### Level 1: System Context
```
                           ┌────────────────────────────┐
                           │    Patients / Doctors /    │
                           │       Administrators       │
                           └──────────────┬─────────────┘
                                          │
                                          ▼
                           ┌────────────────────────────┐
                           │    OmniHealth Platform     │
                           │  - AI Symptom Triage       │
                           │  - Doctor Directory        │
                           │  - Appointment Engine      │
                           └──────────────┬─────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
       ┌────────────────────────┐                   ┌────────────────────────┐
       │   Google Gemini 2.5    │                   │      Groq Cloud        │
       │    Flash LLM API       │                   │    (Failover Model)    │
       └────────────────────────┘                   └────────────────────────┘
```

### Level 2: Containers & Data Flow
1. **Client**: React 18 Single-Page Application (SPA) communicating over HTTPS to port 8080.
2. **Edge Gateway**: Spring Cloud Gateway intercepts all calls, strips/validates CORS, deduplicates response headers, and routes `/api/*` to upstream microservices.
3. **Identity Provider (`auth-service`)**: Signs JWT tokens using standard HS256 HMAC encryption with claims:
   - `sub`: User email address
   - `role`: Granted authority (`ROLE_PATIENT`, `ROLE_DOCTOR`, `ROLE_ADMIN`)
   - `exp`: Expiration timestamp (120 minutes)
4. **AI Triage (`ai-triage-service`)**:
   - Decodes the incoming Bearer token using the shared secret.
   - Injects user demographics (Age, Gender, Pre-existing conditions).
   - Generates deterministic JSON matching clinical schema:
     - `is_emergency`: Acute risk flag.
     - `recommended_specialty`: Target medical discipline (e.g. Cardiology, Dermatology).
     - `conditions`: List of differential diagnoses with likelihoods.
     - `next_steps`: Triage guidance.
   - Persists session in MongoDB and returns `id`.
5. **Appointment Engine (`appointment-service`)**:
   - Accepts booking requests with optional `symptomCheckId`.
   - Validates interval intersection: $\neg (End_A \le Start_B \lor Start_A \ge End_B)$.
   - Emits asynchronous booking notifications to `notification-service`.

---

## 3. Polyglot Persistence Strategy

| Storage Engine | Data Domain | Rationale |
|---|---|---|
| **PostgreSQL 16** | Users, Profiles, Appointments, Notifications | Requires ACID transactions, referential integrity, unique constraints, and strict schema enforcement. |
| **MongoDB 7** | Symptom checks, AI prompts, conditions, LLM telemetry | Unstructured schema that accommodates polymorphic AI condition responses, dynamic prompt metadata, and high-frequency writes. |

---

## 4. Cross-Cutting Concerns

### A. Authentication Contract
Both the Java and Python layers participate in a shared security contract without requiring an external token introspection call:
- **Issuer**: Spring Boot `auth-service`
- **Algorithm**: `HS256`
- **Secret**: Managed via `JWT_SECRET` environment variable
- **Consumers**: Spring Security filters (`JwtAuthFilter`) in `appointment-service` and `profile-service`; HTTPBearer dependency in FastAPI `server.py`.

### B. Fault Tolerance & Fallback Hierarchy
To guarantee zero downtime during demonstrations and clinical use:
```
[ Incoming Symptom Check Request ]
               │
               ▼
   [ Is GEMINI_API_KEY set? ] ───(Yes)───► Try Gemini 2.5 Flash
               │                                   │
             (No)                          (Success? / Fail?)
               │                                   │
               ▼                                   ▼
   [ Is GROQ_API_KEY set? ]   ◄──────────── (If Rate-Limited)
               │
          (Yes / No)
               │
               ▼
   [ Fallback to Internal Clinical Heuristic Engine ]
   - Analyzes symptom taxonomy
   - Flags acute emergency triggers
   - Assigns medical specialty
   - Produces standard JSON schema
```

### C. Appointment Conflict Validation
The `appointment-service` prevents double bookings by verifying that new appointments do not overlap with existing appointments for the same physician:
```java
Instant start = req.scheduledAt;
Instant end = req.scheduledAt.plus(Duration.ofMinutes(req.durationMinutes));

for (Appointment a : repo.findByDoctorId(req.doctorId)) {
  Instant aStart = a.getScheduledAt();
  Instant aEnd = a.getScheduledAt().plus(Duration.ofMinutes(a.getDurationMinutes()));
  boolean overlap = !aEnd.isBefore(start) && !aStart.isAfter(end);
  if (overlap) throw new ResponseStatusException(HttpStatus.CONFLICT, "Overlapping appointment");
}
```

---

## 5. Security & Privacy Considerations (HIPAA / GDPR Alignment)

- **Least Privilege Access**: Patients can only query their own appointments (`createdByEmail == auth.getName()`). Doctors can only access appointments where `doctorId` matches their profile ID.
- **Stateless Authentication**: No session state is held in memory by the API Gateway or microservices. Tokens expire after 120 minutes.
- **Educational Disclaimers**: Every AI response includes persistent clinical disclaimers clarifying that the tool provides decision support, not definitive diagnosis.
