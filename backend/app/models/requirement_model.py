from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.db import Base

class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text)

    url = Column(String(500))
    expected_text = Column(String(255))

    status = Column(String(50), default="Pending")
    scripts_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    #  Relationships
    project = relationship("Project", back_populates="requirements")
    test_runs = relationship("TestRun", back_populates="requirement")