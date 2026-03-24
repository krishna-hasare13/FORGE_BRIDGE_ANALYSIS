import requests, os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('YOLOV8_API_KEY')

# Common public models for bridge/concrete cracks
models = [
    "csustcv/bridge-detection/4",
    "bridge-crack-vqusn/1",
    "crack-detection-jsy8y/1",
    "bridge-crack-detection-v2/1",
    "bridge-detection-v2/1",
    "concrete-crack-detection-v2/1"
]

for m in models:
    url = f"https://detect.roboflow.com/{m}?api_key={api_key}"
    try:
        # 1x1 png pixel
        pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        res = requests.post(url, files={"file": ("test.png", pixel)})
        print(f"Model: {m} | Status: {res.status_code}")
        if res.status_code == 200:
            print(f"FOUND WORKING MODEL: {m}")
            break
    except Exception as e:
        print(f"Model: {m} | Error: {e}")
