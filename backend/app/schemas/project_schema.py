from pydantic import BaseModel
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    description: str


class ProjectResponse(ProjectCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True