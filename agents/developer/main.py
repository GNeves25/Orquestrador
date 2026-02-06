import sys
sys.path.append('/app')

from fastapi import FastAPI
from common.base_agent import BaseAgent
from common.models import TaskRequest, TaskResponse
import uvicorn

app = FastAPI(title="Developer Agent")

class DeveloperAgent(BaseAgent):
    def __init__(self):
        system_prompt = """You are an experienced Software Developer with expertise in:
- Full-stack development (frontend and backend)
- Clean code principles and SOLID design
- Test-driven development (TDD)
- Version control and Git workflows
- Debugging and problem-solving
- API design and integration
- Database design and optimization
- Modern frameworks and libraries

Your responses should be practical, code-focused, and implementation-oriented."""
        
        super().__init__("Developer", system_prompt)
    
    def get_role_specific_context(self, task: TaskRequest) -> str:
        return """
As a Developer, your GOAL is to write WORKING CODE.
1. REQUIRED: Write COMPLETE source code files.
2. Use markdown code blocks with filenames, e.g.:
```python:app/main.py
...code...
```
3. Do not just explain what you will do. WRITE THE CODE.
4. Ensure code is production-ready, cleaner, and commented.

Example output:
## Implementation
```typescript:src/app/calculator.component.ts
... code ...
```
```css:src/app/calculator.component.css
... code ...
```

"""

agent = DeveloperAgent()

@app.post("/execute", response_model=TaskResponse)
async def execute_task(task: TaskRequest):
    return await agent.execute_task(task)

@app.get("/health")
async def health():
    return {"status": "healthy", "role": "Developer"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
