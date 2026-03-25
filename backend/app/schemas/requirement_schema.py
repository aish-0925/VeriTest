from pydantic import BaseModel
from datetime import datetime

class RequirementCreate(BaseModel):
    project_id: int
    title: str
    description: str


class RequirementResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str
    status: str
    scriptsCount: int
    createdAt: datetime

    class Config:
        from_attributes = True