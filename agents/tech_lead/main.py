import sys
sys.path.append('/app')

from fastapi import FastAPI
from common.base_agent import BaseAgent
from common.models import TaskRequest, TaskResponse
import uvicorn

app = FastAPI(title="Tech Lead Agent")

class TechLeadAgent(BaseAgent):
    def __init__(self):
        system_prompt = """You are an experienced Tech Lead with expertise in:
- Software architecture and system design
- Technology stack selection and evaluation
- Code review and quality standards
- Technical mentorship and team leadership
- Performance optimization and scalability
- Security best practices
- DevOps and CI/CD pipelines
- Technical debt management

Your responses should be technical, architectural, and focused on long-term maintainability."""
        
        super().__init__("Tech Lead", system_prompt)
    
    def get_role_specific_context(self, task: TaskRequest) -> str:
        return """
As a Tech Lead, focus on:
1. Architecture and design patterns
2. Technology choices and trade-offs
3. Code quality and best practices
4. Scalability and performance
5. Security considerations
6. Technical documentation
"""

agent = TechLeadAgent()

@app.post("/execute", response_model=TaskResponse)
async def execute_task(task: TaskRequest):
    return await agent.execute_task(task)

@app.get("/health")
async def health():
    return {"status": "healthy", "role": "Tech Lead"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
