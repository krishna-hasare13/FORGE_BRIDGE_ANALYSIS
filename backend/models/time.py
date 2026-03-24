import os
import requests

def predict_life(risk_data: dict) -> dict:
    """
    Model 3 — LSTM
    Structural life prediction (time series)
    Output: remaining_life_years, degradation_curve, collapse_risk_year
    """
    api_url = os.getenv("LSTM_API_URL")
    api_key = os.getenv("LSTM_API_KEY")
    
    if api_url and api_key:
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            response = requests.post(api_url, headers=headers, json=risk_data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error calling LSTM API: {e}")
            pass

    # Mock Implementation
    risk_score = risk_data.get("risk_score", 0)
    
    # Simple inverse relationship for mock
    remaining_life = max(1.0, 100 - risk_score) // 2
    
    # Generate mock degradation curve (10 years)
    years = list(range(2024, 2035))
    curve = []
    current_health = 100 - risk_score
    for year in years:
        curve.append({"year": year, "health_index": max(0, current_health)})
        current_health -= (risk_score / 10)  # Degrades faster if risk is higher
        
    collapse_year = 2024 + int(remaining_life)

    return {
        "remaining_life_years": int(remaining_life),
        "degradation_curve": curve,
        "collapse_risk_year": collapse_year
    }
