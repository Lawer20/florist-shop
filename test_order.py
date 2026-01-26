import json
import datetime
import urllib.request
import urllib.error

url = 'https://script.google.com/macros/s/AKfycby89vSJM_7ttQFRljua3DlD4wb14lHz4xPcVDVa101lA_twikPdg4n9Erdh8FsQJNPG/exec'

payload = {
    "name": "Test Script User",
    "phone": "999-999-9999",
    "address": "Debug Address",
    "date": "2026-02-01",
    "time": "12:00",
    "paymentMethod": "zelle",
    "items": [
        {
            "product": "Debug Bouquet [Standard]",
            "addons": ["Teddy Bear"],
            "price": 100
        }
    ],
    "total": 100,
    "timestamp": datetime.datetime.now().isoformat()
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'text/plain'})

print(f"Sending payload to {url}...")
try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.URLError as e:
    print(f"Error: {e}")
