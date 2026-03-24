from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Bridge Analysis API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from models.vision import analyze_image
from models.risk import calculate_risk
from models.time import predict_life
from engine.rules import get_suggestions

@app.post("/api/analyze")
async def analyze_bridge(
    image: UploadFile = File(...),
    age: float = Form(...),
    load_factor: float = Form(...)
):
    # 1. Vision AI - YOLOv8
    # Read image contents (might need to save temporarily depending on the API)
    image_bytes = await image.read()
    vision_result = analyze_image(image_bytes)

    # 2. Risk AI - XGBoost
    risk_result = calculate_risk(vision_result, age, load_factor)

    # 3. Time AI - LSTM
    time_result = predict_life(risk_result)

    # 4. Reinforcement Engine
    suggestions = get_suggestions(risk_result["risk_level"])

    return {
        "vision": vision_result,
        "risk": risk_result,
        "time": time_result,
        "suggestions": suggestions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
