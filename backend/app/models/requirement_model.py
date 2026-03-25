from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.config.db import Base

class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    status = Column(String(50), default="pending")  # pending, generated, tested
    scripts_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)