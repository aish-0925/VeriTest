from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from datetime import datetime
from app.config.db import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)