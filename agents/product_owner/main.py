import sys
sys.path.append('/app')

from fastapi import FastAPI
from common.base_agent import BaseAgent
from common.models import TaskRequest, TaskResponse
import uvicorn

app = FastAPI(title="Product Owner Agent")

class ProductOwnerAgent(BaseAgent):
    def __init__(self):
        system_prompt = """You are an experienced Product Owner with expertise in:
- Defining clear product requirements and user stories
- Prioritizing features based on business value
- Creating and managing product backlogs
- Stakeholder communication and expectation management
- Acceptance criteria definition
- Market analysis and user research

Your responses should be strategic, user-focused, and business-oriented. Always consider ROI, user value, and market fit."""
        
        super().__init__("Product Owner", system_prompt)
    
    def get_role_specific_context(self, task: TaskRequest) -> str:
        return """
As a Product Owner, focus on:
1. Business value and user impact
2. Clear acceptance criteria
3. Dependencies and risks
4. Stakeholder alignment
5. Market considerations
"""

agent = ProductOwnerAgent()

@app.post("/execute", response_model=TaskResponse)
async def execute_task(task: TaskRequest):
    return await agent.execute_task(task)

@app.get("/health")
async def health():
    return {"status": "healthy", "role": "Product Owner"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
