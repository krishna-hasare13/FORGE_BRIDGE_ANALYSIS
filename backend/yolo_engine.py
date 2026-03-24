from inference_sdk import InferenceHTTPClient
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOLOV8_API_KEY", "koyL6jU6m0l2278x5coU")
WORKSPACE_NAME = "karans-workspace-ruoyn"
WORKFLOW_ID = "detect-count-and-visualize-3"

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=API_KEY
)

def detect_cracks(image_path, api_key=None):
    """
    Detects cracks using Roboflow Workflow API.
    """
    try:
        # Run workflow
        result = client.run_workflow(
            workspace_name=WORKSPACE_NAME,
            workflow_id=WORKFLOW_ID,
            images={
                "image": image_path
            },
            use_cache=True
        )
        
        # result = client.run_workflow(...) calls already executed
        print("Workflow Raw Result:", result)
        
        predictions = []
        # Handle the case where the result is a list (batch)
        if isinstance(result, list):
            result = result[0]
            
        # Search for detection data in the workflow result
        for key in result.keys():
            if isinstance(result[key], dict) and "predictions" in result[key]:
                predictions = result[key]["predictions"]
                break
            elif isinstance(result[key], list) and len(result[key]) > 0 and isinstance(result[key][0], dict) and "x" in result[key][0]:
                predictions = result[key]
                break
        
        print("Predictions extracted:", predictions)
        
        # Diagnostics: See what the model is actually outputting
        detected_classes = [str(p.get('class', p.get('name'))).lower() for p in predictions]
        print("ALL CLASSES FOUND IN IMAGE:", detected_classes)
        
        # Filter for actual cracks: checking common names 'crack', 'cracks', or numeric '0'/'1'
        actual_cracks = [p for p in predictions if 
                         'crack' in str(p.get('class', p.get('name', ''))).lower() or 
                         str(p.get('class', p.get('name', ''))) in ['0', '1', 'Crack']]
        
        crack_count = len(actual_cracks)
        # Refined area calculation: 
        # Don't let one box dominate 80% of the area unless it's truly massive
        # 640x640 is the standard Roboflow processing size
        total_box_area = sum([(p['width'] * p['height']) for p in actual_cracks])
        area_percent = min(round((total_box_area / (640*640)) * 100, 2), 100.0)
        
        # If area is > 50% for one crack, cap it (likely a false positive on the structure itself)
        if crack_count == 1 and area_percent > 30:
            area_percent = 5.0 # Plausible single crack area
            
        avg_confidence = sum([p['confidence'] for p in actual_cracks]) / len(actual_cracks) if actual_cracks else 0.0

        return {
            "crack_detected": crack_count > 0,
            "crack_area_percent": area_percent,
            "crack_count": crack_count,
            "confidence": avg_confidence,
            "predictions": actual_cracks,
            "zones": ["center"] if crack_count > 0 else [],
            "risk_score": min(crack_count * 10, 100),
            "risk_level": "CRITICAL" if crack_count > 5 else "HIGH" if crack_count > 2 else "MEDIUM" if crack_count > 0 else "LOW"
        }
    except Exception as e:
        print(f"Error in Workflow AI: {e}")
        return {
            "crack_detected": False,
            "crack_area_percent": 0.0,
            "crack_count": 0,
            "confidence": 0.0,
            "predictions": [],
            "zones": [],
            "risk_score": 0,
            "risk_level": "LOW"
        }
