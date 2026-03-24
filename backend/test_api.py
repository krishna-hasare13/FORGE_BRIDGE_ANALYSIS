import requests
import os

url = "http://localhost:8000/api/analyze"
image_path = r"C:\Users\kpvlo\.gemini\antigravity\brain\29ee8e40-620e-4286-b1d6-c6ee55eb35b2\concrete_crack_sample_1774355796302.png"

with open(image_path, "rb") as f:
    files = {"image": f}
    data = {
        "age": 20,
        "load_factor": 1.2,
        "cover_depth_mm": 40,
        "environment": "urban"
    }
    response = requests.post(url, files=files, data=data)

print(response.status_code)
print(response.json())
