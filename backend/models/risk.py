import os
import requests

def calculate_risk(vision_data: dict, structure_age: float, load_factor: float) -> dict:
    """
    Model 2 — XGBoost
    Risk score classification
    Output: risk_score (0-100), LOW / MEDIUM / HIGH / CRITICAL
    """
    api_url = os.getenv("XGBOOST_API_URL")
    api_key = os.getenv("XGBOOST_API_KEY")
    
    payload = {
        "crack_area_percent": vision_data.get("crack_area_percent", 0),
        "crack_count": vision_data.get("crack_count", 0),
        "structure_age": structure_age,
        "load_factor": load_factor
    }

    if api_url and api_key:
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            response = requests.post(api_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error calling XGBoost API: {e}")
            pass

    # Mock Implementation
    base_risk = (vision_data.get("crack_area_percent", 0) * 2) + (structure_age * 0.5) + (load_factor * 10)
    risk_score = min(100.0, max(0.0, base_risk))
    
    if risk_score < 30:
        level = "LOW"
    elif risk_score < 60:
        level = "MEDIUM"
    elif risk_score < 85:
        level = "HIGH"
    else:
        level = "CRITICAL"

    return {
        "risk_score": round(risk_score, 2),
        "risk_level": level
    }
