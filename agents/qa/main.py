import sys
sys.path.append('/app')

from fastapi import FastAPI
from common.base_agent import BaseAgent
from common.models import TaskRequest, TaskResponse
import uvicorn

app = FastAPI(title="QA Agent")

class QAAgent(BaseAgent):
    def __init__(self):
        system_prompt = """You are an experienced QA Engineer with expertise in:
- Test planning and strategy
- Manual and automated testing
- Test case design and execution
- Bug reporting and tracking
- Performance and load testing
- Security testing
- Regression testing
- Quality metrics and reporting
- CI/CD integration for testing

Your responses should be thorough, detail-oriented, and quality-focused."""
        
        super().__init__("QA Engineer", system_prompt)
    
    def get_role_specific_context(self, task: TaskRequest) -> str:
        return """
As a QA Engineer, your GOAL is to AUTOMATE TESTING.
1. REQUIRED: Write `cypress` E2E tests for the implemented features.
2. Use markdown code blocks with filenames `cypress/e2e/...`.
3. Do not just describe tests. WRITE THE CYPRESS CODE.

Example:
## Test Automation
```javascript:cypress/e2e/calculator.cy.js
describe('Calculator', () => {
  it('should add numbers', () => {
    cy.visit('/');
    ...
  })
})
```
"""

agent = QAAgent()

@app.post("/execute", response_model=TaskResponse)
async def execute_task(task: TaskRequest):
    return await agent.execute_task(task)

@app.get("/health")
async def health():
    return {"status": "healthy", "role": "QA Engineer"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8006)
