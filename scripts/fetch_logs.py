import urllib.request
import json
import os
import sys

token = os.environ.get("VERCEL_TOKEN", "REDACTED")
url = "https://api.vercel.com/v2/events?projectId=prj_cXCTJDLMTCQbFyJGkFSTjsfHC5zS&limit=100"
req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
        for event in data:
            print(event)
except Exception as e:
    print("Vercel API error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
