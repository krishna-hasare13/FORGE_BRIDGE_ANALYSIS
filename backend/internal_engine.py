import numpy as np

def carbonation_model(structure_age, cover_depth_mm, environment="urban"):
    """
    Simulates concrete carbonation risk based on Fick's Law of Diffusion
    X = K * sqrt(t)
    """
    # Environment coefficients (K)
    k_params = {
        "urban": 4.5,
        "industrial": 6.0,
        "marine": 5.5,
        "rural": 2.5
    }
    k = k_params.get(environment.lower(), 4.0)
    
    # Depth of carbonation in mm
    carbonation_depth = k * np.sqrt(structure_age)
    
    # Risk factor: if depth > cover_depth, reinforcement is at risk
    depassivation_margin = cover_depth_mm - carbonation_depth
    
    if depassivation_margin < 0:
        return "CRITICAL"
    elif depassivation_margin < 5:
        return "HIGH"
    elif depassivation_margin < 15:
        return "MEDIUM"
    else:
        return "LOW"

def vibration_anomaly_detector(risk_score):
    """
    Simulates real-time vibration anomaly detection (e.g., FFT analysis output)
    """
    # In a real system, this would analyze frequency shifts (Natural Frequency drop)
    # Here we correlate it with structural risk for the demo
    base_anomaly = risk_score * 0.8 + np.random.normal(0, 5)
    
    if base_anomaly > 80:
        return "CRITICAL"
    elif base_anomaly > 60:
        return "HIGH"
    elif base_anomaly > 30:
        return "MEDIUM"
    else:
        return "LOW"

def combined_internal_risk(carb_risk, vib_risk):
    """
    Combines internal factors into a final internal risk level
    """
    severity = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    inv_severity = {1: "LOW", 2: "MEDIUM", 3: "HIGH", 4: "CRITICAL"}
    
    max_sev = max(severity[carb_risk], severity[vib_risk])
    return inv_severity[max_sev]
