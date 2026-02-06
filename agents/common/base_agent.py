import os
import google.generativeai as genai
from abc import ABC, abstractmethod
from typing import Optional
from .models import TaskRequest, TaskResponse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, role: str, system_prompt: str):
        self.role = role
        self.system_prompt = system_prompt
        
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_prompt
        )
        
        logger.info(f"Initialized {role} agent with Gemini")
    
    @abstractmethod
    def get_role_specific_context(self, task: TaskRequest) -> str:
        """Override this to add role-specific context to the prompt"""
        pass
    
    async def execute_task(self, task: TaskRequest) -> TaskResponse:
        """Execute a task using Gemini"""
        try:
            logger.info(f"{self.role} executing task: {task.title}")
            
            # Build the prompt
            role_context = self.get_role_specific_context(task)
            
            prompt = f"""
Project: {task.project_name}
Project Description: {task.project_description}

Task: {task.title}
Description: {task.description}

{f'Additional Context: {task.context}' if task.context else ''}
{f'Expected Output: {task.expected_output}' if task.expected_output else ''}

Priority: {task.priority}

{role_context}


Please provide a detailed response as a {self.role} would, considering the project context and task requirements.

IMPORTANT: Your response must be in Portuguese (pt-BR).
"""
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            # Extract token usage (approximate)
            tokens_used = len(prompt.split()) + len(response.text.split())
            
            logger.info(f"{self.role} completed task successfully")
            
            return TaskResponse(
                output=response.text,
                tokens_used=tokens_used,
                success=True
            )
            
        except Exception as e:
            logger.error(f"{self.role} error executing task: {str(e)}")
            # Raise HTTP exception so the orchestrator knows it failed
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail=str(e))
