from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.config.db import get_db
from app.models.requirement_model import Requirement
from app.models.project_model import Project
from app.schemas.requirement_schema import RequirementCreate, RequirementResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/requirements", tags=["Requirements"])


#  CREATE
@router.post("/", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED)
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
        raise HTTPException(status_code=403, detail="Unauthorized project")

    req = Requirement(**data.model_dump()) 

    db.add(req)
    db.commit()
    db.refresh(req)

    return req


#  GET ALL
@router.get("/", response_model=List[RequirementResponse])
def get_requirements(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    requirements = db.query(Requirement).join(Project).filter(
    Project.user_id == current_user.id
).all()

    return requirements


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
        raise HTTPException(status_code=404, detail="Requirement not found")

    db.delete(req)
    db.commit()

    return {"message": "Deleted successfully"}
