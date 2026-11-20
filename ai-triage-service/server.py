from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("OmniHealth-AI")

# Optional GenAI and Groq imports
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

try:
    from groq import AsyncGroq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False

from jose import jwt, JWTError

# --- JWT Configuration (matches Spring Boot auth-service) ---
SECRET_KEY = os.environ.get("JWT_SECRET", "CHANGE_ME_SUPER_SECRET_256_BITS_MINIMUM_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
ALGORITHMS = ["HS256", "HS512"]
security_bearer = HTTPBearer(auto_error=False)

# --- Database Setup (MongoDB + In-Memory Fallback) ---
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "healthcare")

db = None
mongo_connected = False
try:
    import certifi
    mongo_client = AsyncIOMotorClient(
        MONGO_URL,
        serverSelectionTimeoutMS=2500,
        tlsCAFile=certifi.where() if "mongodb+srv" in MONGO_URL else None
    )
    db = mongo_client[DB_NAME]
except Exception as e:
    logger.warning(f"Could not connect to MongoDB client: {e}. Using resilient in-memory storage.")

# Resilient in-memory fallback store
in_memory_checks: Dict[str, dict] = {}
in_memory_profiles: Dict[str, dict] = {}

async def is_mongo_alive():
    global mongo_connected
    if db is None:
        return False
    try:
        await db.command("ping")
        mongo_connected = True
        return True
    except Exception:
        mongo_connected = False
        return False

# --- Authentication Helpers ---
async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)):
    if not creds:
        raise HTTPException(
            status_code=401,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = creds.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHMS)
        email = payload.get("sub")
        role = payload.get("role", "ROLE_PATIENT")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return {"email": email, "role": role, "username": email}
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")

# --- Schemas ---
class UserProfile(BaseModel):
    age: int = 0
    gender: str = ""
    pre_existing_conditions: str = ""

class Condition(BaseModel):
    name: str
    description: str
    likelihood: str = "medium"

class SymptomInput(BaseModel):
    symptoms: str

class SymptomCheckResponse(BaseModel):
    id: str
    symptoms: str
    is_emergency: bool = False
    recommended_specialty: str = "General Medicine"
    conditions: List[Condition] = []
    next_steps: List[str] = []
    disclaimer: str = ""
    created_at: str = ""
    engine: str = "AI Engine"

SYSTEM_MESSAGE = """You are OmniHealth's Chief Clinical AI Assistant. Analyze the user's symptoms and patient context, then respond with ONLY a valid, raw JSON object (strictly NO markdown, no backticks, no code block).

JSON schema:
{
  "is_emergency": false,
  "recommended_specialty": "Cardiology" | "Dermatology" | "Neurology" | "Orthopedics" | "General Medicine" | "Pediatrics" | "ENT" | "Psychiatry",
  "conditions": [
    {
      "name": "Condition Name",
      "description": "1-2 sentence clinical summary.",
      "likelihood": "high" | "medium" | "low"
    }
  ],
  "next_steps": [
    "Step 1 description",
    "Step 2 description"
  ],
  "disclaimer": "This information is for educational and clinical triage purposes only and is not a definitive diagnosis. Always consult a licensed healthcare professional."
}

Rules:
- Set "is_emergency": true ONLY if symptoms indicate an acute, life-threatening situation (e.g. severe chest pain radiating to arm, stroke symptoms, respiratory distress, acute anaphylaxis).
- Choose the single most appropriate "recommended_specialty" so the platform can connect the patient to the right specialist doctor.
- Provide 2 to 4 conditions sorted by likelihood.
- Respond ONLY with raw valid JSON."""

def clean_and_parse_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()
    return json.loads(cleaned)

def clinical_heuristic_triage(symptoms: str, profile: dict) -> dict:
    s_lower = symptoms.lower()
    
    # Emergency checks
    emergency_keywords = ["chest pain", "heart attack", "can't breathe", "cannot breathe", "stroke", "paralysis", "coughing blood", "anaphylaxis", "unconscious"]
    is_emergency = any(kw in s_lower for kw in emergency_keywords)
    
    # Specialty & Condition mapping
    if any(k in s_lower for k in ["chest", "palpitation", "heart", "shortness of breath", "angina"]):
        specialty = "Cardiology"
        conditions = [
            {"name": "Angina Pectoris / Ischemic Event", "description": "Reduced blood flow to the heart muscles causing tightness or discomfort.", "likelihood": "high" if is_emergency else "medium"},
            {"name": "Costochondritis", "description": "Inflammation of the cartilage connecting ribs to breastbone.", "likelihood": "medium"},
            {"name": "Cardiovascular Stress", "description": "Elevated vascular workload requiring clinical monitoring.", "likelihood": "low"}
        ]
        next_steps = [
            "Seek immediate emergency care if chest pressure is acute or radiating." if is_emergency else "Schedule an urgent cardiology evaluation.",
            "Rest in an upright, comfortable position.",
            "Avoid strenuous physical exertion."
        ]
    elif any(k in s_lower for k in ["rash", "skin", "itch", "mole", "acne", "eczema", "dermatitis", "lesion"]):
        specialty = "Dermatology"
        conditions = [
            {"name": "Contact Dermatitis / Eczema", "description": "Localized inflammation of the dermis triggered by irritants or allergens.", "likelihood": "high"},
            {"name": "Urticaria (Hives)", "description": "Histamine-mediated raised, pruritic cutaneous wheals.", "likelihood": "medium"},
            {"name": "Fungal / Microbial Dermatosis", "description": "Superficial cutaneous infection requiring topical or oral therapy.", "likelihood": "low"}
        ]
        next_steps = [
            "Consult a dermatologist for targeted topical or oral prescription.",
            "Avoid scratching to prevent secondary bacterial infection.",
            "Keep the affected area clean, dry, and apply cool compresses."
        ]
    elif any(k in s_lower for k in ["headache", "migraine", "dizziness", "numbness", "tingling", "vertigo", "seizure"]):
        specialty = "Neurology"
        conditions = [
            {"name": "Tension-Type Headache or Migraine", "description": "Neurovascular cephalalgia often accompanied by photophobia or nausea.", "likelihood": "high"},
            {"name": "Benign Paroxysmal Positional Vertigo", "description": "Vestibular disturbance affecting equilibrium and head movement.", "likelihood": "medium"},
            {"name": "Cervicogenic Cephalalgia", "description": "Referred cranial pain originating from cervical spinal strain.", "likelihood": "low"}
        ]
        next_steps = [
            "Schedule a neurological or medical consultation.",
            "Rest in a quiet, darkened room and stay hydrated.",
            "Log the onset, frequency, and potential triggers."
        ]
    elif any(k in s_lower for k in ["joint", "knee", "bone", "back pain", "spine", "fracture", "sprain", "muscle"]):
        specialty = "Orthopedics"
        conditions = [
            {"name": "Musculoskeletal Strain / Sprain", "description": "Micro-trauma to ligamentous or muscular fibers causing pain and stiffness.", "likelihood": "high"},
            {"name": "Osteoarthritis / Synovitis", "description": "Degenerative or inflammatory joint disease affecting cartilage.", "likelihood": "medium"},
            {"name": "Lumbar Radiculopathy", "description": "Nerve root impingement in the spinal canal.", "likelihood": "low"}
        ]
        next_steps = [
            "Consult an orthopedic specialist or physical therapist.",
            "Apply R.I.C.E. protocol (Rest, Ice, Compression, Elevation).",
            "Avoid heavy lifting or high-impact stress on the joint."
        ]
    else:
        specialty = "General Medicine"
        conditions = [
            {"name": "Acute Viral Upper Respiratory Infection", "description": "Systemic viral manifestation characterized by malaise, fever, or localized discomfort.", "likelihood": "high"},
            {"name": "Seasonal Allergic Rhinosinusitis", "description": "Immune reactivity to ambient allergens with mucous membrane irritation.", "likelihood": "medium"},
            {"name": "Fatigue / General Systemic Strain", "description": "Physiological stress response due to dehydration, sleep deficit, or infection.", "likelihood": "low"}
        ]
        next_steps = [
            "Book an appointment with a General Practitioner / Family Physician.",
            "Ensure adequate hydration and minimum 8 hours of restorative sleep.",
            "Monitor body temperature and symptom progression."
        ]

    return {
        "is_emergency": is_emergency,
        "recommended_specialty": specialty,
        "conditions": conditions,
        "next_steps": next_steps,
        "disclaimer": "This information is for educational and clinical triage purposes only and is not a substitute for professional medical diagnosis. Always consult a qualified physician."
    }

async def generate_with_gemini(prompt: str) -> str:
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key or not HAS_GENAI:
        raise ValueError("Gemini unavailable")
    client = genai.Client(api_key=gemini_key, http_options={"api_version": "v1beta"})
    last_err = None
    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(system_instruction=SYSTEM_MESSAGE),
            )
            if response.text:
                return response.text
        except Exception as e:
            last_err = e
            continue
    raise last_err or ValueError("Gemini failed on all candidate models")

async def generate_with_groq(prompt: str) -> str:
    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key or not HAS_GROQ:
        raise ValueError("Groq unavailable")
    client = AsyncGroq(api_key=groq_key)
    last_err = None
    for model_name in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192", "mixtral-8x7b-32768"]:
        try:
            completion = await client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_MESSAGE},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
            )
            if completion.choices and completion.choices[0].message.content:
                return completion.choices[0].message.content
        except Exception as e:
            last_err = e
            continue
    raise last_err or ValueError("Groq failed on all candidate models")

# --- App Definition ---
app = FastAPI(title="OmniHealth AI Clinical Triage Service")
api_router = APIRouter(prefix="/api")

@api_router.get("/symptoms/health")
async def health_check():
    mongo_ok = await is_mongo_alive()
    return {
        "status": "UP",
        "service": "OmniHealth AI Clinical Triage",
        "mongo_connected": mongo_ok,
        "gemini_configured": bool(os.environ.get("GEMINI_API_KEY")),
        "groq_configured": bool(os.environ.get("GROQ_API_KEY"))
    }

@api_router.get("/user/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    if await is_mongo_alive():
        user_doc = await db.users.find_one({"email": email})
        if user_doc and "profile" in user_doc:
            p = user_doc["profile"]
            return UserProfile(
                age=p.get("age", 0),
                gender=p.get("gender", ""),
                pre_existing_conditions=p.get("pre_existing_conditions", "")
            )
    # Memory fallback
    p = in_memory_profiles.get(email, {})
    return UserProfile(
        age=p.get("age", 0),
        gender=p.get("gender", ""),
        pre_existing_conditions=p.get("pre_existing_conditions", "")
    )

@api_router.post("/user/profile")
async def update_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    if await is_mongo_alive():
        await db.users.update_one(
            {"email": email},
            {"$set": {"email": email, "profile": profile.model_dump()}},
            upsert=True
        )
    in_memory_profiles[email] = profile.model_dump()
    return {"message": "Profile updated successfully", "profile": profile.model_dump()}

@api_router.post("/symptoms/check", response_model=SymptomCheckResponse)
async def check_symptoms(input: SymptomInput, current_user: dict = Depends(get_current_user)):
    symptoms = input.symptoms.strip()
    if len(symptoms) < 3:
        raise HTTPException(status_code=400, detail="Please provide a descriptive symptom statement.")

    email = current_user["email"]
    profile_data = in_memory_profiles.get(email, {})
    if await is_mongo_alive():
        user_doc = await db.users.find_one({"email": email})
        if user_doc and "profile" in user_doc:
            profile_data = user_doc["profile"]

    parsed = None
    engine_used = "Heuristic Clinical Engine"

    # Context injection
    context_str = ""
    if profile_data.get("age") or profile_data.get("gender"):
        context_str = f"Patient Demographics: {profile_data.get('age', 'Unknown')} y/o {profile_data.get('gender', '')}. Pre-existing conditions: {profile_data.get('pre_existing_conditions', 'None reported')}."
    full_prompt = f"{context_str}\n\nSymptoms: {symptoms}" if context_str else f"Symptoms: {symptoms}"

    # Try Gemini
    if os.environ.get("GEMINI_API_KEY") and HAS_GENAI:
        try:
            raw = await generate_with_gemini(full_prompt)
            parsed = clean_and_parse_json(raw)
            engine_used = "Google Gemini 2.5 Flash"
        except Exception as e:
            logger.warning(f"Gemini evaluation failed: {e}")

    # Try Groq fallback
    if parsed is None and os.environ.get("GROQ_API_KEY") and HAS_GROQ:
        try:
            raw = await generate_with_groq(full_prompt)
            parsed = clean_and_parse_json(raw)
            engine_used = "Groq Llama-3.1"
        except Exception as e:
            logger.warning(f"Groq evaluation failed: {e}")

    # Resilient heuristic fallback if no key or all providers failed
    if parsed is None:
        parsed = clinical_heuristic_triage(symptoms, profile_data)
        engine_used = "OmniHealth Clinical Heuristic Engine"

    record_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    conditions = [Condition(**c) for c in parsed.get("conditions", [])]

    record = {
        "id": record_id,
        "user_email": email,
        "symptoms": symptoms,
        "is_emergency": parsed.get("is_emergency", False),
        "recommended_specialty": parsed.get("recommended_specialty", "General Medicine"),
        "conditions": [c.model_dump() for c in conditions],
        "next_steps": parsed.get("next_steps", []),
        "disclaimer": parsed.get("disclaimer", "For educational and triage purposes only."),
        "created_at": now_iso,
        "engine": engine_used
    }

    # Persist
    if await is_mongo_alive():
        await db.symptom_checks.insert_one(record)
    in_memory_checks[record_id] = record

    return SymptomCheckResponse(
        id=record_id,
        symptoms=symptoms,
        is_emergency=record["is_emergency"],
        recommended_specialty=record["recommended_specialty"],
        conditions=conditions,
        next_steps=record["next_steps"],
        disclaimer=record["disclaimer"],
        created_at=now_iso,
        engine=engine_used
    )

@api_router.get("/history", response_model=List[SymptomCheckResponse])
async def get_history(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    if await is_mongo_alive():
        cursor = db.symptom_checks.find({"user_email": email}, {"_id": 0}).sort("created_at", -1)
        docs = await cursor.to_list(100)
        return [
            SymptomCheckResponse(
                id=d["id"],
                symptoms=d["symptoms"],
                is_emergency=d.get("is_emergency", False),
                recommended_specialty=d.get("recommended_specialty", "General Medicine"),
                conditions=[Condition(**c) for c in d.get("conditions", [])],
                next_steps=d.get("next_steps", []),
                disclaimer=d.get("disclaimer", ""),
                created_at=d.get("created_at", ""),
                engine=d.get("engine", "AI Engine")
            )
            for d in docs
        ]

    # Memory fallback
    user_items = [v for v in in_memory_checks.values() if v.get("user_email") == email]
    user_items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [
        SymptomCheckResponse(
            id=d["id"],
            symptoms=d["symptoms"],
            is_emergency=d.get("is_emergency", False),
            recommended_specialty=d.get("recommended_specialty", "General Medicine"),
            conditions=[Condition(**c) for c in d.get("conditions", [])],
            next_steps=d.get("next_steps", []),
            disclaimer=d.get("disclaimer", ""),
            created_at=d.get("created_at", ""),
            engine=d.get("engine", "AI Engine")
        )
        for d in user_items
    ]

@api_router.get("/symptoms/appointment-context/{check_id}", response_model=SymptomCheckResponse)
async def get_appointment_triage_context(check_id: str, current_user: dict = Depends(get_current_user)):
    # Both Doctors and Patients can view this context
    if await is_mongo_alive():
        doc = await db.symptom_checks.find_one({"id": check_id}, {"_id": 0})
        if doc:
            return SymptomCheckResponse(
                id=doc["id"],
                symptoms=doc["symptoms"],
                is_emergency=doc.get("is_emergency", False),
                recommended_specialty=doc.get("recommended_specialty", "General Medicine"),
                conditions=[Condition(**c) for c in doc.get("conditions", [])],
                next_steps=doc.get("next_steps", []),
                disclaimer=doc.get("disclaimer", ""),
                created_at=doc.get("created_at", ""),
                engine=doc.get("engine", "AI Engine")
            )

    doc = in_memory_checks.get(check_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Clinical triage record not found")
    return SymptomCheckResponse(
        id=doc["id"],
        symptoms=doc["symptoms"],
        is_emergency=doc.get("is_emergency", False),
        recommended_specialty=doc.get("recommended_specialty", "General Medicine"),
        conditions=[Condition(**c) for c in doc.get("conditions", [])],
        next_steps=doc.get("next_steps", []),
        disclaimer=doc.get("disclaimer", ""),
        created_at=doc.get("created_at", ""),
        engine=doc.get("engine", "AI Engine")
    )

@api_router.delete("/history/{check_id}")
async def delete_history_item(check_id: str, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    if await is_mongo_alive():
        res = await db.symptom_checks.delete_one({"id": check_id, "user_email": email})
        if res.deleted_count > 0:
            return {"message": "Record deleted successfully"}

    if check_id in in_memory_checks and in_memory_checks[check_id].get("user_email") == email:
        del in_memory_checks[check_id]
        return {"message": "Record deleted successfully"}

    raise HTTPException(status_code=404, detail="Record not found")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8085))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
