import os
from inference_sdk import InferenceHTTPClient
from dotenv import load_dotenv

load_dotenv()

client = InferenceHTTPClient(
    api_url=os.getenv("YOLOV8_API_URL", "https://serverless.roboflow.com"),
    api_key=os.getenv("YOLOV8_API_KEY")
)

# Use a dummy image from the web or just a black image
import numpy as np
import cv2

dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)

try:
    result = client.run_workflow(
        workspace_name=os.getenv("ROBOFLOW_WORKSPACE_NAME", "karans-workspace-ruoyn"),
        workflow_id=os.getenv("ROBOFLOW_WORKFLOW_ID", "detect-count-and-visualize"),
        images={
            "image": dummy_image
        },
        use_cache=True
    )
    import json
    # Print the structure of the result without huge base64 strings
    
    def truncate_base64(obj):
        if isinstance(obj, dict):
            return {k: truncate_base64(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [truncate_base64(v) for v in obj]
        elif isinstance(obj, str) and len(obj) > 100:
            return obj[:30] + "...[truncated]"
        return obj

    print("RAW RESULT TYPE:", type(result))
    print(json.dumps(truncate_base64(result), indent=2))
except Exception as e:
    print("ERROR:", e)
