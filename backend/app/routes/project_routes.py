from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.config.db import get_db
from app.models.project_model import Project
from app.schemas.project_schema import ProjectCreate, ProjectResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


#  CREATE PROJECT
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = Project(
        user_id=current_user.id,
        name=data.name,
        description=data.description
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


#  GET ALL PROJECTS (only user's)
@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Project).filter(
        Project.user_id == current_user.id
    ).all()


#  GET SINGLE PROJECT
@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


#  DELETE PROJECT
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}