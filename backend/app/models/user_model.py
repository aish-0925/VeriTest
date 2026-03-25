from sqlalchemy import Column, Integer, String, Enum, DateTime
from app.config.db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    role = Column(String(50), default="tester")
    created_at = Column(DateTime, default=datetime.utcnow)