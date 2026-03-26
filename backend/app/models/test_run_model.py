from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.config.db import Base

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)

    run_id = Column(String(50))   
    script_name = Column(String(255))  

    requirement_id = Column(Integer, ForeignKey("requirements.id"))

    status = Column(String(50))  
    coverage = Column(Integer, default=0)  # %

    duration = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)