import requests, os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('YOLOV8_API_KEY')

projects = [
    'csustcv/bridge-detection',
    'tfrecordcustomdataset/crack-bridge-detection',
    'cracksegment/bridge-crack-detection',
    'nchu/bridge-crack',
    'hwkwak/bridge-crack'
]

image_path = r'C:\Users\kpvlo\.gemini\antigravity\brain\29ee8e40-620e-4286-b1d6-c6ee55eb35b2\concrete_crack_sample_1774355796302.png'

for p in projects:
    for v in [1, 2, 3]:
        url = f"https://detect.roboflow.com/{p}/{v}?api_key={api_key}"
        with open(image_path, "rb") as f:
            res = requests.post(url, files={"file": f})
        
        if res.status_code == 200:
            preds = res.json().get("predictions", [])
            print(f"FOUND: {p} version {v} | Predictions: {len(preds)}")
            if len(preds) > 0:
                print("THIS ONE WORKS!")
            break
        else:
            print(f"FAILED: {p} version {v} | Code: {res.status_code}")
