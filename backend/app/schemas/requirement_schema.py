from pydantic import BaseModel
from datetime import datetime

class RequirementCreate(BaseModel):
    project_id: int
    title: str
    description: str
    url: str
    expected_text: str


class RequirementResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str
    status: str
    scripts_count: int
    created_at: datetime
    url: str
    expected_text: str
    
    class Config:
        from_attributes = True