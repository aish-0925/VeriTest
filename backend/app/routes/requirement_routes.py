from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.config.db import SessionLocal
from app.models.requirement_model import Requirement
from app.models.project_model import Project
from app.schemas.requirement_schema import RequirementCreate, RequirementResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/requirements", tags=["Requirements"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#  CREATE
@router.post("/", response_model=RequirementResponse)
def create_requirement(
    data: RequirementCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == data.project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        return {"error": "Unauthorized project"}

    req = Requirement(
        project_id=data.project_id,
        title=data.title,
        description=data.description
    )

    db.add(req)
    db.commit()
    db.refresh(req)

    return req


#  GET ALL (optimized)
@router.get("/")
def get_requirements(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    requirements = db.query(Requirement).join(Project).filter(
        Project.user_id == current_user.id
    ).all()

    return [
        {
            "id": r.id,
            "project_id": r.project_id,
            "title": r.title,
            "description": r.description,
            "status": r.status,
            "scriptsCount": r.scripts_count,
            "createdAt": r.created_at
        }
        for r in requirements
    ]


#  DELETE 
@router.delete("/{id}")
def delete_requirement(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    req = db.query(Requirement).join(Project).filter(
        Requirement.id == id,
        Project.user_id == current_user.id
    ).first()

    if not req:
        return {"error": "Unauthorized or not found"}

    db.delete(req)
    db.commit()

    return {"message": "Deleted successfully"}