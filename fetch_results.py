import requests
import json

base_url = "http://localhost:5220/api"
project_id = "98bba32b-5df0-4944-99a0-65d47be9a67b"

print(f"--- Project {project_id} ---")
try:
    r = requests.get(f"{base_url}/projects/{project_id}")
    if r.status_code == 200:
        print(json.dumps(r.json(), indent=2))
    else:
        print(f"Error: {r.status_code}")
except Exception as e:
    print(f"Exception: {e}")
