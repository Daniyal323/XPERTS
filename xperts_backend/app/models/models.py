from sqlalchemy import Column, Integer, String, Enum, ForeignKey, JSON, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base

class UserRole(str, enum.Enum):
    SME = "SME"
    EXPERT = "EXPERT"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.SME)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="user", uselist=False)
    projects = relationship("Project", back_populates="owner")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String)
    bio = Column(String)
    location = Column(String)
    competencies = Column(JSON) # List of strings
    industry = Column(String)

    user = relationship("User", back_populates="profile")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(String)
    category = Column(String)
    budget = Column(Float)
    duration = Column(Integer)
    location_type = Column(String) # remote, onsite, both
    location_details = Column(String, nullable=True)
    status = Column(String, default="open") # open, in_progress, closed

    owner = relationship("User", back_populates="projects")
