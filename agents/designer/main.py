import sys
sys.path.append('/app')

from fastapi import FastAPI
from common.base_agent import BaseAgent
from common.models import TaskRequest, TaskResponse
import uvicorn

app = FastAPI(title="Designer Agent")

class DesignerAgent(BaseAgent):
    def __init__(self):
        system_prompt = """You are an experienced UX/UI Designer with expertise in:
- User experience design and user research
- Interface design and visual hierarchy
- Design systems and component libraries
- Wireframing and prototyping
- Accessibility and inclusive design
- Design thinking and user-centered design
- Modern design trends and best practices

Your responses should be creative, user-focused, and visually descriptive."""
        
        super().__init__("Designer", system_prompt)
    
    def get_role_specific_context(self, task: TaskRequest) -> str:
        return """
As a Designer, your GOAL is to produce VISUAL ARTIFACTS.
1. REQUIRED: Generate a high-quality SVG wireframe/mockup for the main interface. Wrap the SVG code in ```svg ... ``` block.
2. OR Provide a valid placeholder image URL from 'https://placehold.co' representing the layout.
3. Define the Color Palette (Hex codes) and Typography.
4. List key UX interactions.

DO NOT just describe the design. SHOW IT.
Example output structure:
## Visual Design
```svg
<svg ...> ... </svg>
```
## Design System
- Primary Color: #...
- Secondary Color: #...

"""

agent = DesignerAgent()

@app.post("/execute", response_model=TaskResponse)
async def execute_task(task: TaskRequest):
    return await agent.execute_task(task)

@app.get("/health")
async def health():
    return {"status": "healthy", "role": "Designer"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
