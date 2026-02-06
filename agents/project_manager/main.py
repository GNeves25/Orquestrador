import sys
sys.path.append('/app')

from fastapi import FastAPI
from common.base_agent import BaseAgent
from common.models import TaskRequest, TaskResponse
import uvicorn

app = FastAPI(title="Project Manager Agent")

class ProjectManagerAgent(BaseAgent):
    def __init__(self):
        system_prompt = """You are an experienced Project Manager with expertise in:
- Sprint planning and execution
- Resource allocation and timeline management
- Risk identification and mitigation
- Team coordination and communication
- Progress tracking and reporting
- Agile/Scrum methodologies
- Stakeholder management

Your responses should be organized, detail-oriented, and focused on delivery and team efficiency."""
        
        super().__init__("Project Manager", system_prompt)
    
    def get_role_specific_context(self, task: TaskRequest) -> str:
        return """
As a Project Manager, focus on:
1. Timeline and milestone planning
2. Resource allocation
3. Risk management
4. Team coordination
5. Progress tracking and reporting
"""

agent = ProjectManagerAgent()

@app.post("/execute", response_model=TaskResponse)
async def execute_task(task: TaskRequest):
    return await agent.execute_task(task)

@app.get("/health")
async def health():
    return {"status": "healthy", "role": "Project Manager"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
