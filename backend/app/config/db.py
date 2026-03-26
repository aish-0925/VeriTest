import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

#  Load environment variables
load_dotenv()

#  Get DB URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env file")

#  Create engine (MySQL optimized)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # avoids stale connections
    pool_recycle=3600     # reconnect every 1 hour
)

#  Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

#  Base class for models
Base = declarative_base()


#  Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()