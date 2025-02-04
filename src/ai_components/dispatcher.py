from typing import List, Dict, Optional
from uuid import UUID
import asyncio
from datetime import datetime
import json

class TaskBreakdown:
    """Handles the decomposition of complex tasks into subtasks."""
    
    @staticmethod
    def analyze_task(description: str) -> List[Dict]:
        """
        Analyze task description and break it down into subtasks.
        Returns a list of subtask specifications.
        """
        # TODO: Implement NLP-based task analysis
        # This is a placeholder implementation
        subtasks = []
        
        # Basic task breakdown based on common patterns
        if "write" in description.lower():
            subtasks.extend([
                {"type": "research", "priority": 1},
                {"type": "outline", "priority": 2},
                {"type": "write", "priority": 3},
                {"type": "edit", "priority": 4}
            ])
        elif "code" in description.lower():
            subtasks.extend([
                {"type": "design", "priority": 1},
                {"type": "implement", "priority": 2},
                {"type": "test", "priority": 3},
                {"type": "document", "priority": 4}
            ])
            
        return subtasks

class PromptGenerator:
    """Generates dynamic prompts for AI agents based on task requirements."""
    
    @staticmethod
    def create_prompt(task_type: str, context: Dict) -> str:
        """
        Generate a specific prompt based on task type and context.
        """
        templates = {
            "research": "Research the following topic: {topic}. Focus on {aspects}.",
            "write": "Write {word_count} words about {topic}. Style: {style}.",
            "edit": "Edit the following text for {criteria}: {text}",
            "design": "Design a solution for: {problem}. Consider: {constraints}.",
            "implement": "Implement the following feature: {feature}. Use: {technology}.",
            "test": "Create tests for: {component}. Focus on: {test_types}."
        }
        
        template = templates.get(task_type, "Complete the following task: {task}")
        return template.format(**context)

class AIDispatcher:
    """Main dispatcher class for managing AI agents and task distribution."""
    
    def __init__(self):
        self.agents: Dict[UUID, Dict] = {}
        self.task_queue: List[Dict] = []
        self.active_tasks: Dict[UUID, Dict] = {}
        
    async def register_agent(self, agent_id: UUID, capabilities: List[str]) -> bool:
        """Register a new AI agent with its capabilities."""
        self.agents[agent_id] = {
            "capabilities": capabilities,
            "status": "available",
            "current_task": None,
            "performance": {
                "success_rate": 100,
                "avg_response_time": 0,
                "total_tasks": 0
            }
        }
        return True
        
    async def assign_task(self, task_id: UUID, subtasks: List[Dict]) -> Dict:
        """Assign subtasks to appropriate AI agents."""
        assignments = {}
        
        for subtask in subtasks:
            # Find the best available agent for the task
            agent_id = await self._find_best_agent(subtask["type"])
            if agent_id:
                assignments[subtask["type"]] = {
                    "agent_id": agent_id,
                    "status": "assigned",
                    "assigned_at": datetime.now().isoformat()
                }
                
                # Update agent status
                self.agents[agent_id]["status"] = "busy"
                self.agents[agent_id]["current_task"] = task_id
                
        return assignments
    
    async def _find_best_agent(self, task_type: str) -> Optional[UUID]:
        """Find the best available agent for a specific task type."""
        best_agent = None
        best_score = -1
        
        for agent_id, agent in self.agents.items():
            if agent["status"] == "available" and task_type in agent["capabilities"]:
                # Calculate agent score based on performance metrics
                score = (
                    agent["performance"]["success_rate"] * 0.6 +
                    (1 / (agent["performance"]["avg_response_time"] + 1)) * 0.4
                )
                
                if score > best_score:
                    best_score = score
                    best_agent = agent_id
                    
        return best_agent
    
    async def monitor_progress(self, task_id: UUID) -> Dict:
        """Monitor the progress of a task and its subtasks."""
        if task_id not in self.active_tasks:
            return {"status": "not_found"}
            
        task = self.active_tasks[task_id]
        completed_subtasks = sum(1 for subtask in task["subtasks"] if subtask["status"] == "completed")
        total_subtasks = len(task["subtasks"])
        
        return {
            "status": "completed" if completed_subtasks == total_subtasks else "in_progress",
            "progress": (completed_subtasks / total_subtasks) * 100,
            "subtasks": task["subtasks"]
        }
    
    async def update_agent_metrics(self, agent_id: UUID, task_result: Dict) -> None:
        """Update agent performance metrics based on task results."""
        if agent_id not in self.agents:
            return
            
        agent = self.agents[agent_id]
        total_tasks = agent["performance"]["total_tasks"] + 1
        
        # Update success rate
        current_success_rate = agent["performance"]["success_rate"]
        task_success = 1 if task_result.get("success", False) else 0
        new_success_rate = ((current_success_rate * (total_tasks - 1)) + task_success) / total_tasks
        
        # Update average response time
        current_avg_time = agent["performance"]["avg_response_time"]
        task_time = task_result.get("execution_time", 0)
        new_avg_time = ((current_avg_time * (total_tasks - 1)) + task_time) / total_tasks
        
        # Update metrics
        agent["performance"].update({
            "success_rate": new_success_rate,
            "avg_response_time": new_avg_time,
            "total_tasks": total_tasks
        })