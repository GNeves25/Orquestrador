from pydantic import BaseModel
from typing import Optional
from enum import Enum

class TaskPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class TaskRequest(BaseModel):
    task_id: str
    title: str
    description: str
    context: Optional[str] = None
    expected_output: Optional[str] = None
    project_name: str
    project_description: str
    priority: str

class TaskResponse(BaseModel):
    output: str
    tokens_used: int
    success: bool
    error: Optional[str] = None
