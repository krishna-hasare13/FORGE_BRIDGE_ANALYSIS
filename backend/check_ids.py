import requests, os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('YOLOV8_API_KEY')

models = [
    "csustcv/bridge-detection/4",
    "bridge-detection/4",
    "tfrecordcustomdataset/crack-bridge-detection/1",
    "crack-bridge-detection/1",
    "nchu/bridge-crack/14",
    "bridge-crack/14"
]

for m in models:
    try:
        url = f"https://detect.roboflow.com/{m}?api_key={api_key}"
        # Send a tiny 1x1 black pixel as a test image to avoid heavy upload
        test_file = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        res = requests.post(url, files={"file": ("test.png", test_file)})
        print(f"Model {m}: Status {res.status_code}")
        if res.status_code == 200:
            print(f"SUCCESS! Using {m}")
            break
    except Exception as e:
        print(f"Model {m}: Error {e}")
