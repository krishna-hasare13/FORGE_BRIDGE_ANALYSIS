from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np
import shutil
import os
from tensorflow.keras.models import load_model
from yolo_engine import detect_cracks
from internal_engine import carbonation_model, vibration_anomaly_detector, combined_internal_risk
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Forge Bridge Analysis AI")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
print("Loading AI Models...")
try:
    xgb = pickle.load(open("models/xgboost_risk.pkl", "rb"))
    le = pickle.load(open("models/label_encoder.pkl", "rb"))
    lstm = load_model("models/lstm_life.keras")
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")

ROBOFLOW_KEY = os.getenv("YOLOV8_API_KEY")

@app.post("/api/analyze")
async def analyze(
    image: UploadFile = File(...),
    age: int = Form(...),
    load_factor: float = Form(...),
    cover_depth_mm: float = Form(40.0),
    environment: str = Form("urban")
):
    # Ensure upload directory
    os.makedirs("uploads", exist_ok=True)
    img_path = f"uploads/{image.filename}"
    with open(img_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    # Model 1 — YOLOv8 via direct Roboflow API
    print(f"Analyzing image: {image.filename}")
    yolo_out = detect_cracks(img_path, ROBOFLOW_KEY)

    # Model 2 — XGBoost (Surface Risk)
    # Using the same logic as the user's snippet for zone criticality
    zone_crit = 0.8 if "center" in yolo_out["zones"] else 0.4
    X_in = np.array([[
        yolo_out["crack_area_percent"],
        yolo_out["crack_count"],
        age, 
        load_factor, 
        zone_crit
    ]])
    
    risk_enc = xgb.predict(X_in)[0]
    risk_level = le.inverse_transform([risk_enc])[0]
    # Calculate a pseudo risk score (percentage)
    risk_score = int(xgb.predict_proba(X_in)[0].max() * 100)

    # Model 3 — LSTM (Time Forecasting)
    # Generate a dummy sequence based on current risk for forecasting life curve
    # (Simplified sequence generation for demo purposes)
    past_steps = [max(risk_score-26,5), max(risk_score-18,5), max(risk_score-12,5), max(risk_score-5,5), risk_score]
    seq = np.array(past_steps, dtype=float).reshape(1, 5, 1)
    
    forecast = []
    current_seq = seq.copy()
    for _ in range(5):
        p = float(lstm.predict(current_seq, verbose=0)[0][0])
        p = min(max(p, 0), 100) # Clamp between 0-100
        forecast.append(round(p, 1))
        # Update sequence for next prediction
        current_seq = np.append(current_seq[:, 1:, :], [[[p]]], axis=1)
    
    # Estimate remaining life (years until risk hits 95%)
    remaining = next((i+1 for i, v in enumerate(forecast) if v >= 95), 5)

    # Internal Condition Analysis
    carb = carbonation_model(age, cover_depth_mm, environment)
    vib = vibration_anomaly_detector(risk_score)
    int_risk = combined_internal_risk(carb, vib)

    # Suggestions Engine
    suggestions = {
        "LOW": "Routine inspection. Apply anti-corrosion coating.",
        "MEDIUM": "Install strain gauges. Maintenance within 3 months.",
        "HIGH": "Immediate steel plate reinforcement. Reduce load 30%.",
        "CRITICAL": "EVACUATE. Emergency forged steel brackets required."
    }
    
    # Combined Severity Level (Max of Surface and Internal)
    severity_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    final_risk_level = risk_level if severity_map[risk_level] >= severity_map[int_risk] else int_risk

    return {
        "vision": {
            "crack_detected": yolo_out["crack_detected"],
            "crack_area_percent": yolo_out["crack_area_percent"],
            "crack_count": yolo_out["crack_count"],
            "confidence": yolo_out["confidence"],
            "predictions": yolo_out["predictions"],
            "risk_score": risk_score,
            "risk_level": risk_level
        },
        "time": {
            "remaining_life_years": remaining,
            "degradation_curve": past_steps + forecast
        },
        "internal": {
            "carbonation_risk": carb,
            "vibration_risk": vib,
            "internal_risk_level": int_risk
        },
        "risk": {
            "risk_level": final_risk_level,
            "risk_score": risk_score # Reusing surface risk score as the base
        },
        "suggestions": [suggestions[final_risk_level]]
    }

@app.get("/")
def root():
    return {"status": "FORGE-AI backend running", "models": ["YOLOv8", "XGBoost", "LSTM"]}
