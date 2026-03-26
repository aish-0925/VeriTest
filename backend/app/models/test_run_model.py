from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.db import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)

    run_id = Column(String(50))
    script_name = Column(String(255))

    status = Column(String(50))  # Running / Passed / Failed
    coverage = Column(Integer)

    # ✅ Execution tracking
    duration = Column(String(50))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # ✅ Logs (store JSON string)
    logs = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="test_runs")
    requirement = relationship("Requirement", back_populates="test_runs")