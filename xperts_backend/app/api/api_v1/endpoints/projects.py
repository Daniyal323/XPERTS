from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import User, Project
from app.api.api_v1.endpoints.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class ProjectBase(BaseModel):
    title: str
    description: str
    category: str
    budget: float
    duration: int
    location_type: str
    location_details: str = None

class ProjectCreate(ProjectBase):
    pass

class ProjectSchema(ProjectBase):
    id: int
    owner_id: int
    status: str

    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectSchema)
def create_project(
    *,
    db: Session = Depends(get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "SME":
        raise HTTPException(status_code=403, detail="Only SMEs can create projects")
    
    project = Project(
        **project_in.dict(),
        owner_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/", response_model=List[ProjectSchema])
def read_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}/matches")
def get_project_matches(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Basic keyword matching between project description/category and expert competencies
    # In a real app, this would use a more sophisticated algorithm or vector search
    experts = db.query(User).filter(User.role == "EXPERT").all()
    
    matches = []
    for expert in experts:
        if not expert.profile or not expert.profile.competencies:
            continue
            
        # Simple overlap check
        score = 0
        
        # Competency matching
        for comp in expert.profile.competencies:
            if comp.lower() in project.description.lower() or comp.lower() in project.category.lower():
                score += 3 # High weight for competency
        
        # Location matching
        if project.location_type == "remote" or expert.profile.location == project.location_details:
            score += 2
        
        if score > 0:
            matches.append({
                "expert_id": expert.id,
                "full_name": expert.profile.full_name,
                "score": score,
                "competencies": expert.profile.competencies,
                "location": expert.profile.location
            })
            
    return sorted(matches, key=lambda x: x["score"], reverse=True)
