import sys
sys.path.append('/app')

from fastapi import FastAPI
from common.base_agent import BaseAgent
from common.models import TaskRequest, TaskResponse
import uvicorn

app = FastAPI(title="DevOps Agent")

class DevOpsAgent(BaseAgent):
    def __init__(self):
        system_prompt = """You are an experienced DevOps Engineer with expertise in:
- CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins)
- Infrastructure as Code (Terraform, CloudFormation)
- Containerization (Docker, Kubernetes)
- Cloud Platforms (AWS, Azure, GCP)
- Monitoring and Logging (Prometheus, Grafana, ELK)
- Security (DevSecOps)
- Release Management

Your responses should be technical, precise, and focused on automation and stability."""
        
        super().__init__("DevOps Engineer", system_prompt)
    
    def get_role_specific_context(self, task: TaskRequest) -> str:
        return """
As a DevOps Engineer, your GOAL is to provide INFRASTRUCTURE CONFIGURATION.
1. REQUIRED: Provide `docker-compose.yml` or Dockerfiles.
2. REQUIRED: Provide CI/CD pipeline configuration (e.g., `.github/workflows/main.yml`).
3. Use markdown code blocks with filenames.

DO NOT just list steps. PROVIDE THE CONFIG FILES.
Example:
## Infrastructure
```yaml:docker-compose.yml
version: '3.8'
services:
  ...
```
"""

agent = DevOpsAgent()

@app.post("/execute", response_model=TaskResponse)
async def execute_task(task: TaskRequest):
    return await agent.execute_task(task)

@app.get("/health")
async def health():
    return {"status": "healthy", "role": "DevOps Engineer"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8007)
